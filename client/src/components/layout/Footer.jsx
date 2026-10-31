import { Link } from 'react-router-dom';
import Logo from '../common/Logo.jsx';
import { ADMIN_PATHS } from '../../routes/adminRoutes.js';
import api from '../../services/api.js';
import useFetch from '../../hooks/useFetch.js';

export default function Footer() {
  const { data } = useFetch(() => api.get('/categories'), []);
  const cats = data?.items || [];
  const col = 'mb-3 font-serif text-lg text-ivory';
  const a = 'block py-1 text-sm text-stone hover:text-white';
  return (
    <footer className="mt-24 bg-ink text-stone">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo light />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-taupe">Indian horror books, haunted places, folklore and atmospheric colouring books.</p>
        </div>
        <div><h2 className={col}>Explore</h2><Link className={a} to="/catalogue">Catalogue</Link><Link className={a} to="/about">About</Link><Link className={a} to="/blog">Blog</Link><Link className={a} to="/contact">Contact</Link></div>
        <div className="md:col-span-1"><h2 className={col}>Categories</h2>{cats.map((c) => <Link key={c.id} className={a} to={`/catalogue?category=${c.slug}`}>{c.name}</Link>)}</div>
        <div><h2 className={col}>Legal</h2><Link className={a} to="/privacy">Privacy Policy</Link><Link className={a} to="/terms">Terms and Conditions</Link></div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-wrap items-center justify-between gap-2 py-5 text-xs text-taupe">
          <span>© {new Date().getFullYear()} Dark Myth. All rights reserved.</span>
          <Link to={ADMIN_PATHS.login} className="hover:text-white">Admin login</Link>
        </div>
      </div>
    </footer>
  );
}
