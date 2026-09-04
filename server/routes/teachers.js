const express = require('express');
const User = require('../models/User');
const Feedback = require('../models/Feedback');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/teachers/directory — a public-safe browsing list for students
// (and anyone authenticated), showing only what's appropriate to share:
// name, subject, department, points, and average rating. No emails, no
// personal fields. Placed before the /:id route so "directory" is never
// swallowed as an id.
router.get('/directory', protect, async (req, res) => {
  const [teachers, feedback] = await Promise.all([
    User.find({ role: 'teacher', isActive: true }).select('name subject department points avatarUrl bio'),
    Feedback.find(),
  ]);

  const ratingByTeacher = {};
  feedback.forEach((f) => {
    const id = String(f.teacher);
    if (!ratingByTeacher[id]) ratingByTeacher[id] = { sum: 0, count: 0 };
    ratingByTeacher[id].sum += f.rating;
    ratingByTeacher[id].count += 1;
  });

  const directory = teachers.map((t) => {
    const r = ratingByTeacher[String(t._id)];
    return {
      _id: t._id,
      name: t.name,
      subject: t.subject,
      department: t.department,
      points: t.points,
      avatarUrl: t.avatarUrl,
      bio: t.bio,
      avgRating: r ? Number((r.sum / r.count).toFixed(1)) : null,
    };
  });

  res.json(directory);
});

// Student chooses (or changes) their one primary teacher
router.put('/:id/choose', protect, authorize('student'), async (req, res) => {
  const teacher = await User.findOne({ _id: req.params.id, role: 'teacher' });
  if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

  const student = await User.findByIdAndUpdate(
    req.user._id,
    { chosenTeacher: teacher._id },
    { new: true }
  ).select('-password');

  res.json(student);
});

// Admin: list all teachers
router.get('/', protect, authorize('admin'), async (req, res) => {
  const teachers = await User.find({ role: 'teacher' }).select('-password').sort({ name: 1 });
  res.json(teachers);
});

// Get a single teacher profile (self, or admin)
router.get('/:id', protect, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const teacher = await User.findById(req.params.id).select('-password');
  if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
  res.json(teacher);
});

// Update own profile (or admin updates any teacher)
router.put('/:id', protect, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const allowed = ['name', 'subject', 'department', 'phone', 'bio', 'avatarUrl', 'employeeId'];
  const updates = {};
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  // Only admins may deactivate/activate or reassign role
  if (req.user.role === 'admin') {
    if (req.body.isActive !== undefined) updates.isActive = req.body.isActive;
    if (req.body.role !== undefined) updates.role = req.body.role;
  }

  const teacher = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  }).select('-password');

  if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
  res.json(teacher);
});

// Admin: delete a teacher account
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  const teacher = await User.findByIdAndDelete(req.params.id);
  if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
  res.json({ message: 'Teacher removed' });
});

module.exports = router;
