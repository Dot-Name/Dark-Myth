import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api.js';
import useFetch from '../hooks/useFetch.js';
import useDebounce from '../hooks/useDebounce.js';
import useSeo from '../hooks/useSeo.js';
import BookSearch from '../components/catalogue/BookSearch.jsx';
import CategoryFilter from '../components/catalogue/CategoryFilter.jsx';
import BookGrid from '../components/catalogue/BookGrid.jsx';
import LoadingSkeleton from '../components/common/LoadingSkeleton.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import Pagination from '../components/common/Pagination.jsx';
import { TYPE_LABELS } from '../utils/format.js';

export default function Catalogue() {
  useSeo({ title: 'Catalogue', description: 'Browse Indian horror books, haunted place guides, folklore collections and horror colouring books.' });
  const [sp, setSp] = useSearchParams();
  const category = sp.get('category') || '';
  const type = sp.get('type') || '';
  const sort = sp.get('sort') || 'newest';
  const page = Number(sp.get('page') || 1);
  const urlQ = sp.get('q') || '';
  const [q, setQ] = useState(urlQ);
  const dq = useDebounce(q);

  useEffect(() => { setQ(urlQ); }, [urlQ]);
  const update = (patch) => {
    const next = new URLSearchParams(sp);
    Object.entries({ page: '', ...patch }).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setSp(next, { replace: true });
  };
  useEffect(() => { if (dq !== urlQ) update({ q: dq }); /* eslint-disable-next-line */ }, [dq]);

  const cats = useFetch(() => api.get('/categories'), []);
  const { data, loading, error, reload } = useFetch(
    () => api.get('/books', { params: { q: urlQ || undefined, category: category || undefined, type: type || undefined, sort, page, limit: 12 } }),
    [urlQ, category, type, sort, page]
  );
  const hasFilters = urlQ || category || type || sort !== 'newest';

  return (
    <div className="container-page py-10 sm:py-14">
      <h1 className="heading-xl !text-4xl sm:!text-5xl">The catalogue</h1>
      <p className="mt-3 max-w-xl text-muted">Every Dark Myth title in one place. Search, filter and open a book to see its details.</p>

      <div className="mt-8 space-y-4">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <BookSearch value={q} onChange={setQ} />
          <div><label htmlFor="type" className="sr-only">Book type</label>
            <select id="type" className="field" value={type} onChange={(e) => update({ type: e.target.value })}>
              <option value="">All book types</option>
              {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select></div>
          <div><label htmlFor="sort" className="sr-only">Sort</label>
            <select id="sort" className="field" value={sort} onChange={(e) => update({ sort: e.target.value === 'newest' ? '' : e.target.value })}>
              <option value="newest">Newest</option><option value="title">Title A to Z</option>
              <option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option>
            </select></div>
        </div>
        <CategoryFilter categories={cats.data?.items || []} value={category} onChange={(c) => update({ category: c })} />
        {hasFilters && <button className="text-sm underline underline-offset-4 hover:text-blood" onClick={() => { setQ(''); setSp({}, { replace: true }); }}>Clear filters</button>}
      </div>

      <div className="mt-10" aria-live="polite">
        {loading && <LoadingSkeleton />}
        {error && <ErrorState error={error} onRetry={reload} />}
        {!loading && !error && data.items.length === 0 && (
          <EmptyState title="No books found" action={hasFilters ? <button className="btn-outline" onClick={() => { setQ(''); setSp({}, { replace: true }); }}>Clear filters</button> : null}>
            {hasFilters ? 'Nothing matches those filters. Try a different search or clear them.' : 'No books have been published yet. Check back soon.'}
          </EmptyState>
        )}
        {!loading && !error && data.items.length > 0 && <><BookGrid books={data.items} /><Pagination pagination={data.pagination} onPage={(p) => { update({ page: String(p) }); window.scrollTo({ top: 0 }); }} /></>}
      </div>
    </div>
  );
}
