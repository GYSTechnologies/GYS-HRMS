// import React, { useEffect, useState } from "react";
// import axiosInstance from "../utils/axiosInstance"; // adjust path
// import { useAuth } from "../context/AppContext";

// const PRIMARY = "#104774";
// const PRIMARY_HOVER = "#0d3a61";

// const EmployeeAttendance = () => {
//   const { token } = useAuth();
//   const [attendanceData, setAttendanceData] = useState(null);
//   const [showLoginModal, setShowLoginModal] = useState(false);
//   const [showLogoutModal, setShowLogoutModal] = useState(false);
//   const [taskDescription, setTaskDescription] = useState("");
//   const [workProgress, setWorkProgress] = useState("Planned");
//   const [logoutDescription, setLogoutDescription] = useState("");
//   const [earlyLogoutReason, setEarlyLogoutReason] = useState("");
//   const [isEarlyLogout, setIsEarlyLogout] = useState(false);
//   const [attendanceRecords, setAttendanceRecords] = useState([]);
//   const [notifications, setNotifications] = useState([]); // {id, message, type}
//   const [modalMessage, setModalMessage] = useState(null); // show message inside modal if backend returns

//   // Fetch on token ready
//   useEffect(() => {
//     if (token) {
//       fetchTodayAttendance();
//       fetchAttendanceHistory();
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [token]);

//   const addNotification = (message, type = "info", ttl = 4000) => {
//     const id = Date.now() + Math.random();
//     setNotifications((n) => [...n, { id, message, type }]);
//     setTimeout(() => {
//       setNotifications((n) => n.filter((x) => x.id !== id));
//     }, ttl);
//   };

//   const fetchTodayAttendance = async () => {
//     try {
//       const res = await axiosInstance.get("/attendance/today", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setAttendanceData(res.data || null);
//       if (res.data?.message) addNotification(res.data.message, "info");
//     } catch (err) {
//       console.error("Error fetching today attendance:", err);
//       setAttendanceData(null);
//       const msg =
//         err?.response?.data?.message || "Could not fetch today attendance";
//       addNotification(msg, "error");
//     }
//   };

//   const fetchAttendanceHistory = async () => {
//     try {
//       const res = await axiosInstance.get("/attendance/history", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setAttendanceRecords(res.data || []);
//       if (res.data?.message) addNotification(res.data.message, "info");
//     } catch (err) {
//       console.error("Error fetching attendance history:", err);
//       setAttendanceRecords([]);
//       const msg =
//         err?.response?.data?.message || "Could not fetch attendance history";
//       addNotification(msg, "error");
//     }
//   };

//   // normalize potential attendance object from various backend shapes
//   const extractAttendanceFromRes = (resData) => {
//     if (!resData) return null;
//     // common places: res.data.attendance, res.data.updatedAttendance, res.data (itself), res.data.data
//     if (resData.attendance) return resData.attendance;
//     if (resData.updatedAttendance) return resData.updatedAttendance;
//     if (resData.data && typeof resData.data === "object" && resData.data._id)
//       return resData.data;
//     if (resData._id) return resData;
//     return null;
//   };

//   const handleLoginSubmit = async (e) => {
//     e.preventDefault();
//     setModalMessage(null);
//     try {
//       const res = await axiosInstance.post(
//         "/attendance/login",
//         { taskDescription, workProgress },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       // show notification/message
//       if (res.data?.message) {
//         addNotification(res.data.message, "success");
//         setModalMessage(res.data.message);
//       } else {
//         addNotification("Attendance submitted", "success");
//       }

//       // Try to update UI immediately with returned attendance object (if backend returns it)
//       const newAttendance = extractAttendanceFromRes(res.data);
//       if (newAttendance) {
//         setAttendanceData(newAttendance);
//       } else {
//         // If backend didn't return object, optimistically set a minimal object so "Mark Attendance" button hides and status shows pending
//         setAttendanceData((prev) => ({
//           ...(prev || {}),
//           status: "pending",
//           taskDescription,
//           workProgress,
//           createdAt: new Date().toISOString(),
//         }));
//       }

