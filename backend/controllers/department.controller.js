import Profile from "../models/profile.js";

// Get all departments
export const getDepartments = async (req, res) => {
  try {
    const departments = await Profile.distinct("department", {
      department: { $nin: [null, ""] }, // cleaner way
    });

    res.status(200).json({
      success: true,
      data: departments.filter((dept) => dept?.trim()).sort(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching departments",
      error:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};


// Get employees by department with joining date
export const getEmployeesByDepartment = async (req, res) => {
  try {
    const { department } = req.params;
    
    const employees = await Profile.find({ 
      department: new RegExp(`^${department}$`, 'i') 
    }).select("firstName lastName employeeId designation dateOfJoining department avatarUrl")
      .sort("firstName");
    
    res.status(200).json({
      success: true,
      data: employees
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching employees",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};