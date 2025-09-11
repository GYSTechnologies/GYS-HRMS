//old code with colors
// import React, { useState } from 'react';
// import { Clock, Calendar, CheckCircle, DollarSign } from 'lucide-react';

// const EmployeeDashboard = () => {
//   const [selectedMonth, setSelectedMonth] = useState('January');
//   const [selectedLeaveMonth, setSelectedLeaveMonth] = useState('January');

//   const monthData = {
//     January: { present: 20, absent: 1, leave: 2, holidays: 8, attendance: 95 },
//     February: { present: 18, absent: 2, leave: 1, holidays: 7, attendance: 90 },
//     March: { present: 22, absent: 0, leave: 1, holidays: 8, attendance: 96 }
//   };

//   const leaveData = {
//     January: { sick: 8, casual: 6, earned: 5, taken: 2 },
//     February: { sick: 7, casual: 6, earned: 5, taken: 3 },
//     March: { sick: 5, casual: 4, earned: 3, taken: 5 }
//   };

//   const currentMonthData = monthData[selectedMonth];
//   const currentLeaveData = leaveData[selectedLeaveMonth];

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
//       {/* Top 4 Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//         {/* Today's Attendance */}
//         <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200">
//           <div className="flex items-center mb-4">
//             <div className="w-12 h-12 bg-gradient-to-r from-red-100 to-red-200 rounded-xl flex items-center justify-center mr-4">
//               <Clock className="w-6 h-6 text-red-600" />
//             </div>
//             <h3 className="font-semibold text-slate-800 text-lg">Today's Attendance</h3>
//           </div>
          
//           <div className="mb-4">
//             <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium">
//               Present
//             </span>
//           </div>
          
//           <div className="space-y-2 mb-6">
//             <div className="text-sm text-slate-600">Log In: <span className="font-medium text-slate-900">9:45 AM</span></div>
//             <div className="text-sm text-slate-600">Log Out: <span className="font-medium text-slate-900">Pending</span></div>
//           </div>
          
//           <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg">
//             Log Out
//           </button>
//         </div>

//         {/* Leaves Summary */}
//         <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200">
//           <div className="flex items-center mb-4">
//             <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mr-4">
//               <Calendar className="w-6 h-6 text-purple-600" />
//             </div>
//             <h3 className="font-semibold text-slate-800 text-lg">Leaves Summary</h3>
//           </div>
          
//           <div className="space-y-2 mb-6">
//             <div className="text-sm text-slate-600">Remaining Leaves: <span className="font-medium text-slate-900">12</span></div>
//             <div className="text-sm text-slate-600">Sick: <span className="font-medium">5</span> | Casual: <span className="font-medium">4</span></div>
//             <div className="text-sm text-slate-600">Total Leaves: <span className="font-medium text-slate-900">15</span></div>
//           </div>
          
//           <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg">
//             Apply for Leave
//           </button>
//         </div>

//         {/* Daily Task Update */}
//         <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200">
//           <div className="flex items-center mb-4">
//             <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-green-200 rounded-xl flex items-center justify-center mr-4">
//               <CheckCircle className="w-6 h-6 text-green-600" />
//             </div>
//             <h3 className="font-semibold text-slate-800 text-lg">Daily Task Update</h3>
//           </div>
          
//           <div className="space-y-2 mb-6">
//             <div className="text-sm text-slate-600">Ongoing Tasks: <span className="font-medium text-slate-900">5</span></div>
//             <div className="text-sm text-slate-600">Pending: <span className="font-medium text-slate-900">2</span></div>
//             <div className="text-sm text-slate-600">Completed: <span className="font-medium text-slate-900">4</span></div>
//           </div>
          
//           <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg">
//             Update Today's Tasks
//           </button>
//         </div>

//         {/* Payslip Summary */}
//         <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200">
//           <div className="flex items-center justify-between mb-4">
//             <div className="flex items-center">
//               <div className="w-12 h-12 bg-gradient-to-r from-orange-100 to-orange-200 rounded-xl flex items-center justify-center mr-4">
//                 <DollarSign className="w-6 h-6 text-orange-600" />
//               </div>
//               <h3 className="font-semibold text-slate-800 text-lg">Payslip Summary</h3>
//             </div>
//             <span className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-xs font-medium">Released</span>
//           </div>
          
//           <div className="text-sm text-slate-600 mb-6">
//             Last Month Salary: <span className="font-bold text-slate-900 text-lg">$35,000</span>
//           </div>
          
//           <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg">
//             Download Payslip
//           </button>
//         </div>
//       </div>

//       {/* Bottom 2 Cards */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//         {/* Attendance */}
//         <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200">
//           <div className="flex items-center justify-between mb-8">
//             <h3 className="text-2xl font-semibold text-slate-800">Attendance</h3>
//             <select 
//               value={selectedMonth}
//               onChange={(e) => setSelectedMonth(e.target.value)}
//               className="border-2 border-slate-300 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
//             >
//               <option value="January">January</option>
//               <option value="February">February</option>
//               <option value="March">March</option>
//             </select>
//           </div>
          
//           <div className="grid grid-cols-2 gap-6 mb-8">
//             <div className="text-center p-6 bg-green-50 rounded-2xl border border-green-100">
//               <div className="text-4xl font-bold text-green-600 mb-2">{currentMonthData.present}</div>
//               <div className="text-sm text-slate-600 font-medium">Present days</div>
//             </div>
//             <div className="text-center p-6 bg-red-50 rounded-2xl border border-red-100">
//               <div className="text-4xl font-bold text-red-600 mb-2">{currentMonthData.absent}</div>
//               <div className="text-sm text-slate-600 font-medium">Absent days</div>
//             </div>
//             <div className="text-center p-6 bg-blue-50 rounded-2xl border border-blue-100">
//               <div className="text-4xl font-bold text-blue-600 mb-2">{currentMonthData.leave}</div>
//               <div className="text-sm text-slate-600 font-medium">On leave days</div>
//             </div>
//             <div className="text-center p-6 bg-purple-50 rounded-2xl border border-purple-100">
//               <div className="text-4xl font-bold text-purple-600 mb-2">{currentMonthData.holidays}</div>
//               <div className="text-sm text-slate-600 font-medium">Holidays</div>
//             </div>
//           </div>
          
          // <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-2xl text-center text-lg font-semibold shadow-lg">
          //   Attendance: {currentMonthData.attendance}%
          // </div>
//         </div>

//         {/* Leave Balance */}
//         <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100">
//           <div className="flex items-center justify-between mb-8">
//             <h3 className="text-2xl font-semibold text-slate-800">Leave Balance</h3>
//             <select 
//               value={selectedLeaveMonth}
//               onChange={(e) => setSelectedLeaveMonth(e.target.value)}
//               className="border-2 border-slate-300 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
//             >
//               <option value="January">January</option>
//               <option value="February">February</option>
//               <option value="March">March</option>
//             </select>
//           </div>
          
//           <div className="grid grid-cols-2 gap-6 mb-8">
//             <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
//               <div className="text-4xl font-bold text-blue-600 mb-2">{currentLeaveData.sick}</div>
//               <div className="text-sm text-slate-600 mb-1 font-medium">left</div>
//               <div className="text-xs text-slate-500 font-medium">Sick Leave</div>
//             </div>
//             <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
//               <div className="text-4xl font-bold text-green-600 mb-2">{currentLeaveData.casual}</div>
//               <div className="text-sm text-slate-600 mb-1 font-medium">left</div>
//               <div className="text-xs text-slate-500 font-medium">Casual Leave</div>
//             </div>
//             <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
//               <div className="text-4xl font-bold text-purple-600 mb-2">{currentLeaveData.earned}</div>
//               <div className="text-sm text-slate-600 mb-1 font-medium">left</div>
//               <div className="text-xs text-slate-500 font-medium">Earned Leave</div>
//             </div>
//             <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
//               <div className="text-4xl font-bold text-orange-600 mb-2">{currentLeaveData.taken}</div>
//               <div className="text-sm text-slate-600 mb-1 font-medium">taken</div>
//               <div className="text-xs text-slate-500 font-medium">Leaves Taken</div>
//             </div>
//           </div>
          
