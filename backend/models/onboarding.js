// import mongoose from "mongoose";

// const OnboardingSchema = new mongoose.Schema(
//   {
//     employee: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Profile",
//       required: true,
//     },
//     steps: [
//       {
//         key: String, // e.g., 'submit_documents'
//         title: String,
//         completed: {
//           type: Boolean,
//           default: false,
//         },
//         completedAt: Date,
//         meta: Object,
//       },
//     ],
//     startedAt: {
//       type: Date,
//       default: Date.now,
//     },
//     completedAt: Date,
//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// const Onboarding = mongoose.model("Onboarding", OnboardingSchema);

// export default Onboarding;
