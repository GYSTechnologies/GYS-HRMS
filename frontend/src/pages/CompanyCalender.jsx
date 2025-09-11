// import React, { useEffect, useState, useRef } from "react";
// import FullCalendar from "@fullcalendar/react";
// import dayGridPlugin from "@fullcalendar/daygrid";
// import interactionPlugin from "@fullcalendar/interaction";
// import axiosInstance from "../utils/axiosInstance";
// import { useAuth } from "../context/AppContext";
// import { ChevronLeft, ChevronRight, Plus, Calendar, X } from "lucide-react";

// const API_URL = "/events";

// const CompanyCalendar = () => {
//   const { user, token } = useAuth();
//   const [events, setEvents] = useState([]);
//   const [open, setOpen] = useState(false);
//   const [editingEvent, setEditingEvent] = useState(null);
//   const [formData, setFormData] = useState({
//     title: "",
//     description: "",
//     startDate: "",
//     endDate: "",
//     category: "meeting",
//   });
//   const [currentDate, setCurrentDate] = useState(new Date());
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [sidebarEvents, setSidebarEvents] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const calendarRef = useRef(null);

//   // CSS variables for colors
//   const style = `
//     :root {
//       --primary-color: #104774;
//       --primary-hover: #0d3a61;
//     }

//     .fc .fc-toolbar-title {
//       font-size: 1.25rem;
//       font-weight: 600;
//       color: #104774;
//     }

//     .fc .fc-button {
//       background-color: #104774;
//       border-color: #104774;
//     }

//     .fc .fc-button:hover {
//       background-color: #0d3a61;
//       border-color: #0d3a61;
//     }

//     .fc .fc-daygrid-day.fc-day-today {
//       background-color: #f0f9ff;
//     }

//     .fc-event {
//       border-radius: 4px;
//       border: none;
//       padding: 2px 4px;
//       font-size: 0.8rem;
//       cursor: pointer;
//     }

//     .fc-daygrid-day-frame {
//       cursor: pointer;
//     }

//     .fc-event-title {
//       font-weight: 500;
//     }

//     .fc-event-description {
//       font-size: 0.7rem;
//       opacity: 0.8;
//       margin-top: 2px;
//     }
//   `;

//   // fetch events
//   const fetchEvents = async () => {
//     try {
//       setLoading(true);
//       const res = await axiosInstance.get(API_URL, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       const formattedEvents = res.data.events.map((e) => {
//         // Fix: For multi-day events, adjust end date for FullCalendar
//         let endDate = e.endDate;
//         if (e.endDate && e.endDate !== e.startDate) {
//           const end = new Date(e.endDate);
//           end.setDate(end.getDate() + 1); // Add one day to make it inclusive
//           endDate = end.toISOString().split("T")[0];
//         }

//         return {
//           id: e._id,
//           title: e.title,
//           start: e.startDate,
//           end: endDate,
//           extendedProps: {
//             description: e.description,
//             category: e.category || "meeting",
//             originalEndDate: e.endDate, // Store original for editing
//           },
//           color: getEventColor(e.category || "meeting"),
//           display: "auto",
//         };
//       });

//       setEvents(formattedEvents);
//       updateSidebarEvents(selectedDate, formattedEvents);
//     } catch (err) {
//       console.error(err.response?.data || err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchEvents();
//   }, []);

//   // Get event color based on category
//   const getEventColor = (category) => {
//     switch (category) {
//       case "meeting":
//         return "#104774";
//       case "deadline":
//         return "#ef4444";
//       case "event":
//         return "#8b5cf6";
//       case "leave":
//         return "#f97316";
//       case "holiday":
//         return "#10b981";
//       default:
//         return "#6b7280";
//     }
//   };

//   // Get event background color for sidebar
//   const getEventBgColor = (category) => {
//     switch (category) {
//       case "meeting":
//         return "bg-blue-50 border-blue-200";
//       case "deadline":
//         return "bg-red-50 border-red-200";
//       case "event":
//         return "bg-purple-50 border-purple-200";
//       case "leave":
//         return "bg-orange-50 border-orange-200";
//       case "holiday":
//         return "bg-green-50 border-green-200";
//       default:
//         return "bg-gray-50 border-gray-200";
//     }
//   };

//   // Update sidebar events when date changes - FIXED for multi-day events
//   const updateSidebarEvents = (date, eventsList = events) => {
//     const selectedDateStr = date.toISOString().split("T")[0];

//     const selectedDateEvents = eventsList.filter((event) => {
//       const eventStart = new Date(event.start);
//       const eventStartStr = eventStart.toISOString().split("T")[0];

//       // If event has end date, check if selected date is within range
//       if (event.end) {
//         const eventEnd = new Date(event.end);
//         eventEnd.setDate(eventEnd.getDate() - 1); // Subtract one day to get actual end date
//         const eventEndStr = eventEnd.toISOString().split("T")[0];

//         return (
//           selectedDateStr >= eventStartStr && selectedDateStr <= eventEndStr
//         );
//       }

//       // If no end date, check if it's exactly the same day
//       return selectedDateStr === eventStartStr;
//     });

//     setSidebarEvents(selectedDateEvents);
//   };

//   // Handle date click - show events for that date in sidebar
//   const handleDateClick = (arg) => {
//     const clickedDate = new Date(arg.dateStr);
//     setSelectedDate(clickedDate);
//     updateSidebarEvents(clickedDate);
//   };

//   // Handle event click - edit existing event
//   const handleEventClick = (clickInfo) => {
//     if (user.role === "employee") return;

//     const event = clickInfo.event;
//     let endDate = event.extendedProps.originalEndDate || event.startStr;

//     setEditingEvent(event);
//     setFormData({
//       title: event.title,
//       description: event.extendedProps?.description || "",
//       startDate: event.startStr,
//       endDate: endDate,
//       category: event.extendedProps?.category || "meeting",
//     });
//     setOpen(true);
//   };

//   // Handle add new event button click
//   const handleAddEvent = () => {
//     setEditingEvent(null);
//     setFormData({
//       title: "",
//       description: "",
//       startDate: selectedDate.toISOString().split("T")[0],
//       endDate: selectedDate.toISOString().split("T")[0],
//       category: "meeting",
//     });
//     setOpen(true);
//   };

//   // Format date for display
//   const formatDate = (date) => {
//     return date.toLocaleDateString("en-US", {
//       weekday: "long",
//       month: "long",
//       day: "numeric",
//       year: "numeric",
//     });
//   };

//   // Save event (create or update)
//   const handleSave = async () => {
//     try {
//       const payload = {
//         title: formData.title,
//         description: formData.description,
//         startDate: formData.startDate,
//         endDate:
//           formData.endDate !== formData.startDate
//             ? formData.endDate
//             : undefined,
//         category: formData.category,
//       };

//       if (editingEvent) {
//         await axiosInstance.put(`${API_URL}/${editingEvent.id}`, payload, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//       } else {
//         await axiosInstance.post(API_URL, payload, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//       }
//       setOpen(false);
//       fetchEvents();
//     } catch (err) {
//       console.error(err.response?.data || err.message);
//     }
//   };

//   // Delete event
//   const handleDelete = async () => {
//     if (!editingEvent) return;
//     try {
//       await axiosInstance.delete(`${API_URL}/${editingEvent.id}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setOpen(false);
//       fetchEvents();
//     } catch (err) {
//       console.error(err.response?.data || err.message);
//     }
//   };

//   // Navigate calendar months
//   const handlePrevMonth = () => {
//     if (calendarRef.current) {
//       const calendarApi = calendarRef.current.getApi();
//       calendarApi.prev();
//       setCurrentDate(new Date(calendarApi.getDate()));
//     }
//   };

//   const handleNextMonth = () => {
//     if (calendarRef.current) {
//       const calendarApi = calendarRef.current.getApi();
//       calendarApi.next();
//       setCurrentDate(new Date(calendarApi.getDate()));
//     }
//   };

//   // Custom event content renderer
//   const renderEventContent = (eventInfo) => {
//     return (
//       <div className="fc-event-content">
//         <div className="fc-event-title">{eventInfo.event.title}</div>
//         {eventInfo.event.extendedProps.description && (
//           <div className="fc-event-description">
//             {eventInfo.event.extendedProps.description.length > 20
//               ? `${eventInfo.event.extendedProps.description.substring(
//                   0,
//                   20
//                 )}...`
//               : eventInfo.event.extendedProps.description}
//           </div>
//         )}
//       </div>
//     );
//   };

//   // Get events count by category
//   const getEventsCountByCategory = () => {
//     const counts = {
//       meeting: 0,
//       deadline: 0,
//       event: 0,
//       leave: 0,
//       holiday: 0,
//     };

//     events.forEach((event) => {
//       const category = event.extendedProps?.category || "meeting";
//       if (counts.hasOwnProperty(category)) {
//         counts[category]++;
//       }
//     });

//     return counts;
//   };

//   const eventsCount = getEventsCountByCategory();

//   return (
//     <div className="space-y-8">
//       {/* Add style tag with CSS variables */}
//       <style>{style}</style>

//       {/* Header */}
//       <div className="flex items-center justify-between ">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-800">Company Calendar</h1>
//           <p className="text-gray-500 text-sm mt-1">
//             Manage company events and schedules
//           </p>
//         </div>
//         {user.role !== "employee" && (
//           <button
//             onClick={handleAddEvent}
//             className="flex items-center bg-[#104774] text-white px-4 py-2 rounded-xl hover:bg-[#0d3a61] transition-all duration-200"
//           >
//             <Plus size={18} className="mr-2" />
//             Add Event
//           </button>
//         )}
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         {/* Main Calendar */}
//         <div className="lg:col-span-2">
//           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//             {/* Calendar Header */}
//             <div className="bg-[#104774] p-6 text-white">
//               <div className="flex justify-between items-center">
//                 <button
//                   onClick={handlePrevMonth}
//                   className="p-2 hover:bg-[#0d3a61] rounded-lg transition-colors"
//                 >
//                   <ChevronLeft size={24} />
//                 </button>
//                 <div className="text-center">
//                   <h2 className="text-xl font-semibold">
//                     {currentDate.toLocaleDateString("en-US", {
//                       month: "long",
//                       year: "numeric",
//                     })}
//                   </h2>
//                   <p className="text-blue-100 text-sm">
//                     Click on any date to view events
//                   </p>
//                 </div>
//                 <button
//                   onClick={handleNextMonth}
//                   className="p-2 hover:bg-[#0d3a61] rounded-lg transition-colors"
//                 >
//                   <ChevronRight size={24} />
//                 </button>
//               </div>
//             </div>

