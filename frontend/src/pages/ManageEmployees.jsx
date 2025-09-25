import React, { useState, useEffect } from "react";
import EmployeeForm from "../components/EmployeeForm/EmployeeForm";
import EmployeeDetails from "../components/EmployeeForm/EmployeeDetails";
import axiosInstance from "../utils/axiosInstance";

const ManageEmployees = () => {
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [viewingEmployeeId, setViewingEmployeeId] = useState(null);
  const [fetchingEmployee, setFetchingEmployee] = useState(false); // new

  const fetchEmployees = async () => {
    try {
      const res = await axiosInstance.get("/employee/all-employees");
      setEmployees(res.data.data || []);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleNewEmployee = () => {
    setSelectedEmployee(null);
    setShowEmployeeForm(true);
  };

  // UPDATED: fetch full employee record before opening form
  const handleEditEmployee = async (employee) => {
    if (!employee?._id) {
      // fallback if no id
      setSelectedEmployee(employee);
      setShowEmployeeForm(true);
      return;
    }

    setFetchingEmployee(true);
    try {
      // Replace the endpoint if your backend uses a different route for single employee
      const res = await axiosInstance.get(`/employee/${employee._id}`);
      // many APIs return data in res.data.data or res.data — handle both
      const fullEmployee = res.data?.data || res.data || employee;
      setSelectedEmployee(fullEmployee);
      setShowEmployeeForm(true);
    } catch (err) {
      console.warn(
        "Could not fetch full employee, opening with provided object:",
        err
      );
      // fallback: open with the object you already had (better than nothing)
      setSelectedEmployee(employee);
      setShowEmployeeForm(true);
    } finally {
      setFetchingEmployee(false);
    }
  };

  const handleCloseForm = () => {
    setShowEmployeeForm(false);
    setSelectedEmployee(null);
    fetchEmployees(); // Refresh the list
  };

  const handleViewDetails = (employee) => {
    setViewingEmployeeId(employee._id);
  };

  const handleCloseDetails = () => {
    setViewingEmployeeId(null);
  };

  return (
    <div className="min-h-[80vh] p-3 md:p-4 lg:p-6 bg-gray-50">
      {/* Header with New Employee Button */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 md:mb-6">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 text-center sm:text-left">
          Manage Employees
        </h2>
        <button
          onClick={handleNewEmployee}
          className="px-3 py-2 md:px-4 md:py-2.5 text-white font-semibold rounded-lg hover:opacity-90 transition shadow-md hover:shadow-lg w-full sm:w-auto text-xs sm:text-sm"
          style={{ backgroundColor: "#104774" }}
        >
          + New Employee
        </button>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Mobile View - Cards */}
        <div className="block md:hidden space-y-3 p-3">
          {employees.length > 0 ? (
            employees.map((emp, idx) => (
              <div
                key={emp._id}
                className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200"
              >
                {/* Header with ID and employee number */}
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold mr-2">
                      {idx + 1}
                    </span>
                    <span className="text-xs text-slate-500">Employee ID</span>
                  </div>
                  <p className="text-xs font-mono font-semibold bg-blue-50 px-2 py-1 rounded-md text-blue-700">
                    {emp.employeeId || "N/A"}
                  </p>
                </div>

                {/* Main employee info */}
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-slate-900 mb-1">
                    {emp.firstName} {emp.lastName}
                  </h3>

                  <div className="flex flex-wrap gap-1 mt-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {emp.department || "N/A"}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {emp.designation || "N/A"}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center text-xs text-slate-600">
                    <svg
                      className="w-3 h-3 mr-1 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="truncate">{emp.user?.email || "N/A"}</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditEmployee(emp)}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-white rounded-md hover:opacity-90 transition-all duration-200 shadow-sm"
                    style={{ backgroundColor: "#104774" }}
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => handleViewDetails(emp)}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium bg-slate-700 text-white rounded-md hover:bg-slate-800 transition-all duration-200 shadow-sm"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    View
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center p-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg border border-slate-200 shadow-sm">
              <div className="flex flex-col items-center justify-center">
                <div className="relative mb-3">
                  <svg
                    className="w-12 h-12 text-slate-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    ></path>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-slate-700 mb-1">
                  No employees found
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mb-3">
                  Get started by adding your first employee to the system
                </p>
                <button
                  className="px-3 py-1.5 text-xs font-medium text-white rounded-md shadow-sm hover:opacity-90 transition-all duration-200"
                  style={{ backgroundColor: "#104774" }}
                >
                  + New Employee
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Desktop View - Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse min-w-[600px]">
            <thead className="bg-[#104774] text-white">
              <tr>
                <th className="px-2 py-1.5 text-left text-xs font-semibold uppercase">
                  #
                </th>
                <th className="px-2 py-1.5 text-left text-xs font-semibold uppercase">
                  Employee ID
                </th>
                <th className="px-2 py-1.5 text-left text-xs font-semibold uppercase">
                  Name
                </th>
                <th className="px-2 py-1.5 text-left text-xs font-semibold uppercase">
                  Department
                </th>
                <th className="px-2 py-1.5 text-left text-xs font-semibold uppercase">
                  Designation
                </th>
                <th className="px-2 py-1.5 text-left text-xs font-semibold uppercase">
                  Email
                </th>
                <th className="px-2 py-1.5 text-center text-xs font-semibold uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {employees.length > 0 ? (
                employees.map((emp, idx) => (
                  <tr
                    key={emp._id}
                    className="hover:bg-slate-50 transition-colors duration-150 even:bg-slate-50/50"
                  >
                    <td className="px-2 py-1.5 font-medium text-slate-700 text-xs">
                      {idx + 1}
                    </td>
                    <td className="px-2 py-1.5 font-mono text-xs text-blue-700">
                      {emp.employeeId || "N/A"}
                    </td>
                    <td className="px-2 py-1.5 font-medium text-xs">
                      {emp.firstName} {emp.lastName}
                    </td>
                    <td className="px-2 py-1.5">
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {emp.department || "N/A"}
                      </span>
                    </td>
                    <td className="px-2 py-1.5 text-xs text-slate-600">
                      {emp.designation || "N/A"}
                    </td>
                    <td className="px-2 py-1.5 text-blue-600 text-xs">
                      {emp.user?.email || "N/A"}
                    </td>
                    <td className="px-2 py-1.5 flex justify-center gap-1">
                      <button
                        onClick={() => handleEditEmployee(emp)}
                        className="px-2 py-1 text-xs font-medium text-white rounded-md hover:opacity-90 transition shadow-sm"
                        style={{ backgroundColor: "#104774" }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleViewDetails(emp)}
                        className="px-2 py-1 text-xs font-medium bg-slate-600 text-white rounded-md hover:bg-slate-700 transition shadow-sm"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center p-4 text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <svg
                        className="w-12 h-12 text-slate-300 mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        ></path>
                      </svg>
                      <p className="text-sm font-medium">No employees found</p>
                      <p className="mt-1 text-xs">
                        Click "New Employee" to add your first employee
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee Details Modal */}
      {viewingEmployeeId && (
        <EmployeeDetails
          employeeId={viewingEmployeeId}
          onClose={handleCloseDetails}
        />
      )}

      {/* Employee Form Modal */}
      {showEmployeeForm && (
        <div className="fixed inset-0  bg-opacity-40 backdrop-blur-sm z-50 flex items-center justify-center p-3 md:p-4">
          {/* show loader while fetching full employee */}
          {fetchingEmployee ? (
            <div className="bg-white rounded-lg p-4 md:p-6 flex items-center justify-center max-w-xs w-full">
              <div className="animate-spin rounded-full h-5 w-5 md:h-6 md:w-6 border-b-2 border-[#104774] mr-2 md:mr-3" />
              <div className="text-xs md:text-sm">
                Loading employee details...
              </div>
            </div>
          ) : (
            <EmployeeForm
              onClose={handleCloseForm}
              employee={selectedEmployee}
              isEditMode={!!selectedEmployee}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ManageEmployees;
