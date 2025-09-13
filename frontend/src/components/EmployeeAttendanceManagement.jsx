// import React, { useEffect, useState } from "react";
// import axiosInstance from "../utils/axiosInstance"; // adjust if needed
// import { useAuth } from "../context/AppContext";

// const PRIMARY = "#104774";
// const PRIMARY_HOVER = "#0d3a61";

// const EmployeeAttendanceManagement = () => {
//   const { token } = useAuth(); // get token from AuthContext
//   const [attendanceRecords, setAttendanceRecords] = useState([]);
//   const [filteredRecords, setFilteredRecords] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filters, setFilters] = useState({
//     employee: "",
//     date: "",
//     status: "",
//   });
//   const [stats, setStats] = useState({
//     totalEmployees: 0,
//     present: 0,
//     absent: 0,
//     pending: 0,
//   });

//   const [notifications, setNotifications] = useState([]); // simple toasts

//   useEffect(() => {
//     if (token) {
//       fetchAllAttendances();
//       fetchStats();
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [token]);

//   useEffect(() => {
//     applyFilters();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [filters, attendanceRecords]);

//   const addNotification = (message, type = "info", ttl = 3500) => {
//     const id = Date.now() + Math.random();
//     setNotifications((n) => [...n, { id, message, type }]);
//     setTimeout(
//       () => setNotifications((n) => n.filter((x) => x.id !== id)),
//       ttl
//     );
//   };

//   const fetchAllAttendances = async () => {
//     setLoading(true);
//     try {
//       const response = await axiosInstance.get("/attendance/all", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setAttendanceRecords(response.data || []);
//     } catch (error) {
//       console.error("Error fetching all attendances:", error);
//       addNotification(
//         error.response?.data?.message || "Could not fetch attendance records",
//         "error"
//       );
//       setAttendanceRecords([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchStats = async () => {
//     try {
//       const response = await axiosInstance.get("/attendance/stats", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setStats(response.data || {});
//     } catch (error) {
//       console.error("Error fetching stats:", error);
//       addNotification(
//         error.response?.data?.message || "Could not fetch stats",
//         "error"
//       );
//     }
//   };

//   const applyFilters = () => {
//     let filtered = [...attendanceRecords];

//     if (filters.employee) {
//       filtered = filtered.filter((record) => {
//         const fullName = `${record.employee?.profileRef?.firstName || ""} ${
//           record.employee?.profileRef?.lastName || ""
//         }`.trim();
//         return (
//           fullName.toLowerCase().includes(filters.employee.toLowerCase()) ||
//           (record.employee?.email || "")
//             .toLowerCase()
//             .includes(filters.employee.toLowerCase())
//         );
//       });
//     }

//     if (filters.date) {
//       filtered = filtered.filter((record) => {
//         if (!record.date) return false;
//         return (
//           new Date(record.date).toLocaleDateString() ===
//           new Date(filters.date).toLocaleDateString()
//         );
//       });
//     }

//     if (filters.status) {
//       filtered = filtered.filter((record) => record.status === filters.status);
//     }

//     setFilteredRecords(filtered);
//   };

//   const handleFilterChange = (e) => {
//     const { name, value } = e.target;
//     setFilters((prev) => ({ ...prev, [name]: value }));
//   };

//   const clearFilters = () => {
//     setFilters({ employee: "", date: "", status: "" });
//   };

//   // Time helpers - prefer checkIn/checkOut, then createdAt/updatedAt, then date
//   const getLoginTimeForRecord = (rec) =>
//     rec?.checkIn || rec?.createdAt || rec?.date || null;
//   const getLogoutTimeForRecord = (rec) =>
//     rec?.checkOut || rec?.updatedAt || null;

//   const formatTime = (timeString) => {
//     if (!timeString) return "-";
//     try {
//       return new Date(timeString).toLocaleTimeString([], {
//         hour: "2-digit",
//         minute: "2-digit",
//       });
//     } catch {
//       return "-";
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return "-";
//     try {
//       return new Date(dateString).toLocaleDateString();
//     } catch {
//       return "-";
//     }
//   };

//   const getStatusBadge = (status) => {
//     const statusClasses = {
//       pending: "bg-yellow-100 text-yellow-800",
//       accepted: "bg-green-100 text-green-800",
//       rejected: "bg-red-100 text-red-800",
//     };
//     return (
//       <span
//         className={`px-2 py-1 rounded-full text-xs ${
//           statusClasses[status] || "bg-gray-100 text-gray-800"
//         }`}
//       >
//         {status}
//       </span>
//     );
//   };

