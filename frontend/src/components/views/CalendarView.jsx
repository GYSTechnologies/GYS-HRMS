// old code 
// import React, { useState } from 'react';
// import { ChevronLeft, ChevronRight, Plus, Calendar, Clock, MapPin, Users } from 'lucide-react';

// const CalendarView = () => {
//   const [selectedDate, setSelectedDate] = useState(15); // Current selected date
//   const selectedMonth = "August 2025"; // Mock selected month - replace with your useAppContext
//   const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
//   const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);
//   const startDay = 4; // Thursday starts on Aug 1st
  
//   // Mock events data
//   const events = {
//     5: [{ title: "Team Meeting", time: "10:00 AM", type: "meeting" }],
//     12: [{ title: "Project Deadline", time: "All Day", type: "deadline" }],
//     15: [
//       { title: "Client Call", time: "2:00 PM", type: "call" },
//       { title: "Design Review", time: "4:30 PM", type: "meeting" }
//     ],
//     20: [{ title: "Company Event", time: "6:00 PM", type: "event" }],
//     25: [{ title: "Leave Day", time: "All Day", type: "leave" }]
//   };

//   const today = new Date().getDate();

//   const getEventColor = (type) => {
//     switch(type) {
//       case 'meeting': return 'bg-blue-500';
//       case 'deadline': return 'bg-red-500';
//       case 'call': return 'bg-green-500';
//       case 'event': return 'bg-purple-500';
//       case 'leave': return 'bg-orange-500';
//       default: return 'bg-gray-500';
//     }
//   };

//   const getEventBgColor = (type) => {
//     switch(type) {
//       case 'meeting': return 'bg-blue-50 border-blue-200';
//       case 'deadline': return 'bg-red-50 border-red-200';
//       case 'call': return 'bg-green-50 border-green-200';
//       case 'event': return 'bg-purple-50 border-purple-200';
//       case 'leave': return 'bg-orange-50 border-orange-200';
//       default: return 'bg-gray-50 border-gray-200';
//     }
//   };

//   return (
//     <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-800">Calendar</h1>
//           <p className="text-gray-500 text-sm mt-1">Manage your schedule and events</p>
//         </div>
//         <button className="flex items-center bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105">
//           <Plus size={18} className="mr-2" />
//           Add Event
//         </button>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         {/* Main Calendar */}
//         <div className="lg:col-span-2">
//           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//             {/* Calendar Header */}
//             <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
//               <div className="flex justify-between items-center">
//                 <button className="p-2 hover:bg-blue-400 rounded-lg transition-colors">
//                   <ChevronLeft size={24} />
//                 </button>
//                 <div className="text-center">
//                   <h2 className="text-xl font-semibold">{selectedMonth}</h2>
//                   <p className="text-blue-100 text-sm">Click on any date to view details</p>
//                 </div>
//                 <button className="p-2 hover:bg-blue-400 rounded-lg transition-colors">
//                   <ChevronRight size={24} />
//                 </button>
//               </div>
//             </div>

//             <div className="p-6">
//               {/* Days of Week */}
//               <div className="grid grid-cols-7 gap-2 mb-4">
//                 {daysOfWeek.map(day => (
//                   <div key={day} className="text-center font-semibold py-3 text-gray-600 bg-gray-50 rounded-lg">
//                     {day}
//                   </div>
//                 ))}
//               </div>

//               {/* Calendar Grid */}
//               <div className="grid grid-cols-7 gap-2">
//                 {/* Previous month days */}
//                 {Array.from({ length: startDay }, (_, i) => (
//                   <div key={`prev-${i}`} className="h-20 bg-gray-50 text-gray-400 p-2 rounded-lg flex flex-col justify-between">
//                     <span className="text-sm">{28 + i}</span>
//                   </div>
//                 ))}

//                 {/* Current month days */}
//                 {daysInMonth.map(day => {
//                   const hasEvents = events[day];
//                   const isToday = day === today;
//                   const isSelected = day === selectedDate;
                  
