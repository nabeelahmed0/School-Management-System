import SchoolClass from "../models/Class.js";
import Teacher from "../models/Teacher.js";

// CREATE CLASS
export const createClass = async (req, res) => {
  try {
    const {
      className,
      section,
      classTeacher,
      roomNumber,
      capacity,
      academicYear,
    } = req.body;

    if (
      !className ||
      !section ||
      !classTeacher ||
      !roomNumber ||
      capacity === undefined ||
      !academicYear
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    const teacherExists = await Teacher.findById(classTeacher);

    if (!teacherExists) {
      return res.status(404).json({
        success: false,
        message: "Selected teacher not found",
      });
    }

    const schoolClass = await SchoolClass.create(req.body);

    const populatedClass = await SchoolClass.findById(schoolClass._id).populate(
      "classTeacher",
      "name employeeId subject",
    );

    res.status(201).json({
      success: true,
      message: "Class created successfully",
      schoolClass: populatedClass,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This class, section and academic year already exist",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL CLASSES WITH SEARCH, FILTER & PAGINATION
export const getClasses = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);

    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));

    const { search, section, academicYear, status } = req.query;

    const skip = (page - 1) * limit;
    const filter = {};

    // SEARCH BY CLASS NAME OR ROOM NUMBER
    if (search && search.trim()) {
      const keyword = search.trim();

      filter.$or = [
        { className: { $regex: keyword, $options: "i" } },
        { section: { $regex: keyword, $options: "i" } },
        { roomNumber: { $regex: keyword, $options: "i" } },
      ];
    }

    // FILTER BY SECTION
    if (section && section.trim()) {
      filter.section = section.trim().toUpperCase();
    }

    // FILTER BY ACADEMIC YEAR
    if (academicYear && academicYear.trim()) {
      filter.academicYear = academicYear.trim();
    }

    // FILTER BY STATUS
    if (status && status.trim()) {
      filter.status = status.trim();
    }

    const totalClasses = await SchoolClass.countDocuments(filter);

    const classes = await SchoolClass.find(filter)
      .populate("classTeacher", "name employeeId subject")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      totalClasses,
      currentPage: page,
      totalPages: Math.ceil(totalClasses / limit),
      limit,
      classes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SINGLE CLASS
export const getClassById = async (req, res) => {
  try {
    const schoolClass = await SchoolClass.findById(req.params.id).populate(
      "classTeacher",
      "name employeeId subject",
    );

    if (!schoolClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    res.status(200).json({
      success: true,
      schoolClass,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE CLASS
export const updateClass = async (req, res) => {
  try {
    if (req.body.classTeacher) {
      const teacherExists = await Teacher.findById(req.body.classTeacher);

      if (!teacherExists) {
        return res.status(404).json({
          success: false,
          message: "Selected teacher not found",
        });
      }
    }

    const schoolClass = await SchoolClass.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    ).populate("classTeacher", "name employeeId subject");

    if (!schoolClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Class updated successfully",
      schoolClass,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This class, section and academic year already exist",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE CLASS
export const deleteClass = async (req, res) => {
  try {
    const schoolClass = await SchoolClass.findByIdAndDelete(req.params.id);

    if (!schoolClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Class deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
