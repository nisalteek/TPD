const express = require('express');
const TimetableEntry = require('../models/TimetableEntry');
const User = require('../models/User');
const Feedback = require('../models/Feedback');
const Attendance = require('../models/Attendance');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/timetable — self, or admin viewing a specific teacher via ?teacherId=
router.get('/', protect, async (req, res) => {
  const teacherId = req.user.role === 'admin' && req.query.teacherId ? req.query.teacherId : req.user._id;
  const entries = await TimetableEntry.find({ teacher: teacherId }).sort({ day: 1, period: 1 });
  res.json(entries);
});

// Checks for two kinds of clash before a slot is booked:
//  - Room clash: another teacher already has that room at that day+period
//  - Class clash: that class/grade already has a different lesson at that day+period
async function findClash({ day, period, room, className, teacherId, excludeId }) {
  const clashes = [];

  if (room) {
    const roomClash = await TimetableEntry.findOne({
      day, period, room,
      teacher: { $ne: teacherId },
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    }).populate('teacher', 'name');
    if (roomClash) {
      clashes.push({ type: 'room', message: `Room ${room} is already booked by ${roomClash.teacher.name} at this time` });
    }
  }

  if (className) {
    const classClash = await TimetableEntry.findOne({
      day, period, className,
      teacher: { $ne: teacherId },
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    }).populate('teacher', 'name');
    if (classClash) {
      clashes.push({ type: 'class', message: `${className} already has a lesson with ${classClash.teacher.name} at this time` });
    }
  }

  return clashes;
}

// Admin creates a timetable slot for a teacher
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { teacherId, day, period, subject, className, room } = req.body;

    const clashes = await findClash({ day, period, room, className, teacherId });
    if (clashes.length > 0 && !req.body.override) {
      return res.status(409).json({ message: 'Scheduling clash detected', clashes });
    }

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
  const existing = await TimetableEntry.findById(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Timetable entry not found' });

  const { day = existing.day, period = existing.period, room = existing.room, className = existing.className } = req.body;
  const clashes = await findClash({
    day, period, room, className,
    teacherId: existing.teacher, excludeId: existing._id,
  });
  if (clashes.length > 0 && !req.body.override) {
    return res.status(409).json({ message: 'Scheduling clash detected', clashes });
  }

  const entry = await TimetableEntry.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.json(entry);
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  await TimetableEntry.findByIdAndDelete(req.params.id);
  res.json({ message: 'Timetable entry removed' });
});

// GET /api/timetable/substitutes — ranks available teachers to cover a slot.
// Ranking: free at that time first, then subject-matched, then by average
// feedback rating, then by attendance reliability.
router.get('/lookup/substitutes', protect, authorize('admin'), async (req, res) => {
  const { day, period, subject, excludeTeacherId } = req.query;
  if (!day || !period) return res.status(400).json({ message: 'day and period are required' });

  const [teachers, busyEntries, feedback, attendance] = await Promise.all([
    User.find({ role: 'teacher', isActive: true, _id: { $ne: excludeTeacherId } }).select('name subject points'),
    TimetableEntry.find({ day, period: Number(period) }).select('teacher'),
    Feedback.find(),
    Attendance.find(),
  ]);

  const busyIds = new Set(busyEntries.map((e) => String(e.teacher)));

  const ratingByTeacher = {};
  feedback.forEach((f) => {
    const id = String(f.teacher);
    if (!ratingByTeacher[id]) ratingByTeacher[id] = { sum: 0, count: 0 };
    ratingByTeacher[id].sum += f.rating;
    ratingByTeacher[id].count += 1;
  });

  const attendanceByTeacher = {};
  attendance.forEach((a) => {
    const id = String(a.teacher);
    if (!attendanceByTeacher[id]) attendanceByTeacher[id] = { present: 0, total: 0 };
    attendanceByTeacher[id].total += 1;
    if (a.status === 'present' || a.status === 'late') attendanceByTeacher[id].present += 1;
  });

  const ranked = teachers
    .map((t) => {
      const id = String(t._id);
      const isFree = !busyIds.has(id);
      const subjectMatch = subject && t.subject && t.subject.toLowerCase() === subject.toLowerCase();
      const ratingInfo = ratingByTeacher[id];
      const avgRating = ratingInfo ? ratingInfo.sum / ratingInfo.count : 0;
      const attInfo = attendanceByTeacher[id];
      const attendanceRate = attInfo && attInfo.total > 0 ? attInfo.present / attInfo.total : 0;

      // Composite score: free is the biggest factor, then subject match, then rating, then attendance
      const score = (isFree ? 100 : 0) + (subjectMatch ? 40 : 0) + avgRating * 5 + attendanceRate * 10;

      return {
        teacherId: t._id,
        name: t.name,
        subject: t.subject,
        isFree,
        subjectMatch: !!subjectMatch,
        avgRating: Number(avgRating.toFixed(1)),
        attendanceRate: Math.round(attendanceRate * 100),
        score: Number(score.toFixed(1)),
      };
    })
    .sort((a, b) => b.score - a.score);

  res.json(ranked);
});

module.exports = router;
