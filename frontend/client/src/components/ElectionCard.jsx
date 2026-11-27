import { Link } from 'react-router-dom';

export default function ElectionCard({
  election,
  userRole,
  onToggleStatus,
  toggling = false,
}) {
  const isOpen = election.status === 'open';
  const canVote = userRole === 'student' && isOpen && !election.hasVoted;

  return (
    <div className="card">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 8,
          marginBottom: 8,
        }}
      >
        <span className={`badge ${isOpen ? 'badge-open' : 'badge-closed'}`}>
          {isOpen ? 'Voting Open' : 'Voting Closed'}
        </span>

        {userRole === 'student' && (
          <span
            className={`badge ${
              election.hasVoted ? 'badge-open' : 'badge-not-voted'
            }`}
          >
            {election.hasVoted ? 'Voted' : 'Not Voted'}
          </span>
        )}
      </div>

      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 4 }}>
        {election.title}
      </h2>
      <p
        style={{
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          marginBottom: 10,
        }}
      >
        {election.position} • {election.departmentOrTerm}
      </p>

      {election.description && (
        <p
          style={{
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            marginBottom: 12,
          }}
        >
          {election.description}
        </p>
      )}

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
          marginTop: 8,
        }}
      >
        {canVote && (
          <Link
            to={`/elections/${election._id}/vote`}
            className="btn btn-primary"
            style={{ flex: 1, padding: '10px 14px', fontSize: '0.88rem' }}
          >
            Cast Your Vote →
          </Link>
        )}

        {userRole === 'admin' && typeof onToggleStatus === 'function' && (
          <button
            type="button"
            onClick={() => onToggleStatus(election)}
            disabled={toggling}
            className="btn btn-secondary"
            style={{ padding: '10px 12px', fontSize: '0.85rem' }}
          >
            {toggling
              ? 'Updating...'
              : isOpen
              ? 'Close Voting'
              : 'Open Voting'}
          </button>
        )}

        <Link
          to={`/elections/${election._id}/results`}
          className="btn btn-dark"
          style={{
            flex: canVote ? 0 : 1,
            padding: '10px 14px',
            fontSize: '0.88rem',
          }}
        >
          View Results
        </Link>
      </div>
    </div>
  );
}
