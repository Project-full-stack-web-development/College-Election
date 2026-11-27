import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/client';
import CandidateCard from '../components/CandidateCard';

export default function CastVotePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [election, setElection] = useState(null);
  const [selectedChoice, setSelectedChoice] = useState(''); // candidate._id or 'NOTA'
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadElection = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/elections');
        const found = (data.elections || []).find(
          (item) => String(item._id) === String(id)
        );
        if (!found) {
          setError('Election not found.');
        } else if (found.hasVoted) {
          navigate(`/elections/${id}/results`, { replace: true });
        } else {
          setElection(found);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load ballot');
      } finally {
        setLoading(false);
      }
    };
    loadElection();
  }, [id, navigate]);

  const handleConfirmVote = async () => {
    if (!selectedChoice) return;
    setSubmitting(true);
    setError('');
    try {
      const payload =
        selectedChoice === 'NOTA'
          ? { choiceType: 'NOTA' }
          : { choiceType: 'candidate', candidateId: selectedChoice };

      await api.post(`/elections/${id}/vote`, payload);
      navigate(`/elections/${id}/results`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit your vote');
      setConfirmOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="card">
          <p style={{ color: 'var(--text-muted)' }}>Loading ballot...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="card">
        <span className="badge badge-open" style={{ marginBottom: 8 }}>
          OFFICIAL BALLOT
        </span>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Cast Your Vote</h1>
        {election && (
          <p
            style={{
              fontSize: '0.88rem',
              color: 'var(--text-muted)',
              marginBottom: 16,
            }}
          >
            {election.title} • {election.position}
          </p>
        )}

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

        {election && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              marginBottom: 18,
            }}
          >
            {election.candidates.map((candidate) => (
              <CandidateCard
                key={candidate._id}
                name={candidate.name}
                subtitle={candidate.subtitleOrParty}
                selected={selectedChoice === String(candidate._id)}
                onSelect={() => setSelectedChoice(String(candidate._id))}
              />
            ))}

            {election.allowNota && (
              <CandidateCard
                name="NOTA"
                subtitle="None of the Above"
                isNota
                selected={selectedChoice === 'NOTA'}
                onSelect={() => setSelectedChoice('NOTA')}
              />
            )}
          </div>
        )}

        {/* Confirmation Box */}
        {confirmOpen && (
          <div
            style={{
              padding: 14,
              borderRadius: 12,
              background: 'var(--bg-subtle)',
              marginBottom: 16,
            }}
          >
            <p
              style={{
                fontWeight: 600,
                fontSize: '0.9rem',
                marginBottom: 10,
              }}
            >
              Confirm your vote? Once submitted, it cannot be changed.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ flex: 1, padding: '9px 12px', fontSize: '0.85rem' }}
                onClick={() => setConfirmOpen(false)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: 1, padding: '9px 12px', fontSize: '0.85rem' }}
                onClick={handleConfirmVote}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Yes, Submit Vote'}
              </button>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={() => navigate('/elections')}
            className="btn btn-secondary"
            style={{ flex: 1 }}
            disabled={submitting}
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="btn btn-primary"
            style={{ flex: 1 }}
            disabled={!selectedChoice || submitting}
          >
            Submit ✓
          </button>
        </div>
      </div>
    </div>
  );
}