//             <div className="p-4">
//               <FullCalendar
//                 ref={calendarRef}
//                 plugins={[dayGridPlugin, interactionPlugin]}
//                 initialView="dayGridMonth"
//                 events={events}
//                 dateClick={handleDateClick}
//                 eventClick={handleEventClick}
//                 height="auto"
//                 headerToolbar={false}
//                 initialDate={currentDate}
//                 datesSet={(dateInfo) =>
//                   setCurrentDate(new Date(dateInfo.view.currentStart))
//                 }
//                 eventContent={renderEventContent}
//                 dayMaxEvents={3}
//               />
//             </div>
//           </div>
//         </div>

//         {/* Sidebar */}
//         <div className="space-y-6">
//           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
//             <div className="flex items-center justify-between mb-4">
//               <div className="flex items-center">
//                 <Calendar size={24} className="text-[#104774] mr-3" />
//                 <h3 className="text-lg font-semibold text-gray-800">
//                   {formatDate(selectedDate)}
//                 </h3>
//               </div>
//               {user.role !== "employee" && sidebarEvents.length > 0 && (
//                 <button
//                   onClick={handleAddEvent}
//                   className="text-[#104774] text-sm hover:text-[#0d3a61]"
//                 >
//                   + Add Event
//                 </button>
//               )}
//             </div>

//             {sidebarEvents.length > 0 ? (
//               <div className="space-y-3">
//                 {sidebarEvents.map((event, idx) => {
//                   const eventStart = new Date(event.start);
//                   const eventEnd = event.end ? new Date(event.end) : null;
//                   if (eventEnd) eventEnd.setDate(eventEnd.getDate() - 1); // Adjust for display

//                   return (
//                     <div
//                       key={idx}
//                       className={`p-4 rounded-xl border ${getEventBgColor(
//                         event.extendedProps?.category || "meeting"
//                       )} ${
//                         user.role !== "employee"
//                           ? "cursor-pointer hover:shadow-md transition-shadow"
//                           : ""
//                       }`}
//                       onClick={() => {
//                         if (user.role !== "employee") {
//                           setEditingEvent(event);
//                           setFormData({
//                             title: event.title,
//                             description: event.extendedProps?.description || "",
//                             startDate: event.start,
//                             endDate:
//                               event.extendedProps.originalEndDate ||
//                               event.start,
//                             category:
//                               event.extendedProps?.category || "meeting",
//                           });
//                           setOpen(true);
//                         }
//                       }}
//                     >
//                       <div className="flex items-start justify-between">
//                         <div className="flex-1">
//                           <h4 className="font-semibold text-gray-800">
//                             {event.title}
//                           </h4>
//                           {event.extendedProps?.description && (
//                             <p className="text-sm text-gray-500 mt-2">
//                               {event.extendedProps.description}
//                             </p>
//                           )}
//                           <div className="text-xs text-gray-400 mt-2">
//                             {eventStart.toLocaleDateString()}
//                             {eventEnd &&
//                               eventEnd > eventStart &&
//                               ` to ${eventEnd.toLocaleDateString()}`}
//                           </div>
//                         </div>
//                         <div
//                           className={`w-3 h-3 rounded-full ml-2 flex-shrink-0`}
//                           style={{
//                             backgroundColor: getEventColor(
//                               event.extendedProps?.category || "meeting"
//                             ),
//                           }}
//                         ></div>
//                       </div>
//                       {user.role !== "employee" && (
//                         <div className="text-xs text-[#104774] mt-2">
//                           Click to edit
//                         </div>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>
//             ) : (
//               <div className="text-center py-8">
//                 <Calendar size={48} className="text-gray-300 mx-auto mb-3" />
//                 <p className="text-gray-500">No events scheduled</p>
//                 {user.role !== "employee" && (
//                   <button
//                     onClick={handleAddEvent}
//                     className="text-[#104774] text-sm mt-2 hover:text-[#0d3a61]"
//                   >
//                     + Add Event
//                   </button>
//                 )}
//               </div>
//             )}
//           </div>

//   <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
//     <h3 className="text-lg font-semibold text-gray-800 mb-4">Events Summary</h3>
//     <div className="space-y-4">
//       <div className="flex items-center justify-between">
//         <div className="flex items-center">
//           <div className="w-3 h-3 bg-[#104774] rounded-full mr-3"></div>
//           <span className="text-sm text-gray-600">Meetings</span>
//         </div>
//         <span className="font-semibold text-gray-800">{eventsCount.meeting}</span>
//       </div>
//       <div className="flex items-center justify-between">
//         <div className="flex items-center">
//           <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
//           <span className="text-sm text-gray-600">Deadlines</span>
//         </div>
//         <span className="font-semibold text-gray-800">{eventsCount.deadline}</span>
//       </div>
//       <div className="flex items-center justify-between">
//         <div className="flex items-center">
//           <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
//           <span className="text-sm text-gray-600">Events</span>
//         </div>
//         <span className="font-semibold text-gray-800">{eventsCount.event}</span>
//       </div>
//       <div className="flex items-center justify-between">
//         <div className="flex items-center">
//           <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
//           <span className="text-sm text-gray-600">Leave Days</span>
//         </div>
//         <span className="font-semibold text-gray-800">{eventsCount.leave}</span>
//       </div>
//       <div className="flex items-center justify-between">
//         <div className="flex items-center">
//           <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
//           <span className="text-sm text-gray-600">Holidays</span>
//         </div>
//         <span className="font-semibold text-gray-800">{eventsCount.holiday}</span>
//       </div>
//     </div>
//   </div>
//         </div>
//       </div>

//       {/* Modal */}
//       {open && (
//         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-2xl shadow-lg w-full max-w-md">
//             <div className="flex justify-between items-center p-6 border-b">
//               <h3 className="text-lg font-semibold text-gray-800">
//                 {editingEvent ? "Edit Event" : "Add Event"}
//               </h3>
//               <button
//                 onClick={() => setOpen(false)}
//                 className="text-gray-400 hover:text-gray-600"
//               >
//                 <X size={20} />
//               </button>
//             </div>

//             <div className="p-6 space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Event Title
//                 </label>
//                 <input
//                   type="text"
//                   placeholder="Enter event title"
//                   value={formData.title}
//                   onChange={(e) =>
//                     setFormData({ ...formData, title: e.target.value })
//                   }
//                   className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#104774] focus:border-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Description
//                 </label>
//                 <textarea
//                   placeholder="Enter event description"
//                   value={formData.description}
//                   onChange={(e) =>
//                     setFormData({ ...formData, description: e.target.value })
//                   }
//                   rows={3}
//                   className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#104774] focus:border-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Category
//                 </label>
//                 <select
//                   value={formData.category}
//                   onChange={(e) =>
//                     setFormData({ ...formData, category: e.target.value })
//                   }
//                   className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#104774] focus:border-transparent"
//                 >
//                   <option value="meeting">Meeting</option>
//                   <option value="deadline">Deadline</option>
//                   <option value="event">Company Event</option>
//                   <option value="leave">Leave Day</option>
//                   <option value="holiday">Holiday</option>
//                 </select>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Start Date
//                   </label>
//                   <input
//                     type="date"
//                     value={
//                       formData.startDate ? formData.startDate.slice(0, 10) : ""
//                     }
//                     onChange={(e) =>
//                       setFormData({ ...formData, startDate: e.target.value })
//                     }
//                     className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#104774] focus:border-transparent"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     End Date (optional)
//                   </label>
//                   <input
//                     type="date"
//                     value={
//                       formData.endDate ? formData.endDate.slice(0, 10) : ""
//                     }
//                     onChange={(e) =>
//                       setFormData({ ...formData, endDate: e.target.value })
//                     }
//                     className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#104774] focus:border-transparent"
//                   />
//                 </div>
//               </div>
//             </div>

//             <div className="flex justify-end gap-3 p-6 border-t">
//               <button
//                 onClick={() => setOpen(false)}
//                 className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
//               >
//                 Cancel
//               </button>
//               {editingEvent && (
//                 <button
//                   onClick={handleDelete}
//                   className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
//                 >
//                   Delete
//                 </button>
//               )}
//               <button
//                 onClick={handleSave}
//                 className="px-4 py-2 bg-[#104774] text-white rounded-lg hover:bg-[#0d3a61]"
//               >
//                 {editingEvent ? "Update" : "Save"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CompanyCalendar;

//---------working code------------------------
// import React, { useEffect, useState, useRef } from "react";
// import FullCalendar from "@fullcalendar/react";
// import dayGridPlugin from "@fullcalendar/daygrid";
// import interactionPlugin from "@fullcalendar/interaction";
// import axiosInstance from "../utils/axiosInstance";
// import { useAuth } from "../context/AppContext";
// import { ChevronLeft, ChevronRight, Plus, Calendar, X } from "lucide-react";

// const API_URL = "/events";

// const CompanyCalendar = () => {
//   const { user, token } = useAuth();
//   const [events, setEvents] = useState([]);
//   const [open, setOpen] = useState(false);
//   const [editingEvent, setEditingEvent] = useState(null);
//   const [formData, setFormData] = useState({
//     title: "",
//     description: "",
//     startDate: "",
//     endDate: "",
//     category: "meeting",
//   });
//   const [currentDate, setCurrentDate] = useState(new Date());
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [sidebarEvents, setSidebarEvents] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const calendarRef = useRef(null);

//   // CSS variables for colors
//   const style = `
//     :root {
//       --primary-color: #104774;
//       --primary-hover: #0d3a61;
//       --sunday-bg-color: #fff5f5;
//       --sunday-text-color: #e53e3e;
//     }

//     .fc .fc-toolbar-title {
//       font-size: 1.25rem;
//       font-weight: 600;
//       color: #104774;
//     }

//     .fc .fc-button {
//       background-color: #104774;
//       border-color: #104774;
//     }

//     .fc .fc-button:hover {
//       background-color: #0d3a61;
//       border-color: #0d3a61;
//     }

//     .fc .fc-daygrid-day.fc-day-today {
//       background-color: #f0f9ff;
//     }

//     .fc .fc-day-sun {
//       background-color: var(--sunday-bg-color);
//     }

//     .fc .fc-day-sun .fc-daygrid-day-number {
//       color: var(--sunday-text-color);
//       font-weight: 600;
//     }

//     .fc-event {
//       border-radius: 4px;
//       border: none;
//       padding: 2px 4px;
//       font-size: 0.8rem;
//       cursor: pointer;
//     }

//     .fc-daygrid-day-frame {
//       cursor: pointer;
//     }

//     .fc-event-title {
//       font-weight: 500;
//     }

