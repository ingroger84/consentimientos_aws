/**
 * Obtiene la URL base del API
 * IMPORTANTE: En desarrollo local, SIEMPRE usar localhost:3000 (sin subdominio)
 * El tenant se identifica mediante el header X-Tenant-Slug
 * 
 * Ejemplos:
 * - cliente-demo.localhost:5173 -> http://localhost:3000 (+ header X-Tenant-Slug: cliente-demo)
 * - admin.localhost:5173 -> http://localhost:3000 (+ header X-Tenant-Slug: null)
 * - localhost:5173 -> http://localhost:3000
 * - admin.archivoenlinea.com -> https://archivoenlinea.com (producción)
 */
export function getApiBaseUrl(): string {
  // Si hay variable de entorno, usarla (sin /api)
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (envUrl) {
    console.log('[API-URL] Usando variable de entorno:', envUrl.replace('/api', ''));
    return envUrl.replace('/api', '');
  }

  // Obtener el hostname y protocolo actual
  const currentHost = window.location.hostname;
  const protocol = window.location.protocol; // 'http:' o 'https:'
  console.log('[API-URL] Hostname detectado:', currentHost);
  console.log('[API-URL] Protocolo detectado:', protocol);
  
  // DESARROLLO LOCAL: SIEMPRE usar localhost:3000
  // El tenant se identifica mediante el header X-Tenant-Slug
  if (currentHost.includes('localhost') || currentHost === '127.0.0.1') {
    console.log('[API-URL] Desarrollo local detectado, usando: http://localhost:3000');
    return 'http://localhost:3000';
  }
  
  // PRODUCCIÓN: Usar el dominio actual
  // Si es admin.dominio.com, usar solo dominio.com (sin admin)
  const parts = currentHost.split('.');
  if (parts.length >= 3 && parts[0] === 'admin') {
    const baseDomain = parts.slice(1).join('.');
    const apiUrl = `${protocol}//${baseDomain}`;
    console.log('[API-URL] Admin en producción, usando dominio base:', apiUrl);
    return apiUrl;
  }
  
  // Para otros subdominios o dominio base en producción, usar tal cual
  const apiUrl = `${protocol}//${currentHost}`;
  console.log('[API-URL] Producción detectada, usando:', apiUrl);
  return apiUrl;
}

/**
 * Obtiene la URL completa de un recurso (imagen, archivo, etc.)
 */
export function getResourceUrl(path: string): string {
  if (!path) return '';
  
  // Si ya es una URL completa, retornarla
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Si no empieza con /, agregarla
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${getApiBaseUrl()}${normalizedPath}`;
}
