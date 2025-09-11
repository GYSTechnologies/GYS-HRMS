// import React from 'react';
// import { Clock, TrendingUp, CalendarDays, Timer } from 'lucide-react';

// const AttendanceView = () => {
//   // Mock data for demo - replace with your actual useAppContext
//   const attendanceData = [
//     { date: '2024-01-15', logIn: '09:00 AM', status: 'Present', logOut: '06:00 PM', hours: '8h 30m' },
//     { date: '2024-01-14', logIn: '08:45 AM', status: 'Present', logOut: '05:45 PM', hours: '8h 15m' },
//     { date: '2024-01-13', logIn: '--', status: 'Holiday', logOut: '--', hours: '--' },
//     { date: '2024-01-12', logIn: '09:15 AM', status: 'Present', logOut: '06:15 PM', hours: '8h 45m' },
//     { date: '2024-01-11', logIn: '08:30 AM', status: 'Present', logOut: '05:30 PM', hours: '8h 00m' },
//   ];

//   return (
//     <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <h1 className="text-2xl font-bold text-gray-800">Attendance Overview</h1>
//         <div className="text-sm text-gray-500">
//           Today: {new Date().toLocaleDateString('en-US', { 
//             weekday: 'long', 
//             year: 'numeric', 
//             month: 'long', 
//             day: 'numeric' 
//           })}
//         </div>
//       </div>

//       {/* Time Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
//           <div className="flex items-center justify-between mb-4">
//             <div className="flex items-center">
//               <div className="w-3 h-3 bg-gradient-to-r from-red-400 to-red-500 rounded-full mr-3"></div>
//               <span className="text-sm font-medium text-gray-700">Today's Attendance</span>
//             </div>
//             <Clock size={20} className="text-red-400" />
//           </div>
//           <div className="space-y-2 mb-4">
//             <div className="flex justify-between text-sm">
//               <span className="text-gray-500">Log In:</span>
//               <span className="font-medium">8:35 AM</span>
//             </div>
//             <div className="flex justify-between text-sm">
//               <span className="text-gray-500">Log Out:</span>
//               <span className="text-orange-500 font-medium">Pending</span>
//             </div>
//           </div>
//           <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105">
//             Log Out
//           </button>
//         </div>

//         {/* <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
//           <div className="flex items-center justify-between mb-4">
//             <div className="flex items-center">
//               <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full mr-3"></div>
//               <span className="text-sm font-medium text-gray-700">Total Work Time</span>
//             </div>
//             <TrendingUp size={20} className="text-purple-400" />
//           </div>
//           <div className="text-3xl font-bold text-gray-800">
//             39<span className="text-lg font-medium text-gray-500">hrs</span> 54<span className="text-lg font-medium text-gray-500">min</span>
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
//           <div className="flex items-center justify-between mb-4">
//             <div className="flex items-center">
//               <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full mr-3"></div>
//               <span className="text-sm font-medium text-gray-700">Total Task Time</span>
//             </div>
//             <Timer size={20} className="text-orange-400" />
//           </div>
//           <div className="text-3xl font-bold text-gray-800">
//             05<span className="text-lg font-medium text-gray-500">hrs</span> 55<span className="text-lg font-medium text-gray-500">min</span>
//           </div>
//         </div> */}

//         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
//           <div className="flex items-center justify-between mb-4">
//             <div className="flex items-center">
//               <div className="w-3 h-3 bg-gradient-to-r from-red-400 to-red-500 rounded-full mr-3"></div>
//               <span className="text-sm font-medium text-gray-700">Total Leave</span>
//             </div>
//             <CalendarDays size={20} className="text-red-400" />
//           </div>
//           <div className="text-3xl font-bold text-gray-800">
//             03 <span className="text-lg font-medium text-gray-500">Days</span>
//           </div>
//         </div>
//       </div>

//       {/* Working Hours Chart */}
//       {/* <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
//         <h3 className="text-lg font-semibold text-gray-800 mb-6">Today's Work Distribution</h3>
        
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//           <div className="text-center p-4 bg-gray-50 rounded-xl">
//             <div className="text-sm text-gray-500 mb-1">Total Working Hours</div>
//             <div className="text-2xl font-bold text-gray-800">12h 36m</div>
//           </div>
//           <div className="text-center p-4 bg-gray-50 rounded-xl">
//             <div className="text-sm text-gray-500 mb-1">Productive Hours</div>
//             <div className="text-2xl font-bold text-green-600">08h 36m</div>
//           </div>
//           <div className="text-center p-4 bg-gray-50 rounded-xl">
//             <div className="text-sm text-gray-500 mb-1">Overtime</div>
//             <div className="text-2xl font-bold text-blue-600">02h 15m</div>
//           </div>
//         </div>
        
//         <div className="mb-6">
//           <div className="flex items-center justify-between mb-2">
//             <span className="text-sm font-medium text-gray-700">Work Timeline</span>
//             <div className="flex items-center space-x-4 text-xs">
//               <div className="flex items-center">
//                 <div className="w-3 h-3 bg-green-400 rounded mr-2"></div>
//                 <span>Productive</span>
//               </div>
//               <div className="flex items-center">
//                 <div className="w-3 h-3 bg-yellow-400 rounded mr-2"></div>
//                 <span>Break</span>
//               </div>
//               <div className="flex items-center">
//                 <div className="w-3 h-3 bg-blue-400 rounded mr-2"></div>
//                 <span>Overtime</span>
//               </div>
//             </div>
//           </div>
          
