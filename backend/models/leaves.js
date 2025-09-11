// import mongoose from "mongoose";

// const LeaveRequestSchema = new mongoose.Schema(
//   {
//     employee: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Profile",
//       required: true,
//     },
//     leaveType: {
//       type: String,
//       //   enum: ["sick", "casual", "earned", "unpaid", "comp-off"],
//       enum: ["sick", "casual", "earned"],

//       required: true,
//     },
//     startDate: {
//       type: Date,
//       required: true,
//     },
//     endDate: {
//       type: Date,
//       required: true,
//     },
//     totalDays: {
//       type: Number,
//       required: true,
//     },
//     reason: { type: String },
//     status: {
//       type: String,
//       enum: ["pending", "approved", "rejected", "cancelled"],
//       default: "pending",
//     },
//     appliedAt: {
//       type: Date,
//       default: Date.now,
//     },
//     processedBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User", // HR/Admin
//     },
//     processedAt: { type: Date },
//     remarks: { type: String },
//   },
//   {
//     timestamps: true,
//   }
// );

// const LeaveRequest = mongoose.model("LeaveRequest", LeaveRequestSchema);

// export default LeaveRequest;

// models/LeaveRequest.js
// import mongoose from "mongoose";

// const LeaveRequestSchema = new mongoose.Schema(
//   {
//     employee: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User", // now references User so we can access role, email, etc.
//       required: true,
//       //  ref: "Profile",
//       // required: true,
//     },
//     leaveType: {
//       type: String,
//       enum: ["sick", "casual", "paid"],
//       required: true,
//     },
//     fromDate: { type: Date, required: true },
//     toDate: { type: Date, required: true },
//     totalDays: { type: Number, required: true },
//     reason: { type: String },
//     status: {
//       type: String,
//       enum: ["pending", "approved", "rejected", "cancelled"],
//       default: "pending",
//     },
//     appliedAt: { type: Date, default: Date.now },
//     processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // HR/Admin who processed
//     processedAt: { type: Date },
//     remarks: { type: String }, // review remarks
//     // optional snapshot of remaining at time of request (helps auditing)
//     balanceSnapshot: {
//       type: Object,
//       default: null,
//     },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("LeaveRequest", LeaveRequestSchema);



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