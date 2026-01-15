/**
 * Obtiene la URL base del API manteniendo el subdominio
 * Ejemplos:
 * - cliente-demo.localhost:5173 -> http://cliente-demo.localhost:3000
 * - admin.localhost:5173 -> http://admin.localhost:3000
 * - localhost:5173 -> http://localhost:3000
 */
export function getApiBaseUrl(): string {
  // Si hay variable de entorno, usarla (sin /api)
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (envUrl) {
    console.log('[API-URL] Usando variable de entorno:', envUrl.replace('/api', ''));
    return envUrl.replace('/api', '');
  }

  // Obtener el hostname actual (incluye subdominio)
  const currentHost = window.location.hostname;
  console.log('[API-URL] Hostname detectado:', currentHost);
  
  // Si es EXACTAMENTE localhost o 127.0.0.1 (sin subdominio), usar localhost:3000
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    console.log('[API-URL] Es localhost puro, usando: http://localhost:3000');
    return 'http://localhost:3000';
  }
  
  // Para cualquier otro caso (incluyendo subdominios como demo.localhost),
  // mantener el hostname completo
  const apiUrl = `http://${currentHost}:3000`;
  console.log('[API-URL] Usando hostname con subdominio:', apiUrl);
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
