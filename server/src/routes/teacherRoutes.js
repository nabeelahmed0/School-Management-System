
import express from "express";

import {
  createTeacher,
  getTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
  searchTeachers,
} from "../controllers/teacherController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Only admin can access teacher management APIs
router.use(protect, authorize("admin"));

// CREATE teacher
router.post("/", createTeacher);

// GET all teachers with search, filter & pagination
router.get("/", getTeachers);

// SEARCH teachers
router.get("/search", searchTeachers);

// GET single teacher
router.get("/:id", getTeacherById);

// UPDATE teacher
router.put("/:id", updateTeacher);

// DELETE teacher
router.delete("/:id", deleteTeacher);

export default router;
