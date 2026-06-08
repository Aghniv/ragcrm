import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8086/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  register: (name, email, password) => 
    api.post('/auth/register', { name, email, password }),
  resetPassword: (email) => 
    api.post('/auth/reset-password', { email }),
};

export const leadAPI = {
  getAll: (params) => api.get('/leads', { params }),
  getById: (id) => api.get(`/leads/${id}`),
  create: (leadData) => api.post('/leads', leadData),
  update: (id, leadData) => api.put(`/leads/${id}`, leadData),
  delete: (id) => api.delete(`/leads/${id}`),
  analyze: (id) => api.post(`/leads/${id}/analyze`),
  getByStatus: (status) => api.get(`/leads/status/${status}`),
  deleteBulk: (ids) => api.delete('/leads/bulk', { data: ids }),
  updateBulkStatus: (ids, status) => api.put('/leads/bulk/status', ids, { params: { status } }),
  exportCsv: (params) => api.get('/leads/export', { params, responseType: 'blob' }),
};

export default api;