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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableData(prev => ({
      ...prev,
      [name]: name === 'basic' || name === 'hra' || name === 'tax' ? Number(value) : value
    }));
  };

  const handleAllowanceChange = (index, field, value) => {
    const updatedAllowances = [...editableData.allowances];
    updatedAllowances[index][field] = field === 'amount' ? Number(value) : value;
    setEditableData(prev => ({ ...prev, allowances: updatedAllowances }));
  };

  const handleDeductionChange = (index, field, value) => {
    const updatedDeductions = [...editableData.deductions];
    updatedDeductions[index][field] = field === 'amount' ? Number(value) : value;
    setEditableData(prev => ({ ...prev, deductions: updatedDeductions }));
  };

  const addAllowance = () => {
    setEditableData(prev => ({
      ...prev,
      allowances: [...prev.allowances, { title: "", amount: 0 }]
    }));
  };

  const removeAllowance = (index) => {
    setEditableData(prev => ({
      ...prev,
      allowances: prev.allowances.filter((_, i) => i !== index)
    }));
  };

  const addDeduction = () => {
    setEditableData(prev => ({
      ...prev,
      deductions: [...prev.deductions, { title: "", amount: 0 }]
    }));
  };

  const removeDeduction = (index) => {
    setEditableData(prev => ({
      ...prev,
      deductions: prev.deductions.filter((_, i) => i !== index)
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
    return items.reduce((sum, item) => sum + (item.amount || 0), 0);
  };

  const totalAllowances = calculateTotal(editableData.allowances);
  const totalDeductions = calculateTotal(editableData.deductions) + editableData.tax;
  const totalEarnings = editableData.basic + editableData.hra + totalAllowances;
  const netPay = totalEarnings - totalDeductions;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Payroll Details - {payroll.employeeProfile?.firstName} {payroll.employeeProfile?.lastName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Header Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Employee ID</p>
            <p className="font-semibold">{payroll.employeeProfile?.employeeId}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Period</p>
            <p className="font-semibold">{payroll.month} {payroll.year}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Status</p>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              payroll.status === "approved" ? "bg-green-100 text-green-800" :
              payroll.status === "rejected" ? "bg-red-100 text-red-800" :
              payroll.status === "pending_approval" ? "bg-yellow-100 text-yellow-800" :
              "bg-gray-100 text-gray-800"
            }`}>
              {payroll.status.replace("_", " ").toUpperCase()}
            </span>
          </div>
        </div>

        {/* Earnings Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-green-700 mb-4">Earnings</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Basic Salary:</span>
              {isEditing ? (
                <input
                  type="number"
                  name="basic"
                  value={editableData.basic}
                  onChange={handleInputChange}
                  className="w-32 p-2 border border-gray-300 rounded-md"
                />
              ) : (
                <span className="font-semibold">{formatCurrency(payroll.basic)}</span>
              )}
            </div>

            <div className="flex justify-between items-center">
              <span>House Rent Allowance (HRA):</span>
              {isEditing ? (
                <input
                  type="number"
                  name="hra"
                  value={editableData.hra}
                  onChange={handleInputChange}
                  className="w-32 p-2 border border-gray-300 rounded-md"
                />
              ) : (
                <span className="font-semibold">{formatCurrency(payroll.hra)}</span>
              )}
            </div>

            {/* Allowances */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Allowances:</span>
                {isEditing && (
                  <button
                    onClick={addAllowance}
                    className="px-2 py-1 bg-green-600 text-white rounded-md text-sm"
                  >
                    + Add
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {editableData.allowances.map((allowance, index) => (
                  <div key={index} className="flex justify-between items-center">
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          value={allowance.title}
                          onChange={(e) => handleAllowanceChange(index, 'title', e.target.value)}
                          placeholder="Allowance title"
                          className="flex-1 p-2 border border-gray-300 rounded-md mr-2"
                        />
                        <input
                          type="number"
                          value={allowance.amount}
                          onChange={(e) => handleAllowanceChange(index, 'amount', e.target.value)}
                          className="w-24 p-2 border border-gray-300 rounded-md mr-2"
                        />
                        <button
                          onClick={() => removeAllowance(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </>
                    ) : (
                      <>
                        <span>{allowance.title}:</span>
                        <span className="font-semibold">{formatCurrency(allowance.amount)}</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total Earnings:</span>
                <span className="text-green-600">{formatCurrency(totalEarnings)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Deductions Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-red-700 mb-4">Deductions</h3>
          <div className="space-y-3">
            {/* Tax */}
            <div className="flex justify-between items-center">
              <span>Tax:</span>
              {isEditing ? (
                <input
                  type="number"
                  name="tax"
                  value={editableData.tax}
                  onChange={handleInputChange}
                  className="w-32 p-2 border border-gray-300 rounded-md"
                />
              ) : (
                <span className="font-semibold text-red-600">-{formatCurrency(payroll.tax)}</span>
              )}
            </div>

            {/* Deductions */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Other Deductions:</span>
                {isEditing && (
                  <button
                    onClick={addDeduction}
                    className="px-2 py-1 bg-green-600 text-white rounded-md text-sm"
                  >
                    + Add
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {editableData.deductions.map((deduction, index) => (
                  <div key={index} className="flex justify-between items-center">
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          value={deduction.title}
                          onChange={(e) => handleDeductionChange(index, 'title', e.target.value)}
                          placeholder="Deduction title"
                          className="flex-1 p-2 border border-gray-300 rounded-md mr-2"
                        />
                        <input
                          type="number"
                          value={deduction.amount}
                          onChange={(e) => handleDeductionChange(index, 'amount', e.target.value)}
                          className="w-24 p-2 border border-gray-300 rounded-md mr-2"
                        />
                        <button
                          onClick={() => removeDeduction(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </>
                    ) : (
                      <>
                        <span>{deduction.title}:</span>
                        <span className="font-semibold text-red-600">-{formatCurrency(deduction.amount)}</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total Deductions:</span>
                <span className="text-red-600">-{formatCurrency(totalDeductions)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Net Pay */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Net Salary</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(netPay)}
              </p>
            </div>
          </div>
        </div>

        {/* Rejection Reason (if rejected) */}
        {payroll.status === "rejected" && payroll.rejectionReason && (
          <div className="bg-red-50 p-4 rounded-lg mb-6">
            <h4 className="text-sm font-semibold text-red-800 mb-2">Rejection Reason:</h4>
            <p className="text-sm text-red-700">{payroll.rejectionReason}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          {isHR && payroll.status === "draft" && (
            <>
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={actionLoading === payroll._id}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {actionLoading === payroll._id ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Edit Payroll
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={actionLoading === payroll._id}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {actionLoading === payroll._id ? "Processing..." : "Submit for Approval"}
                  </button>
                </>
              )}
            </>
          )}

          {!isHR && payroll.status === "pending_approval" && (
            <>
              <button
                onClick={handleApprove}
                disabled={actionLoading === payroll._id}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {actionLoading === payroll._id ? "Processing..." : "Approve"}
              </button>
              <div className="flex-1">
                <input
                  type="text"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Reason for rejection"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <button
                onClick={handleReject}
                disabled={actionLoading === payroll._id || !rejectionReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading === payroll._id ? "Processing..." : "Reject"}
              </button>
            </>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayrollDetailsModal;