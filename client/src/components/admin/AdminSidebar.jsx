// src/components/admin/AdminSidebar.jsx
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Tags, 
  ClipboardCheck, 
  MessageSquare, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { ADMIN_PATHS } from '../../routes/adminRoutes.js';

const navItems = [
  { label: 'Dashboard', to: ADMIN_PATHS.dashboard, icon: LayoutDashboard, end: true },
  { label: 'Catalogue', to: ADMIN_PATHS.catalogue, icon: BookOpen },
  { label: 'Categories', to: ADMIN_PATHS.categories, icon: Tags },
  { label: 'Orders', to: ADMIN_PATHS.orders, icon: ClipboardCheck },
  { label: 'Enquiries', to: ADMIN_PATHS.enquiries, icon: MessageSquare },
  { label: 'Settings', to: ADMIN_PATHS.settings, icon: Settings },
];

export default function AdminSidebar({ onLogout }) {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-line bg-white">
      {/* Brand Header */}
      <div className="flex h-16 items-center border-b border-line px-6">
        <span className="font-serif text-lg font-bold tracking-tight text-ink">
          Admin Portal
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map(({ label, to, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-ink text-ivory'
                  : 'text-charcoal hover:bg-stone/50 hover:text-ink'
              }`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout Action */}
      <div className="border-t border-line p-4">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium text-blood hover:bg-blood/5 rounded-md transition-colors"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}