//   const exportToCSV = () => {
//     const headers = [
//       "Employee Name",
//       "Email",
//       "Date",
//       "Login Time",
//       "Logout Time",
//       "Status",
//       "Work Progress",
//       "Task Description",
//       "Logout Note",
//       "Early Logout Reason",
//     ];
//     const csvData = filteredRecords.map((record) => {
//       const name = `${record.employee?.profileRef?.firstName || ""} ${
//         record.employee?.profileRef?.lastName || ""
//       }`.trim();
//       const task = record.taskDescription
//         ? record.taskDescription.replace(/"/g, '""')
//         : "";
//       const logoutNote = record.logoutDescription
//         ? record.logoutDescription.replace(/"/g, '""')
//         : "";
//       const early = record.earlyLogoutReason
//         ? record.earlyLogoutReason.replace(/"/g, '""')
//         : "";
//       return [
//         `"${name}"`,
//         `"${record.employee?.email || ""}"`,
//         `"${formatDate(record.date)}"`,
//         `"${formatTime(getLoginTimeForRecord(record))}"`,
//         `"${formatTime(getLogoutTimeForRecord(record))}"`,
//         `"${record.status || ""}"`,
//         `"${record.workProgress || ""}"`,
//         `"${task}"`,
//         `"${logoutNote}"`,
//         `"${early}"`,
//       ];
//     });

//     const csvContent = [
//       headers.join(","),
//       ...csvData.map((row) => row.join(",")),
//     ].join("\n");

//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement("a");
//     link.href = url;
//     link.setAttribute(
//       "download",
//       `attendance_records_${new Date().toISOString().split("T")[0]}.csv`
//     );
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     addNotification("CSV exported", "success");
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
//         <div className="text-center">
//           <div
//             className="animate-spin inline-block w-8 h-8 border-4 rounded-full"
//             style={{
//               borderColor: `${PRIMARY}`,
//               borderLeftColor: "transparent",
//             }}
//             role="status"
//           />
//           <p className="mt-2 text-gray-600">Loading attendance records...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-[80vh] p-4">
//       {/* small inline styles for hover behavior */}
//       <style>{`
//         .primary-btn:hover { background: ${PRIMARY_HOVER} !important }
//         .primary-border-active { border-bottom-color: ${PRIMARY} !important; color: ${PRIMARY} !important }
//       `}</style>

//       {/* Notifications (toasts) */}
//       <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
//         {notifications.map((n) => (
//           <div
//             key={n.id}
//             className={`max-w-sm w-full px-4 py-2 rounded shadow text-sm ${
//               n.type === "success"
//                 ? "bg-green-50 text-green-800 border border-green-100"
//                 : n.type === "error"
//                 ? "bg-red-50 text-red-800 border border-red-100"
//                 : "bg-white text-gray-800 border"
//             }`}
//           >
//             {n.message}
//           </div>
//         ))}
//       </div>

//       {/* Header */}
//       <header className=" p-4 mb-6">
//         <h1 className="text-2xl font-bold text-gray-800">
//           Employee Attendance Management
//         </h1>
//       </header>

//       {/* Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//         <div className="bg-white p-4 rounded-lg shadow">
//           <h3 className="text-sm text-gray-500">Total Employees</h3>
//           <p className="text-2xl font-bold">{stats.totalEmployees ?? 0}</p>
//         </div>
//         <div className="bg-white p-4 rounded-lg shadow">
//           <h3 className="text-sm text-gray-500">Present Today</h3>
//           <p className="text-2xl font-bold text-green-600">
//             {stats.present ?? 0}
//           </p>
//         </div>
//         <div className="bg-white p-4 rounded-lg shadow">
//           <h3 className="text-sm text-gray-500">Absent Today</h3>
//           <p className="text-2xl font-bold text-red-600">{stats.absent ?? 0}</p>
//         </div>
//         <div className="bg-white p-4 rounded-lg shadow">
//           <h3 className="text-sm text-gray-500">Pending Approval</h3>
//           <p className="text-2xl font-bold text-yellow-600">
//             {stats.pending ?? 0}
//           </p>
//         </div>
//       </div>

//       {/* Filters */}
//       <div className="bg-white shadow rounded-lg p-6 mb-6">
//         <h2 className="text-xl font-semibold mb-4">Filters</h2>
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Employee Name/Email
//             </label>
//             <input
//               type="text"
//               name="employee"
//               value={filters.employee}
//               onChange={handleFilterChange}
//               className="w-full p-2 border border-gray-300 rounded-md"
//               placeholder="Search employee..."
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Date
//             </label>
//             <input
//               type="date"
//               name="date"
//               value={filters.date}
//               onChange={handleFilterChange}
//               className="w-full p-2 border border-gray-300 rounded-md"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Status
//             </label>
//             <select
//               name="status"
//               value={filters.status}
//               onChange={handleFilterChange}
//               className="w-full p-2 border border-gray-300 rounded-md"
//             >
//               <option value="">All Status</option>
//               <option value="pending">Pending</option>
//               <option value="accepted">Accepted</option>
//               <option value="rejected">Rejected</option>
//             </select>
//           </div>
//           <div className="flex items-end justify-end">
//             <button
//               onClick={clearFilters}
//               className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
//             >
//               Clear Filters
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Records Table */}
//       <div className="bg-white shadow rounded-lg p-6">
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
//           <h2 className="text-xl font-semibold">All Attendance Records</h2>
//           {/* <div className="flex gap-2">
//             <button onClick={exportToCSV} className="px-4 py-2 rounded-md text-white" style={{ backgroundColor: PRIMARY }}>
//               Export CSV
//             </button>
//           </div> */}
//         </div>

