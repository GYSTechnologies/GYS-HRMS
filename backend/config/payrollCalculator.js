import Attendance from "../models/attendance.js";
import Payroll from "../models/payroll.js";
import Event from "../models/companyCalendar.js";
import Profile from "../models/profile.js";
import LeaveRequest from "../models/leaves.js"

// Calculate attendance deductions
export const calculateAttendanceDeductions = async (employeeId, month, year) => {
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // ✅ Get attendance records
    const attendanceRecords = await Attendance.find({
      employee: employeeId,
      date: {
        $gte: startDate,
        $lte: endDate,
        $ne: null,
        $type: "date"
      }
    });

    // ✅ Get approved leaves for the same period
    const approvedLeaves = await LeaveRequest.find({
      employee: employeeId,
      status: "approved",
      fromDate: { $lte: endDate },
      toDate: { $gte: startDate }
    });

    // ✅ Filter valid attendance records
    const validRecords = attendanceRecords.filter(record => 
      record.date instanceof Date && !isNaN(record.date.valueOf())
    );

    // ✅ Calculate present and absent days from attendance
    const presentDays = validRecords.filter(record => record.status === "accepted").length;
    const absentDays = validRecords.filter(record => record.status === "rejected").length;

    // ✅ Calculate leave days (excluding Sundays and holidays)
    let totalLeaveDays = 0;
    for (const leave of approvedLeaves) {
      let currentDate = new Date(Math.max(new Date(leave.fromDate).getTime(), startDate.getTime()));
      const leaveEndDate = new Date(Math.min(new Date(leave.toDate).getTime(), endDate.getTime()));

      while (currentDate <= leaveEndDate) {
        // Skip Sundays
        if (currentDate.getDay() !== 0) {
          // Skip holidays
          const isHoliday = await Event.findOne({
            startDate: { $lte: currentDate },
            endDate: { $gte: currentDate },
            isHoliday: true
          });
          
          if (!isHoliday) {
            totalLeaveDays++;
          }
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    // ✅ Get employee basic salary
    const profile = await Profile.findOne({ user: employeeId });
    const basicSalary = profile?.basicSalary || 0;
    
    // ✅ Calculate total working days (excluding Sundays and holidays)
    const totalWorkingDays = await getWorkingDays(startDate, endDate);
    
    // ✅ Calculate actual absent days (excluding leaves)
    const actualAbsentDays = Math.max(0, totalWorkingDays - (presentDays + totalLeaveDays));
    const perDaySalary = totalWorkingDays > 0 ? basicSalary / totalWorkingDays : 0;

    return {
      absentDays: actualAbsentDays,
      absentDeduction: actualAbsentDays * perDaySalary,
      presentDays: presentDays,
      leaveDays: totalLeaveDays,
      totalWorkingDays: totalWorkingDays
    };
  } catch (error) {
    console.error("Attendance calculation error:", error);
    return { 
      absentDays: 0, 
      absentDeduction: 0, 
      presentDays: 0, 
      leaveDays: 0,
      totalWorkingDays: 0 
    };
  }
};


// Check if date is Sunday
export const isSunday = (date) => {
  return date.getDay() === 0;
};

// Check if date is holiday (from Event model - admin created)
export const isHoliday = async (date) => {
  const dateStr = date.toISOString().split("T")[0];
  const holiday = await Event.findOne({
    startDate: { $lte: date },
    endDate: { $gte: date },
  });
  return !!holiday;
};

// Get working days between two dates (excluding Sundays and holidays)
export const getWorkingDays = async (startDate, endDate) => {
  let workingDays = 0;
  let currentDate = new Date(startDate);
  const end = new Date(endDate);

  while (currentDate <= end) {
    if (!isSunday(currentDate) && !(await isHoliday(currentDate))) {
      workingDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return workingDays;
};



// payrollCalculator.js mein ye function banao:
export const getEmployeeAttendanceSummary = async (employeeId, month, year) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const attendanceData = await Attendance.aggregate([
    {
      $match: {
        employee: mongoose.Types.ObjectId(employeeId),
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]);

  // Convert array to object
  const summary = {
    present: 0,
    absent: 0,
    pending: 0,
    leaves: 0
  };

  attendanceData.forEach(item => {
    if (item._id === 'accepted') summary.present = item.count;
    if (item._id === 'rejected') summary.absent = item.count;
    if (item._id === 'pending') summary.pending = item.count;
  });

  // Add holiday and leave calculation
  const holidays = await Event.countDocuments({
    isHoliday: true,
    startDate: { $lte: endDate },
    endDate: { $gte: startDate }
  });

  summary.holidays = holidays;
  summary.totalWorkingDays = await calculateWorkingDays(month, year);

  return summary;
};

// Calculate prorata salary based on joining date
export const calculateProrataSalary = async (
  basicSalary,
  joiningDate,
  currentMonth,
  currentYear
) => {
  try {
    const monthStart = new Date(currentYear, currentMonth - 1, 1);
    const monthEnd = new Date(currentYear, currentMonth, 0);

    // If joined after month started, calculate from joining date
    const startDate = joiningDate > monthStart ? joiningDate : monthStart;

    const workingDaysInMonth = await getWorkingDays(monthStart, monthEnd);
    const eligibleWorkingDays = await getWorkingDays(startDate, monthEnd);

    const prorataRatio = eligibleWorkingDays / workingDaysInMonth;
    const prorataSalary = Math.round(basicSalary * prorataRatio);

    return {
      prorataSalary,
      eligibleWorkingDays,
      totalWorkingDays: workingDaysInMonth,
    };
  } catch (error) {
    console.error("Prorata calculation error:", error);
    return {
      prorataSalary: basicSalary,
      eligibleWorkingDays: 0,
      totalWorkingDays: 0,
    };
  }
};

// Get all departments
export const getDepartments = async (req, res) => {
  try {
    const departments = await Profile.distinct("department", {
      department: { $ne: null, $ne: "" },
    });

    res.status(200).json({
      success: true,
      data: departments.filter((dept) => dept && dept.trim() !== "").sort(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching departments",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get employees by department with joining date
export const getEmployeesByDepartment = async (req, res) => {
  try {
    const { department } = req.params;

    const employees = await Profile.find({
      department: new RegExp(`^${department}$`, "i"),
    })
      .select(
        "firstName lastName employeeId designation dateOfJoining department avatarUrl"
      )
      .sort("firstName");

    res.status(200).json({
      success: true,
      data: employees,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching employees",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
