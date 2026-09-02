const express = require('express');
const Goal = require('../models/Goal');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/goals — self, or admin viewing a specific teacher via ?teacherId=
router.get('/', protect, async (req, res) => {
  const teacherId = req.user.role === 'admin' && req.query.teacherId ? req.query.teacherId : req.user._id;
  const goals = await Goal.find({ teacher: teacherId }).sort({ createdAt: -1 });
  res.json(goals);
});

// Teacher creates their own goal
router.post('/', protect, authorize('teacher'), async (req, res) => {
  const { title, description, category, targetDate } = req.body;
  const goal = await Goal.create({ teacher: req.user._id, title, description, category, targetDate });
  res.status(201).json(goal);
});

// Teacher updates their own progress/status; admin can add a note or mark achieved
router.put('/:id', protect, async (req, res) => {
  const goal = await Goal.findById(req.params.id);
  if (!goal) return res.status(404).json({ message: 'Goal not found' });

  const isOwner = String(goal.teacher) === req.user.id;
  if (req.user.role !== 'admin' && !isOwner) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  if (isOwner) {
    ['title', 'description', 'category', 'targetDate', 'progress', 'status'].forEach((field) => {
      if (req.body[field] !== undefined) goal[field] = req.body[field];
    });
    if (req.body.progress >= 100 && !req.body.status) goal.status = 'achieved';
  }

  if (req.user.role === 'admin' && req.body.adminNote !== undefined) {
    goal.adminNote = req.body.adminNote;
  }

  await goal.save();

  // Reaching 100% awards a small recognition point bump automatically
  if (goal.status === 'achieved' && goal.progress >= 100) {
    await User.findByIdAndUpdate(goal.teacher, { $inc: { points: 15 } });
  }

  res.json(goal);
});

router.delete('/:id', protect, async (req, res) => {
  const goal = await Goal.findById(req.params.id);
  if (!goal) return res.status(404).json({ message: 'Goal not found' });
  if (req.user.role !== 'admin' && String(goal.teacher) !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  await goal.deleteOne();
  res.json({ message: 'Goal removed' });
});

module.exports = router;
