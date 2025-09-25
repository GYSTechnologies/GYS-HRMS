import React, { useEffect, useState, useRef, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import axiosInstance from "../utils/axiosInstance";
import { useAuth } from "../context/AppContext";
import { ChevronLeft, ChevronRight, Plus, Calendar, X } from "lucide-react";

const API_URL = "/events";

export default function CompanyCalendar() {
  const { user, token } = useAuth();
  const [events, setEvents] = useState([]); // backend events (normalized)
  const [holidayEvents, setHolidayEvents] = useState([]); // google holidays (normalized)
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
  const style = `:root { --primary-color: #104774; --primary-hover: #0d3a61; --sunday-bg-color: #fff5f5; --sunday-text-color: #e53e3e; --holiday-bg-color: #fff5f5; --holiday-text-color: #e53e3e; }
  .fc .fc-toolbar-title{font-size:1.25rem;font-weight:600;color:#104774}
  .fc .fc-button{background-color:#104774;border-color:#104774}
  .fc .fc-button:hover{background-color:#0d3a61;border-color:#0d3a61}
  .fc .fc-daygrid-day.fc-day-today{background-color:#f0f9ff}
  .fc .fc-day-sun,.fc .fc-day-holiday{background-color:var(--holiday-bg-color)}
  .fc .fc-day-sun .fc-daygrid-day-number,.fc .fc-day-holiday .fc-daygrid-day-number{color:var(--holiday-text-color);font-weight:600}
  .fc-event{border-radius:4px;border:none;padding:2px 4px;font-size:0.8rem;cursor:pointer}
  .fc-daygrid-day-frame{cursor:pointer;max-height:150px!important}
  .fc-event-title{font-weight:500}
  .fc-event-description{font-size:0.7rem;opacity:0.8;margin-top:2px}
  `;

  // Helpers
  const formatDateKey = (d) => {
    const date = new Date(d);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const isSunday = (date) => new Date(date).getDay() === 0;

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

  // ---------------------------
  // Normalize backend events to calendar format
  // ---------------------------
  const mapBackendEvents = useCallback((backendEvents) => {
    return (backendEvents || []).map((e) => {
      // Keep original end date (as stored in DB) so editing works
      let endDate = e.endDate;
      if (e.endDate && e.endDate !== e.startDate) {
        const end = new Date(e.endDate);
        end.setDate(end.getDate() + 1); // FullCalendar expects exclusive end for all-day
        endDate = formatDateKey(end);
      }

      return {
        id: e._id.toString(),
        title: e.title,
        start: formatDateKey(e.startDate),
        end: endDate ? endDate : undefined,
        extendedProps: {
          description: e.description,
          category: e.category || "meeting",
          originalEndDate: e.endDate || null,
          isSundayHoliday: false,
          isHoliday: !!e.isHoliday,
          source: e.source || "backend",
          externalId: e.externalId || undefined, // may exist for google-imported events
        },
        color: getEventColor(e.category || "meeting"),
        display: "auto",
        allDay: true,
      };
    });
  }, []);

  // Normalize google holiday item -> calendar event (store externalId in extendedProps)
  const mapGoogleHolidayItem = (h) => {
    const endDate = h.end.date ? h.end.date : h.end.dateTime;
    return {
      id: `holiday-${h.id}`,
      title: h.summary,
      start: formatDateKey(h.start.date || h.start.dateTime),
      end: endDate ? formatDateKey(endDate) : undefined,
      extendedProps: {
        description: h.description || h.summary,
        category: "holiday",
        isHoliday: true,
        source: "google",
        externalId: h.id,
      },
      color: getEventColor("holiday"),
      display: "auto",
      allDay: true,
    };
  };

  // ---------------------------
  const getCombinedEvents = () => {
    const backend = events || [];
    const combined = [...backend];

    holidayEvents.forEach((h) => {
      const ext = h.extendedProps?.externalId;
      const start = formatDateKey(h.start);
      const titleLower = (h.title || "").toLowerCase();

      const conflicts = backend.some((b) => {
        // match by externalId first
        if (
          ext &&
          b.extendedProps?.externalId &&
          b.extendedProps.externalId === ext
        )
          return true;
        // fallback: title+start match
        const bStart = formatDateKey(b.start);
        if (bStart === start && (b.title || "").toLowerCase() === titleLower)
          return true;
        return false;
      });

      if (!conflicts) combined.push(h);
    });

    return combined;
  };

  // ---------------------------
  // Fetch events from backend
  // ---------------------------
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const mapped = mapBackendEvents(res.data.events || []);
      setEvents(mapped);
      // update sidebar after setting events (payload may include holiday entries as well)
      // useCombined for sidebar dedupe
      const combined = [...mapped, ...holidayEvents];
      updateSidebarEvents(selectedDate, combined);
    } catch (err) {
      console.error(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, [token, mapBackendEvents, holidayEvents, selectedDate]);

  useEffect(() => {
    fetchEvents();
    fetchHolidaysIfNeeded(currentDate.getFullYear());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recompute sidebar whenever events / holidayEvents / selectedDate change
  useEffect(() => {
    updateSidebarEvents(selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, holidayEvents, selectedDate]);

  // ---------------------------
  // isPublicHoliday logic (same as backend)
  // ---------------------------
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
    const isPublic = publicHolidayIndicators.some((ind) =>
      summary.includes(ind)
    );
    const isNon = nonHolidayIndicators.some((ind) => summary.includes(ind));
    return isPublic && !isNon;
  };

  // ---------------------------
  // Fetch Google holidays (frontend) - careful with abort + dedupe
  // ---------------------------
  const fetchHolidaysIfNeeded = async (year) => {
    if (fetchedHolidayYears[year]) return;
    const API_KEY = import.meta.env.VITE_CALENDAR_API_KEY;
    const CALENDAR_ID = "en.indian%23holiday%40group.v.calendar.google.com";
    const startDate = `${year}-01-01T00:00:00Z`;
    const endDate = `${year}-12-31T23:59:59Z`;
    const url = `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events?key=${API_KEY}&timeMin=${startDate}&timeMax=${endDate}&singleEvents=true`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const resp = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      clearTimeout(timeoutId);
      if (!resp.ok) throw new Error(`HTTP ${resp.status} - ${resp.statusText}`);
      const data = await resp.json();
      const items = Array.isArray(data.items) ? data.items : [];
      const publicHolidays = items.filter(isPublicHoliday);

      const mapped = publicHolidays.map(mapGoogleHolidayItem);

      // Deduplicate by id (holiday-<id>) at set time (also we dedupe again when combining with backend)
      setHolidayEvents((prev) => {
        const ids = new Set(prev.map((p) => p.id));
        const toAdd = mapped.filter((m) => !ids.has(m.id));
        return [...prev, ...toAdd];
      });

      setFetchedHolidayYears((prev) => ({ ...prev, [year]: true }));
    } catch (err) {
      if (err.name === "AbortError") console.warn("Holiday fetch aborted");
      else console.error("Holiday fetch error:", err.message || err);
    } finally {
      clearTimeout(timeoutId);
    }
  };

  // ---------------------------
  // Update sidebar event list for a given date (uses combined deduped events)
  // ---------------------------
  const updateSidebarEvents = (date, eventsList = null) => {
    const combined = eventsList || getCombinedEvents();
    const selectedDateStr = formatDateKey(date);
    const isSelectedDateSunday = isSunday(date);

    const selectedDateEvents = combined.filter((event) => {
      const eventStartStr = formatDateKey(event.start);
      if (event.end) {
        const eventEndStr = formatDateKey(event.end);
        return (
          selectedDateStr >= eventStartStr && selectedDateStr < eventEndStr
        );
      }
      return selectedDateStr === eventStartStr;
    });

    if (isSelectedDateSunday) {
      const hasExistingHoliday = selectedDateEvents.some(
        (ev) => ev.extendedProps?.isSundayHoliday || ev.extendedProps?.isHoliday
      );
      if (!hasExistingHoliday)
        selectedDateEvents.push(createSundayHolidayEvent(date));
    }

    // final safety dedupe by (externalId or id or title+start)
    const seen = new Set();
    const deduped = [];
    selectedDateEvents.forEach((ev) => {
      const key =
        ev.extendedProps?.externalId ||
        ev.id ||
        `${(ev.title || "").toLowerCase()}|${formatDateKey(ev.start)}`;
      if (!seen.has(key)) {
        seen.add(key);
        deduped.push(ev);
      }
    });

    setSidebarEvents(deduped);
  };

  const handleDatesSet = (dateInfo) => {
    const viewStart = new Date(dateInfo.view.currentStart);
    setCurrentDate(viewStart);
    fetchHolidaysIfNeeded(viewStart.getFullYear());
  };

  const handleDateClick = (arg) => {
    const clickedDate = new Date(arg.dateStr);
    setSelectedDate(clickedDate);
    updateSidebarEvents(clickedDate);
  };

  const handleEventClick = (clickInfo) => {
    if (user.role === "employee") return; // employees cannot edit

    const ev = clickInfo.event;
    // do not allow editing holidays or sunday placeholders
    if (ev.extendedProps?.isSundayHoliday || ev.extendedProps?.isHoliday)
      return;

    // Fetch originalEndDate from extendedProps if present
    const endDate =
      ev.extendedProps?.originalEndDate || ev.endStr || ev.startStr;

    // normalize start/end to yyyy-mm-dd for inputs
    const normStart = ev.startStr
      ? ev.startStr.slice(0, 10)
      : formatDateKey(ev.start);
    const normEnd = endDate
      ? endDate.slice
        ? endDate.slice(0, 10)
        : formatDateKey(endDate)
      : normStart;

    setEditingEvent({
      id: ev.id,
      // store id + extendedProps so we can update/delete
    });

    setFormData({
      title: ev.title || "",
      description: ev.extendedProps?.description || "",
      startDate: normStart,
      endDate: normEnd,
      category: ev.extendedProps?.category || "meeting",
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

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  // ---------------------------
  // Save (create or update) - ensure we use mapBackendEvents to update local state so color/category reflect correctly
  // ---------------------------
  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        startDate: formData.startDate,
        endDate:
          formData.endDate && formData.endDate !== formData.startDate
            ? formData.endDate
            : undefined,
        category: formData.category,
      };

      if (editingEvent) {
        // Update on server
        const res = await axiosInstance.put(
          `${API_URL}/${editingEvent.id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Normalize returned event and replace local
        const mapped = mapBackendEvents([res.data.event])[0];
        setEvents((prev) =>
          prev.map((ev) => (ev.id === mapped.id ? mapped : ev))
        );
      } else {
        const res = await axiosInstance.post(API_URL, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Normalize returned event and append (if not present)
        const mapped = mapBackendEvents([res.data.event])[0];
        setEvents((prev) => {
          const ids = new Set(prev.map((p) => p.id));
          if (ids.has(mapped.id)) return prev;
          const newArr = [...prev, mapped];
          updateSidebarEvents(selectedDate, [...newArr, ...holidayEvents]);
          return newArr;
        });
      }

      setOpen(false);
    } catch (err) {
      console.error(err.response?.data || err.message);
      // optionally display toast here
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editingEvent) return;
    setLoading(true);
    try {
      await axiosInstance.delete(`${API_URL}/${editingEvent.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents((prev) => prev.filter((ev) => ev.id !== editingEvent.id));
      setOpen(false);
    } catch (err) {
      console.error(err.response?.data || err.message);
    } finally {
      setLoading(false);
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

  // ---------------------------
  // hasHolidayEvents: check combined deduped events for holidays on a date
  // ---------------------------
  const hasHolidayEvents = (date) => {
    const dateStr = formatDateKey(date);
    const combined = getCombinedEvents();
    return combined.some((event) => {
      // Sunday placeholder is not in combined; it's added only to sidebar
      const evStart = formatDateKey(event.start);
      if (event.end) {
        const evEnd = formatDateKey(event.end);
        return (
          dateStr >= evStart &&
          dateStr < evEnd &&
          !!event.extendedProps?.isHoliday
        );
      }
      return dateStr === evStart && !!event.extendedProps?.isHoliday;
    });
  };

  const renderEventContent = (eventInfo) => {
    if (eventInfo.event.extendedProps?.isSundayHoliday) return null;
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
    if (isSun || isHoliday) return "fc-day-holiday";
    return "";
  };

  // FullCalendar uses the combined deduped list
  const calendarEvents = getCombinedEvents();

  return (
    <div className="max-h-[80vh] bg-gray-50 space-y-4 md:space-y-6">
      <style>{style}</style>

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">
            Company Calendar
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            Manage company events and schedules
          </p>
        </div>
        {user.role !== "employee" && (
          <button
            onClick={handleAddEvent}
            className="flex items-center justify-center bg-[#104774] text-white px-3 py-2 rounded-md hover:bg-[#0d3a61] transition-all duration-200 text-xs sm:text-sm"
          >
            <Plus size={14} className="mr-2" />
            <span>Add Event</span>
          </button>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Calendar Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            {/* Calendar Header */}
            <div className="bg-[#104774] p-3 md:p-4 text-white">
              <div className="flex justify-between items-center">
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 hover:bg-[#0d3a61] rounded-md transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="text-center px-2">
                  <h2 className="text-sm md:text-base font-semibold">
                    {currentDate.toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </h2>
                  <p className="text-blue-100 text-xs hidden sm:block">
                    Click on any date to view events
                  </p>
                </div>
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 hover:bg-[#0d3a61] rounded-md transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Calendar Component */}
            <div className="calendar-container">
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

        {/* Sidebar Events */}
        <div className="space-y-4 md:space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 md:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
              <div className="flex items-center">
                <Calendar size={18} className="text-[#104774] mr-2" />
                <h3 className="text-sm md:text-base font-semibold text-gray-800">
                  {formatDate(selectedDate)}
                  {(isSunday(selectedDate) ||
                    sidebarEvents.some(
                      (ev) => ev.extendedProps?.isHoliday
                    )) && (
                    <span className="ml-2 text-red-600 text-xs font-normal">
                      (Holiday)
                    </span>
                  )}
                </h3>
              </div>
              {user.role !== "employee" && sidebarEvents.length > 0 && (
                <button
                  onClick={handleAddEvent}
                  className="text-[#104774] text-xs hover:text-[#0d3a61] self-start sm:self-center"
                >
                  + Add Event
                </button>
              )}
            </div>

            {sidebarEvents.length > 0 ? (
              <div className="space-y-2">
                {sidebarEvents.map((event, idx) => {
                  const eventStart = new Date(event.start);
                  const eventEnd = event.end ? new Date(event.end) : null;
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-md border ${getEventBgColor(
                        event.extendedProps?.category || "meeting"
                      )} ${
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
                            endDate:
                              event.extendedProps?.originalEndDate ||
                              event.start,
                            category:
                              event.extendedProps?.category || "meeting",
                          });
                          setOpen(true);
                        }
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-800 text-xs md:text-sm truncate">
                            {event.title}
                            {(event.extendedProps?.isSundayHoliday ||
                              event.extendedProps?.isHoliday) && (
                              <span className="ml-2 text-green-600 text-xs font-normal"></span>
                            )}
                          </h4>
                          {event.extendedProps?.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {event.extendedProps.description}
                            </p>
                          )}
                          <div className="text-xs text-gray-400 mt-1">
                            {eventStart.toLocaleDateString()}
                            {eventEnd &&
                              eventEnd > eventStart &&
                              ` to ${eventEnd.toLocaleDateString()}`}
                          </div>
                        </div>
                        <div
                          className="w-3 h-3 rounded-full ml-2 flex-shrink-0"
                          style={{
                            backgroundColor: getEventColor(
                              event.extendedProps?.category || "meeting"
                            ),
                          }}
                        />
                      </div>
                      {user.role !== "employee" &&
                        !event.extendedProps?.isSundayHoliday &&
                        !event.extendedProps?.isHoliday && (
                          <div className="text-xs text-[#104774] mt-2 hidden sm:block">
                            Click to edit
                          </div>
                        )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4">
                <Calendar size={32} className="text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-xs">No events scheduled</p>
                {user.role !== "employee" && (
                  <button
                    onClick={handleAddEvent}
                    className="text-[#104774] text-xs mt-2 hover:text-[#0d3a61]"
                  >
                    + Add Event
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-sm md:text-base font-semibold text-gray-800">
                {editingEvent ? "Edit Event" : "Add Event"}
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  placeholder="Enter event title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded-md p-2 text-xs md:text-sm focus:ring-2 focus:ring-[#104774] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Enter event description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full border border-slate-300 rounded-md p-2 text-xs md:text-sm focus:ring-2 focus:ring-[#104774] focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded-md p-2 text-xs md:text-sm focus:ring-2 focus:ring-[#104774] focus:border-transparent"
                >
                  <option value="meeting">Meeting</option>
                  <option value="deadline">Deadline</option>
                  <option value="event">Company Event</option>
                  <option value="leave">Leave Day</option>
                  <option value="holiday">Holiday</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={
                      formData.startDate ? formData.startDate.slice(0, 10) : ""
                    }
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-md p-2 text-xs md:text-sm focus:ring-2 focus:ring-[#104774] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                    End Date (optional)
                  </label>
                  <input
                    type="date"
                    value={
                      formData.endDate ? formData.endDate.slice(0, 10) : ""
                    }
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-md p-2 text-xs md:text-sm focus:ring-2 focus:ring-[#104774] focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 p-4 border-t">
              <button
                onClick={() => setOpen(false)}
                className="px-3 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 text-xs sm:text-sm order-2 sm:order-1"
              >
                Cancel
              </button>
              {editingEvent && (
                <button
                  onClick={handleDelete}
                  className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-xs sm:text-sm order-3 sm:order-2"
                >
                  Delete
                </button>
              )}
              <button
                onClick={handleSave}
                className="px-3 py-2 bg-[#104774] text-white rounded-md hover:bg-[#0d3a61] text-xs sm:text-sm order-1 sm:order-3"
              >
                {editingEvent ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
