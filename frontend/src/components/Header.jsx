import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header({
  title = "College Elections",
  subtitle = "",
  backTo = null,
  backLabel = "← Back",
  showProfile = true,
}) {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        marginBottom: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        {backTo && (
          <Link
            to={backTo}
            className="btn btn-secondary"
            style={{ padding: "7px 12px", fontSize: "0.82rem", flexShrink: 0 }}
          >
            {backLabel}
          </Link>
        )}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: "1.05rem" }}>{title}</div>
          {subtitle && (
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
              {subtitle}
            </div>
          )}
        </div>
      </div>

      {isAuthenticated && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {user?.role && (
            <span
              className="badge"
              style={{
                background: "var(--bg-subtle)",
                color: "var(--text-muted)",
                textTransform: "capitalize",
              }}
            >
              {user.role}
            </span>
          )}
          {showProfile && (
            <Link
              to="/profile"
              className="btn btn-secondary"
              style={{ padding: "7px 12px", fontSize: "0.82rem" }}
            >
              My Profile
            </Link>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="btn"
            style={{
              padding: "7px 12px",
              fontSize: "0.82rem",
              background: "var(--danger-bg)",
              color: "var(--danger-text)",
            }}
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
}