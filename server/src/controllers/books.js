import Book from '../models/Book.js';
import Category from '../models/Category.js';
import Order from '../models/Order.js';
import { AppError, asyncHandler, escapeRegex, ok } from '../utils/http.js';
import { sha256 } from '../utils/security.js';
import { assertBookRules, assertCategory, resolveSlug, serializeBook } from '../services/bookService.js';
import { destroyAssets, signedPdfUrl, uploadImage, uploadPdf } from '../services/assets.js';

const SORTS = {
  newest: { publishedAt: -1, _id: -1 },
  title: { title: 1 },
  price_asc: { price: 1, title: 1 },
  price_desc: { price: -1, title: 1 },
};

async function buildFilter({ q, category, type, free, status }, { publicOnly }) {
  const filter = {};
  if (publicOnly) {
    filter.status = 'published';
    const active = await Category.find({ isActive: true }).select('_id slug name');
    let ids = active.map((c) => c._id);
    if (category) ids = active.filter((c) => c.slug === category).map((c) => c._id);
    filter.category = { $in: ids };
  } else {
    if (status) filter.status = status;
    if (category) filter.category = category;
  }
  if (type) filter.productType = type;
  if (free) filter.isFree = free === 'true';
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    const cats = await Category.find({ name: rx }).select('_id');
    filter.$or = [{ title: rx }, { shortDescription: rx }, { description: rx }, { tags: rx }, { category: { $in: cats.map((c) => c._id) } }];
  }
  return filter;
}

async function paged(filter, { sort, page, limit }, admin) {
  const [items, total] = await Promise.all([
    Book.find(filter).populate('category', 'name slug').sort(SORTS[sort] || SORTS.newest).collation({ locale: 'en', strength: 2 }).skip((page - 1) * limit).limit(limit),
    Book.countDocuments(filter),
  ]);
  return { items: items.map((b) => serializeBook(b, { admin })), pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) } };
}

/* ---------- public ---------- */
export const listPublic = asyncHandler(async (req, res) => {
  const filter = await buildFilter(req.valid.query, { publicOnly: true });
  ok(res, await paged(filter, req.valid.query, false));
});

export const featured = asyncHandler(async (req, res) => {
  const filter = await buildFilter({}, { publicOnly: true });
  filter.isFeatured = true;
  const items = await Book.find(filter).populate('category', 'name slug').sort(SORTS.newest).limit(8);
  ok(res, { items: items.map((b) => serializeBook(b)) });
});

export const getBySlug = asyncHandler(async (req, res) => {
  const book = await Book.findOne({ slug: String(req.params.slug).toLowerCase() }).populate('category', 'name slug isActive');
  if (!book || (!req.admin && (book.status !== 'published' || !book.category?.isActive))) throw new AppError(404, 'Book not found', 'NOT_FOUND');
  const related = await Book.find({ status: 'published', category: book.category._id, _id: { $ne: book._id } }).populate('category', 'name slug').sort(SORTS.newest).limit(4);
  ok(res, { book: serializeBook(book), related: related.map((b) => serializeBook(b)) });
});

export const download = asyncHandler(async (req, res) => {
  const book = await Book.findOne({ _id: req.params.id, status: 'published' }).select('+pdf');
  if (!book || !book.hasPdf || !book.pdf?.publicId) throw new AppError(404, 'No downloadable file is available for this book', 'NOT_FOUND');

  if (!book.isFree) {
    const code = req.get('x-access-code');
    if (!code) throw new AppError(403, 'This book needs a verified purchase. Contact us on WhatsApp to buy it.', 'ACCESS_REQUIRED');
    const order = await Order.findOne({ book: book._id, accessTokenHash: sha256(code.trim()), accessStatus: 'granted', paymentStatus: 'verified' }).select('+accessTokenHash');
    if (!order || (order.accessExpiresAt && order.accessExpiresAt < new Date())) throw new AppError(403, 'Access code is invalid or has expired', 'ACCESS_DENIED');
    if (order.downloadCount >= order.maxDownloads) throw new AppError(403, 'Download limit reached for this access code', 'ACCESS_DENIED');
    order.downloadCount += 1;
    await order.save();
  }
  res.set('Cache-Control', 'no-store');
  ok(res, { url: signedPdfUrl(book.pdf.publicId), expiresInSeconds: Number(process.env.DOWNLOAD_URL_TTL_SECONDS) || 120 });
});

/* ---------- admin ---------- */
export const listAdmin = asyncHandler(async (req, res) => {
  const filter = await buildFilter(req.valid.query, { publicOnly: false });
  ok(res, await paged(filter, req.valid.query, true));
});

