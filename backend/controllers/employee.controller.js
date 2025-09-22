import bcrypt from "bcryptjs";
import User from "../models/user.js";
import Profile from "../models/profile.js";
import Payroll from "../models/payroll.js";
import mongoose from "mongoose";
import { sendWelcomeEmail } from "../config/email.js";
import { cloudinary } from '../config/cloudinary.js';


export const generateEmployeeId = async (departmentName) => {
  // Prefix: first 3 uppercase letters of department
  const prefix = departmentName.substring(0, 3).toUpperCase();

  // Find the last employeeId with this prefix
  const lastProfile = await Profile.findOne({
    employeeId: { $regex: `^${prefix}-\\d+$` },
  })
    .sort({ employeeId: -1 })
    .lean();

  let nextNumber = 1;

  if (lastProfile?.employeeId) {
    // Extract numeric part (e.g. "SOF-0002" → 2)
    const match = lastProfile.employeeId.match(/\d+$/);
    if (match) {
      nextNumber = parseInt(match[0], 10) + 1;
    }
  }

  // Pad with leading zeros (e.g. 2 → "0002")
  const padded = String(nextNumber).padStart(4, "0");

  return `${prefix}-${padded}`; // Example: SOF-0002
};

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
// export const addEmployee = async (req, res) => {
//   try {

//     let payload = req.body;
//     if (typeof payload.data === "string") {
//       // if data present and is string, try parse but guard against invalid JSON
//       try {
//         payload = JSON.parse(payload.data);
//       } catch (parseErr) {
//         return res.status(400).json({ message: "Invalid JSON in request body 'data' field" });
//       }
//     }

//     // Destructure with safe defaults
//     const {
//       basicInfo = {},
//       jobInfo = {},
//       payrollInfo = {},
//       password,
//       role,
//     } = payload;

//     // Basic validation early-return
//     if (!basicInfo.email) {
//       return res.status(400).json({ message: "Email (basicInfo.email) is required" });
//     }
//     if (!password) {
//       return res.status(400).json({ message: "Password is required" });
//     }

//     // **Step 0: Check if user already exists**
//     const existingUser = await User.findOne({ email: basicInfo.email });
//     if (existingUser) {
//       return res
//         .status(400)
//         .json({ message: "User with this email already exists" });
//     }

//     // **Step 1: Determine role**
//     let employeeRole = "employee"; // Default role
//     if (req.user?.role === "admin") {
//       employeeRole = role || "employee";
//     } else if (req.user?.role === "hr") {
//       employeeRole = "employee"; // HR can only create employees
//     }

