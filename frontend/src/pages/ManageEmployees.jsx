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
      console.warn("Could not fetch full employee, opening with provided object:", err);
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
    <div className="p-6 bg-gray-50 min-h-[80vh]">
      {/* Header with New Employee Button */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Manage Employees</h2>
        <button
          onClick={handleNewEmployee}
          className="px-6 py-3 text-white font-semibold rounded-lg hover:opacity-90 transition shadow-md hover:shadow-lg"
          style={{ backgroundColor: "#104774" }}
        >
          + New Employee
        </button>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#104774] text-white">
                <th className="p-4 text-left font-semibold text-sm uppercase tracking-wider">#</th>
                <th className="p-4 text-left font-semibold text-sm uppercase tracking-wider">Employee ID</th>
                <th className="p-4 text-left font-semibold text-sm uppercase tracking-wider">Name</th>
                <th className="p-4 text-left font-semibold text-sm uppercase tracking-wider">Department</th>
                <th className="p-4 text-left font-semibold text-sm uppercase tracking-wider">Designation</th>
                <th className="p-4 text-left font-semibold text-sm uppercase tracking-wider">Email</th>
                <th className="p-4 text-center font-semibold text-sm uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {employees.length > 0 ? (
                employees.map((emp, idx) => (
                  <tr
                    key={emp._id}
                    className="hover:bg-blue-50 transition-colors duration-150 even:bg-gray-50"
                  >
                    <td className="p-4 font-medium text-gray-700">{idx + 1}</td>
                    <td className="p-4 font-mono text-sm text-blue-700">{emp.employeeId || "N/A"}</td>
                    <td className="p-4 font-medium">{emp.firstName} {emp.lastName}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {emp.department || "N/A"}
                      </span>
                    </td>
                    <td className="p-4">{emp.designation || "N/A"}</td>
                    <td className="p-4 text-blue-600">{emp.user?.email || "N/A"}</td>
                    <td className="p-4 flex justify-center space-x-2">
                      <button
                        onClick={() => handleEditEmployee(emp)}
                        className="px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition shadow-sm"
                        style={{ backgroundColor: "#104774" }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleViewDetails(emp)}
                        className="px-4 py-2 text-sm font-medium bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition shadow-sm"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center p-8 text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                      </svg>
                      <p className="text-xl">No employees found</p>
                      <p className="mt-2">Click "New Employee" to add your first employee</p>
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
        <div className="fixed inset-0 bg-opacity-40 backdrop-blur-sm z-50 flex items-center justify-center p-4 shadow-xl">
          {/* show loader while fetching full employee */}
          {fetchingEmployee ? (
            <div className="bg-white rounded-xl p-8 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#104774] mr-4" />
              <div>Loading employee details...</div>
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
