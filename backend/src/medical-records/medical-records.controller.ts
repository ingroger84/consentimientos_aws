import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MedicalRecordsService } from './medical-records.service';
import { AnamnesisService } from './anamnesis.service';
import { CreateMedicalRecordDto, UpdateMedicalRecordDto, CreateAnamnesisDto, UpdateAnamnesisDto } from './dto';

@Controller('medical-records')
@UseGuards(AuthGuard('jwt'))
export class MedicalRecordsController {
  constructor(
    private readonly medicalRecordsService: MedicalRecordsService,
    private readonly anamnesisService: AnamnesisService,
  ) {}

  @Post()
  async create(
    @Body() createDto: CreateMedicalRecordDto,
    @Request() req: any,
  ) {
    return this.medicalRecordsService.create(
      createDto,
      req.user.sub,
      req.user.tenantId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Get()
  async findAll(@Request() req: any, @Query() filters: any) {
    return this.medicalRecordsService.findAll(req.user.tenantId, filters);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.medicalRecordsService.findOne(
      id,
      req.user.tenantId,
      req.user.sub,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateMedicalRecordDto,
    @Request() req: any,
  ) {
    return this.medicalRecordsService.update(
      id,
      updateDto,
      req.user.sub,
      req.user.tenantId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Post(':id/close')
  async close(@Param('id') id: string, @Request() req: any) {
    return this.medicalRecordsService.close(
      id,
      req.user.sub,
      req.user.tenantId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  // Anamnesis endpoints
  @Post(':id/anamnesis')
  async createAnamnesis(
    @Param('id') medicalRecordId: string,
    @Body() createDto: CreateAnamnesisDto,
    @Request() req: any,
  ) {
    return this.anamnesisService.create(
      medicalRecordId,
      createDto,
      req.user.sub,
      req.user.tenantId,
    );
  }

  @Get(':id/anamnesis')
  async getAnamnesis(
    @Param('id') medicalRecordId: string,
    @Request() req: any,
  ) {
    return this.anamnesisService.findByMedicalRecord(
      medicalRecordId,
      req.user.tenantId,
    );
  }

  @Put(':id/anamnesis/:anamnesisId')
  async updateAnamnesis(
    @Param('anamnesisId') anamnesisId: string,
    @Body() updateDto: UpdateAnamnesisDto,
    @Request() req: any,
  ) {
    return this.anamnesisService.update(
      anamnesisId,
      updateDto,
      req.user.sub,
      req.user.tenantId,
    );
  }
}
