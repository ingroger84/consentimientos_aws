import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Evolution } from './entities/evolution.entity';
import { MedicalRecordAudit } from './entities/medical-record-audit.entity';
import { CreateEvolutionDto, UpdateEvolutionDto } from './dto';

@Injectable()
export class EvolutionService {
  constructor(
    @InjectRepository(Evolution)
    private evolutionRepository: Repository<Evolution>,
    @InjectRepository(MedicalRecordAudit)
    private auditRepository: Repository<MedicalRecordAudit>,
  ) {}

  async create(
    medicalRecordId: string,
    createDto: CreateEvolutionDto,
    userId: string,
    tenantId: string,
  ): Promise<Evolution> {
    const evolution = this.evolutionRepository.create({
      ...createDto,
      medicalRecordId,
      tenantId,
      createdBy: userId,
    });

    const saved = await this.evolutionRepository.save(evolution);

    await this.logAudit({
      action: 'create',
      entityType: 'evolution',
      entityId: saved.id,
      medicalRecordId,
      performedBy: userId,
      tenantId,
      newValues: saved,
    });

    return saved;
  }

  async findByMedicalRecord(medicalRecordId: string, tenantId: string): Promise<Evolution[]> {
    return this.evolutionRepository.find({
      where: { medicalRecordId, tenantId },
      relations: ['creator'],
      order: { evolutionDate: 'DESC' },
    });
  }

  async update(
    id: string,
    updateDto: UpdateEvolutionDto,
    userId: string,
    tenantId: string,
  ): Promise<Evolution> {
    const evolution = await this.evolutionRepository.findOne({
      where: { id, tenantId },
    });

    if (!evolution) {
      throw new NotFoundException('Evolución no encontrada');
    }

    const oldValues = { ...evolution };
    Object.assign(evolution, updateDto);
    const updated = await this.evolutionRepository.save(evolution);

    await this.logAudit({
      action: 'update',
      entityType: 'evolution',
      entityId: id,
      medicalRecordId: evolution.medicalRecordId,
      performedBy: userId,
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
