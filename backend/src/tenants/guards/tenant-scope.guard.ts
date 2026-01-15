import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class TenantScopeGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Super Admin puede acceder a todo
    if (user?.role?.name === 'super_admin') {
      return true;
    }

    // Usuarios normales solo pueden acceder a su tenant
    const tenantId = request.params.tenantId || request.body.tenantId || request.query.tenantId;
    
    if (tenantId && user?.tenant?.id !== tenantId) {
      throw new ForbiddenException('No tienes acceso a este tenant');
    }

    return true;
  }
}
