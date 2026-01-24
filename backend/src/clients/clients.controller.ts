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

@Controller('clients')
@UseGuards(JwtAuthGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.CREATE_CLIENTS)
  create(
    @Body() createClientDto: CreateClientDto,
    @TenantSlug() tenantId: string,
  ) {
    return this.clientsService.create(createClientDto, tenantId);
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.VIEW_CLIENTS)
  findAll(@TenantSlug() tenantId: string) {
    return this.clientsService.findAll(tenantId);
  }

  @Get('search')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.VIEW_CLIENTS)
  search(
    @Query() searchDto: SearchClientDto,
    @TenantSlug() tenantId: string,
  ) {
    return this.clientsService.search(searchDto, tenantId);
  }

  @Get('stats')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.VIEW_CLIENTS)
  getStats(@TenantSlug() tenantId: string) {
    return this.clientsService.getStats(tenantId);
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.VIEW_CLIENTS)
  findOne(@Param('id') id: string, @TenantSlug() tenantId: string) {
    return this.clientsService.findOne(id, tenantId);
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.EDIT_CLIENTS)
  update(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
    @TenantSlug() tenantId: string,
  ) {
    return this.clientsService.update(id, updateClientDto, tenantId);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.DELETE_CLIENTS)
  remove(@Param('id') id: string, @TenantSlug() tenantId: string) {
    return this.clientsService.remove(id, tenantId);
  }
}
