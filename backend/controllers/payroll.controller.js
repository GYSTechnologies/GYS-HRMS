import Payroll from "../models/payroll.js";
import Profile from "../models/profile.js";
import Event from "../models/companyCalendar.js";
import Attendance from "../models/attendance.js";
import LeaveRequest from "../models/leaves.js";
import { calculateAttendanceDeductions } from "../config/payrollCalculator.js";
import Payslip from "../models/payslip.js";

import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";


// place at top of file near other helpers
const normalizeDayStart = (d) => {
  const dt = new Date(d);
  dt.setHours(0,0,0,0);
  return dt;
};

const formatKey = (d) => normalizeDayStart(d).toISOString().slice(0,10); // YYYY-MM-DD

// expand a holiday/event into all covered date keys (YYYY-MM-DD)
const expandEventDates = (event, cycleStart, cycleEnd) => {
  const start = normalizeDayStart(event.startDate) < normalizeDayStart(cycleStart) ? normalizeDayStart(cycleStart) : normalizeDayStart(event.startDate);
  const end = normalizeDayStart(event.endDate || event.startDate) > normalizeDayStart(cycleEnd) ? normalizeDayStart(cycleEnd) : normalizeDayStart(event.endDate || event.startDate);
  const dates = [];
  let cur = new Date(start);
  while (cur <= end) {
    dates.push(formatKey(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
};

const getDatesBetweenKeys = (startDate, endDate) => {
  const keys = [];
  let cur = normalizeDayStart(startDate);
  const e = normalizeDayStart(endDate);
  while (cur <= e) {
    keys.push(formatKey(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return keys;
};


// Utility to get all dates between two dates
const getDatesBetween = (startDate, endDate) => {
  const dates = [];
  let current = new Date(startDate);
  while (current <= endDate) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
};


export const createMonthlyPayroll = async (req, res) => {
  try {
    const {
      employeeId,
      month, // numeric 1–12
      year,
      basic,
      hra = 0,
      allowances = [],
      deductions = [],
      taxPercentage = 0,
    } = req.body;

    if (!employeeId || !month || !year) {
      return res.status(400).json({ message: "Employee, month, and year required" });
    }

    const employee = await Profile.findById(employeeId);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    // Payroll cycle: 8th current month -> 7th next month
    let cycleStart = normalizeDayStart(new Date(year, month - 1, 8));
    let cycleEnd = normalizeDayStart(new Date(year, month, 7));

    // If employee joined after cycle end -> no payroll for this cycle
    if (employee.dateOfJoining && normalizeDayStart(employee.dateOfJoining) > cycleEnd) {
      return res.status(200).json({ message: "Employee not in this payroll cycle (joined after cycle end)", data: null });
    }

    // Effective start/end for this employee (handles join/resign)
    const effectiveStart = normalizeDayStart(employee.dateOfJoining && normalizeDayStart(employee.dateOfJoining) > cycleStart ? employee.dateOfJoining : cycleStart);
    const effectiveEnd = employee.resignDate && normalizeDayStart(employee.resignDate) < cycleEnd ? normalizeDayStart(employee.resignDate) : cycleEnd;

    if (effectiveStart > effectiveEnd) {
      return res.status(200).json({ message: "No payable days for this employee in the cycle", data: null });
    }

    // All calendar date keys in the employee effective window
    const allDateKeys = getDatesBetweenKeys(effectiveStart, effectiveEnd); // array of YYYY-MM-DD
    const daysInCycle = getDatesBetweenKeys(cycleStart, cycleEnd).length; // denominator for per-day salary (8th->7th)
    if (daysInCycle <= 0) return res.status(500).json({ message: "Invalid cycle days" });

    // Fetch holidays/events in range & expand them to date keys
    const holidays = await Event.find({
      startDate: { $lte: cycleEnd },
      endDate: { $gte: cycleStart },
      isHoliday: true,
    });

    const holidaySet = new Set();
    holidays.forEach(h => {
      expandEventDates(h, cycleStart, cycleEnd).forEach(k => holidaySet.add(k));
    });

    // Fetch approved leaves that intersect employee effective window
    const leaveRequests = await LeaveRequest.find({
      employee: employeeId,
      status: "approved",
      $or: [
        { fromDate: { $lte: effectiveEnd, $gte: effectiveStart } },
        { toDate: { $lte: effectiveEnd, $gte: effectiveStart } },
        { fromDate: { $lte: effectiveStart }, toDate: { $gte: effectiveEnd } }
      ]
    });

    const leaveSet = new Set();
    leaveRequests.forEach(leave => {
      const start = normalizeDayStart(leave.fromDate) < effectiveStart ? effectiveStart : normalizeDayStart(leave.fromDate);
      const end = normalizeDayStart(leave.toDate) > effectiveEnd ? effectiveEnd : normalizeDayStart(leave.toDate);
      let cur = new Date(start);
      while (cur <= end) {
        leaveSet.add(formatKey(cur));
        cur.setDate(cur.getDate() + 1);
      }
    });

    // Fetch attendance in effective window. We'll interpret a record as PRESENT only if:
    // - attendance.status === "accepted" OR checkIn exists (your policy). Adjust below as needed.
    const attendances = await Attendance.find({
      employee: employeeId,
      date: { $gte: effectiveStart, $lte: effectiveEnd }
    });

    // Build a map of attendance by date key (only accepted/present)
    const attendanceMap = new Map();
    attendances.forEach(a => {
      const key = formatKey(a.date);
      // decide presence: require status === 'accepted' OR checkIn exists
      const isPresent = (a.status && a.status === "accepted") || (!!a.checkIn);
      if (isPresent) attendanceMap.set(key, a);
    });

    // Iterate each date in the employee effective window and compute counters
    let paidDays = 0;
    let presentDays = 0;
    let leaveDays = 0;
    let absentDays = 0;
    let workingDaysCount = 0; // number of working days (non-sunday, non-holiday) *inside effective window*

    for (const key of allDateKeys) {
      const d = new Date(key + "T00:00:00"); // local midnight
      const isSunday = d.getDay() === 0;
      const isHoliday = holidaySet.has(key);

      // If date is outside cycle working zone but inside effective window (shouldn't happen) - skip
      // Evaluate working day
      const isWorkingDay = !isSunday && !isHoliday;
      if (isWorkingDay) workingDaysCount++;

      if (isHoliday || isSunday) {
        // Paid automatically
        paidDays++;
        continue;
      }

      // Not holiday/sunday => working day
      // Check attendance
      if (attendanceMap.has(key)) {
        presentDays++;
        paidDays++;
        continue;
      }

      // Check approved leave
      if (leaveSet.has(key)) {
        leaveDays++;
        paidDays++;
        continue;
      }

      // Otherwise unpaid/absent
      absentDays++;
    }

    // Per-day salary uses full cycle days (8th->7th)
    const perDaySalary = Number(basic) / daysInCycle;
    const absentDeduction = perDaySalary * absentDays;

    const totalAllowances = Array.isArray(allowances) ? allowances.reduce((acc, a) => acc + Number(a.amount || 0), 0) : 0;
    const totalDeductionsFromInput = Array.isArray(deductions) ? deductions.reduce((acc, d) => acc + Number(d.amount || 0), 0) : 0;
    const taxValue = Math.round(Number(basic) * (Number(taxPercentage || 0) / 100));

    const totalEarnings = Number(basic) + Number(hra || 0) + totalAllowances;
    const totalDeductions = Math.round(absentDeduction + totalDeductionsFromInput + taxValue);
    const netPay = Math.round(totalEarnings - totalDeductions);

    const payroll = await Payroll.create({
      employee: employeeId,
      basic: Number(basic),
      hra: Number(hra || 0),
      allowances: allowances || [],
      deductions: deductions || [],
      tax: taxValue,
      month: `${year}-${String(month).padStart(2, "0")}`,
      year,
      absentDays,
      absentDeduction: Math.round(absentDeduction),
      presentDays,
      leaveDays,
      workingDays: workingDaysCount,
      totalEarnings: Math.round(totalEarnings),
      totalDeductions: Math.round(totalDeductions),
      netPay,
      generatedBy: req.user._id,
      status: "draft"
    });

    return res.status(201).json({
      message: "Payroll created successfully",
      data: payroll
    });

  } catch (error) {
    console.error("Payroll creation error:", error);
    return res.status(500).json({
      message: "Error creating payroll",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};



export const getLatestPayrollForEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const latestPayroll = await Payroll.findOne({ employee: employeeId }).sort({ createdAt: -1 });
    if (!latestPayroll) return res.status(404).json({ message: "No payroll found for this employee" });

    res.status(200).json({
      message: "Latest payroll fetched successfully",
      data: latestPayroll
    });
  } catch (error) {
    console.error("Get latest payroll error:", error);
    res.status(500).json({ message: "Error fetching latest payroll", error: process.env.NODE_ENV === "development" ? error.message : undefined });
  }
};

export const checkPayrollExists = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { month, year } = req.query;
    if (!month || !year) return res.status(400).json({ message: "Month and year required" });

    const monthKey = `${year}-${String(month).padStart(2, '0')}`;
const exists = await Payroll.exists({ employee: employeeId, month: monthKey });


    // const exists = await Payroll.exists({ employee: employeeId, month: Number(month), year: Number(year) });
    res.status(200).json({ exists: !!exists });
  } catch (error) {
    console.error("Check payroll error:", error);
    res.status(500).json({ message: "Error checking payroll", error: process.env.NODE_ENV === "development" ? error.message : undefined });
  }
};


export const getPayrollPreview = async (req, res) => {
  try {
    let {
      employeeId,
      month,
      year,
      basic = 30000,
      hra = 0,
      allowances = '[]',
      deductions = '[]',
      taxPercentage = 0
    } = req.query;

    // parse allowances/deductions from query string to arrays
    try {
      allowances = JSON.parse(allowances);
      deductions = JSON.parse(deductions);
    } catch (err) {
      return res.status(400).json({ message: "Allowances or deductions are not valid JSON arrays" });
    }

    if (!employeeId || !month || !year) {
      return res.status(400).json({ message: "Employee, month, and year required" });
    }

    const employee = await Profile.findById(employeeId);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    let cycleStart = normalizeDayStart(new Date(year, month - 1, 8));
    let cycleEnd = normalizeDayStart(new Date(year, month, 7));

    if (employee.dateOfJoining && normalizeDayStart(employee.dateOfJoining) > cycleStart) {
      cycleStart = normalizeDayStart(employee.dateOfJoining);
    }

    if (employee.dateOfJoining && normalizeDayStart(employee.dateOfJoining) > cycleEnd) {
      return res.status(200).json({ message: "Employee not in this payroll cycle", data: null });
    }

    const allDatesKeys = getDatesBetweenKeys(cycleStart, cycleEnd);
    const daysInCycle = allDatesKeys.length;

    // Expand holidays
    const holidays = await Event.find({
      startDate: { $lte: cycleEnd },
      endDate: { $gte: cycleStart },
      isHoliday: true,
    });
    const holidaySet = new Set();
    holidays.forEach(h => expandEventDates(h, cycleStart, cycleEnd).forEach(k => holidaySet.add(k)));

    // Leaves
    const leaveRequests = await LeaveRequest.find({
      employee: employeeId,
      status: "approved",
      $or: [
        { fromDate: { $lte: cycleEnd, $gte: cycleStart } },
        { toDate: { $lte: cycleEnd, $gte: cycleStart } },
        { fromDate: { $lte: cycleStart }, toDate: { $gte: cycleEnd } }
      ]
    });
    const leaveSet = new Set();
    leaveRequests.forEach(leave => {
      const start = normalizeDayStart(leave.fromDate) < cycleStart ? cycleStart : normalizeDayStart(leave.fromDate);
      const end = normalizeDayStart(leave.toDate) > cycleEnd ? cycleEnd : normalizeDayStart(leave.toDate);
      let cur = new Date(start);
      while (cur <= end) {
        leaveSet.add(formatKey(cur));
        cur.setDate(cur.getDate() + 1);
      }
    });

    // Attendance
    const attendances = await Attendance.find({
      employee: employeeId,
      date: { $gte: cycleStart, $lte: cycleEnd }
    });
    const attendanceMap = new Set();
    attendances.forEach(a => {
      const key = formatKey(a.date);
      const isPresent = (a.status && a.status === "accepted") || (!!a.checkIn);
      if (isPresent) attendanceMap.add(key);
    });

    // Now iterate and compute preview numbers
    let paidDays = 0;
    let presentDays = 0;
    let leaveDays = 0;
    let absentDays = 0;
    let workingDays = 0;

    for (const key of allDatesKeys) {
      const d = new Date(key + "T00:00:00");
      const isSunday = d.getDay() === 0;
      const isHoliday = holidaySet.has(key);
      const isWorkingDay = !isSunday && !isHoliday;
      if (isWorkingDay) workingDays++;

      if (isHoliday || isSunday) {
        paidDays++;
        continue;
      }

      if (attendanceMap.has(key)) {
        presentDays++;
        paidDays++;
        continue;
      }

      if (leaveSet.has(key)) {
        leaveDays++;
        paidDays++;
        continue;
      }

      absentDays++;
    }

    const perDaySalary = Number(basic) / daysInCycle;
    const absentDeduction = perDaySalary * absentDays;
    const totalAllowances = Array.isArray(allowances) ? allowances.reduce((acc, a) => acc + Number(a.amount || 0), 0) : 0;
    const totalDeductionsFromInput = Array.isArray(deductions) ? deductions.reduce((acc, d) => acc + Number(d.amount || 0), 0) : 0;
    const taxValue = Math.round(Number(basic) * (Number(taxPercentage || 0) / 100));
    const totalEarnings = Number(basic) + Number(hra || 0) + totalAllowances;
    const totalDeductions = Math.round(absentDeduction + totalDeductionsFromInput + taxValue);
    const netPay = Math.round(totalEarnings - totalDeductions);

    res.status(200).json({
      cycleDays: daysInCycle,
      sundaysHolidays: daysInCycle - workingDays,
      workingDays,
      approvedLeaves: leaveDays,
      presentDays,
      absent: absentDays,
      absentDeduction: Math.round(absentDeduction),
      totalEarnings: Math.round(totalEarnings),
      totalDeductions: Math.round(totalDeductions),
      payableSalary: Math.round(netPay),
    });

  } catch (error) {
    console.error("Payroll preview error:", error);
    res.status(500).json({
      message: "Error generating payroll preview",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};


export const updatePayroll = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const payroll = await Payroll.findById(id);
    
    if (!payroll) {
      return res.status(404).json({ message: "Payroll not found" });
    }

    // Only DRAFT payrolls can be edited
    if (payroll.status !== "draft") {
      return res.status(400).json({ message: "Only draft payrolls can be edited" });
    }

    // Only HR who created it can edit
    if (payroll.generatedBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to edit this payroll" });
    }

    // Recalculate totals if financial fields are updated
    if (updates.basic || updates.hra || updates.allowances || updates.deductions || updates.tax) {
      const totalAllowances = (updates.allowances || payroll.allowances)
        .reduce((sum, item) => sum + (item.amount || 0), 0);
      
      const totalDeductions = (updates.deductions || payroll.deductions)
        .reduce((sum, item) => sum + (item.amount || 0), 0) + 
        (updates.tax || payroll.tax) + 
        payroll.absentDeduction;

      const totalEarnings = (updates.basic || payroll.basic) + 
                           (updates.hra || payroll.hra) + 
                           totalAllowances;

      updates.totalEarnings = totalEarnings;
      updates.totalDeductions = totalDeductions;
      updates.netPay = totalEarnings - totalDeductions;
    }

    const updatedPayroll = await Payroll.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    )
    .populate('employeeProfile', 'firstName lastName employeeId department designation')
    .populate('generatedByUser', 'email');

    res.status(200).json({
      message: "Payroll updated successfully",
      data: updatedPayroll
    });

  } catch (error) {
    console.error("Update payroll error:", error);
    res.status(500).json({
      message: "Error updating payroll",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};



// Employee  approved payrolls
export const getEmployeePayrolls = async (req, res) => {
  
  try {
    const { month, year } = req.query;
    const employeeId = req.user.profileRef?._id || req.user.profileRef; 
    // Agar populate hua hai to object hoga, warna direct id hogi

    let query = {
      employee: employeeId,
      status: "approved"
    };

    if (month && year) {
      query.month = `${year}-${month.toString().padStart(2, '0')}`;
      query.year = parseInt(year);
    }

    const payrolls = await Payroll.find(query)
      .populate('employeeProfile', 'firstName lastName employeeId department designation')
      .sort({ month: -1 });

    res.status(200).json({
      message: "Payrolls fetched successfully",
      data: payrolls
    });

  } catch (error) {
    console.error("Get employee payrolls error:", error);
    res.status(500).json({
      message: "Error fetching payrolls",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};


export const getPayrolls = async (req, res) => {
  try {
    const { month, year, status, department, employee, fullData } = req.query;
    const userRole = req.user.role;

    let query = {};

    // Month & Year
    if (month && year) {
      query.month = `${year}-${month.toString().padStart(2, "0")}`;
      query.year = parseInt(year);
    }

    // Status
    if (status) query.status = status;

    // Employee + Department combined safely
    let employeeIds = [];
    if (department) {
      const deptEmps = await Profile.find({ department }).select("_id");
      employeeIds = deptEmps.map((e) => e._id);
    }
    if (employee) {
      try {
        employeeIds.push(mongoose.Types.ObjectId(employee));
      } catch {
        employeeIds.push(employee);
      }
    }
    if (employeeIds.length > 0) {
      query.employee = { $in: employeeIds };
    }

    // HR restriction
    if (userRole === "hr") query.generatedBy = req.user._id;

    // Fetch payrolls with proper population
    const payrolls = await Payroll.find(query)
      .populate({
        path: "employee",
        select: "firstName lastName employeeId avatarUrl user",
        populate: { 
          path: "user", 
          select: "email" 
        }
      })
      .populate({ 
        path: "generatedBy", 
        select: "email firstName lastName" 
      })
      .populate({ 
        path: "approvedBy", 
        select: "email firstName lastName" 
      })
      .sort({ createdAt: -1 });

    // Format the response
    const formattedPayrolls = payrolls.map((p) => ({
      _id: p._id,
      employee: {
        _id: p.employee?._id,
        firstName: p.employee?.firstName || null,
        lastName: p.employee?.lastName || null,
        employeeId: p.employee?.employeeId || null,
        avatarUrl: p.employee?.avatarUrl || null,
        email: p.employee?.user?.email || null,
      },
      status: p.status,
      generatedBy: p.generatedBy?.email || null,
      approvedBy: p.approvedBy?.email || null,
      month: p.month,
      year: p.year,
      netPay: p.netPay,
      totalEarnings: p.totalEarnings,
      totalDeductions: p.totalDeductions,
      // Modal ke liye required fields
      basic: p.basic,
      hra: p.hra,
      tax: p.tax,
      allowances: p.allowances,
      deductions: p.deductions,
      rejectionReason: p.rejectionReason,
      generatedAt: p.createdAt,
      // Employee profile for modal title
      employeeProfile: {
        firstName: p.employee?.firstName || null,
        lastName: p.employee?.lastName || null,
        employeeId: p.employee?.employeeId || null,
      }
    }));

    return res.status(200).json({
      message: "Payrolls fetched successfully",
      data: formattedPayrolls,
    });
  } catch (error) {
    console.error("Get payrolls error:", error);
    return res.status(500).json({
      message: "Error fetching payrolls",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
export const getPayrollById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const payroll = await Payroll.findById(id)
      .populate('employeeProfile', 'firstName lastName employeeId department designation avatarUrl')
      .populate('generatedByUser', 'email')
      .populate('approvedByUser', 'email');

    if (!payroll) {
      return res.status(404).json({ message: "Payroll not found" });
    }

    res.status(200).json({
      message: "Payroll fetched successfully",
      data: payroll
    });
  } catch (error) {
    console.error("Get payroll error:", error);
    res.status(500).json({
      message: "Error fetching payroll",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

/* -------------------------
   Submit payroll for approval (HR)
   PATCH /api/payroll/:id/submit
   ------------------------- */
export const submitPayrollForApproval = async (req, res) => {
  try {
    const { id } = req.params;

    const payroll = await Payroll.findById(id);
    if (!payroll) {
      return res.status(404).json({ message: "Payroll not found" });
    }

    // Only DRAFT payrolls can be submitted
    if (payroll.status !== "draft") {
      return res.status(400).json({ message: "Only draft payrolls can be submitted for approval" });
    }

    // Only HR who created it (or admin) can submit
    if (payroll.generatedBy && payroll.generatedBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to submit this payroll" });
    }

    payroll.status = "pending_approval";
    payroll.submittedAt = new Date();

    const saved = await payroll.save();

    const populated = await Payroll.findById(saved._id)
      .populate('employeeProfile', 'firstName lastName employeeId department designation avatarUrl')
      .populate('generatedByUser', 'email')
      .populate('generatedBy', 'email');

    return res.status(200).json({
      message: "Payroll submitted for approval",
      data: populated
    });
  } catch (error) {
    console.error("Submit payroll error:", error);
    return res.status(500).json({
      message: "Error submitting payroll",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};


   // controllers/payroll.controller.js

export const getPayslip = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("📥 Download request for payroll ID:", id);

    const payroll = await Payroll.findById(id)
      .populate('employeeProfile', 'firstName lastName employeeId');

    if (!payroll) {
      console.log("❌ Payroll not found in database");
      return res.status(404).json({ message: "Payroll not found" });
    }

    console.log("✅ Payroll found:", payroll.employeeProfile.employeeId);

    if (!payroll.payslipPath) {
      console.log("❌ No payslipPath in payroll document");
      return res.status(404).json({ message: "Payslip not generated yet" });
    }

    // Resolve absolute path
    let filePath = payroll.payslipPath;
    if (!path.isAbsolute(filePath)) {
      filePath = path.join(process.cwd(), filePath.replace(/^\/+/, "")); // remove leading slash
    }

    console.log("🔍 Absolute file path:", filePath);

    if (!fs.existsSync(filePath)) {
      console.log("❌ File not found on server");
      return res.status(404).json({ message: "Payslip file missing on server" });
    }

    // Set headers and stream PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="payslip-${payroll.employeeProfile.employeeId}-${payroll.month}.pdf"`);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on("error", (err) => {
      console.error("❌ Stream error:", err);
      res.status(500).json({ message: "Error streaming file" });
    });

    fileStream.on("end", () => {
      console.log("✅ File streamed successfully");
    });

  } catch (error) {
    console.error("❌ Get payslip error:", error);
    res.status(500).json({
      message: "Error fetching payslip",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const generatePayslip = async (req, res) => {
  try {
    const { id } = req.params; // payrollId
    console.log("Generating payslip for payroll ID:", id);

    const payroll = await Payroll.findById(id)
      .populate("employeeProfile", "firstName lastName employeeId department designation")
      .populate("generatedByUser", "email");

    if (!payroll) {
      console.log("Payroll not found with ID:", id);
      return res.status(404).json({ message: "Payroll not found" });
    }

    console.log("Payroll found for employee:", payroll.employeeProfile.employeeId);

    // Check if payslip already exists
    const existingPayslip = await Payslip.findOne({ payrollRef: id });
    if (existingPayslip) {
      console.log("Payslip already exists");
      return res.status(400).json({ message: "Payslip already generated" });
    }

    // Create PDF document
    const doc = new PDFDocument();
    const fileName = `payslip-${payroll.employeeProfile.employeeId}-${payroll.month}.pdf`;
    const filePath = path.join(process.cwd(), "uploads", "payslips", fileName);

    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    // Fill PDF content
    doc.fontSize(20).text("PAYSLIP", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Employee: ${payroll.employeeProfile.firstName} ${payroll.employeeProfile.lastName}`);
    doc.text(`Employee ID: ${payroll.employeeProfile.employeeId}`);
    doc.text(`Department: ${payroll.employeeProfile.department}`);
    doc.text(`Designation: ${payroll.employeeProfile.designation}`);
    doc.text(`Period: ${payroll.month}-${payroll.year}`);
    doc.moveDown();

    doc.fontSize(14).text("EARNINGS", { underline: true });
    doc.text(`Basic Salary: ₹${payroll.basic.toLocaleString()}`);
    doc.text(`HRA: ₹${payroll.hra.toLocaleString()}`);
    payroll.allowances.forEach(a => doc.text(`${a.title}: ₹${a.amount.toLocaleString()}`));
    doc.text(`Total Earnings: ₹${payroll.totalEarnings.toLocaleString()}`);
    doc.moveDown();

    doc.fontSize(14).text("DEDUCTIONS", { underline: true });
    doc.text(`Tax: ₹${payroll.tax.toLocaleString()}`);
    payroll.deductions.forEach(d => doc.text(`${d.title}: ₹${d.amount.toLocaleString()}`));
    if (payroll.absentDeduction > 0) {
      doc.text(`Absent Deduction (${payroll.absentDays} days): ₹${payroll.absentDeduction.toLocaleString()}`);
    }
    doc.text(`Total Deductions: ₹${payroll.totalDeductions.toLocaleString()}`);
    doc.moveDown();

    doc.fontSize(16).text(`NET PAY: ₹${payroll.netPay.toLocaleString()}`, { align: "center" });
    doc.moveDown();
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`);
    doc.text(`Status: ${payroll.status.toUpperCase()}`);

    // PDF generation helper
    const createPdf = (doc, filePath) => {
      return new Promise((resolve, reject) => {
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);
        doc.end();
        stream.on("finish", resolve);
        stream.on("error", reject);
      });
    };

    // Wait for PDF to be written
    await createPdf(doc, filePath);

    console.log("PDF created successfully, saving to database...");

    // Save payslip in DB
    const payslip = await Payslip.create({
      payrollRef: id,
      employee: payroll.employee,
      month: payroll.month,
      pdfUrl: `/uploads/payslips/${fileName}`,
    });

    // Update payroll with payslipPath
    payroll.payslipPath = `/uploads/payslips/${fileName}`;
    await payroll.save();

    console.log("Payroll updated with payslip path and Payslip record created");

    res.status(201).json({
      message: "Payslip generated successfully",
      data: {
        payslipId: payslip._id,
        downloadUrl: `/api/payroll/payslip/download/${id}`,
      },
    });

  } catch (error) {
    console.error("Generate payslip error:", error);
    res.status(500).json({
      message: "Error generating payslip",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};


// Admin approves payroll + AUTO-GENERATE PAYSLIP

export const downloadPayslip = async (req, res) => {
  try {
    const { id } = req.params;

    const payroll = await Payroll.findById(id)
      .populate("employeeProfile", "firstName lastName employeeId department designation")
      .populate("generatedByUser", "name email")
      .populate("approvedByUser", "name email");

    if (!payroll) {
      return res.status(404).json({ message: "Payroll not found" });
    }

    // ✅ Create PDF
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const fileName = `payslip-${payroll.employeeProfile.employeeId}-${payroll.month}.pdf`;
    const filePath = path.join(process.cwd(), "uploads", "payslips", fileName);

    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // ========== HEADER ==========
    doc.fontSize(20).font("Helvetica-Bold").fillColor("#000")
      .text("GYS TECHNOLOGIES PVT. LTD", { align: "center" });
    doc.fontSize(10).fillColor("#555")
      .text("Innovating Tomorrow, Today", { align: "center" });
    doc.moveDown(0.3);
    doc.fontSize(9).fillColor("#333")
      .text("H N C 1 Sayam Enklavya, Haridwar, Dehradun, Uttarakhand, India - 249401", { align: "center" });
    doc.text("Phone: +91-8273370028 | Email: info@gystechnologies.com", { align: "center" });

    doc.moveDown(0.5);
    doc.strokeColor("#000").lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1);

    // ========= TITLE =========
    doc.fontSize(16).font("Helvetica-Bold").fillColor("#000")
      .text("SALARY PAYSLIP", { align: "center" });
    doc.moveDown(0.5);

    const monthNames = [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December"
    ];
    const [year, month] = payroll.month.split("-");
    const monthName = monthNames[parseInt(month) - 1];
    doc.fontSize(10).font("Helvetica-Oblique").fillColor("#444")
      .text(`Payment Period: ${monthName} ${year}`, { align: "center" });
    doc.moveDown(1);

    // ========= EMPLOYEE / COMPANY DETAILS =========
    const tableTop = doc.y;
    const tableLeft = 50;
    const tableWidth = 500;

    // Table headers
    doc.font("Helvetica-Bold").fontSize(10).fillColor("#000");
    doc.text("EMPLOYEE DETAILS", tableLeft + 10, tableTop);
    doc.text("COMPANY DETAILS", tableLeft + 260, tableTop);

    doc.font("Helvetica").fontSize(9).fillColor("#000");
    doc.text(`Name: ${payroll.employeeProfile.firstName} ${payroll.employeeProfile.lastName}`, tableLeft + 10, tableTop + 20);
    doc.text(`ID: ${payroll.employeeProfile.employeeId}`, tableLeft + 10, tableTop + 35);
    doc.text(`Dept: ${payroll.employeeProfile.department}`, tableLeft + 10, tableTop + 50);
    doc.text(`Designation: ${payroll.employeeProfile.designation}`, tableLeft + 10, tableTop + 65);

    doc.text("GYS Technologies Pvt. Ltd.", tableLeft + 260, tableTop + 20);
    doc.text("Registered Office:", tableLeft + 260, tableTop + 35);
    doc.text("H N C 1 Sayam Enklavya,", tableLeft + 260, tableTop + 50);
    doc.text("Haridwar, Dehradun, Uttarakhand 249401", tableLeft + 260, tableTop + 65);

    doc.moveTo(tableLeft, tableTop + 85).lineTo(tableLeft + tableWidth, tableTop + 85)
      .strokeColor("#aaa").lineWidth(0.5).stroke();
    doc.moveDown(2);

    // ========= EARNINGS =========
    doc.font("Helvetica-Bold").fontSize(11).fillColor("#000")
      .text("EARNINGS", tableLeft + 10, doc.y);
    doc.text("AMOUNT (₹)", tableLeft + 400, doc.y);

    let currentY = doc.y + 15;
    doc.font("Helvetica").fontSize(10).fillColor("#000");

    doc.text("Basic Salary", tableLeft + 10, currentY);
    doc.text(payroll.basic.toLocaleString("en-IN"), tableLeft + 400, currentY, { align: "right" });
    currentY += 15;

    doc.text("House Rent Allowance (HRA)", tableLeft + 10, currentY);
    doc.text(payroll.hra.toLocaleString("en-IN"), tableLeft + 400, currentY, { align: "right" });
    currentY += 15;

    payroll.allowances.forEach((a) => {
      doc.text(a.title, tableLeft + 10, currentY);
      doc.text(a.amount.toLocaleString("en-IN"), tableLeft + 400, currentY, { align: "right" });
      currentY += 15;
    });

    doc.moveTo(tableLeft, currentY).lineTo(tableLeft + tableWidth, currentY).strokeColor("#000").lineWidth(0.5).stroke();
    currentY += 10;

    doc.font("Helvetica-Bold").text("TOTAL EARNINGS", tableLeft + 10, currentY);
    doc.text(payroll.totalEarnings.toLocaleString("en-IN"), tableLeft + 400, currentY, { align: "right" });
    currentY += 25;

    // ========= DEDUCTIONS =========
    doc.font("Helvetica-Bold").fontSize(11).fillColor("#000")
      .text("DEDUCTIONS", tableLeft + 10, currentY);
    doc.text("AMOUNT (₹)", tableLeft + 400, currentY);

    currentY += 15;
    doc.font("Helvetica").fontSize(10).fillColor("#000");

    doc.text("Professional Tax", tableLeft + 10, currentY);
    doc.text(payroll.tax.toLocaleString("en-IN"), tableLeft + 400, currentY, { align: "right" });
    currentY += 15;

    if (payroll.absentDeduction > 0) {
      doc.text(`Absent Deduction (${payroll.absentDays} days)`, tableLeft + 10, currentY);
      doc.text(`-${payroll.absentDeduction.toLocaleString("en-IN")}`, tableLeft + 400, currentY, { align: "right" });
      currentY += 15;
    }

    payroll.deductions.forEach((d) => {
      doc.text(d.title, tableLeft + 10, currentY);
      doc.text(`-${d.amount.toLocaleString("en-IN")}`, tableLeft + 400, currentY, { align: "right" });
      currentY += 15;
    });

    doc.moveTo(tableLeft, currentY).lineTo(tableLeft + tableWidth, currentY).strokeColor("#000").lineWidth(0.5).stroke();
    currentY += 10;

    doc.font("Helvetica-Bold").text("TOTAL DEDUCTIONS", tableLeft + 10, currentY);
    doc.text(`-${payroll.totalDeductions.toLocaleString("en-IN")}`, tableLeft + 400, currentY, { align: "right" });
    currentY += 25;

    // ========= NET PAY =========
    doc.font("Helvetica-Bold").fontSize(12).fillColor("#000")
      .text("NET PAY", tableLeft + 10, currentY);
    doc.text(`₹${payroll.netPay.toLocaleString("en-IN")}`, tableLeft + 400, currentY, { align: "right" });
    currentY += 30;

    // ========= APPROVAL =========
    doc.font("Helvetica").fontSize(9).fillColor("#555");
    if (payroll.approvedByUser) {
      doc.text(`Approved By: ${payroll.approvedByUser.name} (${payroll.approvedByUser.email})`, tableLeft, currentY);
      doc.text(`Approval Date: ${new Date(payroll.approvedAt).toLocaleDateString("en-IN")}`, tableLeft, currentY + 12);
      currentY += 30;
    }

    // ========= FOOTER =========
    doc.moveDown(1);
    doc.strokeColor("#aaa").lineWidth(0.5).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    doc.font("Helvetica").fontSize(8).fillColor("#777")
      .text("This is a computer generated payslip and does not require signature.", { align: "center" });
    doc.text(`Generated on: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}`, { align: "center" });
    doc.text(`Status: ${payroll.status.toUpperCase()}`, { align: "center" });

    doc.moveDown(0.5);
    doc.fontSize(7).fillColor("#aaa")
      .text(`Payroll ID: ${payroll._id} • Employee ID: ${payroll.employeeProfile.employeeId}`, { align: "center" });

    doc.end();

    await new Promise((resolve, reject) => {
      stream.on("finish", resolve);
      stream.on("error", reject);
    });

    payroll.payslipPath = `/uploads/payslips/${fileName}`;
    await payroll.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    fs.createReadStream(filePath).pipe(res);

  } catch (error) {
    console.error("Download payslip error:", error);
    res.status(500).json({ message: "Error generating payslip" });
  }
};



export const approvePayroll = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, rejectionReason } = req.body;

    const payroll = await Payroll.findById(id)
      .populate("employeeProfile", "firstName lastName employeeId department designation")
      .populate("generatedByUser", "email");

    if (!payroll) {
      return res.status(404).json({ message: "Payroll not found" });
    }

    if (!["draft", "pending_approval"].includes(payroll.status)) {
      return res.status(400).json({ message: "Payroll cannot be processed in current status" });
    }

    if (action === "approve") {
      // ✅ GET FRESH ATTENDANCE DATA WITH LEAVES
      const [year, month] = payroll.month.split('-');
      const attendanceData = await calculateAttendanceDeductions(
        payroll.employee, 
        parseInt(month), 
        parseInt(year)
      );

      // ✅ UPDATE PAYROLL WITH LATEST DATA
      payroll.absentDays = attendanceData.absentDays;
      payroll.absentDeduction = attendanceData.absentDeduction;
      payroll.presentDays = attendanceData.presentDays;
      payroll.leaveDays = attendanceData.leaveDays; // ✅ NEW: Leave days
      payroll.workingDays = attendanceData.totalWorkingDays; // ✅ CHANGED: workingDays

      // ✅ RECALCULATE TOTALS
      const totalAllowances = payroll.allowances.reduce((sum, item) => sum + (item.amount || 0), 0);
      const totalDeductions = payroll.deductions.reduce((sum, item) => sum + (item.amount || 0), 0) + 
                            payroll.tax + payroll.absentDeduction;
      const totalEarnings = payroll.basic + payroll.hra + totalAllowances;
      
      payroll.totalEarnings = totalEarnings;
      payroll.totalDeductions = totalDeductions;
      payroll.netPay = totalEarnings - totalDeductions;

      payroll.status = "approved";
      payroll.approvedBy = req.user._id;
      payroll.approvedAt = new Date();
      payroll.rejectionReason = undefined;

      // ✅ SAVE UPDATED PAYROLL
      await payroll.save();

      // ✅ GENERATE PAYSLIP (tumhara existing code yahan rahega)
      // ... [REST OF YOUR EXISTING PAYSLIP CODE] ...

    } else if (action === "reject") {
      // ... [YOUR EXISTING REJECTION CODE] ...
    }

    const populatedPayroll = await Payroll.findById(payroll._id)
      .populate('employeeProfile', 'firstName lastName employeeId department designation')
      .populate('generatedByUser', 'email')
      .populate('approvedByUser', 'email');

    res.status(200).json({
      message: `Payroll ${action}ed successfully`,
      data: populatedPayroll
    });

  } catch (error) {
    console.error("Approve payroll error:", error);
    res.status(500).json({
      message: "Error processing payroll",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};