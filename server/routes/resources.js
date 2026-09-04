const express = require('express');
const multer = require('multer');
const Resource = require('../models/Resource');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Files are held in memory only long enough to save the buffer into MongoDB —
// nothing touches disk, which matters on hosts with ephemeral filesystems.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are accepted'));
    }
    cb(null, true);
  },
});

// List resources (metadata only — no file bytes in the list response)
router.get('/', protect, async (req, res) => {
  const resources = await Resource.find()
    .select('-fileData')
    .populate('uploadedBy', 'name')
    .sort({ createdAt: -1 });
  res.json(resources);
});

// Admin uploads a real PDF
router.post('/', protect, authorize('admin'), upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'A PDF file is required' });

  const { title, description, category } = req.body;
  const resource = await Resource.create({
    title,
    description,
    category,
    uploadedBy: req.user._id,
    fileName: req.file.originalname,
    fileData: req.file.buffer,
    contentType: req.file.mimetype,
    size: req.file.size,
  });

  const { fileData, ...safeResource } = resource.toObject();
  res.status(201).json(safeResource);
});

// Download the actual PDF
router.get('/:id/download', protect, async (req, res) => {
  const resource = await Resource.findById(req.params.id);
  if (!resource) return res.status(404).json({ message: 'Resource not found' });

  res.setHeader('Content-Type', resource.contentType || 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${resource.fileName}"`);
  res.send(resource.fileData);
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  await Resource.findByIdAndDelete(req.params.id);
  res.json({ message: 'Resource removed' });
});

module.exports = router;
