import { useEffect, useState } from "react";
import { Search, Plus, Users, Eye, Pencil, Trash2, X } from "lucide-react";
import api from "../services/api.js";

function Students() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");

  const [viewingStudent, setViewingStudent] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingStudent, setEditingStudent] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);

  const limit = 10;

  const [formData, setFormData] = useState({
    admissionNumber: "",
    name: "",
    email: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
    className: "",
    address: "",
    guardianName: "",
    guardianPhone: "",
  });

  // Fetch students from backend

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/students", {
        params: {
          page,
          limit,
          search,
          className: classFilter,
          gender: genderFilter,
        },
      });

      setStudents(response.data.students || []);
      setTotalStudents(response.data.totalStudents || 0);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load students.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, search, classFilter, genderFilter]);
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add student to database
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      await api.post("/students", formData);

      setFormData({
        admissionNumber: "",
        name: "",
        email: "",
        phone: "",
        gender: "",
        dateOfBirth: "",
        className: "",
        address: "",
        guardianName: "",
        guardianPhone: "",
      });

      setShowForm(false);
      await fetchStudents();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add student.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${name}?`,
    );

    if (!confirmDelete) return;

    try {
      setError("");

      await api.delete(`/students/${id}`);

      await fetchStudents();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete student.");
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);

    setFormData({
      admissionNumber: student.admissionNumber || "",
      name: student.name || "",
      email: student.email || "",
      phone: student.phone || "",
      gender: student.gender || "",
      dateOfBirth: student.dateOfBirth ? student.dateOfBirth.slice(0, 10) : "",
      className: student.className || "",
      address: student.address || "",
      guardianName: student.guardianName || "",
      guardianPhone: student.guardianPhone || "",
    });

    setError("");
    setShowForm(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      await api.put(`/students/${editingStudent._id}`, formData);

      setShowForm(false);
      setEditingStudent(null);

      await fetchStudents();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update student.");
    } finally {
      setSaving(false);
    }
  };
  const handleView = (student) => {
    setViewingStudent(student);
  };

  //   const filteredStudents = students.filter((student) => {
  //     const searchValue = search.toLowerCase();

  //     const matchesSearch =
  //       student.name.toLowerCase().includes(searchValue) ||
  //       (student.email || "").toLowerCase().includes(searchValue) ||
  //       student.admissionNumber.toLowerCase().includes(searchValue);

  //     const matchesClass = !classFilter || student.className === classFilter;

  //     const matchesGender = !genderFilter || student.gender === genderFilter;

  //     return matchesSearch && matchesClass && matchesGender;
  //   });

  return (
    <div className="students-page">
      {viewingStudent && (
        <div className="student-modal-overlay">
          <div className="student-modal">
            <div className="student-modal-header">
              <div>
                <h2>Student Details</h2>
                <p>Complete student information</p>
              </div>

              <button onClick={() => setViewingStudent(null)}>
                <X size={22} />
              </button>
            </div>

            <div className="student-details-grid">
              <div>
                <label>Admission Number</label>
                <p>{viewingStudent.admissionNumber}</p>
              </div>

              <div>
                <label>Student Name</label>
                <p>{viewingStudent.name}</p>
              </div>

              <div>
                <label>Email</label>
                <p>{viewingStudent.email || "—"}</p>
              </div>

              <div>
                <label>Phone</label>
                <p>{viewingStudent.phone}</p>
              </div>

              <div>
                <label>Gender</label>
                <p>{viewingStudent.gender}</p>
              </div>

              <div>
                <label>Date of Birth</label>
                <p>
                  {viewingStudent.dateOfBirth
                    ? new Date(viewingStudent.dateOfBirth).toLocaleDateString()
                    : "—"}
                </p>
              </div>

              <div>
                <label>Class</label>
                <p>{viewingStudent.className}</p>
              </div>

              <div>
                <label>Status</label>
                <p>{viewingStudent.status}</p>
              </div>

              <div>
                <label>Guardian Name</label>
                <p>{viewingStudent.guardianName}</p>
              </div>

              <div>
                <label>Guardian Phone</label>
                <p>{viewingStudent.guardianPhone}</p>
              </div>

              <div className="student-detail-full">
                <label>Address</label>
                <p>{viewingStudent.address}</p>
              </div>
            </div>

            <div className="student-form-actions">
              <button
                className="cancel-student-btn"
                onClick={() => setViewingStudent(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="students-header">
        <div>
          <h1>Students Management</h1>
          <p>Manage and monitor all school students.</p>
        </div>

        <button
          className="add-student-btn"
          onClick={() => {
            setError("");
            setShowForm(true);
          }}
        >
          <Plus size={18} />
          Add Student
        </button>
      </div>

      <div className="student-stats">
        <div className="student-stat-card">
          <Users size={25} />
          <div>
            <h2>{students.length}</h2>
            <p>Total Students</p>
          </div>
        </div>
      </div>

      {error && <p className="student-error">{error}</p>}

      {showForm && (
        <div className="student-modal-overlay">
          <div className="student-modal">
            <div className="student-modal-header">
              <div>
                <h2>{editingStudent ? "Edit Student" : "Add New Student"}</h2>
                <p>Enter the student's information below.</p>
              </div>

              {() => {
                setShowForm(false);
                setEditingStudent(null);
              }}
            </div>

            <form onSubmit={editingStudent ? handleUpdate : handleSubmit}>
              <div className="student-form-grid">
                <input
                  name="admissionNumber"
                  placeholder="Admission Number"
                  value={formData.admissionNumber}
                  onChange={handleChange}
                  required
                />

                <input
                  name="name"
                  placeholder="Student Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />

                <input
                  name="email"
                  type="email"
                  placeholder="Email (optional)"
                  value={formData.email}
                  onChange={handleChange}
                />

                <input
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />

                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>

                <input
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                />

                <input
                  name="className"
                  placeholder="Class (e.g. Class 9)"
                  value={formData.className}
                  onChange={handleChange}
                  required
                />

                <input
                  name="guardianName"
                  placeholder="Guardian Name"
                  value={formData.guardianName}
                  onChange={handleChange}
                  required
                />

                <input
                  name="guardianPhone"
                  placeholder="Guardian Phone"
                  value={formData.guardianPhone}
                  onChange={handleChange}
                  required
                />

                <input
                  name="address"
                  placeholder="Address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="student-form-actions">
                <button
                  type="button"
                  className="cancel-student-btn"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="add-student-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingStudent
                      ? "Update Student"
                      : "Save Student"}{" "}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="students-content">
        <div className="students-toolbar">
          <div className="student-search">
            <Search size={18} />
            <input
              placeholder="Search students..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <select
            value={classFilter}
            onChange={(e) => {
              setClassFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Classes</option>
            {[...new Set(students.map((s) => s.className))].map((className) => (
              <option key={className} value={className}>
                {className}
              </option>
            ))}
          </select>

          <select
            value={genderFilter}
            onChange={(e) => {
              setGenderFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="students-table-wrapper">
          <table className="students-table">
            <thead>
              <tr>
                <th>Admission No.</th>
                <th>Student Name</th>
                <th>Email</th>
                <th>Class</th>
                <th>Gender</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="no-students">
                    Loading students...
                  </td>
                </tr>
              ) : students.length > 0 ? (
                students.map((student) => (
                  <tr key={student._id}>
                    <td>{student.admissionNumber}</td>
                    <td>{student.name}</td>
                    <td>{student.email || "—"}</td>
                    <td>{student.className}</td>
                    <td>{student.gender}</td>
                    <td>
                      <span
                        className={`student-status ${student.status.toLowerCase()}`}
                      >
                        {student.status}
                      </span>
                    </td>
                    <td>
                      <div className="student-actions">
                        <button
                          title="View"
                          onClick={() => handleView(student)}
                        >
                          <Eye size={17} />
                        </button>
                        <button
                          title="Edit"
                          onClick={() => handleEdit(student)}
                        >
                          <Pencil size={17} />
                        </button>
                        <button
                          title="Delete"
                          onClick={() =>
                            handleDelete(student._id, student.name)
                          }
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-students">
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="students-pagination">
        <p>
          Showing {students.length} of {totalStudents} students
        </p>

        <div className="pagination-buttons">
          <button
            disabled={page <= 1}
            onClick={() => setPage((prev) => prev - 1)}
          >
            Previous
          </button>

          <span>
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page >= totalPages || totalStudents === 0}
            onClick={() => setPage((prev) => prev + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default Students;
