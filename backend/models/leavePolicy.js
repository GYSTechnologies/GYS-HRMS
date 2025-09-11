// import mongoose from "mongoose";

// const leavePolicySchema = new mongoose.Schema({
//   role: { 
//     type: String, 
//     enum: ["hr", "employee", "admin"], 
//     required: true 
//   },
//   leaves: {
//     casual: { type: Number, default: 0, min: 0 },
//     sick: { type: Number, default: 0, min: 0 },
//     paid: { type: Number, default: 0, min: 0 },
//   },
//   year: { 
//     type: Number, 
//     required: true,
//     validate: {
//       validator: function(v) {
//         return v >= 2000 && v <= 2100;
//       },
//       message: "Year must be between 2000 and 2100"
//     }
//   }
// }, { 
//   timestamps: true,
//   // Ensure only one policy per role per year
//   unique: [["role", "year"], "Policy for this role and year already exists"]
// });

// export default mongoose.model("LeavePolicy", leavePolicySchema);


// models/leavePolicy.js
import mongoose from "mongoose";

const leavePolicySchema = new mongoose.Schema({
  role: { 
    type: String, 
    enum: ["hr", "employee", "admin"], 
    required: true 
  },
  leaves: {
    type: Map,
    of: Number,
    default: () => new Map()
  },
  year: { 
    type: Number, 
    required: true,
    validate: {
      validator: function(v) {
        return v >= 2000 && v <= 2100;
      },
      message: "Year must be between 2000 and 2100"
    }
  }
}, { 
  timestamps: true,
  unique: [["role", "year"], "Policy for this role and year already exists"]
});

export default mongoose.model("LeavePolicy", leavePolicySchema);