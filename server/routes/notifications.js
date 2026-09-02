const express = require('express');
const Feedback = require('../models/Feedback');
const Training = require('../models/Training');
const LessonPlan = require('../models/LessonPlan');
const Milestone = require('../models/Milestone');
const Goal = require('../models/Goal');

const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/notifications — a lightweight, merged activity feed.
// Teachers see events about themselves; admins see events needing their
// attention across the whole school. No separate collection is needed —
// this reads from existing data and reshapes it into one timeline.
router.get('/', protect, async (req, res) => {
  const items = [];

  if (req.user.role === 'teacher') {
    const teacherId = req.user._id;

    const [feedback, certificates, approvedPlans, milestones, achievedGoals] = await Promise.all([
      Feedback.find({ teacher: teacherId }).sort({ createdAt: -1 }).limit(5),
      Training.find({ teacher: teacherId, certificateIssued: true }).sort({ updatedAt: -1 }).limit(5),
      LessonPlan.find({ teacher: teacherId, status: 'approved' }).sort({ updatedAt: -1 }).limit(5),
      Milestone.find({ teacher: teacherId }).sort({ date: -1 }).limit(5),
      Goal.find({ teacher: teacherId, status: 'achieved' }).sort({ updatedAt: -1 }).limit(5),
    ]);

    feedback.forEach((f) =>
      items.push({
        id: `fb-${f._id}`,
        icon: 'fa-star',
        text: `New ${f.rating}-star feedback received`,
        date: f.createdAt,
      })
    );
    certificates.forEach((t) =>
      items.push({
        id: `cert-${t._id}`,
        icon: 'fa-certificate',
        text: `Certificate ready: ${t.title}`,
        date: t.updatedAt,
      })
    );
    approvedPlans.forEach((p) =>
      items.push({
        id: `plan-${p._id}`,
        icon: 'fa-book-open',
        text: `Lesson plan approved: ${p.title}`,
        date: p.updatedAt,
      })
    );
    milestones.forEach((m) =>
      items.push({
        id: `ms-${m._id}`,
        icon: 'fa-award',
        text: `Milestone awarded: ${m.title}`,
        date: m.date,
      })
    );
    achievedGoals.forEach((g) =>
      items.push({
        id: `goal-${g._id}`,
        icon: 'fa-bullseye',
        text: `Goal achieved: ${g.title}`,
        date: g.updatedAt,
      })
    );
  } else {
    const [pendingPlans, lowRatings] = await Promise.all([
      LessonPlan.find({ status: 'submitted' }).sort({ updatedAt: -1 }).limit(5).populate('teacher', 'name'),
      Feedback.find({ rating: { $lte: 2 } }).sort({ createdAt: -1 }).limit(5).populate('teacher', 'name'),
    ]);

    pendingPlans.forEach((p) =>
      items.push({
        id: `plan-${p._id}`,
        icon: 'fa-book-open',
        text: `${p.teacher?.name || 'A teacher'} submitted "${p.title}" for review`,
        date: p.updatedAt,
      })
    );
    lowRatings.forEach((f) =>
      items.push({
        id: `fb-${f._id}`,
        icon: 'fa-triangle-exclamation',
        text: `${f.teacher?.name || 'A teacher'} received a ${f.rating}-star review`,
        date: f.createdAt,
      })
    );
  }

  items.sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(items.slice(0, 10));
});

module.exports = router;
