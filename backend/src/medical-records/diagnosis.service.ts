import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Diagnosis } from './entities/diagnosis.entity';
import { MedicalRecordAudit } from './entities/medical-record-audit.entity';
import { CreateDiagnosisDto, UpdateDiagnosisDto } from './dto';

@Injectable()
export class DiagnosisService {
  constructor(
    @InjectRepository(Diagnosis)
    private diagnosisRepository: Repository<Diagnosis>,
    @InjectRepository(MedicalRecordAudit)
    private auditRepository: Repository<MedicalRecordAudit>,
  ) {}

  async create(
    medicalRecordId: string,
    createDto: CreateDiagnosisDto,
    userId: string,
    tenantId: string,
  ): Promise<Diagnosis> {
    const diagnosis = this.diagnosisRepository.create({
      ...createDto,
      medicalRecordId,
      tenantId,
      createdBy: userId,
    });

    const saved = await this.diagnosisRepository.save(diagnosis);

    await this.logAudit({
      action: 'create',
      entityType: 'diagnosis',
      entityId: saved.id,
      medicalRecordId,
      userId,
      tenantId,
      newValues: saved,
    });

    return saved;
  }

  async findByMedicalRecord(medicalRecordId: string, tenantId: string): Promise<Diagnosis[]> {
    return this.diagnosisRepository.find({
      where: { medicalRecordId, tenantId },
      relations: ['creator'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: string,
    updateDto: UpdateDiagnosisDto,
    userId: string,
    tenantId: string,
  ): Promise<Diagnosis> {
    const diagnosis = await this.diagnosisRepository.findOne({
      where: { id, tenantId },
    });

    if (!diagnosis) {
      throw new NotFoundException('Diagnóstico no encontrado');
    }

    const oldValues = { ...diagnosis };
    Object.assign(diagnosis, updateDto);
    const updated = await this.diagnosisRepository.save(diagnosis);

    await this.logAudit({
      action: 'update',
      entityType: 'diagnosis',
      entityId: id,
      medicalRecordId: diagnosis.medicalRecordId,
      userId,
      tenantId,
      oldValues,
      newValues: updated,
    });

    return updated;
  }

  private async logAudit(data: any): Promise<void> {
    const audit = this.auditRepository.create(data);
    await this.auditRepository.save(audit);
  }
}
