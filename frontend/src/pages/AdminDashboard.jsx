import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const { data } = await api.get('/elections');
        setElections(data.elections || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSummary();
  }, []);

  const latestElection = elections[0];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="page-container">
      {/* Top Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>College Elections</span>
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

      {/* Admin Greeting Card */}
      <div className="card" style={{ marginBottom: 16 }}>
        <span className="badge badge-open" style={{ marginBottom: 8 }}>
          ADMIN CONTROLS
        </span>
        <h1 style={{ fontSize: '1.35rem', fontWeight: 700 }}>
          Hello, {user?.name || 'Admin'}!
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 14 }}>
          Manage elections, candidate lists, registered voters, and live results.
        </p>
        <Link to="/admin/elections/new" className="btn btn-primary btn-block">
          + Create Election List
        </Link>
      </div>

      {/* Quick Navigation Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <Link to="/elections" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Active Elections</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {elections.length} total election{elections.length === 1 ? '' : 's'}
          </div>
        </Link>

        <Link to="/admin/voters" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Voters List</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            View & manage voters
          </div>
        </Link>
      </div>

      {/* View Results CTA */}
      <div className="card">
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 6 }}>Election Results</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 12 }}>
          {latestElection
            ? `Latest: ${latestElection.title} (${latestElection.totalVotes ?? 0} votes)`
            : 'Create an election to start collecting votes.'}
        </p>
        {latestElection ? (
          <Link to={`/elections/${latestElection._id}/results`} className="btn btn-dark btn-block">
            View Results →
          </Link>
        ) : (
          <Link to="/elections" className="btn btn-secondary btn-block">
            Go to Elections
          </Link>
        )}
      </div>
    </div>
  );
}
