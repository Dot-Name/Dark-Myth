import { z } from 'zod';
import { PRODUCT_TYPES } from '../models/Book.js';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'must be a valid id');
const emptyToUndef = (v) => (v === '' || v === null ? undefined : v);
const bool = z.preprocess((v) => v === true || v === 'true' || v === '1' || v === 'on', z.boolean());
const slug = z.string().trim().toLowerCase().max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'may only contain lowercase letters, numbers and hyphens');

export const idParam = z.object({ id: objectId });

export const loginSchema = z.object({ email: z.string().trim().toLowerCase().email().max(160), password: z.string().min(1).max(200) });
export const changePasswordSchema = z.object({ currentPassword: z.string().min(1).max(200), newPassword: z.string().min(12).max(200) });

export const bookFields = z.object({
  title: z.string().trim().min(2).max(160),
  slug: z.preprocess(emptyToUndef, slug.optional()),
  shortDescription: z.string().trim().max(300),
  description: z.string().trim().max(10000),
  category: objectId,
  tags: z.preprocess(
    (v) => (typeof v === 'string' ? v.split(',').map((s) => s.trim()).filter(Boolean) : v),
    z.array(z.string().max(40)).max(20)
  ),
  productType: z.enum(PRODUCT_TYPES),
  price: z.coerce.number().min(0).max(1000000),
  isFree: bool,
  language: z.string().trim().max(40),
  pageCount: z.preprocess(emptyToUndef, z.coerce.number().int().min(1).max(5000).optional()),
  fileFormat: z.string().trim().max(40),
  publishedAt: z.preprocess(emptyToUndef, z.coerce.date().optional()),
  isFeatured: bool,
  status: z.enum(['draft', 'published']),
  seoTitle: z.string().trim().max(70),
  seoDescription: z.string().trim().max(170),
  removeGalleryIds: z.preprocess((v) => (typeof v === 'string' ? JSON.parse(v || '[]') : v), z.array(z.string().max(300)).max(20)),
  removePdf: bool,
});

export const createBookSchema = bookFields
  .partial()
  .required({ title: true, category: true })
  .transform((d) => d);
export const updateBookSchema = bookFields.partial();

export const bookQuery = z.object({
  q: z.string().trim().max(100).optional(),
  category: z.string().trim().max(100).optional(),
  type: z.enum(PRODUCT_TYPES).optional(),
  sort: z.enum(['newest', 'title', 'price_asc', 'price_desc']).default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(12),
  status: z.enum(['draft', 'published']).optional(),
  free: z.enum(['true', 'false']).optional(),
});

export const categoryFields = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.preprocess(emptyToUndef, slug.optional()),
  description: z.string().trim().max(500),
  displayOrder: z.coerce.number().int().min(0).max(9999),
  isActive: bool,
  removeImage: bool,
});

export const enquirySchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().max(160),
  subject: z.string().trim().min(2).max(160),
  message: z.string().trim().min(10).max(4000),
  website: z.string().max(0).optional(), // honeypot: real users leave it empty
});

export const orderCreate = z.object({
  book: objectId,
  customerName: z.string().trim().min(2).max(120),
  customerContact: z.string().trim().min(3).max(60),
  customerEmail: z.preprocess(emptyToUndef, z.string().trim().toLowerCase().email().max(160).optional()),
  amount: z.coerce.number().min(0).max(1000000),
  verificationNotes: z.string().trim().max(1000).optional(),
});

export const orderUpdate = z.object({
  paymentStatus: z.enum(['pending', 'verified', 'rejected', 'refunded']).optional(),
  orderStatus: z.enum(['awaiting_verification', 'completed', 'cancelled']).optional(),
  verificationNotes: z.string().trim().max(1000).optional(),
  access: z.enum(['grant', 'revoke']).optional(),
  accessDays: z.coerce.number().int().min(1).max(365).optional(),
  maxDownloads: z.coerce.number().int().min(1).max(50).optional(),
});

export const enquiryUpdate = z.object({ status: z.enum(['new', 'read', 'resolved']) });

export const settingsUpdate = z.object({
  contactEmail: z.string().trim().max(160).optional(),
  contactPhone: z.string().trim().max(40).optional(),
  address: z.string().trim().max(300).optional(),
  accountEmail: z.string().trim().toLowerCase().email().max(160).optional(),
  currentPassword: z.string().max(200).optional(),
});

export const listQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().max(100).optional(),
  status: z.enum(['pending', 'verified', 'rejected', 'refunded', 'awaiting_verification', 'completed', 'cancelled', 'new', 'read', 'resolved']).optional(),
});
