import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/client';

export default function ElectionResultsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadResults = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/elections/${id}/results`);
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load results');
      } finally {
        setLoading(false);
      }
    };
    loadResults();
  }, [id]);

  return (
    <div className="page-container">
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <span className="badge badge-open" style={{ marginBottom: 6 }}>
            ELECTION RESULTS
          </span>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700 }}>
            {data?.election?.title || 'Vote Tally'}
          </h1>
          {data?.election && (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {data.election.position} • {data.election.departmentOrTerm}
            </p>
          )}
        </div>

        {error && (
          <div
            className="badge badge-danger"
            style={{ width: '100%', padding: '10px 12px', borderRadius: 10, marginBottom: 14 }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Calculating results...</p>
        ) : data ? (
          <>
            {/* Winner / Leading Banner */}
            <div
              style={{
                background: 'linear-gradient(135deg, #5b3df5 0%, #7c3aed 100%)',
                color: '#fff',
                borderRadius: 16,
                padding: 18,
                marginBottom: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', opacity: 0.9, fontWeight: 600, letterSpacing: 0.4 }}>
                  {data.election.status === 'closed' ? 'FINAL WINNER' : 'CURRENT LEADER'}
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: 2 }}>
                  {data.summary.winner
                    ? data.summary.winner.name
                    : data.summary.isTie
                    ? 'Tied at Top'
                    : 'No Votes Cast Yet'}
                </div>
                {data.summary.winner && (
                  <div style={{ fontSize: '0.85rem', opacity: 0.92, marginTop: 2 }}>
                    {data.summary.winner.votesCount} votes ({data.summary.winner.percentage}%)
                  </div>
                )}
              </div>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.3rem',
                  flexShrink: 0,
                }}
              >
                🏆
              </div>
            </div>

            {/* Vote Breakdown */}
            <div style={{ marginBottom: 18 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 10,
                }}
              >
                <h2 style={{ fontSize: '0.98rem', fontWeight: 700 }}>Vote Breakdown</h2>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {data.summary.totalVotes} Total Votes
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {data.breakdown.map((item) => (
                  <div key={item._id}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.88rem',
                        marginBottom: 5,
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>
                        {item.name}{' '}
                        {item.subtitleOrParty ? (
                          <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>
                            • {item.subtitleOrParty}
                          </span>
                        ) : null}
                      </span>
                      <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                        {item.percentage}% ({item.votesCount})
                      </span>
                    </div>
                    <div
                      style={{
                        height: 8,
                        borderRadius: 999,
                        background: 'var(--bg-subtle)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${item.percentage}%`,
                          height: '100%',
                          borderRadius: 999,
                          background: item.isNota ? '#94a3b8' : 'var(--primary)',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Stats */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 10,
                background: 'var(--bg-page)',
                padding: 12,
                borderRadius: 12,
                marginBottom: 18,
                textAlign: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Total Votes</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>{data.summary.totalVotes}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Voter Turnout</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--success-text)' }}>
                  {data.summary.turnoutPercentage}%
                </div>
              </div>
            </div>
          </>
        ) : null}

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
