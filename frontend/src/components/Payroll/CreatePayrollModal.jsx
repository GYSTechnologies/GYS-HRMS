// import React, { useState, useEffect } from "react";
// import axiosInstance from "../../utils/axiosInstance";

// const PRIMARY = "#104774";
// const PRIMARY_HOVER = "#0d3a61";

// const CreatePayrollModal = ({ isOpen, onClose, onCreate, employees, token, addNotification }) => {
//   const [loading, setLoading] = useState(false);
//   const [formData, setFormData] = useState({
//     employeeId: "",
//     month: new Date().getMonth() + 1,
//     year: new Date().getFullYear(),
//     basic: 0,
//     hra: 0,
//     allowances: [],
//     deductions: [],
//     tax: 0
//   });
//   const [currentAllowance, setCurrentAllowance] = useState({ title: "", amount: 0 });
//   const [currentDeduction, setCurrentDeduction] = useState({ title: "", amount: 0 });

//   useEffect(() => {
//     if (formData.basic > 0 && formData.hra === 0) {
//       // Auto-calculate HRA as 40% of basic
//       setFormData(prev => ({
//         ...prev,
//         hra: Math.round(prev.basic * 0.4)
//       }));
//     }
//   }, [formData.basic]);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: name === 'basic' || name === 'hra' || name === 'tax' ? Number(value) : value
//     }));
//   };

//   const addAllowance = () => {
//     if (currentAllowance.title && currentAllowance.amount > 0) {
//       setFormData(prev => ({
//         ...prev,
//         allowances: [...prev.allowances, { ...currentAllowance, amount: Number(currentAllowance.amount) }]
//       }));
//       setCurrentAllowance({ title: "", amount: 0 });
//     }
//   };

//   const removeAllowance = (index) => {
//     setFormData(prev => ({
//       ...prev,
//       allowances: prev.allowances.filter((_, i) => i !== index)
//     }));
//   };

//   const addDeduction = () => {
//     if (currentDeduction.title && currentDeduction.amount > 0) {
//       setFormData(prev => ({
//         ...prev,
//         deductions: [...prev.deductions, { ...currentDeduction, amount: Number(currentDeduction.amount) }]
//       }));
//       setCurrentDeduction({ title: "", amount: 0 });
//     }
//   };

//   const removeDeduction = (index) => {
//     setFormData(prev => ({
//       ...prev,
//       deductions: prev.deductions.filter((_, i) => i !== index)
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       await onCreate(formData);
//       // Reset form
//       setFormData({
//         employeeId: "",
//         month: new Date().getMonth() + 1,
//         year: new Date().getFullYear(),
//         basic: 0,
//         hra: 0,
//         allowances: [],
//         deductions: [],
//         tax: 0
//       });
//     } catch (error) {
//       console.error("Error creating payroll:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const calculateTotal = (items) => {
//     return items.reduce((sum, item) => sum + (item.amount || 0), 0);
//   };

//   const totalAllowances = calculateTotal(formData.allowances);
//   const totalDeductions = calculateTotal(formData.deductions) + formData.tax;
//   const totalEarnings = formData.basic + formData.hra + totalAllowances;
//   const netPay = totalEarnings - totalDeductions;

//   if (!isOpen) return null;

//   const months = [
//     "January", "February", "March", "April", "May", "June",
//     "July", "August", "September", "October", "November", "December"
//   ];

//   const currentYear = new Date().getFullYear();
//   const years = [currentYear, currentYear + 1, currentYear + 2];

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
//       <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
//         <div className="flex items-center justify-between mb-6">
//           <h2 className="text-xl font-semibold text-gray-800">Create New Payroll</h2>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-600"
//           >
//             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//             </svg>
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* Basic Information */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Employee *
//               </label>
//               <select
//                 name="employeeId"
//                 value={formData.employeeId}
//                 onChange={handleInputChange}
//                 required
//                 className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="">Select Employee</option>
//                 {employees.map((employee) => (
//                   <option key={employee._id} value={employee._id}>
//                     {employee.firstName} {employee.lastName} ({employee.employeeId})
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Month *
//                 </label>
//                 <select
//                   name="month"
//                   value={formData.month}
//                   onChange={handleInputChange}
//                   required
//                   className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
//                 >
//                   {months.map((month, index) => (
//                     <option key={index + 1} value={index + 1}>
//                       {month}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Year *
//                 </label>
//                 <select
//                   name="year"
//                   value={formData.year}
//                   onChange={handleInputChange}
//                   required
//                   className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
//                 >
//                   {years.map((year) => (
//                     <option key={year} value={year}>
//                       {year}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//           </div>

