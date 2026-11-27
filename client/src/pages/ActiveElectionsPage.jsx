import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import ElectionCard from '../components/ElectionCard';

export default function ActiveElectionsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [elections, setElections] = useState([]);
  const [filter, setFilter] = useState('all'); 
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState('');
  const [error, setError] = useState('');

  const dashboardPath =
    user?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard';

  useEffect(() => {
    const loadElections = async () => {
      setLoading(true);
      setError('');
      try {
        const query = filter === 'all' ? '' : `?status=${filter}`;
        const { data } = await api.get(`/elections${query}`);
        setElections(data.elections || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load elections');
      } finally {
        setLoading(false);
      }
    };
    loadElections();
  }, [filter]);

  const handleToggleStatus = async (election) => {
    const nextStatus = election.status === 'open' ? 'closed' : 'open';
    setTogglingId(String(election._id));
    setError('');

    try {
      const { data } = await api.patch(`/elections/${election._id}/status`, {
        status: nextStatus,
      });
      const updatedStatus = data.election?.status || nextStatus;

      setElections((prev) =>
        prev
          .map((item) =>
            item._id === election._id ? { ...item, status: updatedStatus } : item
          )
          .filter((item) => (filter === 'all' ? true : item.status === filter))
      );
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to update election status'
      );
    } finally {
      setTogglingId('');
    }
  };

  return (
    <div className="page-container">
      <Navbar
        title="Active Elections"
        backTo={dashboardPath}
        backLabel="← Dashboard"
      />

      {/* Filter Pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[
          { key: 'all', label: 'All' },
          { key: 'open', label: 'Voting Open' },
          { key: 'closed', label: 'Voting Closed' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key)}
            className="btn"
            style={{
              padding: '7px 14px',
              fontSize: '0.82rem',
              background:
                filter === tab.key ? 'var(--primary)' : 'var(--bg-surface)',
              color: filter === tab.key ? '#fff' : 'var(--text-muted)',
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
            marginBottom: 14,
            textAlign: 'left',
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="card">
          <p style={{ color: 'var(--text-muted)' }}>Loading elections...</p>
        </div>
      ) : elections.length === 0 ? (
        <div className="card" style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: 12 }}>
            No elections match this filter right now.
          </p>
          {user?.role === 'admin' && (
            <Link to="/admin/elections/new" className="btn btn-primary">
              + Create Election List
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {elections.map((election) => (
            <ElectionCard
              key={election._id}
              election={election}
              userRole={user?.role}
              onToggleStatus={handleToggleStatus}
              toggling={togglingId === String(election._id)}
            />
          ))}
        </div>
      )}

      <div style={{ marginTop: 18 }}>
        <button
          type="button"
          onClick={() => navigate(dashboardPath)}
          className="btn btn-secondary btn-block"
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}
