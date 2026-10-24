import bcrypt from 'bcrypt';
import Admin from '../models/Admin.js';
import Book from '../models/Book.js';
import Category from '../models/Category.js';
import Enquiry from '../models/Enquiry.js';
import Order from '../models/Order.js';
import Setting from '../models/Setting.js';
import { env } from '../config/env.js';
import { AppError, asyncHandler, ok } from '../utils/http.js';
import { escapeRegex } from '../utils/http.js';

export const createEnquiry = asyncHandler(async (req, res) => {
  const { website, ...data } = req.valid.body;
  if (website) return ok(res, { received: true }, 201); // honeypot hit: silently drop
  await Enquiry.create(data);
  ok(res, { received: true }, 201);
});

export const listEnquiries = asyncHandler(async (req, res) => {
  const { page, limit, status, q } = req.valid.query;
  const filter = status ? { status } : {};
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ name: rx }, { email: rx }, { subject: rx }, { message: rx }];
  }
  const [items, total] = await Promise.all([
    Enquiry.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Enquiry.countDocuments(filter),
  ]);
  ok(res, { items, pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) } });
});

export const updateEnquiry = asyncHandler(async (req, res) => {
  const e = await Enquiry.findByIdAndUpdate(req.params.id, { status: req.valid.body.status }, { new: true });
  if (!e) throw new AppError(404, 'Enquiry not found', 'NOT_FOUND');
  ok(res, e);
});

export const dashboard = asyncHandler(async (req, res) => {
  const [published, drafts, categories, totalOrders, pendingOrders, processingOrders, completedOrders, cancelledOrders, enquiries, unreadEnquiries, recentOrders, recentEnquiries, recentBooks] = await Promise.all([
    Book.countDocuments({ status: 'published' }),
    Book.countDocuments({ status: 'draft' }),
    Category.countDocuments({ isActive: true }),
    Order.countDocuments(),
    Order.countDocuments({ paymentStatus: 'pending', orderStatus: 'awaiting_verification' }),
    Order.countDocuments({ paymentStatus: 'verified', orderStatus: 'awaiting_verification' }),
    Order.countDocuments({ orderStatus: 'completed' }),
    Order.countDocuments({ orderStatus: 'cancelled' }),
    Enquiry.countDocuments(),
    Enquiry.countDocuments({ status: 'new' }),
    Order.find().populate('book', 'title slug').sort({ createdAt: -1 }).limit(5),
    Enquiry.find().sort({ createdAt: -1 }).limit(5),
    Book.find().select('title slug status updatedAt').sort({ updatedAt: -1 }).limit(5),
  ]);
  const activity = [
    ...recentOrders.map((x) => ({ type: 'order', id: String(x._id), label: `Order recorded for ${x.customerName}`, createdAt: x.createdAt })),
    ...recentEnquiries.map((x) => ({ type: 'enquiry', id: String(x._id), label: `Enquiry from ${x.name}`, createdAt: x.createdAt })),
    ...recentBooks.map((x) => ({ type: 'catalogue', id: String(x._id), label: `${x.status === 'published' ? 'Published' : 'Updated'} ${x.title}`, createdAt: x.updatedAt })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);
  ok(res, {
    published, drafts, categories, totalOrders, pendingOrders, processingOrders,
    completedOrders, cancelledOrders, enquiries, unreadEnquiries, newEnquiries: unreadEnquiries,
    recentOrders, recentEnquiries, activity,
    revenue: null, // WhatsApp orders have no verified payment transaction amount.
  });
});

const site = async () => (await Setting.findOne({ key: 'site' })) || {};
const shapeSettings = (s) => ({ contactEmail: s.contactEmail || '', contactPhone: s.contactPhone || '', address: s.address || '' });

export const publicSettings = asyncHandler(async (req, res) => {
  ok(res, { ...shapeSettings(await site()), whatsappNumber: env.WHATSAPP_BUSINESS_NUMBER || null });
});

export const adminSettings = asyncHandler(async (req, res) => {
  ok(res, { ...shapeSettings(await site()), whatsappNumber: env.WHATSAPP_BUSINESS_NUMBER || null, accountEmail: req.admin.email });
});

export const updateSettings = asyncHandler(async (req, res) => {
  const { accountEmail, currentPassword, ...contact } = req.valid.body;
  if (accountEmail && accountEmail !== req.admin.email) {
    const admin = await Admin.findById(req.admin._id).select('+passwordHash');
    if (!currentPassword || !(await bcrypt.compare(currentPassword, admin.passwordHash))) throw new AppError(400, 'Enter your current password to change the account email', 'BAD_CREDENTIALS');
    if (await Admin.exists({ email: accountEmail })) throw new AppError(409, 'That email is already in use', 'DUPLICATE');
    admin.email = accountEmail;
    await admin.save();
  }
  const s = await Setting.findOneAndUpdate({ key: 'site' }, { $set: contact }, { new: true, upsert: true, setDefaultsOnInsert: true });
  ok(res, { ...shapeSettings(s), accountEmail: accountEmail || req.admin.email });
});
