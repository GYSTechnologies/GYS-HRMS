import React from 'react';

const ProfileView = () => {
  return (
    <div className="p-6">
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Employee Profile</h2>
          <button className="text-blue-600">✏️</button>
        </div>
        
        <div className="p-6">
          <div className="flex items-start space-x-6 mb-8">
            <img src="/api/placeholder/80/80" alt="Anthony" className="w-20 h-20 rounded-full" />
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-1">Anthony</h3>
              <p className="text-gray-600 mb-4">Software Developer</p>
              <p className="text-sm text-gray-500">Date of Join: 08-10-2024</p>
            </div>
            <div className="text-right">
              <h4 className="font-medium mb-2">Job Details</h4>
              <div className="text-sm space-y-1">
                <div><span className="text-gray-500">Designation:</span> Software Developer</div>
                <div><span className="text-gray-500">Reporting Manager:</span> Mr Rajesh Kumar (Senior Developer)</div>
                <div><span className="text-gray-500">Department:</span> IT & Development</div>
                <div><span className="text-gray-500">Shift Timing:</span> 10:00 AM - 7:00 PM</div>
                <div><span className="text-gray-500">Employment Type:</span> Full-time</div>
                <div><span className="text-gray-500">Work Location:</span> Work From Home</div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500">Phone:</span><br />
                  <span>+91 63432 86386</span>
                </div>
                <div>
                  <span className="text-gray-500">Email:</span><br />
                  <span>anthony@gmail.com</span>
                </div>
                <div>
                  <span className="text-gray-500">Date Of Birthday:</span><br />
                  <span>24 November 1997 (27)</span>
                </div>
                <div>
                  <span className="text-gray-500">Address:</span><br />
                  <span>Dalmianagar, Uttarakhand</span>
                </div>
                <div>
                  <span className="text-gray-500">Gender:</span><br />
                  <span>Male</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="font-medium mb-4">Attendance & Leaves</h4>
            <div className="grid grid-cols-2 gap-8 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Working Days:</span>
                  <span>22 Days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Days Present:</span>
                  <span>20 Days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Days Absent:</span>
                  <span>2 Days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Late Logins:</span>
                  <span>5 times</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Leaves Allotted:</span>
                  <span>12 Days/Year</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Leaves Taken:</span>
                  <span>5 Days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Remaining Leaves:</span>
                  <span>7 Days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;