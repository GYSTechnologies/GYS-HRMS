import express from "express";
import { getDepartments, getEmployeesByDepartment } from "../controllers/department.controller.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

import { calculateEmployeeProrata } from "../controllers/prorata.controller.js";
const router = express.Router();


router.post("/calculate", protect, authorizeRoles("admin", "hr"), calculateEmployeeProrata);

router.get("/", protect, authorizeRoles("admin", "hr"), getDepartments);
router.get("/:department/employees", protect, authorizeRoles("admin", "hr"), getEmployeesByDepartment);

export default router;