import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { useAuth } from "../../context/AppContext";
import NotificationToast from "../../components/common/NotificationToast";
import PayrollDetailsModal from "./PayrollDetailsModal";

const PRIMARY = "#104774";
const PRIMARY_HOVER = "#0d3a61";

const AdminPayrollApproval = () => {
  const { token } = useAuth();
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    status: "",
    employee: "",
  });
  const [employees, setEmployees] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [selectedPayrolls, setSelectedPayrolls] = useState(new Set());
  const [bulkAction, setBulkAction] = useState("");
  const [bulkRejectionReason, setBulkRejectionReason] = useState("");
  const [showBulkRejectInput, setShowBulkRejectInput] = useState(false);

  // --- derived: ids of payrolls that are selectable (exclude already approved) ---
  const selectablePayrollIds = payrolls
    .filter((p) => p.status !== "approved")
    .map((p) => p._id);
  const selectableCount = selectablePayrollIds.length;

  useEffect(() => {
    fetchPayrolls();
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const addNotification = (message, type = "info", ttl = 3500) => {
    const id = Date.now() + Math.random();
    setNotifications((n) => [...n, { id, message, type }]);
    setTimeout(
      () => setNotifications((n) => n.filter((x) => x.id !== id)),
      ttl
    );
  };

  const fetchPayrolls = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.year) params.append("year", filters.year);
      if (filters.month) params.append("month", filters.month);
      if (filters.status) params.append("status", filters.status);
      if (filters.employee) params.append("employee", filters.employee);

      // ADD THIS LINE TO GET FULL DATA FOR MODAL
      params.append("fullData", "true");

      const response = await axiosInstance.get(`/payroll?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPayrolls(response.data.data || []);
      updateStats(response.data.data || []);
    } catch (error) {
      console.error("Error fetching payrolls:", error);
      addNotification(
        error.response?.data?.message || "Could not fetch payroll records",
        "error"
      );
      setPayrolls([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axiosInstance.get("/employee/all-employees", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(response.data.data || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
      addNotification("Error fetching employees", "error");
    }
  };

  const updateStats = (payrollData) => {
    const stats = {
      total: payrollData.length,
      pending: payrollData.filter((p) => p.status === "pending_approval")
        .length,
      approved: payrollData.filter((p) => p.status === "approved").length,
      rejected: payrollData.filter((p) => p.status === "rejected").length,
    };
    setStats(stats);
  };

  const handleApproveReject = async (payrollId, action, reason = "") => {
    try {
      setActionLoading(payrollId);
      const response = await axiosInstance.patch(
        `/payroll/${payrollId}/approve`,
        { action, rejectionReason: reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // show friendly notification text (approve -> rolled out)
      const successMsg =
        action === "approve"
          ? "Payroll rolled out successfully"
          : action === "reject"
          ? "Payroll rejected successfully"
          : `Payroll ${action}ed successfully`;

      addNotification(successMsg, "success");
      setShowDetailsModal(false);
      fetchPayrolls(); // Refresh list
    } catch (error) {
      console.error("Error processing payroll:", error);
      addNotification(
        error.response?.data?.message || `Error ${action}ing payroll`,
        "error"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction) {
      addNotification("Please select an action first", "error");
      return;
    }

    if (bulkAction === "reject" && !bulkRejectionReason.trim()) {
      addNotification("Please provide a rejection reason", "error");
      return;
    }

    if (selectedPayrolls.size === 0) {
      addNotification("Please select at least one payroll", "error");
      return;
    }

    try {
      setActionLoading("bulk");

      // Process each selected payroll
      const promises = Array.from(selectedPayrolls).map((payrollId) =>
        axiosInstance.patch(
          `/payroll/${payrollId}/approve`,
          {
            action: bulkAction,
            rejectionReason: bulkAction === "reject" ? bulkRejectionReason : "",
          },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      );

      await Promise.all(promises);

      // friendly message for approve -> rolled out
      const actionPast =
        bulkAction === "approve"
          ? "rolled out"
          : bulkAction === "reject"
          ? "rejected"
          : `${bulkAction}ed`;

      addNotification(
        `${selectedPayrolls.size} payrolls ${actionPast} successfully`,
        "success"
      );
      setSelectedPayrolls(new Set());
      setBulkAction("");
      setBulkRejectionReason("");
      setShowBulkRejectInput(false);
      fetchPayrolls(); // Refresh list
    } catch (error) {
      console.error("Error processing bulk action:", error);
      addNotification(
        error.response?.data?.message || `Error processing bulk action`,
        "error"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const toggleSelectPayroll = (payrollId) => {
    // prevent selecting payrolls that are already approved
    const payroll = payrolls.find((p) => p._id === payrollId);
    if (payroll?.status === "approved") {
      return; // ignore - cannot select approved ones
    }

    const newSelection = new Set(selectedPayrolls);
    if (newSelection.has(payrollId)) {
      newSelection.delete(payrollId);
    } else {
      newSelection.add(payrollId);
    }
    setSelectedPayrolls(newSelection);
  };

  const toggleSelectAll = () => {
    // toggle only selectable payrolls (exclude approved)
    if (selectedPayrolls.size === selectableCount) {
      setSelectedPayrolls(new Set());
    } else {
      setSelectedPayrolls(new Set(selectablePayrollIds));
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      status: "",
      employee: "",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Updated to show frontend-only renamed status text
  const getStatusBadge = (status) => {
    const statusClasses = {
      draft: "bg-gray-100 text-gray-800",
      pending_approval: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };

    // frontend-only display mapping
    const displayText =
      status === "approved"
        ? "ROLLED OUT"
        : status === "pending_approval"
        ? "PENDING ROLLED OUT"
        : status.replace("_", " ").toUpperCase();

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${
          statusClasses[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {displayText}
      </span>
    );
  };

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];

  if (loading && payrolls.length === 0) {
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
          <p className="mt-2 text-gray-600">Loading payroll records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] p-4">
      <style>{`
        .primary-btn:hover { background: ${PRIMARY_HOVER} !important }
      `}</style>

      <NotificationToast notifications={notifications} />

      {/* Header */}
      <header className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Payroll Approval
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Review and approve employee payrolls
            </p>
          </div>
          <button
            onClick={fetchPayrolls}
            className="px-4 py-2 rounded-md text-white primary-btn flex items-center gap-2"
            style={{ backgroundColor: PRIMARY }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>
      </header>

      <div className="flex flex-col xl:flex-row gap-6 mb-6">
        {/* Left: Stats Cards */}
        <div className="flex-shrink-0">
          <div
            className="grid grid-cols-2 xl:grid-cols-4 gap-4"
            id="stats-cards"
          >
            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500 text-center min-w-[200px]">
              <h3 className="text-sm text-gray-500">Total Payrolls</h3>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500 text-center min-w-[200px]">
              <h3 className="text-sm text-gray-500">Pending Approval</h3>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.pending}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500 text-center min-w-[200px]">
              <h3 className="text-sm text-gray-500">Approved</h3>
              <p className="text-2xl font-bold text-green-600">
                {stats.approved}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500 text-center min-w-[200px]">
              <h3 className="text-sm text-gray-500">Rejected</h3>
              <p className="text-2xl font-bold text-red-600">
                {stats.rejected}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Filters */}
        <div
          className="flex-1 bg-white shadow rounded-lg border-l-4 border-blue-500"
          style={{
            height: "", // Matches stats cards height
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div className="flex-1 p-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 h-full items-center">
              {/* Year */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Year
                </label>
                <select
                  name="year"
                  value={filters.year}
                  onChange={handleFilterChange}
                  className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Month */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Month
                </label>
                <select
                  name="month"
                  value={filters.month}
                  onChange={handleFilterChange}
                  className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Months</option>
                  {months.map((month, index) => (
                    <option key={index + 1} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="pending_approval">Pending Approval</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Employee */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Employee
                </label>
                <select
                  name="employee"
                  value={filters.employee}
                  onChange={handleFilterChange}
                  className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Employees</option>
                  {employees.map((employee) => (
                    <option key={employee._id} value={employee._id}>
                      {employee.firstName} {employee.lastName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 justify-center mt-4 ">
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 text-xs bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors flex items-center gap-1 border"
                  title="Clear Filters"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {payrolls.length > 0 && (
        <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">
            Bulk Actions
          </h3>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedPayrolls.size === selectableCount}
                onChange={toggleSelectAll}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">
                Select all ({selectedPayrolls.size} selected)
              </span>
            </div>

            <div className="flex flex-col md:flex-row gap-2 flex-1">
              <select
                value={bulkAction}
                onChange={(e) => {
                  setBulkAction(e.target.value);
                  setShowBulkRejectInput(e.target.value === "reject");
                }}
                className="p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Action</option>
                <option value="approve">Roll Out Selected</option>
                <option value="reject">Reject Selected</option>
              </select>

              {showBulkRejectInput && (
                <input
                  type="text"
                  value={bulkRejectionReason}
                  onChange={(e) => setBulkRejectionReason(e.target.value)}
                  placeholder="Reason for rejection"
                  className="p-2 border border-gray-300 rounded-md flex-1"
                />
              )}

              <button
                onClick={handleBulkAction}
                disabled={actionLoading === "bulk" || !bulkAction}
                className="px-4 py-2 bg-[#104774] text-white rounded-md hover:bg-[#002442] disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoading === "bulk" ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  "Apply to Selected"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payroll Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">
            Payroll Records ({payrolls.length})
          </h2>
          <span className="text-sm text-gray-500">
            {filters.status === "pending_approval"
              ? "Pending Approval"
              : filters.status === "approved"
              ? "Approved"
              : filters.status === "rejected"
              ? "Rejected"
              : "All Records"}
          </span>
        </div>

        {payrolls.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 text-gray-300 mx-auto mb-4"
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
            <p className="text-gray-500">No payroll records found</p>
            <p className="text-sm text-gray-400 mt-1">
              {filters.status === "pending_approval"
                ? "No payrolls pending approval"
                : "Try adjusting your filters"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedPayrolls.size === selectableCount}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net Pay
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Generated By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {payrolls.map((payroll) => (
                  <tr key={payroll._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedPayrolls.has(payroll._id)}
                        onChange={() => toggleSelectPayroll(payroll._id)}
                        className="h-4 w-4 text-blue-600 rounded"
                        disabled={payroll.status === "approved"} // <-- disabled for approved
                        title={
                          payroll.status === "approved"
                            ? "Already Rolled Out"
                            : undefined
                        }
                      />
                    </td>

                    {/* Employee Info */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={
                              payroll.employee?.avatarUrl || "/default-avatar.png"
                            }
                            alt={payroll.employee?.firstName}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {payroll.employee?.firstName}{" "}
                            {payroll.employee?.lastName}
                          </div>
                          <div className="text-xs text-gray-400">
                            {payroll.employee?.email || "—"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {payroll.employee?.employeeId}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Period */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {months[parseInt(payroll.month.split("-")[1], 10) - 1]}{" "}
                        {payroll.year}
                      </div>
                      {payroll.generatedAt && (
                        <div className="text-sm text-gray-500">
                          {formatDate(payroll.generatedAt)}
                        </div>
                      )}
                    </td>

                    {/* Net Pay */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-green-600">
                        {formatCurrency(payroll.netPay)}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(payroll.status)}
                    </td>

                    {/* Generated By */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payroll.generatedBy || "—"}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedPayroll(payroll);
                            setShowDetailsModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          Review
                        </button>

                        {payroll.status === "pending_approval" && (
                          <>
                            <button
                              onClick={() =>
                                handleApproveReject(payroll._id, "approve")
                              }
                              disabled={actionLoading === payroll._id}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50 flex items-center gap-1"
                            >
                              {actionLoading === payroll._id ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600"></div>
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                  {/* label changed to Roll Out */}
                                  Roll Out
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedPayroll(payroll);
                                setShowDetailsModal(true);
                              }}
                              className="text-red-600 hover:text-red-900 flex items-center gap-1"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payroll Details Modal */}
      {showDetailsModal && selectedPayroll && (
        <PayrollDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          payroll={selectedPayroll}
          onApproveReject={handleApproveReject}
          actionLoading={actionLoading}
          formatCurrency={formatCurrency}
          isHR={false}
          // pass optional label so modal (if supports it) can show "Roll Out"
          actionLabel="Roll Out"
        />
      )}
    </div>
  );
};

export default AdminPayrollApproval;
