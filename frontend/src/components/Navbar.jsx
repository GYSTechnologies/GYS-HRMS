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

  return (
    <div className="bg-gradient-to-r from-white to-gray-50 px-6 py-3 flex justify-between items-center border-b border-gray-200 shadow-sm">
      {/* Left: Hamburger + Greeting */}
      <div className="flex items-center space-x-3">
        {/* Hamburger button (mobile only) */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
        >
          <Menu size={24} />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            {greeting}, {user.firstName}
          </h1>
          <p className="text-sm text-gray-500 font-medium">{today}</p>
        </div>
      </div>

      {/* Right side */}
      <span className="px-3 py-1 bg-gradient-to-r from-[#104774] to-[#0d3a61] text-white rounded-full text-xs font-medium shadow">
        {user.role.toUpperCase()}
      </span>
    </div>
  );
};

export default Navbar;
