// utils/payrollCalculator.js
import Attendance from "../models/attendance.js";
import Payroll from "../models/payroll.js";

// Calculate attendance deductions
export const calculateAttendanceDeductions = async (employeeId, month, year) => {
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Get attendance records for the month
    const attendanceRecords = await Attendance.find({
      employee: employeeId,
      date: { $gte: startDate, $lte: endDate }
    });

    // Calculate absent days
    const absentDays = attendanceRecords.filter(record => 
      record.status === "rejected" || 
      (record.status === "pending" && new Date(record.date) < new Date())
    ).length;

    // Get employee basic salary for per day calculation
    const payroll = await Payroll.findOne({ employee: employeeId }).sort({ createdAt: -1 });
    const basicSalary = payroll?.basic || 0;
    const perDaySalary = basicSalary / 30;

    return {
      absentDays,
      absentDeduction: absentDays * perDaySalary
    };

  } catch (error) {
    console.error("Attendance calculation error:", error);
    return { absentDays: 0, absentDeduction: 0 };
  }
};