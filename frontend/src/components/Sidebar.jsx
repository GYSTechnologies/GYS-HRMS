// import React from "react";
// import { Link, useLocation } from "react-router-dom";
// import {
//   User,
//   LogOut,
//   BarChart3,
//   Users,
//   Clock,
//   CreditCard,
//   FileText,
//   UserCircle,
//   Calendar,
// } from "lucide-react";
// import { useAuth } from "../context/AppContext";
// import logo from "../assets/gys_logo.png";

// const Sidebar = ({ closeSidebar }) => {
//   const { user, logout } = useAuth();
//   const location = useLocation();

//   if (!user) return null;

//   // Role-based menu items with icons
//   const menuItems = {
//     admin: [
//       { label: "Dashboard", path: "/admin", icon: BarChart3 },
//       {
//         label: "Manage Employees",
//         path: "/admin/manage-employees",
//         icon: Users,
//       },
//       {
//         label: "Attendance Management",
//         path: "/admin/attendance",
//         icon: Clock,
//       },
//       {
//         label: "Payroll Approval",
//         path: "/admin/payroll-approval",
//         icon: CreditCard,
//       },
//       { label: "Calendar", path: "/admin/calendar", icon: Calendar },
//       { label: "Leaves Management", path: "/admin/leaves", icon: FileText },
//     ],
//     hr: [
//       { label: "Dashboard", path: "/hr", icon: BarChart3 },
//       { label: "Manage Employees", path: "/hr/manage-employees", icon: Users },
//       { label: "Attendance Management", path: "/hr/attendance", icon: Clock },
//       { label: "Payroll", path: "/hr/payroll", icon: CreditCard },
//       { label: "Leaves Management", path: "/hr/leaves", icon: FileText },
//       { label: "My Profile", path: "/hr/profile", icon: UserCircle },
//       { label: "Calendar", path: "/hr/calendar", icon: Calendar },
//     ],
//     employee: [
//       { label: "Dashboard", path: "/employee", icon: BarChart3 },
//       { label: "My Attendance", path: "/employee/attendance", icon: Clock },
//       { label: "My Leaves", path: "/employee/leaves", icon: FileText },
//       { label: "Payslip", path: "/employee/payslip", icon: CreditCard },
//       { label: "My Profile", path: "/employee/profile", icon: UserCircle },
//       { label: "Calendar", path: "/employee/calendar", icon: Calendar },
//     ],
//   };

//   return (
//     <div className="bg-white shadow-lg w-80 min-h-screen flex flex-col relative">
//       {/* Header */}
//       <div className=" px-5  border-b border-gray-100 flex items-center justify-between">
//         <div className="flex items-center">
//           <img
//             src={logo}
//             alt="GYS Logo"
//             className="h-21 w-auto object-contain " // yaha se size control hoga
//           />
//         </div>

//         {/* <div className="flex items-center space-x-3">
//           <div className="w-8 h-8 bg-gradient-to-br from-[#104774] to-[#0d3a61] rounded-lg flex items-center justify-center">
//             <span className="text-white font-bold text-sm">△</span>
//           </div>
//           <div className="text-gray-800 text-xl font-bold tracking-wide">
//             GYS
//           </div>
//         </div> */}
//         {/* Mobile Close Button */}
//         <button
//           onClick={closeSidebar}
//           className="lg:hidden text-gray-600 hover:text-gray-900"
//         >
//           ✕
//         </button>
//       </div>

//       {/* Profile Section */}
//       <div className="p-6 border-b border-gray-100">
//         <div className="flex items-center space-x-3">
//           {user?.avatarUrl ? (
//             <img
//               src={user?.avatarUrl}
//               alt={user.firstName}
//               className="w-20 h-20 rounded-full object-cover border border-gray-200"
//             />
//           ) : (
//             <div className="w-20 h-20 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center">
//               <User size={20} className="text-gray-600" />
//             </div>
//           )}