//                   return (
//                     <div 
//                       key={day} 
//                       onClick={() => setSelectedDate(day)}
//                       className={`h-20 border-2 cursor-pointer p-2 rounded-lg flex flex-col justify-between transition-all duration-200 hover:shadow-md ${
//                         isSelected 
//                           ? 'border-blue-500 bg-blue-50' 
//                           : isToday 
//                             ? 'border-green-400 bg-green-50' 
//                             : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'
//                       }`}
//                     >
//                       <div className="flex justify-between items-start">
//                         <span className={`font-medium ${
//                           isSelected ? 'text-blue-600' : 
//                           isToday ? 'text-green-600' : 'text-gray-800'
//                         }`}>
//                           {day}
//                         </span>
//                         {isToday && (
//                           <div className="w-2 h-2 bg-green-500 rounded-full"></div>
//                         )}
//                       </div>
                      
//                       {hasEvents && (
//                         <div className="space-y-1">
//                           {hasEvents.slice(0, 2).map((event, idx) => (
//                             <div key={idx} className={`w-full h-1 ${getEventColor(event.type)} rounded`}></div>
//                           ))}
//                           {hasEvents.length > 2 && (
//                             <div className="text-xs text-gray-500">+{hasEvents.length - 2} more</div>
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   );
//                 })}

//                 {/* Next month days */}
//                 {Array.from({ length: 7 - ((startDay + 31) % 7) }, (_, i) => (
//                   <div key={`next-${i}`} className="h-20 bg-gray-50 text-gray-400 p-2 rounded-lg flex flex-col justify-between">
//                     <span className="text-sm">{i + 1}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Sidebar */}
//         <div className="space-y-6">
//           {/* Selected Date Info */}
//           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
//             <div className="flex items-center mb-4">
//               <Calendar size={24} className="text-blue-500 mr-3" />
//               <h3 className="text-lg font-semibold text-gray-800">
//                 {selectedMonth.split(' ')[0]} {selectedDate}, {selectedMonth.split(' ')[1]}
//               </h3>
//             </div>
            
//             {events[selectedDate] ? (
//               <div className="space-y-3">
//                 {events[selectedDate].map((event, idx) => (
//                   <div key={idx} className={`p-4 rounded-xl border ${getEventBgColor(event.type)}`}>
//                     <div className="flex items-start justify-between">
//                       <div>
//                         <h4 className="font-semibold text-gray-800">{event.title}</h4>
//                         <div className="flex items-center text-sm text-gray-600 mt-1">
//                           <Clock size={14} className="mr-1" />
//                           {event.time}
//                         </div>
//                       </div>
//                       <div className={`w-3 h-3 ${getEventColor(event.type)} rounded-full`}></div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-8">
//                 <Calendar size={48} className="text-gray-300 mx-auto mb-3" />
//                 <p className="text-gray-500">No events</p>
//                 <button className="text-blue-500 text-sm mt-2 hover:text-blue-600">
//                   + Add Event
//                 </button>
//               </div>
//             )}
//           </div>

//           {/* Quick Stats */}
//           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
//             <h3 className="text-lg font-semibold text-gray-800 mb-4">This Month</h3>
//             <div className="space-y-4">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center">
//                   <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
//                   <span className="text-sm text-gray-600">Meetings</span>
//                 </div>
//                 <span className="font-semibold text-gray-800">8</span>
//               </div>
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center">
//                   <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
//                   <span className="text-sm text-gray-600">Deadlines</span>
//                 </div>
//                 <span className="font-semibold text-gray-800">3</span>
//               </div>
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center">
//                   <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
//                   <span className="text-sm text-gray-600">Leave Days</span>
//                 </div>
//                 <span className="font-semibold text-gray-800">2</span>
//               </div>
//             </div>
//           </div>

