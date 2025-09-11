import express from "express";
import {
  addEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  getEmployeeProfile,
  updateProfileImage
} from "../controllers/employee.controller.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import { upload } from '../config/cloudinary.js';

const router = express.Router();

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