//           {/* Salary Information */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Basic Salary *
//               </label>
//               <input
//                 type="number"
//                 name="basic"
//                 value={formData.basic}
//                 onChange={handleInputChange}
//                 required
//                 min="0"
//                 className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
//                 placeholder="Enter basic salary"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 HRA (40%)
//               </label>
//               <input
//                 type="number"
//                 name="hra"
//                 value={formData.hra}
//                 onChange={handleInputChange}
//                 min="0"
//                 className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
//                 placeholder="HRA amount"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Tax
//               </label>
//               <input
//                 type="number"
//                 name="tax"
//                 value={formData.tax}
//                 onChange={handleInputChange}
//                 min="0"
//                 className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
//                 placeholder="Tax amount"
//               />
//             </div>
//           </div>

//           {/* Allowances */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Allowances
//             </label>
//             <div className="space-y-3">
//               <div className="flex gap-2">
//                 <input
//                   type="text"
//                   placeholder="Allowance title"
//                   value={currentAllowance.title}
//                   onChange={(e) => setCurrentAllowance(prev => ({ ...prev, title: e.target.value }))}
//                   className="flex-1 p-2 border border-gray-300 rounded-md"
//                 />
//                 <input
//                   type="number"
//                   placeholder="Amount"
//                   value={currentAllowance.amount}
//                   onChange={(e) => setCurrentAllowance(prev => ({ ...prev, amount: Number(e.target.value) }))}
//                   min="0"
//                   className="w-24 p-2 border border-gray-300 rounded-md"
//                 />
//                 <button
//                   type="button"
//                   onClick={addAllowance}
//                   className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
//                 >
//                   Add
//                 </button>
//               </div>

//               {formData.allowances.map((allowance, index) => (
//                 <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
//                   <span className="text-sm">
//                     {allowance.title}: ₹{allowance.amount}
//                   </span>
//                   <button
//                     type="button"
//                     onClick={() => removeAllowance(index)}
//                     className="text-red-600 hover:text-red-800"
//                   >
//                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                     </svg>
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Deductions */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Deductions
//             </label>
//             <div className="space-y-3">
//               <div className="flex gap-2">
//                 <input
//                   type="text"
//                   placeholder="Deduction title"
//                   value={currentDeduction.title}
//                   onChange={(e) => setCurrentDeduction(prev => ({ ...prev, title: e.target.value }))}
//                   className="flex-1 p-2 border border-gray-300 rounded-md"
//                 />
//                 <input
//                   type="number"
//                   placeholder="Amount"
//                   value={currentDeduction.amount}
//                   onChange={(e) => setCurrentDeduction(prev => ({ ...prev, amount: Number(e.target.value) }))}
//                   min="0"
//                   className="w-24 p-2 border border-gray-300 rounded-md"
//                 />
//                 <button
//                   type="button"
//                   onClick={addDeduction}
//                   className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
//                 >
//                   Add
//                 </button>
//               </div>

//               {formData.deductions.map((deduction, index) => (
//                 <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
//                   <span className="text-sm">
//                     {deduction.title}: ₹{deduction.amount}
//                   </span>
//                   <button
//                     type="button"
//                     onClick={() => removeDeduction(index)}
//                     className="text-red-600 hover:text-red-800"
//                   >
//                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                     </svg>
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Summary */}
//           <div className="bg-gray-50 p-4 rounded-lg">
//             <h3 className="text-lg font-semibold mb-3">Salary Summary</h3>
//             <div className="space-y-2">
//               <div className="flex justify-between">
//                 <span>Basic Salary:</span>
//                 <span className="font-semibold">₹{formData.basic}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span>HRA:</span>
//                 <span className="font-semibold">₹{formData.hra}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span>Allowances:</span>
//                 <span className="font-semibold">₹{totalAllowances}</span>
//               </div>
//               <div className="flex justify-between text-green-600">
//                 <span className="font-semibold">Total Earnings:</span>
//                 <span className="font-semibold">₹{totalEarnings}</span>
//               </div>

//               <hr className="my-2" />

//               <div className="flex justify-between">
//                 <span>Deductions:</span>
//                 <span className="font-semibold text-red-600">-₹{calculateTotal(formData.deductions)}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span>Tax:</span>
//                 <span className="font-semibold text-red-600">-₹{formData.tax}</span>
//               </div>
//               <div className="flex justify-between text-red-600">
//                 <span className="font-semibold">Total Deductions:</span>
//                 <span className="font-semibold">-₹{totalDeductions}</span>
//               </div>