//       setShowLoginModal(false);
//       setTaskDescription("");
//       setWorkProgress("Planned");

//       // still sync from server to get canonical record
//       await fetchTodayAttendance();
//       await fetchAttendanceHistory();
//     } catch (err) {
//       console.error("Error submitting attendance:", err);
//       const msg = err?.response?.data?.message || "Error submitting attendance";
//       addNotification(msg, "error");
//       setModalMessage(msg);
//     }
//   };

//   const handleLogoutSubmit = async (e) => {
//     e.preventDefault();
//     setModalMessage(null);
//     if (!attendanceData?._id) {
//       addNotification("No attendance entry to logout", "error");
//       return;
//     }
//     if (isEarlyLogout && !earlyLogoutReason) {
//       addNotification("Please provide reason for early logout", "error");
//       setModalMessage("Please provide reason for early logout");
//       return;
//     }

//     try {
//       const res = await axiosInstance.post(
//         `/attendance/logout/${attendanceData._id}`,
//         {
//           logoutDescription,
//           earlyLogoutReason: isEarlyLogout ? earlyLogoutReason : undefined,
//         },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       if (res.data?.message) {
//         addNotification(res.data.message, "success");
//         setModalMessage(res.data.message);
//       } else {
//         addNotification("Logout recorded", "success");
//       }

//       // Try to extract updated attendance object from response and update UI immediately
//       const updatedAttendance = extractAttendanceFromRes(res.data);
//       if (updatedAttendance) {
//         setAttendanceData(updatedAttendance);
//       } else {
//         // If backend doesn't return updated object, optimistically set checkOut + logout fields so logout button disappears immediately
//         setAttendanceData((prev) => {
//           if (!prev) return prev;
//           return {
//             ...prev,
//             checkOut: new Date().toISOString(),
//             logoutDescription: logoutDescription || prev.logoutDescription,
//             earlyLogoutReason: earlyLogoutReason || prev.earlyLogoutReason,
//             status: prev.status || "accepted",
//             updatedAt: new Date().toISOString(),
//           };
//         });
//       }

//       setShowLogoutModal(false);
//       setLogoutDescription("");
//       setEarlyLogoutReason("");
//       setIsEarlyLogout(false);

//       // sync canonical data
//       await fetchTodayAttendance();
//       await fetchAttendanceHistory();
//     } catch (err) {
//       console.error("Error recording logout:", err);
//       const msg = err?.response?.data?.message || "Error recording logout";
//       addNotification(msg, "error");
//       setModalMessage(msg);
//     }
//   };

//   // Helpers to format times
//   const formatTime = (timeString) => {
//     if (!timeString) return "-";
//     return new Date(timeString).toLocaleTimeString([], {
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return "-";
//     return new Date(dateString).toLocaleDateString();
//   };

//   // choose best login time for record
//   const getLoginTimeForRecord = (rec) => {
//     return rec?.checkIn || rec?.createdAt || rec?.date || null;
//   };
//   // choose best logout time for record
//   const getLogoutTimeForRecord = (rec) => {
//     return rec?.checkOut|| null;
//   };

//   // visibility rules
//   // hide Mark Attendance as soon as there's an attendanceData object (pending/accepted/rejected)
//   const showMarkAttendanceButton = !attendanceData;
//   // show Logout only if attendance exists, status accepted, and no checkOut
//   const showLogoutButton =
//     attendanceData &&
//     attendanceData.status === "accepted" &&
//     !attendanceData.checkOut &&
//     attendanceData._id;

//   return (
//     <div className="min-h-[80vh] p-4">
//       {/* Notifications (top-right toasts) */}
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
//         <h1 className="text-2xl font-bold text-gray-800">My Attendance</h1>
//       </header>

