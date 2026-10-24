import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { setCsrfToken } from '../services/api.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const apply = useCallback((d) => { setCsrfToken(d?.csrfToken); setAdmin(d?.admin || null); return d; }, []);

  useEffect(() => {
    // Only probe the session when an admin route is open; public visitors never hit the auth API.
    if (!window.location.pathname.startsWith('/admin')) { setLoading(false); return; }
    api.get('/admin/auth/me').then(apply).catch(() => apply(null)).finally(() => setLoading(false));
  }, [apply]);

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
