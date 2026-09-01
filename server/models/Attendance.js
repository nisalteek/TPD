const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema(
  {
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // YYYY-MM-DD, one record per teacher per day
    checkIn: { type: Date },
    checkOut: { type: Date },
    status: {
      type: String,
      enum: ['present', 'late', 'absent', 'leave'],
      default: 'present',
    },
    note: { type: String, trim: true },
  },
  { timestamps: true }
);

AttendanceSchema.index({ teacher: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
