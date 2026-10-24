# Dark Myth

Catalogue and storefront for Indian horror-themed colouring books and PDF books. MERN stack (React + Vite, Express, MongoDB/Mongoose), Cloudinary for assets, JWT in HTTP-only cookies, purchases through WhatsApp with manual payment verification.

```
dark-myth/
  client/   React (JavaScript), Vite, Tailwind, React Router
  server/   Express API under /api/v1, Mongoose models, seed scripts
```

## 1. Install

```bash
cd server && npm install
cd ../client && npm install
```

Requires Node 18.18+.

## 2. Configure

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Edit `server/.env`:

| Variable | Notes |
|---|---|
| `MONGODB_URI` | Local (`mongodb://127.0.0.1:27017/dark-myth`) or an Atlas connection string |
| `CLIENT_URL` | Frontend origin(s), comma-separated. Also used in the sitemap |
| `JWT_SECRET` | 32+ random characters: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Used only by `npm run seed:admin` |
| `CLOUDINARY_*` | Cloud name, API key, API secret (see below) |
| `WHATSAPP_BUSINESS_NUMBER` | Digits only with country code, no `+` (e.g. `919876543210`) |
| `CROSS_SITE_COOKIES` | `true` when frontend and API are on different sites (Vercel + Render) |

The server refuses to start with an invalid config. In production it also requires Cloudinary and WhatsApp settings.

### MongoDB
Local: install MongoDB Community and start `mongod`. Hosted: create a free Atlas cluster, add a database user, allow your server's IP, and paste the connection string into `MONGODB_URI`.

### Cloudinary
Create an account, copy cloud name, API key and API secret from the dashboard into `server/.env`. Images are uploaded as normal assets. PDFs are uploaded as **raw** assets with delivery type **authenticated**, so they have no public URL. If your account restricts raw or authenticated delivery, check your Cloudinary security settings (see Limitations).

## 3. Initial admin and categories

```bash
cd server
npm run seed            # admin + 8 default categories
```

- The seed is idempotent. It never overwrites an existing admin or password.
- In production the seed refuses a password that is not 12+ characters with upper, lower, number and symbol.
- The account is created with `mustChangePassword = true`. On first login the admin is sent to **Settings** and cannot use any other admin API until the password is changed (enforced on the server).
- For local development you may use any 8+ character initial password. Change it at first login regardless.

## 4. Run locally

```bash
cd server && npm run dev     # http://localhost:5000
cd client && npm run dev     # http://localhost:5173
```

Admin login: http://localhost:5173/admin/login (also linked in the footer).

## 5. How purchases and PDF access work

1. **Free book** with a PDF: "Get PDF" calls `GET /api/v1/books/:id/download`. The server checks the book is published and free, then returns a signed Cloudinary URL that expires in `DOWNLOAD_URL_TTL_SECONDS` (default 120).
2. **Paid book**: "Purchase via WhatsApp" opens `wa.me/<WHATSAPP_BUSINESS_NUMBER>` with a prefilled, URL-encoded message (title, slug, price).
3. After you confirm payment yourself, go to **Admin > Orders and access > Record an order**, set payment to *Verified*, then **Grant 30-day access**. A one-time access code is shown once (only its hash is stored).
4. Send the code to the customer. They enter it on the book page under "I already have an access code". Codes can be revoked, expire, and have a download limit (default 5).

Without a verified order and valid code, a paid PDF cannot be downloaded.

## 6. Security summary

bcrypt password hashing (cost 12); JWT in an HTTP-only, `Secure` (production) cookie; CSRF token embedded in the JWT and required in `X-CSRF-Token` on state-changing admin calls (kept in memory, never localStorage); `SameSite=Lax`, or `None` when `CROSS_SITE_COOKIES=true`; role and active checks on every admin request; login, contact, download and global rate limits; Helmet; CORS allow-list; NoSQL-injection sanitising plus Zod validation with allow-listed fields (no mass assignment); file signature checks (JPEG/PNG/WebP/PDF magic bytes) and size limits; no public admin registration; no secrets in the client bundle.

## 7. Deploy

**Backend (Render or similar):** root `server`, build `npm install`, start `npm start`. Set every variable from `.env.example`, with `NODE_ENV=production`, `CLIENT_URL=https://your-frontend`, `CROSS_SITE_COOKIES=true` if on different domains. Then run `npm run seed` once from a shell.

**Frontend (Vercel):** root `client`, build `npm run build`, output `dist`. Set `VITE_API_BASE_URL=https://your-api/api/v1`. `vercel.json` handles SPA routing. After deploying, add `Sitemap: https://your-api/sitemap.xml` to `client/public/robots.txt`.

Cross-domain cookies work only over HTTPS, and some browsers block third-party cookies. Putting both on subdomains of one domain (`app.example.com`, `api.example.com`) is the most reliable setup.

## 8. Tests performed and limitations

Performed: the server module graph loads without errors, and the client production build succeeds with no broken imports. The built JS contains no server secrets.

**Not performed:** end-to-end tests against a live MongoDB and Cloudinary account (neither was available while building). Please run through these before launch: create a category and book with cover and PDF, publish, browse, download a free PDF, record and verify an order, redeem its access code, and check that a paid PDF without a code returns 403.

Known limitations:
- Signed Cloudinary download URLs are written to Cloudinary's documented API but were not exercised live. If downloads fail, check that "authenticated" raw delivery is permitted on your account.
- SEO tags are set client-side; some social crawlers do not run JavaScript, so link previews may not show product-specific details. Pre-rendering or a small SSR layer would fix this.
- The Privacy Policy and Terms pages are starter text; replace them with reviewed copy.
- The home hero uses a CSS arch by default. Set `VITE_HERO_IMAGE_URL` to show a photograph.
- Contact enquiries are stored in MongoDB; no email is sent.
- The Dark Myth logo file was not supplied, so a typographic placeholder is used (`client/src/components/common/Logo.jsx`).
- "Contents or highlights" on the product page is built from the book's tags, since the spec had no separate field.
