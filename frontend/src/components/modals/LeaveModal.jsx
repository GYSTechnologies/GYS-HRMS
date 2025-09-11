import React from 'react';
import { useAppContext } from '../../context/AppContext';

const LeaveModal = () => {
  const { setShowLeaveModal } = useAppContext();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h3 className="font-semibold mb-2">LEAVE FORM</h3>
        <p className="text-sm text-gray-500 mb-4">20th Aug 2025</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Leave Type</label>
            <select className="w-full border rounded px-3 py-2">
              <option>Select leave type</option>
              <option>Sick Leave</option>
              <option>Casual Leave</option>
              <option>Earned Leave</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input type="date" className="w-full border rounded px-3 py-2" />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input type="date" className="w-full border rounded px-3 py-2" />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Total Days</label>
            <input type="text" className="w-full border rounded px-3 py-2" placeholder="Auto calculated" />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Reason</label>
            <textarea className="w-full border rounded px-3 py-2 h-20" placeholder="Enter reason for leave..."></textarea>
          </div>
        </div>
        
        <div className="flex space-x-3 mt-6">
          <button className="bg-blue-600 text-white px-6 py-2 rounded flex-1">Submit Request</button>
          <button 
            onClick={() => setShowLeaveModal(false)}
            className="border border-gray-300 px-6 py-2 rounded flex-1"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveModal;