import Profile from '../models/profile.js';
import Attendance from '../models/attendance.js';
import Payroll from '../models/payroll.js';
import LeaveRequest from '../models/leaves.js';
import LeavePolicy from '../models/leavePolicy.js';
import User from '../models/user.js';
import mongoose from "mongoose";


// Monthly leave utilization report
export const getMonthlyLeaveReport = async (userId, year = new Date().getFullYear()) => {
  try {
    const monthlyData = [];
    
    for (let month = 0; month < 12; month++) {
      const startOfMonth = new Date(year, month, 1);
      const endOfMonth = new Date(year, month + 1, 0);
      
      const monthlyLeaves = await LeaveRequest.find({
        employee: userId,
        status: 'approved',
        fromDate: { $lte: endOfMonth },
        toDate: { $gte: startOfMonth }
      });

      let monthLeaves = 0;
      monthlyLeaves.forEach(leave => {
        const overlapStart = new Date(Math.max(leave.fromDate.getTime(), startOfMonth.getTime()));
        const overlapEnd = new Date(Math.min(leave.toDate.getTime(), endOfMonth.getTime()));
        const overlapDays = Math.ceil((overlapEnd - overlapStart + 1) / (1000 * 60 * 60 * 24));
        monthLeaves += Math.max(0, overlapDays);
      });

      monthlyData.push({
        month: month + 1,
        monthName: new Date(year, month, 1).toLocaleString('default', { month: 'short' }),
        leavesTaken: monthLeaves
      });
    }

    return monthlyData;
  } catch (error) {
    console.error('Error generating monthly report:', error);
    throw new Error('Failed to generate monthly leave report');
  }
};


export const calculateLeaveBalance = async (userId) => {
  try {
    // Get user and their role
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const currentYear = new Date().getFullYear();

    // Get leave policy for the user's role and current year
    const leavePolicy = await LeavePolicy.findOne({
      role: user.role,
      year: currentYear
    });

    if (!leavePolicy) {
      throw new Error(`Leave policy not found for ${user.role} role in ${currentYear}`);
    }

    // Get all approved leave requests for the current year
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31);

    const leaveRequests = await LeaveRequest.find({
      employee: userId,
      status: 'approved',
      fromDate: { $gte: startOfYear },
      toDate: { $lte: endOfYear }
    });

    // Calculate used leaves by type
    const usedLeaves = {
      casual: 0,
      sick: 0,
      paid: 0
    };

    leaveRequests.forEach(request => {
      if (usedLeaves.hasOwnProperty(request.leaveType)) {
        usedLeaves[request.leaveType] += request.totalDays;
      }
    });

    // Get total allowed leaves from policy (convert Map to object if needed)
    const policyLeaves = leavePolicy.leaves instanceof Map ? 
      Object.fromEntries(leavePolicy.leaves) : leavePolicy.leaves;

    // Calculate remaining leaves
    const remainingLeaves = {
      casual: Math.max(0, (policyLeaves.casual || 0) - usedLeaves.casual),
      sick: Math.max(0, (policyLeaves.sick || 0) - usedLeaves.sick),
      paid: Math.max(0, (policyLeaves.paid || 0) - usedLeaves.paid)
    };

    // Calculate totals
    const totalAllowed = (policyLeaves.casual || 0) + (policyLeaves.sick || 0) + (policyLeaves.paid || 0);
    const totalUsed = usedLeaves.casual + usedLeaves.sick + usedLeaves.paid;
    const totalRemaining = totalAllowed - totalUsed;

    return {
      year: currentYear,
      policy: {
        casual: policyLeaves.casual || 0,
        sick: policyLeaves.sick || 0,
        paid: policyLeaves.paid || 0,
        total: totalAllowed
      },
      used: {
        casual: usedLeaves.casual,
        sick: usedLeaves.sick,
        paid: usedLeaves.paid,
        total: totalUsed
      },
      remaining: {
        casual: remainingLeaves.casual,
        sick: remainingLeaves.sick,
        paid: remainingLeaves.paid,
        total: totalRemaining
      },
      utilizationPercentage: totalAllowed > 0 ? 
        Math.round((totalUsed / totalAllowed) * 100) : 0
    };

  } catch (error) {
    console.error('Error calculating leave balance:', error);
    throw new Error(error.message || 'Failed to calculate leave balance');
  }
};

