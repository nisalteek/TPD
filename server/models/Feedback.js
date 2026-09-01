const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema(
  {
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    source: {
      type: String,
      enum: ['student', 'peer', 'admin', 'self'],
      default: 'student',
    },
    submittedBy: { type: String, trim: true, default: 'Anonymous' },
    rating: { type: Number, min: 1, max: 5, required: true },
    category: {
      type: String,
      enum: ['teaching-quality', 'communication', 'punctuality', 'classroom-management', 'general'],
      default: 'general',
    },
    comment: { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Feedback', FeedbackSchema);
