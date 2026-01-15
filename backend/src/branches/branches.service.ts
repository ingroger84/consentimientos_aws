import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from './entities/branch.entity';
import { User } from '../users/entities/user.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { ResourceLimitsHelper } from '../common/helpers/resource-limits.helper';

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(Branch)
    private branchesRepository: Repository<Branch>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Tenant)
    private tenantsRepository: Repository<Tenant>,
  ) {}

  async create(createBranchDto: CreateBranchDto, tenantId?: string): Promise<Branch> {
    // VALIDAR LÍMITE DE SEDES ANTES DE CREAR
    if (tenantId) {
      await this.checkBranchLimit(tenantId);
    }

    const branchData: Partial<Branch> = { ...createBranchDto };
    
    // Si el usuario que crea tiene tenant, asignar el mismo tenant a la sede
    if (tenantId) {
      branchData.tenant = { id: tenantId } as any;
    }
    
    const branch = this.branchesRepository.create(branchData);
    // @ts-ignore - TypeORM save() puede retornar Branch | Branch[], pero aquí siempre retorna Branch
    return this.branchesRepository.save(branch);
  }

  async findAll(tenantId?: string): Promise<Branch[]> {
    const query = this.branchesRepository
      .createQueryBuilder('branch')
      .leftJoinAndSelect('branch.tenant', 'tenant')
      .where('branch.deleted_at IS NULL');

    // Si se proporciona tenantId, filtrar por tenant
    // Si NO se proporciona (Super Admin), devolver TODAS las sedes de TODOS los tenants
    if (tenantId) {
      query.andWhere('branch.tenantId = :tenantId', { tenantId });
    }

    return query.getMany();
  }

  async findAllForUser(userId: string, tenantId?: string): Promise<Branch[]> {
    console.log('=== OBTENIENDO SEDES PARA USUARIO ===');
    console.log('User ID:', userId);
    console.log('Tenant ID:', tenantId || 'Super Admin (global)');
    
    // Obtener usuario con sus sedes asignadas (incluyendo la relación tenant de cada branch)
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.branches', 'branches')
      .leftJoinAndSelect('branches.tenant', 'branchTenant') // Cargar tenant de cada branch
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.tenant', 'tenant')
      .where('user.id = :userId', { userId })
      .getOne();

    if (!user) {
      console.log('Usuario no encontrado');
      return [];
    }

    console.log('Usuario:', user.name);
    console.log('Rol:', user.role?.name);
    console.log('Tenant:', user.tenant?.name || 'Super Admin');
    console.log('Sedes asignadas:', user.branches?.length || 0);
    
    if (user.branches && user.branches.length > 0) {
      user.branches.forEach(b => {
        console.log(`  - ${b.name} (ID: ${b.id}, Activa: ${b.isActive}, TenantId: ${b.tenant?.id || 'null'})`);
      });
    }
    
    // Si el usuario no tiene sedes asignadas, retornar todas las sedes activas de su tenant
    if (!user.branches || user.branches.length === 0) {
      console.log('Usuario sin sedes asignadas, retornando todas las sedes activas del tenant');
      
      const query = this.branchesRepository
        .createQueryBuilder('branch')
        .where('branch.isActive = :isActive', { isActive: true })
        .andWhere('branch.deleted_at IS NULL');

      // Filtrar por tenant si el usuario tiene uno
      if (tenantId) {
        query.andWhere('branch.tenantId = :tenantId', { tenantId });
      } else {
        // Super Admin: solo sedes sin tenant
        query.andWhere('branch.tenantId IS NULL');
      }

      const allBranches = await query.getMany();
      console.log('Total sedes activas del tenant:', allBranches.length);
      console.log('======================================');
      return allBranches;
    }

    // Retornar solo las sedes asignadas al usuario que estén activas
    let userBranches = user.branches.filter(b => {
      const isActive = b.isActive;
      const belongsToTenant = tenantId ? b.tenant?.id === tenantId : !b.tenant;
      
      console.log(`  Filtrando ${b.name}: activa=${isActive}, pertenece al tenant=${belongsToTenant}`);
      
      return isActive && belongsToTenant;
    });
    
    console.log('Sedes activas del usuario después del filtro:', userBranches.length);
    userBranches.forEach(b => console.log(`  ✓ ${b.name} (ID: ${b.id})`));
    console.log('======================================');
    
    return userBranches;
  }

  async findOne(id: string, tenantId?: string): Promise<Branch> {
    const query = this.branchesRepository
      .createQueryBuilder('branch')
      .leftJoinAndSelect('branch.tenant', 'tenant')
      .where('branch.id = :id', { id })
      .andWhere('branch.deleted_at IS NULL');

    // Si se proporciona tenantId, verificar que la sede pertenezca a ese tenant
    if (tenantId) {
      query.andWhere('branch.tenantId = :tenantId', { tenantId });
    }

    const branch = await query.getOne();
    
    if (!branch) {
      throw new NotFoundException('Sede no encontrada');
    }
    return branch;
  }

  async update(id: string, updateBranchDto: UpdateBranchDto, tenantId?: string): Promise<Branch> {
    const branch = await this.findOne(id, tenantId);
    Object.assign(branch, updateBranchDto);
    return this.branchesRepository.save(branch);
  }

  async remove(id: string, tenantId?: string): Promise<void> {
    await this.findOne(id, tenantId);
    await this.branchesRepository.softDelete(id);
  }

  /**
   * Verificar límite de sedes del tenant antes de crear
   */
  private async checkBranchLimit(tenantId: string): Promise<void> {
    const tenant = await this.tenantsRepository.findOne({
      where: { id: tenantId },
      relations: ['branches'],
    });

    if (!tenant) {
      throw new NotFoundException('Tenant no encontrado');
    }

    const currentCount = tenant.branches?.filter(b => !b.deletedAt).length || 0;
    
    // Usar el helper para validar el límite
    ResourceLimitsHelper.validateBranchLimit(tenant, currentCount);
  }
}
