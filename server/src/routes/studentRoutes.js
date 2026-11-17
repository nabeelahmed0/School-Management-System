import express from "express";

import {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  searchStudents,
} from "../controllers/studentController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Only admin can access student management APIs
router.use(protect, authorize("admin"));

// CREATE student
router.post("/", createStudent);

// GET all students
router.get("/", getStudents);

// SEARCH students
router.get("/search", searchStudents);
// GET single student
router.get("/:id", getStudentById);

// UPDATE student
router.put("/:id", updateStudent);

// DELETE student
router.delete("/:id", deleteStudent);

// GET single student
router.get("/:id", getStudentById);

export default router;
