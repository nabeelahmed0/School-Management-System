import Student from "../models/Student.js";

// CREATE STUDENT
export const createStudent = async (req, res) => {
  try {
    const {
      admissionNumber,
      name,
      email,
      phone,
      gender,
      dateOfBirth,
      className,
      address,
      guardianName,
      guardianPhone,
    } = req.body;

    if (
      !admissionNumber ||
      !name ||
      !phone ||
      !gender ||
      !dateOfBirth ||
      !className ||
      !address ||
      !guardianName ||
      !guardianPhone
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    const student = await Student.create(req.body);

    res.status(201).json({
      success: true,
      message: "Student created successfully",
      student,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Admission number already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL STUDENTS

// GET ALL STUDENTS WITH PAGINATION

// GET ALL STUDENTS WITH SEARCH, FILTER & PAGINATION
export const getStudents = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));

    const { search, className, gender } = req.query;

    const skip = (page - 1) * limit;

    const filter = {};

    // SEARCH BY NAME, EMAIL OR ADMISSION NUMBER
    if (search && search.trim()) {
      const keyword = search.trim();

      filter.$or = [
        { name: { $regex: keyword, $options: "i" } },
        { email: { $regex: keyword, $options: "i" } },
        { admissionNumber: { $regex: keyword, $options: "i" } },
      ];
    }

    // FILTER BY CLASS
    if (className && className.trim()) {
      filter.className = className.trim();
    }

    if (gender && gender.trim()) {
      filter.gender = gender.trim();
    }

    const totalStudents = await Student.countDocuments(filter);

    const students = await Student.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      totalStudents,
      currentPage: page,
      totalPages: Math.ceil(totalStudents / limit),
      limit,
      students,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SINGLE STUDENT
export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE STUDENT
export const updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Student updated successfully",
      student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE STUDENT
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const searchStudents = async (req, res) => {
  try {
    const { search } = req.query;

    if (!search || !search.trim()) {
      return res.status(400).json({
        success: false,
        message: "Search keyword is required",
      });
    }

    const students = await Student.find({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { admissionNumber: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
