const express = require('express');
const mongoose = require('mongoose');
const Election = require('../models/Election');
const Vote = require('../models/Vote');
const User = require('../models/User');
const { protect, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const filter = {};
    if (req.query.status && ['open', 'closed'].includes(req.query.status)) {
      filter.status = req.query.status;
    }

    const elections = await Election.find(filter).sort({ createdAt: -1 }).lean();
    const userVotes = await Vote.find({ voterId: req.user._id }).lean();
    const votedElectionIds = new Set(userVotes.map((v) => String(v.electionId)));

    const totalVotersCount = await User.countDocuments({
      role: 'student',
      voterIdStatus: 'Verified',
    });

    const enriched = elections.map((election) => {
      const totalVotes =
        election.candidates.reduce((sum, c) => sum + (c.votesCount || 0), 0) +
        (election.notaVotesCount || 0);

      return {
        ...election,
        hasVoted: votedElectionIds.has(String(election._id)),
        totalVotes,
        totalVotersCount,
      };
    });

    res.json({ elections: enriched });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const {
      title,
      position,
      departmentOrTerm,
      startDate,
      endDate,
      description,
      status,
      allowNota,
      candidates,
    } = req.body;

    if (!title || !position || !departmentOrTerm || !startDate || !endDate) {
      return res.status(400).json({
        message:
          'title, position, departmentOrTerm, startDate, and endDate are required',
      });
    }

    const cleanedCandidates = Array.isArray(candidates)
      ? candidates
          .map((c) => ({
            name: typeof c === 'string' ? c.trim() : (c.name || '').trim(),
            subtitleOrParty:
              typeof c === 'string'
                ? ''
                : (c.subtitleOrParty || c.party || '').trim(),
            votesCount: 0,
          }))
          .filter((c) => c.name.length > 0)
      : [];

    if (cleanedCandidates.length < 1) {
      return res.status(400).json({
        message: 'Please provide at least one valid candidate',
      });
    }

    const election = await Election.create({
      title: title.trim(),
      position: position.trim(),
      departmentOrTerm: departmentOrTerm.trim(),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      description: (description || '').trim(),
      status: status === 'closed' ? 'closed' : 'open',
      allowNota: allowNota !== undefined ? Boolean(allowNota) : true,
      candidates: cleanedCandidates,
      createdBy: req.user._id,
    });

    res.status(201).json({ election });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/vote', protect, authorizeRoles('student'), async (req, res) => {
  const { id } = req.params;
  const { choiceType, candidateId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid election ID' });
  }

  try {
    if (req.user.voterIdStatus !== 'Verified') {
      return res.status(403).json({
        message:
          'Your student registration is still Pending admin approval. You can vote once verified.',
      });
    }

    const election = await Election.findById(id);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    const now = new Date();
    if (
      election.status === 'closed' ||
      (election.endDate && now > new Date(election.endDate))
    ) {
      return res
        .status(400)
        .json({ message: 'Voting is closed for this election' });
    }

    const isNota = choiceType === 'NOTA' || candidateId === 'NOTA';

    if (!isNota) {
      if (!candidateId || !mongoose.Types.ObjectId.isValid(candidateId)) {
        return res
          .status(400)
          .json({ message: 'Valid candidateId or NOTA is required' });
      }
      const candidateExists = election.candidates.some(
        (c) => String(c._id) === String(candidateId)
      );
      if (!candidateExists) {
        return res
          .status(404)
          .json({ message: 'Selected candidate not found in election' });
      }
    } else if (!election.allowNota) {
      return res
        .status(400)
        .json({ message: 'NOTA is not enabled for this election' });
    }

    let createdVote;
    try {
      createdVote = await Vote.create({
        electionId: election._id,
        voterId: req.user._id,
        choiceType: isNota ? 'NOTA' : 'candidate',
        candidateId: isNota ? null : candidateId,
      });
    } catch (err) {
      if (err && err.code === 11000) {
        return res.status(409).json({
          message: 'You have already cast your vote in this election',
        });
      }
      throw err;
    }

    if (isNota) {
      await Election.updateOne(
        { _id: election._id },
        { $inc: { notaVotesCount: 1 } }
      );
    } else {
      await Election.updateOne(
        { _id: election._id, 'candidates._id': candidateId },
        { $inc: { 'candidates.$.votesCount': 1 } }
      );
    }

    res.status(201).json({
      message: 'Vote recorded successfully',
      vote: {
        id: createdVote._id,
        electionId: createdVote.electionId,
        choiceType: createdVote.choiceType,
        candidateId: createdVote.candidateId,
        votedAt: createdVote.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/:id/status', protect, authorizeRoles('admin'), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid election ID' });
  }
  if (!['open', 'closed'].includes(status)) {
    return res
      .status(400)
      .json({ message: 'Status must be "open" or "closed"' });
  }

  try {
    const election = await Election.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }
    res.json({ election });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id/results', protect, async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid election ID' });
  }

  try {
    const election = await Election.findById(id).lean();
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    const totalVotersCount = await User.countDocuments({
      role: 'student',
      voterIdStatus: 'Verified',
    });
    const candidateTotal = election.candidates.reduce(
      (sum, c) => sum + (c.votesCount || 0),
      0
    );
    const notaVotes = election.notaVotesCount || 0;
    const totalVotes = candidateTotal + notaVotes;

    const pct = (count) =>
      totalVotes > 0 ? Number(((count / totalVotes) * 100).toFixed(1)) : 0;

    const breakdown = election.candidates
      .map((c) => ({
        _id: c._id,
        name: c.name,
        subtitleOrParty: c.subtitleOrParty || '',
        votesCount: c.votesCount || 0,
        percentage: pct(c.votesCount || 0),
      }))
      .sort((a, b) => b.votesCount - a.votesCount);

    if (election.allowNota) {
      breakdown.push({
        _id: 'NOTA',
        name: 'NOTA',
        subtitleOrParty: 'None of the Above',
        votesCount: notaVotes,
        percentage: pct(notaVotes),
        isNota: true,
      });
    }

    const turnoutPercentage =
      totalVotersCount > 0
        ? Number(((totalVotes / totalVotersCount) * 100).toFixed(1))
        : 0;

    const sortedCandidates = [...election.candidates].sort(
      (a, b) => (b.votesCount || 0) - (a.votesCount || 0)
    );
    const topCandidate = sortedCandidates[0] || null;
    const runnerUp = sortedCandidates[1] || null;
    const isTie =
      topCandidate &&
      runnerUp &&
      (topCandidate.votesCount || 0) > 0 &&
      (topCandidate.votesCount || 0) === (runnerUp.votesCount || 0);

    const winner =
      topCandidate && (topCandidate.votesCount || 0) > 0 && !isTie
        ? {
            _id: topCandidate._id,
            name: topCandidate.name,
            subtitleOrParty: topCandidate.subtitleOrParty || '',
            votesCount: topCandidate.votesCount || 0,
            percentage: pct(topCandidate.votesCount || 0),
          }
        : null;

    res.json({
      election: {
        _id: election._id,
        title: election.title,
        position: election.position,
        departmentOrTerm: election.departmentOrTerm,
        status: election.status,
      },
      summary: {
        totalVotes,
        totalVotersCount,
        turnoutPercentage,
        winner,
        isTie,
      },
      breakdown,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
