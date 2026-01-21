import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Tenant, TenantStatus } from './entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { User } from '../users/entities/user.entity';
import { Role, RoleType } from '../roles/entities/role.entity';
import { SettingsService } from '../settings/settings.service';
import { MailService } from '../mail/mail.service';
import { applyPlanLimits } from './tenants-plan.helper';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private tenantsRepository: Repository<Tenant>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    private dataSource: DataSource,
    private settingsService: SettingsService,
    private mailService: MailService,
  ) {}

  async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    // Aplicar límites y configuración del plan seleccionado
    createTenantDto = applyPlanLimits(createTenantDto);

    // Usar transacción para crear tenant y usuario administrador
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Generar slug si no se proporciona
      if (!createTenantDto.slug) {
        createTenantDto.slug = this.generateSlug(createTenantDto.name);
      }

      // Verificar que el slug sea único (solo entre tenants activos)
      const existingTenant = await this.tenantsRepository.findOne({
        where: { slug: createTenantDto.slug },
        withDeleted: false, // Solo buscar tenants NO eliminados
      });

      if (existingTenant) {
        throw new ConflictException('El slug ya está en uso. Por favor usa uno diferente.');
      }

      // Verificar que el email del administrador sea único (solo entre usuarios activos)
      const existingUser = await this.usersRepository.findOne({
        where: { email: createTenantDto.adminUser.email },
        withDeleted: false, // Solo buscar usuarios NO eliminados
      });

      if (existingUser) {
        throw new ConflictException('El email del administrador ya está en uso. Por favor usa uno diferente.');
      }

      // Establecer fecha de fin de trial (30 días por defecto)
      if (!createTenantDto.trialEndsAt && createTenantDto.status === TenantStatus.TRIAL) {
        const trialDays = 30;
        createTenantDto.trialEndsAt = new Date();
        createTenantDto.trialEndsAt.setDate(createTenantDto.trialEndsAt.getDate() + trialDays);
      }

      // Establecer día de facturación (día actual si no se especifica)
      if (!createTenantDto.billingDay) {
        const now = new Date();
        createTenantDto.billingDay = Math.min(now.getDate(), 28); // Máximo día 28 para evitar problemas con febrero
      }

      // Crear el tenant
      const { adminUser, ...tenantData } = createTenantDto;
      const tenant = this.tenantsRepository.create(tenantData);
      const savedTenant = await queryRunner.manager.save(tenant);

      // Obtener el rol de Administrador General
      const adminRole = await this.rolesRepository.findOne({
        where: { type: RoleType.ADMIN_GENERAL },
      });

      if (!adminRole) {
        throw new BadRequestException('Rol de Administrador General no encontrado');
      }

      // Crear el usuario administrador del tenant
      const hashedPassword = await bcrypt.hash(adminUser.password, 10);
      const user = this.usersRepository.create({
        name: adminUser.name,
        email: adminUser.email,
        password: hashedPassword,
        role: adminRole,
        tenant: savedTenant,
        branches: [], // Se asignarán sedes después
      });

      const savedUser = await queryRunner.manager.save(user);

      // Commit de la transacción
      await queryRunner.commitTransaction();

      console.log('[TenantsService] Tenant creado exitosamente:', savedTenant.id);
      console.log('[TenantsService] Datos para inicializar settings:', {
        name: savedTenant.name,
        contactName: savedTenant.contactName,
        contactEmail: savedTenant.contactEmail,
        contactPhone: savedTenant.contactPhone,
      });

      // INICIALIZAR CONFIGURACIÓN DEL TENANT
      // Se hace DESPUÉS del commit para que el tenant ya exista en la BD
      await this.settingsService.initializeTenantSettings(savedTenant.id, {
        name: savedTenant.name,
        contactName: savedTenant.contactName,
        contactEmail: savedTenant.contactEmail,
        contactPhone: savedTenant.contactPhone,
      });

      console.log('[TenantsService] Configuración del tenant inicializada');

      // ENVIAR EMAIL DE BIENVENIDA AL ADMINISTRADOR
      try {
        // Cargar el usuario completo con relaciones para el correo
        const userWithRelations = await this.usersRepository.findOne({
          where: { id: savedUser.id },
          relations: ['role', 'tenant'],
        });
        
        if (userWithRelations) {
          await this.mailService.sendWelcomeEmail(userWithRelations, adminUser.password);
          console.log('[TenantsService] Correo de bienvenida enviado a:', userWithRelations.email);
        }
      } catch (emailError) {
        // No fallar la creación del tenant si el correo falla
        console.error('[TenantsService] Error al enviar correo de bienvenida:', emailError.message);
      }

      return savedTenant;
    } catch (error) {
      // Rollback en caso de error
      await queryRunner.rollbackTransaction();
      
      // Mejorar mensajes de error
      if (error.code === '23505') { // Unique violation
        if (error.detail?.includes('slug')) {
          throw new ConflictException('El slug ya está en uso. Por favor usa uno diferente.');
        } else if (error.detail?.includes('email')) {
          throw new ConflictException('El email del administrador ya está en uso. Por favor usa uno diferente.');
        }
        throw new ConflictException('Ya existe un registro con estos datos. Por favor verifica los campos únicos.');
      } else if (error.code === '23503') { // Foreign key violation
        throw new BadRequestException('Error de referencia de datos. Por favor contacta al soporte técnico.');
      } else if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      
      // Error genérico con más detalles
      console.error('Error al crear tenant:', error);
      throw new BadRequestException(`Error al crear el tenant: ${error.message || 'Error desconocido'}`);
    } finally {
      // Liberar el queryRunner
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Tenant[]> {
    return await this.tenantsRepository.find({
      relations: ['users', 'branches', 'services', 'consents'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Tenant> {
    const tenant = await this.tenantsRepository.findOne({
      where: { id },
      relations: ['users', 'branches', 'services', 'consents'],
    });

    if (!tenant) {
      throw new NotFoundException('Tenant no encontrado');
    }

    return tenant;
  }

  async findBySlug(slug: string): Promise<Tenant> {
    const tenant = await this.tenantsRepository.findOne({
      where: { slug },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant no encontrado');
    }

    return tenant;
  }

  async update(id: string, updateTenantDto: UpdateTenantDto): Promise<Tenant> {
    const tenant = await this.findOne(id);

    // Si se actualiza el slug, verificar que sea único
    if (updateTenantDto.slug && updateTenantDto.slug !== tenant.slug) {
      const existingTenant = await this.tenantsRepository.findOne({
        where: { slug: updateTenantDto.slug },
      });

      if (existingTenant) {
        throw new ConflictException('El slug ya está en uso');
      }
    }

    Object.assign(tenant, updateTenantDto);
    return await this.tenantsRepository.save(tenant);
  }

  async suspend(id: string): Promise<Tenant> {
    const tenant = await this.findOne(id);
    tenant.status = TenantStatus.SUSPENDED;
    return await this.tenantsRepository.save(tenant);
  }

  async activate(id: string): Promise<Tenant> {
    const tenant = await this.findOne(id);
    tenant.status = TenantStatus.ACTIVE;
    return await this.tenantsRepository.save(tenant);
  }

  async remove(id: string): Promise<void> {
    const tenant = await this.findOne(id);
    
    // Soft delete de todos los usuarios del tenant
    if (tenant.users && tenant.users.length > 0) {
      const userIds = tenant.users.map(u => u.id);
      await this.usersRepository.softDelete(userIds);
    }
    
    // Soft delete del tenant (esto también eliminará en cascada sedes, servicios, etc.)
    await this.tenantsRepository.softDelete(id);
  }

  async getStats(id: string) {
    const tenant = await this.findOne(id);

    const stats = {
      totalUsers: tenant.users?.length || 0,
      totalBranches: tenant.branches?.length || 0,
      totalServices: tenant.services?.length || 0,
      totalConsents: tenant.consents?.length || 0,
      maxUsers: tenant.maxUsers,
      maxBranches: tenant.maxBranches,
      maxConsents: tenant.maxConsents,
      usagePercentage: {
        users: ((tenant.users?.length || 0) / tenant.maxUsers) * 100,
        branches: ((tenant.branches?.length || 0) / tenant.maxBranches) * 100,
        consents: ((tenant.consents?.length || 0) / tenant.maxConsents) * 100,
      },
      status: tenant.status,
      plan: tenant.plan,
      trialEndsAt: tenant.trialEndsAt,
      subscriptionEndsAt: tenant.subscriptionEndsAt,
    };

    return stats;
  }

  async getGlobalStats() {
    const tenants = await this.tenantsRepository.find({
      relations: ['users', 'branches', 'services', 'consents'],
    });

    // Calcular tenants cerca del límite y en el límite
    let tenantsNearLimit = 0;
    let tenantsAtLimit = 0;

    tenants.forEach(tenant => {
      const userCount = tenant.users?.filter(u => !u.deletedAt).length || 0;
      const branchCount = tenant.branches?.filter(b => !b.deletedAt).length || 0;
      const consentCount = tenant.consents?.filter(c => !c.deletedAt).length || 0;

      const userPercentage = (userCount / tenant.maxUsers) * 100;
      const branchPercentage = (branchCount / tenant.maxBranches) * 100;
      const consentPercentage = (consentCount / tenant.maxConsents) * 100;

      const maxPercentage = Math.max(userPercentage, branchPercentage, consentPercentage);

      if (maxPercentage >= 100) {
        tenantsAtLimit++;
      } else if (maxPercentage >= 80) {
        tenantsNearLimit++;
      }
    });

    // Datos de crecimiento (últimos 6 meses)
    const now = new Date();
    const growthData = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const monthName = monthStart.toLocaleDateString('es-ES', { month: 'short' });
      
      // Contar tenants creados EN ese mes específico
      const tenantsInMonth = tenants.filter(t => {
        const createdDate = new Date(t.createdAt);
        return createdDate >= monthStart && createdDate <= monthEnd;
      }).length;

      // Contar consentimientos creados EN ese mes
      let consentsInMonth = 0;
      tenants.forEach(t => {
        const consentsCount = t.consents?.filter(c => {
          if (c.deletedAt) return false;
          const consentDate = new Date(c.createdAt);
          return consentDate >= monthStart && consentDate <= monthEnd;
        }).length || 0;
        consentsInMonth += consentsCount;
      });

      growthData.push({
        month: monthName,
        tenants: tenantsInMonth,
        users: Math.floor(tenantsInMonth * 3.5), // Promedio estimado
        consents: consentsInMonth,
      });
    }

    // Distribución por plan
    const tenantsByPlan = [
      { plan: 'Gratuito', count: tenants.filter(t => t.plan === 'free').length },
      { plan: 'Básico', count: tenants.filter(t => t.plan === 'basic').length },
      { plan: 'Emprendedor', count: tenants.filter(t => t.plan === 'professional').length },
      { plan: 'Plus', count: tenants.filter(t => t.plan === 'enterprise').length },
      { plan: 'Empresarial', count: tenants.filter(t => t.plan === 'custom').length },
    ].filter(item => item.count > 0);

    // Top tenants por actividad
    const topTenants = tenants
      .map(tenant => ({
        id: tenant.id,
        name: tenant.name,
        plan: tenant.plan,
        consentsCount: tenant.consents?.filter(c => !c.deletedAt).length || 0,
        usersCount: tenant.users?.filter(u => !u.deletedAt).length || 0,
        lastActivity: tenant.updatedAt || tenant.createdAt,
      }))
      .sort((a, b) => b.consentsCount - a.consentsCount)
      .slice(0, 10);

    const stats = {
      totalTenants: tenants.length,
      activeTenants: tenants.filter(t => t.status === TenantStatus.ACTIVE).length,
      suspendedTenants: tenants.filter(t => t.status === TenantStatus.SUSPENDED).length,
      trialTenants: tenants.filter(t => t.status === TenantStatus.TRIAL).length,
      expiredTenants: tenants.filter(t => t.status === TenantStatus.EXPIRED).length,
      totalUsers: tenants.reduce((sum, t) => sum + (t.users?.filter(u => !u.deletedAt).length || 0), 0),
      totalBranches: tenants.reduce((sum, t) => sum + (t.branches?.filter(b => !b.deletedAt).length || 0), 0),
      totalServices: tenants.reduce((sum, t) => sum + (t.services?.filter(s => !s.deletedAt).length || 0), 0),
      totalConsents: tenants.reduce((sum, t) => sum + (t.consents?.filter(c => !c.deletedAt).length || 0), 0),
      planDistribution: {
        free: tenants.filter(t => t.plan === 'free').length,
        basic: tenants.filter(t => t.plan === 'basic').length,
        professional: tenants.filter(t => t.plan === 'professional').length,
        enterprise: tenants.filter(t => t.plan === 'enterprise').length,
      },
      // Campos adicionales para el dashboard del Super Admin
      tenantsNearLimit,
      tenantsAtLimit,
      growthData,
      tenantsByPlan,
      topTenants,
    };

    return stats;
  }

  async getUsage(id: string) {
    const tenant = await this.findOne(id);

    // Contar recursos activos (no eliminados)
    const usersCount = tenant.users?.filter(u => !u.deletedAt).length || 0;
    const branchesCount = tenant.branches?.filter(b => !b.deletedAt).length || 0;
    const servicesCount = tenant.services?.filter(s => !s.deletedAt).length || 0;
    const consentsCount = tenant.consents?.filter(c => !c.deletedAt).length || 0;

    // Calcular almacenamiento usado (simulado por ahora - en MB)
    // En producción, esto debería calcular el tamaño real de archivos subidos
    const storageUsedMb = Math.floor(consentsCount * 0.5); // Estimado: 0.5 MB por consentimiento

    // Calcular porcentajes
    const calculatePercentage = (current: number, max: number) => {
      if (max === 0) return 0;
      return Math.min(Math.round((current / max) * 100), 100);
    };

    const usage = {
      plan: {
        id: tenant.plan,
        name: this.getPlanName(tenant.plan),
        billingCycle: tenant.billingCycle,
        status: tenant.status,
        trialEndsAt: tenant.trialEndsAt,
        subscriptionEndsAt: tenant.subscriptionEndsAt,
      },
      resources: {
        users: {
          current: usersCount,
          max: tenant.maxUsers,
          percentage: calculatePercentage(usersCount, tenant.maxUsers),
          status: this.getUsageStatus(usersCount, tenant.maxUsers),
        },
        branches: {
          current: branchesCount,
          max: tenant.maxBranches,
          percentage: calculatePercentage(branchesCount, tenant.maxBranches),
          status: this.getUsageStatus(branchesCount, tenant.maxBranches),
        },
        services: {
          current: servicesCount,
          max: tenant.maxServices || 999999,
          percentage: calculatePercentage(servicesCount, tenant.maxServices || 999999),
          status: this.getUsageStatus(servicesCount, tenant.maxServices || 999999),
        },
        consents: {
          current: consentsCount,
          max: tenant.maxConsents,
          percentage: calculatePercentage(consentsCount, tenant.maxConsents),
          status: this.getUsageStatus(consentsCount, tenant.maxConsents),
        },
        questions: {
          current: 0, // TODO: Implementar conteo de preguntas personalizadas
          max: tenant.maxQuestions || 999999,
          percentage: 0,
          status: 'normal' as const,
        },
        storage: {
          current: storageUsedMb,
          max: tenant.storageLimitMb || 999999,
          percentage: calculatePercentage(storageUsedMb, tenant.storageLimitMb || 999999),
          status: this.getUsageStatus(storageUsedMb, tenant.storageLimitMb || 999999),
          unit: 'MB',
        },
      },
      alerts: this.generateUsageAlerts(tenant, {
        usersCount,
        branchesCount,
        servicesCount,
        consentsCount,
        storageUsedMb,
      }),
    };

    return usage;
  }

  private getPlanName(planId: string): string {
    const planNames = {
      free: 'Gratuito',
      basic: 'Básico',
      professional: 'Profesional',
      enterprise: 'Empresarial',
      custom: 'Enterprise',
    };
    return planNames[planId] || planId;
  }

  private getUsageStatus(current: number, max: number): 'normal' | 'warning' | 'critical' {
    const percentage = (current / max) * 100;
    if (percentage >= 100) return 'critical';
    if (percentage >= 80) return 'warning';
    return 'normal';
  }

  private generateUsageAlerts(tenant: Tenant, counts: {
    usersCount: number;
    branchesCount: number;
    servicesCount: number;
    consentsCount: number;
    storageUsedMb: number;
  }) {
    const alerts = [];

    // Alertas de límites alcanzados
    if (counts.usersCount >= tenant.maxUsers) {
      alerts.push({
        type: 'critical',
        resource: 'users',
        message: `Has alcanzado el límite de usuarios (${counts.usersCount}/${tenant.maxUsers})`,
      });
    } else if (counts.usersCount >= tenant.maxUsers * 0.8) {
      alerts.push({
        type: 'warning',
        resource: 'users',
        message: `Estás cerca del límite de usuarios (${counts.usersCount}/${tenant.maxUsers})`,
      });
    }

    if (counts.branchesCount >= tenant.maxBranches) {
      alerts.push({
        type: 'critical',
        resource: 'branches',
        message: `Has alcanzado el límite de sedes (${counts.branchesCount}/${tenant.maxBranches})`,
      });
    } else if (counts.branchesCount >= tenant.maxBranches * 0.8) {
      alerts.push({
        type: 'warning',
        resource: 'branches',
        message: `Estás cerca del límite de sedes (${counts.branchesCount}/${tenant.maxBranches})`,
      });
    }

    if (counts.consentsCount >= tenant.maxConsents) {
      alerts.push({
        type: 'critical',
        resource: 'consents',
        message: `Has alcanzado el límite de consentimientos (${counts.consentsCount}/${tenant.maxConsents})`,
      });
    } else if (counts.consentsCount >= tenant.maxConsents * 0.8) {
      alerts.push({
        type: 'warning',
        resource: 'consents',
        message: `Estás cerca del límite de consentimientos (${counts.consentsCount}/${tenant.maxConsents})`,
      });
    }

    const maxStorage = tenant.storageLimitMb || 999999;
    if (counts.storageUsedMb >= maxStorage) {
      alerts.push({
        type: 'critical',
        resource: 'storage',
        message: `Has alcanzado el límite de almacenamiento (${counts.storageUsedMb}/${maxStorage} MB)`,
      });
    } else if (counts.storageUsedMb >= maxStorage * 0.8) {
      alerts.push({
        type: 'warning',
        resource: 'storage',
        message: `Estás cerca del límite de almacenamiento (${counts.storageUsedMb}/${maxStorage} MB)`,
      });
    }

    // Alerta de trial próximo a expirar
    if (tenant.status === TenantStatus.TRIAL && tenant.trialEndsAt) {
      const daysUntilExpiry = Math.ceil(
        (tenant.trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
        alerts.push({
          type: 'warning',
          resource: 'trial',
          message: `Tu período de prueba expira en ${daysUntilExpiry} días`,
        });
      } else if (daysUntilExpiry <= 0) {
        alerts.push({
          type: 'critical',
          resource: 'trial',
          message: 'Tu período de prueba ha expirado',
        });
      }
    }

    return alerts;
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async checkLimits(tenantId: string, type: 'users' | 'branches' | 'consents'): Promise<boolean> {
    const tenant = await this.findOne(tenantId);

    switch (type) {
      case 'users':
        return (tenant.users?.length || 0) < tenant.maxUsers;
      case 'branches':
        return (tenant.branches?.length || 0) < tenant.maxBranches;
      case 'consents':
        return (tenant.consents?.length || 0) < tenant.maxConsents;
      default:
        return false;
    }
  }

  async resendWelcomeEmail(tenantId: string): Promise<{ message: string }> {
    // Buscar el tenant
    const tenant = await this.findOne(tenantId);

    // Buscar el usuario administrador del tenant (el primero creado con rol admin_general)
    const adminUser = await this.usersRepository.findOne({
      where: {
        tenant: { id: tenantId },
        role: { type: RoleType.ADMIN_GENERAL },
      },
      relations: ['role', 'tenant'],
      order: { createdAt: 'ASC' }, // El primer admin creado
    });

    if (!adminUser) {
      throw new NotFoundException('No se encontró el usuario administrador del tenant');
    }

    try {
      // Generar una nueva contraseña temporal
      const temporaryPassword = this.generateTemporaryPassword();
      
      // Actualizar la contraseña del usuario
      const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
      adminUser.password = hashedPassword;
      await this.usersRepository.save(adminUser);
      
      // Enviar correo con la nueva contraseña
      await this.mailService.sendWelcomeEmail(adminUser, temporaryPassword);
      
      console.log('[TenantsService] Correo de bienvenida reenviado a:', adminUser.email);
      console.log('[TenantsService] Nueva contraseña temporal generada');
      
      return {
        message: `Correo de bienvenida enviado exitosamente a ${adminUser.email} con una nueva contraseña temporal`,
      };
    } catch (error) {
      console.error('[TenantsService] Error al reenviar correo de bienvenida:', error);
      throw new BadRequestException(
        `No se pudo enviar el correo: ${error.message}. ` +
        'Verifica la configuración SMTP en el archivo .env.'
      );
    }
  }

  private generateTemporaryPassword(): string {
    // Generar contraseña temporal de 12 caracteres
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  /**
   * Encuentra todos los tenants que tienen un plan específico
   */
  async findByPlan(planId: string): Promise<Tenant[]> {
    return await this.tenantsRepository.find({
      where: { plan: planId as any },
      relations: ['users', 'branches', 'services', 'consents'],
    });
  }

  /**
   * Actualiza los límites de un tenant basándose en la configuración del plan
   */
  async updateLimitsFromPlan(tenantId: string, planLimits: any): Promise<Tenant> {
    const tenant = await this.findOne(tenantId);

    // Actualizar los límites del tenant
    tenant.maxUsers = planLimits.users;
    tenant.maxBranches = planLimits.branches;
    tenant.maxConsents = planLimits.consents;
    tenant.maxServices = planLimits.services;
    tenant.maxQuestions = planLimits.questions;
    tenant.storageLimitMb = planLimits.storageMb;

    return await this.tenantsRepository.save(tenant);
  }

  async updatePlan(planId: string, updateData: any): Promise<any> {
    const fs = require('fs');
    const path = require('path');
    
    try {
      // Importar los planes actuales directamente desde el módulo compilado
      const plansConfigPath = path.join(__dirname, './plans.config');
      
      // Limpiar cache antes de importar
      const resolvedPath = require.resolve(plansConfigPath);
      if (require.cache[resolvedPath]) {
        delete require.cache[resolvedPath];
      }
      
      const { PLANS } = require(plansConfigPath);
      
      // Verificar que el plan existe
      if (!PLANS[planId]) {
        throw new NotFoundException(`Plan ${planId} no encontrado`);
      }
      
      // Crear copia profunda de los planes
      const updatedPlans = JSON.parse(JSON.stringify(PLANS));
      
      // Actualizar el plan específico
      updatedPlans[planId] = {
        ...updatedPlans[planId],
        ...updateData,
        id: planId, // Mantener el ID original
        limits: {
          ...updatedPlans[planId].limits,
          ...(updateData.limits || {}),
        },
        features: {
          ...updatedPlans[planId].features,
          ...(updateData.features || {}),
        },
      };
      
      // Generar el nuevo contenido del archivo
      const configFilePath = path.join(__dirname, './plans.config.ts');
      const newContent = this.generatePlansConfigFile(updatedPlans);
      
      // Guardar el archivo
      fs.writeFileSync(configFilePath, newContent, 'utf-8');
      
      console.log(`[TenantsService] Plan ${planId} actualizado exitosamente`);
      
      // Limpiar cache después de guardar
      if (require.cache[resolvedPath]) {
        delete require.cache[resolvedPath];
      }
      
      return updatedPlans[planId];
    } catch (error) {
      console.error('[TenantsService] Error al actualizar plan:', error);
      console.error('[TenantsService] Stack:', error.stack);
      throw new BadRequestException(`Error al actualizar el plan: ${error.message}`);
    }
  }

  private generatePlansConfigFile(plans: any): string {
    // Convertir a JSON con formato bonito
    const plansJson = JSON.stringify(plans, null, 2);
    
    return `export interface PlanConfig {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceAnnual: number;
  limits: {
    users: number;
    branches: number;
    consents: number;
    services: number;
    questions: number;
    storageMb: number;
  };
  features: {
    watermark: boolean;
    customization: boolean;
    advancedReports: boolean;
    apiAccess: boolean;
    prioritySupport: boolean;
    customDomain: boolean;
    whiteLabel: boolean;
    backup: 'none' | 'weekly' | 'daily';
    supportResponseTime: string;
  };
  popular?: boolean;
}

export const PLANS: Record<string, PlanConfig> = ${plansJson};

export function getPlanConfig(planId: string): PlanConfig | null {
  return PLANS[planId] || null;
}

export function getAllPlans(): PlanConfig[] {
  return Object.values(PLANS);
}

export function calculatePrice(planId: string, billingCycle: 'monthly' | 'annual'): number {
  const plan = getPlanConfig(planId);
  if (!plan) return 0;
  return billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly;
}
`;
  }

  async requestPlanChange(requestData: {
    planId: string;
    planName: string;
    billingCycle: 'monthly' | 'annual';
    price: number;
    tenantId: string;
    tenantName: string;
    tenantEmail: string;
    currentPlan?: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      // Obtener el email del Super Admin desde settings
      const settings = await this.settingsService.getSettings();
      const superAdminEmail = settings.companyEmail;
      
      if (!superAdminEmail) {
        throw new BadRequestException('No se ha configurado el email del Super Admin');
      }

      // Enviar email al Super Admin
      await this.mailService.sendPlanChangeRequest({
        superAdminEmail,
        tenantName: requestData.tenantName,
        tenantEmail: requestData.tenantEmail,
        currentPlan: requestData.currentPlan || 'No especificado',
        requestedPlan: requestData.planName,
        billingCycle: requestData.billingCycle === 'monthly' ? 'Mensual' : 'Anual',
        price: requestData.price,
        tenantId: requestData.tenantId,
      });

      return {
        success: true,
        message: 'Solicitud de cambio de plan enviada exitosamente',
      };
    } catch (error) {
      console.error('Error al enviar solicitud de cambio de plan:', error);
      throw new BadRequestException('Error al enviar la solicitud de cambio de plan');
    }
  }
}
