// import React, { useState, useEffect } from "react";
// import axiosInstance from "../../utils/axiosInstance";

// const PRIMARY = "#104774";

// const CreatePayrollModal = ({
//   isOpen,
//   onClose,
//   onCreate,
//   token,
//   addNotification,
// }) => {
//   const [loading, setLoading] = useState(false);
//   const [departments, setDepartments] = useState([]);
//   const [employees, setEmployees] = useState([]);
//   const [allEmployees, setAllEmployees] = useState([]);
//   const [selectedDepartment, setSelectedDepartment] = useState("");
//   const [checkingPayrolls, setCheckingPayrolls] = useState(false);

//   const [formData, setFormData] = useState({
//     employeeId: "",
//     month: new Date().getMonth() + 1,
//     year: new Date().getFullYear(),
//     basic: 0,
//     hra: 0,
//     allowances: [],
//     deductions: [],
//     tax: 0,
//     taxPercentage: 0,
//   });

//   const [currentAllowance, setCurrentAllowance] = useState({
//     title: "",
//     amount: 0,
//   });
//   const [currentDeduction, setCurrentDeduction] = useState({
//     title: "",
//     amount: 0,
//   });

//   const [attendanceSummary, setAttendanceSummary] = useState(null);
//   const [latestPayroll, setLatestPayroll] = useState(null);
//   const [preview, setPreview] = useState(null);

//   // --- fetch departments when modal opens
//   useEffect(() => {
//     if (isOpen) {
//       fetchDepartments();
//       setFormData((prev) => ({
//         ...prev,
//         month: new Date().getMonth() + 1,
//         year: new Date().getFullYear(),
//       }));
//       // reset UI state
//       setAttendanceSummary(null);
//       setLatestPayroll(null);
//       setPreview(null);
//       setSelectedDepartment("");
//       setEmployees([]);
//       setAllEmployees([]);
//     }
//   }, [isOpen]);

//   // --- fetch employees when department changes
//   useEffect(() => {
//     if (selectedDepartment) fetchEmployeesByDepartment(selectedDepartment);
//     else {
//       setEmployees([]);
//       setAllEmployees([]);
//     }
//   }, [selectedDepartment]);

//   // --- filter out employees who already have payroll for selected month/year
//   useEffect(() => {
//     if (allEmployees.length > 0) filterEmployeesWithExistingPayroll();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [formData.month, formData.year, allEmployees]);

//   // --- when employee selected, fetch latest payroll and attendance summary
//   useEffect(() => {
//     if (formData.employeeId) {
//       fetchEmployeeLatestPayroll(formData.employeeId);
//       fetchEmployeeAttendance(
//         formData.employeeId,
//         formData.month,
//         formData.year
//       );
//     } else {
//       setAttendanceSummary(null);
//       setLatestPayroll(null);
//       setPreview(null);
//     }
//   }, [formData.employeeId, formData.month, formData.year]);

//   // --- tax auto-calculation
//   useEffect(() => {
//     if (formData.taxPercentage > 0 && formData.basic > 0) {
//       const taxAmount = Math.round(
//         (formData.basic * formData.taxPercentage) / 100
//       );
//       setFormData((prev) => ({ ...prev, tax: taxAmount }));
//     } else if (formData.taxPercentage === 0) {
//       setFormData((prev) => ({ ...prev, tax: 0 }));
//     }
//   }, [formData.taxPercentage, formData.basic]);

//   // ---------- API calls ----------
//   const fetchDepartments = async () => {
//     try {
//       const res = await axiosInstance.get("/departments", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setDepartments(res.data.data || []);
//     } catch (err) {
//       console.error(err);
//       addNotification("Failed to fetch departments", "error");
//     }
//   };

//   const fetchEmployeesByDepartment = async (department) => {
//     try {
//       const res = await axiosInstance.get(
//         `/departments/${department}/employees`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setAllEmployees(res.data.data || []);
//     } catch (err) {
//       console.error(err);
//       addNotification("Failed to fetch employees", "error");
//     }
//   };

//   const filterEmployeesWithExistingPayroll = async () => {
//     setCheckingPayrolls(true);
//     try {
//       const results = await Promise.all(
//         allEmployees.map(async (emp) => {
//           try {
//             const r = await axiosInstance.get(
//               `/payroll/employee/${emp._id}/exists?month=${formData.month}&year=${formData.year}`,
//               { headers: { Authorization: `Bearer ${token}` } }
//             );
//             return { emp, hasPayroll: !!r.data.exists };
//           } catch (e) {
//             return { emp, hasPayroll: false };
//           }
//         })
//       );
//       const available = results.filter((r) => !r.hasPayroll).map((r) => r.emp);
//       setEmployees(available);
//       if (
//         formData.employeeId &&
//         !available.some((e) => e._id === formData.employeeId)
//       ) {
//         setFormData((prev) => ({ ...prev, employeeId: "" }));
//       }
//     } catch (err) {
//       console.error(err);
//       setEmployees(allEmployees);
//     } finally {
//       setCheckingPayrolls(false);
//     }
//   };

//   const fetchEmployeeLatestPayroll = async (employeeId) => {
//     try {
//       const res = await axiosInstance.get(
//         `/payroll/employee/${employeeId}/latest`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       const p = res.data?.data || null;
//       setLatestPayroll(p);
//       if (p && typeof p.basic === "number") {
//         setFormData((prev) => ({
//           ...prev,
//           basic: p.basic,
//           hra: p.hra ?? prev.hra,
//         }));
//       } else {
//         // fallback to profile basic if latest payroll not present
//         try {
//           const prof = await axiosInstance.get(`/profiles/${employeeId}`, {
//             headers: { Authorization: `Bearer ${token}` },
//           });
//           const basicFromProfile = prof.data?.data?.basicSalary ?? prev.basic;
//           setFormData((prev) => ({ ...prev, basic: basicFromProfile }));
//         } catch (_) {
//           /* ignore */
//         }
//       }
//     } catch (err) {
//       console.error("Error fetching latest payroll:", err);
//     }
//   };

//   const fetchEmployeeAttendance = async (employeeId, month, year) => {
//     try {
//       const res = await axiosInstance.get(
//         `/payroll/preview?employeeId=${employeeId}&month=${month}&year=${year}&basic=${
//           formData.basic || 0
//         }&hra=${formData.hra || 0}&allowances=${JSON.stringify(
//           formData.allowances
//         )}&deductions=${JSON.stringify(formData.deductions)}&taxPercentage=${
//           formData.taxPercentage || 0
//         }`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setPreview(res.data);
//     } catch (err) {
//       console.error("Error fetching payroll preview:", err);
//       setPreview(null);
//       // Fallback to local calculation if API fails
//       calculatePreviewLocal();
//     }
//   };

//   // ---------- helpers ----------
//   const sumItems = (items) =>
//     Array.isArray(items)
//       ? items.reduce((s, it) => s + (Number(it.amount) || 0), 0)
//       : 0;