//     .fc-event-description {
//       font-size: 0.7rem;
//       opacity: 0.8;
//       margin-top: 2px;
//     }
//   `;

//   // Check if a date is Sunday
//   const isSunday = (date) => {
//     return date.getDay() === 0;
//   };

//   // Create a holiday event object for Sunday
//   const createSundayHolidayEvent = (date) => {
//     const dateStr = date.toISOString().split("T")[0];
//     return {
//       id: `sunday-${dateStr}`,
//       title: "Sunday Holiday",
//       start: dateStr,
//       extendedProps: {
//         description: "Weekly holiday",
//         category: "holiday",
//         isSundayHoliday: true
//       },
//       color: getEventColor("holiday"),
//       display: "auto",
//     };
//   };

//   // fetch events
//   const fetchEvents = async () => {
//     try {
//       setLoading(true);
//       const res = await axiosInstance.get(API_URL, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       const formattedEvents = res.data.events.map((e) => {
//         // Fix: For multi-day events, adjust end date for FullCalendar
//         let endDate = e.endDate;
//         if (e.endDate && e.endDate !== e.startDate) {
//           const end = new Date(e.endDate);
//           end.setDate(end.getDate() + 1); // Add one day to make it inclusive
//           endDate = end.toISOString().split("T")[0];
//         }

//         return {
//           id: e._id,
//           title: e.title,
//           start: e.startDate,
//           end: endDate,
//           extendedProps: {
//             description: e.description,
//             category: e.category || "meeting",
//             originalEndDate: e.endDate, // Store original for editing
//             isSundayHoliday: false
//           },
//           color: getEventColor(e.category || "meeting"),
//           display: "auto",
//         };
//       });

//       setEvents(formattedEvents);
//       updateSidebarEvents(selectedDate, formattedEvents);
//     } catch (err) {
//       console.error(err.response?.data || err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchEvents();
//   }, []);

//   // Get event color based on category
//   const getEventColor = (category) => {
//     switch (category) {
//       case "meeting":
//         return "#104774";
//       case "deadline":
//         return "#ef4444";
//       case "event":
//         return "#8b5cf6";
//       case "leave":
//         return "#f97316";
//       case "holiday":
//         return "#10b981";
//       default:
//         return "#6b7280";
//     }
//   };

//   // Get event background color for sidebar
//   const getEventBgColor = (category) => {
//     switch (category) {
//       case "meeting":
//         return "bg-blue-50 border-blue-200";
//       case "deadline":
//         return "bg-red-50 border-red-200";
//       case "event":
//         return "bg-purple-50 border-purple-200";
//       case "leave":
//         return "bg-orange-50 border-orange-200";
//       case "holiday":
//         return "bg-green-50 border-green-200";
//       default:
//         return "bg-gray-50 border-gray-200";
//     }
//   };

//   // Update sidebar events when date changes - FIXED for multi-day events
//   const updateSidebarEvents = (date, eventsList = events) => {
//     const selectedDateStr = date.toISOString().split("T")[0];
//     const isSelectedDateSunday = isSunday(date);

//     const selectedDateEvents = eventsList.filter((event) => {
//       const eventStart = new Date(event.start);
//       const eventStartStr = eventStart.toISOString().split("T")[0];

//       // If event has end date, check if selected date is within range
//       if (event.end) {
//         const eventEnd = new Date(event.end);
//         eventEnd.setDate(eventEnd.getDate() - 1); // Subtract one day to get actual end date
//         const eventEndStr = eventEnd.toISOString().split("T")[0];

//         return (
//           selectedDateStr >= eventStartStr && selectedDateStr <= eventEndStr
//         );
//       }

//       // If no end date, check if it's exactly the same day
//       return selectedDateStr === eventStartStr;
//     });

//     // Add Sunday holiday event if the selected date is Sunday
//     if (isSelectedDateSunday) {
//       // Check if there's already a holiday event for this Sunday
//       const hasExistingHoliday = selectedDateEvents.some(
//         event => event.extendedProps?.isSundayHoliday
//       );

//       if (!hasExistingHoliday) {
//         selectedDateEvents.push(createSundayHolidayEvent(date));
//       }
//     }

//     setSidebarEvents(selectedDateEvents);
//   };

//   // Handle date click - show events for that date in sidebar
//   const handleDateClick = (arg) => {
//     const clickedDate = new Date(arg.dateStr);
//     setSelectedDate(clickedDate);
//     updateSidebarEvents(clickedDate);
//   };

//   // Handle event click - edit existing event
//   const handleEventClick = (clickInfo) => {
//     if (user.role === "employee") return;

//     // Don't allow editing of Sunday holiday events
//     if (clickInfo.event.extendedProps?.isSundayHoliday) return;

//     const event = clickInfo.event;
//     let endDate = event.extendedProps.originalEndDate || event.startStr;

//     setEditingEvent(event);
//     setFormData({
//       title: event.title,
//       description: event.extendedProps?.description || "",
//       startDate: event.startStr,
//       endDate: endDate,
//       category: event.extendedProps?.category || "meeting",
//     });
//     setOpen(true);
//   };

//   // Handle add new event button click
//   const handleAddEvent = () => {
//     setEditingEvent(null);
//     setFormData({
//       title: "",
//       description: "",
//       startDate: selectedDate.toISOString().split("T")[0],
//       endDate: selectedDate.toISOString().split("T")[0],
//       category: "meeting",
//     });
//     setOpen(true);
//   };

//   // Format date for display
//   const formatDate = (date) => {
//     return date.toLocaleDateString("en-US", {
//       weekday: "long",
//       month: "long",
//       day: "numeric",
//       year: "numeric",
//     });
//   };

//   // Save event (create or update)
//   const handleSave = async () => {
//     try {
//       const payload = {
//         title: formData.title,
//         description: formData.description,
//         startDate: formData.startDate,
//         endDate:
//           formData.endDate !== formData.startDate
//             ? formData.endDate
//             : undefined,
//         category: formData.category,
//       };

//       if (editingEvent) {
//         await axiosInstance.put(`${API_URL}/${editingEvent.id}`, payload, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//       } else {
//         await axiosInstance.post(API_URL, payload, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//       }
//       setOpen(false);
//       fetchEvents();
//     } catch (err) {
//       console.error(err.response?.data || err.message);
//     }
//   };

//   // Delete event
//   const handleDelete = async () => {
//     if (!editingEvent) return;
//     try {
//       await axiosInstance.delete(`${API_URL}/${editingEvent.id}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setOpen(false);
//       fetchEvents();
//     } catch (err) {
//       console.error(err.response?.data || err.message);
//     }
//   };

//   // Navigate calendar months
//   const handlePrevMonth = () => {
//     if (calendarRef.current) {
//       const calendarApi = calendarRef.current.getApi();
//       calendarApi.prev();
//       setCurrentDate(new Date(calendarApi.getDate()));
//     }
//   };

//   const handleNextMonth = () => {
//     if (calendarRef.current) {
//       const calendarApi = calendarRef.current.getApi();
//       calendarApi.next();
//       setCurrentDate(new Date(calendarApi.getDate()));
//     }
//   };

//   // Custom event content renderer
//   const renderEventContent = (eventInfo) => {
//     // Don't render content for Sunday holiday events
//     if (eventInfo.event.extendedProps?.isSundayHoliday) {
//       return null;
//     }

//     return (
//       <div className="fc-event-content">
//         <div className="fc-event-title">{eventInfo.event.title}</div>
//         {eventInfo.event.extendedProps.description && (
//           <div className="fc-event-description">
//             {eventInfo.event.extendedProps.description.length > 20
//               ? `${eventInfo.event.extendedProps.description.substring(
//                   0,
//                   20
//                 )}...`
//               : eventInfo.event.extendedProps.description}
//           </div>
//         )}
//       </div>
//     );
//   };

//   // Custom day cell content renderer to add Sunday indicator
//   const dayCellContent = (cellInfo) => {
//     const date = new Date(cellInfo.date);
//     const isSun = isSunday(date);

//     return (
//       <div className="fc-daygrid-day-frame">
//         <div className="fc-daygrid-day-top">
//           <div className={`fc-daygrid-day-number ${isSun ? 'text-red-600 font-bold' : ''}`}>
//             {cellInfo.dayNumberText}
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="space-y-8">
//       {/* Add style tag with CSS variables */}
//       <style>{style}</style>

//       {/* Header */}
//       <div className="flex items-center justify-between ">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-800">Company Calendar</h1>
//           <p className="text-gray-500 text-sm mt-1">
//             Manage company events and schedules
//           </p>
//         </div>
//         {user.role !== "employee" && (
//           <button
//             onClick={handleAddEvent}
//             className="flex items-center bg-[#104774] text-white px-4 py-2 rounded-xl hover:bg-[#0d3a61] transition-all duration-200"
//           >
//             <Plus size={18} className="mr-2" />
//             Add Event
//           </button>
//         )}
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         {/* Main Calendar */}
//         <div className="lg:col-span-2">
//           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//             {/* Calendar Header */}
//             <div className="bg-[#104774] p-6 text-white">
//               <div className="flex justify-between items-center">
//                 <button
//                   onClick={handlePrevMonth}
//                   className="p-2 hover:bg-[#0d3a61] rounded-lg transition-colors"
//                 >
//                   <ChevronLeft size={24} />
//                 </button>
//                 <div className="text-center">
//                   <h2 className="text-xl font-semibold">
//                     {currentDate.toLocaleDateString("en-US", {
//                       month: "long",
//                       year: "numeric",
//                     })}
//                   </h2>
//                   <p className="text-blue-100 text-sm">
//                     Click on any date to view events
//                   </p>
//                 </div>
//                 <button
//                   onClick={handleNextMonth}
//                   className="p-2 hover:bg-[#0d3a61] rounded-lg transition-colors"
//                 >
//                   <ChevronRight size={24} />
//                 </button>
//               </div>
//             </div>

//             <div className="">
//               <FullCalendar
//                 ref={calendarRef}
//                 plugins={[dayGridPlugin, interactionPlugin]}
//                 initialView="dayGridMonth"
//                 events={events}
//                 dateClick={handleDateClick}
//                 eventClick={handleEventClick}
//                 height="auto"
//                 headerToolbar={false}
//                 initialDate={currentDate}
//                 datesSet={(dateInfo) =>
//                   setCurrentDate(new Date(dateInfo.view.currentStart))
//                 }
//                 eventContent={renderEventContent}
//                 dayCellContent={dayCellContent}
//                 dayMaxEvents={3}
//               />
//             </div>
//           </div>
//         </div>

