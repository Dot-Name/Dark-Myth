import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import useDebounce from '../hooks/useDebounce.js';
import useSeo from '../hooks/useSeo.js';
import { blogService } from '../services/blogService.js';
import BlogCard from '../components/blog/BlogCard.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Pagination from '../components/common/Pagination.jsx';
import { img, formatDate } from '../utils/format.js';

export default function Blog() {
  const [sp, setSp] = useSearchParams();
  const [query, setQuery] = useState(sp.get('search') || '');
  const [retryKey, setRetryKey] = useState(0);
  const search = useDebounce(query, 350);
  const category = sp.get('category') || '';
  const tag = sp.get('tag') || '';
  const page = Number(sp.get('page') || 1);
  const sortBy = sp.get('sortBy') || 'publishedAt';
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [featuredState, setFeaturedState] = useState({ data: [], error: null });
  const update = (values) => { const next = new URLSearchParams(sp); Object.entries(values).forEach(([k,v]) => v ? next.set(k,String(v)) : next.delete(k)); if (!('page' in values)) next.delete('page'); setSp(next, { replace: true }); };
  useSeo({ title: 'Horror Stories & Dark Legends | Dark Myth Journal', description: 'Explore chilling horror stories, ghost tales, supernatural mysteries, dark folklore, and horror coloring inspiration.', image: featuredState.data?.[0]?.featuredImage?.url && img(featuredState.data[0].featuredImage.url, 1200) });
  useEffect(() => { let live = true; const query={ search: search || undefined, category: category || undefined, tag: tag || undefined, page, limit: 9, sortBy, order: 'desc' }; setState((s) => ({ ...s, loading: true, error: null })); (search ? blogService.search(query) : blogService.list(query)).then((data) => live && setState({ data, loading: false, error: null })).catch((error) => live && setState({ data: null, loading: false, error })); return () => { live = false; }; }, [search, category, tag, page, sortBy, retryKey]);
  useEffect(() => { let live = true; Promise.all([blogService.featured(), blogService.list({ limit: 50 })]).then(([items, all]) => { if (live) { const posts = all.items || []; setFeaturedState({ data: items || [], categories: [...new Map(posts.filter((b) => b.category?.slug).map((b) => [b.category.slug,b.category])).values()] }); } }).catch(() => live && setFeaturedState({ data: [], categories: [] })); return () => { live = false; }; }, []);
  const data = state.data;
  const categories = featuredState.categories || [];
  const hero = featuredState.data?.[0];
  const tags = useMemo(() => [...new Set((data?.items || []).flatMap((b) => b.tags || []))].slice(0, 12), [data]);
  return <div>
    <section className="relative overflow-hidden border-b border-line bg-ink text-ivory"><div className="mist absolute inset-0 opacity-40" aria-hidden="true"/><div className="container-page relative py-16 sm:py-24"><p className="text-xs font-semibold uppercase tracking-[.24em] text-stone">Dark Myth Journal</p><h1 className="mt-4 max-w-3xl font-serif text-5xl font-semibold leading-[1.02] sm:text-7xl">Stories From the Dark</h1><p className="mt-6 max-w-2xl text-base leading-7 text-stone sm:text-lg">Horror stories, supernatural tales, old folklore, and inspiration for bringing the strange to life in color.</p></div></section>
    <div className="container-page">
      {hero && <section className="grid overflow-hidden border border-line bg-white md:grid-cols-2"><Link to={`/blog/${hero.slug}`} className="block bg-ink">{hero.featuredImage?.url ? <img src={img(hero.featuredImage.url, 1000)} alt={hero.featuredImage.alt || hero.title} className="aspect-[16/10] h-full w-full object-cover md:aspect-auto"/> : <div className="min-h-64 bg-ink"/>}</Link><div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14"><p className="text-xs uppercase tracking-[.18em] text-blood">Featured story · {hero.category?.name || 'Journal'}</p><h2 className="mt-4 font-serif text-3xl leading-tight sm:text-4xl"><Link to={`/blog/${hero.slug}`} className="hover:text-blood">{hero.title}</Link></h2><p className="mt-4 text-sm leading-7 text-muted">{hero.excerpt}</p><p className="mt-5 text-xs text-muted">{hero.author?.name || hero.author || 'Dark Myth'} · {formatDate(hero.publishedAt)} · {hero.readingTime || 1} min read</p><Link to={`/blog/${hero.slug}`} className="btn-primary mt-7 w-fit">Read story</Link></div></section>}
      <section className="py-12" aria-label="Browse journal"><div className="flex flex-wrap gap-2"><button onClick={() => update({ category: '' })} className={`rounded-full border px-4 py-2 text-sm ${!category ? 'border-ink bg-ink text-ivory' : 'border-line hover:border-blood'}`}>All stories</button>{categories.map((c) => <button key={c.slug} onClick={() => update({ category: c.slug })} className={`rounded-full border px-4 py-2 text-sm ${category === c.slug ? 'border-ink bg-ink text-ivory' : 'border-line hover:border-blood'}`}>{c.name}</button>)}</div>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center"><label className="relative flex min-w-0 flex-1 items-center"><Search aria-hidden="true" size={17} className="absolute left-3 text-muted"/><span className="sr-only">Search stories</span><input className="field pl-10" placeholder="Search stories and folklore" value={query} onChange={(e) => { setQuery(e.target.value); update({ search: e.target.value }); }}/></label><label className="sr-only" htmlFor="blog-sort">Sort stories</label><select id="blog-sort" value={sortBy} onChange={(e) => update({ sortBy: e.target.value })} className="field sm:w-48"><option value="publishedAt">Latest</option><option value="views">Popular</option></select></div>
        {!!tags.length && <div className="mt-3 flex flex-wrap gap-2" aria-label="Popular tags">{tags.map((tag) => <button key={tag} onClick={() => update({ tag })} className={`text-xs text-muted underline decoration-line underline-offset-4 hover:text-blood ${sp.get('tag')===tag?'text-blood':''}`}>#{tag}</button>)}</div>}
      </section>
      <section className="pb-16" aria-live="polite">{state.loading && <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{Array.from({length:6},(_,i)=><div key={i} className="skeleton aspect-[4/5]"/>)}</div>}{state.error && <ErrorState error={state.error} onRetry={() => setRetryKey(k=>k+1)}/ >}{!state.loading && !state.error && !data?.items?.length && <EmptyState title="No stories found">Try a different search or category. New stories arrive here when they are published.</EmptyState>}{!state.loading && !state.error && !!data?.items?.length && <><div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{data.items.map((post)=><BlogCard key={post.id} blog={post}/>)}</div><Pagination pagination={data.pagination} onPage={(p)=>update({page:p})}/></>}</section>
      <p className="mb-14 text-sm text-muted">Looking for a darker read? <Link className="underline hover:text-blood" to="/catalogue">Explore our horror coloring books</Link>.</p>
    </div>
  </div>;
}
