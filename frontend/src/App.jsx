// import React from 'react';
// import { AppProvider, useAppContext } from './context/AppContext.jsx';
// import Sidebar from './components/Sidebar.jsx';
// import Header from './components/Header.jsx';
// import DashboardView from './components/views/DashboardView.jsx';
// import AttendanceView from './components/views/AttendanceView.jsx';
// import LeavesView from './components/views/LeavesView.jsx';
// import PayrollView from './components/views/PayrollView.jsx';
// import CalendarView from './components/views/CalendarView.jsx';
// import ProfileView from './components/views/ProfileView.jsx';
// import TaskModal from './components/modals/TaskModal.jsx';
// import LeaveModal from './components/modals/LeaveModal.jsx';

// const AppContent = () => {
//   const { currentView, showTaskModal, showLeaveModal } = useAppContext();

//   return (
//     <div className="flex h-screen bg-gray-50">
//       <Sidebar />

//       <div className="flex-1 flex flex-col">
//         <Header />

//         <div className="flex-1 overflow-auto">
//           {currentView === 'dashboard' && <DashboardView />}
//           {currentView === 'attendance' && <AttendanceView />}
//           {currentView === 'leaves' && <LeavesView />}
//           {currentView === 'payroll' && <PayrollView />}
//           {currentView === 'calendar' && <CalendarView />}
//           {currentView === 'profile' && <ProfileView />}
//         </div>
//       </div>

//       {showTaskModal && <TaskModal />}
//       {showLeaveModal && <LeaveModal />}
//     </div>
//   );
// };

// function App() {
//   return (
//     <AppProvider>
//       <AppContent />
//     </AppProvider>
//   );
// }

// export default App;

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

function App() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Login Route */}
        <Route path="/login" element={<Login />} />

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
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="mt-2">Manage HR and Employees here.</p>
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
                <h1 className="text-2xl font-bold">HR Dashboard</h1>
                <p className="mt-2">Manage Employees here.</p>
              </>
            }
          />

          {/* Other nested routes */}
          <Route path="manage-employees" element={<ManageEmployees />} />
          <Route path="profile" element={<EmployeeProfile />} />
          <Route path="calendar" element={<CompanyCalendar />} />
          <Route path="leaves" element={<HRLeaves />} />
          <Route path="attendance" element={<AttendanceManagement />} />
          <Route path="payroll" element={<HRPayrollManagement/>} />
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
                <h1 className="text-2xl font-bold">Employee Dashboard</h1>
                <p className="mt-2">Welcome to your dashboard.</p>
              </>
            }
          />

          {/* Other nested routes */}
          <Route path="profile" element={<EmployeeProfile />} />
          <Route path="calendar" element={<CompanyCalendar />} />
          <Route path="leaves" element={<EmployeeLeaves />} />
          <Route path="leaves" element={<EmployeeLeaves />} />
          <Route path="attendance" element={<EmployeeAttendance />} />
          <Route path="payslip" element={<EmployeePayroll />} />
        </Route>

        {/* Default Route "/" -> role-based redirect */}
        <Route
          path="/"
          element={
            user ? (
              user.role === "admin" ? (
                <Navigate to="/admin" />
              ) : user.role === "hr" ? (
                <Navigate to="/hr" />
              ) : (
                <Navigate to="/employee" />
              )
            ) : (
              <Navigate to="/login" />
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
