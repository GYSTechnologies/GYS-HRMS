import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  RefreshCw,
  CheckCircle,
  XCircle,
  ArrowRight,
  Calendar,
  DollarSign,
  Users
} from "lucide-react";
import axiosInstance from "../utils/axiosInstance";

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [attendanceLog, setAttendanceLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const [statsRes, attendanceRes] = await Promise.all([
        axiosInstance.get("/dashboard/admin/stats"),
        axiosInstance.get("/dashboard/admin/attendance-log"),
      ]);

      setDashboardData(statsRes.data.data);
      setAttendanceLog(attendanceRes.data.data);
    } catch (error) {
      console.error("Error fetching admin dashboard data:", error);
      alert("Error loading dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleApproveAttendance = async (id) => {
    try {
      await axiosInstance.patch(`/dashboard/admin/approve-attendance/${id}`);
      fetchDashboardData();
    } catch (err) {
      alert("Error approving attendance");
    }
  };

  const handleRejectAttendance = async (id) => {
    try {
      await axiosInstance.patch(`/dashboard/admin/reject-attendance/${id}`);
      fetchDashboardData();
    } catch (err) {
      alert("Error rejecting attendance");
    }
  };

  const handleGoToAttendance = () => navigate("/admin/attendance");
  const handleGoToLeaves = () => navigate("/admin/leaves");
  const handleGoToPayroll = () => navigate("/admin/payroll-approval");

  const formatTime = (time) =>
    time ? new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-";

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#104774]"></div>
      </div>
    );
  }


//   return(
//     <div className="max-h-[80vh] p-4 md:p-6">
//   {/* Header */}
//   <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//     <div className="text-center sm:text-left">
//       <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Admin Dashboard</h1>
//       <p className="text-gray-600 mt-1 text-sm sm:text-base">System overview and management</p>
//     </div>
//     <button
//       onClick={fetchDashboardData}
//       disabled={refreshing}
//       className="bg-[#104774] text-white px-4 py-2 rounded-lg flex items-center justify-center disabled:opacity-50 w-full sm:w-auto"
//     >
//       <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
//       {refreshing ? "Refreshing..." : "Refresh Data"}
//     </button>
//   </div>

//   {/* Stats Cards */}
//   <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 mb-8">
//     {/* Attendance Card */}
//     <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg border border-slate-200">
//       <div className="flex items-center mb-4">
//         <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg md:rounded-xl flex items-center justify-center mr-3 md:mr-4">
//           <Clock className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
//         </div>
//         <h3 className="font-semibold text-slate-800 text-base md:text-lg">Today's Attendance</h3>
//       </div>
//       <div className="space-y-2 mb-4">
//         <div className="flex justify-between text-sm md:text-base">
//           <span className="text-slate-600">Present Today:</span>
//           <span className="font-bold text-green-600">{dashboardData?.attendance?.present || 0}</span>
//         </div>
//         <div className="flex justify-between text-sm md:text-base">
//           <span className="text-slate-600">Absent Today:</span>
//           <span className="font-bold text-red-600">{dashboardData?.attendance?.absent || 0}</span>
//         </div>
//         <div className="flex justify-between text-sm md:text-base">
//           <span className="text-slate-600">On Leave:</span>
//           <span className="font-bold text-orange-600">{dashboardData?.attendance?.onLeave || 0}</span>
//         </div>
//       </div>
//       <button
//         onClick={handleGoToAttendance}
//         className="w-full bg-[#104774] hover:bg-[#0d3a61] text-white py-2 px-4 rounded-lg md:rounded-xl font-medium flex items-center justify-center transition-all duration-300 text-sm md:text-base"
//       >
//         Go to Attendance
//         <ArrowRight className="w-4 h-4 ml-2" />
//       </button>
//     </div>

