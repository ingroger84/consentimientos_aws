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

// Variable para evitar múltiples intentos de refresh simultáneos
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: any) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
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
        return Promise.reject(error);
      } else if (message.includes('expirado') || message.includes('expired')) {
        // Redirigir a la página de cuenta expirada (o suspendida)
        if (!window.location.pathname.includes('/suspended')) {
          window.location.href = '/suspended';
        }
        return Promise.reject(error);
      }
      
      // Si es un error de permisos y no hemos intentado refrescar el token
      if (message.includes('permiso') || message.includes('permission') || message.includes('autorizado')) {
        // Si ya intentamos refrescar, no intentar de nuevo
        if (originalRequest._retry) {
          console.log('Ya se intentó refrescar el token, error de permisos persistente');
          return Promise.reject(error);
        }
        
        // Si ya hay un refresh en progreso, agregar a la cola
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          }).catch(err => {
            return Promise.reject(err);
          });
        }
        
        originalRequest._retry = true;
        isRefreshing = true;
        
        try {
          console.log('Intentando refrescar token por error de permisos...');
          const response = await api.post('/auth/refresh-token');
          const { access_token, user } = response.data;
          
          // Actualizar token y usuario en localStorage
          localStorage.setItem('token', access_token);
          localStorage.setItem('user', JSON.stringify(user));
          
          // Actualizar header de autorización
          api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          
          // Procesar cola de requests pendientes
          processQueue(null, access_token);
          
          console.log('Token refrescado exitosamente, reintentando request...');
          
          // Reintentar el request original
          return api(originalRequest);
        } catch (refreshError) {
          console.error('Error al refrescar token:', refreshError);
          processQueue(refreshError, null);
          
          // Si falla el refresh, mostrar mensaje y no redirigir automáticamente
          // El usuario puede intentar refrescar la página manualmente
          return Promise.reject(error);
        } finally {
          isRefreshing = false;
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
