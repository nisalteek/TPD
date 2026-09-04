const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, maxlength: 500 },
    category: {
      type: String,
      enum: ['policy', 'template', 'handout', 'training-material', 'other'],
      default: 'other',
    },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fileName: { type: String, required: true },
    fileData: { type: Buffer, required: true },
    contentType: { type: String, default: 'application/pdf' },
    size: { type: Number }, // bytes, stored for display without re-reading the buffer
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resource', ResourceSchema);
