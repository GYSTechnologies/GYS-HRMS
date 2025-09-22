// routes/eventRoutes.js
import express from "express";
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from "../controllers/event.controller.js";
import { checkDateIsHoliday,getWorkingDaysForRange } from "../controllers/holiday.controller.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/check-holiday", protect, checkDateIsHoliday);
router.get("/working-days", protect, getWorkingDaysForRange);


router.route("/")
  .post(protect, authorizeRoles("admin", "hr"), createEvent)
  .get(protect, getAllEvents);

router.route("/:id")
  .get(protect, getEventById)
  .put(protect, authorizeRoles("admin", "hr"), updateEvent)
  .delete(protect, authorizeRoles("admin", "hr"), deleteEvent);

export default router;
