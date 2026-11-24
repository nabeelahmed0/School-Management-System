
import { useState, useEffect } from "react";
import { Plus, X, Eye, RefreshCw } from "lucide-react";
import API from "../services/api";

function Teachers() {
  const [showForm, setShowForm] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const initialFormData = {
    employeeId: "",
    name: "",
    email: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
    qualification: "",
    subject: "",
    experience: "",
    salary: "",
    address: "",
    joiningDate: "",
  };

  const [formData, setFormData] = useState(initialFormData);

  // Fetch teachers from MongoDB
  const fetchTeachers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/teachers");

      // Supports common API response formats
      const teacherData =
        response.data.teachers ||
        response.data.data ||
        response.data;

      setTeachers(Array.isArray(teacherData) ? teacherData : []);
    } catch (err) {
      console.error("Fetch teachers error:", err);
      setError(
        err.response?.data?.message || "Failed to load teachers."
      );
    } finally {
      setLoading(false);
    }
  };

  // Load teachers when page opens
  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add new teacher
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await API.post("/teachers", {
        ...formData,
        experience: Number(formData.experience),
        salary: Number(formData.salary),
      });

      alert(response.data.message || "Teacher added successfully!");

      setFormData(initialFormData);
      setShowForm(false);

      // Refresh teacher list
      fetchTeachers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add teacher.");
    }
  };

  return (
    <div className="students-page">

      {/* Page Header */}
      <div className="students-header">
        <div>
          <h1>Teachers Management</h1>
          <p>Manage and monitor all school teachers.</p>
        </div>

        <button
          className="add-student-btn"
          onClick={() => setShowForm(true)}
        >
          <Plus size={18} />
          Add Teacher
        </button>
      </div>

      {/* Teachers Table */}
      <div className="teachers-table-container">

        <div className="teachers-table-header">
          <div>
            <h2>All Teachers</h2>
            <p>Total Teachers: {teachers.length}</p>
          </div>

          <button
            className="refresh-teachers-btn"
            onClick={fetchTeachers}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="teachers-message">
            Loading teachers...
          </div>
        ) : error ? (
          <div className="teachers-error">
            {error}
            <button onClick={fetchTeachers}>Try Again</button>
          </div>
        ) : teachers.length === 0 ? (
          <div className="teachers-message">
            <Eye size={30} />
            <h3>No Teachers Found</h3>
            <p>Click Add Teacher to register your first teacher.</p>
          </div>
        ) : (
          <div className="teachers-table-scroll">
            <table className="teachers-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Employee ID</th>
                  <th>Teacher Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Gender</th>
                  <th>Subject</th>
                  <th>Qualification</th>
                  <th>Experience</th>
                  <th>Salary</th>
                </tr>
              </thead>

              <tbody>
                {teachers.map((teacher, index) => (
                  <tr key={teacher._id || teacher.employeeId || index}>
                    <td>{index + 1}</td>
                    <td>{teacher.employeeId || "-"}</td>
                    <td className="teacher-name">
                      {teacher.name || "-"}
                    </td>
                    <td>{teacher.email || "-"}</td>
                    <td>{teacher.phone || "-"}</td>
                    <td>
                      <span className="teacher-gender">
                        {teacher.gender || "-"}
                      </span>
                    </td>
                    <td>{teacher.subject || "-"}</td>
                    <td>{teacher.qualification || "-"}</td>
                    <td>
                      {teacher.experience ?? 0} Years
                    </td>
                    <td>
                      {teacher.salary != null
                        ? Number(teacher.salary).toLocaleString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Teacher Modal */}
      {showForm && (
        <div className="student-modal-overlay">
          <div className="student-modal">

            <div className="student-modal-header">
              <div>
                <h2>Add New Teacher</h2>
                <p>Enter teacher information below.</p>
              </div>

              <button
                type="button"
                onClick={() => setShowForm(false)}
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="student-form-grid">

                <input
                  name="employeeId"
                  placeholder="Employee ID"
                  value={formData.employeeId}
                  onChange={handleChange}
                  required
                />

                <input
                  name="name"
                  placeholder="Teacher Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />

                <input
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
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
                  name="qualification"
                  placeholder="Qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  required
                />

                <input
                  name="subject"
                  placeholder="Subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />

                <input
                  name="experience"
                  type="number"
                  min="0"
                  placeholder="Experience (Years)"
                  value={formData.experience}
                  onChange={handleChange}
                  required
                />

                <input
                  name="salary"
                  type="number"
                  min="0"
                  placeholder="Salary"
                  value={formData.salary}
                  onChange={handleChange}
                  required
                />

                <input
                  name="joiningDate"
                  type="date"
                  value={formData.joiningDate}
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
                >
                  Save Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Teachers;
