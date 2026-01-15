import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TenantsService } from '../../tenants/tenants.service';

/**
 * Guard para validar que el usuario pertenece al tenant del subdominio
 * y que el tenant está activo (no suspendido ni expirado)
 * 
 * Este guard se ejecuta DESPUÉS de JwtAuthGuard, por lo que ya tenemos
 * el usuario autenticado en request.user
 */
@Injectable()
export class TenantGuard implements CanActivate {
  private readonly logger = new Logger(TenantGuard.name);

  constructor(
    private reflector: Reflector,
    private tenantsService: TenantsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Verificar si la ruta permite bypass del tenant guard
    const allowAnyTenant = this.reflector.get<boolean>(
      'allowAnyTenant',
      context.getHandler(),
    );

    if (allowAnyTenant) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const tenantSlug = request.tenantSlug; // Del middleware
    const user = request.user; // Del JwtAuthGuard

    // Si no hay usuario autenticado, dejar que JwtAuthGuard lo maneje
    if (!user) {
      return true;
    }

    this.logger.debug(
      `Validando acceso - Subdominio: ${tenantSlug || 'null (admin o base)'}, Usuario: ${user.email}, Tenant del usuario: ${user.tenant?.slug || 'null'}`,
    );

    // Caso 1: Sin subdominio (dominio base o 'admin') - Solo Super Admin
    if (!tenantSlug) {
      if (user.tenant) {
        throw new ForbiddenException(
          `Los usuarios de tenant deben acceder desde su subdominio: ${user.tenant.slug}.${process.env.BASE_DOMAIN || 'tudominio.com'}`,
        );
      }
      // Super Admin puede acceder al dominio base o admin.tudominio.com
      return true;
    }

    // Caso 2: Subdominio específico - Solo usuarios de ese tenant
    if (tenantSlug) {
      // Super Admin NO puede acceder a subdominios de tenants
      if (!user.tenant) {
        throw new ForbiddenException(
          `El Super Admin debe acceder desde: admin.${process.env.BASE_DOMAIN || 'tudominio.com'}`,
        );
      }

      // Validar que el usuario pertenece al tenant del subdominio
      if (user.tenant.slug !== tenantSlug) {
        throw new ForbiddenException(
          `No tienes acceso a este tenant. Tu subdominio es: ${user.tenant.slug}.${process.env.BASE_DOMAIN || 'tudominio.com'}`,
        );
      }

      // ✅ NUEVA VALIDACIÓN: Verificar el estado del tenant
      try {
        const tenant = await this.tenantsService.findBySlug(tenantSlug);
        
        if (tenant.status === 'suspended') {
          this.logger.warn(
            `Usuario ${user.email} intentó acceder a tenant suspendido: ${tenantSlug}`,
          );
          throw new ForbiddenException(
            '⛔ Esta cuenta está suspendida por falta de pago. Por favor contacta al administrador o realiza el pago pendiente para reactivar tu cuenta.',
          );
        }

        if (tenant.status === 'expired') {
          this.logger.warn(
            `Usuario ${user.email} intentó acceder a tenant expirado: ${tenantSlug}`,
          );
          throw new ForbiddenException(
            '⏰ Esta cuenta ha expirado. Por favor contacta al administrador para renovar tu suscripción.',
          );
        }
      } catch (error) {
        // Si el error ya es un ForbiddenException, re-lanzarlo
        if (error instanceof ForbiddenException) {
          throw error;
        }
        // Si hay otro error al buscar el tenant, loguearlo pero permitir el acceso
        // (para no bloquear el sistema si hay un problema temporal con la BD)
        this.logger.error(
          `Error al validar estado del tenant ${tenantSlug}: ${error.message}`,
        );
      }

      return true;
    }

    return true;
  }
}
