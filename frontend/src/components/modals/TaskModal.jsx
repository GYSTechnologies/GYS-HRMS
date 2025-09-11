import React from 'react';
import { useAppContext } from '../../context/AppContext';

const TaskModal = () => {
  const { setShowTaskModal } = useAppContext();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h3 className="font-semibold mb-2">DAILY TASK UPDATE</h3>
        <p className="text-sm text-gray-500 mb-4">20th Aug 2025, 09:30 AM</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Type of Update</label>
            <select className="w-full border rounded px-3 py-2">
              <option>Select type</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Describe your key tasks for today...</label>
            <textarea className="w-full border rounded px-3 py-2 h-20" placeholder="Enter your tasks..."></textarea>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Work Progress</label>
            <select className="w-full border rounded px-3 py-2">
              <option>Select progress</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Attachments</label>
            <button className="w-full border-2 border-dashed rounded px-3 py-2 text-gray-500 hover:bg-gray-50">
              📎 Choose files
            </button>
          </div>
        </div>
        
        <div className="flex space-x-3 mt-6">
          <button className="bg-blue-600 text-white px-6 py-2 rounded flex-1">Save Updates</button>
          <button 
            onClick={() => setShowTaskModal(false)}
            className="border border-gray-300 px-6 py-2 rounded flex-1"
          >
            View History
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;