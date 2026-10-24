import crypto from 'crypto';
import cloudinary from '../config/cloudinary.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/http.js';

// Verify the real file signature rather than trusting extension or client MIME type.
const isJpeg = (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
const isPng = (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
const isWebp = (b) => b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WEBP';
const isPdf = (b) => b.subarray(0, 5).toString() === '%PDF-';

function requireCloudinary() {
  if (!env.cloudinaryConfigured) throw new AppError(503, 'Cloudinary is not configured on the server', 'STORAGE_UNAVAILABLE');
}

function assertImage(file) {
  if (file.size > env.MAX_IMAGE_MB * 1024 * 1024) throw new AppError(400, `Images must be ${env.MAX_IMAGE_MB} MB or smaller`, 'FILE_TOO_LARGE');
  const b = file.buffer;
  if (!(isJpeg(b) || isPng(b) || isWebp(b))) throw new AppError(400, 'The uploaded image is not a valid JPEG, PNG or WebP file', 'BAD_FILE_TYPE');
}

function assertPdf(file) {
  if (file.size > env.MAX_PDF_MB * 1024 * 1024) throw new AppError(400, `PDF files must be ${env.MAX_PDF_MB} MB or smaller`, 'FILE_TOO_LARGE');
  if (!isPdf(file.buffer)) throw new AppError(400, 'The uploaded file is not a valid PDF', 'BAD_FILE_TYPE');
}

const upload = (buffer, options) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => (err ? reject(err) : resolve(result)));
    stream.end(buffer);
  });

export async function uploadImage(file, folder) {
  requireCloudinary();
  assertImage(file);
  try {
    const r = await upload(file.buffer, { folder: `darkmyth/${folder}`, resource_type: 'image', type: 'upload' });
    return { publicId: r.public_id, url: r.secure_url, width: r.width, height: r.height };
  } catch (e) {
    throw new AppError(502, 'Image upload failed. Please try again.', 'UPLOAD_FAILED');
  }
}

// PDFs are stored as raw assets with type "authenticated": no public URL exists for them.
export async function uploadPdf(file) {
  requireCloudinary();
  assertPdf(file);
  try {
    const r = await upload(file.buffer, {
      folder: 'darkmyth/pdfs',
      public_id: `${crypto.randomUUID()}.pdf`,
      resource_type: 'raw',
      type: 'authenticated',
    });
    return { publicId: r.public_id, bytes: r.bytes, originalName: String(file.originalname).slice(0, 200) };
  } catch (e) {
    throw new AppError(502, 'PDF upload failed. Please try again.', 'UPLOAD_FAILED');
  }
}

// Short-lived signed download URL generated server-side with the API secret.
export function signedPdfUrl(publicId) {
  requireCloudinary();
  const expires_at = Math.floor(Date.now() / 1000) + env.DOWNLOAD_URL_TTL_SECONDS;
  return cloudinary.utils.private_download_url(publicId, '', {
    resource_type: 'raw',
    type: 'authenticated',
    expires_at,
    attachment: true,
  });
}

export async function destroyAssets(assets = []) {
  if (!env.cloudinaryConfigured) return;
  await Promise.allSettled(
    assets.filter(Boolean).map((a) =>
      cloudinary.uploader.destroy(a.publicId, a.raw ? { resource_type: 'raw', type: 'authenticated' } : { resource_type: 'image' })
    )
  );
}
