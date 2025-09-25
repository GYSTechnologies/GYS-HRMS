import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { useAuth } from "../../context/AppContext";
import NotificationToast from "../../components/common/NotificationToast";
import CreatePayrollModal from "./CreatePayrollModal.jsx";
import PayrollDetailsModal from "./PayrollDetailsModal.jsx";

const PRIMARY = "#104774";
const PRIMARY_HOVER = "#0d3a61";

const HRPayrollManagement = () => {
  const { token, user } = useAuth();
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    status: "",
    employee: "",
  });
  const [notifications, setNotifications] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchPayrolls();
    fetchEmployees();
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

      const response = await axiosInstance.get(`/payroll?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPayrolls(response.data.data || []);
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

  const handleCreatePayroll = async (payrollData) => {
    try {
      const response = await axiosInstance.post(
        "/payroll/monthly",
        payrollData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      addNotification("Payroll created successfully", "success");
      setShowCreateModal(false);
            window.location.reload();

      fetchPayrolls();

    } catch (error) {
      console.error("Error creating payroll:", error);
      // addNotification(
      //   error.response?.data?.message || "Error creating payroll",
      //   "error"
      // );
    }
  };

  const handleUpdatePayroll = async (payrollId, updates) => {
    try {
      setActionLoading(payrollId);
      const response = await axiosInstance.put(
        `/payroll/${payrollId}`,
        updates,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      addNotification("Payroll updated successfully", "success");
      setShowDetailsModal(false);
      fetchPayrolls();
    } catch (error) {
      console.error("Error updating payroll:", error);
      addNotification(
        error.response?.data?.message || "Error updating payroll",
        "error"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubmitForApproval = async (payrollId) => {
    try {
      setActionLoading(payrollId);
      const response = await axiosInstance.patch(
        `/payroll/${payrollId}/submit`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      addNotification("Payroll submitted for approval", "success");
      fetchPayrolls();
    } catch (error) {
      console.error("Error submitting payroll:", error);
      addNotification(
        error.response?.data?.message || "Error submitting payroll",
        "error"
      );
    } finally {
      setActionLoading(null);
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

  const getStatusBadge = (status) => {
    const statusClasses = {
      draft: "bg-gray-100 text-gray-800",
      pending_approval: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${
          statusClasses[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status.replace("_", " ").toUpperCase()}
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
  const years = Array.from({ length: 3 }, (_, i) => currentYear + i);

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
  <div className="min-h-[80vh] p-2 sm:p-4">
    <style>{`
      .primary-btn:hover { background: ${PRIMARY_HOVER} !important }
      
      /* Mobile table styles */
      @media (max-width: 768px) {
        .mobile-table-card {
          display: block;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
          padding: 1rem;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }
        
        .mobile-table-card .mobile-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #f3f4f6;
        }
        
        .mobile-table-card .mobile-row:last-child {
          margin-bottom: 0;
          padding-bottom: 0;
          border-bottom: none;
        }
        
        .mobile-label {
          font-weight: 500;
          color: #6b7280;
          font-size: 0.875rem;
        }
        
        .mobile-value {
          font-weight: 600;
          color: #111827;
          font-size: 0.875rem;
          text-align: right;
          max-width: 60%;
          word-wrap: break-word;
        }
      }
      
      /* Stats cards responsive */
      @media (max-width: 640px) {
        .stats-grid {
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }
        
        .stat-card {
          min-width: auto !important;
          padding: 0.75rem !important;
        }
        
        .stat-card h3 {
          font-size: 0.75rem !important;
        }
        
        .stat-card p {
          font-size: 1.25rem !important;
        }
      }
      
      /* Filter panel responsive */
      @media (max-width: 1024px) {
        .filters-grid {
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }
      }
      
      @media (max-width: 640px) {
        .filters-grid {
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        
        .filter-buttons {
          grid-column: 1;
          justify-content: flex-start !important;
          margin-top: 0 !important;
        }
      }
    `}</style>

    <NotificationToast notifications={notifications} />

    <header className="mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            Payroll Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Create and manage employee payrolls
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 sm:px-6 py-2 sm:py-3 rounded-md text-white primary-btn text-sm sm:text-base"
          style={{ backgroundColor: PRIMARY }}
        >
          <span className="hidden sm:inline">Create New Payroll</span>
          <span className="sm:hidden">New Payroll</span>
        </button>
      </div>
    </header>

    <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 mb-4 sm:mb-6">
      {/* Left: Stats Cards */}
      <div className="flex-shrink-0">
        <div
          className="stats-grid grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4"
          id="stats-cards" 
        >
          <div className="stat-card bg-white p-3 sm:p-4 rounded-lg shadow border-l-4 border-blue-500 text-center min-w-[12.5rem]">
            <h3 className="text-xs sm:text-sm text-gray-500">Total Payrolls</h3>
            <p className="text-lg sm:text-2xl font-bold">{payrolls.length}</p>
          </div>
          <div className="stat-card bg-white p-3 sm:p-4 rounded-lg shadow border-l-4 border-yellow-500 text-center min-w-[12.5rem]">
            <h3 className="text-xs sm:text-sm text-gray-500">Draft</h3>
            <p className="text-lg sm:text-2xl font-bold text-yellow-600">
              {payrolls.filter((p) => p.status === "draft").length}
            </p>
          </div>
          <div className="stat-card bg-white p-3 sm:p-4 rounded-lg shadow border-l-4 border-blue-500 text-center min-w-[12.5rem]">
            <h3 className="text-xs sm:text-sm text-gray-500">Pending Approval</h3>
            <p className="text-lg sm:text-2xl font-bold text-blue-600">
              {payrolls.filter((p) => p.status === "pending_approval").length}
            </p>
          </div>
          <div className="stat-card bg-white p-3 sm:p-4 rounded-lg shadow border-l-4 border-green-500 text-center min-w-[12.5rem]">
            <h3 className="text-xs sm:text-sm text-gray-500">Approved</h3>
            <p className="text-lg sm:text-2xl font-bold text-green-600">
              {payrolls.filter((p) => p.status === "approved").length}
            </p>
          </div>
        </div>
      </div>

      {/* Right: Filters Panel */}
      <div
        className="flex-1 bg-white shadow rounded-lg border-l-4 border-blue-500 flex flex-col"
        style={{ minHeight: "85px" }}
      >
        <div className="flex-1 p-3 sm:p-4">
          <div className="filters-grid grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 h-full items-center">
            {/* Year */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Year
              </label>
              <select
                name="year"
                value={filters.year}
                onChange={handleFilterChange}
                className="w-full p-1.5 sm:p-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full p-1.5 sm:p-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full p-1.5 sm:p-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="draft">Draft</option>
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
                className="w-full p-1.5 sm:p-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Employees</option>
                {employees.map((employee) => (
                  <option key={employee._id} value={employee._id}>
                    {employee.firstName} {employee.lastName} (
                    {employee.employeeId})
                  </option>
                ))}
              </select>
            </div>

            {/* Buttons */}
            <div className="filter-buttons flex gap-2 justify-center mt-2 sm:mt-4">
              <button
                onClick={clearFilters}
                className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors flex items-center gap-1 border"
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

    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
        <h2 className="text-base sm:text-lg font-semibold text-gray-800">
          Payroll Records
        </h2>
      </div>

      {payrolls.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <svg
            className="w-12 sm:w-16 h-12 sm:h-16 text-gray-300 mx-auto mb-4"
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
          <p className="text-gray-500 text-sm sm:text-base">No payroll records found</p>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Try adjusting your filters or create a new payroll
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Basic Salary
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payrolls.map((payroll) => (
                  <tr key={payroll._id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                          <img
                            className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover"
                            src={
                              payroll.employee?.avatarUrl ||
                              "/default-avatar.png"
                            }
                            alt=""
                          />
                        </div>
                        <div className="ml-3 sm:ml-4">
                          <div className="text-xs sm:text-sm font-medium text-gray-900">
                            {payroll.employeeProfile?.firstName}{" "}
                            {payroll.employeeProfile?.lastName}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500">
                            {payroll.employeeProfile?.employeeId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm text-gray-900">
                        {months[parseInt(payroll.month.split("-")[1]) - 1]}{" "}
                        {payroll.year}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        {formatDate(payroll.generatedAt)}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      {formatCurrency(payroll.basic)}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(payroll.status)}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedPayroll(payroll);
                            setShowDetailsModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                        {payroll.status === "draft" && (
                          <button
                            onClick={() =>
                              handleSubmitForApproval(payroll._id)
                            }
                            disabled={actionLoading === payroll._id}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          >
                            {actionLoading === payroll._id
                              ? "Processing..."
                              : "Submit"}
                          </button>
                        )}
                        {payroll.status === "rejected" && (
                          <button
                            onClick={() => {
                              setSelectedPayroll(payroll);
                              setShowDetailsModal(true);
                            }}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            Edit & Resubmit
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden p-4">
            {payrolls.map((payroll) => (
              <div key={payroll._id} className="mobile-table-card">
                {/* Employee Info */}
                <div className="mobile-row">
                  <span className="mobile-label">Employee</span>
                  <div className="mobile-value flex items-center gap-2">
                    <img
                      className="h-6 w-6 rounded-full object-cover"
                      src={
                        payroll.employee?.avatarUrl ||
                        "/default-avatar.png"
                      }
                      alt=""
                    />
                    <div className="text-right">
                      <div className="font-medium text-gray-900 text-xs">
                        {payroll.employeeProfile?.firstName}{" "}
                        {payroll.employeeProfile?.lastName}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {payroll.employeeProfile?.employeeId}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Period */}
                <div className="mobile-row">
                  <span className="mobile-label">Period</span>
                  <div className="mobile-value">
                    <div className="text-gray-900">
                      {months[parseInt(payroll.month.split("-")[1]) - 1]}{" "}
                      {payroll.year}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {formatDate(payroll.generatedAt)}
                    </div>
                  </div>
                </div>

                {/* Basic Salary */}
                <div className="mobile-row">
                  <span className="mobile-label">Basic Salary</span>
                  <span className="mobile-value text-gray-900">
                    {formatCurrency(payroll.basic)}
                  </span>
                </div>

                {/* Status */}
                <div className="mobile-row">
                  <span className="mobile-label">Status</span>
                  <div className="mobile-value">
                    {getStatusBadge(payroll.status)}
                  </div>
                </div>

                {/* Actions */}
                <div className="mobile-row">
                  <span className="mobile-label">Actions</span>
                  <div className="mobile-value flex gap-2 text-xs">
                    <button
                      onClick={() => {
                        setSelectedPayroll(payroll);
                        setShowDetailsModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 px-2 py-1 bg-blue-50 rounded"
                    >
                      View
                    </button>
                    {payroll.status === "draft" && (
                      <button
                        onClick={() =>
                          handleSubmitForApproval(payroll._id)
                        }
                        disabled={actionLoading === payroll._id}
                        className="text-green-600 hover:text-green-900 disabled:opacity-50 px-2 py-1 bg-green-50 rounded"
                      >
                        {actionLoading === payroll._id
                          ? "Processing..."
                          : "Submit"}
                      </button>
                    )}
                    {payroll.status === "rejected" && (
                      <button
                        onClick={() => {
                          setSelectedPayroll(payroll);
                          setShowDetailsModal(true);
                        }}
                        className="text-yellow-600 hover:text-yellow-900 px-2 py-1 bg-yellow-50 rounded text-xs"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>

    {showCreateModal && (
      <CreatePayrollModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreatePayroll}
        token={token}
        addNotification={addNotification}
      />
    )}

    {showDetailsModal && selectedPayroll && (
      <PayrollDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        payroll={selectedPayroll}
        onUpdate={handleUpdatePayroll}
        onSubmitForApproval={handleSubmitForApproval}
        actionLoading={actionLoading}
        formatCurrency={formatCurrency}
        isHR={true}
      />
    )}
  </div>
);

  // return (
  //   <div className="min-h-[80vh] p-4">
  //     <style>{`
  //       .primary-btn:hover { background: ${PRIMARY_HOVER} !important }
  //     `}</style>

  //     <NotificationToast notifications={notifications} />

  //     <header className="mb-6">
  //       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
  //         <div>
  //           <h1 className="text-2xl font-bold text-gray-800">
  //             Payroll Management
  //           </h1>
  //           <p className="text-sm text-gray-600 mt-1">
  //             Create and manage employee payrolls
  //           </p>
  //         </div>
  //         <button
  //           onClick={() => setShowCreateModal(true)}
  //           className="px-6 py-3 rounded-md text-white primary-btn"
  //           style={{ backgroundColor: PRIMARY }}
  //         >
  //           Create New Payroll
  //         </button>
  //       </div>
  //     </header>

  //     <div className="flex flex-col xl:flex-row gap-6 mb-6">
  //       {/* Left: Stats Cards */}
  //       <div className="flex-shrink-0" >
  //         <div
  //           className="grid grid-cols-2 xl:grid-cols-4 gap-4"
  //           id="stats-cards" 
  //         >
  //           <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500 text-center min-w-[200px]">
  //             <h3 className="text-sm text-gray-500">Total Payrolls</h3>
  //             <p className="text-2xl font-bold">{payrolls.length}</p>
  //           </div>
  //           <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500 text-center min-w-[200px]">
  //             <h3 className="text-sm text-gray-500">Draft</h3>
  //             <p className="text-2xl font-bold text-yellow-600">
  //               {payrolls.filter((p) => p.status === "draft").length}
  //             </p>
  //           </div>
  //           <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500 text-center min-w-[200px]">
  //             <h3 className="text-sm text-gray-500">Pending Approval</h3>
  //             <p className="text-2xl font-bold text-blue-600">
  //               {payrolls.filter((p) => p.status === "pending_approval").length}
  //             </p>
  //           </div>
  //           <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500 text-center min-w-[200px]">
  //             <h3 className="text-sm text-gray-500">Approved</h3>
  //             <p className="text-2xl font-bold text-green-600">
  //               {payrolls.filter((p) => p.status === "approved").length}
  //             </p>
  //           </div>
  //         </div>
  //       </div>

  //       {/* Right: Filters Panel */}
  //       <div
  //         className="flex-1 bg-white shadow rounded-lg border-l-4 border-blue-500 flex flex-col"
  //         style={{ height: "85px" }} // optional: can set same height as stats cards
  //       >
  //         <div className="flex-1 p-4">
  //           <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 h-full items-center">
  //             {/* Year */}
  //             <div>
  //               <label className="block text-xs font-medium text-gray-600 mb-1">
  //                 Year
  //               </label>
  //               <select
  //                 name="year"
  //                 value={filters.year}
  //                 onChange={handleFilterChange}
  //                 className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  //               >
  //                 {years.map((year) => (
  //                   <option key={year} value={year}>
  //                     {year}
  //                   </option>
  //                 ))}
  //               </select>
  //             </div>

  //             {/* Month */}
  //             <div>
  //               <label className="block text-xs font-medium text-gray-600 mb-1">
  //                 Month
  //               </label>
  //               <select
  //                 name="month"
  //                 value={filters.month}
  //                 onChange={handleFilterChange}
  //                 className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  //               >
  //                 <option value="">All Months</option>
  //                 {months.map((month, index) => (
  //                   <option key={index + 1} value={index + 1}>
  //                     {month}
  //                   </option>
  //                 ))}
  //               </select>
  //             </div>

  //             {/* Status */}
  //             <div>
  //               <label className="block text-xs font-medium text-gray-600 mb-1">
  //                 Status
  //               </label>
  //               <select
  //                 name="status"
  //                 value={filters.status}
  //                 onChange={handleFilterChange}
  //                 className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  //               >
  //                 <option value="">All Status</option>
  //                 <option value="draft">Draft</option>
  //                 <option value="pending_approval">Pending Approval</option>
  //                 <option value="approved">Approved</option>
  //                 <option value="rejected">Rejected</option>
  //               </select>
  //             </div>

  //             {/* Employee */}
  //             <div>
  //               <label className="block text-xs font-medium text-gray-600 mb-1">
  //                 Employee
  //               </label>
  //               <select
  //                 name="employee"
  //                 value={filters.employee}
  //                 onChange={handleFilterChange}
  //                 className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  //               >
  //                 <option value="">All Employees</option>
  //                 {employees.map((employee) => (
  //                   <option key={employee._id} value={employee._id}>
  //                     {employee.firstName} {employee.lastName} (
  //                     {employee.employeeId})
  //                   </option>
  //                 ))}
  //               </select>
  //             </div>

  //             {/* Buttons */}
  //             <div className="flex gap-2 justify-center mt-4">
  //               <button
  //                 onClick={clearFilters}
  //                 className="px-3 py-2 text-xs bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors flex items-center gap-1 border"
  //                 title="Clear Filters"
  //               >
  //                 <svg
  //                   xmlns="http://www.w3.org/2000/svg"
  //                   className="h-3 w-3"
  //                   fill="none"
  //                   viewBox="0 0 24 24"
  //                   stroke="currentColor"
  //                 >
  //                   <path
  //                     strokeLinecap="round"
  //                     strokeLinejoin="round"
  //                     strokeWidth={2}
  //                     d="M6 18L18 6M6 6l12 12"
  //                   />
  //                 </svg>
  //                 Clear
  //               </button>
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     </div>

  //     <div className="bg-white shadow rounded-lg overflow-hidden">
  //       <div className="px-6 py-4 border-b border-gray-200">
  //         <h2 className="text-lg font-semibold text-gray-800">
  //           Payroll Records
  //         </h2>
  //       </div>

  //       {payrolls.length === 0 ? (
  //         <div className="text-center py-12">
  //           <svg
  //             className="w-16 h-16 text-gray-300 mx-auto mb-4"
  //             fill="none"
  //             stroke="currentColor"
  //             viewBox="0 0 24 24"
  //           >
  //             <path
  //               strokeLinecap="round"
  //               strokeLinejoin="round"
  //               strokeWidth={2}
  //               d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
  //             />
  //           </svg>
  //           <p className="text-gray-500">No payroll records found</p>
  //           <p className="text-sm text-gray-400 mt-1">
  //             Try adjusting your filters or create a new payroll
  //           </p>
  //         </div>
  //       ) : (
  //         <div className="overflow-x-auto">
  //           <table className="min-w-full divide-y divide-gray-200">
  //             <thead className="bg-gray-50">
  //               <tr>
  //                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
  //                   Employee
  //                 </th>
  //                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
  //                   Period
  //                 </th>
  //                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
  //                   Basic Salary
  //                 </th>
  //                 {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
  //                   Net Pay
  //                 </th> */}
  //                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
  //                   Status
  //                 </th>
  //                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
  //                   Actions
  //                 </th>
  //               </tr>
  //             </thead>
  //             <tbody className="bg-white divide-y divide-gray-200">
  //               {payrolls.map((payroll) => (
  //                 <tr key={payroll._id} className="hover:bg-gray-50">
  //                   <td className="px-6 py-4 whitespace-nowrap">
  //                     <div className="flex items-center">
  //                       <div className="flex-shrink-0 h-10 w-10">
  //                         <img
  //                           className="h-10 w-10 rounded-full object-cover"
  //                           src={
  //                             payroll.employee?.avatarUrl ||
  //                             "/default-avatar.png"
  //                           }
  //                           alt=""
  //                         />
  //                       </div>
  //                       <div className="ml-4">
  //                         <div className="text-sm font-medium text-gray-900">
  //                           {payroll.employeeProfile?.firstName}{" "}
  //                           {payroll.employeeProfile?.lastName}
  //                         </div>
  //                         <div className="text-sm text-gray-500">
  //                           {payroll.employeeProfile?.employeeId}
  //                         </div>
  //                       </div>
  //                     </div>
  //                   </td>
  //                   <td className="px-6 py-4 whitespace-nowrap">
  //                     <div className="text-sm text-gray-900">
  //                       {months[parseInt(payroll.month.split("-")[1]) - 1]}{" "}
  //                       {payroll.year}
  //                     </div>
  //                     <div className="text-sm text-gray-500">
  //                       {formatDate(payroll.generatedAt)}
  //                     </div>
  //                   </td>
  //                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
  //                     {formatCurrency(payroll.basic)}
  //                   </td>
  //                   {/* <td className="px-6 py-4 whitespace-nowrap">
  //                     <div className="text-sm font-semibold text-green-600">
  //                       {formatCurrency(payroll.netPay)}
  //                     </div>
  //                   </td> */}
  //                   <td className="px-6 py-4 whitespace-nowrap">
  //                     {getStatusBadge(payroll.status)}
  //                   </td>
  //                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
  //                     <div className="flex gap-2">
  //                       <button
  //                         onClick={() => {
  //                           setSelectedPayroll(payroll);
  //                           setShowDetailsModal(true);
  //                         }}
  //                         className="text-blue-600 hover:text-blue-900"
  //                       >
  //                         View
  //                       </button>
  //                       {payroll.status === "draft" && (
  //                         <>
  //                           <button
  //                             onClick={() =>
  //                               handleSubmitForApproval(payroll._id)
  //                             }
  //                             disabled={actionLoading === payroll._id}
  //                             className="text-green-600 hover:text-green-900 disabled:opacity-50"
  //                           >
  //                             {actionLoading === payroll._id
  //                               ? "Processing..."
  //                               : "Submit"}
  //                           </button>
  //                         </>
  //                       )}
  //                       {payroll.status === "rejected" && (
  //                         <button
  //                           onClick={() => {
  //                             setSelectedPayroll(payroll);
  //                             setShowDetailsModal(true);
  //                           }}
  //                           className="text-yellow-600 hover:text-yellow-900"
  //                         >
  //                           Edit & Resubmit
  //                         </button>
  //                       )}
  //                     </div>
  //                   </td>
  //                 </tr>
  //               ))}
  //             </tbody>
  //           </table>
  //         </div>
  //       )}
  //     </div>

  //     {showCreateModal && (
  //       // <CreatePayrollModal
  //       //   isOpen={showCreateModal}
  //       //   onClose={() => setShowCreateModal(false)}
  //       //   onCreate={handleCreatePayroll}
  //       //   employees={employees}
  //       //   token={token}
  //       //   addNotification={addNotification}
  //       // />

  //       <CreatePayrollModal
  //         isOpen={showCreateModal}
  //         onClose={() => setShowCreateModal(false)}
  //         onCreate={handleCreatePayroll}
  //         token={token}
  //         addNotification={addNotification}
  //       />
  //     )}

  //     {showDetailsModal && selectedPayroll && (
  //       <PayrollDetailsModal
  //         isOpen={showDetailsModal}
  //         onClose={() => setShowDetailsModal(false)}
  //         payroll={selectedPayroll}
  //         onUpdate={handleUpdatePayroll}
  //         onSubmitForApproval={handleSubmitForApproval}
  //         actionLoading={actionLoading}
  //         formatCurrency={formatCurrency}
  //         isHR={true}
  //       />
  //     )}
  //   </div>
  // );
};

export default HRPayrollManagement;
