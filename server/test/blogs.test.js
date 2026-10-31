import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeHtml } from '../src/services/blogService.js';
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

test('blog request schema strips client supplied internal fields', () => {
  const parsed = createBlog.parse({ title: 'Safe draft', createdBy: 'attacker', views: 999, status: 'draft' });
  assert.equal(parsed.createdBy, undefined);
  assert.equal(parsed.views, undefined);
});