//               <hr className="my-2" />

//               <div className="flex justify-between text-lg font-bold">
//                 <span>Net Pay:</span>
//                 <span className="text-green-600">₹{netPay}</span>
//               </div>
//             </div>
//           </div>

//           {/* Actions */}
//           <div className="flex justify-end gap-3">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={loading}
//               className="px-4 py-2 rounded-md text-white primary-btn disabled:opacity-50"
//               style={{ backgroundColor: PRIMARY }}
//             >
//               {loading ? "Creating..." : "Create Payroll"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default CreatePayrollModal;

import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";

const PRIMARY = "#104774";
const PRIMARY_HOVER = "#0d3a61";

const CreatePayrollModal = ({ isOpen, onClose, onCreate, employees, token, addNotification }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    basic: 0,
    hra: 0,
    allowances: [],
    deductions: [],
    tax: 0
  });
  const [currentAllowance, setCurrentAllowance] = useState({ title: "", amount: 0 });
  const [currentDeduction, setCurrentDeduction] = useState({ title: "", amount: 0 });
  const [employeeBasicSalary, setEmployeeBasicSalary] = useState(0);

  useEffect(() => {
    if (formData.employeeId) {
      // Fetch employee's basic salary when employee is selected
      fetchEmployeeBasicSalary(formData.employeeId);
    }
  }, [formData.employeeId]);

  useEffect(() => {
    if (employeeBasicSalary > 0) {
      // Auto-fill basic salary and calculate HRA
      setFormData(prev => ({
        ...prev,
        basic: employeeBasicSalary,
        hra: Math.round(employeeBasicSalary * 0.4)
      }));
    }
  }, [employeeBasicSalary]);

  const fetchEmployeeBasicSalary = async (employeeId) => {
    try {
      const response = await axiosInstance.get(
        `/payroll/employee/${employeeId}/latest`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.data && response.data.data.basic) {
        setEmployeeBasicSalary(response.data.data.basic);
      } else {
        // If no previous payroll, set default basic salary
        setEmployeeBasicSalary(30000); // Default basic salary
      }
    } catch (error) {
      console.error("Error fetching employee salary:", error);
      setEmployeeBasicSalary(30000); // Fallback default
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'basic' || name === 'hra' || name === 'tax' ? Number(value) : value
    }));

    // Auto-calculate HRA when basic changes
    if (name === 'basic' && value > 0) {
      setFormData(prev => ({
        ...prev,
        hra: Math.round(Number(value) * 0.4)
      }));
    }
  };

  const addAllowance = () => {
    if (currentAllowance.title && currentAllowance.amount > 0) {
      setFormData(prev => ({
        ...prev,
        allowances: [...prev.allowances, { 
          title: currentAllowance.title, 
          amount: Number(currentAllowance.amount) 
        }]
      }));
      setCurrentAllowance({ title: "", amount: 0 });
    }
  };

  const removeAllowance = (index) => {
    setFormData(prev => ({
      ...prev,
      allowances: prev.allowances.filter((_, i) => i !== index)
    }));
  };

  const addDeduction = () => {
    if (currentDeduction.title && currentDeduction.amount > 0) {
      setFormData(prev => ({
        ...prev,
        deductions: [...prev.deductions, { 
          title: currentDeduction.title, 
          amount: Number(currentDeduction.amount) 
        }]
      }));
      setCurrentDeduction({ title: "", amount: 0 });
    }
  };

  const removeDeduction = (index) => {
    setFormData(prev => ({
      ...prev,
      deductions: prev.deductions.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.employeeId) {
      addNotification("Please select an employee", "error");
      return;
    }

    if (formData.basic <= 0) {
      addNotification("Basic salary must be greater than 0", "error");
      return;
    }

    setLoading(true);

    try {
      // Prepare the data for API
      const payrollData = {
        employeeId: formData.employeeId,
        month: formData.month,
        year: formData.year,
        basic: formData.basic,
        hra: formData.hra,
        allowances: formData.allowances,
        deductions: formData.deductions,
        tax: formData.tax
      };

      // Make API call to create payroll
      const response = await axiosInstance.post(
        "/payroll/monthly",
        payrollData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      if (response.data && response.data.message) {
        addNotification(response.data.message, "success");
        
        // Reset form
        setFormData({
          employeeId: "",
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          basic: 0,
          hra: 0,
          allowances: [],
          deductions: [],
          tax: 0
        });
        setEmployeeBasicSalary(0);
        
        // Call the parent onCreate callback if provided
        if (onCreate) {
          onCreate(response.data.data);
        }
        
        onClose(); // Close the modal
      }
    } catch (error) {
      console.error("Error creating payroll:", error);
      const errorMessage = error.response?.data?.message || "Error creating payroll. Please try again.";
      addNotification(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = (items) => {
    return items.reduce((sum, item) => sum + (item.amount || 0), 0);
  };

  const totalAllowances = calculateTotal(formData.allowances);
  const totalDeductions = calculateTotal(formData.deductions) + formData.tax;
  const totalEarnings = formData.basic + formData.hra + totalAllowances;
  const netPay = totalEarnings - totalDeductions;

  if (!isOpen) return null;

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Create New Payroll</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee *
              </label>
              <select
                name="employeeId"
                value={formData.employeeId}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Employee</option>
                {employees.map((employee) => (
                  <option key={employee._id} value={employee._id}>
                    {employee.firstName} {employee.lastName} ({employee.employeeId}) - {employee.department}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Month *
                </label>
                <select
                  name="month"
                  value={formData.month}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  {months.map((month, index) => (
                    <option key={index + 1} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year *
                </label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Salary Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Basic Salary *
              </label>
              <input
                type="number"
                name="basic"
                value={formData.basic}
                onChange={handleInputChange}
                required
                min="0"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Enter basic salary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                HRA (40% of Basic)
              </label>
              <input
                type="number"
                name="hra"
                value={formData.hra}
                onChange={handleInputChange}
                min="0"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tax
              </label>
              <input
                type="number"
                name="tax"
                value={formData.tax}
                onChange={handleInputChange}
                min="0"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Tax amount"
              />
            </div>
          </div>

          {/* Allowances */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Allowances
            </label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Allowance title (e.g., Travel, Medical)"
                  value={currentAllowance.title}
                  onChange={(e) => setCurrentAllowance(prev => ({ ...prev, title: e.target.value }))}
                  className="flex-1 p-2 border border-gray-300 rounded-md"
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={currentAllowance.amount}
                  onChange={(e) => setCurrentAllowance(prev => ({ ...prev, amount: Number(e.target.value) }))}
                  min="0"
                  className="w-24 p-2 border border-gray-300 rounded-md"
                />
                <button
                  type="button"
                  onClick={addAllowance}
                  className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Add
                </button>
              </div>

              {formData.allowances.map((allowance, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                  <span className="text-sm">
                    {allowance.title}: ₹{allowance.amount.toLocaleString()}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAllowance(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Deductions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deductions
            </label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Deduction title (e.g., PF, Loan)"
                  value={currentDeduction.title}
                  onChange={(e) => setCurrentDeduction(prev => ({ ...prev, title: e.target.value }))}
                  className="flex-1 p-2 border border-gray-300 rounded-md"
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={currentDeduction.amount}
                  onChange={(e) => setCurrentDeduction(prev => ({ ...prev, amount: Number(e.target.value) }))}
                  min="0"
                  className="w-24 p-2 border border-gray-300 rounded-md"
                />
                <button
                  type="button"
                  onClick={addDeduction}
                  className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Add
                </button>
              </div>

              {formData.deductions.map((deduction, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                  <span className="text-sm">
                    {deduction.title}: ₹{deduction.amount.toLocaleString()}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeDeduction(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Salary Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Basic Salary:</span>
                <span className="font-semibold">₹{formData.basic.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>HRA:</span>
                <span className="font-semibold">₹{formData.hra.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Allowances:</span>
                <span className="font-semibold">₹{totalAllowances.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span className="font-semibold">Total Earnings:</span>
                <span className="font-semibold">₹{totalEarnings.toLocaleString()}</span>
              </div>

              <hr className="my-2" />

              <div className="flex justify-between">
                <span>Deductions:</span>
                <span className="font-semibold text-red-600">-₹{calculateTotal(formData.deductions).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span className="font-semibold text-red-600">-₹{formData.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span className="font-semibold">Total Deductions:</span>
                <span className="font-semibold">-₹{totalDeductions.toLocaleString()}</span>
              </div>

              <hr className="my-2" />

              <div className="flex justify-between text-lg font-bold">
                <span>Net Pay:</span>
                <span className="text-green-600">₹{netPay.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-md text-white primary-btn disabled:opacity-50"
              style={{ backgroundColor: PRIMARY }}
            >
              {loading ? "Creating..." : "Create Payroll"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePayrollModal;