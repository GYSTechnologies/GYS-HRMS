import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useAuth } from "../context/AppContext";
import RejectModal from "../components/attendance/RejectModal.jsx";
import NotificationToast from "../components/common/NotificationToast.jsx";
import HRAttendanceTab from "../components/attendance/HRAttendanceTab.jsx";

const PRIMARY = "#104774";
const PRIMARY_HOVER = "#0d3a61";

const AttendanceManagement = () => {
  const { token, user } = useAuth();
  const [pendingAttendances, setPendingAttendances] = useState([]);
  const [allAttendances, setAllAttendances] = useState([]);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectRemarks, setRejectRemarks] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [stats, setStats] = useState({
    totalEmployees: 0,
    present: 0,
    absent: 0,
    pending: 0,
  });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

  const [filters, setFilters] = useState({
    employee: "",
    date: today,
    status: "",
  });

  useEffect(() => {
    if (token) {
      fetchPendingAttendances();
      fetchAllAttendances();
      fetchStats();
    }
  }, [token]);

  const addNotification = (message, type = "info", ttl = 3500) => {
    const id = Date.now() + Math.random();
    setNotifications((n) => [...n, { id, message, type }]);
    setTimeout(
      () => setNotifications((n) => n.filter((x) => x.id !== id)),
      ttl
    );
  };

  const fetchPendingAttendances = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/attendance/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingAttendances(response.data || []);
    } catch (error) {
      console.error("Error fetching pending attendances:", error);
      addNotification(
        error.response?.data?.message || "Could not load pending requests",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchAllAttendances = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/attendance/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllAttendances(response.data || []);
    } catch (error) {
      console.error("Error fetching all attendances:", error);
      addNotification(
        error.response?.data?.message || "Could not load records",
        "error"
      );
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

  const upsertAttendanceInLists = (updatedAttendance) => {
    if (!updatedAttendance || !updatedAttendance._id) return;

    setAllAttendances((prev) => {
      const idx = prev.findIndex((a) => a._id === updatedAttendance._id);
      if (idx === -1) return [updatedAttendance, ...prev];
      const copy = [...prev];
      copy[idx] = { ...copy[idx], ...updatedAttendance };
      return copy;
    });

    setPendingAttendances((prev) =>
      prev.filter((a) => a._id !== updatedAttendance._id)
    );
  };

  const handleApprove = async (id) => {
    try {
      const res = await axiosInstance.patch(
        `/attendance/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updated = res.data?.attendance || res.data;
      if (updated && updated._id) {
        upsertAttendanceInLists(updated);
      } else {
        setPendingAttendances((prev) => prev.filter((p) => p._id !== id));
        fetchAllAttendances();
      }

      if (res.data?.stats) setStats(res.data.stats);
      else fetchStats();

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
        `/attendance/${selectedAttendance}/reject`,
        { remarks },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updated = res.data?.attendance || res.data;
      if (updated && updated._id) {
        upsertAttendanceInLists(updated);
      } else {
        setPendingAttendances((prev) =>
          prev.filter((p) => p._id !== selectedAttendance)
        );
        fetchAllAttendances();
      }

      if (res.data?.stats) setStats(res.data.stats);
      else fetchStats();

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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ employee: "", date: "", status: "" });
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

  // Filter attendances based on filters
  const filteredAttendances = allAttendances.filter((attendance) => {
    const matchesEmployee = filters.employee
      ? `${attendance.employee?.profileRef?.firstName} ${attendance.employee?.profileRef?.lastName}`
          .toLowerCase()
          .includes(filters.employee.toLowerCase()) ||
        attendance.employee?.email
          ?.toLowerCase()
          .includes(filters.employee.toLowerCase())
      : true;

    const matchesDate = filters.date
      ? formatDate(attendance.date) === formatDate(filters.date)
      : true;

    const matchesStatus = filters.status
      ? attendance.status === filters.status
      : true;

    return matchesEmployee && matchesDate && matchesStatus;
  });

  const filteredPendingAttendances = pendingAttendances.filter((attendance) => {
    const matchesEmployee = filters.employee
      ? `${attendance.employee?.profileRef?.firstName} ${attendance.employee?.profileRef?.lastName}`
          .toLowerCase()
          .includes(filters.employee.toLowerCase()) ||
        attendance.employee?.email
          ?.toLowerCase()
          .includes(filters.employee.toLowerCase())
      : true;

    const matchesDate = filters.date
      ? formatDate(attendance.date) === formatDate(filters.date)
      : true;

    return matchesEmployee && matchesDate;
  });

  return (
    <div className="max-h-80vh bg-gray-50 ">
      <style>{`
      .primary-btn:hover { background: ${PRIMARY_HOVER} !important }
      .primary-border-active { border-bottom-color: ${PRIMARY} !important; color: ${PRIMARY} !important }
    `}</style>

      <NotificationToast notifications={notifications} />

      {/* Header */}
      <header className="mb-3 sm:mb-4">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-800">
          Attendance Management
        </h1>
        <p className="text-xs text-gray-600 mt-1">
          Manage employee attendance approvals and records
        </p>
      </header>

      {/* Stats Cards - Compact */}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-5">
        {/* Total Employees */}
        <div className="bg-gradient-to-r from-blue-100 via-blue-100 to-blue-200 rounded-2xl p-3 shadow-md hover:shadow-lg transition-shadow cursor-pointer text-center">
          <h3 className="text-xs text-blue-700 font-medium mb-1">
            Total Employees
          </h3>
          <p className="text-base sm:text-lg font-bold text-blue-900">
            {stats.totalEmployees ?? 0}
          </p>
        </div>

        {/* Present Today */}
        <div className="bg-gradient-to-r from-green-100 via-green-100 to-green-200 rounded-2xl p-3 shadow-md hover:shadow-lg transition-shadow cursor-pointer text-center">
          <h3 className="text-xs text-green-700 font-medium mb-1">
            Present Today
          </h3>
          <p className="text-base sm:text-lg font-bold text-green-900">
            {stats.present ?? 0}
          </p>
        </div>

        {/* Absent Today */}
        <div className="bg-gradient-to-r from-red-100 via-red-100 to-red-200 rounded-2xl p-3 shadow-md hover:shadow-lg transition-shadow cursor-pointer text-center">
          <h3 className="text-xs text-red-700 font-medium mb-1">
            Absent Today
          </h3>
          <p className="text-base sm:text-lg font-bold text-red-900">
            {Math.max(0, stats?.absent ?? 0)}
          </p>
        </div>

        {/* Pending Approval */}
        <div className="bg-gradient-to-r from-yellow-100 via-yellow-100 to-yellow-200 rounded-2xl p-3 shadow-md hover:shadow-lg transition-shadow cursor-pointer text-center">
          <h3 className="text-xs text-yellow-700 font-medium mb-1">
            Pending Approval
          </h3>
          <p className="text-base sm:text-lg font-bold text-yellow-900">
            {stats.pending ?? 0}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        {/* Tabs - Compact */}
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab("pending")}
              className={`flex-shrink-0 py-2 px-3 sm:py-3 sm:px-4 text-center border-b-2 font-medium text-xs ${
                activeTab === "pending"
                  ? "primary-border-active"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Pending Approvals
              {pendingAttendances.length > 0 && (
                <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {pendingAttendances.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("all")}
              className={`flex-shrink-0 py-2 px-3 sm:py-3 sm:px-4 text-center border-b-2 font-medium text-xs ${
                activeTab === "all"
                  ? "primary-border-active"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              All Records
            </button>
            <button
              onClick={() => setActiveTab("hr")}
              className={`flex-shrink-0 py-2 px-3 sm:py-3 sm:px-4 text-center border-b-2 font-medium text-xs ${
                activeTab === "hr"
                  ? "primary-border-active"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              My Attendance
            </button>
          </nav>
        </div>

        <div className="p-3 sm:p-4">
          {/* Filters - Compact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Search Employee
              </label>
              <input
                type="text"
                name="employee"
                value={filters.employee}
                onChange={handleFilterChange}
                placeholder="Name or email"
                className="w-full p-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={filters.date}
                onChange={handleFilterChange}
                className="w-full p-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            {activeTab === "all" && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full p-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            )}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 border border-gray-300"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Pending Tab Content */}
          {activeTab === "pending" && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <h2 className="text-sm font-semibold text-gray-800">
                  Pending Approvals
                </h2>
                <button
                  onClick={fetchPendingAttendances}
                  className="p-1.5 text-gray-500 hover:text-gray-700 self-end sm:self-auto"
                  title="Refresh"
                >
                  <svg
                    className="w-3 h-3"
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

              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-xs text-gray-500 mt-1">
                    Loading pending requests...
                  </p>
                </div>
              ) : filteredPendingAttendances.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <svg
                    className="w-8 h-8 text-gray-300 mx-auto mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-xs text-gray-500">No pending approvals</p>
                </div>
              ) : (
                <div>
                  {/* Desktop Table */}
                  <div className="hidden sm:block overflow-x-auto">
                    <div className="min-w-[800px]">
                      <table className="w-full divide-y divide-gray-200 text-xs">
                        <thead className="bg-[#104774]">
                          <tr>
                            <th className="px-2 py-2 text-left font-medium text-white uppercase tracking-wider">
                              Employee
                            </th>
                            <th className="px-2 py-2 text-left font-medium text-white uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-2 py-2 text-left font-medium text-white uppercase tracking-wider">
                              Login Time
                            </th>
                            <th className="px-2 py-2 text-left font-medium text-white uppercase tracking-wider">
                              Task
                            </th>
                            <th className="px-2 py-2 text-left font-medium text-white uppercase tracking-wider">
                              Work Progress
                            </th>
                            <th className="px-2 py-2 text-left font-medium text-white uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredPendingAttendances.map((attendance) => (
                            <tr
                              key={attendance._id}
                              className="hover:bg-gray-50"
                            >
                              <td className="px-2 py-2 whitespace-nowrap">
                                <div className="font-medium text-gray-900">
                                  {attendance.employee?.profileRef?.firstName}{" "}
                                  {attendance.employee?.profileRef?.lastName}
                                </div>
                                <div className="text-gray-500 truncate max-w-[100px]">
                                  {attendance.employee?.email}
                                </div>
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap text-gray-700">
                                {formatDate(attendance.date)}
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap text-gray-700">
                                {attendance.checkIn
                                  ? formatTime(attendance.checkIn)
                                  : "-"}
                              </td>
                              <td className="px-2 py-2 max-w-[120px]">
                                <div className="space-y-1">
                                  {attendance.taskDescription && (
                                    <div
                                      className="truncate"
                                      title={attendance.taskDescription}
                                    >
                                      {attendance.taskDescription}
                                    </div>
                                  )}
                                  {attendance.earlyLoginReason && (
                                    <div
                                      className="text-orange-600 truncate text-xs"
                                      title={attendance.earlyLoginReason}
                                    >
                                      Early: {attendance.earlyLoginReason}
                                    </div>
                                  )}
                                  {attendance.lateLoginReason && (
                                    <div
                                      className="text-red-600 truncate text-xs"
                                      title={attendance.lateLoginReason}
                                    >
                                      Late: {attendance.lateLoginReason}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-2 py-2 text-gray-700">
                                {attendance.workProgress || "-"}
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap">
                                <div className="flex gap-1">
                                  <button
                                    onClick={() =>
                                      handleApprove(attendance._id)
                                    }
                                    className="px-2 py-1 rounded text-white bg-blue-600 hover:bg-blue-700 text-xs"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() =>
                                      openRejectModal(attendance._id)
                                    }
                                    className="px-2 py-1 rounded text-white bg-red-600 hover:bg-red-700 text-xs"
                                  >
                                    Reject
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Mobile Cards */}
                  <div className="sm:hidden space-y-3">
                    {filteredPendingAttendances.map((attendance) => (
                      <div
                        key={attendance._id}
                        className="border border-gray-200 rounded-lg p-3 bg-white shadow-sm"
                      >
                        <div className="space-y-2">
                          {/* Employee Info */}
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {attendance.employee?.profileRef?.firstName}{" "}
                                {attendance.employee?.profileRef?.lastName}
                              </h3>
                              <p className="text-xs text-gray-500 truncate">
                                {attendance.employee?.email}
                              </p>
                            </div>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {formatDate(attendance.date)}
                            </span>
                          </div>

                          {/* Login Time */}
                          <div className="flex items-center text-xs text-gray-600">
                            <span className="font-medium mr-1">Login:</span>
                            {attendance.checkIn
                              ? formatTime(attendance.checkIn)
                              : "-"}
                          </div>

                          {/* Task Description */}
                          {attendance.taskDescription && (
                            <div className="text-xs">
                              <span className="font-medium text-gray-700">
                                Task:
                              </span>
                              <p className="text-gray-600 mt-1 line-clamp-2">
                                {attendance.taskDescription}
                              </p>
                            </div>
                          )}

                          {/* Work Progress */}
                          {attendance.workProgress && (
                            <div className="text-xs">
                              <span className="font-medium text-gray-700">
                                Progress:
                              </span>
                              <p className="text-gray-600">
                                {attendance.workProgress}
                              </p>
                            </div>
                          )}

                          {/* Reasons */}
                          <div className="space-y-1">
                            {attendance.earlyLoginReason && (
                              <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                                <span className="font-medium">
                                  Early Login:
                                </span>{" "}
                                {attendance.earlyLoginReason}
                              </div>
                            )}
                            {attendance.lateLoginReason && (
                              <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                                <span className="font-medium">Late Login:</span>{" "}
                                {attendance.lateLoginReason}
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={() => handleApprove(attendance._id)}
                              className="flex-1 px-3 py-2 rounded text-white bg-blue-600 hover:bg-blue-700 text-xs font-medium"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => openRejectModal(attendance._id)}
                              className="flex-1 px-3 py-2 rounded text-white bg-red-600 hover:bg-red-700 text-xs font-medium"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* All Records Tab Content */}
          {activeTab === "all" && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <h2 className="text-sm font-semibold text-gray-800">
                  All Attendance Records
                </h2>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <span className="text-xs text-gray-500">
                    {filteredAttendances.length} of {allAttendances.length}{" "}
                    records
                  </span>
                  <button
                    onClick={fetchAllAttendances}
                    className="p-1.5 text-gray-500 hover:text-gray-700"
                    title="Refresh"
                  >
                    <svg
                      className="w-3 h-3"
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

              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-xs text-gray-500 mt-1">
                    Loading records...
                  </p>
                </div>
              ) : filteredAttendances.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <svg
                    className="w-8 h-8 text-gray-300 mx-auto mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-xs text-gray-500">No records found</p>
                </div>
              ) : (
                <div>
                  {/* Desktop Table */}
                  <div className="hidden sm:block overflow-x-auto">
                    <div className="max-h-[200px] overflow-y-auto border border-gray-200 rounded-lg">
                      <table className="w-full divide-y divide-gray-200 text-xs">
                        <thead className="bg-[#104774] sticky top-0 z-10">
                          <tr>
                            <th className="px-2 py-2 text-left font-medium text-white uppercase tracking-wider">
                              Employee
                            </th>
                            <th className="px-2 py-2 text-left font-medium text-white uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-2 py-2 text-left font-medium text-white uppercase tracking-wider">
                              Login
                            </th>
                            <th className="px-2 py-2 text-left font-medium text-white uppercase tracking-wider">
                              Logout
                            </th>
                            <th className="px-2 py-2 text-left font-medium text-white uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-2 py-2 text-left font-medium text-white uppercase tracking-wider">
                              Work Progress
                            </th>
                            <th className="px-2 py-2 text-left font-medium text-white uppercase tracking-wider">
                              Task
                            </th>
                            <th className="px-2 py-2 text-left font-medium text-white uppercase tracking-wider">
                              Logout Note
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredAttendances.map((attendance) => (
                            <tr
                              key={attendance._id}
                              className="hover:bg-gray-50"
                            >
                              <td className="px-2 py-2 whitespace-nowrap">
                                <div className="font-medium text-gray-900">
                                  {attendance.employee?.profileRef?.firstName}{" "}
                                  {attendance.employee?.profileRef?.lastName}
                                </div>
                                <div className="text-gray-500 truncate max-w-[100px]">
                                  {attendance.employee?.email}
                                </div>
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap text-gray-700">
                                {formatDate(attendance.date)}
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap text-gray-700">
                                {formatTime(attendance.checkIn)}
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap text-gray-700">
                                {formatTime(attendance.checkOut) || "-"}
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                    attendance.status === "accepted"
                                      ? "bg-green-100 text-green-800"
                                      : attendance.status === "pending"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {attendance.status}
                                </span>
                              </td>
                              <td className="px-2 py-2 text-gray-700">
                                {attendance.workProgress || "-"}
                              </td>
                              <td className="px-2 py-2 max-w-[120px]">
                                <div className="space-y-1">
                                  {attendance.taskDescription && (
                                    <div
                                      className="truncate"
                                      title={attendance.taskDescription}
                                    >
                                      {attendance.taskDescription}
                                    </div>
                                  )}
                                  {attendance.earlyLoginReason && (
                                    <div
                                      className="text-orange-600 truncate text-xs"
                                      title={attendance.earlyLoginReason}
                                    >
                                      Early: {attendance.earlyLoginReason}
                                    </div>
                                  )}
                                  {attendance.lateLoginReason && (
                                    <div
                                      className="text-red-600 truncate text-xs"
                                      title={attendance.lateLoginReason}
                                    >
                                      Late: {attendance.lateLoginReason}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-2 py-2 max-w-[120px]">
                                {attendance.logoutDescription ? (
                                  <div
                                    className="truncate"
                                    title={attendance.logoutDescription}
                                  >
                                    {attendance.logoutDescription}
                                  </div>
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

                  {/* Mobile Cards */}
                  <div className="sm:hidden space-y-3">
                    {filteredAttendances.map((attendance) => (
                      <div
                        key={attendance._id}
                        className="border border-gray-200 rounded-lg p-3 bg-white shadow-sm"
                      >
                        <div className="space-y-2">
                          {/* Header */}
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {attendance.employee?.profileRef?.firstName}{" "}
                                {attendance.employee?.profileRef?.lastName}
                              </h3>
                              <p className="text-xs text-gray-500">
                                {attendance.employee?.email}
                              </p>
                            </div>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                attendance.status === "accepted"
                                  ? "bg-green-100 text-green-800"
                                  : attendance.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {attendance.status}
                            </span>
                          </div>

                          {/* Date and Time */}
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="font-medium text-gray-700">
                                Date:
                              </span>
                              <p className="text-gray-600">
                                {formatDate(attendance.date)}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">
                                Login:
                              </span>
                              <p className="text-gray-600">
                                {formatTime(attendance.checkIn)}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">
                                Logout:
                              </span>
                              <p className="text-gray-600">
                                {formatTime(attendance.checkOut) || "-"}
                              </p>
                            </div>
                          </div>

                          {/* Work Progress */}
                          {attendance.workProgress && (
                            <div className="text-xs">
                              <span className="font-medium text-gray-700">
                                Progress:
                              </span>
                              <p className="text-gray-600">
                                {attendance.workProgress}
                              </p>
                            </div>
                          )}

                          {/* Task Description */}
                          {attendance.taskDescription && (
                            <div className="text-xs">
                              <span className="font-medium text-gray-700">
                                Task:
                              </span>
                              <p className="text-gray-600 mt-1 line-clamp-2">
                                {attendance.taskDescription}
                              </p>
                            </div>
                          )}

                          {/* Reasons */}
                          <div className="space-y-1">
                            {attendance.earlyLoginReason && (
                              <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                                <span className="font-medium">
                                  Early Login:
                                </span>{" "}
                                {attendance.earlyLoginReason}
                              </div>
                            )}
                            {attendance.lateLoginReason && (
                              <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                                <span className="font-medium">Late Login:</span>{" "}
                                {attendance.lateLoginReason}
                              </div>
                            )}
                          </div>

                          {/* Logout Note */}
                          {attendance.logoutDescription && (
                            <div className="text-xs">
                              <span className="font-medium text-gray-700">
                                Logout Note:
                              </span>
                              <p className="text-gray-600 mt-1 line-clamp-2">
                                {attendance.logoutDescription}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* HR Self Attendance Tab */}
          {activeTab === "hr" && (
            <HRAttendanceTab
              token={token}
              addNotification={addNotification}
              user={user}
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
};

export default AttendanceManagement;
