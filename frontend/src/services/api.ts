import axios from 'axios';
import { getApiBaseUrl } from '@/utils/api-url';

const api = axios.create({
  baseURL: `${getApiBaseUrl()}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Función para extraer el tenant slug del hostname
const getTenantSlug = (): string | null => {
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  
  // localhost o IP sin subdominio
  if (hostname === 'localhost' || hostname === '127.0.0.1' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return null;
  }
  
  // Si tiene 2 partes y el segundo es localhost, el primero es el tenant
  // Ejemplo: clinica-demo.localhost -> tenant 'clinica-demo'
  if (parts.length === 2 && parts[1] === 'localhost') {
    const subdomain = parts[0];
    // Si es 'admin', no es un tenant
    if (subdomain === 'admin') {
      return null;
    }
    return subdomain;
  }
  
  // Si tiene 3 o más partes, el primero es el tenant
  // Ejemplo: clinica-demo.archivoenlinea.com -> tenant 'clinica-demo'
  if (parts.length >= 3) {
    const subdomain = parts[0];
    // Si es 'admin' o 'www', no es un tenant
    if (subdomain === 'admin' || subdomain === 'www') {
      return null;
    }
    return subdomain;
  }
  
  // Dominio principal sin subdominio
  return null;
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Agregar el tenant slug como header
    const tenantSlug = getTenantSlug();
    if (tenantSlug) {
      config.headers['X-Tenant-Slug'] = tenantSlug;
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
