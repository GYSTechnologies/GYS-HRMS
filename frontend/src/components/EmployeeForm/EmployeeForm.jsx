//sahi code h mst
// import React, { useState } from "react";
// import axiosInstance from "../../utils/axiosInstance";

// // --- Step components moved OUTSIDE of EmployeeForm to keep stable component identity ---
// const Step1Basic = ({
//   formData,
//   errors,
//   handleInputChange,
//   uploadedFiles,
//   handleFileUpload,
//   removeFile,
//   profileImage,
//   handleProfileImageUpload,
//   removeProfileImage
// }) => (
//   <div className="space-y-4">
//     <h2 className="text-xl font-semibold text-gray-800 mb-2">Basic Information</h2>
//     <p className="text-sm text-gray-600 mb-4">Enter the employee's personal details</p>

//     {/* Profile Image Upload */}
//     <div>
//       <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo</label>
//       <div className="flex items-center space-x-4">
//         {profileImage ? (
//           <div className="relative">
//             <img 
//               src={profileImage.url} 
//               alt="Profile preview" 
//               className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
//             />
//             <button
//               type="button"
//               onClick={removeProfileImage}
//               className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs"
//             >
//               ✕
//             </button>
//           </div>
//         ) : (
//           <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
//             <span className="text-gray-500 text-sm">No image</span>
//           </div>
//         )}
//         <div>
//           <input
//             type="file"
//             accept="image/*"
//             onChange={handleProfileImageUpload}
//             className="hidden"
//             id="profile-image-upload"
//           />
//           <label
//             htmlFor="profile-image-upload"
//             className="cursor-pointer text-white px-4 py-2 rounded-lg text-sm hover:bg-[#104774] transition-colors bg-[#104774]"
//           >
//             Upload Photo
//           </label>
//           <p className="text-xs text-gray-500 mt-1">JPG, PNG (Max 5MB)</p>
//         </div>
//       </div>
//     </div>

//     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
//         <input
//           type="text"
//           value={formData.basicInfo.firstName}
//           onChange={e => handleInputChange("basicInfo", "firstName", e.target.value)}
//           className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent ${errors.firstName ? "border-red-500" : "border-gray-300"}`}
//           placeholder="Enter first name"
//         />
//         {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
//       </div>

//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
//         <input
//           type="text"
//           value={formData.basicInfo.lastName}
//           onChange={e => handleInputChange("basicInfo", "lastName", e.target.value)}
//           className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent"
//           placeholder="Enter last name"
//         />
//       </div>
//     </div>

//     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
//         <input
//           type="email"
//           value={formData.basicInfo.email}
//           onChange={e => handleInputChange("basicInfo", "email", e.target.value)}
//           className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent ${errors.email ? "border-red-500" : "border-gray-300"}`}
//           placeholder="employee@company.com"
//         />
//         {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
//       </div>

//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
//         <input
//           type="tel"
//           value={formData.basicInfo.phone}
//           onChange={e => handleInputChange("basicInfo", "phone", e.target.value)}
//           className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent ${errors.phone ? "border-red-500" : "border-gray-300"}`}
//           placeholder="+91 1234567890"
//         />
//         {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
//       </div>
//     </div>

//     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
//         <input
//           type="date"
//           value={formData.basicInfo.dob}
//           onChange={e => handleInputChange("basicInfo", "dob", e.target.value)}
//           className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent ${errors.dob ? "border-red-500" : "border-gray-300"}`}
//         />
//         {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob}</p>}
//       </div>

//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
//         <select
//           value={formData.basicInfo.gender}
//           onChange={e => handleInputChange("basicInfo", "gender", e.target.value)}
//           className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent"
//         >
//           <option value="male">Male</option>
//           <option value="female">Female</option>
//           <option value="other">Other</option>
//         </select>
//       </div>
//     </div>

//     <div>
//       <label className="block text-sm font-medium text-gray-700 mb-1">Documents</label>
//       <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
//         <input
//           type="file"
//           multiple
//           onChange={handleFileUpload}
//           className="hidden"
//           id="document-upload-employee"
//         />
//         <label htmlFor="document-upload-employee" className="cursor-pointer text-[#104774] hover:text-[#104774]">
//           Click to upload documents
//         </label>
//         <p className="text-sm text-gray-500 mt-1">PDF, DOC, DOCX, JPG, PNG (Max 5MB each)</p>
//       </div>

//       {uploadedFiles.length > 0 && (
//         <div className="mt-3">
//           <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Files:</h4>
//           {uploadedFiles.map((file, index) => (
//             <div key={file.name + index} className="flex items-center justify-between bg-gray-50 p-2 rounded mb-1">
//               <span className="text-sm text-gray-700 truncate">{file.name}</span>
//               <button
//                 type="button"
//                 onClick={() => removeFile(index)}
//                 className="text-red-500 hover:text-red-700 text-sm"
//               >
//                 Remove
//               </button>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   </div>
// );

// const Step2Job = ({ formData, errors, handleInputChange }) => (
//   <div className="space-y-4">
//     <h2 className="text-xl font-semibold text-gray-800 mb-2">Job Information</h2>
//     <p className="text-sm text-gray-600 mb-4">Enter the employee's job details</p>

//     <div>
//       <label className="block text-sm font-medium text-gray-700 mb-1">Designation *</label>
//       <input
//         type="text"
//         value={formData.jobInfo.designation}
//         onChange={e => handleInputChange("jobInfo", "designation", e.target.value)}
//         className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent ${errors.designation ? "border-red-500" : "border-gray-300"}`}
//         placeholder="e.g., Software Developer"
//       />
//       {errors.designation && <p className="text-red-500 text-sm mt-1">{errors.designation}</p>}
//     </div>

//     <div>
//       <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
//       <select
//         value={formData.jobInfo.department}
//         onChange={e => handleInputChange("jobInfo", "department", e.target.value)}
//         className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent ${errors.department ? "border-red-500" : "border-gray-300"}`}
//       >
//         <option value="">Select Department</option>
//         <option value="Engineering">Engineering</option>
//         <option value="HR">Human Resources</option>
//         <option value="Finance">Finance</option>
//         <option value="Marketing">Marketing</option>
//         <option value="Sales">Sales</option>
//         <option value="Operations">Operations</option>
//       </select>
//       {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
//     </div>

//     <div>
//       <label className="block text-sm font-medium text-gray-700 mb-1">Date of Joining *</label>
//       <input
//         type="date"
//         value={formData.jobInfo.dateOfJoining}
//         onChange={e => handleInputChange("jobInfo", "dateOfJoining", e.target.value)}
//         className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent ${errors.dateOfJoining ? "border-red-500" : "border-gray-300"}`}
//       />
//       {errors.dateOfJoining && <p className="text-red-500 text-sm mt-1">{errors.dateOfJoining}</p>}
//     </div>
//   </div>
// );

// const Step3Payroll = ({ formData, errors, handleInputChange }) => {
//   const basic = parseFloat(formData.payrollInfo.basic) || 0;
//   const hra = parseFloat(formData.payrollInfo.hra) || 0;
//   const tax = parseFloat(formData.payrollInfo.tax) || 0;
//   const totalEarnings = basic + hra;
//   const netPay = totalEarnings - tax;

//   return (
//     <div className="space-y-4">
//       <h2 className="text-xl font-semibold text-gray-800 mb-2">Payroll Information</h2>
//       <p className="text-sm text-gray-600 mb-4">Set up the employee's salary structure</p>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">Basic Salary *</label>
//           <input
//             type="number"
//             value={formData.payrollInfo.basic}
//             onChange={e => handleInputChange("payrollInfo", "basic", e.target.value)}
//             className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent ${errors.basic ? "border-red-500" : "border-gray-300"}`}
//             placeholder="0.00"
//             min="0"
//           />
//           {errors.basic && <p className="text-red-500 text-sm mt-1">{errors.basic}</p>}
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">HRA</label>
//           <input
//             type="number"
//             value={formData.payrollInfo.hra}
//             onChange={e => handleInputChange("payrollInfo", "hra", e.target.value)}
//             className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent"
//             placeholder="0.00"
//             min="0"
//           />
//         </div>
//       </div>

//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">Tax</label>
//         <input
//           type="number"
//           value={formData.payrollInfo.tax}
//           onChange={e => handleInputChange("payrollInfo", "tax", e.target.value)}
//           className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent"
//           placeholder="0.00"
//           min="0"
//         />
//       </div>

//       {/* Salary Summary */}
//       <div className="bg-gray-50 p-4 rounded-lg mt-4">
//         <h3 className="font-semibold text-gray-800 mb-2">Salary Summary</h3>
//         <div className="space-y-2">
//           <div className="flex justify-between">
//             <span className="text-gray-600">Basic Salary:</span>
//             <span className="font-medium">₹{basic.toLocaleString()}</span>
//           </div>
//           <div className="flex justify-between">
//             <span className="text-gray-600">HRA:</span>
//             <span className="font-medium">₹{hra.toLocaleString()}</span>
//           </div>
//           <div className="flex justify-between border-t border-gray-200 pt-2">
//             <span className="text-gray-600">Total Earnings:</span>
//             <span className="font-medium text-green-600">₹{totalEarnings.toLocaleString()}</span>
//           </div>
//           <div className="flex justify-between">
//             <span className="text-gray-600">Tax Deduction:</span>
//             <span className="font-medium text-red-600">-₹{tax.toLocaleString()}</span>
//           </div>
//           <div className="flex justify-between border-t border-gray-200 pt-2">
//             <span className="text-gray-800 font-semibold">Net Pay:</span>
//             <span className="font-bold text-[#104774]">₹{netPay.toLocaleString()}</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const Step4Credentials = ({ formData, errors, handlePasswordChange, handleRoleChange }) => (
//   <div className="space-y-4">
//     <h2 className="text-xl font-semibold text-gray-800 mb-2">Account Credentials</h2>
//     <p className="text-sm text-gray-600 mb-4">Set up login credentials for the employee</p>

//     <div>
//       <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
//       <div className="p-3 bg-gray-50 rounded-lg border border-gray-300">
//         <span className="text-gray-800">{formData.basicInfo.email}</span>
//       </div>
//       <p className="text-sm text-gray-500 mt-1">This will be the username for login</p>
//     </div>

//     <div>
//       <label className="block text-sm font-medium text-gray-700 mb-1">Create Password *</label>
//       <input
//         type="password"
//         value={formData.password}
//         onChange={handlePasswordChange}
//         className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent ${errors.password ? "border-red-500" : "border-gray-300"}`}
//         placeholder="Enter secure password"
//       />
//       {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
//       <p className="text-sm text-gray-500 mt-1">Minimum 6 characters required</p>
//     </div>

//     <div>
//       <label className="block text-sm font-medium text-gray-700 mb-1">User Role</label>
//       <select
//         value={formData.role}
//         onChange={handleRoleChange}
//         className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent"
//       >
//         <option value="employee">Employee</option>
//         <option value="hr">HR Manager</option>
//       </select>
//       <p className="text-sm text-gray-500 mt-1">
//         {formData.role === "hr"
//           ? "HR managers can manage employees and leave requests"
//           : "Employees can view their profile and submit leave requests"
//         }
//       </p>
//     </div>

//     <div className="bg-[#104774]/10 p-4 rounded-lg border border-[#104774]/40">
//       <h4 className="font-semibold text-[#104774] mb-2">📧 Login Instructions</h4>
//       <p className="text-sm text-[#104774]">
//         The employee will receive an email with these credentials to access their account on their joining date.
//       </p>
//     </div>
//   </div>
// );

// // ------------------ EmployeeForm (main) ------------------
// const EmployeeForm = () => {
//   const [step, setStep] = useState(1);
//   const [formData, setFormData] = useState({
//     basicInfo: {
//       firstName: "",
//       lastName: "",
//       email: "",
//       phone: "",
//       dob: "",
//       gender: "other",
//       documents: [],
//       profileImage: null
//     },
//     jobInfo: {
//       designation: "",
//       department: "",
//       dateOfJoining: "",
//     },
//     payrollInfo: {
//       basic: "",
//       hra: "",
//       tax: "",
//       allowances: [],
//       deductions: [],
//     },
//     password: "",
//     role: "employee",
//   });

//   const [errors, setErrors] = useState({});
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [uploadedFiles, setUploadedFiles] = useState([]);
//   const [profileImage, setProfileImage] = useState(null);

//   // Utility function for uploading files to Cloudinary
//   const uploadFilesToCloudinary = async (files) => {
//     try {
//       const formData = new FormData();
//       files.forEach(file => {
//         formData.append('documents', file.file);
//       });

//       const response = await axiosInstance.post('/upload-files/upload', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });

//       return response.data.files;
//     } catch (error) {
//       console.error('File upload error:', error);
//       throw new Error(error.response?.data?.message || 'Failed to upload files');
//     }
//   };

//   // Validate current step
//   const validateStep = (stepToValidate) => {
//     const newErrors = {};

