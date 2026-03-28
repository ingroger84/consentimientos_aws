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
import { DocumentTypesService } from './document-types.service';
import { CreateDocumentTypeDto } from './dto/create-document-type.dto';
import { UpdateDocumentTypeDto } from './dto/update-document-type.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleType } from '../roles/entities/role.entity';
import { Public } from '../auth/decorators/public.decorator';

@Controller('document-types')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentTypesController {
  constructor(private readonly documentTypesService: DocumentTypesService) {}

  @Post()
  @Roles(RoleType.SUPER_ADMIN)
  async create(@Body() createDocumentTypeDto: CreateDocumentTypeDto) {
    return await this.documentTypesService.create(createDocumentTypeDto);
  }

  @Public()
  @Get()
  async findAll(
    @Query('country') country?: string,
    @Query('isActive') isActive?: string,
  ) {
    const filters: any = {};

    if (country) {
      filters.country = country;
    }

    if (isActive !== undefined) {
      filters.isActive = isActive === 'true';
    }

    return await this.documentTypesService.findAll(filters);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.documentTypesService.findOne(id);
  }

  @Get('code/:code')
  async findByCode(@Param('code') code: string) {
    return await this.documentTypesService.findByCode(code);
  }

  @Patch(':id')
  @Roles(RoleType.SUPER_ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateDocumentTypeDto: UpdateDocumentTypeDto,
  ) {
    return await this.documentTypesService.update(id, updateDocumentTypeDto);
  }

  @Delete(':id')
  @Roles(RoleType.SUPER_ADMIN)
  async remove(@Param('id') id: string) {
    await this.documentTypesService.remove(id);
    return { message: 'Tipo de documento eliminado correctamente' };
  }

  @Post(':id/restore')
  @Roles(RoleType.SUPER_ADMIN)
  async restore(@Param('id') id: string) {
    return await this.documentTypesService.restore(id);
  }
}
