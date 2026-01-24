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
import { TenantGuard } from '../common/guards/tenant.guard';
import { TenantSlug } from '../common/decorators/tenant-slug.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/permissions';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

@Controller('clients')
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @Permissions(Permission.CONSENTS_CREATE)
  create(
    @Body() createClientDto: CreateClientDto,
    @TenantSlug() tenantId: string,
  ) {
    return this.clientsService.create(createClientDto, tenantId);
  }

  @Get()
  @Permissions(Permission.CONSENTS_READ)
  findAll(@TenantSlug() tenantId: string) {
    return this.clientsService.findAll(tenantId);
  }

  @Get('search')
  @Permissions(Permission.CONSENTS_READ)
  search(
    @Query() searchDto: SearchClientDto,
    @TenantSlug() tenantId: string,
  ) {
    return this.clientsService.search(searchDto, tenantId);
  }

  @Get('stats')
  @Permissions(Permission.CONSENTS_READ)
  getStats(@TenantSlug() tenantId: string) {
    return this.clientsService.getStats(tenantId);
  }

  @Get(':id')
  @Permissions(Permission.CONSENTS_READ)
  findOne(@Param('id') id: string, @TenantSlug() tenantId: string) {
    return this.clientsService.findOne(id, tenantId);
  }

  @Patch(':id')
  @Permissions(Permission.CONSENTS_UPDATE)
  update(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
    @TenantSlug() tenantId: string,
  ) {
    return this.clientsService.update(id, updateClientDto, tenantId);
  }

  @Delete(':id')
  @Permissions(Permission.CONSENTS_DELETE)
  remove(@Param('id') id: string, @TenantSlug() tenantId: string) {
    return this.clientsService.remove(id, tenantId);
  }
}
