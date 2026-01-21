/**
 * Obtiene la URL base del API manteniendo el subdominio
 * Ejemplos:
 * - cliente-demo.localhost:5173 -> http://cliente-demo.localhost:3000
 * - admin.localhost:5173 -> http://admin.localhost:3000
 * - localhost:5173 -> http://localhost:3000
 * - admin.datagree.net -> https://admin.datagree.net
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
  
  // Si es EXACTAMENTE localhost o 127.0.0.1 (sin subdominio), usar localhost:3000
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    console.log('[API-URL] Es localhost puro, usando: http://localhost:3000');
    return 'http://localhost:3000';
  }
  
  // Si es un dominio de producción (no localhost), usar el mismo protocolo sin puerto
  if (!currentHost.includes('localhost') && !currentHost.includes('127.0.0.1')) {
    const apiUrl = `${protocol}//${currentHost}`;
    console.log('[API-URL] Producción detectada, usando:', apiUrl);
    return apiUrl;
  }
  
  // Para desarrollo con subdominios locales
  const apiUrl = `http://${currentHost}:3000`;
  console.log('[API-URL] Desarrollo con subdominio, usando:', apiUrl);
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
