//old color code 
// import React from 'react';
// import { DollarSign, Download, FileText, Calendar, TrendingUp, PiggyBank, CreditCard, Receipt } from 'lucide-react';

// const PayrollView = () => {
//   // Mock data for demo - replace with your actual useAppContext
//   const payrollHistory = [
//     { month: 'June 2025', netSalary: 'Rs. 27,500/-', payslip: 'Download' },
//     { month: 'May 2025', netSalary: 'Rs. 26,800/-', payslip: 'Download' },
//     { month: 'April 2025', netSalary: 'Rs. 27,200/-', payslip: 'Download' },
//     { month: 'March 2025', netSalary: 'Rs. 27,000/-', payslip: 'Download' },
//     { month: 'February 2025', netSalary: 'Rs. 26,500/-', payslip: 'Download' },
//   ];

//   const currentPayslip = {
//     month: 'July 2025',
//     basicSalary: 25000,
//     conveyance: 2000,
//     otherAllowance: 500,
//     totalEarnings: 27500,
//     deductions: 0,
//     netSalary: 27500
//   };

//   return (
//     <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-800">Payroll Management</h1>
//           <p className="text-gray-500 text-sm mt-1">Manage your salary and payslips</p>
//         </div>
//         <div className="flex items-center space-x-3">
//           <button className="flex items-center bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl transition-all duration-200 transform hover:scale-105">
//             <Download size={18} className="mr-2" />
//             Download Current Payslip
//           </button>
//         </div>
//       </div>

//       {/* Salary Overview Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
//           <div className="flex items-center justify-between mb-4">
//             <div className="flex items-center">
//               <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-500 rounded-xl flex items-center justify-center">
//                 <DollarSign size={24} className="text-white" />
//               </div>
//             </div>
//             <TrendingUp size={20} className="text-green-500" />
//           </div>
//           <div className="text-sm text-gray-500 mb-1">Current Month Salary</div>
//           <div className="text-2xl font-bold text-gray-800">₹27,500</div>
//           <div className="text-xs text-green-600 mt-2">+2.5% from last month</div>
//         </div>

//         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
//           <div className="flex items-center justify-between mb-4">
//             <div className="flex items-center">
//               <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl flex items-center justify-center">
//                 <PiggyBank size={24} className="text-white" />
//               </div>
//             </div>
//             <Calendar size={20} className="text-blue-500" />
//           </div>
//           <div className="text-sm text-gray-500 mb-1">Average Monthly</div>
//           <div className="text-2xl font-bold text-gray-800">₹27,000</div>
//           <div className="text-xs text-blue-600 mt-2">Last 6 months</div>
//         </div>

//         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
//           <div className="flex items-center justify-between mb-4">
//             <div className="flex items-center">
//               <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-500 rounded-xl flex items-center justify-center">
//                 <CreditCard size={24} className="text-white" />
//               </div>
//             </div>
//             <Receipt size={20} className="text-purple-500" />
//           </div>
//           <div className="text-sm text-gray-500 mb-1">YTD Earnings</div>
//           <div className="text-2xl font-bold text-gray-800">₹1,89,000</div>
//           <div className="text-xs text-purple-600 mt-2">Jan - July 2025</div>
//         </div>
//       </div>

//       {/* Main Content Grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
//         {/* Current Payslip */}
//         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//           <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
//             <div className="flex items-center justify-between">
//               <div>
//                 <h3 className="text-xl font-semibold">Current Payslip</h3>
//                 <p className="text-blue-100 text-sm mt-1">{currentPayslip.month}</p>
//               </div>
//               <FileText size={32} className="text-blue-200" />
//             </div>
//           </div>

//           <div className="p-6">
//             <div className="space-y-4">
//               <div className="flex justify-between items-center py-3 border-b border-gray-100">
//                 <span className="text-gray-600 flex items-center">
//                   <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
//                   Basic Salary
//                 </span>
//                 <span className="font-semibold text-gray-800">₹{currentPayslip.basicSalary.toLocaleString()}/-</span>
//               </div>
              
//               <div className="flex justify-between items-center py-3 border-b border-gray-100">
//                 <span className="text-gray-600 flex items-center">
//                   <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
//                   Conveyance
//                 </span>
//                 <span className="font-semibold text-gray-800">₹{currentPayslip.conveyance.toLocaleString()}/-</span>
//               </div>
              
