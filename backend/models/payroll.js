import mongoose from "mongoose";

const PayrollSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },
    basic: {
      type: Number,
      required: true,
    },
    hra: {
      type: Number,
      default: 0,
    },
    allowances: [
      {
        title: String,
        amount: Number,
      },
    ],
    deductions: [
      {
        title: String,
        amount: Number,
      },
    ],
    tax: {
      type: Number,
      default: 0,
    },
    month: {
      type: String, // e.g. '2025-09'
      required: true,
    },
    totalEarnings: { type: Number },
    totalDeductions: { type: Number },
    netPay: { type: Number },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["draft", "finalized"],
      default: "draft",
    },
  },
  {
    timestamps: true,
  }
);

const Payroll = mongoose.model("Payroll", PayrollSchema);

export default Payroll;
