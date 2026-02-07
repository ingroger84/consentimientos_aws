import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TreatmentPlan } from './entities/treatment-plan.entity';
import { MedicalRecord } from './entities/medical-record.entity';
import { CreateTreatmentPlanDto, UpdateTreatmentPlanDto } from './dto';

@Injectable()
export class TreatmentPlansService {
  constructor(
    @InjectRepository(TreatmentPlan)
    private treatmentPlansRepository: Repository<TreatmentPlan>,
    @InjectRepository(MedicalRecord)
    private medicalRecordsRepository: Repository<MedicalRecord>,
  ) {}

  async create(
    medicalRecordId: string,
    createDto: CreateTreatmentPlanDto,
    userId: string,
    tenantId: string,
  ): Promise<TreatmentPlan> {
    const medicalRecord = await this.medicalRecordsRepository.findOne({
      where: { id: medicalRecordId, tenantId },
    });

    if (!medicalRecord) {
      throw new NotFoundException('Historia clínica no encontrada');
    }

    if (medicalRecord.status !== 'active') {
      throw new ForbiddenException('No se pueden crear planes de tratamiento en una HC cerrada');
    }

    const plan = this.treatmentPlansRepository.create({
      ...createDto,
      medicalRecordId,
      tenantId,
      createdBy: userId,
    });

    return this.treatmentPlansRepository.save(plan);
  }

  async findByMedicalRecord(
    medicalRecordId: string,
    tenantId: string,
  ): Promise<TreatmentPlan[]> {
    return this.treatmentPlansRepository.find({
      where: { medicalRecordId, tenantId },
      relations: ['creator', 'evolution'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: string,
    updateDto: UpdateTreatmentPlanDto,
    userId: string,
    tenantId: string,
  ): Promise<TreatmentPlan> {
    const plan = await this.treatmentPlansRepository.findOne({
      where: { id, tenantId },
    });

    if (!plan) {
      throw new NotFoundException('Plan de tratamiento no encontrado');
    }

    Object.assign(plan, updateDto);
    return this.treatmentPlansRepository.save(plan);
  }
}
