import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import useFetch from '../hooks/useFetch.js';
import DataTable from '../components/common/DataTable.jsx';
import Pagination from '../components/common/Pagination.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import { formatDate, formatPrice } from '../utils/format.js';
import AdminPageHeader from '../components/admin/AdminPageHeader.jsx';
import { ClipboardPlus } from 'lucide-react';

const PAY = ['pending', 'verified', 'rejected', 'refunded'];
const ORD = ['awaiting_verification', 'completed', 'cancelled'];
const label = (s) => s.replace('_', ' ').replace(/^./, (c) => c.toUpperCase());

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/60 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} className="my-8 w-full max-w-lg bg-ivory p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-4 text-2xl font-semibold">{title}</h2>{children}
      </div>
    </div>
  );
}

export default function AdminOrders() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const { data, loading, error, reload } = useFetch(() => api.get('/admin/orders', { params: { page, status: status || undefined } }), [page, status]);
  const books = useFetch(() => api.get('/admin/books', { params: { limit: 48 } }), []);
  const [creating, setCreating] = useState(false);
  const [manage, setManage] = useState(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [nf, setNf] = useState({ book: '', customerName: '', customerContact: '', customerEmail: '', amount: '' });
  const [mf, setMf] = useState({});

  const create = async (e) => {
    e.preventDefault(); setBusy(true);
    try { await api.post('/admin/orders', nf); toast.success('Order recorded'); setCreating(false); setNf({ book: '', customerName: '', customerContact: '', customerEmail: '', amount: '' }); reload(); }
    catch (x) { toast.error(x.userMessage); } finally { setBusy(false); }
  };
  const save = async (extra = {}) => {
    setBusy(true);
    try {
      const r = await api.patch(`/admin/orders/${manage._id}`, { paymentStatus: mf.paymentStatus, orderStatus: mf.orderStatus, verificationNotes: mf.verificationNotes, ...extra });
      toast.success('Order updated'); reload();
      if (r.accessCode) setCode(r.accessCode);
      setManage(r.accessCode ? null : { ...manage, ...r.order });
      if (!r.accessCode && extra.access !== 'revoke') setManage(null);
    } catch (x) { toast.error(x.userMessage); } finally { setBusy(false); }
  };
  const open = (o) => { setManage(o); setMf({ paymentStatus: o.paymentStatus, orderStatus: o.orderStatus, verificationNotes: o.verificationNotes || '' }); };

  const columns = [
    { key: 'book', header: 'Book', render: (o) => o.book?.title || 'Deleted book' },
    { key: 'customer', header: 'Customer', render: (o) => <div><p>{o.customerName}</p><p className="text-xs text-muted">{o.customerContact}</p></div> },
    { key: 'amount', header: 'Amount', render: (o) => formatPrice(o.amount) },
    { key: 'paymentStatus', header: 'Payment', render: (o) => label(o.paymentStatus) },
    { key: 'accessStatus', header: 'Access', render: (o) => label(o.accessStatus) },
    { key: 'createdAt', header: 'Created', render: (o) => formatDate(o.createdAt) },
    { key: 'a', header: '', render: (o) => <button className="underline" onClick={() => open(o)}>Manage</button> },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow="Sales & fulfillment" title="Orders and access" description="Review payments, manage digital access and record orders." action={<button className="btn-primary" onClick={() => setCreating(true)}><ClipboardPlus size={17} /> Record an order</button>} />
      <div className="flex items-start gap-3 border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"><ClipboardPlus size={17} className="mt-0.5 shrink-0" /><p>Confirm payment against your records before marking it verified. Verified orders can then receive a one-time access code.</p></div>
      <section className="border border-line bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4"><div><h2 className="font-serif text-xl font-semibold">Order register</h2><p className="mt-0.5 text-xs text-muted">{loading ? 'Loading orders…' : `${data?.pagination?.total ?? 0} matching orders`}</p></div><div><label className="sr-only" htmlFor="os">Payment status</label><select id="os" className="field w-auto min-w-48" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}><option value="">All payment statuses</option>{PAY.map((p) => <option key={p} value={p}>{label(p)}</option>)}</select></div></div>
      {error ? <div className="p-5"><ErrorState error={error} onRetry={reload} /></div> : <DataTable columns={columns} rows={loading ? [] : (data?.items || [])} empty={loading ? 'Loading…' : 'No orders match this status.'} />}
      </section>
      {data && <Pagination pagination={data.pagination} onPage={setPage} />}

      {creating && (
        <Modal title="Record an order" onClose={() => setCreating(false)}>
          <form className="space-y-4" onSubmit={create}>
            <div><label className="label" htmlFor="ob">Book</label><select id="ob" required className="field" value={nf.book} onChange={(e) => { const b = books.data?.items.find((x) => x.id === e.target.value); setNf({ ...nf, book: e.target.value, amount: b ? b.price : nf.amount }); }}><option value="">Select a book</option>{books.data?.items.filter((b) => !b.isFree).map((b) => <option key={b.id} value={b.id}>{b.title}</option>)}</select></div>
            <div><label className="label" htmlFor="on">Customer name</label><input id="on" required className="field" value={nf.customerName} onChange={(e) => setNf({ ...nf, customerName: e.target.value })} /></div>
            <div><label className="label" htmlFor="oc">WhatsApp or phone</label><input id="oc" required className="field" value={nf.customerContact} onChange={(e) => setNf({ ...nf, customerContact: e.target.value })} /></div>
            <div><label className="label" htmlFor="oe">Email (optional)</label><input id="oe" type="email" className="field" value={nf.customerEmail} onChange={(e) => setNf({ ...nf, customerEmail: e.target.value })} /></div>
            <div><label className="label" htmlFor="oa">Amount (₹)</label><input id="oa" type="number" min={0} required className="field" value={nf.amount} onChange={(e) => setNf({ ...nf, amount: e.target.value })} /></div>
            <div className="flex justify-end gap-3"><button type="button" className="btn-outline" onClick={() => setCreating(false)}>Cancel</button><button className="btn-primary" disabled={busy}>Save order</button></div>
          </form>
        </Modal>
      )}

      {manage && (
        <Modal title={`Order for ${manage.customerName}`} onClose={() => setManage(null)}>
          <div className="space-y-4">
            <p className="text-sm text-muted">{manage.book?.title} · {formatPrice(manage.amount)} · Downloads used: {manage.downloadCount}/{manage.maxDownloads}</p>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label" htmlFor="mp">Payment</label><select id="mp" className="field" value={mf.paymentStatus} onChange={(e) => setMf({ ...mf, paymentStatus: e.target.value })}>{PAY.map((p) => <option key={p} value={p}>{label(p)}</option>)}</select></div>
              <div><label className="label" htmlFor="mo">Order</label><select id="mo" className="field" value={mf.orderStatus} onChange={(e) => setMf({ ...mf, orderStatus: e.target.value })}>{ORD.map((p) => <option key={p} value={p}>{label(p)}</option>)}</select></div>
            </div>
            <div><label className="label" htmlFor="mn">Verification notes</label><textarea id="mn" rows={3} className="field" value={mf.verificationNotes} onChange={(e) => setMf({ ...mf, verificationNotes: e.target.value })} placeholder="e.g. UPI reference checked on bank statement" /></div>
            <div className="flex flex-wrap justify-between gap-3">
              <div className="flex gap-2">
                <button className="btn-outline" disabled={busy || mf.paymentStatus !== 'verified' || !manage.book} onClick={async () => { await save(); await save({ access: 'grant', accessDays: 30 }); }} title={mf.paymentStatus !== 'verified' ? 'Set payment to Verified first' : ''}>Grant 30-day access</button>
                {manage.accessStatus === 'granted' && <button className="btn-outline" disabled={busy} onClick={() => save({ access: 'revoke' })}>Revoke</button>}
              </div>
              <button className="btn-primary" disabled={busy} onClick={() => save()}>Save</button>
            </div>
          </div>
        </Modal>
      )}

      {code && (
        <Modal title="Access code created" onClose={() => setCode('')}>
          <p className="text-sm">This code is shown once. Send it to the customer with the link to the book page; they enter it under "I already have an access code".</p>
          <p className="my-4 break-all border border-line bg-white p-3 font-mono text-sm">{code}</p>
          <div className="flex justify-end gap-3"><button className="btn-outline" onClick={() => { navigator.clipboard.writeText(code); toast.success('Copied'); }}>Copy code</button><button className="btn-primary" onClick={() => setCode('')}>Done</button></div>
        </Modal>
      )}
    </div>
  );
}
