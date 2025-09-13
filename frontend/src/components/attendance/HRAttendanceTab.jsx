import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import LoginModal from "./LoginModal";
import LogoutModal from "./LogoutModal";

const HRAttendanceTab = ({ token, addNotification, user }) => {
  const [attendanceData, setAttendanceData] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHRAttendanceData();
  }, [token]);

  const fetchHRAttendanceData = async () => {
    try {
      setLoading(true);
      const [todayRes, historyRes] = await Promise.all([
        axiosInstance.get("/attendance/hr/today", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axiosInstance.get("/attendance/hr/history", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setAttendanceData(todayRes.data);
      setAttendanceHistory(historyRes.data || []);
    } catch (error) {
      console.error("Error fetching HR attendance data:", error);
      addNotification("Error loading attendance data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (newAttendance) => {
    setAttendanceData(newAttendance);
    setShowLoginModal(false);
    addNotification("Attendance submitted successfully", "success");
    fetchHRAttendanceData();
  };

  const handleLogoutSuccess = (updatedAttendance) => {
    setAttendanceData(updatedAttendance);
    setShowLogoutModal(false);
    addNotification("Logout recorded successfully", "success");
    fetchHRAttendanceData();
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

  const showMarkAttendance = !attendanceData;
  const showLogoutButton =
    attendanceData?.status === "accepted" && !attendanceData.checkOut;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">My Attendance</h2>
        <button
          onClick={fetchHRAttendanceData}
          className="p-2 text-gray-500 hover:text-gray-700"
          title="Refresh"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {/* Today's Attendance Card */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Today's Attendance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="p-4 bg-white rounded-lg shadow">
            <p className="text-sm text-gray-500">Status</p>
            <p className="text-lg font-semibold">
              {attendanceData?.status ? (
                <span
                  className={`capitalize ${
                    attendanceData.status === "accepted"
                      ? "text-green-600"
                      : attendanceData.status === "pending"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {attendanceData.status}
                </span>
              ) : (
                "Not Logged In"
              )}
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <p className="text-sm text-gray-500">Login Time</p>
            <p className="text-lg font-semibold">
              {attendanceData?.checkIn
                ? formatTime(attendanceData.checkIn)
                : "-"}
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <p className="text-sm text-gray-500">Logout Time</p>
            <p className="text-lg font-semibold">
              {attendanceData?.checkOut
                ? formatTime(attendanceData.checkOut)
                : "Pending"}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          {showMarkAttendance && (
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Mark Attendance
            </button>
          )}
          {showLogoutButton && (
            <button
              onClick={() => setShowLogoutModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Log Out
            </button>
          )}
        </div>
      </div>

      {/* Attendance History */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Attendance History</h3>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading history...</p>
          </div>
        ) : attendanceHistory.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No attendance history found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
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
                    Task
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceHistory.map((record) => (
                  <tr key={record._id} className="hover:bg-gray-50">
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
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <div
                        className="max-w-xs truncate"
                        title={record.taskDescription}
                      >
                        {record.taskDescription || "-"}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {/* <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
        token={token}
        addNotification={addNotification}
        isHR={true}
      />

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onSuccess={handleLogoutSuccess}
        attendanceData={attendanceData}
        token={token}
        addNotification={addNotification}
        isHR={true}
      /> */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
        token={token}
        addNotification={addNotification}
        basePath="/attendance/hr"
      />

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onSuccess={handleLogoutSuccess}
        attendanceData={attendanceData}
        token={token}
        addNotification={addNotification}
        basePath="/attendance/hr"
      />
    </div>
  );
};

export default HRAttendanceTab;
