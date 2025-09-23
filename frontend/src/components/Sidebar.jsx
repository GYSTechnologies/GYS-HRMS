import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  User,
  LogOut,
  BarChart3,
  Users,
  Clock,
  CreditCard,
  FileText,
  UserCircle,
  Calendar,
} from "lucide-react";
import { useAuth } from "../context/AppContext";
import logo from "../assets/gys_logo.png";

const Sidebar = ({ closeSidebar }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  // Role-based menu items with icons
  const menuItems = {
    admin: [
      { label: "Dashboard", path: "/admin", icon: BarChart3 },
      {
        label: "Manage Employees",
        path: "/admin/manage-employees",
        icon: Users,
      },
      {
        label: "Attendance Management",
        path: "/admin/attendance",
        icon: Clock,
      },
      {
        label: "Payroll Approval",
        path: "/admin/payroll-approval",
        icon: CreditCard,
      },
      { label: "Calendar", path: "/admin/calendar", icon: Calendar },
      { label: "Leaves Management", path: "/admin/leaves", icon: FileText },
    ],
    hr: [
      { label: "Dashboard", path: "/hr", icon: BarChart3 },
      { label: "Manage Employees", path: "/hr/manage-employees", icon: Users },
      { label: "Attendance Management", path: "/hr/attendance", icon: Clock },
      { label: "Payroll", path: "/hr/payroll", icon: CreditCard },
      { label: "Leaves Management", path: "/hr/leaves", icon: FileText },
      { label: "My Profile", path: "/hr/profile", icon: UserCircle },
      { label: "Calendar", path: "/hr/calendar", icon: Calendar },
    ],
    employee: [
      { label: "Dashboard", path: "/employee", icon: BarChart3 },
      { label: "My Attendance", path: "/employee/attendance", icon: Clock },
      { label: "My Leaves", path: "/employee/leaves", icon: FileText },
      { label: "Payslip", path: "/employee/payslip", icon: CreditCard },
      { label: "My Profile", path: "/employee/profile", icon: UserCircle },
      { label: "Calendar", path: "/employee/calendar", icon: Calendar },
    ],
  };

  return (
    <div className="bg-white shadow-lg w-80 min-h-screen flex flex-col relative">
      {/* Header */}
      <div className=" px-5  border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center">
          <img
            src={logo}
            alt="GYS Logo"
            className="h-21 w-auto object-contain " // yaha se size control hoga
          />
        </div>

        {/* <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#104774] to-[#0d3a61] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">△</span>
          </div>
          <div className="text-gray-800 text-xl font-bold tracking-wide">
            GYS
          </div>
        </div> */}
        {/* Mobile Close Button */}
        <button
          onClick={closeSidebar}
          className="lg:hidden text-gray-600 hover:text-gray-900"
        >
          ✕
        </button>
      </div>

      {/* Profile Section */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          {user?.avatarUrl ? (
            <img
              src={user?.avatarUrl}
              alt={user.firstName}
              className="w-20 h-20 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div className="w-20 h-20 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center">
              <User size={20} className="text-gray-600" />
            </div>
          )}

          <div className="flex-1">
            {user?.firstName || user?.lastName || user?.designation ? (
              <>
                <div className="font-semibold text-gray-800 px-1">
                  {`${user?.firstName || ""} ${user?.lastName || ""}`}
                </div>
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full inline-block mt-1">
                  {user?.designation?.toUpperCase()}
                </div>
              </>
            ) : (
              <div className="font-semibold text-gray-500 bg-gray-100 px-5 py-1 rounded-full inline-block">
                {user?.role?.toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-3">
        {menuItems[user.role]?.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={index}
              to={item.path}
              onClick={closeSidebar}
              className={`w-full flex items-center px-4 py-4 rounded-xl transition-all duration-200 group ${
                isActive
                  ? "bg-gradient-to-r from-[#104774] to-[#0d3a61] text-white shadow-lg transform scale-105"
                  : "text-gray-600 hover:bg-gray-50 hover:text-[#104774]"
              }`}
            >
              <Icon
                size={20}
                className={`mr-4 transition-transform duration-200 ${
                  isActive ? "scale-110" : "group-hover:scale-110"
                }`}
              />
              <span className="font-medium text-sm">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full opacity-80"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-100 mt-8">
        <button
          onClick={logout}
          className="w-full flex items-center px-4 py-4 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group"
        >
          <LogOut
            size={20}
            className="mr-4 transition-transform duration-200 group-hover:scale-110"
          />
          <span className="font-medium text-sm">Log Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
