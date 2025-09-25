import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { useAuth } from "../../context/AppContext";
import NotificationToast from "../../components/common/NotificationToast";

const PRIMARY = "#104774";
const PRIMARY_HOVER = "#0d3a61";

const EmployeePayroll = () => {
  const { token, user } = useAuth();
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [notifications, setNotifications] = useState([]);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchEmployeePayrolls();
  }, [selectedYear, selectedMonth]);

  const addNotification = (message, type = "info", ttl = 3500) => {
    const id = Date.now() + Math.random();
    setNotifications((n) => [...n, { id, message, type }]);
    setTimeout(
      () => setNotifications((n) => n.filter((x) => x.id !== id)),
      ttl
    );
  };

  const fetchEmployeePayrolls = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/payroll/employee/my-payrolls?year=${selectedYear}&month=${selectedMonth}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
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

  const downloadPayslip = async (payrollId) => {
    try {
      // ✅ Direct download API call
      const response = await axiosInstance.get(
        `/payroll/payslip/${payrollId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      // ✅ Create download link
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `payslip-${payrollId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      addNotification("Payslip downloaded successfully", "success");
    } catch (error) {
      console.error("Error downloading payslip:", error);

      // ✅ Specific error handling
      if (error.response?.status === 404) {
        if (error.response?.data?.message === "Payslip not generated yet") {
          addNotification(
            "Payslip not ready yet. Please try again later.",
            "error"
          );
        } else {
          addNotification("Payslip file missing. Contact HR.", "error");
        }
      } else {
        addNotification(
          error.response?.data?.message || "Error downloading payslip",
          "error"
        );
      }
    }
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
      month: "long",
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
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  if (loading) {
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
    <div className="min-h-[80vh] p-4 sm:p-6 max-w-[1200px] mx-auto">
      <style>{`
      .primary-btn:hover { background: ${PRIMARY_HOVER} !important }
    `}</style>

      <NotificationToast notifications={notifications} />

      {/* Header + Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6 gap-3 md:gap-0">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
            My Payroll & Payslips
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            View and download your salary slips
          </p>
        </div>

        {/* Filters */}
        <div className="mt-2 md:mt-0 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 bg-white shadow rounded-lg p-2 sm:p-3">
          <div className="w-full sm:w-24">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full p-1 border border-gray-300 rounded-md text-xs sm:text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-28">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Month
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-full p-1 border border-gray-300 rounded-md text-xs sm:text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All</option>
              {months.map((month, index) => (
                <option key={index + 1} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-white shadow rounded-lg">
        {payrolls.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No payroll records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto sm:overflow-x-hidden">
            <table className="min-w-full border-collapse text-xs sm:text-sm md:text-base hidden sm:table">
              <thead className="bg-[#104774]">
                <tr>
                  <th className="px-3 py-2 text-left text-white font-semibold">
                    Month
                  </th>
                  <th className="px-3 py-2 text-left text-white font-semibold">
                    Generated On
                  </th>
                  <th className="px-3 py-2 text-right text-white font-semibold">
                    Net Salary
                  </th>
                  <th className="px-3 py-2 text-center text-white font-semibold">
                    Status
                  </th>
                  <th className="px-3 py-2 text-center text-white font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payrolls
                  .sort(
                    (a, b) =>
                      new Date(b.year + "-" + b.month) -
                      new Date(a.year + "-" + a.month)
                  )
                  .map((payroll) => (
                    <tr key={payroll._id} className="hover:bg-gray-50">
                      <td className="px-3 py-2">
                        {months[parseInt(payroll.month.split("-")[1]) - 1]}{" "}
                        {payroll.year}
                      </td>
                      <td className="px-3 py-2">
                        {formatDate(payroll.approvedAt)}
                      </td>
                      <td className="px-3 py-2 text-right text-green-600 font-semibold">
                        {formatCurrency(payroll.netPay)}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {getStatusBadge(payroll.status)}
                      </td>
                      <td className="px-3 py-2 text-center space-x-1 flex justify-center">
                        <button
                          onClick={() => {
                            setSelectedPayroll(payroll);
                            setShowDetailsModal(true);
                          }}
                          className="px-2 py-1 border border-gray-300 rounded-md text-gray-700 text-xs sm:text-sm hover:bg-gray-50"
                        >
                          View
                        </button>
                        {payroll.status === "approved" && (
                          <button
                            onClick={() => downloadPayslip(payroll._id)}
                            className="px-2 py-1 rounded-md text-white text-xs sm:text-sm primary-btn"
                            style={{ backgroundColor: PRIMARY }}
                          >
                            Download
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {/* Mobile Card View */}
            <div className="sm:hidden space-y-3">
              {payrolls
                .sort(
                  (a, b) =>
                    new Date(b.year + "-" + b.month) -
                    new Date(a.year + "-" + a.month)
                )
                .map((payroll) => (
                  <div
                    key={payroll._id}
                    className="bg-gray-50 p-3 rounded-lg shadow-sm"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">
                        {months[parseInt(payroll.month.split("-")[1]) - 1]}{" "}
                        {payroll.year}
                      </span>
                      <span className="text-green-600 font-semibold">
                        {formatCurrency(payroll.netPay)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mb-1">
                      Generated: {formatDate(payroll.approvedAt)}
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      Status: {getStatusBadge(payroll.status)}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedPayroll(payroll);
                          setShowDetailsModal(true);
                        }}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded-md text-gray-700 text-xs hover:bg-gray-50"
                      >
                        View
                      </button>
                      {payroll.status === "approved" && (
                        <button
                          onClick={() => downloadPayslip(payroll._id)}
                          className="flex-1 px-2 py-1 rounded-md text-white text-xs primary-btn"
                          style={{ backgroundColor: PRIMARY }}
                        >
                          Download
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Payroll Details Modal */}
      {showDetailsModal && selectedPayroll && (
        <PayrollDetailsModal
          payroll={selectedPayroll}
          onClose={() => setShowDetailsModal(false)}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
};

// Payroll Details Modal Component
const PayrollDetailsModal = ({ payroll, onClose, formatCurrency }) => {
  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Salary Details - {payroll.month}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Earnings Section */}
          <div>
            <h3 className="text-lg font-semibold text-green-700 mb-4">
              Earnings
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Basic Salary:</span>
                <span className="font-semibold">
                  {formatCurrency(payroll.basic)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>House Rent Allowance (HRA):</span>
                <span className="font-semibold">
                  {formatCurrency(payroll.hra)}
                </span>
              </div>
              {payroll.allowances &&
                payroll.allowances.map((allowance, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{allowance.title}:</span>
                    <span className="font-semibold">
                      {formatCurrency(allowance.amount)}
                    </span>
                  </div>
                ))}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total Earnings:</span>
                  <span className="text-green-600">
                    {formatCurrency(payroll.totalEarnings)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Deductions Section */}
          <div>
            <h3 className="text-lg font-semibold text-red-700 mb-4">
              Deductions
            </h3>
            <div className="space-y-3">
              {payroll.absentDeduction > 0 && (
                <div className="flex justify-between">
                  <span>
                    Absent Days Deduction ({payroll.absentDays} days):
                  </span>
                  <span className="font-semibold text-red-600">
                    -{formatCurrency(payroll.absentDeduction)}
                  </span>
                </div>
              )}
              {payroll.deductions &&
                payroll.deductions.map((deduction, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{deduction.title}:</span>
                    <span className="font-semibold text-red-600">
                      -{formatCurrency(deduction.amount)}
                    </span>
                  </div>
                ))}
              {payroll.tax > 0 && (
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span className="font-semibold text-red-600">
                    -{formatCurrency(payroll.tax)}
                  </span>
                </div>
              )}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total Deductions:</span>
                  <span className="text-red-600">
                    -{formatCurrency(payroll.totalDeductions)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Net Pay */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Net Salary</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(payroll.netPay)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Status</p>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  payroll.status === "approved"
                    ? "bg-green-100 text-green-800"
                    : payroll.status === "rejected"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {payroll.status.replace("_", " ").toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeePayroll;
