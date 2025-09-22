import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendOTPEmail } from "../config/email.js";

// Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// Generate a 6-digit OTP
 const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Check if OTP is expired
 const isOtpExpired = (expiryTime) => {
  return Date.now() > expiryTime;
};

//  Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate("profileRef");
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // check joining date (only for employees)
    if (user.role === "employee" && user.profileRef?.dateOfJoining) {
      const today = new Date();
      const joiningDate = new Date(user.profileRef.dateOfJoining);

      if (today < joiningDate) {
        return res.status(403).json({
          message: `You can login only from your joining date: ${joiningDate.toDateString()}`,
        });
      }
    }

    // update last login
    user.lastLoginAt = new Date();
    await user.save();

    res.json({
      token: generateToken(user._id, user.role),
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.profileRef?.firstName,
        lastName: user.profileRef?.lastName,
        dateOfJoining: user.profileRef?.dateOfJoining,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


//  Register User (Admin/hr only)
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


// --- Get logged-in user profile ---
export const getProfile = async (req, res) => {
  try {
    // populate profileRef to get profile details
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("profileRef", "firstName lastName avatarUrl designation dateOfJoining");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      id: user._id,
      email: user.email,
      role: user.role,
      lastLoginAt: user.lastLoginAt,
      firstName: user.profileRef?.firstName,
      lastName: user.profileRef?.lastName,
      avatarUrl:user.profileRef?.avatarUrl,
      designation: user.profileRef?.designation,
      dateOfJoining: user.profileRef?.dateOfJoining,
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};



// Forgot Password - Generate and Send OTP
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email }).populate("profileRef");

    if (!user) {
      return res.status(200).json({
        message: "If the email exists, an OTP has been sent to your email",
      });
    }

    // Check if user is an employee with a future joining date
    if (user.role === "employee" && user.profileRef?.dateOfJoining) {
      const today = new Date();
      const joiningDate = new Date(user.profileRef.dateOfJoining);

      if (today < joiningDate) {
        return res.status(403).json({
          message: `You can reset your password only from your joining date: ${joiningDate.toDateString()}`,
        });
      }
    }

    // Generate OTP and set expiry (10 minutes)
    const otp = generateOTP();
    const otpExpiry = Date.now() + 10 * 60 * 1000;

    // Save OTP
    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpires = otpExpiry;
    await user.save();

    // Send OTP email
    await sendOTPEmail(user.email, otp);

    res.status(200).json({
      message: "If the email exists, an OTP has been sent to your email",
      otp: process.env.NODE_ENV === "development" ? otp : undefined,
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Verify OTP
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email }).populate("profileRef");

    if (!user) {
      return res.status(400).json({ message: "Invalid request" });
    }

    if (user.resetPasswordOtp !== otp || isOtpExpired(user.resetPasswordOtpExpires)) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    res.status(200).json({
      message: "OTP verified successfully",
      verified: true,
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Reset Password with OTP
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({ message: "Email, OTP and password are required" });
    }

    const user = await User.findOne({ email }).populate("profileRef");

    if (!user) {
      return res.status(400).json({ message: "Invalid request" });
    }

    if (user.resetPasswordOtp !== otp || isOtpExpired(user.resetPasswordOtpExpires)) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    if (user.role === "employee" && user.profileRef?.dateOfJoining) {
      const today = new Date();
      const joiningDate = new Date(user.profileRef.dateOfJoining);

      if (today < joiningDate) {
        return res.status(403).json({
          message: `You can reset your password only from your joining date: ${joiningDate.toDateString()}`,
        });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
