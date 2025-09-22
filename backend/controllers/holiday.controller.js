import Event from "../models/companyCalendar.js";
import { isHoliday, getWorkingDays } from "../config/payrollCalculator.js";

// Check if specific date is holiday
export const checkDateIsHoliday = async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date parameter is required"
      });
    }

    const isHolidayDate = await isHoliday(new Date(date));
    
    res.status(200).json({
      success: true,
      data: { date, isHoliday: isHolidayDate }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error checking holiday",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// Get working days for date range
export const getWorkingDaysForRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required"
      });
    }

    const workingDays = await getWorkingDays(new Date(startDate), new Date(endDate));
    
    res.status(200).json({
      success: true,
      data: { startDate, endDate, workingDays }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error calculating working days",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};