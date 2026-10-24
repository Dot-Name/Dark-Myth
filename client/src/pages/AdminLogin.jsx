import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, LockKeyhole } from 'lucide-react';
import Logo from '../components/common/Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import useSeo from '../hooks/useSeo.js';
import heroImage from '../assets/hero.webp';
import { ADMIN_PATHS } from '../routes/adminRoutes.js';

export default function AdminLogin() {
  useSeo({ title: 'Admin login', noindex: true });
  const { admin, loading, login } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!loading && admin) return <Navigate to={admin.mustChangePassword ? ADMIN_PATHS.settings : ADMIN_PATHS.dashboard} replace />;

  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setError('');
    try {
      const d = await login(email, password);
      const requestedPath = location.state?.from;
      const destination = typeof requestedPath === 'string' && requestedPath.startsWith(`${ADMIN_PATHS.dashboard}/`) && requestedPath !== ADMIN_PATHS.login ? requestedPath : ADMIN_PATHS.dashboard;
      nav(d.admin.mustChangePassword ? ADMIN_PATHS.settings : destination, { replace: true });
    }
    catch (x) { setError(x.userMessage); } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-ivory lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      <aside className="login-visual relative hidden min-h-screen overflow-hidden bg-ink p-12 text-ivory lg:flex lg:flex-col lg:justify-between xl:p-16">
        <img src={heroImage} alt="" aria-hidden="true" className="login-visual-image absolute inset-0 h-full w-full object-cover" />
        <div className="login-visual-shade absolute inset-0" aria-hidden="true" />
        <div className="login-brand relative"><Logo light /><p className="mt-2 text-xs uppercase tracking-[0.24em] text-stone">The story continues behind the veil</p></div>
        <div className="relative max-w-lg py-16">
          <p className="login-kicker mb-5 flex items-center gap-3 text-xs uppercase tracking-[0.24em] text-stone"><span className="h-px w-8 bg-taupe" />Private archive</p>
          <h1 className="login-headline font-serif text-5xl font-semibold leading-[1.05] text-ivory xl:text-6xl">Every legend has a keeper.</h1>
          <p className="login-copy mt-6 max-w-md leading-relaxed text-stone">Sign in to manage the Dark Myth catalogue, orders and stories waiting to be told.</p>
        </div>
        <p className="relative text-xs tracking-[0.16em] text-stone">DARK MYTH <span className="mx-2">/</span> ADMINISTRATION</p>
      </aside>

      <main className="flex min-h-screen flex-col px-5 py-6 sm:px-8 lg:justify-center lg:px-12 xl:px-20">
        <Link to="/" className="inline-flex w-fit items-center gap-2 text-sm text-muted transition-colors hover:text-blood"><ArrowLeft size={16} aria-hidden="true" />Back to the store</Link>
        <form onSubmit={submit} className="login-form mx-auto my-auto w-full max-w-md border border-line bg-white p-7 shadow-soft sm:p-10 lg:my-0">
          <div className="mb-8">
            <div className="mb-5 flex h-11 w-11 items-center justify-center border border-line bg-ivory text-blood"><LockKeyhole size={19} strokeWidth={1.7} aria-hidden="true" /></div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blood">Administrator access</p>
            <h2 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">Welcome back.</h2>
            <p className="mt-2 text-sm text-muted">Sign in to continue to your workspace.</p>
          </div>
          <div className="space-y-5">
            <div><label className="label" htmlFor="em">Email address</label><input id="em" type="email" className="field" required autoComplete="username" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div><label className="label" htmlFor="pw">Password</label><input id="pw" type="password" className="field" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
            {error && <p role="alert" className="border border-blood/20 bg-blood/5 px-3 py-2.5 text-sm text-blood">{error}</p>}
            <button className="btn-primary w-full justify-between" disabled={busy || loading}>{busy ? 'Signing in…' : loading ? 'Checking session…' : 'Sign in'}{!busy && !loading && <ArrowRight size={16} aria-hidden="true" />}</button>
          </div>
          <p className="mt-6 border-t border-line pt-5 text-xs leading-relaxed text-muted">Your session is protected with a secure, server-managed sign-in.</p>
        </form>
      </main>
    </div>
  );
}
