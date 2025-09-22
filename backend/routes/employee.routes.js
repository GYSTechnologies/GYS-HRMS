import express from "express";
import {
  addEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  getEmployeeProfile,
  updateProfileImage
} from "../controllers/employee.controller.js";
import {
  addOrUpdateBankDetail,
  getMyBankDetail,
  getEmployeeBankDetail,
} from "../controllers/bankDetail.controller.js";

import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Employee add/update & get own bank detail
router.post("/bank", protect, addOrUpdateBankDetail);
router.get("/bank/me", protect, getMyBankDetail);

// HR/Admin fetch employee bank detail
router.get("/bank/:employeeId", protect, getEmployeeBankDetail);


// Add new employee (Admin can add HR & Employee, HR can add only Employee)
router.post("/add", protect, authorizeRoles("admin", "hr"), addEmployee);

// Get all employees
router.get("/all-employees", protect, getAllEmployees);

//profile
router.get('/profile', protect, getEmployeeProfile);
router.patch('/profile/image', protect, upload.single('image'), updateProfileImage);


// Add this route to your employee routes
router.get("/:id", protect, getEmployeeById);

// Update employee
router.put(
  "/update/:id",
  protect,
  authorizeRoles("admin", "hr"),
  updateEmployee
);

export default router;
