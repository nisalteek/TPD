const express = require('express');
const LessonPlan = require('../models/LessonPlan');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, async (req, res) => {
  const teacherId = req.user.role === 'admin' && req.query.teacherId ? req.query.teacherId : req.user._id;
  const filter = req.user.role === 'admin' && !req.query.teacherId ? {} : { teacher: teacherId };
  const plans = await LessonPlan.find(filter).populate('teacher', 'name subject').sort({ date: -1 });
  res.json(plans);
});

router.post('/', protect, authorize('teacher'), async (req, res) => {
  const plan = await LessonPlan.create({ ...req.body, teacher: req.user._id });
  res.status(201).json(plan);
});

router.put('/:id', protect, async (req, res) => {
  const plan = await LessonPlan.findById(req.params.id);
  if (!plan) return res.status(404).json({ message: 'Lesson plan not found' });
  if (req.user.role !== 'admin' && String(plan.teacher) !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  Object.assign(plan, req.body);
  await plan.save();
  res.json(plan);
});

router.delete('/:id', protect, async (req, res) => {
  const plan = await LessonPlan.findById(req.params.id);
  if (!plan) return res.status(404).json({ message: 'Lesson plan not found' });
  if (req.user.role !== 'admin' && String(plan.teacher) !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  await plan.deleteOne();
  res.json({ message: 'Lesson plan removed' });
});

module.exports = router;
