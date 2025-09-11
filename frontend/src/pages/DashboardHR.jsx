// import Sidebar from "../components/Sidebar";
// import Navbar from "../components/Navbar";
// import { Outlet } from "react-router-dom";

// const DashboardHR = () => {
//   return (
//     <div className="flex">
//       <Sidebar />
//       <div className="flex-1">
//         <Navbar />

//         {/*  Nested content will be injected here */}
//         <div className="p-6 min-h-[90vh] bg-gray-50 ">
//           <Outlet />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DashboardHR;


import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";
import { useState } from "react";

const DashboardHR = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex">
      {/* Sidebar (mobile toggle + desktop fixed) */}
      <div
        className={`fixed inset-0 z-40 lg:static lg:translate-x-0 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar closeSidebar={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Nested content */}
        <div className="p-6 flex-1 bg-gray-50 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardHR;
