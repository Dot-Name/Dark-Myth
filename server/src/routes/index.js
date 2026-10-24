import { Router } from 'express';
import { authenticate, enforcePasswordChange, optionalAdmin } from '../middleware/auth.js';
import { contactLimiter, downloadLimiter, loginLimiter } from '../middleware/limiters.js';
import { bookUpload, categoryUpload } from '../middleware/upload.js';
import { validate } from '../utils/http.js';
import * as S from '../validators/schemas.js';
import * as auth from '../controllers/auth.js';
import * as books from '../controllers/books.js';
import * as cats from '../controllers/categories.js';
import * as orders from '../controllers/orders.js';
import * as misc from '../controllers/misc.js';

const router = Router();
const id = validate(S.idParam, 'params');

/* ---------- public ---------- */
router.get('/health', (req, res) => res.json({ success: true, data: { status: 'ok' } }));
router.get('/books', validate(S.bookQuery, 'query'), books.listPublic);
router.get('/books/featured', books.featured);
router.get('/books/:id/download', downloadLimiter, id, books.download);
router.get('/books/:slug', optionalAdmin, books.getBySlug);
router.get('/categories', cats.listPublic);
router.get('/categories/:slug', cats.getPublic);
router.get('/settings', misc.publicSettings);
router.post('/enquiries', contactLimiter, validate(S.enquirySchema), misc.createEnquiry);

/* ---------- admin auth (usable while a password change is pending) ---------- */
router.post('/admin/auth/login', loginLimiter, validate(S.loginSchema), auth.login);
router.post('/admin/auth/logout', auth.logout);
router.get('/admin/auth/me', authenticate, auth.current);
router.post('/admin/auth/change-password', authenticate, validate(S.changePasswordSchema), auth.changePassword);

/* ---------- admin: settings accessible so the first-login screen works ---------- */
const admin = Router();
admin.use(authenticate);
admin.get('/settings', misc.adminSettings); // read-only, harmless during forced change
admin.use(enforcePasswordChange);

admin.get('/dashboard', misc.dashboard);

admin.get('/books', validate(S.bookQuery, 'query'), books.listAdmin);
admin.post('/books', bookUpload, validate(S.createBookSchema), books.create);
admin.get('/books/:id', id, books.getAdmin);
admin.patch('/books/:id', id, bookUpload, validate(S.updateBookSchema), books.update);
admin.delete('/books/:id', id, books.remove);

admin.get('/categories', cats.listAdmin);
admin.post('/categories', categoryUpload, validate(S.categoryFields.partial().required({ name: true })), cats.create);
admin.patch('/categories/:id', id, categoryUpload, validate(S.categoryFields.partial()), cats.update);
admin.delete('/categories/:id', id, cats.remove);

admin.get('/orders', validate(S.listQuery, 'query'), orders.list);
admin.post('/orders', validate(S.orderCreate), orders.create);
admin.patch('/orders/:id', id, validate(S.orderUpdate), orders.update);

admin.get('/enquiries', validate(S.listQuery, 'query'), misc.listEnquiries);
admin.patch('/enquiries/:id', id, validate(S.enquiryUpdate), misc.updateEnquiry);

admin.patch('/settings', validate(S.settingsUpdate), misc.updateSettings);

router.use('/admin', admin);
export default router;
