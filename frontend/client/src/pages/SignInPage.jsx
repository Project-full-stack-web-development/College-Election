import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SignInPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('student');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMsg('');

    if (!userId.trim() || !password) {
      setError('Please enter both your User ID and Password.');
      return;
    }

    const res = await login({ userId: userId.trim(), password, role });
    if (!res.ok) {
      setError(res.message);
      return;
    }

    if (res.user.role === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/student/dashboard');
    }
  };

  return (
    <div className="page-container">
      <div className="card" style={{ marginTop: 12 }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'var(--primary)',
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '1.1rem',
              marginBottom: 10,
            }}
          >
            CE
          </div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 700 }}>College Elections</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Sign in to access your election portal
          </p>
        </div>

        {/* Role Switcher */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 8,
            background: 'var(--bg-subtle)',
            padding: 4,
            borderRadius: 'var(--radius-md)',
            marginBottom: 18,
          }}
        >
          <button
            type="button"
            onClick={() => setRole('student')}
            className="btn"
            style={{
              padding: '9px 12px',
              background: role === 'student' ? 'var(--primary)' : 'transparent',
              color: role === 'student' ? '#fff' : 'var(--text-muted)',
            }}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => setRole('admin')}
            className="btn"
            style={{
              padding: '9px 12px',
              background: role === 'admin' ? 'var(--primary)' : 'transparent',
              color: role === 'admin' ? '#fff' : 'var(--text-muted)',
            }}
          >
            Admin
          </button>
        </div>

        {error && (
          <div
            className="badge badge-danger"
            style={{ width: '100%', padding: '10px 12px', borderRadius: 10, marginBottom: 14 }}
          >
            {error}
          </div>
        )}

        {infoMsg && (
          <div
            className="badge badge-open"
            style={{ width: '100%', padding: '10px 12px', borderRadius: 10, marginBottom: 14 }}
          >
            {infoMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
              User ID
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder={role === 'admin' ? 'e.g. a01' : 'e.g. s01'}
              style={{
                width: '100%',
                padding: '11px 12px',
                borderRadius: 10,
                border: '1px solid var(--border)',
                fontSize: '0.95rem',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={{
                width: '100%',
                padding: '11px 12px',
                borderRadius: 10,
                border: '1px solid var(--border)',
                fontSize: '0.95rem',
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.85rem',
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me
            </label>

            <button
              type="button"
              onClick={() =>
                setInfoMsg('Contact your election administrator or college IT desk to reset your password.')
              }
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Forgot Password?
            </button>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>
      </div>
    </div>
  );
}
