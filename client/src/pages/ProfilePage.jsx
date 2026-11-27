import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);

  useEffect(() => {
    refreshUser();
    const fetchElections = async () => {
      try {
        const { data } = await api.get('/elections');
        setElections(data.elections || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchElections();
  }, [refreshUser]);

  const votedCount = elections.filter((e) => e.hasVoted).length;
  const openCount = elections.filter((e) => e.status === 'open').length;

  const fields = [
    { label: 'Full Name', value: user?.name || '—' },
    { label: 'Birth Date', value: user?.birthDate || '—' },
    { label: 'Email Address', value: user?.email || '—' },
    { label: 'Registration / User ID', value: user?.regNumber || user?.userId || '—' },
    { label: 'Department / Area', value: user?.departmentOrArea || '—' },
  ];

  return (
    <div className="page-container">
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'var(--primary-soft)',
              color: 'var(--primary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '1.2rem',
              marginBottom: 8,
            }}
          >
            {(user?.name || 'U')
              .split(' ')
              .map((p) => p[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 700 }}>My Profile</h1>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
            {user?.role || 'Voter'} Account
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          {fields.map((item) => (
            <div
              key={item.label}
              style={{
                padding: '10px 12px',
                borderRadius: 10,
                background: 'var(--bg-page)',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {item.label}
              </div>
              <div style={{ fontSize: '0.92rem', fontWeight: 600 }}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* Status Badges */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px',
            borderRadius: 12,
            background: 'var(--bg-subtle)',
            marginBottom: 10,
          }}
        >
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Voter ID Status</span>
          <span className="badge badge-verified">{user?.voterIdStatus || 'Verified'}</span>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px',
            borderRadius: 12,
            background: 'var(--bg-subtle)',
            marginBottom: 18,
          }}
        >
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Election Status</span>
          <span className="badge badge-open">
            Voted in {votedCount} / {openCount} Open
          </span>
        </div>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn btn-dark btn-block"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}
