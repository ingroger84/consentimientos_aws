import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './entities/profile.entity';
import { SystemModule } from './entities/system-module.entity';
import { ModuleAction } from './entities/module-action.entity';
import { PermissionAudit } from './entities/permission-audit.entity';
import { User } from '../users/entities/user.entity';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    @InjectRepository(SystemModule)
    private moduleRepository: Repository<SystemModule>,
    @InjectRepository(ModuleAction)
    private actionRepository: Repository<ModuleAction>,
    @InjectRepository(PermissionAudit)
    private auditRepository: Repository<PermissionAudit>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Crear un nuevo perfil
   */
  async create(
    createProfileDto: CreateProfileDto,
    performedBy: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Profile> {
    // Obtener el usuario que está creando el perfil
    const performingUser = await this.userRepository.findOne({
      where: { id: performedBy },
      relations: ['profile', 'role'],
    });

    if (!performingUser) {
      throw new BadRequestException('Usuario no encontrado');
    }

    // Validar que los módulos y acciones existan
    await this.validatePermissions(createProfileDto.permissions);

    // SEGURIDAD: Verificar que no se intente crear un perfil con permisos de super admin
    // Solo super admins pueden crear perfiles con permisos globales (*)
    const hasGlobalPermissions = createProfileDto.permissions.some(
      (p) => p.module === '*' || p.actions.includes('*'),
    );

    const isSuperAdmin = performingUser.role?.name === 'super_admin';

    if (hasGlobalPermissions && !isSuperAdmin) {
      throw new ForbiddenException(
        'Solo los super administradores pueden crear perfiles con permisos globales',
      );
    }

    // SEGURIDAD: Verificar que no se intente crear perfiles con permisos de super_admin
    const hasSuperAdminPermissions = createProfileDto.permissions.some(
      (p) => p.module === 'super_admin',
    );

    if (hasSuperAdminPermissions && !isSuperAdmin) {
      throw new ForbiddenException(
        'Solo los super administradores pueden crear perfiles con acceso a funciones de super admin',
      );
    }

    // SEGURIDAD: Verificar que no se intente crear perfiles con permisos de gestión de perfiles
    // si el usuario no es super admin
    const hasProfileManagementPermissions = createProfileDto.permissions.some(
      (p) => p.module === 'profiles' && (p.actions.includes('create') || p.actions.includes('delete')),
    );

    if (hasProfileManagementPermissions && !isSuperAdmin) {
      throw new ForbiddenException(
        'Solo los super administradores pueden crear perfiles con permisos de gestión de perfiles',
      );
    }

    // Verificar que no exista un perfil con el mismo nombre en el mismo tenant
    const existing = await this.profileRepository.findOne({
      where: {
        name: createProfileDto.name,
        tenantId: createProfileDto.tenantId || null,
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Ya existe un perfil con el nombre "${createProfileDto.name}" en este tenant`,
      );
    }

    const profile = this.profileRepository.create({
      ...createProfileDto,
      isSystem: false, // Los perfiles creados por usuarios no son del sistema
    });

    const savedProfile = await this.profileRepository.save(profile);

    // Auditar la creación
    await this.auditRepository.save({
      profileId: savedProfile.id,
      action: 'created',
      changes: { profile: savedProfile },
      performedBy,
      ipAddress,
      userAgent,
    });

    return savedProfile;
  }

  /**
   * Obtener todos los perfiles
   */
  async findAll(tenantId?: string): Promise<Profile[]> {
    const query = this.profileRepository
      .createQueryBuilder('profile')
      .leftJoinAndSelect('profile.tenant', 'tenant')
      .where('profile.deleted_at IS NULL');

    if (tenantId) {
      // Perfiles del tenant específico + perfiles globales
      query.andWhere('(profile.tenant_id = :tenantId OR profile.tenant_id IS NULL)', {
        tenantId,
      });
    } else {
      // Solo perfiles globales
      query.andWhere('profile.tenant_id IS NULL');
    }

    return query.orderBy('profile.name', 'ASC').getMany();
  }

  /**
   * Obtener un perfil por ID
   */
  async findOne(id: string): Promise<Profile> {
    const profile = await this.profileRepository.findOne({
      where: { id },
      relations: ['tenant', 'users'],
    });

    if (!profile) {
      throw new NotFoundException(`Perfil con ID ${id} no encontrado`);
    }

    return profile;
  }

  /**
   * Actualizar un perfil
   */
  async update(
    id: string,
    updateProfileDto: UpdateProfileDto,
    performedBy: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Profile> {
    const profile = await this.findOne(id);

    // No permitir editar perfiles del sistema
    if (profile.isSystem) {
      throw new ForbiddenException('No se pueden editar perfiles del sistema');
    }

    // Obtener el usuario que está actualizando el perfil
    const performingUser = await this.userRepository.findOne({
      where: { id: performedBy },
      relations: ['profile', 'role'],
    });

    if (!performingUser) {
      throw new BadRequestException('Usuario no encontrado');
    }

    const isSuperAdmin = performingUser.role?.name === 'super_admin';

    // Validar permisos si se están actualizando
    if (updateProfileDto.permissions) {
      await this.validatePermissions(updateProfileDto.permissions);

      // SEGURIDAD: Verificar que no se intente agregar permisos de super admin
      const hasGlobalPermissions = updateProfileDto.permissions.some(
        (p) => p.module === '*' || p.actions.includes('*'),
      );

      if (hasGlobalPermissions && !isSuperAdmin) {
        throw new ForbiddenException(
          'Solo los super administradores pueden asignar permisos globales',
        );
      }

      // SEGURIDAD: Verificar que no se intente agregar permisos de super_admin
      const hasSuperAdminPermissions = updateProfileDto.permissions.some(
        (p) => p.module === 'super_admin',
      );

      if (hasSuperAdminPermissions && !isSuperAdmin) {
        throw new ForbiddenException(
          'Solo los super administradores pueden asignar acceso a funciones de super admin',
        );
      }

      // SEGURIDAD: Verificar que no se intente agregar permisos de gestión de perfiles
      const hasProfileManagementPermissions = updateProfileDto.permissions.some(
        (p) => p.module === 'profiles' && (p.actions.includes('create') || p.actions.includes('delete')),
      );

      if (hasProfileManagementPermissions && !isSuperAdmin) {
        throw new ForbiddenException(
          'Solo los super administradores pueden asignar permisos de gestión de perfiles',
        );
      }
    }

    const oldProfile = { ...profile };

    Object.assign(profile, updateProfileDto);
    const updatedProfile = await this.profileRepository.save(profile);

    // Auditar la actualización
    await this.auditRepository.save({
      profileId: updatedProfile.id,
      action: 'updated',
      changes: {
        before: oldProfile,
        after: updatedProfile,
      },
      performedBy,
      ipAddress,
      userAgent,
    });

    return updatedProfile;
  }

  /**
   * Eliminar un perfil (soft delete)
   */
  async remove(
    id: string,
    performedBy: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const profile = await this.findOne(id);

    // No permitir eliminar perfiles del sistema
    if (profile.isSystem) {
      throw new ForbiddenException('No se pueden eliminar perfiles del sistema');
    }

    // Verificar si hay usuarios asignados
    const usersCount = await this.userRepository.count({
      where: { profileId: id },
    });

    if (usersCount > 0) {
      throw new BadRequestException(
        `No se puede eliminar el perfil porque tiene ${usersCount} usuario(s) asignado(s)`,
      );
    }

    await this.profileRepository.softDelete(id);

    // Auditar la eliminación
    await this.auditRepository.save({
      profileId: id,
      action: 'deleted',
      changes: { profile },
      performedBy,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Asignar un perfil a un usuario
   */
  async assignToUser(
    profileId: string,
    userId: string,
    performedBy: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<User> {
    const profile = await this.findOne(profileId);
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    // Verificar que el perfil sea compatible con el tenant del usuario
    if (profile.tenantId && user.tenant?.id !== profile.tenantId) {
      throw new BadRequestException(
        'El perfil no es compatible con el tenant del usuario',
      );
    }

    const oldProfileId = user.profileId;
    user.profileId = profileId;
    const updatedUser = await this.userRepository.save(user);

    // Auditar la asignación
    await this.auditRepository.save({
      profileId,
      userId,
      action: 'assigned',
      changes: {
        oldProfileId,
        newProfileId: profileId,
      },
      performedBy,
      ipAddress,
      userAgent,
    });

    return updatedUser;
  }

  /**
   * Revocar el perfil de un usuario
   */
  async revokeFromUser(
    userId: string,
    performedBy: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    const oldProfileId = user.profileId;
    user.profileId = null;
    const updatedUser = await this.userRepository.save(user);

    // Auditar la revocación
    if (oldProfileId) {
      await this.auditRepository.save({
        profileId: oldProfileId,
        userId,
        action: 'revoked',
        changes: { oldProfileId },
        performedBy,
        ipAddress,
        userAgent,
      });
    }

    return updatedUser;
  }

  /**
   * Verificar si un usuario tiene un permiso específico
   */
  async checkUserPermission(
    userId: string,
    moduleCode: string,
    action: string,
  ): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile', 'role'],
    });

    if (!user) {
      return false;
    }

    // Super admin tiene todos los permisos
    if (user.role?.name === 'super_admin') {
      return true;
    }

    // Si no tiene perfil asignado, usar permisos del rol (legacy)
    if (!user.profile) {
      // Aquí podrías implementar lógica de permisos basada en roles
      return false;
    }

    return user.profile.hasPermission(moduleCode, action);
  }

  /**
   * Obtener todos los módulos del sistema
   */
  async getAllModules(): Promise<SystemModule[]> {
    return this.moduleRepository.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC', name: 'ASC' },
    });
  }

  /**
   * Obtener módulos agrupados por categoría
   */
  async getModulesByCategory(): Promise<Record<string, SystemModule[]>> {
    const modules = await this.getAllModules();

    return modules.reduce((acc, module) => {
      const category = module.category || 'other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(module);
      return acc;
    }, {} as Record<string, SystemModule[]>);
  }

  /**
   * Obtener acciones de un módulo
   */
  async getModuleActions(moduleId: string): Promise<ModuleAction[]> {
    return this.actionRepository.find({
      where: { moduleId },
      order: { name: 'ASC' },
    });
  }

  /**
   * Obtener auditoría de un perfil
   */
  async getProfileAudit(profileId: string): Promise<PermissionAudit[]> {
    return this.auditRepository.find({
      where: { profileId },
      relations: ['performer', 'user'],
      order: { performedAt: 'DESC' },
      take: 100,
    });
  }

  /**
   * Validar que los permisos sean válidos
   */
  private async validatePermissions(permissions: any[]): Promise<void> {
    for (const permission of permissions) {
      // Si es permiso global, no validar
      if (permission.module === '*') {
        continue;
      }

      // Verificar que el módulo exista
      const module = await this.moduleRepository.findOne({
        where: { code: permission.module },
      });

      if (!module) {
        throw new BadRequestException(
          `El módulo "${permission.module}" no existe`,
        );
      }

      // Si tiene acciones específicas (no "*"), verificar que existan
      if (!permission.actions.includes('*')) {
        const moduleActions = await this.getModuleActions(module.id);
        const validActions = moduleActions.map((a) => a.code);

        for (const action of permission.actions) {
          if (!validActions.includes(action)) {
            throw new BadRequestException(
              `La acción "${action}" no es válida para el módulo "${permission.module}"`,
            );
          }
        }
      }
    }
  }
}
