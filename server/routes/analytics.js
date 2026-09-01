const express = require('express');
const Attendance = require('../models/Attendance');
const Feedback = require('../models/Feedback');
const Training = require('../models/Training');
const LessonPlan = require('../models/LessonPlan');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Aggregated stats for a single teacher's dashboard
router.get('/teacher/:id', protect, async (req, res) => {
  const { id } = req.params;
  if (req.user.role !== 'admin' && req.user.id !== id) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const [attendance, feedback, training, lessonPlans] = await Promise.all([
    Attendance.find({ teacher: id }),
    Feedback.find({ teacher: id }),
    Training.find({ teacher: id }),
    LessonPlan.find({ teacher: id }),
  ]);

  const totalDays = attendance.length || 1;
  const presentDays = attendance.filter((a) => a.status === 'present').length;
  const lateDays = attendance.filter((a) => a.status === 'late').length;
  const attendanceRate = Math.round(((presentDays + lateDays) / totalDays) * 100);

  const avgRating = feedback.length
    ? Number((feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(2))
    : 0;

  const ratingBreakdown = [1, 2, 3, 4, 5].map((star) => ({
    star,
    count: feedback.filter((f) => f.rating === star).length,
  }));

  const trainingHours = training.reduce((sum, t) => sum + (t.hours || 0), 0);
  const completedTrainings = training.filter((t) => t.status === 'completed').length;

  const lessonPlanStatus = ['draft', 'submitted', 'approved', 'needs-revision'].map((status) => ({
    status,
    count: lessonPlans.filter((p) => p.status === status).length,
  }));

  res.json({
    attendanceRate,
    presentDays,
    lateDays,
    absentDays: attendance.filter((a) => a.status === 'absent').length,
    avgRating,
    feedbackCount: feedback.length,
    ratingBreakdown,
    trainingHours,
    completedTrainings,
    lessonPlanStatus,
  });
});

// School-wide analytics for the admin dashboard
router.get('/school', protect, authorize('admin'), async (req, res) => {
  const [teacherCount, feedback, attendance, training] = await Promise.all([
    User.countDocuments({ role: 'teacher' }),
    Feedback.find(),
    Attendance.find(),
    Training.find(),
  ]);

  const avgRating = feedback.length
    ? Number((feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(2))
    : 0;

  const today = new Date().toISOString().slice(0, 10);
  const todayRecords = attendance.filter((a) => a.date === today);
  const presentToday = todayRecords.filter((a) => a.status === 'present' || a.status === 'late').length;

  const topTeachers = await User.find({ role: 'teacher' })
    .select('name points subject')
    .sort({ points: -1 })
    .limit(5);

  res.json({
    teacherCount,
    avgRating,
    feedbackCount: feedback.length,
    presentToday,
    attendanceMarkedToday: todayRecords.length,
    completedTrainings: training.filter((t) => t.status === 'completed').length,
    topTeachers,
  });
});

module.exports = router;