//     if (stepToValidate === 1) {
//       if (!formData.basicInfo.firstName.trim()) newErrors.firstName = "First name is required";
//       if (!formData.basicInfo.email.trim()) newErrors.email = "Email is required";
//       else if (!/\S+@\S+\.\S+/.test(formData.basicInfo.email)) newErrors.email = "Invalid email format";
//       if (!formData.basicInfo.phone.trim()) newErrors.phone = "Phone number is required";
//       if (!formData.basicInfo.dob) newErrors.dob = "Date of birth is required";
//     }

//     if (stepToValidate === 2) {
//       if (!formData.jobInfo.designation.trim()) newErrors.designation = "Designation is required";
//       if (!formData.jobInfo.department.trim()) newErrors.department = "Department is required";
//       if (!formData.jobInfo.dateOfJoining) newErrors.dateOfJoining = "Date of joining is required";
//     }

//     if (stepToValidate === 3) {
//       if (!formData.payrollInfo.basic || formData.payrollInfo.basic <= 0)
//         newErrors.basic = "Valid basic salary is required";
//     }

//     if (stepToValidate === 4) {
//       if (!formData.password.trim()) newErrors.password = "Password is required";
//       else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleNext = () => {
//     if (validateStep(step)) {
//       setStep(prev => prev + 1);
//     }
//   };

//   const handleBack = () => setStep(prev => Math.max(1, prev - 1));

//   const handleInputChange = (section, field, value) => {
//     setFormData(prev => ({
//       ...prev,
//       [section]: { ...prev[section], [field]: value },
//     }));

//     // Clear error when field is updated
//     if (errors[field]) {
//       setErrors(prev => ({ ...prev, [field]: "" }));
//     }
//   };

//   const handlePasswordChange = (e) => {
//     const value = e.target.value;
//     setFormData(prev => ({ ...prev, password: value }));

//     if (errors.password) {
//       setErrors(prev => ({ ...prev, password: "" }));
//     }
//   };

//   const handleRoleChange = (e) => {
//     const value = e.target.value;
//     setFormData(prev => ({ ...prev, role: value }));
//   };

//   const handleFileUpload = (e) => {
//     const files = Array.from(e.target.files);
//     const newFiles = files.map(file => ({ name: file.name, url: URL.createObjectURL(file), file }));

//     setUploadedFiles(prev => [...prev, ...newFiles]);
//     setFormData(prev => ({
//       ...prev,
//       basicInfo: {
//         ...prev.basicInfo,
//         documents: [...prev.basicInfo.documents, ...files.map(f => ({ name: f.name }))],
//       },
//     }));
//   };

//   const handleProfileImageUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const imageFile = { name: file.name, url: URL.createObjectURL(file), file };
//       setProfileImage(imageFile);
//       setFormData(prev => ({
//         ...prev,
//         basicInfo: {
//           ...prev.basicInfo,
//           profileImage: { name: file.name }
//         },
//       }));
//     }
//   };

//   const removeFile = (index) => {
//     const newFiles = uploadedFiles.filter((_, i) => i !== index);
//     setUploadedFiles(newFiles);
//     setFormData(prev => ({
//       ...prev,
//       basicInfo: { ...prev.basicInfo, documents: newFiles.map(f => ({ name: f.name })) },
//     }));
//   };

//   const removeProfileImage = () => {
//     setProfileImage(null);
//     setFormData(prev => ({
//       ...prev,
//       basicInfo: {
//         ...prev.basicInfo,
//         profileImage: null
//       },
//     }));
//   };

//   const handleSubmit = async () => {
//     if (!validateStep(4)) return;

//     setIsSubmitting(true);

//     try {
//       // Upload profile image first if exists
//       let profileImageData = null;
//       if (profileImage) {
//         const formData = new FormData();
//         formData.append('documents', profileImage.file);
        
//         const response = await axiosInstance.post('/upload-files/upload', formData, {
//           headers: { 'Content-Type': 'multipart/form-data' },
//         });
        
//         if (response.data.files && response.data.files.length > 0) {
//           profileImageData = response.data.files[0];
//         }
//       }

//       // Upload other documents if exist
//       let uploadedFilesData = [];
//       if (uploadedFiles.length > 0) {
//         uploadedFilesData = await uploadFilesToCloudinary(uploadedFiles);
//       }

//       // Prepare the data for employee creation
//       const employeeData = {
//         basicInfo: {
//           ...formData.basicInfo,
//           profileImage: profileImageData,
//           documents: uploadedFilesData,
//         },
//         jobInfo: formData.jobInfo,
//         payrollInfo: formData.payrollInfo,
//         password: formData.password,
//         role: formData.role,
//       };

//       // Send the employee data
//       const res = await axiosInstance.post('/employee/add', {
//         data: JSON.stringify(employeeData)
//       });

//       alert("Employee added successfully!");

//       // Reset form
//       setFormData({
//         basicInfo: {
//           firstName: "",
//           lastName: "",
//           email: "",
//           phone: "",
//           dob: "",
//           gender: "other",
//           documents: [],
//           profileImage: null
//         },
//         jobInfo: { designation: "", department: "", dateOfJoining: "" },
//         payrollInfo: { basic: "", hra: "", tax: "", allowances: [], deductions: [] },
//         password: "",
//         role: "employee",
//       });

//       setUploadedFiles([]);
//       setProfileImage(null);
//       setStep(1);
//     } catch (err) {
//       console.error("Error adding employee:", err);
//       alert(err.response?.data?.message || "Error adding employee");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };


//   // Calculate progress percentage

//   const progress = (step / 4) * 100;

//   return (
//     <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-auto my-8">
//       {/* Header */}
//       <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-2xl font-bold text-gray-800">Add New Employee</h2>
//         </div>

//         {/* Progress Bar */}
//         <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
//           <div className="bg-[#104774] h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
//         </div>

//         {/* Step Indicators */}
//         <div className="flex justify-between mb-2">
//           {["Basic Info", "Job Details", "Payroll", "Credentials"].map((label, index) => (
//             <div
//               key={label}
//               className={`text-xs font-medium ${step > index + 1 ? "text-green-600" : step === index + 1 ? "text-[#104774]" : "text-gray-500"}`}
//             >
//               {label}
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Form Content */}
//       <div className="p-6">
//         {step === 1 && (
//           <Step1Basic
//             formData={formData}
//             errors={errors}
//             handleInputChange={handleInputChange}
//             uploadedFiles={uploadedFiles}
//             handleFileUpload={handleFileUpload}
//             removeFile={removeFile}
//             profileImage={profileImage}
//             handleProfileImageUpload={handleProfileImageUpload}
//             removeProfileImage={removeProfileImage}
//           />
//         )}
//         {step === 2 && <Step2Job formData={formData} errors={errors} handleInputChange={handleInputChange} />}
//         {step === 3 && <Step3Payroll formData={formData} errors={errors} handleInputChange={handleInputChange} />}
//         {step === 4 && (
//           <Step4Credentials
//             formData={formData}
//             errors={errors}
//             handlePasswordChange={handlePasswordChange}
//             handleRoleChange={handleRoleChange}
//           />
//         )}
//       </div>

//       {/* Footer */}
//       <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-xl">
//         <div className="flex justify-between">
//           {step > 1 ? (
//             <button
//               onClick={handleBack}
//               className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
//               disabled={isSubmitting}
//             >
//               ← Back
//             </button>
//           ) : (
//             <div />
//           )}

//           {step < 4 ? (
//             <button onClick={handleNext} className="px-6 py-3 bg-[#104774] text-white rounded-lg hover:bg-[#104774] transition-colors">
//               Next →
//             </button>
//           ) : (
//             <button
//               onClick={handleSubmit}
//               disabled={isSubmitting}
//               className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors"
//             >
//               {isSubmitting ? (
//                 <span className="flex items-center">
//                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
//                   Creating Employee...
//                 </span>
//               ) : (
//                 "Create Employee"
//               )}
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EmployeeForm;




//payrrol me allwoncae wageraa add kiyaa hu 
// import React, { useState } from "react";
// import axiosInstance from "../../utils/axiosInstance";

// // --- Step components moved OUTSIDE of EmployeeForm to keep stable component identity ---
// const Step1Basic = ({
//   formData,
//   errors,
//   handleInputChange,
//   uploadedFiles,
//   handleFileUpload,
//   removeFile,
//   profileImage,
//   handleProfileImageUpload,
//   removeProfileImage
// }) => (
//   <div className="space-y-4">
//     <h2 className="text-xl font-semibold text-gray-800 mb-2">Basic Information</h2>
//     <p className="text-sm text-gray-600 mb-4">Enter the employee's personal details</p>

//     {/* Profile Image Upload */}
//     <div>
//       <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo</label>
//       <div className="flex items-center space-x-4">
//         {profileImage ? (
//           <div className="relative">
//             <img 
//               src={profileImage.url} 
//               alt="Profile preview" 
//               className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
//             />
//             <button
//               type="button"
//               onClick={removeProfileImage}
//               className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs"
//             >
//               ✕
//             </button>
//           </div>
//         ) : (
//           <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
//             <span className="text-gray-500 text-sm">No image</span>
//           </div>
//         )}
//         <div>
//           <input
//             type="file"
//             accept="image/*"
//             onChange={handleProfileImageUpload}
//             className="hidden"
//             id="profile-image-upload"
//           />
//           <label
//             htmlFor="profile-image-upload"
//             className="cursor-pointer text-white px-4 py-2 rounded-lg text-sm hover:bg-[#104774] transition-colors bg-[#104774]"
//           >
//             Upload Photo
//           </label>
//           <p className="text-xs text-gray-500 mt-1">JPG, PNG (Max 5MB)</p>
//         </div>
//       </div>
//     </div>

//     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
//         <input
//           type="text"
//           value={formData.basicInfo.firstName}
//           onChange={e => handleInputChange("basicInfo", "firstName", e.target.value)}
//           className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent ${errors.firstName ? "border-red-500" : "border-gray-300"}`}
//           placeholder="Enter first name"
//         />
//         {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
//       </div>

//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
//         <input
//           type="text"
//           value={formData.basicInfo.lastName}
//           onChange={e => handleInputChange("basicInfo", "lastName", e.target.value)}
//           className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent"
//           placeholder="Enter last name"
//         />
//       </div>
//     </div>

//     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
//         <input
//           type="email"
//           value={formData.basicInfo.email}
//           onChange={e => handleInputChange("basicInfo", "email", e.target.value)}
//           className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent ${errors.email ? "border-red-500" : "border-gray-300"}`}
//           placeholder="employee@company.com"
//         />
//         {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
//       </div>

//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
//         <input
//           type="tel"
//           value={formData.basicInfo.phone}
//           onChange={e => handleInputChange("basicInfo", "phone", e.target.value)}
//           className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent ${errors.phone ? "border-red-500" : "border-gray-300"}`}
//           placeholder="+91 1234567890"
//         />
//         {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
//       </div>
//     </div>

//     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
//         <input
//           type="date"
//           value={formData.basicInfo.dob}
//           onChange={e => handleInputChange("basicInfo", "dob", e.target.value)}
//           className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent ${errors.dob ? "border-red-500" : "border-gray-300"}`}
//         />
//         {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob}</p>}
//       </div>

//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
//         <select
//           value={formData.basicInfo.gender}
//           onChange={e => handleInputChange("basicInfo", "gender", e.target.value)}
//           className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent"
//         >
//           <option value="male">Male</option>
//           <option value="female">Female</option>
//           <option value="other">Other</option>
//         </select>
//       </div>
//     </div>

//     <div>
//       <label className="block text-sm font-medium text-gray-700 mb-1">Documents</label>
//       <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
//         <input
//           type="file"
//           multiple
//           onChange={handleFileUpload}
//           className="hidden"
//           id="document-upload-employee"
//         />
//         <label htmlFor="document-upload-employee" className="cursor-pointer text-[#104774] hover:text-[#104774]">
//           Click to upload documents
//         </label>
//         <p className="text-sm text-gray-500 mt-1">PDF, DOC, DOCX, JPG, PNG (Max 5MB each)</p>
//       </div>

//       {uploadedFiles.length > 0 && (
//         <div className="mt-3">
//           <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Files:</h4>
//           {uploadedFiles.map((file, index) => (
//             <div key={file.name + index} className="flex items-center justify-between bg-gray-50 p-2 rounded mb-1">
//               <span className="text-sm text-gray-700 truncate">{file.name}</span>
//               <button
//                 type="button"
//                 onClick={() => removeFile(index)}
//                 className="text-red-500 hover:text-red-700 text-sm"
//               >
//                 Remove
//               </button>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   </div>
// );

// const Step2Job = ({ formData, errors, handleInputChange }) => (
//   <div className="space-y-4">
//     <h2 className="text-xl font-semibold text-gray-800 mb-2">Job Information</h2>
//     <p className="text-sm text-gray-600 mb-4">Enter the employee's job details</p>

