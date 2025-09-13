// import express from "express";
// import {
//   employeeLogin,
//   employeeLogout,
//   getPendingAttendances,
//   approveAttendance,
//   rejectAttendance,
//   getAllAttendanceForAdmin,
//   getTodayAttendance,
//   getAttendanceHistory,
//   getAttendanceStats
// } from "../controllers/attendance.controller.js";
// import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

// const router = express.Router();

// // Employee
// router.post("/login", protect, authorizeRoles("employee"), employeeLogin);
// // Employee routes
// router.get('/today', protect, authorizeRoles('employee'), getTodayAttendance);
// router.get('/history', protect, authorizeRoles('employee'), getAttendanceHistory);
// router.post("/logout/:id", protect, authorizeRoles("employee"), employeeLogout);

// // HR
// router.get("/pending", protect, authorizeRoles("hr"), getPendingAttendances);
// router.get('/stats', protect, authorizeRoles("admin",'hr'), getAttendanceStats);

// router.patch("/:id/approve", protect, authorizeRoles("hr"), approveAttendance);
// router.patch("/:id/reject", protect, authorizeRoles("hr"), rejectAttendance);

// // Admin
// router.get("/all", protect, authorizeRoles("admin","hr"), getAllAttendanceForAdmin);

// export default router;


import express from "express";
import {
  employeeLogin,
  employeeLogout,
  getPendingAttendances,
  approveAttendance,
  rejectAttendance,
  getAllAttendanceForAdmin,
  getTodayAttendance,
  getAttendanceHistory,
  getAttendanceStats,
  // New functions
  hrLogin,
  hrLogout,
  getHrAttendanceHistory,
  getHrTodayAttendance,
  adminApproveAttendance,
  adminRejectAttendance,
  getMonthlyReport,
  createRegularizationRequest,
  getPendingRegularizations,
  approveRegularization,
  rejectRegularization,
  checkIsHoliday
} from "../controllers/attendance.controller.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

import Profile from "../models/profile.js";
const router = express.Router();

// Employee
router.post("/login", protect, authorizeRoles("employee"), employeeLogin);
router.get('/today', protect, authorizeRoles('employee'), getTodayAttendance);
router.get('/history', protect, authorizeRoles('employee'), getAttendanceHistory);
router.post("/logout/:id", protect, authorizeRoles("employee"), employeeLogout);

// HR 
router.get("/pending", protect, authorizeRoles("hr"), getPendingAttendances);
router.get('/stats', protect, authorizeRoles("admin", "hr"), getAttendanceStats);
router.patch("/:id/approve", protect, authorizeRoles("hr"), approveAttendance);
router.patch("/:id/reject", protect, authorizeRoles("hr"), rejectAttendance);

// HR Self Attendance
router.post("/hr/login", protect, authorizeRoles("hr"), hrLogin);
router.post("/hr/logout/:id", protect, authorizeRoles("hr"), hrLogout);
router.get("/hr/history", protect, authorizeRoles("hr"), getHrAttendanceHistory);
router.get("/hr/today", protect, authorizeRoles("hr"), getHrTodayAttendance);

// Admin
router.get("/all", protect, authorizeRoles("admin", "hr"), getAllAttendanceForAdmin);
router.patch("/:id/admin-approve", protect, authorizeRoles("admin"), adminApproveAttendance);
router.patch("/:id/admin-reject", protect, authorizeRoles("admin"), adminRejectAttendance);

// Monthly Reports
router.get("/reports/monthly", protect, authorizeRoles("admin", "hr"), getMonthlyReport);
// Add this to your routes
router.get("/departments", protect, authorizeRoles("admin", "hr"), async (req, res) => {
  try {
    const departments = await Profile.distinct('department');
    res.status(200).json(departments.filter(dept => dept));
  } catch (error) {
    res.status(500).json({ message: "Error fetching departments", error: error.message });
  }
});

// Regularization
router.post("/regularization", protect, authorizeRoles("employee", "hr"), createRegularizationRequest);
router.get("/regularization/pending", protect, authorizeRoles("admin", "hr"), getPendingRegularizations);
router.patch("/regularization/:id/approve", protect, authorizeRoles("admin", "hr"), approveRegularization);
router.patch("/regularization/:id/reject", protect, authorizeRoles("admin", "hr"), rejectRegularization);

// Holiday Check
router.get("/check-holiday/:date", protect, checkIsHoliday);

export default router;