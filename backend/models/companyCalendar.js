import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // New fields
    category: {
      type: String,
      enum: ["meeting", "deadline", "event", "leave", "holiday"],
      default: "meeting",
    },
    isHoliday: { type: Boolean, default: false }, // true for official/public holidays
    source: { type: String, default: "manual" }, // "manual" or "google" or "import"
    externalId: { type: String }, // Google Calendar event ID for deduplication
  },
  { timestamps: true }
);


const Event = mongoose.model("Event", EventSchema);

export default Event;
