import React, { useState, useEffect } from "react";
import {
  Clock,
  Calendar,
  DollarSign,
  RefreshCw,
  CheckSquare,
  X,
  AlertCircle,
  TrendingUp,
  UserCheck,
  FileText,
  LogOut,
  LogIn,
  Heart,
  Coffee,
  CheckCircle,
} from "lucide-react";
import axiosInstance from "../utils/axiosInstance";
import { useAuth } from "../context/AppContext";
import LoginModal from "../components/attendance/LoginModal";
import LogoutModal from "../components/attendance/LogoutModal";
import LeaveApplicationModal from "../components/modals/LeaveApplicationModal";
import NotificationToast from "../components/common/NotificationToast.jsx";

import { useNavigate } from "react-router-dom";
import { format } from "date-fns"; // npm install date-fns

const EmployeeDashboard = () => {
  const { token, user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    attendance: {},
    leaveBalance: {},
    attendanceSummary: {},
    leaveApplications: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const navigate = useNavigate();

  const addNotification = (message, type = "info", ttl = 4000) => {
    const id = Date.now() + Math.random();
    setNotifications((n) => [...n, { id, message, type }]);
    setTimeout(
      () => setNotifications((n) => n.filter((x) => x.id !== id)),
      ttl
    );
  };

  // Fetch all dashboard data using your existing APIs
  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);

      // Fetch today's attendance (using your attendance API)
      const attendanceRes = await axiosInstance.get("/attendance/today", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const attendanceData = attendanceRes.data || {};

      // Fetch leave balance (using your leave API)
      const leaveRes = await axiosInstance.get("/leave/balance", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const leaveData = leaveRes.data?.balance || {};

      // Fetch attendance summary (last 30 days) - using your attendance history API
      const summaryRes = await axiosInstance.get("/attendance/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const attendanceRecords = summaryRes.data || [];

      // Calculate summary from attendance records
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);

      const summaryData = {
        present: attendanceRecords.filter(
          (record) =>
            record.status === "accepted" &&
            new Date(record.date) >= thirtyDaysAgo
        ).length,
        absent: 0, // You might need to calculate this based on working days
        leave: attendanceRecords.filter(
          (record) =>
            record.status === "on_leave" &&
            new Date(record.date) >= thirtyDaysAgo
        ).length,
        holidays: 0, // You might need to fetch this from another endpoint
      };

      // Fetch leave applications (using your leave API)
      const leaveAppsRes = await axiosInstance.get("/leave/my-requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const leaveApplications = leaveAppsRes.data || [];

      setDashboardData({
        attendance: attendanceData,
        leaveBalance: leaveData,
        attendanceSummary: summaryData,
        leaveApplications: leaveApplications,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch leave types
  const fetchLeaveTypes = async () => {
    try {
      const res = await axiosInstance.get("/leave/get-leaveTypes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const activeTypes = (res.data || []).filter((type) => type.isActive);
      setLeaveTypes(activeTypes);
    } catch (err) {
      console.error("Error fetching leave types:", err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchLeaveTypes();
  }, []);

  const handleCheckInSuccess = () => {
    setShowLoginModal(false);
    fetchDashboardData();
  };

  const handleCheckOutSuccess = () => {
    setShowLogoutModal(false);
    fetchDashboardData();
  };

  const handleLeaveApplicationSuccess = () => {
    setShowLeaveModal(false);
    fetchDashboardData();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return format(new Date(dateStr), "dd MMM yy"); // 25 Sep 25
  };

  // Get leave type icon
  const getLeaveTypeIcon = (type) => {
    switch (type) {
      case "sick":
        return <Heart size={16} className="text-red-400 mr-2" />;
      case "casual":
        return <Coffee size={16} className="text-purple-400 mr-2" />;
      case "paid":
        return <CheckCircle size={16} className="text-green-400 mr-2" />;
      default:
        return <Calendar size={16} className="text-blue-400 mr-2" />;
    }
  };

  // Format leave type name
  const formatLeaveTypeName = (type) =>
    type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#104774]"></div>
      </div>
    );
  }

  // Calculate attendance percentage
  const workingDays = 26; // Assuming 22 working days in a month
  const attendancePercentage = Math.round(
    (dashboardData.attendanceSummary.present / workingDays) * 100
  );

  return (
    <div className="max-h-screen  bg-gray-50">
      {/* Header */}
      <NotificationToast notifications={notifications} />

      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-lg font-bold text-gray-800">Employee Dashboard</h1>
          <p className="text-xs text-gray-600 mt-1">
            Welcome back, {user?.name}! Here's your overview for today.
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={refreshing}
          className="bg-[#104774] text-white px-3 py-1.5 rounded text-xs flex items-center disabled:opacity-50 w-full sm:w-auto justify-center"
        >
          <RefreshCw className={`w-3 h-3 mr-1 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Main Grid - More Compact */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-4">
  
  {/* Today's Attendance */}
  <div className="bg-white rounded-lg p-3 shadow border border-slate-200 flex flex-col justify-between">
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-slate-800 text-sm">Today's Attendance</h3>
        <span className={`px-2 py-0.5 rounded-full text-xs ${
          dashboardData.attendance.status === "accepted" ? "bg-green-100 text-green-700" : 
          dashboardData.attendance.status === "rejected" ? "bg-red-100 text-red-700" : 
          "bg-yellow-100 text-yellow-700"
        }`}>
          {dashboardData.attendance.status ? 
            dashboardData.attendance.status.charAt(0).toUpperCase() + dashboardData.attendance.status.slice(1) : 
            "Pending"
          }
        </span>
      </div>

      <div className="space-y-1 text-xs mb-3">
        <div className="flex justify-between">
          <span className="text-slate-600">Log In:</span>
          <span className="font-medium">
            {dashboardData.attendance.checkIn ? 
              new Date(dashboardData.attendance.checkIn).toLocaleTimeString() : 
              "--:--:--"
            }
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">Log Out:</span>
          <span className="font-medium">
            {dashboardData.attendance.checkOut ? 
              new Date(dashboardData.attendance.checkOut).toLocaleTimeString() : 
              "Pending"
            }
          </span>
        </div>
      </div>

      {dashboardData.attendance.checkOut && (
        <div className="w-full text-center py-1.5 bg-gray-100 text-gray-700 rounded text-xs mt-12">
          Session Ended
        </div>
      )}
    </div>

    <div className="mt-3">
      {!dashboardData.attendance.checkOut && !dashboardData.attendance.checkIn && (
        <button onClick={() => setShowLoginModal(true)} className="w-full bg-[#104774] text-white py-1.5 rounded text-xs">
          Mark Attendance
        </button>
      )}
      {!dashboardData.attendance.checkOut && dashboardData.attendance.checkIn && (
        <button onClick={() => setShowLogoutModal(true)} className="w-full bg-[#104774] text-white py-1.5 rounded text-xs">
          Log Out
        </button>
      )}
    </div>
  </div>

  {/* Leaves Summary */}
  <div className="bg-white rounded-lg p-3 shadow border border-slate-200 flex flex-col justify-between">
    <div>
      <h3 className="font-semibold text-slate-800 text-sm mb-2">Leaves Summary</h3>
      <div className="space-y-1 text-xs mb-3">
        <div className="flex justify-between">
          <span className="text-slate-600">Total Leaves:</span>
          <span className="font-medium">
            {(dashboardData.leaveBalance.sick || 0) + 
             (dashboardData.leaveBalance.casual || 0) + 
             (dashboardData.leaveBalance.paid || 0)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">Sick:</span>
          <span className="font-medium text-red-500">{dashboardData.leaveBalance.sick || 0}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">Casual:</span>
          <span className="font-medium text-blue-500">{dashboardData.leaveBalance.casual || 0}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">Paid:</span>
          <span className="font-medium text-green-500">{dashboardData.leaveBalance.paid || 0}</span>
        </div>
      </div>
    </div>

    <button onClick={() => setShowLeaveModal(true)} className="w-full bg-[#104774] text-white py-1.5 rounded text-xs mt-3">
      Apply for Leave
    </button>
  </div>

  {/* Performance */}
  <div className="bg-white rounded-lg p-3 shadow border border-slate-200 flex flex-col justify-between">
    <div>
      <h3 className="font-semibold text-slate-800 text-sm mb-2">Performance</h3>
      <div className="space-y-1 text-xs mb-3">
        <div className="flex justify-between items-center">
          <span className="text-slate-600">Attendance:</span>
          <span className="font-medium">{attendancePercentage}%</span>
        </div>
        <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 rounded-full" style={{ width: `${attendancePercentage}%` }}></div>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">Present:</span>
          <span className="font-medium">{dashboardData.attendanceSummary.present || 0}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">Leaves Taken:</span>
          <span className="font-medium">{dashboardData.attendanceSummary.leave || 0}</span>
        </div>
      </div>
    </div>

    <button onClick={() => navigate("/employee/attendance")} className="w-full bg-[#104774] text-white py-1.5 rounded text-xs mt-3">
      View Attendance
    </button>
  </div>

  {/* Recent Leaves */}
  <div className="bg-white rounded-lg p-3 shadow border border-slate-200 flex flex-col justify-between">
    <div>
      <h3 className="font-semibold text-slate-800 text-sm mb-2">Recent Leaves</h3>
      <div className="space-y-2 text-xs mb-3 max-h-[80px] overflow-y-auto">
        {dashboardData.leaveApplications.slice(0, 2).map((leave, index) => (
          <div key={index} className="flex justify-between items-center">
            <div>
              <div className="font-medium">{formatLeaveTypeName(leave.leaveType)}</div>
              <div className="text-slate-600">
                {formatDate(leave.fromDate)} - {formatDate(leave.toDate)}
              </div>
            </div>
            <span className={`px-1.5 py-0.5 rounded text-xs ${
              leave.status === "approved" ? "bg-green-100 text-green-700" : 
              leave.status === "rejected" ? "bg-red-100 text-red-700" : 
              "bg-yellow-100 text-yellow-700"
            }`}>
              {leave.status}
            </span>
          </div>
        ))}
        {dashboardData.leaveApplications.length === 0 && (
          <div className="text-slate-500 text-center py-1">No leaves</div>
        )}
      </div>
    </div>

    <button onClick={() => navigate("/employee/leaves")} className="w-full bg-[#104774] text-white py-1.5 rounded text-xs mt-3">
      View All Leaves
    </button>
  </div>

</div>


      {/* Bottom Section - More Compact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        
        {/* Attendance Summary - Compact */}
        <div className="bg-white rounded-lg p-3 shadow border border-slate-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-slate-800 text-sm">Attendance Summary</h3>
            <span className="text-xs text-gray-500">Last 30 Days</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center p-2 bg-green-50 rounded border border-green-100">
              <div className="font-bold text-green-600 text-sm">{dashboardData.attendanceSummary.present || 0}</div>
              <div className="text-xs text-slate-600">Present</div>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded border border-blue-100">
              <div className="font-bold text-blue-600 text-sm">{dashboardData.attendanceSummary.leave || 0}</div>
              <div className="text-xs text-slate-600">On Leave</div>
            </div>
            <div className="text-center p-2 bg-yellow-50 rounded border border-yellow-100">
              <div className="font-bold text-yellow-600 text-sm">25</div>
              <div className="text-xs text-slate-600">Working Days</div>
            </div>
            <div className="text-center p-2 bg-purple-50 rounded border border-purple-100">
              <div className="font-bold text-purple-600 text-sm">{dashboardData.attendanceSummary.holidays || 0}</div>
              <div className="text-xs text-slate-600">Holidays</div>
            </div>
          </div>
        </div>

        {/* Leave Balance - Compact */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 shadow border border-blue-100">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-slate-800 text-sm">Leave Balance</h3>
            <span className="text-xs text-gray-500">Remaining</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center p-2 bg-white rounded shadow-sm border border-slate-100">
              <div className="font-bold text-red-500 text-sm">{dashboardData.leaveBalance.sick || 0}</div>
              <div className="text-xs text-slate-600">Sick</div>
            </div>
            <div className="text-center p-2 bg-white rounded shadow-sm border border-slate-100">
              <div className="font-bold text-blue-500 text-sm">{dashboardData.leaveBalance.casual || 0}</div>
              <div className="text-xs text-slate-600">Casual</div>
            </div>
            <div className="text-center p-2 bg-white rounded shadow-sm border border-slate-100">
              <div className="font-bold text-green-500 text-sm">{dashboardData.leaveBalance.paid || 0}</div>
              <div className="text-xs text-slate-600">Paid</div>
            </div>
            <div className="text-center p-2 bg-white rounded shadow-sm border border-slate-100">
              <div className="font-bold text-purple-500 text-sm">{dashboardData.leaveBalance.other || 0}</div>
              <div className="text-xs text-slate-600">Other</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleCheckInSuccess}
        token={token}
        addNotification={addNotification}
      />

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onSuccess={handleCheckOutSuccess}
        attendanceData={dashboardData.attendance}
        token={token}
        addNotification={addNotification}
      />

      <LeaveApplicationModal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        onSuccess={handleLeaveApplicationSuccess}
        token={token}
        leaveBalance={dashboardData.leaveBalance}
        leaveTypes={leaveTypes}
        addNotification={addNotification}
      />
    </div>
  );


};

export default EmployeeDashboard;