//     {/* Leaves Card */}
//     <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg border border-slate-200">
//       <div className="flex items-center mb-4">
//         <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-green-100 to-green-200 rounded-lg md:rounded-xl flex items-center justify-center mr-3 md:mr-4">
//           <Calendar className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
//         </div>
//         <h3 className="font-semibold text-slate-800 text-base md:text-lg">Leaves Summary</h3>
//       </div>
//       <div className="space-y-2 mb-4">
//         <div className="flex justify-between text-sm md:text-base">
//           <span className="text-slate-600">Pending Leaves:</span>
//           <span className="font-bold text-yellow-600">{dashboardData?.leaves?.pending || 0}</span>
//         </div>
//         <div className="flex justify-between text-sm md:text-base">
//           <span className="text-slate-600">Approved:</span>
//           <span className="font-bold text-green-600">{dashboardData?.leaves?.approved || 0}</span>
//         </div>
//         <div className="flex justify-between text-sm md:text-base">
//           <span className="text-slate-600">Rejected:</span>
//           <span className="font-bold text-red-600">{dashboardData?.leaves?.rejected || 0}</span>
//         </div>
//       </div>
//       <button
//         onClick={handleGoToLeaves}
//         className="w-full bg-[#104774] hover:bg-[#0d3a61] text-white py-2 px-4 rounded-lg md:rounded-xl font-medium flex items-center justify-center transition-all duration-300 text-sm md:text-base"
//       >
//         Go to Leaves
//         <ArrowRight className="w-4 h-4 ml-2" />
//       </button>
//     </div>

//     {/* Payroll Card */}
//     <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg border border-slate-200 flex flex-col h-full">
//       <div className="flex items-center mb-4">
//         <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-purple-100 to-purple-200 rounded-lg md:rounded-xl flex items-center justify-center mr-3 md:mr-4">
//           <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
//         </div>
//         <h3 className="font-semibold text-slate-800 text-base md:text-lg">Payroll Summary</h3>
//       </div>
//       <div className="space-y-2 mb-4">
//         <div className="flex justify-between text-sm md:text-base">
//           <span className="text-slate-600">Employees:</span>
//           <span className="font-bold text-slate-800">{dashboardData?.payroll?.employees || 0}</span>
//         </div>
//         <div className="flex justify-between text-sm md:text-base">
//           <span className="text-slate-600">Status:</span>
//           <span className="font-bold text-blue-600">{dashboardData?.payroll?.status || "Not available"}</span>
//         </div>
//       </div>
//       <button
//         onClick={handleGoToPayroll}
//         className="mt-auto w-full bg-[#104774] hover:bg-[#0d3a61] text-white py-2 px-4 rounded-lg md:rounded-xl font-medium flex items-center justify-center transition-all duration-300 text-sm md:text-base"
//       >
//         Go to Payroll
//         <ArrowRight className="w-4 h-4 ml-2" />
//       </button>
//     </div>
//   </div>

//   {/* Login/Logout Section - MOBILE FRIENDLY */}
//   <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg border border-slate-200 mb-8">
//     <div className="flex items-center justify-between mb-4 md:mb-6">
//       <h2 className="text-lg md:text-xl font-semibold text-slate-800">Log in/Out</h2>
//       <Clock className="w-5 h-5 text-slate-400" />
//     </div>

//     {/* Mobile View - Cards */}
 
//     <div className="block md:hidden space-y-4">
//   {attendanceLog.map((log, index) => (
//     <div 
//       key={index} 
//       className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200"
//     >
//       {/* Top Grid: Name, Team, Login, Logout */}
//       <div className="grid grid-cols-2 gap-4 mb-4">
//         <div>
//           <p className="text-xs text-slate-400 font-semibold">Name</p>
//           <p className="text-sm font-medium text-slate-900">{log.name}</p>
//         </div>
//         <div>
//           <p className="text-xs text-slate-400 font-semibold">Team</p>
//           <p className="text-sm text-slate-700">{log.team}</p>
//         </div>
//         <div>
//           <p className="text-xs text-slate-400 font-semibold">Login</p>
//           <p className="text-sm text-slate-700">{formatTime(log.checkIn)}</p>
//         </div>
//         <div>
//           <p className="text-xs text-slate-400 font-semibold">Logout</p>
//           <p className="text-sm text-slate-700">{formatTime(log.checkOut)}</p>
//         </div>
//       </div>

//       {/* Task & Notes Section */}
//       <div className="space-y-3 mb-4 bg-slate-50 p-3 rounded-lg">
//         <div>
//           <p className="text-xs text-slate-400 font-semibold">Task</p>
//           <p className="text-sm text-slate-700">{log.task || "-"}</p>
//         </div>
//         <div>
//           <p className="text-xs text-slate-400 font-semibold">Work Progress</p>
//           <p className="text-sm text-slate-700">{log.workProgress || "-"}</p>
//         </div>
//         <div>
//           <p className="text-xs text-slate-400 font-semibold">Logout Notes</p>
//           <p className="text-sm text-slate-700">{log.notes || "-"}</p>
//         </div>
//       </div>

