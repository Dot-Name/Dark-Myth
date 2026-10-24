import Book from '../models/Book.js';
import Order from '../models/Order.js';
import { AppError, asyncHandler, ok } from '../utils/http.js';
import { newAccessCode, sha256 } from '../utils/security.js';
import { escapeRegex } from '../utils/http.js';

export const list = asyncHandler(async (req, res) => {
  const { page, limit, status, q } = req.valid.query;
  const filter = !status ? {} : ['awaiting_verification', 'completed', 'cancelled'].includes(status)
    ? { orderStatus: status }
    : { paymentStatus: status };
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ customerName: rx }, { customerContact: rx }, { customerEmail: rx }];
    if (/^[a-f\d]{24}$/i.test(q)) filter.$or.push({ _id: q });
  }
  const [items, total] = await Promise.all([
    Order.find(filter).populate('book', 'title slug').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Order.countDocuments(filter),
  ]);
  ok(res, { items, pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) } });
});

export const create = asyncHandler(async (req, res) => {
  const d = req.valid.body;
  const book = await Book.findById(d.book);
  if (!book) throw new AppError(400, 'Book does not exist', 'BAD_BOOK');
  if (book.status !== 'published') throw new AppError(400, 'Orders can only be created for published books', 'BAD_BOOK');
  // This is a manually recorded WhatsApp lead; the submitted amount is never trusted.
  const order = await Order.create({ ...d, amount: book.isFree ? 0 : book.price });
  ok(res, order, 201);
});

// Granting access is only possible after payment has been manually verified.
// The plain access code is returned exactly once; only its hash is stored.
export const update = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError(404, 'Order not found', 'NOT_FOUND');
  const { access, accessDays, maxDownloads, ...rest } = req.valid.body;
  if (rest.paymentStatus === 'verified' && order.paymentStatus !== 'verified' && !rest.verificationNotes?.trim()) {
    throw new AppError(400, 'Add verification notes before marking a payment as verified', 'VERIFICATION_REQUIRED');
  }
  if (rest.orderStatus === 'completed' && order.paymentStatus !== 'verified' && rest.paymentStatus !== 'verified') {
    throw new AppError(400, 'Verify payment before completing an order', 'PAYMENT_NOT_VERIFIED');
  }
  Object.assign(order, rest);
  if (maxDownloads) order.maxDownloads = maxDownloads;

  let accessCode;
  if (access === 'grant') {
    if (order.paymentStatus !== 'verified') throw new AppError(400, 'Mark the payment as verified before granting access', 'PAYMENT_NOT_VERIFIED');
    accessCode = newAccessCode();
    order.accessTokenHash = sha256(accessCode);
    order.accessStatus = 'granted';
    order.accessExpiresAt = accessDays ? new Date(Date.now() + accessDays * 86400000) : undefined;
    order.downloadCount = 0;
    order.orderStatus = 'completed';
  }
  if (access === 'revoke' || ['rejected', 'refunded'].includes(order.paymentStatus) || order.orderStatus === 'cancelled') {
    if (order.accessStatus === 'granted') order.accessStatus = 'revoked';
    order.accessTokenHash = undefined;
  }
  await order.save();
  ok(res, { order, ...(accessCode ? { accessCode } : {}) });
});
