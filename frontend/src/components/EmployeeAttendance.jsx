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
    <div className="min-h-[80vh] p-4">
      <style>{`
        .primary-btn:hover { background: ${PRIMARY_HOVER} !important }
      `}</style>

      <NotificationToast notifications={notifications} />

      <header className="p-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Attendance</h1>
        <p className="text-sm text-gray-600">
          Manage your daily attendance and view history
        </p>
      </header>

      {/* Today's Attendance Section */}
<div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 flex flex-col h-[250px] w-[350px] mb-5">
  {/* Header */}
  <div className="flex items-center justify-between mb-4">
    <h3 className="font-semibold text-slate-800 text-lg">
      Today's Attendance
      <span className="text-sm font-normal text-gray-500 ml-2">
        ({new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })})
      </span>
    </h3>
  </div>

  {/* Attendance info */}
  <div className="flex-grow space-y-3 overflow-y-auto pr-1 scrollbar-hide mb-4">
    {/* Status */}
    <div className="text-sm text-slate-600">
      Status:{" "}
      <span
        className={`font-medium ${
          attendanceData?.status === "accepted"
            ? "text-green-500"
            : attendanceData?.status === "pending"
            ? "text-yellow-400"
            : attendanceData?.status === "rejected"
            ? "text-red-500"
            : "text-gray-400"
        }`}
      >
        {attendanceData?.status || "Not Logged In"}
      </span>
    </div>

    {/* Login Time */}
    <div className="text-sm text-slate-600">
      Login Time:{" "}
      <span className="font-medium text-slate-900">
        {attendanceData?.checkIn ? formatTime(attendanceData.checkIn) : "-"}
      </span>
    </div>
    {attendanceData?.taskDescription && (
      <div className="text-sm text-slate-600">
        Task:{" "}
        <span className="font-medium text-slate-900" title={attendanceData.taskDescription}>
          {attendanceData.taskDescription}
        </span>
      </div>
    )}

    {/* Logout Time */}
    <div className="text-sm text-slate-600">
      Logout Time:{" "}
      <span className="font-medium text-slate-900">
        {attendanceData?.checkOut ? formatTime(attendanceData.checkOut) : "Pending"}
      </span>
    </div>
    {attendanceData?.logoutDescription && (
      <div className="text-sm text-slate-600">
        Logout Note:{" "}
        <span className="font-medium text-slate-900" title={attendanceData.logoutDescription}>
          {attendanceData.logoutDescription}
        </span>
      </div>
    )}
    {attendanceData?.earlyLogoutReason && (
      <div className="text-sm text-red-600">
        Early Logout:{" "}
        <span className="font-medium" title={attendanceData.earlyLogoutReason}>
          {attendanceData.earlyLogoutReason}
        </span>
      </div>
    )}
  </div>

  {/* Buttons */}
  <div className="flex gap-2 mt-auto">
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
        className="flex-1 bg-[#104774] hover:bg-[#0d3a61] text-white py-2 rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-lg"
      >
        Mark Attendance
      </button>
    )}
    {showLogoutButton && (
      <button
        onClick={() => setShowLogoutModal(true)}
        className="flex-1 bg-[#104774] hover:bg-[#0d3a61] text-white py-2 rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-lg"
      >
        Log Out
      </button>
    )}
  </div>
</div>


      {/* Attendance History Section */}
   
      <section className="bg-white shadow rounded-lg p-6  ">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">
            Attendance History
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Last 30 days</span>
            <button
              onClick={fetchAttendanceHistory}
              className="p-2 text-gray-500 hover:text-gray-700"
              title="Refresh"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 
            0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Table Wrapper with fixed height */}
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <div className="max-h-[400px] overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#104774] text-white sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Login
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Logout
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Work Progress
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Task
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {attendanceRecords.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No attendance records found
                    </td>
                  </tr>
                ) : (
                  attendanceRecords.map((record) => (
                    <tr
                      key={record._id}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {formatDate(record.date)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {record.checkIn ? formatTime(record.checkIn) : "-"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {record.checkOut ? formatTime(record.checkOut) : "-"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {getStatusBadge(record.status)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {record.workProgress || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 relative group">
                        <div className="max-w-xs truncate cursor-pointer">
                          {record.taskDescription || "-"}
                        </div>

                        {/* Tooltip */}
                        {record.taskDescription && (
                          <div className="absolute left-1/2 top-full mt-2 hidden group-hover:flex -translate-x-1/2 z-20">
                            <div className="bg-gray-800 text-white text-xs rounded-lg shadow-lg px-3 py-2 max-w-sm whitespace-normal relative animate-fadeIn">
                              {record.taskDescription}
                              {/* Arrow */}
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