// Optional: Helper function to get leave balance for dashboard
export const getLeaveBalanceForDashboard = async (userId) => {
  try {
    const balance = await calculateLeaveBalance(userId);
    
    return {
      totalRemaining: balance.remaining.total,
      sick: balance.remaining.sick,
      casual: balance.remaining.casual,
      paid: balance.remaining.paid,
      totalAllowed: balance.policy.total,
      year: balance.year
    };
  } catch (error) {
    console.error('Error getting leave balance for dashboard:', error);
    return {
      totalRemaining: 0,
      sick: 0,
      casual: 0,
      paid: 0,
      totalAllowed: 0,
      year: new Date().getFullYear(),
      error: error.message
    };
  }
};


// Get all employee dashboard stats
export const getEmployeeDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's profile
    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Get today's attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employee: profile._id,
      date: today
    });

    // Get leave balance
    const leaveBalance = await calculateLeaveBalance(userId);

    // Get payroll summary
    const payrollSummary = await getPayrollData(profile._id);

    // Get task summary
    const taskSummary = await getTaskData(profile._id);

    // Attendance status handling
    let attendanceStatus = "not marked";
    if (attendance) {
      if (attendance.checkIn) {
        attendanceStatus = attendance.status; // pending | accepted | rejected
      }
    }

    res.status(200).json({
      success: true,
      data: {
        attendance: {
          status: attendanceStatus,
          checkIn: attendance?.checkIn,
          checkOut: attendance?.checkOut,
          workProgress: attendance?.workProgress || null,
          remarks: attendance?.remarks || null
        },
        leaveBalance,
        payrollSummary,
        taskSummary
      }
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error while fetching dashboard stats"
    });
  }
};


// Get attendance summary for last 30 days
export const getAttendanceSummary = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const attendanceData = await Attendance.aggregate([
      {
        $match: {
          employee: profile._id,
          date: { $gte: thirtyDaysAgo },
          status: { $in: ["present", "absent", "on leave"] }
        }
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const present = attendanceData.find(a => a._id === "present")?.count || 0;
    const absent = attendanceData.find(a => a._id === "absent")?.count || 0;
    const onLeave = attendanceData.find(a => a._id === "on leave")?.count || 0;
    
    const totalDays = present + absent + onLeave;
    const attendancePercentage = totalDays > 0 ? (present / totalDays) * 100 : 0;

    // Get holidays count (you might have a separate Holidays model)
    const holidaysCount = 5; // This should come from your Holidays model

    res.status(200).json({
      success: true,
      data: {
        percentage: Math.round(attendancePercentage),
        present,
        absent,
        onLeave,
        holidays: holidaysCount
      }
    });
  } catch (error) {
    console.error("Attendance summary error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error while fetching attendance summary"
    });
  }
};

// Check out for the day
export const checkOut = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find today's attendance and update checkOut time
    const attendance = await Attendance.findOneAndUpdate(
      {
        employee: profile._id,
        date: today,
        checkOut: { $exists: false } // Only if not already checked out
      },
      {
        checkOut: new Date(),
        status: "present" // Update status to present
      },
      { new: true }
    );

    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: "Already checked out or no check-in found for today"
      });
    }

    res.status(200).json({
      success: true,
      message: "Checked out successfully",
      data: attendance
    });
  } catch (error) {
    console.error("Checkout error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error during checkout"
    });
  }
};

// Get leave balance details
export const getLeaveBalance = async (req, res) => {
  try {
    const leaveBalance = await calculateLeaveBalance(req.user._id);
    
    res.status(200).json({
      success: true,
      data: leaveBalance
    });
  } catch (error) {
    console.error("Leave balance error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error while fetching leave balance"
    });
  }
};

// Get task summary (you need to implement Task model)
export const getTaskSummary = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // This is placeholder logic - you need to implement Task model
    const taskSummary = {
      ongoing: 5,
      pending: 2,
      completed: 4
    };

    res.status(200).json({
      success: true,
      data: taskSummary
    });
  } catch (error) {
    console.error("Task summary error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error while fetching task summary"
    });
  }
};

// Get payroll summary
export const getPayrollSummary = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const latestPayroll = await Payroll.findOne({
      employee: profile._id,
      status: "approved"
    }).sort({ month: -1 });

    res.status(200).json({
      success: true,
      data: latestPayroll ? {
        month: latestPayroll.month,
        netPay: latestPayroll.netPay,
        status: latestPayroll.status
      } : null
    });
  } catch (error) {
    console.error("Payroll summary error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error while fetching payroll summary"
    });
  }
};

// Helper function for payroll data
const getPayrollData = async (employeeId) => {
  const latestPayroll = await Payroll.findOne({
    employee: employeeId,
    status: "approved"
  }).sort({ month: -1 });

  return latestPayroll ? {
    month: latestPayroll.month,
    netPay: latestPayroll.netPay,
    status: latestPayroll.status
  } : null;
};

