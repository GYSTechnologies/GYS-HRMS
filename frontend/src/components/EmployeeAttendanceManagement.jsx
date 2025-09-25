import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useAuth } from "../context/AppContext";
import RejectModal from "../components/attendance/RejectModal.jsx";
import NotificationToast from "../components/common/NotificationToast.jsx";
import AdminReportsTab from "../components/attendance/AdminReportsTab.jsx";

const PRIMARY = "#104774";
const PRIMARY_HOVER = "#0d3a61";

const EmployeeAttendanceManagement = () => {
  const { token } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

  const [filters, setFilters] = useState({
    employee: "",
    date: today,
    status: "pending",
    department: "",
    role: "",
  });
  const [stats, setStats] = useState({
    totalEmployees: 0,
    present: 0,
    absent: 0,
    pending: 0,
  });
  const [notifications, setNotifications] = useState([]);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectRemarks, setRejectRemarks] = useState("");
  const [activeTab, setActiveTab] = useState("records");
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    if (token) {
      fetchAllAttendances();
      fetchStats();
      fetchDepartments();
    }
  }, [token]);

  useEffect(() => {
    applyFilters();
  }, [filters, attendanceRecords]);

  const addNotification = (message, type = "info", ttl = 3500) => {
    const id = Date.now() + Math.random();
    setNotifications((n) => [...n, { id, message, type }]);
    setTimeout(
      () => setNotifications((n) => n.filter((x) => x.id !== id)),
      ttl
    );
  };

  const fetchAllAttendances = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/attendance/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAttendanceRecords(response.data || []);
    } catch (error) {
      console.error("Error fetching all attendances:", error);
      addNotification(
        error.response?.data?.message || "Could not fetch attendance records",
        "error"
      );
      setAttendanceRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axiosInstance.get("/attendance/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(response.data || {});
    } catch (error) {
      console.error("Error fetching stats:", error);
      addNotification("Error loading statistics", "error");
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axiosInstance.get("/departments");
      if (res.data.success) {
        setDepartments(res.data.data); // already sorted & filtered
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const applyFilters = () => {
    let filtered = [...attendanceRecords];

    if (filters.employee) {
      filtered = filtered.filter((record) => {
        const fullName = `${record.employee?.profileRef?.firstName || ""} ${
          record.employee?.profileRef?.lastName || ""
        }`.trim();
        return (
          fullName.toLowerCase().includes(filters.employee.toLowerCase()) ||
          (record.employee?.email || "")
            .toLowerCase()
            .includes(filters.employee.toLowerCase())
        );
      });
    }

    if (filters.date) {
      filtered = filtered.filter((record) => {
        if (!record.date) return false;
        return (
          new Date(record.date).toLocaleDateString() ===
          new Date(filters.date).toLocaleDateString()
        );
      });
    }

    if (filters.status) {
      filtered = filtered.filter((record) => record.status === filters.status);
    }

    if (filters.department) {
      filtered = filtered.filter(
        (record) =>
          record.employee?.profileRef?.department === filters.department
      );
    }

    if (filters.role) {
      filtered = filtered.filter(
        (record) => record.employee?.role === filters.role
      );
    }

    setFilteredRecords(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      employee: "",
      date: "",
      status: "",
      department: "",
      role: "",
    });
  };

  const handleApprove = async (id) => {
    try {
      const res = await axiosInstance.patch(
        `/attendance/${id}/admin-approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.attendance) {
        setAttendanceRecords((prev) =>
          prev.map((att) => (att._id === id ? res.data.attendance : att))
        );
      } else {
        fetchAllAttendances();
      }

      fetchStats();
      addNotification(res.data?.message || "Attendance approved", "success");
    } catch (error) {
      console.error("Error approving attendance:", error);
      addNotification(
        error.response?.data?.message || "Error approving attendance",
        "error"
      );
    }
  };

  const handleReject = async (remarks) => {
    if (!selectedAttendance) return;
    try {
      const res = await axiosInstance.patch(
        `/attendance/${selectedAttendance}/admin-reject`,
        { remarks },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.attendance) {
        setAttendanceRecords((prev) =>
          prev.map((att) =>
            att._id === selectedAttendance ? res.data.attendance : att
          )
        );
      } else {
        fetchAllAttendances();
      }

      fetchStats();
      addNotification(res.data?.message || "Attendance rejected", "success");
      setShowRejectModal(false);
      setRejectRemarks("");
      setSelectedAttendance(null);
    } catch (error) {
      console.error("Error rejecting attendance:", error);
      addNotification(
        error.response?.data?.message || "Error rejecting attendance",
        "error"
      );
    }
  };

  const openRejectModal = (id) => {
    setSelectedAttendance(id);
    setShowRejectModal(true);
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

  if (loading && attendanceRecords.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div
            className="animate-spin inline-block w-8 h-8 border-4 rounded-full"
            style={{
              borderColor: PRIMARY,
              borderLeftColor: "transparent",
            }}
            role="status"
          />
          <p className="mt-2 text-gray-600">Loading attendance records...</p>
        </div>
      </div>
    );
  }

  return (
  <div className="max-h-[80vh] bg-gray-50">
    <style>{`
      .primary-btn:hover { background: ${PRIMARY_HOVER} !important }
      .primary-border-active { border-bottom-color: ${PRIMARY} !important; color: ${PRIMARY} !important }
    `}</style>

    <NotificationToast notifications={notifications} />

    {/* Header */}
    <header className="p-3 mb-4 md:mb-6">
      <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 text-center sm:text-left">
        Admin Attendance Management
      </h1>
      <p className="text-xs sm:text-sm text-gray-600 mt-1 text-center sm:text-left">
        Manage all employee and HR attendance records
      </p>
    </header>

    {/* Stats */}
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
      {/* Total Employees */}
      <div className="bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg p-3 md:p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer text-center">
        <h3 className="text-xs md:text-sm text-blue-700 font-semibold mb-1">
          Total Employees
        </h3>
        <p className="text-base md:text-lg font-bold text-blue-900">
          {stats.totalEmployees ?? 0}
        </p>
      </div>

      {/* Present Today */}
      <div className="bg-gradient-to-r from-green-100 to-green-200 rounded-lg p-3 md:p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer text-center">
        <h3 className="text-xs md:text-sm text-green-700 font-semibold mb-1">
          Present Today
        </h3>
        <p className="text-base md:text-lg font-bold text-green-900">
          {stats.present ?? 0}
        </p>
      </div>

      {/* Absent Today */}
      <div className="bg-gradient-to-r from-red-100 to-red-200 rounded-lg p-3 md:p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer text-center">
        <h3 className="text-xs md:text-sm text-red-700 font-semibold mb-1">
          Absent Today
        </h3>
        <p className="text-base md:text-lg font-bold text-red-900">
          {Math.max(0, stats?.absent ?? 0)}
        </p>
      </div>

      {/* Pending Approval */}
      <div className="bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-lg p-3 md:p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer text-center">
        <h3 className="text-xs md:text-sm text-yellow-700 font-semibold mb-1">
          Pending Approval
        </h3>
        <p className="text-base md:text-lg font-bold text-yellow-900">
          {stats.pending ?? 0}
        </p>
      </div>
    </div>

    {/* Tabs */}
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 mb-6">
      <div className="border-b border-slate-200">
        <nav className="flex overflow-x-auto">
          <button
            onClick={() => setActiveTab("records")}
            className={`py-2 md:py-3 px-3 md:px-4 text-center border-b-2 font-medium text-xs md:text-sm min-w-max ${
              activeTab === "records"
                ? "primary-border-active"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
            style={
              activeTab === "records"
                ? { borderBottomColor: PRIMARY, color: PRIMARY }
                : {}
            }
          >
            Attendance Records
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`py-2 md:py-3 px-3 md:px-4 text-center border-b-2 font-medium text-xs md:text-sm min-w-max ${
              activeTab === "reports"
                ? "primary-border-active"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
            style={
              activeTab === "reports"
                ? { borderBottomColor: PRIMARY, color: PRIMARY }
                : {}
            }
          >
            Reports & Analytics
          </button>
        </nav>
      </div>

      <div className="p-3 md:p-4">
        {/* Records Tab */}
        {activeTab === "records" && (
          <>
            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mb-4 md:mb-6">
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1">
                  Employee Name/Email
                </label>
                <input
                  type="text"
                  name="employee"
                  value={filters.employee}
                  onChange={handleFilterChange}
                  className="w-full p-2 text-xs border border-slate-300 rounded-md"
                  placeholder="Search employee..."
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={filters.date}
                  onChange={handleFilterChange}
                  className="w-full p-2 text-xs border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full p-2 text-xs border border-slate-300 rounded-md"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="flex items-end gap-2">
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 text-xs bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 w-full"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Records Table */}
            <div className="bg-white rounded-lg">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 md:mb-4 gap-2">
                <h2 className="text-base sm:text-lg font-semibold text-center sm:text-left">
                  Attendance Records
                </h2>
                <div className="flex gap-2 justify-center sm:justify-start">
                  <button
                    onClick={fetchAllAttendances}
                    className="p-2 text-slate-500 hover:text-slate-700 border rounded-md"
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
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Mobile View - Cards */}
              <div className="block md:hidden space-y-3">
                {filteredRecords.map((attendance, index) => (
                  <div
                    key={attendance._id}
                    className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {/* Header with Employee Info and Date */}
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-slate-900 truncate">
                          {attendance.employee?.profileRef?.firstName}{" "}
                          {attendance.employee?.profileRef?.lastName}
                        </h3>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {attendance.employee?.email}
                        </p>
                      </div>
                      <div className="text-right ml-2 flex-shrink-0">
                        <span className="inline-block py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full whitespace-nowrap">
                          {formatDate(attendance.date)}
                        </span>
                      </div>
                    </div>

                    {/* Time Information */}
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div className="bg-slate-50 p-2 rounded">
                        <div className="flex items-center gap-1 mb-1">
                          <svg
                            className="w-3 h-3 text-green-500 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <p className="text-xs font-medium text-slate-500 truncate">
                            Login
                          </p>
                        </div>
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          {formatTime(attendance.checkIn)}
                        </p>
                      </div>

                      <div className="bg-slate-50 p-2 rounded">
                        <div className="flex items-center gap-1 mb-1">
                          <svg
                            className="w-3 h-3 text-red-500 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <p className="text-xs font-medium text-slate-500 truncate">
                            Logout
                          </p>
                        </div>
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          {formatTime(attendance.checkOut) || "-"}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="mb-2">
                      <p className="text-xs font-medium text-slate-500 mb-1">
                        Status
                      </p>
                      <div className="transform scale-90 origin-left">
                        {getStatusBadge(attendance.status)}
                      </div>
                    </div>

                    {/* Work Details */}
                    <div className="space-y-2 mb-2">
                      <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span className="text-xs font-medium text-slate-500 truncate">
                          Work Progress
                        </span>
                        <span className="text-xs text-slate-800 font-medium truncate ml-1">
                          {attendance.workProgress || "-"}
                        </span>
                      </div>

                      <div className="py-1 border-b border-slate-100">
                        <p className="text-xs font-medium text-slate-500 mb-0.5">
                          Task
                        </p>
                        <p className="text-xs text-slate-800 line-clamp-2 break-words">
                          {attendance.taskDescription || "No task description"}
                        </p>
                      </div>

                      <div className="py-1">
                        <p className="text-xs font-medium text-slate-500 mb-0.5">
                          Logout Note
                        </p>
                        <p className="text-xs text-slate-800 line-clamp-2 break-words">
                          {attendance.logoutDescription || "No logout note"}
                        </p>
                      </div>
                    </div>

                    {/* Early/Late Reasons */}
                    {(attendance.earlyLoginReason ||
                      attendance.lateLoginReason ||
                      attendance.earlyLogoutReason) && (
                      <div className="bg-amber-50 border border-amber-200 p-2 rounded mb-1">
                        <div className="flex items-center gap-1 mb-1.5">
                          <svg
                            className="w-3 h-3 text-amber-600 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                          </svg>
                          <p className="text-xs font-semibold text-amber-800 truncate">
                            Attendance Notes
                          </p>
                        </div>

                        <div className="space-y-1">
                          {attendance.earlyLoginReason && (
                            <div className="flex items-start gap-1.5">
                              <span className="inline-flex items-center px-1 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800 mt-0.5 flex-shrink-0">
                                Early
                              </span>
                              <p className="text-[10px] text-amber-700 flex-1 break-words">
                                {attendance.earlyLoginReason}
                              </p>
                            </div>
                          )}

                          {attendance.lateLoginReason && (
                            <div className="flex items-start gap-1.5">
                              <span className="inline-flex items-center px-1 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800 mt-0.5 flex-shrink-0">
                                Late
                              </span>
                              <p className="text-[10px] text-amber-700 flex-1 break-words">
                                {attendance.lateLoginReason}
                              </p>
                            </div>
                          )}

                          {attendance.earlyLogoutReason && (
                            <div className="flex items-start gap-1.5">
                              <span className="inline-flex items-center px-1 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800 mt-0.5 flex-shrink-0">
                                Early Out
                              </span>
                              <p className="text-[10px] text-amber-700 flex-1 break-words">
                                {attendance.earlyLogoutReason}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {filteredRecords.length === 0 && (
                  <div className="text-center p-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex flex-col items-center justify-center">
                      <svg
                        className="w-10 h-10 text-slate-300 mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <h3 className="text-sm font-semibold text-slate-700 mb-1">
                        No attendance records found
                      </h3>
                      <p className="text-xs text-slate-500 px-2">
                        Try adjusting your filters or date range
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Desktop View - Table */}
              <div className="hidden md:block overflow-x-auto">
                <div className="max-h-[280px] overflow-y-auto border border-slate-200 rounded-lg shadow-sm">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-[#104774] text-white sticky top-0 z-10">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold uppercase">Employee</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold uppercase">Date</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold uppercase">Login Time</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold uppercase">Logout Time</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold uppercase">Status</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold uppercase">Work Progress</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold uppercase">Task</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold uppercase">Logout Note</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-200">
                      {filteredRecords.map((attendance, index) => (
                        <tr
                          key={attendance._id}
                          className={`${
                            index % 2 === 0 ? "bg-white" : "bg-slate-50"
                          } transition`}
                        >
                          {/* Employee */}
                          <td className="px-3 py-2 whitespace-nowrap">
                            <div className="font-medium text-slate-800 text-xs">
                              {attendance.employee?.profileRef?.firstName}{" "}
                              {attendance.employee?.profileRef?.lastName}
                            </div>
                            <div className="text-xs text-slate-500">
                              {attendance.employee?.email}
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                              {attendance.employee?.profileRef?.employeeId}
                            </div>
                          </td>

                          {/* Date */}
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-slate-700">
                            {formatDate(attendance.date)}
                          </td>

                          {/* Login Time */}
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-slate-700">
                            {formatTime(attendance.checkIn)}
                          </td>

                          {/* Logout Time */}
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-slate-700">
                            {formatTime(attendance.checkOut) || "-"}
                          </td>

                          {/* Status */}
                          <td className="px-3 py-2 whitespace-nowrap">
                            {getStatusBadge(attendance.status)}
                          </td>

                          {/* Work Progress */}
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-slate-700 max-w-[120px] truncate">
                            {attendance.workProgress || "-"}
                          </td>

                          {/* Task with tooltip and login reasons */}
                          <td className="px-3 py-2 text-xs text-slate-700 max-w-[150px]">
                            <div className="space-y-1">
                              {/* Task Description */}
                              {attendance.taskDescription ? (
                                <div className="relative group">
                                  <div className="truncate cursor-pointer font-medium hover:text-blue-600">
                                    {attendance.taskDescription}
                                  </div>
                                  <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-64 bg-slate-900 text-white text-xs rounded-lg p-2 shadow-lg z-50 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 break-words">
                                    {attendance.taskDescription}
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-slate-900 rotate-45"></div>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-slate-400 italic">-</span>
                              )}

                              {/* Early Login Reason */}
                              {attendance.earlyLoginReason && (
                                <div className="text-xs text-orange-600 mt-1">
                                  <span className="font-medium">Early Login:</span>{" "}
                                  {attendance.earlyLoginReason}
                                </div>
                              )}

                              {/* Late Login Reason */}
                              {attendance.lateLoginReason && (
                                <div className="text-xs text-red-600 mt-1">
                                  <span className="font-medium">Late Login:</span>{" "}
                                  {attendance.lateLoginReason}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Logout Note */}
                          <td className="px-3 py-2 text-xs max-w-[120px]">
                            {attendance.logoutDescription ? (
                              <>
                                <div className="font-medium truncate">
                                  {attendance.logoutDescription}
                                </div>
                                {attendance.earlyLogoutReason && (
                                  <div className="text-xs text-red-600 mt-1">
                                    <span className="font-medium">Early Logout:</span>{" "}
                                    {attendance.earlyLogoutReason}
                                  </div>
                                )}
                              </>
                            ) : (
                              "-"
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <AdminReportsTab
            token={token}
            addNotification={addNotification}
            attendanceRecords={attendanceRecords}
          />
        )}
      </div>
    </div>

    {/* Reject Modal */}
    <RejectModal
      isOpen={showRejectModal}
      onClose={() => {
        setShowRejectModal(false);
        setRejectRemarks("");
        setSelectedAttendance(null);
      }}
      onReject={handleReject}
      remarks={rejectRemarks}
      setRemarks={setRejectRemarks}
    />
  </div>
);

  // return (
  //   <div className="max-h-[80vh] p-4 md:p-6">
  //     <style>{`
  //       .primary-btn:hover { background: ${PRIMARY_HOVER} !important }
  //       .primary-border-active { border-bottom-color: ${PRIMARY} !important; color: ${PRIMARY} !important }
  //     `}</style>

  //     <NotificationToast notifications={notifications} />

  //     <header className="p-4 mb-4 md:mb-6">
  //       <h1 className="text-xl md:text-2xl font-bold text-gray-800 text-center md:text-left">
  //         Admin Attendance Management
  //       </h1>
  //       <p className="text-xs md:text-sm text-gray-600 mt-1 text-center md:text-left">
  //         Manage all employee and HR attendance records
  //       </p>
  //     </header>

  //     {/* Stats */}
  //     <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-4 md:mb-6">
  //       {/* Total Employees */}
  //       <div className="bg-gradient-to-r from-blue-100 via-blue-100 to-blue-200 rounded-xl md:rounded-2xl p-3 md:p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer text-center">
  //         <h3 className="text-xs md:text-sm text-blue-700 font-semibold mb-1 md:mb-2">
  //           Total Employees
  //         </h3>
  //         <p className="text-lg md:text-2xl font-bold text-blue-900">
  //           {stats.totalEmployees ?? 0}
  //         </p>
  //       </div>

  //       {/* Present Today */}
  //       <div className="bg-gradient-to-r from-green-100 via-green-100 to-green-200 rounded-xl md:rounded-2xl p-3 md:p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer text-center">
  //         <h3 className="text-xs md:text-sm text-green-700 font-semibold mb-1 md:mb-2">
  //           Present Today
  //         </h3>
  //         <p className="text-lg md:text-2xl font-bold text-green-900">
  //           {stats.present ?? 0}
  //         </p>
  //       </div>

  //       {/* Absent Today */}
  //       <div className="bg-gradient-to-r from-red-100 via-red-100 to-red-200 rounded-xl md:rounded-2xl p-3 md:p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer text-center">
  //         <h3 className="text-xs md:text-sm text-red-700 font-semibold mb-1 md:mb-2">
  //           Absent Today
  //         </h3>
  //         <p className="text-lg md:text-2xl font-bold text-red-900">
  //           {Math.max(0, stats?.absent ?? 0)}
  //         </p>
  //       </div>

  //       {/* Pending Approval */}
  //       <div className="bg-gradient-to-r from-yellow-100 via-yellow-100 to-yellow-200 rounded-xl md:rounded-2xl p-3 md:p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer text-center">
  //         <h3 className="text-xs md:text-sm text-yellow-700 font-semibold mb-1 md:mb-2">
  //           Pending Approval
  //         </h3>
  //         <p className="text-lg md:text-2xl font-bold text-yellow-900">
  //           {stats.pending ?? 0}
  //         </p>
  //       </div>
  //     </div>

  //     {/* Tabs */}
  //     <div className="bg-white shadow rounded-lg md:rounded-xl mb-6">
  //       <div className="border-b border-gray-200">
  //         <nav className="flex overflow-x-auto">
  //           <button
  //             onClick={() => setActiveTab("records")}
  //             className={`py-3 md:py-4 px-4 md:px-6 text-center border-b-2 font-medium text-xs md:text-sm min-w-max ${
  //               activeTab === "records"
  //                 ? "primary-border-active"
  //                 : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
  //             }`}
  //             style={
  //               activeTab === "records"
  //                 ? { borderBottomColor: PRIMARY, color: PRIMARY }
  //                 : {}
  //             }
  //           >
  //             Attendance Records
  //           </button>
  //           <button
  //             onClick={() => setActiveTab("reports")}
  //             className={`py-3 md:py-4 px-4 md:px-6 text-center border-b-2 font-medium text-xs md:text-sm min-w-max ${
  //               activeTab === "reports"
  //                 ? "primary-border-active"
  //                 : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
  //             }`}
  //             style={
  //               activeTab === "reports"
  //                 ? { borderBottomColor: PRIMARY, color: PRIMARY }
  //                 : {}
  //             }
  //           >
  //             Reports & Analytics
  //           </button>
  //         </nav>
  //       </div>

  //       <div className="p-3 md:p-6">
  //         {/* Records Tab */}
  //         {activeTab === "records" && (
  //           <>
  //             {/* Filters */}
  //             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mb-4 md:mb-6">
  //               <div className="sm:col-span-2 lg:col-span-1">
  //                 <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
  //                   Employee Name/Email
  //                 </label>
  //                 <input
  //                   type="text"
  //                   name="employee"
  //                   value={filters.employee}
  //                   onChange={handleFilterChange}
  //                   className="w-full p-2 text-xs md:text-sm border border-gray-300 rounded-md"
  //                   placeholder="Search employee..."
  //                 />
  //               </div>
  //               <div>
  //                 <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
  //                   Date
  //                 </label>
  //                 <input
  //                   type="date"
  //                   name="date"
  //                   value={filters.date}
  //                   onChange={handleFilterChange}
  //                   className="w-full p-2 text-xs md:text-sm border border-gray-300 rounded-md"
  //                 />
  //               </div>
  //               <div>
  //                 <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
  //                   Status
  //                 </label>
  //                 <select
  //                   name="status"
  //                   value={filters.status}
  //                   onChange={handleFilterChange}
  //                   className="w-full p-2 text-xs md:text-sm border border-gray-300 rounded-md"
  //                 >
  //                   <option value="">All Status</option>
  //                   <option value="pending">Pending</option>
  //                   <option value="accepted">Accepted</option>
  //                   <option value="rejected">Rejected</option>
  //                 </select>
  //               </div>
  //               <div className="flex items-end gap-2">
  //                 <button
  //                   onClick={clearFilters}
  //                   className="px-3 md:px-4 py-2 text-xs md:text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 w-full"
  //                 >
  //                   Clear Filters
  //                 </button>
  //               </div>
  //             </div>

  //             {/* Records Table */}
  //             <div className="bg-white rounded-lg">
  //               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 md:mb-4 gap-2 md:gap-3">
  //                 <h2 className="text-lg md:text-xl font-semibold text-center sm:text-left">
  //                   Attendance Records
  //                 </h2>
  //                 <div className="flex gap-2 justify-center sm:justify-start">
  //                   <button
  //                     onClick={fetchAllAttendances}
  //                     className="p-2 text-gray-500 hover:text-gray-700 border rounded-md"
  //                     title="Refresh"
  //                   >
  //                     <svg
  //                       className="w-4 h-4 md:w-5 md:h-5"
  //                       fill="none"
  //                       stroke="currentColor"
  //                       viewBox="0 0 24 24"
  //                     >
  //                       <path
  //                         strokeLinecap="round"
  //                         strokeLinejoin="round"
  //                         strokeWidth={2}
  //                         d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
  //                       />
  //                     </svg>
  //                   </button>
  //                 </div>
  //               </div>

  //               {/* Mobile View - Cards */}
  //               <div className="block md:hidden space-y-1">
  //                 {filteredRecords.map((attendance, index) => (
  //                   <div
  //                     key={attendance._id}
  //                     className="bg-white rounded-lg p-1 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200"
  //                   >
  //                     {/* Header with Employee Info and Date */}
  //                     <div className="flex justify-between items-start mb-2">
  //                       <div className="flex-1 min-w-0">
  //                         <h3 className="text-sm font-semibold text-gray-900 truncate">
  //                           {attendance.employee?.profileRef?.firstName}{" "}
  //                           {attendance.employee?.profileRef?.lastName}
  //                         </h3>
  //                         <p className="text-xs text-gray-500 truncate mt-0.5">
  //                           {attendance.employee?.email}
  //                         </p>
  //                       </div>
  //                       <div className="text-right ml-2 flex-shrink-0">
  //                         <span className="inline-block py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full whitespace-nowrap">
  //                           {formatDate(attendance.date)}
  //                         </span>
  //                       </div>
  //                     </div>

  //                     {/* Time Information */}
  //                     <div className="grid grid-cols-2 gap-1 mb-2">
  //                       <div className="bg-gray-50 p-2 rounded">
  //                         <div className="flex items-center gap-1 mb-1">
  //                           <svg
  //                             className="w-3 h-3 text-green-500 flex-shrink-0"
  //                             fill="none"
  //                             stroke="currentColor"
  //                             viewBox="0 0 24 24"
  //                           >
  //                             <path
  //                               strokeLinecap="round"
  //                               strokeLinejoin="round"
  //                               strokeWidth="2"
  //                               d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
  //                             />
  //                           </svg>
  //                           <p className="text-xs font-medium text-gray-500 truncate">
  //                             Login
  //                           </p>
  //                         </div>
  //                         <p className="text-xs font-semibold text-gray-800 truncate">
  //                           {formatTime(attendance.checkIn)}
  //                         </p>
  //                       </div>

  //                       <div className="bg-gray-50 p-2 rounded">
  //                         <div className="flex items-center gap-1 mb-1">
  //                           <svg
  //                             className="w-3 h-3 text-red-500 flex-shrink-0"
  //                             fill="none"
  //                             stroke="currentColor"
  //                             viewBox="0 0 24 24"
  //                           >
  //                             <path
  //                               strokeLinecap="round"
  //                               strokeLinejoin="round"
  //                               strokeWidth="2"
  //                               d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
  //                             />
  //                           </svg>
  //                           <p className="text-xs font-medium text-gray-500 truncate">
  //                             Logout
  //                           </p>
  //                         </div>
  //                         <p className="text-xs font-semibold text-gray-800 truncate">
  //                           {formatTime(attendance.checkOut) || "-"}
  //                         </p>
  //                       </div>
  //                     </div>

  //                     {/* Status Badge */}
  //                     <div className="mb-2">
  //                       <p className="text-xs font-medium text-gray-500 mb-1">
  //                         Status
  //                       </p>
  //                       <div className="transform scale-90 origin-left">
  //                         {getStatusBadge(attendance.status)}
  //                       </div>
  //                     </div>

  //                     {/* Work Details */}
  //                     <div className="space-y-1.5 mb-2">
  //                       <div className="flex justify-between items-center py-1 border-b border-gray-100">
  //                         <span className="text-xs font-medium text-gray-500 truncate">
  //                           Work Progress
  //                         </span>
  //                         <span className="text-xs text-gray-800 font-medium truncate ml-1">
  //                           {attendance.workProgress || "-"}
  //                         </span>
  //                       </div>

  //                       <div className="py-1 border-b border-gray-100">
  //                         <p className="text-xs font-medium text-gray-500 mb-0.5">
  //                           Task
  //                         </p>
  //                         <p className="text-xs text-gray-800 line-clamp-2 break-words">
  //                           {attendance.taskDescription ||
  //                             "No task description"}
  //                         </p>
  //                       </div>

  //                       <div className="py-1">
  //                         <p className="text-xs font-medium text-gray-500 mb-0.5">
  //                           Logout Note
  //                         </p>
  //                         <p className="text-xs text-gray-800 line-clamp-2 break-words">
  //                           {attendance.logoutDescription || "No logout note"}
  //                         </p>
  //                       </div>
  //                     </div>

  //                     {/* Early/Late Reasons */}
  //                     {(attendance.earlyLoginReason ||
  //                       attendance.lateLoginReason ||
  //                       attendance.earlyLogoutReason) && (
  //                       <div className="bg-amber-50 border border-amber-200 p-2 rounded mb-1">
  //                         <div className="flex items-center gap-1 mb-1.5">
  //                           <svg
  //                             className="w-3.5 h-3.5 text-amber-600 flex-shrink-0"
  //                             fill="none"
  //                             stroke="currentColor"
  //                             viewBox="0 0 24 24"
  //                           >
  //                             <path
  //                               strokeLinecap="round"
  //                               strokeLinejoin="round"
  //                               strokeWidth="2"
  //                               d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
  //                             />
  //                           </svg>
  //                           <p className="text-xs font-semibold text-amber-800 truncate">
  //                             Attendance Notes
  //                           </p>
  //                         </div>

  //                         <div className="space-y-1">
  //                           {attendance.earlyLoginReason && (
  //                             <div className="flex items-start gap-1.5">
  //                               <span className="inline-flex items-center px-1 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800 mt-0.5 flex-shrink-0">
  //                                 Early
  //                               </span>
  //                               <p className="text-[10px] text-amber-700 flex-1 break-words">
  //                                 {attendance.earlyLoginReason}
  //                               </p>
  //                             </div>
  //                           )}

  //                           {attendance.lateLoginReason && (
  //                             <div className="flex items-start gap-1.5">
  //                               <span className="inline-flex items-center px-1 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800 mt-0.5 flex-shrink-0">
  //                                 Late
  //                               </span>
  //                               <p className="text-[10px] text-amber-700 flex-1 break-words">
  //                                 {attendance.lateLoginReason}
  //                               </p>
  //                             </div>
  //                           )}

  //                           {attendance.earlyLogoutReason && (
  //                             <div className="flex items-start gap-1.5">
  //                               <span className="inline-flex items-center px-1 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800 mt-0.5 flex-shrink-0">
  //                                 Early Out
  //                               </span>
  //                               <p className="text-[10px] text-amber-700 flex-1 break-words">
  //                                 {attendance.earlyLogoutReason}
  //                               </p>
  //                             </div>
  //                           )}
  //                         </div>
  //                       </div>
  //                     )}
  //                   </div>
  //                 ))}

  //                 {filteredRecords.length === 0 && (
  //                   <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border border-gray-100 shadow-sm mx-2">
  //                     <div className="flex flex-col items-center justify-center">
  //                       <svg
  //                         className="w-10 h-10 text-gray-300 mb-2"
  //                         fill="none"
  //                         stroke="currentColor"
  //                         viewBox="0 0 24 24"
  //                       >
  //                         <path
  //                           strokeLinecap="round"
  //                           strokeLinejoin="round"
  //                           strokeWidth="1.5"
  //                           d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
  //                         />
  //                       </svg>
  //                       <h3 className="text-sm font-semibold text-gray-700 mb-1">
  //                         No attendance records found
  //                       </h3>
  //                       <p className="text-xs text-gray-500 px-2">
  //                         Try adjusting your filters or date range
  //                       </p>
  //                     </div>
  //                   </div>
  //                 )}
  //               </div>

  //               {/* Desktop View - Table */}
  //               <div className="hidden md:block overflow-x-auto">
  //                 <div className="max-h-[280px] overflow-y-auto border border-gray-200 rounded-xl shadow-sm">
  //                   <table className="min-w-full divide-y divide-gray-200">
  //                     <thead className="bg-[#104774] text-white sticky top-0 z-10 rounded-t-lg">
  //                       <tr>
  //                         <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
  //                           Employee
  //                         </th>
  //                         <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
  //                           Date
  //                         </th>
  //                         <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
  //                           Login Time
  //                         </th>
  //                         <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
  //                           Logout Time
  //                         </th>
  //                         <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
  //                           Status
  //                         </th>
  //                         <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
  //                           Work Progress
  //                         </th>
  //                         <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
  //                           Task
  //                         </th>
  //                         <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
  //                           Logout Note
  //                         </th>
  //                       </tr>
  //                     </thead>

  //                     <tbody>
  //                       {filteredRecords.map((attendance, index) => (
  //                         <tr
  //                           key={attendance._id}
  //                           className={`${
  //                             index % 2 === 0 ? "bg-white" : "bg-gray-100"
  //                           } transition`}
  //                         >
  //                           {/* Employee */}
  //                           <td className="px-4 py-3 whitespace-nowrap">
  //                             <div className="font-medium text-gray-800 text-sm">
  //                               {attendance.employee?.profileRef?.firstName}{" "}
  //                               {attendance.employee?.profileRef?.lastName}
  //                             </div>
  //                             <div className="text-xs text-gray-500">
  //                               {attendance.employee?.email}
  //                             </div>
  //                             <div className="text-xs text-gray-400 mt-1">
  //                               {attendance.employee?.profileRef?.employeeId}
  //                             </div>
  //                           </td>

  //                           {/* Date */}
  //                           <td className="px-4 py-3 whitespace-nowrap text-xs md:text-sm text-gray-700">
  //                             {formatDate(attendance.date)}
  //                           </td>

  //                           {/* Login Time */}
  //                           <td className="px-4 py-3 whitespace-nowrap text-xs md:text-sm text-gray-700">
  //                             {formatTime(attendance.checkIn)}
  //                           </td>

  //                           {/* Logout Time */}
  //                           <td className="px-4 py-3 whitespace-nowrap text-xs md:text-sm text-gray-700">
  //                             {formatTime(attendance.checkOut) || "-"}
  //                           </td>

  //                           {/* Status */}
  //                           <td className="px-4 py-3 whitespace-nowrap">
  //                             {getStatusBadge(attendance.status)}
  //                           </td>

  //                           {/* Work Progress */}
  //                           <td className="px-4 py-3 whitespace-nowrap text-xs md:text-sm text-gray-700 max-w-[150px] truncate">
  //                             {attendance.workProgress || "-"}
  //                           </td>

  //                           {/* Task with tooltip and login reasons */}
  //                           <td className="px-4 py-3 text-xs md:text-sm text-gray-700 max-w-[200px]">
  //                             <div className="space-y-1">
  //                               {/* Task Description */}
  //                               {attendance.taskDescription ? (
  //                                 <div className="relative group">
  //                                   <div className="truncate cursor-pointer font-medium hover:text-blue-600">
  //                                     {attendance.taskDescription}
  //                                   </div>
  //                                   <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-2 shadow-lg z-50 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 break-words">
  //                                     {attendance.taskDescription}
  //                                     <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-gray-900 rotate-45"></div>
  //                                   </div>
  //                                 </div>
  //                               ) : (
  //                                 <span className="text-gray-400 italic">
  //                                   -
  //                                 </span>
  //                               )}

  //                               {/* Early Login Reason */}
  //                               {attendance.earlyLoginReason && (
  //                                 <div className="text-xs text-orange-600 mt-1">
  //                                   <span className="font-medium">
  //                                     Early Login:
  //                                   </span>{" "}
  //                                   {attendance.earlyLoginReason}
  //                                 </div>
  //                               )}

  //                               {/* Late Login Reason */}
  //                               {attendance.lateLoginReason && (
  //                                 <div className="text-xs text-red-600 mt-1">
  //                                   <span className="font-medium">
  //                                     Late Login:
  //                                   </span>{" "}
  //                                   {attendance.lateLoginReason}
  //                                 </div>
  //                               )}
  //                             </div>
  //                           </td>

  //                           {/* Logout Note */}
  //                           <td className="px-4 py-3 text-xs md:text-sm max-w-[150px]">
  //                             {attendance.logoutDescription ? (
  //                               <>
  //                                 <div className="font-medium truncate">
  //                                   {attendance.logoutDescription}
  //                                 </div>
  //                                 {attendance.earlyLogoutReason && (
  //                                   <div className="text-xs text-red-600 mt-1">
  //                                     <span className="font-medium">
  //                                       Early Logout:
  //                                     </span>{" "}
  //                                     {attendance.earlyLogoutReason}
  //                                   </div>
  //                                 )}
  //                               </>
  //                             ) : (
  //                               "-"
  //                             )}
  //                           </td>
  //                         </tr>
  //                       ))}
  //                     </tbody>
  //                   </table>
  //                 </div>
  //               </div>
  //             </div>
  //           </>
  //         )}

  //         {/* Reports Tab */}
  //         {activeTab === "reports" && (
  //           <AdminReportsTab
  //             token={token}
  //             addNotification={addNotification}
  //             attendanceRecords={attendanceRecords}
  //           />
  //         )}
  //       </div>
  //     </div>

  //     {/* Reject Modal */}
  //     <RejectModal
  //       isOpen={showRejectModal}
  //       onClose={() => {
  //         setShowRejectModal(false);
  //         setRejectRemarks("");
  //         setSelectedAttendance(null);
  //       }}
  //       onReject={handleReject}
  //       remarks={rejectRemarks}
  //       setRemarks={setRejectRemarks}
  //     />
  //   </div>
  // );
};

export default EmployeeAttendanceManagement;