//           {/* Upcoming Events */}
//           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
//             <h3 className="text-lg font-semibold text-gray-800 mb-4">Upcoming</h3>
//             <div className="space-y-3">
//               <div className="flex items-center p-3 bg-blue-50 rounded-xl border border-blue-200">
//                 <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
//                 <div className="flex-1">
//                   <div className="font-medium text-gray-800 text-sm">Team Meeting</div>
//                   <div className="text-xs text-gray-500">Tomorrow, 10:00 AM</div>
//                 </div>
//               </div>
//               <div className="flex items-center p-3 bg-green-50 rounded-xl border border-green-200">
//                 <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
//                 <div className="flex-1">
//                   <div className="font-medium text-gray-800 text-sm">Client Call</div>
//                   <div className="text-xs text-gray-500">Aug 18, 2:00 PM</div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CalendarView;


//chnage code 
// import React, { useState } from 'react';
// import { ChevronLeft, ChevronRight, Plus, Calendar, Clock, MapPin, Users } from 'lucide-react';

// const CalendarView = () => {
//   const [selectedDate, setSelectedDate] = useState(15); // Current selected date
//   const selectedMonth = "August 2025"; // Mock selected month - replace with your useAppContext
//   const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
//   const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);
//   const startDay = 4; // Thursday starts on Aug 1st
  
//   // Mock events data
//   const events = {
//     5: [{ title: "Team Meeting", time: "10:00 AM", type: "meeting" }],
//     12: [{ title: "Project Deadline", time: "All Day", type: "deadline" }],
//     15: [
//       { title: "Client Call", time: "2:00 PM", type: "call" },
//       { title: "Design Review", time: "4:30 PM", type: "meeting" }
//     ],
//     20: [{ title: "Company Event", time: "6:00 PM", type: "event" }],
//     25: [{ title: "Leave Day", time: "All Day", type: "leave" }]
//   };

//   const today = new Date().getDate();

//   const getEventColor = (type) => {
//     switch(type) {
//       case 'meeting': return 'bg-blue-500';
//       case 'deadline': return 'bg-red-500';
//       case 'call': return 'bg-green-500';
//       case 'event': return 'bg-purple-500';
//       case 'leave': return 'bg-orange-500';
//       default: return 'bg-gray-500';
//     }
//   };

//   const getEventBgColor = (type) => {
//     switch(type) {
//       case 'meeting': return 'bg-blue-50 border-blue-200';
//       case 'deadline': return 'bg-red-50 border-red-200';
//       case 'call': return 'bg-green-50 border-green-200';
//       case 'event': return 'bg-purple-50 border-purple-200';
//       case 'leave': return 'bg-orange-50 border-orange-200';
//       default: return 'bg-gray-50 border-gray-200';
//     }
//   };

//   return (
//     <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-800">Calendar</h1>
//           <p className="text-gray-500 text-sm mt-1">Manage your schedule and events</p>
//         </div>
//         {/* <button className="flex items-center bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105">
//           <Plus size={18} className="mr-2" />
//           Add Event
//         </button> */}
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         {/* Main Calendar */}
//         <div className="lg:col-span-2">
//           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//             {/* Calendar Header */}
//             <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
//               <div className="flex justify-between items-center">
//                 <button className="p-2 hover:bg-blue-400 rounded-lg transition-colors">
//                   <ChevronLeft size={24} />
//                 </button>
//                 <div className="text-center">
//                   <h2 className="text-xl font-semibold">{selectedMonth}</h2>
//                   <p className="text-blue-100 text-sm">Click on any date to view details</p>
//                 </div>
//                 <button className="p-2 hover:bg-blue-400 rounded-lg transition-colors">
//                   <ChevronRight size={24} />
//                 </button>
//               </div>
//             </div>

//             <div className="p-6">
//               {/* Days of Week */}
//               <div className="grid grid-cols-7 gap-2 mb-4">
//                 {daysOfWeek.map(day => (
//                   <div key={day} className="text-center font-semibold py-3 text-gray-600 bg-gray-50 rounded-lg">
//                     {day}
//                   </div>
//                 ))}
//               </div>

