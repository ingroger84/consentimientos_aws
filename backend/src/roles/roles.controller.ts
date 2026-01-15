import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { PERMISSIONS, PERMISSION_DESCRIPTIONS, PERMISSION_CATEGORIES } from '../auth/constants/permissions';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('roles')
@UseGuards(JwtAuthGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.VIEW_ROLES)
  findAll(@CurrentUser() user: User) {
    // SEGURIDAD CRÍTICA: Si el usuario tiene tenant, excluir el rol Super Admin
    // Solo el Super Admin (sin tenant) puede ver todos los roles
    const excludeSuperAdmin = !!user.tenant;
    return this.rolesService.findAll(excludeSuperAdmin);
  }

  @Get('permissions')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.VIEW_ROLES)
  getPermissions(@CurrentUser() user: User) {
    // SEGURIDAD CRÍTICA: Filtrar permisos según el tipo de usuario
    const isSuperAdmin = !user.tenant;
    
    let permissions = Object.values(PERMISSIONS);
    let descriptions = { ...PERMISSION_DESCRIPTIONS };
    let categories = { ...PERMISSION_CATEGORIES };
    
    // Si NO es Super Admin, excluir el permiso de gestionar tenants
    if (!isSuperAdmin) {
      // Filtrar el permiso manage_tenants
      permissions = permissions.filter(p => p !== PERMISSIONS.MANAGE_TENANTS);
      
      // Eliminar la descripción del permiso
      delete descriptions[PERMISSIONS.MANAGE_TENANTS];
      
      // Eliminar la categoría de tenants
      delete categories.tenants;
    }
    
    return {
      permissions,
      descriptions,
      categories,
    };
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.EDIT_ROLES)
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto, @CurrentUser() user: User) {
    // SEGURIDAD CRÍTICA: Pasar tenantId para validar que no se modifique el rol Super Admin
    const userTenantId = user.tenant?.id;
    return this.rolesService.update(id, updateRoleDto, userTenantId);
  }
}
