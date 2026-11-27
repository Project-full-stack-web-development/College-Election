import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadElections = async () => {
      try {
        const { data } = await api.get('/elections');
        setElections(data.elections || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadElections();
  }, []);

  const openElections = elections.filter((e) => e.status === 'open');
  const pendingVotes = openElections.filter((e) => !e.hasVoted);
  const featuredElection = openElections[0] || elections[0];

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
        <div>
          <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>College Elections</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/profile" className="btn btn-secondary" style={{ padding: '7px 12px', fontSize: '0.82rem' }}>
            My Profile
          </Link>
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
      </div>

      {/* Greeting & Overview Card */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              STUDENT PORTAL
            </p>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 700 }}>
              Hello, {user?.name || 'Student'}!
            </h1>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              {user?.departmentOrArea || 'General Voter'} • ID: {user?.userId}
            </p>
          </div>
          <span className={`badge ${pendingVotes.length > 0 ? 'badge-not-voted' : 'badge-open'}`}>
            {pendingVotes.length > 0 ? `${pendingVotes.length} Not Voted` : 'All Caught Up'}
          </span>
        </div>

        <div style={{ marginTop: 16 }}>
          <Link to="/elections" className="btn btn-primary btn-block">
            Browse Active Elections ({openElections.length} Open)
          </Link>
        </div>
      </div>

      {/* Election Overview */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Election Overview</h2>
          <Link to="/elections" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
            View All
          </Link>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading elections...</p>
        ) : featuredElection ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <strong>{featuredElection.title}</strong>
              <span className={`badge ${featuredElection.status === 'open' ? 'badge-open' : 'badge-closed'}`}>
                {featuredElection.status === 'open' ? 'Voting Open' : 'Voting Closed'}
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 12 }}>
              Position: {featuredElection.position} • {featuredElection.departmentOrTerm}
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              {featuredElection.status === 'open' && !featuredElection.hasVoted && (
                <Link
                  to={`/elections/${featuredElection._id}/vote`}
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '10px 14px', fontSize: '0.88rem' }}
                >
                  Cast Your Vote
                </Link>
              )}
              <Link
                to={`/elections/${featuredElection._id}/results`}
                className="btn btn-dark"
                style={{ flex: 1, padding: '10px 14px', fontSize: '0.88rem' }}
              >
                View Results
              </Link>
            </div>
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No elections published yet.</p>
        )}
      </div>
    </div>
  );
}
