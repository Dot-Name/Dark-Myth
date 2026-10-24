import 'dotenv/config';
import { z } from 'zod';

const bool = z.enum(['true', 'false']).default('false').transform((v) => v === 'true');
const num = (d) => z.coerce.number().positive().default(d);

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: num(5000),
  MONGODB_URI: z.string().min(1),
  CLIENT_URL: z.string().min(1),
  CROSS_SITE_COOKIES: bool,
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('2h'),
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  WHATSAPP_BUSINESS_NUMBER: z.string().regex(/^\d{8,15}$/, 'digits only, with country code').optional(),
  MAX_IMAGE_MB: num(5),
  MAX_PDF_MB: num(50),
  DOWNLOAD_URL_TTL_SECONDS: num(120),
  RATE_LIMIT_WINDOW_MIN: num(15),
  RATE_LIMIT_MAX: num(300),
  LOGIN_RATE_LIMIT_MAX: num(10),
  CONTACT_RATE_LIMIT_MAX: num(5),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment configuration:');
  for (const i of parsed.error.issues) console.error(` - ${i.path.join('.')}: ${i.message}`);
  process.exit(1);
}

const e = parsed.data;
const isProd = e.NODE_ENV === 'production';
if (isProd) {
  const missing = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET', 'WHATSAPP_BUSINESS_NUMBER'].filter((k) => !e[k]);
  if (missing.length) {
    console.error(`Missing required production configuration: ${missing.join(', ')}`);
    process.exit(1);
  }
}

export const env = {
  ...e,
  isProd,
  clientOrigins: e.CLIENT_URL.split(',').map((s) => s.trim().replace(/\/$/, '')).filter(Boolean),
  cloudinaryConfigured: Boolean(e.CLOUDINARY_CLOUD_NAME && e.CLOUDINARY_API_KEY && e.CLOUDINARY_API_SECRET),
};
