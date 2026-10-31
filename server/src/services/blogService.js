import slugify from 'slugify';
import mongoose from 'mongoose';
import Blog from '../models/Blog.js';
import Book from '../models/Book.js';
import { env } from '../config/env.js';
import { AppError, escapeRegex } from '../utils/http.js';
import { uploadImage, destroyAssets } from './assets.js';

const baseUrl = env.clientOrigins[0];
export const publicFilter = () => ({ status: 'published', visibility: 'public', publishedAt: { $lte: new Date() } });
const uniqueSlug = async (title, requested, except) => {
  const root = slugify(requested || title, { lower: true, strict: true }) || 'story'; let candidate = root; let n = 2;
  while (await Blog.exists({ slug: candidate, ...(except ? { _id: { $ne: except } } : {}) })) candidate = `${root}-${n++}`;
  return candidate;
};
const plain = (html='') => html.replace(/<(script|style|iframe|object|svg|math)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, ' ').replace(/<[^>]*>/g, ' ').replace(/&nbsp;|&#160;/gi, ' ').replace(/&amp;/gi, '&').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>').replace(/\s+/g, ' ').trim();
// Allowlist-oriented HTML cleanup. Only YouTube's nocookie embed host is accepted for iframes.
export function sanitizeHtml(html='') {
  let s = String(html).replace(/<(script|style|object|embed|form|svg|math)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '').replace(/<(script|style|object|embed|form|svg|math)\b[^>]*\/?>/gi, '');
  s = s.replace(/<iframe\b([^>]*)>[\s\S]*?<\/iframe\s*>/gi, (_, attrs) => {
    const src = attrs.match(/src\s*=\s*["'](https:\/\/www\.youtube-nocookie\.com\/embed\/[\w-]+)["']/i)?.[1];
    return src ? `<iframe src="${src}" loading="lazy" title="Embedded video" allow="accelerometer; autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>` : '';
  });
  const allowed = new Set(['p','br','hr','h1','h2','h3','h4','h5','h6','strong','b','em','i','u','s','ul','ol','li','blockquote','a','img','figure','figcaption','table','thead','tbody','tr','th','td','pre','code','iframe']);
  return s.replace(/<!--[\s\S]*?-->/g, '').replace(/<\/?([a-z][\w:-]*)\b([^>]*)>/gi, (tag, rawName, attrs) => {
    const name=rawName.toLowerCase(); if(!allowed.has(name)) return '';
    const closing=tag.startsWith('</'); if(closing) return `</${name}>`;
    if(name==='iframe') { const src=attrs.match(/src\s*=\s*["'](https:\/\/www\.youtube-nocookie\.com\/embed\/[\w-]+)["']/i)?.[1]; return src?`<iframe src="${src}" loading="lazy" title="Embedded video" allow="accelerometer; autoplay; encrypted-media; picture-in-picture" allowfullscreen>`:''; }
    const read=(key)=>attrs.match(new RegExp(`\\b${key}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`,'i'))?.slice(1).find(Boolean)||'';
    let safe='';
    if(name==='a') { let href=read('href').replace(/&(?:#x?0*6a|j);?/gi,'j').replace(/&(?:#x?0*61|a);?/gi,'a').trim(); if(/^(https?:\/\/|mailto:|\/|#)/i.test(href)) safe+=` href="${href.replace(/"/g,'&quot;')}"`; safe+=' rel="nofollow noopener noreferrer"'; }
    if(name==='img') { const src=read('src'); if(!/^https:\/\//i.test(src)) return ''; safe+=` src="${src.replace(/"/g,'&quot;')}"`; for(const key of ['alt','title']) {const value=read(key); if(value)safe+=` ${key}="${value.replace(/"/g,'&quot;')}"`;} }
    if(['th','td'].includes(name)) { const colspan=read('colspan'); if(/^\d{1,2}$/.test(colspan))safe+=` colspan="${colspan}"`; }
    return `<${name}${safe}>`;
  });
}
const description = (b) => (b.excerpt || plain(b.content)).slice(0, 160).trim();
function prepareSeo(b) {
  const old = b.seo?.toObject?.() || b.seo || {}; const canonical = old.canonicalUrl || `${baseUrl}/blog/${b.slug}`;
  b.seo = { ...old, metaTitle: old.metaTitle || b.title.slice(0,60), metaDescription: old.metaDescription || description(b), canonicalUrl: canonical, ogTitle: old.ogTitle || old.metaTitle || b.title, ogDescription: old.ogDescription || old.metaDescription || description(b), ogImage: old.ogImage || b.featuredImage, twitterTitle: old.twitterTitle || old.metaTitle || b.title, twitterDescription: old.twitterDescription || old.metaDescription || description(b), twitterImage: old.twitterImage || old.ogImage || b.featuredImage, robotsIndex: b.status === 'published' && b.visibility === 'public' ? old.robotsIndex !== false : false, robotsFollow: b.status === 'published' && b.visibility === 'public' ? old.robotsFollow !== false : false };
}
export function serializeBlog(b) {
  const o = b.toObject ? b.toObject() : b;
  return { id: String(o._id), title:o.title, slug:o.slug, excerpt:o.excerpt, content:o.content, featuredImage:o.featuredImage ? { url:o.featuredImage.url, alt:o.featuredImageAlt || o.featuredImage.alt || '' } : undefined, category:o.category ? { name:o.category, slug:o.categorySlug } : undefined, tags:o.tags, author:{ name:o.author }, contentType:o.contentType, readingTime:o.readingTime, wordCount:o.wordCount, publishedAt:o.publishedAt, seo:o.seo, seriesName:o.seriesName, seriesPart:o.seriesPart, warnings:o.warnings, relatedBooks:o.relatedBooks, createdAt:o.createdAt, updatedAt:o.updatedAt };
}
export async function saveBlog(data, admin, existing, file) {
  const b = existing || new Blog(); const beforeSlug = b.slug; const manuallySet = data.slug && data.slug !== beforeSlug;
  Object.assign(b, data);
  if (!existing || manuallySet) b.slug = await uniqueSlug(b.title, data.slug || b.title, existing?._id);
  else if (!beforeSlug) b.slug = await uniqueSlug(b.title, b.title);
  else if (data.title && data.title !== existing.title && existing.status !== 'published') b.slug = await uniqueSlug(data.title, data.title, existing._id);
  if (data.relatedBlogs?.some((id) => String(id) === String(b._id))) throw new AppError(400,'A blog cannot be related to itself','VALIDATION_ERROR');
  if (data.relatedBooks?.length) { const n=await Book.countDocuments({_id:{$in:data.relatedBooks}}); if(n!==new Set(data.relatedBooks).size) throw new AppError(400,'One or more related books do not exist','BAD_BOOK'); }
  let uploaded;
  if(file) uploaded=await uploadImage(file,'blogs');
  if (uploaded) { const old=b.featuredImage; b.featuredImage={...uploaded,alt:b.featuredImageAlt}; }
  b.content=sanitizeHtml(b.content); b.plainText=plain(b.content); b.wordCount=b.plainText ? b.plainText.split(/\s+/).length : 0; b.readingTime=Math.max(1,Math.ceil(b.wordCount/200)); b.estimatedReadingTime=b.readingTime;
  if (b.status==='published') { if(!b.content || !b.plainText) throw new AppError(400,'Content is required before publishing','VALIDATION_ERROR'); if(!b.publishedAt) b.publishedAt=new Date(); b.scheduledAt=undefined; }
  if (manuallySet && beforeSlug && existing.status==='published' && !b.slugHistory.includes(beforeSlug)) b.slugHistory.push(beforeSlug);
  if (data.title && existing?.status==='published' && !manuallySet) b.slug=beforeSlug;
  b.updatedBy=admin._id; if(!existing) b.createdBy=admin._id;
  prepareSeo(b);
  if (b.seo.canonicalUrl && await Blog.exists({ 'seo.canonicalUrl': b.seo.canonicalUrl, ...(b._id ? { _id: { $ne: b._id } } : {}) })) throw new AppError(409,'Canonical URL is already assigned to another blog','DUPLICATE_CANONICAL');
  if (b.featuredImage) b.featuredImage.alt=b.featuredImageAlt;
  await b.save();
  if(uploaded && existing?.featuredImage?.publicId) await destroyAssets([existing.featuredImage]);
  return b;
}
export async function listBlogs(q, admin=false) {
  const filter=admin?{}:{...publicFilter()};
  for(const k of ['status','visibility','contentType','author']) if(admin && q[k]) filter[k]=q[k];
  if(q.category) filter.categorySlug=q.category; if(q.tag) filter.tags=q.tag; if(q.featured) filter.isFeatured=q.featured==='true';
  if(q.from||q.to) filter.publishedAt={...(filter.publishedAt||{}),...(q.from?{$gte:q.from}:{}),...(q.to?{$lte:q.to}:{})};
  if(q.search) { const re=new RegExp(escapeRegex(q.search),'i'); filter.$or=[{title:re},{excerpt:re},{plainText:re},{tags:re}]; }
  const sort={[q.sortBy||'publishedAt']:q.order==='asc'?1:-1}; const page=q.page||1, limit=q.limit||10;
  const [rows,total]=await Promise.all([Blog.find(filter).sort(sort).skip((page-1)*limit).limit(limit).lean(),Blog.countDocuments(filter)]);
  return {items:rows.map(serializeBlog),pagination:{page,limit,total,pages:Math.ceil(total/limit)}};
}
export async function promoteScheduled() { const now=new Date(); await Blog.updateMany({status:'draft',visibility:'public',scheduledAt:{$lte:now}},{$set:{status:'published',publishedAt:now,updatedAt:now,'seo.robotsIndex':true,'seo.robotsFollow':true}}); }
export async function addInlineImage(b, file, meta={}) { const uploaded=await uploadImage(file,'blogs/inline'); b.inlineImages.push({...uploaded,alt:meta.alt||'',caption:meta.caption||'',credit:meta.credit||''}); await b.save(); return b.inlineImages.at(-1); }
export async function deleteBlog(b) { await b.deleteOne(); await destroyAssets([b.featuredImage,...(b.inlineImages||[]),b.seo?.ogImage,b.seo?.twitterImage]); }
export async function sitemapXml() { const rows=await Blog.find(publicFilter()).select('slug seo.canonicalUrl updatedAt publishedAt').lean(); return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${rows.map(b=>`<url><loc>${xml(b.seo?.canonicalUrl||`${baseUrl}/blog/${b.slug}`)}</loc><lastmod>${(b.updatedAt||b.publishedAt).toISOString()}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`).join('')}</urlset>`; }
const xml=s=>String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
export async function rssXml() { const rows=await Blog.find(publicFilter()).sort({publishedAt:-1}).limit(50).lean(); return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Dark Myth Blog</title><link>${xml(baseUrl)}/blog</link><description>Horror stories and coloring guides from Dark Myth</description>${rows.map(b=>`<item><title>${xml(b.title)}</title><description>${xml(b.excerpt||plain(b.content))}</description><link>${xml(b.seo?.canonicalUrl||`${baseUrl}/blog/${b.slug}`)}</link><guid>${xml(b.seo?.canonicalUrl||`${baseUrl}/blog/${b.slug}`)}</guid><pubDate>${new Date(b.publishedAt).toUTCString()}</pubDate><author>${xml(b.author)}</author>${b.featuredImage?.url?`<enclosure url="${xml(b.featuredImage.url)}" type="image/jpeg"/>`:''}</item>`).join('')}</channel></rss>`; }
export const validObjectId = (v) => mongoose.isValidObjectId(v);
