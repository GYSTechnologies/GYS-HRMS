// controllers/eventController.js
import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Event from "../models/companyCalendar.js";

/**
 * Helper - validate ISO date or timestamp (null/undefined allowed for optional endDate)
 */
const isValidDate = (d) => {
  if (!d) return false;
  const parsed = Date.parse(d);
  return !Number.isNaN(parsed);
};

//create event by admin/hr
export const createEvent = asyncHandler(async (req, res) => {
  const { title, description, startDate, endDate } = req.body;

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

  const event = await Event.create({
    title: title.trim(),
    description: description?.trim() || "",
    startDate: start,
    endDate: end,
    createdBy: req.user._id,
  });

  res.status(201).json(event);
});

//get all events
export const getAllEvents = asyncHandler(async (req, res) => {
  const { from, to, page = 1, limit = 100 } = req.query;
  const query = {};

  if (from || to) {
    query.startDate = {};
    if (from && isValidDate(from)) query.startDate.$gte = new Date(from);
    if (to && isValidDate(to)) query.startDate.$lte = new Date(to);
  }

  const parsedLimit = Math.min(parseInt(limit, 10) || 100, 1000);
  const parsedPage = Math.max(parseInt(page, 10) || 1, 1);

  const total = await Event.countDocuments(query);
  const events = await Event.find(query)
    .sort({ startDate: 1 })
    .skip((parsedPage - 1) * parsedLimit)
    .limit(parsedLimit)
    .populate("createdBy", "name email role"); // optional: lean this if you prefer

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


//get  events by id
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
  res.json(event);
});

//update events
export const updateEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, startDate, endDate } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid event id");
  }

  const event = await Event.findById(id);
  if (!event) {
    res.status(404);
    throw new Error("Event not found");
  }

  // Optional: restrict update to creator only
  // if (!event.createdBy.equals(req.user._id) && req.user.role !== "admin") { ... }

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
  event.endDate = endDate ? new Date(endDate) : event.endDate;

  if (event.endDate && event.endDate < event.startDate) {
    res.status(400);
    throw new Error("endDate cannot be before startDate");
  }

  const updated = await event.save();
  res.json(updated);
});


//delete events
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

  // Optional: only creator or admin
  // if (!event.createdBy.equals(req.user._id) && req.user.role !== "admin") { ... }

  await event.deleteOne();
  res.json({ message: "Event removed" });
});
