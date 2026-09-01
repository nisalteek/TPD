const mongoose = require('mongoose');

const LessonPlanSchema = new mongoose.Schema(
  {
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    subject: { type: String, trim: true },
    gradeLevel: { type: String, trim: true },
    date: { type: Date, required: true },
    objectives: { type: String, trim: true },
    materials: { type: String, trim: true },
    procedure: { type: String, trim: true },
    assessment: { type: String, trim: true },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'approved', 'needs-revision'],
      default: 'draft',
    },
    adminNote: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LessonPlan', LessonPlanSchema);
