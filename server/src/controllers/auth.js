import bcrypt from 'bcrypt';
import Admin from '../models/Admin.js';
import { AppError, asyncHandler, ok } from '../utils/http.js';
import { isStrongPassword } from '../utils/security.js';
import { clearSession, issueSession } from '../middleware/auth.js';

const GENERIC = 'Invalid email or password';
// Precomputed hash so unknown emails cost the same time as wrong passwords.
const DUMMY = bcrypt.hashSync('not-a-real-password', 12);

const me = (a) => ({ id: String(a._id), email: a.email, role: a.role, mustChangePassword: a.mustChangePassword });

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.valid.body;
  const admin = await Admin.findOne({ email }).select('+passwordHash');
  const good = await bcrypt.compare(password, admin?.passwordHash || DUMMY);
  if (!admin || !good || !admin.isActive) throw new AppError(401, GENERIC, 'BAD_CREDENTIALS');
  const csrfToken = issueSession(res, admin);
  ok(res, { admin: me(admin), csrfToken });
});

export const logout = (req, res) => {
  clearSession(res);
  ok(res, { loggedOut: true });
};

export const current = asyncHandler(async (req, res) => ok(res, { admin: me(req.admin), csrfToken: req.csrf }));

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.valid.body;
  const admin = await Admin.findById(req.admin._id).select('+passwordHash');
  if (!(await bcrypt.compare(currentPassword, admin.passwordHash))) throw new AppError(400, 'Current password is incorrect', 'BAD_CREDENTIALS');
  if (!isStrongPassword(newPassword)) throw new AppError(400, 'New password needs 12+ characters with upper and lower case letters, a number and a symbol', 'WEAK_PASSWORD');
  if (await bcrypt.compare(newPassword, admin.passwordHash)) throw new AppError(400, 'New password must be different from the current one', 'WEAK_PASSWORD');
  admin.passwordHash = await bcrypt.hash(newPassword, 12);
  admin.mustChangePassword = false;
  await admin.save();
  const csrfToken = issueSession(res, admin); // rotate the session after a credential change
  ok(res, { admin: me(admin), csrfToken });
});
