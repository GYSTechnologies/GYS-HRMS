import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useAuth } from "../context/AppContext";
import LoginModal from "../components/attendance/LoginModal.jsx";
import LogoutModal from "../components/attendance/LogoutModal.jsx";
import RegularizationModal from "../components/attendance/RegularizationModal.jsx";
import NotificationToast from "../components/common/NotificationToast.jsx";
import { Calendar, LogIn , LogOut, User , CheckCircle , AlertTriangle  } from "lucide-react";


const PRIMARY = "#104774";
const PRIMARY_HOVER = "#0d3a61";

const EmployeeAttendance = () => {
  const { token, user } = useAuth();
  const [attendanceData, setAttendanceData] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showRegularizationModal, setShowRegularizationModal] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      fetchTodayAttendance();
      fetchAttendanceHistory();
    }
  }, [token]);

  const addNotification = (message, type = "info", ttl = 4000) => {
    const id = Date.now() + Math.random();
    setNotifications((n) => [...n, { id, message, type }]);
    setTimeout(
      () => setNotifications((n) => n.filter((x) => x.id !== id)),
      ttl
    );
  };

  const fetchTodayAttendance = async () => {
    try {
      const res = await axiosInstance.get("/attendance/today", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAttendanceData(res.data || null);
    } catch (err) {
      console.error("Error fetching today attendance:", err);
      setAttendanceData(null);
      addNotification(
        err?.response?.data?.message || "Could not fetch today attendance",
        "error"
      );
    }
  };

  const fetchAttendanceHistory = async () => {
    try {
      const res = await axiosInstance.get("/attendance/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAttendanceRecords(res.data || []);
    } catch (err) {
      console.error("Error fetching attendance history:", err);
      setAttendanceRecords([]);
      addNotification(
        err?.response?.data?.message || "Could not fetch attendance history",
        "error"
      );
    }
  };

  const fetchLeaveRequests = async () => {
    try {
      const res = await axiosInstance.get("/leave/my-requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data || [];
    } catch (err) {
      console.error("Error fetching leave requests:", err);
      return [];
    }
  };

  const checkIsHoliday = async (date) => {
    try {
      const res = await axiosInstance.get(`/attendance/check-holiday/${date}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.isHoliday;
    } catch (err) {
      console.error("Error checking holiday:", err);
      return false;
    }
  };

  const handleLoginSuccess = (newAttendance) => {
    setAttendanceData(newAttendance);
    setShowLoginModal(false);
    addNotification("Attendance submitted successfully", "success");
    fetchTodayAttendance();
    fetchAttendanceHistory();
  };

  const handleLogoutSuccess = (updatedAttendance) => {
    setAttendanceData(updatedAttendance);
    setShowLogoutModal(false);
    addNotification("Logout recorded successfully", "success");
    fetchTodayAttendance();
    fetchAttendanceHistory();
  };

  const handleRegularizationSuccess = () => {
    setShowRegularizationModal(false);
    addNotification("Regularization request submitted", "success");
    fetchAttendanceHistory();
  };

  const formatTime = (timeString) => {
    if (!timeString) return "-";
    try {
      return new Date(timeString).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "-";
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: "bg-yellow-100 text-yellow-800",
      accepted: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs ${
          statusClasses[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status}
      </span>
    );
  };

  const showMarkAttendanceButton = !attendanceData;
  const showLogoutButton =
    attendanceData &&
    attendanceData.status === "accepted" &&
    !attendanceData.checkOut;

  // Check if current date is in the past for regularization
  const canRequestRegularization = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return true; // Allow regularization for any date
  };

  return (
    <div className="max-h-screen p-3 text-sm">
      <style>{`
        .primary-btn:hover { background: ${PRIMARY_HOVER} !important }
        @media (max-width: 768px) {
          table { font-size: 11px; }
        }
      `}</style>

      <NotificationToast notifications={notifications} />

      <header className="p-2 mb-3">
        <h1 className="text-lg font-bold text-gray-800">My Attendance</h1>
        <p className="text-xs text-gray-600">
          Manage your daily attendance and view history
        </p>
      </header>

      {/* Today's Attendance Section */}
      <div className="bg-white rounded-lg p-3 shadow border border-slate-200 w-full max-w-[300px] mb-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-slate-800 text-sm">
            Today's Attendance
            <span className="text-xs font-normal text-gray-500 ml-1">
              ({new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })})
            </span>
          </h3>
        </div>

        {/* Attendance info - Compact Grid */}
       <div className="mb-2">
  {/* All in one line */}
  <div className="flex flex-wrap items-center gap-3 text-xs">
    {/* Status */}
    <div className="flex items-center gap-1">
      <span className="text-slate-500">Status:</span>
      <span className={`font-medium ${
        attendanceData?.status === "accepted" ? "text-green-500" :
        attendanceData?.status === "pending" ? "text-yellow-500" :
        attendanceData?.status === "rejected" ? "text-red-500" :
        "text-gray-400"
      }`}>
        {attendanceData?.status || "Not Logged In"}
      </span>
    </div>

    {/* Login */}
    <div className="flex items-center gap-1">
      <span className="text-slate-500">Login:</span>
      <span className="font-medium text-slate-900">
        {attendanceData?.checkIn ? formatTime(attendanceData.checkIn) : "-"}
      </span>
    </div>

    {/* Logout */}
    <div className="flex items-center gap-1">
      <span className="text-slate-500">Logout:</span>
      <span className="font-medium text-slate-900">
        {attendanceData?.checkOut ? formatTime(attendanceData.checkOut) : "Pending"}
      </span>
    </div>

    {/* Task - Compact */}
    {attendanceData?.taskDescription && (
      <div className="flex items-center gap-1">
        <span className="text-slate-500">Task:</span>
        <span className="font-medium text-slate-900 truncate max-w-[80px]" title={attendanceData.taskDescription}>
          {attendanceData.taskDescription}
        </span>
      </div>
    )}

    {/* Logout Note - Compact */}
    {attendanceData?.logoutDescription && (
      <div className="flex items-center gap-1">
        <span className="text-slate-500">Note:</span>
        <span className="font-medium text-slate-900 truncate max-w-[60px]" title={attendanceData.logoutDescription}>
          {attendanceData.logoutDescription}
        </span>
      </div>
    )}

    {/* Early Logout - Compact */}
    {attendanceData?.earlyLogoutReason && (
      <div className="flex items-center gap-1">
        <span className="text-red-500">Early:</span>
        <span className="font-medium text-red-700 truncate max-w-[60px]" title={attendanceData.earlyLogoutReason}>
          {attendanceData.earlyLogoutReason}
        </span>
      </div>
    )}
  </div>
</div>

        {/* Buttons */}
        <div className="flex gap-2">
          {showMarkAttendanceButton && (
            <button
              onClick={async () => {
                const today = new Date().toISOString().split("T")[0];
                const isHoliday = await checkIsHoliday(today);
                if (isHoliday) {
                  addNotification("Today is a holiday. Cannot mark attendance.", "warning");
                  return;
                }
                setShowLoginModal(true);
              }}
              className="flex-1 bg-[#104774] hover:bg-[#0d3a61] text-white py-1.5 text-xs rounded font-medium transition-all"
            >
              Mark Attendance
            </button>
          )}
          {showLogoutButton && (
            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex-1 bg-[#104774] hover:bg-[#0d3a61] text-white py-1.5 text-xs rounded font-medium transition-all"
            >
              Log Out
            </button>
          )}
        </div>
      </div>

  {/* Attendance History Section */}
<section className="bg-white shadow rounded p-3">
  <div className="flex items-center justify-between mb-3">
    <h3 className="text-sm font-semibold text-gray-800">
      Attendance History
    </h3>
    <div className="flex items-center gap-1">
      <span className="text-xs text-gray-500">Last 30 days</span>
      <button
        onClick={fetchAttendanceHistory}
        className="p-1 text-gray-500 hover:text-gray-700"
        title="Refresh"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
        </svg>
      </button>
    </div>
  </div>

  {/* Desktop Table - Hidden on mobile */}
  <div className="hidden sm:block overflow-x-auto rounded border border-gray-200">
    <div className="max-h-[350px] overflow-y-auto">
      <table className="min-w-full divide-y divide-gray-200 text-xs">
        <thead className="bg-[#104774] text-white sticky top-0">
          <tr>
            <th className="px-2 py-1.5 text-left font-medium">Date</th>
            <th className="px-2 py-1.5 text-left font-medium">Login</th>
            <th className="px-2 py-1.5 text-left font-medium">Logout</th>
            <th className="px-2 py-1.5 text-left font-medium">Status</th>
            <th className="px-2 py-1.5 text-left font-medium">Work Progress</th>
            <th className="px-2 py-1.5 text-left font-medium">Task</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {attendanceRecords.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-2 py-4 text-center text-gray-500 text-xs">
                No attendance records found
              </td>
            </tr>
          ) : (
            attendanceRecords.map((record) => (
              <tr key={record._id} className="hover:bg-gray-50">
                <td className="px-2 py-1.5 whitespace-nowrap text-gray-700">
                  {formatDate(record.date)}
                </td>
                <td className="px-2 py-1.5 whitespace-nowrap text-gray-700">
                  {record.checkIn ? formatTime(record.checkIn) : "-"}
                </td>
                <td className="px-2 py-1.5 whitespace-nowrap text-gray-700">
                  {record.checkOut ? formatTime(record.checkOut) : "-"}
                </td>
                <td className="px-2 py-1.5 whitespace-nowrap">
                  {getStatusBadge(record.status)}
                </td>
                <td className="px-2 py-1.5 whitespace-nowrap text-gray-700">
                  {record.workProgress || "-"}
                </td>
                <td className="px-2 py-1.5 text-gray-700 relative group">
                  <div className="max-w-[100px] truncate cursor-pointer">
                    {record.taskDescription || "-"}
                  </div>
                  {record.taskDescription && (
                    <div className="absolute left-1/2 top-full mt-1 hidden group-hover:flex -translate-x-1/2 z-20">
                      <div className="bg-gray-800 text-white text-xs rounded px-2 py-1 max-w-[150px] whitespace-normal relative">
                        {record.taskDescription}
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>

  {/* Mobile Cards - Visible only on mobile */}
  <div className="sm:hidden space-y-2">
    {attendanceRecords.length === 0 ? (
      <div className="text-center text-gray-500 p-4 text-xs">
        No attendance records found
      </div>
    ) : (
      attendanceRecords.map((record) => (
        <div key={record._id} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          {/* Header Row */}
          <div className="flex justify-between items-start mb-2">
            <div className="font-medium text-gray-800 text-xs">
              {formatDate(record.date)}
            </div>
            <div className="flex items-center gap-1">
              {getStatusBadge(record.status)}
            </div>
          </div>

          {/* Time Details */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <div className="text-xs text-gray-500">Login</div>
              <div className="text-xs font-medium text-gray-700">
                {record.checkIn ? formatTime(record.checkIn) : "-"}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Logout</div>
              <div className="text-xs font-medium text-gray-700">
                {record.checkOut ? formatTime(record.checkOut) : "-"}
              </div>
            </div>
          </div>

          {/* Work Progress */}
          <div className="mb-2">
            <div className="text-xs text-gray-500">Work Progress</div>
            <div className="text-xs font-medium text-gray-700">
              {record.workProgress || "-"}
            </div>
          </div>

          {/* Task Description */}
          <div>
            <div className="text-xs text-gray-500">Task</div>
            <div className="text-xs font-medium text-gray-700 break-words">
              {record.taskDescription || "-"}
            </div>
          </div>
        </div>
      ))
    )}
  </div>
</section>

      {/* Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
        token={token}
        addNotification={addNotification}
      />

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onSuccess={handleLogoutSuccess}
        attendanceData={attendanceData}
        token={token}
        addNotification={addNotification}
      />

      <RegularizationModal
        isOpen={showRegularizationModal}
        onClose={() => setShowRegularizationModal(false)}
        onSuccess={handleRegularizationSuccess}
        token={token}
        addNotification={addNotification}
        employeeId={user?._id}
      />
    </div>
  );


};

export default EmployeeAttendance;
