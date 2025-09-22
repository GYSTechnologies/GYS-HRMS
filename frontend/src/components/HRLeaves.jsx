import React, { useEffect, useState, useRef } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Calendar,
  Coffee,
  Heart,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  ChevronDown,
  ChevronUp,
  User,
  Trash2,
  AlertCircle,
  Users,
  FileText,
  X,
  Menu,
} from "lucide-react";
import axiosInstance from "../utils/axiosInstance";
import { useAuth } from "../context/AppContext";
import { toast } from "react-toastify";

const HRLeaves = () => {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState("employeeLeaves");
  const [employeeLeaveRequests, setEmployeeLeaveRequests] = useState([]);
  const [myLeaveRequests, setMyLeaveRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState({});
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionRemark, setActionRemark] = useState("");
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [typeFilter, setTypeFilter] = useState("all");
  const [expandedRequest, setExpandedRequest] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  // indianHolidaysCache: { [year]: Set('YYYY-MM-DD') }
  const [indianHolidaysCache, setIndianHolidaysCache] = useState({});
  const [calculatingDays, setCalculatingDays] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Working days for HR apply modal
  const [workingDays, setWorkingDays] = useState(null);
  const latestCalcRef = useRef(0);

  // New leave form state
  const [newLeave, setNewLeave] = useState({
    leaveType: "",
    fromDate: "",
    toDate: "",
    reason: "",
  });

  const [formErrors, setFormErrors] = useState({});

  // Utility: convert Date -> YYYY-MM-DD (uses ISO to avoid locale quirks)
  const toYMD = (date) => {
    if (!(date instanceof Date)) date = new Date(date);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString().slice(0, 10);
  };

  // Utility: get a normalized date string from Google Calendar event
  const holidayEventToYMD = (event) => {
    if (!event || !event.start) return null;
    const start = event.start;
    // prefer all-day date
    const raw = start.date || start.dateTime || start?.dateTime;
    if (!raw) return null;
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return null;
    return toYMD(d);
  };

  // Fetch Indian holidays for a given year and store as Set('YYYY-MM-DD')
  const fetchIndianHolidaysForYear = async (year) => {
    // check cache first
    if (indianHolidaysCache[year]) return indianHolidaysCache[year];

    try {
      const apiKey = import.meta.env?.VITE_CALENDAR_API_KEY || "";
      if (!apiKey) {
        console.warn(
          "VITE_CALENDAR_API_KEY not provided — holiday fetching will be skipped."
        );
        setIndianHolidaysCache((prev) => ({ ...prev, [year]: new Set() }));
        return new Set();
      }

      const timeMin = `${year}-01-01T00:00:00Z`;
      const timeMax = `${year}-12-31T23:59:59Z`;
      const url = `https://www.googleapis.com/calendar/v3/calendars/en.indian%23holiday%40group.v.calendar.google.com/events?key=${apiKey}&timeMin=${timeMin}&timeMax=${timeMax}&maxResults=500`;

      const res = await fetch(url);
      const data = await res.json();

      const items = data.items || [];

      // Filter for PUBLIC/official holidays:
      // include event if description contains 'public holiday' OR summary contains 'holiday'
      // (This matches the "Holidays in India" calendar convention where official holidays have "Public holiday" description)
      const official = items.filter((ev) => {
        const summary = (ev.summary || "").toLowerCase();
        const description = (ev.description || "").toLowerCase();
        const visibility = (ev.visibility || "").toLowerCase();

        if (description.includes("public holiday")) return true;
        if (summary.includes("holiday")) return true;

        // as fallback, include events marked public but not explicitly labelled 'observance'
        if (visibility === "public" && !description.includes("observance"))
          return true;

        return false;
      });

      const setDates = new Set();
      official.forEach((ev) => {
        const ymd = holidayEventToYMD(ev);
        if (ymd) setDates.add(ymd);
      });

      setIndianHolidaysCache((prev) => ({ ...prev, [year]: setDates }));
      return setDates;
    } catch (err) {
      console.error("Error fetching Indian holidays for year", year, err);
      setIndianHolidaysCache((prev) => ({ ...prev, [year]: new Set() }));
      return new Set();
    }
  };

  // Calculate working days excluding Sundays and Indian official public holidays.
  // This function loads holidays for all years in the range and uses cached sets for speed.
  const calculateWorkingDays = async (fromDate, toDate) => {
    setCalculatingDays(true);
    const calcId = ++latestCalcRef.current;

    try {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return 0;
      if (from > to) return 0;

      // collect years between the two dates
      const years = new Set();
      const yStart = from.getFullYear();
      const yEnd = to.getFullYear();
      for (let y = yStart; y <= yEnd; y++) years.add(y);

      // ensure we have holiday sets for each year
      const yearSets = {};
      for (const y of years) {
        yearSets[y] = await fetchIndianHolidaysForYear(y);
      }

      // build quick lookup closure
      const isHolidayDate = (dateObj) => {
        const ymd = toYMD(dateObj);
        if (!ymd) return false;
        const y = new Date(dateObj).getFullYear();
        const s = yearSets[y];
        if (!s) return false;
        return s.has(ymd);
      };

      let count = 0;
      const cur = new Date(from);
      cur.setHours(0, 0, 0, 0);
      const end = new Date(to);
      end.setHours(0, 0, 0, 0);

      while (cur <= end) {
        const day = cur.getDay();
        const isSunday = day === 0;
        const holiday = isHolidayDate(cur);

        if (!isSunday && !holiday) count++;

        cur.setDate(cur.getDate() + 1);
      }

      // check if this result is still the latest requested
      if (calcId === latestCalcRef.current) {
        setWorkingDays(count);
      }
      return count;
    } catch (err) {
      console.error("Error calculating working days:", err);
      if (calcId === latestCalcRef.current) setWorkingDays(null);
      return 0;
    } finally {
      setCalculatingDays(false);
    }
  };

  // Fetch Leave Types
  const fetchLeaveTypes = async () => {
    try {
      const res = await axiosInstance.get("/leave/get-leaveTypes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const activeTypes = res.data.filter((type) => type.isActive);
      setLeaveTypes(activeTypes);

      // Set default leave type if available
      if (activeTypes.length > 0 && !newLeave.leaveType) {
        setNewLeave((prev) => ({ ...prev, leaveType: activeTypes[0].name }));
      }
    } catch (err) {
      console.error("Error fetching leave types:", err);
      toast.error("Failed to fetch leave types");
    }
  };

  // Fetch all employee leave requests (for HR to manage)
  const fetchEmployeeLeaveRequests = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/leave/requests", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Filter to show only employee leaves (not HR or Admin leaves)
      const employeeLeaves = res.data.filter(
        (request) => request.employee?.role === "employee"
      );

      setEmployeeLeaveRequests(employeeLeaves);
      setFilteredRequests(employeeLeaves);
    } catch (err) {
      console.error("Error fetching employee leave requests:", err);
      toast.error("Failed to fetch employee leave requests");
    } finally {
      setLoading(false);
    }
  };

  // Fetch HR's own leave requests
  const fetchMyLeaveRequests = async () => {
    try {
      const res = await axiosInstance.get("/leave/my-requests", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMyLeaveRequests(res.data);
    } catch (err) {
      console.error("Error fetching my leave requests:", err);
      toast.error("Failed to fetch your leave requests");
    }
  };

  // Fetch HR own leave balance
  const fetchLeaveBalance = async () => {
    try {
      const res = await axiosInstance.get("/leave/balance", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeaveBalance(res.data.balance || {});
    } catch (err) {
      console.error("Error fetching leave balance:", err);
      toast.error("Failed to fetch leave balance");
    }
  };

  useEffect(() => {
    if (token) {
      fetchLeaveTypes();
      fetchLeaveBalance();
      if (activeTab === "employeeLeaves") {
        fetchEmployeeLeaveRequests();
      } else {
        fetchMyLeaveRequests();
      }

      // Pre-load current year holidays (best-effort)
      fetchIndianHolidaysForYear(new Date().getFullYear()).then(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, activeTab]);

  // Filter and search functionality for employee leaves
  useEffect(() => {
    if (activeTab !== "employeeLeaves") return;

    let result = employeeLeaveRequests;

    // Apply search filter
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (request) =>
          request.employee?.email?.toLowerCase().includes(q) ||
          request.leaveType?.toLowerCase().includes(q) ||
          request.reason?.toLowerCase().includes(q)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((request) => request.status === statusFilter);
    }

    // Apply type filter
    if (typeFilter !== "all") {
      result = result.filter((request) => request.leaveType === typeFilter);
    }

    setFilteredRequests(result);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, typeFilter, employeeLeaveRequests, activeTab]);

  // Sort functionality
  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });

    const sortedData = [...filteredRequests].sort((a, b) => {
      // Handle nested properties
      let aValue, bValue;
      if (key.includes(".")) {
        const keys = key.split(".");
        aValue = keys.reduce((obj, k) => obj && obj[k], a);
        bValue = keys.reduce((obj, k) => obj && obj[k], b);
      } else {
        aValue = a[key];
        bValue = b[key];
      }

      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;

      if (aValue < bValue) {
        return direction === "ascending" ? -1 : 1;
      }
      if (aValue > bValue) {
        return direction === "ascending" ? 1 : -1;
      }
      return 0;
    });

    setFilteredRequests(sortedData);
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRequests.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  // Validate leave application form
  const validateForm = async () => {
    const errors = {};
    const today = new Date().setHours(0, 0, 0, 0);
    const fromDate = new Date(newLeave.fromDate).setHours(0, 0, 0, 0);

    if (!newLeave.leaveType) errors.leaveType = "Leave type is required";
    if (!newLeave.fromDate) errors.fromDate = "From date is required";
    if (!newLeave.toDate) errors.toDate = "To date is required";

    if (newLeave.fromDate && newLeave.toDate) {
      if (new Date(newLeave.fromDate) > new Date(newLeave.toDate)) {
        errors.toDate = "To date cannot be before from date";
      }

      if (fromDate < today) {
        errors.fromDate = "Cannot apply for backdated leaves";
      }

      const requestedDays = await calculateWorkingDays(
        newLeave.fromDate,
        newLeave.toDate
      );
      const available = leaveBalance[newLeave.leaveType] ?? 0;
      if (available < requestedDays) {
        errors.leaveType = `Insufficient ${newLeave.leaveType} leave balance! You have ${available} days left.`;
      }
    }

    if (!newLeave.reason?.trim()) errors.reason = "Reason is required";
    if (newLeave.reason?.length > 500)
      errors.reason = "Reason cannot exceed 500 characters";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewLeave((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // When dates change, auto-calculate working days (debounced by latestCalcRef)
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (newLeave.fromDate && newLeave.toDate) {
        setWorkingDays(null);
        await calculateWorkingDays(newLeave.fromDate, newLeave.toDate);
        if (!cancelled) {
          // calculateWorkingDays sets workingDays state internally when latest calculation matches
        }
      } else {
        setWorkingDays(null);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newLeave.fromDate, newLeave.toDate]);

  // Handle date change events
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setNewLeave((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Apply for leave as HR
  const handleApplyLeave = async (e) => {
    e.preventDefault();

    if (submitting) return;
    if (!(await validateForm())) return;

    setSubmitting(true);

    try {
      // Calculate total working days (again, ensure accurate)
      const totalDays = await calculateWorkingDays(
        newLeave.fromDate,
        newLeave.toDate
      );

      const submitData = {
        ...newLeave,
        totalDays,
      };

      await axiosInstance.post("/leave/create", submitData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Leave applied successfully!");
      setShowApplyModal(false);
      setNewLeave({
        leaveType: leaveTypes[0]?.name || "",
        fromDate: "",
        toDate: "",
        reason: "",
      });
      setFormErrors({});
      fetchLeaveBalance();
      fetchMyLeaveRequests();
    } catch (err) {
      console.error("Error applying for leave:", err);
      const errorMsg =
        err.response?.data?.message ||
        "Error applying leave. Please try again.";
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Approve or Reject employee leave
  const handleAction = async (requestId, action) => {
    try {
      await axiosInstance.post(
        `/leave/${requestId}/review`,
        { action, reason: actionRemark || `${action}ed by HR` },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSelectedRequest(null);
      setActionRemark("");
      setShowActionModal(false);
      fetchEmployeeLeaveRequests();
      fetchLeaveBalance();
      toast.success(`Leave ${action}ed successfully!`);
    } catch (err) {
      console.error("Error updating leave:", err);
      const errorMsg =
        err.response?.data?.message || "Error processing leave request.";
      toast.error(errorMsg);
    }
  };

  // Cancel own leave request
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
      fetchMyLeaveRequests();
      fetchLeaveBalance();
    } catch (err) {
      console.error("Error cancelling leave:", err);
      toast.error(err.response?.data?.message || "Error cancelling leave");
    } finally {
      setCancelling(false);
    }
  };

 

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setTypeFilter("all");
    setFilteredRequests(employeeLeaveRequests);
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      approved: {
        bg: "bg-green-100",
        text: "text-green-700",
        border: "border-green-200",
        icon: CheckCircle,
      },
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        border: "border-yellow-200",
        icon: Clock,
      },
      rejected: {
        bg: "bg-red-100",
        text: "text-red-700",
        border: "border-red-200",
        icon: XCircle,
      },
      cancelled: {
        bg: "bg-gray-100",
        text: "text-gray-700",
        border: "border-gray-200",
        icon: XCircle,
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} ${config.border}`}
      >
        <Icon size={12} className="mr-1" />
        {status}
      </span>
    );
  };

  // Get leave type icon
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

  // Format leave type name for display
  const formatLeaveTypeName = (type) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Stats cards for employee leaves dashboard
  const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );

  // Calculate stats for employee leaves
  const calculateStats = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyLeaves = employeeLeaveRequests.filter((leave) => {
      const leaveDate = new Date(leave.fromDate);
      return (
        leaveDate.getMonth() === currentMonth &&
        leaveDate.getFullYear() === currentYear
      );
    });

    return {
      total: monthlyLeaves.length,
      pending: monthlyLeaves.filter((l) => l.status === "pending").length,
      approved: monthlyLeaves.filter((l) => l.status === "approved").length,
      rejected: monthlyLeaves.filter((l) => l.status === "rejected").length,
    };
  };

  const stats = calculateStats();

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-50 min-h-[80vh]">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">
          HR Leave Management
        </h1>
        <div className="flex flex-wrap gap-2">
          {/* <button
            className="flex items-center bg-[#104774] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#0d3a61] transition-all duration-200 text-sm md:text-base"
            onClick={() => setShowApplyModal(true)}
          >
            <Plus size={18} className="mr-2" /> Apply For Leave
          </button> */}
          {/* <button
            className="flex items-center bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-all duration-200 text-sm md:text-base"
            onClick={exportToCSV}
          >
            <Download size={18} className="mr-2" /> Export
          </button> */}
          <button
            className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-all duration-200 text-sm md:text-base"
            onClick={() => {
              fetchLeaveBalance();
              if (activeTab === "employeeLeaves") {
                fetchEmployeeLeaveRequests();
              } else {
                fetchMyLeaveRequests();
              }
            }}
          >
            <RefreshCw size={18} className="mr-2" /> Refresh
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl p-1 shadow-sm border border-gray-200">
        <div className="flex">
          <button
            className={`flex-1 py-3 px-4 text-center font-medium rounded-lg transition-all duration-200 text-sm md:text-base ${
              activeTab === "employeeLeaves"
                ? "bg-[#104774] text-white shadow"
                : "text-gray-600 hover:text-[#104774]"
            }`}
            onClick={() => setActiveTab("employeeLeaves")}
          >
            <div className="flex items-center justify-center">
              <Users size={18} className="mr-2" />
              Employee Leaves
            </div>
          </button>
          <button
            className={`flex-1 py-3 px-4 text-center font-medium rounded-lg transition-all duration-200 text-sm md:text-base ${
              activeTab === "myLeaves"
                ? "bg-[#104774] text-white shadow"
                : "text-gray-600 hover:text-[#104774]"
            }`}
            onClick={() => setActiveTab("myLeaves")}
          >
            <div className="flex items-center justify-center">
              <FileText size={18} className="mr-2" />
              My Leaves
            </div>
          </button>
        </div>
      </div>

      {/* Stats Cards for Employee Leaves */}
      {activeTab === "employeeLeaves" && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <StatCard
            title="Total Requests"
            value={stats.total}
            subtitle="This Month"
            icon={Calendar}
            color="bg-blue-500"
          />
          <StatCard
            title="Pending"
            value={stats.pending}
            subtitle="Require Action"
            icon={Clock}
            color="bg-yellow-500"
          />
          <StatCard
            title="Approved"
            value={stats.approved}
            subtitle="This month"
            icon={CheckCircle}
            color="bg-green-500"
          />
          <StatCard
            title="Rejected"
            value={stats.rejected}
            subtitle="Leaves"
            icon={XCircle}
            color="bg-red-500"
          />
        </div>
      )}

      {/* HR Leave Balance for My Leaves tab */}
      {activeTab === "myLeaves" && (
      
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
  {Object.entries(leaveBalance).map(([type, balance]) => (
    <div
      key={type}
      className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          {/* Left colored dot */}
          <div
            className={`w-3 h-3 rounded-full mr-2 ${
              type === "sick"
                ? "bg-red-300"
                : type === "casual"
                ? "bg-purple-300"
                : "bg-green-400"
            }`}
          ></div>
          {/* Leave type */}
          <span className="text-sm font-medium text-gray-700 capitalize">
            {formatLeaveTypeName(type)}
          </span>
        </div>
        {/* Right icon */}
        {type === "sick" ? (
          <Heart size={18} className="text-red-300" />
        ) : type === "casual" ? (
          <Coffee size={18} className="text-purple-300" />
        ) : (
          <CheckCircle size={18} className="text-green-400" />
        )}
      </div>

      {/* Balance */}
      <div className="text-2xl font-bold text-gray-800 mb-2">
        {balance}{" "}
        <span className="text-sm font-medium text-gray-500">days left</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
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

      {/* Date info */}
      <div className="text-xs text-gray-500">
        As of {new Date().toLocaleDateString()}
      </div>
    </div>
  ))}
</div>

       
      )}

      {/* Filters and Search - Only for Employee Leaves tab */}
      {activeTab === "employeeLeaves" && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by employee, type, or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#104774] text-sm md:text-base"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 md:hidden text-sm"
              >
                <Filter size={16} className="mr-2" />
                Filters
              </button>

              <div
                className={`${
                  mobileFiltersOpen ? "flex" : "hidden"
                } md:flex flex-col md:flex-row gap-2 w-full md:w-auto`}
              >
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#104774] text-sm md:text-base"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#104774] text-sm md:text-base"
                >
                  <option value="all">All Types</option>
                  {leaveTypes.map((type) => (
                    <option key={type._id} value={type.name}>
                      {formatLeaveTypeName(type.name)}
                    </option>
                  ))}
                </select>

                <button
                  onClick={resetFilters}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm md:text-base"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="mt-2 text-sm text-gray-500">
            Showing {filteredRequests.length} of {employeeLeaveRequests.length}{" "}
            requests
          </div>
        </div>
      )}

      {/* Content based on active tab */}
      {activeTab === "employeeLeaves" ? (
        /* Employee Leaves Table */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center space-x-3">
            <Users size={24} className="text-[#104774]" />
            <h3 className="text-lg font-semibold text-gray-800">
              Employee Leave Requests
            </h3>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <RefreshCw
                className="animate-spin mx-auto text-[#104774]"
                size={32}
              />
              <p className="mt-2 text-gray-500">
                Loading employee leave requests...
              </p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No employee leave requests found</p>
            </div>
          ) : (
            <>

              <div className="overflow-x-auto">
                <div className="max-h-[350px] overflow-y-auto border border-gray-200 rounded-lg shadow-sm">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-[#104774] text-white sticky top-0 z-10">
                      <tr>
                        <th
                          className="px-4 py-3 text-left text-sm font-medium uppercase cursor-pointer select-none"
                          onClick={() => handleSort("employee.email")}
                        >
                          Employee{" "}
                          {sortConfig.key === "employee.email" &&
                            (sortConfig.direction === "ascending" ? (
                              <ChevronUp size={14} className="inline" />
                            ) : (
                              <ChevronDown size={14} className="inline" />
                            ))}
                        </th>
                        <th
                          className="px-4 py-3 text-left text-sm font-medium uppercase cursor-pointer select-none"
                          onClick={() => handleSort("leaveType")}
                        >
                          Type{" "}
                          {sortConfig.key === "leaveType" &&
                            (sortConfig.direction === "ascending" ? (
                              <ChevronUp size={14} className="inline" />
                            ) : (
                              <ChevronDown size={14} className="inline" />
                            ))}
                        </th>
                        <th
                          className="px-4 py-3 text-left text-sm font-medium uppercase cursor-pointer select-none"
                          onClick={() => handleSort("fromDate")}
                        >
                          From{" "}
                          {sortConfig.key === "fromDate" &&
                            (sortConfig.direction === "ascending" ? (
                              <ChevronUp size={14} className="inline" />
                            ) : (
                              <ChevronDown size={14} className="inline" />
                            ))}
                        </th>
                        <th
                          className="px-4 py-3 text-left text-sm font-medium uppercase cursor-pointer select-none"
                          onClick={() => handleSort("toDate")}
                        >
                          To{" "}
                          {sortConfig.key === "toDate" &&
                            (sortConfig.direction === "ascending" ? (
                              <ChevronUp size={14} className="inline" />
                            ) : (
                              <ChevronDown size={14} className="inline" />
                            ))}
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium uppercase">
                          Days
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium uppercase">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentItems.map((req, index) => {
                        const hasSufficientBalance =
                          req.currentRemaining?.[req.leaveType] >=
                          req.totalDays;

                        return (
                          <React.Fragment key={req._id}>
                            <tr className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3 text-sm">
                                <div className="flex items-center">
                                  <div className="bg-gray-200 rounded-full p-1 mr-2">
                                    <User size={14} className="text-gray-600" />
                                  </div>
                                  {req.employee?.email || "N/A"}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <div className="flex items-center gap-1">
                                  {getLeaveTypeIcon(req.leaveType)}
                                  <span className="capitalize">
                                    {formatLeaveTypeName(req.leaveType)}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {new Date(req.fromDate).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {new Date(req.toDate).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {req.totalDays}
                              </td>
                              <td className="px-4 py-3">
                                <StatusBadge status={req.status} />
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex space-x-2 items-center">
                                  <button
                                    className="text-[#104774] hover:text-[#0d3a61] p-1 rounded"
                                    onClick={() =>
                                      setExpandedRequest(
                                        expandedRequest === req._id
                                          ? null
                                          : req._id
                                      )
                                    }
                                    title="View Details"
                                  >
                                    <Eye size={16} />
                                  </button>
                                  {req.status === "pending" && (
                                    <>
                                      <button
                                        className="text-green-600 hover:text-green-800 p-1 rounded"
                                        onClick={() => {
                                          setSelectedRequest(req);
                                          setActionType("approve");
                                          setShowActionModal(true);
                                        }}
                                        title="Approve"
                                      >
                                        <CheckCircle size={16} />
                                      </button>
                                      <button
                                        className="text-red-600 hover:text-red-800 p-1 rounded"
                                        onClick={() => {
                                          setSelectedRequest(req);
                                          setActionType("reject");
                                          setShowActionModal(true);
                                        }}
                                        title="Reject"
                                      >
                                        <XCircle size={16} />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>

                            {/* Expanded Request Details */}
                            {expandedRequest === req._id && (
                              <tr className="bg-gray-50">
                                <td colSpan={7} className="p-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <h4 className="font-medium mb-2">
                                        Request Details
                                      </h4>
                                      <p>
                                        <span className="font-medium">
                                          Reason:
                                        </span>{" "}
                                        {req.reason || "-"}
                                      </p>
                                      <p>
                                        <span className="font-medium">
                                          Applied On:
                                        </span>{" "}
                                        {new Date(
                                          req.appliedAt
                                        ).toLocaleString()}
                                      </p>
                                      {req.processedBy && (
                                        <p>
                                          <span className="font-medium">
                                            Processed By:
                                          </span>{" "}
                                          {req.processedBy?.email || "Admin"}
                                        </p>
                                      )}
                                      {req.processedAt && (
                                        <p>
                                          <span className="font-medium">
                                            Processed At:
                                          </span>{" "}
                                          {new Date(
                                            req.processedAt
                                          ).toLocaleString()}
                                        </p>
                                      )}
                                      {req.remarks && (
                                        <p>
                                          <span className="font-medium">
                                            Remarks:
                                          </span>{" "}
                                          {req.remarks}
                                        </p>
                                      )}
                                    </div>
                                    <div>
                                      <h4 className="font-medium mb-2">
                                        Balance Information
                                      </h4>
                                      <p>
                                        <span className="font-medium">
                                          Remaining at request:
                                        </span>{" "}
                                        {req.balanceSnapshot?.remaining?.[
                                          req.leaveType
                                        ] ?? "-"}
                                      </p>
                                      <p>
                                        <span className="font-medium">
                                          Current remaining:
                                        </span>{" "}
                                        {req.currentRemaining?.[
                                          req.leaveType
                                        ] ?? "-"}
                                      </p>
                                      {!hasSufficientBalance && (
                                        <p className="text-red-600 font-medium mt-2 flex items-center">
                                          <AlertCircle
                                            size={14}
                                            className="inline mr-1"
                                          />
                                          Insufficient balance for this request
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div className="text-sm text-gray-500">
                    Showing {indexOfFirstItem + 1} to{" "}
                    {Math.min(indexOfLastItem, filteredRequests.length)} of{" "}
                    {filteredRequests.length} entries
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
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
            </>
          )}
        </div>
      ) : (
        /* My Leaves Table */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
       
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
  {/* Left side: icon + heading */}
  <div className="flex items-center space-x-3">
    <FileText size={24} className="text-[#104774]" />
    <h3 className="text-lg font-semibold text-gray-800">
      My Leave Requests
    </h3>
  </div>

  {/* Right side: button */}
  <button
    className="flex items-center bg-[#104774] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#0d3a61] transition-all duration-200 text-sm md:text-base"
    onClick={() => setShowApplyModal(true)}
  >
    <Plus size={18} className="mr-2" /> Apply For Leave
  </button>
</div>


          {myLeaveRequests.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">
                No leave requests found. Apply for your first leave!
              </p>
            </div>
          ) : (

            <div className="overflow-x-auto">
  <table className="w-full border-collapse">
    <thead className="bg-[#104774] text-white">
      <tr>
        <th className="p-3 text-left font-medium text-sm">Date Range</th>
        <th className="p-3 text-left font-medium text-sm">Type</th>
        <th className="p-3 text-left font-medium text-sm">Days</th>
        <th className="p-3 text-left font-medium text-sm hidden md:table-cell">Reason</th>
        <th className="p-3 text-left font-medium text-sm">Status</th>
        <th className="p-3 text-left font-medium text-sm hidden lg:table-cell">Applied On</th>
        <th className="p-3 text-left font-medium text-sm">Actions</th>
      </tr>
    </thead>

    <tbody>
      {myLeaveRequests.map((req) => {
        const hasSufficientBalance = req.currentRemaining && 
          req.currentRemaining[req.leaveType] >= req.totalDays;

        const formatDateShort = (date) => {
          if (!date) return "-";
          return new Date(date).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            // year: "numeric",
          });
        };

        return (
          <tr
            key={req._id}
            className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
          >
            {/* Date Range */}
            <td className="p-3 font-medium text-gray-800 text-sm">
              {`${formatDateShort(req.fromDate)} to ${formatDateShort(req.toDate)}`}
            </td>

            {/* Leave Type */}
            <td className="p-3 text-sm">
              <div className="flex items-center gap-1">
                {getLeaveTypeIcon(req.leaveType)}
                <span className="capitalize">{formatLeaveTypeName(req.leaveType)}</span>
              </div>
            </td>

            {/* Total Days */}
            <td className="p-3 text-sm">{req.totalDays}</td>

            {/* Reason */}
            <td
              className="p-3 text-gray-600 text-sm hidden md:table-cell max-w-xs truncate cursor-pointer relative group"
              title={req.reason}
            >
              {req.reason || "-"}
              {req.reason && (
                <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded-md px-3 py-2 w-64 z-20 -top-1 left-1/2 -translate-x-1/2 shadow-lg">
                  {req.reason}
                </div>
              )}
            </td>

            {/* Status */}
            <td className="p-3">
              <StatusBadge status={req.status} />
            </td>

            {/* Applied On */}
            <td className="p-3 text-gray-600 text-sm hidden lg:table-cell">
              {new Date(req.appliedAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </td>

            {/* Actions */}
            <td className="p-3">
              {req.status === "pending" && (
                <button
                  onClick={() => cancelLeave(req._id)}
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
      })}
    </tbody>
  </table>
</div>

          )}
        </div>
      )}

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="fixed inset-0  bg-opacity-40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowApplyModal(false);
                setFormErrors({});
              }}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold mb-4">Apply for Leave</h2>

            {/* Balance Info */}
            {newLeave.leaveType &&
              leaveBalance[newLeave.leaveType] !== undefined && (
                <div className="bg-blue-50 p-3 rounded-lg mb-4">
                  <p className="text-blue-800 font-medium text-sm">
                    Available {formatLeaveTypeName(newLeave.leaveType)} leave:{" "}
                    {leaveBalance[newLeave.leaveType]} days
                  </p>
                </div>
              )}

            <form onSubmit={handleApplyLeave} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium text-sm">
                  Leave Type
                </label>
                <select
                  name="leaveType"
                  value={newLeave.leaveType}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#104774] text-sm"
                  required
                >
                  <option value="">Select Leave Type</option>
                  {leaveTypes.map((type) => (
                    <option key={type._id} value={type.name}>
                      {formatLeaveTypeName(type.name)}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-medium text-sm">
                    From Date
                  </label>
                  <input
                    type="date"
                    name="fromDate"
                    value={newLeave.fromDate}
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
                    value={newLeave.toDate}
                    onChange={handleDateChange}
                    min={
                      newLeave.fromDate ||
                      new Date().toISOString().split("T")[0]
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
              </div>

              {newLeave.fromDate && newLeave.toDate && (
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
                  value={newLeave.reason}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#104774] text-sm"
                  placeholder="Please provide a reason for your leave"
                  required
                />
                <div className="text-xs text-gray-500 mt-1">
                  {newLeave.reason.length}/500 characters
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
                  onClick={() => {
                    setShowApplyModal(false);
                    setFormErrors({});
                  }}
                  className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-3 py-2 rounded-lg bg-[#104774] text-white hover:bg-[#0d3a61] disabled:opacity-50 text-sm"
                >
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Action Modal for Employee Leaves */}
      {showActionModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 md:p-6 rounded-xl w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {actionType === "approve" ? "Approve" : "Reject"} Leave Request
            </h3>

            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm">
                <strong>Employee:</strong> {selectedRequest.employee?.email}
              </p>
              <p className="text-sm">
                <strong>Type:</strong>{" "}
                {formatLeaveTypeName(selectedRequest.leaveType)}
              </p>
              <p className="text-sm">
                <strong>Duration:</strong> {selectedRequest.totalDays} days
              </p>
              <p className="text-sm">
                <strong>Reason:</strong> {selectedRequest.reason || "-"}
              </p>

              {selectedRequest.currentRemaining && (
                <p
                  className={`text-sm mt-2 ${
                    selectedRequest.currentRemaining[
                      selectedRequest.leaveType
                    ] < selectedRequest.totalDays
                      ? "text-red-600 font-medium"
                      : ""
                  }`}
                >
                  <strong>Remaining Balance:</strong>{" "}
                  {selectedRequest.currentRemaining[selectedRequest.leaveType]}/
                  {
                    selectedRequest.balanceSnapshot?.remaining[
                      selectedRequest.leaveType
                    ]
                  }
                  {selectedRequest.currentRemaining[selectedRequest.leaveType] <
                    selectedRequest.totalDays && (
                    <span className="ml-1">(Insufficient balance)</span>
                  )}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Remarks (Optional)
              </label>
              <textarea
                value={actionRemark}
                onChange={(e) => setActionRemark(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#104774] text-sm"
                rows="3"
                placeholder="Add remarks for this action..."
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                className="px-3 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 transition-colors text-sm"
                onClick={() => {
                  setShowActionModal(false);
                  setActionRemark("");
                }}
              >
                Cancel
              </button>
              <button
                className={`px-3 py-2 rounded-lg text-white transition-colors text-sm ${
                  actionType === "approve"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
                onClick={() => handleAction(selectedRequest._id, actionType)}
              >
                {actionType === "approve" ? "Approve" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRLeaves;
