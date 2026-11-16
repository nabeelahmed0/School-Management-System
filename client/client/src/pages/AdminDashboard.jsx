import {
  Users,
  GraduationCap,
  BookOpen,
  DollarSign,
  TrendingUp,
} from "lucide-react";

function AdminDashboard() {
  const stats = [
    {
      title: "Total Students",
      value: "1,250",
      icon: GraduationCap,
      change: "+12% this month",
    },
    {
      title: "Total Teachers",
      value: "85",
      icon: Users,
      change: "+5% this month",
    },
    {
      title: "Total Classes",
      value: "32",
      icon: BookOpen,
      change: "Across all grades",
    },
    {
      title: "Total Revenue",
      value: "$25,000",
      icon: DollarSign,
      change: "+8% this month",
    },
  ];

  return (
    <div>
      <div className="dashboard-heading">
        <div>
          <h1>Dashboard Overview</h1>
          <p>Welcome back! Here's what's happening in your school.</p>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div className="stat-card" key={stat.title}>
              <div className="stat-card-top">
                <div className="stat-icon">
                  <Icon size={25} />
                </div>

                <TrendingUp size={18} />
              </div>

              <h3>{stat.title}</h3>
              <h2>{stat.value}</h2>
              <p>{stat.change}</p>
            </div>
          );
        })}
      </div>

      <div className="dashboard-bottom">
        <div className="welcome-card">
          <h2>School Management System</h2>
          <p>
            Manage your students, teachers, classes and
            school activities from one place.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;