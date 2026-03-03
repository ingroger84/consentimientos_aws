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
import { PermissionsGuard } from '../profiles/guards/permissions.guard';
import { RequirePermission } from '../profiles/decorators/require-permission.decorator';
import { ProfilesService } from '../profiles/profiles.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('branches')
@UseGuards(JwtAuthGuard)
export class BranchesController {
  constructor(
    private readonly branchesService: BranchesService,
    private readonly profilesService: ProfilesService,
  ) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermission('branches', 'create')
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
  @RequirePermission('branches', 'view')
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
  @RequirePermission('branches', 'view')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    const tenantId = user.tenant?.id;
    return this.branchesService.findOne(id, tenantId);
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission('branches', 'edit')
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
  @RequirePermission('branches', 'delete')
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    const tenantId = user.tenant?.id;
    return this.branchesService.remove(id, tenantId);
  }
}
