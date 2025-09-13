// import React, { useEffect, useState } from "react";
// import axiosInstance from "../utils/axiosInstance";
// import { useAuth } from "../context/AppContext";

// const PRIMARY = "#104774";
// const PRIMARY_HOVER = "#0d3a61";

// const AttendanceManagement = () => {
//   const { token } = useAuth();
//   const [pendingAttendances, setPendingAttendances] = useState([]);
//   const [allAttendances, setAllAttendances] = useState([]);
//   const [selectedAttendance, setSelectedAttendance] = useState(null);
//   const [showRejectModal, setShowRejectModal] = useState(false);
//   const [rejectRemarks, setRejectRemarks] = useState("");
//   const [activeTab, setActiveTab] = useState("pending");
//   const [stats, setStats] = useState({
//     totalEmployees: 0,
//     present: 0,
//     absent: 0,
//     pending: 0,
//   });

//   const [notifications, setNotifications] = useState([]); // simple toasts

//   useEffect(() => {
//     if (token) {
//       fetchPendingAttendances();
//       fetchAllAttendances();
//       fetchStats();
//     }
//   }, [token]);

//   const addNotification = (message, type = "info", ttl = 3500) => {
//     const id = Date.now() + Math.random();
//     setNotifications((n) => [...n, { id, message, type }]);
//     setTimeout(() => {
//       setNotifications((n) => n.filter((x) => x.id !== id));
//     }, ttl);
//   };

//   const fetchPendingAttendances = async () => {
//     try {
//       const response = await axiosInstance.get("/attendance/pending", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setPendingAttendances(response.data || []);
//     } catch (error) {
//       console.error("Error fetching pending attendances:", error);
//       addNotification(
//         error.response?.data?.message || "Could not load pending",
//         "error"
//       );
//     }
//   };

//   const fetchAllAttendances = async () => {
//     try {
//       const response = await axiosInstance.get("/attendance/all", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setAllAttendances(response.data || []);
//     } catch (error) {
//       console.error("Error fetching all attendances:", error);
//       addNotification(
//         error.response?.data?.message || "Could not load records",
//         "error"
//       );
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
//     }
//   };

//   // helper => update attendance in lists using returned updatedAttendance (or fallback)
//   const upsertAttendanceInLists = (updatedAttendance) => {
//     if (!updatedAttendance || !updatedAttendance._id) return;

//     setAllAttendances((prev) => {
//       const idx = prev.findIndex((a) => a._id === updatedAttendance._id);
//       if (idx === -1) return [updatedAttendance, ...prev];
//       const copy = [...prev];
//       copy[idx] = { ...copy[idx], ...updatedAttendance };
//       return copy;
//     });

//     setPendingAttendances((prev) =>
//       prev.filter((a) => a._id !== updatedAttendance._id)
//     );
//   };

//   const handleApprove = async (id) => {
//     try {
//       const res = await axiosInstance.patch(
//         `/attendance/${id}/approve`,
//         {},
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       // if API returns updated attendance, use it to update UI immediately
//       const updated = res.data?.attendance || res.data;
//       if (updated && updated._id) {
//         upsertAttendanceInLists(updated);
//       } else {
//         // optimistic removal from pending
//         setPendingAttendances((prev) => prev.filter((p) => p._id !== id));
//         // also try fetchAllAttendances to sync canonical state
//         fetchAllAttendances();
//       }

//       // refresh stats (either returned or fetch)
//       if (res.data?.stats) setStats(res.data.stats);
//       else fetchStats();

//       addNotification(res.data?.message || "Attendance approved", "success");
//     } catch (error) {
//       console.error("Error approving attendance:", error);
//       addNotification(
//         error.response?.data?.message || "Error approving attendance",
//         "error"
//       );
//     }
//   };

//   const handleReject = async () => {
//     if (!selectedAttendance) return;
//     try {
//       const res = await axiosInstance.patch(
//         `/attendance/${selectedAttendance}/reject`,
//         { remarks: rejectRemarks },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       const updated = res.data?.attendance || res.data;
//       if (updated && updated._id) {
//         upsertAttendanceInLists(updated);
//       } else {
//         setPendingAttendances((prev) =>
//           prev.filter((p) => p._id !== selectedAttendance)
//         );
//         fetchAllAttendances();
//       }

