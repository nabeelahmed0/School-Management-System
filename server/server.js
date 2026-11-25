import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDb from "./src/config/db.js";

import authRoutes from "./src/routes/authRoutes.js";
import studentRoutes from "./src/routes/studentRoutes.js";
import teacherRoutes from "./src/routes/teacherRoutes.js";
import classRoutes from "./src/routes/classRoutes.js";

import attendanceRoutes from "./src/routes/attendanceRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  }),
);

// Auth Routes
app.use("/api/auth", authRoutes);

// Student Routes
app.use("/api/students", studentRoutes);

// Teacher Routes
app.use("/api/teachers", teacherRoutes);

// Classes Routes
app.use("/api/classes", classRoutes);

//attendance Routes
app.use("/api/attendance", attendanceRoutes);

// Home Route
app.get("/", (req, res) => {
  res.json({
    status: "true",
    message: "School Management System is running",
  });
});

// Start Server
const startServer = async () => {
  try {
    await connectDb();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.log(error.message);
  }
};

startServer();
