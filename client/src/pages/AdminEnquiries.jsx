import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import useFetch from '../hooks/useFetch.js';
import Pagination from '../components/common/Pagination.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { formatDate } from '../utils/format.js';
import AdminPageHeader from '../components/admin/AdminPageHeader.jsx';
import { Mail, MessageSquare } from 'lucide-react';

export default function AdminEnquiries() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState('');
  const { data, loading, error, reload } = useFetch(() => api.get('/admin/enquiries', { params: { page, status: status || undefined } }), [page, status]);
  const setS = async (id, s) => { setSaving(id); try { await api.patch(`/admin/enquiries/${id}`, { status: s }); toast.success('Enquiry updated'); reload(); } catch (e) { toast.error(e.userMessage); } finally { setSaving(''); } };

  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow="Customer messages" title="Enquiries" description="Read messages sent through the contact form and keep their status up to date." />
      <section className="border border-line bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center bg-ivory text-blood"><MessageSquare size={17} /></span><div><h2 className="font-serif text-xl font-semibold">Inbox</h2><p className="text-xs text-muted">{loading ? 'Loading messages…' : `${data?.pagination?.total ?? 0} ${status || 'total'} enquiries`}</p></div></div><div><label htmlFor="es" className="sr-only">Filter by status</label><select id="es" className="field w-auto min-w-40" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}><option value="">All statuses</option><option value="new">New</option><option value="read">Read</option><option value="resolved">Resolved</option></select></div></div>
        {error ? <div className="p-5"><ErrorState error={error} onRetry={reload} /></div> : loading ? <div className="space-y-3 p-5" role="status"><div className="skeleton h-28 w-full" /><div className="skeleton h-28 w-full" /></div> : data?.items?.length ? <ul className="divide-y divide-line">
        {data.items.map((e) => (
          <li key={e._id} className="px-5 py-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex min-w-0 gap-3"><span className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center ${e.status === 'new' ? 'bg-blood/10 text-blood' : 'bg-ivory text-muted'}`}><Mail size={15} /></span><div className="min-w-0"><h3 className="truncate font-serif text-lg font-semibold">{e.subject}</h3><p className="mt-1 text-sm text-charcoal">{e.name} <span className="text-muted">·</span> <a className="text-blood hover:underline" href={`mailto:${e.email}`}>{e.email}</a></p><p className="mt-1 text-xs text-muted">Received {formatDate(e.createdAt)}</p></div></div>
              <div className="shrink-0"><label className="sr-only" htmlFor={`s-${e._id}`}>Status for {e.subject}</label><select id={`s-${e._id}`} disabled={saving === e._id} className="field w-auto min-w-36" value={e.status} onChange={(ev) => setS(e._id, ev.target.value)}><option value="new">New</option><option value="read">Read</option><option value="resolved">Resolved</option></select></div>
            </div>
            <p className="mt-4 whitespace-pre-line border-l-2 border-line pl-11 text-sm leading-relaxed text-charcoal">{e.message}</p>
          </li>
        ))}
      </ul> : <EmptyState title="No enquiries here"><span>{status ? `There are no ${status} messages.` : 'Messages from the contact form will appear here.'}</span></EmptyState>}
      </section>
      {data && <Pagination pagination={data.pagination} onPage={setPage} />}
    </div>
  );
}