//   const calculatePreviewLocal = () => {
//     if (!formData.employeeId) {
//       addNotification("Select employee to preview", "error");
//       return;
//     }
//     const basic = Number(formData.basic || 0);
//     const hra = Number(formData.hra || 0);
//     const allowancesSum = sumItems(formData.allowances);
//     const deductionsSum = sumItems(formData.deductions);
//     const tax = Number(formData.tax || 0);

//     // daily rate: fixed 31-day denominator as agreed
//     const dailyRate = basic / 31;

//     // Use backend preview data if available, otherwise use attendanceSummary
//     let absent = 0;
//     let workingDays = 0;
//     let leaveDays = 0;
//     let absentDeduction = 0;

//     if (preview) {
//       absent = preview.absent || 0;
//       workingDays = preview.workingDays || 0;
//       leaveDays = preview.approvedLeaves || 0;
//       absentDeduction = preview.absentDeduction || 0;
//     } else if (attendanceSummary) {
//       const present = Number(attendanceSummary.present || 0);
//       const leave = Number(attendanceSummary.leave || 0);
//       const holidays = Number(attendanceSummary.holidays || 0);
//       const sundays = Number(attendanceSummary.sundays || 0);
//       workingDays = Number(
//         attendanceSummary.totalWorkingDays || 31 - (holidays + sundays)
//       );
//       absent = Number(
//         attendanceSummary.absent ?? workingDays - (present + leave)
//       );
//       if (absent < 0) absent = 0;
//       absentDeduction = Math.round(dailyRate * absent);
//       leaveDays = leave;
//     }

//     const totalEarnings = Math.round(basic + hra + allowancesSum);
//     const totalDeductions = Math.round(deductionsSum + tax + absentDeduction);
//     const net = Math.round(totalEarnings - totalDeductions);

//     const previewObj = {
//       basic,
//       hra,
//       allowancesSum,
//       deductionsSum,
//       tax,
//       dailyRate: +dailyRate.toFixed(2),
//       workingDays,
//       presentDays: workingDays - absent - leaveDays,
//       leaveDays,
//       absent,
//       absentDeduction,
//       totalEarnings,
//       totalDeductions,
//       netPay: net,
//     };

//     setPreview(previewObj);
//     return previewObj;
//   };

//   // Submit payroll (create)
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!formData.employeeId)
//       return addNotification("Please select an employee", "error");
//     setLoading(true);
//     try {
//       // Build payload expected by backend
//       const payload = {
//         employeeId: formData.employeeId,
//         month: formData.month,
//         year: formData.year,
//         basic: Number(formData.basic || 0),
//         hra: Number(formData.hra || 0),
//         allowances: formData.allowances || [],
//         deductions: formData.deductions || [],
//         taxPercentage: formData.taxPercentage || 0,
//       };

//       const res = await axiosInstance.post("/payroll/monthly", payload, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       });

//       addNotification(res.data?.message || "Payroll created", "success");
//       // reset form
//       setFormData({
//         employeeId: "",
//         month: new Date().getMonth() + 1,
//         year: new Date().getFullYear(),
//         basic: 0,
//         hra: 0,
//         allowances: [],
//         deductions: [],
//         tax: 0,
//         taxPercentage: 0,
//       });
//       setAttendanceSummary(null);
//       setPreview(null);
//       setSelectedDepartment("");
//       if (onCreate) onCreate(res.data.data);
//       onClose();
//     } catch (err) {
//       console.error("Error creating payroll:", err);
//       addNotification(
//         err.response?.data?.message || "Error creating payroll",
//         "error"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   // UI handlers for allowances & deductions
//   const addAllowance = () => {
//     if (!currentAllowance.title || !currentAllowance.amount) return;
//     setFormData((prev) => ({
//       ...prev,
//       allowances: [
//         ...prev.allowances,
//         {
//           title: currentAllowance.title,
//           amount: Number(currentAllowance.amount),
//         },
//       ],
//     }));
//     setCurrentAllowance({ title: "", amount: 0 });
//   };
//   const removeAllowance = (i) =>
//     setFormData((prev) => ({
//       ...prev,
//       allowances: prev.allowances.filter((_, idx) => idx !== i),
//     }));
//   const addDeduction = () => {
//     if (!currentDeduction.title || !currentDeduction.amount) return;
//     setFormData((prev) => ({
//       ...prev,
//       deductions: [
//         ...prev.deductions,
//         {
//           title: currentDeduction.title,
//           amount: Number(currentDeduction.amount),
//         },
//       ],
//     }));
//     setCurrentDeduction({ title: "", amount: 0 });
//   };
//   const removeDeduction = (i) =>
//     setFormData((prev) => ({
//       ...prev,
//       deductions: prev.deductions.filter((_, idx) => idx !== i),
//     }));