//               {/* Calendar Grid */}
//               <div className="grid grid-cols-7 gap-2">
//                 {/* Previous month days */}
//                 {Array.from({ length: startDay }, (_, i) => (
//                   <div key={`prev-${i}`} className="h-20 bg-gray-50 text-gray-400 p-2 rounded-lg flex flex-col justify-between">
//                     <span className="text-sm">{28 + i}</span>
//                   </div>
//                 ))}

//                 {/* Current month days */}
//                 {daysInMonth.map(day => {
//                   const hasEvents = events[day];
//                   const isToday = day === today;
//                   const isSelected = day === selectedDate;
                  
//                   return (
//                     <div 
//                       key={day} 
//                       onClick={() => setSelectedDate(day)}
//                       className={`h-20 border-2 cursor-pointer p-2 rounded-lg flex flex-col justify-between transition-all duration-200 hover:shadow-md ${
//                         isSelected 
//                           ? 'border-blue-500 bg-blue-50' 
//                           : isToday 
//                             ? 'border-green-400 bg-green-50' 
//                             : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'
//                       }`}
//                     >
//                       <div className="flex justify-between items-start">
//                         <span className={`font-medium ${
//                           isSelected ? 'text-blue-600' : 
//                           isToday ? 'text-green-600' : 'text-gray-800'
//                         }`}>
//                           {day}
//                         </span>
//                         {isToday && (
//                           <div className="w-2 h-2 bg-green-500 rounded-full"></div>
//                         )}
//                       </div>
                      
//                       {hasEvents && (
//                         <div className="space-y-1">
//                           {hasEvents.slice(0, 2).map((event, idx) => (
//                             <div key={idx} className={`w-full h-1 ${getEventColor(event.type)} rounded`}></div>
//                           ))}
//                           {hasEvents.length > 2 && (
//                             <div className="text-xs text-gray-500">+{hasEvents.length - 2} more</div>
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   );
//                 })}

//                 {/* Next month days */}
//                 {Array.from({ length: 7 - ((startDay + 31) % 7) }, (_, i) => (
//                   <div key={`next-${i}`} className="h-20 bg-gray-50 text-gray-400 p-2 rounded-lg flex flex-col justify-between">
//                     <span className="text-sm">{i + 1}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Sidebar */}
//         {/* <div className="space-y-6">
//           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
//             <div className="flex items-center mb-4">
//               <Calendar size={24} className="text-blue-500 mr-3" />
//               <h3 className="text-lg font-semibold text-gray-800">
//                 {selectedMonth.split(' ')[0]} {selectedDate}, {selectedMonth.split(' ')[1]}
//               </h3>
//             </div>
            
//             {events[selectedDate] ? (
//               <div className="space-y-3">
//                 {events[selectedDate].map((event, idx) => (
//                   <div key={idx} className={`p-4 rounded-xl border ${getEventBgColor(event.type)}`}>
//                     <div className="flex items-start justify-between">
//                       <div>
//                         <h4 className="font-semibold text-gray-800">{event.title}</h4>
//                         <div className="flex items-center text-sm text-gray-600 mt-1">
//                           <Clock size={14} className="mr-1" />
//                           {event.time}
//                         </div>
//                       </div>
//                       <div className={`w-3 h-3 ${getEventColor(event.type)} rounded-full`}></div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-8">
//                 <Calendar size={48} className="text-gray-300 mx-auto mb-3" />
//                 <p className="text-gray-500">No events</p>
//                 <button className="text-blue-500 text-sm mt-2 hover:text-blue-600">
//                   + Add Event
//                 </button>
//               </div>
//             )}
//           </div>

