import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import LoginModal from "./LoginModal";
import LogoutModal from "./LogoutModal";

const HRAttendanceTab = ({ token, addNotification, user }) => {
  const [attendanceData, setAttendanceData] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHRAttendanceData();
  }, [token]);

  const fetchHRAttendanceData = async () => {
    try {
      setLoading(true);
      const [todayRes, historyRes] = await Promise.all([
        axiosInstance.get("/attendance/hr/today", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axiosInstance.get("/attendance/hr/history", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setAttendanceData(todayRes.data);
      setAttendanceHistory(historyRes.data || []);
    } catch (error) {
      console.error("Error fetching HR attendance data:", error);
      addNotification("Error loading attendance data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (newAttendance) => {
    setAttendanceData(newAttendance);
    setShowLoginModal(false);
    addNotification("Attendance submitted successfully", "success");
    fetchHRAttendanceData();
  };

  const handleLogoutSuccess = (updatedAttendance) => {
    setAttendanceData(updatedAttendance);
    setShowLogoutModal(false);
    addNotification("Logout recorded successfully", "success");
    fetchHRAttendanceData();
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

  const showMarkAttendance = !attendanceData;
  const showLogoutButton =
    attendanceData?.status === "accepted" && !attendanceData.checkOut;

    return (
  <div>
    {/* Header */}
<div className="border border-gray-200 rounded-lg shadow-sm h-[300px] overflow-y-auto  overflow-x-hidden p-3 sm:p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">My Attendance</h2>
        <button
          onClick={fetchHRAttendanceData}
          className="p-1.5 text-gray-500 hover:text-gray-700"
          title="Refresh"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Today's Attendance */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <h3 className="text-base font-semibold mb-2">Today's Attendance</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
          <div className="p-2 bg-white rounded border flex flex-col">
            <span className="text-xs text-gray-500">Status</span>
            <span className={`text-sm font-semibold mt-1 capitalize ${
              attendanceData?.status === "accepted" ? "text-green-600" :
              attendanceData?.status === "pending" ? "text-yellow-600" :
              "text-red-600"
            }`}>
              {attendanceData?.status || "Not Logged In"}
            </span>
          </div>
          <div className="p-2 bg-white rounded border flex flex-col">
            <span className="text-xs text-gray-500">Login Time</span>
            <span className="text-sm font-semibold mt-1">
              {attendanceData?.checkIn ? formatTime(attendanceData.checkIn) : "-"}
            </span>
          </div>
          <div className="p-2 bg-white rounded border flex flex-col">
            <span className="text-xs text-gray-500">Logout Time</span>
            <span className="text-sm font-semibold mt-1">
              {attendanceData?.checkOut ? formatTime(attendanceData.checkOut) : "Pending"}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          {showMarkAttendance && (
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-3 py-1.5 bg-[#104774] text-white rounded text-xs hover:bg-[#0f3453]"
            >
              Mark Attendance
            </button>
          )}
          {showLogoutButton && (
            <button
              onClick={() => setShowLogoutModal(true)}
              className="px-3 py-1.5 bg-[#104774] text-white rounded text-xs hover:bg-[#104774]"
            >
              Log Out
            </button>
          )}
        </div>
      </div>

      {/* Attendance History */}
<div className="">
  {/* Desktop Table */}
  <div className="hidden sm:block ">
    <div className=""> {/* Force horizontal scroll on mobile */}
      <table className="w-full divide-y divide-gray-200 text-xs">
        <thead className="bg-[#104774]">
          <tr>
            <th className="px-2 py-2 text-left font-medium text-white uppercase tracking-wider">Date</th>
            <th className="px-2 py-2 text-left font-medium text-white uppercase tracking-wider">Login</th>
            <th className="px-2 py-2 text-left font-medium text-white uppercase tracking-wider">Logout</th>
            <th className="px-2 py-2 text-left font-medium text-white uppercase tracking-wider">Status</th>
            <th className="px-2 py-2 text-left font-medium text-white uppercase tracking-wider">Task</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {attendanceHistory.map((record, index) => (
            <tr key={record._id} className="hover:bg-gray-50">
              <td className="px-2 py-2 text-gray-700 whitespace-nowrap">
                {formatDate(record.date)}
              </td>
              <td className="px-2 py-2 text-gray-700 whitespace-nowrap">
                {record.checkIn ? formatTime(record.checkIn) : "-"}
              </td>
              <td className="px-2 py-2 text-gray-700 whitespace-nowrap">
                {record.checkOut ? formatTime(record.checkOut) : "-"}
              </td>
              <td className="px-2 py-2 whitespace-nowrap">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  record.status === 'accepted' ? 'bg-green-100 text-green-800' :
                  record.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {record.status}
                </span>
              </td>
              <td className="px-2 py-2 max-w-[150px]">
                <div className="relative group">
                  <div className="truncate cursor-help" title={record.taskDescription}>
                    {record.taskDescription || "-"}
                  </div>
                  {record.taskDescription && (
                    <div className="absolute left-0 mt-1 w-48 bg-gray-900 text-white text-xs rounded p-2 shadow-lg z-10 invisible opacity-0 group-hover:visible group-hover:opacity-100 break-words">
                      {record.taskDescription}
                      <div className="absolute top-0 left-3 -mt-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                    </div>
                  )}
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
    {attendanceHistory.map((record, index) => (
      <div key={record._id} className="border border-gray-200 rounded-lg p-3 bg-white shadow-sm">
        <div className="space-y-2">
          {/* Header - Date and Status */}
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-900 text-sm">
              {formatDate(record.date)}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              record.status === 'accepted' ? 'bg-green-100 text-green-800' :
              record.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {record.status}
            </span>
          </div>

          {/* Login/Logout Times */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="font-medium text-gray-700 block">Login Time</span>
              <span className="text-gray-600">
                {record.checkIn ? formatTime(record.checkIn) : "-"}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700 block">Logout Time</span>
              <span className="text-gray-600">
                {record.checkOut ? formatTime(record.checkOut) : "-"}
              </span>
            </div>
          </div>

          {/* Task Description */}
          <div className="text-xs">
            <span className="font-medium text-gray-700 block mb-1">Task Description</span>
            {record.taskDescription ? (
              <div className="relative">
                <div className="text-gray-600 line-clamp-2 bg-gray-50 p-2 rounded border">
                  {record.taskDescription}
                </div>
                {record.taskDescription.length > 100 && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      // Yahan pe full task description show karne ka logic add kar sakte ho
                      alert(record.taskDescription);
                    }}
                    className="text-blue-600 text-xs mt-1 hover:text-blue-800"
                  >
                    View Full Task
                  </button>
                )}
              </div>
            ) : (
              <span className="text-gray-400">-</span>
            )}
          </div>

          {/* Additional Info (if needed) */}
          <div className="flex justify-between text-xs text-gray-500 pt-1 border-t">
            <span>Record #{index + 1}</span>
            <span>{record.checkIn && record.checkOut ? 'Completed' : 'In Progress'}</span>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>
    </div>

    {/* Modals */}
    <LoginModal
      isOpen={showLoginModal}
      onClose={() => setShowLoginModal(false)}
      onSuccess={handleLoginSuccess}
      token={token}
      addNotification={addNotification}
      basePath="/attendance/hr"
    />
    <LogoutModal
      isOpen={showLogoutModal}
      onClose={() => setShowLogoutModal(false)}
      onSuccess={handleLogoutSuccess}
      attendanceData={attendanceData}
      token={token}
      addNotification={addNotification}
      basePath="/attendance/hr"
    />
  </div>
);

  // return (
  //   <div>
  //     {/* Header */}
  //     <div className="h-[300px] overflow-y-auto border border-gray-200 rounded-lg shadow-sm p-4">
  //       {/* Header */}
  //       <div className="flex items-center justify-between mb-4">
  //         <h2 className="text-xl font-semibold">My Attendance</h2>
  //         <button
  //           onClick={fetchHRAttendanceData}
  //           className="p-2 text-gray-500 hover:text-gray-700"
  //           title="Refresh"
  //         >
  //           <svg
  //             className="w-5 h-5"
  //             fill="none"
  //             stroke="currentColor"
  //             viewBox="0 0 24 24"
  //           >
  //             <path
  //               strokeLinecap="round"
  //               strokeLinejoin="round"
  //               strokeWidth={2}
  //               d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
  //             />
  //           </svg>
  //         </button>
  //       </div>

  //       {/* Today's Attendance */}
  //       <div className="bg-gray-50 rounded-lg p-3 mb-4">
  //         <h3 className="text-lg font-semibold mb-3">Today's Attendance</h3>
  //         <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
  //           <div className="p-3 bg-white rounded-lg shadow flex flex-col">
  //             <span className="text-sm text-gray-500">Status</span>
  //             <span
  //               className={`text-lg font-semibold mt-1 capitalize ${
  //                 attendanceData?.status === "accepted"
  //                   ? "text-green-600"
  //                   : attendanceData?.status === "pending"
  //                   ? "text-yellow-600"
  //                   : "text-red-600"
  //               }`}
  //             >
  //               {attendanceData?.status || "Not Logged In"}
  //             </span>
  //           </div>
  //           <div className="p-3 bg-white rounded-lg shadow flex flex-col">
  //             <span className="text-sm text-gray-500">Login Time</span>
  //             <span className="text-lg font-semibold mt-1">
  //               {attendanceData?.checkIn
  //                 ? formatTime(attendanceData.checkIn)
  //                 : "-"}
  //             </span>
  //           </div>
  //           <div className="p-3 bg-white rounded-lg shadow flex flex-col">
  //             <span className="text-sm text-gray-500">Logout Time</span>
  //             <span className="text-lg font-semibold mt-1">
  //               {attendanceData?.checkOut
  //                 ? formatTime(attendanceData.checkOut)
  //                 : "Pending"}
  //             </span>
  //           </div>
  //         </div>

  //         <div className="flex gap-3 mt-3">
  //           {showMarkAttendance && (
  //             <button
  //               onClick={() => setShowLoginModal(true)}
  //               className="px-4 py-2 bg-[#104774] text-white rounded-md hover:bg-[#0d3a61]"
  //             >
  //               Mark Attendance
  //             </button>
  //           )}
  //           {showLogoutButton && (
  //             <button
  //               onClick={() => setShowLogoutModal(true)}
  //               className="px-4 py-2 bg-[#104774] text-white rounded-md hover:bg-[#0d3a61]"
  //             >
  //               Log Out
  //             </button>
  //           )}
  //         </div>
  //       </div>

  //       {/* Attendance History Table */}
  //       <div className="overflow-x-auto">
  //         <table className="min-w-full divide-y divide-gray-200">
  //           <thead className="bg-[#104774] text-white sticky top-0 z-10">
  //             <tr>
  //               <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
  //                 Date
  //               </th>
  //               <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
  //                 Login
  //               </th>
  //               <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
  //                 Logout
  //               </th>
  //               <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
  //                 Status
  //               </th>
  //               <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
  //                 Task
  //               </th>
  //             </tr>
  //           </thead>
  //           <tbody>
  //             {attendanceHistory.map((record, index) => (
  //               <tr
  //                 key={record._id}
  //                 className={`${
  //                   index % 2 === 0 ? "bg-white" : "bg-gray-50"
  //                 } hover:bg-gray-100 transition`}
  //               >
  //                 <td className="px-4 py-2 text-sm text-gray-700 whitespace-nowrap">
  //                   {formatDate(record.date)}
  //                 </td>
  //                 <td className="px-4 py-2 text-sm text-gray-700 whitespace-nowrap">
  //                   {record.checkIn ? formatTime(record.checkIn) : "-"}
  //                 </td>
  //                 <td className="px-4 py-2 text-sm text-gray-700 whitespace-nowrap">
  //                   {record.checkOut ? formatTime(record.checkOut) : "-"}
  //                 </td>
  //                 <td className="px-4 py-2 whitespace-nowrap">
  //                   {getStatusBadge(record.status)}
  //                 </td>
  //                 <td className="px-4 py-2 text-sm text-gray-700 relative group max-w-xs truncate cursor-pointer">
  //                   {record.taskDescription || "-"}
  //                   {record.taskDescription && (
  //                     <div className="absolute left-1/2 -translate-x-1/2 mt-1 w-64 bg-gray-800 text-white text-xs rounded-md p-2 shadow-lg z-[999] invisible opacity-0 group-hover:visible group-hover:opacity-100 break-words">
  //                       {record.taskDescription}
  //                     </div>
  //                   )}
  //                 </td>
  //               </tr>
  //             ))}
  //           </tbody>
  //         </table>
  //       </div>
  //     </div>

  //     {/* Modals */}
  //     <LoginModal
  //       isOpen={showLoginModal}
  //       onClose={() => setShowLoginModal(false)}
  //       onSuccess={handleLoginSuccess}
  //       token={token}
  //       addNotification={addNotification}
  //       basePath="/attendance/hr"
  //     />
  //     <LogoutModal
  //       isOpen={showLogoutModal}
  //       onClose={() => setShowLogoutModal(false)}
  //       onSuccess={handleLogoutSuccess}
  //       attendanceData={attendanceData}
  //       token={token}
  //       addNotification={addNotification}
  //       basePath="/attendance/hr"
  //     />
  //   </div>
  // );

};

export default HRAttendanceTab;