//         {/* Sidebar */}
//         <div className="space-y-6">
//           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
//             <div className="flex items-center justify-between mb-4">
//               <div className="flex items-center">
//                 <Calendar size={24} className="text-[#104774] mr-3" />
//                 <h3 className="text-lg font-semibold text-gray-800">
//                   {formatDate(selectedDate)}
//                   {isSunday(selectedDate) && (
//                     <span className="ml-2 text-red-600 text-sm font-normal">(Holiday)</span>
//                   )}
//                 </h3>
//               </div>
//               {user.role !== "employee" && sidebarEvents.length > 0 && (
//                 <button
//                   onClick={handleAddEvent}
//                   className="text-[#104774] text-sm hover:text-[#0d3a61]"
//                 >
//                   + Add Event
//                 </button>
//               )}
//             </div>

//             {sidebarEvents.length > 0 ? (
//               <div className="space-y-3">
//                 {sidebarEvents.map((event, idx) => {
//                   const eventStart = new Date(event.start);
//                   const eventEnd = event.end ? new Date(event.end) : null;
//                   if (eventEnd) eventEnd.setDate(eventEnd.getDate() - 1); // Adjust for display

//                   return (
//                     <div
//                       key={idx}
//                       className={`p-4 rounded-xl border ${getEventBgColor(
//                         event.extendedProps?.category || "meeting"
//                       )} ${
//                         user.role !== "employee" && !event.extendedProps?.isSundayHoliday
//                           ? "cursor-pointer hover:shadow-md transition-shadow"
//                           : ""
//                       }`}
//                       onClick={() => {
//                         if (user.role !== "employee" && !event.extendedProps?.isSundayHoliday) {
//                           setEditingEvent(event);
//                           setFormData({
//                             title: event.title,
//                             description: event.extendedProps?.description || "",
//                             startDate: event.start,
//                             endDate:
//                               event.extendedProps.originalEndDate ||
//                               event.start,
//                             category:
//                               event.extendedProps?.category || "meeting",
//                           });
//                           setOpen(true);
//                         }
//                       }}
//                     >
//                       <div className="flex items-start justify-between">
//                         <div className="flex-1">
//                           <h4 className="font-semibold text-gray-800">
//                             {event.title}
//                             {/* {event.extendedProps?.isSundayHoliday && (
//                               <span className="ml-2 text-green-600 text-xs font-normal">(Auto-generated)</span>
//                             )} */}
//                           </h4>
//                           {event.extendedProps?.description && (
//                             <p className="text-sm text-gray-500 mt-2">
//                               {event.extendedProps.description}
//                             </p>
//                           )}
//                           <div className="text-xs text-gray-400 mt-2">
//                             {eventStart.toLocaleDateString()}
//                             {eventEnd &&
//                               eventEnd > eventStart &&
//                               ` to ${eventEnd.toLocaleDateString()}`}
//                           </div>
//                         </div>
//                         <div
//                           className={`w-3 h-3 rounded-full ml-2 flex-shrink-0`}
//                           style={{
//                             backgroundColor: getEventColor(
//                               event.extendedProps?.category || "meeting"
//                             ),
//                           }}
//                         ></div>
//                       </div>
//                       {user.role !== "employee" && !event.extendedProps?.isSundayHoliday && (
//                         <div className="text-xs text-[#104774] mt-2">
//                           Click to edit
//                         </div>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>
//             ) : (
//               <div className="text-center py-8">
//                 <Calendar size={48} className="text-gray-300 mx-auto mb-3" />
//                 <p className="text-gray-500">No events scheduled</p>
//                 {user.role !== "employee" && (
//                   <button
//                     onClick={handleAddEvent}
//                     className="text-[#104774] text-sm mt-2 hover:text-[#0d3a61]"
//                   >
//                     + Add Event
//                   </button>
//                 )}
//               </div>
//             )}
//           </div>

//         </div>
//       </div>

//       {/* Modal */}
//       {open && (
//         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-2xl shadow-lg w-full max-w-md">
//             <div className="flex justify-between items-center p-6 border-b">
//               <h3 className="text-lg font-semibold text-gray-800">
//                 {editingEvent ? "Edit Event" : "Add Event"}
//               </h3>
//               <button
//                 onClick={() => setOpen(false)}
//                 className="text-gray-400 hover:text-gray-600"
//               >
//                 <X size={20} />
//               </button>
//             </div>

//             <div className="p-6 space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Event Title
//                 </label>
//                 <input
//                   type="text"
//                   placeholder="Enter event title"
//                   value={formData.title}
//                   onChange={(e) =>
//                     setFormData({ ...formData, title: e.target.value })
//                   }
//                   className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#104774] focus:border-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Description
//                 </label>
//                 <textarea
//                   placeholder="Enter event description"
//                   value={formData.description}
//                   onChange={(e) =>
//                     setFormData({ ...formData, description: e.target.value })
//                   }
//                   rows={3}
//                   className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#104774] focus:border-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Category
//                 </label>
//                 <select
//                   value={formData.category}
//                   onChange={(e) =>
//                     setFormData({ ...formData, category: e.target.value })
//                   }
//                   className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#104774] focus:border-transparent"
//                 >
//                   <option value="meeting">Meeting</option>
//                   <option value="deadline">Deadline</option>
//                   <option value="event">Company Event</option>
//                   <option value="leave">Leave Day</option>
//                   <option value="holiday">Holiday</option>
//                 </select>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Start Date
//                   </label>
//                   <input
//                     type="date"
//                     value={
//                       formData.startDate ? formData.startDate.slice(0, 10) : ""
//                     }
//                     onChange={(e) =>
//                       setFormData({ ...formData, startDate: e.target.value })
//                     }
//                     className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#104774] focus:border-transparent"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     End Date (optional)
//                   </label>
//                   <input
//                     type="date"
//                     value={
//                       formData.endDate ? formData.endDate.slice(0, 10) : ""
//                     }
//                     onChange={(e) =>
//                       setFormData({ ...formData, endDate: e.target.value })
//                     }
//                     className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#104774] focus:border-transparent"
//                   />
//                 </div>
//               </div>
//             </div>

//             <div className="flex justify-end gap-3 p-6 border-t">
//               <button
//                 onClick={() => setOpen(false)}
//                 className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
//               >
//                 Cancel
//               </button>
//               {editingEvent && (
//                 <button
//                   onClick={handleDelete}
//                   className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
//                 >
//                   Delete
//                 </button>
//               )}
//               <button
//                 onClick={handleSave}
//                 className="px-4 py-2 bg-[#104774] text-white rounded-lg hover:bg-[#0d3a61]"
//               >
//                 {editingEvent ? "Update" : "Save"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CompanyCalendar;



// //google calender api integrate code
// import React, { useEffect, useState, useRef } from "react";
// import FullCalendar from "@fullcalendar/react";
// import dayGridPlugin from "@fullcalendar/daygrid";
// import interactionPlugin from "@fullcalendar/interaction";
// import axiosInstance from "../utils/axiosInstance";
// import { useAuth } from "../context/AppContext";
// import { ChevronLeft, ChevronRight, Plus, Calendar, X } from "lucide-react";

// const API_URL = "/events";

// const CompanyCalendar = () => {
//   const { user, token } = useAuth();
//   const [events, setEvents] = useState([]);
//   const [holidayEvents, setHolidayEvents] = useState([]);
//   const [fetchedHolidayYears, setFetchedHolidayYears] = useState({});
//   const [open, setOpen] = useState(false);
//   const [editingEvent, setEditingEvent] = useState(null);
//   const [formData, setFormData] = useState({
//     title: "",
//     description: "",
//     startDate: "",
//     endDate: "",
//     category: "meeting",
//   });
//   const [currentDate, setCurrentDate] = useState(new Date());
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [sidebarEvents, setSidebarEvents] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const calendarRef = useRef(null);

//   // CSS variables for colors
//   // const style = `
//   //   :root {
//   //     --primary-color: #104774;
//   //     --primary-hover: #0d3a61;
//   //     --sunday-bg-color: #fff5f5;
//   //     --sunday-text-color: #e53e3e;
//   //   }

//   //   .fc .fc-toolbar-title {
//   //     font-size: 1.25rem;
//   //     font-weight: 600;
//   //     color: #104774;
//   //   }

//   //   .fc .fc-button {
//   //     background-color: #104774;
//   //     border-color: #104774;
//   //   }

//   //   .fc .fc-button:hover {
//   //     background-color: #0d3a61;
//   //     border-color: #0d3a61;
//   //   }

//   //   .fc .fc-daygrid-day.fc-day-today {
//   //     background-color: #f0f9ff;
//   //   }

//   //   .fc .fc-day-sun {
//   //     background-color: var(--sunday-bg-color);
//   //   }

//   //   .fc .fc-day-sun .fc-daygrid-day-number {
//   //     color: var(--sunday-text-color);
//   //     font-weight: 600;
//   //   }

//   //   .fc-event {
//   //     border-radius: 4px;
//   //     border: none;
//   //     padding: 2px 4px;
//   //     font-size: 0.8rem;
//   //     cursor: pointer;
//   //   }

//   //   .fc-daygrid-day-frame {
//   //     cursor: pointer;
//   //   }

//   //   .fc-event-title {
//   //     font-weight: 500;
//   //   }

//   //   .fc-event-description {
//   //     font-size: 0.7rem;
//   //     opacity: 0.8;
//   //     margin-top: 2px;
//   //   }
//   // `;
//   // CSS variables for colors
//   const style = `
//   :root {
//     --primary-color: #104774;
//     --primary-hover: #0d3a61;
//     --sunday-bg-color: #fff5f5;
//     --sunday-text-color: #e53e3e;
//   }
  
//   .fc .fc-toolbar-title {
//     font-size: 1.25rem;
//     font-weight: 600;
//     color: #104774;
//   }
  
//   .fc .fc-button {
//     background-color: #104774;
//     border-color: #104774;
//   }
  
//   .fc .fc-button:hover {
//     background-color: #0d3a61;
//     border-color: #0d3a61;
//   }
  
//   .fc .fc-daygrid-day.fc-day-today {
//     background-color: #f0f9ff;
//   }
  
//   .fc .fc-day-sun {
//     background-color: var(--sunday-bg-color);
//   }
  
//   .fc .fc-day-sun .fc-daygrid-day-number {
//     color: var(--sunday-text-color);
//     font-weight: 600;
//   }
  
//   .fc-event {
//     border-radius: 4px;
//     border: none;
//     padding: 2px 4px;
//     font-size: 0.8rem;
//     cursor: pointer;
//   }
  
