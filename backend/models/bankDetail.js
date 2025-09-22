import mongoose from "mongoose";

const BankDetailSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
      unique: true,
    },
    accountHolderName: {
      type: String,
      required: true,
      trim: true,
    },
    accountNumberEncrypted: {
      type: String,
      required: true, // encrypted form  save 
    },
    last4: {
      type: String,
      required: true, //  last 4 digits plain
    },
    bankName: {
      type: String,
      required: true,
      trim: true,
    },
    ifscCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    accountType: {
      type: String,
      enum: ["savings", "current", "other"],
      default: "savings",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const BankDetail = mongoose.model("BankDetail", BankDetailSchema);

export default BankDetail;
