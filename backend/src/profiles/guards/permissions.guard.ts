import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ProfilesService } from '../profiles.service';
import { PERMISSION_KEY } from '../decorators/require-permission.decorator';
import { SUPER_ADMIN_KEY } from '../decorators/require-super-admin.decorator';

/**
 * Guard unificado para verificación de permisos
 * Usa ProfilesService con caché en memoria
 * 
 * Soporta múltiples tipos de verificación:
 * - @RequireSuperAdmin() - Solo super administradores
 * - @RequirePermission(module, action) - Permiso específico
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private profilesService: ProfilesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Si no hay usuario autenticado, denegar
    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    // 1. Verificar si requiere super admin
    const requireSuperAdmin = this.reflector.getAllAndOverride<boolean>(
      SUPER_ADMIN_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requireSuperAdmin) {
      // Cargar usuario completo con relaciones
      const fullUser = await this.profilesService['userRepository'].findOne({
        where: { id: user.id },
        relations: ['profile', 'role'],
      });

      if (!fullUser) {
        throw new ForbiddenException('Usuario no encontrado');
      }

      const isSuperAdmin = this.profilesService['isSuperAdmin'](fullUser);
      if (!isSuperAdmin) {
        throw new ForbiddenException('Se requiere ser super administrador');
      }
      return true;
    }

    // 2. Verificar permisos específicos
    const requiredPermission = this.reflector.getAllAndOverride<{
      module: string;
      action: string;
    }>(PERMISSION_KEY, [context.getHandler(), context.getClass()]);

    if (requiredPermission) {
      const hasPermission = await this.profilesService.checkUserPermission(
        user.id,
        requiredPermission.module,
        requiredPermission.action,
      );

      if (!hasPermission) {
        throw new ForbiddenException(
          `No tienes permiso para realizar esta acción (${requiredPermission.module}:${requiredPermission.action})`,
        );
      }
      return true;
    }

    // Si no hay requisitos, permitir acceso
    return true;
  }
}
