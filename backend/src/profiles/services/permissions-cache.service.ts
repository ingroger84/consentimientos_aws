import { Injectable, Logger } from '@nestjs/common';

interface CachedData {
  value: string;
  timestamp: number;
}

@Injectable()
export class PermissionsCacheService {
  private readonly logger = new Logger(PermissionsCacheService.name);
  private cache = new Map<string, CachedData>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutos

  /**
   * Obtener valor del caché
   */
  get(key: string): string | null {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }

    // Verificar si el caché ha expirado
    if (Date.now() - cached.timestamp > this.TTL) {
      this.cache.delete(key);
      this.logger.debug(`Cache expired for key ${key}`);
      return null;
    }

    this.logger.debug(`Cache hit for key ${key}`);
    return cached.value;
  }

  /**
   * Guardar valor en el caché
   */
  set(key: string, value: string[]): void {
    this.cache.set(key, {
      value: value[0] || '',
      timestamp: Date.now(),
    });
    this.logger.debug(`Cached value for key ${key}`);
  }

  /**
   * Invalidar caché de un usuario específico
   */
  invalidateUser(userId: string): void {
    // Eliminar todas las entradas que empiecen con el userId
    const keysToDelete: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${userId}:`)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
    this.logger.debug(`Invalidated cache for user ${userId} (${keysToDelete.length} entries)`);
  }

  /**
   * Invalidar caché de todos los usuarios con un perfil específico
   */
  invalidateProfile(profileId: string): void {
    // En una implementación más avanzada, mantendríamos un índice
    // de userId -> profileId para invalidar eficientemente
    // Por ahora, invalidamos todo el caché
    this.invalidateAll();
    this.logger.debug(`Invalidated cache for profile ${profileId}`);
  }

  /**
   * Invalidar todo el caché
   */
  invalidateAll(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.logger.debug(`Cleared entire cache (${size} entries)`);
  }

  /**
   * Obtener estadísticas del caché
   */
  getStats(): {
    size: number;
    ttl: number;
    hitRate?: number;
  } {
    return {
      size: this.cache.size,
      ttl: this.TTL,
    };
  }

  /**
   * Limpiar entradas expiradas (ejecutar periódicamente)
   */
  cleanExpired(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [userId, cached] of this.cache.entries()) {
      if (now - cached.timestamp > this.TTL) {
        this.cache.delete(userId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.debug(`Cleaned ${cleaned} expired cache entries`);
    }
  }
}