//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-[#104774] text-white">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
//                   Employee
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
//                   Date
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
//                   Login Time
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
//                   Logout Time
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
//                   Status
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
//                   Work Progress
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
//                   Task Description
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
//                   Logout Note
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {filteredRecords.length === 0 ? (
//                 <tr>
//                   <td
//                     colSpan="8"
//                     className="px-6 py-4 text-center text-gray-500"
//                   >
//                     No attendance records found
//                   </td>
//                 </tr>
//               ) : (
//                 filteredRecords.map((record) => (
//                   <tr key={record._id}>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="font-medium">
//                         {record.employee?.profileRef?.firstName}{" "}
//                         {record.employee?.profileRef?.lastName}
//                       </div>
//                       <div className="text-sm text-gray-500">
//                         {record.employee?.email}
//                       </div>
//                       <div className="text-xs text-gray-400 mt-1">
//                         {record.employee?.profileRef?.employeeId}
//                       </div>
//                     </td>

//                     <td className="px-6 py-4 whitespace-nowrap">
//                       {formatDate(record.date)}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       {formatTime(getLoginTimeForRecord(record))}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       {formatTime(getLogoutTimeForRecord(record)) || "-"}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       {getStatusBadge(record.status)}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       {record.workProgress || "-"}
//                     </td>
//                     <td className="px-6 py-4">
//                       <div
//                         className="max-w-xs truncate"
//                         title={record.taskDescription || ""}
//                       >
//                         {record.taskDescription || "-"}
//                       </div>
//                     </td>

//                     <td className="px-6 py-4 whitespace-nowrap">
//                       {record.logoutDescription ? (
//                         <div className="text-sm">
//                           <div className="font-medium">
//                             {record.logoutDescription}
//                           </div>
//                           {record.earlyLogoutReason && (
//                             <div className="text-xs text-red-600">
//                               Early logout: {record.earlyLogoutReason}
//                             </div>
//                           )}
//                         </div>
//                       ) : (
//                         "-"
//                       )}
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>

//         {filteredRecords.length > 0 && (
//           <div className="mt-4 text-sm text-gray-500">
//             Showing {filteredRecords.length} of {attendanceRecords.length}{" "}
//             records
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default EmployeeAttendanceManagement;



// import React, { useEffect, useState } from "react";
// import axiosInstance from "../utils/axiosInstance";
// import { useAuth } from "../context/AppContext";
// import RejectModal from "../components/attendance/RejectModal.jsx";
// import NotificationToast from "../components/common/NotificationToast.jsx";
// import AdminReportsTab from "../components/attendance/AdminReportsTab.jsx";
// import BulkActionsModal from "../components/attendance/BulkActionsModal.jsx";

// const PRIMARY = "#104774";
// const PRIMARY_HOVER = "#0d3a61";

// const EmployeeAttendanceManagement = () => {
//   const { token } = useAuth();
//   const [attendanceRecords, setAttendanceRecords] = useState([]);
//   const [filteredRecords, setFilteredRecords] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filters, setFilters] = useState({
//     employee: "",
//     date: "",
//     status: "",
//     department: "",
//     role: ""
//   });
//   const [stats, setStats] = useState({
//     totalEmployees: 0,
//     present: 0,
//     absent: 0,
//     pending: 0,
//   });
//   const [notifications, setNotifications] = useState([]);
//   const [selectedAttendance, setSelectedAttendance] = useState(null);
//   const [showRejectModal, setShowRejectModal] = useState(false);
//   const [rejectRemarks, setRejectRemarks] = useState("");
//   const [activeTab, setActiveTab] = useState("records");
//   const [selectedRecords, setSelectedRecords] = useState(new Set());
//   const [showBulkModal, setShowBulkModal] = useState(false);
//   const [departments, setDepartments] = useState([]);

//   useEffect(() => {
//     if (token) {
//       fetchAllAttendances();
//       fetchStats();
//       fetchDepartments();
//     }
//   }, [token]);

//   useEffect(() => {
//     applyFilters();
//   }, [filters, attendanceRecords]);

//   const addNotification = (message, type = "info", ttl = 3500) => {
//     const id = Date.now() + Math.random();
//     setNotifications((n) => [...n, { id, message, type }]);
//     setTimeout(() => setNotifications((n) => n.filter((x) => x.id !== id)), ttl);
//   };

//   const fetchAllAttendances = async () => {
//     setLoading(true);
//     try {
//       const response = await axiosInstance.get("/attendance/all", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setAttendanceRecords(response.data || []);
//     } catch (error) {
//       console.error("Error fetching all attendances:", error);
//       addNotification(
//         error.response?.data?.message || "Could not fetch attendance records",
//         "error"
//       );
//       setAttendanceRecords([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchStats = async () => {
//     try {
//       const response = await axiosInstance.get("/attendance/stats", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setStats(response.data || {});
//     } catch (error) {
//       console.error("Error fetching stats:", error);
//       addNotification("Error loading statistics", "error");
//     }
//   };

//   const fetchDepartments = async () => {
//     try {
//       // This would typically come from your API
//       const uniqueDepartments = [...new Set(attendanceRecords
//         .map(record => record.employee?.profileRef?.department)
//         .filter(dept => dept)
//       )];
//       setDepartments(uniqueDepartments);
//     } catch (error) {
//       console.error("Error fetching departments:", error);
//     }
//   };

//   const applyFilters = () => {
//     let filtered = [...attendanceRecords];

//     if (filters.employee) {
//       filtered = filtered.filter((record) => {
//         const fullName = `${record.employee?.profileRef?.firstName || ""} ${
//           record.employee?.profileRef?.lastName || ""
//         }`.trim();
//         return (
//           fullName.toLowerCase().includes(filters.employee.toLowerCase()) ||
//           (record.employee?.email || "")
//             .toLowerCase()
//             .includes(filters.employee.toLowerCase())
//         );
//       });
//     }

//     if (filters.date) {
//       filtered = filtered.filter((record) => {
//         if (!record.date) return false;
//         return (
//           new Date(record.date).toLocaleDateString() ===
//           new Date(filters.date).toLocaleDateString()
//         );
//       });
//     }

//     if (filters.status) {
//       filtered = filtered.filter((record) => record.status === filters.status);
//     }

//     if (filters.department) {
//       filtered = filtered.filter((record) => 
//         record.employee?.profileRef?.department === filters.department
//       );
//     }

//     if (filters.role) {
//       filtered = filtered.filter((record) => 
//         record.employee?.role === filters.role
//       );
//     }

//     setFilteredRecords(filtered);
//   };

//   const handleFilterChange = (e) => {
//     const { name, value } = e.target;
//     setFilters((prev) => ({ ...prev, [name]: value }));
//   };

//   const clearFilters = () => {
//     setFilters({ employee: "", date: "", status: "", department: "", role: "" });
//     setSelectedRecords(new Set());
//   };

//   const handleApprove = async (id) => {
//     try {
//       const res = await axiosInstance.patch(
//         `/attendance/${id}/admin-approve`,
//         {},
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       if (res.data?.attendance) {
//         setAttendanceRecords(prev => prev.map(att => 
//           att._id === id ? res.data.attendance : att
//         ));
//       } else {
//         fetchAllAttendances();
//       }

//       fetchStats();
//       addNotification(res.data?.message || "Attendance approved", "success");
      
//       // Remove from selected records
//       setSelectedRecords(prev => {
//         const newSet = new Set(prev);
//         newSet.delete(id);
//         return newSet;
//       });
//     } catch (error) {
//       console.error("Error approving attendance:", error);
//       addNotification(
//         error.response?.data?.message || "Error approving attendance",
//         "error"
//       );
//     }
//   };

//   const handleReject = async (remarks) => {
//     if (!selectedAttendance) return;
//     try {
//       const res = await axiosInstance.patch(
//         `/attendance/${selectedAttendance}/admin-reject`,
//         { remarks },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       if (res.data?.attendance) {
//         setAttendanceRecords(prev => prev.map(att => 
//           att._id === selectedAttendance ? res.data.attendance : att
//         ));
//       } else {
//         fetchAllAttendances();
//       }

//       fetchStats();
//       addNotification(res.data?.message || "Attendance rejected", "success");
//       setShowRejectModal(false);
//       setRejectRemarks("");
//       setSelectedAttendance(null);
      
//       // Remove from selected records
//       setSelectedRecords(prev => {
//         const newSet = new Set(prev);
//         newSet.delete(selectedAttendance);
//         return newSet;
//       });
//     } catch (error) {
//       console.error("Error rejecting attendance:", error);
//       addNotification(
//         error.response?.data?.message || "Error rejecting attendance",
//         "error"
//       );
//     }
//   };

//   const openRejectModal = (id) => {
//     setSelectedAttendance(id);
//     setShowRejectModal(true);
//   };

//   const handleBulkApprove = async (ids) => {
//     try {
//       const res = await axiosInstance.post(
//         "/attendance/bulk-approve",
//         { ids },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       if (res.data?.success) {
//         addNotification(`${ids.length} attendances approved successfully`, "success");
//         fetchAllAttendances();
//         fetchStats();
//         setSelectedRecords(new Set());
//         setShowBulkModal(false);
//       }
//     } catch (error) {
//       console.error("Error bulk approving:", error);
//       addNotification("Error bulk approving attendances", "error");
//     }
//   };

//   const handleBulkReject = async (ids, remarks) => {
//     try {
//       const res = await axiosInstance.post(
//         "/attendance/bulk-reject",
//         { ids, remarks },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       if (res.data?.success) {
//         addNotification(`${ids.length} attendances rejected successfully`, "success");
//         fetchAllAttendances();
//         fetchStats();
//         setSelectedRecords(new Set());
//         setShowBulkModal(false);
//       }
//     } catch (error) {
//       console.error("Error bulk rejecting:", error);
//       addNotification("Error bulk rejecting attendances", "error");
//     }
//   };

//   const toggleRecordSelection = (id) => {
//     setSelectedRecords(prev => {
//       const newSet = new Set(prev);
//       if (newSet.has(id)) {
//         newSet.delete(id);
//       } else {
//         newSet.add(id);
//       }
//       return newSet;
//     });
//   };

//   const selectAllRecords = () => {
//     if (selectedRecords.size === filteredRecords.length) {
//       setSelectedRecords(new Set());
//     } else {
//       setSelectedRecords(new Set(filteredRecords.map(record => record._id)));
//     }
//   };

//   const formatTime = (timeString) => {
//     if (!timeString) return "-";
//     try {
//       return new Date(timeString).toLocaleTimeString([], {
//         hour: "2-digit",
//         minute: "2-digit",
//       });
//     } catch {
//       return "-";
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return "-";
//     try {
//       return new Date(dateString).toLocaleDateString();
//     } catch {
//       return "-";
//     }
//   };

//   const getStatusBadge = (status) => {
//     const statusClasses = {
//       pending: "bg-yellow-100 text-yellow-800",
//       accepted: "bg-green-100 text-green-800",
//       rejected: "bg-red-100 text-red-800",
//     };
//     return (
//       <span
//         className={`px-2 py-1 rounded-full text-xs ${
//           statusClasses[status] || "bg-gray-100 text-gray-800"
//         }`}
//       >
//         {status}
//       </span>
//     );
//   };

//   const exportToCSV = () => {
//     const headers = [
//       "Employee Name",
//       "Email",
//       "Role",
//       "Department",
//       "Date",
//       "Login Time",
//       "Logout Time",
//       "Status",
//       "Work Progress",
//       "Task Description",
//       "Logout Note",
//       "Early Logout Reason",
//     ];

//     const csvData = filteredRecords.map((record) => {
//       const name = `${record.employee?.profileRef?.firstName || ""} ${
//         record.employee?.profileRef?.lastName || ""
//       }`.trim();
//       const task = record.taskDescription
//         ? record.taskDescription.replace(/"/g, '""')
//         : "";
//       const logoutNote = record.logoutDescription
//         ? record.logoutDescription.replace(/"/g, '""')
//         : "";
//       const early = record.earlyLogoutReason
//         ? record.earlyLogoutReason.replace(/"/g, '""')
//         : "";

//       return [
//         `"${name}"`,
//         `"${record.employee?.email || ""}"`,
//         `"${record.employee?.role || ""}"`,
//         `"${record.employee?.profileRef?.department || ""}"`,
//         `"${formatDate(record.date)}"`,
//         `"${formatTime(record.checkIn)}"`,
//         `"${formatTime(record.checkOut)}"`,
//         `"${record.status || ""}"`,
//         `"${record.workProgress || ""}"`,
//         `"${task}"`,
//         `"${logoutNote}"`,
//         `"${early}"`,
//       ];
//     });

//     const csvContent = [
//       headers.join(","),
//       ...csvData.map((row) => row.join(",")),
//     ].join("\n");

//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement("a");
//     link.href = url;
//     link.setAttribute(
//       "download",
//       `attendance_records_${new Date().toISOString().split("T")[0]}.csv`
//     );
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     addNotification("CSV exported successfully", "success");
//   };

//   if (loading && attendanceRecords.length === 0) {
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
//           <p className="mt-2 text-gray-600">Loading attendance records...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-[80vh] p-4">
//       <style>{`
//         .primary-btn:hover { background: ${PRIMARY_HOVER} !important }
//         .primary-border-active { border-bottom-color: ${PRIMARY} !important; color: ${PRIMARY} !important }
//       `}</style>

//       <NotificationToast notifications={notifications} />

//       <header className="p-4 mb-6">
//         <h1 className="text-2xl font-bold text-gray-800">
//           Admin Attendance Management
//         </h1>
//         <p className="text-sm text-gray-600 mt-1">
//           Manage all employee and HR attendance records
//         </p>
//       </header>

//       {/* Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//         <div className="bg-white p-4 rounded-lg shadow">
//           <h3 className="text-sm text-gray-500">Total Employees</h3>
//           <p className="text-2xl font-bold">{stats.totalEmployees ?? 0}</p>
//         </div>
//         <div className="bg-white p-4 rounded-lg shadow">
//           <h3 className="text-sm text-gray-500">Present Today</h3>
//           <p className="text-2xl font-bold text-green-600">
//             {stats.present ?? 0}
//           </p>
//         </div>
//         <div className="bg-white p-4 rounded-lg shadow">
//           <h3 className="text-sm text-gray-500">Absent Today</h3>
//           <p className="text-2xl font-bold text-red-600">{stats.absent ?? 0}</p>
//         </div>
//         <div className="bg-white p-4 rounded-lg shadow">
//           <h3 className="text-sm text-gray-500">Pending Approval</h3>
//           <p className="text-2xl font-bold text-yellow-600">
//             {stats.pending ?? 0}
//           </p>
//         </div>
//       </div>

//       {/* Tabs */}
//       <div className="bg-white shadow rounded-lg mb-6">
//         <div className="border-b border-gray-200">
//           <nav className="flex -mb-px overflow-auto">
//             <button
//               onClick={() => setActiveTab("records")}
//               className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
//                 activeTab === "records"
//                   ? "primary-border-active"
//                   : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
//               }`}
//               style={
//                 activeTab === "records"
//                   ? { borderBottomColor: PRIMARY, color: PRIMARY }
//                   : {}
//               }
//             >
//               Attendance Records
//             </button>
//             <button
//               onClick={() => setActiveTab("reports")}
//               className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
//                 activeTab === "reports"
//                   ? "primary-border-active"
//                   : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
//               }`}
//               style={
//                 activeTab === "reports"
//                   ? { borderBottomColor: PRIMARY, color: PRIMARY }
//                   : {}
//               }
//             >
//               Reports & Analytics
//             </button>
//           </nav>
//         </div>

//         <div className="p-6">
//           {/* Records Tab */}
//           {activeTab === "records" && (
//             <>
//               {/* Filters */}
//               <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Employee Name/Email
//                   </label>
//                   <input
//                     type="text"
//                     name="employee"
//                     value={filters.employee}
//                     onChange={handleFilterChange}
//                     className="w-full p-2 border border-gray-300 rounded-md"
//                     placeholder="Search employee..."
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Date
//                   </label>
//                   <input
//                     type="date"
//                     name="date"
//                     value={filters.date}
//                     onChange={handleFilterChange}
//                     className="w-full p-2 border border-gray-300 rounded-md"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Status
//                   </label>
//                   <select
//                     name="status"
//                     value={filters.status}
//                     onChange={handleFilterChange}
//                     className="w-full p-2 border border-gray-300 rounded-md"
//                   >
//                     <option value="">All Status</option>
//                     <option value="pending">Pending</option>
//                     <option value="accepted">Accepted</option>
//                     <option value="rejected">Rejected</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Department
//                   </label>
//                   <select
//                     name="department"
//                     value={filters.department}
//                     onChange={handleFilterChange}
//                     className="w-full p-2 border border-gray-300 rounded-md"
//                   >
//                     <option value="">All Departments</option>
//                     {departments.map(dept => (
//                       <option key={dept} value={dept}>{dept}</option>
//                     ))}
//                   </select>
//                 </div>
//                 <div className="flex items-end gap-2">
//                   <button
//                     onClick={clearFilters}
//                     className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
//                   >
//                     Clear Filters
//                   </button>
//                   {selectedRecords.size > 0 && (
//                     <button
//                       onClick={() => setShowBulkModal(true)}
//                       className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//                     >
//                       Bulk Actions ({selectedRecords.size})
//                     </button>
//                   )}
//                 </div>
//               </div>

//               {/* Records Table */}
//               <div className="bg-white rounded-lg">
//                 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
//                   <h2 className="text-xl font-semibold">Attendance Records</h2>
//                   <div className="flex gap-2">
//                     <button 
//                       onClick={exportToCSV}
//                       className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
//                     >
//                       Export CSV
//                     </button>
//                     <button 
//                       onClick={fetchAllAttendances}
//                       className="p-2 text-gray-500 hover:text-gray-700 border rounded-md"
//                       title="Refresh"
//                     >
//                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//                       </svg>
//                     </button>
//                   </div>
//                 </div>

//                 <div className="overflow-x-auto">
//                   <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-[#104774] text-white">
//                       <tr>
//                         <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
//                           <input
//                             type="checkbox"
//                             checked={selectedRecords.size === filteredRecords.length && filteredRecords.length > 0}
//                             onChange={selectAllRecords}
//                             className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                           />
//                         </th>
//                         <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Employee</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Role</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Login Time</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Logout Time</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
//                       </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                       {filteredRecords.length === 0 ? (
//                         <tr>
//                           <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
//                             <div className="flex flex-col items-center">
//                               <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                               </svg>
//                               <p>No attendance records found</p>
//                               <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
//                             </div>
//                           </td>
//                         </tr>
//                       ) : (
//                         filteredRecords.map((record) => (
//                           <tr key={record._id} className="hover:bg-gray-50">
//                             <td className="px-4 py-4 whitespace-nowrap">
//                               <input
//                                 type="checkbox"
//                                 checked={selectedRecords.has(record._id)}
//                                 onChange={() => toggleRecordSelection(record._id)}
//                                 className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                               />
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap">
//                               <div className="font-medium">
//                                 {record.employee?.profileRef?.firstName}{" "}
//                                 {record.employee?.profileRef?.lastName}
//                               </div>
//                               <div className="text-sm text-gray-500">
//                                 {record.employee?.email}
//                               </div>
//                               <div className="text-xs text-gray-400 mt-1">
//                                 {record.employee?.profileRef?.department}
//                               </div>
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap">
//                               <span className={`px-2 py-1 rounded-full text-xs ${
//                                 record.employee?.role === 'admin' ? 'bg-purple-100 text-purple-800' :
//                                 record.employee?.role === 'hr' ? 'bg-blue-100 text-blue-800' :
//                                 'bg-gray-100 text-gray-800'
//                               }`}>
//                                 {record.employee?.role}
//                               </span>
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap">
//                               {formatDate(record.date)}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap">
//                               {formatTime(record.checkIn)}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap">
//                               {formatTime(record.checkOut) || "-"}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap">
//                               {getStatusBadge(record.status)}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap">
//                               <div className="flex gap-2">
//                                 {record.status === "pending" && (
//                                   <>
//                                     <button
//                                       onClick={() => handleApprove(record._id)}
//                                       className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
//                                     >
//                                       Approve
//                                     </button>
//                                     <button
//                                       onClick={() => openRejectModal(record._id)}
//                                       className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
//                                     >
//                                       Reject
//                                     </button>
//                                   </>
//                                 )}
//                                 {record.status !== "pending" && (
//                                   <span className="text-sm text-gray-500">Processed</span>
//                                 )}
//                               </div>
//                             </td>
//                           </tr>
//                         ))
//                       )}
//                     </tbody>
//                   </table>
//                 </div>

//                 {filteredRecords.length > 0 && (
//                   <div className="mt-4 text-sm text-gray-500">
//                     Showing {filteredRecords.length} of {attendanceRecords.length} records
//                     {selectedRecords.size > 0 && ` • ${selectedRecords.size} selected`}
//                   </div>
//                 )}
//               </div>
//             </>
//           )}

//           {/* Reports Tab */}
//           {activeTab === "reports" && (
//             <AdminReportsTab
//               token={token}
//               addNotification={addNotification}
//               attendanceRecords={attendanceRecords}
//             />
//           )}
//         </div>
//       </div>

//       {/* Reject Modal */}
//       <RejectModal
//         isOpen={showRejectModal}
//         onClose={() => {
//           setShowRejectModal(false);
//           setRejectRemarks("");
//           setSelectedAttendance(null);
//         }}
//         onReject={handleReject}
//         remarks={rejectRemarks}
//         setRemarks={setRejectRemarks}
//       />

//       {/* Bulk Actions Modal */}
//       <BulkActionsModal
//         isOpen={showBulkModal}
//         onClose={() => setShowBulkModal(false)}
//         onApprove={handleBulkApprove}
//         onReject={handleBulkReject}
//         selectedCount={selectedRecords.size}
//       />
//     </div>
//   );
// };

// export default EmployeeAttendanceManagement;


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
  const [filters, setFilters] = useState({
    employee: "",
    date: "",
    status: "",
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
    setTimeout(() => setNotifications((n) => n.filter((x) => x.id !== id)), ttl);
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
      // Derive unique departments from attendance records (if available)
      const uniqueDepartments = [
        ...new Set(
          attendanceRecords
            .map((record) => record.employee?.profileRef?.department)
            .filter((dept) => dept)
        ),
      ];
      setDepartments(uniqueDepartments);
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
        (record) => record.employee?.profileRef?.department === filters.department
      );
    }

    if (filters.role) {
      filtered = filtered.filter((record) => record.employee?.role === filters.role);
    }

    setFilteredRecords(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ employee: "", date: "", status: "", department: "", role: "" });
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
          prev.map((att) => (att._id === selectedAttendance ? res.data.attendance : att))
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

  const exportToCSV = () => {
    const headers = [
      "Employee Name",
      "Email",
      "Role",
      "Department",
      "Date",
      "Login Time",
      "Logout Time",
      "Status",
      "Work Progress",
      "Task Description",
      "Logout Note",
      "Early Logout Reason",
    ];

    const csvData = filteredRecords.map((record) => {
      const name = `${record.employee?.profileRef?.firstName || ""} ${
        record.employee?.profileRef?.lastName || ""
      }`.trim();
      const task = record.taskDescription
        ? record.taskDescription.replace(/"/g, '""')
        : "";
      const logoutNote = record.logoutDescription
        ? record.logoutDescription.replace(/"/g, '""')
        : "";
      const early = record.earlyLogoutReason
        ? record.earlyLogoutReason.replace(/"/g, '""')
        : "";

      return [
        `"${name}"`,
        `"${record.employee?.email || ""}"`,
        `"${record.employee?.role || ""}"`,
        `"${record.employee?.profileRef?.department || ""}"`,
        `"${formatDate(record.date)}"`,
        `"${formatTime(record.checkIn)}"`,
        `"${formatTime(record.checkOut)}"`,
        `"${record.status || ""}"`,
        `"${record.workProgress || ""}"`,
        `"${task}"`,
        `"${logoutNote}"`,
        `"${early}"`,
      ];
    });

    const csvContent = [headers.join(","), ...csvData.map((row) => row.join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `attendance_records_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addNotification("CSV exported successfully", "success");
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
    <div className="min-h-[80vh] p-4">
      <style>{`
        .primary-btn:hover { background: ${PRIMARY_HOVER} !important }
        .primary-border-active { border-bottom-color: ${PRIMARY} !important; color: ${PRIMARY} !important }
      `}</style>

      <NotificationToast notifications={notifications} />

      <header className="p-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Admin Attendance Management</h1>
        <p className="text-sm text-gray-600 mt-1">Manage all employee and HR attendance records</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm text-gray-500">Total Employees</h3>
          <p className="text-2xl font-bold">{stats.totalEmployees ?? 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm text-gray-500">Present Today</h3>
          <p className="text-2xl font-bold text-green-600">{stats.present ?? 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm text-gray-500">Absent Today</h3>
          <p className="text-2xl font-bold text-red-600">{stats.absent ?? 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm text-gray-500">Pending Approval</h3>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending ?? 0}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px overflow-auto">
            <button
              onClick={() => setActiveTab("records")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "records"
                  ? "primary-border-active"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              style={
                activeTab === "records" ? { borderBottomColor: PRIMARY, color: PRIMARY } : {}
              }
            >
              Attendance Records
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "reports"
                  ? "primary-border-active"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              style={
                activeTab === "reports" ? { borderBottomColor: PRIMARY, color: PRIMARY } : {}
              }
            >
              Reports & Analytics
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Records Tab */}
          {activeTab === "records" && (
            <>
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name/Email</label>
                  <input
                    type="text"
                    name="employee"
                    value={filters.employee}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Search employee..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={filters.date}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    name="department"
                    value={filters.department}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">All Departments</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end gap-2">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>

              {/* Records Table */}
              <div className="bg-white rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
                  <h2 className="text-xl font-semibold">Attendance Records</h2>
                  <div className="flex gap-2">
                    {/* <button
                      onClick={exportToCSV}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Export CSV
                    </button> */}
                    <button
                      onClick={fetchAllAttendances}
                      className="p-2 text-gray-500 hover:text-gray-700 border rounded-md"
                      title="Refresh"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-[#104774] text-white">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Employee</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Login Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Logout Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredRecords.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                            <div className="flex flex-col items-center">
                              <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <p>No attendance records found</p>
                              <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredRecords.map((record) => (
                          <tr key={record._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium">
                                {record.employee?.profileRef?.firstName} {" "}
                                {record.employee?.profileRef?.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{record.employee?.email}</div>
                              <div className="text-xs text-gray-400 mt-1">{record.employee?.profileRef?.department}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                record.employee?.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                record.employee?.role === 'hr' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {record.employee?.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">{formatDate(record.date)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{formatTime(record.checkIn)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{formatTime(record.checkOut) || "-"}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(record.status)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex gap-2">
                                {record.status === "pending" && (
                                  <>
                                    <button
                                      onClick={() => handleApprove(record._id)}
                                      className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => openRejectModal(record._id)}
                                      className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                                {record.status !== "pending" && (
                                  <span className="text-sm text-gray-500">Processed</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {filteredRecords.length > 0 && (
                  <div className="mt-4 text-sm text-gray-500">
                    Showing {filteredRecords.length} of {attendanceRecords.length} records
                  </div>
                )}
              </div>
            </>
          )}

          {/* Reports Tab */}
          {activeTab === "reports" && (
            <AdminReportsTab token={token} addNotification={addNotification} attendanceRecords={attendanceRecords} />
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

export default EmployeeAttendanceManagement;
