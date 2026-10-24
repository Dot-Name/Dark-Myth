import { Link } from 'react-router-dom';
import { ArrowDownRight, ArrowRight, BookOpen, ClipboardCheck, MessageSquare, Plus, RefreshCw, Tags } from 'lucide-react';
import api from '../services/api.js';
import useFetch from '../hooks/useFetch.js';
import ErrorState from '../components/common/ErrorState.jsx';
import { formatDate, formatPrice } from '../utils/format.js';
import { ADMIN_PATHS } from '../routes/adminRoutes.js';

const label = (value = '') => value.replaceAll('_', ' ').replace(/^./, (c) => c.toUpperCase());

const stats = [
  { key: 'published', label: 'Published books', to: ADMIN_PATHS.catalogue, icon: BookOpen, hint: 'Live in your catalogue' },
  { key: 'categories', label: 'Categories', to: ADMIN_PATHS.categories, icon: Tags, hint: 'Catalogue groupings' },
  { key: 'totalOrders', label: 'Recorded orders', to: ADMIN_PATHS.orders, icon: ClipboardCheck, hint: 'Order requests on file' },
  { key: 'pendingOrders', label: 'Orders to verify', to: ADMIN_PATHS.orders, icon: ClipboardCheck, hint: 'Payment needs review', alert: true },
  { key: 'newEnquiries', label: 'Unread enquiries', to: ADMIN_PATHS.enquiries, icon: MessageSquare, hint: 'Waiting for a reply', alert: true },
];

function Panel({ title, subtitle, to, linkText, children }) {
  return (
    <section className="border border-line bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div><h2 className="font-serif text-xl font-semibold">{title}</h2><p className="mt-0.5 text-xs text-muted">{subtitle}</p></div>
        <Link to={to} className="inline-flex shrink-0 items-center gap-1 text-sm text-blood hover:underline">{linkText}<ArrowRight size={15} /></Link>
      </div>
      {children}
    </section>
  );
}

function LoadingRows() {
  return <div className="space-y-3 p-5" aria-label="Loading"><div className="skeleton h-10 w-full" /><div className="skeleton h-10 w-full" /><div className="skeleton h-10 w-full" /></div>;
}

export default function AdminDashboard() {
  const dashboard = useFetch(() => api.get('/admin/dashboard'), []);
  const orders = useFetch(() => api.get('/admin/orders', { params: { page: 1, limit: 5 } }), []);
  const enquiries = useFetch(() => api.get('/admin/enquiries', { params: { page: 1, limit: 5 } }), []);
  const date = new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
  const refreshing = dashboard.loading || orders.loading || enquiries.loading;
  const refresh = () => { dashboard.reload(); orders.reload(); enquiries.reload(); };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-medium uppercase tracking-[.18em] text-blood">Overview · {date}</p><h1 className="heading-lg mt-2">Dashboard</h1><p className="mt-2 text-sm text-muted">A quick look at your catalogue, orders and customer messages.</p></div>
        <div className="flex gap-3"><button type="button" className="btn-outline" onClick={refresh} disabled={refreshing}><RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} /> Refresh</button><Link to={ADMIN_PATHS.newBook} className="btn-primary"><Plus size={17} /> Add a book</Link></div>
      </div>

      {dashboard.error && <ErrorState error={dashboard.error} onRetry={dashboard.reload} />}
      <section aria-label="Store overview" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map(({ key, label: title, to, icon: Icon, hint, alert }) => (
          <Link key={key} to={to} className="group border border-line bg-white p-5 transition-colors hover:border-blood">
            <div className="flex items-start justify-between"><span className={`flex h-9 w-9 items-center justify-center ${alert ? 'bg-blood/10 text-blood' : 'bg-ivory text-charcoal'}`}><Icon size={18} /></span><ArrowDownRight size={16} className="text-muted transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" /></div>
            <p className="mt-5 font-serif text-4xl font-semibold">{key === 'totalOrders' ? (orders.loading ? '—' : (orders.data?.pagination?.total ?? '—')) : dashboard.loading ? '—' : (dashboard.data?.[key] ?? '—')}</p>
            <p className="mt-1 text-sm font-medium text-charcoal">{title}</p><p className="mt-1 text-xs text-muted">{hint}</p>
          </Link>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Recent orders" subtitle="Latest orders recorded in your store" to={ADMIN_PATHS.orders} linkText="All orders">
          {orders.error ? <div className="p-5"><ErrorState error={orders.error} onRetry={orders.reload} /></div> : orders.loading ? <LoadingRows /> : orders.data?.items?.length ? (
            <ul className="divide-y divide-line">
              {orders.data.items.map((order) => <li key={order._id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 py-4">
                <div className="min-w-0"><p className="truncate text-sm font-medium">{order.customerName}</p><p className="mt-1 truncate text-xs text-muted">{order.book?.title || 'Deleted book'} · {formatDate(order.createdAt)}</p></div>
                <div className="flex items-center gap-3"><span className="text-sm font-medium">{formatPrice(order.amount)}</span><span className={`whitespace-nowrap px-2 py-1 text-xs ${order.paymentStatus === 'pending' ? 'bg-amber-50 text-amber-800' : 'bg-ivory text-charcoal'}`}>{label(order.paymentStatus)}</span></div>
              </li>)}
            </ul>
          ) : <p className="px-5 py-10 text-center text-sm text-muted">No orders recorded yet.</p>}
        </Panel>

        <Panel title="Recent enquiries" subtitle="Latest messages received through the contact form" to={ADMIN_PATHS.enquiries} linkText="All enquiries">
          {enquiries.error ? <div className="p-5"><ErrorState error={enquiries.error} onRetry={enquiries.reload} /></div> : enquiries.loading ? <LoadingRows /> : enquiries.data?.items?.length ? (
            <ul className="divide-y divide-line">
              {enquiries.data.items.map((enquiry) => <li key={enquiry._id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="truncate text-sm font-medium">{enquiry.subject}</p><p className="mt-1 text-xs text-muted">{enquiry.name} · {formatDate(enquiry.createdAt)}</p></div><span className={`shrink-0 px-2 py-1 text-xs ${enquiry.status === 'new' ? 'bg-blood/10 text-blood' : 'bg-ivory text-muted'}`}>{label(enquiry.status)}</span></div>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-charcoal">{enquiry.message}</p>
              </li>)}
            </ul>
          ) : <p className="px-5 py-10 text-center text-sm text-muted">You’re all caught up. No new enquiries.</p>}
        </Panel>
      </div>

      <section className="flex flex-wrap items-center justify-between gap-4 border border-line bg-white px-5 py-4">
        <div><h2 className="font-serif text-lg font-semibold">Quick actions</h2><p className="text-sm text-muted">Keep your catalogue and store up to date.</p></div>
        <div className="flex flex-wrap gap-3"><Link to={ADMIN_PATHS.categories} className="btn-outline">Manage categories</Link><Link to={ADMIN_PATHS.orders} className="btn-outline">Review orders</Link></div>
      </section>
    </div>
  );
}
