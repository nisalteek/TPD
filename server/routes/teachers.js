const express = require('express');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

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
