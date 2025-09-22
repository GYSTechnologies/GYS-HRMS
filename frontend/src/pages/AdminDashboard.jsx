import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  RefreshCw,
  CheckCircle,
  XCircle,
  ArrowRight,
  Calendar,
  DollarSign,
} from "lucide-react";
import axiosInstance from "../utils/axiosInstance";

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [attendanceLog, setAttendanceLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const [statsRes, attendanceRes] = await Promise.all([
        axiosInstance.get("/dashboard/admin/stats"),
        axiosInstance.get("/dashboard/admin/attendance-log"),
      ]);

      setDashboardData(statsRes.data.data);
      setAttendanceLog(attendanceRes.data.data);
    } catch (error) {
      console.error("Error fetching admin dashboard data:", error);
      alert("Error loading dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleApproveAttendance = async (id) => {
    try {
      await axiosInstance.patch(`/dashboard/admin/approve-attendance/${id}`);
      fetchDashboardData();
    } catch (err) {
      alert("Error approving attendance");
    }
  };

  const handleRejectAttendance = async (id) => {
    try {
      await axiosInstance.patch(`/dashboard/admin/reject-attendance/${id}`);
      fetchDashboardData();
    } catch (err) {
      alert("Error rejecting attendance");
    }
  };

  const handleGoToAttendance = () => navigate("/admin/attendance");
  const handleGoToLeaves = () => navigate("/admin/leaves");
  const handleGoToPayroll = () => navigate("/admin/payroll-approval");

  const formatTime = (time) =>
    time ? new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-";

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#104774]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600">System overview and management</p>
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={refreshing}
          className="bg-[#104774] text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Attendance */}
        <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mr-4">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-slate-800 text-lg">Today's Attendance</h3>
          </div>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-slate-600">Present Today:</span>
              <span className="font-bold text-green-600">{dashboardData?.attendance?.present || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Absent Today:</span>
              <span className="font-bold text-red-600">{dashboardData?.attendance?.absent || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">On Leave:</span>
              <span className="font-bold text-orange-600">{dashboardData?.attendance?.onLeave || 0}</span>
            </div>
          </div>
          <button
            onClick={handleGoToAttendance}
            className="w-full bg-[#104774] hover:bg-[#0d3a61] text-white py-2 px-4 rounded-xl font-medium flex items-center justify-center transition-all duration-300"
          >
            Go to Attendance
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>

        {/* Leaves */}
        <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-green-200 rounded-xl flex items-center justify-center mr-4">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-slate-800 text-lg">Leaves Summary</h3>
          </div>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-slate-600">Pending Leaves:</span>
              <span className="font-bold text-yellow-600">{dashboardData?.leaves?.pending || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Approved:</span>
              <span className="font-bold text-green-600">{dashboardData?.leaves?.approved || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Rejected:</span>
              <span className="font-bold text-red-600">{dashboardData?.leaves?.rejected || 0}</span>
            </div>
          </div>
          <button
            onClick={handleGoToLeaves}
            className="w-full bg-[#104774] hover:bg-[#0d3a61] text-white py-2 px-4 rounded-xl font-medium flex items-center justify-center transition-all duration-300"
          >
            Go to Leaves
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>

        {/* Payroll */}
        <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 flex flex-col h-full">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mr-4">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-slate-800 text-lg">Payroll Summary</h3>
          </div>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-slate-600">Employees:</span>
              <span className="font-bold text-slate-800">{dashboardData?.payroll?.employees || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Status:</span>
              <span className="font-bold text-blue-600">{dashboardData?.payroll?.status || "Not available"}</span>
            </div>
          </div>
          <button
            onClick={handleGoToPayroll}
            className="mt-auto w-full bg-[#104774] hover:bg-[#0d3a61] text-white py-2 px-4 rounded-xl font-medium flex items-center justify-center transition-all duration-300"
          >
            Go to Payroll
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>

      {/* Login/Logout Table */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-800">Log in/Out</h2>
          <Clock className="w-5 h-5 text-slate-400" />
        </div>
        <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
          <table className="w-full border-collapse">
            <thead className="bg-[#104774] text-white">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Team</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Login</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Logout</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Task</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Work Progress</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Logout Notes</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {attendanceLog.map((log, index) => (
                <tr key={index} className={`${index % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-slate-100`}>
                  <td className="px-4 py-3 text-sm font-medium text-slate-800">{log.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{log.team}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{formatTime(log.checkIn)}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{formatTime(log.checkOut)}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{log.task || "-"}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{log.workProgress || "-"}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{log.notes || "-"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      log.status === "Logged in"
                        ? "bg-green-100 text-green-700"
                        : log.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    {log.action === "Approve" && (
                      <>
                        <button
                          onClick={() => handleApproveAttendance(log._id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1"
                        >
                          <CheckCircle className="w-4 h-4" /> Approve
                        </button>
                        <button
                          onClick={() => handleRejectAttendance(log._id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1"
                        >
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