//       if (res.data?.stats) setStats(res.data.stats);
//       else fetchStats();

//       addNotification(res.data?.message || "Attendance rejected", "success");

//       setShowRejectModal(false);
//       setRejectRemarks("");
//       setSelectedAttendance(null);
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

//   return (
//     <div className="min-h-[80vh] p-4 sm:p-6">
//       {/* inline style block to handle hover color for primary buttons */}
//       <style>{`
//         .primary-btn:hover { background: ${PRIMARY_HOVER} !important }
//         .primary-border-active { border-bottom-color: ${PRIMARY} !important; color: ${PRIMARY} !important }
//       `}</style>

//       {/* Notifications */}
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
//       <header className="mb-6">
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

//       {/* Tabs */}
//       <div className="bg-white shadow rounded-lg mb-6">
//         <div className="border-b border-gray-200">
//           <nav className="flex -mb-px overflow-auto">
//             <button
//               onClick={() => setActiveTab("pending")}
//               className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
//                 activeTab === "pending"
//                   ? "primary-border-active"
//                   : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
//               }`}
//               style={
//                 activeTab === "pending"
//                   ? { borderBottomColor: PRIMARY, color: PRIMARY }
//                   : {}
//               }
//             >
//               Pending Approvals
//             </button>
//             <button
//               onClick={() => setActiveTab("all")}
//               className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
//                 activeTab === "all"
//                   ? "primary-border-active"
//                   : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
//               }`}
//               style={
//                 activeTab === "all"
//                   ? { borderBottomColor: PRIMARY, color: PRIMARY }
//                   : {}
//               }
//             >
//               All Records
//             </button>
//           </nav>
//         </div>

//         <div className="p-6">
//           {/* Pending */}
//           {activeTab === "pending" && (
//             <div>
//               <h2 className="text-xl font-semibold mb-4">
//                 Pending Attendance Approvals
//               </h2>

//               {pendingAttendances.length === 0 ? (
//                 <p className="text-gray-500">No pending approvals</p>
//               ) : (
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-[#104774] text-white">
//                       <tr>
//                         <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
//                           Employee
//                         </th>
//                         <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
//                           Date
//                         </th>
//                         <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
//                           Login Time
//                         </th>
//                         <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
//                           Task Description
//                         </th>
//                         <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
//                           Work Progress
//                         </th>
//                         <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
//                           Actions
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                       {pendingAttendances.map((attendance) => (
//                         <tr key={attendance._id}>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <div className="font-medium">
//                               {attendance.employee?.profileRef?.firstName}{" "}
//                               {attendance.employee?.profileRef?.lastName}
//                             </div>
//                             <div
//                               className="text-sm text-gray-200/90"
//                               style={{ color: "#ffffffa0" }}
//                             >
//                               {attendance.employee?.email}
//                             </div>
//                             <div
//                               className="text-xs text-gray-300 mt-1"
//                               style={{ color: "#ffffffb3" }}
//                             >
//                               {attendance.employee?.profileRef?.employeeId}
//                             </div>
//                           </td>

//                           <td className="px-6 py-4 whitespace-nowrap">
//                             {formatDate(attendance.date)}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             {formatTime(attendance.checkIn)}
//                           </td>

//                           <td className="px-6 py-4">
//                             <div className="max-w-xs truncate">
//                               {attendance.taskDescription || "-"}
//                             </div>
//                           </td>

//                           <td className="px-6 py-4 whitespace-nowrap">
//                             {attendance.workProgress || "-"}
//                           </td>

//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <div className="flex flex-wrap gap-2">
//                               <button
//                                 onClick={() => handleApprove(attendance._id)}
//                                 className="px-3 py-1 rounded text-white primary-btn"
//                                 style={{ backgroundColor: PRIMARY }}
//                               >
//                                 Approve
//                               </button>

//                               <button
//                                 onClick={() => openRejectModal(attendance._id)}
//                                 className="px-3 py-1 rounded text-white"
//                                 style={{
//                                   backgroundColor: "#dc2626" /* red-600 */,
//                                 }}
//                               >
//                                 Reject
//                               </button>
//                             </div>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* All Records */}
//           {activeTab === "all" && (
//             <div>
//               <h2 className="text-xl font-semibold mb-4">
//                 All Attendance Records
//               </h2>

//               <div className="overflow-x-auto">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-[#104774] text-white">
//                     <tr>
//                       <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
//                         Employee
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
//                         Date
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
//                         Login Time
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
//                         Logout Time
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
//                         Status
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
//                         Work Progress
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
//                         Task
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
//                         Logout Note
//                       </th>
//                     </tr>
//                   </thead>

//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {allAttendances.map((attendance) => (
//                       <tr key={attendance._id}>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="font-medium">
//                             {attendance.employee?.profileRef?.firstName}{" "}
//                             {attendance.employee?.profileRef?.lastName}
//                           </div>
//                           <div className="text-sm text-gray-500">
//                             {attendance.employee?.email}
//                           </div>
//                           <div className="text-xs text-gray-400 mt-1">
//                             {attendance.employee?.profileRef?.employeeId}
//                           </div>
//                         </td>

//                         <td className="px-6 py-4 whitespace-nowrap">
//                           {formatDate(attendance.date)}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           {formatTime(attendance.checkIn)}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           {formatTime(attendance.checkOut) || "-"}
//                         </td>

//                         <td className="px-6 py-4 whitespace-nowrap">
//                           {getStatusBadge(attendance.status)}
//                         </td>

//                         <td className="px-6 py-4 whitespace-nowrap">
//                           {attendance.workProgress || "-"}
//                         </td>

//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="max-w-xs truncate">
//                             {attendance.taskDescription || "-"}
//                           </div>
//                         </td>

//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="text-sm">
//                             {attendance.logoutDescription ? (
//                               <>
//                                 <div className="font-medium">
//                                   {attendance.logoutDescription}
//                                 </div>
//                                 {attendance.earlyLogoutReason && (
//                                   <div className="text-xs text-red-600">
//                                     Early reason: {attendance.earlyLogoutReason}
//                                   </div>
//                                 )}
//                               </>
//                             ) : (
//                               "-"
//                             )}
//                           </div>
//                         </td>
//                       </tr>
//                     ))}
//                     {allAttendances.length === 0 && (
//                       <tr>
//                         <td
//                           colSpan={8}
//                           className="px-6 py-6 text-center text-sm text-gray-500"
//                         >
//                           No records found
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Reject Modal */}
//       {showRejectModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-lg p-6 w-full max-w-md">
//             <h2 className="text-xl font-semibold mb-4">Reject Attendance</h2>

//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Remarks
//               </label>
//               <textarea
//                 value={rejectRemarks}
//                 onChange={(e) => setRejectRemarks(e.target.value)}
//                 className="w-full p-2 border border-gray-300 rounded-md"
//                 rows="3"
//                 placeholder="Enter reason for rejection"
//                 required
//               />
//             </div>

//             <div className="flex justify-end space-x-2">
//               <button
//                 onClick={() => {
//                   setShowRejectModal(false);
//                   setRejectRemarks("");
//                 }}
//                 className="px-4 py-2 border border-gray-300 rounded-md"
//               >
//                 Cancel
//               </button>

//               <button
//                 onClick={handleReject}
//                 className="px-4 py-2 rounded-md text-white"
//                 style={{ backgroundColor: "#dc2626" }} /* red-600 */
//               >
//                 Confirm Reject
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AttendanceManagement;

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
  const [filters, setFilters] = useState({
    employee: "",
    date: "",
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
    <div className="min-h-[80vh] p-4 sm:p-6">
      <style>{`
        .primary-btn:hover { background: ${PRIMARY_HOVER} !important }
        .primary-border-active { border-bottom-color: ${PRIMARY} !important; color: ${PRIMARY} !important }
      `}</style>

      <NotificationToast notifications={notifications} />

      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Attendance Management
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Manage employee attendance approvals and records
        </p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm text-gray-500">Total Employees</h3>
          <p className="text-2xl font-bold">{stats.totalEmployees ?? 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm text-gray-500">Present Today</h3>
          <p className="text-2xl font-bold text-green-600">
            {stats.present ?? 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm text-gray-500">Absent Today</h3>
          <p className="text-2xl font-bold text-red-600">{stats.absent ?? 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm text-gray-500">Pending Approval</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {stats.pending ?? 0}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px overflow-auto">
            <button
              onClick={() => setActiveTab("pending")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "pending"
                  ? "primary-border-active"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              style={
                activeTab === "pending"
                  ? { borderBottomColor: PRIMARY, color: PRIMARY }
                  : {}
              }
            >
              Pending Approvals
              {pendingAttendances.length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {pendingAttendances.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("all")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "all"
                  ? "primary-border-active"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              style={
                activeTab === "all"
                  ? { borderBottomColor: PRIMARY, color: PRIMARY }
                  : {}
              }
            >
              All Records
            </button>
            <button
              onClick={() => setActiveTab("hr")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "hr"
                  ? "primary-border-active"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              style={
                activeTab === "hr"
                  ? { borderBottomColor: PRIMARY, color: PRIMARY }
                  : {}
              }
            >
              My Attendance
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Employee
              </label>
              <input
                type="text"
                name="employee"
                value={filters.employee}
                onChange={handleFilterChange}
                placeholder="Name or email"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={filters.date}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            {activeTab === "all" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
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
            )}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Pending Tab */}
          {activeTab === "pending" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  Pending Attendance Approvals
                </h2>
                <button
                  onClick={fetchPendingAttendances}
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

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-500 mt-2">
                    Loading pending requests...
                  </p>
                </div>
              ) : filteredPendingAttendances.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
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
                  <p className="text-gray-500">No pending approvals</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-[#104774] text-white">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Employee
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Login Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Task Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Work Progress
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredPendingAttendances.map((attendance) => (
                        <tr key={attendance._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium">
                              {attendance.employee?.profileRef?.firstName}{" "}
                              {attendance.employee?.profileRef?.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {attendance.employee?.email}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {attendance.employee?.profileRef?.employeeId}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {formatDate(attendance.date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {formatTime(attendance.checkIn)}
                          </td>
                          <td className="px-6 py-4">
                            <div
                              className="max-w-xs truncate"
                              title={attendance.taskDescription}
                            >
                              {attendance.taskDescription || "-"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {attendance.workProgress || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => handleApprove(attendance._id)}
                                className="px-3 py-1 rounded text-white primary-btn"
                                style={{ backgroundColor: PRIMARY }}
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => openRejectModal(attendance._id)}
                                className="px-3 py-1 rounded text-white bg-red-600 hover:bg-red-700"
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
              )}
            </div>
          )}

          {/* All Records Tab */}
          {activeTab === "all" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  All Attendance Records
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    Showing {filteredAttendances.length} of{" "}
                    {allAttendances.length} records
                  </span>
                  <button
                    onClick={fetchAllAttendances}
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
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading records...</p>
                </div>
              ) : filteredAttendances.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
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
                  <p className="text-gray-500">No records found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-[#104774] text-white">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Employee
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Login Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Logout Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Work Progress
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Task
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Logout Note
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredAttendances.map((attendance) => (
                        <tr key={attendance._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium">
                              {attendance.employee?.profileRef?.firstName}{" "}
                              {attendance.employee?.profileRef?.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {attendance.employee?.email}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {attendance.employee?.profileRef?.employeeId}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {formatDate(attendance.date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {formatTime(attendance.checkIn)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {formatTime(attendance.checkOut) || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(attendance.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {attendance.workProgress || "-"}
                          </td>
                          <td className="px-6 py-4">
                            <div
                              className="max-w-xs truncate"
                              title={attendance.taskDescription}
                            >
                              {attendance.taskDescription || "-"}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              {attendance.logoutDescription ? (
                                <>
                                  <div className="font-medium">
                                    {attendance.logoutDescription}
                                  </div>
                                  {attendance.earlyLogoutReason && (
                                    <div className="text-xs text-red-600 mt-1">
                                      Early reason:{" "}
                                      {attendance.earlyLogoutReason}
                                    </div>
                                  )}
                                </>
                              ) : (
                                "-"
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
