const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema(
  {
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, maxlength: 600 },
    category: {
      type: String,
      enum: ['teaching-craft', 'certification', 'leadership', 'student-outcomes', 'other'],
      default: 'other',
    },
    targetDate: { type: Date },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    status: {
      type: String,
      enum: ['in-progress', 'achieved', 'on-hold'],
      default: 'in-progress',
    },
    adminNote: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Goal', GoalSchema);
