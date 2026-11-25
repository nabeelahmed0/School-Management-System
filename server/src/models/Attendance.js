import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    className: {
      type: String,
      required: true,
      trim: true,
    },

    section: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    academicYear: {
      type: String,
      required: true,
      trim: true,
    },

    date: {
      type: Date,
      required: true,
    },

    students: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
          required: true,
        },

        status: {
          type: String,
          enum: ["Present", "Absent", "Late", "Leave"],
          required: true,
          default: "Present",
        },

        remarks: {
          type: String,
          trim: true,
          default: "",
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Prevent duplicate attendance for same class, section and date
attendanceSchema.index(
  {
    className: 1,
    section: 1,
    academicYear: 1,
    date: 1,
  },
  {
    unique: true,
  },
);

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;