//           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
//             <h3 className="text-lg font-semibold text-gray-800 mb-4">This Month</h3>
//             <div className="space-y-4">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center">
//                   <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
//                   <span className="text-sm text-gray-600">Meetings</span>
//                 </div>
//                 <span className="font-semibold text-gray-800">8</span>
//               </div>
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center">
//                   <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
//                   <span className="text-sm text-gray-600">Deadlines</span>
//                 </div>
//                 <span className="font-semibold text-gray-800">3</span>
//               </div>
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center">
//                   <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
//                   <span className="text-sm text-gray-600">Leave Days</span>
//                 </div>
//                 <span className="font-semibold text-gray-800">2</span>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
//             <h3 className="text-lg font-semibold text-gray-800 mb-4">Upcoming</h3>
//             <div className="space-y-3">
//               <div className="flex items-center p-3 bg-blue-50 rounded-xl border border-blue-200">
//                 <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
//                 <div className="flex-1">
//                   <div className="font-medium text-gray-800 text-sm">Team Meeting</div>
//                   <div className="text-xs text-gray-500">Tomorrow, 10:00 AM</div>
//                 </div>
//               </div>
//               <div className="flex items-center p-3 bg-green-50 rounded-xl border border-green-200">
//                 <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
//                 <div className="flex-1">
//                   <div className="font-medium text-gray-800 text-sm">Client Call</div>
//                   <div className="text-xs text-gray-500">Aug 18, 2:00 PM</div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div> */}
//       </div>
//     </div>
//   );
// };

// export default CalendarView;

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar, Clock, MapPin, Users } from 'lucide-react';

