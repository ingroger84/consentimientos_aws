import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { PERMISSIONS } from '../auth/constants/permissions';
import { getAllPlans } from './plans.config';

@Controller('tenants')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Public()
  @Get('plans')
  getPlans() {
    // Endpoint público para obtener los planes disponibles
    return getAllPlans();
  }

  @Public()
  @Post('request-plan-change')
  async requestPlanChange(@Body() requestData: any) {
    return this.tenantsService.requestPlanChange(requestData);
  }

  @Put('plans/:id')
  @RequirePermissions(PERMISSIONS.MANAGE_TENANTS)
  updatePlan(@Param('id') id: string, @Body() updateData: any) {
    return this.tenantsService.updatePlan(id, updateData);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.MANAGE_TENANTS)
  create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantsService.create(createTenantDto);
  }

  @Get()
  @RequirePermissions(PERMISSIONS.MANAGE_TENANTS)
  findAll() {
    return this.tenantsService.findAll();
  }

  @Get('stats/global')
  @RequirePermissions(PERMISSIONS.VIEW_GLOBAL_STATS)
  getGlobalStats() {
    return this.tenantsService.getGlobalStats();
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.MANAGE_TENANTS)
  findOne(@Param('id') id: string) {
    return this.tenantsService.findOne(id);
  }

  @Get(':id/stats')
  @RequirePermissions(PERMISSIONS.MANAGE_TENANTS)
  getStats(@Param('id') id: string) {
    return this.tenantsService.getStats(id);
  }

  @Get(':id/usage')
  @RequirePermissions(PERMISSIONS.VIEW_DASHBOARD)
  getUsage(@Param('id') id: string) {
    return this.tenantsService.getUsage(id);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.MANAGE_TENANTS)
  update(@Param('id') id: string, @Body() updateTenantDto: UpdateTenantDto) {
    return this.tenantsService.update(id, updateTenantDto);
  }

  @Patch(':id/suspend')
  @RequirePermissions(PERMISSIONS.MANAGE_TENANTS)
  suspend(@Param('id') id: string) {
    return this.tenantsService.suspend(id);
  }

  @Patch(':id/activate')
  @RequirePermissions(PERMISSIONS.MANAGE_TENANTS)
  activate(@Param('id') id: string) {
    return this.tenantsService.activate(id);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.MANAGE_TENANTS)
  remove(@Param('id') id: string) {
    return this.tenantsService.remove(id);
  }

  @Post(':id/resend-welcome-email')
  @RequirePermissions(PERMISSIONS.MANAGE_TENANTS)
  resendWelcomeEmail(@Param('id') id: string) {
    return this.tenantsService.resendWelcomeEmail(id);
  }
}
