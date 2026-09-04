const express = require('express');
const Training = require('../models/Training');
const { protect } = require('../middleware/auth');
const { streamCertificate } = require('../utils/certificateGenerator');

const router = express.Router();

// GET /api/certificates/verify/:certificateId — public, no login required.
// This is what the QR code on a certificate points to, so anyone (an
// employer, another school) can confirm a certificate is genuine.
// Placed before the /:trainingId route so "verify" isn't swallowed as an id.
router.get('/verify/:certificateId', async (req, res) => {
  const training = await Training.findOne({ certificateId: req.params.certificateId }).populate('teacher', 'name');

  if (!training || !training.certificateIssued) {
    return res.json({ valid: false });
  }

  res.json({
    valid: true,
    teacherName: training.teacher.name,
    courseTitle: training.title,
    completionDate: training.completionDate,
    hours: training.hours,
    certificateId: training.certificateId,
  });
});

// GET /api/certificates/:trainingId -> downloads a real, generated PDF
router.get('/:trainingId', protect, async (req, res) => {
  const training = await Training.findById(req.params.trainingId).populate('teacher', 'name');
  if (!training) return res.status(404).json({ message: 'Training record not found' });

  if (req.user.role !== 'admin' && String(training.teacher._id) !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  if (!training.certificateIssued) {
    return res.status(400).json({ message: 'This training has not been marked completed yet' });
  }

  await streamCertificate(res, {
    teacherName: training.teacher.name,
    courseTitle: training.title,
    certificateId: training.certificateId,
    completionDate: training.completionDate,
    hours: training.hours,
  });
});

module.exports = router;
