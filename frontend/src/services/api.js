import axios from 'axios';

// Base URL: in production (docker nginx) we hit the same origin and let nginx proxy;
// in dev we use the CRA `proxy` field in package.json which forwards to localhost:8086.
// Either way the relative path works.
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// ---- Request interceptor: inject auth + tenant headers ----
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const tenantId = localStorage.getItem('active_tenant_id');
    if (tenantId) {
      config.headers['X-Tenant-Id'] = tenantId;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---- Response interceptor: handle 401 globally, pass everything else through ----
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Stale or invalid token — clear and bounce to login.
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('active_tenant_id');
      localStorage.removeItem('user_tenants');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ---- Helpers: extract a useful error message from an axios error ----
export function apiErrorMessage(error, fallback = 'Something went wrong') {
  if (!error) return fallback;
  const data = error.response?.data;
  if (typeof data === 'string') return data;
  if (data?.message) return data.message;
  if (data?.error) return data.error;
  if (error.message) return error.message;
  return fallback;
}

// ---- Auth ----
export const authAPI = {
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  register: (name, email, password) => api.post('/api/auth/register', { name, email, password }),
  forgotPassword: (email) => api.post('/api/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) =>
    api.post('/api/auth/reset-password', { token, newPassword }),
};

// ---- Tenants ----
export const tenantAPI = {
  mine: () => api.get('/api/tenants/mine'),
  create: (slug, name) => api.post('/api/tenants', { slug, name }),
};

// ---- Leads ----
export const leadAPI = {
  list: (params) => api.get('/api/leads', { params }),
  get: (id) => api.get(`/api/leads/${id}`),
  create: (leadData) => api.post('/api/leads', leadData),
  update: (id, leadData) => api.put(`/api/leads/${id}`, leadData),
  remove: (id) => api.delete(`/api/leads/${id}`),
  analyze: (id) => api.post(`/api/leads/${id}/analyze`),
};

// ---- Customers ----
export const customerAPI = {
  list: (params) => api.get('/api/customers', { params }),
  get: (id) => api.get(`/api/customers/${id}`),
  create: (data) => api.post('/api/customers', data),
  update: (id, data) => api.put(`/api/customers/${id}`, data),
  remove: (id) => api.delete(`/api/customers/${id}`),
};

// ---- Contacts ----
export const contactAPI = {
  list: (params) => api.get('/api/contacts', { params }),
  get: (id) => api.get(`/api/contacts/${id}`),
  byCustomer: (customerId) => api.get(`/api/contacts/by-customer/${customerId}`),
  create: (data) => api.post('/api/contacts', data),
  update: (id, data) => api.put(`/api/contacts/${id}`, data),
  remove: (id) => api.delete(`/api/contacts/${id}`),
};

// ---- Opportunities ----
export const opportunityAPI = {
  list: (params) => api.get('/api/opportunities', { params }),
  get: (id) => api.get(`/api/opportunities/${id}`),
  byCustomer: (customerId) => api.get(`/api/opportunities/by-customer/${customerId}`),
  create: (data) => api.post('/api/opportunities', data),
  update: (id, data) => api.put(`/api/opportunities/${id}`, data),
  remove: (id) => api.delete(`/api/opportunities/${id}`),
};

// ---- Tasks ----
export const taskAPI = {
  list: (params) => api.get('/api/tasks', { params }),
  get: (id) => api.get(`/api/tasks/${id}`),
  forEntity: (type, id) => api.get(`/api/tasks/for/${type}/${id}`),
  create: (data) => api.post('/api/tasks', data),
  update: (id, data) => api.put(`/api/tasks/${id}`, data),
  remove: (id) => api.delete(`/api/tasks/${id}`),
};

// ---- Notes ----
export const noteAPI = {
  list: (params) => api.get('/api/notes', { params }),
  forEntity: (type, id) => api.get(`/api/notes/for/${type}/${id}`),
  create: (data) => api.post('/api/notes', data),
  update: (id, body) => api.put(`/api/notes/${id}`, { body }),
  remove: (id) => api.delete(`/api/notes/${id}`),
};

// ---- AI generation ----
export const aiAPI = {
  summarize: (id) => api.post(`/api/ai/leads/${id}/summary`),
  proposal: (id) => api.post(`/api/ai/opportunities/${id}/proposal`),
};

// ---- Search (RAG) ----
export const searchAPI = {
  search: (q, topK = 5) => api.get('/api/search', { params: { q, topK } }),
  answer: (question, topK = 5) => api.post('/api/search/answer', { question, topK }),
};

// ---- Dashboard ----
export const dashboardAPI = {
  overview: () => api.get('/api/dashboard'),
  health: () => api.get('/api/dashboard/health'),
};

export default api;
