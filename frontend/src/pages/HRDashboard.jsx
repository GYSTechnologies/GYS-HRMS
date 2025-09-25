import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import axiosInstance from "../utils/axiosInstance";
import { useAuth } from "../context/AppContext";
import LoginModal from "../components/attendance/LoginModal";
import LogoutModal from "../components/attendance/LogoutModal";

const HRDashboard = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  // Dashboard & attendance states
  const [dashboardData, setDashboardData] = useState(null);
  const [attendanceLog, setAttendanceLog] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState(null);
  const [hrAttendance, setHrAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchHrAttendance();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const [statsRes, attendanceRes, approvalsRes] = await Promise.all([
        axiosInstance.get("/dashboard/hr/stats"),
        axiosInstance.get("/dashboard/hr/attendance-log"),
        axiosInstance.get("/dashboard/hr/pending-approvals"),
      ]);

      setDashboardData(statsRes.data.data);
      setAttendanceLog(attendanceRes.data.data);
      setPendingApprovals(approvalsRes.data.data);
    } catch (error) {
      console.error("Error fetching HR dashboard data:", error);
      alert("Error loading dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchHrAttendance = async () => {
    try {
      const res = await axiosInstance.get("/attendance/hr/today", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHrAttendance(res.data || {});
    } catch (err) {
      console.error("Error fetching HR attendance:", err);
    }
  };

  // Attendance modal handlers
  const handleCheckInSuccess = (newAttendance) => {
    setHrAttendance(newAttendance);
    setShowLoginModal(false);
  };

  const handleCheckOutSuccess = (updatedAttendance) => {
    setHrAttendance(updatedAttendance);
    setShowLogoutModal(false);
  };

  // Approve/Reject attendance
  const handleApproveAttendance = async (attendanceId) => {
    try {
      await axiosInstance.patch(`/dashboard/hr/approve-attendance/${attendanceId}`, { status: "approved" });
      alert("Attendance approved!");
      fetchDashboardData();
      fetchHrAttendance();
    } catch (error) {
      alert(error.response?.data?.message || "Error approving attendance");
    }
  };

  const handleRejectAttendance = async (attendanceId) => {
    try {
      await axiosInstance.patch(`/dashboard/hr/approve-attendance/${attendanceId}`, { status: "rejected" });
      alert("Attendance rejected!");
      fetchDashboardData();
      fetchHrAttendance();
    } catch (error) {
      alert(error.response?.data?.message || "Error rejecting attendance");
    }
  };

  // Open modals
  const handleMarkAttendance = () => setShowLoginModal(true);
  const handleLogout = () => setShowLogoutModal(true);

  if (loading) {
    return (
      <div className="max-h-[80vh] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#104774]"></div>
      </div>
    );
  }

  return (
  <div className="max-h-[80vh] bg-gray-50 p-4 sm:p-6">
    {/* Header */}
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex-1">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">HR Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600">
          Welcome back, {user?.name}! Here's your overview for today.
        </p>
      </div>
      <button
        onClick={() => {
          fetchDashboardData();
          fetchHrAttendance();
        }}
        disabled={refreshing}
        className="bg-[#104774] text-white px-4 py-2 rounded-lg flex items-center justify-center disabled:opacity-50 w-full sm:w-auto"
      >
        <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
        {refreshing ? "Refreshing..." : "Refresh Data"}
      </button>
    </div>

    {/* Stats Cards */}
    <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 mb-8">
      {/* HR Attendance Card */}
      <div
        onClick={() => {
          if (!hrAttendance.checkIn) handleMarkAttendance();
          else if (hrAttendance.checkIn && !hrAttendance.checkOut) handleLogout();
        }}
        className="bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 cursor-pointer flex flex-col min-h-[160px] sm:min-h-[180px]"
      >
        <div className="mb-3 sm:mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800 text-base sm:text-lg">Your Attendance</h3>
          <span
            className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs font-medium ${
              hrAttendance.status === "accepted"
                ? "bg-green-100 text-green-700"
                : hrAttendance.status === "rejected"
                ? "bg-red-100 text-red-700"
                : "bg-yellow-700 text-yellow-200"
            }`}
          >
            {hrAttendance.status
              ? hrAttendance.status.charAt(0).toUpperCase() + hrAttendance.status.slice(1)
              : "Not marked"}
          </span>
        </div>

        <div className="space-y-1 sm:space-y-2 flex-grow overflow-y-auto pr-1 scrollbar-hide">
          <div className="text-xs sm:text-sm text-slate-600 flex items-center">
            Log In:{" "}
            <span className="font-medium text-slate-900 ml-1 truncate">
              {hrAttendance.checkIn ? new Date(hrAttendance.checkIn).toLocaleTimeString() : "Not logged in"}
            </span>
          </div>
          <div className="text-xs sm:text-sm text-slate-600 flex items-center">
            Log Out:{" "}
            <span className="font-medium text-slate-900 ml-1 truncate">
              {hrAttendance.checkOut ? new Date(hrAttendance.checkOut).toLocaleTimeString() : "Pending"}
            </span>
          </div>
        </div>

        <div className="text-center text-xs sm:text-sm text-slate-700 mt-2">
          {hrAttendance.checkOut
            ? "Today's Session Ended"
            : !hrAttendance.checkIn
            ? "Click to Mark Attendance"
            : "Click to Log Out"}
        </div>
      </div>

      {/* Other stats */}
      <div
        onClick={() => navigate("/manage-employees")}
        className="bg-gradient-to-r from-blue-100 to-blue-200 rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 cursor-pointer"
      >
        <div className="mb-3 sm:mb-4">
          <h3 className="font-semibold text-slate-800 text-base sm:text-lg">Total Employees</h3>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1 sm:mb-2">
          {dashboardData?.totalEmployees || 0}
        </div>
        <p className="text-xs sm:text-sm text-green-600 font-medium">Active</p>
      </div>

      <div
        onClick={() => navigate("/hr/leaves")}
        className="bg-gradient-to-r from-orange-100 to-orange-200 rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 cursor-pointer"
      >
        <div className="mb-3 sm:mb-4">
          <h3 className="font-semibold text-slate-800 text-base sm:text-lg">Pending Approvals</h3>
        </div>
        <div className="flex items-baseline mb-1 sm:mb-2">
          <span className="text-2xl sm:text-3xl font-bold text-slate-800 mr-2">
            {pendingApprovals?.leaveRequests || 0}
          </span>
          <span className="text-sm sm:text-lg text-slate-600 truncate">Leave Requests</span>
        </div>
        <div className="flex items-baseline">
          <span className="text-2xl sm:text-3xl font-bold text-slate-800 mr-2">
            {pendingApprovals?.attendance || 0}
          </span>
          <span className="text-sm sm:text-lg text-slate-600 truncate">Attendance</span>
        </div>
      </div>

      <div
        onClick={() => navigate("/hr/payroll")}
        className="bg-gradient-to-r from-green-100 to-green-200 rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 cursor-pointer"
      >
        <div className="mb-3 sm:mb-4">
          <h3 className="font-semibold text-slate-800 text-base sm:text-lg">Payroll Processed</h3>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1 sm:mb-2">
          {dashboardData?.processedPayroll || 0}/{dashboardData?.totalEmployees || 0}
        </div>
        <p className="text-xs sm:text-sm text-slate-600">This Month</p>
      </div>

      <div className="bg-gradient-to-r from-purple-100 to-purple-200 rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 cursor-pointer">
        <div className="mb-3 sm:mb-4">
          <h3 className="font-semibold text-slate-800 text-base sm:text-lg">New Joiners</h3>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1 sm:mb-2">
          {dashboardData?.newJoiners || 0}
        </div>
        <p className="text-xs sm:text-sm text-slate-600">This Week</p>
      </div>
    </div>

    {/* Attendance Table */}
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 mb-8">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-slate-800">Log in/Out</h2>
        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
      </div>

      {/* Mobile Cards View */}
      <div className="block lg:hidden space-y-4">
        {attendanceLog.map((log, index) => (
          <div
            key={log._id || index}
            className="bg-slate-50 rounded-lg p-4 border border-slate-200 shadow-sm"
          >
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-xs text-slate-500 font-medium">Name</p>
                <p className="text-sm font-medium text-slate-800 truncate">{log.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Team</p>
                <p className="text-sm text-slate-600 truncate">{log.team}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Log In</p>
                <p className="text-sm text-slate-600">
                  {log.checkIn
                    ? new Date(log.checkIn).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Log Out</p>
                <p className="text-sm text-slate-600">
                  {log.checkOut
                    ? new Date(log.checkOut).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-"}
                </p>
              </div>
            </div>
            
            <div className="mb-3">
              <p className="text-xs text-slate-500 font-medium">Task</p>
              <p className="text-sm text-slate-600 truncate">{log.task || "-"}</p>
            </div>
            
            <div className="mb-3">
              <p className="text-xs text-slate-500 font-medium">Notes</p>
              <p className="text-sm text-slate-600 truncate">{log.notes || "-"}</p>
            </div>
            
            <div className="flex items-center justify-between">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  log.status === "Logged in"
                    ? "bg-green-100 text-green-700"
                    : log.status === "Pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : log.status === "Rejected"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {log.status}
              </span>
              
              {log.status === "Pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApproveAttendance(log._id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1 transition-colors"
                  >
                    <CheckCircle className="w-3 h-3" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleRejectAttendance(log._id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1 transition-colors"
                  >
                    <XCircle className="w-3 h-3" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
        <table className="w-full border-collapse min-w-[800px]">
          <thead className="bg-[#104774] text-white">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                Team
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                Log in
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                Log out
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                Task
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                Notes
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {attendanceLog.map((log, index) => (
              <tr
                key={log._id || index}
                className={`${
                  index % 2 === 0 ? "bg-white" : "bg-slate-50"
                } hover:bg-slate-100 transition-colors`}
              >
                <td className="px-4 py-3 text-sm font-medium text-slate-800 max-w-[120px] truncate">
                  {log.name}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600 max-w-[100px] truncate">
                  {log.team}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                  {log.checkIn
                    ? new Date(log.checkIn).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-"}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                  {log.checkOut
                    ? new Date(log.checkOut).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-"}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600 max-w-[150px] truncate">
                  {log.task || "-"}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600 max-w-[150px] truncate">
                  {log.notes || "-"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      log.status === "Logged in"
                        ? "bg-green-100 text-green-700"
                        : log.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : log.status === "Rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {log.status}
                  </span>
                </td>
                <td className="px-4 py-3 flex gap-2">
                  {log.status === "Pending" && (
                    <>
                      <button
                        onClick={() => handleApproveAttendance(log._id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectAttendance(log._id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    {/* Modals */}
    {showLoginModal && (
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleCheckInSuccess}
        token={token}
        addNotification={(msg) => alert(msg)}
        basePath="/attendance/hr"
      />
    )}
    {showLogoutModal && (
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onSuccess={handleCheckOutSuccess}
        attendanceData={hrAttendance}
        token={token}
        addNotification={(msg) => alert(msg)}
        basePath="/attendance/hr"
      />
    )}
  </div>
);

  // return (
  //   <div className="min-h-[80vh] p-6">
  //     {/* Header */}
  //     <div className="mb-6 flex items-center justify-between">
  //       <div>
  //         <h1 className="text-2xl font-bold text-gray-800">HR Dashboard</h1>
  //         <p className="text-gray-600">Welcome back, {user?.name}! Here's your overview for today.</p>
  //       </div>
  //       <button
  //         onClick={() => {
  //           fetchDashboardData();
  //           fetchHrAttendance();
  //         }}
  //         disabled={refreshing}
  //         className="bg-[#104774] text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50"
  //       >
  //         <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
  //         {refreshing ? "Refreshing..." : "Refresh Data"}
  //       </button>
  //     </div>

  //     {/* Stats Cards */}
  //     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
  //       {/* HR Attendance Card */}
  //       <div
  //         onClick={() => {
  //           if (!hrAttendance.checkIn) handleMarkAttendance();
  //           else if (hrAttendance.checkIn && !hrAttendance.checkOut) handleLogout();
  //         }}
  //         className="bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 cursor-pointer flex flex-col h-[180px]"
  //       >
  //         <div className="mb-4 flex items-center justify-between">
  //           <h3 className="font-semibold text-slate-800 text-lg">Your Attendance</h3>
  //           <span
  //             className={`px-3 py-1.5 rounded-full text-xs font-medium ${
  //               hrAttendance.status === "accepted"
  //                 ? "bg-green-100 text-green-700"
  //                 : hrAttendance.status === "rejected"
  //                 ? "bg-red-100 text-red-700"
  //                 : "bg-yellow-700 text-yellow-200"
  //             }`}
  //           >
  //             {hrAttendance.status
  //               ? hrAttendance.status.charAt(0).toUpperCase() + hrAttendance.status.slice(1)
  //               : "Not marked"}
  //           </span>
  //         </div>

  //         <div className="space-y-2 flex-grow overflow-y-auto pr-1 scrollbar-hide">
  //           <div className="text-sm text-slate-600 flex items-center">
  //             Log In:{" "}
  //             <span className="font-medium text-slate-900 ml-1">
  //               {hrAttendance.checkIn ? new Date(hrAttendance.checkIn).toLocaleTimeString() : "Not logged in"}
  //             </span>
  //           </div>
  //           <div className="text-sm text-slate-600 flex items-center">
  //             Log Out:{" "}
  //             <span className="font-medium text-slate-900 ml-1">
  //               {hrAttendance.checkOut ? new Date(hrAttendance.checkOut).toLocaleTimeString() : "Pending"}
  //             </span>
  //           </div>
  //         </div>

  //         <div className="text-center text-sm text-slate-700">
  //           {hrAttendance.checkOut
  //             ? "Today's Session Ended"
  //             : !hrAttendance.checkIn
  //             ? "Click to Mark Attendance"
  //             : "Click to Log Out"}
  //         </div>
  //       </div>

  //       {/* Other stats */}
  //       <div
  //         onClick={() => navigate("/manage-employees")}
  //         className="bg-gradient-to-r from-blue-100 to-blue-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 cursor-pointer"
  //       >
  //         <div className="mb-4">
  //           <h3 className="font-semibold text-slate-800 text-lg">Total Employees</h3>
  //         </div>
  //         <div className="text-3xl font-bold text-slate-800 mb-2">{dashboardData?.totalEmployees || 0}</div>
  //         <p className="text-sm text-green-600 font-medium">Active</p>
  //       </div>

  //       <div
  //         onClick={() => navigate("/hr/leaves")}
  //         className="bg-gradient-to-r from-orange-100 to-orange-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 cursor-pointer"
  //       >
  //         <div className="mb-4">
  //           <h3 className="font-semibold text-slate-800 text-lg">Pending Approvals</h3>
  //         </div>
  //         <div className="flex items-baseline mb-2">
  //           <span className="text-3xl font-bold text-slate-800 mr-2">{pendingApprovals?.leaveRequests || 0}</span>
  //           <span className="text-lg text-slate-600">Leave Requests</span>
  //         </div>
  //         <div className="flex items-baseline">
  //           <span className="text-3xl font-bold text-slate-800 mr-2">{pendingApprovals?.attendance || 0}</span>
  //           <span className="text-lg text-slate-600">Attendance</span>
  //         </div>
  //       </div>

  //       <div
  //         onClick={() => navigate("/hr/payroll")}
  //         className="bg-gradient-to-r from-green-100 to-green-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 cursor-pointer"
  //       >
  //         <div className="mb-4">
  //           <h3 className="font-semibold text-slate-800 text-lg">Payroll Processed</h3>
  //         </div>
  //         <div className="text-3xl font-bold text-slate-800 mb-2">
  //           {dashboardData?.processedPayroll || 0}/{dashboardData?.totalEmployees || 0}
  //         </div>
  //         <p className="text-sm text-slate-600">This Month</p>
  //       </div>

  //       <div className="bg-gradient-to-r from-purple-100 to-purple-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 cursor-pointer">
  //         <div className="mb-4">
  //           <h3 className="font-semibold text-slate-800 text-lg">New Joiners</h3>
  //         </div>
  //         <div className="text-3xl font-bold text-slate-800 mb-2">{dashboardData?.newJoiners || 0}</div>
  //         <p className="text-sm text-slate-600">This Week</p>
  //       </div>
  //     </div>

  //     {/* Attendance Table */}
  //     <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 mb-8">
  //       <div className="flex items-center justify-between mb-6">
  //         <h2 className="text-xl font-semibold text-slate-800">Log in/Out</h2>
  //         <Clock className="w-5 h-5 text-slate-400" />
  //       </div>

  //       <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
  //         <table className="w-full border-collapse">
  //           <thead className="bg-[#104774] text-white">
  //             <tr>
  //               <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Name</th>
  //               <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Team</th>
  //               <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Log in</th>
  //               <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Log out</th>
  //               <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Task</th>
  //               <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Notes</th>
  //               <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Status</th>
  //               <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Action</th>
  //             </tr>
  //           </thead>
  //           <tbody>
  //             {attendanceLog.map((log, index) => (
  //               <tr
  //                 key={log._id || index}
  //                 className={`${index % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-slate-100 transition-colors`}
  //               >
  //                 <td className="px-4 py-3 text-sm font-medium text-slate-800">{log.name}</td>
  //                 <td className="px-4 py-3 text-sm text-slate-600">{log.team}</td>
  //                 <td className="px-4 py-3 text-sm text-slate-600">
  //                   {log.checkIn ? new Date(log.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-"}
  //                 </td>
  //                 <td className="px-4 py-3 text-sm text-slate-600">
  //                   {log.checkOut ? new Date(log.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-"}
  //                 </td>
  //                 <td className="px-4 py-3 text-sm text-slate-600">{log.task || "-"}</td>
  //                 <td className="px-4 py-3 text-sm text-slate-600">{log.notes || "-"}</td>
  //                 <td className="px-4 py-3">
  //                   <span
  //                     className={`px-2 py-1 rounded-full text-xs font-medium ${
  //                       log.status === "Logged in"
  //                         ? "bg-green-100 text-green-700"
  //                         : log.status === "Pending"
  //                         ? "bg-yellow-100 text-yellow-700"
  //                         : log.status === "Rejected"
  //                         ? "bg-red-100 text-red-700"
  //                         : "bg-gray-100 text-gray-700"
  //                     }`}
  //                   >
  //                     {log.status}
  //                   </span>
  //                 </td>
  //                 <td className="px-4 py-3 flex gap-2">
  //                   {log.status === "Pending" && (
  //                     <>
  //                       <button
  //                         onClick={() => handleApproveAttendance(log._id)}
  //                         className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1 transition-colors"
  //                       >
  //                         <CheckCircle className="w-4 h-4" />
  //                         Approve
  //                       </button>
  //                       <button
  //                         onClick={() => handleRejectAttendance(log._id)}
  //                         className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1 transition-colors"
  //                       >
  //                         <XCircle className="w-4 h-4" />
  //                         Reject
  //                       </button>
  //                     </>
  //                   )}
  //                 </td>
  //               </tr>
  //             ))}
  //           </tbody>
  //         </table>
  //       </div>
  //     </div>

  //     {/* Modals */}
  //     {showLoginModal && (
  //       <LoginModal
  //         isOpen={showLoginModal}
  //         onClose={() => setShowLoginModal(false)}
  //         onSuccess={handleCheckInSuccess}
  //         token={token}
  //         addNotification={(msg) => alert(msg)}
  //         basePath="/attendance/hr"
  //       />
  //     )}
  //     {showLogoutModal && (
  //       <LogoutModal
  //         isOpen={showLogoutModal}
  //         onClose={() => setShowLogoutModal(false)}
  //         onSuccess={handleCheckOutSuccess}
  //         attendanceData={hrAttendance}
  //         token={token}
  //         addNotification={(msg) => alert(msg)}
  //         basePath="/attendance/hr"
  //       />
  //     )}
  //   </div>
  // );
};

export default HRDashboard;
