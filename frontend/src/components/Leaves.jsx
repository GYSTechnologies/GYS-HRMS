import React from 'react';
import { Calendar, CheckCircle, XCircle, Clock, Plus, Heart, Coffee, Award, AlertTriangle } from 'lucide-react';

const Leaves = () => {
  // CSS variables for colors
  const style = `
    :root {
      --primary-color: #104774;
      --primary-gradient: linear-gradient(to right, #104774, #0d3a61);
      --primary-hover: #0d3a61;
      --sun-color: #fbbf24;
    }
  `;

  // Mock data for demo - replace with your actual useAppContext
  const leaveApplications = [
    { dateRange: '2024-01-20 to 2024-01-22', type: 'Sick Leave', days: '3', status: 'Approved', approvedBy: 'John Manager' },
    { dateRange: '2024-01-15 to 2024-01-15', type: 'Casual Leave', days: '1', status: 'Pending', approvedBy: '--' },
    { dateRange: '2024-01-10 to 2024-01-12', type: 'Sick Leave', days: '3', status: 'Rejected', approvedBy: 'Jane Smith' },
    { dateRange: '2024-01-05 to 2024-01-07', type: 'Casual Leave', days: '3', status: 'Approved', approvedBy: 'John Manager' },
  ];

  const setShowLeaveModal = () => {
    console.log('Open leave modal');
  };

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Add style tag with CSS variables */}
      <style>{style}</style>
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Leave Management</h1>
        <button 
          onClick={() => setShowLeaveModal(true)}
          className="flex items-center bg-[#104774] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#0d3a61] transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          <Plus size={20} className="mr-2" />
          Apply For Leave
        </button>
      </div>

      {/* Leave Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gradient-to-r from-red-400 to-red-500 rounded-full mr-3"></div>
              <span className="text-sm font-medium text-gray-700">Sick Leave</span>
            </div>
            <Heart size={20} className="text-red-400" />
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-2">
            5 <span className="text-lg font-medium text-gray-500">left</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-red-400 to-red-500 h-2 rounded-full" style={{width: '50%'}}></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full mr-3"></div>
              <span className="text-sm font-medium text-gray-700">Casual Leave</span>
            </div>
            <Coffee size={20} className="text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-2">
            4 <span className="text-lg font-medium text-gray-500">left</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-purple-400 to-purple-500 h-2 rounded-full" style={{width: '40%'}}></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-500 rounded-full mr-3"></div>
              <span className="text-sm font-medium text-gray-700">Approved Leaves</span>
            </div>
            <CheckCircle size={20} className="text-green-400" />
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-2">
            12 <span className="text-lg font-medium text-gray-500">total</span>
          </div>
          <div className="flex items-center text-sm text-green-600">
            <Award size={16} className="mr-1" />
            <span>Well managed</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gradient-to-r from-red-400 to-red-500 rounded-full mr-3"></div>
              <span className="text-sm font-medium text-gray-700">Rejected Leave</span>
            </div>
            <AlertTriangle size={20} className="text-red-400" />
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-2">
            2 <span className="text-lg font-medium text-gray-500">total</span>
          </div>
          <div className="flex items-center text-sm text-red-600">
            <XCircle size={16} className="mr-1" />
            <span>Need attention</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Leave Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <div className="text-2xl font-bold text-[#104774] mb-1">23</div>
            <div className="text-sm text-gray-600">Total Leave Days</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <div className="text-2xl font-bold text-green-600 mb-1">9</div>
            <div className="text-sm text-gray-600">Remaining Days</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-xl">
            <div className="text-2xl font-bold text-orange-600 mb-1">14</div>
            <div className="text-sm text-gray-600">Days Used</div>
          </div>
        </div>
      </div>

      {/* Leave Application Status Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div className="flex items-center">
            <Calendar size={24} className="text-[#104774] mr-3" />
            <h3 className="text-lg font-semibold text-gray-800">Leave Application Status</h3>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <select className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#104774] focus:border-transparent bg-white">
              <option>Select Status</option>
              <option>Approved</option>
              <option>Pending</option>
              <option>Rejected</option>
            </select>
            <select className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#104774] focus:border-transparent bg-white">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 3 months</option>
              <option>This year</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#104774] text-white">
                <th className="p-4 text-left font-medium">Date Range</th>
                <th className="p-4 text-left font-medium">Type</th>
                <th className="p-4 text-left font-medium">Days</th>
                <th className="p-4 text-left font-medium">Status</th>
                <th className="p-4 text-left font-medium">Approved By</th>
              </tr>
            </thead>
            <tbody>
              {leaveApplications.map((row, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-800">{row.dateRange}</td>
                  <td className="p-4">
                    <div className="flex items-center">
                      {row.type === 'Sick Leave' ? (
                        <Heart size={16} className="text-red-400 mr-2" />
                      ) : (
                        <Coffee size={16} className="text-purple-400 mr-2" />
                      )}
                      <span className="text-gray-700">{row.type}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                      {row.days} {parseInt(row.days) === 1 ? 'day' : 'days'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      row.status === 'Approved' 
                        ? 'bg-green-100 text-green-700 border border-green-200' :
                      row.status === 'Pending' 
                        ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                        'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                      {row.status === 'Approved' && <CheckCircle size={12} className="mr-1" />}
                      {row.status === 'Pending' && <Clock size={12} className="mr-1" />}
                      {row.status === 'Rejected' && <XCircle size={12} className="mr-1" />}
                      {row.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">{row.approvedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaves;