const express = require('express');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

const todayString = () => new Date().toISOString().slice(0, 10);

// Teacher marks their own attendance for today (check-in)
router.post('/check-in', protect, authorize('teacher'), async (req, res) => {
  const date = todayString();
  const now = new Date();
  const cutoffHour = 9; // after 9:00 counts as late; adjust to your school's policy
  const status = now.getHours() >= cutoffHour ? 'late' : 'present';

  try {
    const record = await Attendance.findOneAndUpdate(
      { teacher: req.user._id, date },
      { $setOnInsert: { checkIn: now, status } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(201).json(record);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Already checked in today' });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Teacher checks out
router.post('/check-out', protect, authorize('teacher'), async (req, res) => {
  const date = todayString();
  const record = await Attendance.findOneAndUpdate(
    { teacher: req.user._id, date },
    { checkOut: new Date() },
    { new: true }
  );
  if (!record) return res.status(404).json({ message: 'No check-in found for today' });
  res.json(record);
});

// Get attendance history: self, or admin querying a teacherId
router.get('/', protect, async (req, res) => {
  const teacherId = req.user.role === 'admin' && req.query.teacherId ? req.query.teacherId : req.user._id;
  const records = await Attendance.find({ teacher: teacherId }).sort({ date: -1 }).limit(90);
  res.json(records);
});

// Admin: live "who's in today" board — every teacher merged with their
// attendance status for today (or "not-marked" if they haven't checked in)
router.get('/today', protect, authorize('admin'), async (req, res) => {
  const date = todayString();

  const [teachers, todayRecords] = await Promise.all([
    User.find({ role: 'teacher', isActive: true }).select('name subject'),
    Attendance.find({ date }),
  ]);

  const byTeacher = {};
  todayRecords.forEach((r) => { byTeacher[String(r.teacher)] = r; });

  const board = teachers.map((t) => {
    const record = byTeacher[String(t._id)];
    return {
      teacherId: t._id,
      name: t.name,
      subject: t.subject,
      status: record ? record.status : 'not-marked',
      checkIn: record?.checkIn || null,
    };
  });

  res.json(board);
});

// Admin: mark/adjust attendance manually (e.g. approved leave)
router.post('/manual', protect, authorize('admin'), async (req, res) => {
  const { teacherId, date, status, note } = req.body;
  const record = await Attendance.findOneAndUpdate(
    { teacher: teacherId, date },
    { status, note },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  res.json(record);
});

module.exports = router;
