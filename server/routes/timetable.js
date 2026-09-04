const express = require('express');
const TimetableEntry = require('../models/TimetableEntry');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/timetable — self, or admin viewing a specific teacher via ?teacherId=
router.get('/', protect, async (req, res) => {
  const teacherId = req.user.role === 'admin' && req.query.teacherId ? req.query.teacherId : req.user._id;
  const entries = await TimetableEntry.find({ teacher: teacherId }).sort({ day: 1, period: 1 });
  res.json(entries);
});

// Admin creates a timetable slot for a teacher
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { teacherId, day, period, subject, className, room } = req.body;
    const entry = await TimetableEntry.create({ teacher: teacherId, day, period, subject, className, room });
    res.status(201).json(entry);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'This teacher already has a class in that slot' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/:id', protect, authorize('admin'), async (req, res) => {
  const entry = await TimetableEntry.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!entry) return res.status(404).json({ message: 'Timetable entry not found' });
  res.json(entry);
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  await TimetableEntry.findByIdAndDelete(req.params.id);
  res.json({ message: 'Timetable entry removed' });
});

module.exports = router;
