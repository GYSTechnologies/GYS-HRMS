// controllers/payroll.controller.js
import Payroll from "../models/payroll.js";
import Profile from "../models/profile.js";
import Attendance from "../models/attendance.js";
import { calculateAttendanceDeductions } from "../config/payrollCalculator.js";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

// HR monthly payroll create 
export const createMonthlyPayroll = async (req, res) => {
  try {
    const { employeeId, month, year, basic, hra, allowances, deductions, tax } = req.body;
    const hrId = req.user._id;

    // Check if payroll already exists for this month
    const existingPayroll = await Payroll.findOne({
      employee: employeeId,
      month: `${year}-${month.toString().padStart(2, '0')}`,
      year: year
    });

    if (existingPayroll) {
      return res.status(400).json({
        message: "Payroll already exists for this month"
      });
    }

    // Get employee profile
    const employee = await Profile.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Calculate attendance deductions
    const attendanceData = await calculateAttendanceDeductions(employeeId, month, year);
    
    // Calculate totals
    const totalAllowances = allowances.reduce((sum, item) => sum + (item.amount || 0), 0);
    const totalDeductions = deductions.reduce((sum, item) => sum + (item.amount || 0), 0) + tax + attendanceData.absentDeduction;
    const totalEarnings = basic + hra + totalAllowances;
    const netPay = totalEarnings - totalDeductions;

    // Create payroll
    const payroll = await Payroll.create({
      employee: employeeId,
      basic,
      hra,
      allowances,
      deductions,
      tax,
      month: `${year}-${month.toString().padStart(2, '0')}`,
      year,
      absentDays: attendanceData.absentDays,
      absentDeduction: attendanceData.absentDeduction,
      totalEarnings,
      totalDeductions,
      netPay,
      generatedBy: hrId,
      status: "draft"
    });

    const populatedPayroll = await Payroll.findById(payroll._id)
      .populate('employeeProfile')
      .populate('generatedByUser', 'email');

    res.status(201).json({
      message: "Payroll created successfully",
      data: populatedPayroll
    });

  } catch (error) {
    console.error("Create payroll error:", error);
    res.status(500).json({
      message: "Error creating payroll",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// Get payrolls (role-based access)
// export const getPayrolls = async (req, res) => {
//   try {
//     const { month, year, status, department } = req.query;
//     const userRole = req.user.role;

//     let query = {};

//     // Filter by month and year
//     if (month && year) {
//       query.month = `${year}-${month.toString().padStart(2, '0')}`;
//       query.year = parseInt(year);
//     }

//     // Filter by status
//     if (status) {
//       query.status = status;
//     }

//     // HR can only see their created payrolls
//     if (userRole === "hr") {
//       query.generatedBy = req.user._id;
//     }

//     // Filter by department
//     if (department) {
//       const employeesInDept = await Profile.find({ department }).select('_id');
//       query.employee = { $in: employeesInDept.map(emp => emp._id) };
//     }

//     const payrolls = await Payroll.find(query)
//       .populate('employeeProfile', 'firstName lastName employeeId department designation')
//       .populate('generatedByUser', 'email')
//       .populate('approvedByUser', 'email')
//       .sort({ createdAt: -1 });

//     res.status(200).json({
//       message: "Payrolls fetched successfully",
//       data: payrolls
//     });

//   } catch (error) {
//     console.error("Get payrolls error:", error);
//     res.status(500).json({
//       message: "Error fetching payrolls",
//       error: process.env.NODE_ENV === "development" ? error.message : undefined
//     });
//   }
// };

// HR edit  (only DRAFT status )
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

// Admin approve  (DRAFT → APPROVED)
export const approvePayroll = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, rejectionReason } = req.body; // action: 'approve' or 'reject'

    const payroll = await Payroll.findById(id);
    
    if (!payroll) {
      return res.status(404).json({ message: "Payroll not found" });
    }

    // Only DRAFT or PENDING_APPROVAL payrolls can be processed
    if (!["draft", "pending_approval"].includes(payroll.status)) {
      return res.status(400).json({ message: "Payroll cannot be processed in current status" });
    }

    if (action === "approve") {
      payroll.status = "approved";
      payroll.approvedBy = req.user._id;
      payroll.approvedAt = new Date();
      payroll.rejectionReason = undefined;
    } else if (action === "reject") {
      if (!rejectionReason) {
        return res.status(400).json({ message: "Rejection reason is required" });
      }
      payroll.status = "rejected";
      payroll.rejectionReason = rejectionReason;
      payroll.approvedBy = req.user._id;
      payroll.approvedAt = new Date();
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }

    const updatedPayroll = await payroll.save();
    const populatedPayroll = await Payroll.findById(updatedPayroll._id)
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

// Employee  approved payrolls
// export const getEmployeePayrolls = async (req, res) => {
//   try {
//     const { month, year } = req.query;
//     const employeeId = req.user.profileRef; // Assuming profileRef is stored in token

//     let query = {
//       employee: employeeId,
//       status: "approved"
//     };

//     if (month && year) {
//       query.month = `${year}-${month.toString().padStart(2, '0')}`;
//       query.year = parseInt(year);
//     }

//     const payrolls = await Payroll.find(query)
//       .populate('employeeProfile', 'firstName lastName employeeId department designation')
//       .sort({ month: -1 });

//     res.status(200).json({
//       message: "Payrolls fetched successfully",
//       data: payrolls
//     });

//   } catch (error) {
//     console.error("Get employee payrolls error:", error);
//     res.status(500).json({
//       message: "Error fetching payrolls",
//       error: process.env.NODE_ENV === "development" ? error.message : undefined
//     });
//   }
// };
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



//  Get latest payroll of an employee (HR only)
export const getLatestPayrollForEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const latestPayroll = await Payroll.findOne({ employee: employeeId })
      .sort({ createdAt: -1 });

    if (!latestPayroll) {
      return res.status(404).json({
        message: "No payroll found for this employee"
      });
    }

    res.status(200).json({
      message: "Latest payroll fetched successfully",
      data: latestPayroll
    });
  } catch (error) {
    console.error("Get latest payroll error:", error);
    res.status(500).json({
      message: "Error fetching latest payroll",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};




/* -------------------------
   Updated getPayrolls (add employee filter + safe populates)
   ------------------------- */
export const getPayrolls = async (req, res) => {
  try {
    const { month, year, status, department, employee } = req.query;
    const userRole = req.user.role;

    let query = {};

    // Filter by month and year
    if (month && year) {
      query.month = `${year}-${month.toString().padStart(2, '0')}`;
      query.year = parseInt(year);
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by specific employee (frontend sends employee id)
    if (employee) {
      // accept either string id or object form — convert to ObjectId if looks like one
      try {
        query.employee = mongoose.Types.ObjectId(employee);
      } catch (err) {
        query.employee = employee;
      }
    }

    // HR can only see their created payrolls (keeps existing behavior)
    if (userRole === "hr") {
      query.generatedBy = req.user._id;
    }

    // Filter by department
    if (department) {
      const employeesInDept = await Profile.find({ department }).select('_id');
      query.employee = { $in: employeesInDept.map(emp => emp._id) };
    }

    const payrolls = await Payroll.find(query)
      // try to populate both possible field names so frontend gets generatedBy email either way
      .populate('employeeProfile', 'firstName lastName employeeId department designation avatarUrl')
      .populate('generatedByUser', 'email')
      .populate('generatedBy', 'email')
      .populate('approvedByUser', 'email')
      .populate('approvedBy', 'email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Payrolls fetched successfully",
      data: payrolls
    });

  } catch (error) {
    console.error("Get payrolls error:", error);
    return res.status(500).json({
      message: "Error fetching payrolls",
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

/* -------------------------
   Get Payslip (download)
   GET /api/payroll/payslip/download/:id
   Expects payroll.payslipPath (filesystem path) OR payroll.payslipFilename
   ------------------------- */
export const getPayslip = async (req, res) => {
  try {
    const { id } = req.params;
    const payroll = await Payroll.findById(id)
      .populate('employeeProfile', 'firstName lastName employeeId');

    if (!payroll) {
      return res.status(404).json({ message: "Payroll not found" });
    }

    // check for path field (common names: payslipPath, payslipUrl, payslipFilename)
    const possiblePaths = [
      payroll.payslipPath,
      payroll.payslipUrl,
      payroll.payslipFilename,
      payroll.payslip // generic
    ].filter(Boolean);

    if (possiblePaths.length === 0) {
      return res.status(404).json({ message: "Payslip file not found for this payroll" });
    }

    // If path looks like URL (http(s)), redirect
    const firstPath = possiblePaths[0];
    if (/^https?:\/\//.test(firstPath)) {
      return res.redirect(firstPath);
    }

    // Assume it's a filesystem path relative to project root or absolute
    const absolutePath = path.isAbsolute(firstPath) ? firstPath : path.join(process.cwd(), firstPath);

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ message: "Payslip file missing on server" });
    }

    // Stream file with proper headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="payslip-${payroll._id}.pdf"`);

    const stream = fs.createReadStream(absolutePath);
    stream.pipe(res);
    stream.on('error', (err) => {
      console.error("Payslip stream error:", err);
      return res.status(500).end();
    });
  } catch (error) {
    console.error("Get payslip error:", error);
    return res.status(500).json({
      message: "Error fetching payslip",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};
