import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as compression from 'compression';

/**
 * Middleware para comprimir respuestas HTTP
 * Reduce el tamaño de las respuestas en ~70-80%
 */
@Injectable()
export class CompressionMiddleware implements NestMiddleware {
  private compression = compression({
    // Nivel de compresion (0-9, 6 es el default)
    level: 6,
    
    // Umbral minimo para comprimir (bytes)
    threshold: 1024, // 1KB
    
    // Filtro para decidir que comprimir
    filter: (req: Request, res: Response) => {
      // No comprimir si el cliente no lo soporta
      if (req.headers['x-no-compression']) {
        return false;
      }
      
      // Usar el filtro por defecto de compression
      return compression.filter(req, res);
    },
  });

  use(req: Request, res: Response, next: NextFunction) {
    this.compression(req, res, next);
  }
}
