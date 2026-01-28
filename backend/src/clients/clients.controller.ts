import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  BadRequestException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { SearchClientDto } from './dto/search-client.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { PERMISSIONS } from '../auth/constants/permissions';
import { TenantSlug } from '../common/decorators/tenant-slug.decorator';
import { TenantsService } from '../tenants/tenants.service';

@Controller('clients')
@UseGuards(JwtAuthGuard)
export class ClientsController {
  private readonly logger = new Logger(ClientsController.name);

  constructor(
    private readonly clientsService: ClientsService,
    @Inject(forwardRef(() => TenantsService))
    private readonly tenantsService: TenantsService,
  ) {}

  /**
   * Busca un tenant por su slug usando el TenantsService
   * @param slug - El slug del tenant
   * @returns El tenant encontrado
   */
  private async getTenantBySlug(slug: string) {
    this.logger.log(`[getTenantBySlug] Buscando tenant con slug: "${slug}"`);
    const tenant = await this.tenantsService.findBySlug(slug);
    this.logger.log(`[getTenantBySlug] Tenant encontrado: ${tenant.id} - ${tenant.name}`);
    return tenant;
  }

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.CREATE_CLIENTS)
  async create(
    @Body() createClientDto: CreateClientDto,
    @TenantSlug() tenantSlug: string,
  ) {
    this.logger.log(`[CREATE CLIENT] Tenant slug recibido: ${tenantSlug}`);
    
    if (!tenantSlug) {
      this.logger.error('[CREATE CLIENT] Tenant slug es null o undefined');
      throw new BadRequestException('No se pudo identificar el tenant. Asegúrate de acceder desde el subdominio correcto.');
    }
    
    try {
      const tenant = await this.getTenantBySlug(tenantSlug);
      const result = await this.clientsService.create(createClientDto, tenant.id);
      this.logger.log(`[CREATE CLIENT] Cliente creado exitosamente: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error(`[CREATE CLIENT] Error: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.VIEW_CLIENTS)
  async findAll(@TenantSlug() tenantSlug: string) {
    if (!tenantSlug) {
      throw new BadRequestException('No se pudo identificar el tenant. Asegúrate de acceder desde el subdominio correcto.');
    }
    const tenant = await this.getTenantBySlug(tenantSlug);
    return this.clientsService.findAll(tenant.id);
  }

  @Get('search')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.VIEW_CLIENTS)
  async search(
    @Query() searchDto: SearchClientDto,
    @TenantSlug() tenantSlug: string,
  ) {
    if (!tenantSlug) {
      throw new BadRequestException('No se pudo identificar el tenant. Asegúrate de acceder desde el subdominio correcto.');
    }
    const tenant = await this.getTenantBySlug(tenantSlug);
    return this.clientsService.search(searchDto, tenant.id);
  }

  @Get('stats')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.VIEW_CLIENTS)
  async getStats(@TenantSlug() tenantSlug: string) {
    if (!tenantSlug) {
      throw new BadRequestException('No se pudo identificar el tenant. Asegúrate de acceder desde el subdominio correcto.');
    }
    const tenant = await this.getTenantBySlug(tenantSlug);
    return this.clientsService.getStats(tenant.id);
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.VIEW_CLIENTS)
  async findOne(@Param('id') id: string, @TenantSlug() tenantSlug: string) {
    if (!tenantSlug) {
      throw new BadRequestException('No se pudo identificar el tenant. Asegúrate de acceder desde el subdominio correcto.');
    }
    const tenant = await this.getTenantBySlug(tenantSlug);
    return this.clientsService.findOne(id, tenant.id);
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.EDIT_CLIENTS)
  async update(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
    @TenantSlug() tenantSlug: string,
  ) {
    if (!tenantSlug) {
      throw new BadRequestException('No se pudo identificar el tenant. Asegúrate de acceder desde el subdominio correcto.');
    }
    const tenant = await this.getTenantBySlug(tenantSlug);
    return this.clientsService.update(id, updateClientDto, tenant.id);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.DELETE_CLIENTS)
  async remove(@Param('id') id: string, @TenantSlug() tenantSlug: string) {
    if (!tenantSlug) {
      throw new BadRequestException('No se pudo identificar el tenant. Asegúrate de acceder desde el subdominio correcto.');
    }
    const tenant = await this.getTenantBySlug(tenantSlug);
    return this.clientsService.remove(id, tenant.id);
  }
}
