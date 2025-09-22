import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AppContext";
import Login from "./pages/Login";
import DashboardAdmin from "./pages/DashboardAdmin";
import DashboardHR from "./pages/DashboardHR";
import DashboardEmployee from "./pages/DashboardEmployee";
import ManageEmployees from "./pages/ManageEmployees.jsx";

import ProtectedRoute from "./components/ProtectedRoute";
import EmployeeProfile from "./components/Profile.jsx";
import CompanyCalendar from "./pages/CompanyCalender.jsx";
import Leaves from "./components/Leaves.jsx";
import EmployeeLeaves from "./components/EmployeeLeaves.jsx";
import HRLeaves from "./components/HRLeaves.jsx";
import AdminLeaves from "./components/AdminLeaves.jsx";
import EmployeeAttendance from "./components/EmployeeAttendance.jsx";
import AttendanceManagement from "./components/AttendanceManagement.jsx";
import EmployeeAttendanceManagement from "./components/EmployeeAttendanceManagement.jsx";
import EmployeePayroll from "./components/Payroll/EmployeePayroll.jsx";
import HRPayrollManagement from "./components/Payroll/HRPayrollManagement.jsx";
import AdminPayrollApproval from "./components/Payroll/AdminPayrollApproval.jsx";
import EmployeeDashboard from "./pages/EmployeeDashboard.jsx";
import HRDashboard from "./pages/HRDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";

function App() {
  const { user, loading } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Login Route */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        {/* Admin Dashboard + nested routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DashboardAdmin />
            </ProtectedRoute>
          }
        >
          {/* Default page for /admin */}
          <Route
            index
            element={
              <>
                <AdminDashboard />
              </>
            }
          />

          {/* Other nested routes */}
          <Route path="manage-employees" element={<ManageEmployees />} />
          <Route path="profile" element={<EmployeeProfile />} />
          <Route path="calendar" element={<CompanyCalendar />} />
          <Route path="leaves" element={<AdminLeaves />} />
          <Route path="attendance" element={<EmployeeAttendanceManagement />} />
          <Route path="payroll-approval" element={<AdminPayrollApproval />} />
        </Route>

        {/* HR Dashboard + nested routes */}
        <Route
          path="/hr"
          element={
            <ProtectedRoute allowedRoles={["hr"]}>
              <DashboardHR />
            </ProtectedRoute>
          }
        >
          {/* Default page for /hr */}
          <Route
            index
            element={
              <>
                <HRDashboard />
              </>
            }
          />

          {/* Other nested routes */}
          <Route path="manage-employees" element={<ManageEmployees />} />
          <Route path="profile" element={<EmployeeProfile />} />
          <Route path="calendar" element={<CompanyCalendar />} />
          <Route path="leaves" element={<HRLeaves />} />
          <Route path="attendance" element={<AttendanceManagement />} />
          <Route path="payroll" element={<HRPayrollManagement />} />
        </Route>

        {/* Employee Dashboard + nested routes */}
        <Route
          path="/employee"
          element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <DashboardEmployee />
            </ProtectedRoute>
          }
        >
          {/* Default page for /employee */}
          <Route
            index
            element={
              <>
                <EmployeeDashboard />
              </>
            }
          />

          {/* Other nested routes */}
          <Route path="profile" element={<EmployeeProfile />} />
          <Route path="calendar" element={<CompanyCalendar />} />
          <Route path="leaves" element={<EmployeeLeaves />} />
          <Route path="attendance" element={<EmployeeAttendance />} />
          <Route path="payslip" element={<EmployeePayroll />} />
        </Route>

        {/* Default Route "/" -> role-based redirect */}

        <Route
          path="/"
          element={
            user === null && loading ? (
              <div className="flex justify-center items-center h-screen">
                Loading...
              </div>
            ) : user ? (
              user.role === "admin" ? (
                <Navigate to="/admin" replace />
              ) : user.role === "hr" ? (
                <Navigate to="/hr" replace />
              ) : (
                <Navigate to="/employee" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
