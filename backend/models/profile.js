import mongoose from "mongoose";

const ProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    employeeId: {
      type: String, // e.g., EMP001
      unique: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    dob: { type: Date },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other",
    },
    address: {
      type: String,
    },
    designation: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    dateOfJoining: { type: Date },
    documents: [
      {
        name: String,
        url: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    avatarUrl: { type: String },

    employmentType: {
      type: String,
      enum: ["full-time", "intern", "part-time", "contract"],
      default: "full-time",
    },
    shiftTiming: {
      start: { type: String }, // e.g., "09:00 AM"
      end: { type: String }, // e.g., "06:00 PM"
    },
    workMode: {
      type: String,
      enum: ["work-from-home", "work-from-office", "hybrid"],
      default: "work-from-home",
    },

    roleMeta: {
      reportsTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Profile",
      },
      permissions: [String],
    },
  },
  {
    timestamps: true,
  }
);

const Profile = mongoose.model("Profile", ProfileSchema);

export default Profile;
