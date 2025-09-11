import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },
    date: {
      // date for the attendance entry (normalized to 00:00 UTC)
      type: String, // YYYY-MM-DD (string makes querying per-day easy)
      required: true,
    },
    loginAt: { type: Date },
    logoutAt: { type: Date },
    loginTask: { type: String }, // "what you will do today"
    logoutSummary: { type: String }, // "what you did today"
    status: {
      type: String,
      enum: ["present", "absent", "on-leave", "half-day"],
      default: "present",
    },
    corrections: [
      {
        editor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        reason: String,
        correctedAt: Date,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Attendance = mongoose.model("Attendance", AttendanceSchema);

export default Attendance;
