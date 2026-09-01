const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Training = require('../models/Training');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, async (req, res) => {
  const teacherId = req.user.role === 'admin' && req.query.teacherId ? req.query.teacherId : req.user._id;
  const records = await Training.find({ teacher: teacherId }).sort({ createdAt: -1 });
  res.json(records);
});

router.post('/', protect, async (req, res) => {
  const teacherId = req.user.role === 'admin' && req.body.teacherId ? req.body.teacherId : req.user._id;
  const training = await Training.create({ ...req.body, teacher: teacherId });
  res.status(201).json(training);
});

router.put('/:id', protect, async (req, res) => {
  const training = await Training.findById(req.params.id);
  if (!training) return res.status(404).json({ message: 'Training record not found' });
  if (req.user.role !== 'admin' && String(training.teacher) !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  Object.assign(training, req.body);

  // Issuing a certificate stamps a unique verifiable ID
  if (req.body.status === 'completed' && !training.certificateIssued) {
    training.certificateIssued = true;
    training.certificateId = `TPD-${uuidv4().split('-')[0].toUpperCase()}`;
  }

  await training.save();
  res.json(training);
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  await Training.findByIdAndDelete(req.params.id);
  res.json({ message: 'Training record removed' });
});

module.exports = router;
