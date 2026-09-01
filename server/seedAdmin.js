/**
 * One-time script to create the very first admin account, since the
 * /api/auth/create-admin route requires an existing admin to be logged in.
 *
 * Usage:
 *   node seedAdmin.js "Admin Name" admin@school.edu "StrongPassword123"
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function run() {
  const [, , name, email, password] = process.argv;
  if (!name || !email || !password) {
    console.log('Usage: node seedAdmin.js "Admin Name" admin@school.edu "StrongPassword123"');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  const existing = await User.findOne({ email });
  if (existing) {
    console.log('A user with this email already exists.');
    process.exit(1);
  }

  await User.create({ name, email, password, role: 'admin' });
  console.log(`Admin account created for ${email}`);
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
