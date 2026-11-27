import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function VotersListPage() {
  const navigate = useNavigate();

  const [voters, setVoters] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'Pending' | 'Verified'
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const loadVoters = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/users');
        setVoters(data.users || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load voters list');
      } finally {
        setLoading(false);
      }
    };
    loadVoters();
  }, []);

  const handleApproveVoter = async (voter) => {
    setActionId(String(voter._id));
    setError('');
    setSuccessMsg('');
    try {
      const { data } = await api.patch(`/users/${voter._id}/status`, {
        voterIdStatus: 'Verified',
      });
      const nextStatus = data.user?.voterIdStatus || 'Verified';

      setVoters((prev) =>
        prev.map((item) =>
          String(item._id) === String(voter._id)
            ? { ...item, voterIdStatus: nextStatus }
            : item
        )
      );
      setSuccessMsg(`Approved ${voter.name} (${voter.userId}) as Verified.`);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to approve student registration'
      );
    } finally {
      setActionId('');
    }
  };

  const handleDeleteVoter = async (voter) => {
    setActionId(String(voter._id));
    setError('');
    setSuccessMsg('');
    try {
      await api.delete(`/users/${voter._id}`);
      setVoters((prev) =>
        prev.filter((item) => String(item._id) !== String(voter._id))
      );
      setSuccessMsg(`Removed ${voter.name} (${voter.userId}).`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove user');
    } finally {
      setActionId('');
    }
  };

  const filteredVoters = voters.filter((voter) => {
    if (statusFilter === 'all') return true;
    return (voter.voterIdStatus || 'Verified') === statusFilter;
  });

  const pendingCount = voters.filter(
    (v) => v.role === 'student' && (v.voterIdStatus || 'Verified') === 'Pending'
  ).length;

  return (
    <div className="page-container">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14,
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Voters List</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {voters.length} total • {pendingCount} pending approval
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/admin/dashboard')}
          className="btn btn-secondary"
          style={{ padding: '7px 12px', fontSize: '0.82rem' }}
        >
          ← Back
        </button>
      </div>

      {/* Filter Pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {[
          { key: 'all', label: 'All' },
          { key: 'Pending', label: `Pending (${pendingCount})` },
          { key: 'Verified', label: 'Verified' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setStatusFilter(tab.key)}
            className="btn"
            style={{
              padding: '7px 12px',
              fontSize: '0.8rem',
              background:
                statusFilter === tab.key ? 'var(--primary)' : 'var(--bg-surface)',
              color: statusFilter === tab.key ? '#fff' : 'var(--text-muted)',
              border: '1px solid var(--border)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div
          className="badge badge-danger"
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 10,
            marginBottom: 12,
            textAlign: 'left',
          }}
        >
          {error}
        </div>
      )}

      {successMsg && (
        <div
          className="badge badge-open"
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 10,
            marginBottom: 12,
            textAlign: 'left',
          }}
        >
          {successMsg}
        </div>
      )}

      {loading ? (
        <div className="card">
          <p style={{ color: 'var(--text-muted)' }}>Loading voters...</p>
        </div>
      ) : filteredVoters.length === 0 ? (
        <div className="card" style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>
            No users found for this filter.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredVoters.map((voter) => {
            const voterStatus = voter.voterIdStatus || 'Verified';
            const isVerified = voterStatus === 'Verified';
            const isBusy = actionId === String(voter._id);

            return (
              <div
                key={voter._id}
                className="card"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 10,
                  padding: 14,
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 4,
                      flexWrap: 'wrap',
                    }}
                  >
                    <strong style={{ fontSize: '0.95rem' }}>{voter.name}</strong>
                    <span
                      className={`badge ${
                        isVerified ? 'badge-open' : 'badge-not-voted'
                      }`}
                    >
                      {voterStatus}
                    </span>
                    <span
                      className="badge"
                      style={{
                        background: 'var(--bg-subtle)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {voter.role}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    ID: {voter.userId}
                    {voter.departmentOrArea ? ` • ${voter.departmentOrArea}` : ''}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {voter.email}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    flexShrink: 0,
                  }}
                >
                  {voter.role === 'student' && !isVerified && (
                    <button
                      type="button"
                      onClick={() => handleApproveVoter(voter)}
                      disabled={isBusy}
                      className="btn btn-primary"
                      style={{ padding: '7px 11px', fontSize: '0.8rem' }}
                    >
                      {isBusy ? '...' : 'Accept'}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDeleteVoter(voter)}
                    disabled={isBusy}
                    title={`Delete ${voter.name}`}
                    className="btn"
                    style={{
                      padding: '7px 10px',
                      fontSize: '0.8rem',
                      background: 'var(--danger-bg)',
                      color: 'var(--danger-text)',
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