//           <div className="flex-1">
//             {user?.firstName || user?.lastName || user?.designation ? (
//               <>
//                 <div className="font-semibold text-gray-800 px-1">
//                   {`${user?.firstName || ""} ${user?.lastName || ""}`}
//                 </div>
//                 <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full inline-block mt-1">
//                   {user?.designation?.toUpperCase()}
//                 </div>
//               </>
//             ) : (
//               <div className="font-semibold text-gray-500 bg-gray-100 px-5 py-1 rounded-full inline-block">
//                 {user?.role?.toUpperCase()}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       <nav className="flex-1 p-4 space-y-3">
//         {menuItems[user.role]?.map((item, index) => {
//           const Icon = item.icon;
//           const isActive = location.pathname === item.path;

//           return (
//             <Link
//               key={index}
//               to={item.path}
//               onClick={closeSidebar}
//               className={`w-full flex items-center px-4 py-4 rounded-xl transition-all duration-200 group ${
//                 isActive
//                   ? "bg-gradient-to-r from-[#104774] to-[#0d3a61] text-white shadow-lg transform scale-105"
//                   : "text-gray-600 hover:bg-gray-50 hover:text-[#104774]"
//               }`}
//             >
//               <Icon
//                 size={20}
//                 className={`mr-4 transition-transform duration-200 ${
//                   isActive ? "scale-110" : "group-hover:scale-110"
//                 }`}
//               />
//               <span className="font-medium text-sm">{item.label}</span>
//               {isActive && (
//                 <div className="ml-auto w-2 h-2 bg-white rounded-full opacity-80"></div>
//               )}
//             </Link>
//           );
//         })}
//       </nav>

//       {/* Logout Button */}
//       <div className="p-4 border-t border-gray-100 mt-8">
//         <button
//           onClick={logout}
//           className="w-full flex items-center px-4 py-4 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group"
//         >
//           <LogOut
//             size={20}
//             className="mr-4 transition-transform duration-200 group-hover:scale-110"
//           />
//           <span className="font-medium text-sm">Log Out</span>
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Sidebar;


// Sidebar Component - Zoom Responsive
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

//   return(
//     <div className="bg-white shadow-lg w-48 sm:w-56 lg:w-64 xl:w-72 min-h-screen flex flex-col relative transition-all duration-200">
//   {/* Header */}
//   <div className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 border-b border-gray-100 flex items-center justify-between">
//     <div className="flex items-center min-w-0 flex-1">
//       <img
//         src={logo}
//         alt="GYS Logo"
//         className="h-12 sm:h-14 lg:h-16 xl:h-18 w-auto object-contain max-w-full"
//       />
//     </div>

//     {/* Mobile Close Button */}
//     <button
//       onClick={closeSidebar}
//       className="lg:hidden text-gray-600 hover:text-gray-900 p-1 sm:p-2 rounded-md hover:bg-gray-100 transition-colors flex-shrink-0"
//     >
//       <span className="text-lg sm:text-xl">✕</span>
//     </button>
//   </div>

//   {/* Profile Section */}
//   <div className="p-2 sm:p-3 lg:p-4 xl:p-5 border-b border-gray-100">
//     <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
//       {user?.avatarUrl ? (
//         <img
//           src={user?.avatarUrl}
//           alt={user.firstName}
//           className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-full object-cover border border-gray-200 flex-shrink-0"
//         />
//       ) : (
//         <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
//           <User size={16} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-gray-600" />
//         </div>
//       )}

//       <div className="flex-1 min-w-0">
//         <div className="font-semibold text-gray-800 text-sm sm:text-base lg:text-lg truncate">
//           {`${user?.firstName || ""} ${user?.lastName || ""}`}
//         </div>
//         <div className="text-xs sm:text-sm lg:text-base text-gray-500 bg-gray-100 px-2 py-1 rounded-full mt-1 truncate">
//           {user?.designation?.toUpperCase() || user?.role?.toUpperCase()}
//         </div>
//       </div>
//     </div>
//   </div>

