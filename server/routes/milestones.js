const express = require('express');
const Milestone = require('../models/Milestone');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, async (req, res) => {
  // Achievement Wall: any authenticated user (teacher or admin) can request
  // the school-wide feed of recent milestones with ?scope=school.
  if (req.query.scope === 'school') {
    const milestones = await Milestone.find({}).populate('teacher', 'name subject').sort({ date: -1 }).limit(30);
    return res.json(milestones);
  }

  const teacherId = req.user.role === 'admin' && req.query.teacherId ? req.query.teacherId : req.user._id;
  const filter = req.user.role === 'admin' && !req.query.teacherId ? {} : { teacher: teacherId };
  const milestones = await Milestone.find(filter).populate('teacher', 'name').sort({ date: -1 });
  res.json(milestones);
});

// Admin awards a milestone/achievement, which also adds gamification points
router.post('/', protect, authorize('admin'), async (req, res) => {
  const milestone = await Milestone.create(req.body);
  if (milestone.points) {
    await User.findByIdAndUpdate(milestone.teacher, { $inc: { points: milestone.points } });
  }
  res.status(201).json(milestone);
});

module.exports = router;
