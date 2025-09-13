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
} from "../controllers/payroll.controller.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// HR monthly payroll create
router.post("/monthly", protect, authorizeRoles("hr"), createMonthlyPayroll);

// Get payrolls (HR/Admin )
router.get("/", protect, authorizeRoles("admin", "hr"), getPayrolls);

// Employee  approved payrolls
router.get("/employee/my-payrolls", protect, getEmployeePayrolls);
router.get(
  "/employee/:employeeId/latest",
  protect,
  authorizeRoles("hr"),
  getLatestPayrollForEmployee
);

// HR edit  (only DRAFT status )
router.put("/:id", protect, authorizeRoles("hr"), updatePayroll);

// Admin approve/reject
router.patch("/:id/approve", protect, authorizeRoles("admin"), approvePayroll);

// HR submit for approval
router.patch(
  "/:id/submit",
  protect,
  authorizeRoles("hr"),
  submitPayrollForApproval
);

// Payslip download (accessible to authenticated users)
router.get("/payslip/download/:id", protect, getPayslip);

export default router;