//               <div className="flex justify-between items-center py-3 border-b border-gray-100">
//                 <span className="text-gray-600 flex items-center">
//                   <div className="w-2 h-2 bg-orange-400 rounded-full mr-3"></div>
//                   Other Allowance
//                 </span>
//                 <span className="font-semibold text-gray-800">₹{currentPayslip.otherAllowance.toLocaleString()}/-</span>
//               </div>
              
//               <div className="bg-gray-50 rounded-xl p-4 mt-6">
//                 <div className="flex justify-between items-center">
//                   <span className="text-lg font-semibold text-gray-800">Total Earnings</span>
//                   <span className="text-xl font-bold text-green-600">₹{currentPayslip.totalEarnings.toLocaleString()}/-</span>
//                 </div>
//               </div>
//             </div>
            
//             <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
//               <div className="text-sm text-gray-600 mb-1">Net Salary</div>
//               <div className="text-lg font-bold text-blue-600">₹{currentPayslip.netSalary.toLocaleString()}</div>
//               <div className="text-xs text-gray-500 mt-1">
//                 (Twenty seven thousand five hundred only)
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Payroll History */}
//         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//           <div className="p-6 border-b border-gray-100">
//             <div className="flex justify-between items-center">
//               <div className="flex items-center">
//                 <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-purple-500 rounded-lg flex items-center justify-center mr-3">
//                   <Calendar size={20} className="text-white" />
//                 </div>
//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-800">Payroll History</h3>
//                   <p className="text-sm text-gray-500">Previous months salary records</p>
//                 </div>
//               </div>
//               <select className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
//                 <option>Sort by: Months</option>
//                 <option>Last 6 months</option>
//                 <option>This year</option>
//                 <option>All time</option>
//               </select>
//             </div>
//           </div>
          
//           <div className="p-6">
//             <div className="space-y-4 max-h-96 overflow-y-auto">
//               {payrollHistory.map((row, index) => (
//                 <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
//                   <div className="flex items-center">
//                     <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-500 rounded-lg flex items-center justify-center mr-4">
//                       <FileText size={18} className="text-white" />
//                     </div>
//                     <div>
//                       <div className="font-semibold text-gray-800">{row.month}</div>
//                       <div className="text-sm text-gray-500">{row.netSalary}</div>
//                     </div>
//                   </div>
//                   <button className="flex items-center bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105">
//                     <Download size={16} className="mr-2" />
//                     {row.payslip}
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Salary Breakdown Chart */}
//       <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
//         <h3 className="text-lg font-semibold text-gray-800 mb-6">Salary Breakdown</h3>
        
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//           <div className="text-center">
//             <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
//               <span className="text-white font-bold">91%</span>
//             </div>
//             <div className="text-sm text-gray-500 mb-1">Basic Salary</div>
//             <div className="font-semibold text-gray-800">₹25,000</div>
//           </div>
          
//           <div className="text-center">
//             <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
//               <span className="text-white font-bold">7%</span>
//             </div>
//             <div className="text-sm text-gray-500 mb-1">Conveyance</div>
//             <div className="font-semibold text-gray-800">₹2,000</div>
//           </div>
          
//           <div className="text-center">
//             <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
//               <span className="text-white font-bold">2%</span>
//             </div>
//             <div className="text-sm text-gray-500 mb-1">Other Allowance</div>
//             <div className="font-semibold text-gray-800">₹500</div>
//           </div>
          
//           <div className="text-center">
//             <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
//               <span className="text-white font-bold">0%</span>
//             </div>
//             <div className="text-sm text-gray-500 mb-1">Deductions</div>
//             <div className="font-semibold text-gray-800">₹0</div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PayrollView;



//change color code

import React from 'react';
import { DollarSign, Download, FileText, Calendar, TrendingUp, PiggyBank, CreditCard, Receipt } from 'lucide-react';

