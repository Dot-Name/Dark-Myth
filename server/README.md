# DARK MYTH API

Express and Mongoose API for the DARK MYTH catalogue, blog, admin dashboard, WhatsApp order records, enquiries, and contact settings. The API is versioned under `/api/v1`.

## Existing architecture

- Node.js ES modules, Express 4, MongoDB Atlas through Mongoose.
- Models: `Admin`, `Book`, `Category`, `Order`, `Enquiry`, and `Setting`.
- Blogs use their own `Blog` model and text category fields, separate from product categories.
- Admin authentication uses bcrypt password hashes, a JWT in an HttpOnly cookie, and a CSRF header for writes. There is no public admin registration.
- Checkout is recorded as a WhatsApp/manual payment workflow. The API does not create or verify gateway transactions. An admin manually verifies payment before granting a one-time access code.
- Images and PDFs use Cloudinary; PDFs are private and downloaded through short-lived signed URLs.

## Local setup

1. Use Node.js 18.18 or newer and MongoDB Atlas or a local MongoDB instance.
2. Copy `.env.example` to `.env` and set `MONGODB_URI`, a random `JWT_SECRET` of at least 32 characters, and `CLIENT_URL`. Configure Cloudinary to enable uploads and protected PDF downloads.
3. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD`, then run `npm run seed:admin`. The initial admin must change the password on first login.
4. Start with `npm run dev`; production uses `npm start`.

`npm run seed:categories` is optional. `npm run check` performs a syntax check on the app entry point. Never commit `.env` or paste its values into logs or support requests.

For separate-site production deployments, set `CROSS_SITE_COOKIES=true`, serve both sites over HTTPS, and list exact browser origins in comma-separated `CLIENT_URL`. Keep MongoDB network access restricted to the application deployment.

## API inventory

All routes below are prefixed with `/api/v1`.

| Area | Routes |
| --- | --- |
| Health | `GET /health` |
| Public catalogue | `GET /books`, `GET /books/featured`, `GET /books/:slug`, `GET /books/:id/download` |
| Public categories | `GET /categories`, `GET /categories/:slug` |
| Public settings and enquiries | `GET /settings`, `POST /enquiries` |
| Admin session | `POST /admin/auth/login`, `POST /admin/auth/logout`, `GET /admin/auth/me`, `POST /admin/auth/change-password` |
| Dashboard and settings | `GET /admin/dashboard`, `GET /admin/settings`, `PATCH /admin/settings` |
| Catalogue | `GET/POST /admin/books`, `GET/PATCH/DELETE /admin/books/:id` |
| Categories | `GET/POST /admin/categories`, `PATCH/DELETE /admin/categories/:id` |
| Orders/access | `GET/POST /admin/orders`, `PATCH /admin/orders/:id` |
| Enquiries | `GET /admin/enquiries`, `PATCH /admin/enquiries/:id` |
| Public blogs | `GET /blogs`, `/blogs/:slug`, `/blogs/featured`, `/blogs/popular`, `/blogs/latest`, `/blogs/category/:slug`, `/blogs/tag/:tag`, `/blogs/search`, `/blogs/:slug/related`, `/blogs/:slug/view`, `/blogs/sitemap.xml`, `/blogs/rss.xml` |
| Admin blogs | `GET/POST /admin/blogs`, `GET/PUT/DELETE /admin/blogs/:id`, `POST /admin/blogs/:id/images`, `PATCH /admin/blogs/:id/status`, `PATCH /admin/blogs/:id/feature`, `POST /admin/blogs/:id/publish`, `/schedule`, `/duplicate`, and `GET /admin/blogs/analytics` |

Admin write requests must include the `dm_token` cookie and the `X-CSRF-Token` returned by login or `/admin/auth/me`. Admin catalogue filters support `q`, `category`, `type`, `free`, `status`, `sort`, `page`, and `limit`; order and enquiry lists support `q`, `status`, `page`, and `limit`.

### Blog management

Create a draft with `POST /api/v1/admin/blogs` (authenticated cookie and CSRF header):

```json
{"title":"The Haunted House That Never Sleeps","excerpt":"Some houses are waiting.","content":"<p>A chilling story...</p>","contentType":"horror-story","category":"Ghost Stories","categorySlug":"ghost-stories","tags":["ghost","haunted house"],"seo":{"focusKeyword":"haunted house"}}
```

The endpoint accepts multipart form data with a `featuredImage` file or JSON without one. Slugs are generated from titles, collision-suffixed, and remain stable after a published title edit. An explicitly changed published slug appends its former slug to `slugHistory`; old slug aliases are resolved to the current post. SEO title/description, Open Graph, Twitter fields, canonical URL, robots directives, and BlogPosting JSON-LD are returned for public pages. Supplied SEO values persist on updates; unspecified values are generated from title/content. Rich text is reduced to a safe HTML tag/attribute allowlist and plain text drives excerpt fallback and reading-time calculations.

Schedule with `POST /api/v1/admin/blogs/:id/schedule` and `{ "scheduledAt": "2030-01-01T12:00:00Z" }`. The database-backed worker runs on startup and every minute, so scheduled records persist across restarts. Related book IDs are checked against `Book`. Featured-image uploads reuse Cloudinary validation and lifecycle helpers. Public blog listings accept `page`, `limit`, `search`, `category`, `tag`, `contentType`, `sortBy`, and `order`.

Responses use `{ success, data }` on success and `{ success: false, code, message, errors? }` on errors. Catalogue and list endpoints include `pagination` inside `data`.

## Admin session workflow

1. `POST /api/v1/admin/auth/login` with `{ "email", "password" }`.
2. Keep the returned `csrfToken` in memory and send it as `X-CSRF-Token` on write requests; send cookies with credentials enabled.
3. On first login, call `POST /api/v1/admin/auth/change-password` before other admin operations.
4. Call `POST /api/v1/admin/auth/logout` to clear the session cookie.

## Current business rules

- Public listings expose only published books in active categories.
- Admin order creation records a WhatsApp lead against the current published book price; client-submitted amounts are ignored. It does not imply payment.
- Payment must be manually verified before marking an order completed or granting download access. The access code is returned once and only its hash is stored.
- A category with products cannot be deleted without reassigning its products. Book deletion warns about active access unless `?force=true` is supplied.
- The dashboard reports observed catalogue/order/enquiry counts and recent records. Revenue is `null` because this workflow does not capture verified payment transactions.

## Deployment notes

Set `NODE_ENV=production`, use HTTPS, configure exact allowed origins, use a strong unique JWT secret, and configure Cloudinary and WhatsApp business number (required by current production env validation). The service exposes `GET /api/v1/health`. Ensure the hosting platform forwards proxy headers because secure cookies and rate limiting trust one proxy hop. Configure deployment-level log retention and MongoDB backups.

The repository currently contains no automated test framework or frontend source. Frontend integration should use the current `/api/v1` routes and include credentials plus the CSRF header for writes.
