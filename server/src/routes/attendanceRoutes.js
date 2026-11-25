import express from "express";

import {
  getStudentsForAttendance,
  saveAttendance,
  updateAttendance,
  getAttendanceRecords,
  getAttendanceSummary,
} from "../controllers/attendanceController.js";
const router = express.Router();

router.get("/students", getStudentsForAttendance);
router.get("/records", getAttendanceRecords);
router.get("/summary", getAttendanceSummary);
router.post("/", saveAttendance);
router.put("/:id", updateAttendance);

export default router;
