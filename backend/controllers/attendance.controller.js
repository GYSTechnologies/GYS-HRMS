import Attendance from "../models/attendance.js";
import Profile from "../models/profile.js";
import User from "../models/user.js";
import Event from "../models/companyCalendar.js";
import moment from "moment";
import mongoose from "mongoose";
import LeaveRequest from "../models/leaves.js"
import { getEmployeeAttendanceSummary } from "../config/payrollCalculator.js";

// Get employee attendance for payroll creation
export const getEmployeeAttendanceForPayroll = async (req, res) => {
  try {
    const { employeeId, month, year } = req.query;

    if (!employeeId || !month || !year) {
      return res.status(400).json({
        success: false,
        message: "Employee ID, month, and year are required"
      });
    }

    const attendanceSummary = await getEmployeeAttendanceSummary(employeeId, parseInt(month), parseInt(year));

    res.status(200).json({
      success: true,
      data: attendanceSummary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching attendance data",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// ----------------- EMPLOYEE -----------------

// Get today's attendance (by day range)
export const getTodayAttendance = async (req, res) => {
  try {
    const employeeId = req.user._id;
    const startOfDay = moment().startOf("day").toDate();
    const endOfDay = moment().endOf("day").toDate();

    const attendance = await Attendance.findOne({
      employee: employeeId,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    return res.status(200).json(attendance || null);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

//......----working code h 

// Employee Login — set checkIn and date = start of day
// export const employeeLogin = async (req, res) => {
//   try {
//     const { taskDescription, workProgress, earlyLoginReason, lateLoginReason } = req.body;
//     const employeeId = req.user._id;

//     // employeeLogin function mein holiday check add karo:
// const isHoliday = await Event.findOne({
//   startDate: { $lte: moment().startOf('day').toDate() },
//   endDate: { $gte: moment().startOf('day').toDate() },
//   isHoliday: true
// });

// if (isHoliday) {
//   return res.status(400).json({
//     message: "Cannot mark attendance on holiday"
//   });
// }

//     const profile = await Profile.findOne({ user: employeeId });
//     if (!profile?.shiftTiming?.start || !profile?.shiftTiming?.end) {
//       return res
//         .status(400)
//         .json({ message: "Shift timings not set in profile" });
//     }

//     const shiftStart = moment(profile.shiftTiming.start, "hh:mm A");
//     const now = moment();

//     // already logged in today? use day-range detection
//     const startOfDay = moment().startOf("day").toDate();
//     const endOfDay = moment().endOf("day").toDate();

//     const existing = await Attendance.findOne({
//       employee: employeeId,
//       date: { $gte: startOfDay, $lte: endOfDay },
//     });
//     if (existing) {
//       return res.status(400).json({ message: "Already logged in today" });
//     }

//     // Check for early login (before shift start)
//     const isEarlyLogin = now.isBefore(shiftStart);
//     if (isEarlyLogin && !earlyLoginReason) {
//       return res.status(400).json({
//         message: "Early login reason required before shift start"
//       });
//     }

//     // Check for late login (after shift start + 1 hour grace period)
//     const oneHourAfterShiftStart = shiftStart.clone().add(1, 'hour');
//     const isLateLogin = now.isAfter(oneHourAfterShiftStart);
//     if (isLateLogin && !lateLoginReason) {
//       return res.status(400).json({
//         message: "Late login reason required after 1 hour from shift start"
//       });
//     }

//     // login allowed check (within 8 hours from shift start)
//     if (now.isAfter(shiftStart.clone().add(1, "hour"))) {
//       return res.status(400).json({
//         message: `Login allowed only between ${
//           profile.shiftTiming.start
//         } - ${shiftStart.clone().add(1, "hour").format("hh:mm A")}`,
//       });
//     }

//     const attendance = await Attendance.create({
//       employee: employeeId,
//       date: moment().startOf("day").toDate(),
//       checkIn: now.toDate(),
//       taskDescription,
//       workProgress,
//       status: "pending",
//       earlyLoginReason: isEarlyLogin ? earlyLoginReason : undefined,
//       lateLoginReason: isLateLogin ? lateLoginReason : undefined
//     });

//     return res.status(201).json({
//       message: "Attendance submitted, pending HR approval",
//       attendance,
//     });
//   } catch (err) {
//     return res.status(500).json({ message: err.message });
//   }
// };


// Employee Logout — set checkOut (and optional earlyLogoutReason)
export const employeeLogout = async (req, res) => {
  try {
    const { logoutDescription, earlyLogoutReason } = req.body;
    const attendanceId = req.params.id;
    const employeeId = req.user._id;

    const attendance = await Attendance.findOne({
      _id: attendanceId,
      employee: employeeId,
    });
    if (!attendance)
      return res.status(404).json({ message: "Record not found" });

    // already logged out?
    if (attendance.checkOut) {
      return res.status(400).json({ message: "Already logged out" });
    }

    const profile = await Profile.findOne({ user: employeeId });
    if (!profile?.shiftTiming?.end) {
      return res.status(400).json({ message: "Shift end not set in profile" });
    }

    const logoutTime = moment(); // now

    // parse shift end and align to attendance date (handles next-day end)
    const parsedShiftEnd = moment(profile.shiftTiming.end, "hh:mm A");
    const baseDate = attendance.date ? moment(attendance.date) : moment();
    let shiftEndOnDate = baseDate
      .clone()
      .hour(parsedShiftEnd.hour())
      .minute(parsedShiftEnd.minute())
      .second(0)
      .millisecond(0);

    if (profile.shiftTiming.start) {
      const parsedShiftStart = moment(profile.shiftTiming.start, "hh:mm A");
      const shiftStartOnDate = baseDate
        .clone()
        .hour(parsedShiftStart.hour())
        .minute(parsedShiftStart.minute())
        .second(0)
        .millisecond(0);

      if (shiftEndOnDate.isBefore(shiftStartOnDate)) {
        shiftEndOnDate.add(1, "day");
      }
    }

    // early logout check
    if (logoutTime.isBefore(shiftEndOnDate) && !earlyLogoutReason) {
      return res.status(400).json({
        message: "Early logout reason required before shift end",
      });
    }

    // set fields expected by schema/frontend
    attendance.checkOut = logoutTime.toDate(); // <-- important
    attendance.logoutDescription = logoutDescription;
    if (logoutTime.isBefore(shiftEndOnDate)) {
      attendance.earlyLogoutReason = earlyLogoutReason;
    }

    await attendance.save();

    return res.status(200).json({ message: "Logout recorded", attendance });
  } catch (err) {
    console.error("employeeLogout error:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

// Get attendance history for the logged-in employee
export const getAttendanceHistory = async (req, res) => {
  try {
    const employeeId = req.user._id;
    const { limit = 30 } = req.query;

    const attendance = await Attendance.find({
      employee: employeeId,
    })
      .sort({ date: -1 })
      .limit(parseInt(limit));

    res.status(200).json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ----------------- HR -----------------
//  HR View Pending Attendances (excluding self)
export const getPendingAttendances = async (req, res) => {
  try {
    const pending = await Attendance.find({
      status: "pending",
      employee: { $ne: req.user.id }, // exclude logged-in HR's own attendance
    })
      .populate("employee", "email role")
      .populate({
        path: "employee",
        populate: {
          path: "profileRef",
          select: "firstName lastName employeeId",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json(pending);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


//  HR Approve Attendance
export const approveAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const hrId = req.user._id;

    const attendance = await Attendance.findById(id);
    if (!attendance)
      return res.status(404).json({ message: "Record not found" });

    attendance.status = "accepted";
    attendance.processedBy = hrId;
    attendance.processedAt = new Date();

    await attendance.save();
    res.status(200).json({ message: "Attendance approved", attendance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//  HR Reject Attendance
export const rejectAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;
    const hrId = req.user._id;

    const attendance = await Attendance.findById(id);
    if (!attendance)
      return res.status(404).json({ message: "Record not found" });

    attendance.status = "rejected";
    attendance.remarks = remarks;
    attendance.processedBy = hrId;
    attendance.processedAt = new Date();

    await attendance.save();
    res.status(200).json({ message: "Attendance rejected", attendance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getAttendanceStats = async (req, res) => {
  try {
    // Get total employees + HR count (excluding admin)
    const totalUsers = await User.countDocuments({ 
      role: { $in: ["employee", "hr"] } 
    });

    // Get today's date
    const today = new Date().toDateString();

    // Get present users (employees + HR with attendance for today)
    const present = await Attendance.countDocuments({
      date: today,
      status: { $in: ["accepted", "pending"] },
    });

    // Get pending approvals count
    const pending = await Attendance.countDocuments({
      date: today,
      status: "pending",
    });

    // Calculate absent users (total - present)
    const absent = totalUsers - present;

    res.status(200).json({
      totalEmployees: totalUsers, // Now includes HR too
      present,
      absent,
      pending,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ----------------- ADMIN -----------------

// 6. Admin View All Attendance (Read Only)

export const getAllAttendanceForAdmin = async (req, res) => {
  try {
    const currentUser = req.user;

    let query = {};

    if (currentUser.role === "hr") {
      query = { employee: { $ne: currentUser._id } };
    }

    const records = await Attendance.find(query)
      .populate("employee", "email role")
      .populate({
        path: "employee",
        populate: {
          path: "profileRef",
          select: "firstName lastName employeeId",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ----------------- HR SELF ATTENDANCE -----------------

// HR Login (same as employee but for HR role)
export const hrLogin = async (req, res) => {
  try {
    const { taskDescription, workProgress } = req.body;
    const hrId = req.user._id;

    // Check if HR already logged in today
    const startOfDay = moment().startOf("day").toDate();
    const endOfDay = moment().endOf("day").toDate();

    const existing = await Attendance.findOne({
      employee: hrId,
      date: { $gte: startOfDay, $lte: endOfDay },
    });
    if (existing) {
      return res.status(400).json({ message: "Already logged in today" });
    }

    const attendance = await Attendance.create({
      employee: hrId,
      date: moment().startOf("day").toDate(),
      checkIn: moment().toDate(),
      taskDescription,
      workProgress,
      status: "pending", // HR ki attendance admin approve karega
    });

    return res.status(201).json({
      message: "Attendance submitted, pending Admin approval",
      attendance,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// HR Logout
export const hrLogout = async (req, res) => {
  try {
    const { logoutDescription, earlyLogoutReason } = req.body;
    const attendanceId = req.params.id;
    const hrId = req.user._id;

    const attendance = await Attendance.findOne({
      _id: attendanceId,
      employee: hrId,
    });
    if (!attendance)
      return res.status(404).json({ message: "Record not found" });

    if (attendance.checkOut) {
      return res.status(400).json({ message: "Already logged out" });
    }

    attendance.checkOut = moment().toDate();
    attendance.logoutDescription = logoutDescription;
    if (earlyLogoutReason) {
      attendance.earlyLogoutReason = earlyLogoutReason;
    }

    await attendance.save();
    return res.status(200).json({ message: "Logout recorded", attendance });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// HR Attendance History
export const getHrAttendanceHistory = async (req, res) => {
  try {
    const hrId = req.user._id;
    const { limit = 30 } = req.query;

    const attendance = await Attendance.find({
      employee: hrId,
    })
      .sort({ date: -1 })
      .limit(parseInt(limit));

    res.status(200).json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// HR Today Attendance
export const getHrTodayAttendance = async (req, res) => {
  try {
    const hrId = req.user._id;
    const startOfDay = moment().startOf("day").toDate();
    const endOfDay = moment().endOf("day").toDate();

    const attendance = await Attendance.findOne({
      employee: hrId,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    return res.status(200).json(attendance || null);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ----------------- ADMIN APPROVE/REJECT -----------------

// Admin Approve Attendance (both employees and HR)
export const adminApproveAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user._id;

    const attendance = await Attendance.findById(id);
    if (!attendance)
      return res.status(404).json({ message: "Record not found" });

    attendance.status = "accepted";
    attendance.approvedBy = adminId;
    attendance.updatedAt = new Date();

    await attendance.save();
    res.status(200).json({ message: "Attendance approved", attendance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin Reject Attendance (both employees and HR)
export const adminRejectAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;
    const adminId = req.user._id;

    const attendance = await Attendance.findById(id);
    if (!attendance)
      return res.status(404).json({ message: "Record not found" });

    attendance.status = "rejected";
    attendance.remarks = remarks;
    attendance.approvedBy = adminId;
    attendance.updatedAt = new Date();

    await attendance.save();
    res.status(200).json({ message: "Attendance rejected", attendance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// ----------------- REGULARIZATION -----------------

// Create Regularization Request
export const createRegularizationRequest = async (req, res) => {
  try {
    const { date, checkIn, checkOut, reason } = req.body;
    const employeeId = req.user._id;

    const existingRequest = await Attendance.findOne({
      employee: employeeId,
      date: new Date(date),
      regularizationStatus: { $exists: true }
    });

    if (existingRequest) {
      return res.status(400).json({ message: "Regularization already requested for this date" });
    }

    const regularization = await Attendance.create({
      employee: employeeId,
      date: new Date(date),
      checkIn: checkIn ? new Date(checkIn) : null,
      checkOut: checkOut ? new Date(checkOut) : null,
      regularizationReason: reason,
      regularizationStatus: "pending",
      isRegularization: true
    });

    res.status(201).json({ message: "Regularization request submitted", regularization });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Pending Regularizations
export const getPendingRegularizations = async (req, res) => {
  try {
    const regularizations = await Attendance.find({
      regularizationStatus: "pending",
      isRegularization: true
    })
    .populate("employee", "email role")
    .populate({
      path: "employee",
      populate: {
        path: "profileRef",
        select: "firstName lastName employeeId department"
      }
    })
    .sort({ createdAt: -1 });

    res.status(200).json(regularizations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Approve Regularization
export const approveRegularization = async (req, res) => {
  try {
    const { id } = req.params;
    const approvedBy = req.user._id;

    const regularization = await Attendance.findById(id);
    if (!regularization) return res.status(404).json({ message: "Request not found" });

    regularization.regularizationStatus = "approved";
    regularization.status = "accepted";
    regularization.approvedBy = approvedBy;
    await regularization.save();

    res.status(200).json({ message: "Regularization approved", regularization });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reject Regularization
export const rejectRegularization = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;
    const rejectedBy = req.user._id;

    const regularization = await Attendance.findById(id);
    if (!regularization) return res.status(404).json({ message: "Request not found" });

    regularization.regularizationStatus = "rejected";
    regularization.remarks = remarks;
    regularization.approvedBy = rejectedBy;
    await regularization.save();

    res.status(200).json({ message: "Regularization rejected", regularization });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ----------------- HOLIDAY CHECK -----------------

export const updateAttendanceForLeave = async (employeeId, fromDate, toDate, leaveType) => {
  try {
    const leaveDates = [];
    let currentDate = new Date(fromDate);
    const endDate = new Date(toDate);

    // Generate all dates between fromDate and toDate
    while (currentDate <= endDate) {
      leaveDates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    for (const date of leaveDates) {
      const startOfDay = moment(date).startOf('day').toDate();
      const endOfDay = moment(date).endOf('day').toDate();

      // Check if date is Sunday or holiday
      if (date.getDay() === 0) {
        continue; // Skip Sundays
      }

      const isHoliday = await Event.findOne({
        startDate: { $lte: endOfDay },
        endDate: { $gte: startOfDay },
        isHoliday: true
      });

      if (isHoliday) {
        continue; // Skip holidays
      }

      // Check if attendance already exists
      const existingAttendance = await Attendance.findOne({
        employee: employeeId,
        date: { $gte: startOfDay, $lte: endOfDay }
      });

      if (!existingAttendance) {
        // Create new attendance for leave
        await Attendance.create({
          employee: employeeId,
          date: startOfDay,
          status: "accepted",
          isLeave: true,
          leaveType: leaveType // Using the dynamic leaveType
        });
      } else {
        // Update existing attendance
        existingAttendance.isLeave = true;
        existingAttendance.leaveType = leaveType;
        if (existingAttendance.status === "rejected") {
          existingAttendance.status = "accepted";
        }
        await existingAttendance.save();
      }
    }
  } catch (error) {
    console.error("Error updating attendance for leave:", error);
    throw error;
  }
};

//new code
// export const getMonthlyReport = async (req, res) => {
//   try {
//     const { month, year, department } = req.query;
    
//     // Calculate date range for the month
//     const startDate = new Date(year, month - 1, 1);
//     const endDate = new Date(year, month, 0, 23, 59, 59, 999);

//     // Build match query for attendance
//     const attendanceMatch = {
//       date: { $gte: startDate, $lte: endDate }
//     };

//     // Build match query for employees
//     let employeeMatch = {};
//     if (department) {
//       employeeMatch['employee.profileRef.department'] = department;
//     }

//     // Aggregate attendance data with proper department filtering
//     const reportData = await Attendance.aggregate([
//       {
//         $lookup: {
//           from: 'users',
//           localField: 'employee',
//           foreignField: '_id',
//           as: 'employee'
//         }
//       },
//       { $unwind: '$employee' },
//       {
//         $lookup: {
//           from: 'profiles',
//           localField: 'employee.profileRef',
//           foreignField: '_id',
//           as: 'employee.profileRef'
//         }
//       },
//       { $unwind: { path: '$employee.profileRef', preserveNullAndEmptyArrays: true } },
//       { $match: attendanceMatch },
//       { $match: employeeMatch }, // ✅ Department filter applied here
//       {
//         $group: {
//           _id: '$employee._id',
//           employeeId: { $first: '$employee.profileRef.employeeId' },
//           employeeName: { 
//             $first: { 
//               $concat: [
//                 { $ifNull: ['$employee.profileRef.firstName', ''] },
//                 ' ',
//                 { $ifNull: ['$employee.profileRef.lastName', ''] }
//               ]
//             }
//           },
//           employeeEmail: { $first: '$employee.email' },
//           department: { $first: '$employee.profileRef.department' },
//           present: {
//             $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] }
//           },
//           absent: {
//             $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
//           },
//           pending: {
//             $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
//           },
//           totalDays: { $sum: 1 }
//         }
//       },
//       {
//         $project: {
//           _id: 0,
//           employeeId: 1,
//           employeeName: 1,
//           employeeEmail: 1,
//           department: 1,
//           present: 1,
//           absent: 1,
//           pending: 1,
//           rejected: '$absent',
//           totalDays: 1,
//           attendancePercentage: {
//             $multiply: [
//               { $divide: ['$present', '$totalDays'] },
//               100
//             ]
//           }
//         }
//       },
//       { $sort: { employeeName: 1 } }
//     ]);

//     res.status(200).json(reportData);
//   } catch (err) {
//     console.error("Error generating monthly report:", err);
//     res.status(500).json({ message: "Error generating monthly report", error: err.message });
//   }
// };

export const getMonthlyReport = async (req, res) => {
  try {
    const { month, year, department } = req.query;
    
    if (!month || !year) {
      return res.status(400).json({ message: "Month and year are required" });
    }

    // Calculate payroll cycle: 8th current month -> 7th next month
    const cycleStart = new Date(year, month - 1, 8);
    const cycleEnd = new Date(year, month, 7);
    
    // If current month, set end to today
    const today = new Date();
    const effectiveEnd = cycleEnd > today ? today : cycleEnd;

    // Build match query for employees with department filter
    let employeeMatch = {};
    if (department) {
      employeeMatch['department'] = department;
    }

    // Get all employees with department filter
    const employees = await Profile.find(employeeMatch)
      .populate('user', 'email')
      .select('firstName lastName employeeId department user');

    if (employees.length === 0) {
      return res.status(200).json([]);
    }

    // Get holidays for the cycle
    const holidays = await Event.find({
      startDate: { $lte: effectiveEnd },
      endDate: { $gte: cycleStart },
      isHoliday: true,
    });

    const holidaySet = new Set();
    holidays.forEach(h => {
      const start = h.startDate < cycleStart ? cycleStart : h.startDate;
      const end = h.endDate > effectiveEnd ? effectiveEnd : h.endDate;
      let cur = new Date(start);
      while (cur <= end) {
        holidaySet.add(cur.toISOString().split('T')[0]);
        cur.setDate(cur.getDate() + 1);
      }
    });

    // Get all attendances for these employees in the cycle
    const userIds = employees.map(emp => emp.user._id);
    
    const attendances = await Attendance.find({
      employee: { $in: userIds },
      date: { $gte: cycleStart, $lte: effectiveEnd }
    });

    // Create attendance map by user and date
    const attendanceMap = new Map();
    attendances.forEach(att => {
      const userKey = att.employee.toString();
      const dateKey = att.date.toISOString().split('T')[0];
      
      if (!attendanceMap.has(userKey)) {
        attendanceMap.set(userKey, new Map());
      }
      
      const userAttendance = attendanceMap.get(userKey);
      userAttendance.set(dateKey, {
        status: att.status,
        checkIn: att.checkIn,
        isPresent: (att.status === 'accepted') || !!att.checkIn
      });
    });

    // Get approved leaves for the cycle
    const leaveRequests = await LeaveRequest.find({
      employee: { $in: userIds },
      status: "approved",
      $or: [
        { fromDate: { $lte: effectiveEnd, $gte: cycleStart } },
        { toDate: { $lte: effectiveEnd, $gte: cycleStart } }
      ]
    });

    const leaveMap = new Map();
    leaveRequests.forEach(leave => {
      const userKey = leave.employee.toString();
      const start = leave.fromDate < cycleStart ? cycleStart : leave.fromDate;
      const end = leave.toDate > effectiveEnd ? effectiveEnd : leave.toDate;
      
      if (!leaveMap.has(userKey)) {
        leaveMap.set(userKey, new Set());
      }
      
      const userLeaves = leaveMap.get(userKey);
      let cur = new Date(start);
      while (cur <= end) {
        userLeaves.add(cur.toISOString().split('T')[0]);
        cur.setDate(cur.getDate() + 1);
      }
    });

    // Calculate report data for each employee
    const reportData = [];

    for (const employee of employees) {
      const userId = employee.user._id.toString();
      const userAttendance = attendanceMap.get(userId) || new Map();
      const userLeaves = leaveMap.get(userId) || new Set();

      let presentDays = 0;
      let absentDays = 0;
      let leaveDays = 0;
      let workingDays = 0;

      // Calculate for each day in the cycle
      let currentDate = new Date(cycleStart);
      while (currentDate <= effectiveEnd) {
        const dateKey = currentDate.toISOString().split('T')[0];
        const isSunday = currentDate.getDay() === 0;
        const isHoliday = holidaySet.has(dateKey);
        const isWorkingDay = !isSunday && !isHoliday;

        if (isWorkingDay) {
          workingDays++;

          if (userLeaves.has(dateKey)) {
            leaveDays++;
          } else if (userAttendance.has(dateKey)) {
            const att = userAttendance.get(dateKey);
            if (att.isPresent) {
              presentDays++;
            } else {
              absentDays++;
            }
          } else {
            absentDays++;
          }
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      const totalDaysInCycle = workingDays + leaveDays;
      const attendancePercentage = totalDaysInCycle > 0 
        ? Math.round((presentDays / totalDaysInCycle) * 100) 
        : 0;

      reportData.push({
        employeeId: employee.employeeId,
        employeeName: `${employee.firstName} ${employee.lastName}`.trim(),
        employeeEmail: employee.user.email,
        department: employee.department,
        present: presentDays,
        absent: absentDays,
        leaveDays: leaveDays,
        workingDays: workingDays,
        totalDays: totalDaysInCycle,
        attendancePercentage: attendancePercentage
      });
    }

    // Sort by employee name
    reportData.sort((a, b) => a.employeeName.localeCompare(b.employeeName));

    res.status(200).json(reportData);
    
  } catch (err) {
    console.error("Error generating monthly report:", err);
    res.status(500).json({ 
      message: "Error generating monthly report", 
      error: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  }
};


export const employeeLogin = async (req, res) => {
  try {
    const { taskDescription, workProgress, earlyLoginReason, lateLoginReason } = req.body;
    const employeeId = req.user._id;

    // ✅ 1. Check if Sunday
    if (moment().day() === 0) {
      return res.status(400).json({
        message: "Cannot mark attendance on Sunday"
      });
    }

    // ✅ 2. Check if holiday
    const todayStart = moment().startOf('day').toDate();
    const todayEnd = moment().endOf('day').toDate();
    
    const isHoliday = await Event.findOne({
      startDate: { $lte: todayEnd },
      endDate: { $gte: todayStart },
      isHoliday: true
    });

    if (isHoliday) {
      return res.status(400).json({
        message: "Cannot mark attendance on holiday"
      });
    }

    // ✅ 3. Get employee profile for shift timing
    const profile = await Profile.findOne({ user: employeeId });
    if (!profile?.shiftTiming?.start || !profile?.shiftTiming?.end) {
      return res
        .status(400)
        .json({ message: "Shift timings not set in profile" });
    }

    // ✅ 4. Check if already logged in today
    const startOfDay = moment().startOf("day").toDate();
    const endOfDay = moment().endOf("day").toDate();

    const existing = await Attendance.findOne({
      employee: employeeId,
      date: { $gte: startOfDay, $lte: endOfDay },
    });
    if (existing) {
      return res.status(400).json({ message: "Already logged in today" });
    }

    // ✅ 5. Check shift timing validations
    const shiftStart = moment(profile.shiftTiming.start, "hh:mm A");
    const now = moment();

    // Check for early login (before shift start)
    const isEarlyLogin = now.isBefore(shiftStart);
    if (isEarlyLogin && !earlyLoginReason) {
      return res.status(400).json({
        message: "Early login reason required before shift start"
      });
    }

    // Check for late login (after shift start + 1 hour grace period)
    const oneHourAfterShiftStart = shiftStart.clone().add(1, 'hour');
    const isLateLogin = now.isAfter(oneHourAfterShiftStart);
    if (isLateLogin && !lateLoginReason) {
      return res.status(400).json({
        message: "Late login reason required after 1 hour from shift start"
      });
    }

    // Login allowed check (within 8 hours from shift start)
    // if (now.isAfter(shiftStart.clone().add(1, "hour"))) {
    //   return res.status(400).json({
    //     message: `Login allowed only between ${
    //       profile.shiftTiming.start
    //     } - ${shiftStart.clone().add(1, "hour").format("hh:mm A")}`,
    //   });
    // }

    // ✅ 6. Create attendance record
    const attendance = await Attendance.create({
      employee: employeeId,
      date: moment().startOf("day").toDate(),
      checkIn: now.toDate(),
      taskDescription,
      workProgress,
      status: "pending",
      earlyLoginReason: isEarlyLogin ? earlyLoginReason : undefined,
      lateLoginReason: isLateLogin ? lateLoginReason : undefined
    });

    return res.status(201).json({
      message: "Attendance submitted, pending HR approval",
      attendance,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


export const checkIsHoliday = async (req, res) => {
  try {
    const { date } = req.params;
    const checkDate = new Date(date);

    // ✅ Check if Sunday
    if (checkDate.getDay() === 0) {
      return res.status(200).json({ 
        isHoliday: true, 
        holiday: { title: "Sunday", isHoliday: true } 
      });
    }

    // ✅ Check if company holiday
    const holiday = await Event.findOne({
      startDate: { $lte: checkDate },
      endDate: { $gte: checkDate },
      isHoliday: true
    });

    res.status(200).json({ 
      isHoliday: !!holiday, 
      holiday: holiday 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