//     <div>
//       <label className="block text-sm font-medium text-gray-700 mb-1">Designation *</label>
//       <input
//         type="text"
//         value={formData.jobInfo.designation}
//         onChange={e => handleInputChange("jobInfo", "designation", e.target.value)}
//         className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent ${errors.designation ? "border-red-500" : "border-gray-300"}`}
//         placeholder="e.g., Software Developer"
//       />
//       {errors.designation && <p className="text-red-500 text-sm mt-1">{errors.designation}</p>}
//     </div>

//     <div>
//       <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
//       <select
//         value={formData.jobInfo.department}
//         onChange={e => handleInputChange("jobInfo", "department", e.target.value)}
//         className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent ${errors.department ? "border-red-500" : "border-gray-300"}`}
//       >
//         <option value="">Select Department</option>
//         <option value="Engineering">Engineering</option>
//         <option value="HR">Human Resources</option>
//         <option value="Finance">Finance</option>
//         <option value="Marketing">Marketing</option>
//         <option value="Sales">Sales</option>
//         <option value="Operations">Operations</option>
//       </select>
//       {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
//     </div>

//     <div>
//       <label className="block text-sm font-medium text-gray-700 mb-1">Date of Joining *</label>
//       <input
//         type="date"
//         value={formData.jobInfo.dateOfJoining}
//         onChange={e => handleInputChange("jobInfo", "dateOfJoining", e.target.value)}
//         className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent ${errors.dateOfJoining ? "border-red-500" : "border-gray-300"}`}
//       />
//       {errors.dateOfJoining && <p className="text-red-500 text-sm mt-1">{errors.dateOfJoining}</p>}
//     </div>
//   </div>
// );

// const Step3Payroll = ({ formData, errors, handleInputChange, handleAddAllowance, handleRemoveAllowance, handleAddDeduction, handleRemoveDeduction }) => {
//   const basic = parseFloat(formData.payrollInfo.basic) || 0;
//   const hra = parseFloat(formData.payrollInfo.hra) || 0;
//   const tax = parseFloat(formData.payrollInfo.tax) || 0;
  
//   // Calculate total allowances
//   const totalAllowances = formData.payrollInfo.allowances.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  
//   // Calculate total deductions (including tax)
//   const totalDeductions = formData.payrollInfo.deductions.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0) + tax;
  
//   const totalEarnings = basic + hra + totalAllowances;
//   const netPay = totalEarnings - totalDeductions;

//   return (
//     <div className="space-y-4">
//       <h2 className="text-xl font-semibold text-gray-800 mb-2">Payroll Information</h2>
//       <p className="text-sm text-gray-600 mb-4">Set up the employee's salary structure</p>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">Basic Salary *</label>
//           <input
//             type="number"
//             value={formData.payrollInfo.basic}
//             onChange={e => handleInputChange("payrollInfo", "basic", e.target.value)}
//             className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent ${errors.basic ? "border-red-500" : "border-gray-300"}`}
//             placeholder="0.00"
//             min="0"
//           />
//           {errors.basic && <p className="text-red-500 text-sm mt-1">{errors.basic}</p>}
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">HRA</label>
//           <input
//             type="number"
//             value={formData.payrollInfo.hra}
//             onChange={e => handleInputChange("payrollInfo", "hra", e.target.value)}
//             className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent"
//             placeholder="0.00"
//             min="0"
//           />
//         </div>
//       </div>

//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">Tax</label>
//         <input
//           type="number"
//           value={formData.payrollInfo.tax}
//           onChange={e => handleInputChange("payrollInfo", "tax", e.target.value)}
//           className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent"
//           placeholder="0.00"
//           min="0"
//         />
//       </div>

//       {/* Allowances Section */}
//       <div>
//         <div className="flex justify-between items-center mb-2">
//           <label className="block text-sm font-medium text-gray-700">Allowances</label>
//           <button
//             type="button"
//             onClick={handleAddAllowance}
//             className="text-sm text-[#104774] hover:text-[#104774] font-medium"
//           >
//             + Add Allowance
//           </button>
//         </div>
        
//         {formData.payrollInfo.allowances.map((allowance, index) => (
//           <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
//             <input
//               type="text"
//               value={allowance.title}
//               onChange={e => {
//                 const newAllowances = [...formData.payrollInfo.allowances];
//                 newAllowances[index].title = e.target.value;
//                 handleInputChange("payrollInfo", "allowances", newAllowances);
//               }}
//               className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent"
//               placeholder="Allowance title"
//             />
//             <input
//               type="number"
//               value={allowance.amount}
//               onChange={e => {
//                 const newAllowances = [...formData.payrollInfo.allowances];
//                 newAllowances[index].amount = e.target.value;
//                 handleInputChange("payrollInfo", "allowances", newAllowances);
//               }}
//               className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent"
//               placeholder="Amount"
//               min="0"
//             />
//             <button
//               type="button"
//               onClick={() => handleRemoveAllowance(index)}
//               className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
//             >
//               Remove
//             </button>
//           </div>
//         ))}
//       </div>

//       {/* Deductions Section */}
//       <div>
//         <div className="flex justify-between items-center mb-2">
//           <label className="block text-sm font-medium text-gray-700">Deductions</label>
//           <button
//             type="button"
//             onClick={handleAddDeduction}
//             className="text-sm text-[#104774] hover:text-[#104774] font-medium"
//           >
//             + Add Deduction
//           </button>
//         </div>
        
//         {formData.payrollInfo.deductions.map((deduction, index) => (
//           <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
//             <input
//               type="text"
//               value={deduction.title}
//               onChange={e => {
//                 const newDeductions = [...formData.payrollInfo.deductions];
//                 newDeductions[index].title = e.target.value;
//                 handleInputChange("payrollInfo", "deductions", newDeductions);
//               }}
//               className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent"
//               placeholder="Deduction title"
//             />
//             <input
//               type="number"
//               value={deduction.amount}
//               onChange={e => {
//                 const newDeductions = [...formData.payrollInfo.deductions];
//                 newDeductions[index].amount = e.target.value;
//                 handleInputChange("payrollInfo", "deductions", newDeductions);
//               }}
//               className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent"
//               placeholder="Amount"
//               min="0"
//             />
//             <button
//               type="button"
//               onClick={() => handleRemoveDeduction(index)}
//               className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
//             >
//               Remove
//             </button>
//           </div>
//         ))}
//       </div>

//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">Payroll Month *</label>
//         <input
//           type="month"
//           value={formData.payrollInfo.month}
//           onChange={e => handleInputChange("payrollInfo", "month", e.target.value)}
//           className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent ${errors.month ? "border-red-500" : "border-gray-300"}`}
//         />
//         {errors.month && <p className="text-red-500 text-sm mt-1">{errors.month}</p>}
//       </div>

//       {/* Salary Summary */}
//       <div className="bg-gray-50 p-4 rounded-lg mt-4">
//         <h3 className="font-semibold text-gray-800 mb-2">Salary Summary</h3>
//         <div className="space-y-2">
//           <div className="flex justify-between">
//             <span className="text-gray-600">Basic Salary:</span>
//             <span className="font-medium">₹{basic.toLocaleString()}</span>
//           </div>
//           <div className="flex justify-between">
//             <span className="text-gray-600">HRA:</span>
//             <span className="font-medium">₹{hra.toLocaleString()}</span>
//           </div>
//           {formData.payrollInfo.allowances.map((allowance, index) => (
//             <div key={index} className="flex justify-between">
//               <span className="text-gray-600">{allowance.title || "Allowance"}:</span>
//               <span className="font-medium">₹{(parseFloat(allowance.amount) || 0).toLocaleString()}</span>
//             </div>
//           ))}
//           <div className="flex justify-between border-t border-gray-200 pt-2">
//             <span className="text-gray-600">Total Earnings:</span>
//             <span className="font-medium text-green-600">₹{totalEarnings.toLocaleString()}</span>
//           </div>
//           <div className="flex justify-between">
//             <span className="text-gray-600">Tax Deduction:</span>
//             <span className="font-medium text-red-600">-₹{tax.toLocaleString()}</span>
//           </div>
//           {formData.payrollInfo.deductions.map((deduction, index) => (
//             <div key={index} className="flex justify-between">
//               <span className="text-gray-600">{deduction.title || "Deduction"}:</span>
//               <span className="font-medium text-red-600">-₹{(parseFloat(deduction.amount) || 0).toLocaleString()}</span>
//             </div>
//           ))}
//           <div className="flex justify-between border-t border-gray-200 pt-2">
//             <span className="text-gray-800 font-semibold">Net Pay:</span>
//             <span className="font-bold text-[#104774]">₹{netPay.toLocaleString()}</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const Step4Credentials = ({ formData, errors, handlePasswordChange, handleRoleChange }) => (
//   <div className="space-y-4">
//     <h2 className="text-xl font-semibold text-gray-800 mb-2">Account Credentials</h2>
//     <p className="text-sm text-gray-600 mb-4">Set up login credentials for the employee</p>

//     <div>
//       <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
//       <div className="p-3 bg-gray-50 rounded-lg border border-gray-300">
//         <span className="text-gray-800">{formData.basicInfo.email}</span>
//       </div>
//       <p className="text-sm text-gray-500 mt-1">This will be the username for login</p>
//     </div>

//     <div>
//       <label className="block text-sm font-medium text-gray-700 mb-1">Create Password *</label>
//       <input
//         type="password"
//         value={formData.password}
//         onChange={handlePasswordChange}
//         className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent ${errors.password ? "border-red-500" : "border-gray-300"}`}
//         placeholder="Enter secure password"
//       />
//       {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
//       <p className="text-sm text-gray-500 mt-1">Minimum 6 characters required</p>
//     </div>

//     <div>
//       <label className="block text-sm font-medium text-gray-700 mb-1">User Role</label>
//       <select
//         value={formData.role}
//         onChange={handleRoleChange}
//         className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent"
//       >
//         <option value="employee">Employee</option>
//         <option value="hr">HR Manager</option>
//       </select>
//       <p className="text-sm text-gray-500 mt-1">
//         {formData.role === "hr"
//           ? "HR managers can manage employees and leave requests"
//           : "Employees can view their profile and submit leave requests"
//         }
//       </p>
//     </div>

//     <div className="bg-[#104774]/10 p-4 rounded-lg border border-[#104774]/40">
//       <h4 className="font-semibold text-[#104774] mb-2">📧 Login Instructions</h4>
//       <p className="text-sm text-[#104774]">
//         The employee will receive an email with these credentials to access their account on their joining date.
//       </p>
//     </div>
//   </div>
// );

// // ------------------ EmployeeForm (main) ------------------
// const EmployeeForm = () => {
//   const [step, setStep] = useState(1);
//   const [formData, setFormData] = useState({
//     basicInfo: {
//       firstName: "",
//       lastName: "",
//       email: "",
//       phone: "",
//       dob: "",
//       gender: "other",
//       documents: [],
//       profileImage: null
//     },
//     jobInfo: {
//       designation: "",
//       department: "",
//       dateOfJoining: "",
//     },
//     payrollInfo: {
//       basic: "",
//       hra: "",
//       tax: "",
//       allowances: [],
//       deductions: [],
//       month: new Date().toISOString().slice(0, 7), // Default to current month (yyyy-mm)
//       status: "draft" // Default status as draft
//     },
//     password: "",
//     role: "employee",
//   });

//   const [errors, setErrors] = useState({});
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [uploadedFiles, setUploadedFiles] = useState([]);
//   const [profileImage, setProfileImage] = useState(null);

//   // Utility function for uploading files to Cloudinary
//   const uploadFilesToCloudinary = async (files) => {
//     try {
//       const formData = new FormData();
//       files.forEach(file => {
//         formData.append('documents', file.file);
//       });

//       const response = await axiosInstance.post('/upload-files/upload', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });

//       return response.data.files;
//     } catch (error) {
//       console.error('File upload error:', error);
//       throw new Error(error.response?.data?.message || 'Failed to upload files');
//     }
//   };

//   // Validate current step
//   const validateStep = (stepToValidate) => {
//     const newErrors = {};

//     if (stepToValidate === 1) {
//       if (!formData.basicInfo.firstName.trim()) newErrors.firstName = "First name is required";
//       if (!formData.basicInfo.email.trim()) newErrors.email = "Email is required";
//       else if (!/\S+@\S+\.\S+/.test(formData.basicInfo.email)) newErrors.email = "Invalid email format";
//       if (!formData.basicInfo.phone.trim()) newErrors.phone = "Phone number is required";
//       if (!formData.basicInfo.dob) newErrors.dob = "Date of birth is required";
//     }

//     if (stepToValidate === 2) {
//       if (!formData.jobInfo.designation.trim()) newErrors.designation = "Designation is required";
//       if (!formData.jobInfo.department.trim()) newErrors.department = "Department is required";
//       if (!formData.jobInfo.dateOfJoining) newErrors.dateOfJoining = "Date of joining is required";
//     }

//     if (stepToValidate === 3) {
//       if (!formData.payrollInfo.basic || formData.payrollInfo.basic <= 0)
//         newErrors.basic = "Valid basic salary is required";
//       if (!formData.payrollInfo.month) newErrors.month = "Payroll month is required";
//     }

