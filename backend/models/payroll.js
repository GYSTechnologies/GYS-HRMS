import mongoose from "mongoose";

const PayrollSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },
    basic: { type: Number, required: true },
    hra: { type: Number, default: 0 },
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
    tax: { type: Number, default: 0 },
    month: { type: String, required: true }, // Format: '2025-01'
    year: { type: Number },
    absentDays: { type: Number, default: 0 },
    absentDeduction: { type: Number, default: 0 },
    totalEarnings: { type: Number },
    totalDeductions: { type: Number },
    netPay: { type: Number },

    // Status and approvals
    status: {
      type: String,
      enum: ["draft", "pending_approval", "approved", "rejected"],
      default: "draft",
    },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
    rejectionReason: { type: String },

    presentDays: { type: Number, default: 0 }, // Actual days present
    leaveDays: { type: Number, default: 0 }, // Total approved leaves
    workingDays: { type: Number }, // Total working days in month

    //  PAYSLIP FIELD - CRITICAL
    payslipPath: { type: String }, // Stores the path to generated PDF
  },
  { timestamps: true }
);

// Virtuals for population
PayrollSchema.virtual("employeeProfile", {
  ref: "Profile",
  localField: "employee",
  foreignField: "_id",
  justOne: true,
});

PayrollSchema.virtual("generatedByUser", {
  ref: "User",
  localField: "generatedBy",
  foreignField: "_id",
  justOne: true,
});

PayrollSchema.virtual("approvedByUser", {
  ref: "User",
  localField: "approvedBy",
  foreignField: "_id",
  justOne: true,
});

export default mongoose.model("Payroll", PayrollSchema);
