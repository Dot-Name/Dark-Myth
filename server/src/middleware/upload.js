import multer from 'multer';
import { env } from '../config/env.js';
import { AppError } from '../utils/http.js';

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);

const base = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: Math.max(env.MAX_IMAGE_MB, env.MAX_PDF_MB) * 1024 * 1024, files: 12 },
  fileFilter: (req, file, cb) =>
    ALLOWED.has(file.mimetype) ? cb(null, true) : cb(new AppError(400, 'Only JPEG, PNG, WebP images and PDF files are allowed', 'BAD_FILE_TYPE')),
});

export const bookUpload = base.fields([
  { name: 'cover', maxCount: 1 },
  { name: 'gallery', maxCount: 8 },
  { name: 'pdf', maxCount: 1 },
]);
export const categoryUpload = base.single('image');
