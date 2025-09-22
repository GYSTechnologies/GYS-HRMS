import React, { useEffect, useState, useRef } from "react";
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Heart,
  Coffee,
  AlertCircle,
  Download,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Trash2,
  X,
} from "lucide-react";
import axiosInstance from "../utils/axiosInstance";
import { useAuth } from "../context/AppContext";
import { toast } from "react-toastify";

export default function EmployeeLeaves() {
  const { user, token } = useAuth();
  const [leaveBalance, setLeaveBalance] = useState({});
  const [leaveApplications, setLeaveApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [formData, setFormData] = useState({
    leaveType: "",
    fromDate: "",
    toDate: "",
    reason: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [indianHolidays, setIndianHolidays] = useState([]); // kept for debugging/UI if needed
  const indianHolidayDatesRef = useRef(new Set()); // stores 'YYYY-MM-DD' strings for fast lookup
  const fetchedYearsRef = useRef(new Set()); // which years we've fetched
  const [calculatingDays, setCalculatingDays] = useState(false);
  const [workingDays, setWorkingDays] = useState(null);

  // --- Helpers ---
  const pad = (n) => n.toString().padStart(2, "0");
  const formatYMD = (d) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; // local date format

  // Robust holiday fetcher & normalizer
  const fetchIndianHolidaysNormalized = async (year) => {
    try {
      const apiKey = import.meta.env.VITE_CALENDAR_API_KEY;
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/en.indian%23holiday@group.v.calendar.google.com/events?key=${apiKey}&timeMin=${year}-01-01T00:00:00Z&timeMax=${year}-12-31T23:59:59Z`
      );
      const data = await response.json();
      const items = data.items || [];

      // Whitelist for national holidays that may not contain the word 'holiday' or are sometimes labelled as Observance
      const whitelist = [
        "republic day",
        "independence day",
        "gandhi",
        "mahatma gandhi",
        "gandhi jayanti",
        "diwali",
        "deepavali",
        "dussehra",
        "dashera",
        "holi",
        "christmas",
        "new year's",
        "new year",
        "good friday",
        "eid",
        "bakrid",
        "ramzan",
        "guru nanak",
        "janmashtami",
        "mahavir",
        "pongal",
        "makar sankranti",
        "dussehra",
        "dussehra",
        "mahatma gandhi jayanti",
        "mahatma gandhi",
        "mahatma",
      ];

      const normalized = items
        .map((ev) => {
          // determine a date string in YYYY-MM-DD
          const start = ev.start || {};
          let dateStr = null;
          if (start.date) {
            dateStr = start.date; // already YYYY-MM-DD
          } else if (start.dateTime) {
            // convert to local yyyy-mm-dd using Date
            const dt = new Date(start.dateTime);
            dateStr = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(
              dt.getDate()
            )}`;
          }

          const summary = (ev.summary || "").toString();
          const description = (ev.description || "").toString();

          // Decide if it's official: prefer description markers, then whitelist by summary
          let isOfficial = false;
          const descLower = description.toLowerCase();
          const sumLower = summary.toLowerCase();

          if (
            descLower.includes("public holiday") ||
            descLower.includes("public")
          ) {
            isOfficial = true;
          } else if (descLower.includes("observance")) {
            isOfficial = false;
          } else if (sumLower.includes("holiday")) {
            isOfficial = true;
          } else {
            // check whitelist keywords
            for (const kw of whitelist) {
              if (sumLower.includes(kw)) {
                isOfficial = true;
                break;
              }
            }
          }

          return {
            id: ev.id,
            title: summary,
            date: dateStr,
            description,
            htmlLink: ev.htmlLink,
            isOfficial,
          };
        })
        .filter((e) => e.date); // drop items we couldn't compute a date for

      // return only normalized array (caller will decide to keep official-only)
      return normalized;
    } catch (err) {
      console.error("Error fetching holidays:", err);
      return [];
    }
  };

  // Fetch and cache holidays for a list of years (fast lookup via Set)
  const fetchAndCacheHolidaysForYears = async (years = []) => {
    const missing = years.filter((y) => !fetchedYearsRef.current.has(y));
    if (missing.length === 0) return; // already fetched

    const allNew = [];
    for (const y of missing) {
      const normalized = await fetchIndianHolidaysNormalized(y);
      // keep only official ones
      const official = normalized.filter((e) => e.isOfficial);
      allNew.push(...official);
      fetchedYearsRef.current.add(y);
    }

    if (allNew.length > 0) {
      // update ref Set for dates and state copy
      const newDates = new Set(indianHolidayDatesRef.current);
      const mergedHolidays = [...indianHolidays];
      for (const h of allNew) {
        if (h.date && !newDates.has(h.date)) {
          newDates.add(h.date);
          mergedHolidays.push(h);
        }
      }

      indianHolidayDatesRef.current = newDates;
      setIndianHolidays(mergedHolidays);
    }
  };

  // Calculate working days excluding Sundays and cached Indian holidays
  const calculateWorkingDays = async (fromDate, toDate) => {
    if (!fromDate || !toDate) return 0;

    setCalculatingDays(true);
    try {
      const from = new Date(fromDate);
      const to = new Date(toDate);

      if (isNaN(from) || isNaN(to)) return 0;
      if (from > to) return 0;

      // ensure we have holidays for both years
      const years = new Set([from.getFullYear(), to.getFullYear()]);
      await fetchAndCacheHolidaysForYears(Array.from(years));

      // use local ref Set for fastest lookup
      const holidayDatesSet = indianHolidayDatesRef.current;

      let count = 0;
      const current = new Date(from);
      while (current <= to) {
        const dow = current.getDay();
        const isSunday = dow === 0;
        const ymd = formatYMD(current);
        const isHoliday = holidayDatesSet.has(ymd);

        if (!isSunday && !isHoliday) count++;
        current.setDate(current.getDate() + 1);
      }

      return count;
    } catch (err) {
      console.error("Error calculating working days:", err);
      return 0;
    } finally {
      setCalculatingDays(false);
    }
  };

  // Fetch Leave Balance
  const fetchLeaveBalance = async () => {
    if (!user) return;
    try {
      const res = await axiosInstance.get(`/leave/balance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeaveBalance(res.data.balance || {});
    } catch (err) {
      console.error("Error fetching leave balance:", err);
      toast.error("Failed to fetch leave balance");
    }
  };

  // Fetch Leave Types
  const fetchLeaveTypes = async () => {
    try {
      const res = await axiosInstance.get("/leave/get-leaveTypes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const activeTypes = (res.data || []).filter((type) => type.isActive);
      setLeaveTypes(activeTypes);

      if (activeTypes.length > 0 && !formData.leaveType) {
        setFormData((prev) => ({ ...prev, leaveType: activeTypes[0].name }));
      }
    } catch (err) {
      console.error("Error fetching leave types:", err);
      toast.error("Failed to fetch leave types");
    }
  };

  // Fetch Employee Leave Requests
  const fetchLeaveRequests = async () => {
    if (!user) return;
    try {
      const res = await axiosInstance.get("/leave/my-requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeaveApplications(res.data || []);
      setFilteredApplications(res.data || []);
    } catch (err) {
      console.error("Error fetching leave requests:", err);
      toast.error("Failed to fetch leave requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchLeaveBalance();
      fetchLeaveTypes();
      fetchLeaveRequests();

      // preload current year holidays
      const y = new Date().getFullYear();
      fetchAndCacheHolidaysForYears([y]).catch((err) => console.error(err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // When form dates change, auto-calculate working days
  useEffect(() => {
    let cancelled = false;
    const doCalc = async () => {
      if (formData.fromDate && formData.toDate) {
        setCalculatingDays(true);
        const days = await calculateWorkingDays(
          formData.fromDate,
          formData.toDate
        );
        if (!cancelled) setWorkingDays(days);
        setCalculatingDays(false);
      } else {
        setWorkingDays(null);
      }
    };

    doCalc();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.fromDate, formData.toDate]);

  // Filter applications based on search and filters
  useEffect(() => {
    let filtered = leaveApplications;

    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((app) => app.leaveType === typeFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (app) =>
          (app.reason || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (app.leaveType || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (app.status || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredApplications(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, typeFilter, leaveApplications]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredApplications.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validate form
  const validateForm = async () => {
    const errors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const fromDateObj = new Date(formData.fromDate);
    fromDateObj.setHours(0, 0, 0, 0);

    if (!formData.leaveType) errors.leaveType = "Leave type is required";
    if (!formData.fromDate) errors.fromDate = "From date is required";
    if (!formData.toDate) errors.toDate = "To date is required";

    if (formData.fromDate && formData.toDate) {
      if (new Date(formData.fromDate) > new Date(formData.toDate)) {
        errors.toDate = "To date cannot be before from date";
      }

      if (fromDateObj < today) {
        errors.fromDate = "Cannot apply for backdated leaves";
      }

      const requestedDays = await calculateWorkingDays(
        formData.fromDate,
        formData.toDate
      );
      const available = leaveBalance[formData.leaveType] ?? 0;
      if (available < requestedDays) {
        errors.leaveType = `Insufficient ${formData.leaveType} leave balance! You have ${available} days left.`;
      }
    }

    if (!formData.reason.trim()) errors.reason = "Reason is required";
    if (formData.reason.length > 500)
      errors.reason = "Reason cannot exceed 500 characters";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle date changes
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!(await validateForm())) return;

    setSubmitting(true);
    try {
      const totalDays = await calculateWorkingDays(
        formData.fromDate,
        formData.toDate
      );
      const submitData = { ...formData, totalDays };
      await axiosInstance.post("/leave/create", submitData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Leave applied successfully!");
      setShowModal(false);
      setFormData({
        leaveType: leaveTypes[0]?.name || "",
        fromDate: "",
        toDate: "",
        reason: "",
      });
      fetchLeaveBalance();
      fetchLeaveRequests();
    } catch (err) {
      console.error("Error applying leave:", err);
      const errorMsg =
        err.response?.data?.message ||
        "Error applying leave. Please try again.";
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Cancel leave request
  const cancelLeave = async (leaveId) => {
    if (cancelling) return;
    setCancelling(true);
    try {
      await axiosInstance.put(
        `/leave/requests/${leaveId}/cancel`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Leave cancelled successfully!");
      fetchLeaveRequests();
    } catch (err) {
      console.error("Error cancelling leave:", err);
      toast.error(err.response?.data?.message || "Error cancelling leave");
    } finally {
      setCancelling(false);
    }
  };

  // CSV export with proper quoting
  const escapeCsv = (val) => `"${(val ?? "").toString().replace(/"/g, '""')}"`;
  const exportLeaveHistory = () => {
    const csvRows = [
      ["Date Range", "Type", "Days", "Status", "Reason", "Applied On"],
      ...filteredApplications.map((app) => [
        `${new Date(app.fromDate).toLocaleDateString()} to ${new Date(
          app.toDate
        ).toLocaleDateString()}`,
        app.leaveType,
        app.totalDays,
        app.status,
        app.reason || "-",
        new Date(app.appliedAt).toLocaleDateString(),
      ]),
    ];

    const csvContent = csvRows
      .map((row) => row.map(escapeCsv).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leave-history.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Leave history exported successfully!");
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setTypeFilter("all");
    setFilteredApplications(leaveApplications);
  };

  // Icons & formatting
  const getLeaveTypeIcon = (type) => {
    switch (type) {
      case "sick":
        return <Heart size={16} className="text-red-400 mr-2" />;
      case "casual":
        return <Coffee size={16} className="text-purple-400 mr-2" />;
      case "paid":
        return <CheckCircle size={16} className="text-green-400 mr-2" />;
      default:
        return <Calendar size={16} className="text-blue-400 mr-2" />;
    }
  };

  const formatLeaveTypeName = (type) =>
    type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#104774]"></div>
      </div>
    );

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-50 min-h-[80vh">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Leave Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center bg-[#104774] text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium hover:bg-[#0d3a61] transition-all duration-200 w-full md:w-auto justify-center"
        >
          <Plus size={20} className="mr-2" />
          Apply For Leave
        </button>
      </div>

      {/* Leave Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Object.entries(leaveBalance).map(([type, balance]) => (
          <div
            key={type}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div
                  className={`w-3 h-3 rounded-full mr-2 ${
                    type === "sick"
                      ? "bg-red-300"
                      : type === "casual"
                      ? "bg-purple-300"
                      : "bg-green-400"
                  }`}
                ></div>
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {formatLeaveTypeName(type)}
                </span>
              </div>
              {type === "sick" ? (
                <Heart size={18} className="text-red-300" />
              ) : type === "casual" ? (
                <Coffee size={18} className="text-purple-300" />
              ) : (
                <CheckCircle size={18} className="text-green-400" />
              )}
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-2">
              {balance}{" "}
              <span className="text-sm font-medium text-gray-500">
                days left
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  type === "sick"
                    ? "bg-red-300"
                    : type === "casual"
                    ? "bg-purple-300"
                    : "bg-green-400"
                }`}
                style={{ width: `${Math.min((balance / 10) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Table and modal UI (copied/adapted from your original) */}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
          <div className="flex items-center">
            <Calendar size={24} className="text-[#104774] mr-3" />
            <h3 className="text-lg font-semibold text-gray-800">
              Leave Application History
            </h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search leaves..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#104774] w-full"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-3 py-2 border rounded-lg hover:bg-gray-50 text-sm"
            >
              <Filter size={16} className="mr-2" />
              Filters
              {showFilters ? (
                <ChevronUp size={14} className="ml-1" />
              ) : (
                <ChevronDown size={14} className="ml-1" />
              )}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Leave Type
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm"
                >
                  <option value="all">All Types</option>
                  {leaveTypes.map((type) => (
                    <option key={type._id} value={type.name}>
                      {formatLeaveTypeName(type.name)} (
                      {leaveBalance[type.name] ?? 0} left)
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={resetFilters}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm"
                >
                  Reset Filters
                </button>
              </div>
              {/* <div className="flex items-end">
                <button
                  onClick={exportLeaveHistory}
                  className="flex items-center px-3 py-2 border rounded-lg hover:bg-gray-100 text-sm w-full justify-center"
                >
                  <Download size={16} className="mr-2" />
                  Export
                </button>
              </div> */}
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <div className="max-h-[400px] overflow-y-auto border border-gray-200 rounded-lg shadow-md">
            <table className="w-full border-collapse">
              <thead className="bg-[#104774] text-white sticky top-0 z-10">
                <tr>
                  <th className="p-3 text-left font-medium text-sm">
                    Date Range
                  </th>
                  <th className="p-3 text-left font-medium text-sm">Type</th>
                  <th className="p-3 text-left font-medium text-sm">Days</th>
                  <th className="p-3 text-left font-medium text-sm hidden md:table-cell">
                    Reason
                  </th>
                  <th className="p-3 text-left font-medium text-sm">Status</th>
                  <th className="p-3 text-left font-medium text-sm hidden lg:table-cell">
                    Applied On
                  </th>
                  <th className="p-3 text-left font-medium text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((row, index) => {
                    const formatDate = (date) =>
                      new Date(date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      });

                    return (
                      <tr
                        key={index}
                        className={`transition-colors ${
                          index % 2 === 0
                            ? "bg-white hover:bg-gray-50"
                            : "bg-gray-100 hover:bg-gray-200"
                        }`}
                      >
                        {/* Date Range */}
                        <td className="p-3 font-medium text-gray-800 text-sm">
                          {`${formatDate(row.fromDate)} – ${formatDate(
                            row.toDate
                          )}`}
                        </td>

                        {/* Type */}
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            {getLeaveTypeIcon(row.leaveType)}
                            <span className="text-gray-700 capitalize text-sm">
                              {formatLeaveTypeName(row.leaveType)}
                            </span>
                          </div>
                        </td>

                        {/* Days */}
                        <td className="p-3 text-sm">
                          {row.totalDays} {row.totalDays === 1 ? "day" : "days"}
                        </td>

                        {/* Reason with tooltip */}
                        <td className="p-3 text-gray-600 text-sm hidden md:table-cell max-w-xs">
                          <div className="relative group w-fit">
                            <span className="truncate block max-w-[150px] cursor-help">
                              {row.reason || "-"}
                            </span>
                            {row.reason && (
                              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:flex bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-normal max-w-xs z-50">
                                <span className="leading-snug">
                                  {row.reason}
                                </span>
                                <div className="absolute left-3 top-full w-2 h-2 bg-gray-900 rotate-45"></div>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="p-3">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              row.status === "approved"
                                ? "bg-green-100 text-green-700 border border-green-200"
                                : row.status === "pending"
                                ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                                : row.status === "rejected"
                                ? "bg-red-100 text-red-700 border border-red-200"
                                : "bg-gray-100 text-gray-700 border border-gray-200"
                            }`}
                          >
                            {row.status === "approved" && (
                              <CheckCircle size={12} className="mr-1" />
                            )}
                            {row.status === "pending" && (
                              <Clock size={12} className="mr-1" />
                            )}
                            {row.status === "rejected" && (
                              <XCircle size={12} className="mr-1" />
                            )}
                            {row.status.charAt(0).toUpperCase() +
                              row.status.slice(1)}
                          </span>
                        </td>

                        {/* Applied On */}
                        <td className="p-3 text-gray-600 text-sm hidden lg:table-cell">
                          {formatDate(row.appliedAt)}
                        </td>

                        {/* Actions */}
                        <td className="p-3">
                          {row.status === "pending" && (
                            <button
                              onClick={() => cancelLeave(row._id)}
                              disabled={cancelling}
                              className="flex items-center text-red-600 hover:text-red-800 text-xs font-medium disabled:opacity-50"
                            >
                              <Trash2 size={12} className="mr-1" />
                              {cancelling ? "..." : "Cancel"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="p-6 text-center text-gray-500 text-sm"
                    >
                      {leaveApplications.length === 0
                        ? "No leave applications found. Apply for your first leave!"
                        : "No leaves match your filters."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="text-sm text-gray-500">
              Showing {indexOfFirstItem + 1} to{" "}
              {Math.min(indexOfLastItem, filteredApplications.length)} of{" "}
              {filteredApplications.length} entries
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-2 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Prev
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-2 py-1 rounded border text-sm ${
                      currentPage === pageNum
                        ? "bg-[#104774] text-white border-[#104774]"
                        : "border-gray-300"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-2 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Apply Leave Modal */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-md bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4">Apply for Leave</h2>

            {formData.leaveType &&
              leaveBalance[formData.leaveType] !== undefined && (
                <div className="bg-blue-50 p-3 rounded-lg mb-4">
                  <p className="text-blue-800 font-medium text-sm">
                    Available {formatLeaveTypeName(formData.leaveType)} leave:{" "}
                    {leaveBalance[formData.leaveType]} days
                  </p>
                </div>
              )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium text-sm">
                  Leave Type
                </label>
                <select
                  name="leaveType"
                  value={formData.leaveType}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#104774] text-sm"
                  required
                >
                  <option value="">Select Leave Type</option>
                  {leaveTypes.map((type) => (
                    <option key={type._id} value={type.name}>
                      {formatLeaveTypeName(type.name)} (
                      {leaveBalance[type.name] ?? 0} left)
                    </option>
                  ))}
                </select>
                {formErrors.leaveType && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle size={12} className="mr-1" />{" "}
                    {formErrors.leaveType}
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-1 font-medium text-sm">
                  From Date
                </label>
                <input
                  type="date"
                  name="fromDate"
                  value={formData.fromDate}
                  onChange={handleDateChange}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#104774] text-sm"
                  required
                />
                {formErrors.fromDate && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle size={12} className="mr-1" />{" "}
                    {formErrors.fromDate}
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-1 font-medium text-sm">
                  To Date
                </label>
                <input
                  type="date"
                  name="toDate"
                  value={formData.toDate}
                  onChange={handleDateChange}
                  min={
                    formData.fromDate || new Date().toISOString().split("T")[0]
                  }
                  className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#104774] text-sm"
                  required
                />
                {formErrors.toDate && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle size={12} className="mr-1" />{" "}
                    {formErrors.toDate}
                  </p>
                )}
              </div>

              {formData.fromDate && formData.toDate && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-700 font-medium text-sm">
                    {calculatingDays
                      ? "Calculating..."
                      : `Working Days: ${workingDays ?? 0}`}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    (Excludes Sundays and Indian public holidays)
                  </p>
                </div>
              )}

              <div>
                <label className="block mb-1 font-medium text-sm">Reason</label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#104774] text-sm"
                  placeholder="Please provide a reason for your leave"
                  required
                />
                <div className="text-xs text-gray-500 mt-1">
                  {formData.reason.length}/500 characters
                </div>
                {formErrors.reason && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle size={12} className="mr-1" />{" "}
                    {formErrors.reason}
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-[#104774] text-white hover:bg-[#0d3a61] disabled:opacity-50 text-sm"
                >
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