//       {/* Today's Attendance */}
//       <section className="bg-white shadow rounded-lg p-4 mb-6">
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//           <h2 className="text-xl font-semibold text-gray-800">
//             Today's Attendance
//           </h2>
//           <div className="flex items-center gap-3">
//             {showMarkAttendanceButton && (
//               <button
//                 onClick={() => {
//                   setModalMessage(null);
//                   setShowLoginModal(true);
//                 }}
//                 className="px-4 py-2 rounded-md text-white"
//                 style={{ backgroundColor: PRIMARY }}
//               >
//                 <span>Mark Attendance</span>
//                 <style>{`.rounded-md:hover{background:${PRIMARY_HOVER} !important}`}</style>
//               </button>
//             )}

//             {showLogoutButton && (
//               <button
//                 onClick={() => {
//                   setModalMessage(null);
//                   setShowLogoutModal(true);
//                 }}
//                 className="px-4 py-2 rounded-md text-white"
//                 style={{ backgroundColor: PRIMARY }}
//               >
//                 <span>Log Out</span>
//                 <style>{`.rounded-md:hover{background:${PRIMARY_HOVER} !important}`}</style>
//               </button>
//             )}
//           </div>
//         </div>

//         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
//           <div className="p-4 rounded-lg border border-gray-100">
//             <p className="text-sm text-gray-500">Status</p>
//             <p className="text-lg font-semibold text-gray-800">
//               {attendanceData?.status || "Not Logged In"}
//             </p>
//           </div>

//           <div className="p-4 rounded-lg border border-gray-100">
//             <p className="text-sm text-gray-500">Login Time</p>
//             <p className="text-lg font-semibold text-gray-800">
//               {attendanceData
//                 ? formatTime(getLoginTimeForRecord(attendanceData))
//                 : "-"}
//             </p>

//             {attendanceData?.taskDescription && (
//               <p className="mt-2 text-sm text-gray-600">
//                 <strong>Task:</strong> {attendanceData.taskDescription}
//               </p>
//             )}
//             {attendanceData?.workProgress && (
//               <p className="mt-1 text-sm text-gray-600">
//                 <strong>Progress:</strong> {attendanceData.workProgress}
//               </p>
//             )}
//           </div>

//           <div className="p-4 rounded-lg border border-gray-100">
//             <p className="text-sm text-gray-500">Logout Time</p>
//             <p className="text-lg font-semibold text-gray-800">
//               {/* {attendanceData?.checkOut
//                 ? formatTime(attendanceData.checkOut)
//                 : attendanceData?.updatedAt
//                 ? formatTime(attendanceData.updatedAt)
//                 : "Pending"} */}

//                 {attendanceData?.checkOut
//                 ? formatTime(attendanceData.checkOut)
//                 // : attendanceData?.updatedAt
//                 // ? formatTime(attendanceData.updatedAt)
//                 : "Pending"}

//             </p>

//             {attendanceData?.logoutDescription && (
//               <p className="mt-2 text-sm text-gray-600">
//                 <strong>Logout Note:</strong> {attendanceData.logoutDescription}
//               </p>
//             )}

//             {attendanceData?.earlyLogoutReason && (
//               <p className="mt-1 text-sm text-red-600">
//                 <strong>Early Logout Reason:</strong>{" "}
//                 {attendanceData.earlyLogoutReason}
//               </p>
//             )}
//           </div>
//         </div>
//       </section>

