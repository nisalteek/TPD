const express = require('express');
const Training = require('../models/Training');
const { protect } = require('../middleware/auth');
const { streamCertificate } = require('../utils/certificateGenerator');

const router = express.Router();

// GET /api/certificates/:trainingId  -> downloads a real, generated PDF
router.get('/:trainingId', protect, async (req, res) => {
  const training = await Training.findById(req.params.trainingId).populate('teacher', 'name');
  if (!training) return res.status(404).json({ message: 'Training record not found' });

  if (req.user.role !== 'admin' && String(training.teacher._id) !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  if (!training.certificateIssued) {
    return res.status(400).json({ message: 'This training has not been marked completed yet' });
  }

  streamCertificate(res, {
    teacherName: training.teacher.name,
    courseTitle: training.title,
    certificateId: training.certificateId,
    completionDate: training.completionDate,
    hours: training.hours,
  });
});

module.exports = router;
