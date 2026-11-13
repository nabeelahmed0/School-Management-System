import { useAuth } from "../context/AuthContext";

function TeacherDashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1>Teacher Dashboard</h1>
      <h2>Welcome, {user.name}</h2>

      <ul>
        <li>My Classes</li>
        <li>Student Attendance</li>
        <li>Manage Assignments</li>
        <li>Student Results</li>
      </ul>
    </div>
  );
}

export default TeacherDashboard;