//     if (stepToValidate === 4) {
//       if (!formData.password.trim()) newErrors.password = "Password is required";
//       else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleNext = () => {
//     if (validateStep(step)) {
//       setStep(prev => prev + 1);
//     }
//   };

//   const handleBack = () => setStep(prev => Math.max(1, prev - 1));

//   const handleInputChange = (section, field, value) => {
//     setFormData(prev => ({
//       ...prev,
//       [section]: { ...prev[section], [field]: value },
//     }));

//     // Clear error when field is updated
//     if (errors[field]) {
//       setErrors(prev => ({ ...prev, [field]: "" }));
//     }
//   };

//   const handlePasswordChange = (e) => {
//     const value = e.target.value;
//     setFormData(prev => ({ ...prev, password: value }));

//     if (errors.password) {
//       setErrors(prev => ({ ...prev, password: "" }));
//     }
//   };

//   const handleRoleChange = (e) => {
//     const value = e.target.value;
//     setFormData(prev => ({ ...prev, role: value }));
//   };

//   const handleFileUpload = (e) => {
//     const files = Array.from(e.target.files);
//     const newFiles = files.map(file => ({ name: file.name, url: URL.createObjectURL(file), file }));

//     setUploadedFiles(prev => [...prev, ...newFiles]);
//     setFormData(prev => ({
//       ...prev,
//       basicInfo: {
//         ...prev.basicInfo,
//         documents: [...prev.basicInfo.documents, ...files.map(f => ({ name: f.name }))],
//       },
//     }));
//   };

//   const handleProfileImageUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const imageFile = { name: file.name, url: URL.createObjectURL(file), file };
//       setProfileImage(imageFile);
//       setFormData(prev => ({
//         ...prev,
//         basicInfo: {
//           ...prev.basicInfo,
//           profileImage: { name: file.name }
//         },
//       }));
//     }
//   };

//   const removeFile = (index) => {
//     const newFiles = uploadedFiles.filter((_, i) => i !== index);
//     setUploadedFiles(newFiles);
//     setFormData(prev => ({
//       ...prev,
//       basicInfo: { ...prev.basicInfo, documents: newFiles.map(f => ({ name: f.name })) },
//     }));
//   };

//   const removeProfileImage = () => {
//     setProfileImage(null);
//     setFormData(prev => ({
//       ...prev,
//       basicInfo: {
//         ...prev.basicInfo,
//         profileImage: null
//       },
//     }));
//   };

//   // Allowance and Deduction handlers
//   const handleAddAllowance = () => {
//     setFormData(prev => ({
//       ...prev,
//       payrollInfo: {
//         ...prev.payrollInfo,
//         allowances: [...prev.payrollInfo.allowances, { title: "", amount: 0 }]
//       }
//     }));
//   };

//   const handleRemoveAllowance = (index) => {
//     setFormData(prev => ({
//       ...prev,
//       payrollInfo: {
//         ...prev.payrollInfo,
//         allowances: prev.payrollInfo.allowances.filter((_, i) => i !== index)
//       }
//     }));
//   };

//   const handleAddDeduction = () => {
//     setFormData(prev => ({
//       ...prev,
//       payrollInfo: {
//         ...prev.payrollInfo,
//         deductions: [...prev.payrollInfo.deductions, { title: "", amount: 0 }]
//       }
//     }));
//   };

//   const handleRemoveDeduction = (index) => {
//     setFormData(prev => ({
//       ...prev,
//       payrollInfo: {
//         ...prev.payrollInfo,
//         deductions: prev.payrollInfo.deductions.filter((_, i) => i !== index)
//       }
//     }));
//   };

//   const handleSubmit = async () => {
//     if (!validateStep(4)) return;

//     setIsSubmitting(true);

//     try {
//       // Upload profile image first if exists
//       let profileImageData = null;
//       if (profileImage) {
//         const formData = new FormData();
//         formData.append('documents', profileImage.file);
        
//         const response = await axiosInstance.post('/upload-files/upload', formData, {
//           headers: { 'Content-Type': 'multipart/form-data' },
//         });
        
//         if (response.data.files && response.data.files.length > 0) {
//           profileImageData = response.data.files[0];
//         }
//       }

//       // Upload other documents if exist
//       let uploadedFilesData = [];
//       if (uploadedFiles.length > 0) {
//         uploadedFilesData = await uploadFilesToCloudinary(uploadedFiles);
//       }

//       // Prepare the data for employee creation
//       const employeeData = {
//         basicInfo: {
//           ...formData.basicInfo,
//           profileImage: profileImageData,
//           documents: uploadedFilesData,
//         },
//         jobInfo: formData.jobInfo,
//         payrollInfo: formData.payrollInfo,
//         password: formData.password,
//         role: formData.role,
//       };

//       // Send the employee data
//       const res = await axiosInstance.post('/employee/add', {
//         data: JSON.stringify(employeeData)
//       });

//       alert("Employee added successfully!");

//       // Reset form
//       setFormData({
//         basicInfo: {
//           firstName: "",
//           lastName: "",
//           email: "",
//           phone: "",
//           dob: "",
//           gender: "other",
//           documents: [],
//           profileImage: null
//         },
//         jobInfo: { designation: "", department: "", dateOfJoining: "" },
//         payrollInfo: { 
//           basic: "", 
//           hra: "", 
//           tax: "", 
//           allowances: [], 
//           deductions: [],
//           month: new Date().toISOString().slice(0, 7),
//           status: "draft"
//         },
//         password: "",
//         role: "employee",
//       });

//       setUploadedFiles([]);
//       setProfileImage(null);
//       setStep(1);
//     } catch (err) {
//       console.error("Error adding employee:", err);
//       alert(err.response?.data?.message || "Error adding employee");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // Calculate progress percentage
//   const progress = (step / 4) * 100;

//   return (
//     <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-auto my-8">
//       {/* Header */}
//       <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-2xl font-bold text-gray-800">Add New Employee</h2>
//         </div>

//         {/* Progress Bar */}
//         <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
//           <div className="bg-[#104774] h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
//         </div>

//         {/* Step Indicators */}
//         <div className="flex justify-between mb-2">
//           {["Basic Info", "Job Details", "Payroll", "Credentials"].map((label, index) => (
//             <div
//               key={label}
//               className={`text-xs font-medium ${step > index + 1 ? "text-green-600" : step === index + 1 ? "text-[#104774]" : "text-gray-500"}`}
//             >
//               {label}
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Form Content */}
//       <div className="p-6">
//         {step === 1 && (
//           <Step1Basic
//             formData={formData}
//             errors={errors}
//             handleInputChange={handleInputChange}
//             uploadedFiles={uploadedFiles}
//             handleFileUpload={handleFileUpload}
//             removeFile={removeFile}
//             profileImage={profileImage}
//             handleProfileImageUpload={handleProfileImageUpload}
//             removeProfileImage={removeProfileImage}
//           />
//         )}
//         {step === 2 && <Step2Job formData={formData} errors={errors} handleInputChange={handleInputChange} />}
//         {step === 3 && (
//           <Step3Payroll 
//             formData={formData} 
//             errors={errors} 
//             handleInputChange={handleInputChange}
//             handleAddAllowance={handleAddAllowance}
//             handleRemoveAllowance={handleRemoveAllowance}
//             handleAddDeduction={handleAddDeduction}
//             handleRemoveDeduction={handleRemoveDeduction}
//           />
//         )}
//         {step === 4 && (
//           <Step4Credentials
//             formData={formData}
//             errors={errors}
//             handlePasswordChange={handlePasswordChange}
//             handleRoleChange={handleRoleChange}
//           />
//         )}
//       </div>

//       {/* Footer */}
//       <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-xl">
//         <div className="flex justify-between">
//           {step > 1 ? (
//             <button
//               onClick={handleBack}
//               className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
//               disabled={isSubmitting}
//             >
//               ← Back
//             </button>
//           ) : (
//             <div />
//           )}

//           {step < 4 ? (
//             <button onClick={handleNext} className="px-6 py-3 bg-[#104774] text-white rounded-lg hover:bg-[#104774] transition-colors">
//               Next →
//             </button>
//           ) : (
//             <button
//               onClick={handleSubmit}
//               disabled={isSubmitting}
//               className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors"
//             >
//               {isSubmitting ? (
//                 <span className="flex items-center">
//                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
//                   Creating Employee...
//                 </span>
//               ) : (
//                 "Create Employee"
//               )}
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EmployeeForm;




//this is the correct code 
// import React, { useState, useEffect } from "react";
// import axiosInstance from "../../utils/axiosInstance";

// // --- Step components ---
// const Step1Basic = ({
//   formData,
//   errors,
//   handleInputChange,
//   uploadedFiles,
//   handleFileUpload,
//   removeFile,
//   profileImage,
//   handleProfileImageUpload,
//   removeProfileImage,
//   isEditMode = false
// }) => (
//   <div className="space-y-4">
//     <h2 className="text-xl font-semibold text-gray-800 mb-2">Basic Information</h2>
//     <p className="text-sm text-gray-600 mb-4">Enter the employee's personal details</p>

//     {/* Profile Image Upload */}
//     <div>
//       <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo</label>
//       <div className="flex items-center space-x-4">
//         {profileImage ? (
//           <div className="relative">
//             <img 
//               src={profileImage.url} 
//               alt="Profile preview" 
//               className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
//             />
//             <button
//               type="button"
//               onClick={removeProfileImage}
//               className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs"
//             >
//               ✕
//             </button>
//           </div>
//         ) : (
//           <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
//             <span className="text-gray-500 text-sm">No image</span>
//           </div>
//         )}
//         <div>
//           <input
//             type="file"
//             accept="image/*"
//             onChange={handleProfileImageUpload}
//             className="hidden"
//             id="profile-image-upload"
//           />
//           <label
//             htmlFor="profile-image-upload"
//             className="cursor-pointer text-white px-4 py-2 rounded-lg text-sm hover:bg-[#104774] transition-colors bg-[#104774]"
//           >
//             {profileImage ? "Change Photo" : "Upload Photo"}
//           </label>
//           <p className="text-xs text-gray-500 mt-1">JPG, PNG (Max 5MB)</p>
//         </div>
//       </div>
//     </div>

//     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
//         <input
//           type="text"
//           value={formData.basicInfo.firstName}
//           onChange={e => handleInputChange("basicInfo", "firstName", e.target.value)}
//           className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent ${errors.firstName ? "border-red-500" : "border-gray-300"}`}
//           placeholder="Enter first name"
//         />
//         {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
//       </div>

//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
//         <input
//           type="text"
//           value={formData.basicInfo.lastName}
//           onChange={e => handleInputChange("basicInfo", "lastName", e.target.value)}
//           className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent"
//           placeholder="Enter last name"
//         />
//       </div>
//     </div>

//     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
//         <input
//           type="email"
//           value={formData.basicInfo.email}
//           onChange={e => handleInputChange("basicInfo", "email", e.target.value)}
//           className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent ${errors.email ? "border-red-500" : "border-gray-300"}`}
//           placeholder="employee@company.com"
//           disabled={isEditMode}
//         />
//         {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
//         {isEditMode && <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>}
//       </div>

//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
//         <input
//           type="tel"
//           value={formData.basicInfo.phone}
//           onChange={e => handleInputChange("basicInfo", "phone", e.target.value)}
//           className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent ${errors.phone ? "border-red-500" : "border-gray-300"}`}
//           placeholder="+91 1234567890"
//         />
//         {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
//       </div>
//     </div>

//     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
//         <input
//           type="date"
//           value={formData.basicInfo.dob}
//           onChange={e => handleInputChange("basicInfo", "dob", e.target.value)}
//           className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent ${errors.dob ? "border-red-500" : "border-gray-300"}`}
//         />
//         {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob}</p>}
//       </div>

//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
//         <select
//           value={formData.basicInfo.gender}
//           onChange={e => handleInputChange("basicInfo", "gender", e.target.value)}
//           className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent"
//         >
//           <option value="male">Male</option>
//           <option value="female">Female</option>
//           <option value="other">Other</option>
//         </select>
//       </div>
//     </div>

//     <div>
//       <label className="block text-sm font-medium text-gray-700 mb-1">Documents</label>
//       <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
//         <input
//           type="file"
//           multiple
//           onChange={handleFileUpload}
//           className="hidden"
//           id="document-upload-employee"
//         />
//         <label htmlFor="document-upload-employee" className="cursor-pointer text-[#104774] hover:text-[#104774]">
//           Click to upload documents
//         </label>
//         <p className="text-sm text-gray-500 mt-1">PDF, DOC, DOCX, JPG, PNG (Max 5MB each)</p>
//       </div>