//       {/* Attendance History */}
//       <section className="bg-white shadow rounded-lg p-4 mb-6">
//         <h3 className="text-lg font-semibold text-gray-800 mb-4">
//           Attendance History
//         </h3>
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-[#104774] text-white">
//               <tr>
//                 <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
//                   Date
//                 </th>
//                 <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
//                   Login
//                 </th>
//                 <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
//                   Logout
//                 </th>
//                 <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
//                   Status
//                 </th>
//                 <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
//                   Work Progress
//                 </th>
//                 <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
//                   Task
//                 </th>
//                 <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
//                   Logout Note
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {attendanceRecords.length === 0 ? (
//                 <tr>
//                   <td
//                     colSpan={7}
//                     className="px-4 py-6 text-center text-sm text-gray-500"
//                   >
//                     No records found
//                   </td>
//                 </tr>
//               ) : (
//                 attendanceRecords.map((rec) => (
//                   <tr key={rec._id}>
//                     <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
//                       {formatDate(rec.date || rec.createdAt)}
//                     </td>
//                     <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
//                       {getLoginTimeForRecord(rec)
//                         ? formatTime(getLoginTimeForRecord(rec))
//                         : "-"}
//                     </td>
//                     <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
//                       {getLogoutTimeForRecord(rec)
//                         ? formatTime(getLogoutTimeForRecord(rec))
//                         : "-"}
//                     </td>
//                     <td className="px-4 py-3 whitespace-nowrap">
//                       <span
//                         className={`px-2 py-1 rounded-full text-xs ${
//                           rec.status === "accepted"
//                             ? "bg-green-100 text-green-800"
//                             : rec.status === "rejected"
//                             ? "bg-red-100 text-red-800"
//                             : "bg-yellow-100 text-yellow-800"
//                         }`}
//                       >
//                         {rec.status}
//                       </span>
//                     </td>
//                     <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
//                       {rec.workProgress || "-"}
//                     </td>
//                     <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
//                       {rec.taskDescription || "-"}
//                     </td>
//                     <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
//                       {rec.logoutDescription || "-"}
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </section>

//       {/* Login Modal */}
//       {showLoginModal && (
//         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-40">
//           <div className="bg-white rounded-lg p-4 w-full max-w-md">
//             <h4 className="text-lg font-semibold mb-3 text-gray-800">
//               Mark Attendance
//             </h4>

//             {modalMessage && (
//               <div className="mb-3 text-sm text-gray-700 bg-gray-50 p-2 rounded">
//                 {modalMessage}
//               </div>
//             )}

//             <form onSubmit={handleLoginSubmit}>
//               <div className="mb-3">
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Task Description
//                 </label>
//                 <textarea
//                   value={taskDescription}
//                   onChange={(e) => setTaskDescription(e.target.value)}
//                   rows={3}
//                   required
//                   className="w-full p-2 border border-gray-300 rounded"
//                 />
//               </div>

//               <div className="mb-3">
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Work Progress
//                 </label>
//                 <select
//                   value={workProgress}
//                   onChange={(e) => setWorkProgress(e.target.value)}
//                   required
//                   className="w-full p-2 border border-gray-300 rounded"
//                 >
//                   <option value="Planned">Planned</option>
//                   <option value="In Progress">In Progress</option>
//                   <option value="Completed">Completed</option>
//                 </select>
//               </div>

//               <div className="flex justify-end gap-2">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowLoginModal(false);
//                     setModalMessage(null);
//                   }}
//                   className="px-3 py-2 border rounded"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-3 py-2 text-white rounded"
//                   style={{ backgroundColor: PRIMARY }}
//                 >
//                   Submit
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Logout Modal */}
//       {showLogoutModal && (
//         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-40">
//           <div className="bg-white rounded-lg p-4 w-full max-w-md">
//             <h4 className="text-lg font-semibold mb-3 text-gray-800">
//               Log Out
//             </h4>

//             {modalMessage && (
//               <div className="mb-3 text-sm text-gray-700 bg-gray-50 p-2 rounded">
//                 {modalMessage}
//               </div>
//             )}

//             <form onSubmit={handleLogoutSubmit}>
//               <div className="mb-3">
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Logout Description
//                 </label>
//                 <textarea
//                   value={logoutDescription}
//                   onChange={(e) => setLogoutDescription(e.target.value)}
//                   rows={3}
//                   required
//                   className="w-full p-2 border border-gray-300 rounded"
//                 />
//               </div>

//               <div className="mb-3 flex items-center">
//                 <input
//                   id="earlyLogout"
//                   type="checkbox"
//                   checked={isEarlyLogout}
//                   onChange={(e) => setIsEarlyLogout(e.target.checked)}
//                   className="mr-2"
//                 />
//                 <label htmlFor="earlyLogout" className="text-sm text-gray-700">
//                   Logging out early
//                 </label>
//               </div>

//               {isEarlyLogout && (
//                 <div className="mb-3">
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Reason for early logout
//                   </label>
//                   <textarea
//                     value={earlyLogoutReason}
//                     onChange={(e) => setEarlyLogoutReason(e.target.value)}
//                     rows={2}
//                     required
//                     className="w-full p-2 border border-gray-300 rounded"
//                   />
//                 </div>
//               )}

//               <div className="flex justify-end gap-2">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowLogoutModal(false);
//                     setModalMessage(null);
//                   }}
//                   className="px-3 py-2 border rounded"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-3 py-2 text-white rounded"
//                   style={{ backgroundColor: PRIMARY }}
//                 >
//                   Submit Logout
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default EmployeeAttendance;


import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useAuth } from "../context/AppContext";
import LoginModal from "../components/attendance/LoginModal.jsx";
import LogoutModal from "../components/attendance/LogoutModal.jsx";
import RegularizationModal from "../components/attendance/RegularizationModal.jsx";
import NotificationToast from "../components/common/NotificationToast.jsx";

const PRIMARY = "#104774";
const PRIMARY_HOVER = "#0d3a61";

const EmployeeAttendance = () => {
  const { token, user } = useAuth();
  const [attendanceData, setAttendanceData] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showRegularizationModal, setShowRegularizationModal] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      fetchTodayAttendance();
      fetchAttendanceHistory();
    }
  }, [token]);

  const addNotification = (message, type = "info", ttl = 4000) => {
    const id = Date.now() + Math.random();
    setNotifications((n) => [...n, { id, message, type }]);
    setTimeout(() => setNotifications((n) => n.filter((x) => x.id !== id)), ttl);
  };

  const fetchTodayAttendance = async () => {
    try {
      const res = await axiosInstance.get("/attendance/today", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAttendanceData(res.data || null);
    } catch (err) {
      console.error("Error fetching today attendance:", err);
      setAttendanceData(null);
      addNotification(
        err?.response?.data?.message || "Could not fetch today attendance",
        "error"
      );
    }
  };

  const fetchAttendanceHistory = async () => {
    try {
      const res = await axiosInstance.get("/attendance/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAttendanceRecords(res.data || []);
    } catch (err) {
      console.error("Error fetching attendance history:", err);
      setAttendanceRecords([]);
      addNotification(
        err?.response?.data?.message || "Could not fetch attendance history",
        "error"
      );
    }
  };

  const fetchLeaveRequests = async () => {
    try {
      const res = await axiosInstance.get("/leave/my-requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data || [];
    } catch (err) {
      console.error("Error fetching leave requests:", err);
      return [];
    }
  };

  const checkIsHoliday = async (date) => {
    try {
      const res = await axiosInstance.get(`/attendance/check-holiday/${date}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.isHoliday;
    } catch (err) {
      console.error("Error checking holiday:", err);
      return false;
    }
  };

  const handleLoginSuccess = (newAttendance) => {
    setAttendanceData(newAttendance);
    setShowLoginModal(false);
    addNotification("Attendance submitted successfully", "success");
    fetchTodayAttendance();
    fetchAttendanceHistory();
  };

  const handleLogoutSuccess = (updatedAttendance) => {
    setAttendanceData(updatedAttendance);
    setShowLogoutModal(false);
    addNotification("Logout recorded successfully", "success");
    fetchTodayAttendance();
    fetchAttendanceHistory();
  };

  const handleRegularizationSuccess = () => {
    setShowRegularizationModal(false);
    addNotification("Regularization request submitted", "success");
    fetchAttendanceHistory();
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

  const showMarkAttendanceButton = !attendanceData;
  const showLogoutButton =
    attendanceData &&
    attendanceData.status === "accepted" &&
    !attendanceData.checkOut;

  // Check if current date is in the past for regularization
  const canRequestRegularization = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return true; // Allow regularization for any date
  };

  return (
    <div className="min-h-[80vh] p-4">
      <style>{`
        .primary-btn:hover { background: ${PRIMARY_HOVER} !important }
      `}</style>

      <NotificationToast notifications={notifications} />

      <header className="p-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Attendance</h1>
        <p className="text-sm text-gray-600">
          Manage your daily attendance and view history
        </p>
      </header>

      {/* Today's Attendance Section */}
      <section className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Today's Attendance - {new Date().toLocaleDateString()}
          </h2>
          <div className="flex flex-wrap gap-3">
            {showMarkAttendanceButton && (
              <button
                onClick={async () => {
                  const today = new Date().toISOString().split('T')[0];
                  const isHoliday = await checkIsHoliday(today);
                  if (isHoliday) {
                    addNotification("Today is a holiday. Cannot mark attendance.", "warning");
                    return;
                  }
                  setShowLoginModal(true);
                }}
                className="px-4 py-2 rounded-md text-white primary-btn"
                style={{ backgroundColor: PRIMARY }}
              >
                Mark Attendance
              </button>
            )}

            {showLogoutButton && (
              <button
                onClick={() => setShowLogoutModal(true)}
                className="px-4 py-2 rounded-md text-white primary-btn"
                style={{ backgroundColor: PRIMARY }}
              >
                Log Out
              </button>
            )}

            {canRequestRegularization() && (
              <button
                onClick={() => setShowRegularizationModal(true)}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Request Regularization
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Status</p>
              <div className="w-3 h-3 rounded-full bg-gray-400 animate-pulse"></div>
            </div>
            <p className="text-lg font-semibold text-gray-800">
              {attendanceData?.status ? (
                <span className={`capitalize ${
                  attendanceData.status === 'accepted' ? 'text-green-600' :
                  attendanceData.status === 'pending' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {attendanceData.status}
                </span>
              ) : (
                "Not Logged In"
              )}
            </p>
          </div>

          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
            <p className="text-sm font-medium text-gray-600 mb-2">Login Time</p>
            <p className="text-lg font-semibold text-gray-800">
              {attendanceData?.checkIn ? formatTime(attendanceData.checkIn) : "-"}
            </p>
            {attendanceData?.taskDescription && (
              <div className="mt-3">
                <p className="text-xs font-medium text-gray-500">Task</p>
                <p className="text-sm text-gray-700 mt-1">{attendanceData.taskDescription}</p>
              </div>
            )}
          </div>

          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
            <p className="text-sm font-medium text-gray-600 mb-2">Logout Time</p>
            <p className="text-lg font-semibold text-gray-800">
              {attendanceData?.checkOut ? formatTime(attendanceData.checkOut) : "Pending"}
            </p>
            {attendanceData?.logoutDescription && (
              <div className="mt-3">
                <p className="text-xs font-medium text-gray-500">Logout Note</p>
                <p className="text-sm text-gray-700 mt-1">{attendanceData.logoutDescription}</p>
              </div>
            )}
            {attendanceData?.earlyLogoutReason && (
              <div className="mt-2">
                <p className="text-xs font-medium text-red-500">Early Logout Reason</p>
                <p className="text-sm text-red-600 mt-1">{attendanceData.earlyLogoutReason}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Attendance History Section */}
      <section className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Attendance History</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Last 30 days</span>
            <button
              onClick={fetchAttendanceHistory}
              className="p-2 text-gray-500 hover:text-gray-700"
              title="Refresh"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#104774] text-white">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Login</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Logout</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Work Progress</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Task</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendanceRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No attendance records found
                  </td>
                </tr>
              ) : (
                attendanceRecords.map((record) => (
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
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {record.workProgress || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <div className="max-w-xs truncate" title={record.taskDescription}>
                        {record.taskDescription || "-"}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
        token={token}
        addNotification={addNotification}
      />

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onSuccess={handleLogoutSuccess}
        attendanceData={attendanceData}
        token={token}
        addNotification={addNotification}
      />

      <RegularizationModal
        isOpen={showRegularizationModal}
        onClose={() => setShowRegularizationModal(false)}
        onSuccess={handleRegularizationSuccess}
        token={token}
        addNotification={addNotification}
        employeeId={user?._id}
      />
    </div>
  );
};

export default EmployeeAttendance;