//   .fc-daygrid-day-frame {
//     cursor: pointer;
//     max-height: 100px !important; /* 👈 Default se thoda kam */
//   }
  
//   .fc-event-title {
//     font-weight: 500;
//   }
  
//   .fc-event-description {
//     font-size: 0.7rem;
//     opacity: 0.8;
//     margin-top: 2px;
//   }
// `;

//   // Check if a date is Sunday
//   const isSunday = (date) => {
//     return date.getDay() === 0;
//   };

//   // Create a holiday event object for Sunday (for sidebar only)
//   const createSundayHolidayEvent = (date) => {
//     const dateStr = date.toISOString().split("T")[0];
//     return {
//       id: `sunday-${dateStr}`,
//       title: "Sunday Holiday",
//       start: dateStr,
//       extendedProps: {
//         description: "Weekly holiday",
//         category: "holiday",
//         isSundayHoliday: true,
//       },
//       color: getEventColor("holiday"),
//       display: "auto",
//       allDay: true,
//     };
//   };

//   // fetch events from backend
//   const fetchEvents = async () => {
//     try {
//       setLoading(true);
//       const res = await axiosInstance.get(API_URL, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       const formattedEvents = res.data.events.map((e) => {
//         // Fix: For multi-day events, adjust end date for FullCalendar
//         let endDate = e.endDate;
//         if (e.endDate && e.endDate !== e.startDate) {
//           const end = new Date(e.endDate);
//           end.setDate(end.getDate() + 1); // Add one day to make it inclusive in FullCalendar
//           endDate = end.toISOString().split("T")[0];
//         }

//         return {
//           id: e._id,
//           title: e.title,
//           start: e.startDate,
//           end: endDate,
//           extendedProps: {
//             description: e.description,
//             category: e.category || "meeting",
//             originalEndDate: e.endDate, // Store original for editing
//             isSundayHoliday: false,
//             isHoliday: false,
//           },
//           color: getEventColor(e.category || "meeting"),
//           display: "auto",
//           allDay: true,
//         };
//       });

//       setEvents(formattedEvents);
//       // Update sidebar using combined list (backend events + holidays)
//       updateSidebarEvents(selectedDate, [...formattedEvents, ...holidayEvents]);
//     } catch (err) {
//       console.error(err.response?.data || err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     // initial fetch of backend events
//     fetchEvents();
//     // fetch holidays for current year
//     fetchHolidaysIfNeeded(currentDate.getFullYear());
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // Get event color based on category
//   const getEventColor = (category) => {
//     switch (category) {
//       case "meeting":
//         return "#104774";
//       case "deadline":
//         return "#ef4444";
//       case "event":
//         return "#8b5cf6";
//       case "leave":
//         return "#f97316";
//       case "holiday":
//         return "#10b981";
//       default:
//         return "#6b7280";
//     }
//   };

//   // Get event background color for sidebar
//   const getEventBgColor = (category) => {
//     switch (category) {
//       case "meeting":
//         return "bg-blue-50 border-blue-200";
//       case "deadline":
//         return "bg-red-50 border-red-200";
//       case "event":
//         return "bg-purple-50 border-purple-200";
//       case "leave":
//         return "bg-orange-50 border-orange-200";
//       case "holiday":
//         return "bg-green-50 border-green-200";
//       default:
//         return "bg-gray-50 border-gray-200";
//     }
//   };

//   // Update sidebar events when date changes - now includes holidayEvents
//   const updateSidebarEvents = (date, eventsList = null) => {
//     const combined = eventsList || [...events, ...holidayEvents];
//     const selectedDateStr = date.toISOString().split("T")[0];
//     const isSelectedDateSunday = isSunday(date);

//     const selectedDateEvents = combined.filter((event) => {
//       const eventStart = new Date(event.start);
//       const eventStartStr = eventStart.toISOString().split("T")[0];

//       // If event has end date, check if selected date is within range
//       if (event.end) {
//         const eventEnd = new Date(event.end);
//         // We stored end as inclusive-excl for FullCalendar; subtract one day to get actual end
//         eventEnd.setDate(eventEnd.getDate() - 1);
//         const eventEndStr = eventEnd.toISOString().split("T")[0];

//         return (
//           selectedDateStr >= eventStartStr && selectedDateStr <= eventEndStr
//         );
//       }

//       // If no end date, check if it's exactly the same day
//       return selectedDateStr === eventStartStr;
//     });

//     // Add Sunday holiday event if the selected date is Sunday
//     if (isSelectedDateSunday) {
//       // Check if there's already a holiday event for this Sunday
//       const hasExistingHoliday = selectedDateEvents.some(
//         (event) =>
//           event.extendedProps?.isSundayHoliday || event.extendedProps?.isHoliday
//       );

//       if (!hasExistingHoliday) {
//         selectedDateEvents.push(createSundayHolidayEvent(date));
//       }
//     }

//     setSidebarEvents(selectedDateEvents);
//   };

//   // Function to determine if a holiday event is an official public holiday
//   const isPublicHoliday = (holidayEvent) => {
//     const summary = holidayEvent.summary.toLowerCase();

//     // Common indicators of public holidays in India
//     const publicHolidayIndicators = [
//       "public holiday",
//       "national holiday",
//       "gazetted holiday",
//       "bank holiday",
//       "independence day",
//       "republic day",
//       "gandhi jayanti",
//       "guru nanak jayanti",
//       "diwali",
//       "holi",
//       "eid",
//       "christmas",
//       "good friday",
//       "mahatma gandhi",
//       "republic",
//       "independence",
//       "janmashtami",
//       "dussehra",
//       "ram navami",
//       "maha shivratri",
//     ];

//     // Keywords that indicate it's NOT a public holiday (observances, festivals, etc.)
//     const nonHolidayIndicators = [
//       "observance",
//       "observances",
//       "festival",
//       "festivals",
//       "optional holiday",
//       "restricted holiday",
//       "eve",
//       "beginning",
//       "ends",
//       "monthly",
//       "week",
//       "daylight saving",
//       "season",
//       "solstice",
//       "equinox",
//       "fasting",
//       "vrat",
//       "puja",
//       "parva",
//     ];

//     // Check if it contains public holiday indicators
//     const isPublicHoliday = publicHolidayIndicators.some((indicator) =>
//       summary.includes(indicator)
//     );

//     // Check if it contains non-holiday indicators
//     const isNonHoliday = nonHolidayIndicators.some((indicator) =>
//       summary.includes(indicator)
//     );

//     // Return true only if it's a public holiday and not a non-holiday
//     return isPublicHoliday && !isNonHoliday;
//   };

//   // Google Calendar API se holidays fetch karna
//   const fetchHolidaysIfNeeded = async (year) => {
//     if (fetchedHolidayYears[year]) return;

//     try {
//       const API_KEY = import.meta.env.VITE_CALENDAR_API_KEY;
//       const CALENDAR_ID = "en.indian%23holiday%40group.v.calendar.google.com";

//       const startDate = `${year}-01-01T00:00:00Z`;
//       const endDate = `${year}-12-31T23:59:59Z`;

//       const url = `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events?key=${API_KEY}&timeMin=${startDate}&timeMax=${endDate}&singleEvents=true`;

//       const controller = new AbortController();
//       const timeoutId = setTimeout(() => controller.abort(), 8000);

//       const resp = await fetch(url, {
//         signal: controller.signal,
//         headers: {
//           Accept: "application/json",
//         },
//       });

//       clearTimeout(timeoutId);

//       if (!resp.ok) {
//         throw new Error(`HTTP ${resp.status} - ${resp.statusText}`);
//       }

//       const data = await resp.json();

//       if (!data.items || !Array.isArray(data.items)) {
//         console.warn("Holiday fetch: unexpected payload", data);
//         return;
//       }

//       // Filter to only include actual public holidays
//       const publicHolidays = data.items.filter(isPublicHoliday);

//       const mapped = publicHolidays.map((h) => {
//         return {
//           id: `holiday-${h.id}`,
//           title: h.summary,
//           start: h.start.date || h.start.dateTime,
//           end: h.end.date || h.end.dateTime,
//           extendedProps: {
//             description: h.description || h.summary,
//             category: "holiday",
//             isHoliday: true,
//             source: "google calendar",
//           },
//           color: getEventColor("holiday"),
//           display: "auto",
//           allDay: true,
//         };
//       });

//       // Merge with existing holidayEvents ensuring uniqueness
//       setHolidayEvents((prev) => {
//         const ids = new Set(prev.map((p) => p.id));
//         const toAdd = mapped.filter((m) => !ids.has(m.id));
//         return [...prev, ...toAdd];
//       });

//       setFetchedHolidayYears((prev) => ({ ...prev, [year]: true }));

//       // Update sidebar
//       updateSidebarEvents(selectedDate, [
//         ...events,
//         ...holidayEvents,
//         ...mapped,
//       ]);
//     } catch (err) {
//       console.error("Holiday fetch error:", err.message || err);
//     }
//   };

//   // When calendar view (month) changes, fetch holidays for new year if needed
//   const handleDatesSet = (dateInfo) => {
//     const viewStart = new Date(dateInfo.view.currentStart);
//     setCurrentDate(viewStart);
//     // Fetch holidays for the visible year
//     fetchHolidaysIfNeeded(viewStart.getFullYear());
//   };

//   // Handle date click - show events for that date in sidebar
//   const handleDateClick = (arg) => {
//     const clickedDate = new Date(arg.dateStr);
//     setSelectedDate(clickedDate);
//     updateSidebarEvents(clickedDate);
//   };

//   // Handle event click - edit existing event
//   const handleEventClick = (clickInfo) => {
//     if (user.role === "employee") return;

//     // Don't allow editing of Sunday holiday or public holiday events
//     if (
//       clickInfo.event.extendedProps?.isSundayHoliday ||
//       clickInfo.event.extendedProps?.isHoliday
//     )
//       return;

//     const event = clickInfo.event;
//     let endDate = event.extendedProps.originalEndDate || event.startStr;

//     setEditingEvent(event);
//     setFormData({
//       title: event.title,
//       description: event.extendedProps?.description || "",
//       startDate: event.startStr,
//       endDate: endDate,
//       category: event.extendedProps?.category || "meeting",
//     });
//     setOpen(true);
//   };

//   // Handle add new event button click
//   const handleAddEvent = () => {
//     setEditingEvent(null);
//     setFormData({
//       title: "",
//       description: "",
//       startDate: selectedDate.toISOString().split("T")[0],
//       endDate: selectedDate.toISOString().split("T")[0],
//       category: "meeting",
//     });
//     setOpen(true);
//   };

