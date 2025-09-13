import React, { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

const RegularizationModal = ({ isOpen, onClose, onSuccess, token, addNotification, employeeId }) => {
  const [date, setDate] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!date || !reason.trim()) {
      setModalMessage("Date and reason are required");
      return;
    }

    setLoading(true);
    setModalMessage(null);

    try {
      const res = await axiosInstance.post(
        "/attendance/regularization",
        {
          date,
          checkIn: checkIn || undefined,
          checkOut: checkOut || undefined,
          reason
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.message) {
        addNotification(res.data.message, "success");
        setModalMessage(res.data.message);
      } else {
        addNotification("Regularization request submitted", "success");
      }

      onSuccess();
      setDate("");
      setCheckIn("");
      setCheckOut("");
      setReason("");
    } catch (err) {
      console.error("Error submitting regularization:", err);
      const errorMsg = err?.response?.data?.message || "Error submitting regularization request";
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
          <h4 className="text-lg font-semibold text-gray-800">Request Regularization</h4>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              max={new Date().toISOString().split('T')[0]}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check-in Time
              </label>
              <input
                type="time"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check-out Time
              </label>
              <input
                type="time"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Regularization *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Explain why you need regularization for this date..."
            />
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
  {loading ? "Submitting..." : "Submit Request"}
</button>

            {/* <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Submitting..." : "Submit Request"}
            </button> */}
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegularizationModal;