import slugify from 'slugify';
import Book from '../models/Book.js';
import Category from '../models/Category.js';
import { AppError } from '../utils/http.js';

export const makeSlug = (s) => slugify(String(s), { lower: true, strict: true, trim: true });

export async function uniqueSlug(Model, base, excludeId) {
  const root = makeSlug(base) || 'item';
  let candidate = root;
  for (let i = 2; i < 200; i += 1) {
    const clash = await Model.exists({ slug: candidate, ...(excludeId ? { _id: { $ne: excludeId } } : {}) });
    if (!clash) return candidate;
    candidate = `${root}-${i}`;
  }
  throw new AppError(409, 'Could not generate a unique slug', 'DUPLICATE');
}

// Explicit slugs must be free; otherwise we tell the admin which one would work.
export async function resolveSlug(Model, explicit, title, excludeId) {
  if (!explicit) return uniqueSlug(Model, title, excludeId);
  const clash = await Model.exists({ slug: explicit, ...(excludeId ? { _id: { $ne: excludeId } } : {}) });
  if (clash) {
    const suggestion = await uniqueSlug(Model, explicit, excludeId);
    throw new AppError(409, `Slug "${explicit}" is already in use. Try "${suggestion}".`, 'DUPLICATE_SLUG');
  }
  return explicit;
}

export async function assertCategory(id) {
  const cat = await Category.findById(id);
  if (!cat) throw new AppError(400, 'Selected category does not exist', 'BAD_CATEGORY');
  return cat;
}

export function assertBookRules(b) {
  if (b.isFree && b.price > 0) throw new AppError(400, 'A free book cannot have a positive price', 'VALIDATION_ERROR');
  if (b.status === 'published') {
    const missing = [];
    if (!b.cover?.url) missing.push('a cover image');
    if (!b.shortDescription) missing.push('a short description');
    if (!b.description) missing.push('a full description');
    if (!b.isFree && !(b.price > 0)) missing.push('a price above zero (or mark it free)');
    if (missing.length) throw new AppError(400, `A published book needs ${missing.join(', ')}`, 'VALIDATION_ERROR');
  }
}

export function serializeBook(b, { admin = false } = {}) {
  const o = typeof b.toObject === 'function' ? b.toObject() : b;
  const cat = o.category && o.category.name ? { id: String(o.category._id), name: o.category.name, slug: o.category.slug } : o.category;
  const out = {
    id: String(o._id),
    title: o.title,
    slug: o.slug,
    shortDescription: o.shortDescription,
    description: o.description,
    category: cat,
    tags: o.tags,
    productType: o.productType,
    price: o.price,
    isFree: o.isFree,
    language: o.language,
    pageCount: o.pageCount,
    fileFormat: o.fileFormat,
    cover: o.cover,
    gallery: o.gallery,
    isFeatured: o.isFeatured,
    status: o.status,
    publishedAt: o.publishedAt,
    seoTitle: o.seoTitle,
    seoDescription: o.seoDescription,
    hasPdf: o.hasPdf,
    availability: o.hasPdf || !o.isFree ? 'Available' : 'Coming soon',
  };
  if (admin) {
    out.createdAt = o.createdAt;
    out.updatedAt = o.updatedAt;
  }
  return out; // note: the private `pdf` asset is never included
}

export const bookModel = Book;
