import mongoose from "mongoose";

const LeaveRequestSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    leaveType: {
      type: String,
      enum: ["sick", "casual", "paid"],
      required: true,
    },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    totalDays: { type: Number, required: true },
    reason: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
    },
    appliedAt: { type: Date, default: Date.now },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    processedAt: { type: Date },
    remarks: { type: String },
    balanceSnapshot: {
      year: { type: Number },
      remaining: {
        casual: { type: Number },
        sick: { type: Number },
        paid: { type: Number }
      }
    },
  },
  { timestamps: true }
);

export default mongoose.model("LeaveRequest", LeaveRequestSchema);