//   // Format date for display
//   const formatDate = (date) => {
//     return date.toLocaleDateString("en-US", {
//       weekday: "long",
//       month: "long",
//       day: "numeric",
//       year: "numeric",
//     });
//   };

//   // Save event (create or update)
//   const handleSave = async () => {
//     try {
//       const payload = {
//         title: formData.title,
//         description: formData.description,
//         startDate: formData.startDate,
//         endDate:
//           formData.endDate !== formData.startDate
//             ? formData.endDate
//             : undefined,
//         category: formData.category,
//       };

//       if (editingEvent) {
//         await axiosInstance.put(`${API_URL}/${editingEvent.id}`, payload, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//       } else {
//         await axiosInstance.post(API_URL, payload, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//       }
//       setOpen(false);
//       fetchEvents();
//     } catch (err) {
//       console.error(err.response?.data || err.message);
//     }
//   };

//   // Delete event
//   const handleDelete = async () => {
//     if (!editingEvent) return;
//     try {
//       await axiosInstance.delete(`${API_URL}/${editingEvent.id}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setOpen(false);
//       fetchEvents();
//     } catch (err) {
//       console.error(err.response?.data || err.message);
//     }
//   };

//   // Navigate calendar months
//   const handlePrevMonth = () => {
//     if (calendarRef.current) {
//       const calendarApi = calendarRef.current.getApi();
//       calendarApi.prev();
//       setCurrentDate(new Date(calendarApi.getDate()));
//     }
//   };

//   const handleNextMonth = () => {
//     if (calendarRef.current) {
//       const calendarApi = calendarRef.current.getApi();
//       calendarApi.next();
//       setCurrentDate(new Date(calendarApi.getDate()));
//     }
//   };

//   // Custom event content renderer
//   const renderEventContent = (eventInfo) => {
//     // Don't render content for Sunday holiday events (we show Sunday via day cell)
//     if (eventInfo.event.extendedProps?.isSundayHoliday) {
//       return null;
//     }

//     return (
//       <div className="fc-event-content">
//         <div className="fc-event-title">{eventInfo.event.title}</div>
//         {eventInfo.event.extendedProps.description && (
//           <div className="fc-event-description">
//             {eventInfo.event.extendedProps.description.length > 20
//               ? `${eventInfo.event.extendedProps.description.substring(
//                   0,
//                   20
//                 )}...`
//               : eventInfo.event.extendedProps.description}
//           </div>
//         )}
//       </div>
//     );
//   };

//   // Custom day cell content renderer to add Sunday indicator
//   const dayCellContent = (cellInfo) => {
//     const date = new Date(cellInfo.date);
//     const isSun = isSunday(date);

//     return (
//       <div className="fc-daygrid-day-frame">
//         <div className="fc-daygrid-day-top">
//           <div
//             className={`fc-daygrid-day-number ${
//               isSun ? "text-red-600 font-bold" : ""
//             }`}
//           >
//             {cellInfo.dayNumberText}
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // combined events to give to FullCalendar (backend events + holidays)
//   const calendarEvents = [...events, ...holidayEvents];

//   return (
//     <div className="space-y-8">
//       {/* Add style tag with CSS variables */}
//       <style>{style}</style>

//       {/* Header */}
//       <div className="flex items-center justify-between ">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-800">Company Calendar</h1>
//           <p className="text-gray-500 text-sm mt-1">
//             Manage company events and schedules
//           </p>
//         </div>
//         {user.role !== "employee" && (
//           <button
//             onClick={handleAddEvent}
//             className="flex items-center bg-[#104774] text-white px-4 py-2 rounded-xl hover:bg-[#0d3a61] transition-all duration-200"
//           >
//             <Plus size={18} className="mr-2" />
//             Add Event
//           </button>
//         )}
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         {/* Main Calendar */}
//         <div className="lg:col-span-2">
//           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//             {/* Calendar Header */}
//             <div className="bg-[#104774] p-6 text-white">
//               <div className="flex justify-between items-center">
//                 <button
//                   onClick={handlePrevMonth}
//                   className="p-2 hover:bg-[#0d3a61] rounded-lg transition-colors"
//                 >
//                   <ChevronLeft size={24} />
//                 </button>
//                 <div className="text-center">
//                   <h2 className="text-xl font-semibold">
//                     {currentDate.toLocaleDateString("en-US", {
//                       month: "long",
//                       year: "numeric",
//                     })}
//                   </h2>
//                   <p className="text-blue-100 text-sm">
//                     Click on any date to view events
//                   </p>
//                 </div>
//                 <button
//                   onClick={handleNextMonth}
//                   className="p-2 hover:bg-[#0d3a61] rounded-lg transition-colors"
//                 >
//                   <ChevronRight size={24} />
//                 </button>
//               </div>
//             </div>

//             <div className="">
//               {/* <FullCalendar
//                 ref={calendarRef}
//                 plugins={[dayGridPlugin, interactionPlugin]}
//                 initialView="dayGridMonth"
//                 events={calendarEvents}
//                 dateClick={handleDateClick}
//                 eventClick={handleEventClick}
//                 height="auto"
//                 headerToolbar={false}
//                 initialDate={currentDate}
//                 datesSet={handleDatesSet}
//                 eventContent={renderEventContent}
//                 dayCellContent={dayCellContent}
//                 dayMaxEvents={1}
//                   showNonCurrentDates={false}   // 👈 Ye line add kar

//               /> */}
//               <FullCalendar
//                 ref={calendarRef}
//                 plugins={[dayGridPlugin, interactionPlugin]}
//                 initialView="dayGridMonth"
//                 events={calendarEvents}
//                 dateClick={handleDateClick}
//                 eventClick={handleEventClick}
//                 height="auto"
//                 headerToolbar={false}
//                 initialDate={currentDate}
//                 datesSet={handleDatesSet}
//                 eventContent={renderEventContent}
//                 dayCellContent={dayCellContent}
//                 dayMaxEvents={1}
//                 fixedWeekCount={false} // 👈 extra rows remove ho jayengi
//               />
//             </div>
//           </div>
//         </div>

//         {/* Sidebar */}
//         <div className="space-y-6">
//           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
//             <div className="flex items-center justify-between mb-4">
//               <div className="flex items-center">
//                 <Calendar size={24} className="text-[#104774] mr-3" />
//                 {/* <h3 className="text-lg font-semibold text-gray-800">
//                   {formatDate(selectedDate)}
//                   {isSunday(selectedDate) && (
//                     <span className="ml-2 text-red-600 text-sm font-normal">
//                       (Holiday)
//                     </span>
//                   )}
//                 </h3> */}
//                 <h3 className="text-lg font-semibold text-gray-800">
//                   {formatDate(selectedDate)}
//                   {(isSunday(selectedDate) ||
//                     sidebarEvents.some(
//                       (ev) => ev.extendedProps?.isHoliday
//                     )) && (
//                     <span className="ml-2 text-red-600 text-sm font-normal">
//                       (Holiday)
//                     </span>
//                   )}
//                 </h3>
//               </div>
//               {user.role !== "employee" && sidebarEvents.length > 0 && (
//                 <button
//                   onClick={handleAddEvent}
//                   className="text-[#104774] text-sm hover:text-[#0d3a61]"
//                 >
//                   + Add Event
//                 </button>
//               )}
//             </div>

//             {sidebarEvents.length > 0 ? (
//               <div className="space-y-3">
//                 {sidebarEvents.map((event, idx) => {
//                   const eventStart = new Date(event.start);
//                   const eventEnd = event.end ? new Date(event.end) : null;
//                   if (eventEnd) eventEnd.setDate(eventEnd.getDate() - 1); // Adjust for display

//                   return (
//                     <div
//                       key={idx}
//                       className={`p-4 rounded-xl border ${getEventBgColor(
//                         event.extendedProps?.category || "meeting"
//                       )} ${
//                         user.role !== "employee" &&
//                         !event.extendedProps?.isSundayHoliday &&
//                         !event.extendedProps?.isHoliday
//                           ? "cursor-pointer hover:shadow-md transition-shadow"
//                           : ""
//                       }`}
//                       onClick={() => {
//                         if (
//                           user.role !== "employee" &&
//                           !event.extendedProps?.isSundayHoliday &&
//                           !event.extendedProps?.isHoliday
//                         ) {
//                           setEditingEvent(event);
//                           setFormData({
//                             title: event.title,
//                             description: event.extendedProps?.description || "",
//                             startDate: event.start,
//                             endDate:
//                               event.extendedProps?.originalEndDate ||
//                               event.start,
//                             category:
//                               event.extendedProps?.category || "meeting",
//                           });
//                           setOpen(true);
//                         }
//                       }}
//                     >
//                       <div className="flex items-start justify-between">
//                         <div className="flex-1">
//                           <h4 className="font-semibold text-gray-800">
//                             {event.title}
//                             {(event.extendedProps?.isSundayHoliday ||
//                               event.extendedProps?.isHoliday) && (
//                               <span className="ml-2 text-green-600 text-xs font-normal">
//                                 {/* (Auto-generated) */}
//                               </span>
//                             )}
//                           </h4>
//                           {event.extendedProps?.description && (
//                             <p className="text-sm text-gray-500 mt-2">
//                               {event.extendedProps.description}
//                             </p>
//                           )}
//                           <div className="text-xs text-gray-400 mt-2">
//                             {eventStart.toLocaleDateString()}
//                             {eventEnd &&
//                               eventEnd > eventStart &&
//                               ` to ${eventEnd.toLocaleDateString()}`}
//                           </div>
//                         </div>
//                         <div
//                           className={`w-3 h-3 rounded-full ml-2 flex-shrink-0`}
//                           style={{
//                             backgroundColor: getEventColor(
//                               event.extendedProps?.category || "meeting"
//                             ),
//                           }}
//                         ></div>
//                       </div>
//                       {user.role !== "employee" &&
//                         !event.extendedProps?.isSundayHoliday &&
//                         !event.extendedProps?.isHoliday && (
//                           <div className="text-xs text-[#104774] mt-2">
//                             Click to edit
//                           </div>
//                         )}
//                     </div>
//                   );
//                 })}
//               </div>
//             ) : (
//               <div className="text-center py-8">
//                 <Calendar size={48} className="text-gray-300 mx-auto mb-3" />
//                 <p className="text-gray-500">No events scheduled</p>
//                 {user.role !== "employee" && (
//                   <button
//                     onClick={handleAddEvent}
//                     className="text-[#104774] text-sm mt-2 hover:text-[#0d3a61]"
//                   >
//                     + Add Event
//                   </button>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Modal */}
//       {open && (
//         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-2xl shadow-lg w-full max-w-md">
//             <div className="flex justify-between items-center p-6 border-b">
//               <h3 className="text-lg font-semibold text-gray-800">
//                 {editingEvent ? "Edit Event" : "Add Event"}
//               </h3>
//               <button
//                 onClick={() => setOpen(false)}
//                 className="text-gray-400 hover:text-gray-600"
//               >
//                 <X size={20} />
//               </button>
//             </div>

