import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { toFormData } from '../services/api.js';
import useFetch from '../hooks/useFetch.js';
import BookForm from '../components/admin/BookForm.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import { ADMIN_PATHS } from '../routes/adminRoutes.js';

export default function AdminBookForm() {
  const { id } = useParams();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const cats = useFetch(() => api.get('/admin/categories'), []);
  const book = useFetch(() => (id ? api.get(`/admin/books/${id}`) : Promise.resolve(null)), [id]);

  const save = async (values) => {
    setBusy(true); setErr('');
    try {
      const body = toFormData(values);
      if (id) await api.patch(`/admin/books/${id}`, body); else await api.post('/admin/books', body);
      toast.success(id ? 'Changes saved' : 'Book created');
      nav(ADMIN_PATHS.catalogue);
    } catch (e) { setErr(e.userMessage); toast.error(e.userMessage); window.scrollTo({ top: 0 }); } finally { setBusy(false); }
  };

  if (cats.error || book.error) return <ErrorState error={cats.error || book.error} onRetry={() => { cats.reload(); book.reload(); }} />;
  if (cats.loading || book.loading) return <div className="skeleton h-96 w-full" />;
  return (
    <div>
      <h1 className="heading-lg mb-6">{id ? 'Edit book' : 'Add a book'}</h1>
      {cats.data.items.length === 0 && <p className="mb-4 border border-blood/40 bg-white p-3 text-sm text-blood">Create a category first, then add books to it.</p>}
      <BookForm initial={book.data} categories={cats.data.items} onSubmit={save} busy={busy} error={err} />
    </div>
  );
}
