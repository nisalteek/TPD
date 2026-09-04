const mongoose = require('mongoose');

const WellbeingCheckinSchema = new mongoose.Schema(
  {
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    week: { type: String, required: true }, // ISO week string, e.g. "2026-W36"
    score: { type: Number, min: 1, max: 5, required: true },
    note: { type: String, trim: true, maxlength: 300 },
  },
  { timestamps: true }
);

// One check-in per teacher per week — resubmitting updates it
WellbeingCheckinSchema.index({ teacher: 1, week: 1 }, { unique: true });

module.exports = mongoose.model('WellbeingCheckin', WellbeingCheckinSchema);
