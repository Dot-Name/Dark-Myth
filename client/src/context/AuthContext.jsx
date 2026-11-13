import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api, { setCsrfToken } from '../services/api.js';

const AuthContext = createContext(null);
const ADMIN_SESSION_HINT = 'dark-myth-admin-session';
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const { pathname } = useLocation();

  const apply = useCallback((d) => {
    setCsrfToken(d?.csrfToken);
    setAdmin(d?.admin || null);
    if (d?.admin) window.localStorage.setItem(ADMIN_SESSION_HINT, '1');
    else window.localStorage.removeItem(ADMIN_SESSION_HINT);
    return d;
  }, []);

  useEffect(() => {
    // Only probe the session when an admin route is open; public visitors never hit the auth API.
    if (!pathname.startsWith('/admin') && window.localStorage.getItem(ADMIN_SESSION_HINT) !== '1') { setLoading(false); return; }
    api.get('/admin/auth/me').then(apply).catch(() => apply(null)).finally(() => setLoading(false));
  }, [apply, pathname]);

  useEffect(() => {
    const expire = () => apply(null);
    window.addEventListener('admin:unauthorized', expire);
    return () => window.removeEventListener('admin:unauthorized', expire);
  }, [apply]);

  const value = useMemo(() => ({
    admin, loading,
    login: (email, password) => api.post('/admin/auth/login', { email, password }).then(apply),
    changePassword: (body) => api.post('/admin/auth/change-password', body).then(apply),
    logout: async () => { try { await api.post('/admin/auth/logout'); } finally { apply(null); } },
    refresh: () => api.get('/admin/auth/me').then(apply),
  }), [admin, loading, apply]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
