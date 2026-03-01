import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ProfilesService } from '../profiles.service';
import { PERMISSION_KEY } from '../decorators/require-permission.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private profilesService: ProfilesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Obtener los permisos requeridos del decorator
    const requiredPermission = this.reflector.getAllAndOverride<{ module: string; action: string }>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Si no hay permisos requeridos, permitir acceso
    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Si no hay usuario autenticado, denegar
    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    // Verificar si el usuario tiene el permiso
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
}
