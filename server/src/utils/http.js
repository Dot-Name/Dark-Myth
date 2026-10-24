export class AppError extends Error {
  constructor(status, message, code = 'ERROR', errors) {
    super(message);
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export const ok = (res, data, status = 200) => res.status(status).json({ success: true, data });

export const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source] ?? {});
  if (!result.success) {
    const errors = result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
    return next(new AppError(400, `Validation failed: ${errors[0].path} ${errors[0].message}`, 'VALIDATION_ERROR', errors));
  }
  req.valid = { ...(req.valid || {}), [source]: result.data };
  next();
};
