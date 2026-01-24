import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Anamnesis } from './entities/anamnesis.entity';
import { MedicalRecordAudit } from './entities/medical-record-audit.entity';
import { CreateAnamnesisDto, UpdateAnamnesisDto } from './dto';

@Injectable()
export class AnamnesisService {
  constructor(
    @InjectRepository(Anamnesis)
    private anamnesisRepository: Repository<Anamnesis>,
    @InjectRepository(MedicalRecordAudit)
    private auditRepository: Repository<MedicalRecordAudit>,
  ) {}

  async create(
    medicalRecordId: string,
    createDto: CreateAnamnesisDto,
    userId: string,
    tenantId: string,
  ): Promise<Anamnesis> {
    const anamnesis = this.anamnesisRepository.create({
      ...createDto,
      medicalRecordId,
      tenantId,
      createdBy: userId,
    });

    const saved = await this.anamnesisRepository.save(anamnesis);

    await this.logAudit({
      action: 'create',
      entityType: 'anamnesis',
      entityId: saved.id,
      medicalRecordId,
      userId,
      tenantId,
      newValues: saved,
    });

    return saved;
  }

  async findByMedicalRecord(medicalRecordId: string, tenantId: string): Promise<Anamnesis[]> {
    return this.anamnesisRepository.find({
      where: { medicalRecordId, tenantId },
      relations: ['creator'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: string,
    updateDto: UpdateAnamnesisDto,
    userId: string,
    tenantId: string,
  ): Promise<Anamnesis> {
    const anamnesis = await this.anamnesisRepository.findOne({
      where: { id, tenantId },
    });

    if (!anamnesis) {
      throw new NotFoundException('Anamnesis no encontrada');
    }

    const oldValues = { ...anamnesis };
    Object.assign(anamnesis, updateDto);
    const updated = await this.anamnesisRepository.save(anamnesis);

    await this.logAudit({
      action: 'update',
      entityType: 'anamnesis',
      entityId: id,
      medicalRecordId: anamnesis.medicalRecordId,
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
