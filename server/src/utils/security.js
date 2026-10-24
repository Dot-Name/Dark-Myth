import crypto from 'crypto';

export const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

export const safeEqual = (a = '', b = '') => {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

export const newAccessCode = () => crypto.randomBytes(18).toString('base64url');

// 12+ chars with upper, lower, digit and symbol
export const isStrongPassword = (p = '') =>
  p.length >= 12 && /[a-z]/.test(p) && /[A-Z]/.test(p) && /\d/.test(p) && /[^A-Za-z0-9]/.test(p);
