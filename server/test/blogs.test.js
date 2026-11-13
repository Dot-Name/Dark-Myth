import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeHtml, serializeBlog, snapshotFeaturedImage } from '../src/services/blogService.js';
import { createBlog } from '../src/validators/blogSchemas.js';

test('rich text keeps supported formatting and strips executable markup', () => {
  const html = sanitizeHtml('<h2>Night</h2><p onclick="alert(1)">A <strong>dark</strong> room</p><script>alert(1)</script><a href="javascript:alert(1)">unsafe</a>');
  assert.match(html, /<h2>Night<\/h2>/);
  assert.match(html, /<strong>dark<\/strong>/);
  assert.doesNotMatch(html, /script|onclick|javascript:/i);
});

test('rich text allows only YouTube nocookie iframe embeds', () => {
  const safe = sanitizeHtml('<iframe src="https://www.youtube-nocookie.com/embed/abc_123" onload="alert(1)"></iframe>');
  const unsafe = sanitizeHtml('<iframe src="https://evil.example/embed/abc"></iframe>');
  assert.match(safe, /youtube-nocookie\.com\/embed\/abc_123/);
  assert.doesNotMatch(safe, /onload/);
  assert.doesNotMatch(unsafe, /iframe/);
});

test('images retain accessibility text but drop unsafe URLs and arbitrary attributes', () => {
  const html = sanitizeHtml('<img src="https://cdn.example/image.webp" alt="A haunted manor" onerror="alert(1)"><img src="data:text/html,bad" alt="bad">');
  assert.match(html, /alt="A haunted manor"/);
  assert.doesNotMatch(html, /onerror|data:text/i);
});

test('blog serialization exposes featured image thumbnails and alt text', () => {
  const blog = serializeBlog({
    _id: 'blog-id',
    title: 'A haunted manor',
    featuredImage: { url: 'https://res.cloudinary.com/darkmyth/image/upload/manor.webp', alt: 'Old manor at night' },
  });
  assert.deepEqual(blog.featuredImage, {
    url: 'https://res.cloudinary.com/darkmyth/image/upload/manor.webp',
    alt: 'Old manor at night',
  });
});

test('featured image cleanup keeps a snapshot of the old asset after replacement', () => {
  const blog = {
    featuredImage: { publicId: 'old-image', url: 'https://cdn.example/old.webp' },
  };
  const previous = snapshotFeaturedImage(blog.featuredImage);
  blog.featuredImage = { publicId: 'new-image', url: 'https://cdn.example/new.webp' };
  assert.equal(previous.publicId, 'old-image');
});

test('blog request schema strips client supplied internal fields', () => {
  const parsed = createBlog.parse({ title: 'Safe draft', createdBy: 'attacker', views: 999, status: 'draft' });
  assert.equal(parsed.createdBy, undefined);
  assert.equal(parsed.views, undefined);
});
