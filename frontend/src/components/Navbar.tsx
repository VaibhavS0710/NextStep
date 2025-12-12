import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;
  const isDark = theme === "dark";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="nav-inner fade-in-down">
        <div className="nav-left">
          <div className="nav-logo-badge">N</div>
          <div className="nav-brand">
            <span className="nav-brand-title">NextStep</span>
            <span className="nav-brand-sub">
              Internships · Applications · Insights
            </span>
          </div>
        </div>

        <nav className="nav-links">
          <Link
            to="/internships"
            className={`nav-link ${isActive("/internships") ? "nav-link-active" : ""}`}
          >
            Internships
          </Link>

          {user?.role === "student" && (
            <Link
              to="/chat"
              className={`nav-link ${isActive("/chat") ? "nav-link-active" : ""}`}
            >
              Assistant
            </Link>
          )}

          {user?.role === "student" && (
            <Link
              to="/applications"
              className={`nav-link ${
                isActive("/applications") ? "nav-link-active" : ""
              }`}
            >
              My Applications
            </Link>
          )}

          

          {user?.role === "admin" && (
            <Link
              to="/admin/scraping"
              className={`nav-link ${
                isActive("/admin/scraping") ? "nav-link-active" : ""
              }`}
            >
              Scraping Admin
            </Link>
          )}
        </nav>

        <div className="nav-right">
          {/* Theme toggle */}
          <button
            type="button"
            className="btn theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            <span className={`theme-toggle-icon ${isDark ? "moon" : "sun"}`} />
          </button>

          {user && (
            <span className="nav-user">
              {user.name} · <strong>{user.role}</strong>
            </span>
          )}
          {!user && (
            <>
              <Link to="/login" className="btn btn-outline">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Get started
              </Link>
            </>
          )}
          {user && (
            <button className="btn btn-outline" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
