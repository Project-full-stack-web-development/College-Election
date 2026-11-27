import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function CreateElectionPage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [position, setPosition] = useState('');
  const [departmentOrTerm, setDepartmentOrTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [allowNota, setAllowNota] = useState(true);
  const [candidates, setCandidates] = useState([
    { name: '', subtitleOrParty: '' },
    { name: '', subtitleOrParty: '' },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const addCandidateRow = () => {
    setCandidates((prev) => [...prev, { name: '', subtitleOrParty: '' }]);
  };

  const removeCandidateRow = (index) => {
    if (candidates.length <= 1) return;
    setCandidates((prev) => prev.filter((_, i) => i !== index));
  };

  const updateCandidate = (index, field, value) => {
    setCandidates((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validCandidates = candidates.filter((c) => c.name.trim().length > 0);
    if (!title.trim() || !position.trim() || !departmentOrTerm.trim() || !startDate || !endDate) {
      setError('Please fill in all required election fields.');
      return;
    }
    if (validCandidates.length < 1) {
      setError('Please add at least one candidate name.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/elections', {
        title: title.trim(),
        position: position.trim(),
        departmentOrTerm: departmentOrTerm.trim(),
        startDate,
        endDate,
        description: description.trim(),
        allowNota,
        status: 'open',
        candidates: validCandidates,
      });
      navigate('/elections');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create election list');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Create Election List</h1>
          <button
            type="button"
            onClick={() => navigate('/admin/dashboard')}
            className="btn btn-secondary"
            style={{ padding: '6px 10px', fontSize: '0.8rem' }}
          >
            ← Back
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>
              Election Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. College President 2026"
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>
              Position *
            </label>
            <input
              type="text"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="e.g. Student Body President"
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>
              Department / Term *
            </label>
            <input
              type="text"
              value={departmentOrTerm}
              onChange={(e) => setDepartmentOrTerm(e.target.value)}
              placeholder="e.g. All Departments • Fall 2026"
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>
                Start Date *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ width: '100%', padding: '10px 10px', borderRadius: 10, border: '1px solid var(--border)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>
                End Date *
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ width: '100%', padding: '10px 10px', borderRadius: 10, border: '1px solid var(--border)' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>
              Description / Rules
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief guidelines or eligibility details..."
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)' }}
            />
          </div>

          {/* Candidates Section */}
          <div style={{ marginTop: 4 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Candidates *</span>
              <button
                type="button"
                onClick={addCandidateRow}
                style={{
                  background: 'var(--primary-soft)',
                  color: 'var(--primary)',
                  border: 'none',
                  borderRadius: 8,
                  padding: '5px 10px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                + Add Candidate
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {candidates.map((cand, index) => (
                <div
                  key={index}
                  style={{
                    padding: 10,
                    borderRadius: 10,
                    background: 'var(--bg-page)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      value={cand.name}
                      onChange={(e) => updateCandidate(index, 'name', e.target.value)}
                      placeholder={`Candidate ${index + 1} Name`}
                      style={{
                        flex: 1,
                        padding: '8px 10px',
                        borderRadius: 8,
                        border: '1px solid var(--border)',
                        fontSize: '0.88rem',
                      }}
                    />
                    {candidates.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCandidateRow(index)}
                        style={{
                          border: 'none',
                          background: 'var(--danger-bg)',
                          color: 'var(--danger-text)',
                          borderRadius: 8,
                          padding: '0 10px',
                          cursor: 'pointer',
                          fontWeight: 700,
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={cand.subtitleOrParty}
                    onChange={(e) => updateCandidate(index, 'subtitleOrParty', e.target.value)}
                    placeholder="Department / Slogan / Party (optional)"
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: '1px solid var(--border)',
                      fontSize: '0.84rem',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', marginTop: 4 }}>
            <input
              type="checkbox"
              checked={allowNota}
              onChange={(e) => setAllowNota(e.target.checked)}
            />
            Include NOTA (None of the Above) option on ballot
          </label>

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting} style={{ marginTop: 6 }}>
            {submitting ? 'Creating...' : 'Create Election List ✓'}
          </button>
        </form>
      </div>
    </div>
  );
}