//       {uploadedFiles.length > 0 && (
//         <div className="mt-3">
//           <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Files:</h4>
//           {uploadedFiles.map((file, index) => (
//             <div key={file.name + index} className="flex items-center justify-between bg-gray-50 p-2 rounded mb-1">
//               <span className="text-sm text-gray-700 truncate">{file.name}</span>
//               <button
//                 type="button"
//                 onClick={() => removeFile(index)}
//                 className="text-red-500 hover:text-red-700 text-sm"
//               >
//                 Remove
//               </button>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   </div>
// );

// const Step2Job = ({ formData, errors, handleInputChange, isEditMode = false }) => (
//   <div className="space-y-4">
//     <h2 className="text-xl font-semibold text-gray-800 mb-2">Job Information</h2>
//     <p className="text-sm text-gray-600 mb-4">Enter the employee's job details</p>

//     <div>
//       <label className="block text-sm font-medium text-gray-700 mb-1">Designation *</label>
//       <input
//         type="text"
//         value={formData.jobInfo.designation}
//         onChange={e => handleInputChange("jobInfo", "designation", e.target.value)}
//         className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent ${errors.designation ? "border-red-500" : "border-gray-300"}`}
//         placeholder="e.g., Software Developer"
//       />
//       {errors.designation && <p className="text-red-500 text-sm mt-1">{errors.designation}</p>}
//     </div>

//     <div>
//       <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
//       <select
//         value={formData.jobInfo.department}
//         onChange={e => handleInputChange("jobInfo", "department", e.target.value)}
//         className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent ${errors.department ? "border-red-500" : "border-gray-300"}`}
//       >
//         <option value="">Select Department</option>
//         <option value="Engineering">Engineering</option>
//         <option value="HR">Human Resources</option>
//         <option value="Finance">Finance</option>
//         <option value="Marketing">Marketing</option>
//         <option value="Sales">Sales</option>
//         <option value="Operations">Operations</option>
//       </select>
//       {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
//     </div>

//     <div>
//       <label className="block text-sm font-medium text-gray-700 mb-1">Date of Joining *</label>
//       <input
//         type="date"
//         value={formData.jobInfo.dateOfJoining}
//         onChange={e => handleInputChange("jobInfo", "dateOfJoining", e.target.value)}
//         className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent ${errors.dateOfJoining ? "border-red-500" : "border-gray-300"}`}
//         disabled={isEditMode}
//       />
//       {errors.dateOfJoining && <p className="text-red-500 text-sm mt-1">{errors.dateOfJoining}</p>}
//       {isEditMode && <p className="text-xs text-gray-500 mt-1">Joining date cannot be changed</p>}
//     </div>
//   </div>
// );

// const Step3Payroll = ({ formData, errors, handleInputChange, handleAddAllowance, handleRemoveAllowance, handleAddDeduction, handleRemoveDeduction, isEditMode = false }) => {
//   const basic = parseFloat(formData.payrollInfo.basic) || 0;
//   const hra = parseFloat(formData.payrollInfo.hra) || 0;
//   const tax = parseFloat(formData.payrollInfo.tax) || 0;
  
//   // Calculate total allowances
//   const totalAllowances = formData.payrollInfo.allowances.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  
//   // Calculate total deductions (including tax)
//   const totalDeductions = formData.payrollInfo.deductions.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0) + tax;
  
//   const totalEarnings = basic + hra + totalAllowances;
//   const netPay = totalEarnings - totalDeductions;

//   return (
//     <div className="space-y-4">
//       <h2 className="text-xl font-semibold text-gray-800 mb-2">Payroll Information</h2>
//       <p className="text-sm text-gray-600 mb-4">Set up the employee's salary structure</p>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">Basic Salary *</label>
//           <input
//             type="number"
//             value={formData.payrollInfo.basic}
//             onChange={e => handleInputChange("payrollInfo", "basic", e.target.value)}
//             className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent ${errors.basic ? "border-red-500" : "border-gray-300"}`}
//             placeholder="0.00"
//             min="0"
//           />
//           {errors.basic && <p className="text-red-500 text-sm mt-1">{errors.basic}</p>}
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">HRA</label>
//           <input
//             type="number"
//             value={formData.payrollInfo.hra}
//             onChange={e => handleInputChange("payrollInfo", "hra", e.target.value)}
//             className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent"
//             placeholder="0.00"
//             min="0"
//           />
//         </div>
//       </div>

//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">Tax</label>
//         <input
//           type="number"
//           value={formData.payrollInfo.tax}
//           onChange={e => handleInputChange("payrollInfo", "tax", e.target.value)}
//           className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent"
//           placeholder="0.00"
//           min="0"
//         />
//       </div>

//       {/* Allowances Section */}
//       <div>
//         <div className="flex justify-between items-center mb-2">
//           <label className="block text-sm font-medium text-gray-700">Allowances</label>
//           <button
//             type="button"
//             onClick={handleAddAllowance}
//             className="text-sm text-[#104774] hover:text-[#104774] font-medium"
//           >
//             + Add Allowance
//           </button>
//         </div>
        
//         {formData.payrollInfo.allowances.map((allowance, index) => (
//           <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
//             <input
//               type="text"
//               value={allowance.title}
//               onChange={e => {
//                 const newAllowances = [...formData.payrollInfo.allowances];
//                 newAllowances[index].title = e.target.value;
//                 handleInputChange("payrollInfo", "allowances", newAllowances);
//               }}
//               className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent"
//               placeholder="Allowance title"
//             />
//             <input
//               type="number"
//               value={allowance.amount}
//               onChange={e => {
//                 const newAllowances = [...formData.payrollInfo.allowances];
//                 newAllowances[index].amount = e.target.value;
//                 handleInputChange("payrollInfo", "allowances", newAllowances);
//               }}
//               className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent"
//               placeholder="Amount"
//               min="0"
//             />
//             <button
//               type="button"
//               onClick={() => handleRemoveAllowance(index)}
//               className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
//             >
//               Remove
//             </button>
//           </div>
//         ))}
//       </div>

//       {/* Deductions Section */}
//       <div>
//         <div className="flex justify-between items-center mb-2">
//           <label className="block text-sm font-medium text-gray-700">Deductions</label>
//           <button
//             type="button"
//             onClick={handleAddDeduction}
//             className="text-sm text-[#104774] hover:text-[#104774] font-medium"
//           >
//             + Add Deduction
//           </button>
//         </div>
        
//         {formData.payrollInfo.deductions.map((deduction, index) => (
//           <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
//             <input
//               type="text"
//               value={deduction.title}
//               onChange={e => {
//                 const newDeductions = [...formData.payrollInfo.deductions];
//                 newDeductions[index].title = e.target.value;
//                 handleInputChange("payrollInfo", "deductions", newDeductions);
//               }}
//               className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent"
//               placeholder="Deduction title"
//             />
//             <input
//               type="number"
//               value={deduction.amount}
//               onChange={e => {
//                 const newDeductions = [...formData.payrollInfo.deductions];
//                 newDeductions[index].amount = e.target.value;
//                 handleInputChange("payrollInfo", "deductions", newDeductions);
//               }}
//               className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent"
//               placeholder="Amount"
//               min="0"
//             />
//             <button
//               type="button"
//               onClick={() => handleRemoveDeduction(index)}
//               className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
//             >
//               Remove
//             </button>
//           </div>
//         ))}
//       </div>

//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">Payroll Month *</label>
//         <input
//           type="month"
//           value={formData.payrollInfo.month}
//           onChange={e => handleInputChange("payrollInfo", "month", e.target.value)}
//           className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent ${errors.month ? "border-red-500" : "border-gray-300"}`}
//         />
//         {errors.month && <p className="text-red-500 text-sm mt-1">{errors.month}</p>}
//       </div>

//       {/* Salary Summary */}
//       <div className="bg-gray-50 p-4 rounded-lg mt-4">
//         <h3 className="font-semibold text-gray-800 mb-2">Salary Summary</h3>
//         <div className="space-y-2">
//           <div className="flex justify-between">
//             <span className="text-gray-600">Basic Salary:</span>
//             <span className="font-medium">₹{basic.toLocaleString()}</span>
//           </div>
//           <div className="flex justify-between">
//             <span className="text-gray-600">HRA:</span>
//             <span className="font-medium">₹{hra.toLocaleString()}</span>
//           </div>
//           {formData.payrollInfo.allowances.map((allowance, index) => (
//             <div key={index} className="flex justify-between">
//               <span className="text-gray-600">{allowance.title || "Allowance"}:</span>
//               <span className="font-medium">₹{(parseFloat(allowance.amount) || 0).toLocaleString()}</span>
//             </div>
//           ))}
//           <div className="flex justify-between border-t border-gray-200 pt-2">
//             <span className="text-gray-600">Total Earnings:</span>
//             <span className="font-medium text-green-600">₹{totalEarnings.toLocaleString()}</span>
//           </div>
//           <div className="flex justify-between">
//             <span className="text-gray-600">Tax Deduction:</span>
//             <span className="font-medium text-red-600">-₹{tax.toLocaleString()}</span>
//           </div>
//           {formData.payrollInfo.deductions.map((deduction, index) => (
//             <div key={index} className="flex justify-between">
//               <span className="text-gray-600">{deduction.title || "Deduction"}:</span>
//               <span className="font-medium text-red-600">-₹{(parseFloat(deduction.amount) || 0).toLocaleString()}</span>
//             </div>
//           ))}
//           <div className="flex justify-between border-t border-gray-200 pt-2">
//             <span className="text-gray-800 font-semibold">Net Pay:</span>
//             <span className="font-bold text-[#104774]">₹{netPay.toLocaleString()}</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const Step4Credentials = ({ formData, errors, handlePasswordChange, handleRoleChange, isEditMode = false }) => (
//   <div className="space-y-4">
//     <h2 className="text-xl font-semibold text-gray-800 mb-2">Account Credentials</h2>
//     <p className="text-sm text-gray-600 mb-4">
//       {isEditMode ? "Update employee's login credentials" : "Set up login credentials for the employee"}
//     </p>

//     <div>
//       <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
//       <div className="p-3 bg-gray-50 rounded-lg border border-gray-300">
//         <span className="text-gray-800">{formData.basicInfo.email}</span>
//       </div>
//       <p className="text-sm text-gray-500 mt-1">This will be the username for login</p>
//     </div>

//     {!isEditMode && (
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">Create Password *</label>
//         <input
//           type="password"
//           value={formData.password}
//           onChange={handlePasswordChange}
//           className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent ${errors.password ? "border-red-500" : "border-gray-300"}`}
//           placeholder="Enter secure password"
//         />
//         {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
//         <p className="text-sm text-gray-500 mt-1">Minimum 6 characters required</p>
//       </div>
//     )}

//     <div>
//       <label className="block text-sm font-medium text-gray-700 mb-1">User Role</label>
//       <select
//         value={formData.role}
//         onChange={handleRoleChange}
//         className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent"
//       >
//         <option value="employee">Employee</option>
//         <option value="hr">HR Manager</option>
//       </select>
//       <p className="text-sm text-gray-500 mt-1">
//         {formData.role === "hr"
//           ? "HR managers can manage employees and leave requests"
//           : "Employees can view their profile and submit leave requests"
//         }
//       </p>
//     </div>

//     {!isEditMode && (
//       <div className="bg-[#104774]/10 p-4 rounded-lg border border-[#104774]/40">
//         <h4 className="font-semibold text-[#104774] mb-2">📧 Login Instructions</h4>
//         <p className="text-sm text-[#104774]">
//           The employee will receive an email with these credentials to access their account on their joining date.
//         </p>
//       </div>
//     )}
//   </div>
// );

// // ------------------ EmployeeForm (main) ------------------
// const EmployeeForm = ({ onClose, employee, isEditMode = false }) => {
//   const [step, setStep] = useState(1);
//   const [formData, setFormData] = useState({
//     basicInfo: {
//       firstName: "",
//       lastName: "",
//       email: "",
//       phone: "",
//       dob: "",
//       gender: "other",
//       documents: [],
//       profileImage: null
//     },
//     jobInfo: {
//       designation: "",
//       department: "",
//       dateOfJoining: "",
//     },
//     payrollInfo: {
//       basic: "",
//       hra: "",
//       tax: "",
//       allowances: [],
//       deductions: [],
//       month: new Date().toISOString().slice(0, 7),
//       status: "draft"
//     },
//     password: "",
//     role: "employee",
//   });

//   const [errors, setErrors] = useState({});
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [uploadedFiles, setUploadedFiles] = useState([]);
//   const [profileImage, setProfileImage] = useState(null);

//   // Pre-fill form when in edit mode
//   useEffect(() => {
//     if (isEditMode && employee) {
//       setFormData(prev => ({
//         ...prev,
//         basicInfo: {
//           firstName: employee.firstName || "",
//           lastName: employee.lastName || "",
//           email: employee.user?.email || "",
//           phone: employee.phone || "",
//           dob: employee.dob ? employee.dob.split('T')[0] : "",
//           gender: employee.gender || "other",
//           documents: employee.documents || [],
//           profileImage: employee.avatarUrl ? { url: employee.avatarUrl } : null
//         },
//         jobInfo: {
//           designation: employee.designation || "",
//           department: employee.department || "",
//           dateOfJoining: employee.dateOfJoining ? employee.dateOfJoining.split('T')[0] : "",
//         },
//         // Note: You might need to fetch payroll data separately
//         role: employee.user?.role || "employee",
//       }));

