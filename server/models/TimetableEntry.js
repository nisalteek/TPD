const mongoose = require('mongoose');

const TimetableEntrySchema = new mongoose.Schema(
  {
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      required: true,
    },
    period: { type: Number, required: true, min: 1, max: 10 }, // simple period number, not clock time
    subject: { type: String, required: true, trim: true },
    className: { type: String, trim: true }, // e.g. "Grade 9-A"
    room: { type: String, trim: true },
  },
  { timestamps: true }
);

// One subject slot per teacher per day+period — prevents accidental duplicates,
// but intentionally does NOT check against other teachers' schedules (no clash detection).
TimetableEntrySchema.index({ teacher: 1, day: 1, period: 1 }, { unique: true });

module.exports = mongoose.model('TimetableEntry', TimetableEntrySchema);
