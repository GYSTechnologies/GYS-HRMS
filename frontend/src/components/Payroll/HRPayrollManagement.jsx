// import React, { useState, useEffect } from "react";
// import axiosInstance from "../../utils/axiosInstance";
// import { useAuth } from "../../context/AppContext";
// import NotificationToast from "../../components/common/NotificationToast";
// import CreatePayrollModal from "./CreatePayrollModal.jsx";
// import PayrollDetailsModal from "./PayrollDetailsModal.jsx";

// const PRIMARY = "#104774";
// const PRIMARY_HOVER = "#0d3a61";

// const HRPayrollManagement = () => {
//   const { token } = useAuth();
//   const [payrolls, setPayrolls] = useState([]);
//   const [employees, setEmployees] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filters, setFilters] = useState({
//     year: new Date().getFullYear(),
//     month: new Date().getMonth() + 1,
//     status: "",
//     employee: ""
//   });
//   const [notifications, setNotifications] = useState([]);
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [selectedPayroll, setSelectedPayroll] = useState(null);
//   const [showDetailsModal, setShowDetailsModal] = useState(false);
//   const [actionLoading, setActionLoading] = useState(null);

//   useEffect(() => {
//     fetchPayrolls();
//     fetchEmployees();
//   }, [filters]);

//   const addNotification = (message, type = "info", ttl = 3500) => {
//     const id = Date.now() + Math.random();
//     setNotifications((n) => [...n, { id, message, type }]);
//     setTimeout(() => setNotifications((n) => n.filter((x) => x.id !== id)), ttl);
//   };

//   const fetchPayrolls = async () => {
//     try {
//       setLoading(true);
//       const params = new URLSearchParams();
//       if (filters.year) params.append('year', filters.year);
//       if (filters.month) params.append('month', filters.month);
//       if (filters.status) params.append('status', filters.status);
//       if (filters.employee) params.append('employee', filters.employee);

//       const response = await axiosInstance.get(
//         `/payroll?${params}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setPayrolls(response.data.data || []);
//     } catch (error) {
//       console.error("Error fetching payrolls:", error);
//       addNotification(
//         error.response?.data?.message || "Could not fetch payroll records",
//         "error"
//       );
//       setPayrolls([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchEmployees = async () => {
//     try {
//       const response = await axiosInstance.get(
//         "/employee/all-employees",
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setEmployees(response.data.data || []);
//     } catch (error) {
//       console.error("Error fetching employees:", error);
//       addNotification("Error fetching employees", "error");
//     }
//   };

//   const handleCreatePayroll = async (payrollData) => {
//     try {
//       const response = await axiosInstance.post(
//         "/payroll/monthly",
//         payrollData,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
      
//       addNotification("Payroll created successfully", "success");
//       setShowCreateModal(false);
//       fetchPayrolls(); // Refresh list
//     } catch (error) {
//       console.error("Error creating payroll:", error);
//       addNotification(
//         error.response?.data?.message || "Error creating payroll",
//         "error"
//       );
//     }
//   };

//   const handleUpdatePayroll = async (payrollId, updates) => {
//     try {
//       setActionLoading(payrollId);
//       const response = await axiosInstance.put(
//         `/payroll/${payrollId}`,
//         updates,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
      
