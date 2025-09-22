import React, { useState, useEffect } from "react";
import { X, AlertCircle, Calendar, Clock } from 'lucide-react';
import axiosInstance from "../../utils/axiosInstance";
const LeaveApplicationModal = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  token, 
  leaveBalance 
}) => {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [formData, setFormData] = useState({
    leaveType: "",
    fromDate: "",
    toDate: "",
    reason: "",
    totalDays: 0
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [calculatingDays, setCalculatingDays] = useState(false);

  // Fetch leave types when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchLeaveTypes();
    }
  }, [isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        leaveType: "",
        fromDate: "",
        toDate: "",
        reason: "",
        totalDays: 0
      });
      setFormErrors({});
    }
  }, [isOpen]);

  const fetchLeaveTypes = async () => {
    try {
      const res = await axiosInstance.get("/leave/get-leaveTypes", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const activeTypes = (res.data || []).filter(type => type.isActive);
      setLeaveTypes(activeTypes);

      if (activeTypes.length > 0 && !formData.leaveType) {
        setFormData(prev => ({ ...prev, leaveType: activeTypes[0].name }));
      }
    } catch (err) {
      console.error("Error fetching leave types:", err);
    }
  };

  // Calculate working days between two dates (excluding weekends)
  const calculateWorkingDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) return 0;
    
    let count = 0;
    const current = new Date(start);
    
    while (current <= end) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Skip weekends
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return count;
  };

  // Update total days when dates change
  useEffect(() => {
    if (formData.fromDate && formData.toDate) {
      setCalculatingDays(true);
      const days = calculateWorkingDays(formData.fromDate, formData.toDate);
      setFormData(prev => ({ ...prev, totalDays: days }));
      setCalculatingDays(false);
    } else {
      setFormData(prev => ({ ...prev, totalDays: 0 }));
    }
  }, [formData.fromDate, formData.toDate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!formData.leaveType) {
      errors.leaveType = "Leave type is required";
    }

    if (!formData.fromDate) {
      errors.fromDate = "From date is required";
    } else if (new Date(formData.fromDate) < today) {
      errors.fromDate = "Cannot apply for backdated leaves";
    }

    if (!formData.toDate) {
      errors.toDate = "To date is required";
    } else if (formData.fromDate && new Date(formData.toDate) < new Date(formData.fromDate)) {
      errors.toDate = "To date cannot be before from date";
    }

    if (!formData.reason.trim()) {
      errors.reason = "Reason is required";
    } else if (formData.reason.length > 500) {
      errors.reason = "Reason cannot exceed 500 characters";
    }

    // Check leave balance
    if (formData.leaveType && formData.totalDays > 0) {
      const available = leaveBalance[formData.leaveType] || 0;
      if (available < formData.totalDays) {
        errors.leaveType = `Insufficient ${formData.leaveType} leave balance! You have ${available} days left.`;
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      await axiosInstance.post("/leave/create", formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      onSuccess();
    } catch (err) {
      console.error("Error applying leave:", err);
      const errorMsg = err.response?.data?.message || "Error applying leave. Please try again.";
      setFormErrors({ submit: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
<div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
<div className="bg-white rounded-xl p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>
        
        <h2 className="text-xl font-bold text-gray-800 mb-2">Apply for Leave</h2>
        <p className="text-sm text-gray-600 mb-6">Fill in the details to apply for leave</p>

        {formErrors.submit && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center">
            <AlertCircle size={16} className="mr-2" />
            {formErrors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 font-medium text-sm text-gray-700">
              Leave Type
            </label>
            <select 
              name="leaveType" 
              value={formData.leaveType} 
              onChange={handleInputChange} 
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#104774] text-sm"
            >
              <option value="">Select Leave Type</option>
              {leaveTypes.map((type) => (
                <option key={type._id} value={type.name}>
                  {type.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} 
                  {leaveBalance[type.name] !== undefined && ` (${leaveBalance[type.name]} days available)`}
                </option>
              ))}
            </select>
            {formErrors.leaveType && (
              <p className="text-red-500 text-xs mt-1 flex items-center">
                <AlertCircle size={12} className="mr-1" /> 
                {formErrors.leaveType}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 font-medium text-sm text-gray-700">
                From Date
              </label>
              <input 
                type="date" 
                name="fromDate" 
                value={formData.fromDate} 
                onChange={handleInputChange} 
                min={new Date().toISOString().split('T')[0]}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#104774] text-sm"
              />
              {formErrors.fromDate && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle size={12} className="mr-1" /> 
                  {formErrors.fromDate}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-2 font-medium text-sm text-gray-700">
                To Date
              </label>
              <input 
                type="date" 
                name="toDate" 
                value={formData.toDate} 
                onChange={handleInputChange} 
                min={formData.fromDate || new Date().toISOString().split('T')[0]}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#104774] text-sm"
              />
              {formErrors.toDate && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle size={12} className="mr-1" /> 
                  {formErrors.toDate}
                </p>
              )}
            </div>
          </div>

          {formData.fromDate && formData.toDate && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700 font-medium">Working Days:</span>
                <span className="text-blue-800 font-semibold">
                  {calculatingDays ? (
                    <span className="flex items-center">
                      <Clock size={14} className="mr-1 animate-pulse" />
                      Calculating...
                    </span>
                  ) : (
                    `${formData.totalDays} day${formData.totalDays !== 1 ? 's' : ''}`
                  )}
                </span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                (Excludes weekends)
              </p>
            </div>
          )}

          <div>
            <label className="block mb-2 font-medium text-sm text-gray-700">
              Reason
            </label>
            <textarea 
              name="reason" 
              value={formData.reason} 
              onChange={handleInputChange} 
              rows={4}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#104774] text-sm"
              placeholder="Please provide a reason for your leave"
            />
            <div className="flex justify-between mt-1">
              <div className="text-xs text-gray-500">
                {formData.reason.length}/500 characters
              </div>
              {formErrors.reason && (
                <p className="text-red-500 text-xs flex items-center">
                  <AlertCircle size={12} className="mr-1" /> 
                  {formErrors.reason}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-[#104774] text-white hover:bg-[#0d3a61] text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Applying...
                </>
              ) : (
                <>
                  <Calendar size={16} className="mr-2" />
                  Apply for Leave
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeaveApplicationModal;