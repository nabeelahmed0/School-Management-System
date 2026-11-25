import { useEffect, useState } from "react";
import {
  CalendarCheck,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Save,
} from "lucide-react";
import api from "../services/api.js";

function getLocalDate() {
  const today = new Date();

  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(today.getDate()).padStart(2, "0")}`;
}

function Attendance() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [date, setDate] = useState(getLocalDate());

  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const selectedClassData = classes.find((item) => item._id === selectedClass);

  // Load classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await api.get("/classes", {
          params: { page: 1, limit: 100 },
        });

        const classList = response.data.classes || [];
        setClasses(classList);

        if (classList.length > 0) {
          setSelectedClass(classList[0]._id);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Classes load nahi ho sakin.");
      }
    };

    fetchClasses();
  }, []);

  // Load students and existing attendance
  useEffect(() => {
    if (!selectedClassData || !date) return;

    const fetchStudents = async () => {
      setLoading(true);
      setError("");
      setMessage("");
      setSummary(null);

      try {
        const { className, section, academicYear } = selectedClassData;

        const response = await api.get("/attendance/students", {
          params: { className, section },
        });

        const studentList = response.data.students || [];

        let attendanceMap = {};

        // Check whether attendance already exists for this date
        try {
          const recordsResponse = await api.get("/attendance/records", {
            params: {
              className,
              section,
              date,
              page: 1,
              limit: 100,
            },
          });

          const records = recordsResponse.data.records || [];
          const existingRecord = records.find(
            (record) => record.academicYear === academicYear,
          );

          if (existingRecord) {
            (existingRecord.students || []).forEach((item) => {
              const studentId =
                typeof item.student === "object"
                  ? item.student?._id
                  : item.student;

              if (studentId) {
                attendanceMap[studentId] = {
                  status: item.status,
                  remarks: item.remarks || "",
                };
              }
            });
          }
        } catch (recordError) {
          console.log("Existing attendance not loaded:", recordError);
        }

        setStudents(studentList);

        setAttendance(
          studentList.map((student) => ({
            student: student._id,
            status: attendanceMap[student._id]?.status || "Present",
            remarks: attendanceMap[student._id]?.remarks || "",
          })),
        );
      } catch (err) {
        setError(err.response?.data?.message || "Students load nahi ho sake.");
        setStudents([]);
        setAttendance([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [selectedClass, date, classes]);

  // Load attendance summary
  const fetchSummary = async () => {
    if (!selectedClassData) return;

    try {
      const response = await api.get("/attendance/summary", {
        params: {
          className: selectedClassData.className,
          section: selectedClassData.section,
          academicYear: selectedClassData.academicYear,
          date,
        },
      });

      setSummary(response.data.summary || response.data);
    } catch (err) {
      console.log("Summary load error:", err);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [selectedClass, date, classes]);

  // Update attendance status
  const handleStatusChange = (studentId, status) => {
    setAttendance((previous) =>
      previous.map((item) =>
        item.student === studentId ? { ...item, status } : item,
      ),
    );
  };

  // Update remarks
  const handleRemarksChange = (studentId, remarks) => {
    setAttendance((previous) =>
      previous.map((item) =>
        item.student === studentId ? { ...item, remarks } : item,
      ),
    );
  };

  // Save attendance
  const handleSaveAttendance = async () => {
    if (!selectedClassData) {
      setError("Please select a class.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      await api.post("/attendance", {
        className: selectedClassData.className,
        section: selectedClassData.section,
        academicYear: selectedClassData.academicYear,
        date,
        students: attendance,
      });

      setMessage("Attendance successfully save ho gayi!");

      await fetchSummary();
    } catch (err) {
      setError(err.response?.data?.message || "Attendance save nahi hui.");
    } finally {
      setSaving(false);
    }
  };

  const countStatus = (status) =>
    attendance.filter((item) => item.status === status).length;

  return (
    <div className="attendance-page" style={{ padding: "24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "15px",
          marginBottom: "25px",
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Attendance Management</h1>
          <p style={{ color: "#64748b" }}>Manage daily student attendance</p>
        </div>

        <CalendarCheck size={35} color="#2563eb" />
      </div>

      {/* Class and date filters */}
      <div
        style={{
          display: "flex",
          gap: "15px",
          flexWrap: "wrap",
          marginBottom: "25px",
        }}
      >
        <div>
          <label>Select Class</label>
          <br />
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            style={inputStyle}
          >
            <option value="">Select Class</option>

            {classes.map((item) => (
              <option key={item._id} value={item._id}>
                {item.className} - Section {item.section} ({item.academicYear})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Select Date</label>
          <br />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>

      {/* Summary cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "15px",
          marginBottom: "25px",
        }}
      >
        <SummaryCard
          title="Total Students"
          value={summary?.totalStudents ?? students.length}
          icon={<Users color="#2563eb" />}
        />

        <SummaryCard
          title="Present"
          value={summary?.present ?? countStatus("Present")}
          icon={<CheckCircle color="green" />}
        />

        <SummaryCard
          title="Absent"
          value={summary?.absent ?? countStatus("Absent")}
          icon={<XCircle color="red" />}
        />

        <SummaryCard
          title="Late"
          value={summary?.late ?? countStatus("Late")}
          icon={<Clock color="#d97706" />}
        />
      </div>

      {error && <p style={{ color: "red", marginBottom: "15px" }}>{error}</p>}

      {message && (
        <p style={{ color: "green", marginBottom: "15px" }}>{message}</p>
      )}

      {/* Students table */}
      <div
        style={{
          background: "#fff",
          borderRadius: "10px",
          padding: "20px",
          overflowX: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ margin: 0 }}>Students Attendance</h2>

          <button
            onClick={handleSaveAttendance}
            disabled={saving || loading || students.length === 0}
            style={saveButtonStyle}
          >
            <Save size={17} />
            {saving ? "Saving..." : "Save Attendance"}
          </button>
        </div>

        {loading ? (
          <p>Loading students...</p>
        ) : students.length === 0 ? (
          <p>No students found in this class.</p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "650px",
            }}
          >
            <thead>
              <tr style={{ background: "#f1f5f9" }}>
                <th style={cellStyle}>#</th>
                <th style={cellStyle}>Student Name</th>
                <th style={cellStyle}>Admission Number</th>
                <th style={cellStyle}>Status</th>
                <th style={cellStyle}>Remarks</th>
              </tr>
            </thead>

            <tbody>
              {students.map((student, index) => {
                const studentAttendance = attendance.find(
                  (item) => item.student === student._id,
                );

                return (
                  <tr key={student._id}>
                    <td style={cellStyle}>{index + 1}</td>

                    <td style={cellStyle}>{student.name}</td>

                    <td style={cellStyle}>{student.admissionNumber}</td>

                    <td style={cellStyle}>
                      <select
                        value={studentAttendance?.status || "Present"}
                        onChange={(e) =>
                          handleStatusChange(student._id, e.target.value)
                        }
                        style={inputStyle}
                      >
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                        <option value="Late">Late</option>
                        <option value="Leave">Leave</option>
                      </select>
                    </td>

                    <td style={cellStyle}>
                      <input
                        type="text"
                        placeholder="Optional remarks"
                        value={studentAttendance?.remarks || ""}
                        onChange={(e) =>
                          handleRemarksChange(student._id, e.target.value)
                        }
                        style={inputStyle}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ title, value, icon }) {
  return (
    <div
      style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "10px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      <div>
        <p style={{ color: "#64748b", margin: "0 0 8px" }}>{title}</p>
        <h2 style={{ margin: 0 }}>{value}</h2>
      </div>

      {icon}
    </div>
  );
}

const inputStyle = {
  padding: "10px",
  border: "1px solid #cbd5e1",
  borderRadius: "6px",
  marginTop: "7px",
};

const cellStyle = {
  padding: "12px",
  borderBottom: "1px solid #e2e8f0",
  textAlign: "left",
};

const saveButtonStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "11px 18px",
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

export default Attendance;
