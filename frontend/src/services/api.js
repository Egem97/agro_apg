import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT, AUTH_ENDPOINTS } from '../config/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Try to refresh token
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}${AUTH_ENDPOINTS.refreshToken}`, {
            refresh: refreshToken
          });
          
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, redirect to login
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post(AUTH_ENDPOINTS.login, credentials),
  register: (userData) => api.post(AUTH_ENDPOINTS.register, userData),
  getProfile: () => api.get(AUTH_ENDPOINTS.profile),
  updateProfile: (userData) => {
    // Si userData es FormData (contiene archivos), usar configuración especial
    if (userData instanceof FormData) {
      return api.put(AUTH_ENDPOINTS.updateProfile, userData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    // Si no es FormData, usar configuración normal
    return api.put(AUTH_ENDPOINTS.updateProfile, userData);
  },
  
  // Companies
  getCompanies: () => api.get('/auth/companies/'),
  createCompany: (companyData) => api.post('/auth/companies/', companyData),
  getCompany: (id) => api.get(`/auth/companies/${id}/`),
  updateCompany: (id, companyData) => api.put(`/auth/companies/${id}/`, companyData),
  deleteCompany: (id) => api.delete(`/auth/companies/${id}/`),
  
  // Users
  getUsers: () => api.get('/auth/users/'),
  createUser: (userData) => api.post('/auth/users/', userData),
  getUser: (id) => api.get(`/auth/users/${id}/`),
  updateUser: (id, userData) => api.put(`/auth/users/${id}/`, userData),
  deleteUser: (id) => api.delete(`/auth/users/${id}/`),
  
  // Roles
  getRoles: () => api.get('/auth/roles/'),
  createRole: (roleData) => api.post('/auth/roles/', roleData),
  getRole: (id) => api.get(`/auth/roles/${id}/`),
  updateRole: (id, roleData) => api.put(`/auth/roles/${id}/`, roleData),
  deleteRole: (id) => api.delete(`/auth/roles/${id}/`),
};

// Production API
export const productionAPI = {
  // Dashboard
  getDashboardStats: () => api.get('/dashboard/stats/'),
  
  // Products
  getProducts: () => api.get('/products/'),
  createProduct: (productData) => api.post('/products/', productData),
  getProduct: (id) => api.get(`/products/${id}/`),
  updateProduct: (id, productData) => api.put(`/products/${id}/`, productData),
  deleteProduct: (id) => api.delete(`/products/${id}/`),
  
  // Quality Data
  getQualityData: (params = {}) => api.get('/quality-data/', { params }),
  getQualityDataById: (id) => api.get(`/quality-data/${id}/`),
  getQualityDataStats: () => api.get('/quality-data/stats/'),
  getQualityDataDashboard: () => api.get('/quality-data/dashboard/'),
  exportQualityData: (params = {}) => api.get('/quality-data/export/', { params }),
  syncQualityData: (data) => api.post('/quality-data/sync/', data),
  
  // Shipments
  getShipments: () => api.get('/shipments/'),
  createShipment: (shipmentData) => api.post('/shipments/', shipmentData),
  getShipment: (id) => api.get(`/shipments/${id}/`),
  updateShipment: (id, shipmentData) => api.put(`/shipments/${id}/`, shipmentData),
  deleteShipment: (id) => api.delete(`/shipments/${id}/`),
  
  // Inspections
  getInspections: (shipmentId = null) => {
    const params = shipmentId ? `?shipment_id=${shipmentId}` : '';
    return api.get(`/inspections/${params}`);
  },
  createInspection: (inspectionData) => api.post('/inspections/', inspectionData),
  getInspection: (id) => api.get(`/inspections/${id}/`),
  updateInspection: (id, inspectionData) => api.put(`/inspections/${id}/`, inspectionData),
  deleteInspection: (id) => api.delete(`/inspections/${id}/`),
  
  // Quality Reports
  getQualityReports: () => api.get('/quality-reports/'),
  createQualityReport: (reportData) => api.post('/quality-reports/', reportData),
  getQualityReport: (id) => api.get(`/quality-reports/${id}/`),
  updateQualityReport: (id, reportData) => api.put(`/quality-reports/${id}/`, reportData),
  deleteQualityReport: (id) => api.delete(`/quality-reports/${id}/`),
  
  // Samples
  getSamples: (inspectionId = null) => {
    const params = inspectionId ? `?inspection_id=${inspectionId}` : '';
    return api.get(`/samples/${params}`);
  },
  createSample: (sampleData) => api.post('/samples/', sampleData),
  getSample: (id) => api.get(`/samples/${id}/`),
  updateSample: (id, sampleData) => api.put(`/samples/${id}/`, sampleData),
  deleteSample: (id) => api.delete(`/samples/${id}/`),
};

export default api;
