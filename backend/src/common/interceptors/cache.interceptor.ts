import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Interceptor de cache simple en memoria
 * Para produccion, considerar usar Redis
 */
@Injectable()
export class HttpCacheInterceptor implements NestInterceptor {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly TTL = 60000; // 1 minuto

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const key = this.generateCacheKey(request);

    // Solo cachear GET requests
    if (request.method !== 'GET') {
      return next.handle();
    }

    // Verificar si existe en cache y no ha expirado
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.TTL) {
      return of(cached.data);
    }

    // Si no esta en cache, ejecutar y guardar resultado
    return next.handle().pipe(
      tap((data) => {
        this.cache.set(key, {
          data,
          timestamp: Date.now(),
        });

        // Limpiar cache viejo periodicamente
        this.cleanupCache();
      }),
    );
  }

  private generateCacheKey(request: any): string {
    return `${request.url}_${JSON.stringify(request.query)}`;
  }

  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.TTL) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Limpiar cache manualmente
   */
  clearCache(): void {
    this.cache.clear();
  }
}
