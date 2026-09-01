const express = require('express');
const Feedback = require('../models/Feedback');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Anyone authenticated can submit feedback about a teacher
router.post('/', protect, async (req, res) => {
  const { teacherId, rating, category, comment, source, submittedBy } = req.body;
  const feedback = await Feedback.create({
    teacher: teacherId,
    rating,
    category,
    comment,
    source: source || (req.user.role === 'admin' ? 'admin' : 'peer'),
    submittedBy: submittedBy || req.user.name,
  });
  res.status(201).json(feedback);
});

router.get('/', protect, async (req, res) => {
  const teacherId = req.user.role === 'admin' && req.query.teacherId ? req.query.teacherId : req.user._id;
  const feedback = await Feedback.find({ teacher: teacherId }).sort({ createdAt: -1 });
  res.json(feedback);
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  await Feedback.findByIdAndDelete(req.params.id);
  res.json({ message: 'Feedback removed' });
});

module.exports = router;
