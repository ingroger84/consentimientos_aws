import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { MailService } from '../mail/mail.service';
import { ResourceLimitsHelper } from '../common/helpers/resource-limits.helper';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Tenant)
    private tenantsRepository: Repository<Tenant>,
    private mailService: MailService,
  ) {}

  async create(createUserDto: CreateUserDto, tenantId?: string): Promise<User> {
    // VALIDAR LÍMITE DE USUARIOS ANTES DE CREAR
    if (tenantId) {
      await this.checkUserLimit(tenantId);
    }

    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Guardar la contraseña original antes de hashearla (para el correo)
    const temporaryPassword = createUserDto.password;

    // Crear usuario básico sin relaciones
    const userData: any = {
      name: createUserDto.name,
      email: createUserDto.email,
      password: createUserDto.password,
    };

    // Si el usuario que crea tiene tenant, asignar el mismo tenant al nuevo usuario
    if (tenantId) {
      userData.tenant = { id: tenantId };
    }

    const user = this.usersRepository.create(userData);

    // Guardar usuario primero
    const result = await this.usersRepository.save(user);
    const savedUser = Array.isArray(result) ? result[0] : result;

    if (!savedUser || !savedUser.id) {
      throw new Error('Error al crear el usuario');
    }

    // Asignar rol
    if (createUserDto.roleId) {
      await this.usersRepository
        .createQueryBuilder()
        .relation(User, 'role')
        .of(savedUser.id)
        .set(createUserDto.roleId);
    }

    // Asignar sedes si se proporcionaron
    if (createUserDto.branchIds && createUserDto.branchIds.length > 0) {
      await this.usersRepository
        .createQueryBuilder()
        .relation(User, 'branches')
        .of(savedUser.id)
        .add(createUserDto.branchIds);
    }

    // Obtener usuario completo con relaciones
    const completeUser = await this.findOne(savedUser.id, tenantId);

    // Enviar correo de bienvenida
    try {
      await this.mailService.sendWelcomeEmail(completeUser, temporaryPassword);
    } catch (error) {
      console.error('Error al enviar correo de bienvenida:', error);
      // No lanzar error, el usuario ya fue creado exitosamente
    }

    return completeUser;
  }

  async findAll(tenantId?: string): Promise<User[]> {
    const query = this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.branches', 'branches')
      .leftJoinAndSelect('user.tenant', 'tenant')
      .where('user.deleted_at IS NULL');

    // SEGURIDAD CRÍTICA: Si se proporciona tenantId, SOLO mostrar usuarios de ese tenant
    // Esto EXCLUYE automáticamente al Super Admin y usuarios de otros tenants
    if (tenantId) {
      query.andWhere('user.tenantId = :tenantId', { tenantId });
    }
    // Si NO se proporciona tenantId, es el Super Admin viendo todos los usuarios
    // En este caso, mostrar todos (incluyendo Super Admin y usuarios de todos los tenants)

    const users = await query.getMany();

    // Eliminar duplicados de branches manualmente
    users.forEach(user => {
      if (user.branches && user.branches.length > 0) {
        user.branches = Array.from(
          new Map(user.branches.map(b => [b.id, b])).values()
        );
      }
    });

    return users;
  }

  async findOne(id: string, tenantId?: string): Promise<User> {
    const query = this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.branches', 'branches')
      .leftJoinAndSelect('user.tenant', 'tenant')
      .where('user.id = :id', { id })
      .andWhere('user.deleted_at IS NULL');

    // SEGURIDAD CRÍTICA: Si se proporciona tenantId, verificar que el usuario pertenezca a ese tenant
    // Esto PREVIENE que un tenant acceda a usuarios de otros tenants o al Super Admin
    if (tenantId) {
      query.andWhere('user.tenantId = :tenantId', { tenantId });
    }

    const user = await query.getOne();

    if (!user) {
      throw new NotFoundException('Usuario no encontrado o no tienes permisos para acceder a él');
    }

    // Eliminar duplicados de branches
    user.branches = Array.from(
      new Map(user.branches.map(b => [b.id, b])).values()
    );

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.branches', 'branches')
      .leftJoinAndSelect('user.tenant', 'tenant')
      .where('user.email = :email', { email })
      .andWhere('user.deleted_at IS NULL')
      .addSelect('user.password')
      .getOne();

    if (user && user.branches) {
      // Eliminar duplicados de branches
      user.branches = Array.from(
        new Map(user.branches.map(b => [b.id, b])).values()
      );
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto, tenantId?: string): Promise<User> {
    // SEGURIDAD CRÍTICA: Cargar usuario con validación de tenant
    // Si tenantId está presente, solo se puede actualizar usuarios del mismo tenant
    const user = await this.findOne(id, tenantId);

    // VALIDACIÓN ADICIONAL: Si el usuario a actualizar es Super Admin (sin tenant)
    // y el que intenta actualizar tiene tenant, bloquear la operación
    if (!user.tenant && tenantId) {
      throw new NotFoundException('Usuario no encontrado o no tienes permisos para acceder a él');
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingUser) {
        throw new ConflictException('El email ya está registrado');
      }
    }

    // Actualizar campos básicos
    const updateData: any = {};
    if (updateUserDto.name !== undefined) updateData.name = updateUserDto.name;
    if (updateUserDto.email !== undefined) updateData.email = updateUserDto.email;
    if (updateUserDto.isActive !== undefined) updateData.isActive = updateUserDto.isActive;

    if (Object.keys(updateData).length > 0) {
      await this.usersRepository.update(id, updateData);
    }

    // Actualizar rol si se proporciona
    if (updateUserDto.roleId) {
      await this.usersRepository
        .createQueryBuilder()
        .relation(User, 'role')
        .of(id)
        .set(updateUserDto.roleId);
    }

    // Actualizar sedes si se proporciona el campo branchIds
    if (updateUserDto.branchIds !== undefined) {
      // Primero, remover todas las sedes existentes
      await this.usersRepository
        .createQueryBuilder()
        .delete()
        .from('user_branches')
        .where('user_id = :userId', { userId: id })
        .execute();

      // Luego, agregar las nuevas sedes si hay alguna
      if (updateUserDto.branchIds.length > 0) {
        await this.usersRepository
          .createQueryBuilder()
          .relation(User, 'branches')
          .of(id)
          .add(updateUserDto.branchIds);
      }
    }

    // Retornar usuario actualizado
    return this.findOne(id, tenantId);
  }

  async changePassword(id: string, newPassword: string, tenantId?: string): Promise<{ message: string }> {
    const user = await this.findOne(id, tenantId);
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    
    await this.usersRepository.save(user);
    
    return { message: 'Contraseña actualizada correctamente' };
  }

  async remove(id: string, tenantId?: string): Promise<void> {
    const user = await this.findOne(id, tenantId);
    await this.usersRepository.softDelete(id);
  }

  /**
   * Actualizar token de reset de contraseña
   */
  async updateResetToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    await this.usersRepository.update(userId, {
      resetPasswordToken: token,
      resetPasswordExpires: expiresAt,
    });
  }

  /**
   * Buscar usuario por token de reset
   */
  async findByResetToken(token: string): Promise<User | null> {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.tenant', 'tenant')
      .where('user.resetPasswordToken = :token', { token })
      .andWhere('user.deleted_at IS NULL')
      .addSelect('user.resetPasswordToken')
      .addSelect('user.resetPasswordExpires')
      .getOne();

    return user;
  }

  /**
   * Actualizar contraseña del usuario
   */
  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await this.usersRepository.update(userId, {
      password: hashedPassword,
    });
  }

  /**
   * Limpiar token de reset de contraseña
   */
  async clearResetToken(userId: string): Promise<void> {
    await this.usersRepository.update(userId, {
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });
  }

  /**
   * Verificar límite de usuarios del tenant antes de crear
   */
  private async checkUserLimit(tenantId: string): Promise<void> {
    const tenant = await this.tenantsRepository.findOne({
      where: { id: tenantId },
      relations: ['users'],
    });

    if (!tenant) {
      throw new NotFoundException('Tenant no encontrado');
    }

    const currentCount = tenant.users?.filter(u => !u.deletedAt).length || 0;
    
    // Usar el helper para validar el límite
    ResourceLimitsHelper.validateUserLimit(tenant, currentCount);
  }
}
