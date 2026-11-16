import { Search, Bell, UserCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function Topbar() {
  const { user } = useAuth();

  return (
    <header className="topbar">
      <div className="topbar-search">
        <Search size={19} />

        <input
          type="text"
          placeholder="Search anything..."
        />
      </div>

      <div className="topbar-right">
        <button className="notification-button">
          <Bell size={21} />
          <span className="notification-dot"></span>
        </button>

        <div className="admin-profile">
          <UserCircle size={36} />

          <div>
            <h4>{user?.name || "Admin"}</h4>
            <p>Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;