const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

const initialVoterStatus =
  safeRole === 'student' ? 'Pending' : voterIdStatus || 'Verified';

const user = await User.create({
  userId: userId.trim(),
  name: name.trim(),
  email: email.trim().toLowerCase(),
  password,
  role: safeRole,
  birthDate,
  regNumber: regNumber || userId.trim(),
  departmentOrArea,
  voterIdStatus: initialVoterStatus,
});

const signToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { algorithm: 'HS256', expiresIn: '7d' }
  );

router.post('/register', async (req, res) => {
  try {
    const {
      userId,
      name,
      email,
      password,
      role,
      birthDate,
      regNumber,
      departmentOrArea,
      voterIdStatus,
    } = req.body;

    if (!userId || !name || !email || !password) {
      return res.status(400).json({
        message: 'userId, name, email, and password are required',
      });
    }

    const existing = await User.findOne({
      $or: [{ userId: userId.trim() }, { email: email.trim().toLowerCase() }],
    });
    if (existing) {
      return res.status(409).json({
        message: 'A user with that User ID or email already exists',
      });
    }

    const safeRole = role === 'admin' ? 'admin' : 'student';

    const user = await User.create({
      userId: userId.trim(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: safeRole,
      birthDate,
      regNumber: regNumber || userId.trim(),
      departmentOrArea,
      voterIdStatus: voterIdStatus || 'Verified',
    });

    const token = signToken(user);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        birthDate: user.birthDate,
        regNumber: user.regNumber,
        departmentOrArea: user.departmentOrArea,
        voterIdStatus: user.voterIdStatus,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { userId, email, password, role } = req.body;
    const identifier = (userId || email || '').trim();

    if (!identifier || !password) {
      return res.status(400).json({
        message: 'User ID (or email) and password are required',
      });
    }

    const query = identifier.includes('@')
      ? { email: identifier.toLowerCase() }
      : { userId: identifier };

    if (role && ['student', 'admin'].includes(role)) {
      query.role = role;
    }

    const user = await User.findOne(query).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials or role' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials or role' });
    }

    const token = signToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        birthDate: user.birthDate,
        regNumber: user.regNumber,
        departmentOrArea: user.departmentOrArea,
        voterIdStatus: user.voterIdStatus,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
