// Configuración de API para diferentes entornos
const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:8000/api',
    timeout: 10000,
  },
  production: {
    baseURL: 'http://34.136.15.241:8001/api',
    timeout: 15000,
  },
  test: {
    baseURL: 'http://localhost:8000/api',
    timeout: 5000,
  }
};

// Determinar el entorno actual
const getEnvironment = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'production';
  } else if (process.env.NODE_ENV === 'test') {
    return 'test';
  } else {
    return 'development';
  }
};

// Obtener configuración del entorno actual
export const getAPIConfig = () => {
  const env = getEnvironment();
  return API_CONFIG[env] || API_CONFIG.development;
};

// URL base de la API
export const API_BASE_URL = getAPIConfig().baseURL;

// Timeout para las peticiones
export const API_TIMEOUT = getAPIConfig().timeout;

// Endpoints de autenticación
export const AUTH_ENDPOINTS = {
  login: '/auth/login/',
  register: '/auth/register/',
  profile: '/auth/profile/',
  updateProfile: '/auth/profile/update/',
  refreshToken: '/auth/token/refresh/',
};

// Endpoints de empresas
export const COMPANY_ENDPOINTS = {
  list: '/auth/companies/',
  create: '/auth/companies/',
  detail: (id) => `/auth/companies/${id}/`,
  update: (id) => `/auth/companies/${id}/`,
  delete: (id) => `/auth/companies/${id}/`,
  users: (id) => `/auth/companies/${id}/users/`,
  stats: (id) => `/auth/companies/${id}/stats/`,
};

// Endpoints de usuarios
export const USER_ENDPOINTS = {
  list: '/auth/users/',
  create: '/auth/users/',
  detail: (id) => `/auth/users/${id}/`,
  update: (id) => `/auth/users/${id}/`,
  delete: (id) => `/auth/users/${id}/`,
};

// Endpoints de roles
export const ROLE_ENDPOINTS = {
  list: '/auth/roles/',
  create: '/auth/roles/',
  detail: (id) => `/auth/roles/${id}/`,
  update: (id) => `/auth/roles/${id}/`,
  delete: (id) => `/auth/roles/${id}/`,
};

// Endpoints de producción
export const PRODUCTION_ENDPOINTS = {
  dashboard: '/dashboard/stats/',
  products: '/products/',
  shipments: '/shipments/',
  inspections: '/inspections/',
  qualityReports: '/quality-reports/',
  samples: '/samples/',
};

// Endpoints de datos de calidad
export const QUALITY_ENDPOINTS = {
  list: '/quality-data/',
  detail: (id) => `/quality-data/${id}/`,
  stats: '/quality-data/stats/',
  dashboard: '/quality-data/dashboard/',
  export: '/quality-data/export/',
  sync: '/quality-data/sync/',
};

export default {
  API_BASE_URL,
  API_TIMEOUT,
  AUTH_ENDPOINTS,
  COMPANY_ENDPOINTS,
  USER_ENDPOINTS,
  ROLE_ENDPOINTS,
  PRODUCTION_ENDPOINTS,
  QUALITY_ENDPOINTS,
};