//       addNotification("Payroll updated successfully", "success");
//       setShowDetailsModal(false);
//       fetchPayrolls(); // Refresh list
//     } catch (error) {
//       console.error("Error updating payroll:", error);
//       addNotification(
//         error.response?.data?.message || "Error updating payroll",
//         "error"
//       );
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   const handleApproveReject = async (payrollId, action, reason = "") => {
//     try {
//       setActionLoading(payrollId);
//       const response = await axiosInstance.patch(
//         `/payroll/${payrollId}/approve`,
//         { action, rejectionReason: reason },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
      
//       addNotification(`Payroll ${action}ed successfully`, "success");
//       setShowDetailsModal(false);
//       fetchPayrolls(); // Refresh list
//     } catch (error) {
//       console.error("Error processing payroll:", error);
//       addNotification(
//         error.response?.data?.message || `Error ${action}ing payroll`,
//         "error"
//       );
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   const handleFilterChange = (e) => {
//     const { name, value } = e.target;
//     setFilters(prev => ({ ...prev, [name]: value }));
//   };

//   const clearFilters = () => {
//     setFilters({
//       year: new Date().getFullYear(),
//       month: new Date().getMonth() + 1,
//       status: "",
//       employee: ""
//     });
//   };

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat("en-IN", {
//       style: "currency",
//       currency: "INR",
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0,
//     }).format(amount);
//   };

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString("en-IN", {
//       day: "numeric",
//       month: "short",
//       year: "numeric",
//     });
//   };

//   const getStatusBadge = (status) => {
//     const statusClasses = {
//       draft: "bg-gray-100 text-gray-800",
//       pending_approval: "bg-yellow-100 text-yellow-800",
//       approved: "bg-green-100 text-green-800",
//       rejected: "bg-red-100 text-red-800",
//     };
//     return (
//       <span
//         className={`px-3 py-1 rounded-full text-sm font-medium ${
//           statusClasses[status] || "bg-gray-100 text-gray-800"
//         }`}
//       >
//         {status.replace("_", " ").toUpperCase()}
//       </span>
//     );
//   };

//   const months = [
//     "January", "February", "March", "April", "May", "June",
//     "July", "August", "September", "October", "November", "December"
//   ];

//   const currentYear = new Date().getFullYear();
//   const years = Array.from({ length: 3 }, (_, i) => currentYear + i);

//   if (loading && payrolls.length === 0) {
//     return (
//       <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
//         <div className="text-center">
//           <div
//             className="animate-spin inline-block w-8 h-8 border-4 rounded-full"
//             style={{
//               borderColor: PRIMARY,
//               borderLeftColor: "transparent",
//             }}
//             role="status"
//           />
//           <p className="mt-2 text-gray-600">Loading payroll records...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-[80vh] p-4">
//       <style>{`
//         .primary-btn:hover { background: ${PRIMARY_HOVER} !important }
//       `}</style>

//       <NotificationToast notifications={notifications} />

//       {/* Header */}
//       <header className="mb-6">
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-800">Payroll Management</h1>
//             <p className="text-sm text-gray-600 mt-1">
//               Create and manage employee payrolls
//             </p>
//           </div>
//           <button
//             onClick={() => setShowCreateModal(true)}
//             className="px-6 py-3 rounded-md text-white primary-btn"
//             style={{ backgroundColor: PRIMARY }}
//           >
//             Create New Payroll
//           </button>
//         </div>
//       </header>

//       {/* Filters */}
//       <div className="bg-white shadow rounded-lg p-6 mb-6">
//         <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Year
//             </label>
//             <select
//               name="year"
//               value={filters.year}
//               onChange={handleFilterChange}
//               className="w-full p-3 border border-gray-300 rounded-md"
//             >
//               {years.map((year) => (
//                 <option key={year} value={year}>
//                   {year}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Month
//             </label>
//             <select
//               name="month"
//               value={filters.month}
//               onChange={handleFilterChange}
//               className="w-full p-3 border border-gray-300 rounded-md"
//             >
//               <option value="">All Months</option>
//               {months.map((month, index) => (
//                 <option key={index + 1} value={index + 1}>
//                   {month}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Status
//             </label>
//             <select
//               name="status"
//               value={filters.status}
//               onChange={handleFilterChange}
//               className="w-full p-3 border border-gray-300 rounded-md"
//             >
//               <option value="">All Status</option>
//               <option value="draft">Draft</option>
//               <option value="pending_approval">Pending Approval</option>
//               <option value="approved">Approved</option>
//               <option value="rejected">Rejected</option>
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Employee
//             </label>
//             <select
//               name="employee"
//               value={filters.employee}
//               onChange={handleFilterChange}
//               className="w-full p-3 border border-gray-300 rounded-md"
//             >
//               <option value="">All Employees</option>
//               {employees.map((employee) => (
//                 <option key={employee._id} value={employee._id}>
//                   {employee.firstName} {employee.lastName} ({employee.employeeId})
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="flex items-end gap-2">
//             <button
//               onClick={clearFilters}
//               className="px-4 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
//             >
//               Clear
//             </button>
//             <button
//               onClick={fetchPayrolls}
//               className="px-4 py-3 rounded-md text-white primary-btn"
//               style={{ backgroundColor: PRIMARY }}
//             >
//               Apply
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Payroll Statistics */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//         <div className="bg-white p-4 rounded-lg shadow">
//           <h3 className="text-sm text-gray-500">Total Payrolls</h3>
//           <p className="text-2xl font-bold">{payrolls.length}</p>
//         </div>
//         <div className="bg-white p-4 rounded-lg shadow">
//           <h3 className="text-sm text-gray-500">Draft</h3>
//           <p className="text-2xl font-bold text-yellow-600">
//             {payrolls.filter(p => p.status === 'draft').length}
//           </p>
//         </div>
//         <div className="bg-white p-4 rounded-lg shadow">
//           <h3 className="text-sm text-gray-500">Pending Approval</h3>
//           <p className="text-2xl font-bold text-blue-600">
//             {payrolls.filter(p => p.status === 'pending_approval').length}
//           </p>
//         </div>
//         <div className="bg-white p-4 rounded-lg shadow">
//           <h3 className="text-sm text-gray-500">Approved</h3>
//           <p className="text-2xl font-bold text-green-600">
//             {payrolls.filter(p => p.status === 'approved').length}
//           </p>
//         </div>
//       </div>

//       {/* Payroll Table */}
//       <div className="bg-white shadow rounded-lg overflow-hidden">
//         <div className="px-6 py-4 border-b border-gray-200">
//           <h2 className="text-lg font-semibold text-gray-800">Payroll Records</h2>
//         </div>

//         {payrolls.length === 0 ? (
//           <div className="text-center py-12">
//             <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//             </svg>
//             <p className="text-gray-500">No payroll records found</p>
//             <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or create a new payroll</p>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Employee
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Period
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Basic Salary
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Net Pay
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Status
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {payrolls.map((payroll) => (
//                   <tr key={payroll._id} className="hover:bg-gray-50">
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="flex items-center">
//                         <div className="flex-shrink-0 h-10 w-10">
//                           <img
//                             className="h-10 w-10 rounded-full object-cover"
//                             src={payroll.employeeProfile?.avatarUrl || "/default-avatar.png"}
//                             alt=""
//                           />
//                         </div>
//                         <div className="ml-4">
//                           <div className="text-sm font-medium text-gray-900">
//                             {payroll.employeeProfile?.firstName} {payroll.employeeProfile?.lastName}
//                           </div>
//                           <div className="text-sm text-gray-500">
//                             {payroll.employeeProfile?.employeeId}
//                           </div>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm text-gray-900">
//                         {months[parseInt(payroll.month.split('-')[1]) - 1]} {payroll.year}
//                       </div>
//                       <div className="text-sm text-gray-500">
//                         {formatDate(payroll.generatedAt)}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                       {formatCurrency(payroll.basic)}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm font-semibold text-green-600">
//                         {formatCurrency(payroll.netPay)}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       {getStatusBadge(payroll.status)}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                       <div className="flex gap-2">
//                         <button
//                           onClick={() => {
//                             setSelectedPayroll(payroll);
//                             setShowDetailsModal(true);
//                           }}
//                           className="text-blue-600 hover:text-blue-900"
//                         >
//                           View
//                         </button>
//                         {payroll.status === "draft" && (
//                           <button
//                             onClick={() => handleApproveReject(payroll._id, "approve")}
//                             disabled={actionLoading === payroll._id}
//                             className="text-green-600 hover:text-green-900 disabled:opacity-50"
//                           >
//                             {actionLoading === payroll._id ? "Processing..." : "Submit for Approval"}
//                           </button>
//                         )}
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {/* Modals */}
//       {showCreateModal && (
//         <CreatePayrollModal
//           isOpen={showCreateModal}
//           onClose={() => setShowCreateModal(false)}
//           onCreate={handleCreatePayroll}
//           employees={employees}
//           token={token}
//           addNotification={addNotification}
//         />
//       )}

//       {showDetailsModal && selectedPayroll && (
//         <PayrollDetailsModal
//           isOpen={showDetailsModal}
//           onClose={() => setShowDetailsModal(false)}
//           payroll={selectedPayroll}
//           onUpdate={handleUpdatePayroll}
//           onApproveReject={handleApproveReject}
//           actionLoading={actionLoading}
//           formatCurrency={formatCurrency}
//           isHR={true}
//         />
//       )}
//     </div>
//   );
// };

// export default HRPayrollManagement;

// Enhanced HRPayrollManagement.jsx
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
    employee: ""
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
    setTimeout(() => setNotifications((n) => n.filter((x) => x.id !== id)), ttl);
  };

  const fetchPayrolls = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.year) params.append('year', filters.year);
      if (filters.month) params.append('month', filters.month);
      if (filters.status) params.append('status', filters.status);
      if (filters.employee) params.append('employee', filters.employee);

      const response = await axiosInstance.get(
        `/payroll?${params}`,
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

  const fetchEmployees = async () => {
    try {
      const response = await axiosInstance.get(
        "/employee/all-employees",
        { headers: { Authorization: `Bearer ${token}` } }
      );
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
      fetchPayrolls();
    } catch (error) {
      console.error("Error creating payroll:", error);
      addNotification(
        error.response?.data?.message || "Error creating payroll",
        "error"
      );
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
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      status: "",
      employee: ""
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
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
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
    <div className="min-h-[80vh] p-4">
      <style>{`
        .primary-btn:hover { background: ${PRIMARY_HOVER} !important }
      `}</style>

      <NotificationToast notifications={notifications} />

      <header className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Payroll Management</h1>
            <p className="text-sm text-gray-600 mt-1">
              Create and manage employee payrolls
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 rounded-md text-white primary-btn"
            style={{ backgroundColor: PRIMARY }}
          >
            Create New Payroll
          </button>
        </div>
      </header>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year
            </label>
            <select
              name="year"
              value={filters.year}
              onChange={handleFilterChange}
              className="w-full p-3 border border-gray-300 rounded-md"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Month
            </label>
            <select
              name="month"
              value={filters.month}
              onChange={handleFilterChange}
              className="w-full p-3 border border-gray-300 rounded-md"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full p-3 border border-gray-300 rounded-md"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="pending_approval">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employee
            </label>
            <select
              name="employee"
              value={filters.employee}
              onChange={handleFilterChange}
              className="w-full p-3 border border-gray-300 rounded-md"
            >
              <option value="">All Employees</option>
              {employees.map((employee) => (
                <option key={employee._id} value={employee._id}>
                  {employee.firstName} {employee.lastName} ({employee.employeeId})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={clearFilters}
              className="px-4 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Clear
            </button>
            <button
              onClick={fetchPayrolls}
              className="px-4 py-3 rounded-md text-white primary-btn"
              style={{ backgroundColor: PRIMARY }}
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm text-gray-500">Total Payrolls</h3>
          <p className="text-2xl font-bold">{payrolls.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm text-gray-500">Draft</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {payrolls.filter(p => p.status === 'draft').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm text-gray-500">Pending Approval</h3>
          <p className="text-2xl font-bold text-blue-600">
            {payrolls.filter(p => p.status === 'pending_approval').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm text-gray-500">Approved</h3>
          <p className="text-2xl font-bold text-green-600">
            {payrolls.filter(p => p.status === 'approved').length}
          </p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Payroll Records</h2>
        </div>

        {payrolls.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500">No payroll records found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or create a new payroll</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Basic Salary
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net Pay
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
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
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={payroll.employeeProfile?.avatarUrl || "/default-avatar.png"}
                            alt=""
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {payroll.employeeProfile?.firstName} {payroll.employeeProfile?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {payroll.employeeProfile?.employeeId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {months[parseInt(payroll.month.split('-')[1]) - 1]} {payroll.year}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(payroll.generatedAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(payroll.basic)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-green-600">
                        {formatCurrency(payroll.netPay)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(payroll.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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
                          <>
                            <button
                              onClick={() => handleSubmitForApproval(payroll._id)}
                              disabled={actionLoading === payroll._id}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50"
                            >
                              {actionLoading === payroll._id ? "Processing..." : "Submit"}
                            </button>
                          </>
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
        )}
      </div>

      {showCreateModal && (
        <CreatePayrollModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreatePayroll}
          employees={employees}
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
};

export default HRPayrollManagement;