//       {/* Status */}
//       <div className="flex justify-start items-center mb-4">
//         <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
//           log.status === "Logged in"
//             ? "bg-green-100 text-green-800"
//             : log.status === "Pending"
//             ? "bg-yellow-100 text-yellow-800"
//             : "bg-red-100 text-red-800"
//         }`}>
//           {log.status}
//         </span>
//       </div>

//       {/* Action Buttons */}
//       {log.action === "Approve" && (
//         <div className="flex gap-3">
//           <button
//             onClick={() => handleApproveAttendance(log._id)}
//             className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
//           >
//             <CheckCircle className="w-5 h-5" /> Approve
//           </button>
//           <button
//             onClick={() => handleRejectAttendance(log._id)}
//             className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
//           >
//             <XCircle className="w-5 h-5" /> Reject
//           </button>
//         </div>
//       )}
//     </div>
//   ))}
// </div>


//     {/* Desktop View - Table */}
//     <div className="hidden md:block overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
//       <table className="w-full border-collapse">
//         <thead className="bg-[#104774] text-white">
//           <tr>
//             <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Name</th>
//             <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Team</th>
//             <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Login</th>
//             <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Logout</th>
//             <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Task</th>
//             <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Work Progress</th>
//             <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Logout Notes</th>
//             <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Status</th>
//             <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Action</th>
//           </tr>
//         </thead>
//         <tbody>
//           {attendanceLog.map((log, index) => (
//             <tr key={index} className={`${index % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-slate-100`}>
//               <td className="px-4 py-3 text-sm font-medium text-slate-800">{log.name}</td>
//               <td className="px-4 py-3 text-sm text-slate-600">{log.team}</td>
//               <td className="px-4 py-3 text-sm text-slate-600">{formatTime(log.checkIn)}</td>
//               <td className="px-4 py-3 text-sm text-slate-600">{formatTime(log.checkOut)}</td>
//               <td className="px-4 py-3 text-sm text-slate-600">{log.task || "-"}</td>
//               <td className="px-4 py-3 text-sm text-slate-600">{log.workProgress || "-"}</td>
//               <td className="px-4 py-3 text-sm text-slate-600">{log.notes || "-"}</td>
//               <td className="px-4 py-3">
//                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                   log.status === "Logged in"
//                     ? "bg-green-100 text-green-700"
//                     : log.status === "Pending"
//                     ? "bg-yellow-100 text-yellow-700"
//                     : "bg-red-100 text-red-700"
//                 }`}>
//                   {log.status}
//                 </span>
//               </td>
//               <td className="px-4 py-3 flex gap-2">
//                 {log.action === "Approve" && (
//                   <>
//                     <button
//                       onClick={() => handleApproveAttendance(log._id)}
//                       className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1"
//                     >
//                       <CheckCircle className="w-4 h-4" /> Approve
//                     </button>
//                     <button
//                       onClick={() => handleRejectAttendance(log._id)}
//                       className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1"
//                     >
//                       <XCircle className="w-4 h-4" /> Reject
//                     </button>
//                   </>
//                 )}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   </div>
// </div>
//   )

  return (
  <div className="max-h-screen  bg-gray-50">
    {/* Header */}
    <div className="mb-4 md:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="text-center sm:text-left">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1 text-xs sm:text-sm">System overview and management</p>
      </div>
      <button
        onClick={fetchDashboardData}
        disabled={refreshing}
        className="bg-[#104774] text-white px-3 py-2 rounded-md flex items-center justify-center disabled:opacity-50 w-full sm:w-auto text-xs sm:text-sm"
      >
        <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
        {refreshing ? "Refreshing..." : "Refresh Data"}
      </button>
    </div>

    {/* Stats Cards Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4 mb-6">
      {/* Attendance Card */}
      <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm border border-slate-200">
        <div className="flex items-center mb-3">
          <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-blue-100 to-blue-200 rounded-md flex items-center justify-center mr-2">
            <Clock className="w-3 h-3 md:w-4 md:h-4 text-blue-600" />
          </div>
          <h3 className="font-semibold text-slate-800 text-sm md:text-base">Today's Attendance</h3>
        </div>
        <div className="space-y-1 mb-3">
          <div className="flex justify-between text-xs">
            <span className="text-slate-600">Present Today:</span>
            <span className="font-bold text-green-600">{dashboardData?.attendance?.present || 0}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-600">Absent Today:</span>
            <span className="font-bold text-red-600">{dashboardData?.attendance?.absent || 0}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-600">On Leave:</span>
            <span className="font-bold text-orange-600">{dashboardData?.attendance?.onLeave || 0}</span>
          </div>
        </div>
        <button
          onClick={handleGoToAttendance}
          className="w-full bg-[#104774] hover:bg-[#0d3a61] text-white py-1.5 px-3 rounded-md font-medium flex items-center justify-center transition-all duration-300 text-xs"
        >
          Go to Attendance
          <ArrowRight className="w-3 h-3 ml-1" />
        </button>
      </div>

      {/* Leaves Card */}
      <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm border border-slate-200">
        <div className="flex items-center mb-3">
          <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-green-100 to-green-200 rounded-md flex items-center justify-center mr-2">
            <Calendar className="w-3 h-3 md:w-4 md:h-4 text-green-600" />
          </div>
          <h3 className="font-semibold text-slate-800 text-sm md:text-base">Leaves Summary</h3>
        </div>
        <div className="space-y-1 mb-3">
          <div className="flex justify-between text-xs">
            <span className="text-slate-600">Pending Leaves:</span>
            <span className="font-bold text-yellow-600">{dashboardData?.leaves?.pending || 0}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-600">Approved:</span>
            <span className="font-bold text-green-600">{dashboardData?.leaves?.approved || 0}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-600">Rejected:</span>
            <span className="font-bold text-red-600">{dashboardData?.leaves?.rejected || 0}</span>
          </div>
        </div>
        <button
          onClick={handleGoToLeaves}
          className="w-full bg-[#104774] hover:bg-[#0d3a61] text-white py-1.5 px-3 rounded-md font-medium flex items-center justify-center transition-all duration-300 text-xs"
        >
          Go to Leaves
          <ArrowRight className="w-3 h-3 ml-1" />
        </button>
      </div>

      {/* Payroll Card */}
      <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm border border-slate-200">
        <div className="flex items-center mb-3">
          <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-purple-100 to-purple-200 rounded-md flex items-center justify-center mr-2">
            <DollarSign className="w-3 h-3 md:w-4 md:h-4 text-purple-600" />
          </div>
          <h3 className="font-semibold text-slate-800 text-sm md:text-base">Payroll Summary</h3>
        </div>
        <div className="space-y-1 mb-3">
          <div className="flex justify-between text-xs">
            <span className="text-slate-600">Employees:</span>
            <span className="font-bold text-slate-800">{dashboardData?.payroll?.employees || 0}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-600">Status:</span>
            <span className="font-bold text-blue-600">{dashboardData?.payroll?.status || "Not available"}</span>
          </div>
        </div>
        <button
          onClick={handleGoToPayroll}
          className="w-full bg-[#104774] hover:bg-[#0d3a61] text-white py-1.5 px-3 rounded-md font-medium flex items-center justify-center transition-all duration-300 text-xs"
        >
          Go to Payroll
          <ArrowRight className="w-3 h-3 ml-1" />
        </button>
      </div>
    </div>

    {/* Login/Logout Section */}
    <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm border border-slate-200 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm md:text-base font-semibold text-slate-800">Log in/Out</h2>
        <Clock className="w-4 h-4 text-slate-400" />
      </div>

      {/* Mobile Cards */}
      <div className="block md:hidden space-y-4">
        {attendanceLog.map((log, index) => (
          <div 
            key={index} 
            className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <p className="text-xs text-slate-400 font-semibold">Name</p>
                <p className="text-sm font-medium text-slate-900">{log.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold">Team</p>
                <p className="text-sm text-slate-700">{log.team}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold">Login</p>
                <p className="text-sm text-slate-700">{formatTime(log.checkIn)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold">Logout</p>
                <p className="text-sm text-slate-700">{formatTime(log.checkOut)}</p>
              </div>
            </div>
            <div className="space-y-2 mb-3 bg-slate-50 p-3 rounded-lg">
              <div>
                <p className="text-xs text-slate-400 font-semibold">Task</p>
                <p className="text-sm text-slate-700">{log.task || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold">Work Progress</p>
                <p className="text-sm text-slate-700">{log.workProgress || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold">Logout Notes</p>
                <p className="text-sm text-slate-700">{log.notes || "-"}</p>
              </div>
            </div>
            <div className="flex justify-start items-center mb-3">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                log.status === "Logged in" ? "bg-green-100 text-green-800" :
                log.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                "bg-red-100 text-red-800"
              }`}>{log.status}</span>
            </div>
            {log.action === "Approve" && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleApproveAttendance(log._id)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" /> Approve
                </button>
                <button
                  onClick={() => handleRejectAttendance(log._id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse min-w-[600px]">
          <thead className="bg-[#104774] text-white">
            <tr>
              <th className="px-2 py-1.5 text-left text-xs font-semibold uppercase">Name</th>
              <th className="px-2 py-1.5 text-left text-xs font-semibold uppercase">Team</th>
              <th className="px-2 py-1.5 text-left text-xs font-semibold uppercase">Login</th>
              <th className="px-2 py-1.5 text-left text-xs font-semibold uppercase">Logout</th>
              <th className="px-2 py-1.5 text-left text-xs font-semibold uppercase">Task</th>
              <th className="px-2 py-1.5 text-left text-xs font-semibold uppercase">Work Progress</th>
              <th className="px-2 py-1.5 text-left text-xs font-semibold uppercase">Logout Notes</th>
              <th className="px-2 py-1.5 text-left text-xs font-semibold uppercase">Status</th>
              <th className="px-2 py-1.5 text-left text-xs font-semibold uppercase">Action</th>
            </tr>
          </thead>
          <tbody>
            {attendanceLog.map((log, index) => (
              <tr key={index} className={`${index % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-slate-100`}>
                <td className="px-2 py-1.5 text-xs font-medium text-slate-800 max-w-[100px] truncate">{log.name}</td>
                <td className="px-2 py-1.5 text-xs text-slate-600 max-w-[80px] truncate">{log.team}</td>
                <td className="px-2 py-1.5 text-xs text-slate-600">{formatTime(log.checkIn)}</td>
                <td className="px-2 py-1.5 text-xs text-slate-600">{formatTime(log.checkOut)}</td>
                <td className="px-2 py-1.5 text-xs text-slate-600 max-w-[120px] truncate">{log.task || "-"}</td>
                <td className="px-2 py-1.5 text-xs text-slate-600 max-w-[120px] truncate">{log.workProgress || "-"}</td>
                <td className="px-2 py-1.5 text-xs text-slate-600 max-w-[120px] truncate">{log.notes || "-"}</td>
                <td className="px-2 py-1.5">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    log.status === "Logged in" ? "bg-green-100 text-green-700" :
                    log.status === "Pending" ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700"
                  }`}>{log.status}</span>
                </td>
                <td className="px-2 py-1.5">
                  {log.action === "Approve" && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleApproveAttendance(log._id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1"
                      >
                        <CheckCircle className="w-3 h-3" /> Approve
                      </button>
                      <button
                        onClick={() => handleRejectAttendance(log._id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1"
                      >
                        <XCircle className="w-3 h-3" /> Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);



// return (
//   <div className="min-h-screen p-3 md:p-4 lg:p-6 bg-gray-50">
//     {/* Header */}
//     <div className="mb-4 md:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
//       <div className="text-center sm:text-left">
//         <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">Admin Dashboard</h1>
//         <p className="text-gray-600 mt-1 text-xs sm:text-sm">System overview and management</p>
//       </div>
//       <button
//         onClick={fetchDashboardData}
//         disabled={refreshing}
//         className="bg-[#104774] text-white px-3 py-2 rounded-md flex items-center justify-center disabled:opacity-50 w-full sm:w-auto text-xs sm:text-sm"
//       >
//         <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
//         {refreshing ? "Refreshing..." : "Refresh Data"}
//       </button>
//     </div>

//     {/* Stats Cards Grid */}
//     <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4 mb-6">
//       {/* Attendance Card */}
//       <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm border border-slate-200">
//         <div className="flex items-center mb-3">
//           <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-blue-100 to-blue-200 rounded-md flex items-center justify-center mr-2">
//             <Clock className="w-3 h-3 md:w-4 md:h-4 text-blue-600" />
//           </div>
//           <h3 className="font-semibold text-slate-800 text-sm md:text-base">Today's Attendance</h3>
//         </div>
//         <div className="space-y-1 mb-3">
//           <div className="flex justify-between text-xs">
//             <span className="text-slate-600">Present Today:</span>
//             <span className="font-bold text-green-600">{dashboardData?.attendance?.present || 0}</span>
//           </div>
//           <div className="flex justify-between text-xs">
//             <span className="text-slate-600">Absent Today:</span>
//             <span className="font-bold text-red-600">{dashboardData?.attendance?.absent || 0}</span>
//           </div>
//           <div className="flex justify-between text-xs">
//             <span className="text-slate-600">On Leave:</span>
//             <span className="font-bold text-orange-600">{dashboardData?.attendance?.onLeave || 0}</span>
//           </div>
//         </div>
//         <button
//           onClick={handleGoToAttendance}
//           className="w-full bg-[#104774] hover:bg-[#0d3a61] text-white py-1.5 px-3 rounded-md font-medium flex items-center justify-center transition-all duration-300 text-xs"
//         >
//           Go to Attendance
//           <ArrowRight className="w-3 h-3 ml-1" />
//         </button>
//       </div>

//       {/* Leaves Card */}
//       <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm border border-slate-200">
//         <div className="flex items-center mb-3">
//           <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-green-100 to-green-200 rounded-md flex items-center justify-center mr-2">
//             <Calendar className="w-3 h-3 md:w-4 md:h-4 text-green-600" />
//           </div>
//           <h3 className="font-semibold text-slate-800 text-sm md:text-base">Leaves Summary</h3>
//         </div>
//         <div className="space-y-1 mb-3">
//           <div className="flex justify-between text-xs">
//             <span className="text-slate-600">Pending Leaves:</span>
//             <span className="font-bold text-yellow-600">{dashboardData?.leaves?.pending || 0}</span>
//           </div>
//           <div className="flex justify-between text-xs">
//             <span className="text-slate-600">Approved:</span>
//             <span className="font-bold text-green-600">{dashboardData?.leaves?.approved || 0}</span>
//           </div>
//           <div className="flex justify-between text-xs">
//             <span className="text-slate-600">Rejected:</span>
//             <span className="font-bold text-red-600">{dashboardData?.leaves?.rejected || 0}</span>
//           </div>
//         </div>
//         <button
//           onClick={handleGoToLeaves}
//           className="w-full bg-[#104774] hover:bg-[#0d3a61] text-white py-1.5 px-3 rounded-md font-medium flex items-center justify-center transition-all duration-300 text-xs"
//         >
//           Go to Leaves
//           <ArrowRight className="w-3 h-3 ml-1" />
//         </button>
//       </div>

//       {/* Payroll Card */}
//       <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm border border-slate-200">
//         <div className="flex items-center mb-3">
//           <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-purple-100 to-purple-200 rounded-md flex items-center justify-center mr-2">
//             <DollarSign className="w-3 h-3 md:w-4 md:h-4 text-purple-600" />
//           </div>
//           <h3 className="font-semibold text-slate-800 text-sm md:text-base">Payroll Summary</h3>
//         </div>
//         <div className="space-y-1 mb-3">
//           <div className="flex justify-between text-xs">
//             <span className="text-slate-600">Employees:</span>
//             <span className="font-bold text-slate-800">{dashboardData?.payroll?.employees || 0}</span>
//           </div>
//           <div className="flex justify-between text-xs">
//             <span className="text-slate-600">Status:</span>
//             <span className="font-bold text-blue-600">{dashboardData?.payroll?.status || "Not available"}</span>
//           </div>
//         </div>
//         <button
//           onClick={handleGoToPayroll}
//           className="w-full bg-[#104774] hover:bg-[#0d3a61] text-white py-1.5 px-3 rounded-md font-medium flex items-center justify-center transition-all duration-300 text-xs"
//         >
//           Go to Payroll
//           <ArrowRight className="w-3 h-3 ml-1" />
//         </button>
//       </div>

//       {/* Additional Card for Better Layout */}
//       {/* <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm border border-slate-200">
//         <div className="flex items-center mb-3">
//           <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-orange-100 to-orange-200 rounded-md flex items-center justify-center mr-2">
//             <Users className="w-3 h-3 md:w-4 md:h-4 text-orange-600" />
//           </div>
//           <h3 className="font-semibold text-slate-800 text-sm md:text-base">Employees</h3>
//         </div>
//         <div className="space-y-1 mb-3">
//           <div className="flex justify-between text-xs">
//             <span className="text-slate-600">Total:</span>
//             <span className="font-bold text-slate-800">{dashboardData?.employees?.total || 0}</span>
//           </div>
//           <div className="flex justify-between text-xs">
//             <span className="text-slate-600">Active:</span>
//             <span className="font-bold text-green-600">{dashboardData?.employees?.active || 0}</span>
//           </div>
//         </div>
//         <button
//           onClick={handleGoToEmployees}
//           className="w-full bg-[#104774] hover:bg-[#0d3a61] text-white py-1.5 px-3 rounded-md font-medium flex items-center justify-center transition-all duration-300 text-xs"
//         >
//           Manage Employees
//           <ArrowRight className="w-3 h-3 ml-1" />
//         </button>
//       </div> */}
//     </div>

//     {/* Login/Logout Section */}
//     <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm border border-slate-200">
//       <div className="flex items-center justify-between mb-3">
//         <h2 className="text-sm md:text-base font-semibold text-slate-800">Log in/Out</h2>
//         <Clock className="w-4 h-4 text-slate-400" />
//       </div>

//       {/* Desktop Table */}
//       <div className="overflow-x-auto">
//         <table className="w-full border-collapse min-w-[600px]">
//           <thead className="bg-[#104774] text-white">
//             <tr>
//               <th className="px-2 py-1.5 text-left text-xs font-semibold uppercase">Name</th>
//               <th className="px-2 py-1.5 text-left text-xs font-semibold uppercase">Team</th>
//               <th className="px-2 py-1.5 text-left text-xs font-semibold uppercase">Login</th>
//               <th className="px-2 py-1.5 text-left text-xs font-semibold uppercase">Logout</th>
//               <th className="px-2 py-1.5 text-left text-xs font-semibold uppercase">Task</th>
//               <th className="px-2 py-1.5 text-left text-xs font-semibold uppercase">Status</th>
//               <th className="px-2 py-1.5 text-left text-xs font-semibold uppercase">Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {attendanceLog.map((log, index) => (
//               <tr key={index} className={`${index % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-slate-100`}>
//                 <td className="px-2 py-1.5 text-xs font-medium text-slate-800 max-w-[100px] truncate">{log.name}</td>
//                 <td className="px-2 py-1.5 text-xs text-slate-600 max-w-[80px] truncate">{log.team}</td>
//                 <td className="px-2 py-1.5 text-xs text-slate-600">{formatTime(log.checkIn)}</td>
//                 <td className="px-2 py-1.5 text-xs text-slate-600">{formatTime(log.checkOut)}</td>
//                 <td className="px-2 py-1.5 text-xs text-slate-600 max-w-[120px] truncate">{log.task || "-"}</td>
//                 <td className="px-2 py-1.5">
//                   <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                     log.status === "Logged in" ? "bg-green-100 text-green-700" :
//                     log.status === "Pending" ? "bg-yellow-100 text-yellow-700" :
//                     "bg-red-100 text-red-700"
//                   }`}>
//                     {log.status}
//                   </span>
//                 </td>
//                 <td className="px-2 py-1.5">
//                   {log.action === "Approve" && (
//                     <div className="flex gap-1">
//                       <button
//                         onClick={() => handleApproveAttendance(log._id)}
//                         className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1"
//                       >
//                         <CheckCircle className="w-3 h-3" /> Approve
//                       </button>
//                       <button
//                         onClick={() => handleRejectAttendance(log._id)}
//                         className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1"
//                       >
//                         <XCircle className="w-3 h-3" /> Reject
//                       </button>
//                     </div>
//                   )}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   </div>
// );

};

export default AdminDashboard;