// Helper function for task data (placeholder - implement your Task model)
const getTaskData = async (employeeId) => {
  // Implement your task aggregation here
  return {
    ongoing: 5,
    pending: 2,
    completed: 4
  };
};

////////--------------hr dashboard-----------

// Get HR Dashboard Stats
export const getHRDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Total Active Employees
    const totalEmployees = await User.countDocuments({ 
      isActive: true, 
      role: { $in: ['employee', 'hr'] } 
    });
    
    // Pending Leave Requests
    const pendingLeaveRequests = await LeaveRequest.countDocuments({ 
      status: 'pending' 
    });
    
    // Payroll processed this month (format: YYYY-MM)
    const currentMonth = new Date().toISOString().slice(0, 7);
    const processedPayroll = await Payroll.countDocuments({ 
      month: currentMonth,
      status: 'approved' 
    });
    
    // New joiners this week
    const newJoiners = await Profile.countDocuments({
      dateOfJoining: { 
        $gte: startOfWeek,
        $lte: new Date() 
      }
    });
    
    res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        pendingLeaveRequests,
        processedPayroll,
        newJoiners
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching HR dashboard stats",
      error: error.message
    });
  }
};


// Get Today's Attendance Log (with Task & Logout Notes)
export const getTodaysAttendanceLog = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const attendanceLog = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: startOfDay, $lte: endOfDay }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "employee",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $lookup: {
          from: "profiles",
          localField: "user.profileRef",
          foreignField: "_id",
          as: "profile"
        }
      },
      { $unwind: "$profile" },
      {
        $project: {
          name: { $concat: ["$profile.firstName", " ", "$profile.lastName"] },
          team: "$profile.department",
          checkIn: 1,
          checkOut: 1,
          task: "$taskDescription",
          workProgress: 1,
          notes: "$logoutDescription",
          status: {
            $cond: {
              if: { $eq: ["$status", "accepted"] },
              then: {
                $cond: [{ $gt: ["$checkIn", null] }, "Logged in", "Pending"]
              },
              else: {
                $cond: [{ $eq: ["$status", "rejected"] }, "Absent", "Pending"]
              }
            }
          },
          action: {
            $cond: {
              if: { $and: [{ $eq: ["$status", "pending"] }, { $gt: ["$checkIn", null] }] },
              then: "Approve",
              else: null
            }
          }
        }
      },
      { $sort: { checkIn: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: attendanceLog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching today's attendance log",
      error: error.message
    });
  }
};




// Approve Attendance
export const approveAttendance = async (req, res) => {
  try {
    const { attendanceId } = req.params;
    
    const updatedAttendance = await Attendance.findByIdAndUpdate(
      attendanceId,
      {
        status: "accepted",
        approvedBy: req.user.id
      },
      { new: true }
    );
    
    if (!updatedAttendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Attendance approved successfully",
      data: updatedAttendance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error approving attendance",
      error: error.message
    });
  }
};

// Get Pending Approvals Summary
export const getPendingApprovals = async (req, res) => {
  try {
    const pendingLeaves = await LeaveRequest.countDocuments({ status: 'pending' });
    const pendingAttendance = await Attendance.countDocuments({ 
      status: 'pending',
      checkIn: { $exists: true, $ne: null }
    });
    
    res.status(200).json({
      success: true,
      data: {
        leaveRequests: pendingLeaves,
        attendance: pendingAttendance
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching pending approvals",
      error: error.message
    });
  }
};

// Get Department-wise Employee Count
export const getDepartmentStats = async (req, res) => {
  try {
    const departmentStats = await Profile.aggregate([
      {
        $group: {
          _id: "$department",
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          _id: { $ne: null, $ne: "" }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: departmentStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching department stats",
      error: error.message
    });
  }
};


////// --------------admin dashboard ------------ 
// Get Admin Dashboard Stats
export const getAdminDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));
    
    // Total Employees (all roles)
    const totalEmployees = await User.countDocuments({ isActive: true });
    
    // Today's Attendance Stats
    const todayAttendance = await Attendance.aggregate([
      {
        $match: {
          date: {
            $gte: startOfToday,
            $lte: endOfToday
          }
        }
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Convert to object for easier access
    const attendanceStats = {
      present: 0,
      absent: 0,
      onLeave: 0
    };
    
    todayAttendance.forEach(stat => {
      if (stat._id === 'accepted') attendanceStats.present = stat.count;
      if (stat._id === 'rejected') attendanceStats.absent = stat.count;
    });
    
    // Leave Requests Summary
    const leaveStats = await LeaveRequest.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);
    
    const leaveSummary = {
      pending: 0,
      approved: 0,
      rejected: 0
    };
    
    leaveStats.forEach(stat => {
      if (stat._id === 'pending') leaveSummary.pending = stat.count;
      if (stat._id === 'approved') leaveSummary.approved = stat.count;
      if (stat._id === 'rejected') leaveSummary.rejected = stat.count;
    });
    
    // Payroll Summary (latest month)
    const currentMonth = new Date().toISOString().slice(0, 7);
    const previousMonth = new Date();
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    const previousMonthFormatted = previousMonth.toISOString().slice(0, 7);
    
    const payrollData = await Payroll.findOne({
      $or: [
        { month: currentMonth },
        { month: previousMonthFormatted }
      ]
    }).sort({ month: -1 });
    
    res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        attendance: attendanceStats,
        leaves: leaveSummary,
        payroll: {
          employees: payrollData ? await User.countDocuments({ isActive: true, role: 'employee' }) : 0,
          status: payrollData ? `Released for ${new Date(payrollData.month + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}` : 'Not processed',
          month: payrollData?.month
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching admin dashboard stats",
      error: error.message
    });
  }
};


