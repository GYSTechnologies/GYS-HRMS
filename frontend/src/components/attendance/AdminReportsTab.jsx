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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Monthly Attendance Reports</h2>
        {/* <button
          onClick={exportReport}
          disabled={reports.length === 0}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Export Report
        </button> */}
      </div>

      {/* Report Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
          <select
            name="month"
            value={filters.month}
            onChange={handleFilterChange}
            className="w-full p-2 border border-gray-300 rounded-md"
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
          <select
            name="year"
            value={filters.year}
            onChange={handleFilterChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">All Years</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
          <select
            name="department"
            value={filters.department}
            onChange={handleFilterChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-end">
          <button
            onClick={generateReports}
            className="px-4 py-2 rounded-md text-white"
            style={{ backgroundColor: "#104774" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0d3a61")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#104774")}
          >
            {loading ? "Refresh..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Reports Summary */}
      {/* {reports.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500">Total Employees</h3>
            <p className="text-2xl font-bold">{reports.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500">Average Attendance</h3>
            <p className="text-2xl font-bold text-green-600">
              {Math.round(reports.reduce((sum, report) => sum + (report.attendancePercentage || 0), 0) / reports.length)}%
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500">Total Present Days</h3>
            <p className="text-2xl font-bold">
              {reports.reduce((sum, report) => sum + (report.present || 0), 0)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500">Total Absent Days</h3>
            <p className="text-2xl font-bold text-red-600">
              {reports.reduce((sum, report) => sum + (report.absent || 0), 0)}
            </p>
          </div>
        </div>
      )} */}

      {/* Reports Table */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-500 mt-2">Refresh...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500">No report data available</p>
          <p className="text-sm text-gray-400 mt-1">Try adjusting your filters and generate a report</p>
        </div>
      ) : (
   
        <div className="overflow-x-auto">
  <div className="max-h-[300px] overflow-y-auto border border-gray-200 rounded-xl shadow-sm">
    <table className="min-w-full divide-y divide-gray-200">
      {/* Header */}
      <thead className="bg-[#104774] text-white sticky top-0 z-10 rounded-t-lg">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Employee</th>
          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Employee ID</th>
          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Department</th>
          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Present</th>
          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Absent</th>
          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Pending</th>
          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Rejected</th>
          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Total Days</th>
          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Attendance %</th>
        </tr>
      </thead>

      {/* Body */}
      <tbody>
        {reports.map((report, index) => (
          <tr
            key={index}
            className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} transition`}
          >
            {/* Employee */}
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="font-medium text-gray-800">
                {report.employeeName || "N/A"}
              </div>
              <div className="text-sm text-gray-500">{report.employeeEmail || "N/A"}</div>
            </td>

            {/* Employee ID */}
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
              {report.employeeId || "N/A"}
            </td>

            {/* Department */}
            <td className="px-6 py-4 whitespace-nowrap">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                {report.department || "N/A"}
              </span>
            </td>

            {/* Present */}
            <td className="px-6 py-4 whitespace-nowrap text-green-600 font-semibold">
              {report.present || 0}
            </td>

            {/* Absent */}
            <td className="px-6 py-4 whitespace-nowrap text-red-600 font-semibold">
              {report.absent || 0}
            </td>

            {/* Pending */}
            <td className="px-6 py-4 whitespace-nowrap text-yellow-600 font-semibold">
              {report.pending || 0}
            </td>

            {/* Rejected */}
            <td className="px-6 py-4 whitespace-nowrap text-red-600 font-semibold">
              {report.rejected || 0}
            </td>

            {/* Total Days */}
            <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-700">
              {report.totalDays || 0}
            </td>

            {/* Attendance % */}
            <td className="px-6 py-4 whitespace-nowrap">
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  (report.attendancePercentage || 0) >= 90
                    ? "bg-green-100 text-green-800"
                    : (report.attendancePercentage || 0) >= 75
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {report.attendancePercentage ? Math.round(report.attendancePercentage) : 0}%
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {/* Footer text */}
  {/* <div className="mt-3 text-sm text-gray-500">
    Showing {reports.length} records
  </div> */}
</div>

      )}
    </div>
  );
};

export default AdminReportsTab;