
import Attendance from "../models/Attendance.js";
import Student from "../models/Student.js";
import SchoolClass from "../models/Class.js";

// GET: Load students for attendance
export const getStudentsForAttendance = async (req, res) => {
  try {
    const { className, section } = req.query;

    if (!className || !section) {
      return res.status(400).json({
        message: "Class and section are required",
      });
    }

    const students = await Student.find({
      className,
      section,
      status: "Active",
    }).select("_id admissionNumber name className section");

    res.status(200).json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// POST: Save attendance
export const saveAttendance = async (req, res) => {
  try {
    const { className, section, academicYear, date, students } = req.body;

    if (!className || !section || !academicYear || !date || !Array.isArray(students) || students.length === 0) {
      return res.status(400).json({
        message: "All attendance fields are required",
      });
    }

    const classExists = await SchoolClass.findOne({
      className,
      section,
      academicYear,
      status: "Active",
    });

    if (!classExists) {
      return res.status(404).json({
        message: "Class not found",
      });
    }

    const normalizedDate = new Date(date);

    if (Number.isNaN(normalizedDate.getTime())) {
      return res.status(400).json({
        message: "Invalid attendance date",
      });
    }

    const studentIds = students.map((item) => item.student);

    if (
      studentIds.some((id) => !id) ||
      new Set(studentIds.map(String)).size !== studentIds.length
    ) {
      return res.status(400).json({
        message: "Invalid or duplicate student IDs",
      });
    }

    const validStudents = await Student.find({
      _id: { $in: studentIds },
      className,
      section,
      status: "Active",
    }).select("_id");

    if (validStudents.length !== students.length) {
      return res.status(400).json({
        message: "Some students do not belong to this class and section",
      });
    }

    const attendanceStudents = students.map((item) => ({
      student: item.student,
      status: item.status || "Present",
      remarks: item.remarks || "",
    }));

    const attendance = await Attendance.findOneAndUpdate(
      {
        className,
        section,
        academicYear,
        date: {
          $gte: new Date(normalizedDate.setUTCHours(0, 0, 0, 0)),
          $lt: new Date(normalizedDate.setUTCHours(24, 0, 0, 0)),
        },
      },
      {
        $set: {
          students: attendanceStudents,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Attendance saved successfully",
      attendance,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Attendance already exists. Please try again.",
      });
    }

    res.status(500).json({
      message: error.message,
    });
  }
};

// PUT: Update attendance
export const updateAttendance = async (req, res) => {
  try {
    const { students } = req.body;

    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({
        message: "Students attendance is required",
      });
    }

    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        message: "Attendance record not found",
      });
    }

    const studentIds = students.map((item) => item.student);

    if (
      studentIds.some((id) => !id) ||
      new Set(studentIds.map(String)).size !== studentIds.length
    ) {
      return res.status(400).json({
        message: "Invalid or duplicate student IDs",
      });
    }

    const validStudents = await Student.find({
      _id: { $in: studentIds },
      className: attendance.className,
      section: attendance.section,
      status: "Active",
    }).select("_id");

    if (validStudents.length !== students.length) {
      return res.status(400).json({
        message: "Some students do not belong to this class and section",
      });
    }

    attendance.students = students.map((item) => ({
      student: item.student,
      status: item.status || "Present",
      remarks: item.remarks || "",
    }));

    await attendance.save();

    res.status(200).json({
      success: true,
      message: "Attendance updated successfully",
      attendance,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
