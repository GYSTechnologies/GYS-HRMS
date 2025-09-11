import bcrypt from "bcryptjs";
import User from "../models/user.js";
import Profile from "../models/profile.js";
import Payroll from "../models/payroll.js";
import mongoose from "mongoose";
import { sendWelcomeEmail } from "../config/email.js";
import { cloudinary } from '../config/cloudinary.js';

// Helper function to generate employee ID
const generateEmployeeId = async (department) => {
  const departmentCode = department
    ? department.substring(0, 3).toUpperCase()
    : "EMP";
  const count = await Profile.countDocuments({});
  return `${departmentCode}${(count + 1).toString().padStart(4, "0")}`;
};

//get all employee
export const getAllEmployees = async (req, res) => {
  try {
    const employees = await Profile.find()
      .populate({
        path: "user",
        select: "email role isActive lastLoginAt",
      })
      .select("-documents -roleMeta"); // Exclude heavy fields for list view

    return res.status(200).json({
      message: "Employees fetched successfully",
      data: employees,
    });
  } catch (err) {
    console.error("Get employees error:", err);
    return res
      .status(500)
      .json({ message: "Server Error while fetching employees" });
  }
};

//create employee , admin and hr only
export const addEmployee = async (req, res) => {
  try {
    // Parse the JSON data from the form
    const { data } = req.body;
    const {
      basicInfo, // step1
      jobInfo, // step2
      payrollInfo, // step3
      password, // step4
      role, // assigned role (optional, only admin can set)
    } = JSON.parse(data);

    // **Step 0: Check if user already exists**
    const existingUser = await User.findOne({ email: basicInfo.email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    // **Step 1: Determine role**
    let employeeRole = "employee"; // Default role
    if (req.user.role === "admin") {
      employeeRole = role || "employee";
    } else if (req.user.role === "hr") {
      employeeRole = "employee"; // HR can only create employees
    }

    // **Step 2: Create User**
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: basicInfo.email,
      password: hashedPassword,
      role: employeeRole,
      isActive: true,
    });

    // **Step 3: Generate Employee ID**
    const employeeId = await generateEmployeeId(jobInfo.department);

    // **Step 4: Create Profile with new fields**
    const profileData = {
      user: user._id,
      firstName: basicInfo.firstName,
      lastName: basicInfo.lastName,
      phone: basicInfo.phone,
      dob: basicInfo.dob,
      gender: basicInfo.gender,
      address: basicInfo.address,
      designation: jobInfo.designation,
      department: jobInfo.department,
      dateOfJoining: jobInfo.dateOfJoining,
      employeeId: employeeId,
      documents: basicInfo.documents || [],
      avatarUrl: basicInfo.profileImage ? basicInfo.profileImage.url : null,
    };

    // Add new fields if they exist in the request
    if (jobInfo.employmentType) {
      profileData.employmentType = jobInfo.employmentType;
    }
    
    if (jobInfo.shiftTiming) {
      profileData.shiftTiming = jobInfo.shiftTiming;
    }
    
    if (jobInfo.workMode) {
      profileData.workMode = jobInfo.workMode;
    }

    const profile = await Profile.create(profileData);

    // **Step 5: Link User ↔ Profile**
    user.profileRef = profile._id;
    await user.save();

    // **Step 6: Calculate Payroll Totals**
    const totalAllowances = payrollInfo.allowances
      ? payrollInfo.allowances.reduce(
          (sum, item) => sum + (item.amount || 0),
          0
        )
      : 0;

    const totalDeductions =
      (payrollInfo.deductions
        ? payrollInfo.deductions.reduce(
            (sum, item) => sum + (item.amount || 0),
            0
          )
        : 0) + (payrollInfo.tax || 0);

    const totalEarnings =
      (payrollInfo.basic || 0) + (payrollInfo.hra || 0) + totalAllowances;
    const netPay = totalEarnings - totalDeductions;

    // **Step 7: Create Payroll (DRAFT)**
    const payroll = await Payroll.create({
      employee: profile._id,
      basic: payrollInfo.basic || 0,
      hra: payrollInfo.hra || 0,
      allowances: payrollInfo.allowances || [],
      deductions: payrollInfo.deductions || [],
      tax: payrollInfo.tax || 0,
      month: payrollInfo.month || new Date().toISOString().slice(0, 7), // yyyy-mm
      totalEarnings,
      totalDeductions,
      netPay,
      generatedBy: req.user._id,
      status: "draft",
    });

    // **Step 8: Send Welcome Email**
    await sendWelcomeEmail(user.email, {
      firstName: profile.firstName,
      email: user.email,
      password, // plain password (already hashed in DB, but send original here)
      dateOfJoining: profile.dateOfJoining,
    });

    // ✅ Final Response
    return res.status(201).json({
      message: "Employee created successfully",
      data: {
        user: {
          _id: user._id,
          email: user.email,
          role: user.role,
        },
        profile: {
          _id: profile._id,
          firstName: profile.firstName,
          lastName: profile.lastName,
          employeeId: profile.employeeId,
        },
        payroll: {
          _id: payroll._id,
          netPay: payroll.netPay,
          status: payroll.status,
        },
      },
    });
  } catch (err) {
    console.error("Employee creation error:", err);

    // Duplicate key error (email or employeeId)
    if (err.code === 11000) {
      return res.status(400).json({
        message:
          "Duplicate field value entered. Employee ID or email might already exist.",
      });
    }

    return res.status(500).json({
      message: "Server Error during employee creation",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

//update employee
export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params; // profile ID
    const { data } = req.body; // Get the data string from request body

    // Parse the JSON data from the form (same as addEmployee)
    const { basicInfo, jobInfo, payrollInfo } = JSON.parse(data);

    // Step 1: Find Profile
    const profile = await Profile.findById(id);
    if (!profile) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Step 2: Update Profile fields
    if (basicInfo) {
      profile.firstName = basicInfo.firstName || profile.firstName;
      profile.lastName = basicInfo.lastName || profile.lastName;
      profile.phone = basicInfo.phone || profile.phone;
      profile.dob = basicInfo.dob || profile.dob;
      profile.gender = basicInfo.gender || profile.gender;
      profile.address = basicInfo.address || profile.address; // Added address field

      // Handle profile image update
      if (basicInfo.profileImage) {
        profile.avatarUrl = basicInfo.profileImage.url || profile.avatarUrl;
      }

      // Handle documents update (append new documents to existing ones)
      if (basicInfo.documents && basicInfo.documents.length > 0) {
        profile.documents = [...profile.documents, ...basicInfo.documents];
      }
    }

    if (jobInfo) {
      profile.designation = jobInfo.designation || profile.designation;
      profile.department = jobInfo.department || profile.department;
      
      // Update new fields
      profile.employmentType = jobInfo.employmentType || profile.employmentType;
      profile.workMode = jobInfo.workMode || profile.workMode;
      
      // Update shift timing if provided
      if (jobInfo.shiftTiming) {
        profile.shiftTiming = {
          start: jobInfo.shiftTiming.start || profile.shiftTiming?.start,
          end: jobInfo.shiftTiming.end || profile.shiftTiming?.end
        };
      }
      
      // Don't update dateOfJoining as it shouldn't change
    }

    await profile.save();

    // Step 3: Update Payroll (latest draft payroll for this employee)
    if (payrollInfo) {
      const payroll = await Payroll.findOne({
        employee: id,
        status: "draft",
      }).sort({ createdAt: -1 });

      if (payroll) {
        payroll.basic = payrollInfo.basic ?? payroll.basic;
        payroll.hra = payrollInfo.hra ?? payroll.hra;
        payroll.allowances = payrollInfo.allowances ?? payroll.allowances;
        payroll.deductions = payrollInfo.deductions ?? payroll.deductions;
        payroll.tax = payrollInfo.tax ?? payroll.tax;
        payroll.month = payrollInfo.month ?? payroll.month;

        // recalc totals
        const totalAllowances = payroll.allowances
          ? payroll.allowances.reduce(
              (sum, item) => sum + (item.amount || 0),
              0
            )
          : 0;

        const totalDeductions =
          (payroll.deductions
            ? payroll.deductions.reduce(
                (sum, item) => sum + (item.amount || 0),
                0
              )
            : 0) + (payroll.tax || 0);

        payroll.totalEarnings =
          (payroll.basic || 0) + (payroll.hra || 0) + totalAllowances;
        payroll.totalDeductions = totalDeductions;
        payroll.netPay = payroll.totalEarnings - payroll.totalDeductions;

        await payroll.save();
      } else {
        // Create a new payroll if none exists
        const totalAllowances = payrollInfo.allowances
          ? payrollInfo.allowances.reduce(
              (sum, item) => sum + (item.amount || 0),
              0
            )
          : 0;

        const totalDeductions =
          (payrollInfo.deductions
            ? payrollInfo.deductions.reduce(
                (sum, item) => sum + (item.amount || 0),
                0
              )
            : 0) + (payrollInfo.tax || 0);

        const totalEarnings =
          (payrollInfo.basic || 0) + (payrollInfo.hra || 0) + totalAllowances;
        const netPay = totalEarnings - totalDeductions;

        await Payroll.create({
          employee: id,
          basic: payrollInfo.basic || 0,
          hra: payrollInfo.hra || 0,
          allowances: payrollInfo.allowances || [],
          deductions: payrollInfo.deductions || [],
          tax: payrollInfo.tax || 0,
          month: payrollInfo.month || new Date().toISOString().slice(0, 7),
          totalEarnings,
          totalDeductions,
          netPay,
          generatedBy: req.user._id,
          status: "draft",
        });
      }
    }

    return res.status(200).json({
      message: "Employee updated successfully",
      data: { profile },
    });
  } catch (err) {
    console.error("Update employee error:", err);
    return res.status(500).json({
      message: "Server Error while updating employee",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// GET Single Employee by ID with all details
export const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Profile.findById(id)
      .populate({
        path: "user",
        select: "email role isActive lastLoginAt",
      })
      .populate({
        path: "roleMeta.reportsTo",
        select: "firstName lastName employeeId designation",
      });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Get payroll data for this employee (only finalized)
    const payrolls = await mongoose
      .model("Payroll")
      .find({
        employee: id,
        status: "draft",
      })
      .sort({ month: -1 });

    // Combine the data
    const employeeData = employee.toObject();
    employeeData.payrolls = payrolls;

    return res.status(200).json({
      message: "Employee fetched successfully",
      data: employeeData,
    });
  } catch (err) {
    console.error("Get employee error:", err);
    return res
      .status(500)
      .json({ message: "Server Error while fetching employee" });
  }
};

// Get employee profile for the logged-in user
export const getEmployeeProfile = async (req, res) => {
  try {
    // Find the profile for the authenticated user
    const profile = await Profile.findOne({ user: req.user._id })
      .populate({
        path: 'user',
        select: 'email role isActive lastLoginAt'
      })
      .populate({
        path: 'roleMeta.reportsTo',
        select: 'firstName lastName designation employeeId'
      });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Get payroll data for this employee
    const payrolls = await Payroll.find({
      employee: profile._id,
      status: { $in: ['approved', 'draft'] }
    }).sort({ month: -1 }).limit(6); // Last 6 months

    // Combine the data
    const employeeData = profile.toObject();
    employeeData.payrolls = payrolls;

    return res.status(200).json({
      message: 'Employee profile fetched successfully',
      data: employeeData
    });
  } catch (err) {
    console.error('Get employee profile error:', err);
    return res.status(500).json({ 
      message: 'Server Error while fetching employee profile',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};


// Update profile image
export const updateProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Find the profile for the authenticated user
    const profile = await Profile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Delete old image from Cloudinary if exists
    if (profile.avatarUrl) {
      try {
        // Extract public ID from Cloudinary URL
        const urlParts = profile.avatarUrl.split('/');
        const publicId = urlParts[urlParts.length - 1].split('.')[0];
        await cloudinary.uploader.destroy(`gys-hrms/${publicId}`);
      } catch (error) {
        console.error('Error deleting old image:', error);
        // Continue with update even if deletion fails
      }
    }

    // Update profile with new image URL
    profile.avatarUrl = req.file.path;
    await profile.save();

    return res.status(200).json({
      message: 'Profile image updated successfully',
      data: {
        avatarUrl: profile.avatarUrl
      }
    });

  } catch (err) {
    console.error('Update profile image error:', err);
    return res.status(500).json({ 
      message: 'Server Error while updating profile image',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};