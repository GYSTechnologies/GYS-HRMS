// import React, { useState } from "react";
// import axiosInstance from "../../utils/axiosInstance";

// const LoginModal = ({ isOpen, onClose, onSuccess, token, addNotification }) => {
//   const [taskDescription, setTaskDescription] = useState("");
//   const [workProgress, setWorkProgress] = useState("Planned");
//   const [loading, setLoading] = useState(false);
//   const [modalMessage, setModalMessage] = useState(null);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!taskDescription.trim()) {
//       setModalMessage("Task description is required");
//       return;
//     }

//     setLoading(true);
//     setModalMessage(null);

//     try {
//       const res = await axiosInstance.post(
//         "/attendance/login",
//         { taskDescription, workProgress },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       if (res.data?.message) {
//         addNotification(res.data.message, "success");
//         setModalMessage(res.data.message);
//       } else {
//         addNotification("Attendance submitted successfully", "success");
//       }

//       // Extract attendance from response
//       const newAttendance = res.data?.attendance || res.data;
//       if (newAttendance && newAttendance._id) {
//         onSuccess(newAttendance);
//       } else {
//         onSuccess({
//           status: "pending",
//           taskDescription,
//           workProgress,
//           createdAt: new Date().toISOString(),
//         });
//       }

//       setTaskDescription("");
//       setWorkProgress("Planned");
//     } catch (err) {
//       console.error("Error submitting attendance:", err);
//       const errorMsg = err?.response?.data?.message || "Error submitting attendance";
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
//           <h4 className="text-lg font-semibold text-gray-800">Mark Attendance</h4>
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
//               Task Description *
//             </label>
//             <textarea
//               value={taskDescription}
//               onChange={(e) => setTaskDescription(e.target.value)}
//               rows={4}
//               required
//               className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               placeholder="Describe what you'll be working on today..."
//             />
//           </div>

//           <div className="mb-6">
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Work Progress
//             </label>
//             <select
//               value={workProgress}
//               onChange={(e) => setWorkProgress(e.target.value)}
//               className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             >
//               <option value="Planned">Planned</option>
//               <option value="In Progress">In Progress</option>
//               <option value="Completed">Completed</option>
//             </select>
//           </div>

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
//               {loading ? "Submitting..." : "Submit Attendance"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default LoginModal;

import React, { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

/**
 * props:
 * - isOpen, onClose, onSuccess, token, addNotification (same as before)
 * - basePath: string, defaults to "/attendance". For HR pass "/attendance/hr"
 */
const LoginModal = ({
  isOpen,
  onClose,
  onSuccess,
  token,
  addNotification,
  basePath = "/attendance",
}) => {
  const [taskDescription, setTaskDescription] = useState("");
  const [workProgress, setWorkProgress] = useState("Planned");
  const [loading, setLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!taskDescription.trim()) {
      setModalMessage("Task description is required");
      return;
    }

    setLoading(true);
    setModalMessage(null);

    try {
      const res = await axiosInstance.post(
        `${basePath}/login`,
        { taskDescription, workProgress },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.message) {
        addNotification(res.data.message, "success");
        setModalMessage(res.data.message);
      } else {
        addNotification("Attendance submitted successfully", "success");
      }

      // Prefer res.data.attendance, but fallback gracefully
      const newAttendance = res.data?.attendance || res.data;
      if (newAttendance && newAttendance._id) {
        onSuccess(newAttendance);
      } else {
        onSuccess({
          status: "pending",
          taskDescription,
          workProgress,
          createdAt: new Date().toISOString(),
        });
      }

      setTaskDescription("");
      setWorkProgress("Planned");
    } catch (err) {
      console.error("Error submitting attendance:", err);
      const errorMsg = err?.response?.data?.message || "Error submitting attendance";
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
          <h4 className="text-lg font-semibold text-gray-800">Mark Attendance</h4>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Task Description *</label>
            <textarea
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              rows={4}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe what you'll be working on today..."
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Work Progress</label>
            <select
              value={workProgress}
              onChange={(e) => setWorkProgress(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Planned">Planned</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

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
  {loading ? "Submitting..." : "Submit Attendance"}
</button>

            {/* <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Submitting..." : "Submit Attendance"}
            </button> */}
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
