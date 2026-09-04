const express = require('express');
const User = require('../models/User');
const Milestone = require('../models/Milestone');
const Training = require('../models/Training');
const Goal = require('../models/Goal');
const Feedback = require('../models/Feedback');

const router = express.Router();

// GET /api/portfolio/:teacherId — public, no login required. This is the
// shareable "career portfolio" link, safe to hand to a parent, an employer,
// or post publicly. Only ever exposes information already meant to be
// public elsewhere in the app (milestones, achieved goals, ratings) — never
// email, phone, or attendance/lesson-plan detail.
router.get('/:teacherId', async (req, res) => {
  const teacher = await User.findOne({ _id: req.params.teacherId, role: 'teacher' }).select(
    'name subject department bio avatarUrl points dateJoined'
  );
  if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

  const [milestones, certificates, achievedGoals, feedback] = await Promise.all([
    Milestone.find({ teacher: teacher._id }).sort({ date: -1 }),
    Training.find({ teacher: teacher._id, certificateIssued: true }).select('title completionDate'),
    Goal.find({ teacher: teacher._id, status: 'achieved' }).select('title category'),
    Feedback.find({ teacher: teacher._id }).select('rating'),
  ]);

  const avgRating = feedback.length
    ? Number((feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1))
    : null;

  res.json({
    name: teacher.name,
    subject: teacher.subject,
    department: teacher.department,
    bio: teacher.bio,
    avatarUrl: teacher.avatarUrl,
    points: teacher.points,
    memberSince: teacher.dateJoined,
    avgRating,
    reviewCount: feedback.length,
    milestones,
    certificates,
    achievedGoals,
  });
});

module.exports = router;
