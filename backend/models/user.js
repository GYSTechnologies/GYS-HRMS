import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["employee", "hr", "admin"],
      required: true,
      default: "employee",
    },
    profileRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: { type: Date },
    resetPasswordOtp: { type: String },
    resetPasswordOtpExpires: { type: Date },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", UserSchema);

export default User;