import React, { useState } from "react";

const BulkActionsModal = ({ isOpen, onClose, onApprove, onReject, selectedCount }) => {
  const [action, setAction] = useState("approve");
  const [remarks, setRemarks] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (action === "approve") {
      onApprove(Array.from({ length: selectedCount }, (_, i) => `record-${i}`));
    } else {
      if (!remarks.trim()) {
        alert("Please provide remarks for rejection");
        return;
      }
      onReject(Array.from({ length: selectedCount }, (_, i) => `record-${i}`), remarks);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Bulk Actions</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-3">
            You are about to perform an action on {selectedCount} selected records.
          </p>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="approve">Approve Selected</option>
              <option value="reject">Reject Selected</option>
            </select>
          </div>

          {action === "reject" && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Rejection *
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Provide reason for rejecting these records..."
                required
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className={`px-4 py-2 text-white rounded-md ${
              action === "approve" 
                ? "bg-green-600 hover:bg-green-700" 
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {action === "approve" ? "Approve All" : "Reject All"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkActionsModal;