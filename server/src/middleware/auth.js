import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.js';
import Admin from '../models/Admin.js';
import { AppError, asyncHandler } from '../utils/http.js';
import { safeEqual } from '../utils/security.js';

export const COOKIE = 'dm_token';

export const cookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: env.isProd,
  sameSite: env.isProd && env.CROSS_SITE_COOKIES ? 'none' : 'lax',
  path: '/',
  maxAge,
});

// The CSRF token is embedded in the signed JWT and must be echoed in the X-CSRF-Token header
// on every state-changing request. The SPA keeps it in memory (never in localStorage).
export function issueSession(res, admin) {
  const csrf = crypto.randomBytes(24).toString('hex');
  const token = jwt.sign({ sub: String(admin._id), csrf }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
  const { exp } = jwt.decode(token);
  res.cookie(COOKIE, token, cookieOptions(exp * 1000 - Date.now()));
  return csrf;
}

export const clearSession = (res) => res.clearCookie(COOKIE, { ...cookieOptions(0), maxAge: undefined });

async function resolve(req) {
  const token = req.cookies?.[COOKIE];
  if (!token) return null;
  let payload;
  try {
    payload = jwt.verify(token, env.JWT_SECRET);
  } catch {
    return null;
  }
  const admin = await Admin.findById(payload.sub);
  if (!admin || !admin.isActive || admin.role !== 'admin') return null;
  return { admin, csrf: payload.csrf };
}

export const authenticate = asyncHandler(async (req, res, next) => {
  const session = await resolve(req);
  if (!session) throw new AppError(401, 'Authentication required', 'UNAUTHENTICATED');
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && !safeEqual(req.get('x-csrf-token'), session.csrf)) {
    throw new AppError(403, 'Invalid or missing CSRF token', 'CSRF');
  }
  req.admin = session.admin;
  req.csrf = session.csrf;
  next();
});

export const enforcePasswordChange = (req, res, next) =>
  req.admin.mustChangePassword
    ? next(new AppError(403, 'You must change your password before continuing', 'PASSWORD_CHANGE_REQUIRED'))
    : next();

// For public routes that may show extra data (e.g. draft preview) to a logged-in admin.
export const optionalAdmin = asyncHandler(async (req, res, next) => {
  const session = await resolve(req);
  if (session && !session.admin.mustChangePassword) req.admin = session.admin;
  next();
});
