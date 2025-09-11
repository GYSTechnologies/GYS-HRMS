import express from "express";
import { loginUser, registerUser, getProfile } from "../controllers/auth.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// login
router.post("/login", loginUser);

// register (only for admin to create hr/employee)
router.post("/register", registerUser);

// get logged-in user profile
router.get("/me", protect, getProfile);

export default router;
