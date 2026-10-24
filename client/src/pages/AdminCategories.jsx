import { useState } from 'react';
import { FolderPlus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { toFormData } from '../services/api.js';
import useFetch from '../hooks/useFetch.js';
import DataTable from '../components/common/DataTable.jsx';
import CategoryForm from '../components/admin/CategoryForm.jsx';
import ConfirmationDialog from '../components/common/ConfirmationDialog.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import AdminPageHeader from '../components/admin/AdminPageHeader.jsx';

export default function AdminCategories() {
  const { data, loading, error, reload } = useFetch(() => api.get('/admin/categories'), []);
  const [editing, setEditing] = useState(null); // {} for new, category for edit
  const [del, setDel] = useState(null);
  const [target, setTarget] = useState('');
  const [busy, setBusy] = useState(false);
  const items = data?.items || [];

  const save = async (v) => {
    setBusy(true);
    try {
      const body = toFormData(v);
      if (editing.id) await api.patch(`/admin/categories/${editing.id}`, body); else await api.post('/admin/categories', body);
      toast.success(editing.id ? 'Category saved' : 'Category created'); setEditing(null); reload();
    } catch (e) { toast.error(e.userMessage); } finally { setBusy(false); }
  };
  const remove = async () => {
    setBusy(true);
    try { await api.delete(`/admin/categories/${del.id}`, { params: target ? { reassignTo: target } : {} }); toast.success('Category deleted'); setDel(null); setTarget(''); reload(); }
    catch (e) { toast.error(e.userMessage); } finally { setBusy(false); }
  };

  const columns = [
    { key: 'name', header: 'Name', render: (c) => <div><p className="font-medium">{c.name}</p><p className="text-xs text-muted">/{c.slug}</p></div> },
    { key: 'displayOrder', header: 'Order' },
    { key: 'productCount', header: 'Published books' },
    { key: 'isActive', header: 'Status', render: (c) => <span className={`inline-flex items-center gap-2 text-xs ${c.isActive ? 'text-emerald-800' : 'text-muted'}`}><span className={`h-1.5 w-1.5 rounded-full ${c.isActive ? 'bg-emerald-600' : 'bg-stone'}`} />{c.isActive ? 'Active' : 'Inactive'}</span> },
    { key: 'a', header: 'Actions', render: (c) => (<div className="flex gap-3"><button aria-label={`Edit ${c.name}`} onClick={() => setEditing(c)}><Pencil size={16} /></button><button aria-label={`Delete ${c.name}`} className="text-blood" onClick={() => { setDel(c); setTarget(''); }}><Trash2 size={16} /></button></div>) },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow="Catalogue structure" title="Categories" description="Organize books into the sections customers browse on your site." action={<button className="btn-primary" onClick={() => setEditing({})}><FolderPlus size={17} /> Add a category</button>} />
      {!error && <div className="grid gap-3 sm:grid-cols-3">
        <div className="border border-line bg-white p-4"><p className="text-xs uppercase tracking-wider text-muted">Total categories</p><p className="mt-2 font-serif text-3xl font-semibold">{loading ? '—' : items.length}</p></div>
        <div className="border border-line bg-white p-4"><p className="text-xs uppercase tracking-wider text-muted">Active on site</p><p className="mt-2 font-serif text-3xl font-semibold">{loading ? '—' : items.filter((c) => c.isActive).length}</p></div>
        <div className="border border-line bg-white p-4"><p className="text-xs uppercase tracking-wider text-muted">Published books</p><p className="mt-2 font-serif text-3xl font-semibold">{loading ? '—' : items.reduce((n, c) => n + c.productCount, 0)}</p></div>
      </div>}
      <section className="border border-line bg-white">
        <div className="flex items-center justify-between border-b border-line px-5 py-4"><div><h2 className="font-serif text-xl font-semibold">All categories</h2><p className="mt-0.5 text-xs text-muted">Display order controls their order in the catalogue.</p></div><span className="text-xs text-muted">{loading ? 'Loading…' : `${items.length} total`}</span></div>
        {error ? <div className="p-5"><ErrorState error={error} onRetry={reload} /></div> : <DataTable columns={columns} rows={items} empty={loading ? 'Loading…' : 'No categories yet. Add your first category to get started.'} />}
      </section>
      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/60 p-4" onClick={() => setEditing(null)}>
          <div role="dialog" aria-modal="true" aria-label="Category" className="my-8 w-full max-w-lg bg-ivory p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-4 text-2xl font-semibold">{editing.id ? 'Edit category' : 'New category'}</h2>
            <CategoryForm initial={editing.id ? editing : null} onSubmit={save} onCancel={() => setEditing(null)} busy={busy} />
          </div>
        </div>
      )}
      <ConfirmationDialog open={!!del} title={`Delete "${del?.name}"?`} message="If this category still contains books, choose a destination category. The server will keep the category if reassignment is required and no destination is selected." busy={busy} onConfirm={remove} onCancel={() => setDel(null)}>
        <div className="mt-4"><label className="label" htmlFor="mv">Move its books to</label>
          <select id="mv" className="field" value={target} onChange={(e) => setTarget(e.target.value)}><option value="">Choose only if books need moving</option>{items.filter((c) => c.id !== del?.id).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
      </ConfirmationDialog>
    </div>
  );
}
