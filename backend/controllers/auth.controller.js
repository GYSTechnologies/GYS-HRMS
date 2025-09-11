import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
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

