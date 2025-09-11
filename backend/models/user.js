import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true, // already creates an index internally
      lowercase: true,
      trim: true,
    },
    password: {
      type: String, // hashed password
      required: true,
    },
    role: {
      type: String, // 'employee' | 'hr' | 'admin'
      enum: ["employee", "hr", "admin"],
      required: true,
      default: "employee",
    },
    profileRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile", // single Profile collection for basic info
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", UserSchema);

export default User;
