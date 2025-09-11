import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import employeeRoutes from "./routes/employee.routes.js";
import uploadRoutes from "./routes/upload.route.js";
import eventRoutes from "./routes/event.routes.js";
import leaveRoutes from "./routes/leave.routes.js";

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/user.js";

// DB Connect
connectDB();

const app = express();

// 👉 Seed function (run only once)
// const seedUsers = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI);

//     // Clear old users
//     await User.deleteMany();

//     const hashedPassword = await bcrypt.hash("123456", 10);

//     await User.insertMany([
//       {
//         name: "Super Admin",
//         email: "admin@gmail.com",
//         password: hashedPassword,
//         role: "admin",
//       },
//       {
//         name: "HR Manager",
//         email: "hr@gmail.com",
//         password: hashedPassword,
//         role: "hr",
//       },
//       {
//         name: "Employee One",
//         email: "em1@gmail.com",
//         password: hashedPassword,
//         role: "employee",
//       },
//     ]);

//     console.log("Users seeded ✅");
//     process.exit();
//   } catch (error) {
//     console.error(error);
//     process.exit(1);
//   }
// };

//  seedUsers();

// Middleware (JSON parse)
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//  router
app.use("/api/auth", authRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/leave", leaveRoutes);

app.use("/api/upload-files", uploadRoutes);

// Simple route
app.get("/", (req, res) => {
  res.send("Hello Backend 🚀");
});

// Port
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on PORT ${PORT}`);
});
