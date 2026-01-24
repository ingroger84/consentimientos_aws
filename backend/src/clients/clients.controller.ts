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

@Controller('clients')
@UseGuards(JwtAuthGuard, TenantGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  create(
    @Body() createClientDto: CreateClientDto,
    @TenantSlug() tenantId: string,
  ) {
    return this.clientsService.create(createClientDto, tenantId);
  }

  @Get()
  findAll(@TenantSlug() tenantId: string) {
    return this.clientsService.findAll(tenantId);
  }

  @Get('search')
  search(
    @Query() searchDto: SearchClientDto,
    @TenantSlug() tenantId: string,
  ) {
    return this.clientsService.search(searchDto, tenantId);
  }

  @Get('stats')
  getStats(@TenantSlug() tenantId: string) {
    return this.clientsService.getStats(tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @TenantSlug() tenantId: string) {
    return this.clientsService.findOne(id, tenantId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
    @TenantSlug() tenantId: string,
  ) {
    return this.clientsService.update(id, updateClientDto, tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @TenantSlug() tenantId: string) {
    return this.clientsService.remove(id, tenantId);
  }
}