//       if (employee.avatarUrl) {
//         setProfileImage({ url: employee.avatarUrl });
//       }
//     }
//   }, [isEditMode, employee]);

//   // Utility function for uploading files to Cloudinary
//   const uploadFilesToCloudinary = async (files) => {
//     try {
//       const formData = new FormData();
//       files.forEach(file => {
//         formData.append('documents', file.file);
//       });

//       const response = await axiosInstance.post('/upload-files/upload', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });

//       return response.data.files;
//     } catch (error) {
//       console.error('File upload error:', error);
//       throw new Error(error.response?.data?.message || 'Failed to upload files');
//     }
//   };

//   // Validate current step
//   const validateStep = (stepToValidate) => {
//     const newErrors = {};

//     if (stepToValidate === 1) {
//       if (!formData.basicInfo.firstName.trim()) newErrors.firstName = "First name is required";
//       if (!formData.basicInfo.email.trim()) newErrors.email = "Email is required";
//       else if (!/\S+@\S+\.\S+/.test(formData.basicInfo.email)) newErrors.email = "Invalid email format";
//       if (!formData.basicInfo.phone.trim()) newErrors.phone = "Phone number is required";
//       if (!formData.basicInfo.dob) newErrors.dob = "Date of birth is required";
//     }

//     if (stepToValidate === 2) {
//       if (!formData.jobInfo.designation.trim()) newErrors.designation = "Designation is required";
//       if (!formData.jobInfo.department.trim()) newErrors.department = "Department is required";
//       if (!formData.jobInfo.dateOfJoining) newErrors.dateOfJoining = "Date of joining is required";
//     }

//     if (stepToValidate === 3) {
//       if (!formData.payrollInfo.basic || formData.payrollInfo.basic <= 0)
//         newErrors.basic = "Valid basic salary is required";
//       if (!formData.payrollInfo.month) newErrors.month = "Payroll month is required";
//     }

//     if (stepToValidate === 4 && !isEditMode) {
//       if (!formData.password.trim()) newErrors.password = "Password is required";
//       else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleNext = () => {
//     if (validateStep(step)) {
//       setStep(prev => prev + 1);
//     }
//   };

//   const handleBack = () => setStep(prev => Math.max(1, prev - 1));

//   const handleInputChange = (section, field, value) => {
//     setFormData(prev => ({
//       ...prev,
//       [section]: { ...prev[section], [field]: value },
//     }));

//     // Clear error when field is updated
//     if (errors[field]) {
//       setErrors(prev => ({ ...prev, [field]: "" }));
//     }
//   };

//   const handlePasswordChange = (e) => {
//     const value = e.target.value;
//     setFormData(prev => ({ ...prev, password: value }));

//     if (errors.password) {
//       setErrors(prev => ({ ...prev, password: "" }));
//     }
//   };

//   const handleRoleChange = (e) => {
//     const value = e.target.value;
//     setFormData(prev => ({ ...prev, role: value }));
//   };

//   const handleFileUpload = (e) => {
//     const files = Array.from(e.target.files);
//     const newFiles = files.map(file => ({ name: file.name, url: URL.createObjectURL(file), file }));

//     setUploadedFiles(prev => [...prev, ...newFiles]);
//     setFormData(prev => ({
//       ...prev,
//       basicInfo: {
//         ...prev.basicInfo,
//         documents: [...prev.basicInfo.documents, ...files.map(f => ({ name: f.name }))],
//       },
//     }));
//   };

//   const handleProfileImageUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const imageFile = { name: file.name, url: URL.createObjectURL(file), file };
//       setProfileImage(imageFile);
//       setFormData(prev => ({
//         ...prev,
//         basicInfo: {
//           ...prev.basicInfo,
//           profileImage: { name: file.name }
//         },
//       }));
//     }
//   };

//   const removeFile = (index) => {
//     const newFiles = uploadedFiles.filter((_, i) => i !== index);
//     setUploadedFiles(newFiles);
//     setFormData(prev => ({
//       ...prev,
//       basicInfo: { ...prev.basicInfo, documents: newFiles.map(f => ({ name: f.name })) },
//     }));
//   };

//   const removeProfileImage = () => {
//     setProfileImage(null);
//     setFormData(prev => ({
//       ...prev,
//       basicInfo: {
//         ...prev.basicInfo,
//         profileImage: null
//       },
//     }));
//   };

//   // Allowance and Deduction handlers
//   const handleAddAllowance = () => {
//     setFormData(prev => ({
//       ...prev,
//       payrollInfo: {
//         ...prev.payrollInfo,
//         allowances: [...prev.payrollInfo.allowances, { title: "", amount: 0 }]
//       }
//     }));
//   };

//   const handleRemoveAllowance = (index) => {
//     setFormData(prev => ({
//       ...prev,
//       payrollInfo: {
//         ...prev.payrollInfo,
//         allowances: prev.payrollInfo.allowances.filter((_, i) => i !== index)
//       }
//     }));
//   };

//   const handleAddDeduction = () => {
//     setFormData(prev => ({
//       ...prev,
//       payrollInfo: {
//         ...prev.payrollInfo,
//         deductions: [...prev.payrollInfo.deductions, { title: "", amount: 0 }]
//       }
//     }));
//   };

//   const handleRemoveDeduction = (index) => {
//     setFormData(prev => ({
//       ...prev,
//       payrollInfo: {
//         ...prev.payrollInfo,
//         deductions: prev.payrollInfo.deductions.filter((_, i) => i !== index)
//       }
//     }));
//   };

//   const handleSubmit = async () => {
//     if (!validateStep(4)) return;

//     setIsSubmitting(true);

//     try {
//       // Upload profile image first if exists
//       let profileImageData = null;
//       if (profileImage && profileImage.file) {
//         const formData = new FormData();
//         formData.append('documents', profileImage.file);
        
//         const response = await axiosInstance.post('/upload-files/upload', formData, {
//           headers: { 'Content-Type': 'multipart/form-data' },
//         });
        
//         if (response.data.files && response.data.files.length > 0) {
//           profileImageData = response.data.files[0];
//         }
//       }

//       // Upload other documents if exist
//       let uploadedFilesData = [];
//       if (uploadedFiles.length > 0) {
//         uploadedFilesData = await uploadFilesToCloudinary(uploadedFiles);
//       }

//       // Prepare the data for employee creation
//       const employeeData = {
//         basicInfo: {
//           ...formData.basicInfo,
//           profileImage: profileImageData || formData.basicInfo.profileImage,
//           documents: uploadedFilesData.length > 0 ? uploadedFilesData : formData.basicInfo.documents,
//         },
//         jobInfo: formData.jobInfo,
//         payrollInfo: formData.payrollInfo,
//         password: formData.password,
//         role: formData.role,
//       };

//       // Send the employee data
//       const res = await axiosInstance.post('/employee/add', {
//         data: JSON.stringify(employeeData)
//       });

//       alert("Employee added successfully!");
//       onClose();
//     } catch (err) {
//       console.error("Error adding employee:", err);
//       alert(err.response?.data?.message || "Error adding employee");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // const handleUpdate = async () => {
//   //   if (!validateStep(4)) return;

//   //   setIsSubmitting(true);

//   //   try {
//   //     // Upload profile image first if exists
//   //     let profileImageData = null;
//   //     if (profileImage && profileImage.file) {
//   //       const formData = new FormData();
//   //       formData.append('documents', profileImage.file);
        
//   //       const response = await axiosInstance.post('/upload-files/upload', formData, {
//   //         headers: { 'Content-Type': 'multipart/form-data' },
//   //       });
        
//   //       if (response.data.files && response.data.files.length > 0) {
//   //         profileImageData = response.data.files[0];
//   //       }
//   //     }

//   //     // Upload other documents if exist
//   //     let uploadedFilesData = [];
//   //     if (uploadedFiles.length > 0) {
//   //       uploadedFilesData = await uploadFilesToCloudinary(uploadedFiles);
//   //     }

//   //     // Prepare the data for employee update
//   //     const employeeData = {
//   //       basicInfo: {
//   //         ...formData.basicInfo,
//   //         profileImage: profileImageData || formData.basicInfo.profileImage,
//   //         documents: uploadedFilesData.length > 0 ? [...formData.basicInfo.documents, ...uploadedFilesData] : formData.basicInfo.documents,
//   //       },
//   //       jobInfo: formData.jobInfo,
//   //       payrollInfo: formData.payrollInfo,
//   //       role: formData.role,
//   //     };

//   //     // Send the employee data for update
//   //     const res = await axiosInstance.put(`/employee/update/${employee._id}`, {
//   //       data: JSON.stringify(employeeData)
//   //     });

//   //     alert("Employee updated successfully!");
//   //     onClose();
//   //   } catch (err) {
//   //     console.error("Error updating employee:", err);
//   //     alert(err.response?.data?.message || "Error updating employee");
//   //   } finally {
//   //     setIsSubmitting(false);
//   //   }
//   // };

//   // Calculate progress percentage
  
//   const handleUpdate = async () => {
//   if (!validateStep(4)) return;

//   setIsSubmitting(true);

//   try {
//     // Upload profile image first if exists
//     let profileImageData = null;
//     if (profileImage && profileImage.file) {
//       const formData = new FormData();
//       formData.append('documents', profileImage.file);
      
//       const response = await axiosInstance.post('/upload-files/upload', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });
      
//       if (response.data.files && response.data.files.length > 0) {
//         profileImageData = response.data.files[0];
//       }
//     }

//     // Upload other documents if exist
//     let uploadedFilesData = [];
//     if (uploadedFiles.length > 0) {
//       uploadedFilesData = await uploadFilesToCloudinary(uploadedFiles);
//     }

//     // Prepare the data for employee update (same format as add)
//     const employeeData = {
//       basicInfo: {
//         ...formData.basicInfo,
//         profileImage: profileImageData || formData.basicInfo.profileImage,
//         documents: uploadedFilesData.length > 0 ? uploadedFilesData : formData.basicInfo.documents,
//       },
//       jobInfo: formData.jobInfo,
//       payrollInfo: formData.payrollInfo,
//     };

//     // Send the employee data for update (using the same format as add)
//     const res = await axiosInstance.put(`/employee/update/${employee._id}`, {
//       data: JSON.stringify(employeeData) // Stringify the data like in add
//     });

//     alert("Employee updated successfully!");
//     onClose();
//   } catch (err) {
//     console.error("Error updating employee:", err);
//     alert(err.response?.data?.message || "Error updating employee");
//   } finally {
//     setIsSubmitting(false);
//   }
// };

// const progress = (step / 4) * 100;

//   return (
//     <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-auto my-8 relative">
//       {/* Close Button */}
//       <button
//         onClick={onClose}
//         className="absolute top-4 right-4 z-10 bg-gray-200 hover:bg-gray-300 rounded-full p-2"
//       >
//         ✕
//       </button>

//       {/* Header */}
//       <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-2xl font-bold text-gray-800">
//             {isEditMode ? "Edit Employee" : "Add New Employee"}
//           </h2>
//         </div>

//         {/* Progress Bar */}
//         <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
//           <div className="bg-[#104774] h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
//         </div>

//         {/* Step Indicators */}
//         <div className="flex justify-between mb-2">
//           {["Basic Info", "Job Details", "Payroll", "Credentials"].map((label, index) => (
//             <div
//               key={label}
//               className={`text-xs font-medium ${step > index + 1 ? "text-green-600" : step === index + 1 ? "text-[#104774]" : "text-gray-500"}`}
//             >
//               {label}
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Form Content */}
//       <div className="p-6">
//         {step === 1 && (
//           <Step1Basic
//             formData={formData}
//             errors={errors}
//             handleInputChange={handleInputChange}
//             uploadedFiles={uploadedFiles}
//             handleFileUpload={handleFileUpload}
//             removeFile={removeFile}
//             profileImage={profileImage}
//             handleProfileImageUpload={handleProfileImageUpload}
//             removeProfileImage={removeProfileImage}
//             isEditMode={isEditMode}
//           />
//         )}
//         {step === 2 && (
//           <Step2Job 
//             formData={formData} 
//             errors={errors} 
//             handleInputChange={handleInputChange} 
//             isEditMode={isEditMode}
//           />
//         )}
//         {step === 3 && (
//           <Step3Payroll 
//             formData={formData} 
//             errors={errors} 
//             handleInputChange={handleInputChange}
//             handleAddAllowance={handleAddAllowance}
//             handleRemoveAllowance={handleRemoveAllowance}
//             handleAddDeduction={handleAddDeduction}
//             handleRemoveDeduction={handleRemoveDeduction}
//             isEditMode={isEditMode}
//           />
//         )}
//         {step === 4 && (
//           <Step4Credentials
//             formData={formData}
//             errors={errors}
//             handlePasswordChange={handlePasswordChange}
//             handleRoleChange={handleRoleChange}
//             isEditMode={isEditMode}
//           />
//         )}
//       </div>

