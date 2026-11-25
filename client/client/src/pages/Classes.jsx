import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  X,
  BookOpen,
  Users,
} from "lucide-react";

import API from "../services/api";

function Classes() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [search, setSearch] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);
  const [totalClasses, setTotalClasses] = useState(0);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [viewingClass, setViewingClass] = useState(null);

  const limit = 10;

  const initialFormData = {
    className: "",
    section: "",
    classTeacher: "",
    roomNumber: "",
    capacity: "",
    academicYear: "2026-27",
  };

  const [formData, setFormData] = useState(initialFormData);

  // FETCH CLASSES
  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/classes", {
        params: {
          page,
          limit,
          search,
          section: sectionFilter,
        },
      });

      setClasses(response.data.classes || []);
      setTotalClasses(response.data.totalClasses || 0);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load classes.");
    } finally {
      setLoading(false);
    }
  };

  // FETCH TEACHERS FOR DROPDOWN
  const fetchTeachers = async () => {
    try {
      const response = await API.get("/teachers", {
        params: { page: 1, limit: 100 },
      });

      setTeachers(response.data.teachers || []);
    } catch (err) {
      console.error("Failed to load teachers:", err);
      setError("Unable to load teachers for the dropdown.");
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [page, search, sectionFilter]);

  useEffect(() => {
    fetchTeachers();
  }, []);

  // INPUT CHANGE
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // OPEN ADD FORM
  const handleAdd = () => {
    setEditingClass(null);
    setFormData(initialFormData);
    setError("");
    setShowForm(true);
  };

  // OPEN EDIT FORM
  const handleEdit = (schoolClass) => {
    setEditingClass(schoolClass);

    setFormData({
      className: schoolClass.className || "",
      section: schoolClass.section || "",
      classTeacher: schoolClass.classTeacher?._id || "",
      roomNumber: schoolClass.roomNumber || "",
      capacity: schoolClass.capacity ?? "",
      academicYear: schoolClass.academicYear || "",
    });

    setError("");
    setShowForm(true);
  };

  // CREATE / UPDATE CLASS
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = {
        ...formData,
        capacity: Number(formData.capacity),
      };

      if (editingClass) {
        await API.put(`/classes/${editingClass._id}`, payload);
      } else {
        await API.post("/classes", payload);
      }

      setShowForm(false);
      setEditingClass(null);
      setFormData(initialFormData);

      await fetchClasses();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save class.");
    } finally {
      setSaving(false);
    }
  };

  // DELETE CLASS
  const handleDelete = async (id, name, section) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${name} - ${section}?`,
    );

    if (!confirmDelete) return;

    try {
      setError("");

      await API.delete(`/classes/${id}`);

      await fetchClasses();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete class.");
    }
  };

  // VIEW CLASS
  const handleView = (schoolClass) => {
    setViewingClass(schoolClass);
  };

  return (
    <div className="students-page">
      {/* HEADER */}
      <div className="students-header">
        <div>
          <h1>Classes Management</h1>
          <p>Manage school classes and assign class teachers.</p>
        </div>

        <button className="add-student-btn" onClick={handleAdd}>
          <Plus size={18} />
          Add Class
        </button>
      </div>

      {/* STATS */}
      <div className="student-stats">
        <div className="student-stat-card">
          <BookOpen size={25} />
          <div>
            <h2>{totalClasses}</h2>
            <p>Total Classes</p>
          </div>
        </div>
      </div>

      {error && <p className="student-error">{error}</p>}

      {/* VIEW CLASS MODAL */}
      {viewingClass && (
        <div className="student-modal-overlay">
          <div className="student-modal">
            <div className="student-modal-header">
              <div>
                <h2>Class Details</h2>
                <p>Complete class information.</p>
              </div>

              <button onClick={() => setViewingClass(null)}>
                <X size={22} />
              </button>
            </div>

            <div className="student-details-grid">
              <div>
                <label>Class Name</label>
                <p>{viewingClass.className}</p>
              </div>

              <div>
                <label>Section</label>
                <p>{viewingClass.section}</p>
              </div>

              <div>
                <label>Class Teacher</label>
                <p>{viewingClass.classTeacher?.name || "Not assigned"}</p>
              </div>

              <div>
                <label>Employee ID</label>
                <p>{viewingClass.classTeacher?.employeeId || "—"}</p>
              </div>

              <div>
                <label>Room Number</label>
                <p>{viewingClass.roomNumber}</p>
              </div>

              <div>
                <label>Capacity</label>
                <p>{viewingClass.capacity} Students</p>
              </div>

              <div>
                <label>Academic Year</label>
                <p>{viewingClass.academicYear}</p>
              </div>

              <div>
                <label>Status</label>
                <p>{viewingClass.status || "Active"}</p>
              </div>
            </div>

            <div className="student-form-actions">
              <button
                className="cancel-student-btn"
                onClick={() => setViewingClass(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {showForm && (
        <div className="student-modal-overlay">
          <div className="student-modal">
            <div className="student-modal-header">
              <div>
                <h2>{editingClass ? "Edit Class" : "Add New Class"}</h2>
                <p>Enter class information below.</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingClass(null);
                  setFormData(initialFormData);
                }}
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="student-form-grid">
                <input
                  name="className"
                  placeholder="Class Name (e.g. Class 9)"
                  value={formData.className}
                  onChange={handleChange}
                  required
                />

                <select
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Section</option>
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                  <option value="D">Section D</option>
                </select>

                <select
                  name="classTeacher"
                  value={formData.classTeacher}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Class Teacher</option>

                  {teachers.map((teacher) => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.name} ({teacher.employeeId})
                    </option>
                  ))}
                </select>

                <input
                  name="roomNumber"
                  placeholder="Room Number"
                  value={formData.roomNumber}
                  onChange={handleChange}
                  required
                />

                <input
                  name="capacity"
                  type="number"
                  min="1"
                  placeholder="Student Capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  required
                />

                <input
                  name="academicYear"
                  placeholder="Academic Year (2026-27)"
                  value={formData.academicYear}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="student-form-actions">
                <button
                  type="button"
                  className="cancel-student-btn"
                  onClick={() => {
                    setShowForm(false);
                    setEditingClass(null);
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="add-student-btn"
                  disabled={saving || teachers.length === 0}
                >
                  {saving
                    ? "Saving..."
                    : editingClass
                      ? "Update Class"
                      : "Save Class"}
                </button>
              </div>

              {teachers.length === 0 && (
                <p className="student-error">
                  Please add a teacher before creating a class.
                </p>
              )}
            </form>
          </div>
        </div>
      )}

      {/* SEARCH AND FILTER */}
      <div className="students-content">
        <div className="students-toolbar">
          <div className="student-search">
            <Search size={18} />

            <input
              placeholder="Search classes..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <select
            value={sectionFilter}
            onChange={(e) => {
              setSectionFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Sections</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
            <option value="D">Section D</option>
          </select>
        </div>

        {/* CLASSES TABLE */}
        <div className="students-table-wrapper">
          <table className="students-table">
            <thead>
              <tr>
                <th>Class Name</th>
                <th>Section</th>
                <th>Class Teacher</th>
                <th>Room</th>
                <th>Capacity</th>
                <th>Academic Year</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="no-students">
                    Loading classes...
                  </td>
                </tr>
              ) : classes.length > 0 ? (
                classes.map((schoolClass) => (
                  <tr key={schoolClass._id}>
                    <td>{schoolClass.className}</td>
                    <td>{schoolClass.section}</td>
                    <td>{schoolClass.classTeacher?.name || "—"}</td>
                    <td>{schoolClass.roomNumber}</td>
                    <td>{schoolClass.capacity}</td>
                    <td>{schoolClass.academicYear}</td>

                    <td>
                      <div className="student-actions">
                        <button
                          title="View"
                          onClick={() => handleView(schoolClass)}
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          title="Edit"
                          onClick={() => handleEdit(schoolClass)}
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          title="Delete"
                          onClick={() =>
                            handleDelete(
                              schoolClass._id,
                              schoolClass.className,
                              schoolClass.section,
                            )
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
                    No classes found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION */}
      <div className="students-pagination">
        <p>
          Showing {classes.length} of {totalClasses} classes
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
            disabled={page >= totalPages || totalClasses === 0}
            onClick={() => setPage((prev) => prev + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default Classes;
