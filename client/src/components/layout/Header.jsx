import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ChevronDown, Menu, Search, X } from 'lucide-react';
import Logo from '../common/Logo.jsx';
import api from '../../services/api.js';
import useFetch from '../../hooks/useFetch.js';

const link = ({ isActive }) => `site-nav-link py-2 text-sm transition-colors hover:text-blood ${isActive ? 'is-active text-blood' : 'text-ink'}`;

export default function Header() {
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const [q, setQ] = useState('');
  const nav = useNavigate();
  const { data } = useFetch(() => api.get('/categories'), []);
  const cats = data?.items || [];

  const submit = (e) => {
    e.preventDefault();
    nav(`/catalogue${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`);
    setSearching(false); setOpen(false); setMobileCategoriesOpen(false);
  };

  return (
    <header className="site-header sticky top-0 z-40 border-b border-line bg-ivory/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4 sm:h-[4.5rem] lg:gap-6">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-7 lg:flex xl:gap-9">
          <NavLink to="/" end className={link}>Home</NavLink>
          <NavLink to="/catalogue" end className={link}>Catalogue</NavLink>
          <div className="group relative">
            <button className="site-nav-link flex items-center gap-1 py-2 text-sm text-ink transition-colors hover:text-blood" aria-haspopup="true">Categories <ChevronDown size={14} aria-hidden="true" className="transition-transform group-hover:rotate-180 group-focus-within:rotate-180" /></button>
            <div className="invisible absolute left-0 top-[calc(100%+0.5rem)] w-64 translate-y-1 border border-line bg-white p-2 opacity-0 shadow-[0_18px_45px_rgba(24,22,20,.14)] transition duration-200 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
              {cats.length === 0 && <p className="px-3 py-2 text-sm text-muted">No categories yet</p>}
              {cats.map((c) => <Link key={c.id} to={`/catalogue?category=${c.slug}`} className="block px-3 py-2 text-sm hover:bg-ivory hover:text-blood">{c.name}</Link>)}
            </div>
          </div>
          <NavLink to="/about" className={link}>About</NavLink>
          <NavLink to="/blog" className={link}>Blog</NavLink>
          <NavLink to="/contact" className={link}>Contact</NavLink>
        </nav>
        <div className="flex items-center gap-2">
          <form onSubmit={submit} className="hidden items-center border border-line/80 bg-white/80 transition-colors focus-within:border-ink sm:flex" role="search">
            <label htmlFor="hdr-search-desktop" className="sr-only">Search the catalogue</label>
            <input id="hdr-search-desktop" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search books" className="w-32 bg-transparent px-3 py-2 text-sm placeholder:text-muted/70 focus:outline-none lg:w-40" />
            <button type="submit" aria-label="Search" className="px-3 py-2 text-muted transition-colors hover:text-blood"><Search size={16} /></button>
          </form>
          <button className="site-icon-button sm:hidden" aria-label={searching ? 'Close search' : 'Open search'} aria-expanded={searching} onClick={() => { setSearching((s) => !s); setOpen(false); }}>
            {searching ? <X size={20} /> : <Search size={20} />}
          </button>
          <button className="site-icon-button lg:hidden" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => { setOpen((o) => !o); setSearching(false); }}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      {searching && (
        <div className="site-mobile-search border-t border-line px-5 py-3 sm:hidden">
          <form onSubmit={submit} className="flex items-center border border-line bg-white" role="search">
            <label htmlFor="hdr-search-mobile" className="sr-only">Search the catalogue</label>
            <input id="hdr-search-mobile" autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search books" className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm placeholder:text-muted/70 focus:outline-none" />
            <button type="submit" aria-label="Search" className="px-3 py-2.5 text-muted transition-colors hover:text-blood"><Search size={17} /></button>
          </form>
        </div>
      )}
      {open && (
        <nav aria-label="Mobile" className="site-mobile-menu border-t border-line bg-ivory lg:hidden">
          <div className="container-page flex flex-col py-3">
            <NavLink to="/" end className={link} onClick={() => setOpen(false)}>Home</NavLink>
            <NavLink to="/catalogue" end className={link} onClick={() => setOpen(false)}>Catalogue</NavLink>
            <button className="flex items-center justify-between py-2 text-left text-sm text-ink transition-colors hover:text-blood" aria-expanded={mobileCategoriesOpen} onClick={() => setMobileCategoriesOpen((value) => !value)}>
              Categories <ChevronDown size={15} className={`transition-transform ${mobileCategoriesOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>
            {mobileCategoriesOpen && <div className="mb-2 ml-2 border-l border-line pl-3">
              {cats.length === 0 && <p className="py-2 text-sm text-muted">No categories yet</p>}
              {cats.map((c) => <Link key={c.id} to={`/catalogue?category=${c.slug}`} onClick={() => setOpen(false)} className="block py-2 text-sm text-muted transition-colors hover:text-blood">{c.name}</Link>)}
            </div>}
            <NavLink to="/about" className={link} onClick={() => setOpen(false)}>About</NavLink>
            <NavLink to="/blog" className={link} onClick={() => setOpen(false)}>Blog</NavLink>
            <NavLink to="/contact" className={link} onClick={() => setOpen(false)}>Contact</NavLink>
          </div>
        </nav>
      )}
    </header>
  );
}
