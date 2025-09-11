import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { Camera, Loader } from "lucide-react";

const EmployeeProfile = () => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchEmployeeProfile();
  }, []);

  const fetchEmployeeProfile = async () => {
    try {
      const res = await axiosInstance.get("/employee/profile");
      setEmployee(res.data.data);
    } catch (error) {
      console.error("Error fetching employee profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      alert("Please select a valid image file (JPEG, PNG, GIF)");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await axiosInstance.patch(
        "/employee/profile/image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Update local state with new image URL
      setEmployee((prev) => ({
        ...prev,
        avatarUrl: response.data.data.avatarUrl,
      }));

      alert("Profile image updated successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      alert(error.response?.data?.message || "Failed to upload image");
    } finally {
      setUploading(false);
      // Reset file input
      event.target.value = "";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#104774]"></div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Employee profile not found</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  function formatShiftTiming(shiftTiming) {
    if (
      shiftTiming === null ||
      typeof shiftTiming === "undefined" ||
      shiftTiming === ""
    )
      return "";

    // parse raw value into { hour, minute } or null
    const parseTime = (value) => {
      if (!value && value !== 0) return null;

      // Date object
      if (value instanceof Date) {
        return { hour: value.getHours(), minute: value.getMinutes() };
      }

      // If already an object like { hour, minute } or {h,m}
      if (typeof value === "object") {
        const hour = Number(
          value.hour ?? value.h ?? value.H ?? value.hours ?? value.hours24
        );
        const minute = Number(value.minute ?? value.m ?? 0);
        if (!Number.isNaN(hour)) return { hour, minute };
        return null;
      }

      // If number (treat as hour)
      if (typeof value === "number") {
        const hour = Math.floor(value);
        const minute = Math.round((value - hour) * 60);
        return { hour, minute };
      }

      // string: normalize then extract
      if (typeof value === "string") {
        let s = value.trim();

        // remove surrounding quotes/brackets if API sometimes returns JSON-like string
        if (
          (s.startsWith('"') && s.endsWith('"')) ||
          (s.startsWith("'") && s.endsWith("'"))
        ) {
          s = s.slice(1, -1).trim();
        }

        // capture AM/PM
        const ampmMatch = s.match(/\b(AM|PM)\b/i);
        const hasAMPM = !!ampmMatch;
        if (hasAMPM) s = s.replace(/\b(AM|PM)\b/i, "").trim();

        // split by colon or fallback numeric
        const parts = s.split(":").map((p) => p.trim());
        let hour, minute;
        if (parts.length === 1) {
          // maybe "0800" or "800" or "8"
          const single = parts[0];
          if (/^\d{3,4}$/.test(single)) {
            const p = single.padStart(4, "0");
            hour = parseInt(p.slice(0, 2), 10);
            minute = parseInt(p.slice(2), 10);
          } else {
            hour = parseInt(single, 10);
            minute = 0;
          }
        } else {
          hour = parseInt(parts[0], 10);
          minute = parseInt(parts[1], 10) || 0;
        }

        if (Number.isNaN(hour)) return null;
        if (hasAMPM) {
          const a = ampmMatch[0].toUpperCase();
          if (a === "PM" && hour !== 12) hour += 12;
          if (a === "AM" && hour === 12) hour = 0;
        }

        return { hour, minute };
      }

      return null;
    };

    const to12 = ({ hour, minute }) => {
      if (hour === null || typeof hour === "undefined") return "";
      const ampm = hour >= 12 ? "PM" : "AM";
      const h12 = hour % 12 === 0 ? 12 : hour % 12;
      const mm = String(minute ?? 0).padStart(2, "0");
      return `${String(h12).padStart(2, "0")}:${mm} ${ampm}`;
    };

    // get start / end raw strings from different shapes
    const getStartEndRaw = (raw) => {
      // if string containing a separator like "11:00 – 20:00"
      if (typeof raw === "string") {
        const parts = raw
          .split(/–|—|-|\bto\b/i)
          .map((p) => p.trim())
          .filter(Boolean);
        if (parts.length >= 2) return parts.slice(0, 2);
        // maybe JSON string: try parse
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) return parsed;
          if (parsed && typeof parsed === "object") {
            return [
              parsed.start ?? parsed.from ?? parsed.startTime,
              parsed.end ?? parsed.to ?? parsed.endTime,
            ];
          }
        } catch (_) {}
        return [raw];
      }

      if (Array.isArray(raw)) {
        return raw;
      }

      if (typeof raw === "object") {
        return [
          raw.start ?? raw.from ?? raw.startTime ?? raw[0],
          raw.end ?? raw.to ?? raw.endTime ?? raw[1],
        ];
      }

      // number or other
      return [String(raw)];
    };

    const [startRaw, endRaw] = getStartEndRaw(shiftTiming);
    const start = parseTime(startRaw);
    const end = parseTime(endRaw);

    if (start && end) return `${to12(start)} – ${to12(end)}`;

    // fallback: if only single string available, try to parse it directly as single time
    if (start) return to12(start);
    // last fallback: return a reasonable string
    if (typeof shiftTiming === "string") return shiftTiming;
    if (Array.isArray(shiftTiming)) return shiftTiming.join(" – ");
    if (typeof shiftTiming === "object")
      return `${startRaw ?? ""}${endRaw ? " – " + endRaw : ""}`;
    return String(shiftTiming);
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Profile Image with Upload Option */}
          <div className="flex-shrink-0 relative">
            <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200 relative group">
              {employee.avatarUrl ? (
                <img
                  src={employee.avatarUrl}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-4xl text-gray-600 font-semibold">
                  {employee.firstName?.charAt(0)}
                  {employee.lastName?.charAt(0)}
                </span>
              )}

              {/* Upload Overlay */}
              <label className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                {uploading ? (
                  <Loader className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Camera className="w-6 h-6 text-white" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>

            {/* Upload Text */}
            <div className="text-center mt-3">
              <label className="text-sm text-[#104774] cursor-pointer hover:underline">
                Change Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
              {uploading && (
                <p className="text-xs text-gray-500 mt-1">Uploading...</p>
              )}
            </div>
          </div>

          {/* Basic Info */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {employee.firstName} {employee.lastName}
            </h1>
            <p className="text-xl text-[#104774] font-semibold mb-3">
              {employee.designation || "Software Developer"}
            </p>
            <div className="space-y-1 text-gray-600">
              <p>
                Employee ID:{" "}
                <span className="font-medium text-gray-800">
                  {employee.employeeId}
                </span>
              </p>
              <p>
                Date of Joining:{" "}
                <span className="font-medium text-gray-800">
                  {formatDate(employee.dateOfJoining)}
                </span>
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex-shrink-0">
            <span
              className={`px-4 py-2 rounded-md text-sm font-semibold ${
                employee.user?.isActive
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {employee.user?.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </div>

      {/* Rest of your existing code remains the same */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Personal Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">
            Personal Information
          </h2>

          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-2/5 text-gray-600 font-medium">Phone:</div>
              <div className="w-3/5 text-gray-900 font-medium">
                {employee.phone || "+91 12347 65890"}
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-2/5 text-gray-600 font-medium">Email:</div>
              <div className="w-3/5 text-gray-900 font-medium break-all">
                {employee.user?.email || "anthony@gmail.com"}
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-2/5 text-gray-600 font-medium">
                Date of Birth:
              </div>
              <div className="w-3/5 text-gray-900 font-medium">
                {formatDate(employee.dob) || "28 December 1992"}
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-2/5 text-gray-600 font-medium">Address:</div>
              <div className="w-3/5 text-gray-900 font-medium">
                {employee.address || "Dehradun, Uttarakhand"}
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-2/5 text-gray-600 font-medium">Gender:</div>
              <div className="w-3/5 text-gray-900 font-medium capitalize">
                {employee.gender || "Male"}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Job Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">
            Job Details
          </h2>

          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-2/5 text-gray-600 font-medium">
                Designation:
              </div>
              <div className="w-3/5 text-gray-900 font-medium">
                {employee.designation || "Software Developer"}
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-2/5 text-gray-600 font-medium">Department:</div>
              <div className="w-3/5 text-gray-900 font-medium">
                {employee.department || "IT & Development"}
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-2/5 text-gray-600 font-medium">
                Employment Type:
              </div>
              <div className="w-3/5 text-gray-900 font-medium capitalize">
                {employee.employmentType
                  ? employee.employmentType.replace("-", " ")
                  : "Full Time"}
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-2/5 text-gray-600 font-medium">
                Shift Timing:
              </div>
              <div className="w-3/5 text-gray-900 font-medium">
                {formatShiftTiming(employee.shiftTiming) ||
                  "10:00 AM – 07:00 PM"}
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-2/5 text-gray-600 font-medium">Work Mode:</div>
              <div className="w-3/5 text-gray-900 font-medium capitalize">
                {employee.workMode
                  ? employee.workMode.replace(/-/g, " ")
                  : "Work From Home"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Documents Section */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">
          Documents
        </h2>

        {employee.documents && employee.documents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employee.documents.map((doc, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center min-w-0 flex-1">
                  <div className="w-10 h-10 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-gray-500 text-sm">📄</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {doc.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Uploaded:{" "}
                      {doc.uploadedAt ? formatDate(doc.uploadedAt) : "N/A"}
                    </p>
                  </div>
                </div>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-3 text-[#104774] hover:text-[#0d3a5f] text-sm font-medium flex-shrink-0"
                >
                  View
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-gray-400 text-2xl">📂</span>
            </div>
            <p className="text-gray-500 font-medium">No documents available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeProfile;
