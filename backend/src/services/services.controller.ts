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
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../profiles/guards/permissions.guard';
import { RequirePermission } from '../profiles/decorators/require-permission.decorator';
import { ProfilesService } from '../profiles/profiles.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('services')
@UseGuards(JwtAuthGuard)
export class ServicesController {
  constructor(
    private readonly servicesService: ServicesService,
    private readonly profilesService: ProfilesService,
  ) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermission('services', 'create')
  create(@Body() createServiceDto: CreateServiceDto, @CurrentUser() user: User) {
    const tenantId = user.tenant?.id;
    return this.servicesService.create(createServiceDto, tenantId);
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @RequirePermission('services', 'view')
  findAll(@CurrentUser() user: User) {
    const tenantId = user.tenant?.id;
    return this.servicesService.findAll(tenantId);
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission('services', 'view')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    const tenantId = user.tenant?.id;
    return this.servicesService.findOne(id, tenantId);
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission('services', 'edit')
  update(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
    @CurrentUser() user: User,
  ) {
    const tenantId = user.tenant?.id;
    return this.servicesService.update(id, updateServiceDto, tenantId);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission('services', 'delete')
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    const tenantId = user.tenant?.id;
    return this.servicesService.remove(id, tenantId);
  }
}
