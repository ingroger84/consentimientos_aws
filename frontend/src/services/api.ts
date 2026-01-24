import axios from 'axios';
import { getApiBaseUrl } from '@/utils/api-url';

const api = axios.create({
  baseURL: `${getApiBaseUrl()}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const message = error.response?.data?.message || '';
      
      // Verificar si es un error de sesión cerrada por otro dispositivo
      if (message.includes('sesión ha sido cerrada') || message.includes('iniciaste sesión en otro dispositivo')) {
        // Mostrar alerta antes de redirigir
        alert('Tu sesión ha sido cerrada porque iniciaste sesión en otro dispositivo o navegador.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(error);
      }
      
      // Solo limpiar y redirigir si no estamos ya en la página de login
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Mantener el subdominio al redirigir
        window.location.href = '/login';
      }
    }
    
    // Manejar cuenta suspendida o expirada (403)
    if (error.response?.status === 403) {
      const message = error.response?.data?.message || '';
      
      // Verificar si es un error de cuenta suspendida o expirada
      if (message.includes('suspendida') || message.includes('suspended')) {
        // Redirigir a la página de cuenta suspendida
        if (!window.location.pathname.includes('/suspended')) {
          window.location.href = '/suspended';
        }
      } else if (message.includes('expirado') || message.includes('expired')) {
        // Redirigir a la página de cuenta expirada (o suspendida)
        if (!window.location.pathname.includes('/suspended')) {
          window.location.href = '/suspended';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
