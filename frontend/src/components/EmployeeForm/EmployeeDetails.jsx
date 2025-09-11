// import React, { useState, useEffect } from "react";
// import axiosInstance from "../../utils/axiosInstance";

// const EmployeeDetails = ({ employeeId, onClose }) => {
//   const [employee, setEmployee] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchEmployeeDetails = async () => {
//       try {
//         const res = await axiosInstance.get(`/employee/${employeeId}`);
//         setEmployee(res.data.data);
//       } catch (err) {
//         console.error("Error fetching employee details:", err);
//         alert("Error loading employee details");
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (employeeId) {
//       fetchEmployeeDetails();
//     }
//   }, [employeeId]);

//   if (loading) {
//     return (
//       <div className="fixed inset-0  bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//         <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-6">
//           <div className="flex justify-center items-center h-40">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#104774]"></div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (!employee) {
//     return (
//       <div className="fixed inset-0  bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//         <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-6">
//           <div className="text-center py-8">
//             <p className="text-red-500">Employee not found</p>
//             <button
//               onClick={onClose}
//               className="mt-4 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="fixed inset-0  bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//       <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
//         {/* Header */}
//         <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl flex justify-between items-center">
//           <h2 className="text-2xl font-bold text-gray-800">
//             Employee Details - {employee.firstName} {employee.lastName}
//           </h2>
//           <button
//             onClick={onClose}
//             className="text-gray-500 hover:text-gray-700 text-2xl"
//           >
//             ×
//           </button>
//         </div>

//         {/* Content */}
//         <div className="p-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {/* Personal Information */}
//             <div className="bg-gray-50 p-4 rounded-lg">
//               <h3 className="text-lg font-semibold mb-4 text-[#104774]">Personal Information</h3>
//               <div className="space-y-3">
//                 <div className="flex items-center">
//                   <span className="font-medium w-32">Employee ID:</span>
//                   <span className="text-gray-700">{employee.employeeId}</span>
//                 </div>
//                 <div className="flex items-center">
//                   <span className="font-medium w-32">Name:</span>
//                   <span className="text-gray-700">{employee.firstName} {employee.lastName}</span>
//                 </div>
//                 <div className="flex items-center">
//                   <span className="font-medium w-32">Email:</span>
//                   <span className="text-gray-700">{employee.user?.email}</span>
//                 </div>
//                 <div className="flex items-center">
//                   <span className="font-medium w-32">Phone:</span>
//                   <span className="text-gray-700">{employee.phone || "N/A"}</span>
//                 </div>
//                 <div className="flex items-center">
//                   <span className="font-medium w-32">Date of Birth:</span>
//                   <span className="text-gray-700">{employee.dob ? new Date(employee.dob).toLocaleDateString() : "N/A"}</span>
//                 </div>
//                 <div className="flex items-center">
//                   <span className="font-medium w-32">Gender:</span>
//                   <span className="text-gray-700 capitalize">{employee.gender || "N/A"}</span>
//                 </div>
//               </div>
//             </div>

//             {/* Job Information */}
//             <div className="bg-gray-50 p-4 rounded-lg">
//               <h3 className="text-lg font-semibold mb-4 text-[#104774]">Job Information</h3>
//               <div className="space-y-3">
//                 <div className="flex items-center">
//                   <span className="font-medium w-32">Department:</span>
//                   <span className="text-gray-700">{employee.department || "N/A"}</span>
//                 </div>
//                 <div className="flex items-center">
//                   <span className="font-medium w-32">Designation:</span>
//                   <span className="text-gray-700">{employee.designation || "N/A"}</span>
//                 </div>
//                 <div className="flex items-center">
//                   <span className="font-medium w-32">Date of Joining:</span>
//                   <span className="text-gray-700">{employee.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString() : "N/A"}</span>
//                 </div>
//                 <div className="flex items-center">
//                   <span className="font-medium w-32">Role:</span>
//                   <span className="text-gray-700 capitalize">{employee.user?.role || "N/A"}</span>
//                 </div>
//                 <div className="flex items-center">
//                   <span className="font-medium w-32">Status:</span>
//                   <span className={`px-2 py-1 rounded text-xs ${employee.user?.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
//                     {employee.user?.isActive ? "Active" : "Inactive"}
//                   </span>
//                 </div>
//               </div>
//             </div>

//             {/* Profile Image */}
//             {employee.avatarUrl && (
//               <div className="bg-gray-50 p-4 rounded-lg">
//                 <h3 className="text-lg font-semibold mb-4 text-[#104774]">Profile Photo</h3>
//                 <div className="flex justify-center">
//                   <img 
//                     src={employee.avatarUrl} 
//                     alt="Profile" 
//                     className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-md"
//                   />
//                 </div>
//               </div>
//             )}

//             {/* Documents */}
//             {employee.documents && employee.documents.length > 0 && (
//               <div className="bg-gray-50 p-4 rounded-lg">
//                 <h3 className="text-lg font-semibold mb-4 text-[#104774]">Documents</h3>
//                 <div className="space-y-2">
//                   {employee.documents.map((doc, index) => (
//                     <div key={index} className="flex items-center justify-between bg-white p-3 rounded border">
//                       <span className="text-sm text-gray-700 truncate">{doc.name}</span>
//                       <a 
//                         href={doc.url} 
//                         target="_blank" 
//                         rel="noopener noreferrer"
//                         className="text-[#104774] hover:text-[#104774] text-sm font-medium"
//                       >
//                         View
//                       </a>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Payroll Information */}
//             {employee.payrolls && employee.payrolls.length > 0 && (
//               <div className="col-span-1 md:col-span-2 bg-gray-50 p-4 rounded-lg">
//                 <h3 className="text-lg font-semibold mb-4 text-[#104774]">Payroll Information</h3>
//                 <div className="overflow-x-auto">
//                   <table className="w-full border-collapse">
//                     <thead>
//                       <tr className="bg-gray-100">
//                         <th className="p-2 border text-left">Month</th>
//                         <th className="p-2 border text-left">Basic Salary</th>
//                         <th className="p-2 border text-left">HRA</th>
//                         <th className="p-2 border text-left">Allowances</th>
//                         <th className="p-2 border text-left">Deductions</th>
//                         <th className="p-2 border text-left">Tax</th>
//                         <th className="p-2 border text-left">Net Pay</th>
//                         <th className="p-2 border text-left">Status</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {employee.payrolls.map((payroll, index) => (
//                         <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
//                           <td className="p-2 border">{payroll.month}</td>
//                           <td className="p-2 border">₹{payroll.basic?.toLocaleString()}</td>
//                           <td className="p-2 border">₹{payroll.hra?.toLocaleString()}</td>
//                           <td className="p-2 border">₹{payroll.allowances?.reduce((sum, item) => sum + (item.amount || 0), 0)?.toLocaleString()}</td>
//                           <td className="p-2 border">₹{payroll.deductions?.reduce((sum, item) => sum + (item.amount || 0), 0)?.toLocaleString()}</td>
//                           <td className="p-2 border">₹{payroll.tax?.toLocaleString()}</td>
//                           <td className="p-2 border font-semibold">₹{payroll.netPay?.toLocaleString()}</td>
//                           <td className="p-2 border">
//                             <span className={`px-2 py-1 rounded text-xs ${payroll.status === "approved" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
//                               {payroll.status}
//                             </span>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-xl text-right">
//           <button
//             onClick={onClose}
//             className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 mr-2"
//           >
//             Close
//           </button>
//           {/* <button
//             onClick={() => window.print()}
//             className="px-6 py-2 bg-[#104774] text-white rounded-lg hover:bg-[#104774]"
//           >
//             Print Details
//           </button> */}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EmployeeDetails;

import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";

const EmployeeDetails = ({ employeeId, onClose }) => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        const res = await axiosInstance.get(`/employee/${employeeId}`);
        setEmployee(res.data.data);
      } catch (err) {
        console.error("Error fetching employee details:", err);
        alert("Error loading employee details");
      } finally {
        setLoading(false);
      }
    };

    if (employeeId) {
      fetchEmployeeDetails();
    }
  }, [employeeId]);

  if (loading) {
    return (
      <div className="fixed inset-0  bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-6">
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#104774]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="fixed inset-0  bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-6">
          <div className="text-center py-8">
            <p className="text-red-500">Employee not found</p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0  bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Employee Details - {employee.firstName} {employee.lastName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-[#104774]">Personal Information</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="font-medium w-32">Employee ID:</span>
                  <span className="text-gray-700">{employee.employeeId}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium w-32">Name:</span>
                  <span className="text-gray-700">{employee.firstName} {employee.lastName}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium w-32">Email:</span>
                  <span className="text-gray-700">{employee.user?.email}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium w-32">Phone:</span>
                  <span className="text-gray-700">{employee.phone || "N/A"}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium w-32">Date of Birth:</span>
                  <span className="text-gray-700">{employee.dob ? new Date(employee.dob).toLocaleDateString() : "N/A"}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium w-32">Gender:</span>
                  <span className="text-gray-700 capitalize">{employee.gender || "N/A"}</span>
                </div>
                {/* NEW: Address Field */}
                <div className="flex items-start">
                  <span className="font-medium w-32">Address:</span>
                  <span className="text-gray-700 flex-1">{employee.address || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Job Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-[#104774]">Job Information</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="font-medium w-32">Department:</span>
                  <span className="text-gray-700">{employee.department || "N/A"}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium w-32">Designation:</span>
                  <span className="text-gray-700">{employee.designation || "N/A"}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium w-32">Date of Joining:</span>
                  <span className="text-gray-700">{employee.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString() : "N/A"}</span>
                </div>
                {/* NEW: Employment Type Field */}
                <div className="flex items-center">
                  <span className="font-medium w-32">Employment Type:</span>
                  <span className="text-gray-700 capitalize">
                    {employee.employmentType ? 
                      employee.employmentType.replace("-", " ") : "N/A"}
                  </span>
                </div>
                {/* NEW: Work Mode Field */}
                <div className="flex items-center">
                  <span className="font-medium w-32">Work Mode:</span>
                  <span className="text-gray-700 capitalize">
                    {employee.workMode ? 
                      employee.workMode.replace(/-/g, " ") : "N/A"}
                  </span>
                </div>
                {/* NEW: Shift Timing Field */}
                {employee.shiftTiming && (employee.shiftTiming.start || employee.shiftTiming.end) && (
                  <div className="flex items-center">
                    <span className="font-medium w-32">Shift Timing:</span>
                    <span className="text-gray-700">
                      {employee.shiftTiming.start && employee.shiftTiming.end 
                        ? `${employee.shiftTiming.start} - ${employee.shiftTiming.end}`
                        : "N/A"
                      }
                    </span>
                  </div>
                )}
                <div className="flex items-center">
                  <span className="font-medium w-32">Role:</span>
                  <span className="text-gray-700 capitalize">{employee.user?.role || "N/A"}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium w-32">Status:</span>
                  <span className={`px-2 py-1 rounded text-xs ${employee.user?.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {employee.user?.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Image */}
            {employee.avatarUrl && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-[#104774]">Profile Photo</h3>
                <div className="flex justify-center">
                  <img 
                    src={employee.avatarUrl} 
                    alt="Profile" 
                    className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-md"
                  />
                </div>
              </div>
            )}

            {/* Documents */}
            {employee.documents && employee.documents.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-[#104774]">Documents</h3>
                <div className="space-y-2">
                  {employee.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-3 rounded border">
                      <span className="text-sm text-gray-700 truncate">{doc.name}</span>
                      <a 
                        href={doc.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#104774] hover:text-[#104774] text-sm font-medium"
                      >
                        View
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payroll Information */}
            {employee.payrolls && employee.payrolls.length > 0 && (
              <div className="col-span-1 md:col-span-2 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-[#104774]">Payroll Information</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-2 border text-left">Month</th>
                        <th className="p-2 border text-left">Basic Salary</th>
                        <th className="p-2 border text-left">HRA</th>
                        <th className="p-2 border text-left">Allowances</th>
                        <th className="p-2 border text-left">Deductions</th>
                        <th className="p-2 border text-left">Tax</th>
                        <th className="p-2 border text-left">Net Pay</th>
                        <th className="p-2 border text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employee.payrolls.map((payroll, index) => (
                        <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="p-2 border">{payroll.month}</td>
                          <td className="p-2 border">₹{payroll.basic?.toLocaleString()}</td>
                          <td className="p-2 border">₹{payroll.hra?.toLocaleString()}</td>
                          <td className="p-2 border">₹{payroll.allowances?.reduce((sum, item) => sum + (item.amount || 0), 0)?.toLocaleString()}</td>
                          <td className="p-2 border">₹{payroll.deductions?.reduce((sum, item) => sum + (item.amount || 0), 0)?.toLocaleString()}</td>
                          <td className="p-2 border">₹{payroll.tax?.toLocaleString()}</td>
                          <td className="p-2 border font-semibold">₹{payroll.netPay?.toLocaleString()}</td>
                          <td className="p-2 border">
                            <span className={`px-2 py-1 rounded text-xs ${payroll.status === "approved" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                              {payroll.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-xl text-right">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 mr-2"
          >
            Close
          </button>
          {/* <button
            onClick={() => window.print()}
            className="px-6 py-2 bg-[#104774] text-white rounded-lg hover:bg-[#104774]"
          >
            Print Details
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetails;