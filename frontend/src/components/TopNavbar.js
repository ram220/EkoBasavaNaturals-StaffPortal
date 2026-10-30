
import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import "../styles/TopNavbar.css";

function TopNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const navItems = [
    { name: "Dashboard", path: "/" },
    { name: "New Invoice", path: "/invoices/new" },
    { name: "Invoices", path: "/invoices" },
    { name: "Products", path: "/products" },
    { name: "Customers", path: "/customers" },
    { name: "Reports", path: "/reports" },
  ];

  const navigate = useNavigate();

const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  toast.success("Logged out successfully!");

  navigate("/login", { replace: true });
};

  return (
    <header className="site-header">
      <nav className="navbar">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <img
            className="brand-logo"
            src="/ekobasava_logo.jpg"
            alt="Gaumaya Paints logo"
          />

          <div className="brand-text">
            <span className="brand-name">Gaumaya Paints</span>
            <span className="brand-subtitle">STAFF PORTAL</span>
          </div>
        </Link>

        <button
          type="button"
          className={`menu-toggle ${menuOpen ? "active" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`navbar-menu ${menuOpen ? "show" : ""}`}>
          <div className="navbar-links">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                onClick={closeMenu}
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                {item.name}
              </NavLink>
            ))}
          </div>

          <div className="navbar-actions">
            <Link
              to="/settings"
              className="profile-link"
              onClick={closeMenu}
              aria-label="Settings and profile"
              title="Settings"
            >
              <span className="profile-avatar">S</span>
              <span className="profile-label">Staff</span>
            </Link>
          </div>
          <button
  type="button"
  className="logout-button"
  onClick={() => {
    handleLogout();
    closeMenu();
  }}
>
  <span>↪</span>
  Logout
</button>
        </div>
      </nav>
    </header>
  );
}

export default TopNavbar;
