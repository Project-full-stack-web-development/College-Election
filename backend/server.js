const express = require('express');
const cors = require('cors');
const { getElections, saveElections } = require('./utils/storage');
const authRouter = require('./routers/authRouter');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Campus Poll backend is alive!');
});

app.use('/auth', authRouter);

app.get('/elections', (req, res) => {
  const elections = getElections();
  res.json(elections);
})

app.post('/elections', (req, res) => {
  const { title, candidateNames } = req.body;

  if (!title || !Array.isArray(candidateNames) || candidateNames.length < 2) {
    return res.status(400).json({ error: 'Provide a title and at least 2 candidate names.' });
  }

  const elections = getElections();
  const newElection = {
    id: `elec-${Date.now()}`,
    title,
    status: 'open',
    candidates: candidateNames.map((name, index) => ({
      id: `cand-${index + 1}`,
      name,
      votes: 0,
    })),
    votedUserIds: [],
  };

  elections.push(newElection);
  saveElections(elections);

  res.status(201).json(newElection);
});

app.post('/elections/:id/vote', (req, res) => {
  const { candidateId, userId } = req.body;
  const elections = getElections();

  const election = elections.find((e) => e.id === req.params.id);
  if (!election) {
    return res.status(404).json({ error: 'Election not found.' });
  }

  if (election.status !== 'open') {
    return res.status(400).json({ error: 'This election is closed.' });
  }

  if (!userId) {
    return res.status(400).json({ error: 'userId is required to vote.' });
  }

  if (election.votedUserIds.includes(userId)) {
    return res.status(400).json({ error: 'You have already voted in this election.' });
  }

  const candidate = election.candidates.find((c) => c.id === candidateId);
  if (!candidate) {
    return res.status(404).json({ error: 'Candidate not found.' });
  }

  candidate.votes += 1;
  election.votedUserIds.push(userId);
  saveElections(elections);

  res.json({ message: 'Vote recorded!', election });
});


app.patch('/elections/:id/status', (req, res) => {
  const { status } = req.body;
  if (status !== 'open' && status !== 'closed') {
    return res.status(400).json({ error: 'Status must be "open" or "closed".' });
  }

  const elections = getElections();
  const election = elections.find((e) => e.id === req.params.id);
  if (!election) {
    return res.status(404).json({ error: 'Election not found.' });
  }

  election.status = status;
  saveElections(elections);

  res.json({ message: `Election is now ${status}.`, election });
});

app.delete('/elections/:id', (req, res) => {
  const elections = getElections();
  const index = elections.findIndex((e) => e.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Election not found.' });
  }

  const [removed] = elections.splice(index, 1);
  saveElections(elections);

  res.json({ message: `Deleted election "${removed.title}".`, removed });
});

app.post('/elections/:id/reset', (req, res) => {
  const elections = getElections();
  const election = elections.find((e) => e.id === req.params.id);

  if (!election) {
    return res.status(404).json({ error: 'Election not found.' });
  }

  election.candidates.forEach((cand) => {
    cand.votes = 0;
  });
  election.votedUserIds = [];

  saveElections(elections);

  res.json({ message: `Reset votes for "${election.title}".`, election });
});


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
