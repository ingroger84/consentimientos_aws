import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Procedure } from './entities/procedure.entity';
import { MedicalRecord } from './entities/medical-record.entity';
import { CreateProcedureDto, UpdateProcedureDto } from './dto';

@Injectable()
export class ProceduresService {
  constructor(
    @InjectRepository(Procedure)
    private proceduresRepository: Repository<Procedure>,
    @InjectRepository(MedicalRecord)
    private medicalRecordsRepository: Repository<MedicalRecord>,
  ) {}

  async create(
    medicalRecordId: string,
    createDto: CreateProcedureDto,
    userId: string,
    tenantId: string,
  ): Promise<Procedure> {
    const medicalRecord = await this.medicalRecordsRepository.findOne({
      where: { id: medicalRecordId, tenantId },
    });

    if (!medicalRecord) {
      throw new NotFoundException('Historia clínica no encontrada');
    }

    if (medicalRecord.status !== 'active') {
      throw new ForbiddenException('No se pueden programar procedimientos en una HC cerrada');
    }

    const procedure = this.proceduresRepository.create({
      ...createDto,
      medicalRecordId,
      tenantId,
      scheduledBy: userId,
    });

    return this.proceduresRepository.save(procedure);
  }

  async findByMedicalRecord(
    medicalRecordId: string,
    tenantId: string,
  ): Promise<Procedure[]> {
    return this.proceduresRepository.find({
      where: { medicalRecordId, tenantId },
      relations: ['scheduler', 'performer'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: string,
    updateDto: UpdateProcedureDto,
    userId: string,
    tenantId: string,
  ): Promise<Procedure> {
    const procedure = await this.proceduresRepository.findOne({
      where: { id, tenantId },
    });

    if (!procedure) {
      throw new NotFoundException('Procedimiento no encontrado');
    }

    if (updateDto.status === 'completed' && procedure.status !== 'completed') {
      procedure.performedBy = userId;
    }

    Object.assign(procedure, updateDto);
    return this.proceduresRepository.save(procedure);
  }
}
