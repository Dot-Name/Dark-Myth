import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import { env } from './config/env.js';
import routes from './routes/index.js';
import Book from './models/Book.js';
import Category from './models/Category.js';
import { apiLimiter } from './middleware/limiters.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { asyncHandler } from './utils/http.js';

const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(helmet());
app.use(
  cors({
    origin: (origin, cb) => (!origin || env.clientOrigins.includes(origin) ? cb(null, true) : cb(new Error('Origin not allowed'))),
    credentials: true,
  })
);
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));
app.use(cookieParser());
app.use(mongoSanitize()); // strips $ and . operators from user input (NoSQL injection)
app.use(morgan((t, req, res) => JSON.stringify({ level: 'info', method: req.method, url: req.originalUrl.split('?')[0], status: res.statusCode, ms: Number(t['response-time'](req, res)) }), { skip: () => env.NODE_ENV === 'test' }));

app.use('/api/v1', apiLimiter, routes);

const base = env.clientOrigins[0];
app.get('/robots.txt', (req, res) => res.type('text/plain').send(`User-agent: *\nDisallow: /admin\nDisallow: /api/\nSitemap: ${base}/sitemap.xml\n`));
app.get(
  '/sitemap.xml',
  asyncHandler(async (req, res) => {
    const cats = await Category.find({ isActive: true }).select('slug');
    const activeIds = (await Category.find({ isActive: true }).select('_id')).map((c) => c._id);
    const books = await Book.find({ status: 'published', category: { $in: activeIds } }).select('slug updatedAt');
    const urls = [
      ...['', '/catalogue', '/about', '/contact'].map((p) => `<url><loc>${base}${p}</loc></url>`),
      ...cats.map((c) => `<url><loc>${base}/catalogue?category=${c.slug}</loc></url>`),
      ...books.map((b) => `<url><loc>${base}/catalogue/${b.slug}</loc><lastmod>${b.updatedAt.toISOString()}</lastmod></url>`),
    ];
    res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`);
  })
);

app.use(notFound);
app.use(errorHandler);
export default app;
