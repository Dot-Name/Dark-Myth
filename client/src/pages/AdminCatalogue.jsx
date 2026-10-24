import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import api, { toFormData } from '../services/api.js';
import useFetch from '../hooks/useFetch.js';
import useDebounce from '../hooks/useDebounce.js';

import DataTable from '../components/common/DataTable.jsx';
import Pagination from '../components/common/Pagination.jsx';
import ConfirmationDialog from '../components/common/ConfirmationDialog.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import AdminPageHeader from '../components/admin/AdminPageHeader.jsx';

import { priceLabel, formatDate, img } from '../utils/format.js';
import { ADMIN_PATHS } from '../routes/adminRoutes.js';

export default function AdminCatalogue() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('');
  
  const dq = useDebounce(q);
  
  const [del, setDel] = useState(null);
  const [forceDel, setForceDel] = useState(false);
  const [busy, setBusy] = useState(false);

  // Fetch book catalogue data based on search, category, status, and page
  const { data, loading, error, reload } = useFetch(
    () =>
      api.get('/admin/books', {
        params: {
          q: dq || undefined,
          category: category || undefined,
          status: status || undefined,
          page,
          limit: 15,
        },
      }),
    [dq, category, status, page]
  );

  // Fetch categories for filter dropdown
  const categories = useFetch(() => api.get('/admin/categories'), []);

  // Quick action: Toggle publish/unpublish status
  const toggle = async (b) => {
    try {
      const nextStatus = b.status === 'published' ? 'draft' : 'published';
      await api.patch(`/admin/books/${b.id}`, toFormData({ status: nextStatus }));
      toast.success(b.status === 'published' ? 'Unpublished' : 'Published');
      reload();
    } catch (e) {
      toast.error(e.userMessage || 'Failed to update publication status');
    }
  };

  // Delete book action (with force fallback if active orders exist)
  const remove = async (force = false) => {
    setBusy(true);
    try {
      await api.delete(`/admin/books/${del.id}`, { params: force ? { force: true } : {} });
      toast.success('Book deleted');
      setDel(null);
      setForceDel(false);
      reload();
    } catch (e) {
      if (e.code === 'HAS_ACTIVE_ACCESS' && !force) {
        setForceDel(true);
      } else {
        toast.error(e.userMessage || 'Failed to delete book');
      }
    } finally {
      setBusy(false);
    }
  };

  // Table structure definition
  const columns = [
    {
      key: 'cover',
      header: 'Book',
      render: (b) => (
        <div className="flex min-w-[11rem] items-center gap-3">
          {b.cover?.url ? (
            <img
              src={img(b.cover.url, 100)}
              alt={b.title}
              className="h-14 w-10 shrink-0 border border-slate-200 object-cover rounded-sm shadow-xs"
            />
          ) : (
            <span className="flex h-14 w-10 shrink-0 items-center justify-center bg-stone-100 font-serif text-xs text-stone-500 rounded-sm border border-stone-200">
              DM
            </span>
          )}
          <div className="min-w-0">
            <p className="font-medium text-stone-900 truncate">{b.title}</p>
            <p className="truncate text-xs text-stone-500">/{b.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (b) => <span className="text-stone-700">{b.category?.name || 'Uncategorized'}</span>,
    },
    {
      key: 'price',
      header: 'Price',
      render: (b) => <span className="font-mono text-xs">{priceLabel(b)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (b) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
            b.status === 'published'
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              : 'bg-stone-100 text-stone-700 border border-stone-200'
          }`}
        >
          {b.status === 'published' ? 'Published' : 'Draft'}
        </span>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Updated',
      render: (b) => <span className="text-stone-500 text-xs">{formatDate(b.updatedAt)}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (b) => (
        <div className="flex items-center gap-3 text-stone-600">
          <Link
            to={`/catalogue/${b.slug}?preview=1`}
            target="_blank"
            aria-label={`Preview ${b.title}`}
            title="Preview"
            className="hover:text-stone-900 transition-colors"
          >
            <Eye size={16} />
          </Link>
          <Link
            to={ADMIN_PATHS.editBook(b.id)}
            aria-label={`Edit ${b.title}`}
            title="Edit"
            className="hover:text-stone-900 transition-colors"
          >
            <Pencil size={16} />
          </Link>
          <button
            type="button"
            className="text-xs font-medium underline text-stone-600 hover:text-stone-900 transition-colors"
            onClick={() => toggle(b)}
          >
            {b.status === 'published' ? 'Unpublish' : 'Publish'}
          </button>
          <button
            type="button"
            aria-label={`Delete ${b.title}`}
            title="Delete"
            className="text-rose-600 hover:text-rose-700 transition-colors"
            onClick={() => {
              setForceDel(false);
              setDel(b);
            }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <AdminPageHeader
        eyebrow="Your library"
        title="Catalogue"
        description="Manage book details, pricing and publication status."
        action={
          <Link
            to={ADMIN_PATHS.newBook}
            className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium rounded-md shadow-xs transition-colors"
          >
            <Plus size={17} /> Add a book
          </Link>
        }
      />

      {/* Filter Toolbar */}
      <section className="border border-stone-200 bg-white p-4 sm:p-5 rounded-lg shadow-2xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Bar */}
          <div className="relative min-w-[220px] flex-1">
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
            />
            <label htmlFor="aq" className="sr-only">
              Search books
            </label>
            <input
              id="aq"
              type="text"
              className="w-full rounded-md border border-stone-300 bg-stone-50/50 pl-10 pr-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:border-stone-500 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-stone-500"
              placeholder="Search by title or keyword"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {/* Category Filter */}
          <div>
            <label htmlFor="acat" className="sr-only">
              Category
            </label>
            <select
              id="acat"
              className="rounded-md border border-stone-300 bg-stone-50/50 px-3 py-2 text-sm text-stone-800 focus:border-stone-500 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-stone-500"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All categories</option>
              {categories.data?.items?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="as" className="sr-only">
              Status
            </label>
            <select
              id="as"
              className="rounded-md border border-stone-300 bg-stone-50/50 px-3 py-2 text-sm text-stone-800 focus:border-stone-500 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-stone-500"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Results Counter / Filter Indicator */}
        <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3 text-xs text-stone-500">
          <span>
            {loading
              ? 'Loading books…'
              : `${data?.pagination?.total ?? 0} ${
                  data?.pagination?.total === 1 ? 'book' : 'books'
                }`}
          </span>
          <span>
            {status ? `${status[0].toUpperCase()}${status.slice(1)} only` : 'All publication statuses'}
          </span>
        </div>
      </section>

      {/* Errors & Data Table */}
      {categories.error && (
        <ErrorState error={categories.error} onRetry={categories.reload} />
      )}

      {error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : (
        <DataTable
          columns={columns}
          rows={loading ? [] : data?.items || []}
          empty={
            loading
              ? 'Loading…'
              : 'No books found. Add your first book to get started.'
          }
        />
      )}

      {/* Pagination */}
      {data && <Pagination pagination={data.pagination} onPage={setPage} />}

      {/* Standard Delete Modal */}
      <ConfirmationDialog
        open={!!del && !forceDel}
        title="Delete this book?"
        message={`"${del?.title}" and its uploaded images and PDF will be permanently removed.`}
        busy={busy}
        onConfirm={() => remove(false)}
        onCancel={() => setDel(null)}
      />

      {/* Force Delete Confirmation Modal (When Active Access Exists) */}
      <ConfirmationDialog
        open={!!del && forceDel}
        title="Delete despite active access?"
        message={`There are orders with active download access for "${del?.title}". Deleting it will permanently remove the book and its files. Continue only if you want to end that access.`}
        confirmLabel="Delete permanently"
        busy={busy}
        onConfirm={() => remove(true)}
        onCancel={() => setForceDel(false)}
      />
    </div>
  );
}