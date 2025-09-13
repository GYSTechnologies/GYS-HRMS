// import React, { useState } from "react";
// import axiosInstance from "../../utils/axiosInstance";

// const LogoutModal = ({ isOpen, onClose, onSuccess, attendanceData, token, addNotification }) => {
//   const [logoutDescription, setLogoutDescription] = useState("");
//   const [earlyLogoutReason, setEarlyLogoutReason] = useState("");
//   const [isEarlyLogout, setIsEarlyLogout] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [modalMessage, setModalMessage] = useState(null);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!logoutDescription.trim()) {
//       setModalMessage("Logout description is required");
//       return;
//     }

//     if (isEarlyLogout && !earlyLogoutReason.trim()) {
//       setModalMessage("Early logout reason is required");
//       return;
//     }

//     setLoading(true);
//     setModalMessage(null);

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
//         addNotification("Logout recorded successfully", "success");
//       }

//       const updatedAttendance = res.data?.attendance || res.data;
//       if (updatedAttendance && updatedAttendance._id) {
//         onSuccess(updatedAttendance);
//       } else {
//         onSuccess({
//           ...attendanceData,
//           checkOut: new Date().toISOString(),
//           logoutDescription,
//           earlyLogoutReason: isEarlyLogout ? earlyLogoutReason : undefined,
//         });
//       }

//       setLogoutDescription("");
//       setEarlyLogoutReason("");
//       setIsEarlyLogout(false);
//     } catch (err) {
//       console.error("Error recording logout:", err);
//       const errorMsg = err?.response?.data?.message || "Error recording logout";
//       setModalMessage(errorMsg);
//       addNotification(errorMsg, "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
//       <div className="bg-white rounded-lg p-6 w-full max-w-md">
//         <div className="flex items-center justify-between mb-4">
//           <h4 className="text-lg font-semibold text-gray-800">Log Out</h4>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-600"
//           >
//             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//             </svg>
//           </button>
//         </div>

//         {modalMessage && (
//           <div className={`mb-4 p-3 rounded text-sm ${
//             modalMessage.includes("Error") || modalMessage.includes("required") 
//               ? "bg-red-50 text-red-800 border border-red-100" 
//               : "bg-green-50 text-green-800 border border-green-100"
//           }`}>
//             {modalMessage}
//           </div>
//         )}

//         <form onSubmit={handleSubmit}>
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Logout Description *
//             </label>
//             <textarea
//               value={logoutDescription}
//               onChange={(e) => setLogoutDescription(e.target.value)}
//               rows={4}
//               required
//               className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               placeholder="Describe what you completed today..."
//             />
//           </div>

//           <div className="mb-4">
//             <label className="flex items-center">
//               <input
//                 type="checkbox"
//                 checked={isEarlyLogout}
//                 onChange={(e) => setIsEarlyLogout(e.target.checked)}
//                 className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//               />
//               <span className="text-sm text-gray-700">Logging out early</span>
//             </label>
//           </div>

//           {isEarlyLogout && (
//             <div className="mb-6">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Reason for early logout *
//               </label>
//               <textarea
//                 value={earlyLogoutReason}
//                 onChange={(e) => setEarlyLogoutReason(e.target.value)}
//                 rows={3}
//                 required={isEarlyLogout}
//                 className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 placeholder="Please provide reason for early logout..."
//               />
//             </div>
//           )}

//           <div className="flex justify-end gap-3">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
//               disabled={loading}
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={loading}
//               className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {loading ? "Logging Out..." : "Confirm Logout"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default LogoutModal;


import React, { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

/**
 * props:
 * - isOpen, onClose, onSuccess, attendanceData, token, addNotification (same as before)
 * - basePath: string, defaults to "/attendance". For HR pass "/attendance/hr"
 */
const LogoutModal = ({
  isOpen,
  onClose,
  onSuccess,
  attendanceData,
  token,
  addNotification,
  basePath = "/attendance",
}) => {
  const [logoutDescription, setLogoutDescription] = useState("");
  const [earlyLogoutReason, setEarlyLogoutReason] = useState("");
  const [isEarlyLogout, setIsEarlyLogout] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!logoutDescription.trim()) {
      setModalMessage("Logout description is required");
      return;
    }

    if (isEarlyLogout && !earlyLogoutReason.trim()) {
      setModalMessage("Early logout reason is required");
      return;
    }

    setLoading(true);
    setModalMessage(null);

    try {
      if (!attendanceData || !attendanceData._id) {
        throw new Error("Attendance record id is missing.");
      }

      const res = await axiosInstance.post(
        `${basePath}/logout/${attendanceData._id}`,
        {
          logoutDescription,
          earlyLogoutReason: isEarlyLogout ? earlyLogoutReason : undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.message) {
        addNotification(res.data.message, "success");
        setModalMessage(res.data.message);
      } else {
        addNotification("Logout recorded successfully", "success");
      }

      const updatedAttendance = res.data?.attendance || res.data;
      if (updatedAttendance && updatedAttendance._id) {
        onSuccess(updatedAttendance);
      } else {
        onSuccess({
          ...attendanceData,
          checkOut: new Date().toISOString(),
          logoutDescription,
          earlyLogoutReason: isEarlyLogout ? earlyLogoutReason : undefined,
        });
      }

      setLogoutDescription("");
      setEarlyLogoutReason("");
      setIsEarlyLogout(false);
    } catch (err) {
      console.error("Error recording logout:", err);
      const errorMsg = err?.response?.data?.message || err.message || "Error recording logout";
      setModalMessage(errorMsg);
      addNotification(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-800">Log Out</h4>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {modalMessage && (
          <div className={`mb-4 p-3 rounded text-sm ${
            modalMessage.includes("Error") || modalMessage.includes("required")
              ? "bg-red-50 text-red-800 border border-red-100"
              : "bg-green-50 text-green-800 border border-green-100"
          }`}>
            {modalMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Logout Description *</label>
            <textarea
              value={logoutDescription}
              onChange={(e) => setLogoutDescription(e.target.value)}
              rows={4}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe what you completed today..."
            />
          </div>

          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isEarlyLogout}
                onChange={(e) => setIsEarlyLogout(e.target.checked)}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Logging out early</span>
            </label>
          </div>

          {isEarlyLogout && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason for early logout *</label>
              <textarea
                value={earlyLogoutReason}
                onChange={(e) => setEarlyLogoutReason(e.target.value)}
                rows={3}
                required={isEarlyLogout}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Please provide reason for early logout..."
              />
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
  type="submit"
  disabled={loading}
  className="px-4 py-2 rounded-md text-white disabled:opacity-50 disabled:cursor-not-allowed"
  style={{ backgroundColor: "#104774" }}
  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0d3a61")}
  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#104774")}
>
  {loading ? "Logging Out..." : "Confirm Logout"}
</button>

            {/* <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging Out..." : "Confirm Logout"}
            </button> */}
          </div>
        </form>
      </div>
    </div>
  );
};

export default LogoutModal;