//       {/* Footer */}
//       <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-xl">
//         <div className="flex justify-between">
//           {step > 1 ? (
//             <button
//               onClick={handleBack}
//               className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
//               disabled={isSubmitting}
//             >
//               ← Back
//             </button>
//           ) : (
//             <div />
//           )}

//           {step < 4 ? (
//             <button onClick={handleNext} className="px-6 py-3 bg-[#104774] text-white rounded-lg hover:bg-[#104774] transition-colors">
//               Next →
//             </button>
//           ) : (
//             <button
//               onClick={isEditMode ? handleUpdate : handleSubmit}
//               disabled={isSubmitting}
//               className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors"
//             >
//               {isSubmitting ? (
//                 <span className="flex items-center">
//                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
//                   {isEditMode ? "Updating..." : "Creating..."}
//                 </span>
//               ) : (
//                 isEditMode ? "Update Employee" : "Create Employee"
//               )}
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EmployeeForm;


import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";

// --- Step components ---
const Step1Basic = ({
  formData,
  errors,
  handleInputChange,
  uploadedFiles,
  handleFileUpload,
  removeFile,
  profileImage,
  handleProfileImageUpload,
  removeProfileImage,
  isEditMode = false
}) => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold text-gray-800 mb-2">Basic Information</h2>
    <p className="text-sm text-gray-600 mb-4">Enter the employee's personal details</p>

    {/* Profile Image Upload */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo</label>
      <div className="flex items-center space-x-4">
        {profileImage ? (
          <div className="relative">
            <img 
              src={profileImage.url} 
              alt="Profile preview" 
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
            />
            <button
              type="button"
              onClick={removeProfileImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500 text-sm">No image</span>
          </div>
        )}
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={handleProfileImageUpload}
            className="hidden"
            id="profile-image-upload"
          />
          <label
            htmlFor="profile-image-upload"
            className="cursor-pointer text-white px-4 py-2 rounded-lg text-sm hover:bg-[#104774] transition-colors bg-[#104774]"
          >
            {profileImage ? "Change Photo" : "Upload Photo"}
          </label>
          <p className="text-xs text-gray-500 mt-1">JPG, PNG (Max 5MB)</p>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
        <input
          type="text"
          value={formData.basicInfo.firstName}
          onChange={e => handleInputChange("basicInfo", "firstName", e.target.value)}
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent ${errors.firstName ? "border-red-500" : "border-gray-300"}`}
          placeholder="Enter first name"
        />
        {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
        <input
          type="text"
          value={formData.basicInfo.lastName}
          onChange={e => handleInputChange("basicInfo", "lastName", e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent"
          placeholder="Enter last name"
        />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
        <input
          type="email"
          value={formData.basicInfo.email}
          onChange={e => handleInputChange("basicInfo", "email", e.target.value)}
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent ${errors.email ? "border-red-500" : "border-gray-300"}`}
          placeholder="employee@company.com"
          disabled={isEditMode}
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        {isEditMode && <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
        <input
          type="tel"
          value={formData.basicInfo.phone}
          onChange={e => handleInputChange("basicInfo", "phone", e.target.value)}
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent ${errors.phone ? "border-red-500" : "border-gray-300"}`}
          placeholder="+91 1234567890"
        />
        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
        <input
          type="date"
          value={formData.basicInfo.dob}
          onChange={e => handleInputChange("basicInfo", "dob", e.target.value)}
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent ${errors.dob ? "border-red-500" : "border-gray-300"}`}
        />
        {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
        <select
          value={formData.basicInfo.gender}
          onChange={e => handleInputChange("basicInfo", "gender", e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent"
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>
    </div>

    {/* NEW: Address Field */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
      <textarea
        value={formData.basicInfo.address || ""}
        onChange={e => handleInputChange("basicInfo", "address", e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent"
        placeholder="Enter complete address"
        rows="3"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Documents</label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
        <input
          type="file"
          multiple
          onChange={handleFileUpload}
          className="hidden"
          id="document-upload-employee"
        />
        <label htmlFor="document-upload-employee" className="cursor-pointer text-[#104774] hover:text-[#104774]">
          Click to upload documents
        </label>
        <p className="text-sm text-gray-500 mt-1">PDF, DOC, DOCX, JPG, PNG (Max 5MB each)</p>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="mt-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Files:</h4>
          {uploadedFiles.map((file, index) => (
            <div key={file.name + index} className="flex items-center justify-between bg-gray-50 p-2 rounded mb-1">
              <span className="text-sm text-gray-700 truncate">{file.name}</span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

const Step2Job = ({ formData, errors, handleInputChange, isEditMode = false }) => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold text-gray-800 mb-2">Job Information</h2>
    <p className="text-sm text-gray-600 mb-4">Enter the employee's job details</p>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Designation *</label>
      <input
        type="text"
        value={formData.jobInfo.designation}
        onChange={e => handleInputChange("jobInfo", "designation", e.target.value)}
        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent ${errors.designation ? "border-red-500" : "border-gray-300"}`}
        placeholder="e.g., Software Developer"
      />
      {errors.designation && <p className="text-red-500 text-sm mt-1">{errors.designation}</p>}
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
      <select
        value={formData.jobInfo.department}
        onChange={e => handleInputChange("jobInfo", "department", e.target.value)}
        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent ${errors.department ? "border-red-500" : "border-gray-300"}`}
      >
        <option value="">Select Department</option>
        <option value="Engineering">Engineering</option>
        <option value="HR">Human Resources</option>
        <option value="Finance">Finance</option>
        <option value="Marketing">Marketing</option>
        <option value="Sales">Sales</option>
        <option value="Operations">Operations</option>
      </select>
      {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Date of Joining *</label>
      <input
        type="date"
        value={formData.jobInfo.dateOfJoining}
        onChange={e => handleInputChange("jobInfo", "dateOfJoining", e.target.value)}
        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent ${errors.dateOfJoining ? "border-red-500" : "border-gray-300"}`}
        disabled={isEditMode}
      />
      {errors.dateOfJoining && <p className="text-red-500 text-sm mt-1">{errors.dateOfJoining}</p>}
      {isEditMode && <p className="text-xs text-gray-500 mt-1">Joining date cannot be changed</p>}
    </div>

    {/* NEW: Employment Type Field */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
      <select
        value={formData.jobInfo.employmentType || "full-time"}
        onChange={e => handleInputChange("jobInfo", "employmentType", e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent"
      >
        <option value="full-time">Full Time</option>
        <option value="intern">Intern</option>
        <option value="part-time">Part Time</option>
        <option value="contract">Contract</option>
      </select>
    </div>

    {/* NEW: Work Mode Field */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Work Mode</label>
      <select
        value={formData.jobInfo.workMode || "work-from-home"}
        onChange={e => handleInputChange("jobInfo", "workMode", e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent"
      >
        <option value="work-from-home">Work From Home</option>
        <option value="work-from-office">Work From Office</option>
        <option value="hybrid">Hybrid</option>
      </select>
    </div>

    {/* NEW: Shift Timing Fields */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Shift Start Time</label>
        <input
          type="time"
          value={formData.jobInfo.shiftTiming?.start || ""}
          onChange={e => {
            const shiftTiming = {
              ...formData.jobInfo.shiftTiming,
              start: e.target.value
            };
            handleInputChange("jobInfo", "shiftTiming", shiftTiming);
          }}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Shift End Time</label>
        <input
          type="time"
          value={formData.jobInfo.shiftTiming?.end || ""}
          onChange={e => {
            const shiftTiming = {
              ...formData.jobInfo.shiftTiming,
              end: e.target.value
            };
            handleInputChange("jobInfo", "shiftTiming", shiftTiming);
          }}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent"
        />
      </div>
    </div>
  </div>
);

const Step3Payroll = ({ formData, errors, handleInputChange, handleAddAllowance, handleRemoveAllowance, handleAddDeduction, handleRemoveDeduction, isEditMode = false }) => {
  const basic = parseFloat(formData.payrollInfo.basic) || 0;
  const hra = parseFloat(formData.payrollInfo.hra) || 0;
  const tax = parseFloat(formData.payrollInfo.tax) || 0;
  
  // Calculate total allowances
  const totalAllowances = formData.payrollInfo.allowances.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  
  // Calculate total deductions (including tax)
  const totalDeductions = formData.payrollInfo.deductions.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0) + tax;
  
  const totalEarnings = basic + hra + totalAllowances;
  const netPay = totalEarnings - totalDeductions;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Payroll Information</h2>
      <p className="text-sm text-gray-600 mb-4">Set up the employee's salary structure</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Basic Salary *</label>
          <input
            type="number"
            value={formData.payrollInfo.basic}
            onChange={e => handleInputChange("payrollInfo", "basic", e.target.value)}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent ${errors.basic ? "border-red-500" : "border-gray-300"}`}
            placeholder="0.00"
            min="0"
          />
          {errors.basic && <p className="text-red-500 text-sm mt-1">{errors.basic}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">HRA</label>
          <input
            type="number"
            value={formData.payrollInfo.hra}
            onChange={e => handleInputChange("payrollInfo", "hra", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent"
            placeholder="0.00"
            min="0"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tax</label>
        <input
          type="number"
          value={formData.payrollInfo.tax}
          onChange={e => handleInputChange("payrollInfo", "tax", e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent"
          placeholder="0.00"
          min="0"
        />
      </div>

      {/* Allowances Section */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">Allowances</label>
          <button
            type="button"
            onClick={handleAddAllowance}
            className="text-sm text-[#104774] hover:text-[#104774] font-medium"
          >
            + Add Allowance
          </button>
        </div>
        
        {formData.payrollInfo.allowances.map((allowance, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
            <input
              type="text"
              value={allowance.title}
              onChange={e => {
                const newAllowances = [...formData.payrollInfo.allowances];
                newAllowances[index].title = e.target.value;
                handleInputChange("payrollInfo", "allowances", newAllowances);
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent"
              placeholder="Allowance title"
            />
            <input
              type="number"
              value={allowance.amount}
              onChange={e => {
                const newAllowances = [...formData.payrollInfo.allowances];
                newAllowances[index].amount = e.target.value;
                handleInputChange("payrollInfo", "allowances", newAllowances);
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent"
              placeholder="Amount"
              min="0"
            />
            <button
              type="button"
              onClick={() => handleRemoveAllowance(index)}
              className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* Deductions Section */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">Deductions</label>
          <button
            type="button"
            onClick={handleAddDeduction}
            className="text-sm text-[#104774] hover:text-[#104774] font-medium"
          >
            + Add Deduction
          </button>
        </div>
        
        {formData.payrollInfo.deductions.map((deduction, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
            <input
              type="text"
              value={deduction.title}
              onChange={e => {
                const newDeductions = [...formData.payrollInfo.deductions];
                newDeductions[index].title = e.target.value;
                handleInputChange("payrollInfo", "deductions", newDeductions);
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent"
              placeholder="Deduction title"
            />
            <input
              type="number"
              value={deduction.amount}
              onChange={e => {
                const newDeductions = [...formData.payrollInfo.deductions];
                newDeductions[index].amount = e.target.value;
                handleInputChange("payrollInfo", "deductions", newDeductions);
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent"
              placeholder="Amount"
              min="0"
            />
            <button
              type="button"
              onClick={() => handleRemoveDeduction(index)}
              className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Payroll Month *</label>
        <input
          type="month"
          value={formData.payrollInfo.month}
          onChange={e => handleInputChange("payrollInfo", "month", e.target.value)}
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent ${errors.month ? "border-red-500" : "border-gray-300"}`}
        />
        {errors.month && <p className="text-red-500 text-sm mt-1">{errors.month}</p>}
      </div>

      {/* Salary Summary */}
      <div className="bg-gray-50 p-4 rounded-lg mt-4">
        <h3 className="font-semibold text-gray-800 mb-2">Salary Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Basic Salary:</span>
            <span className="font-medium">₹{basic.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">HRA:</span>
            <span className="font-medium">₹{hra.toLocaleString()}</span>
          </div>
          {formData.payrollInfo.allowances.map((allowance, index) => (
            <div key={index} className="flex justify-between">
              <span className="text-gray-600">{allowance.title || "Allowance"}:</span>
              <span className="font-medium">₹{(parseFloat(allowance.amount) || 0).toLocaleString()}</span>
            </div>
          ))}
          <div className="flex justify-between border-t border-gray-200 pt-2">
            <span className="text-gray-600">Total Earnings:</span>
            <span className="font-medium text-green-600">₹{totalEarnings.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tax Deduction:</span>
            <span className="font-medium text-red-600">-₹{tax.toLocaleString()}</span>
          </div>
          {formData.payrollInfo.deductions.map((deduction, index) => (
            <div key={index} className="flex justify-between">
              <span className="text-gray-600">{deduction.title || "Deduction"}:</span>
              <span className="font-medium text-red-600">-₹{(parseFloat(deduction.amount) || 0).toLocaleString()}</span>
            </div>
          ))}
          <div className="flex justify-between border-t border-gray-200 pt-2">
            <span className="text-gray-800 font-semibold">Net Pay:</span>
            <span className="font-bold text-[#104774]">₹{netPay.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Step4Credentials = ({ formData, errors, handlePasswordChange, handleRoleChange, isEditMode = false }) => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold text-gray-800 mb-2">Account Credentials</h2>
    <p className="text-sm text-gray-600 mb-4">
      {isEditMode ? "Update employee's login credentials" : "Set up login credentials for the employee"}
    </p>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
      <div className="p-3 bg-gray-50 rounded-lg border border-gray-300">
        <span className="text-gray-800">{formData.basicInfo.email}</span>
      </div>
      <p className="text-sm text-gray-500 mt-1">This will be the username for login</p>
    </div>

    {!isEditMode && (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Create Password *</label>
        <input
          type="password"
          value={formData.password}
          onChange={handlePasswordChange}
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent ${errors.password ? "border-red-500" : "border-gray-300"}`}
          placeholder="Enter secure password"
        />
        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        <p className="text-sm text-gray-500 mt-1">Minimum 6 characters required</p>
      </div>
    )}

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">User Role</label>
      <select
        value={formData.role}
        onChange={handleRoleChange}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent"
      >
        <option value="employee">Employee</option>
        <option value="hr">HR Manager</option>
      </select>
      <p className="text-sm text-gray-500 mt-1">
        {formData.role === "hr"
          ? "HR managers can manage employees and leave requests"
          : "Employees can view their profile and submit leave requests"
        }
      </p>
    </div>

    {!isEditMode && (
      <div className="bg-[#104774]/10 p-4 rounded-lg border border-[#104774]/40">
        <h4 className="font-semibold text-[#104774] mb-2">📧 Login Instructions</h4>
        <p className="text-sm text-[#104774]">
          The employee will receive an email with these credentials to access their account on their joining date.
        </p>
      </div>
    )}
  </div>
);

// ------------------ EmployeeForm (main) ------------------
const EmployeeForm = ({ onClose, employee, isEditMode = false }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    basicInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dob: "",
      gender: "other",
      address: "", // NEW: Added address field
      documents: [],
      profileImage: null
    },
    jobInfo: {
      designation: "",
      department: "",
      dateOfJoining: "",
      employmentType: "full-time", // NEW: Added employmentType field
      workMode: "work-from-home", // NEW: Added workMode field
      shiftTiming: { // NEW: Added shiftTiming field
        start: "",
        end: ""
      }
    },
    payrollInfo: {
      basic: "",
      hra: "",
      tax: "",
      allowances: [],
      deductions: [],
      month: new Date().toISOString().slice(0, 7),
      status: "draft"
    },
    password: "",
    role: "employee",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [profileImage, setProfileImage] = useState(null);

  // Pre-fill form when in edit mode
  useEffect(() => {
    if (isEditMode && employee) {
      setFormData(prev => ({
        ...prev,
        basicInfo: {
          firstName: employee.firstName || "",
          lastName: employee.lastName || "",
          email: employee.user?.email || "",
          phone: employee.phone || "",
          dob: employee.dob ? employee.dob.split('T')[0] : "",
          gender: employee.gender || "other",
          address: employee.address || "", // NEW: Pre-fill address
          documents: employee.documents || [],
          profileImage: employee.avatarUrl ? { url: employee.avatarUrl } : null
        },
        jobInfo: {
          designation: employee.designation || "",
          department: employee.department || "",
          dateOfJoining: employee.dateOfJoining ? employee.dateOfJoining.split('T')[0] : "",
          employmentType: employee.employmentType || "full-time", // NEW: Pre-fill employmentType
          workMode: employee.workMode || "work-from-home", // NEW: Pre-fill workMode
          shiftTiming: employee.shiftTiming || { // NEW: Pre-fill shiftTiming
            start: "",
            end: ""
          }
        },
        role: employee.user?.role || "employee",
      }));

      if (employee.avatarUrl) {
        setProfileImage({ url: employee.avatarUrl });
      }
    }
  }, [isEditMode, employee]);

  // Utility function for uploading files to Cloudinary
  const uploadFilesToCloudinary = async (files) => {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('documents', file.file);
      });

      const response = await axiosInstance.post('/upload-files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      return response.data.files;
    } catch (error) {
      console.error('File upload error:', error);
      throw new Error(error.response?.data?.message || 'Failed to upload files');
    }
  };

  // Validate current step
  const validateStep = (stepToValidate) => {
    const newErrors = {};

    if (stepToValidate === 1) {
      if (!formData.basicInfo.firstName.trim()) newErrors.firstName = "First name is required";
      if (!formData.basicInfo.email.trim()) newErrors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(formData.basicInfo.email)) newErrors.email = "Invalid email format";
      if (!formData.basicInfo.phone.trim()) newErrors.phone = "Phone number is required";
      if (!formData.basicInfo.dob) newErrors.dob = "Date of birth is required";
    }

    if (stepToValidate === 2) {
      if (!formData.jobInfo.designation.trim()) newErrors.designation = "Designation is required";
      if (!formData.jobInfo.department.trim()) newErrors.department = "Department is required";
      if (!formData.jobInfo.dateOfJoining) newErrors.dateOfJoining = "Date of joining is required";
    }

    if (stepToValidate === 3) {
      if (!formData.payrollInfo.basic || formData.payrollInfo.basic <= 0)
        newErrors.basic = "Valid basic salary is required";
      if (!formData.payrollInfo.month) newErrors.month = "Payroll month is required";
    }

    if (stepToValidate === 4 && !isEditMode) {
      if (!formData.password.trim()) newErrors.password = "Password is required";
      else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => setStep(prev => Math.max(1, prev - 1));

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));

    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, password: value }));

    if (errors.password) {
      setErrors(prev => ({ ...prev, password: "" }));
    }
  };

  const handleRoleChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, role: value }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map(file => ({ name: file.name, url: URL.createObjectURL(file), file }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    setFormData(prev => ({
      ...prev,
      basicInfo: {
        ...prev.basicInfo,
        documents: [...prev.basicInfo.documents, ...files.map(f => ({ name: f.name }))],
      },
    }));
  };

  const handleProfileImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageFile = { name: file.name, url: URL.createObjectURL(file), file };
      setProfileImage(imageFile);
      setFormData(prev => ({
        ...prev,
        basicInfo: {
          ...prev.basicInfo,
          profileImage: { name: file.name }
        },
      }));
    }
  };

  const removeFile = (index) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    setFormData(prev => ({
      ...prev,
      basicInfo: { ...prev.basicInfo, documents: newFiles.map(f => ({ name: f.name })) },
    }));
  };

  const removeProfileImage = () => {
    setProfileImage(null);
    setFormData(prev => ({
      ...prev,
      basicInfo: {
        ...prev.basicInfo,
        profileImage: null
      },
    }));
  };

  // Allowance and Deduction handlers
  const handleAddAllowance = () => {
    setFormData(prev => ({
      ...prev,
      payrollInfo: {
        ...prev.payrollInfo,
        allowances: [...prev.payrollInfo.allowances, { title: "", amount: 0 }]
      }
    }));
  };

  const handleRemoveAllowance = (index) => {
    setFormData(prev => ({
      ...prev,
      payrollInfo: {
        ...prev.payrollInfo,
        allowances: prev.payrollInfo.allowances.filter((_, i) => i !== index)
      }
    }));
  };

  const handleAddDeduction = () => {
    setFormData(prev => ({
      ...prev,
      payrollInfo: {
        ...prev.payrollInfo,
        deductions: [...prev.payrollInfo.deductions, { title: "", amount: 0 }]
      }
    }));
  };

  const handleRemoveDeduction = (index) => {
    setFormData(prev => ({
      ...prev,
      payrollInfo: {
        ...prev.payrollInfo,
        deductions: prev.payrollInfo.deductions.filter((_, i) => i !== index)
      }
    }));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setIsSubmitting(true);

    try {
      // Upload profile image first if exists
      let profileImageData = null;
      if (profileImage && profileImage.file) {
        const formData = new FormData();
        formData.append('documents', profileImage.file);
        
        const response = await axiosInstance.post('/upload-files/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        
        if (response.data.files && response.data.files.length > 0) {
          profileImageData = response.data.files[0];
        }
      }

      // Upload other documents if exist
      let uploadedFilesData = [];
      if (uploadedFiles.length > 0) {
        uploadedFilesData = await uploadFilesToCloudinary(uploadedFiles);
      }

      // Prepare the data for employee creation
      const employeeData = {
        basicInfo: {
          ...formData.basicInfo,
          profileImage: profileImageData || formData.basicInfo.profileImage,
          documents: uploadedFilesData.length > 0 ? uploadedFilesData : formData.basicInfo.documents,
        },
        jobInfo: formData.jobInfo,
        payrollInfo: formData.payrollInfo,
        password: formData.password,
        role: formData.role,
      };

      // Send the employee data
      const res = await axiosInstance.post('/employee/add', {
        data: JSON.stringify(employeeData)
      });

      alert("Employee added successfully!");
      onClose();
    } catch (err) {
      console.error("Error adding employee:", err);
      alert(err.response?.data?.message || "Error adding employee");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!validateStep(4)) return;

    setIsSubmitting(true);

    try {
      // Upload profile image first if exists
      let profileImageData = null;
      if (profileImage && profileImage.file) {
        const formData = new FormData();
        formData.append('documents', profileImage.file);
        
        const response = await axiosInstance.post('/upload-files/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        
        if (response.data.files && response.data.files.length > 0) {
          profileImageData = response.data.files[0];
        }
      }

      // Upload other documents if exist
      let uploadedFilesData = [];
      if (uploadedFiles.length > 0) {
        uploadedFilesData = await uploadFilesToCloudinary(uploadedFiles);
      }

      // Prepare the data for employee update (same format as add)
      const employeeData = {
        basicInfo: {
          ...formData.basicInfo,
          profileImage: profileImageData || formData.basicInfo.profileImage,
          documents: uploadedFilesData.length > 0 ? uploadedFilesData : formData.basicInfo.documents,
        },
        jobInfo: formData.jobInfo,
        payrollInfo: formData.payrollInfo,
      };

      // Send the employee data for update (using the same format as add)
      const res = await axiosInstance.put(`/employee/update/${employee._id}`, {
        data: JSON.stringify(employeeData) // Stringify the data like in add
      });

      alert("Employee updated successfully!");
      onClose();
    } catch (err) {
      console.error("Error updating employee:", err);
      alert(err.response?.data?.message || "Error updating employee");
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = (step / 4) * 100;

  return (
    <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-auto my-8 relative">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 bg-gray-200 hover:bg-gray-300 rounded-full p-2"
      >
        ✕
      </button>

      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            {isEditMode ? "Edit Employee" : "Add New Employee"}
          </h2>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div className="bg-[#104774] h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between mb-2">
          {["Basic Info", "Job Details", "Payroll", "Credentials"].map((label, index) => (
            <div
              key={label}
              className={`text-xs font-medium ${step > index + 1 ? "text-green-600" : step === index + 1 ? "text-[#104774]" : "text-gray-500"}`}
            >
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6">
        {step === 1 && (
          <Step1Basic
            formData={formData}
            errors={errors}
            handleInputChange={handleInputChange}
            uploadedFiles={uploadedFiles}
            handleFileUpload={handleFileUpload}
            removeFile={removeFile}
            profileImage={profileImage}
            handleProfileImageUpload={handleProfileImageUpload}
            removeProfileImage={removeProfileImage}
            isEditMode={isEditMode}
          />
        )}
        {step === 2 && (
          <Step2Job 
            formData={formData} 
            errors={errors} 
            handleInputChange={handleInputChange} 
            isEditMode={isEditMode}
          />
        )}
        {step === 3 && (
          <Step3Payroll 
            formData={formData} 
            errors={errors} 
            handleInputChange={handleInputChange}
            handleAddAllowance={handleAddAllowance}
            handleRemoveAllowance={handleRemoveAllowance}
            handleAddDeduction={handleAddDeduction}
            handleRemoveDeduction={handleRemoveDeduction}
            isEditMode={isEditMode}
          />
        )}
        {step === 4 && (
          <Step4Credentials
            formData={formData}
            errors={errors}
            handlePasswordChange={handlePasswordChange}
            handleRoleChange={handleRoleChange}
            isEditMode={isEditMode}
          />
        )}
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-xl">
        <div className="flex justify-between">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              disabled={isSubmitting}
            >
              ← Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button onClick={handleNext} className="px-6 py-3 bg-[#104774] text-white rounded-lg hover:bg-[#104774] transition-colors">
              Next →
            </button>
          ) : (
            <button
              onClick={isEditMode ? handleUpdate : handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  {isEditMode ? "Updating..." : "Creating..."}
                </span>
              ) : (
                isEditMode ? "Update Employee" : "Create Employee"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeForm;