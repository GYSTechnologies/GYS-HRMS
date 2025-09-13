import Attendance from "../models/attendance.js";
import Profile from "../models/profile.js";
import User from "../models/user.js";
import moment from "moment";

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

// Employee Login — set checkIn and date = start of day
export const employeeLogin = async (req, res) => {
  try {
    const { taskDescription, workProgress } = req.body;
    const employeeId = req.user._id;

    const profile = await Profile.findOne({ user: employeeId });
    if (!profile?.shiftTiming?.start || !profile?.shiftTiming?.end) {
      return res
        .status(400)
        .json({ message: "Shift timings not set in profile" });
    }

    const shiftStart = moment(profile.shiftTiming.start, "hh:mm A"); // use hh:mm A
    const now = moment();

    // already logged in today? use day-range detection
    const startOfDay = moment().startOf("day").toDate();
    const endOfDay = moment().endOf("day").toDate();

    const existing = await Attendance.findOne({
      employee: employeeId,
      date: { $gte: startOfDay, $lte: endOfDay },
    });
    if (existing) {
      return res.status(400).json({ message: "Already logged in today" });
    }

    // login allowed check (within 8 hours from shift start)
    if (
      now.isBefore(shiftStart) ||
      now.isAfter(shiftStart.clone().add(8, "hour"))
    ) {
      return res.status(400).json({
        message: `Login allowed only between ${
          profile.shiftTiming.start
        } - ${shiftStart.clone().add(8, "hour").format("hh:mm A")}`,
      });
    }

    const attendance = await Attendance.create({
      employee: employeeId,
      date: moment().startOf("day").toDate(), // store canonical day
      checkIn: now.toDate(), // <-- important (schema uses checkIn)
      taskDescription,
      workProgress,
      status: "pending",
    });

    return res.status(201).json({
      message: "Attendance submitted, pending HR approval",
      attendance,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

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

//  HR View Pending Attendances
export const getPendingAttendances = async (req, res) => {
  try {
    const pending = await Attendance.find({ status: "pending" })
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

// Get attendance stats for HR dashboard
// export const getAttendanceStats = async (req, res) => {
//   try {
//     // Get total employees count
//     const totalEmployees = await User.countDocuments({ role: "employee" });

//     // Get today's date
//     const today = new Date().toDateString();

//     // Get present employees (those with attendance records for today)
//     const present = await Attendance.countDocuments({
//       date: today,
//       status: { $in: ["accepted", "pending"] },
//     });

//     // Get pending approvals count
//     const pending = await Attendance.countDocuments({
//       date: today,
//       status: "pending",
//     });

//     // Calculate absent employees (total - present)
//     const absent = totalEmployees - present;

//     res.status(200).json({
//       totalEmployees,
//       present,
//       absent,
//       pending,
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

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
    const records = await Attendance.find()
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

// ----------------- MONTHLY REPORTS -----------------

// Get Monthly Attendance Report
// export const getMonthlyReport = async (req, res) => {
//   try {
//     const { month, year, department } = req.query;
//     const targetMonth = parseInt(month) || moment().month() + 1;
//     const targetYear = parseInt(year) || moment().year();

//     const startDate = moment(`${targetYear}-${targetMonth}-01`).startOf('month');
//     const endDate = moment(startDate).endOf('month');

//     // Get all users based on department filter
//     let userQuery = { role: { $in: ["employee", "hr"] } };
//     if (department) {
//       const profiles = await Profile.find({ department }).select('user');
//       userQuery._id = { $in: profiles.map(p => p.user) };
//     }

//     const users = await User.find(userQuery).populate('profileRef');

//     const report = await Promise.all(
//       users.map(async (user) => {
//         const attendances = await Attendance.find({
//           employee: user._id,
//           date: { $gte: startDate.toDate(), $lte: endDate.toDate() }
//         });

//         const presentDays = attendances.filter(a => a.status === 'accepted').length;
//         const pendingDays = attendances.filter(a => a.status === 'pending').length;
//         const rejectedDays = attendances.filter(a => a.status === 'rejected').length;

//         // Get holidays for the month
//         const holidays = await Event.find({
//           startDate: { $gte: startDate.toDate(), $lte: endDate.toDate() }
//         });

//         const totalWorkingDays = endDate.diff(startDate, 'days') + 1 - holidays.length;
//         const absentDays = totalWorkingDays - presentDays - pendingDays;

//         return {
//           employeeId: user._id,
//           employeeName: `${user.profileRef?.firstName} ${user.profileRef?.lastName}`,
//           department: user.profileRef?.department,
//           month: `${targetMonth}/${targetYear}`,
//           totalWorkingDays,
//           presentDays,
//           absentDays: absentDays > 0 ? absentDays : 0,
//           pendingDays,
//           rejectedDays,
//           holidays: holidays.length
//         };
//       })
//     );

//     res.status(200).json(report);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// In your attendance.controller.js
export const getMonthlyReport = async (req, res) => {
  try {
    const { month, year, department } = req.query;
    
    // Calculate date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Build match query
    const matchQuery = {
      date: { $gte: startDate, $lte: endDate }
    };

    if (department) {
      matchQuery['employee.profileRef.department'] = department;
    }

    // Aggregate attendance data
    const reportData = await Attendance.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'employee',
          foreignField: '_id',
          as: 'employee'
        }
      },
      { $unwind: '$employee' },
      {
        $lookup: {
          from: 'profiles',
          localField: 'employee.profileRef',
          foreignField: '_id',
          as: 'employee.profileRef'
        }
      },
      { $unwind: { path: '$employee.profileRef', preserveNullAndEmptyArrays: true } },
      { $match: matchQuery },
      {
        $group: {
          _id: '$employee._id',
          employeeId: { $first: '$employee.profileRef.employeeId' },
          employeeName: { 
            $first: { 
              $concat: [
                { $ifNull: ['$employee.profileRef.firstName', ''] },
                ' ',
                { $ifNull: ['$employee.profileRef.lastName', ''] }
              ]
            }
          },
          employeeEmail: { $first: '$employee.email' },
          department: { $first: '$employee.profileRef.department' },
          present: {
            $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] }
          },
          absent: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          totalDays: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          employeeId: 1,
          employeeName: 1,
          employeeEmail: 1,
          department: 1,
          present: 1,
          absent: 1,
          pending: 1,
          rejected: '$absent',
          totalDays: 1,
          attendancePercentage: {
            $multiply: [
              { $divide: ['$present', '$totalDays'] },
              100
            ]
          }
        }
      },
      { $sort: { employeeName: 1 } }
    ]);

    res.status(200).json(reportData);
  } catch (err) {
    console.error("Error generating monthly report:", err);
    res.status(500).json({ message: "Error generating monthly report", error: err.message });
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

// Check if date is holiday
export const checkIsHoliday = async (req, res) => {
  try {
    const { date } = req.params;
    const checkDate = new Date(date);

    const holiday = await Event.findOne({
      startDate: { $lte: checkDate },
      endDate: { $gte: checkDate }
    });

    res.status(200).json({ isHoliday: !!holiday, holiday });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
