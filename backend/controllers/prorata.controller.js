import { calculateProrataSalary } from "../config/payrollCalculator.js";
import Profile from "../models/profile.js";

// Calculate prorata salary for employee
export const calculateEmployeeProrata = async (req, res) => {
  try {
    const { employeeId, basicSalary, month, year } = req.body;

    if (!employeeId || !basicSalary || !month || !year) {
      return res.status(400).json({
        success: false,
        message: "Employee ID, basic salary, month, and year are required"
      });
    }

    // Get employee joining date
    const employee = await Profile.findById(employeeId);
    if (!employee || !employee.dateOfJoining) {
      return res.status(404).json({
        success: false,
        message: "Employee not found or joining date missing"
      });
    }

    const prorataData = await calculateProrataSalary(
      parseFloat(basicSalary),
      employee.dateOfJoining,
      parseInt(month),
      parseInt(year)
    );

    res.status(200).json({
      success: true,
      data: {
        employee: {
          name: `${employee.firstName} ${employee.lastName}`,
          employeeId: employee.employeeId,
          dateOfJoining: employee.dateOfJoining
        },
        ...prorataData
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error calculating prorata salary",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};