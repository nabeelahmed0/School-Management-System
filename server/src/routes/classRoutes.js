import express from "express";

import {
  createClass,
  getClasses,
  getClassById,
  updateClass,
  deleteClass,
} from "../controllers/classController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Only admin can manage classes
router.use(protect, authorize("admin"));

// CREATE class
router.post("/", createClass);

// GET all classes with search, filter & pagination
router.get("/", getClasses);

// GET single class
router.get("/:id", getClassById);

// UPDATE class
router.put("/:id", updateClass);

// DELETE class
router.delete("/:id", deleteClass);

export default router;
