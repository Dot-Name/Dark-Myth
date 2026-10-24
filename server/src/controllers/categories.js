import Book from '../models/Book.js';
import Category from '../models/Category.js';
import { AppError, asyncHandler, ok } from '../utils/http.js';
import { resolveSlug } from '../services/bookService.js';
import { destroyAssets, uploadImage } from '../services/assets.js';

async function counts(onlyPublished = true) {
  const rows = await Book.aggregate([{ $match: onlyPublished ? { status: 'published' } : {} }, { $group: { _id: '$category', n: { $sum: 1 } } }]);
  return Object.fromEntries(rows.map((r) => [String(r._id), r.n]));
}

const shape = (c, n) => ({ id: String(c._id), name: c.name, slug: c.slug, description: c.description, image: c.image, displayOrder: c.displayOrder, isActive: c.isActive, productCount: n[String(c._id)] || 0 });

export const listPublic = asyncHandler(async (req, res) => {
  const [cats, n] = await Promise.all([Category.find({ isActive: true }).sort({ displayOrder: 1, name: 1 }), counts()]);
  ok(res, { items: cats.map((c) => shape(c, n)) });
});

export const getPublic = asyncHandler(async (req, res) => {
  const c = await Category.findOne({ slug: String(req.params.slug).toLowerCase(), isActive: true });
  if (!c) throw new AppError(404, 'Category not found', 'NOT_FOUND');
  ok(res, shape(c, await counts()));
});

export const listAdmin = asyncHandler(async (req, res) => {
  const [cats, n] = await Promise.all([Category.find().sort({ displayOrder: 1, name: 1 }), counts(true)]);
  ok(res, { items: cats.map((c) => shape(c, n)) });
});

export const create = asyncHandler(async (req, res) => {
  const { removeImage, ...data } = { description: '', displayOrder: 0, isActive: true, ...req.valid.body };
  data.slug = await resolveSlug(Category, data.slug, data.name);
  const cat = new Category(data);
  if (req.file) cat.image = await uploadImage(req.file, 'categories');
  try { await cat.save(); } catch (e) { await destroyAssets([cat.image]); throw e; }
  ok(res, shape(cat, {}), 201);
});

export const update = asyncHandler(async (req, res) => {
  const cat = await Category.findById(req.params.id);
  if (!cat) throw new AppError(404, 'Category not found', 'NOT_FOUND');
  const { removeImage, slug, ...data } = req.valid.body;
  if (slug && slug !== cat.slug) cat.slug = await resolveSlug(Category, slug, null, cat._id);
  Object.assign(cat, data);
  const old = cat.image?.publicId ? cat.image : null;
  let fresh = null;
  if (req.file) { fresh = await uploadImage(req.file, 'categories'); cat.image = fresh; }
  else if (removeImage) cat.image = undefined;
  try { await cat.save(); } catch (e) { await destroyAssets([fresh]); throw e; }
  if (old && (fresh || removeImage)) await destroyAssets([old]);
  ok(res, shape(cat, await counts(true)));
});

// Policy: a category that still has books can only be deleted by moving them to another category.
export const remove = asyncHandler(async (req, res) => {
  const cat = await Category.findById(req.params.id);
  if (!cat) throw new AppError(404, 'Category not found', 'NOT_FOUND');
  const total = await Book.countDocuments({ category: cat._id });
  if (total > 0) {
    const target = req.query.reassignTo;
    if (!target || !/^[a-f\d]{24}$/i.test(target) || target === String(cat._id)) throw new AppError(409, `This category has ${total} book(s). Choose another category to move them to before deleting.`, 'CATEGORY_NOT_EMPTY');
    if (!(await Category.exists({ _id: target }))) throw new AppError(400, 'Target category does not exist', 'BAD_CATEGORY');
    await Book.updateMany({ category: cat._id }, { $set: { category: target } });
  }
  await cat.deleteOne();
  await destroyAssets([cat.image]);
  ok(res, { deleted: true, moved: total });
});
