import { Link, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { ADMIN_PATHS } from '../../routes/adminRoutes.js';

export default function AdminHeader({ onMenu }) {
  const { admin } = useAuth();
  const { pathname } = useLocation();
  const titles = {
    [ADMIN_PATHS.dashboard]: 'Dashboard',
    [ADMIN_PATHS.catalogue]: 'Catalogue',
    [ADMIN_PATHS.categories]: 'Categories',
    [ADMIN_PATHS.orders]: 'Orders and access',
    [ADMIN_PATHS.enquiries]: 'Enquiries',
    [ADMIN_PATHS.settings]: 'Settings',
  };
  const title = pathname.startsWith(`${ADMIN_PATHS.catalogue}/`) ? (pathname.endsWith('/new') ? 'Add a book' : 'Edit book') : (titles[pathname] || 'Administration');
  return (
    <header className="flex h-16 items-center justify-between border-b border-line bg-white px-5 sm:px-8">
      <div className="flex items-center gap-4"><button className="lg:hidden" onClick={onMenu} aria-label="Open menu"><Menu size={22} /></button><p className="font-serif text-xl font-semibold">{title}</p></div>
      <div className="flex items-center gap-4"><Link to="/" target="_blank" className="hidden text-sm text-muted hover:text-blood sm:block">View site</Link><Link to={ADMIN_PATHS.settings} className="max-w-48 truncate border-l border-line pl-4 text-sm text-charcoal hover:text-blood" title={admin?.email}>{admin?.email}</Link></div>
    </header>
  );
}
