import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { BranchesService } from './branches.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { PERMISSIONS } from '../auth/constants/permissions';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('branches')
@UseGuards(JwtAuthGuard)
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.CREATE_BRANCHES)
  create(@Body() createBranchDto: CreateBranchDto, @CurrentUser() user: User) {
    const tenantId = user.tenant?.id;
    return this.branchesService.create(createBranchDto, tenantId);
  }

  @Get()
  findAll(@CurrentUser() user: User) {
    // Endpoint público (solo requiere autenticación)
    // Los usuarios ven solo las sedes que tienen asignadas
    const tenantId = user.tenant?.id;
    return this.branchesService.findAllForUser(user.id, tenantId);
  }

  @Get('all')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.VIEW_BRANCHES)
  findAllBranches(@CurrentUser() user: User) {
    // Endpoint para administración de sedes
    // Requiere permiso view_branches
    // Si es Super Admin (sin tenant), devuelve TODAS las sedes de TODOS los tenants
    // Si es Admin de tenant, devuelve solo las sedes de su tenant
    const tenantId = user.tenant?.id;
    return this.branchesService.findAll(tenantId);
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.VIEW_BRANCHES)
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    const tenantId = user.tenant?.id;
    return this.branchesService.findOne(id, tenantId);
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.EDIT_BRANCHES)
  update(
    @Param('id') id: string,
    @Body() updateBranchDto: UpdateBranchDto,
    @CurrentUser() user: User,
  ) {
    const tenantId = user.tenant?.id;
    return this.branchesService.update(id, updateBranchDto, tenantId);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.DELETE_BRANCHES)
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    const tenantId = user.tenant?.id;
    return this.branchesService.remove(id, tenantId);
  }
}
