import React, { useEffect, useState } from "react";
import {
  Plus,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Edit,
  ChevronDown,
  ChevronUp,
  Trash2,
  AlertCircle,
  Menu,
  X,
} from "lucide-react";
import axiosInstance from "../utils/axiosInstance";
import { useAuth } from "../context/AppContext";
import { format } from "date-fns";

const AdminLeaves = () => {
  const { token } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  const [policyForm, setPolicyForm] = useState({
    role: "employee",
    year: new Date().getFullYear(),
    leaves: {},
  });

  const [leaveTypeForm, setLeaveTypeForm] = useState({
    name: "",
    isActive: true,
  });

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [selectedLeaveType, setSelectedLeaveType] = useState(null);
  const [actionRemark, setActionRemark] = useState("");
  const [loading, setLoading] = useState(false);
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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [leavesRes, policiesRes, leaveTypesRes] = await Promise.all([
        axiosInstance.get("/leave/requests", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axiosInstance.get("/leave/policies", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axiosInstance.get("/leave/get-leaveTypes", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setLeaveRequests(leavesRes.data);
      setFilteredRequests(leavesRes.data);
      setPolicies(policiesRes.data);
      setLeaveTypes(leaveTypesRes.data);

      // Calculate stats
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const monthlyLeaves = leavesRes.data.filter((leave) => {
        const leaveDate = new Date(leave.fromDate);
        return (
          leaveDate.getMonth() === currentMonth &&
          leaveDate.getFullYear() === currentYear
        );
      });

      setStats({
        total: monthlyLeaves.length,
        pending: monthlyLeaves.filter((l) => l.status === "pending").length,
        approved: monthlyLeaves.filter((l) => l.status === "approved").length,
        rejected: monthlyLeaves.filter((l) => l.status === "rejected").length,
      });
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  // Filter and search functionality
  useEffect(() => {
    let result = leaveRequests;

    if (searchTerm) {
      result = result.filter(
        (request) =>
          request.employee?.email
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          request.leaveType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.reason?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((request) => request.status === statusFilter);
    }

    if (typeFilter !== "all") {
      result = result.filter((request) => request.leaveType === typeFilter);
    }

    setFilteredRequests(result);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, typeFilter, leaveRequests]);

  // Sort functionality
  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });

    const sortedData = [...filteredRequests].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === "ascending" ? -1 : 1;
      }
      if (a[key] > b[key]) {
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

  // Approve/Reject leave request
  const handleAction = async (requestId, action) => {
    try {
      await axiosInstance.post(
        `/leave/${requestId}/review`,
        { action, reason: actionRemark || `${action}ed by admin` },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedRequest(null);
      setActionRemark("");
      fetchData();
      document.getElementById("actionModal").classList.add("hidden");
    } catch (err) {
      console.error("Error updating leave:", err);
    }
  };

  // Create/Update leave policy
  const handlePolicySubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/leave/create-leave-policy", policyForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
      setPolicyForm({
        role: "employee",
        year: new Date().getFullYear(),
        leaves: {},
      });
      document.getElementById("policyModal").classList.add("hidden");
    } catch (err) {
      console.error("Error setting leave policy:", err);
    }
  };

  // Edit policy
  const handleEditPolicy = (policy) => {
    setSelectedPolicy(policy);
    const leavesObj = {};
    if (policy.leaves instanceof Map) {
      policy.leaves.forEach((value, key) => {
        leavesObj[key] = value;
      });
    } else {
      Object.assign(leavesObj, policy.leaves);
    }

    setPolicyForm({
      role: policy.role,
      year: policy.year,
      leaves: leavesObj,
    });
    document.getElementById("policyModal").classList.remove("hidden");
  };

  // Create leave type
  const handleLeaveTypeSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedLeaveType) {
        await axiosInstance.put(
          `/leave/update-leaveType/${selectedLeaveType._id}`,
          { name: leaveTypeForm.name },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axiosInstance.post(
          "/leave/create-leaveType",
          { name: leaveTypeForm.name },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setLeaveTypeForm({ name: "", isActive: true });
      setSelectedLeaveType(null);
      fetchData();
      document.getElementById("leaveTypeModal").classList.add("hidden");
    } catch (err) {
      console.error("Error creating/updating leave type:", err);
    }
  };

  // Delete leave type
  const handleDeleteLeaveType = async (id) => {
    try {
      await axiosInstance.delete(`/leave/delete-leaveType/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
    } catch (err) {
      console.error("Error deleting leave type:", err);
    }
  };

  // Toggle leave type status
  const handleToggleLeaveTypeStatus = async (id) => {
    try {
      await axiosInstance.patch(
        `/leave/toggle-leaveType-status/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchData();
    } catch (err) {
      console.error("Error toggling leave type status:", err);
    }
  };

  // Edit leave type
  const handleEditLeaveType = (leaveType) => {
    setSelectedLeaveType(leaveType);
    setLeaveTypeForm({ name: leaveType.name, isActive: leaveType.isActive });
    document.getElementById("leaveTypeModal").classList.remove("hidden");
  };

  // Export data to CSV
  const exportToCSV = () => {
    const headers = [
      "Employee",
      "Type",
      "From Date",
      "To Date",
      "Days",
      "Reason",
      "Status",
      "Applied At",
    ];
    const csvData = filteredRequests.map((req) => [
      req.employee?.email || "N/A",
      req.leaveType,
      new Date(req.fromDate).toLocaleDateString(),
      new Date(req.toDate).toLocaleDateString(),
      req.totalDays,
      req.reason || "-",
      req.status,
      new Date(req.appliedAt).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.map((field) => `"${field}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leave-requests-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
        className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} ${config.border}`}
      >
        <Icon size={12} className="mr-1" />
        {status}
      </span>
    );
  };

  // Stats cards
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

  // Get active leave types for filter dropdown
  const activeLeaveTypes = leaveTypes.filter((lt) => lt.isActive);

  return (
    <div className="flex flex-col md:flex-row gap-6 p-4 md:p-6 bg-gray-50 h-[70vh]">
      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Admin Leave Management
        </h1>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 rounded-lg bg-[#104774] text-white"
        >
          {mobileSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Header */}
        <div className="hidden md:flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-800">
            Admin Leave Management
          </h1>
          <div className="flex flex-wrap gap-2">
            <button
              className="flex items-center bg-[#104774] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#0d3a61] transition-all duration-200"
              onClick={() => {
                setSelectedPolicy(null);
                document
                  .getElementById("policyModal")
                  .classList.remove("hidden");
              }}
            >
              <Plus size={18} className="mr-2" /> Set Policy
            </button>
            <button
              className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-all duration-200"
              onClick={fetchData}
            >
              <RefreshCw size={18} className="mr-2" /> Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
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

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#104774]"
              />
            </div>

            <div className="flex flex-wrap gap-2">
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
                {activeLeaveTypes.map((type) => (
                  <option key={type._id} value={type.name}>
                    {type.name
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-2 text-sm text-gray-500">
            Showing {filteredRequests.length} of {leaveRequests.length} requests
          </div>
        </div>

        {/* Leave Requests Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center space-x-3">
            <Calendar size={24} className="text-[#104774]" />
            <h3 className="text-lg font-semibold text-gray-800">
              All Leave Requests
            </h3>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <RefreshCw
                className="animate-spin mx-auto text-[#104774]"
                size={32}
              />
              <p className="mt-2 text-gray-500">Loading leave requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No leave requests found</p>
            </div>
          ) : (
            <>
              {/* <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-[#104774] text-white">
                    <tr>
                      <th className="p-3 text-left font-medium text-sm md:text-base">Employee</th>
                      <th className="p-3 text-left font-medium text-sm md:text-base">Type</th>
                      <th className="p-3 text-left font-medium text-sm md:text-base">From</th>
                      <th className="p-3 text-left font-medium text-sm md:text-base">To</th>
                      <th className="p-3 text-left font-medium text-sm md:text-base">Days</th>
                      <th className="p-3 text-left font-medium text-sm md:text-base">Balance</th>
                      <th className="p-3 text-left font-medium text-sm md:text-base">Status</th>
                      <th className="p-3 text-left font-medium text-sm md:text-base">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((req) => {
                      const hasSufficientBalance =
                        req.currentRemaining &&
                        req.currentRemaining[req.leaveType] >= req.totalDays;

                      return (
                        <React.Fragment key={req._id}>
                          <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                            <td className="p-3 text-sm md:text-base">
                              {req.employee?.email || "N/A"}
                            </td>
                            <td className="p-3 text-sm md:text-base capitalize">
                              {req.leaveType.replace(/_/g, " ")}
                            </td>
                            <td className="p-3 text-sm md:text-base">
                              {new Date(req.fromDate).toLocaleDateString()}
                            </td>
                            <td className="p-3 text-sm md:text-base">
                              {new Date(req.toDate).toLocaleDateString()}
                            </td>
                            <td className="p-3 text-sm md:text-base">{req.totalDays}</td>
                            <td className="p-3 text-sm md:text-base">
                              <div className="flex items-center">
                                {req.currentRemaining ? (
                                  <>
                                    <span
                                      className={
                                        hasSufficientBalance
                                          ? "text-green-600"
                                          : "text-red-600"
                                      }
                                    >
                                      {req.currentRemaining[req.leaveType]}/
                                      {
                                        req.balanceSnapshot?.remaining[
                                          req.leaveType
                                        ]
                                      }
                                    </span>
                                    {!hasSufficientBalance && (
                                      <AlertCircle
                                        size={16}
                                        className="text-red-500 ml-1"
                                      />
                                    )}
                                  </>
                                ) : (
                                  <span className="text-gray-400">N/A</span>
                                )}
                              </div>
                            </td>
                            <td className="p-3">
                              <StatusBadge status={req.status} />
                            </td>
                            <td className="p-3">
                              <div className="flex space-x-2">
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
                                  <Eye size={18} />
                                </button>
                                {req.status === "pending" && (
                                  <>
                                    <button
                                      className="text-green-600 hover:text-green-800 p-1 rounded"
                                      onClick={() => {
                                        setSelectedRequest(req);
                                        document.getElementById("actionModal").classList.remove("hidden");
                                      }}
                                      title="Approve"
                                    >
                                      <CheckCircle size={18} />
                                    </button>
                                    <button
                                      className="text-red-600 hover:text-red-800 p-1 rounded"
                                      onClick={() => {
                                        setSelectedRequest(req);
                                        document.getElementById("actionModal").classList.remove("hidden");
                                      }}
                                      title="Reject"
                                    >
                                      <XCircle size={18} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                          {expandedRequest === req._id && (
                            <tr className="bg-gray-50">
                              <td colSpan="8" className="p-4">
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
                                      {new Date(req.appliedAt).toLocaleString()}
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
                                      {req.currentRemaining?.[req.leaveType] ??
                                        "-"}
                                    </p>
                                    {!hasSufficientBalance && (
                                      <p className="text-red-600 font-medium mt-2">
                                        <AlertCircle
                                          size={16}
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

              {totalPages > 1 && (
                <div className="p-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
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
                      className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Previous
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
                          className={`px-3 py-1 rounded border text-sm ${
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
                      className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )} */}
              <div className="overflow-x-auto">
                <div className="max-h-[300px] overflow-y-auto border border-gray-200 rounded-xl shadow-sm">
                  <table className="min-w-full divide-y divide-gray-200">
                    {/* Header */}
                    <thead className="bg-[#104774] text-white sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                          Employee
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                          From
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                          To
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                          Days
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                          Balance
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    {/* Body */}

                    <tbody className="divide-y divide-gray-100">
                      {currentItems
                        .sort(
                          (a, b) =>
                            new Date(b.appliedAt) - new Date(a.appliedAt)
                        ) // 👈 latest first
                        .map((req, index) => {
                          const hasSufficientBalance =
                            req.currentRemaining &&
                            req.currentRemaining[req.leaveType] >=
                              req.totalDays;

                          return (
                            <React.Fragment key={req._id}>
                              {/* Row */}
                              <tr
                                className={`${
                                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                                } hover:bg-gray-100 transition-colors`}
                              >
                                <td className="px-6 py-3 text-sm">
                                  {req.employee?.email || "N/A"}
                                </td>
                                <td className="px-6 py-3 text-sm capitalize">
                                  {req.leaveType.replace(/_/g, " ")}
                                </td>
                                <td className="px-6 py-3 text-sm">
                                  {format(
                                    new Date(req.fromDate),
                                    "dd MMM yyyy"
                                  )}
                                </td>
                                <td className="px-6 py-3 text-sm">
                                  {format(new Date(req.toDate), "dd MMM yyyy")}
                                </td>
                                <td className="px-6 py-3 text-sm">
                                  {req.totalDays}
                                </td>
                                <td className="px-6 py-3 text-sm">
                                  <div className="flex items-center">
                                    {req.currentRemaining ? (
                                      <>
                                        <span
                                          className={
                                            hasSufficientBalance
                                              ? "text-green-600 font-medium"
                                              : "text-red-600 font-medium"
                                          }
                                        >
                                          {req.currentRemaining[req.leaveType]}/
                                          {
                                            req.balanceSnapshot?.remaining[
                                              req.leaveType
                                            ]
                                          }
                                        </span>
                                        {!hasSufficientBalance && (
                                          <AlertCircle
                                            size={16}
                                            className="text-red-500 ml-1"
                                          />
                                        )}
                                      </>
                                    ) : (
                                      <span className="text-gray-400">N/A</span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-3">
                                  <StatusBadge status={req.status} />
                                </td>
                                <td className="px-6 py-3">
                                  <div className="flex space-x-2">
                                    <button
                                      className="p-1.5 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200"
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
                                          className="p-1.5 rounded-full bg-green-100 text-green-600 hover:bg-green-200"
                                          onClick={() => {
                                            setSelectedRequest(req);
                                            document
                                              .getElementById("actionModal")
                                              .classList.remove("hidden");
                                          }}
                                          title="Approve"
                                        >
                                          <CheckCircle size={16} />
                                        </button>
                                        <button
                                          className="p-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                                          onClick={() => {
                                            setSelectedRequest(req);
                                            document
                                              .getElementById("actionModal")
                                              .classList.remove("hidden");
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

                              {/* Expanded details */}
                              {expandedRequest === req._id && (
                                <tr>
                                  <td colSpan="8" className="p-6 bg-gray-50">
                                    <div className="grid md:grid-cols-2 gap-6">
                                      {/* Request Details */}
                                      <div className="bg-white p-5 rounded-xl shadow-sm border">
                                        <h4 className="text-[#104774] font-semibold text-base mb-3">
                                          Request Details
                                        </h4>
                                        <div className="space-y-2 text-sm">
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
                                            {format(
                                              new Date(req.appliedAt),
                                              "dd MMM yyyy, hh:mm a"
                                            )}
                                          </p>
                                          {req.processedBy && (
                                            <p>
                                              <span className="font-medium">
                                                Processed By:
                                              </span>{" "}
                                              {req.processedBy?.email ||
                                                "Admin"}
                                            </p>
                                          )}
                                          {req.processedAt && (
                                            <p>
                                              <span className="font-medium">
                                                Processed At:
                                              </span>{" "}
                                              {format(
                                                new Date(req.processedAt),
                                                "dd MMM yyyy, hh:mm a"
                                              )}
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
                                      </div>

                                      {/* Balance Info */}
                                      <div className="bg-white p-5 rounded-xl shadow-sm border">
                                        <h4 className="text-[#104774] font-semibold text-base mb-3">
                                          Balance Information
                                        </h4>
                                        <div className="space-y-2 text-sm">
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
                                            <p className="text-red-600 font-medium flex items-center mt-2">
                                              <AlertCircle
                                                size={16}
                                                className="mr-1"
                                              />
                                              Insufficient balance for this
                                              request
                                            </p>
                                          )}
                                        </div>
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
                <div className="p-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
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
                      className="px-3 py-1 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm hover:bg-gray-100"
                    >
                      Previous
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
                          className={`px-3 py-1 rounded-lg border text-sm transition ${
                            currentPage === pageNum
                              ? "bg-[#104774] text-white border-[#104774]"
                              : "hover:bg-gray-100 border-gray-300"
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
                      className="px-3 py-1 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm hover:bg-gray-100"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div
        className={`w-full md:w-80 space-y-6 ${
          mobileSidebarOpen ? "block" : "hidden"
        } md:block`}
      >
        {/* Leave Policies */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Leave Policies</h3>
            <button
              className="text-[#104774] hover:text-[#0d3a61]"
              onClick={() => {
                setSelectedPolicy(null);
                document
                  .getElementById("policyModal")
                  .classList.remove("hidden");
              }}
            >
              <Plus size={20} />
            </button>
          </div>

          {policies.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No policies set yet
            </p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {policies.map((p) => {
                const leaves =
                  p.leaves instanceof Map
                    ? Object.fromEntries(p.leaves)
                    : p.leaves;

                return (
                  <div
                    key={p._id}
                    className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-[#104774]">
                        {p.role.charAt(0).toUpperCase() + p.role.slice(1)} -{" "}
                        {p.year}
                      </h4>
                      <button
                        onClick={() => handleEditPolicy(p)}
                        className="text-gray-500 hover:text-[#104774]"
                      >
                        <Edit size={16} />
                      </button>
                    </div>
                    <div className="space-y-1 text-sm">
                      {Object.entries(leaves).map(([type, days]) => (
                        <p key={type} className="flex justify-between">
                          <span className="capitalize">
                            {type.replace(/_/g, " ")}:
                          </span>{" "}
                          <span className="font-medium">{days}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Leave Types */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Leave Types</h3>
            <button
              className="text-[#104774] hover:text-[#0d3a61]"
              onClick={() => {
                setSelectedLeaveType(null);
                setLeaveTypeForm({ name: "", isActive: true });
                document
                  .getElementById("leaveTypeModal")
                  .classList.remove("hidden");
              }}
            >
              <Plus size={20} />
            </button>
          </div>

          {leaveTypes.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No leave types set yet
            </p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {leaveTypes.map((type) => (
                <div
                  key={type._id}
                  className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center">
                    <span
                      className={`text-sm ${
                        type.isActive
                          ? "text-gray-800"
                          : "text-gray-400 line-through"
                      }`}
                    >
                      {type.name
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </span>
                    {!type.isActive && (
                      <span className="ml-2 text-xs text-gray-400">
                        (Inactive)
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditLeaveType(type)}
                      className="text-gray-500 hover:text-[#104774]"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleToggleLeaveTypeStatus(type._id)}
                      className={
                        type.isActive
                          ? "text-yellow-500 hover:text-yellow-700"
                          : "text-green-500 hover:text-green-700"
                      }
                    >
                      {type.isActive ? "Disable" : "Enable"}
                    </button>
                    <button
                      onClick={() => handleDeleteLeaveType(type._id)}
                      className="text-gray-500 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Policy Modal */}
      <div
        id="policyModal"
        className="fixed inset-0 backdrop-blur-sm bg-opacity-40 flex items-center justify-center hidden z-50 p-4"
      >
        <div
          className="bg-white p-6 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          shadow-2xl
        >
          <h3 className="text-lg font-semibold mb-4">
            {selectedPolicy ? "Edit Leave Policy" : "Create Leave Policy"}
          </h3>
          <form onSubmit={handlePolicySubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select
                value={policyForm.role}
                onChange={(e) =>
                  setPolicyForm({ ...policyForm, role: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#104774]"
              >
                <option value="employee">Employee</option>
                <option value="hr">HR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Year</label>
              <input
                type="number"
                min="2000"
                max="2100"
                value={policyForm.year}
                onChange={(e) =>
                  setPolicyForm({
                    ...policyForm,
                    year: parseInt(e.target.value) || new Date().getFullYear(),
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#104774]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Leave Types
              </label>
              <div className="space-y-3">
                {leaveTypes
                  .filter((lt) => lt.isActive)
                  .map((type) => (
                    <div key={type._id}>
                      <label className="block text-sm font-medium mb-1 capitalize">
                        {type.name.replace(/_/g, " ")} Leaves
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={policyForm.leaves[type.name] || 0}
                        onChange={(e) =>
                          setPolicyForm({
                            ...policyForm,
                            leaves: {
                              ...policyForm.leaves,
                              [type.name]: parseInt(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#104774]"
                      />
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 transition-colors"
                onClick={() =>
                  document.getElementById("policyModal").classList.add("hidden")
                }
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#104774] text-white hover:bg-[#0d3a61] transition-colors"
              >
                {selectedPolicy ? "Update Policy" : "Save Policy"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Leave Type Modal */}
      <div
        id="leaveTypeModal"
        className="fixed inset-0 backdrop-blur-sm bg-opacity-40 flex items-center justify-center hidden z-50 p-4"
      >
        <div className="bg-white p-6 rounded-xl w-full max-w-md border border-gray-200 shadow-2xl">
          <h3 className="text-lg font-semibold mb-4">
            {selectedLeaveType ? "Edit Leave Type" : "Add Leave Type"}
          </h3>
          <form onSubmit={handleLeaveTypeSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Leave Type Name
              </label>
              <input
                type="text"
                value={leaveTypeForm.name}
                onChange={(e) =>
                  setLeaveTypeForm({ ...leaveTypeForm, name: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#104774]"
                placeholder="e.g., Work From Home"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Use underscores for spaces (e.g., "work_from_home")
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 transition-colors"
                onClick={() => {
                  document
                    .getElementById("leaveTypeModal")
                    .classList.add("hidden");
                  setSelectedLeaveType(null);
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#104774] text-white hover:bg-[#0d3a61] transition-colors"
              >
                {selectedLeaveType ? "Update" : "Add"} Leave Type
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Action Modal */}
      <div
        id="actionModal"
        className="fixed inset-0 backdrop-blur-sm bg-opacity-40 flex items-center justify-center hidden z-50 p-4"
      >
        <div className="bg-white p-6 rounded-xl w-full max-w-md border border-gray-200 shadow-2xl">
          <h3 className="text-lg font-semibold mb-4">Process Leave Request</h3>
          {selectedRequest && (
            <>
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p>
                  <strong>Employee:</strong> {selectedRequest.employee?.email}
                </p>
                <p>
                  <strong>Type:</strong> {selectedRequest.leaveType}
                </p>
                <p>
                  <strong>Duration:</strong> {selectedRequest.totalDays} days
                </p>
                <p>
                  <strong>Reason:</strong> {selectedRequest.reason || "-"}
                </p>

                {selectedRequest.currentRemaining && (
                  <p
                    className={`mt-2 ${
                      selectedRequest.currentRemaining[
                        selectedRequest.leaveType
                      ] < selectedRequest.totalDays
                        ? "text-red-600 font-medium"
                        : ""
                    }`}
                  >
                    <strong>Remaining Balance:</strong>{" "}
                    {
                      selectedRequest.currentRemaining[
                        selectedRequest.leaveType
                      ]
                    }
                    /
                    {
                      selectedRequest.balanceSnapshot?.remaining[
                        selectedRequest.leaveType
                      ]
                    }
                    {selectedRequest.currentRemaining[
                      selectedRequest.leaveType
                    ] < selectedRequest.totalDays && (
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#104774]"
                  rows="3"
                  placeholder="Add remarks for this action..."
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 transition-colors"
                  onClick={() => {
                    document
                      .getElementById("actionModal")
                      .classList.add("hidden");
                    setActionRemark("");
                  }}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                  onClick={() => handleAction(selectedRequest._id, "reject")}
                >
                  Reject
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
                  onClick={() => handleAction(selectedRequest._id, "approve")}
                >
                  Approve
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLeaves;
