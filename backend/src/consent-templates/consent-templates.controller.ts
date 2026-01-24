import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ConsentTemplatesService } from './consent-templates.service';
import { CreateConsentTemplateDto } from './dto/create-consent-template.dto';
import { UpdateConsentTemplateDto } from './dto/update-consent-template.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { PERMISSIONS } from '../auth/constants/permissions';
import { TenantSlug } from '../common/decorators/tenant-slug.decorator';
import { TemplateType } from './entities/consent-template.entity';

@Controller('consent-templates')
@UseGuards(JwtAuthGuard)
export class ConsentTemplatesController {
  constructor(
    private readonly templatesService: ConsentTemplatesService,
  ) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.CREATE_TEMPLATES)
  create(
    @Body() createDto: CreateConsentTemplateDto,
    @TenantSlug() tenantId: string,
  ) {
    return this.templatesService.create(createDto, tenantId);
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.VIEW_TEMPLATES)
  findAll(@TenantSlug() tenantId: string) {
    return this.templatesService.findAll(tenantId);
  }

  @Get('by-type/:type')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.VIEW_TEMPLATES)
  findByType(
    @Param('type') type: TemplateType,
    @TenantSlug() tenantId: string,
  ) {
    return this.templatesService.findByType(type, tenantId);
  }

  @Get('default/:type')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.VIEW_TEMPLATES)
  findDefaultByType(
    @Param('type') type: TemplateType,
    @TenantSlug() tenantId: string,
  ) {
    return this.templatesService.findDefaultByType(type, tenantId);
  }

  @Get('variables')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.VIEW_TEMPLATES)
  getAvailableVariables() {
    return this.templatesService.getAvailableVariables();
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.VIEW_TEMPLATES)
  findOne(@Param('id') id: string, @TenantSlug() tenantId: string) {
    return this.templatesService.findOne(id, tenantId);
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.EDIT_TEMPLATES)
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateConsentTemplateDto,
    @TenantSlug() tenantId: string,
  ) {
    return this.templatesService.update(id, updateDto, tenantId);
  }

  @Patch(':id/set-default')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.EDIT_TEMPLATES)
  setAsDefault(@Param('id') id: string, @TenantSlug() tenantId: string) {
    return this.templatesService.setAsDefault(id, tenantId);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.DELETE_TEMPLATES)
  remove(@Param('id') id: string, @TenantSlug() tenantId: string) {
    return this.templatesService.remove(id, tenantId);
  }
}
