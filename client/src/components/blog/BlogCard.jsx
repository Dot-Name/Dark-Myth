import { Link } from 'react-router-dom';
import { img, formatDate } from '../../utils/format.js';

export default function BlogCard({ blog }) {
  const author = blog.author?.name || blog.author || 'Dark Myth';
  return <article className="group overflow-hidden border border-line bg-white transition-shadow hover:shadow-soft">
    <Link to={`/blog/${blog.slug}`} className="block overflow-hidden bg-stone" aria-label={`Read ${blog.title}`}>
      {blog.featuredImage?.url ? <img src={img(blog.featuredImage.url, 720)} alt={blog.featuredImage.alt || blog.title} loading="lazy" decoding="async" className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]" /> : <div className="aspect-[16/10] bg-ink" aria-hidden="true" />}
    </Link>
    <div className="p-5 sm:p-6">
      <div className="flex items-center gap-3 text-[11px] uppercase tracking-[.16em] text-blood"><span>{blog.category?.name || 'Journal'}</span><span className="h-px w-5 bg-line"/><span>{blog.readingTime || 1} min read</span></div>
      <h2 className="mt-3 font-serif text-2xl leading-tight"><Link className="hover:text-blood" to={`/blog/${blog.slug}`}>{blog.title}</Link></h2>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted">{blog.excerpt}</p>
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4 text-xs text-muted"><span>{author}</span><time dateTime={blog.publishedAt}>{formatDate(blog.publishedAt)}</time></div>
      <Link className="mt-4 inline-block text-sm font-medium text-ink underline decoration-line underline-offset-4 hover:text-blood hover:decoration-blood" to={`/blog/${blog.slug}`}>Read story</Link>
    </div>
  </article>;
}
