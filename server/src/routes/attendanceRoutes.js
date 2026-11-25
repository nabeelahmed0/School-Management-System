import express from "express";

import {
  getStudentsForAttendance,
  saveAttendance,
  updateAttendance,
} from "../controllers/attendanceController.js";

const router = express.Router();

// Get students for attendance
router.get("/students", getStudentsForAttendance);

// Save attendance
router.post("/", saveAttendance);

// Update attendance
router.put("/:id", updateAttendance);

export default router;
