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

  const navigate = useNavigate();
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
    <div className="min-h-[80vh] p-6 bg-gray-50">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Employee Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, {user?.name}! Here's your overview for today.
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={refreshing}
          className="bg-[#104774] text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
          />
          {refreshing ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

      {/* Top 4 Cards */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
  {/* Today's Attendance Card */}
  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 flex flex-col h-[280px]">
    <div className="flex items-center mb-4">
      <h3 className="font-semibold text-slate-800 text-lg">Today's Attendance</h3>
    </div>

    <div className="mb-4">
      <span
        className={`px-3 py-1.5 rounded-full text-sm font-medium ${
          dashboardData.attendance.status === "accepted"
            ? "bg-green-100 text-green-700"
            : dashboardData.attendance.status === "rejected"
            ? "bg-red-100 text-red-700"
            : "bg-yellow-100 text-yellow-700"
        }`}
      >
        {dashboardData.attendance.status
          ? dashboardData.attendance.status.charAt(0).toUpperCase() +
            dashboardData.attendance.status.slice(1)
          : "Not marked"}
      </span>
    </div>

    <div className="space-y-2 mb-6 flex-grow overflow-y-auto pr-1 scrollbar-hide">
      <div className="text-sm text-slate-600 flex items-center">
        Log In:{" "}
        <span className="font-medium text-slate-900 ml-1">
          {dashboardData.attendance.checkIn
            ? new Date(dashboardData.attendance.checkIn).toLocaleTimeString()
            : "Not logged in"}
        </span>
      </div>
      <div className="text-sm text-slate-600 flex items-center">
        Log Out:{" "}
        <span className="font-medium text-slate-900 ml-1">
          {dashboardData.attendance.checkOut
            ? new Date(dashboardData.attendance.checkOut).toLocaleTimeString()
            : "Pending"}
        </span>
      </div>
    </div>

    {dashboardData.attendance.checkOut ? (
      <div className="w-full text-center py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium">
        Today's Session Ended
      </div>
    ) : !dashboardData.attendance.checkIn ? (
      <button
        onClick={() => setShowLoginModal(true)}
        className="w-full bg-[#104774] hover:bg-[#0d3a61] text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg mt-auto"
      >
        Mark Attendance
      </button>
    ) : (
      <button
        onClick={() => setShowLogoutModal(true)}
        className="w-full bg-[#104774] hover:bg-[#0d3a61] text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg mt-auto"
      >
        Log Out
      </button>
    )}
  </div>

  {/* Leaves Summary Card */}
  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 flex flex-col h-[280px]">
    <div className="flex items-center mb-4">
      <h3 className="font-semibold text-slate-800 text-lg">Leaves Summary</h3>
    </div>

    <div className="space-y-2 mb-6 flex-grow overflow-y-auto pr-1 scrollbar-hide">
      <div className="text-sm text-slate-600">
        Total Leaves:{" "}
        <span className="font-medium text-slate-900">
          {(dashboardData.leaveBalance.sick || 0) +
            (dashboardData.leaveBalance.casual || 0) +
            (dashboardData.leaveBalance.paid || 0)}
        </span>
      </div>
      <div className="text-sm text-slate-600">
        Sick:{" "}
        <span className="font-medium text-red-500 ml-1">
          {dashboardData.leaveBalance.sick || 0}
        </span>
      </div>
      <div className="text-sm text-slate-600">
        Casual:{" "}
        <span className="font-medium text-blue-500 ml-1">
          {dashboardData.leaveBalance.casual || 0}
        </span>
      </div>
      <div className="text-sm text-slate-600">
        Paid:{" "}
        <span className="font-medium text-green-500 ml-1">
          {dashboardData.leaveBalance.paid || 0}
        </span>
      </div>
    </div>

    <button
      onClick={() => setShowLeaveModal(true)}
      className="w-full bg-[#104774] hover:bg-[#0d3a61] text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg mt-auto"
    >
      Apply for Leave
    </button>
  </div>

  {/* Recent Leaves Card */}
  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 flex flex-col h-[280px]">
    <div className="flex items-center mb-4">
      <h3 className="font-semibold text-slate-800 text-lg">Recent Leaves</h3>
    </div>

    <div className="space-y-3 mb-6 flex-grow max-h-[200px] overflow-y-auto pr-1 scrollbar-hide">
      {dashboardData.leaveApplications.slice(0, 5).map((leave, index) => (
        <div key={index} className="text-sm pb-2 last:border-0">
          <div className="flex justify-between">
            <span className="font-medium text-slate-800">
              {formatLeaveTypeName(leave.leaveType)}
            </span>
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                leave.status === "approved"
                  ? "bg-green-100 text-green-700"
                  : leave.status === "rejected"
                  ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {leave.status}
            </span>
          </div>
          <div className="text-slate-600">
            {formatDate(leave.fromDate)} - {formatDate(leave.toDate)}
          </div>
        </div>
      ))}
      {dashboardData.leaveApplications.length === 0 && (
        <div className="text-sm text-slate-500 text-center py-4 mt-9">
          No leave applications yet
        </div>
      )}
    </div>

    <button
      onClick={() => navigate("/employee/leaves")}
      className="w-full bg-[#104774] hover:bg-[#0d3a61] text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg mt-auto"
    >
      View All Leaves
    </button>
  </div>

  {/* Performance Card */}
  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 flex flex-col h-[280px]">
    <div className="flex items-center mb-4">
      <h3 className="font-semibold text-slate-800 text-lg">Performance</h3>
    </div>

    <div className="space-y-2 mb-6 flex-grow overflow-y-auto pr-1 scrollbar-hide">
      <div className="text-sm text-slate-600">
        Attendance Rate:{" "}
        <span className="font-medium text-slate-900">{attendancePercentage}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 rounded-full"
          style={{ width: `${attendancePercentage}%` }}
        ></div>
      </div>
      <div className="text-sm text-slate-600">
        Present Days:{" "}
        <span className="font-medium text-slate-900">
          {dashboardData.attendanceSummary.present || 0}
        </span>
      </div>
      <div className="text-sm text-slate-600">
        Leaves Taken:{" "}
        <span className="font-medium text-slate-900">
          {dashboardData.attendanceSummary.leave || 0}
        </span>
      </div>
    </div>

    <button
      onClick={() => navigate("/employee/attendance")}
      className="w-full bg-[#104774] hover:bg-[#0d3a61] text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg mt-auto"
    >
      View Attendance
    </button>
  </div>
</div>


      {/* Bottom 2 Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Summary Card */}
        <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 border border-slate-200 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-slate-800 flex items-center">
              <UserCheck className="w-5 h-5 mr-2 text-blue-500" />
              Attendance Summary
            </h3>
            <span className="text-sm text-gray-500">Last 30 Days</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4 flex-grow">
            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-100">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {dashboardData.attendanceSummary.present || 0}
              </div>
              <div className="text-xs text-slate-600 font-medium">
                Present days
              </div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {dashboardData.attendanceSummary.leave || 0}
              </div>
              <div className="text-xs text-slate-600 font-medium">
                On leave days
              </div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-100">
              <div className="text-2xl font-bold text-yellow-600 mb-1">25</div>
              <div className="text-xs text-slate-600 font-medium">
               Working days
              </div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-100">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {dashboardData.attendanceSummary.holidays || 0}
              </div>
              <div className="text-xs text-slate-600 font-medium">Holidays</div>
            </div>
          </div>

          {/* <div className="bg-gradient-to-r from-[#104774] to-[#0d3a61] text-white px-4 py-2.5 rounded-lg text-center text-base font-semibold shadow-md mt-auto">
            Attendance Rate: {attendancePercentage}%
          </div> */}
        </div>

        {/* Leave Balance Card */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 border border-blue-100">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xl font-semibold text-slate-800">
              Leave Balance
            </h3>
            <span className="text-sm text-gray-500">Remaining</span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-slate-100">
              <div className="text-2xl font-bold text-red-500 mb-1">
                {dashboardData.leaveBalance.sick || 0}
              </div>
              <div className="text-xs text-slate-600 font-medium">
                Sick Leave
              </div>
            </div>
            <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-slate-100">
              <div className="text-2xl font-bold text-blue-500 mb-1">
                {dashboardData.leaveBalance.casual || 0}
              </div>
              <div className="text-xs text-slate-600 font-medium">
                Casual Leave
              </div>
            </div>
            <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-slate-100">
              <div className="text-2xl font-bold text-green-500 mb-1">
                {dashboardData.leaveBalance.paid || 0}
              </div>
              <div className="text-xs text-slate-600 font-medium">
                Paid Leave
              </div>
            </div>
            <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-slate-100">
              <div className="text-2xl font-bold text-purple-500 mb-1">
                {dashboardData.leaveBalance.other || 0}
              </div>
              <div className="text-xs text-slate-600 font-medium">
                Other Leave
              </div>
            </div>
          </div>

          {/* <button
            onClick={() => setShowLeaveModal(true)}
            className="w-full bg-gradient-to-r from-[#104774] to-[#0d3a61] text-white py-2.5 px-4 rounded-xl text-base font-semibold transition-all duration-300 transform hover:scale-[1.02] shadow-md flex items-center justify-center"
          >
            <FileText className="w-4 h-4 mr-2" />
            Apply for Leave
          </button> */}
        </div>
      </div>

      {/* Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleCheckInSuccess}
        token={token}
      />

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onSuccess={handleCheckOutSuccess}
        attendanceData={dashboardData.attendance}
        token={token}
      />

      <LeaveApplicationModal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        onSuccess={handleLeaveApplicationSuccess}
        token={token}
        leaveBalance={dashboardData.leaveBalance}
        leaveTypes={leaveTypes}
      />
    </div>
  );
};

export default EmployeeDashboard;
