import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";

const AdminReportsTab = ({ token, addNotification }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    department: ""
  });
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchDepartments();
    generateReports();
  }, [filters]);

  const fetchDepartments = async () => {
    try {
      // Fetch departments from your API or use a static list
      const response = await axiosInstance.get("/attendance/departments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDepartments(response.data || []);
    } catch (error) {
      console.error("Error fetching departments:", error);
      // Fallback to common departments
      setDepartments(["HR", "IT", "Finance", "Operations", "Sales", "Marketing"]);
    }
  };

  const generateReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.month) params.append('month', filters.month);
      if (filters.year) params.append('year', filters.year);
      if (filters.department) params.append('department', filters.department);

      const response = await axiosInstance.get(`/attendance/reports/monthly?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setReports(response.data || []);
      // addNotification("Report generated successfully", "success");
    } catch (error) {
      console.error("Error generating reports:", error);
      addNotification(
        error.response?.data?.message || "Error generating reports", 
        "error"
      );
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const exportReport = () => {
    const headers = [
      "Employee Name", 
      "Employee ID", 
      "Department", 
      "Present", 
      "Absent", 
      "Pending", 
      "Rejected", 
      "Total Days", 
      "Attendance %"
    ];
    
    const csvData = reports.map(report => [
      `"${report.employeeName || 'N/A'}"`,
      `"${report.employeeId || 'N/A'}"`,
      `"${report.department || 'N/A'}"`,
      report.present || 0,
      report.absent || 0,
      report.pending || 0,
      report.rejected || 0,
      report.totalDays || 0,
      report.attendancePercentage || 0
    ]);

    const csvContent = [headers.join(","), ...csvData.map(row => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `attendance_report_${filters.month}_${filters.year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addNotification("Report exported successfully", "success");
  };

  // Get current year and previous years for dropdown
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

//   return (
//     <div>
//       <div className="flex items-center justify-between mb-6">
//         <h2 className="text-xl font-semibold">Monthly Attendance Reports</h2>
//         {/* <button
//           onClick={exportReport}
//           disabled={reports.length === 0}
//           className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           Export Report
//         </button> */}
//       </div>

//       {/* Report Filters */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
//           <select
//             name="month"
//             value={filters.month}
//             onChange={handleFilterChange}
//             className="w-full p-2 border border-gray-300 rounded-md"
//           >
//             <option value="">All Months</option>
//             {Array.from({ length: 12 }, (_, i) => (
//               <option key={i + 1} value={i + 1}>
//                 {new Date(2023, i).toLocaleString('default', { month: 'long' })}
//               </option>
//             ))}
//           </select>
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
//           <select
//             name="year"
//             value={filters.year}
//             onChange={handleFilterChange}
//             className="w-full p-2 border border-gray-300 rounded-md"
//           >
//             <option value="">All Years</option>
//             {years.map(year => (
//               <option key={year} value={year}>{year}</option>
//             ))}
//           </select>
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
//           <select
//             name="department"
//             value={filters.department}
//             onChange={handleFilterChange}
//             className="w-full p-2 border border-gray-300 rounded-md"
//           >
//             <option value="">All Departments</option>
//             {departments.map(dept => (
//               <option key={dept} value={dept}>{dept}</option>
//             ))}
//           </select>
//         </div>
        
//         <div className="flex items-end">
//           <button
//             onClick={generateReports}
//             className="px-4 py-2 rounded-md text-white"
//             style={{ backgroundColor: "#104774" }}
//             onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0d3a61")}
//             onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#104774")}
//           >
//             {loading ? "Refresh..." : "Refresh"}
//           </button>
//         </div>
//       </div>

//       {/* Reports Summary */}
//       {/* {reports.length > 0 && (
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//           <div className="bg-white p-4 rounded-lg shadow">
//             <h3 className="text-sm text-gray-500">Total Employees</h3>
//             <p className="text-2xl font-bold">{reports.length}</p>
//           </div>
//           <div className="bg-white p-4 rounded-lg shadow">
//             <h3 className="text-sm text-gray-500">Average Attendance</h3>
//             <p className="text-2xl font-bold text-green-600">
//               {Math.round(reports.reduce((sum, report) => sum + (report.attendancePercentage || 0), 0) / reports.length)}%
//             </p>
//           </div>
//           <div className="bg-white p-4 rounded-lg shadow">
//             <h3 className="text-sm text-gray-500">Total Present Days</h3>
//             <p className="text-2xl font-bold">
//               {reports.reduce((sum, report) => sum + (report.present || 0), 0)}
//             </p>
//           </div>
//           <div className="bg-white p-4 rounded-lg shadow">
//             <h3 className="text-sm text-gray-500">Total Absent Days</h3>
//             <p className="text-2xl font-bold text-red-600">
//               {reports.reduce((sum, report) => sum + (report.absent || 0), 0)}
//             </p>
//           </div>
//         </div>
//       )} */}

//       {/* Reports Table */}
//       {loading ? (
//         <div className="text-center py-8">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
//           <p className="text-gray-500 mt-2">Refresh...</p>
//         </div>
//       ) : reports.length === 0 ? (
//         <div className="text-center py-12 bg-gray-50 rounded-lg">
//           <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//           </svg>
//           <p className="text-gray-500">No report data available</p>
//           <p className="text-sm text-gray-400 mt-1">Try adjusting your filters and generate a report</p>
//         </div>
//       ) : (
   
//         <div className="overflow-x-auto">
//   <div className="max-h-[300px] overflow-y-auto border border-gray-200 rounded-xl shadow-sm">
//     <table className="min-w-full divide-y divide-gray-200">
//       {/* Header */}
//       <thead className="bg-[#104774] text-white sticky top-0 z-10 rounded-t-lg">
//         <tr>
//           <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Employee</th>
//           <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Employee ID</th>
//           <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Department</th>
//           <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Present</th>
//           <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Absent</th>
//           <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Pending</th>
//           <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Rejected</th>
//           <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Total Days</th>
//           <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Attendance %</th>
//         </tr>
//       </thead>

//       {/* Body */}
//       <tbody>
//         {reports.map((report, index) => (
//           <tr
//             key={index}
//             className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} transition`}
//           >
//             {/* Employee */}
//             <td className="px-6 py-4 whitespace-nowrap">
//               <div className="font-medium text-gray-800">
//                 {report.employeeName || "N/A"}
//               </div>
//               <div className="text-sm text-gray-500">{report.employeeEmail || "N/A"}</div>
//             </td>

//             {/* Employee ID */}
//             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
//               {report.employeeId || "N/A"}
//             </td>

//             {/* Department */}
//             <td className="px-6 py-4 whitespace-nowrap">
//               <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
//                 {report.department || "N/A"}
//               </span>
//             </td>

//             {/* Present */}
//             <td className="px-6 py-4 whitespace-nowrap text-green-600 font-semibold">
//               {report.present || 0}
//             </td>

//             {/* Absent */}
//             <td className="px-6 py-4 whitespace-nowrap text-red-600 font-semibold">
//               {report.absent || 0}
//             </td>

//             {/* Pending */}
//             <td className="px-6 py-4 whitespace-nowrap text-yellow-600 font-semibold">
//               {report.pending || 0}
//             </td>

//             {/* Rejected */}
//             <td className="px-6 py-4 whitespace-nowrap text-red-600 font-semibold">
//               {report.rejected || 0}
//             </td>

//             {/* Total Days */}
//             <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-700">
//               {report.totalDays || 0}
//             </td>

//             {/* Attendance % */}
//             <td className="px-6 py-4 whitespace-nowrap">
//               <span
//                 className={`px-2 py-1 rounded-full text-xs font-semibold ${
//                   (report.attendancePercentage || 0) >= 90
//                     ? "bg-green-100 text-green-800"
//                     : (report.attendancePercentage || 0) >= 75
//                     ? "bg-yellow-100 text-yellow-800"
//                     : "bg-red-100 text-red-800"
//                 }`}
//               >
//                 {report.attendancePercentage ? Math.round(report.attendancePercentage) : 0}%
//               </span>
//             </td>
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   </div>

//   {/* Footer text */}
//   {/* <div className="mt-3 text-sm text-gray-500">
//     Showing {reports.length} records
//   </div> */}
// </div>

//       )}
//     </div>
//   );
return(
  <div >
  {/* Header Section - Mobile Optimized */}
  <div className="flex flex-col mb-5 gap-3">
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Monthly Attendance Reports</h2>
      <p className="text-xs sm:text-sm text-gray-600 mt-1">Track and analyze employee attendance patterns</p>
    </div>
  </div>

  {/* Filters Section - Mobile Optimized */}
  <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 mb-5">
    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">Filter Reports</h3>
    <div className="grid grid-cols-1 gap-3">
      {/* Mobile: Single column, Desktop: 4 columns */}
      <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-4 md:gap-3">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Month</label>
          <select
            name="month"
            value={filters.month}
            onChange={handleFilterChange}
            className="w-full p-2 sm:p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Months</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(2023, i).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Year</label>
          <select
            name="year"
            value={filters.year}
            onChange={handleFilterChange}
            className="w-full p-2 sm:p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Years</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Department</label>
          <select
            name="department"
            value={filters.department}
            onChange={handleFilterChange}
            className="w-full p-2 sm:p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-end pt-1">
          <button
            onClick={generateReports}
            className="w-full px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg text-white font-medium text-sm sm:text-base transition-all duration-200 shadow-md"
            style={{ backgroundColor: "#104774" }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Refreshing...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1 sm:gap-2">
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Report
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  </div>

  {/* Loading State */}
  {loading ? (
    <div className="text-center py-8 sm:py-12 bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200">
      <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-500 mx-auto mb-3 sm:mb-4"></div>
      <p className="text-sm sm:text-gray-600 font-medium">Generating reports...</p>
      <p className="text-xs sm:text-sm text-gray-500 mt-1">Please wait while we process your data</p>
    </div>
  ) : reports.length === 0 ? (
    /* Empty State - Mobile Optimized */
    <div className="text-center py-10 sm:py-16 bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200">
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
        <svg className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">No report data available</h3>
      <p className="text-xs sm:text-gray-500 max-w-md mx-auto px-2">Try adjusting your filters or select a different date range to generate attendance reports.</p>
    </div>
  ) : (
    /* Reports Table - Mobile Optimized */
    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Mobile View - Cards with Better Spacing */}
      <div className="block lg:hidden space-y-3 p-3">
        {reports.map((report, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
            {/* Employee Info - Compact for Mobile */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm truncate">{report.employeeName || "N/A"}</h3>
                <p className="text-xs text-gray-500 truncate">{report.employeeEmail || "N/A"}</p>
                <div className="flex items-center gap-1 mt-1 flex-wrap">
                  <span className="text-xs text-gray-500">ID: {report.employeeId || "N/A"}</span>
                  <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                    {report.department || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Attendance Stats Grid - Better Mobile Layout */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="text-center p-1.5 bg-green-50 rounded">
                <p className="text-xs text-gray-500">Present</p>
                <p className="font-semibold text-green-600 text-sm">{report.present || 0}</p>
              </div>
              <div className="text-center p-1.5 bg-red-50 rounded">
                <p className="text-xs text-gray-500">Absent</p>
                <p className="font-semibold text-red-600 text-sm">{report.absent || 0}</p>
              </div>
              <div className="text-center p-1.5 bg-yellow-50 rounded">
                <p className="text-xs text-gray-500">Pending</p>
                <p className="font-semibold text-yellow-600 text-sm">{report.pending || 0}</p>
              </div>
              <div className="text-center p-1.5 bg-red-50 rounded">
                <p className="text-xs text-gray-500">Rejected</p>
                <p className="font-semibold text-red-600 text-sm">{report.rejected || 0}</p>
              </div>
            </div>

            {/* Total Days & Percentage */}
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-500">Total Days</p>
                <p className="font-semibold text-gray-800 text-sm">{report.totalDays || 0}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Attendance</p>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  (report.attendancePercentage || 0) >= 90
                    ? "bg-green-100 text-green-800"
                    : (report.attendancePercentage || 0) >= 75
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}>
                  {report.attendancePercentage ? Math.round(report.attendancePercentage) : 0}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View - Table */}
      <div className="hidden lg:block overflow-x-auto">
        <div className="max-h-[180px] overflow-y-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-[#104774] text-white sticky top-0">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider">Employee</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider">Employee ID</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider">Department</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider">Present</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider">Absent</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider">Pending</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider">Rejected</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider">Total Days</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider">Attendance %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reports.map((report, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 sm:px-6 py-3">
                    <div className="font-medium text-gray-900 text-sm">{report.employeeName || "N/A"}</div>
                    <div className="text-xs text-gray-500">{report.employeeEmail || "N/A"}</div>
                  </td>
                  <td className="px-4 sm:px-6 py-3 text-xs sm:text-sm text-gray-700">{report.employeeId || "N/A"}</td>
                  <td className="px-4 sm:px-6 py-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {report.department || "N/A"}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-3 text-green-600 font-semibold text-sm">{report.present || 0}</td>
                  <td className="px-4 sm:px-6 py-3 text-red-600 font-semibold text-sm">{report.absent || 0}</td>
                  <td className="px-4 sm:px-6 py-3 text-yellow-600 font-semibold text-sm">{report.pending || 0}</td>
                  <td className="px-4 sm:px-6 py-3 text-red-600 font-semibold text-sm">{report.rejected || 0}</td>
                  <td className="px-4 sm:px-6 py-3 font-semibold text-gray-700 text-sm">{report.totalDays || 0}</td>
                  <td className="px-4 sm:px-6 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      (report.attendancePercentage || 0) >= 90
                        ? "bg-green-100 text-green-800"
                        : (report.attendancePercentage || 0) >= 75
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {report.attendancePercentage ? Math.round(report.attendancePercentage) : 0}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results Count */}
      <div className="border-t border-gray-200 px-4 sm:px-6 py-2 bg-gray-50">
        <p className="text-xs sm:text-sm text-gray-600">
          Showing <span className="font-semibold">{reports.length}</span> employee records
        </p>
      </div>
    </div>
  )}
</div>
)
};

export default AdminReportsTab;