//           <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 px-6 rounded-2xl text-lg font-semibold transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl">
//             Apply for Leave
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EmployeeDashboard;


//new code colors
import React, { useState } from 'react';
import { Clock, Calendar, CheckCircle, DollarSign } from 'lucide-react';

const EmployeeDashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState('January');
  const [selectedLeaveMonth, setSelectedLeaveMonth] = useState('January');

  const monthData = {
    January: { present: 20, absent: 1, leave: 2, holidays: 8, attendance: 95 },
    February: { present: 18, absent: 2, leave: 1, holidays: 7, attendance: 90 },
    March: { present: 22, absent: 0, leave: 1, holidays: 8, attendance: 96 }
  };

  const leaveData = {
    January: { sick: 8, casual: 6, earned: 5, taken: 2 },
    February: { sick: 7, casual: 6, earned: 5, taken: 3 },
    March: { sick: 5, casual: 4, earned: 3, taken: 5 }
  };

  const currentMonthData = monthData[selectedMonth];
  const currentLeaveData = leaveData[selectedLeaveMonth];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      {/* Top 4 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Today's Attendance */}
        <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-red-100 to-red-200 rounded-xl flex items-center justify-center mr-4">
              <Clock className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="font-semibold text-slate-800 text-lg">Today's Attendance</h3>
          </div>
          
          <div className="mb-4">
            <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium">
              Present
            </span>
          </div>
          
          <div className="space-y-2 mb-6">
            <div className="text-sm text-slate-600">Log In: <span className="font-medium text-slate-900">9:45 AM</span></div>
            <div className="text-sm text-slate-600">Log Out: <span className="font-medium text-slate-900">Pending</span></div>
          </div>
          
          <button className="w-full bg-[#104774] hover:bg-[#0d3a61] text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg">
            Log Out
          </button>
        </div>

        {/* Leaves Summary */}
        <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mr-4">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-slate-800 text-lg">Leaves Summary</h3>
          </div>
          
          <div className="space-y-2 mb-6">
            <div className="text-sm text-slate-600">Remaining Leaves: <span className="font-medium text-slate-900">12</span></div>
            <div className="text-sm text-slate-600">Sick: <span className="font-medium">5</span> | Casual: <span className="font-medium">4</span></div>
            <div className="text-sm text-slate-600">Total Leaves: <span className="font-medium text-slate-900">15</span></div>
          </div>
          
          <button className="w-full bg-[#104774] hover:bg-[#0d3a61] text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg">
            Apply for Leave
          </button>
        </div>

        {/* Daily Task Update */}
        <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-green-200 rounded-xl flex items-center justify-center mr-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-slate-800 text-lg">Daily Task Update</h3>
          </div>
          
          <div className="space-y-2 mb-6">
            <div className="text-sm text-slate-600">Ongoing Tasks: <span className="font-medium text-slate-900">5</span></div>
            <div className="text-sm text-slate-600">Pending: <span className="font-medium text-slate-900">2</span></div>
            <div className="text-sm text-slate-600">Completed: <span className="font-medium text-slate-900">4</span></div>
          </div>
          
          <button className="w-full bg-[#104774] hover:bg-[#0d3a61] text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg">
            Update Today's Tasks
          </button>
        </div>

        {/* Payslip Summary */}
        <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-100 to-orange-200 rounded-xl flex items-center justify-center mr-4">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-slate-800 text-lg">Payslip Summary</h3>
            </div>
            {/* <span className="bg-[#104774] bg-opacity-10 text-[#104774] px-3 py-1.5 rounded-full text-xs font-medium">Released</span> */}
          </div>
          
          <div className="text-sm text-slate-600 mb-6">
            Last Month Salary: <span className="font-bold text-slate-900 text-lg">$35,000</span>
          </div>
          
          <button className="w-full bg-[#104774] hover:bg-[#0d3a61] text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg">
            Download Payslip
          </button>
        </div>
      </div>

      {/* Bottom 2 Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Attendance */}
        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-semibold text-slate-800">Attendance</h3>
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border-2 border-slate-300 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-[#104774] focus:border-[#104774] transition-all duration-200"
            >
              <option value="January">January</option>
              <option value="February">February</option>
              <option value="March">March</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="text-center p-6 bg-green-50 rounded-2xl border border-green-100">
              <div className="text-4xl font-bold text-green-600 mb-2">{currentMonthData.present}</div>
              <div className="text-sm text-slate-600 font-medium">Present days</div>
            </div>
            <div className="text-center p-6 bg-red-50 rounded-2xl border border-red-100">
              <div className="text-4xl font-bold text-red-600 mb-2">{currentMonthData.absent}</div>
              <div className="text-sm text-slate-600 font-medium">Absent days</div>
            </div>
            <div className="text-center p-6 bg-blue-50 rounded-2xl border border-blue-100">
              <div className="text-4xl font-bold text-[#104774] mb-2">{currentMonthData.leave}</div>
              <div className="text-sm text-slate-600 font-medium">On leave days</div>
            </div>
            <div className="text-center p-6 bg-purple-50 rounded-2xl border border-purple-100">
              <div className="text-4xl font-bold text-purple-600 mb-2">{currentMonthData.holidays}</div>
              <div className="text-sm text-slate-600 font-medium">Holidays</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-[#104774] to-[#0d3a61] text-white px-8 py-4 rounded-2xl text-center text-lg font-semibold shadow-lg">
            Attendance: {currentMonthData.attendance}%
          </div>
        </div>

        {/* Leave Balance */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-semibold text-slate-800">Leave Balance</h3>
            <select 
              value={selectedLeaveMonth}
              onChange={(e) => setSelectedLeaveMonth(e.target.value)}
              className="border-2 border-slate-300 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-[#104774] focus:border-[#104774] transition-all duration-200"
            >
              <option value="January">January</option>
              <option value="February">February</option>
              <option value="March">March</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
              <div className="text-4xl font-bold text-[#104774] mb-2">{currentLeaveData.sick}</div>
              <div className="text-sm text-slate-600 mb-1 font-medium">left</div>
              <div className="text-xs text-slate-500 font-medium">Sick Leave</div>
            </div>
            <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
              <div className="text-4xl font-bold text-green-600 mb-2">{currentLeaveData.casual}</div>
              <div className="text-sm text-slate-600 mb-1 font-medium">left</div>
              <div className="text-xs text-slate-500 font-medium">Casual Leave</div>
            </div>
            <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
              <div className="text-4xl font-bold text-purple-600 mb-2">{currentLeaveData.earned}</div>
              <div className="text-sm text-slate-600 mb-1 font-medium">left</div>
              <div className="text-xs text-slate-500 font-medium">Earned Leave</div>
            </div>
            <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
              <div className="text-4xl font-bold text-orange-600 mb-2">{currentLeaveData.taken}</div>
              <div className="text-sm text-slate-600 mb-1 font-medium">taken</div>
              <div className="text-xs text-slate-500 font-medium">Leaves Taken</div>
            </div>
          </div>
          
          <button className="w-full bg-gradient-to-r from-[#104774] to-[#0d3a61] hover:from-[#0d3a61] hover:to-[#104774] text-white py-4 px-6 rounded-2xl text-lg font-semibold transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl">
            Apply for Leave
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;