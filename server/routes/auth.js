const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// @route  POST /api/auth/register
// @desc   Register a new user. Public registration allows "teacher" or
//         "student" only; admin accounts must be created by an existing
//         admin via POST /api/auth/create-admin.
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('A valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { name, email, password, employeeId, subject, department, phone, gradeLevel, role } = req.body;

      const existing = await User.findOne({ email });
      if (existing) return res.status(409).json({ message: 'An account with this email already exists' });

      // Public registration can only ever create a teacher or student —
      // never admin, regardless of what the client sends.
      const safeRole = role === 'student' ? 'student' : 'teacher';

      const user = await User.create({
        name,
        email,
        password,
        role: safeRole,
        employeeId,
        subject,
        department,
        phone,
        gradeLevel,
      });

      const token = signToken(user._id);
      res.status(201).json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err) {
      res.status(500).json({ message: 'Server error during registration', error: err.message });
    }
  }
);

// @route  POST /api/auth/login
router.post(
  '/login',
  [body('email').isEmail(), body('password').notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      if (!user.isActive) {
        return res.status(403).json({ message: 'This account has been deactivated. Contact an administrator.' });
      }

      const token = signToken(user._id);
      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl,
          chosenTeacher: user.chosenTeacher,
        },
      });
    } catch (err) {
      res.status(500).json({ message: 'Server error during login', error: err.message });
    }
  }
);

// @route  POST /api/auth/create-admin
// @desc   Only an authenticated admin can create another admin account.
//         The very first admin should be created directly in the database
//         (see README) or by temporarily relaxing this check.
router.post('/create-admin', protect, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only an admin can create another admin account' });
  }
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'An account with this email already exists' });

    const admin = await User.create({ name, email, password, role: 'admin' });
    res.status(201).json({ id: admin._id, name: admin.name, email: admin.email, role: admin.role });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route  GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

module.exports = router;