//   {/* Navigation */}
//   <nav className="flex-1 p-1 sm:p-2 lg:p-3 xl:p-4 space-y-1 sm:space-y-2 lg:space-y-3 overflow-y-auto">
//     {menuItems[user.role]?.map((item, index) => {
//       const Icon = item.icon;
//       const isActive = location.pathname === item.path;
//       return (
//         <Link
//           key={index}
//           to={item.path}
//           onClick={closeSidebar}
//           className={`w-full flex items-center px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 rounded-md sm:rounded-lg transition-all duration-200 group min-h-[2.5rem] sm:min-h-[2.75rem] lg:min-h-[3rem] ${
//             isActive
//               ? "bg-gradient-to-r from-[#104774] to-[#0d3a61] text-white shadow-md scale-[1.02] sm:scale-105"
//               : "text-gray-600 hover:bg-gray-50 hover:text-[#104774]"
//           }`}
//         >
//           <Icon
//             size={16}
//             className={`mr-2 sm:mr-3 lg:mr-4 transition-transform duration-200 flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${
//               isActive ? "scale-110" : "group-hover:scale-110"
//             }`}
//           />
//           <span className="font-medium text-xs sm:text-sm lg:text-base truncate flex-1 leading-tight">
//             {item.label}
//           </span>
//         </Link>
//       );
//     })}
//   </nav>

//   {/* Logout Button */}
//   <div className="p-2 sm:p-3 lg:p-4 border-t border-gray-100 mt-4 sm:mt-6 lg:mt-8">
//     <button
//       onClick={logout}
//       className="w-full flex items-center px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 text-red-600 hover:bg-red-50 rounded-md sm:rounded-lg transition-all duration-200 group min-h-[2.5rem] sm:min-h-[2.75rem] lg:min-h-[3rem]"
//     >
//       <LogOut
//         size={16}
//         className="mr-2 sm:mr-3 lg:mr-4 transition-transform duration-200 group-hover:scale-110 flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6"
//       />
//       <span className="font-medium text-xs sm:text-sm lg:text-base truncate">
//         Log Out
//       </span>
//     </button>
//   </div>
// </div>

//   )
return (
  <div className="bg-white shadow-lg w-48 sm:w-56 lg:w-60 min-h-screen flex flex-col relative transition-all duration-200">
    {/* Header */}
    <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
      <div className="flex items-center min-w-0 flex-1">
        <img
          src={logo}
          alt="GYS Logo"
          className="h-20 w-auto object-contain max-w-full"
        />
      </div>

      {/* Mobile Close Button */}
      <button
        onClick={closeSidebar}
        className="lg:hidden text-gray-600 hover:text-gray-900 p-1 rounded-md hover:bg-gray-100 transition-colors flex-shrink-0"
      >
        <span className="text-base">✕</span>
      </button>
    </div>

    {/* Profile Section */}
    <div className="p-3 border-b border-gray-100">
      <div className="flex items-center space-x-3">
        {user?.avatarUrl ? (
          <img
            src={user?.avatarUrl}
            alt={user.firstName}
            className="w-10 h-10 rounded-full object-cover border border-gray-200 flex-shrink-0"
          />
        ) : (
          <div className="w-10 h-10 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
            <User size={16} className="text-gray-600" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-800 text-sm truncate">
            {`${user?.firstName || ""} ${user?.lastName || ""}`}
          </div>
          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full mt-1 truncate">
            {user?.designation?.toUpperCase() || user?.role?.toUpperCase()}
          </div>
        </div>
      </div>
    </div>

    {/* Navigation */}
    <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
      {menuItems[user.role]?.map((item, index) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={index}
            to={item.path}
            onClick={closeSidebar}
            className={`w-full flex items-center px-3 py-2 rounded-md transition-all duration-200 group min-h-[2.25rem] ${
              isActive
                ? "bg-gradient-to-r from-[#104774] to-[#0d3a61] text-white shadow-sm scale-[1.02]"
                : "text-gray-600 hover:bg-gray-50 hover:text-[#104774]"
            }`}
          >
            <Icon
              size={16}
              className={`mr-3 transition-transform duration-200 flex-shrink-0 w-4 h-4 ${
                isActive ? "scale-110" : "group-hover:scale-110"
              }`}
            />
            <span className="font-medium text-sm truncate flex-1 leading-tight">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>

    {/* Logout Button */}
    <div className="p-3 border-t border-gray-100 mt-4">
      <button
        onClick={logout}
        className="w-full flex items-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-all duration-200 group min-h-[2.25rem]"
      >
        <LogOut
          size={16}
          className="mr-3 transition-transform duration-200 group-hover:scale-110 flex-shrink-0 w-4 h-4"
        />
        <span className="font-medium text-sm truncate">Log Out</span>
      </button>
    </div>
  </div>
);
}

  export default Sidebar;