import { useEffect, useState } from 'react';
import Header from './components/Header';
import ElectionCard from './components/ElectionCard';
import { apiRequest } from './utils/api';

export default function App() {

  const [email, setEmail] = useState('s01@m.fi');
  const [password, setPassword] = useState('student123');
  const [user, setUser] = useState(null);

  const [elections, setElections] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');

  const [newTitle, setNewTitle] = useState('');
  const [candidateText, setCandidateText] = useState('');

  async function loadElections() {
    try {
      const data = await apiRequest('/elections');
      setElections(data);
    } catch (err) {
      setStatusMessage(err.message || 'Could not load elections');
    }
  }

  useEffect(() => {
    loadElections();
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setStatusMessage('');

    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      setUser(data.user);
      setStatusMessage(`Logged in as ${data.user.name} (${data.user.role})`);
    } catch (err) {
      setStatusMessage(err.message || 'Login failed');
    }
  }

  async function handleVote(electionId, candidateId) {
    if (!user) {
      setStatusMessage('Please log in first before voting.');
      return;
    }

    try {
      const data = await apiRequest(`/elections/${electionId}/vote`, {
        method: 'POST',
        body: JSON.stringify({
          candidateId,
          userId: user.id,
        }),
      });

      setStatusMessage(data.message);
      loadElections();
    } catch (err) {
      setStatusMessage(err.message || 'Could not cast vote');
    }
  }

  async function handleCreateElection(e) {
    e.preventDefault();
    setStatusMessage('');

    const candidateNames = candidateText
      .split(',')
      .map((name) => name.trim())
      .filter(Boolean);

    try {
      const data = await apiRequest('/elections', {
        method: 'POST',
        body: JSON.stringify({
          title: newTitle,
          candidateNames,
        }),
      });

      setNewTitle('');
      setCandidateText('');
      setStatusMessage(`Created election: "${data.title}"`);
      loadElections();
    } catch (err) {
      setStatusMessage(err.message || 'Failed to create election');
    }
  }

  async function handleToggleStatus(electionId, nextStatus) {
    setStatusMessage('');

    try {
      const data = await apiRequest(`/elections/${electionId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });

      setStatusMessage(data.message);
      loadElections();
    } catch (err) {
      setStatusMessage(err.message || 'Could not update status');
    }
  }

  async function handleDeleteElection(electionId) {
    setStatusMessage('');

    try {
      const data = await apiRequest(`/elections/${electionId}`, {
        method: 'DELETE',
      });

      setStatusMessage(data.message);
      loadElections();
    } catch (err) {
      setStatusMessage(err.message || 'Could not delete election');
    }
  }

async function handleResetVotes(electionId) {
    setStatusMessage('');

    try {
      const data = await apiRequest(`/elections/${electionId}/reset`, {
        method: 'POST',
      });

      setStatusMessage(data.message);
      loadElections();
    } catch (err) {
      setStatusMessage(err.message || 'Could not reset votes');
    }
  }

  return (
    <div style={{ maxWidth: '640px', margin: '40px auto', fontFamily: 'sans-serif' }}>
      <Header user={user} onLogout={() => setUser(null)} />

      {/* Login Section */}
      {!user && (
        <form onSubmit={handleLogin} style={{ marginBottom: '24px' }}>
          <h2>Log In</h2>
          <div style={{ marginBottom: '8px' }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
          </div>
          <div style={{ marginBottom: '8px' }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
          </div>
          <button type="submit">Log In</button>
        </form>
      )}

      {/* Admin-only Create Election Form */}
      {user?.role === 'admin' && (
        <form onSubmit={handleCreateElection} style={{ marginBottom: '24px' }}>
          <h2>Create New Election (Admin)</h2>
          <div style={{ marginBottom: '8px' }}>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Election title (e.g., Club Treasurer 2027)"
            />
          </div>
          <div style={{ marginBottom: '8px' }}>
            <input
              type="text"
              value={candidateText}
              onChange={(e) => setCandidateText(e.target.value)}
              placeholder="Candidates separated by commas"
            />
          </div>
          <button type="submit">Create Election</button>
        </form>
      )}

      {/* Status / Error Banner */}
      {statusMessage && (
        <p style={{ padding: '10px', background: '#f0f0f0' }}>{statusMessage}</p>
      )}

      {/* Elections List */}
      <h2>Elections</h2>
      {elections.map((election) => (
        <ElectionCard
          key={election.id}
          election={election}
          user={user}
          onVote={handleVote}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDeleteElection}
          onReset={handleResetVotes}
        />
      ))}
    </div>
  );
}
