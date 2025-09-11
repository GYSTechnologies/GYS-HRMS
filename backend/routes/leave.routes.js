import express from "express";
import {
  setLeavePolicy,
  getPolicies,
  getPolicyByRoleYear,
  createLeaveRequest,
  getLeaveRequests,
  approveOrRejectLeave,
  getLeaveBalance,
  getSingleLeaveRequest,
  cancelLeaveRequest,
  getMyLeaveRequests,
  createLeaveType,
  getLeaveTypes,
  updateLeaveType,
  deleteLeaveType,
  toggleLeaveTypeStatus,
} from "../controllers/leave.controller.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Policy routes (admin only)
router.post(
  "/create-leave-policy",
  protect,
  authorizeRoles("admin"),
  setLeavePolicy
);
router.get("/policies", protect, authorizeRoles("admin", "hr"), getPolicies);
router.get(
  "/policies/:role/:year",
  protect,
  authorizeRoles("admin", "hr"),
  getPolicyByRoleYear
);

// Leave requests
router.post(
  "/create",
  protect,
  authorizeRoles("employee", "hr"),
  createLeaveRequest
);
router.get("/requests", protect, getLeaveRequests);
router.get("/my-requests", protect, getMyLeaveRequests); // Sab users ke liye

router.get("/requests/:id", protect, getSingleLeaveRequest); // <-- NEW
router.put("/requests/:id/cancel", protect, cancelLeaveRequest); // <-- NEW

router.post(
  "/:leaveId/review",
  protect,
  authorizeRoles("hr", "admin"),
  approveOrRejectLeave
);
router.get("/balance", protect, getLeaveBalance);

//leave type routes
router.post(
  "/create-leaveType",
  protect,
  authorizeRoles("admin"),
  createLeaveType
);

router.get("/get-leaveTypes", protect, getLeaveTypes);

router.put(
  "/update-leaveType/:id",
  protect,
  authorizeRoles("admin"),
  updateLeaveType
);

router.delete(
  "/delete-leaveType/:id",
  protect,
  authorizeRoles("admin"),
  deleteLeaveType
);

router.patch(
  "/toggle-leaveType-status/:id",
  protect,
  authorizeRoles("admin"),
  toggleLeaveTypeStatus
);

export default router;
