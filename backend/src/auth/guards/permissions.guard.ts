import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * Guard de Permisos Mejorado
 * 
 * Valida que el usuario tenga al menos uno de los permisos requeridos.
 * Incluye logging para debugging y mensajes de error claros.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Obtener permisos requeridos del decorador
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      'permissions',
      [context.getHandler(), context.getClass()],
    );

    // Si no hay permisos requeridos, permitir acceso
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Validar que el usuario esté autenticado
    if (!user) {
      this.logger.warn('Intento de acceso sin usuario autenticado');
      throw new ForbiddenException('Usuario no autenticado');
    }

    // Validar que el usuario tenga un rol asignado
    if (!user.role) {
      this.logger.warn(`Usuario ${user.email} sin rol asignado`);
      throw new ForbiddenException('Usuario sin rol asignado');
    }

    const userPermissions = user.role.permissions || [];

    // Verificar si el usuario tiene al menos uno de los permisos requeridos
    const hasPermission = requiredPermissions.some((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasPermission) {
      this.logger.warn(
        `Usuario ${user.email} (${user.role.name}) intentó acceder sin permisos. ` +
        `Requeridos: [${requiredPermissions.join(', ')}], ` +
        `Tiene: [${userPermissions.join(', ')}]`
      );

      throw new ForbiddenException(
        `No tienes permisos para realizar esta acción. Se requiere uno de: ${requiredPermissions.join(', ')}`,
      );
    }

    // Log de acceso exitoso (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      this.logger.debug(
        `Usuario ${user.email} accedió con permiso: ${requiredPermissions.find(p => userPermissions.includes(p))}`
      );
    }

    return true;
  }
}
