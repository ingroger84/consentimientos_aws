import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PERMISSIONS } from '../auth/constants/permissions';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async findAll(excludeSuperAdmin: boolean = false): Promise<Role[]> {
    const query = this.rolesRepository.createQueryBuilder('role');
    
    // SEGURIDAD CRÍTICA: Si excludeSuperAdmin es true, excluir el rol de Super Admin
    // Esto previene que usuarios de tenant vean o modifiquen el rol Super Admin
    if (excludeSuperAdmin) {
      query.where('role.type != :superAdminType', { superAdminType: 'super_admin' });
    }
    
    return query.getMany();
  }

  async update(id: string, updateRoleDto: UpdateRoleDto, userTenantId?: string): Promise<Role> {
    const role = await this.rolesRepository.findOne({ where: { id } });
    
    if (!role) {
      throw new NotFoundException('Rol no encontrado');
    }

    // SEGURIDAD CRÍTICA: Si el usuario tiene tenant, NO puede modificar el rol Super Admin
    if (userTenantId && role.type === 'super_admin') {
      throw new NotFoundException('Rol no encontrado o no tienes permisos para modificarlo');
    }

    // SEGURIDAD CRÍTICA: Si el usuario tiene tenant, NO puede asignar el permiso manage_tenants
    if (userTenantId && updateRoleDto.permissions) {
      const hasManageTenantsPermission = updateRoleDto.permissions.includes(PERMISSIONS.MANAGE_TENANTS);
      
      if (hasManageTenantsPermission) {
        throw new BadRequestException(
          'No tienes permisos para asignar el permiso "Gestionar tenants". ' +
          'Este permiso es exclusivo del Super Admin.'
        );
      }
    }

    if (updateRoleDto.permissions !== undefined) {
      role.permissions = updateRoleDto.permissions;
    }

    return this.rolesRepository.save(role);
  }
}
