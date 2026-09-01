const mongoose = require('mongoose');

const MilestoneSchema = new mongoose.Schema(
  {
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    date: { type: Date, default: Date.now },
    type: {
      type: String,
      enum: ['award', 'promotion', 'certification', 'anniversary', 'achievement'],
      default: 'achievement',
    },
    points: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Milestone', MilestoneSchema);