export const getAdmin = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id).select('+pdf').populate('category', 'name slug');
  if (!book) throw new AppError(404, 'Book not found', 'NOT_FOUND');
  const out = serializeBook(book, { admin: true });
  out.category = String(book.category._id);
  out.pdf = book.pdf ? { bytes: book.pdf.bytes, originalName: book.pdf.originalName } : null;
  ok(res, out);
});

const DEFAULTS = { shortDescription: '', description: '', tags: [], productType: 'pdf', price: 0, isFree: false, language: 'English', fileFormat: 'PDF', isFeatured: false, status: 'draft', seoTitle: '', seoDescription: '' };

export const create = asyncHandler(async (req, res) => {
  const { removeGalleryIds, removePdf, ...data } = { ...DEFAULTS, ...req.valid.body };
  const files = req.files || {};
  await assertCategory(data.category);
  data.slug = await resolveSlug(Book, data.slug, data.title);
  if (data.isFree) data.price = 0;

  const book = new Book(data);
  const uploaded = [];
  try {
    if (files.cover?.[0]) { book.cover = await uploadImage(files.cover[0], 'covers'); uploaded.push(book.cover); }
    for (const f of files.gallery || []) { const a = await uploadImage(f, 'gallery'); book.gallery.push(a); uploaded.push(a); }
    if (files.pdf?.[0]) { const asset = await uploadPdf(files.pdf[0]); book.pdf = asset; book.hasPdf = true; uploaded.push({ ...asset, raw: true }); }
    if (book.status === 'published' && !book.publishedAt) book.publishedAt = new Date();
    assertBookRules(book);
    await book.save();
  } catch (e) {
    await destroyAssets(uploaded); // never leave orphaned assets behind a failed save
    throw e;
  }
  ok(res, serializeBook(book, { admin: true }), 201);
});

export const update = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id).select('+pdf');
  if (!book) throw new AppError(404, 'Book not found', 'NOT_FOUND');
  const { removeGalleryIds = [], removePdf, slug, ...data } = req.valid.body;
  const files = req.files || {};

  if (data.category) await assertCategory(data.category);
  if (slug && slug !== book.slug) book.slug = await resolveSlug(Book, slug, null, book._id);
  Object.assign(book, data);
  if (book.isFree) book.price = 0;

  const uploaded = [];
  const toDelete = [];
  try {
    if (files.cover?.[0]) { if (book.cover?.publicId) toDelete.push(book.cover); book.cover = await uploadImage(files.cover[0], 'covers'); uploaded.push(book.cover); }
    if (removeGalleryIds.length) {
      toDelete.push(...book.gallery.filter((g) => removeGalleryIds.includes(g.publicId)));
      book.gallery = book.gallery.filter((g) => !removeGalleryIds.includes(g.publicId));
    }
    if ((files.gallery || []).length + book.gallery.length > 8) throw new AppError(400, 'A book can have at most 8 gallery images', 'VALIDATION_ERROR');
    for (const f of files.gallery || []) { const a = await uploadImage(f, 'gallery'); book.gallery.push(a); uploaded.push(a); }
    if (files.pdf?.[0]) { if (book.pdf?.publicId) toDelete.push({ ...book.pdf.toObject(), raw: true }); const asset = await uploadPdf(files.pdf[0]); book.pdf = asset; book.hasPdf = true; uploaded.push({ ...asset, raw: true }); }
    else if (removePdf && book.pdf?.publicId) { toDelete.push({ ...book.pdf.toObject(), raw: true }); book.pdf = undefined; book.hasPdf = false; }
    if (book.status === 'published' && !book.publishedAt) book.publishedAt = new Date();
    assertBookRules(book);
    await book.save();
  } catch (e) {
    await destroyAssets(uploaded);
    throw e;
  }
  await destroyAssets(toDelete);
  ok(res, serializeBook(book, { admin: true }));
});

export const remove = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id).select('+pdf');
  if (!book) throw new AppError(404, 'Book not found', 'NOT_FOUND');
  const open = await Order.countDocuments({ book: book._id, accessStatus: 'granted' });
  if (open && req.query.force !== 'true') throw new AppError(409, `${open} order(s) have active download access for this book. Revoke them first or confirm deletion.`, 'HAS_ACTIVE_ACCESS');
  await book.deleteOne();
  await destroyAssets([book.cover, ...book.gallery, book.pdf?.publicId ? { ...book.pdf.toObject(), raw: true } : null]);
  ok(res, { deleted: true });
});
