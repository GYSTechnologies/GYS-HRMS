import React from 'react';
import { Bell, User } from 'lucide-react';

const Header = () => {
  return (
    <div className="bg-gradient-to-r from-white to-gray-50 px-6 py-3 flex justify-between items-center border-b border-gray-200 shadow-sm">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Good Morning, Yogesh</h1>
        <p className="text-sm text-gray-500 font-medium">Thursday, 3rd Sep</p>
      </div>
    </div>
  );
};

export default Header;