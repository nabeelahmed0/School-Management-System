import { useEffect, useState } from "react";
import {
  Search,
  CalendarCheck,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import api from "../services/api.js";

function AttendanceRecords() {
  const [records, setRecords] = useState([]);
  const [classes, setClasses] = useState([]);

  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await api.get("/classes", {
          params: { page: 1, limit: 100 },
        });

        setClasses(response.data.classes || []);
      } catch (err) {
        console.log("Classes loading error:", err);
      }
    };

    fetchClasses();
  }, []);

  // Load attendance records

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/attendance/records", {
        params: {
          page,
          limit: 10,
          className,
          section,
          date,
          status,
        },
      });

      const attendanceRecords = response.data.records || [];

      // Convert attendance documents into individual student rows
      const formattedRecords = attendanceRecords.flatMap((record) =>
        (record.students || []).map((item) => ({
          _id: `${record._id}-${item.student?._id || item.student}`,
          studentName: item.student?.name || "Unknown Student",
          admissionNumber: item.student?.admissionNumber || "-",
          className: record.className,
          section: record.section,
          date: record.date,
          status: item.status,
          remarks: item.remarks || "",
        })),
      );

      // Apply status filter to individual students
      const filteredRecords = status
        ? formattedRecords.filter((item) => item.status === status)
        : formattedRecords;

      // Apply student search
      const searchedRecords = filteredRecords.filter((item) => {
        const searchText = search.toLowerCase();

        return (
          item.studentName.toLowerCase().includes(searchText) ||
          item.admissionNumber.toLowerCase().includes(searchText)
        );
      });

      setRecords(searchedRecords);
      setTotalRecords(searchedRecords.length);
      setTotalPages(Math.max(1, Math.ceil(searchedRecords.length / 10)));
    } catch (err) {
      setError(
        err.response?.data?.message || "Attendance records load nahi ho sake.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [page, className, section, date, status, search]);

  // Reset filters
  const resetFilters = () => {
    setClassName("");
    setSection("");
    setDate("");
    setStatus("");
    setSearch("");
    setPage(1);
  };

  const getStatusStyle = (value) => {
    const styles = {
      Present: { background: "#dcfce7", color: "#166534" },
      Absent: { background: "#fee2e2", color: "#991b1b" },
      Late: { background: "#fef3c7", color: "#92400e" },
      Leave: { background: "#dbeafe", color: "#1e40af" },
    };

    return styles[value] || {};
  };

  return (
    <div style={{ padding: "24px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "25px",
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Attendance Records</h1>
          <p style={{ color: "#64748b" }}>
            View and search student attendance history
          </p>
        </div>

        <CalendarCheck size={35} color="#2563eb" />
      </div>

      {/* Total records */}
      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "10px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "15px",
        }}
      >
        <Users size={30} color="#2563eb" />

        <div>
          <h2 style={{ margin: 0 }}>{totalRecords}</h2>
          <p style={{ margin: 0, color: "#64748b" }}>
            Total Attendance Records
          </p>
        </div>
      </div>

      {/* Filters */}
      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "10px",
          marginBottom: "20px",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Filters</h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "15px",
          }}
        >
          <div>
            <label>Class</label>

            <select
              value={className}
              onChange={(e) => {
                setClassName(e.target.value);
                setSection("");
                setPage(1);
              }}
              style={inputStyle}
            >
              <option value="">All Classes</option>

              {[...new Set(classes.map((item) => item.className))].map(
                (name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ),
              )}
            </select>
          </div>

          <div>
            <label>Section</label>

            <select
              value={section}
              onChange={(e) => {
                setSection(e.target.value);
                setPage(1);
              }}
              style={inputStyle}
            >
              <option value="">All Sections</option>

              {[
                ...new Set(
                  classes
                    .filter(
                      (item) => !className || item.className === className,
                    )
                    .map((item) => item.section),
                ),
              ].map((item) => (
                <option key={item} value={item}>
                  Section {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Date</label>

            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setPage(1);
              }}
              style={inputStyle}
            />
          </div>

          <div>
            <label>Status</label>

            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              style={inputStyle}
            >
              <option value="">All Status</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Late">Late</option>
              <option value="Leave">Leave</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "18px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
            <Search
              size={18}
              style={{
                position: "absolute",
                left: "12px",
                top: "12px",
                color: "#64748b",
              }}
            />

            <input
              type="text"
              placeholder="Search student name or admission number..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{
                ...inputStyle,
                width: "100%",
                paddingLeft: "38px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <button onClick={resetFilters} style={resetButtonStyle}>
            Reset Filters
          </button>
        </div>
      </div>

      {/* Records table */}
      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "10px",
          overflowX: "auto",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Attendance History</h3>

        {error && <p style={{ color: "red" }}>{error}</p>}

        {loading ? (
          <p>Loading records...</p>
        ) : records.length === 0 ? (
          <p>No attendance records found.</p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "750px",
            }}
          >
            <thead>
              <tr style={{ background: "#f1f5f9" }}>
                <th style={cellStyle}>#</th>
                <th style={cellStyle}>Student Name</th>
                <th style={cellStyle}>Admission No.</th>
                <th style={cellStyle}>Class</th>
                <th style={cellStyle}>Section</th>
                <th style={cellStyle}>Date</th>
                <th style={cellStyle}>Status</th>
                <th style={cellStyle}>Remarks</th>
              </tr>
            </thead>

            <tbody>
              {records.map((record, index) => (
                <tr key={record._id}>
                  <td style={cellStyle}>{(page - 1) * 10 + index + 1}</td>

                  <td style={cellStyle}>
                    {record.studentName || record.student?.name || "-"}
                  </td>

                  <td style={cellStyle}>
                    {record.admissionNumber ||
                      record.student?.admissionNumber ||
                      "-"}
                  </td>

                  <td style={cellStyle}>{record.className}</td>

                  <td style={cellStyle}>{record.section}</td>

                  <td style={cellStyle}>
                    {record.date
                      ? new Date(record.date).toLocaleDateString()
                      : "-"}
                  </td>

                  <td style={cellStyle}>
                    <span
                      style={{
                        ...getStatusStyle(record.status),
                        padding: "5px 10px",
                        borderRadius: "20px",
                        fontSize: "13px",
                      }}
                    >
                      {record.status}
                    </span>
                  </td>

                  <td style={cellStyle}>{record.remarks || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "20px",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <p style={{ color: "#64748b" }}>
            Page {page} of {totalPages}
          </p>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              disabled={page <= 1}
              onClick={() => setPage((previous) => previous - 1)}
              style={paginationButtonStyle}
            >
              <ChevronLeft size={17} />
              Previous
            </button>

            <button
              disabled={page >= totalPages}
              onClick={() => setPage((previous) => previous + 1)}
              style={paginationButtonStyle}
            >
              Next
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginTop: "7px",
  border: "1px solid #cbd5e1",
  borderRadius: "6px",
  boxSizing: "border-box",
};

const cellStyle = {
  padding: "12px",
  textAlign: "left",
  borderBottom: "1px solid #e2e8f0",
};

const resetButtonStyle = {
  padding: "10px 16px",
  border: "none",
  borderRadius: "6px",
  background: "#e2e8f0",
  cursor: "pointer",
};

const paginationButtonStyle = {
  display: "flex",
  alignItems: "center",
  gap: "5px",
  padding: "9px 13px",
  border: "1px solid #cbd5e1",
  borderRadius: "6px",
  background: "#fff",
  cursor: "pointer",
};

export default AttendanceRecords;
