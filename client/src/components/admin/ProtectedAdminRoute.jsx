// src/components/admin/ProtectedAdminRoute.jsx
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api.js';
import useFetch from '../../hooks/useFetch.js';
import AdminSidebar from './AdminSidebar.jsx';
import { ADMIN_PATHS } from '../../routes/adminRoutes.js';

export default function ProtectedAdminRoute() {
  const navigate = useNavigate();
  const { data: user, loading, error } = useFetch(() => api.get('/admin/auth/me'), []);

  const handleLogout = async () => {
    try {
      await api.post('/admin/auth/logout');
      toast.success('Logged out successfully');
      navigate(ADMIN_PATHS.login);
    } catch {
      toast.error('Failed to log out');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-ivory">
        <div className="text-sm font-medium text-muted">Authenticating...</div>
      </div>
    );
  }

  if (error || !user) {
    return <Navigate to={ADMIN_PATHS.login} replace />;
  }

  return (
    <div className="flex h-screen bg-stone-50/50">
      {/* Sidebar */}
      <AdminSidebar onLogout={handleLogout} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}