import React, { useState } from "react";

const PRIMARY = "#104774";
const PRIMARY_HOVER = "#0d3a61";

const PayrollDetailsModal = ({ 
  isOpen, 
  onClose, 
  payroll, 
  onUpdate, 
  onApproveReject, 
  actionLoading, 
  formatCurrency, 
  isHR = false 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState({ ...payroll });
  const [rejectionReason, setRejectionReason] = useState("");
  const [activeTab, setActiveTab] = useState("summary"); // summary, breakdown, or history

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableData(prev => ({
      ...prev,
      [name]: name === 'basic' || name === 'hra' || name === 'tax' ? Number(value) : value
    }));
  };

  const handleAllowanceChange = (index, field, value) => {
    const updatedAllowances = [...(editableData.allowances || [])];
    updatedAllowances[index][field] = field === 'amount' ? Number(value) : value;
    setEditableData(prev => ({ ...prev, allowances: updatedAllowances }));
  };

  const handleDeductionChange = (index, field, value) => {
    const updatedDeductions = [...(editableData.deductions || [])];
    updatedDeductions[index][field] = field === 'amount' ? Number(value) : value;
    setEditableData(prev => ({ ...prev, deductions: updatedDeductions }));
  };

  const addAllowance = () => {
    setEditableData(prev => ({
      ...prev,
      allowances: [...(prev.allowances || []), { title: "", amount: 0 }]
    }));
  };

  const removeAllowance = (index) => {
    setEditableData(prev => ({
      ...prev,
      allowances: (prev.allowances || []).filter((_, i) => i !== index)
    }));
  };

  const addDeduction = () => {
    setEditableData(prev => ({
      ...prev,
      deductions: [...(prev.deductions || []), { title: "", amount: 0 }]
    }));
  };

  const removeDeduction = (index) => {
    setEditableData(prev => ({
      ...prev,
      deductions: (prev.deductions || []).filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    onUpdate(payroll._id, editableData);
    setIsEditing(false);
  };

  const handleApprove = () => {
    onApproveReject(payroll._id, "approve");
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }
    onApproveReject(payroll._id, "reject", rejectionReason);
  };

  const calculateTotal = (items) => {
    return (items || []).reduce((sum, item) => sum + (item.amount || 0), 0);
  };

  const totalAllowances = calculateTotal(editableData.allowances);
  const totalDeductions = calculateTotal(editableData.deductions) + (editableData.tax || 0);
  const totalEarnings = (editableData.basic || 0) + (editableData.hra || 0) + totalAllowances;
  const netPay = totalEarnings - totalDeductions;

  // Calculate daily rate and absent deduction details
  const dailyRate = payroll.basic / (payroll.workingDays || 22);
  const absentDeductionPerDay = payroll.absentDeduction / (payroll.absentDays || 1);

  // Format date function
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Payroll Details - {payroll.employeeProfile?.firstName} {payroll.employeeProfile?.lastName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            className={`py-2 px-4 text-sm font-medium ${activeTab === "summary" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
            onClick={() => setActiveTab("summary")}
          >
            Summary
          </button>
        </div>

        {/* Header Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600">Employee ID</p>
            <p className="font-medium text-sm">{payroll.employeeProfile?.employeeId}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600">Period</p>
            <p className="font-medium text-sm">{payroll.month} {payroll.year}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600">Status</p>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              payroll.status === "approved" ? "bg-green-100 text-green-800" :
              payroll.status === "rejected" ? "bg-red-100 text-red-800" :
              payroll.status === "pending_approval" ? "bg-yellow-100 text-yellow-800" :
              "bg-gray-100 text-gray-800"
            }`}>
              {payroll.status.replace("_", " ").toUpperCase()}
            </span>
          </div>
        </div>

        {/* Summary Tab */}
        {activeTab === "summary" && (
          <>
            {/* Earnings Section */}
            <div className="mb-4">
              <h3 className="text-base font-semibold text-green-700 mb-3">Earnings</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span>Basic Salary:</span>
                  {isEditing ? (
                    <input
                      type="number"
                      name="basic"
                      value={editableData.basic || 0}
                      onChange={handleInputChange}
                      className="w-28 p-1 text-sm border border-gray-300 rounded-md"
                    />
                  ) : (
                    <span className="font-medium">{formatCurrency(payroll.basic || 0)}</span>
                  )}
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span>House Rent Allowance (HRA):</span>
                  {isEditing ? (
                    <input
                      type="number"
                      name="hra"
                      value={editableData.hra || 0}
                      onChange={handleInputChange}
                      className="w-28 p-1 text-sm border border-gray-300 rounded-md"
                    />
                  ) : (
                    <span className="font-medium">{formatCurrency(payroll.hra || 0)}</span>
                  )}
                </div>

                {/* Allowances */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-sm">Allowances:</span>
                    {isEditing && (
                      <button
                        onClick={addAllowance}
                        className="px-2 py-1 bg-green-600 text-white rounded text-xs"
                      >
                        + Add
                      </button>
                    )}
                  </div>
                  <div className="space-y-1">
                    {(editableData.allowances || []).map((allowance, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        {isEditing ? (
                          <>
                            <input
                              type="text"
                              value={allowance.title || ""}
                              onChange={(e) => handleAllowanceChange(index, 'title', e.target.value)}
                              placeholder="Allowance title"
                              className="flex-1 p-1 text-sm border border-gray-300 rounded-md mr-2"
                            />
                            <input
                              type="number"
                              value={allowance.amount || 0}
                              onChange={(e) => handleAllowanceChange(index, 'amount', e.target.value)}
                              className="w-20 p-1 text-sm border border-gray-300 rounded-md mr-2"
                            />
                            <button
                              onClick={() => removeAllowance(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </>
                        ) : (
                          <>
                            <span>{allowance.title || "Allowance"}:</span>
                            <span className="font-medium">{formatCurrency(allowance.amount || 0)}</span>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between text-base font-semibold">
                    <span>Total Earnings:</span>
                    <span className="text-green-600">{formatCurrency(totalEarnings)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Deductions Section */}
            <div className="mb-4">
              <h3 className="text-base font-semibold text-red-700 mb-3">Deductions</h3>
              <div className="space-y-2">
                {/* Tax */}
                <div className="flex justify-between items-center text-sm">
                  <span>Tax:</span>
                  {isEditing ? (
                    <input
                      type="number"
                      name="tax"
                      value={editableData.tax || 0}
                      onChange={handleInputChange}
                      className="w-28 p-1 text-sm border border-gray-300 rounded-md"
                    />
                  ) : (
                    <span className="font-medium text-red-600">-{formatCurrency(payroll.tax || 0)}</span>
                  )}
                </div>

                {/* Deductions */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-sm">Other Deductions:</span>
                    {isEditing && (
                      <button
                        onClick={addDeduction}
                        className="px-2 py-1 bg-green-600 text-white rounded text-xs"
                      >
                        + Add
                      </button>
                    )}
                  </div>
                  <div className="space-y-1">
                    {(editableData.deductions || []).map((deduction, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        {isEditing ? (
                          <>
                            <input
                              type="text"
                              value={deduction.title || ""}
                              onChange={(e) => handleDeductionChange(index, 'title', e.target.value)}
                              placeholder="Deduction title"
                              className="flex-1 p-1 text-sm border border-gray-300 rounded-md mr-2"
                            />
                            <input
                              type="number"
                              value={deduction.amount || 0}
                              onChange={(e) => handleDeductionChange(index, 'amount', e.target.value)}
                              className="w-20 p-1 text-sm border border-gray-300 rounded-md mr-2"
                            />
                            <button
                              onClick={() => removeDeduction(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </>
                        ) : (
                          <>
                            <span>{deduction.title || "Deduction"}:</span>
                            <span className="font-medium text-red-600">-{formatCurrency(deduction.amount || 0)}</span>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between text-base font-semibold">
                    <span>Total Deductions:</span>
                    <span className="text-red-600">-{formatCurrency(totalDeductions)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Pay */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 p-3 rounded-lg mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-600">Net Salary</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(netPay)}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Rejection Reason (if rejected) */}
        {payroll.status === "rejected" && payroll.rejectionReason && (
          <div className="bg-red-50 p-3 rounded-lg mb-4">
            <h4 className="text-xs font-semibold text-red-800 mb-1">Rejection Reason:</h4>
            <p className="text-xs text-red-700">{payroll.rejectionReason}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {isHR && payroll.status === "draft" && (
            <>
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                </>
              )}
            </>
          )}

          <button
            onClick={onClose}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
  // return (
  //   <div className="fixed inset-0 backdrop-blur-xs bg-opacity-40 flex items-center justify-center p-4 z-50">
  //     <div className="bg-white rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl">
  //       <div className="flex items-center justify-between mb-6">
  //         <h2 className="text-xl font-semibold text-gray-800">
  //           Payroll Details - {payroll.employeeProfile?.firstName} {payroll.employeeProfile?.lastName}
  //         </h2>
  //         <button
  //           onClick={onClose}
  //           className="text-gray-400 hover:text-gray-600"
  //         >
  //           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  //           </svg>
  //         </button>
  //       </div>

  //       {/* Tab Navigation */}
  //       <div className="flex border-b border-gray-200 mb-6">
  //         <button
  //           className={`py-2 px-4 font-medium ${activeTab === "summary" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
  //           onClick={() => setActiveTab("summary")}
  //         >
  //           Summary
  //         </button>
  //         {/* <button
  //           className={`py-2 px-4 font-medium ${activeTab === "breakdown" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
  //           onClick={() => setActiveTab("breakdown")}
  //         >
  //           Detailed Breakdown
  //         </button> */}
  //         {/* <button
  //           className={`py-2 px-4 font-medium ${activeTab === "history" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
  //           onClick={() => setActiveTab("history")}
  //         >
  //           History
  //         </button> */}
  //       </div>

  //       {/* Header Info */}
  //       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
  //         <div className="bg-gray-50 p-4 rounded-lg">
  //           <p className="text-sm text-gray-600">Employee ID</p>
  //           <p className="font-semibold">{payroll.employeeProfile?.employeeId}</p>
  //         </div>
  //         <div className="bg-gray-50 p-4 rounded-lg">
  //           <p className="text-sm text-gray-600">Period</p>
  //           <p className="font-semibold">{payroll.month} {payroll.year}</p>
  //         </div>
  //         <div className="bg-gray-50 p-4 rounded-lg">
  //           <p className="text-sm text-gray-600">Status</p>
  //           <span className={`px-3 py-1 rounded-full text-sm font-medium ${
  //             payroll.status === "approved" ? "bg-green-100 text-green-800" :
  //             payroll.status === "rejected" ? "bg-red-100 text-red-800" :
  //             payroll.status === "pending_approval" ? "bg-yellow-100 text-yellow-800" :
  //             "bg-gray-100 text-gray-800"
  //           }`}>
  //             {payroll.status.replace("_", " ").toUpperCase()}
  //           </span>
  //         </div>
  //       </div>

  //       {/* Summary Tab */}
  //       {activeTab === "summary" && (
  //         <>
  //           {/* Earnings Section */}
  //           <div className="mb-6">
  //             <h3 className="text-lg font-semibold text-green-700 mb-4">Earnings</h3>
  //             <div className="space-y-3">
  //               <div className="flex justify-between items-center">
  //                 <span>Basic Salary:</span>
  //                 {isEditing ? (
  //                   <input
  //                     type="number"
  //                     name="basic"
  //                     value={editableData.basic || 0}
  //                     onChange={handleInputChange}
  //                     className="w-32 p-2 border border-gray-300 rounded-md"
  //                   />
  //                 ) : (
  //                   <span className="font-semibold">{formatCurrency(payroll.basic || 0)}</span>
  //                 )}
  //               </div>

  //               <div className="flex justify-between items-center">
  //                 <span>House Rent Allowance (HRA):</span>
  //                 {isEditing ? (
  //                   <input
  //                     type="number"
  //                     name="hra"
  //                     value={editableData.hra || 0}
  //                     onChange={handleInputChange}
  //                     className="w-32 p-2 border border-gray-300 rounded-md"
  //                   />
  //                 ) : (
  //                   <span className="font-semibold">{formatCurrency(payroll.hra || 0)}</span>
  //                 )}
  //               </div>

  //               {/* Allowances */}
  //               <div>
  //                 <div className="flex justify-between items-center mb-2">
  //                   <span className="font-semibold">Allowances:</span>
  //                   {isEditing && (
  //                     <button
  //                       onClick={addAllowance}
  //                       className="px-2 py-1 bg-green-600 text-white rounded-md text-sm"
  //                     >
  //                       + Add
  //                     </button>
  //                   )}
  //                 </div>
  //                 <div className="space-y-2">
  //                   {(editableData.allowances || []).map((allowance, index) => (
  //                     <div key={index} className="flex justify-between items-center">
  //                       {isEditing ? (
  //                         <>
  //                           <input
  //                             type="text"
  //                             value={allowance.title || ""}
  //                             onChange={(e) => handleAllowanceChange(index, 'title', e.target.value)}
  //                             placeholder="Allowance title"
  //                             className="flex-1 p-2 border border-gray-300 rounded-md mr-2"
  //                           />
  //                           <input
  //                             type="number"
  //                             value={allowance.amount || 0}
  //                             onChange={(e) => handleAllowanceChange(index, 'amount', e.target.value)}
  //                             className="w-24 p-2 border border-gray-300 rounded-md mr-2"
  //                           />
  //                           <button
  //                             onClick={() => removeAllowance(index)}
  //                             className="text-red-600 hover:text-red-800"
  //                           >
  //                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  //                             </svg>
  //                           </button>
  //                         </>
  //                       ) : (
  //                         <>
  //                           <span>{allowance.title || "Allowance"}:</span>
  //                           <span className="font-semibold">{formatCurrency(allowance.amount || 0)}</span>
  //                         </>
  //                       )}
  //                     </div>
  //                   ))}
  //                 </div>
  //               </div>

  //               <div className="border-t pt-2 mt-2">
  //                 <div className="flex justify-between text-lg font-semibold">
  //                   <span>Total Earnings:</span>
  //                   <span className="text-green-600">{formatCurrency(totalEarnings)}</span>
  //                 </div>
  //               </div>
  //             </div>
  //           </div>

  //           {/* Deductions Section */}
  //           <div className="mb-6">
  //             <h3 className="text-lg font-semibold text-red-700 mb-4">Deductions</h3>
  //             <div className="space-y-3">
  //               {/* Tax */}
  //               <div className="flex justify-between items-center">
  //                 <span>Tax:</span>
  //                 {isEditing ? (
  //                   <input
  //                     type="number"
  //                     name="tax"
  //                     value={editableData.tax || 0}
  //                     onChange={handleInputChange}
  //                     className="w-32 p-2 border border-gray-300 rounded-md"
  //                   />
  //                 ) : (
  //                   <span className="font-semibold text-red-600">-{formatCurrency(payroll.tax || 0)}</span>
  //                 )}
  //               </div>

  //               {/* Deductions */}
  //               <div>
  //                 <div className="flex justify-between items-center mb-2">
  //                   <span className="font-semibold">Other Deductions:</span>
  //                   {isEditing && (
  //                     <button
  //                       onClick={addDeduction}
  //                       className="px-2 py-1 bg-green-600 text-white rounded-md text-sm"
  //                     >
  //                       + Add
  //                     </button>
  //                   )}
  //                 </div>
  //                 <div className="space-y-2">
  //                   {(editableData.deductions || []).map((deduction, index) => (
  //                     <div key={index} className="flex justify-between items-center">
  //                       {isEditing ? (
  //                         <>
  //                           <input
  //                             type="text"
  //                             value={deduction.title || ""}
  //                             onChange={(e) => handleDeductionChange(index, 'title', e.target.value)}
  //                             placeholder="Deduction title"
  //                             className="flex-1 p-2 border border-gray-300 rounded-md mr-2"
  //                           />
  //                           <input
  //                             type="number"
  //                             value={deduction.amount || 0}
  //                             onChange={(e) => handleDeductionChange(index, 'amount', e.target.value)}
  //                             className="w-24 p-2 border border-gray-300 rounded-md mr-2"
  //                           />
  //                           <button
  //                             onClick={() => removeDeduction(index)}
  //                             className="text-red-600 hover:text-red-800"
  //                           >
  //                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  //                             </svg>
  //                           </button>
  //                         </>
  //                       ) : (
  //                         <>
  //                           <span>{deduction.title || "Deduction"}:</span>
  //                           <span className="font-semibold text-red-600">-{formatCurrency(deduction.amount || 0)}</span>
  //                         </>
  //                       )}
  //                     </div>
  //                   ))}
  //                 </div>
  //               </div>

  //               <div className="border-t pt-2 mt-2">
  //                 <div className="flex justify-between text-lg font-semibold">
  //                   <span>Total Deductions:</span>
  //                   <span className="text-red-600">-{formatCurrency(totalDeductions)}</span>
  //                 </div>
  //               </div>
  //             </div>
  //           </div>

  //           {/* Net Pay */}
  //           <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg mb-6">
  //             <div className="flex justify-between items-center">
  //               <div>
  //                 <p className="text-sm text-gray-600">Net Salary</p>
  //                 <p className="text-2xl font-bold text-green-600">
  //                   {formatCurrency(netPay)}
  //                 </p>
  //               </div>
  //             </div>
  //           </div>
  //         </>
  //       )}

  //       {/* Detailed Breakdown Tab */}
  //       {activeTab === "breakdown" && (
  //         <div className="space-y-6">
  //           {/* Attendance Breakdown */}
  //           <div className="bg-gray-50 p-4 rounded-lg">
  //             <h3 className="text-lg font-semibold mb-4">Attendance Calculation</h3>
  //             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  //               <div className="bg-white p-3 rounded shadow-sm">
  //                 <p className="text-sm text-gray-600">Total Working Days</p>
  //                 <p className="text-lg font-semibold">{payroll.workingDays || 22}</p>
  //                 <p className="text-xs text-gray-500">Total days excluding Sundays and holidays</p>
  //               </div>
  //               <div className="bg-white p-3 rounded shadow-sm">
  //                 <p className="text-sm text-gray-600">Present Days</p>
  //                 <p className="text-lg font-semibold text-green-600">{payroll.presentDays || 0}</p>
  //                 <p className="text-xs text-gray-500">Days employee was marked present</p>
  //               </div>
  //               <div className="bg-white p-3 rounded shadow-sm">
  //                 <p className="text-sm text-gray-600">Leave Days</p>
  //                 <p className="text-lg font-semibold text-blue-600">{payroll.leaveDays || 0}</p>
  //                 <p className="text-xs text-gray-500">Approved paid leaves</p>
  //               </div>
  //               <div className="bg-white p-3 rounded shadow-sm">
  //                 <p className="text-sm text-gray-600">Absent Days</p>
  //                 <p className="text-lg font-semibold text-red-600">{payroll.absentDays || 0}</p>
  //                 <p className="text-xs text-gray-500">Days absent without approved leave</p>
  //               </div>
  //             </div>
              
  //             <div className="mt-4 bg-white p-3 rounded shadow-sm">
  //               <p className="text-sm text-gray-600">Daily Rate Calculation</p>
  //               <p className="text-sm">
  //                 ₹{payroll.basic?.toLocaleString()} ÷ {payroll.workingDays || 22} days = ₹{dailyRate.toFixed(2)} per day
  //               </p>
  //               <p className="text-sm text-gray-500 mt-1">Basic salary divided by working days</p>
  //             </div>
              
  //             {payroll.absentDays > 0 && (
  //               <div className="mt-4 bg-white p-3 rounded shadow-sm">
  //                 <p className="text-sm text-gray-600">Absent Deduction Calculation</p>
  //                 <p className="text-sm">
  //                   {payroll.absentDays} days × ₹{absentDeductionPerDay.toFixed(2)} = ₹{payroll.absentDeduction?.toLocaleString()}
  //                 </p>
  //                 <p className="text-sm text-gray-500 mt-1">Absent days multiplied by daily rate</p>
  //               </div>
  //             )}
  //           </div>

  //           {/* Tax Calculation */}
  //           <div className="bg-gray-50 p-4 rounded-lg">
  //             <h3 className="text-lg font-semibold mb-4">Tax Calculation</h3>
  //             <div className="bg-white p-3 rounded shadow-sm">
  //               <p className="text-sm text-gray-600">Taxable Income</p>
  //               <p className="text-lg font-semibold">₹{payroll.basic?.toLocaleString()}</p>
  //               <p className="text-xs text-gray-500">Basic salary used for tax calculation</p>
  //             </div>
              
  //             {payroll.tax > 0 && (
  //               <div className="mt-4 bg-white p-3 rounded shadow-sm">
  //                 <p className="text-sm text-gray-600">Tax Percentage</p>
  //                 <p className="text-lg font-semibold">
  //                   {((payroll.tax / payroll.basic) * 100).toFixed(2)}%
  //                 </p>
  //                 <p className="text-xs text-gray-500">Applicable tax rate on basic salary</p>
  //               </div>
  //             )}
  //           </div>

  //           {/* Net Pay Calculation */}
  //           <div className="bg-gray-50 p-4 rounded-lg">
  //             <h3 className="text-lg font-semibold mb-4">Net Pay Calculation</h3>
  //             <div className="space-y-2 bg-white p-4 rounded shadow-sm">
  //               <div className="flex justify-between">
  //                 <span>Basic Salary:</span>
  //                 <span>+₹{payroll.basic?.toLocaleString()}</span>
  //               </div>
  //               <div className="flex justify-between">
  //                 <span>HRA:</span>
  //                 <span>+₹{payroll.hra?.toLocaleString()}</span>
  //               </div>
  //               <div className="flex justify-between">
  //                 <span>Total Allowances:</span>
  //                 <span>+₹{totalAllowances.toLocaleString()}</span>
  //               </div>
  //               <div className="flex justify-between font-semibold border-t pt-2">
  //                 <span>Gross Earnings:</span>
  //                 <span>₹{payroll.totalEarnings?.toLocaleString()}</span>
  //               </div>
                
  //               <div className="flex justify-between text-red-600">
  //                 <span>Tax Deduction:</span>
  //                 <span>-₹{payroll.tax?.toLocaleString()}</span>
  //               </div>
  //               <div className="flex justify-between text-red-600">
  //                 <span>Absent Deduction:</span>
  //                 <span>-₹{payroll.absentDeduction?.toLocaleString()}</span>
  //               </div>
  //               <div className="flex justify-between text-red-600">
  //                 <span>Other Deductions:</span>
  //                 <span>-₹{calculateTotal(payroll.deductions).toLocaleString()}</span>
  //               </div>
  //               <div className="flex justify-between font-semibold text-red-600 border-t pt-2">
  //                 <span>Total Deductions:</span>
  //                 <span>-₹{payroll.totalDeductions?.toLocaleString()}</span>
  //               </div>
                
  //               <div className="flex justify-between font-bold text-green-600 text-lg border-t pt-2">
  //                 <span>Net Pay:</span>
  //                 <span>₹{payroll.netPay?.toLocaleString()}</span>
  //               </div>
  //             </div>
  //           </div>
  //         </div>
  //       )}

  //       {/* History Tab */}
  //       {/* {activeTab === "history" && (
  //         <div className="space-y-4">
  //           <div className="bg-gray-50 p-4 rounded-lg">
  //             <h3 className="text-lg font-semibold mb-4">Payroll History</h3>
              
  //             <div className="space-y-3">
  //               <div className="bg-white p-3 rounded shadow-sm">
  //                 <p className="text-sm text-gray-600">Generated By</p>
  //                 <p className="font-semibold">{payroll.generatedByUser?.email || "HR User"}</p>
  //                 <p className="text-xs text-gray-500">on {formatDate(payroll.createdAt)}</p>
  //               </div>
                
  //               {payroll.submittedAt && (
  //                 <div className="bg-white p-3 rounded shadow-sm">
  //                   <p className="text-sm text-gray-600">Submitted for Approval</p>
  //                   <p className="text-xs text-gray-500">on {formatDate(payroll.submittedAt)}</p>
  //                 </div>
  //               )}
                
  //               {payroll.approvedAt && (
  //                 <div className="bg-white p-3 rounded shadow-sm">
  //                   <p className="text-sm text-gray-600">Approved By</p>
  //                   <p className="font-semibold">{payroll.approvedByUser?.email || "Admin User"}</p>
  //                   <p className="text-xs text-gray-500">on {formatDate(payroll.approvedAt)}</p>
  //                 </div>
  //               )}
                
  //               {payroll.status === "rejected" && payroll.rejectionReason && (
  //                 <div className="bg-red-50 p-3 rounded shadow-sm">
  //                   <p className="text-sm text-red-600">Rejection Reason</p>
  //                   <p className="font-semibold">{payroll.rejectionReason}</p>
  //                   <p className="text-xs text-red-500">on {formatDate(payroll.updatedAt)}</p>
  //                 </div>
  //               )}
  //             </div>
  //           </div>
  //         </div>
  //       )} */}

  //       {/* Rejection Reason (if rejected) */}
  //       {payroll.status === "rejected" && payroll.rejectionReason && (
  //         <div className="bg-red-50 p-4 rounded-lg mb-6">
  //           <h4 className="text-sm font-semibold text-red-800 mb-2">Rejection Reason:</h4>
  //           <p className="text-sm text-red-700">{payroll.rejectionReason}</p>
  //         </div>
  //       )}

  //       {/* Action Buttons */}
  //       <div className="flex flex-wrap gap-3">
  //         {isHR && payroll.status === "draft" && (
  //           <>
  //             {isEditing ? (
  //               <>
  //                 {/* <button
  //                   onClick={handleSave}
  //                   disabled={actionLoading === payroll._id}
  //                   className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
  //                 >
  //                   {actionLoading === payroll._id ? "Saving..." : "Save Changes"}
  //                 </button> */}
  //                 <button
  //                   onClick={() => setIsEditing(false)}
  //                   className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
  //                 >
  //                   Cancel
  //                 </button>
  //               </>
  //             ) : (
  //               <>
  //                 {/* <button
  //                   onClick={() => setIsEditing(true)}
  //                   className="px-4 py-2 bg-[#104774] text-white rounded-md "
  //                 >
  //                   Edit Payroll
  //                 </button>
  //                 <button
  //                   onClick={handleApprove}
  //                   disabled={actionLoading === payroll._id}
  //                   className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
  //                 >
  //                   {actionLoading === payroll._id ? "Processing..." : "Submit for Approval"}
  //                 </button> */}
  //               </>
  //             )}
  //           </>
  //         )}

  //         {/* {!isHR && payroll.status === "pending_approval" && (
  //           <>
  //             <button
  //               onClick={handleApprove}
  //               disabled={actionLoading === payroll._id}
  //               className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
  //             >
  //               {actionLoading === payroll._id ? "Processing..." : "Approve"}
  //             </button>
  //             <div className="flex-1">
  //               <input
  //                 type="text"
  //                 value={rejectionReason}
  //                 onChange={(e) => setRejectionReason(e.target.value)}
  //                 placeholder="Reason for rejection"
  //                 className="w-full p-2 border border-gray-300 rounded-md"
  //               />
  //             </div>
  //             <button
  //               onClick={handleReject}
  //               disabled={actionLoading === payroll._id || !rejectionReason.trim()}
  //               className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
  //             >
  //               {actionLoading === payroll._id ? "Processing..." : "Reject"}
  //             </button>
  //           </>
  //         )} */}

  //         <button
  //           onClick={onClose}
  //           className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
  //         >
  //           Close
  //         </button>
  //       </div>
  //     </div>
  //   </div>
  // );
};

export default PayrollDetailsModal;