//   // small helpers
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     if (["basic", "hra", "tax", "taxPercentage"].includes(name)) {
//       setFormData((prev) => ({ ...prev, [name]: Number(value) }));
//     } else {
//       setFormData((prev) => ({ ...prev, [name]: value }));
//     }
//   };
//   const handleMonthYearChange = (field, value) =>
//     setFormData((prev) => ({ ...prev, [field]: Number(value) }));
//   const handleDepartmentChange = (e) => {
//     setSelectedDepartment(e.target.value);
//     setFormData((prev) => ({ ...prev, employeeId: "" }));
//   };

//   if (!isOpen) return null;

//   // computed totals for display
//   const totalAllowances = sumItems(formData.allowances);
//   const totalDeductions =
//     sumItems(formData.deductions) + Number(formData.tax || 0);
//   const totalEarnings = Math.round(
//     Number(formData.basic || 0) + Number(formData.hra || 0) + totalAllowances
//   );
//   const netPayDisplay = preview
//     ? preview.netPay
//     : Math.round(totalEarnings - totalDeductions);

//   // month/year lists
//   const months = [
//     "January",
//     "February",
//     "March",
//     "April",
//     "May",
//     "June",
//     "July",
//     "August",
//     "September",
//     "October",
//     "November",
//     "December",
//   ];
//   const currentYear = new Date().getFullYear();
//   const years = [currentYear - 1, currentYear, currentYear + 1];

//   return (
//     <div className="fixed inset-0 backdrop-blur-sm bg-opacity-40 flex items-center justify-center p-4 z-50">
//       <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
//         <div className="flex items-center justify-between mb-6">
//           <div className="flex items-center gap-4">
//             <h2 className="text-xl font-semibold text-gray-800">
//               Create New Payroll
//             </h2>
//             <span className="text-gray-600">
//               {months[formData.month - 1]} {formData.year}
//             </span>
//           </div>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-600"
//           >
//             ✖
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* Department & Employee */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Department *
//               </label>
//               <select
//                 value={selectedDepartment}
//                 onChange={handleDepartmentChange}
//                 required
//                 className="w-full p-3 border border-gray-300 rounded-md"
//               >
//                 <option value="">Select Department</option>
//                 {departments.map((d) => (
//                   <option key={d} value={d}>
//                     {d}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Employee *
//               </label>
//               <select
//                 name="employeeId"
//                 value={formData.employeeId}
//                 onChange={handleInputChange}
//                 required
//                 disabled={!selectedDepartment || checkingPayrolls}
//                 className="w-full p-3 border border-gray-300 rounded-md"
//               >
//                 <option value="">Select Employee</option>
//                 {checkingPayrolls ? (
//                   <option disabled>Checking payroll status...</option>
//                 ) : employees.length === 0 && selectedDepartment ? (
//                   <option disabled>
//                     All employees already have payroll for this period
//                   </option>
//                 ) : (
//                   employees.map((emp) => (
//                     <option key={emp._id} value={emp._id}>
//                       {emp.firstName} {emp.lastName} ({emp.employeeId})
//                     </option>
//                   ))
//                 )}
//               </select>
//             </div>
//           </div>

//           {/* Month/Year Selection */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Month
//               </label>
//               <select
//                 name="month"
//                 value={formData.month}
//                 onChange={(e) => handleMonthYearChange("month", e.target.value)}
//                 className="w-full p-3 border border-gray-300 rounded-md"
//               >
//                 {months.map((m, idx) => (
//                   <option key={idx + 1} value={idx + 1}>
//                     {m}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Year
//               </label>
//               <select
//                 name="year"
//                 value={formData.year}
//                 onChange={(e) => handleMonthYearChange("year", e.target.value)}
//                 className="w-full p-3 border border-gray-300 rounded-md"
//               >
//                 {years.map((y) => (
//                   <option key={y} value={y}>
//                     {y}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           {/* Salary Inputs */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Basic Salary *
//               </label>
//               <input
//                 name="basic"
//                 type="number"
//                 value={formData.basic}
//                 onChange={handleInputChange}
//                 required
//                 min={0}
//                 className="w-full p-3 border border-gray-300 rounded-md"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 HRA
//               </label>
//               <input
//                 name="hra"
//                 type="number"
//                 value={formData.hra}
//                 onChange={handleInputChange}
//                 min={0}
//                 className="w-full p-3 border border-gray-300 rounded-md"
//               />
//             </div>
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Tax (%)
//                 </label>
//                 <input
//                   name="taxPercentage"
//                   type="number"
//                   value={formData.taxPercentage}
//                   onChange={handleInputChange}
//                   min={0}
//                   max={100}
//                   step={0.1}
//                   className="w-full p-3 border border-gray-300 rounded-md"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Tax Amount
//                 </label>
//                 <input
//                   name="tax"
//                   type="number"
//                   value={formData.tax}
//                   onChange={handleInputChange}
//                   readOnly
//                   className="w-full p-3 border border-gray-300 rounded-md bg-gray-100"
//                 />
//               </div>
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
//                   placeholder="Title"
//                   value={currentAllowance.title}
//                   onChange={(e) =>
//                     setCurrentAllowance((prev) => ({
//                       ...prev,
//                       title: e.target.value,
//                     }))
//                   }
//                   className="flex-1 p-2 border rounded"
//                 />
//                 <input
//                   placeholder="Amount"
//                   type="number"
//                   value={currentAllowance.amount}
//                   onChange={(e) =>
//                     setCurrentAllowance((prev) => ({
//                       ...prev,
//                       amount: Number(e.target.value),
//                     }))
//                   }
//                   className="w-28 p-2 border rounded"
//                 />
//                 <button
//                   type="button"
//                   onClick={addAllowance}
//                   className="px-3 py-2 bg-green-600 text-white rounded"
//                 >
//                   Add
//                 </button>
//               </div>
//               {formData.allowances.map((a, idx) => (
//                 <div
//                   key={idx}
//                   className="flex items-center justify-between p-2 bg-gray-50 rounded"
//                 >
//                   <span>
//                     {a.title}: ₹{(a.amount || 0).toLocaleString()}
//                   </span>
//                   <button
//                     type="button"
//                     onClick={() => removeAllowance(idx)}
//                     className="text-red-600"
//                   >
//                     Remove
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
//                   placeholder="Title"
//                   value={currentDeduction.title}
//                   onChange={(e) =>
//                     setCurrentDeduction((prev) => ({
//                       ...prev,
//                       title: e.target.value,
//                     }))
//                   }
//                   className="flex-1 p-2 border rounded"
//                 />
//                 <input
//                   placeholder="Amount"
//                   type="number"
//                   value={currentDeduction.amount}
//                   onChange={(e) =>
//                     setCurrentDeduction((prev) => ({
//                       ...prev,
//                       amount: Number(e.target.value),
//                     }))
//                   }
//                   className="w-28 p-2 border rounded"
//                 />
//                 <button
//                   type="button"
//                   onClick={addDeduction}
//                   className="px-3 py-2 bg-green-600 text-white rounded"
//                 >
//                   Add
//                 </button>
//               </div>
//               {formData.deductions.map((d, idx) => (
//                 <div
//                   key={idx}
//                   className="flex items-center justify-between p-2 bg-gray-50 rounded"
//                 >
//                   <span>
//                     {d.title}: ₹{(d.amount || 0).toLocaleString()}
//                   </span>
//                   <button
//                     type="button"
//                     onClick={() => removeDeduction(idx)}
//                     className="text-red-600"
//                   >
//                     Remove
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Payroll Summary Box */}
//           {preview && (
//             <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
//               <h3 className="text-lg font-semibold text-blue-800 mb-4 text-center">
//                 Payroll Summary
//               </h3>

//               <div className="grid grid-cols-2 gap-4 mb-4">
//                 <div className="bg-white p-3 rounded shadow-sm">
//                   <p className="text-sm text-gray-600">Cycle Days</p>
//                   <p className="text-lg font-semibold">
//                     {preview.cycleDays || 31}
//                   </p>
//                 </div>
//                 <div className="bg-white p-3 rounded shadow-sm">
//                   <p className="text-sm text-gray-600">Sundays/Holidays</p>
//                   <p className="text-lg font-semibold">
//                     {preview.sundaysHolidays || 0}
//                   </p>
//                 </div>
//                 <div className="bg-white p-3 rounded shadow-sm">
//                   <p className="text-sm text-gray-600">Working Days</p>
//                   <p className="text-lg font-semibold">
//                     {preview.workingDays || 0}
//                   </p>
//                 </div>
//                 <div className="bg-white p-3 rounded shadow-sm">
//                   <p className="text-sm text-gray-600">Approved Leave</p>
//                   <p className="text-lg font-semibold text-green-600">
//                     {preview.approvedLeaves || 0} (paid)
//                   </p>
//                 </div>
//                 <div className="bg-white p-3 rounded shadow-sm">
//                   <p className="text-sm text-gray-600">Absent</p>
//                   <p className="text-lg font-semibold text-red-600">
//                     {preview.absent || 0} (deducted)
//                   </p>
//                 </div>
//                 <div className="bg-white p-3 rounded shadow-sm">
//                   <p className="text-sm text-gray-600">Deduction</p>
//                   <p className="text-lg font-semibold text-red-600">
//                     ₹{preview.absentDeduction?.toLocaleString() || 0}
//                   </p>
//                 </div>
//               </div>

//               <div className="bg-white p-4 rounded-lg border-2 border-blue-300">
//                 <div className="flex justify-between items-center">
//                   <span className="text-lg font-semibold text-blue-800">
//                     Payable Salary
//                   </span>
//                   <span className="text-2xl font-bold text-green-600">
//                     ₹
//                     {preview.payableSalary?.toLocaleString() ||
//                       preview.netPay?.toLocaleString() ||
//                       "0"}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Summary (Earnings / Deductions / Net) */}
//           {/* <div className="bg-gray-50 p-4 rounded-lg">
//             <h3 className="text-lg font-semibold mb-3">Salary Breakdown</h3>
//             <div className="space-y-2">
//               <div className="flex justify-between">
//                 <span>Basic Salary:</span>
//                 <span>₹{Number(formData.basic || 0).toLocaleString()}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span>HRA:</span>
//                 <span>₹{Number(formData.hra || 0).toLocaleString()}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span>Allowances:</span>
//                 <span>₹{totalAllowances.toLocaleString()}</span>
//               </div>
//               <div className="flex justify-between text-green-600 font-medium">
//                 <span>Total Earnings:</span>
//                 <span>₹{totalEarnings.toLocaleString()}</span>
//               </div>

//               <hr className="my-2" />

//               <div className="flex justify-between">
//                 <span>Deductions:</span>
//                 <span className="text-red-600">
//                   -₹{sumItems(formData.deductions).toLocaleString()}
//                 </span>
//               </div>
//               <div className="flex justify-between">
//                 <span>Tax ({formData.taxPercentage}%):</span>
//                 <span className="text-red-600">
//                   -₹{Number(formData.tax || 0).toLocaleString()}
//                 </span>
//               </div>
//               {/* {preview && (
//                 <div className="flex justify-between">
//                   <span>Absent Deduction:</span>
//                   <span className="text-red-600">
//                     -₹{preview.absentDeduction?.toLocaleString() || 0}
//                   </span>
//                 </div>
//               )}
//               <div className="flex justify-between text-red-600 font-medium">
//                 <span>Total Deductions:</span>
//                 <span>
//                   -₹
//                   {(
//                     sumItems(formData.deductions) +
//                     Number(formData.tax || 0) +
//                     (preview?.absentDeduction || 0)
//                   ).toLocaleString()}
//                 </span>
//               </div>

//               <hr className="my-2" />

//               <div className="flex justify-between text-lg font-bold pt-2">
//                 <span>Net Pay:</span>
//                 <span className="text-green-600">
//                   ₹{(preview?.netPay ?? netPayDisplay ?? 0).toLocaleString()}
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* <div className="bg-gray-50 p-4 rounded-lg">
//   <h3 className="text-lg font-semibold mb-3">Salary Breakdown</h3>
//   <div className="space-y-2">
//     <div className="flex justify-between">
//       <span>Basic Salary:</span>
//       <span>₹{Number(formData.basic || 0).toLocaleString()}</span>
//     </div>
//     <div className="flex justify-between">
//       <span>HRA:</span>
//       <span>₹{Number(formData.hra || 0).toLocaleString()}</span>
//     </div>
//     <div className="flex justify-between">
//       <span>Allowances:</span>
//       <span>₹{totalAllowances.toLocaleString()}</span>
//     </div>
//     <div className="flex justify-between text-green-600 font-medium">
//       <span>Total Earnings:</span>
//       <span>
//         ₹{(
//           Number(formData.basic || 0) +
//           Number(formData.hra || 0) +
//           totalAllowances
//         ).toLocaleString()}
//       </span>
//     </div>

//     <hr className="my-2" />

//     <div className="flex justify-between">
//       <span>Deductions:</span>
//       <span className="text-red-600">
//         -₹{sumItems(formData.deductions).toLocaleString()}
//       </span>
//     </div>
//     <div className="flex justify-between">
//       <span>Tax ({formData.taxPercentage || 0}%):</span>
//       <span className="text-red-600">
//         -₹{Number(formData.tax || 0).toLocaleString()}
//       </span>
//     </div>

//     <div className="flex justify-between text-red-600 font-medium">
//       <span>Total Deductions:</span>
//       <span>
//         -₹{(
//           sumItems(formData.deductions) +
//           Number(formData.tax || 0)
//         ).toLocaleString()}
//       </span>
//     </div>

//     <hr className="my-2" />

//     <div className="flex justify-between text-lg font-bold pt-2">
//       <span>Net Pay:</span>
//       <span className="text-green-600">
//         ₹{(
//           Number(formData.basic || 0) +
//           Number(formData.hra || 0) +
//           totalAllowances -
//           (sumItems(formData.deductions) + Number(formData.tax || 0))
//         ).toLocaleString()}
//       </span>
//     </div>
//   </div>
// </div> */}

//           {/* Actions */}
//           <div className="flex justify-end gap-3">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-4 py-2 border rounded"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={loading || !formData.employeeId}
//               className="px-4 py-2 rounded text-white"
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

const CreatePayrollModal = ({
  isOpen,
  onClose,
  onCreate,
  token,
  addNotification,
}) => {
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [checkingPayrolls, setCheckingPayrolls] = useState(false);

  const [formData, setFormData] = useState({
    employeeId: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    basic: 0,
    hra: 0,
    allowances: [],
    deductions: [],
    tax: 0,
    taxPercentage: 0,
  });

  const [currentAllowance, setCurrentAllowance] = useState({
    title: "",
    amount: 0,
  });
  const [currentDeduction, setCurrentDeduction] = useState({
    title: "",
    amount: 0,
  });

  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [latestPayroll, setLatestPayroll] = useState(null);
  const [preview, setPreview] = useState(null);

  // --- fetch departments when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchDepartments();
      setFormData((prev) => ({
        ...prev,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      }));
      // reset UI state
      setAttendanceSummary(null);
      setLatestPayroll(null);
      setPreview(null);
      setSelectedDepartment("");
      setEmployees([]);
      setAllEmployees([]);
    }
  }, [isOpen]);

  // --- fetch employees when department changes
  useEffect(() => {
    if (selectedDepartment) fetchEmployeesByDepartment(selectedDepartment);
    else {
      setEmployees([]);
      setAllEmployees([]);
    }
  }, [selectedDepartment]);

  // --- filter out employees who already have payroll for selected month/year
  useEffect(() => {
    if (allEmployees.length > 0) filterEmployeesWithExistingPayroll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.month, formData.year, allEmployees]);

  // --- when employee selected, fetch latest payroll and attendance summary
  useEffect(() => {
    if (formData.employeeId) {
      fetchEmployeeLatestPayroll(formData.employeeId);
      fetchEmployeeAttendance(
        formData.employeeId,
        formData.month,
        formData.year
      );
    } else {
      setAttendanceSummary(null);
      setLatestPayroll(null);
      setPreview(null);
    }
  }, [formData.employeeId, formData.month, formData.year]);

  // --- tax auto-calculation
  useEffect(() => {
    if (formData.taxPercentage > 0 && formData.basic > 0) {
      const taxAmount = Math.round(
        (formData.basic * formData.taxPercentage) / 100
      );
      setFormData((prev) => ({ ...prev, tax: taxAmount }));
    } else if (formData.taxPercentage === 0) {
      setFormData((prev) => ({ ...prev, tax: 0 }));
    }
  }, [formData.taxPercentage, formData.basic]);

  // ---------- API calls ----------
  const fetchDepartments = async () => {
    try {
      const res = await axiosInstance.get("/departments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDepartments(res.data.data || []);
    } catch (err) {
      console.error(err);
      addNotification("Failed to fetch departments", "error");
    }
  };

  const fetchEmployeesByDepartment = async (department) => {
    try {
      const res = await axiosInstance.get(
        `/departments/${department}/employees`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAllEmployees(res.data.data || []);
    } catch (err) {
      console.error(err);
      addNotification("Failed to fetch employees", "error");
    }
  };

  const filterEmployeesWithExistingPayroll = async () => {
    setCheckingPayrolls(true);
    try {
      const results = await Promise.all(
        allEmployees.map(async (emp) => {
          try {
            const r = await axiosInstance.get(
              `/payroll/employee/${emp._id}/exists?month=${formData.month}&year=${formData.year}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            return { emp, hasPayroll: !!r.data.exists };
          } catch (e) {
            return { emp, hasPayroll: false };
          }
        })
      );
      const available = results.filter((r) => !r.hasPayroll).map((r) => r.emp);
      setEmployees(available);
      if (
        formData.employeeId &&
        !available.some((e) => e._id === formData.employeeId)
      ) {
        setFormData((prev) => ({ ...prev, employeeId: "" }));
      }
    } catch (err) {
      console.error(err);
      setEmployees(allEmployees);
    } finally {
      setCheckingPayrolls(false);
    }
  };

  const fetchEmployeeLatestPayroll = async (employeeId) => {
    try {
      const res = await axiosInstance.get(
        `/payroll/employee/${employeeId}/latest`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const p = res.data?.data || null;
      setLatestPayroll(p);
      if (p && typeof p.basic === "number") {
        setFormData((prev) => ({
          ...prev,
          basic: p.basic,
          hra: p.hra ?? prev.hra,
        }));
      } else {
        // fallback to profile basic if latest payroll not present
        try {
          const prof = await axiosInstance.get(`/profiles/${employeeId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const basicFromProfile = prof.data?.data?.basicSalary ?? prev.basic;
          setFormData((prev) => ({ ...prev, basic: basicFromProfile }));
        } catch (_) {
          /* ignore */
        }
      }
    } catch (err) {
      console.error("Error fetching latest payroll:", err);
    }
  };

  const fetchEmployeeAttendance = async (employeeId, month, year) => {
    try {
      const res = await axiosInstance.get(
        `/payroll/preview?employeeId=${employeeId}&month=${month}&year=${year}&basic=${
          formData.basic || 0
        }&hra=${formData.hra || 0}&allowances=${JSON.stringify(
          formData.allowances
        )}&deductions=${JSON.stringify(formData.deductions)}&taxPercentage=${
          formData.taxPercentage || 0
        }`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPreview(res.data);
    } catch (err) {
      console.error("Error fetching payroll preview:", err);
      setPreview(null);
      // Fallback to local calculation if API fails
      calculatePreviewLocal();
    }
  };

  // ---------- helpers ----------
  const sumItems = (items) =>
    Array.isArray(items)
      ? items.reduce((s, it) => s + (Number(it.amount) || 0), 0)
      : 0;

  const calculatePreviewLocal = () => {
    if (!formData.employeeId) {
      addNotification("Select employee to preview", "error");
      return;
    }
    const basic = Number(formData.basic || 0);
    const hra = Number(formData.hra || 0);
    const allowancesSum = sumItems(formData.allowances);
    const deductionsSum = sumItems(formData.deductions);
    const tax = Number(formData.tax || 0);

    // daily rate: fixed 31-day denominator as agreed
    const dailyRate = basic / 31;

    // Use backend preview data if available, otherwise use attendanceSummary
    let absent = 0;
    let workingDays = 0;
    let leaveDays = 0;
    let absentDeduction = 0;

    if (preview) {
      absent = preview.absent || 0;
      workingDays = preview.workingDays || 0;
      leaveDays = preview.approvedLeaves || 0;
      absentDeduction = preview.absentDeduction || 0;
    } else if (attendanceSummary) {
      const present = Number(attendanceSummary.present || 0);
      const leave = Number(attendanceSummary.leave || 0);
      const holidays = Number(attendanceSummary.holidays || 0);
      const sundays = Number(attendanceSummary.sundays || 0);
      workingDays = Number(
        attendanceSummary.totalWorkingDays || 31 - (holidays + sundays)
      );
      absent = Number(
        attendanceSummary.absent ?? workingDays - (present + leave)
      );
      if (absent < 0) absent = 0;
      absentDeduction = Math.round(dailyRate * absent);
      leaveDays = leave;
    }

    const totalEarnings = Math.round(basic + hra + allowancesSum);
    const totalDeductions = Math.round(deductionsSum + tax + absentDeduction);
    const net = Math.round(totalEarnings - totalDeductions);

    const previewObj = {
      basic,
      hra,
      allowancesSum,
      deductionsSum,
      tax,
      dailyRate: +dailyRate.toFixed(2),
      workingDays,
      presentDays: workingDays - absent - leaveDays,
      leaveDays,
      absent,
      absentDeduction,
      totalEarnings,
      totalDeductions,
      netPay: net,
    };

    setPreview(previewObj);
    return previewObj;
  };

  // Submit payroll (create)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employeeId)
      return addNotification("Please select an employee", "error");
    setLoading(true);
    try {
      // Build payload expected by backend
      const payload = {
        employeeId: formData.employeeId,
        month: formData.month,
        year: formData.year,
        basic: Number(formData.basic || 0),
        hra: Number(formData.hra || 0),
        allowances: formData.allowances || [],
        deductions: formData.deductions || [],
        taxPercentage: formData.taxPercentage || 0,
      };

      const res = await axiosInstance.post("/payroll/monthly", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      window.location.reload();

      addNotification(res.data?.message || "Payroll created", "success");
      // reset form
      setFormData({
        employeeId: "",
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        basic: 0,
        hra: 0,
        allowances: [],
        deductions: [],
        tax: 0,
        taxPercentage: 0,
      });
      setAttendanceSummary(null);
      setPreview(null);
      setSelectedDepartment("");
      if (onCreate) onCreate(res.data.data);
      onClose();
    } catch (err) {
      console.error("Error creating payroll:", err);
      // addNotification(
      //   err.response?.data?.message || "Error creating payroll",
      //   "error"
      // );
    } finally {
      setLoading(false);
    }
  };

  // UI handlers for allowances & deductions
  const addAllowance = () => {
    if (!currentAllowance.title || !currentAllowance.amount) return;
    setFormData((prev) => ({
      ...prev,
      allowances: [
        ...prev.allowances,
        {
          title: currentAllowance.title,
          amount: Number(currentAllowance.amount),
        },
      ],
    }));
    setCurrentAllowance({ title: "", amount: 0 });
  };
  const removeAllowance = (i) =>
    setFormData((prev) => ({
      ...prev,
      allowances: prev.allowances.filter((_, idx) => idx !== i),
    }));
  const addDeduction = () => {
    if (!currentDeduction.title || !currentDeduction.amount) return;
    setFormData((prev) => ({
      ...prev,
      deductions: [
        ...prev.deductions,
        {
          title: currentDeduction.title,
          amount: Number(currentDeduction.amount),
        },
      ],
    }));
    setCurrentDeduction({ title: "", amount: 0 });
  };
  const removeDeduction = (i) =>
    setFormData((prev) => ({
      ...prev,
      deductions: prev.deductions.filter((_, idx) => idx !== i),
    }));

  // small helpers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (["basic", "hra", "tax", "taxPercentage"].includes(name)) {
      setFormData((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };
  const handleMonthYearChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: Number(value) }));
  const handleDepartmentChange = (e) => {
    setSelectedDepartment(e.target.value);
    setFormData((prev) => ({ ...prev, employeeId: "" }));
  };

  if (!isOpen) return null;

  // computed totals for display
  const totalAllowances = sumItems(formData.allowances);
  const totalDeductions =
    sumItems(formData.deductions) + Number(formData.tax || 0);
  const totalEarnings = Math.round(
    Number(formData.basic || 0) + Number(formData.hra || 0) + totalAllowances
  );
  const netPayDisplay = preview
    ? preview.netPay
    : Math.round(totalEarnings - totalDeductions);

  // month/year lists
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];

  return (
  <div className="min-h-[70vh] p-4 sm:p-6 bg-gray-50">
    <style>{`
      .primary-btn:hover { background: ${PRIMARY_HOVER} !important }
      .primary-border-active { border-bottom-color: ${PRIMARY} !important; color: ${PRIMARY} !important }
    `}</style>

    <NotificationToast notifications={notifications} />

    <header className="mb-6">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
        Attendance Management
      </h1>
      <p className="text-xs sm:text-sm text-gray-600 mt-1">
        Manage employee attendance approvals and records
      </p>
    </header>

    {/* Stats Cards - Responsive Grid */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6">
      {/* Total Employees */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-blue-200">
        <h3 className="text-xs sm:text-sm text-blue-700 font-medium mb-1 sm:mb-2 truncate">Total Employees</h3>
        <p className="text-lg sm:text-xl md:text-2xl font-bold text-blue-900">{stats.totalEmployees ?? 0}</p>
      </div>

      {/* Present Today */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-green-200">
        <h3 className="text-xs sm:text-sm text-green-700 font-medium mb-1 sm:mb-2 truncate">Present Today</h3>
        <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-900">{stats.present ?? 0}</p>
      </div>

      {/* Absent Today */}
      <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-red-200">
        <h3 className="text-xs sm:text-sm text-red-700 font-medium mb-1 sm:mb-2 truncate">Absent Today</h3>
        <p className="text-lg sm:text-xl md:text-2xl font-bold text-red-900">{Math.max(0, stats?.absent ?? 0)}</p>
      </div>

      {/* Pending Approval */}
      <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-yellow-200">
        <h3 className="text-xs sm:text-sm text-yellow-700 font-medium mb-1 sm:mb-2 truncate">Pending Approval</h3>
        <p className="text-lg sm:text-xl md:text-2xl font-bold text-yellow-900">{stats.pending ?? 0}</p>
      </div>
    </div>

    {/* Main Content Card */}
    <div className="bg-white shadow-sm rounded-lg sm:rounded-xl border border-gray-200 mb-6">
      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab("pending")}
            className={`flex items-center py-3 px-4 text-center border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap min-w-max ${
              activeTab === "pending"
                ? "primary-border-active"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            style={
              activeTab === "pending"
                ? { borderBottomColor: PRIMARY, color: PRIMARY }
                : {}
            }
          >
            Pending Approvals
            {pendingAttendances.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px]">
                {pendingAttendances.length}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab("all")}
            className={`py-3 px-4 text-center border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap min-w-max ${
              activeTab === "all"
                ? "primary-border-active"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            style={
              activeTab === "all"
                ? { borderBottomColor: PRIMARY, color: PRIMARY }
                : {}
            }
          >
            All Records
          </button>
          
          <button
            onClick={() => setActiveTab("hr")}
            className={`py-3 px-4 text-center border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap min-w-max ${
              activeTab === "hr"
                ? "primary-border-active"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            style={
              activeTab === "hr"
                ? { borderBottomColor: PRIMARY, color: PRIMARY }
                : {}
            }
          >
            My Attendance
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-4 sm:p-6">
        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Search Employee
            </label>
            <input
              type="text"
              name="employee"
              value={filters.employee}
              onChange={handleFilterChange}
              placeholder="Name or email"
              className="w-full p-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={filters.date}
              onChange={handleFilterChange}
              className="w-full p-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {activeTab === "all" && (
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full p-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          )}
          
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-xs sm:text-sm font-medium transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Pending Tab Content */}
        {activeTab === "pending" && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                Pending Attendance Approvals
              </h2>
              <button
                onClick={fetchPendingAttendances}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-xs sm:text-sm transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-500 mt-2 text-sm">Loading pending requests...</p>
              </div>
            ) : filteredPendingAttendances.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500 text-sm">No pending approvals</p>
              </div>
            ) : (
              <div className="overflow-hidden">
                {/* Mobile Cards View */}
                <div className="block lg:hidden space-y-3">
                  {filteredPendingAttendances.map((attendance) => (
                    <div key={attendance._id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Employee</p>
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {attendance.employee?.profileRef?.firstName} {attendance.employee?.profileRef?.lastName}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Date</p>
                          <p className="text-sm text-gray-700">{formatDate(attendance.date)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Login Time</p>
                          <p className="text-sm text-gray-700">
                            {attendance.checkIn ? formatTime(attendance.checkIn) : "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Status</p>
                          <span className="inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                            Pending
                          </span>
                        </div>
                      </div>

                      {/* Task Description */}
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 font-medium">Task Description</p>
                        <p className="text-sm text-gray-700 line-clamp-2">{attendance.taskDescription || "-"}</p>
                      </div>

                      {/* Work Progress */}
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 font-medium">Work Progress</p>
                        <p className="text-sm text-gray-700">{attendance.workProgress || "-"}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(attendance._id)}
                          className="flex-1 px-3 py-2 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => openRejectModal(attendance._id)}
                          className="flex-1 px-3 py-2 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="w-full min-w-[800px]">
                    <thead className="bg-[#104774] text-white">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase">Employee</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase">Login Time</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase">Task Description</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase">Work Progress</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredPendingAttendances.map((attendance, index) => (
                        <tr key={attendance._id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="px-4 py-3">
                            <div className="font-medium text-sm text-gray-800">
                              {attendance.employee?.profileRef?.firstName} {attendance.employee?.profileRef?.lastName}
                            </div>
                            <div className="text-xs text-gray-500">{attendance.employee?.email}</div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">{formatDate(attendance.date)}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {attendance.checkIn ? formatTime(attendance.checkIn) : "-"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 max-w-[200px]">
                            <div className="truncate" title={attendance.taskDescription}>
                              {attendance.taskDescription || "-"}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">{attendance.workProgress || "-"}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApprove(attendance._id)}
                                className="px-3 py-1.5 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => openRejectModal(attendance._id)}
                                className="px-3 py-1.5 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* All Records Tab Content */}
        {activeTab === "all" && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">All Attendance Records</h2>
              <div className="flex items-center gap-3">
                <span className="text-xs sm:text-sm text-gray-500">
                  Showing {filteredAttendances.length} of {allAttendances.length} records
                </span>
                <button
                  onClick={fetchAllAttendances}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-xs sm:text-sm transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-500 mt-2 text-sm">Loading records...</p>
              </div>
            ) : filteredAttendances.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500 text-sm">No records found</p>
              </div>
            ) : (
              <div className="overflow-hidden">
                {/* Mobile Cards View */}
                <div className="block lg:hidden space-y-3">
                  {filteredAttendances.map((attendance) => (
                    <div key={attendance._id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Employee</p>
                          <p className="text-sm font-medium text-gray-800">
                            {attendance.employee?.profileRef?.firstName} {attendance.employee?.profileRef?.lastName}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Date</p>
                          <p className="text-sm text-gray-700">{formatDate(attendance.date)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Login</p>
                          <p className="text-sm text-gray-700">{formatTime(attendance.checkIn)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Logout</p>
                          <p className="text-sm text-gray-700">{formatTime(attendance.checkOut) || "-"}</p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-xs text-gray-500 font-medium">Status</p>
                        <div className="mt-1">{getStatusBadge(attendance.status)}</div>
                      </div>

                      <div className="mb-3">
                        <p className="text-xs text-gray-500 font-medium">Task</p>
                        <p className="text-sm text-gray-700 line-clamp-2">{attendance.taskDescription || "-"}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="w-full min-w-[1000px]">
                    <thead className="bg-[#104774] text-white">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase">Employee</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase">Login Time</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase">Logout Time</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase">Task</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredAttendances.map((attendance, index) => (
                        <tr key={attendance._id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="px-4 py-3">
                            <div className="font-medium text-sm text-gray-800">
                              {attendance.employee?.profileRef?.firstName} {attendance.employee?.profileRef?.lastName}
                            </div>
                            <div className="text-xs text-gray-500">{attendance.employee?.email}</div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">{formatDate(attendance.date)}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{formatTime(attendance.checkIn)}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{formatTime(attendance.checkOut) || "-"}</td>
                          <td className="px-4 py-3">{getStatusBadge(attendance.status)}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 max-w-[200px]">
                            <div className="truncate" title={attendance.taskDescription}>
                              {attendance.taskDescription || "-"}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* HR Self Attendance Tab */}
        {activeTab === "hr" && (
          <HRAttendanceTab
            token={token}
            addNotification={addNotification}
            user={user}
          />
        )}
      </div>
    </div>

    {/* Reject Modal */}
    <RejectModal
      isOpen={showRejectModal}
      onClose={() => {
        setShowRejectModal(false);
        setRejectRemarks("");
        setSelectedAttendance(null);
      }}
      onReject={handleReject}
      remarks={rejectRemarks}
      setRemarks={setRejectRemarks}
    />
  </div>
);

  // return (
  //   <div className="fixed inset-0 backdrop-blur-sm bg-opacity-40 flex items-center justify-center p-4 z-50">
  //     <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
  //       <div className="flex items-center justify-between mb-6">
  //         <div className="flex items-center gap-4">
  //           <h2 className="text-xl font-semibold text-gray-800">
  //             Create New Payroll
  //           </h2>
  //           {/* keep month/year shown in header but remove visible input fields below */}
  //           <span className="text-gray-600">
  //             {months[formData.month - 1]} {formData.year}
  //           </span>
  //         </div>
  //         <button
  //           onClick={onClose}
  //           className="text-gray-400 hover:text-gray-600"
  //         >
  //           ✖
  //         </button>
  //       </div>

  //       <form onSubmit={handleSubmit} className="space-y-6">
  //         {/* Department & Employee */}
  //         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  //           <div>
  //             <label className="block text-sm font-medium text-gray-700 mb-2">
  //               Department *
  //             </label>
  //             <select
  //               value={selectedDepartment}
  //               onChange={handleDepartmentChange}
  //               required
  //               className="w-full p-3 border border-gray-300 rounded-md"
  //             >
  //               <option value="">Select Department</option>
  //               {departments.map((d) => (
  //                 <option key={d} value={d}>
  //                   {d}
  //                 </option>
  //               ))}
  //             </select>
  //           </div>

  //           <div>
  //             <label className="block text-sm font-medium text-gray-700 mb-2">
  //               Employee *
  //             </label>
  //             <select
  //               name="employeeId"
  //               value={formData.employeeId}
  //               onChange={handleInputChange}
  //               required
  //               disabled={!selectedDepartment || checkingPayrolls}
  //               className="w-full p-3 border border-gray-300 rounded-md"
  //             >
  //               <option value="">Select Employee</option>
  //               {checkingPayrolls ? (
  //                 <option disabled>Checking payroll status...</option>
  //               ) : employees.length === 0 && selectedDepartment ? (
  //                 <option disabled>
  //                   All employees already have payroll for this period
  //                 </option>
  //               ) : (
  //                 employees.map((emp) => (
  //                   <option key={emp._id} value={emp._id}>
  //                     {emp.firstName} {emp.lastName} ({emp.employeeId})
  //                   </option>
  //                 ))
  //               )}
  //             </select>
  //           </div>
  //         </div>

  //         {/* Month/Year Selection (HIDDEN) */}
  //         {/* The visible select inputs were removed per request — month/year remain in formData and are submitted.
  //             If you need to change month/year programmatically, call handleMonthYearChange('month', x) or ('year', y).
  //             We keep hidden inputs so the values are part of the form submission and accessible to any browser-based tooling. */}
  //         <input type="hidden" name="month" value={formData.month} />
  //         <input type="hidden" name="year" value={formData.year} />

  //         {/* Salary Inputs */}
  //         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  //           <div>
  //             <label className="block text-sm font-medium text-gray-700 mb-2">
  //               Basic Salary *
  //             </label>
  //             <input
  //               name="basic"
  //               type="number"
  //               value={formData.basic}
  //               onChange={handleInputChange}
  //               required
  //               min={0}
  //               className="w-full p-3 border border-gray-300 rounded-md"
  //             />
  //           </div>
  //           <div>
  //             <label className="block text-sm font-medium text-gray-700 mb-2">
  //               HRA
  //             </label>
  //             <input
  //               name="hra"
  //               type="number"
  //               value={formData.hra}
  //               onChange={handleInputChange}
  //               min={0}
  //               className="w-full p-3 border border-gray-300 rounded-md"
  //             />
  //           </div>
  //           <div className="grid grid-cols-2 gap-4">
  //             <div>
  //               <label className="block text-sm font-medium text-gray-700 mb-2">
  //                 Tax (%)
  //               </label>
  //               <input
  //                 name="taxPercentage"
  //                 type="number"
  //                 value={formData.taxPercentage}
  //                 onChange={handleInputChange}
  //                 min={0}
  //                 max={100}
  //                 step={0.1}
  //                 className="w-full p-3 border border-gray-300 rounded-md"
  //               />
  //             </div>
  //             <div>
  //               <label className="block text-sm font-medium text-gray-700 mb-2">
  //                 Tax Amount
  //               </label>
  //               <input
  //                 name="tax"
  //                 type="number"
  //                 value={formData.tax}
  //                 onChange={handleInputChange}
  //                 readOnly
  //                 className="w-full p-3 border border-gray-300 rounded-md bg-gray-100"
  //               />
  //             </div>
  //           </div>
  //         </div>

  //         {/* Allowances */}
  //         <div>
  //           <label className="block text-sm font-medium text-gray-700 mb-2">
  //             Allowances
  //           </label>
  //           <div className="space-y-3">
  //             <div className="flex gap-2">
  //               <input
  //                 placeholder="Title"
  //                 value={currentAllowance.title}
  //                 onChange={(e) =>
  //                   setCurrentAllowance((prev) => ({
  //                     ...prev,
  //                     title: e.target.value,
  //                   }))
  //                 }
  //                 className="flex-1 p-2 border rounded"
  //               />
  //               <input
  //                 placeholder="Amount"
  //                 type="number"
  //                 value={currentAllowance.amount}
  //                 onChange={(e) =>
  //                   setCurrentAllowance((prev) => ({
  //                     ...prev,
  //                     amount: Number(e.target.value),
  //                   }))
  //                 }
  //                 className="w-28 p-2 border rounded"
  //               />
  //               <button
  //                 type="button"
  //                 onClick={addAllowance}
  //                 className="px-3 py-2 bg-green-600 text-white rounded"
  //               >
  //                 Add
  //               </button>
  //             </div>
  //             {formData.allowances.map((a, idx) => (
  //               <div
  //                 key={idx}
  //                 className="flex items-center justify-between p-2 bg-gray-50 rounded"
  //               >
  //                 <span>
  //                   {a.title}: ₹{(a.amount || 0).toLocaleString()}
  //                 </span>
  //                 <button
  //                   type="button"
  //                   onClick={() => removeAllowance(idx)}
  //                   className="text-red-600"
  //                 >
  //                   Remove
  //                 </button>
  //               </div>
  //             ))}
  //           </div>
  //         </div>

  //         {/* Deductions */}
  //         <div>
  //           <label className="block text-sm font-medium text-gray-700 mb-2">
  //             Deductions
  //           </label>
  //           <div className="space-y-3">
  //             <div className="flex gap-2">
  //               <input
  //                 placeholder="Title"
  //                 value={currentDeduction.title}
  //                 onChange={(e) =>
  //                   setCurrentDeduction((prev) => ({
  //                     ...prev,
  //                     title: e.target.value,
  //                   }))
  //                 }
  //                 className="flex-1 p-2 border rounded"
  //               />
  //               <input
  //                 placeholder="Amount"
  //                 type="number"
  //                 value={currentDeduction.amount}
  //                 onChange={(e) =>
  //                   setCurrentDeduction((prev) => ({
  //                     ...prev,
  //                     amount: Number(e.target.value),
  //                   }))
  //                 }
  //                 className="w-28 p-2 border rounded"
  //               />
  //               <button
  //                 type="button"
  //                 onClick={addDeduction}
  //                 className="px-3 py-2 bg-green-600 text-white rounded"
  //               >
  //                 Add
  //               </button>
  //             </div>
  //             {formData.deductions.map((d, idx) => (
  //               <div
  //                 key={idx}
  //                 className="flex items-center justify-between p-2 bg-gray-50 rounded"
  //               >
  //                 <span>
  //                   {d.title}: ₹{(d.amount || 0).toLocaleString()}
  //                 </span>
  //                 <button
  //                   type="button"
  //                   onClick={() => removeDeduction(idx)}
  //                   className="text-red-600"
  //                 >
  //                   Remove
  //                 </button>
  //               </div>
  //             ))}
  //           </div>
  //         </div>

  //         <div className="bg-gray-50 p-4 rounded-lg">
  //           <h3 className="text-lg font-semibold mb-3">Salary Breakdown</h3>
  //           <div className="space-y-2">
  //             <div className="flex justify-between">
  //               <span>Basic Salary:</span>
  //               <span>₹{Number(formData.basic || 0).toLocaleString()}</span>
  //             </div>
  //             <div className="flex justify-between">
  //               <span>HRA:</span>
  //               <span>₹{Number(formData.hra || 0).toLocaleString()}</span>
  //             </div>
  //             <div className="flex justify-between">
  //               <span>Allowances:</span>
  //               <span>₹{totalAllowances.toLocaleString()}</span>
  //             </div>
  //             <div className="flex justify-between text-green-600 font-medium">
  //               <span>Total Earnings:</span>
  //               <span>
  //                 ₹
  //                 {(
  //                   Number(formData.basic || 0) +
  //                   Number(formData.hra || 0) +
  //                   totalAllowances
  //                 ).toLocaleString()}
  //               </span>
  //             </div>

  //             <hr className="my-2" />

  //             <div className="flex justify-between">
  //               <span>Deductions:</span>
  //               <span className="text-red-600">
  //                 -₹{sumItems(formData.deductions).toLocaleString()}
  //               </span>
  //             </div>
  //             <div className="flex justify-between">
  //               <span>Tax ({formData.taxPercentage || 0}%):</span>
  //               <span className="text-red-600">
  //                 -₹{Number(formData.tax || 0).toLocaleString()}
  //               </span>
  //             </div>

  //             <div className="flex justify-between text-red-600 font-medium">
  //               <span>Total Deductions:</span>
  //               <span>
  //                 -₹
  //                 {(
  //                   sumItems(formData.deductions) + Number(formData.tax || 0)
  //                 ).toLocaleString()}
  //               </span>
  //             </div>

  //             <hr className="my-2" />

  //             <div className="flex justify-between text-lg font-bold pt-2">
  //               <span>Net Pay:</span>
  //               <span className="text-green-600">
  //                 ₹
  //                 {(
  //                   Number(formData.basic || 0) +
  //                   Number(formData.hra || 0) +
  //                   totalAllowances -
  //                   (sumItems(formData.deductions) + Number(formData.tax || 0))
  //                 ).toLocaleString()}
  //               </span>
  //             </div>
  //           </div>
  //         </div>

  //         {/* Actions */}
  //         <div className="flex justify-end gap-3">
  //           <button
  //             type="button"
  //             onClick={onClose}
  //             className="px-4 py-2 border rounded"
  //           >
  //             Cancel
  //           </button>
  //           <button
  //             type="submit"
  //             disabled={loading || !formData.employeeId}
  //             className="px-4 py-2 rounded text-white"
  //             style={{ backgroundColor: PRIMARY }}
  //           >
  //             {loading ? "Creating..." : "Create Payroll"}
  //           </button>
  //         </div>
  //       </form>
  //     </div>
  //   </div>
  // );
};

export default CreatePayrollModal;
