import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import useFetch from '../hooks/useFetch.js';
import { useAuth } from '../context/AuthContext.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import AdminPageHeader from '../components/admin/AdminPageHeader.jsx';
import { KeyRound, Mail, Store } from 'lucide-react';
import { ADMIN_PATHS } from '../routes/adminRoutes.js';

export default function AdminSettings() {
  const { admin, changePassword, refresh } = useAuth();
  const nav = useNavigate();
  const { data, loading, error, reload } = useFetch(() => api.get('/admin/settings'), []);
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwErr, setPwErr] = useState('');
  const [acct, setAcct] = useState({ accountEmail: '', currentPassword: '' });
  const [contact, setContact] = useState(null);
  const [busy, setBusy] = useState('');
  const c = contact || data;
  const box = 'space-y-5 border border-line bg-white p-5 sm:p-6';

  const savePw = async (e) => {
    e.preventDefault(); setPwErr('');
    if (pw.newPassword !== pw.confirm) return setPwErr('The new passwords do not match');
    setBusy('pw');
    try { await changePassword({ currentPassword: pw.currentPassword, newPassword: pw.newPassword }); toast.success('Password changed'); setPw({ currentPassword: '', newPassword: '', confirm: '' }); nav(ADMIN_PATHS.dashboard); }
    catch (x) { setPwErr(x.userMessage); } finally { setBusy(''); }
  };
  const save = async (body, key, done) => {
    setBusy(key);
    try { await api.patch('/admin/settings', body); toast.success('Saved'); await refresh(); reload(); done?.(); } catch (x) { toast.error(x.userMessage); } finally { setBusy(''); }
  };

  return (
    <div className="max-w-5xl space-y-6">
      <AdminPageHeader eyebrow="Workspace preferences" title="Settings" description="Manage your administrator account and the business details shown to customers." />
      {admin?.mustChangePassword && <p role="alert" className="flex items-start gap-3 border border-blood/30 bg-blood/5 p-4 text-sm text-blood"><KeyRound size={18} className="mt-0.5 shrink-0" />You are using the initial password. Choose a new one to unlock the rest of the admin panel.</p>}

      <form className={box} onSubmit={savePw}>
        <div className="flex items-start gap-3 border-b border-line pb-4"><span className="flex h-9 w-9 items-center justify-center bg-ivory text-blood"><KeyRound size={17} /></span><div><h2 className="font-serif text-xl font-semibold">Change password</h2><p className="mt-1 text-sm text-muted">Choose a strong password with at least 12 characters.</p></div></div>
        <div><label className="label" htmlFor="cp">Current password</label><input id="cp" type="password" autoComplete="current-password" required className="field" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} /></div>
        <div><label className="label" htmlFor="np">New password</label><input id="np" type="password" autoComplete="new-password" required minLength={12} className="field" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} /><p className="mt-1 text-xs text-muted">At least 12 characters, with upper and lower case letters, a number and a symbol.</p></div>
        <div><label className="label" htmlFor="rp">Confirm new password</label><input id="rp" type="password" autoComplete="new-password" required className="field" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} /></div>
        {pwErr && <p role="alert" className="text-sm text-blood">{pwErr}</p>}
        <button className="btn-primary" disabled={busy === 'pw'}>{busy === 'pw' ? 'Saving…' : 'Change password'}</button>
      </form>

      {!admin?.mustChangePassword && (
        <>
          <form className={box} onSubmit={(e) => { e.preventDefault(); save(acct, 'acct', () => setAcct({ accountEmail: '', currentPassword: '' })); }}>
            <div className="flex items-start gap-3 border-b border-line pb-4"><span className="flex h-9 w-9 items-center justify-center bg-ivory text-blood"><Mail size={17} /></span><div><h2 className="font-serif text-xl font-semibold">Account email</h2><p className="mt-1 text-sm text-muted">Signed in as {admin?.email}</p></div></div>
            <div><label className="label" htmlFor="ae">New email</label><input id="ae" type="email" required className="field" value={acct.accountEmail} onChange={(e) => setAcct({ ...acct, accountEmail: e.target.value })} /></div>
            <div><label className="label" htmlFor="ac">Current password</label><input id="ac" type="password" required className="field" value={acct.currentPassword} onChange={(e) => setAcct({ ...acct, currentPassword: e.target.value })} /></div>
            <button className="btn-primary" disabled={busy === 'acct'}>Update email</button>
          </form>

          {error && <ErrorState error={error} onRetry={reload} />}
          {!loading && c && (
            <form className={box} onSubmit={(e) => { e.preventDefault(); save({ contactEmail: c.contactEmail, contactPhone: c.contactPhone, address: c.address }, 'contact'); }}>
              <div className="flex items-start gap-3 border-b border-line pb-4"><span className="flex h-9 w-9 items-center justify-center bg-ivory text-blood"><Store size={17} /></span><div><h2 className="font-serif text-xl font-semibold">Business contact details</h2><p className="mt-1 text-sm text-muted">Shown on your public Contact page.</p></div></div>
              <p className="border border-line bg-ivory px-3 py-2.5 text-xs text-muted">WhatsApp number: {data.whatsappNumber ? `+${data.whatsappNumber}` : 'Not configured on the server.'}</p>
              <div><label className="label" htmlFor="ce">Contact email</label><input id="ce" type="email" className="field" value={c.contactEmail} onChange={(e) => setContact({ ...c, contactEmail: e.target.value })} /></div>
              <div><label className="label" htmlFor="ph">Phone</label><input id="ph" className="field" value={c.contactPhone} onChange={(e) => setContact({ ...c, contactPhone: e.target.value })} /></div>
              <div><label className="label" htmlFor="ad">Address</label><textarea id="ad" rows={3} className="field" value={c.address} onChange={(e) => setContact({ ...c, address: e.target.value })} /></div>
              <button className="btn-primary" disabled={busy === 'contact'}>Save details</button>
            </form>
          )}
        </>
      )}
    </div>
  );
}
