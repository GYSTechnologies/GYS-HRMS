import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";

const Step2Job = ({
  formData,
  errors,
  handleInputChange,
  isEditMode = false,
}) => {
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    // If it's already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
    
    // Otherwise, try to parse and format
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        Job Information
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Enter the employee's job details
      </p>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Designation *
        </label>
        <input
          type="text"
          value={formData.jobInfo.designation}
          onChange={(e) =>
            handleInputChange("jobInfo", "designation", e.target.value)
          }
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent ${
            errors.designation ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="e.g., Software Developer"
        />
        {errors.designation && (
          <p className="text-red-500 text-sm mt-1">{errors.designation}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Department *
        </label>
        <select
          value={formData.jobInfo.department}
          onChange={(e) =>
            handleInputChange("jobInfo", "department", e.target.value)
          }
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent ${
            errors.department ? "border-red-500" : "border-gray-300"
          }`}
        >
          <option value="">Select Department</option>
          <option value="Software Developer">Software Developer</option>
          <option value="UI">UI/UX Designer</option>
          <option value="HR">Human Resources</option>
          <option value="Finance">Finance</option>
          <option value="Marketing">Marketing</option>
          <option value="Sales">Sales</option>
          <option value="Operations">Operations</option>
        </select>
        {errors.department && (
          <p className="text-red-500 text-sm mt-1">{errors.department}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Date of Joining *
        </label>
        <input
          type="date"
          value={formatDateForInput(formData.jobInfo.dateOfJoining)}
          onChange={(e) =>
            handleInputChange("jobInfo", "dateOfJoining", e.target.value)
          }
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent ${
            errors.dateOfJoining ? "border-red-500" : "border-gray-300"
          }`}
          disabled={isEditMode}
        />
        {errors.dateOfJoining && (
          <p className="text-red-500 text-sm mt-1">{errors.dateOfJoining}</p>
        )}
        {isEditMode && (
          <p className="text-xs text-gray-500 mt-1">
            Joining date cannot be changed
          </p>
        )}
      </div>

      {/* Employment Type Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Employment Type
        </label>
        <select
          value={formData.jobInfo.employmentType || "full-time"}
          onChange={(e) =>
            handleInputChange("jobInfo", "employmentType", e.target.value)
          }
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent"
        >
          <option value="full-time">Full Time</option>
          <option value="intern">Intern</option>
          <option value="part-time">Part Time</option>
          <option value="contract">Contract</option>
        </select>
      </div>

      {/* Work Mode Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Work Mode
        </label>
        <select
          value={formData.jobInfo.workMode || "work-from-home"}
          onChange={(e) =>
            handleInputChange("jobInfo", "workMode", e.target.value)
          }
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent"
        >
          <option value="work-from-home">Work From Home</option>
          <option value="work-from-office">Work From Office</option>
          <option value="hybrid">Hybrid</option>
        </select>
      </div>

      {/* Shift Timing Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Shift Start Time
          </label>
          <input
            type="time"
            value={formData.jobInfo.shiftTiming?.start || ""}
            onChange={(e) => {
              const shiftTiming = {
                ...formData.jobInfo.shiftTiming,
                start: e.target.value,
              };
              handleInputChange("jobInfo", "shiftTiming", shiftTiming);
            }}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Shift End Time
          </label>
          <input
            type="time"
            value={formData.jobInfo.shiftTiming?.end || ""}
            onChange={(e) => {
              const shiftTiming = {
                ...formData.jobInfo.shiftTiming,
                end: e.target.value,
              };
              handleInputChange("jobInfo", "shiftTiming", shiftTiming);
            }}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
};

const Step4Credentials = ({
  formData,
  errors,
  handlePasswordChange,
  handleRoleChange,
  isEditMode = false,
}) => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold text-gray-800 mb-2">
      Account Credentials
    </h2>
    <p className="text-sm text-gray-600 mb-4">
      {isEditMode
        ? "Update employee's login credentials"
        : "Set up login credentials for the employee"}
    </p>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Email Address
      </label>
      <div className="p-3 bg-gray-50 rounded-lg border border-gray-300">
        <span className="text-gray-800">{formData.basicInfo.email}</span>
      </div>
      <p className="text-sm text-gray-500 mt-1">
        This will be the username for login
      </p>
    </div>

    {!isEditMode && (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Create Password *
        </label>
        <input
          type="password"
          value={formData.password}
          onChange={handlePasswordChange}
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent ${
            errors.password ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Enter secure password"
        />
        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password}</p>
        )}
        <p className="text-sm text-gray-500 mt-1">
          Minimum 6 characters required
        </p>
      </div>
    )}

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        User Role
      </label>
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
          : "Employees can view their profile and submit leave requests"}
      </p>
    </div>

    {!isEditMode && (
      <div className="bg-[#104774]/10 p-4 rounded-lg border border-[#104774]/40">
        <h4 className="font-semibold text-[#104774] mb-2">
          📧 Login Instructions
        </h4>
        <p className="text-sm text-[#104774]">
          The employee will receive an email with these credentials to access
          their account on their joining date.
        </p>
      </div>
    )}
  </div>
);

/* ---------------- DocumentUploadSection & Item ---------------- */

const DocumentUploadSection = ({
  formData,
  handleDocumentUpload,
  removeDocument,
  isEditMode = false,
  uploadProgress = {},
  uploadingDocs = {},
}) => {
  const [isStudent, setIsStudent] = useState(true);
  const [newDocName, setNewDocName] = useState("");
  const [extraDocs, setExtraDocs] = useState([]);

  // Document types
  const basicDocuments = [
    { id: "aadhar", label: "Aadhar Card", required: true },
    { id: "pan", label: "PAN Card", required: true },
    { id: "tenth", label: "10th Marksheet", required: true },
    { id: "twelfth", label: "12th Marksheet", required: true },
    { id: "bank", label: "Bank Passbook", required: true },
  ];

  const graduateDocuments = [
    { id: "provisional", label: "Provisional Certificate", required: true },
    { id: "graduation", label: "Graduation Marksheet", required: true },
  ];

  const handleStudentToggle = (value) => {
    setIsStudent(value);
  };

  // add a custom document (creates a new upload block immediately)
  const addExtraDocument = () => {
    const trimmed = (newDocName || "").trim();
    if (!trimmed) return alert("Enter a document name");
    const id = `custom_${Date.now()}`; // unique id
    setExtraDocs((prev) => [...prev, { id, label: trimmed, required: false }]);
    setNewDocName("");
  };

  // helper: find uploaded file for a doc (by type or by name heuristic)
  const findUploadedFor = (docId, docLabel) => {
    const docs = formData.basicInfo.documents || [];
    // first try exact match by type
    let found = docs.find((d) => d.type === docId);
    if (found) return found;
    // try matching by original name or name content containing a keyword from label
    const keyword = (docLabel || "").toLowerCase().split(" ")[0];
    found =
      docs.find(
        (d) =>
          (d.name && d.name.toLowerCase().includes(keyword)) ||
          (d.originalName && d.originalName.toLowerCase().includes(keyword))
      ) || null;
    return found;
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Student Status
        </label>
        <div className="flex space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              checked={isStudent}
              onChange={() => handleStudentToggle(true)}
              className="form-radio text-[#104774]"
            />
            <span className="ml-2">Student</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              checked={!isStudent}
              onChange={() => handleStudentToggle(false)}
              className="form-radio text-[#104774]"
            />
            <span className="ml-2">Graduated</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Required Documents
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Basic Documents */}
          {basicDocuments.map((doc) => (
            <DocumentUploadItem
              key={doc.id}
              doc={doc}
              uploadedFile={findUploadedFor(doc.id, doc.label)}
              handleDocumentUpload={handleDocumentUpload}
              removeDocument={removeDocument}
              isEditMode={isEditMode}
              uploadProgress={uploadProgress[doc.id] || 0}
              isUploading={uploadingDocs[doc.id] || false}
            />
          ))}

          {/* Graduate Documents */}
          {!isStudent &&
            graduateDocuments.map((doc) => (
              <DocumentUploadItem
                key={doc.id}
                doc={doc}
                uploadedFile={findUploadedFor(doc.id, doc.label)}
                handleDocumentUpload={handleDocumentUpload}
                removeDocument={removeDocument}
                isEditMode={isEditMode}
                uploadProgress={uploadProgress[doc.id] || 0}
                isUploading={uploadingDocs[doc.id] || false}
              />
            ))}

          {/* Extra (user added) documents */}
          {extraDocs.map((doc) => (
            <DocumentUploadItem
              key={doc.id}
              doc={doc}
              uploadedFile={findUploadedFor(doc.id, doc.label)}
              handleDocumentUpload={handleDocumentUpload}
              removeDocument={removeDocument}
              isEditMode={isEditMode}
              uploadProgress={uploadProgress[doc.id] || 0}
              isUploading={uploadingDocs[doc.id] || false}
            />
          ))}
        </div>

        {/* Add new document UI */}
        <div className="mt-4 flex items-center gap-2">
          <input
            type="text"
            value={newDocName}
            onChange={(e) => setNewDocName(e.target.value)}
            placeholder="New document name (e.g. Driving Licence)"
            className="w-[80%] p-2 border border-gray-300 rounded-lg"
          />
          <button
            type="button"
            onClick={addExtraDocument}
            className="px-4 py-2 bg-[#104774] text-white rounded-lg"
          >
            + Add Document
          </button>
        </div>
      </div>
    </div>
  );
};

const DocumentUploadItem = ({
  doc,
  uploadedFile,
  handleDocumentUpload,
  removeDocument,
  isEditMode = false,
  uploadProgress = 0,
  isUploading = false,
}) => {
  const inputId = `document-${doc.id}`;

  // display name: prefer a friendly label (if uploadedFile missing) or uploadedFile.displayName / name
  const displayName =
    (uploadedFile && (uploadedFile.displayName || uploadedFile.name)) ||
    doc.label ||
    "Document";

  return (
    <div className="border border-gray-300 rounded-lg p-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {doc.label} {doc.required && <span className="text-red-500">*</span>}
      </label>

      {uploadedFile ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg mr-2">
              <i className="far fa-file text-gray-600"></i>
            </div>
            <span className="text-sm text-gray-700 truncate">{displayName}</span>
          </div>
          <div className="flex items-center space-x-2">
            <a
              href={uploadedFile.url}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-[#104774] underline"
            >
              View
            </a>
        {/* inside DocumentUploadItem, replace the remove onClick with: */}
<button
  type="button"
  onClick={() => removeDocument(uploadedFile)}
  className="text-red-500 hover:text-red-700 text-sm"
>
remove</button>

          </div>
        </div>
      ) : (
        <div>
          <input
            type="file"
            id={inputId}
            onChange={(e) => handleDocumentUpload(e, doc)}
            className="hidden"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            disabled={isUploading}
          />
          <label
            htmlFor={inputId}
            className={`cursor-pointer flex items-center justify-center p-3 border border-dashed border-gray-300 rounded-lg text-center transition-colors ${
              isUploading ? "opacity-50" : "hover:border-[#104774]"
            }`}
          >
            {isUploading ? (
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-[#104774] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Uploading... {uploadProgress}%</p>
              </div>
            ) : (
              <div>
                <i className="far fa-cloud-upload text-gray-400 text-xl mb-1"></i>
                <p className="text-sm text-gray-600">Upload {doc.label}</p>
                <p className="text-xs text-gray-400">PDF, JPG, PNG (Max 5MB)</p>
              </div>
            )}
          </label>
        </div>
      )}
    </div>
  );
};

/* ---------------- Step1Basic (uses DocumentUploadSection) ---------------- */

const Step1Basic = ({
  formData,
  errors,
  handleInputChange,
  handleDocumentUpload,
  removeDocument,
  profileImage,
  handleProfileImageUpload,
  removeProfileImage,
  isEditMode = false,
  uploadProgress,
  uploadingDocs,
}) => {
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  };

  return (
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
                src={profileImage.url || profileImage}
                alt="Profile preview"
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
              />
              {!isEditMode && (
                <button
                  type="button"
                  onClick={removeProfileImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 text-sm">No image</span>
            </div>
          )}
          {!isEditMode && (
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleProfileImageUpload}
                className="hidden"
                id="profile-image-upload"
                disabled={uploadingDocs.profile}
              />
              <label
                htmlFor="profile-image-upload"
                className={`cursor-pointer text-white px-4 py-2 rounded-lg text-sm transition-colors ${
                  uploadingDocs.profile ? "bg-gray-400" : "bg-[#104774] hover:bg-[#104774]"
                }`}
              >
                {uploadingDocs.profile
                  ? `Uploading... ${uploadProgress.profile || 0}%`
                  : profileImage ? "Change Photo" : "Upload Photo"}
              </label>
              <p className="text-xs text-gray-500 mt-1">JPG, PNG (Max 5MB)</p>
            </div>
          )}
        </div>
      </div>

      {/* ... other basic fields (first, last, email, phone, dob, gender, address) ... */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
          <input
            type="text"
            value={formData.basicInfo.firstName}
            onChange={(e) => handleInputChange("basicInfo", "firstName", e.target.value)}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent ${
              errors.firstName ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter first name"
          />
          {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
          <input
            type="text"
            value={formData.basicInfo.lastName}
            onChange={(e) => handleInputChange("basicInfo", "lastName", e.target.value)}
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
            onChange={(e) => handleInputChange("basicInfo", "email", e.target.value)}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
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
            onChange={(e) => handleInputChange("basicInfo", "phone", e.target.value)}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent ${
              errors.phone ? "border-red-500" : "border-gray-300"
            }`}
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
            value={formatDateForInput(formData.basicInfo.dob)}
            max={
              new Date(new Date().setFullYear(new Date().getFullYear() - 16))
                .toISOString()
                .split("T")[0]
            }
            onChange={(e) => handleInputChange("basicInfo", "dob", e.target.value)}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent ${
              errors.dob ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
          <select
            value={formData.basicInfo.gender}
            onChange={(e) => handleInputChange("basicInfo", "gender", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Address Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
        <textarea
          value={formData.basicInfo.address || ""}
          onChange={(e) => handleInputChange("basicInfo", "address", e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent"
          placeholder="Enter complete address"
          rows="3"
        />
      </div>

      <DocumentUploadSection
        formData={formData}
        handleDocumentUpload={handleDocumentUpload}
        removeDocument={removeDocument}
        isEditMode={isEditMode}
        uploadProgress={uploadProgress}
        uploadingDocs={uploadingDocs}
      />
    </div>
  );
};

/* ---------------- Step3Payroll (tax percent -> tax amount) ---------------- */

const Step3Payroll = ({
  formData,
  errors,
  handleInputChange,
  handleAddAllowance,
  handleRemoveAllowance,
  handleAddDeduction,
  handleRemoveDeduction,
  isEditMode = false,
}) => {
  const basic = parseFloat(formData.payrollInfo.basic) || 0;
  const hra = parseFloat(formData.payrollInfo.hra) || 0;
  const taxPercent = parseFloat(formData.payrollInfo.tax) || 0;

  // Calculate tax amount from basic
  const taxAmount = Math.round((basic * taxPercent) / 100 * 100) / 100;

  // Calculate total allowances
  const totalAllowances = formData.payrollInfo.allowances.reduce(
    (sum, item) => sum + (parseFloat(item.amount) || 0),
    0
  );

  // Calculate total deductions (including tax amount)
  const totalDeductions =
    formData.payrollInfo.deductions.reduce(
      (sum, item) => sum + (parseFloat(item.amount) || 0),
      0
    ) + taxAmount;

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
            onChange={(e) => handleInputChange("payrollInfo", "basic", e.target.value)}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent ${
              errors.basic ? "border-red-500" : "border-gray-300"
            }`}
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
            onChange={(e) => handleInputChange("payrollInfo", "hra", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent"
            placeholder="0.00"
            min="0"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tax (%)</label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={formData.payrollInfo.tax}
          onChange={(e) => handleInputChange("payrollInfo", "tax", e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent"
          placeholder="Tax percentage e.g. 2"
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
              onChange={(e) => {
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
              onChange={(e) => {
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
              onChange={(e) => {
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
              onChange={(e) => {
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
          onChange={(e) => handleInputChange("payrollInfo", "month", e.target.value)}
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#104774] focus:border-transparent ${
            errors.month ? "border-red-500" : "border-gray-300"
          }`}
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
            <span className="text-gray-600">Tax Deduction ({taxPercent}%):</span>
            <span className="font-medium text-red-600">-₹{taxAmount.toLocaleString()}</span>
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

/* ---------------- EmployeeForm (main) ---------------- */

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
      address: "",
      documents: [],
      profileImage: null,
    },
    jobInfo: {
      designation: "",
      department: "",
      dateOfJoining: "",
      employmentType: "full-time",
      workMode: "work-from-home",
      shiftTiming: {
        start: "",
        end: "",
      },
    },
    payrollInfo: {
      basic: "",
      hra: "",
      tax: "", // now stores percentage
      allowances: [],
      deductions: [],
      month: new Date().toISOString().slice(0, 7),
      status: "draft",
    },
    password: "",
    role: "employee",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadingDocs, setUploadingDocs] = useState({});

  // Pre-fill form when in edit mode
  useEffect(() => {
    if (isEditMode && employee) {
      // Map employee.documents into the form structure if present
      const incomingDocs = (employee.documents || []).map((d) => {
        // Normalize potential shapes from backend
        return {
          type: d.type || d.docType || null,
          name: d.name || d.originalName || d.filename || d.fileName || d._id || "",
          originalName: d.originalName || d.name || null,
          url: d.url || d.path || d.secure_url || d.link || "",
          fileType: d.fileType || d.type || null,
          uploadedAt: d.uploadedAt || d.createdAt || null,
          // preserve raw if available:
          raw: d,
        };
      });

      setFormData((prev) => ({
        ...prev,
        basicInfo: {
          firstName: employee.firstName || "",
          lastName: employee.lastName || "",
          email: employee.user?.email || "",
          phone: employee.phone || "",
          dob: employee.dob || "",
          gender: employee.gender || "other",
          address: employee.address || "",
          documents: incomingDocs || [],
          profileImage: employee.avatarUrl ? { url: employee.avatarUrl } : null,
        },
        jobInfo: {
          designation: employee.designation || "",
          department: employee.department || "",
          dateOfJoining: employee.dateOfJoining || "",
          employmentType: employee.employmentType || "full-time",
          workMode: employee.workMode || "work-from-home",
          shiftTiming: employee.shiftTiming || {
            start: "",
            end: "",
          },
        },
        role: employee.user?.role || "employee",
        payrollInfo: {
          ...prev.payrollInfo,
          basic: employee.payrollInfo?.basic ?? prev.payrollInfo.basic,
          hra: employee.payrollInfo?.hra ?? prev.payrollInfo.hra,
          tax: employee.payrollInfo?.tax ?? prev.payrollInfo.tax, // should be percent (if backend has amount, you may want to convert)
          allowances: employee.payrollInfo?.allowances || prev.payrollInfo.allowances,
          deductions: employee.payrollInfo?.deductions || prev.payrollInfo.deductions,
          month: employee.payrollInfo?.month || prev.payrollInfo.month,
          status: employee.payrollInfo?.status || prev.payrollInfo.status,
        },
      }));

      if (employee.avatarUrl) {
        setProfileImage({ url: employee.avatarUrl });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, employee]);

  /* ---------- Helper: uploadFilesToCloudinary (bulk) ---------- */
  const uploadFilesToCloudinary = async (files) => {
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append("documents", f.file));
      files.forEach((f) => fd.append("types[]", f.type || ""));
      files.forEach((f) => fd.append("originalNames[]", f.name || f.file.name));

      const res = await axiosInstance.post("/upload-files/upload", fd, {
        onUploadProgress: (ev) => {
          if (ev.total) {
            const pct = Math.round((ev.loaded * 100) / ev.total);
            console.log("overall upload:", pct, "%");
          }
        },
      });

      return res.data.files.map((f, idx) => ({
        type: f.type || files[idx]?.type || null,
        originalName: f.originalName || f.name || files[idx]?.name,
        url: f.url || f.secure_url || f.path || "",
        raw: f,
      }));
    } catch (error) {
      console.error("File upload error (frontend):", error);
      if (error.response) {
        console.error("Server response:", error.response.status, error.response.data);
        if (error.response.status === 413) throw new Error("File too large: Maximum size is 5MB");
        throw new Error(error.response.data?.message || "Server error while uploading files");
      } else if (error.request) {
        throw new Error("Network error: Please check your connection");
      } else {
        throw new Error(error.message || "Failed to upload files");
      }
    }
  };

  /* ---------- Validation ---------- */
  const validateStep = (stepToValidate) => {
    const newErrors = {};

    if (stepToValidate === 1) {
      if (!formData.basicInfo.firstName.trim()) newErrors.firstName = "First name is required";
      if (!formData.basicInfo.email.trim()) newErrors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(formData.basicInfo.email)) newErrors.email = "Invalid email format";
      if (!formData.basicInfo.phone.trim()) newErrors.phone = "Phone number is required";
      if (!formData.basicInfo.dob) newErrors.dob = "Date of birth is required";

      // Validate required documents
      const requiredDocs = ["aadhar", "pan", "tenth", "twelfth", "bank"];
      const uploadedDocTypes = (formData.basicInfo.documents || []).map((doc) => doc.type);
      const missingDocs = requiredDocs.filter((type) => !uploadedDocTypes.includes(type));

      if (missingDocs.length > 0 && !isEditMode) {
        newErrors.documents = "Please upload all required documents";
      }
    }

    if (stepToValidate === 2) {
      if (!formData.jobInfo.designation.trim()) newErrors.designation = "Designation is required";
      if (!formData.jobInfo.department.trim()) newErrors.department = "Department is required";
      if (!formData.jobInfo.dateOfJoining) newErrors.dateOfJoining = "Date of joining is required";
    }

    if (stepToValidate === 3) {
      if (!formData.payrollInfo.basic || formData.payrollInfo.basic <= 0) newErrors.basic = "Valid basic salary is required";
      if (!formData.payrollInfo.month) newErrors.month = "Payroll month is required";
    }

    if (stepToValidate === 4 && !isEditMode) {
      if (!formData.password.trim()) newErrors.password = "Password is required";
      else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------- Navigation ---------- */
  const handleNext = () => {
    if (validateStep(step)) setStep((prev) => prev + 1);
  };
  const handleBack = () => setStep((prev) => Math.max(1, prev - 1));

  /* ---------- Generic input handlers ---------- */
  const handleInputChange = (section, field, value) => {
    setFormData((prev) => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, password: value }));
    if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
  };

  const handleRoleChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, role: value }));
  };

  /* ---------- Document upload (single) ----------
     Note: second param can be either a string docType or an object {id,label}
  */
  const handleDocumentUpload = async (e, docOrId) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const docType = typeof docOrId === "string" ? docOrId : docOrId.id;
    const docLabel = typeof docOrId === "object" ? docOrId.label : null;

    // validation
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      e.target.value = "";
      return;
    }
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      alert("Only JPEG, PNG, PDF, DOC, and DOCX files are allowed");
      e.target.value = "";
      return;
    }

    // start progress
    setUploadingDocs((prev) => ({ ...prev, [docType]: true }));
    setUploadProgress((prev) => ({ ...prev, [docType]: 0 }));

    try {
      const fd = new FormData();
      fd.append("document", file);

      const res = await axiosInstance.post("/upload-files/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (pe) => {
          if (pe.total) {
            const pct = Math.round((pe.loaded * 100) / pe.total);
            setUploadProgress((prev) => ({ ...prev, [docType]: pct }));
          }
        },
      });

      if (res.data?.success && res.data?.file) {
        const uploaded = res.data.file;
        // store friendly label as name if provided; keep originalName in originalName
        const docObj = {
          type: docType,
          name: docLabel || uploaded.originalName || file.name,
          originalName: uploaded.originalName || file.name,
          url: uploaded.url,
          fileType: uploaded.type,
        };

        // replace old doc with same type
        setFormData((prev) => {
          const without = (prev.basicInfo.documents || []).filter((d) => d.type !== docType);
          return {
            ...prev,
            basicInfo: { ...prev.basicInfo, documents: [...without, docObj] },
          };
        });
      } else {
        throw new Error("Invalid upload response");
      }
    } catch (err) {
      console.error("Document upload failed:", err);
      alert(err.response?.data?.message || err.message || "Upload failed");
    } finally {
      setUploadingDocs((prev) => ({ ...prev, [docType]: false }));
      setUploadProgress((prev) => ({ ...prev, [docType]: 0 }));
      e.target.value = ""; // reset input
    }
  };

  // const removeDocument = (docType) => {
  //   const newDocuments = (formData.basicInfo.documents || []).filter((doc) => doc.type !== docType);
  //   setFormData((prev) => ({ ...prev, basicInfo: { ...prev.basicInfo, documents: newDocuments } }));
  // };

  // Replace your existing removeDocument with this:
const removeDocument = (docTypeOrFile) => {
  // accept either a string type OR the uploaded file object
  const identifier =
    typeof docTypeOrFile === "string"
      ? docTypeOrFile
      : docTypeOrFile && (docTypeOrFile.type || docTypeOrFile.url || docTypeOrFile.originalName || docTypeOrFile.name);

  // optional: ask for confirmation
  if (!window.confirm("Are you sure you want to remove this document?")) return;

  const newDocuments = (formData.basicInfo.documents || []).filter((d) => {
    // if we don't have a robust identifier, fallback to removing by url/name if provided
    if (!identifier) return true; // nothing to match -> keep
    const matchesType = d.type && identifier && d.type === identifier;
    const matchesUrl = d.url && identifier && d.url === identifier;
    const matchesOriginal = d.originalName && identifier && d.originalName === identifier;
    const matchesName = d.name && identifier && d.name === identifier;
    // keep only those that DO NOT match (so we remove matches)
    return !(matchesType || matchesUrl || matchesOriginal || matchesName);
  });

  setFormData((prev) => ({
    ...prev,
    basicInfo: {
      ...prev.basicInfo,
      documents: newDocuments,
    },
  }));
};


  /* ---------- Profile image ---------- */
  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Profile image must be less than 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }
    setUploadingDocs((prev) => ({ ...prev, profile: true }));
    setUploadProgress((prev) => ({ ...prev, profile: 0 }));

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("document", file);

      const response = await axiosInstance.post("/upload-files/upload", formDataUpload, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress((prev) => ({ ...prev, profile: percentCompleted }));
          }
        },
      });

      if (response.data.success) {
        const uploadedFile = response.data.file;
        const imageFile = { name: uploadedFile.originalName, url: uploadedFile.url, fileType: uploadedFile.type };
        setProfileImage(imageFile);
        setFormData((prev) => ({ ...prev, basicInfo: { ...prev.basicInfo, profileImage: { url: uploadedFile.url } } }));
      }
    } catch (error) {
      console.error("Profile image upload error:", error);
      alert("Profile image upload failed. Please try again.");
    } finally {
      setUploadingDocs((prev) => ({ ...prev, profile: false }));
      setUploadProgress((prev) => ({ ...prev, profile: 0 }));
      e.target.value = ""; // Reset input
    }
  };

  const removeProfileImage = () => {
    setProfileImage(null);
    setFormData((prev) => ({ ...prev, basicInfo: { ...prev.basicInfo, profileImage: null } }));
  };

  /* ---------- Allowances / Deductions ---------- */
  const handleAddAllowance = () => {
    setFormData((prev) => ({ ...prev, payrollInfo: { ...prev.payrollInfo, allowances: [...prev.payrollInfo.allowances, { title: "", amount: 0 }] } }));
  };
  const handleRemoveAllowance = (index) => {
    setFormData((prev) => ({ ...prev, payrollInfo: { ...prev.payrollInfo, allowances: prev.payrollInfo.allowances.filter((_, i) => i !== index) } }));
  };
  const handleAddDeduction = () => {
    setFormData((prev) => ({ ...prev, payrollInfo: { ...prev.payrollInfo, deductions: [...prev.payrollInfo.deductions, { title: "", amount: 0 }] } }));
  };
  const handleRemoveDeduction = (index) => {
    setFormData((prev) => ({ ...prev, payrollInfo: { ...prev.payrollInfo, deductions: prev.payrollInfo.deductions.filter((_, i) => i !== index) } }));
  };

  /* ---------- Submit / Update ---------- */
  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    setIsSubmitting(true);

    try {
      // Upload profile image first if exists but not yet uploaded (has file)
      let profileImageData = null;
      if (profileImage && profileImage.file) {
        const fd = new FormData();
        fd.append("document", profileImage.file);
        const resp = await axiosInstance.post("/upload-files/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
        if (resp.data.file) profileImageData = resp.data.file;
      }

      // Upload other documents that are local (have file and no url)
      let uploadedFilesData = [];
      const filesToUpload = (formData.basicInfo.documents || []).filter((doc) => !doc.url && doc.file);
      if (filesToUpload.length > 0) {
        uploadedFilesData = await uploadFilesToCloudinary(filesToUpload);
      }

      // Prepare documents payload
      const documentsPayload = (formData.basicInfo.documents || []).map((doc) => {
        const uploadedDoc = uploadedFilesData.find((u) => u.type === doc.type || u.originalName === doc.originalName);
        if (uploadedDoc) {
          return { type: uploadedDoc.type, name: doc.name || uploadedDoc.originalName, url: uploadedDoc.url };
        }
        // Already uploaded / existing doc (keep friendly name if available)
        return { type: doc.type, name: doc.name || doc.originalName || doc.name, url: doc.url };
      });

      const employeeData = {
        basicInfo: {
          ...formData.basicInfo,
          profileImage: profileImageData ? { url: profileImageData.url } : formData.basicInfo.profileImage,
          documents: documentsPayload,
        },
        jobInfo: formData.jobInfo,
        payrollInfo: formData.payrollInfo,
        password: formData.password,
        role: formData.role,
      };

      const res = await axiosInstance.post("/employee/add", employeeData);

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
      let profileImageData = null;
      if (profileImage && profileImage.file) {
        const fd = new FormData();
        fd.append("document", profileImage.file);
        const response = await axiosInstance.post("/upload-files/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
        if (response.data.file) profileImageData = response.data.file;
      }

      // Upload other documents if exist locally
      let uploadedFilesData = [];
      const filesToUpload = (formData.basicInfo.documents || []).filter((doc) => !doc.url && doc.file);
      if (filesToUpload.length > 0) {
        uploadedFilesData = await uploadFilesToCloudinary(filesToUpload);
      }

      // Prepare documents payload
      const documentsPayload = (formData.basicInfo.documents || []).map((doc) => {
        const uploadedDoc = uploadedFilesData.find((u) => u.type === doc.type || u.originalName === doc.originalName);
        if (uploadedDoc) {
          return { type: uploadedDoc.type, name: doc.name || uploadedDoc.originalName, url: uploadedDoc.url };
        }
        // Use existing
        return { type: doc.type, name: doc.name || doc.originalName || doc.name, url: doc.url };
      });

      const employeeData = {
        basicInfo: {
          ...formData.basicInfo,
          profileImage: profileImageData ? { url: profileImageData.url } : formData.basicInfo.profileImage,
          documents: documentsPayload,
        },
        jobInfo: formData.jobInfo,
        payrollInfo: formData.payrollInfo,
      };

      const res = await axiosInstance.put(`/employee/update/${employee._id}`, employeeData);

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
      <button onClick={onClose} className="absolute top-4 right-4 z-10 bg-gray-200 hover:bg-gray-300 rounded-full p-2">✕</button>

      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{isEditMode ? "Edit Employee" : "Add New Employee"}</h2>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div className="bg-[#104774] h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between mb-2">
          {["Basic Info", "Job Details", "Payroll", "Credentials"].map((label, index) => (
            <div key={label} className={`text-xs font-medium ${
              step > index + 1 ? "text-green-600" : step === index + 1 ? "text-[#104774]" : "text-gray-500"
            }`}>
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
            handleDocumentUpload={handleDocumentUpload}
            removeDocument={removeDocument}
            profileImage={profileImage}
            handleProfileImageUpload={handleProfileImageUpload}
            removeProfileImage={removeProfileImage}
            isEditMode={isEditMode}
            uploadProgress={uploadProgress}
            uploadingDocs={uploadingDocs}
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
            <button onClick={handleBack} className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors" disabled={isSubmitting}>
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
            <button onClick={isEditMode ? handleUpdate : handleSubmit} disabled={isSubmitting}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors">
              {isSubmitting ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  {isEditMode ? "Updating..." : "Creating..."}
                </span>
              ) : isEditMode ? "Update Employee" : "Create Employee"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeForm;
