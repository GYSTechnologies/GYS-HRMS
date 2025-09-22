import express from "express";
import {
  getEmployeeDashboardStats,
  getAttendanceSummary,
  checkOut,
  getLeaveBalance,
  getTaskSummary,
  getPayrollSummary,

  //hr
  getHRDashboardStats,
  getTodaysAttendanceLog,
  approveAttendance,
  getPendingApprovals,
  getDepartmentStats,

  //admin
  getAdminDashboardStats,
  getTodaysDetailedAttendance,
  getSystemOverview,
  approveAttendanceByAdmin
} from "../controllers/dashboard.controller.js";
import { protect } from "../middleware/authMiddleware.js";
import { rejectAttendance } from "../controllers/attendance.controller.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// Employee Dashboard Routes
router.get("/employee/stats", getEmployeeDashboardStats);
router.get("/employee/attendance-summary", getAttendanceSummary);
router.get("/employee/leave-balance", getLeaveBalance);
router.get("/employee/task-summary", getTaskSummary);
router.get("/employee/payroll-summary", getPayrollSummary);
router.post("/employee/checkout", checkOut);

// HR Dashboard Routes
router.get("/hr/stats", getHRDashboardStats);
router.get("/hr/attendance-log", getTodaysAttendanceLog);
router.get("/hr/pending-approvals", getPendingApprovals);
router.get("/hr/department-stats", getDepartmentStats);
router.patch("/hr/approve-attendance/:attendanceId", approveAttendance);


// Admin Dashboard Routes (add to existing routes)
router.get('/admin/stats', getAdminDashboardStats);
router.get('/admin/attendance-log', getTodaysDetailedAttendance);
router.get('/admin/system-overview', getSystemOverview);
// Approve / Reject Attendance
router.patch('/admin/approve-attendance/:id', approveAttendanceByAdmin);
router.patch('/admin/reject-attendance/:id', rejectAttendance);


export default router;