//             <div className="p-6 space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Event Title
//                 </label>
//                 <input
//                   type="text"
//                   placeholder="Enter event title"
//                   value={formData.title}
//                   onChange={(e) =>
//                     setFormData({ ...formData, title: e.target.value })
//                   }
//                   className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#104774] focus:border-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Description
//                 </label>
//                 <textarea
//                   placeholder="Enter event description"
//                   value={formData.description}
//                   onChange={(e) =>
//                     setFormData({ ...formData, description: e.target.value })
//                   }
//                   rows={3}
//                   className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#104774] focus:border-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Category
//                 </label>
//                 <select
//                   value={formData.category}
//                   onChange={(e) =>
//                     setFormData({ ...formData, category: e.target.value })
//                   }
//                   className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#104774] focus:border-transparent"
//                 >
//                   <option value="meeting">Meeting</option>
//                   <option value="deadline">Deadline</option>
//                   <option value="event">Company Event</option>
//                   <option value="leave">Leave Day</option>
//                   <option value="holiday">Holiday</option>
//                 </select>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Start Date
//                   </label>
//                   <input
//                     type="date"
//                     value={
//                       formData.startDate ? formData.startDate.slice(0, 10) : ""
//                     }
//                     onChange={(e) =>
//                       setFormData({ ...formData, startDate: e.target.value })
//                     }
//                     className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#104774] focus:border-transparent"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     End Date (optional)
//                   </label>
//                   <input
//                     type="date"
//                     value={
//                       formData.endDate ? formData.endDate.slice(0, 10) : ""
//                     }
//                     onChange={(e) =>
//                       setFormData({ ...formData, endDate: e.target.value })
//                     }
//                     className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#104774] focus:border-transparent"
//                   />
//                 </div>
//               </div>
//             </div>

//             <div className="flex justify-end gap-3 p-6 border-t">
//               <button
//                 onClick={() => setOpen(false)}
//                 className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
//               >
//                 Cancel
//               </button>
//               {editingEvent && (
//                 <button
//                   onClick={handleDelete}
//                   className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
//                 >
//                   Delete
//                 </button>
//               )}
//               <button
//                 onClick={handleSave}
//                 className="px-4 py-2 bg-[#104774] text-white rounded-lg hover:bg-[#0d3a61]"
//               >
//                 {editingEvent ? "Update" : "Save"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CompanyCalendar;



