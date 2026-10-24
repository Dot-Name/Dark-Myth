import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,
});

// CSRF token lives in memory only (never localStorage); the JWT itself is an HTTP-only cookie.
let csrfToken = '';
export const setCsrfToken = (t) => { csrfToken = t || ''; };

api.interceptors.request.use((config) => {
  if (csrfToken && !['get', 'head', 'options'].includes((config.method || 'get').toLowerCase())) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res.data.data,
  (err) => {
    err.userMessage = err.response?.data?.message || (err.request ? 'Cannot reach the server. Check your connection and try again.' : 'Something went wrong.');
    err.code = err.response?.data?.code;
    if (err.response?.status === 401 && err.config?.url?.includes('/admin/') && !err.config.url.includes('/admin/auth/login')) {
      window.dispatchEvent(new Event('admin:unauthorized'));
    }
    return Promise.reject(err);
  }
);

export const toFormData = (obj) => {
  const fd = new FormData();
  Object.entries(obj).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (Array.isArray(v) && v[0] instanceof File) v.forEach((f) => fd.append(k, f));
    else if (Array.isArray(v)) fd.append(k, JSON.stringify(v));
    else fd.append(k, v);
  });
  return fd;
};

export default api;
