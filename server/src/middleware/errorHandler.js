import { ZodError } from 'zod';
import multer from 'multer';
import { env } from '../config/env.js';
import { AppError } from '../utils/http.js';

export const notFound = (req, res, next) => next(new AppError(404, 'Route not found', 'NOT_FOUND'));

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let status = err.status || 500;
  let message = err.message;
  let code = err.code || 'ERROR';
  let errors = err.errors;

  if (err instanceof ZodError) {
    status = 400; code = 'VALIDATION_ERROR'; message = 'Validation failed';
    errors = err.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
  } else if (err instanceof multer.MulterError) {
    status = 400; code = 'UPLOAD_ERROR';
    message = err.code === 'LIMIT_FILE_SIZE' ? 'Uploaded file is too large' : `Upload error: ${err.message}`;
  } else if (err?.code === 11000) {
    status = 409; code = 'DUPLICATE';
    message = `Duplicate value for ${Object.keys(err.keyPattern || {}).join(', ') || 'a unique field'}`;
  } else if (err?.name === 'CastError') {
    status = 400; code = 'BAD_ID'; message = 'Invalid identifier';
  } else if (err?.name === 'ValidationError') {
    status = 400; code = 'VALIDATION_ERROR'; message = err.message;
  } else if (err?.type === 'entity.parse.failed') {
    status = 400; code = 'BAD_JSON'; message = 'Malformed JSON body';
  }

  if (status >= 500) {
    console.error(JSON.stringify({ level: 'error', msg: err.message, path: req.originalUrl, stack: env.isProd ? undefined : err.stack }));
    message = env.isProd ? 'Something went wrong on our side' : message;
    code = 'INTERNAL';
  }
  res.status(status).json({ success: false, code, message, ...(errors ? { errors } : {}) });
}
