const express = require('express');
const WellbeingCheckin = require('../models/WellbeingCheckin');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Returns the current ISO week as "YYYY-Www", e.g. "2026-W36"
function currentWeek() {
  const now = new Date();
  const target = new Date(now.valueOf());
  const dayNr = (now.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  const week = 1 + Math.ceil((firstThursday - target.valueOf()) / (7 * 24 * 3600 * 1000));
  return `${now.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

// Teacher submits (or updates) this week's check-in — private, never shown
// to admins individually, only folded into an anonymous weekly average.
router.post('/', protect, authorize('teacher'), async (req, res) => {
  const { score, note } = req.body;
  const week = currentWeek();

  const checkin = await WellbeingCheckin.findOneAndUpdate(
    { teacher: req.user._id, week },
    { score, note },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  res.status(201).json(checkin);
});

// Teacher's own history — the only place individual scores are ever returned
router.get('/mine', protect, authorize('teacher'), async (req, res) => {
  const history = await WellbeingCheckin.find({ teacher: req.user._id }).sort({ week: 1 }).limit(12);
  res.json(history);
});

// Admin-facing aggregate — average score per week, school-wide, with no
// teacher identity attached at any point in this query.
router.get('/aggregate', protect, authorize('admin'), async (req, res) => {
  const results = await WellbeingCheckin.aggregate([
    {
      $group: {
        _id: '$week',
        avgScore: { $avg: '$score' },
        responses: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $limit: 12 },
  ]);

  res.json(
    results.map((r) => ({
      week: r._id,
      avgScore: Number(r.avgScore.toFixed(2)),
      responses: r.responses,
    }))
  );
});

module.exports = router;