const PayrollView = () => {
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
  const payrollHistory = [
    { month: 'June 2025', netSalary: 'Rs. 27,500/-', payslip: 'Download' },
    { month: 'May 2025', netSalary: 'Rs. 26,800/-', payslip: 'Download' },
    { month: 'April 2025', netSalary: 'Rs. 27,200/-', payslip: 'Download' },
    { month: 'March 2025', netSalary: 'Rs. 27,000/-', payslip: 'Download' },
    { month: 'February 2025', netSalary: 'Rs. 26,500/-', payslip: 'Download' },
  ];

  const currentPayslip = {
    month: 'July 2025',
    basicSalary: 25000,
    conveyance: 2000,
    otherAllowance: 500,
    totalEarnings: 27500,
    deductions: 0,
    netSalary: 27500
  };

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Add style tag with CSS variables */}
      <style>{style}</style>
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Payroll Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your salary and payslips</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl transition-all duration-200 transform hover:scale-105">
            <Download size={18} className="mr-2" />
            Download Current Payslip
          </button>
        </div>
      </div>

      {/* Salary Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-500 rounded-xl flex items-center justify-center">
                <DollarSign size={24} className="text-white" />
              </div>
            </div>
            <TrendingUp size={20} className="text-green-500" />
          </div>
          <div className="text-sm text-gray-500 mb-1">Current Month Salary</div>
          <div className="text-2xl font-bold text-gray-800">₹27,500</div>
          <div className="text-xs text-green-600 mt-2">+2.5% from last month</div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-[#104774] to-[#0d3a61] rounded-xl flex items-center justify-center">
                <PiggyBank size={24} className="text-white" />
              </div>
            </div>
            <Calendar size={20} className="text-[#104774]" />
          </div>
          <div className="text-sm text-gray-500 mb-1">Average Monthly</div>
          <div className="text-2xl font-bold text-gray-800">₹27,000</div>
          <div className="text-xs text-[#104774] mt-2">Last 6 months</div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-500 rounded-xl flex items-center justify-center">
                <CreditCard size={24} className="text-white" />
              </div>
            </div>
            <Receipt size={20} className="text-purple-500" />
          </div>
          <div className="text-sm text-gray-500 mb-1">YTD Earnings</div>
          <div className="text-2xl font-bold text-gray-800">₹1,89,000</div>
          <div className="text-xs text-purple-600 mt-2">Jan - July 2025</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Current Payslip */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-[#104774] p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">Current Payslip</h3>
                <p className="text-blue-100 text-sm mt-1">{currentPayslip.month}</p>
              </div>
              <FileText size={32} className="text-blue-200" />
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600 flex items-center">
                  <div className="w-2 h-2 bg-[#104774] rounded-full mr-3"></div>
                  Basic Salary
                </span>
                <span className="font-semibold text-gray-800">₹{currentPayslip.basicSalary.toLocaleString()}/-</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600 flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  Conveyance
                </span>
                <span className="font-semibold text-gray-800">₹{currentPayslip.conveyance.toLocaleString()}/-</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600 flex items-center">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mr-3"></div>
                  Other Allowance
                </span>
                <span className="font-semibold text-gray-800">₹{currentPayslip.otherAllowance.toLocaleString()}/-</span>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4 mt-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-800">Total Earnings</span>
                  <span className="text-xl font-bold text-green-600">₹{currentPayslip.totalEarnings.toLocaleString()}/-</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="text-sm text-gray-600 mb-1">Net Salary</div>
              <div className="text-lg font-bold text-[#104774]">₹{currentPayslip.netSalary.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-1">
                (Twenty seven thousand five hundred only)
              </div>
            </div>
          </div>
        </div>

        {/* Payroll History */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-[#104774] to-[#0d3a61] rounded-lg flex items-center justify-center mr-3">
                  <Calendar size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Payroll History</h3>
                  <p className="text-sm text-gray-500">Previous months salary records</p>
                </div>
              </div>
              <select className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#104774] focus:border-transparent bg-white">
                <option>Sort by: Months</option>
                <option>Last 6 months</option>
                <option>This year</option>
                <option>All time</option>
              </select>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {payrollHistory.map((row, index) => (
                <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#104774] to-[#0d3a61] rounded-lg flex items-center justify-center mr-4">
                      <FileText size={18} className="text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">{row.month}</div>
                      <div className="text-sm text-gray-500">{row.netSalary}</div>
                    </div>
                  </div>
                  <button className="flex items-center bg-[#104774] hover:bg-[#0d3a61] text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105">
                    <Download size={16} className="mr-2" />
                    {row.payslip}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Salary Breakdown Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Salary Breakdown</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-[#104774] to-[#0d3a61] rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold">91%</span>
            </div>
            <div className="text-sm text-gray-500 mb-1">Basic Salary</div>
            <div className="font-semibold text-gray-800">₹25,000</div>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold">7%</span>
            </div>
            <div className="text-sm text-gray-500 mb-1">Conveyance</div>
            <div className="font-semibold text-gray-800">₹2,000</div>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold">2%</span>
            </div>
            <div className="text-sm text-gray-500 mb-1">Other Allowance</div>
            <div className="font-semibold text-gray-800">₹500</div>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold">0%</span>
            </div>
            <div className="text-sm text-gray-500 mb-1">Deductions</div>
            <div className="font-semibold text-gray-800">₹0</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollView;