// Get System Overview
export const getSystemOverview = async (req, res) => {
  try {
    // User counts by role
    const userCounts = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Department counts
    const departmentCounts = await Profile.aggregate([
      {
        $group: {
          _id: "$department",
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          _id: { $ne: null, $ne: "" }
        }
      }
    ]);
    
    // Recent activities (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentActivities = await Attendance.aggregate([
      {
        $match: {
          createdAt: { $gte: oneWeekAgo }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "employee",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $unwind: "$user"
      },
      {
        $lookup: {
          from: "profiles",
          localField: "user.profileRef",
          foreignField: "_id",
          as: "profile"
        }
      },
      {
        $unwind: "$profile"
      },
      {
        $project: {
          name: { $concat: ["$profile.firstName", " ", "$profile.lastName"] },
          action: {
            $cond: {
              if: { $gt: ["$checkIn", null] },
              then: {
                $cond: {
                  if: { $gt: ["$checkOut", null] },
                  then: "Checked out",
                  else: "Checked in"
                }
              },
              else: "Attendance marked"
            }
          },
          timestamp: "$createdAt",
          type: "attendance"
        }
      },
      {
        $limit: 10
      },
      {
        $sort: { timestamp: -1 }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        userCounts,
        departmentCounts,
        recentActivities
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching system overview",
      error: error.message
    });
  }
};


// Get Today's Detailed Attendance Log
export const getTodaysDetailedAttendance = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const attendanceLog = await Attendance.aggregate([
      { $match: { date: { $gte: startOfDay, $lte: endOfDay } } },
      { $lookup: { from: "users", localField: "employee", foreignField: "_id", as: "user" } },
      { $unwind: "$user" },
      { $lookup: { from: "profiles", localField: "user.profileRef", foreignField: "_id", as: "profile" } },
      { $unwind: "$profile" },
      {
        $project: {
          name: { $concat: ["$profile.firstName", " ", "$profile.lastName"] },
          team: "$profile.department",
          checkIn: 1,
          checkOut: 1,
          task: "$taskDescription",           // fixed
          workProgress: 1,                    // direct field
          notes: "$logoutDescription",        // fixed
          status: {
            $cond: {
              if: { $eq: ["$status", "accepted"] },
              then: { $cond: [{ $gt: ["$checkIn", null] }, "Logged in", "Pending"] },
              else: { $cond: [{ $eq: ["$status", "rejected"] }, "Absent", "Pending"] }
            }
          },
          action: {
            $cond: {
              if: { $and: [{ $eq: ["$status", "pending"] }, { $gt: ["$checkIn", null] }] },
              then: "Approve",
              else: null
            }
          }
        }
      },
      { $sort: { checkIn: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: attendanceLog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching today's attendance log",
      error: error.message
    });
  }
};


// Approve Attendance
export const approveAttendanceByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const attendance = await Attendance.findByIdAndUpdate(id, { status: "accepted" }, { new: true });
    res.status(200).json({ success: true, message: "Attendance approved", data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error approving attendance", error: error.message });
  }
};

// Reject Attendance
export const rejectAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const attendance = await Attendance.findByIdAndUpdate(id, { status: "rejected" }, { new: true });
    res.status(200).json({ success: true, message: "Attendance rejected", data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error rejecting attendance", error: error.message });
  }
};