const CalendarView = () => {
  // CSS variables for colors
  const style = `
    :root {
      --primary-color: #104774;
      --primary-gradient: linear-gradient(to right, #104774, #0d3a61);
      --primary-hover: #0d3a61;
      --sun-color: #fbbf24;
    }
  `;

  const [selectedDate, setSelectedDate] = useState(15); // Current selected date
  const selectedMonth = "August 2025"; // Mock selected month - replace with your useAppContext
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);
  const startDay = 4; // Thursday starts on Aug 1st
  
  // Mock events data
  const events = {
    5: [{ title: "Team Meeting", time: "10:00 AM", type: "meeting" }],
    12: [{ title: "Project Deadline", time: "All Day", type: "deadline" }],
    15: [
      { title: "Client Call", time: "2:00 PM", type: "call" },
      { title: "Design Review", time: "4:30 PM", type: "meeting" }
    ],
    20: [{ title: "Company Event", time: "6:00 PM", type: "event" }],
    25: [{ title: "Leave Day", time: "All Day", type: "leave" }]
  };

  const today = new Date().getDate();

  const getEventColor = (type) => {
    switch(type) {
      case 'meeting': return 'bg-[#104774]';
      case 'deadline': return 'bg-red-500';
      case 'call': return 'bg-green-500';
      case 'event': return 'bg-purple-500';
      case 'leave': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getEventBgColor = (type) => {
    switch(type) {
      case 'meeting': return 'bg-blue-50 border-blue-200';
      case 'deadline': return 'bg-red-50 border-red-200';
      case 'call': return 'bg-green-50 border-green-200';
      case 'event': return 'bg-purple-50 border-purple-200';
      case 'leave': return 'bg-orange-50 border-orange-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Add style tag with CSS variables */}
      <style>{style}</style>
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Calendar</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your schedule and events</p>
        </div>
        {/* <button className="flex items-center bg-[#104774] text-white px-4 py-2 rounded-xl hover:bg-[#0d3a61] transition-all duration-200 transform hover:scale-105">
          <Plus size={18} className="mr-2" />
          Add Event
        </button> */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Calendar */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Calendar Header */}
            <div className="bg-[#104774] p-6 text-white">
              <div className="flex justify-between items-center">
                <button className="p-2 hover:bg-[#0d3a61] rounded-lg transition-colors">
                  <ChevronLeft size={24} />
                </button>
                <div className="text-center">
                  <h2 className="text-xl font-semibold">{selectedMonth}</h2>
                  <p className="text-blue-100 text-sm">Click on any date to view details</p>
                </div>
                <button className="p-2 hover:bg-[#0d3a61] rounded-lg transition-colors">
                  <ChevronRight size={24} />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Days of Week */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {daysOfWeek.map(day => (
                  <div key={day} className="text-center font-semibold py-3 text-gray-600 bg-gray-50 rounded-lg">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Previous month days */}
                {Array.from({ length: startDay }, (_, i) => (
                  <div key={`prev-${i}`} className="h-20 bg-gray-50 text-gray-400 p-2 rounded-lg flex flex-col justify-between">
                    <span className="text-sm">{28 + i}</span>
                  </div>
                ))}

                {/* Current month days */}
                {daysInMonth.map(day => {
                  const hasEvents = events[day];
                  const isToday = day === today;
                  const isSelected = day === selectedDate;
                  
                  return (
                    <div 
                      key={day} 
                      onClick={() => setSelectedDate(day)}
                      className={`h-20 border-2 cursor-pointer p-2 rounded-lg flex flex-col justify-between transition-all duration-200 hover:shadow-md ${
                        isSelected 
                          ? 'border-[#104774] bg-blue-50' 
                          : isToday 
                            ? 'border-green-400 bg-green-50' 
                            : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className={`font-medium ${
                          isSelected ? 'text-[#104774]' : 
                          isToday ? 'text-green-600' : 'text-gray-800'
                        }`}>
                          {day}
                        </span>
                        {isToday && (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        )}
                      </div>
                      
                      {hasEvents && (
                        <div className="space-y-1">
                          {hasEvents.slice(0, 2).map((event, idx) => (
                            <div key={idx} className={`w-full h-1 ${getEventColor(event.type)} rounded`}></div>
                          ))}
                          {hasEvents.length > 2 && (
                            <div className="text-xs text-gray-500">+{hasEvents.length - 2} more</div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Next month days */}
                {Array.from({ length: 7 - ((startDay + 31) % 7) }, (_, i) => (
                  <div key={`next-${i}`} className="h-20 bg-gray-50 text-gray-400 p-2 rounded-lg flex flex-col justify-between">
                    <span className="text-sm">{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        {/* <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center mb-4">
              <Calendar size={24} className="text-[#104774] mr-3" />
              <h3 className="text-lg font-semibold text-gray-800">
                {selectedMonth.split(' ')[0]} {selectedDate}, {selectedMonth.split(' ')[1]}
              </h3>
            </div>
            
            {events[selectedDate] ? (
              <div className="space-y-3">
                {events[selectedDate].map((event, idx) => (
                  <div key={idx} className={`p-4 rounded-xl border ${getEventBgColor(event.type)}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-800">{event.title}</h4>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <Clock size={14} className="mr-1" />
                          {event.time}
                        </div>
                      </div>
                      <div className={`w-3 h-3 ${getEventColor(event.type)} rounded-full`}></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar size={48} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No events</p>
                <button className="text-[#104774] text-sm mt-2 hover:text-[#0d3a61]">
                  + Add Event
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">This Month</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-[#104774] rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Meetings</span>
                </div>
                <span className="font-semibold text-gray-800">8</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Deadlines</span>
                </div>
                <span className="font-semibold text-gray-800">3</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Leave Days</span>
                </div>
                <span className="font-semibold text-gray-800">2</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Upcoming</h3>
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-blue-50 rounded-xl border border-blue-200">
                <div className="w-3 h-3 bg-[#104774] rounded-full mr-3"></div>
                <div className="flex-1">
                  <div className="font-medium text-gray-800 text-sm">Team Meeting</div>
                  <div className="text-xs text-gray-500">Tomorrow, 10:00 AM</div>
                </div>
              </div>
              <div className="flex items-center p-3 bg-green-50 rounded-xl border border-green-200">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <div className="font-medium text-gray-800 text-sm">Client Call</div>
                  <div className="text-xs text-gray-500">Aug 18, 2:00 PM</div>
                </div>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default CalendarView;