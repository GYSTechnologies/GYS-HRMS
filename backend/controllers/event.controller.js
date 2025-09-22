import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Event from "../models/companyCalendar.js";

/**
 * Helper - validate ISO date or timestamp (null/undefined allowed for optional endDate)
 * Accepts Date/string/number. Returns boolean.
 */
const isValidDate = (d) => {
  if (!d) return false;
  // Accept Date objects too
  if (d instanceof Date && !Number.isNaN(d.getTime())) return true;
  const parsed = Date.parse(d);
  return !Number.isNaN(parsed);
};

/**
 * Convert incoming value to Date or null
 */
const toDateOrNull = (v) => {
  if (!v) return null;
  return new Date(v);
};

/**
 * Helper - check if event is an imported Google holiday (protected)
 */
const isImportedHoliday = (event) => {
  return !!(event && (event.source === "google" || event.isHoliday === true || event.externalId));
};

// ---------- Create event (admin/hr) ----------
export const createEvent = asyncHandler(async (req, res) => {
  const { title, description, startDate, endDate, category } = req.body;

  if (!title || !startDate) {
    res.status(400);
    throw new Error("title and startDate are required");
  }

  if (!isValidDate(startDate)) {
    res.status(400);
    throw new Error("Invalid startDate");
  }

  if (endDate && !isValidDate(endDate)) {
    res.status(400);
    throw new Error("Invalid endDate");
  }

  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;
  if (end && end < start) {
    res.status(400);
    throw new Error("endDate cannot be before startDate");
  }

  // sanitize category - fallback to 'meeting' if missing/invalid
  const allowed = ["meeting", "deadline", "event", "leave", "holiday"];
  const cat = allowed.includes(category) ? category : "meeting";

  // if category is holiday, mark isHoliday true
  const isHoliday = cat === "holiday" ? true : false;

  const event = await Event.create({
    title: title.trim(),
    description: description?.trim() || "",
    startDate: start,
    endDate: end,
    createdBy: req.user._id,
    category: cat,
    isHoliday,
    source: "manual", // always manual when created via API
  });

  // populate createdBy for frontend
  const populated = await Event.findById(event._id).populate("createdBy", "name email role");

  res.status(201).json({ event: populated });
});

// ---------- Get all events (with optional overlapping date filter) ----------
export const getAllEvents = asyncHandler(async (req, res) => {
  const { from, to, page = 1, limit = 100 } = req.query;
  const query = {};

  // If user passes from/to, we find events that overlap the interval:
  // event.startDate <= to AND (event.endDate >= from OR event.endDate is null)
  if (from || to) {
    let fromDate = from && isValidDate(from) ? new Date(from) : null;
    let toDate = to && isValidDate(to) ? new Date(to) : null;

    // Default to wide bounds if one side is missing
    if (!fromDate && toDate) {
      // include anything that starts on or before toDate
      query.startDate = { $lte: toDate };
    } else if (fromDate && !toDate) {
      // include anything that ends on or after fromDate OR starts on/after fromDate
      query.$or = [
        { endDate: { $gte: fromDate } },
        { endDate: { $exists: false } },
        { startDate: { $gte: fromDate } },
      ];
    } else if (fromDate && toDate) {
      // overlapping condition
      query.$and = [
        { startDate: { $lte: toDate } }, // starts on/before to
        {
          $or: [
            { endDate: { $gte: fromDate } }, // ends on/after from
            { endDate: { $exists: false } }, // or no end (single-day)
          ],
        },
      ];
    }
  }

  const parsedLimit = Math.min(parseInt(limit, 10) || 100, 1000);
  const parsedPage = Math.max(parseInt(page, 10) || 1, 1);

  const total = await Event.countDocuments(query);
  const events = await Event.find(query)
    .sort({ startDate: 1 })
    .skip((parsedPage - 1) * parsedLimit)
    .limit(parsedLimit)
    .populate("createdBy", "name email role")
    .lean();

  res.json({
    meta: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      pages: Math.ceil(total / parsedLimit),
    },
    events,
  });
});

// ---------- Get event by id ----------
export const getEventById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid event id");
  }

  const event = await Event.findById(id).populate("createdBy", "name email role");
  if (!event) {
    res.status(404);
    throw new Error("Event not found");
  }
  res.json({ event });
});

// ---------- Update event ----------
export const updateEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, startDate, endDate, category } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid event id");
  }

  const event = await Event.findById(id);
  if (!event) {
    res.status(404);
    throw new Error("Event not found");
  }

  // Protect imported Google holidays from being edited by non-admins
  if (isImportedHoliday(event) && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Imported/public holidays cannot be edited");
  }

  if (startDate && !isValidDate(startDate)) {
    res.status(400);
    throw new Error("Invalid startDate");
  }
  if (endDate && !isValidDate(endDate)) {
    res.status(400);
    throw new Error("Invalid endDate");
  }

  if (startDate) event.startDate = new Date(startDate);
  if (typeof title !== "undefined") event.title = title.trim();
  if (typeof description !== "undefined") event.description = description?.trim() || "";

  // Category handling
  const allowed = ["meeting", "deadline", "event", "leave", "holiday"];
  if (typeof category !== "undefined") {
    event.category = allowed.includes(category) ? category : event.category;
    // if category set to 'holiday' mark isHoliday true
    if (event.category === "holiday") event.isHoliday = true;
  }

  // If endDate passed explicitly as null/empty, keep previous end or clear it intentionally?
  event.endDate = endDate ? new Date(endDate) : event.endDate;

  if (event.endDate && event.endDate < event.startDate) {
    res.status(400);
    throw new Error("endDate cannot be before startDate");
  }

  const updated = await event.save();
  const populated = await Event.findById(updated._id).populate("createdBy", "name email role");
  res.json({ event: populated });
});

// ---------- Delete event ----------
export const deleteEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid event id");
  }

  const event = await Event.findById(id);
  if (!event) {
    res.status(404);
    throw new Error("Event not found");
  }

  // Protect imported Google holidays from being deleted by non-admins
  if (isImportedHoliday(event) && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Imported/public holidays cannot be deleted");
  }

  await event.deleteOne();
  res.json({ message: "Event removed" });
});
