const mongoose = require('mongoose');

const TrainingSchema = new mongoose.Schema(
  {
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    provider: { type: String, trim: true },
    category: { type: String, trim: true },
    startDate: { type: Date },
    completionDate: { type: Date },
    status: {
      type: String,
      enum: ['planned', 'in-progress', 'completed'],
      default: 'planned',
    },
    hours: { type: Number, default: 0 },
    score: { type: Number, min: 0, max: 100 },
    certificateIssued: { type: Boolean, default: false },
    certificateId: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Training', TrainingSchema);
