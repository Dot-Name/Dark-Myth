import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

const make = (max, message) =>
  rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MIN * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, code: 'RATE_LIMITED', message },
  });

export const apiLimiter = make(env.RATE_LIMIT_MAX, 'Too many requests. Please try again later.');
export const loginLimiter = make(env.LOGIN_RATE_LIMIT_MAX, 'Too many login attempts. Please try again later.');
export const contactLimiter = make(env.CONTACT_RATE_LIMIT_MAX, 'Too many messages sent. Please try again later.');
export const downloadLimiter = make(30, 'Too many download requests. Please try again later.');
export const searchLimiter = make(40, 'Too many blog search or view requests. Please try again later.');
