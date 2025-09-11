// import React, { useState, useEffect } from "react";
// import EmployeeForm from "../components/EmployeeForm/EmployeeForm";
// import EmployeeDetails from "../components/EmployeeForm/EmployeeDetails"; // Make sure this import exists
// import axiosInstance from "../utils/axiosInstance";

// const ManageEmployees = () => {
//   const [showEmployeeForm, setShowEmployeeForm] = useState(false);
//   const [employees, setEmployees] = useState([]);
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [viewingEmployeeId, setViewingEmployeeId] = useState(null);

//   const fetchEmployees = async () => {
//     try {
//       const res = await axiosInstance.get("/employee/all-employees");
//       setEmployees(res.data.data || []);
//     } catch (err) {
//       console.error("Error fetching employees:", err);
//     }
//   };

//   useEffect(() => {
//     fetchEmployees();
//   }, []);

//   const handleNewEmployee = () => {
//     setSelectedEmployee(null);
//     setShowEmployeeForm(true);
//   };

//   const handleEditEmployee = (employee) => {
//     setSelectedEmployee(employee);
//     setShowEmployeeForm(true);
//   };

//   const handleCloseForm = () => {
//     setShowEmployeeForm(false);
//     fetchEmployees(); // Refresh the list
//   };

//   const handleViewDetails = (employee) => {
//     setViewingEmployeeId(employee._id); // Use the employee's own _id, not profileRef
//   };

//   const handleCloseDetails = () => {
//     setViewingEmployeeId(null);
//   };

//   return (
//     <div className="p-6">
//       {/* Header with New Employee Button */}
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-xl font-semibold">Manage Employees</h2>
//         <button
//           onClick={handleNewEmployee}
//           className="px-4 py-2 text-white rounded"
//           style={{ backgroundColor: "#104774" }}
//         >
//           New Employee
//         </button>
//       </div>

//       {/* Employees Table */}
//       <div className="overflow-x-auto shadow rounded-lg">
//         <table className="w-full border-collapse bg-white">
//           <thead>
//             <tr className="bg-gray-100 text-left">
//               <th className="p-3 border">#</th>
//               <th className="p-3 border">Employee ID</th>
//               <th className="p-3 border">Name</th>
//               <th className="p-3 border">Department</th>
//               <th className="p-3 border">Designation</th>
//               <th className="p-3 border">Email</th>
//               <th className="p-3 border text-center">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {employees.length > 0 ? (
//               employees.map((emp, idx) => (
//                 <tr key={emp._id} className="hover:bg-gray-50">
//                   <td className="p-3 border">{idx + 1}</td>
//                   <td className="p-3 border">{emp.employeeId || "N/A"}</td>
//                   <td className="p-3 border">
//                     {emp.firstName} {emp.lastName}
//                   </td>
//                   <td className="p-3 border">{emp.department}</td>
//                   <td className="p-3 border">{emp.designation}</td>
//                   <td className="p-3 border">{emp.user?.email}</td>
//                   <td className="p-3 border text-center">
//                     <button
//                       onClick={() => handleEditEmployee(emp)}
//                       className="px-3 py-1 text-sm text-white rounded mr-2"
//                       style={{ backgroundColor: "#104774" }}
//                     >
//                       Edit
//                     </button>
//                     <button
//                       onClick={() => handleViewDetails(emp)}
//                       className="px-3 py-1 text-sm bg-gray-600 text-white rounded"
//                     >
//                       View Details
//                     </button>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="7" className="text-center p-4">
//                   No employees found
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {viewingEmployeeId && (
//         <EmployeeDetails
//           employeeId={viewingEmployeeId}
//           onClose={handleCloseDetails}
//         />
//       )}

//       {/* Employee Form Modal with Blur Background */}
//       {showEmployeeForm && (
//         <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//           <EmployeeForm
//             onClose={handleCloseForm}
//             employee={selectedEmployee}
//             isEditMode={!!selectedEmployee}
//           />
//         </div>
//       )}
//     </div>
//   );
// };

// export default ManageEmployees;


import React, { useState, useEffect } from "react";
import EmployeeForm from "../components/EmployeeForm/EmployeeForm";
import EmployeeDetails from "../components/EmployeeForm/EmployeeDetails";
import axiosInstance from "../utils/axiosInstance";

const ManageEmployees = () => {
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [viewingEmployeeId, setViewingEmployeeId] = useState(null);

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

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeForm(true);
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
    <div className="p-6">
      {/* Header with New Employee Button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Manage Employees</h2>
        <button
          onClick={handleNewEmployee}
          className="px-4 py-2 text-white rounded"
          style={{ backgroundColor: "#104774" }}
        >
          New Employee
        </button>
      </div>

      {/* Employees Table */}
      <div className="overflow-x-auto shadow rounded-lg">
        <table className="w-full border-collapse bg-white">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3 border">#</th>
              <th className="p-3 border">Employee ID</th>
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Department</th>
              <th className="p-3 border">Designation</th>
              <th className="p-3 border">Email</th>
              <th className="p-3 border text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.length > 0 ? (
              employees.map((emp, idx) => (
                <tr key={emp._id} className="hover:bg-gray-50">
                  <td className="p-3 border">{idx + 1}</td>
                  <td className="p-3 border">{emp.employeeId || "N/A"}</td>
                  <td className="p-3 border">
                    {emp.firstName} {emp.lastName}
                  </td>
                  <td className="p-3 border">{emp.department}</td>
                  <td className="p-3 border">{emp.designation}</td>
                  <td className="p-3 border">{emp.user?.email}</td>
                  <td className="p-3 border text-center">
                    <button
                      onClick={() => handleEditEmployee(emp)}
                      className="px-3 py-1 text-sm text-white rounded mr-2"
                      style={{ backgroundColor: "#104774" }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleViewDetails(emp)}
                      className="px-3 py-1 text-sm bg-gray-600 text-white rounded"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center p-4">
                  No employees found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {viewingEmployeeId && (
        <EmployeeDetails
          employeeId={viewingEmployeeId}
          onClose={handleCloseDetails}
        />
      )}

      {/* Employee Form Modal with Blur Background */}
      {showEmployeeForm && (
        <div className="fixed inset-0  bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <EmployeeForm
            onClose={handleCloseForm}
            employee={selectedEmployee}
            isEditMode={!!selectedEmployee}
          />
        </div>
      )}
    </div>
  );
};

export default ManageEmployees;