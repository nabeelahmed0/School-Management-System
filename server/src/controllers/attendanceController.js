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

    if (
      !className ||
      !section ||
      !academicYear ||
      !date ||
      !Array.isArray(students) ||
      students.length === 0
    ) {
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

    const normalizedDate = new Date(`${date}T00:00:00.000Z`);

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
        date: normalizedDate,
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
        setDefaultsOnInsert: true,
      },
    );

    return res.status(200).json({
      success: true,
      message: "Attendance saved successfully",
      attendance,
    });
  } catch (error) {
    console.error("Save Attendance Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Attendance record conflict. Please try again.",
      });
    }

    return res.status(500).json({
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

// GET: All Attendance Records with Search, Filters and Pagination
export const getAttendanceRecords = async (req, res) => {
  try {
    const {
      className,
      section,
      date,
      status,
      page = 1,
      limit = 10,
    } = req.query;

    const currentPage = Math.max(1, parseInt(page) || 1);
    const pageLimit = Math.min(100, Math.max(1, parseInt(limit) || 10));

    const filter = {};

    if (className) {
      filter.className = className;
    }

    if (section) {
      filter.section = section;
    }

    if (date) {
      const selectedDate = new Date(date);

      if (Number.isNaN(selectedDate.getTime())) {
        return res.status(400).json({
          message: "Invalid date",
        });
      }

      const startDate = new Date(selectedDate);
      startDate.setUTCHours(0, 0, 0, 0);

      const endDate = new Date(startDate);
      endDate.setUTCDate(endDate.getUTCDate() + 1);

      filter.date = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    if (status) {
      if (!["Present", "Absent", "Late", "Leave"].includes(status)) {
        return res.status(400).json({
          message: "Invalid attendance status",
        });
      }

      filter["students.status"] = status;
    }

    const totalRecords = await Attendance.countDocuments(filter);

    const records = await Attendance.find(filter)
      .populate("students.student", "name admissionNumber")
      .sort({ date: -1 })
      .skip((currentPage - 1) * pageLimit)
      .limit(pageLimit);

    res.status(200).json({
      success: true,
      totalRecords,
      currentPage,
      totalPages: Math.ceil(totalRecords / pageLimit),
      limit: pageLimit,
      records,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
// GET: Attendance Summary
export const getAttendanceSummary = async (req, res) => {
  try {
    const { className, section, academicYear, date } = req.query;

    if (!className || !section || !academicYear || !date) {
      return res.status(400).json({
        success: false,
        message: "Class, section, academic year and date are required",
      });
    }

    const selectedDate = new Date(date);

    if (Number.isNaN(selectedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date",
      });
    }

    // Selected day's UTC date range
    const startDate = new Date(selectedDate);
    startDate.setUTCHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setUTCDate(endDate.getUTCDate() + 1);

    // Count active students in this class
    const totalStudents = await Student.countDocuments({
      className,
      section,
      status: "Active",
    });

    // Find attendance record for selected date
    const attendance = await Attendance.findOne({
      className,
      section,
      academicYear,
      date: {
        $gte: startDate,
        $lt: endDate,
      },
    });

    let present = 0;
    let absent = 0;
    let late = 0;
    let leave = 0;

    if (attendance) {
      attendance.students.forEach((item) => {
        if (item.status === "Present") present++;
        else if (item.status === "Absent") absent++;
        else if (item.status === "Late") late++;
        else if (item.status === "Leave") leave++;
      });
    }

    // Present + Late count as attended
    const attendancePercentage =
      totalStudents > 0
        ? Number((((present + late) / totalStudents) * 100).toFixed(2))
        : 0;

    res.status(200).json({
      success: true,
      summary: {
        totalStudents,
        present,
        absent,
        late,
        leave,
        attendancePercentage,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
