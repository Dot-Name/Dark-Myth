// src/routes/adminRoutes.js

export const ADMIN_PATHS = Object.freeze({
  dashboard: '/admin',
  catalogue: '/admin/catalogue',
  newBook: '/admin/catalogue/new',
  editBook: (id = ':id') => `/admin/catalogue/${id}/edit`,
  categories: '/admin/categories',
  orders: '/admin/orders',
  enquiries: '/admin/enquiries',
  settings: '/admin/settings',
  login: '/admin/login',
});

// Relative segments used in App.jsx nested <Route> configuration
export const ADMIN_ROUTE_SEGMENTS = Object.freeze({
  catalogue: 'catalogue',
  newBook: 'catalogue/new',
  editBook: 'catalogue/:id/edit',
  categories: 'categories',
  orders: 'orders',
  enquiries: 'enquiries',
  settings: 'settings',
});