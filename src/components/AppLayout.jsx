import { NavLink, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import BrandMark from "./BrandMark";

export default function AppLayout({ children }) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isAdmin = localStorage.getItem("role") === "ADMIN";

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-lockup">
          <BrandMark size={40} />
          <div><strong>QueueForge</strong><span>IMAGE PROCESSING</span></div>
        </div>
        <div className="nav-caption">WORKSPACE</div>
        <nav className="side-nav">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}><span>▦</span>Dashboard</NavLink>
          <NavLink to="/jobs" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}><span>▤</span>Image jobs</NavLink>
          {isAdmin && <NavLink to="/dead-letter" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}><span>⚑</span>Dead letter queue</NavLink>}
        </nav>
        <div className="sidebar-bottom">
          <div className="connection-indicator"><i /> Processing system</div>
          <button className="nav-link logout-link" onClick={logout}><span>↪</span>Sign out</button>
        </div>
      </aside>
      <div className="main-column">
        <header className="topbar">
          <div className="breadcrumb"><span>QueueForge</span><b>/</b><strong>{location.pathname === "/dashboard" ? "Dashboard" : location.pathname === "/jobs" ? "Image jobs" : location.pathname.startsWith("/jobs/") ? "Job details" : "Dead letter queue"}</strong></div>
          <div className="topbar-actions">
            <span className="user-chip"><span className="avatar">{(localStorage.getItem("username") || "U").slice(0,1).toUpperCase()}</span>{localStorage.getItem("username")}</span>
            <button className="icon-button theme-toggle" onClick={toggleTheme} aria-label="Toggle colour theme" title="Toggle theme">{theme === "dark" ? "☼" : "☾"}</button>
          </div>
        </header>
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}