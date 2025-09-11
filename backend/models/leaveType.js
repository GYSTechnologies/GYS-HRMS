// models/leaveType.js
import mongoose from "mongoose";

const leaveTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Pre-save middleware to convert name to lowercase
leaveTypeSchema.pre('save', function(next) {
  this.name = this.name.toLowerCase().replace(/\s+/g, '_');
  next();
});

export default mongoose.model("LeaveType", leaveTypeSchema);