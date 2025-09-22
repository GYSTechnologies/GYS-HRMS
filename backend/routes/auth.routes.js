import express from "express";
import {
  loginUser,
  registerUser,
  getProfile,
  forgotPassword,
  verifyOtp,
  resetPassword,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// login
router.post("/login", loginUser);

// register (only for admin to create hr/employee)
router.post("/register", registerUser);

// Forgot Password - Generate and Send OTP
router.post("/forgot-password", forgotPassword);

// Verify OTP
router.post("/verify-otp", verifyOtp);

// Reset Password with OTP
router.post("/reset-password", resetPassword);

// get logged-in user profile
router.get("/me", protect, getProfile);

export default router;
