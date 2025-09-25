// import { Menu } from "lucide-react";
// import { useAuth } from "../context/AppContext";

// const Navbar = ({ onMenuClick }) => {
//   const { user } = useAuth();
//   if (!user) return null;

//   const today = new Date().toLocaleDateString("en-US", {
//     weekday: "long",
//     day: "numeric",
//     month: "short",
//   });

//   const hours = new Date().getHours();
//   let greeting = "Hello";
//   if (hours < 12) greeting = "Good Morning";
//   else if (hours < 18) greeting = "Good Afternoon";
//   else greeting = "Good Evening";

//   return (
//   <div className="sticky top-0 z-50 bg-gradient-to-r from-white to-gray-50 px-6 py-3 flex justify-between items-center border-b border-gray-200 shadow-sm">
//     {/* Left: Hamburger + Greeting */}
//     <div className="flex items-center space-x-3">
//       {/* Hamburger button (mobile only) */}
//       <button
//         onClick={onMenuClick}
//         className="lg:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
//       >
//         <Menu size={24} />
//       </button>

//       <div>
//         <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">
//           {greeting}, {user.firstName}
//         </h1>
//         <p className="text-xs sm:text-sm text-gray-500 font-medium">{today}</p>
//       </div>
//     </div>

//     {/* Right side */}
//     <span className="px-3 py-1 bg-gradient-to-r from-[#104774] to-[#0d3a61] text-white rounded-full text-xs sm:text-sm font-medium shadow">
//       {user.role.toUpperCase()}
//     </span>
//   </div>
// );


//   // return (
//   //   <div className="bg-gradient-to-r from-white to-gray-50 px-6 py-3 flex justify-between items-center border-b border-gray-200 shadow-sm">
//   //     {/* Left: Hamburger + Greeting */}
//   //     <div className="flex items-center space-x-3">
//   //       {/* Hamburger button (mobile only) */}
//   //       <button
//   //         onClick={onMenuClick}
//   //         className="lg:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
//   //       >
//   //         <Menu size={24} />
//   //       </button>

//   //       <div>
//   //         <h1 className="text-2xl font-bold text-gray-800 mb-1">
//   //           {greeting}, {user.firstName}
//   //         </h1>
//   //         <p className="text-sm text-gray-500 font-medium">{today}</p>
//   //       </div>
//   //     </div>

//   //     {/* Right side */}
//   //     <span className="px-3 py-1 bg-gradient-to-r from-[#104774] to-[#0d3a61] text-white rounded-full text-xs font-medium shadow">
//   //       {user.role.toUpperCase()}
//   //     </span>
//   //   </div>
//   // );
// };

// export default Navbar;


// Navbar Component - Zoom Responsive
import { Menu } from "lucide-react";
import { useAuth } from "../context/AppContext";

const Navbar = ({ onMenuClick }) => {
  const { user } = useAuth();
  if (!user) return null;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

  const hours = new Date().getHours();
  let greeting = "Hello";
  if (hours < 12) greeting = "Good Morning";
  else if (hours < 18) greeting = "Good Afternoon";
  else greeting = "Good Evening";

//   return(
//     <div className="sticky top-0 z-50 bg-gradient-to-r from-white to-gray-50 px-2 sm:px-3 lg:px-6 py-2 sm:py-2.5 lg:py-3 flex justify-between items-center border-b border-gray-200 shadow-sm min-h-[56px] sm:min-h-[64px] lg:min-h-[72px] xl:min-h-[80px]">
//   {/* Left: Hamburger + Greeting */}
//   <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
//     <button
//       onClick={onMenuClick}
//       className="lg:hidden p-1.5 sm:p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0"
//     >
//       <Menu size={20} className="sm:w-6 sm:h-6" />
//     </button>

//     <div className="min-w-0 flex-1">
//       <h1 className="text-sm sm:text-base lg:text-lg xl:text-xl font-bold text-gray-800 mb-0.5 sm:mb-1 leading-tight truncate">
//         {greeting}, {user.firstName}
//       </h1>
//       <p className="text-xs sm:text-sm lg:text-base text-gray-500 font-medium truncate">
//         {today}
//       </p>
//     </div>
//   </div>

//   {/* Right side role badge */}
//   <div className="flex-shrink-0 ml-2 sm:ml-3">
//     <span className="px-2 sm:px-3 py-1 bg-gradient-to-r from-[#104774] to-[#0d3a61] text-white rounded-full text-xs sm:text-sm font-medium shadow whitespace-nowrap">
//       {user.role.toUpperCase()}
//     </span>
//   </div>
// </div>

//   )
  
  return (
  <div className="sticky top-0 z-50 bg-gradient-to-r from-white to-gray-50 px-3 py-2 flex justify-between items-center border-b border-gray-200 shadow-sm min-h-[56px]">
    {/* Left: Hamburger + Greeting */}
    <div className="flex items-center space-x-3 min-w-0 flex-1">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-1.5 rounded-md text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0"
      >
        <Menu size={18} className="w-5 h-5" />
      </button>

      <div className="min-w-0 flex-1">
        <h1 className="text-sm font-bold text-gray-800 leading-tight truncate">
          {greeting}, {user.firstName}
        </h1>
        <p className="text-xs text-gray-500 font-medium truncate">{today}</p>
      </div>
    </div>

    {/* Right side role badge */}
    <div className="flex-shrink-0 ml-3">
      <span className="px-2 py-0.5 bg-gradient-to-r from-[#104774] to-[#0d3a61] text-white rounded-full text-xs font-medium shadow whitespace-nowrap">
        {user.role.toUpperCase()}
      </span>
    </div>
  </div>
);


  
  // return (
  //   <div className="sticky top-0 z-50 bg-gradient-to-r from-white to-gray-50 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 flex justify-between items-center border-b border-gray-200 shadow-sm min-h-[60px] sm:min-h-[70px] lg:min-h-[80px]">
  //     {/* Left: Hamburger + Greeting */}
  //     <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
  //       {/* Hamburger button (mobile only) */}
  //       <button
  //         onClick={onMenuClick}
  //         className="lg:hidden p-1.5 sm:p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0"
  //       >
  //         <Menu size={20} className="sm:w-6 sm:h-6" />
  //       </button>

  //       <div className="min-w-0 flex-1">
  //         <h1 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-gray-800 mb-0.5 sm:mb-1 leading-tight truncate">
  //           {greeting}, {user.firstName}
  //         </h1>
  //         <p className="text-xs sm:text-sm lg:text-base text-gray-500 font-medium truncate">
  //           {today}
  //         </p>
  //       </div>
  //     </div>

  //     {/* Right side */}
  //     <div className="flex-shrink-0 ml-2 sm:ml-3">
  //       <span className="px-2 sm:px-3 py-1 bg-gradient-to-r from-[#104774] to-[#0d3a61] text-white rounded-full text-xs sm:text-sm font-medium shadow whitespace-nowrap">
  //         {user.role.toUpperCase()}
  //       </span>
  //     </div>
  //   </div>
  // );
};

export default Navbar;