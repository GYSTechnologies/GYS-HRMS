import express from "express";
import {
  createMonthlyPayroll,
  getPayrolls,
  updatePayroll,
  approvePayroll,
  getEmployeePayrolls,
  getLatestPayrollForEmployee,
  submitPayrollForApproval,
  getPayslip,
  generatePayslip,
  getPayrollById,
  downloadPayslip,
  checkPayrollExists,
  getPayrollPreview
} from "../controllers/payroll.controller.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// ======= Payslip Routes =======
router.get("/payslip/download/:id", protect, getPayslip);     
router.post("/:id/generate-payslip", protect, generatePayslip);
router.get("/payslip/:id", protect, downloadPayslip);

// ======= Employee Payroll Routes =======
router.get("/employee/my-payrolls", protect, getEmployeePayrolls);
router.get("/employee/:employeeId/exists", protect, checkPayrollExists);
router.get("/employee/:employeeId/latest", protect, authorizeRoles("hr"), getLatestPayrollForEmployee);


// ======= Payroll by ID Routes =======
router.get("/preview", protect, authorizeRoles("hr"), getPayrollPreview);
router.get("/:id", protect, getPayrollById);
router.put("/:id", protect, authorizeRoles("hr"), updatePayroll);
router.patch("/:id/approve", protect, authorizeRoles("admin"), approvePayroll);
router.patch("/:id/submit", protect, authorizeRoles("hr"), submitPayrollForApproval);

// ======= General / Monthly Payroll Routes =======
router.post("/monthly", protect, authorizeRoles("hr"), createMonthlyPayroll);
router.get("/", protect, authorizeRoles("admin", "hr"), getPayrolls);

export default router;
