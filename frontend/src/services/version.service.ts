/**
 * Servicio de Versionamiento Automático
 * Detecta actualizaciones y notifica al usuario
 */

import { getVersion } from '../config/version';

interface VersionInfo {
  version: string;
  buildDate: string;
  buildHash: string;
}

class VersionService {
  private currentVersion: string;
  private checkInterval: number = 5 * 60 * 1000; // 5 minutos
  private intervalId: number | null = null;
  private listeners: Set<(hasUpdate: boolean) => void> = new Set();

  constructor() {
    this.currentVersion = getVersion();
    this.init();
  }

  private init() {
    // Guardar versión actual en localStorage
    const storedVersion = localStorage.getItem('app_version');
    if (storedVersion !== this.currentVersion) {
      console.log(`🔄 Versión actualizada: ${storedVersion} → ${this.currentVersion}`);
      localStorage.setItem('app_version', this.currentVersion);
      localStorage.setItem('app_version_updated_at', new Date().toISOString());
    }

    // Limpiar caché antiguo si es necesario
    this.cleanOldCache();
  }

  /**
   * Inicia la verificación automática de actualizaciones
   */
  startAutoCheck() {
    if (this.intervalId) return;

    console.log('🔍 Iniciando verificación automática de versión');
    
    // Verificar inmediatamente
    this.checkForUpdates();

    // Verificar cada 5 minutos
    this.intervalId = window.setInterval(() => {
      this.checkForUpdates();
    }, this.checkInterval);
  }

  /**
   * Detiene la verificación automática
   */
  stopAutoCheck() {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('⏹️ Verificación automática detenida');
    }
  }

  /**
   * Verifica si hay actualizaciones disponibles
   */
  async checkForUpdates(): Promise<boolean> {
    try {
      // Obtener versión del servidor con timestamp para evitar caché
      const timestamp = Date.now();
      const response = await fetch(`/version.json?t=${timestamp}`, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      });

      if (!response.ok) {
        console.warn('⚠️ No se pudo verificar la versión del servidor');
        return false;
      }

      const serverVersion: VersionInfo = await response.json();
      const hasUpdate = serverVersion.version !== this.currentVersion;

      if (hasUpdate) {
        console.log(`🆕 Nueva versión disponible: ${serverVersion.version}`);
        this.notifyListeners(true);
        
        // Guardar información de la actualización
        localStorage.setItem('pending_version', serverVersion.version);
        localStorage.setItem('pending_version_detected_at', new Date().toISOString());
      }

      return hasUpdate;
    } catch (error) {
      console.error('❌ Error al verificar actualizaciones:', error);
      return false;
    }
  }

  /**
   * Registra un listener para notificaciones de actualización
   */
  onUpdateAvailable(callback: (hasUpdate: boolean) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notifica a todos los listeners
   */
  private notifyListeners(hasUpdate: boolean) {
    this.listeners.forEach(callback => callback(hasUpdate));
  }

  /**
   * Recarga la aplicación con limpieza de caché
   */
  async reloadApp() {
    console.log('🔄 Recargando aplicación...');

    // Limpiar localStorage excepto datos importantes
    const keysToKeep = ['auth_token', 'user_data', 'tenant_data'];
    const storage: Record<string, string> = {};
    
    keysToKeep.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) storage[key] = value;
    });

    localStorage.clear();
    
    keysToKeep.forEach(key => {
      if (storage[key]) localStorage.setItem(key, storage[key]);
    });

    // Limpiar sessionStorage
    sessionStorage.clear();

    // Limpiar Service Workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(reg => reg.unregister()));
    }

    // Limpiar Cache API
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }

    // Recargar con timestamp
    window.location.href = `${window.location.pathname}?v=${Date.now()}`;
  }

  /**
   * Limpia caché antiguo
   */
  private async cleanOldCache() {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        const oldCaches = cacheNames.filter(name => !name.includes(this.currentVersion));
        
        if (oldCaches.length > 0) {
          console.log(`🧹 Limpiando ${oldCaches.length} cachés antiguos`);
          await Promise.all(oldCaches.map(name => caches.delete(name)));
        }
      }
    } catch (error) {
      console.error('❌ Error al limpiar caché:', error);
    }
  }

  /**
   * Obtiene información de la versión actual
   */
  getVersionInfo(): VersionInfo {
    return {
      version: this.currentVersion,
      buildDate: localStorage.getItem('app_version_updated_at') || new Date().toISOString(),
      buildHash: this.generateBuildHash(),
    };
  }

  /**
   * Genera un hash único para el build
   */
  private generateBuildHash(): string {
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const hashes = scripts.map(script => {
      const src = (script as HTMLScriptElement).src;
      const match = src.match(/[a-f0-9]{8,}/);
      return match ? match[0] : '';
    }).filter(Boolean);
    
    return hashes[0] || 'unknown';
  }

  /**
   * Verifica si el navegador tiene caché antiguo
   */
  hasOldCache(): boolean {
    const storedVersion = localStorage.getItem('app_version');
    return storedVersion !== null && storedVersion !== this.currentVersion;
  }
}

// Exportar instancia singleton
export const versionService = new VersionService();
