const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const { protect, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.get('/me', protect, async (req, res) => {
  res.json({ user: req.user });
});

router.get('/', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const filter = req.query.role ? { role: req.query.role } : {};
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/:id/status', protect, authorizeRoles('admin'), async (req, res) => {
  const { id } = req.params;
  const { voterIdStatus } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  if (!['Verified', 'Pending'].includes(voterIdStatus)) {
    return res
      .status(400)
      .json({ message: 'voterIdStatus must be "Verified" or "Pending"' });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { voterIdStatus },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: `Voter status updated to ${voterIdStatus}`,
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, authorizeRoles('admin'), async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  try {
    if (id === String(req.user._id)) {
      return res
        .status(400)
        .json({ message: 'Cannot delete your own admin account' });
    }

    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User removed', id: deleted._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
