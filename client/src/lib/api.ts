import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// agrega el token a cada request si hay sesion activa
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cleanerp_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// si el token expiró redirige al login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido: limpiar sesión
      localStorage.removeItem('cleanerp_token');
      localStorage.removeItem('cleanerp_usuario');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
