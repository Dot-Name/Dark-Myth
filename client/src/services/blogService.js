import api from './api.js';

export const blogService = {
  list: (params = {}) => api.get('/blogs', { params }),
  search: (params = {}) => api.get('/blogs/search', { params }),
  featured: () => api.get('/blogs/featured'),
  detail: (slug) => api.get(`/blogs/${encodeURIComponent(slug)}`),
  related: (slug) => api.get(`/blogs/${encodeURIComponent(slug)}/related`),
  trackView: (slug) => api.post(`/blogs/${encodeURIComponent(slug)}/view`),
  adminList: (params = {}) => api.get('/admin/blogs', { params }),
  analytics: () => api.get('/admin/blogs/analytics'),
  adminGet: (id) => api.get(`/admin/blogs/${id}`),
  create: (body) => api.post('/admin/blogs', body),
  update: (id, body) => api.put(`/admin/blogs/${id}`, body),
  remove: (id) => api.delete(`/admin/blogs/${id}`),
  publish: (id) => api.post(`/admin/blogs/${id}/publish`),
  status: (id, status) => api.patch(`/admin/blogs/${id}/status`, { status }),
  schedule: (id, scheduledAt) => api.post(`/admin/blogs/${id}/schedule`, { scheduledAt }),
  duplicate: (id) => api.post(`/admin/blogs/${id}/duplicate`),
  uploadFeatured: (id, file) => { const body = new FormData(); body.append('featuredImage', file); return api.put(`/admin/blogs/${id}`, body); },
  uploadInline: (id, file, meta) => { const body = new FormData(); body.append('image', file); Object.entries(meta).forEach(([k, v]) => body.append(k, v)); return api.post(`/admin/blogs/${id}/images`, body); },
};
