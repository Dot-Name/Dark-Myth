import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { connectDB } from '../config/db.js';
import Admin from '../models/Admin.js';
import { isStrongPassword } from '../utils/security.js';

// Idempotent: creates the initial admin only if no admin with that email exists. Never overwrites a password.
async function run() {
  const { ADMIN_EMAIL: email, ADMIN_PASSWORD: password } = env;
  if (!email || !password) throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set to seed the initial admin');
  if (password.length < 8) throw new Error('ADMIN_PASSWORD is too short');
  if (env.isProd && !isStrongPassword(password)) throw new Error('Refusing to seed: in production ADMIN_PASSWORD needs 12+ characters with upper, lower, number and symbol');

  await connectDB();
  if (await Admin.exists({ email: email.toLowerCase() })) {
    console.log('Admin already exists. Nothing changed.');
  } else {
    await Admin.create({ email, passwordHash: await bcrypt.hash(password, 12), role: 'admin', mustChangePassword: true });
    console.log(`Initial admin created for ${email}. The password must be changed at first login.`);
  }
}

run()
  .catch((e) => { console.error(e.message); process.exitCode = 1; })
  .finally(() => mongoose.disconnect());
