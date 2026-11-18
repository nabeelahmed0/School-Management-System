
import Teacher from "../models/Teacher.js";

// CREATE TEACHER
export const createTeacher = async (req, res) => {
  try {
    const {
      employeeId,
      name,
      email,
      phone,
      gender,
      dateOfBirth,
      qualification,
      subject,
      experience,
      salary,
      address,
      joiningDate,
    } = req.body;

    if (
      !employeeId ||
      !name ||
      !email ||
      !phone ||
      !gender ||
      !dateOfBirth ||
      !qualification ||
      !subject ||
      experience === undefined ||
      salary === undefined ||
      !address ||
      !joiningDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    const teacher = await Teacher.create(req.body);

    res.status(201).json({
      success: true,
      message: "Teacher created successfully",
      teacher,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Employee ID or email already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL TEACHERS WITH SEARCH, FILTER & PAGINATION
export const getTeachers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));

    const { search, subject, gender, status } = req.query;

    const skip = (page - 1) * limit;

    const filter = {};

    // SEARCH BY NAME, EMAIL OR EMPLOYEE ID
    if (search && search.trim()) {
      const keyword = search.trim();

      filter.$or = [
        { name: { $regex: keyword, $options: "i" } },
        { email: { $regex: keyword, $options: "i" } },
        { employeeId: { $regex: keyword, $options: "i" } },
      ];
    }

    // FILTER BY SUBJECT
    if (subject && subject.trim()) {
      filter.subject = subject.trim();
    }

    // FILTER BY GENDER
    if (gender && gender.trim()) {
      filter.gender = gender.trim();
    }

    // FILTER BY STATUS
    if (status && status.trim()) {
      filter.status = status.trim();
    }

    const totalTeachers = await Teacher.countDocuments(filter);

    const teachers = await Teacher.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      totalTeachers,
      currentPage: page,
      totalPages: Math.ceil(totalTeachers / limit),
      limit,
      teachers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SINGLE TEACHER
export const getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    res.status(200).json({
      success: true,
      teacher,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE TEACHER
export const updateTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Teacher updated successfully",
      teacher,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Employee ID or email already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE TEACHER
export const deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndDelete(req.params.id);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Teacher deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// SEARCH TEACHERS
export const searchTeachers = async (req, res) => {
  try {
    const { search } = req.query;

    if (!search || !search.trim()) {
      return res.status(400).json({
        success: false,
        message: "Search keyword is required",
      });
    }

    const teachers = await Teacher.find({
      $or: [
        { name: { $regex: search.trim(), $options: "i" } },
        { employeeId: { $regex: search.trim(), $options: "i" } },
        { email: { $regex: search.trim(), $options: "i" } },
      ],
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: teachers.length,
      teachers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
