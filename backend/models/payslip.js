import mongoose from "mongoose";

const PayslipSchema = new mongoose.Schema(
  {
    payrollRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payroll",
      required: true,
      unique: true,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },
    month: {
      type: String, // e.g. '2025-09'
      required: true,
    },
    pdfUrl: { type: String }, // stored generated PDF URL
    downloadedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

const Payslip = mongoose.model("Payslip", PayslipSchema);

export default Payslip;
