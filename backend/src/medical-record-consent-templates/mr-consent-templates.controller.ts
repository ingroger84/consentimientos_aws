import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MRConsentTemplatesService } from './mr-consent-templates.service';
import { CreateMRConsentTemplateDto, UpdateMRConsentTemplateDto } from './dto';
import { TenantSlug } from '../common/decorators/tenant-slug.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { TenantsService } from '../tenants/tenants.service';

@Controller('medical-record-consent-templates')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class MRConsentTemplatesController {
  constructor(
    private readonly templatesService: MRConsentTemplatesService,
    @Inject(forwardRef(() => TenantsService))
    private readonly tenantsService: TenantsService,
  ) {}

  /**
   * Convierte un slug de tenant a su ID
   */
  private async getTenantIdFromSlug(slug: string | null): Promise<string | null> {
    if (!slug) return null;
    const tenant = await this.tenantsService.findBySlug(slug);
    return tenant.id;
  }

  @Post()
  @RequirePermissions('create_mr_consent_templates')
  async create(
    @Body() createDto: CreateMRConsentTemplateDto,
    @Request() req: any,
    @TenantSlug() tenantSlug: string | null,
  ) {
    const tenantId = await this.getTenantIdFromSlug(tenantSlug);
    return this.templatesService.create(createDto, tenantId, req.user.sub);
  }

  @Get()
  @RequirePermissions('view_mr_consent_templates')
  async findAll(@TenantSlug() tenantSlug: string | null) {
    const tenantId = await this.getTenantIdFromSlug(tenantSlug);
    return this.templatesService.findAll(tenantId);
  }

  @Get('stats/overview')
  @RequirePermissions('view_dashboard')
  async getStats(@TenantSlug() tenantSlug: string | null) {
    const tenantId = await this.getTenantIdFromSlug(tenantSlug);
    return this.templatesService.getStatistics(tenantId);
  }

  @Get('by-category/:category')
  @RequirePermissions('view_mr_consent_templates')
  async findByCategory(
    @Param('category') category: string,
    @TenantSlug() tenantSlug: string | null,
  ) {
    const tenantId = await this.getTenantIdFromSlug(tenantSlug);
    return this.templatesService.findByCategory(category, tenantId);
  }

  @Get('variables')
  @RequirePermissions('view_mr_consent_templates')
  getAvailableVariables() {
    return this.templatesService.getAvailableVariables();
  }

  @Post('initialize-defaults')
  @RequirePermissions('create_mr_consent_templates')
  async initializeDefaults(@TenantSlug() tenantSlug: string | null) {
    const tenantId = await this.getTenantIdFromSlug(tenantSlug);
    return this.templatesService.initializeDefaults(tenantId);
  }

  @Get(':id')
  @RequirePermissions('view_mr_consent_templates')
  async findOne(@Param('id') id: string, @TenantSlug() tenantSlug: string | null) {
    const tenantId = await this.getTenantIdFromSlug(tenantSlug);
    return this.templatesService.findOne(id, tenantId);
  }

  @Patch(':id')
  @RequirePermissions('edit_mr_consent_templates')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateMRConsentTemplateDto,
    @TenantSlug() tenantSlug: string | null,
  ) {
    const tenantId = await this.getTenantIdFromSlug(tenantSlug);
    return this.templatesService.update(id, updateDto, tenantId);
  }

  @Delete(':id')
  @RequirePermissions('delete_mr_consent_templates')
  async remove(@Param('id') id: string, @TenantSlug() tenantSlug: string | null) {
    const tenantId = await this.getTenantIdFromSlug(tenantSlug);
    return this.templatesService.remove(id, tenantId);
  }

  @Post(':id/set-default')
  @RequirePermissions('edit_mr_consent_templates')
  async setAsDefault(@Param('id') id: string, @TenantSlug() tenantSlug: string | null) {
    const tenantId = await this.getTenantIdFromSlug(tenantSlug);
    return this.templatesService.setAsDefault(id, tenantId);
  }
}