import React, { useEffect, useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import axiosInstance from "../utils/axiosInstance";
import { useAuth } from "../context/AppContext";
import { ChevronLeft, ChevronRight, Plus, Calendar, X } from "lucide-react";

const API_URL = "/events";

const CompanyCalendar = () => {
  const { user, token } = useAuth();
  const [events, setEvents] = useState([]);
  const [holidayEvents, setHolidayEvents] = useState([]);
  const [fetchedHolidayYears, setFetchedHolidayYears] = useState({});
  const [open, setOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    category: "meeting",
  });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [sidebarEvents, setSidebarEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const calendarRef = useRef(null);

  // CSS variables for colors
  const style = `
  :root {
    --primary-color: #104774;
    --primary-hover: #0d3a61;
    --sunday-bg-color: #fff5f5;
    --sunday-text-color: #e53e3e;
    --holiday-bg-color: #fff5f5;
    --holiday-text-color: #e53e3e;
  }
  
  .fc .fc-toolbar-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #104774;
  }
  
  .fc .fc-button {
    background-color: #104774;
    border-color: #104774;
  }
  
  .fc .fc-button:hover {
    background-color: #0d3a61;
    border-color: #0d3a61;
  }
  
  .fc .fc-daygrid-day.fc-day-today {
    background-color: #f0f9ff;
  }
  
  .fc .fc-day-sun,
  .fc .fc-day-holiday {
    background-color: var(--holiday-bg-color);
  }
  
  .fc .fc-day-sun .fc-daygrid-day-number,
  .fc .fc-day-holiday .fc-daygrid-day-number {
    color: var(--holiday-text-color);
    font-weight: 600;
  }
  
  .fc-event {
    border-radius: 4px;
    border: none;
    padding: 2px 4px;
    font-size: 0.8rem;
    cursor: pointer;
  }
  
  .fc-daygrid-day-frame {
    cursor: pointer;
    max-height: 150px !important;
  }
  
  .fc-event-title {
    font-weight: 500;
  }
  
  .fc-event-description {
    font-size: 0.7rem;
    opacity: 0.8;
    margin-top: 2px;
  }
`;

  // Helper: produce YYYY-MM-DD in local timezone (avoids timezone shifts from toISOString)
  const formatDateKey = (d) => {
    const date = new Date(d);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // Check if a date is Sunday
  const isSunday = (date) => {
    return new Date(date).getDay() === 0;
  };

  // Create a holiday event object for Sunday (for sidebar only)
  const createSundayHolidayEvent = (date) => {
    const dateStr = formatDateKey(date);
    return {
      id: `sunday-${dateStr}`,
      title: "Sunday Holiday",
      start: dateStr,
      extendedProps: {
        description: "Weekly holiday",
        category: "holiday",
        isSundayHoliday: true,
      },
      color: getEventColor("holiday"),
      display: "auto",
      allDay: true,
    };
  };

  // get color and bg helper
  const getEventColor = (category) => {
    switch (category) {
      case "meeting":
        return "#104774";
      case "deadline":
        return "#ef4444";
      case "event":
        return "#8b5cf6";
      case "leave":
        return "#f97316";
      case "holiday":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  const getEventBgColor = (category) => {
    switch (category) {
      case "meeting":
        return "bg-blue-50 border-blue-200";
      case "deadline":
        return "bg-red-50 border-red-200";
      case "event":
        return "bg-purple-50 border-purple-200";
      case "leave":
        return "bg-orange-50 border-orange-200";
      case "holiday":
        return "bg-green-50 border-green-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  // fetch events from backend
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const formattedEvents = res.data.events.map((e) => {
        let endDate = e.endDate;
        if (e.endDate && e.endDate !== e.startDate) {
          const end = new Date(e.endDate);
          end.setDate(end.getDate() + 1); // make exclusive end for FullCalendar
          endDate = formatDateKey(end);
        }

        return {
          id: e._id,
          title: e.title,
          start: formatDateKey(e.startDate),
          end: endDate ? endDate : undefined,
          extendedProps: {
            description: e.description,
            category: e.category || "meeting",
            originalEndDate: e.endDate,
            isSundayHoliday: false,
            isHoliday: false,
            source: "backend",
          },
          color: getEventColor(e.category || "meeting"),
          display: "auto",
          allDay: true,
        };
      });

      setEvents(formattedEvents);
      // update sidebar for selected date combining backend & current holidayEvents
      updateSidebarEvents(selectedDate, [...formattedEvents, ...holidayEvents]);
    } catch (err) {
      console.error(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchHolidaysIfNeeded(currentDate.getFullYear());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Function to determine if a holiday event is an official public holiday
  const isPublicHoliday = (holidayEvent) => {
    const summary = (holidayEvent.summary || "").toLowerCase();

    const publicHolidayIndicators = [
      "public holiday",
      "national holiday",
      "gazetted holiday",
      "bank holiday",
      "independence day",
      "republic day",
      "gandhi jayanti",
      "guru nanak jayanti",
      "diwali",
      "holi",
      "eid",
      "christmas",
      "good friday",
      "mahatma gandhi",
      "republic",
      "independence",
      "janmashtami",
      "dussehra",
      "ram navami",
      "maha shivratri",
    ];

    const nonHolidayIndicators = [
      "observance",
      "observances",
      "festival",
      "festivals",
      "optional holiday",
      "restricted holiday",
      "eve",
      "beginning",
      "ends",
      "monthly",
      "week",
      "daylight saving",
      "season",
      "solstice",
      "equinox",
      "fasting",
      "vrat",
      "puja",
      "parva",
    ];

    const isPublicHoliday = publicHolidayIndicators.some((indicator) =>
      summary.includes(indicator)
    );

    const isNonHoliday = nonHolidayIndicators.some((indicator) =>
      summary.includes(indicator)
    );

    return isPublicHoliday && !isNonHoliday;
  };

  // Google Calendar API se holidays fetch karna
  const fetchHolidaysIfNeeded = async (year) => {
    if (fetchedHolidayYears[year]) return;

    try {
      const API_KEY = import.meta.env.VITE_CALENDAR_API_KEY;
      const CALENDAR_ID = "en.indian%23holiday%40group.v.calendar.google.com";

      const startDate = `${year}-01-01T00:00:00Z`;
      const endDate = `${year}-12-31T23:59:59Z`;

      const url = `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events?key=${API_KEY}&timeMin=${startDate}&timeMax=${endDate}&singleEvents=true`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const resp = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      });

      clearTimeout(timeoutId);

      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status} - ${resp.statusText}`);
      }

      const data = await resp.json();

      if (!data.items || !Array.isArray(data.items)) {
        console.warn("Holiday fetch: unexpected payload", data);
        return;
      }

      const publicHolidays = data.items.filter(isPublicHoliday);

      const mapped = publicHolidays.map((h) => {
        const endDate = h.end.date ? h.end.date : h.end.dateTime;

        return {
          id: `holiday-${h.id}`,
          title: h.summary,
          start: formatDateKey(h.start.date || h.start.dateTime),
          end: endDate ? formatDateKey(endDate) : undefined, // keep end as exclusive (Google uses exclusive end for all-day)
          extendedProps: {
            description: h.description || h.summary,
            category: "holiday",
            isHoliday: true,
            source: "google calendar",
          },
          color: getEventColor("holiday"),
          display: "auto",
          allDay: true,
        };
      });

      // Merge with existing holidayEvents ensuring uniqueness and then update sidebar
      setHolidayEvents((prev) => {
        const ids = new Set(prev.map((p) => p.id));
        const toAdd = mapped.filter((m) => !ids.has(m.id));
        const newArr = [...prev, ...toAdd];
        // Update sidebar with the new combined list
        updateSidebarEvents(selectedDate, [...events, ...newArr]);
        return newArr;
      });

      setFetchedHolidayYears((prev) => ({ ...prev, [year]: true }));
    } catch (err) {
      console.error("Holiday fetch error:", err.message || err);
    }
  };

  // Update sidebar events when date changes - now includes holidayEvents
  const updateSidebarEvents = (date, eventsList = null) => {
    const combined = eventsList || [...events, ...holidayEvents];
    const selectedDateStr = formatDateKey(date);
    const isSelectedDateSunday = isSunday(date);

    const selectedDateEvents = combined.filter((event) => {
      const eventStartStr = formatDateKey(event.start);

      // If event has end date, treat end as exclusive
      if (event.end) {
        const eventEndStr = formatDateKey(event.end);
        return (
          selectedDateStr >= eventStartStr && selectedDateStr < eventEndStr
        );
      }

      // If no end date, check if it's exactly the same day
      return selectedDateStr === eventStartStr;
    });

    // Add Sunday holiday event if the selected date is Sunday
    if (isSelectedDateSunday) {
      const hasExistingHoliday = selectedDateEvents.some(
        (event) =>
          event.extendedProps?.isSundayHoliday || event.extendedProps?.isHoliday
      );

      if (!hasExistingHoliday) {
        selectedDateEvents.push(createSundayHolidayEvent(date));
      }
    }

    setSidebarEvents(selectedDateEvents);
  };

  // When calendar view (month) changes, fetch holidays for new year if needed
  const handleDatesSet = (dateInfo) => {
    const viewStart = new Date(dateInfo.view.currentStart);
    setCurrentDate(viewStart);
    fetchHolidaysIfNeeded(viewStart.getFullYear());
  };

  // Handle date click - show events for that date in sidebar
  const handleDateClick = (arg) => {
    const clickedDate = new Date(arg.dateStr);
    setSelectedDate(clickedDate);
    updateSidebarEvents(clickedDate);
  };

  // Handle event click - edit existing event
  const handleEventClick = (clickInfo) => {
    if (user.role === "employee") return;

    if (
      clickInfo.event.extendedProps?.isSundayHoliday ||
      clickInfo.event.extendedProps?.isHoliday
    )
      return;

    const event = clickInfo.event;
    let endDate = event.extendedProps.originalEndDate || event.startStr;

    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.extendedProps?.description || "",
      startDate: event.startStr,
      endDate: endDate,
      category: event.extendedProps?.category || "meeting",
    });
    setOpen(true);
  };

  const handleAddEvent = () => {
    setEditingEvent(null);
    setFormData({
      title: "",
      description: "",
      startDate: formatDateKey(selectedDate),
      endDate: formatDateKey(selectedDate),
      category: "meeting",
    });
    setOpen(true);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleSave = async () => {
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        startDate: formData.startDate,
        endDate:
          formData.endDate !== formData.startDate
            ? formData.endDate
            : undefined,
        category: formData.category,
      };

      if (editingEvent) {
        await axiosInstance.put(`${API_URL}/${editingEvent.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axiosInstance.post(API_URL, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setOpen(false);
      fetchEvents();
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  const handleDelete = async () => {
    if (!editingEvent) return;
    try {
      await axiosInstance.delete(`${API_URL}/${editingEvent.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOpen(false);
      fetchEvents();
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  const handlePrevMonth = () => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.prev();
      setCurrentDate(new Date(calendarApi.getDate()));
    }
  };

  const handleNextMonth = () => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.next();
      setCurrentDate(new Date(calendarApi.getDate()));
    }
  };

  // Check if a date has any holiday events (using local date keys)
  const hasHolidayEvents = (date) => {
    const dateStr = formatDateKey(date);
    return holidayEvents.some((event) => {
      const eventStartStr = formatDateKey(event.start);

      if (event.end) {
        const eventEndStr = formatDateKey(event.end);
        return dateStr >= eventStartStr && dateStr < eventEndStr;
      }

      return dateStr === eventStartStr;
    });
  };

  const renderEventContent = (eventInfo) => {
    if (eventInfo.event.extendedProps?.isSundayHoliday) {
      return null;
    }

    return (
      <div className="fc-event-content">
        <div className="fc-event-title">{eventInfo.event.title}</div>
        {eventInfo.event.extendedProps.description && (
          <div className="fc-event-description">
            {eventInfo.event.extendedProps.description.length > 20
              ? `${eventInfo.event.extendedProps.description.substring(
                  0,
                  20
                )}...`
              : eventInfo.event.extendedProps.description}
          </div>
        )}
      </div>
    );
  };

  const dayCellContent = (cellInfo) => {
    const date = new Date(cellInfo.date);
    const isSun = isSunday(date);
    const isHoliday = hasHolidayEvents(date);

    return (
      <div className="fc-daygrid-day-frame">
        <div className="fc-daygrid-day-top">
          <div
            className={`fc-daygrid-day-number ${
              isSun || isHoliday ? "text-red-600 font-bold" : ""
            }`}
          >
            {cellInfo.dayNumberText}
          </div>
        </div>
      </div>
    );
  };

  const dayCellClassNames = (cellInfo) => {
    const date = new Date(cellInfo.date);
    const isSun = isSunday(date);
    const isHoliday = hasHolidayEvents(date);

    if (isSun || isHoliday) {
      return "fc-day-holiday";
    }
    return "";
  };

  const calendarEvents = [...events, ...holidayEvents];

  return (
    <div className="space-y-8">
      <style>{style}</style>

      <div className="flex items-center justify-between ">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Company Calendar</h1>
          <p className="text-gray-500 text-sm mt-1">Manage company events and schedules</p>
        </div>
        {user.role !== "employee" && (
          <button
            onClick={handleAddEvent}
            className="flex items-center bg-[#104774] text-white px-4 py-2 rounded-xl hover:bg-[#0d3a61] transition-all duration-200"
          >
            <Plus size={18} className="mr-2" />
            Add Event
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-[#104774] p-6 text-white">
              <div className="flex justify-between items-center">
                <button onClick={handlePrevMonth} className="p-2 hover:bg-[#0d3a61] rounded-lg transition-colors">
                  <ChevronLeft size={24} />
                </button>
                <div className="text-center">
                  <h2 className="text-xl font-semibold">
                    {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </h2>
                  <p className="text-blue-100 text-sm">Click on any date to view events</p>
                </div>
                <button onClick={handleNextMonth} className="p-2 hover:bg-[#0d3a61] rounded-lg transition-colors">
                  <ChevronRight size={24} />
                </button>
              </div>
            </div>

            <div className="">
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                events={calendarEvents}
                dateClick={handleDateClick}
                eventClick={handleEventClick}
                height="auto"
                headerToolbar={false}
                initialDate={currentDate}
                datesSet={handleDatesSet}
                eventContent={renderEventContent}
                dayCellContent={dayCellContent}
                dayCellClassNames={dayCellClassNames}
                dayMaxEvents={1}
                fixedWeekCount={false}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Calendar size={24} className="text-[#104774] mr-3" />
                <h3 className="text-lg font-semibold text-gray-800">
                  {formatDate(selectedDate)}
                  {(isSunday(selectedDate) || sidebarEvents.some((ev) => ev.extendedProps?.isHoliday)) && (
                    <span className="ml-2 text-red-600 text-sm font-normal">(Holiday)</span>
                  )}
                </h3>
              </div>
              {user.role !== "employee" && sidebarEvents.length > 0 && (
                <button onClick={handleAddEvent} className="text-[#104774] text-sm hover:text-[#0d3a61]">+ Add Event</button>
              )}
            </div>

            {sidebarEvents.length > 0 ? (
              <div className="space-y-3">
                {sidebarEvents.map((event, idx) => {
                  const eventStart = new Date(event.start);
                  const eventEnd = event.end ? new Date(event.end) : null;

                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border ${getEventBgColor(event.extendedProps?.category || "meeting")} ${
                        user.role !== "employee" &&
                        !event.extendedProps?.isSundayHoliday &&
                        !event.extendedProps?.isHoliday
                          ? "cursor-pointer hover:shadow-md transition-shadow"
                          : ""
                      }`}
                      onClick={() => {
                        if (
                          user.role !== "employee" &&
                          !event.extendedProps?.isSundayHoliday &&
                          !event.extendedProps?.isHoliday
                        ) {
                          setEditingEvent(event);
                          setFormData({
                            title: event.title,
                            description: event.extendedProps?.description || "",
                            startDate: event.start,
                            endDate: event.extendedProps?.originalEndDate || event.start,
                            category: event.extendedProps?.category || "meeting",
                          });
                          setOpen(true);
                        }
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">
                            {event.title}
                            {(event.extendedProps?.isSundayHoliday || event.extendedProps?.isHoliday) && (
                              <span className="ml-2 text-green-600 text-xs font-normal"></span>
                            )}
                          </h4>
                          {event.extendedProps?.description && (
                            <p className="text-sm text-gray-500 mt-2">{event.extendedProps.description}</p>
                          )}
                          <div className="text-xs text-gray-400 mt-2">
                            {eventStart.toLocaleDateString()}
                            {eventEnd && eventEnd > eventStart && ` to ${eventEnd.toLocaleDateString()}`}
                          </div>
                        </div>
                        <div className={`w-3 h-3 rounded-full ml-2 flex-shrink-0`} style={{ backgroundColor: getEventColor(event.extendedProps?.category || "meeting") }}></div>
                      </div>
                      {user.role !== "employee" && !event.extendedProps?.isSundayHoliday && !event.extendedProps?.isHoliday && (
                        <div className="text-xs text-[#104774] mt-2">Click to edit</div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar size={48} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No events scheduled</p>
                {user.role !== "employee" && (
                  <button onClick={handleAddEvent} className="text-[#104774] text-sm mt-2 hover:text-[#0d3a61]">+ Add Event</button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-800">{editingEvent ? "Edit Event" : "Add Event"}</h3>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                <input type="text" placeholder="Enter event title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#104774] focus:border-transparent" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea placeholder="Enter event description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#104774] focus:border-transparent" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#104774] focus:border-transparent">
                  <option value="meeting">Meeting</option>
                  <option value="deadline">Deadline</option>
                  <option value="event">Company Event</option>
                  <option value="leave">Leave Day</option>
                  <option value="holiday">Holiday</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input type="date" value={formData.startDate ? formData.startDate.slice(0, 10) : ""} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#104774] focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date (optional)</label>
                  <input type="date" value={formData.endDate ? formData.endDate.slice(0, 10) : ""} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#104774] focus:border-transparent" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t">
              <button onClick={() => setOpen(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
              {editingEvent && (
                <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
              )}
              <button onClick={handleSave} className="px-4 py-2 bg-[#104774] text-white rounded-lg hover:bg-[#0d3a61]">{editingEvent ? "Update" : "Save"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyCalendar;
