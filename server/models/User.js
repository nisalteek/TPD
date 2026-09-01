const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: true },
    role: { type: String, enum: ['admin', 'teacher'], default: 'teacher' },
    isActive: { type: Boolean, default: true },

    // Teacher profile fields (unused for admin accounts)
    employeeId: { type: String, trim: true },
    subject: { type: String, trim: true },
    department: { type: String, trim: true },
    phone: { type: String, trim: true },
    dateJoined: { type: Date, default: Date.now },
    bio: { type: String, trim: true, maxlength: 800 },
    avatarUrl: { type: String, default: '' },
    points: { type: Number, default: 0 }, // gamification score
    badges: [{ type: String }],
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
