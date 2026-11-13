import { useAuth } from "../context/AuthContext";

function StudentDashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1>Student Dashboard</h1>
      <h2>Welcome, {user.name}</h2>

      <ul>
        <li>My Courses</li>
        <li>My Attendance</li>
        <li>My Assignments</li>
        <li>My Results</li>
      </ul>
    </div>
  );
}

export default StudentDashboard;
