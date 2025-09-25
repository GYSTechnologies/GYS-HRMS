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
    <div className="max-h-screen bg-gray-50">
      <style>{`
      .primary-btn:hover { background: ${PRIMARY_HOVER} !important }
    `}</style>

      <NotificationToast notifications={notifications} />

      {/* Mobile View - Only for screens below 768px */}
      <div className="md:hidden">
        {/* Mobile Header */}
        <header className="mb-4 p-4 bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                Payroll Approval
              </h1>
              <p className="text-xs text-gray-600 mt-1">
                Review employee payrolls
              </p>
            </div>
            <button
              onClick={fetchPayrolls}
              className="px-3 py-2 text-xs rounded-lg text-white primary-btn flex items-center gap-1"
              style={{ backgroundColor: PRIMARY }}
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
        </header>

        {/* Mobile Stats Cards */}
        <div className="px-4 mb-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-lg shadow border-l-4 border-blue-500 text-center">
              <h3 className="text-xs text-gray-500">Total</h3>
              <p className="text-lg font-bold">{stats.total}</p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow border-l-4 border-yellow-500 text-center">
              <h3 className="text-xs text-gray-500">Pending</h3>
              <p className="text-lg font-bold text-yellow-600">
                {stats.pending}
              </p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow border-l-4 border-green-500 text-center">
              <h3 className="text-xs text-gray-500">Approved</h3>
              <p className="text-lg font-bold text-green-600">
                {stats.approved}
              </p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow border-l-4 border-red-500 text-center">
              <h3 className="text-xs text-gray-500">Rejected</h3>
              <p className="text-lg font-bold text-red-600">{stats.rejected}</p>
            </div>
          </div>
        </div>

        {/* Mobile Filters */}
        <div className="px-4 mb-4">
          <div className="bg-white rounded-lg shadow">
            <div className="p-3 border-b">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Filters</span>
                <button
                  onClick={clearFilters}
                  className="text-xs text-red-500 flex items-center gap-1"
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

            <div className="p-3 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Year
                </label>
                <select
                  name="year"
                  value={filters.year}
                  onChange={handleFilterChange}
                  className="w-full p-2 text-xs border border-slate-300 rounded-md"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Month
                </label>
                <select
                  name="month"
                  value={filters.month}
                  onChange={handleFilterChange}
                  className="w-full p-2 text-xs border border-slate-300 rounded-md"
                >
                  <option value="">All Months</option>
                  {months.map((month, index) => (
                    <option key={index + 1} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full p-2 text-xs border border-slate-300 rounded-md"
                >
                  <option value="">All Status</option>
                  <option value="pending_approval">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Employee
                </label>
                <select
                  name="employee"
                  value={filters.employee}
                  onChange={handleFilterChange}
                  className="w-full p-2 text-xs border border-slate-300 rounded-md"
                >
                  <option value="">All Employees</option>
                  {employees.map((employee) => (
                    <option key={employee._id} value={employee._id}>
                      {employee.firstName} {employee.lastName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Bulk Actions */}
        {payrolls.length > 0 && (
          <div className="px-4 mb-4">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <h3 className="text-sm font-semibold text-blue-800 mb-2">
                Bulk Actions
              </h3>

              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={selectedPayrolls.size === selectableCount}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <span className="text-xs text-slate-700">
                  Select all ({selectedPayrolls.size})
                </span>
              </div>

              <div className="space-y-2">
                <select
                  value={bulkAction}
                  onChange={(e) => {
                    setBulkAction(e.target.value);
                    setShowBulkRejectInput(e.target.value === "reject");
                  }}
                  className="w-full p-2 border border-slate-300 rounded-md text-xs"
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
                    className="w-full p-2 border border-slate-300 rounded-md text-xs"
                  />
                )}

                <button
                  onClick={handleBulkAction}
                  disabled={actionLoading === "bulk" || !bulkAction}
                  className="w-full px-3 py-2 bg-[#104774] text-white rounded-md disabled:opacity-50 flex items-center justify-center gap-2 text-xs"
                >
                  {actionLoading === "bulk" ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    "Apply to Selected"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Payroll Cards */}
        <div className="px-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-semibold">
              Payroll Records ({payrolls.length})
            </h2>
            <span className="text-xs text-slate-500">
              {filters.status === "pending_approval"
                ? "Pending"
                : filters.status === "approved"
                ? "Approved"
                : filters.status === "rejected"
                ? "Rejected"
                : "All"}
            </span>
          </div>

          {payrolls.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg shadow">
              <svg
                className="w-12 h-12 text-slate-300 mx-auto mb-3"
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
              <p className="text-slate-500 text-sm">No payroll records found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payrolls.map((payroll) => (
                <div
                  key={payroll._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                >
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedPayrolls.has(payroll._id)}
                        onChange={() => toggleSelectPayroll(payroll._id)}
                        className="h-4 w-4 text-blue-600 rounded"
                        disabled={payroll.status === "approved"}
                      />
                      <img
                        className="h-8 w-8 rounded-full object-cover"
                        src={
                          payroll.employee?.avatarUrl || "/default-avatar.png"
                        }
                        alt={payroll.employee?.firstName}
                      />
                      <div>
                        <div className="text-sm font-semibold">
                          {payroll.employee?.firstName}{" "}
                          {payroll.employee?.lastName}
                        </div>
                        <div className="text-xs text-slate-500">
                          {payroll.employee?.employeeId}
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(payroll.status)}
                  </div>

                  {/* Card Details */}
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div>
                      <span className="text-slate-500">Period:</span>
                      <div className="font-medium">
                        {months[parseInt(payroll.month.split("-")[1], 10) - 1]}{" "}
                        {payroll.year}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500">Net Pay:</span>
                      <div className="font-semibold text-green-600">
                        {formatCurrency(payroll.basic)}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-500">Generated By:</span>
                      <div className="font-medium">
                        {payroll.generatedBy || "—"}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setSelectedPayroll(payroll);
                        setShowDetailsModal(true);
                      }}
                      className="flex-1 py-2 text-xs bg-blue-50 text-blue-600 rounded-md flex items-center justify-center gap-1"
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
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      Details
                    </button>

                    {payroll.status === "pending_approval" && (
                      <>
                        <button
                          onClick={() =>
                            handleApproveReject(payroll._id, "approve")
                          }
                          disabled={actionLoading === payroll._id}
                          className="flex-1 py-2 text-xs bg-green-50 text-green-600 rounded-md disabled:opacity-50 flex items-center justify-center gap-1"
                        >
                          {actionLoading === payroll._id ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600"></div>
                          ) : (
                            <>
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
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              Roll Out
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPayroll(payroll);
                            setShowDetailsModal(true);
                          }}
                          className="flex-1 py-2 text-xs bg-red-50 text-red-600 rounded-md flex items-center justify-center gap-1"
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
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Laptop/Desktop View - Original Code (Exactly as you provided) */}
      <div className="hidden md:block">
        {/* Header Section */}
        <header className="mb-4 md:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">
                Payroll Approval
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Review and approve employee payrolls
              </p>
            </div>
            <button
              onClick={fetchPayrolls}
              className="px-3 py-2 text-xs sm:text-sm rounded-md text-white primary-btn flex items-center gap-2 justify-center"
              style={{ backgroundColor: PRIMARY }}
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="flex flex-col xl:flex-row gap-4 md:gap-6 mb-4 md:mb-6">
          <div className="flex-shrink-0">
            <div
              className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4"
              id="stats-cards"
            >
              <div className="bg-white p-3 md:p-4 rounded-lg shadow border-l-4 border-blue-500 text-center min-w-[120px]">
                <h3 className="text-xs md:text-sm text-gray-500">
                  Total Payrolls
                </h3>
                <p className="text-base md:text-lg font-bold">{stats.total}</p>
              </div>
              <div className="bg-white p-3 md:p-4 rounded-lg shadow border-l-4 border-yellow-500 text-center min-w-[120px]">
                <h3 className="text-xs md:text-sm text-gray-500">
                  Pending Approval
                </h3>
                <p className="text-base md:text-lg font-bold text-yellow-600">
                  {stats.pending}
                </p>
              </div>
              <div className="bg-white p-3 md:p-4 rounded-lg shadow border-l-4 border-green-500 text-center min-w-[120px]">
                <h3 className="text-xs md:text-sm text-gray-500">Approved</h3>
                <p className="text-base md:text-lg font-bold text-green-600">
                  {stats.approved}
                </p>
              </div>
              <div className="bg-white p-3 md:p-4 rounded-lg shadow border-l-4 border-red-500 text-center min-w-[120px]">
                <h3 className="text-xs md:text-sm text-gray-500">Rejected</h3>
                <p className="text-base md:text-lg font-bold text-red-600">
                  {stats.rejected}
                </p>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="flex-1 bg-white shadow rounded-lg border-l-4 border-blue-500">
            <div className="p-3 md:p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 items-end">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Year
                  </label>
                  <select
                    name="year"
                    value={filters.year}
                    onChange={handleFilterChange}
                    className="w-full p-2 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Month
                  </label>
                  <select
                    name="month"
                    value={filters.month}
                    onChange={handleFilterChange}
                    className="w-full p-2 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Months</option>
                    {months.map((month, index) => (
                      <option key={index + 1} value={index + 1}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="w-full p-2 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Status</option>
                    <option value="pending_approval">Pending Approval</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Employee
                  </label>
                  <select
                    name="employee"
                    value={filters.employee}
                    onChange={handleFilterChange}
                    className="w-full p-2 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Employees</option>
                    {employees.map((employee) => (
                      <option key={employee._id} value={employee._id}>
                        {employee.firstName} {employee.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-center sm:justify-start">
                  <button
                    onClick={clearFilters}
                    className="px-3 py-2 text-xs bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 transition-colors flex items-center gap-1 border"
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
          <div className="mb-4 md:mb-6 bg-blue-50 p-3 md:p-4 rounded-lg border border-blue-200">
            <h3 className="text-sm md:text-base font-semibold text-blue-800 mb-3">
              Bulk Actions
            </h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedPayrolls.size === selectableCount}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <span className="text-xs md:text-sm text-slate-700">
                  Select all ({selectedPayrolls.size} selected)
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={bulkAction}
                  onChange={(e) => {
                    setBulkAction(e.target.value);
                    setShowBulkRejectInput(e.target.value === "reject");
                  }}
                  className="p-2 border border-slate-300 rounded-md text-xs"
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
                    className="p-2 border border-slate-300 rounded-md flex-1 text-xs"
                  />
                )}

                <button
                  onClick={handleBulkAction}
                  disabled={actionLoading === "bulk" || !bulkAction}
                  className="px-3 py-2 bg-[#104774] text-white rounded-md hover:bg-[#002442] disabled:opacity-50 flex items-center justify-center gap-2 text-xs"
                >
                  {actionLoading === "bulk" ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      <span>Processing...</span>
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
          <div className="px-3 md:px-4 py-3 border-b border-slate-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <h2 className="text-sm md:text-base font-semibold text-gray-800">
              Payroll Records ({payrolls.length})
            </h2>
            <span className="text-xs text-slate-500">
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
            <div className="text-center py-6 px-4">
              <svg
                className="w-12 h-12 text-slate-300 mx-auto mb-3"
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
              <p className="text-slate-500 text-sm">No payroll records found</p>
              <p className="text-xs text-slate-400 mt-1">
                {filters.status === "pending_approval"
                  ? "No payrolls pending approval"
                  : "Try adjusting your filters"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase">
                      <input
                        type="checkbox"
                        checked={selectedPayrolls.size === selectableCount}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase min-w-[150px]">
                      Employee
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase min-w-[100px]">
                      Period
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase min-w-[80px]">
                      Net Pay
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase min-w-[100px]">
                      Status
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase min-w-[100px]">
                      Generated By
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase min-w-[150px]">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-slate-200">
                  {payrolls.map((payroll) => (
                    <tr key={payroll._id} className="hover:bg-slate-50">
                      <td className="px-3 py-2 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedPayrolls.has(payroll._id)}
                          onChange={() => toggleSelectPayroll(payroll._id)}
                          className="h-4 w-4 text-blue-600 rounded"
                          disabled={payroll.status === "approved"}
                          title={
                            payroll.status === "approved"
                              ? "Already Rolled Out"
                              : undefined
                          }
                        />
                      </td>

                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-6 w-6 md:h-8 md:w-8">
                            <img
                              className="h-6 w-6 md:h-8 md:w-8 rounded-full object-cover"
                              src={
                                payroll.employee?.avatarUrl ||
                                "/default-avatar.png"
                              }
                              alt={payroll.employee?.firstName}
                            />
                          </div>
                          <div className="ml-2">
                            <div className="text-xs md:text-sm font-medium text-slate-900">
                              {payroll.employee?.firstName}{" "}
                              {payroll.employee?.lastName}
                            </div>
                            <div className="text-xs text-slate-400">
                              {payroll.employee?.email || "—"}
                            </div>
                            <div className="text-xs text-slate-500">
                              {payroll.employee?.employeeId}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="text-xs md:text-sm text-slate-900">
                          {
                            months[
                              parseInt(payroll.month.split("-")[1], 10) - 1
                            ]
                          }{" "}
                          {payroll.year}
                        </div>
                        {payroll.generatedAt && (
                          <div className="text-xs text-slate-500">
                            {formatDate(payroll.generatedAt)}
                          </div>
                        )}
                      </td>

                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="text-xs md:text-sm font-semibold text-green-600">
                          {formatCurrency(payroll.basic)}
                        </div>
                      </td>

                      <td className="px-3 py-2 whitespace-nowrap">
                        {getStatusBadge(payroll.status)}
                      </td>

                      <td className="px-3 py-2 whitespace-nowrap text-xs text-slate-500">
                        {payroll.generatedBy || "—"}
                      </td>

                      <td className="px-3 py-2 whitespace-nowrap text-xs font-medium">
                        <div className="flex flex-col sm:flex-row gap-1">
                          <button
                            onClick={() => {
                              setSelectedPayroll(payroll);
                              setShowDetailsModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 flex items-center gap-1 justify-center sm:justify-start p-1"
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
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            <span className="text-xs">Review</span>
                          </button>

                          {payroll.status === "pending_approval" && (
                            <>
                              <button
                                onClick={() =>
                                  handleApproveReject(payroll._id, "approve")
                                }
                                disabled={actionLoading === payroll._id}
                                className="text-green-600 hover:text-green-900 disabled:opacity-50 flex items-center gap-1 justify-center sm:justify-start p-1"
                              >
                                {actionLoading === payroll._id ? (
                                  <>
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600"></div>
                                    <span className="text-xs">
                                      Processing...
                                    </span>
                                  </>
                                ) : (
                                  <>
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
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                    <span className="text-xs">Roll Out</span>
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedPayroll(payroll);
                                  setShowDetailsModal(true);
                                }}
                                className="text-red-600 hover:text-red-900 flex items-center gap-1 justify-center sm:justify-start p-1"
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
                                <span className="text-xs">Reject</span>
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
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedPayroll && (
        <PayrollDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          payroll={selectedPayroll}
          onApproveReject={handleApproveReject}
          actionLoading={actionLoading}
          formatCurrency={formatCurrency}
          isHR={false}
          actionLabel="Roll Out"
        />
      )}
    </div>
  );
};

export default AdminPayrollApproval;
