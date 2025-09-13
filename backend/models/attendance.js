// import mongoose from "mongoose";

// const AttendanceSchema = new mongoose.Schema(
//   {
//     employee: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     date: {
//       type: Date,
//       required: true,
//     },
//     status: {
//       type: String,
//       enum: ["pending", "accepted", "rejected"],
//       default: "pending",
//     },
//     checkIn: {
//       type: Date,
//     },
//     checkOut: {
//       type: Date,
//     },
//     taskDescription: {
//       type: String,
//     },
//     workProgress: {
//       type: String,
//       enum: ["Planned", "In Progress", "Completed"],
//       default: "Planned",
//     },
//     logoutDescription: {
//       type: String,
//     },
//     earlyLogoutReason: {
//       type: String,
//     },
//     remarks: {
//       type: String,
//     },
//     approvedBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Attendance", AttendanceSchema);

import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    checkIn: {
      type: Date,
    },
    checkOut: {
      type: Date,
    },
    taskDescription: {
      type: String,
    },
    workProgress: {
      type: String,
      enum: ["Planned", "In Progress", "Completed"],
      default: "Planned",
    },
    logoutDescription: {
      type: String,
    },
    earlyLogoutReason: {
      type: String,
    },
    remarks: {
      type: String,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // New fields for regularization
    isRegularization: {
      type: Boolean,
      default: false,
    },
    regularizationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
    },
    regularizationReason: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Attendance", AttendanceSchema);
