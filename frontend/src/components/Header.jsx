// import React from 'react';
// import { Bell, User } from 'lucide-react';

// const Header = () => {
//   return (
//     <div className="bg-white p-4 flex justify-between items-center border-b">
//       <div>
//         <h1 className="text-xl font-semibold">Good Morning, Yogesh </h1>
//         <p className="text-sm text-gray-500">Thursday, 3rd Sep</p>
//       </div>
//       <div className="flex items-center space-x-4">
//         <Bell size={20} className="text-gray-500" />
//         <User size={20} className="text-gray-500" />
//       </div>
//     </div>
//   );
// };

// export default Header;

import React from 'react';
import { Bell, User } from 'lucide-react';

const Header = () => {
  return (
    <div className="bg-gradient-to-r from-white to-gray-50 px-6 py-3 flex justify-between items-center border-b border-gray-200 shadow-sm">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Good Morning, Yogesh</h1>
        <p className="text-sm text-gray-500 font-medium">Thursday, 3rd Sep</p>
      </div>
      {/* <div className="flex items-center space-x-4">
        <div className="relative">
          <Bell size={22} className="text-gray-600 hover:text-blue-600 transition-colors cursor-pointer" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">3</span>
          </div>
        </div>
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center cursor-pointer hover:shadow-lg transition-shadow">
          <User size={20} className="text-white" />
        </div>
      </div> */}
    </div>
  );
};

export default Header;