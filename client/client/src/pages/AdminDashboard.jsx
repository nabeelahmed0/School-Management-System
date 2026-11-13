import { useAuth } from "../context/AuthContext";

function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <h2>Welcome, {user.name}</h2>

      <ul>
        <li>Manage Students</li>
        <li>Manage Teachers</li>
        <li>Manage Classes</li>
        <li>View Reports</li>
      </ul>
    </div>
  );
}

export default AdminDashboard;