//     // **Step 2: Create User**
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = await User.create({
//       email: basicInfo.email,
//       password: hashedPassword,
//       role: employeeRole,
//       isActive: true,
//     });

//     // **Step 3: Generate Employee ID**
//     const employeeId = await generateEmployeeId(jobInfo.department);

//     // Ensure arrays exist
//     const documentsArr = Array.isArray(basicInfo.documents) ? basicInfo.documents : [];

//     // Normalize profileImage: could be {url} or string
//     let avatarUrl = null;
//     if (basicInfo.profileImage) {
//       avatarUrl =
//         typeof basicInfo.profileImage === "string"
//           ? basicInfo.profileImage
//           : basicInfo.profileImage.url || null;
//     }

//     // **Step 4: Create Profile with new fields**
//     const profileData = {
//       user: user._id,
//       firstName: basicInfo.firstName || "",
//       lastName: basicInfo.lastName || "",
//       phone: basicInfo.phone || "",
//       dob: basicInfo.dob || null,
//       gender: basicInfo.gender || null,
//       address: basicInfo.address || null,
//       designation: jobInfo.designation || null,
//       department: jobInfo.department || null,
//       dateOfJoining: jobInfo.dateOfJoining || null,
//       employeeId: employeeId,
//       documents: documentsArr,
//       avatarUrl,
//     };

//     // Optional fields
//     if (jobInfo.employmentType) profileData.employmentType = jobInfo.employmentType;
//     if (jobInfo.shiftTiming) profileData.shiftTiming = jobInfo.shiftTiming;
//     if (jobInfo.workMode) profileData.workMode = jobInfo.workMode;

//     const profile = await Profile.create(profileData);

//     // **Step 5: Link User ↔ Profile**
//     user.profileRef = profile._id;
//     await user.save();

//     // Normalize payroll input
//     const payroll = {
//       employee: profile._id,
//       basic: Number(payrollInfo.basic) || 0,
//       hra: Number(payrollInfo.hra) || 0,
//       allowances: Array.isArray(payrollInfo.allowances) ? payrollInfo.allowances : [],
//       deductions: Array.isArray(payrollInfo.deductions) ? payrollInfo.deductions : [],
//       tax: Number(payrollInfo.tax) || 0,
//       month: payrollInfo.month || new Date().toISOString().slice(0, 7),
//       generatedBy: req.user?._id || null,
//       status: payrollInfo.status || "draft",
//     };

//     // Totals
//     const totalAllowances = payroll.allowances.reduce((sum, a) => sum + (Number(a.amount) || 0), 0);
//     const totalDeductions = payroll.deductions.reduce((sum, d) => sum + (Number(d.amount) || 0), 0) + payroll.tax;
//     const totalEarnings = payroll.basic + payroll.hra + totalAllowances;
//     const netPay = totalEarnings - totalDeductions;

//     payroll.totalEarnings = totalEarnings;
//     payroll.totalDeductions = totalDeductions;
//     payroll.netPay = netPay;

//     // **Step 7: Create Payroll (DRAFT)**
//     const payrollDoc = await Payroll.create(payroll);

//     // ✅ Final Response
//     return res.status(201).json({
//       message: "Employee created successfully",
//       data: {
//         user: { _id: user._id, email: user.email, role: user.role },
//         profile: { _id: profile._id, firstName: profile.firstName, lastName: profile.lastName, employeeId: profile.employeeId },
//         payroll: { _id: payrollDoc._id, netPay: payrollDoc.netPay, status: payrollDoc.status },
//       },
//     });
//   } catch (err) {
//     console.error("Employee creation error:", err);

//     if (err.code === 11000) {
//       return res.status(400).json({
//         message:
//           "Duplicate field value entered. Employee ID or email might already exist.",
//       });
//     }

//     return res.status(500).json({
//       message: "Server Error during employee creation",
//       error: process.env.NODE_ENV === "development" ? err.message : undefined,
//     });
//   }
// };

export const addEmployee = async (req, res) => {
  try {
    let payload = req.body;
    if (typeof payload.data === "string") {
      try {
        payload = JSON.parse(payload.data);
      } catch (parseErr) {
        return res
          .status(400)
          .json({ message: "Invalid JSON in request body 'data' field" });
      }
    }

    const {
      basicInfo = {},
      jobInfo = {},
      payrollInfo = {}, // still accept this for backward compatibility
      password,
      role,
    } = payload;

    if (!basicInfo.email) {
      return res
        .status(400)
        .json({ message: "Email (basicInfo.email) is required" });
    }
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const existingUser = await User.findOne({ email: basicInfo.email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    let employeeRole = "employee";
    if (req.user?.role === "admin") {
      employeeRole = role || "employee";
    } else if (req.user?.role === "hr") {
      employeeRole = "employee";
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: basicInfo.email,
      password: hashedPassword,
      role: employeeRole,
      isActive: true,
    });

    const employeeId = await generateEmployeeId(jobInfo.department);

    const documentsArr = Array.isArray(basicInfo.documents)
      ? basicInfo.documents
      : [];

    let avatarUrl = null;
    if (basicInfo.profileImage) {
      avatarUrl =
        typeof basicInfo.profileImage === "string"
          ? basicInfo.profileImage
          : basicInfo.profileImage.url || null;
    }

    // Profile creation (with basicSalary)
    const profileData = {
      user: user._id,
      firstName: basicInfo.firstName || "",
      lastName: basicInfo.lastName || "",
      phone: basicInfo.phone || "",
      dob: basicInfo.dob || null,
      gender: basicInfo.gender || null,
      address: basicInfo.address || null,
      designation: jobInfo.designation || null,
      department: jobInfo.department || null,
      dateOfJoining: jobInfo.dateOfJoining || null,
      employeeId: employeeId,
      documents: documentsArr,
      avatarUrl,
      basicSalary: Number(payrollInfo.basic) || 0, // 👈 store directly in profile
    };

    if (jobInfo.employmentType) profileData.employmentType = jobInfo.employmentType;
    if (jobInfo.shiftTiming) profileData.shiftTiming = jobInfo.shiftTiming;
    if (jobInfo.workMode) profileData.workMode = jobInfo.workMode;

    const profile = await Profile.create(profileData);

    user.profileRef = profile._id;
    await user.save();

    //  But still return payroll-like data so frontend doesn't break
    const dummyPayroll = {
      _id: null,
      netPay: profile.basicSalary, // just basic salary for now
      status: "draft",
    };

    await sendWelcomeEmail(basicInfo.email, {
        firstName: profile.firstName,
        email: basicInfo.email,
        password, 
        dateOfJoining: profile.dateOfJoining,
      });

    return res.status(201).json({
      message: "Employee created successfully",
      data: {
        user: { _id: user._id, email: user.email, role: user.role },
        profile: {
          _id: profile._id,
          firstName: profile.firstName,
          lastName: profile.lastName,
          employeeId: profile.employeeId,
          basicSalary: profile.basicSalary,
        },
        payroll: dummyPayroll, // frontend still gets 'payroll' key
      },
    });
  } catch (err) {
    console.error("Employee creation error:", err);

    if (err.code === 11000) {
      return res.status(400).json({
        message:
          "Duplicate field value entered. Employee ID or email might already exist.",
      });
    }

    return res.status(500).json({
      message: "Server Error during employee creation",
      error:
        process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};


// helper: safely parse JSON-like inputs
function safeParseJSON(value) {
  if (value === undefined || value === null) return null;
  if (typeof value === "object") return value; // already parsed
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed || trimmed === "undefined" || trimmed === "null") return null;
    try {
      return JSON.parse(trimmed);
    } catch (err) {
      // not a JSON string — return the original string
      return trimmed;
    }
  }
  return value;
}

// update employee
export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    // Try to get data in multiple forms:
    // 1) client may send `data` as a JSON-string (FormData case)
    // 2) or send each section directly in the body (JSON request)
    const rawData = req.body?.data;
    const parsedData = safeParseJSON(rawData) || {};

    // If parsedData is empty, read fields directly from body (they may already be objects)
    const basicInfo = parsedData.basicInfo ?? safeParseJSON(req.body.basicInfo) ?? req.body.basicInfo ?? null;
    const jobInfo = parsedData.jobInfo ?? safeParseJSON(req.body.jobInfo) ?? req.body.jobInfo ?? null;
    const payrollInfo = parsedData.payrollInfo ?? safeParseJSON(req.body.payrollInfo) ?? req.body.payrollInfo ?? null;

    // Step 1: Find Profile
    const profile = await Profile.findById(id);
    if (!profile) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Step 2: Update Profile fields
    if (basicInfo) {
      profile.firstName = basicInfo.firstName ?? profile.firstName;
      profile.lastName = basicInfo.lastName ?? profile.lastName;
      profile.phone = basicInfo.phone ?? profile.phone;
      profile.dob = basicInfo.dob ?? profile.dob;
      profile.gender = basicInfo.gender ?? profile.gender;
      profile.address = basicInfo.address ?? profile.address;

      // Handle profile image update
      if (basicInfo.profileImage && basicInfo.profileImage.url) {
        profile.avatarUrl = basicInfo.profileImage.url;
      }

      // Handle documents update (append new docs but avoid duplicates by url)
      if (Array.isArray(basicInfo.documents) && basicInfo.documents.length > 0) {
        // ensure profile.documents is an array
        profile.documents = profile.documents || [];

        // normalize incoming docs
        const incomingDocs = basicInfo.documents.map((d) => ({
          type: d.type ?? d.docType ?? null,
          name: d.name ?? d.originalName ?? d.filename ?? d._id ?? "",
          originalName: d.originalName ?? d.name ?? null,
          url: d.url ?? d.path ?? d.secure_url ?? d.link ?? "",
          fileType: d.fileType ?? d.type ?? null,
          uploadedAt: d.uploadedAt ?? d.createdAt ?? null,
          raw: d,
        }));

        // merge without duplicates by url (if url missing, dedupe by name+type)
        const existing = profile.documents || [];
        const merged = [...existing];

        incomingDocs.forEach((inc) => {
          const already = merged.find(
            (m) =>
              (m.url && inc.url && m.url === inc.url) ||
              (m.name && inc.name && m.name === inc.name && m.type === inc.type)
          );
          if (!already) merged.push(inc);
        });

        profile.documents = merged;
      }
    }

    if (jobInfo) {
      profile.designation = jobInfo.designation ?? profile.designation;
      profile.department = jobInfo.department ?? profile.department;

      profile.employmentType = jobInfo.employmentType ?? profile.employmentType;
      profile.workMode = jobInfo.workMode ?? profile.workMode;

      if (jobInfo.shiftTiming) {
        profile.shiftTiming = {
          start: jobInfo.shiftTiming.start ?? profile.shiftTiming?.start,
          end: jobInfo.shiftTiming.end ?? profile.shiftTiming?.end,
        };
      }
      // don't update dateOfJoining per your comment
    }

    await profile.save();

    // Step 3: Update Payroll (latest draft payroll for this employee)
    if (payrollInfo) {
      // Normalize payrollInfo fields (they might be strings if sent via FormData)
      const normalizedPayroll = {
        basic: Number(payrollInfo.basic ?? payrollInfo.basicAmount ?? 0),
        hra: Number(payrollInfo.hra ?? 0),
        allowances: Array.isArray(payrollInfo.allowances) ? payrollInfo.allowances : safeParseJSON(payrollInfo.allowances) ?? [],
        deductions: Array.isArray(payrollInfo.deductions) ? payrollInfo.deductions : safeParseJSON(payrollInfo.deductions) ?? [],
        tax: payrollInfo.tax ?? 0,
        month: payrollInfo.month ?? new Date().toISOString().slice(0, 7),
      };

      let incomingTaxValue = Number(normalizedPayroll.tax || 0);
 
      const payroll = await Payroll.findOne({ employee: id, status: "draft" }).sort({ createdAt: -1 });

      if (payroll) {
        payroll.basic = normalizedPayroll.basic ?? payroll.basic;
        payroll.hra = normalizedPayroll.hra ?? payroll.hra;
        payroll.allowances = normalizedPayroll.allowances ?? payroll.allowances;
        payroll.deductions = normalizedPayroll.deductions ?? payroll.deductions;
        payroll.tax = incomingTaxValue ?? payroll.tax;
        payroll.month = normalizedPayroll.month ?? payroll.month;

        // recalc totals
        const totalAllowances = payroll.allowances
          ? payroll.allowances.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
          : 0;

        const totalDeductions =
          (payroll.deductions
            ? payroll.deductions.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
            : 0) + (Number(payroll.tax) || 0);

        payroll.totalEarnings = (Number(payroll.basic) || 0) + (Number(payroll.hra) || 0) + totalAllowances;
        payroll.totalDeductions = totalDeductions;
        payroll.netPay = payroll.totalEarnings - payroll.totalDeductions;

        await payroll.save();
      } else {
        const totalAllowances = normalizedPayroll.allowances
          ? normalizedPayroll.allowances.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
          : 0;

        const totalDeductions =
          (normalizedPayroll.deductions
            ? normalizedPayroll.deductions.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
            : 0) + (incomingTaxValue || 0);

        const totalEarnings = (normalizedPayroll.basic || 0) + (normalizedPayroll.hra || 0) + totalAllowances;
        const netPay = totalEarnings - totalDeductions;

        await Payroll.create({
          employee: id,
          basic: normalizedPayroll.basic || 0,
          hra: normalizedPayroll.hra || 0,
          allowances: normalizedPayroll.allowances || [],
          deductions: normalizedPayroll.deductions || [],
          tax: incomingTaxValue || 0,
          month: normalizedPayroll.month,
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