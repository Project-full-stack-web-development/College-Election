export default function ElectionCard({
  election,
  user,
  onVote,
  onToggleStatus,
  onDelete,
  onReset,
}) {
  const isOpen = election.status === 'open';

  const totalVotes = election.candidates.reduce(
    (sum, cand) => sum + cand.votes,
    0
  );

  const highestVotes = Math.max(...election.candidates.map((c) => c.votes), 0);
  const leaders =
    highestVotes > 0
      ? election.candidates.filter((c) => c.votes === highestVotes)
      : [];

  let resultText = 'No votes cast yet.';
  if (leaders.length === 1) {
    resultText = isOpen
      ? `Leading: ${leaders[0].name} (${highestVotes} votes)`
      : `Winner: ${leaders[0].name} (${highestVotes} votes)`;
  } else if (leaders.length > 1) {
    const names = leaders.map((c) => c.name).join(' & ');
    resultText = `Tie between ${names} (${highestVotes} votes each)`;
  }

  return (
    <div
      style={{
        border: '1px solid #ccc',
        borderRadius: '6px',
        padding: '16px',
        marginBottom: '16px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h3 style={{ marginTop: 0 }}>{election.title}</h3>
        <span
          style={{
            padding: '2px 8px',
            borderRadius: '12px',
            background: isOpen ? '#d4edda' : '#f8d7da',
            color: isOpen ? '#155724' : '#721c24',
            height: 'fit-content',
          }}
        >
          {election.status.toUpperCase()}
        </span>
      </div>

      {user?.role === 'admin' && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <button
            onClick={() =>
              onToggleStatus(election.id, isOpen ? 'closed' : 'open')
            }
          >
            {isOpen ? 'Close Election' : 'Reopen Election'}
          </button>

          <button onClick={() => onReset(election.id)}>
            Reset Votes
          </button>

          <button onClick={() => onDelete(election.id)}>
            Delete Election
          </button>
        </div>
      )}

      <ul>
        {election.candidates.map((cand) => (
          <li key={cand.id} style={{ marginBottom: '8px' }}>
            {cand.name} — <strong>{cand.votes}</strong> votes{' '}
            <button
              disabled={!isOpen}
              onClick={() => onVote(election.id, cand.id)}
            >
              Vote
            </button>
          </li>
        ))}
      </ul>

      <div
        style={{
          marginTop: '12px',
          paddingTop: '10px',
          borderTop: '1px solid #eee',
          fontSize: '0.95rem',
        }}
      >
        <div>
          Total votes: <strong>{totalVotes}</strong>
        </div>
        <div>{resultText}</div>
      </div>
    </div>
  );
}
