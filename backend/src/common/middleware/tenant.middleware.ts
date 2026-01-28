import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware para detectar y extraer el tenant desde el subdominio
 * 
 * Ejemplos:
 * - cliente1.tudominio.com -> tenantSlug = 'cliente1'
 * - admin.tudominio.com -> tenantSlug = null (Super Admin)
 * - tudominio.com -> tenantSlug = null (Dominio base)
 * - localhost:3000 -> tenantSlug = null (Desarrollo)
 */
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TenantMiddleware.name);
  
  // Dominios base permitidos (configurables por entorno)
  private readonly baseDomains = [
    process.env.BASE_DOMAIN || 'tudominio.com',
    'localhost',
    '127.0.0.1',
  ];

  use(req: Request, res: Response, next: NextFunction) {
    const host = req.get('host') || req.hostname;
    
    // Primero intentar obtener el tenant slug del header X-Tenant-Slug
    // Esto es útil cuando el frontend está en un subdominio pero hace peticiones a localhost:3000
    const headerTenantSlug = req.get('X-Tenant-Slug') || req.get('x-tenant-slug');
    
    // Log detallado para debugging
    this.logger.debug(`========== TENANT DETECTION ==========`);
    this.logger.debug(`Host: ${host}`);
    this.logger.debug(`Header X-Tenant-Slug: ${headerTenantSlug || 'NOT PRESENT'}`);
    
    // Si hay header, usarlo directamente
    let tenantSlug: string | null = null;
    if (headerTenantSlug) {
      tenantSlug = headerTenantSlug;
      this.logger.debug(`✓ Tenant slug desde header: ${tenantSlug}`);
    } else {
      // Si no hay header, extraer del host
      tenantSlug = this.extractTenantSlug(host);
      this.logger.debug(`✓ Tenant slug desde host: ${tenantSlug || 'null'}`);
    }
    
    // Agregar el tenantSlug al request para uso posterior
    req['tenantSlug'] = tenantSlug;
    
    this.logger.debug(`→ Tenant Slug final: ${tenantSlug || 'null (Super Admin)'}`);
    this.logger.debug(`======================================`);
    
    next();
  }

  /**
   * Extrae el slug del tenant desde el hostname
   * @param host - El hostname completo (ej: cliente1.tudominio.com:3000 o demo.localhost:3000)
   * @returns El slug del tenant o null si es el dominio base o 'admin'
   */
  private extractTenantSlug(host: string): string | null {
    // Remover puerto si existe
    const hostname = host.split(':')[0];
    
    // Dividir por puntos
    const parts = hostname.split('.');
    
    // Si es EXACTAMENTE localhost o IP (sin subdominio), no hay tenant
    if (this.isLocalhost(hostname)) {
      return null;
    }
    
    // Si tiene 2 o más partes, el primero podría ser un subdominio
    if (parts.length >= 2) {
      const potentialSubdomain = parts[0];
      
      // Si es 'admin', SIEMPRE retornar null (Super Admin)
      // Esto funciona para: admin.localhost, admin.tudominio.com, admin.innovatech5178.app, etc.
      if (this.isAdminSubdomain(potentialSubdomain)) {
        this.logger.debug(`Subdominio 'admin' detectado - Super Admin`);
        return null;
      }
      
      // Validar que el subdominio no sea reservado
      if (this.isReservedSubdomain(potentialSubdomain)) {
        this.logger.debug(`Subdominio reservado detectado: ${potentialSubdomain}`);
        return null;
      }
      
      // Si tiene solo 2 partes y el segundo es localhost, es un subdominio válido
      // Ejemplo: demo.localhost -> tenant 'demo'
      if (parts.length === 2 && parts[1] === 'localhost') {
        this.logger.debug(`Subdominio detectado en localhost: ${potentialSubdomain}`);
        return potentialSubdomain;
      }
      
      // Si tiene 3 o más partes, el primero es el subdominio
      // Ejemplo: demo.tudominio.com -> tenant 'demo'
      // Ejemplo: demo.innovatech5178.app -> tenant 'demo'
      if (parts.length >= 3) {
        this.logger.debug(`Subdominio detectado: ${potentialSubdomain}`);
        return potentialSubdomain;
      }
    }
    
    // Si solo tiene 1 parte o no cumple ninguna condición, es el dominio base
    return null;
  }

  /**
   * Verifica si el hostname es localhost o una IP local
   */
  private isLocalhost(hostname: string): boolean {
    return (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.')
    );
  }

  /**
   * Verifica si el dominio base es válido
   */
  private isValidBaseDomain(domain: string): boolean {
    return this.baseDomains.some(baseDomain => 
      domain === baseDomain || domain.endsWith(`.${baseDomain}`)
    );
  }

  /**
   * Verifica si el subdominio es reservado (no debe usarse para tenants)
   * 'admin' es el subdominio del Super Admin
   */
  private isReservedSubdomain(subdomain: string): boolean {
    const reserved = ['www', 'api', 'app', 'mail', 'ftp', 'cdn'];
    return reserved.includes(subdomain.toLowerCase());
  }

  /**
   * Verifica si el subdominio es el del Super Admin
   */
  private isAdminSubdomain(subdomain: string): boolean {
    return subdomain.toLowerCase() === 'admin';
  }
}