//           <div className="flex h-8 rounded-lg overflow-hidden bg-gray-100">
//             <div className="bg-gradient-to-r from-green-400 to-green-500 flex-1 transition-all duration-500"></div>
//             <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 w-16 transition-all duration-500"></div>
//             <div className="bg-gradient-to-r from-green-400 to-green-500 flex-1 transition-all duration-500"></div>
//             <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 w-12 transition-all duration-500"></div>
//             <div className="bg-gradient-to-r from-blue-400 to-blue-500 w-20 transition-all duration-500"></div>
//           </div>
//         </div>
        
//         <div className="flex justify-between text-xs text-gray-400 px-1">
//           <span>08:00</span>
//           <span>10:00</span>
//           <span>12:00</span>
//           <span>14:00</span>
//           <span>16:00</span>
//           <span>18:00</span>
//           <span>20:00</span>
//         </div>
//       </div> */}

//       {/* Daily Log Table */}
//       <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//         <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
//           <h3 className="text-lg font-semibold text-gray-800">Daily Log</h3>
//           <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
//             <select className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
//               <option>Select Status</option>
//               <option>Present</option>
//               <option>Absent</option>
//               <option>Holiday</option>
//             </select>
//             <select className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
//               <option>Last 7 days</option>
//               <option>Last 30 days</option>
//               <option>This month</option>
//             </select>
//           </div>
//         </div>
        
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead>
//               <tr className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
//                 <th className="p-4 text-left font-medium">Date</th>
//                 <th className="p-4 text-left font-medium">Log In</th>
//                 <th className="p-4 text-left font-medium">Status</th>
//                 <th className="p-4 text-left font-medium">Log Out</th>
//                 <th className="p-4 text-left font-medium">Production Hours</th>
//               </tr>
//             </thead>
//             <tbody>
//               {attendanceData.map((row, index) => (
//                 <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
//                   <td className="p-4 font-medium text-gray-800">{row.date}</td>
//                   <td className="p-4 text-gray-600">{row.logIn}</td>
//                   <td className="p-4">
//                     <span className={`px-3 py-1 rounded-full text-xs font-medium ${
//                       row.status === 'Present' 
//                         ? 'bg-green-100 text-green-700 border border-green-200' :
//                       row.status === 'Holiday' 
//                         ? 'bg-red-100 text-red-700 border border-red-200' :
//                         'bg-blue-100 text-blue-700 border border-blue-200'
//                     }`}>
//                       {row.status}
//                     </span>
//                   </td>
//                   <td className="p-4 text-gray-600">{row.logOut}</td>
//                   <td className="p-4 font-medium text-gray-800">{row.hours}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AttendanceView;



//color change
import React from 'react';
import { Clock, TrendingUp, CalendarDays, Timer } from 'lucide-react';

const AttendanceView = () => {
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
  const attendanceData = [
    { date: '2024-01-15', logIn: '09:00 AM', status: 'Present', logOut: '06:00 PM', hours: '8h 30m' },
    { date: '2024-01-14', logIn: '08:45 AM', status: 'Present', logOut: '05:45 PM', hours: '8h 15m' },
    { date: '2024-01-13', logIn: '--', status: 'Holiday', logOut: '--', hours: '--' },
    { date: '2024-01-12', logIn: '09:15 AM', status: 'Present', logOut: '06:15 PM', hours: '8h 45m' },
    { date: '2024-01-11', logIn: '08:30 AM', status: 'Present', logOut: '05:30 PM', hours: '8h 00m' },
  ];

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Add style tag with CSS variables */}
      <style>{style}</style>
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Attendance Overview</h1>
        <div className="text-sm text-gray-500">
          Today: {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Time Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gradient-to-r from-red-400 to-red-500 rounded-full mr-3"></div>
              <span className="text-sm font-medium text-gray-700">Today's Attendance</span>
            </div>
            <Clock size={20} className="text-red-400" />
          </div>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Log In:</span>
              <span className="font-medium">8:35 AM</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Log Out:</span>
              <span className="text-orange-500 font-medium">Pending</span>
            </div>
          </div>
          <button className="w-full bg-[#104774] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#0d3a61] transition-all duration-200 transform hover:scale-105">
            Log Out
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gradient-to-r from-red-400 to-red-500 rounded-full mr-3"></div>
              <span className="text-sm font-medium text-gray-700">Total Leave</span>
            </div>
            <CalendarDays size={20} className="text-red-400" />
          </div>
          <div className="text-3xl font-bold text-gray-800">
            03 <span className="text-lg font-medium text-gray-500">Days</span>
          </div>
        </div>
      </div>

      {/* Daily Log Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <h3 className="text-lg font-semibold text-gray-800">Daily Log</h3>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <select className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#104774] focus:border-transparent">
              <option>Select Status</option>
              <option>Present</option>
              <option>Absent</option>
              <option>Holiday</option>
            </select>
            <select className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#104774] focus:border-transparent">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>This month</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#104774] text-white">
                <th className="p-4 text-left font-medium">Date</th>
                <th className="p-4 text-left font-medium">Log In</th>
                <th className="p-4 text-left font-medium">Status</th>
                <th className="p-4 text-left font-medium">Log Out</th>
                <th className="p-4 text-left font-medium">Production Hours</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.map((row, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-800">{row.date}</td>
                  <td className="p-4 text-gray-600">{row.logIn}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      row.status === 'Present' 
                        ? 'bg-green-100 text-green-700 border border-green-200' :
                      row.status === 'Holiday' 
                        ? 'bg-red-100 text-red-700 border border-red-200' :
                        'bg-blue-100 text-blue-700 border border-blue-200'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">{row.logOut}</td>
                  <td className="p-4 font-medium text-gray-800">{row.hours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceView;