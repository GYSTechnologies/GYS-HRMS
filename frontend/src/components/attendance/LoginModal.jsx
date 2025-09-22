import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";

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
  const [earlyLoginReason, setEarlyLoginReason] = useState("");
  const [lateLoginReason, setLateLoginReason] = useState("");
  const [isEarlyLogin, setIsEarlyLogin] = useState(false);
  const [isLateLogin, setIsLateLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState(null);
  const [shiftTiming, setShiftTiming] = useState(null);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTaskDescription("");
      setWorkProgress("Planned");
      setEarlyLoginReason("");
      setLateLoginReason("");
      setIsEarlyLogin(false);
      setIsLateLogin(false);
      setModalMessage(null);
    }
  }, [isOpen]);

  // Fetch employee shift timing when modal opens
  useEffect(() => {
    if (isOpen && token) {
      fetchShiftTiming();
    }
  }, [isOpen, token]);

  const fetchShiftTiming = async () => {
    try {
      const response = await axiosInstance.get("/profile/my-profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data?.shiftTiming) {
        setShiftTiming(response.data.shiftTiming);
        checkLoginType(response.data.shiftTiming);
      }
    } catch (error) {
      console.error("Error fetching shift timing:", error);
      addNotification("Error fetching shift information", "error");
    }
  };

  const checkLoginType = (timing) => {
    if (!timing?.start) return;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    // Parse shift start time (format: "hh:mm AM/PM")
    const [time, modifier] = timing.start.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    
    let shiftStartMinutes = hours * 60 + minutes;
    if (modifier === 'PM' && hours !== 12) shiftStartMinutes += 720;
    if (modifier === 'AM' && hours === 12) shiftStartMinutes -= 720;
    
    // Auto-detect and pre-check the appropriate checkbox
    if (currentTime < shiftStartMinutes) {
      setIsEarlyLogin(true);
      setModalMessage(`You are logging in before your shift start time (${timing.start}). Please provide a reason for early login.`);
    } else if (currentTime > shiftStartMinutes + 60) {
      setIsLateLogin(true);
      setModalMessage(`You are logging in after 1 hour from your shift start time (${timing.start}). Please provide a reason for late login.`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!taskDescription.trim()) {
      setModalMessage("Task description is required");
      return;
    }

    if (isEarlyLogin && !earlyLoginReason.trim()) {
      setModalMessage("Early login reason is required");
      return;
    }

    if (isLateLogin && !lateLoginReason.trim()) {
      setModalMessage("Late login reason is required");
      return;
    }

    setLoading(true);
    setModalMessage(null);

    try {
      const payload = {
        taskDescription,
        workProgress,
        ...(isEarlyLogin && { earlyLoginReason }),
        ...(isLateLogin && { lateLoginReason })
      };

      const res = await axiosInstance.post(
        `${basePath}/login`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.message) {
        addNotification(res.data.message, "success");
      }

      const newAttendance = res.data?.attendance || res.data;
      if (newAttendance) {
        onSuccess(newAttendance);
      }

      onClose();
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

        {shiftTiming && (
          <div className="mb-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">
              Your shift timing: <strong>{shiftTiming.start} - {shiftTiming.end}</strong>
            </p>
          </div>
        )}

        {modalMessage && (
          <div className={`mb-4 p-3 rounded text-sm ${
            modalMessage.includes("Error") || modalMessage.includes("required")
              ? "bg-red-50 text-red-800 border border-red-100"
              : "bg-blue-50 text-blue-800 border border-blue-100"
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

          <div className="mb-4">
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

          {/* Early Login Checkbox */}
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isEarlyLogin}
                onChange={(e) => {
                  setIsEarlyLogin(e.target.checked);
                  if (e.target.checked) setIsLateLogin(false);
                }}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Logging in early</span>
            </label>
          </div>

          {isEarlyLogin && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason for early login *</label>
              <textarea
                value={earlyLoginReason}
                onChange={(e) => setEarlyLoginReason(e.target.value)}
                rows={3}
                required={isEarlyLogin}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Please provide reason for logging in early..."
              />
            </div>
          )}

          {/* Late Login Checkbox */}
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isLateLogin}
                onChange={(e) => {
                  setIsLateLogin(e.target.checked);
                  if (e.target.checked) setIsEarlyLogin(false);
                }}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Logging in late</span>
            </label>
          </div>

          {isLateLogin && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason for late login *</label>
              <textarea
                value={lateLoginReason}
                onChange={(e) => setLateLoginReason(e.target.value)}
                rows={3}
                required={isLateLogin}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Please provide reason for logging in late..."
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
              {loading ? "Submitting..." : "Submit Attendance"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;