// import React, { createContext, useContext, useState } from 'react';

// const AppContext = createContext();

// export const useAppContext = () => {
//   return useContext(AppContext);
// };

// export const AppProvider = ({ children }) => {
//   const [currentView, setCurrentView] = useState('dashboard');
//   const [showTaskModal, setShowTaskModal] = useState(false);
//   const [showLeaveModal, setShowLeaveModal] = useState(false);
//   const [selectedMonth, setSelectedMonth] = useState('August 2025');

//   // Mock data
//   const attendanceData = [
//     { date: '01 Aug', logIn: '08:35 AM', status: 'Present', logOut: '06:10 PM', hours: '8h 35m' },
//     { date: '02 Aug', logIn: '08:50 AM', status: 'Present', logOut: '06:55 PM', hours: '7h 55m' },
//     { date: '03 Aug', logIn: '-', status: 'Holiday', logOut: '-', hours: '-' },
//     { date: '04 Aug', logIn: '10:15 AM', status: 'Late In', logOut: '04:30 PM', hours: '6h 15m' }
//   ];

//   const leaveApplications = [
//     { dateRange: '10-11 Aug 25', type: 'Sick', days: 2, status: 'Approved', approvedBy: 'Rajesh Verma' },
//     { dateRange: '16 Aug 25', type: 'Casual', days: 1, status: 'Pending', approvedBy: 'HR Dept.' },
//     { dateRange: '20 Aug 25', type: 'Earned', days: 1, status: 'Rejected', approvedBy: 'Manager' }
//   ];

//   const payrollHistory = [
//     { month: 'June 2025', netSalary: '₹27,000', payslip: 'Download' },
//     { month: 'May 2025', netSalary: '₹27,500', payslip: 'Download' },
//     { month: 'April 2025', netSalary: '₹27,500', payslip: 'Download' },
//     { month: 'March 2025', netSalary: '₹27,000', payslip: 'Download' }
//   ];

//   const value = {
//     currentView,
//     setCurrentView,
//     showTaskModal,
//     setShowTaskModal,
//     showLeaveModal,
//     setShowLeaveModal,
//     selectedMonth,
//     setSelectedMonth,
//     attendanceData,
//     leaveApplications,
//     payrollHistory
//   };

//   return (
//     <AppContext.Provider value={value}>
//       {children}
//     </AppContext.Provider>
//   );
// };



import { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance"; // path adjust kr lena

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  // Login function
  const login = async (email, password) => {
    const res = await axiosInstance.post("/auth/login", {
      email,
      password,
    });

    setToken(res.data.token);
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  // Fetch profile if token already stored
  useEffect(() => {
    const fetchProfile = async () => {
      if (token) {
        try {
          const res = await axiosInstance.get("/auth/me");
          setUser(res.data);
        } catch (err) {
          logout();
        }
      }
    };
    fetchProfile();
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
