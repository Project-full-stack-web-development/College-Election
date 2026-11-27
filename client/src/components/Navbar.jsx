import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar({
  title = 'College Elections',
  backTo = null,
  backLabel = '← Back',
  showProfile = true,
}) {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        marginBottom: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {backTo && (
          <Link
            to={backTo}
            className="btn btn-secondary"
            style={{ padding: '7px 12px', fontSize: '0.82rem' }}
          >
            {backLabel}
          </Link>
        )}
        <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>{title}</span>
      </div>

      {isAuthenticated && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {showProfile && (
            <Link
              to="/profile"
              className="btn btn-secondary"
              style={{ padding: '7px 12px', fontSize: '0.82rem' }}
            >
              My Profile
            </Link>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="btn"
            style={{
              padding: '7px 12px',
              fontSize: '0.82rem',
              background: 'var(--danger-bg)',
              color: 'var(--danger-text)',
            }}
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
