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
import attendanceRoutes from "./routes/attendance.routes.js";
import payrollRoutes from "./routes/payroll.routes.js";
import departmentRoutes from "./routes/department.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";

import path from "path";
import { fileURLToPath } from "url";



// DB Connect
connectDB();

const app = express();


// app.use(cors({
//   origin: '*',
//   // credentials: true
// }));


// app.use(
//   cors({
//     origin: ["https://gys-hrms.vercel.app"],
//     credentials: true,
//   })
// );


import cors from 'cors';

const allowedOrigins = [
  "https://gys-hrms.vercel.app",
  "http://localhost:5173"
];

app.use(cors({
  origin: function(origin, callback){
    if(!origin) return callback(null, true); // for curl or mobile apps
    if(allowedOrigins.indexOf(origin) === -1){
      return callback(new Error("CORS not allowed from this origin"), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));

// ✅ Preflight request handle
app.options("*", cors());



app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//  router
app.use("/api/auth", authRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/leave", leaveRoutes);

app.use("/api/attendance", attendanceRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/departments", departmentRoutes);

app.use('/api/dashboard', dashboardRoutes);

app.use("/api/upload-files", uploadRoutes);



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// serve frontend build in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "../frontend/build", "index.html"))
  );
}


// Simple route
app.get("/", (req, res) => {
  res.send("Hello Backend 🚀");
});

// Port
// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server is running on PORT ${PORT}`);
// });

