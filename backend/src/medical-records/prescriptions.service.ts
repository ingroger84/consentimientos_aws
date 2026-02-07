import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prescription } from './entities/prescription.entity';
import { MedicalRecord } from './entities/medical-record.entity';
import { CreatePrescriptionDto, UpdatePrescriptionDto } from './dto';

@Injectable()
export class PrescriptionsService {
  constructor(
    @InjectRepository(Prescription)
    private prescriptionsRepository: Repository<Prescription>,
    @InjectRepository(MedicalRecord)
    private medicalRecordsRepository: Repository<MedicalRecord>,
  ) {}

  async create(
    medicalRecordId: string,
    createDto: CreatePrescriptionDto,
    userId: string,
    tenantId: string,
  ): Promise<Prescription> {
    const medicalRecord = await this.medicalRecordsRepository.findOne({
      where: { id: medicalRecordId, tenantId },
    });

    if (!medicalRecord) {
      throw new NotFoundException('Historia clínica no encontrada');
    }

    if (medicalRecord.status !== 'active') {
      throw new ForbiddenException('No se pueden crear prescripciones en una HC cerrada');
    }

    const prescription = this.prescriptionsRepository.create({
      ...createDto,
      medicalRecordId,
      tenantId,
      prescribedBy: userId,
    });

    return this.prescriptionsRepository.save(prescription);
  }

  async findByMedicalRecord(
    medicalRecordId: string,
    tenantId: string,
  ): Promise<Prescription[]> {
    return this.prescriptionsRepository.find({
      where: { medicalRecordId, tenantId },
      relations: ['prescriber'],
      order: { prescribedAt: 'DESC' },
    });
  }

  async update(
    id: string,
    updateDto: UpdatePrescriptionDto,
    userId: string,
    tenantId: string,
  ): Promise<Prescription> {
    const prescription = await this.prescriptionsRepository.findOne({
      where: { id, tenantId },
    });

    if (!prescription) {
      throw new NotFoundException('Prescripción no encontrada');
    }

    if (updateDto.status === 'suspended' && prescription.status !== 'suspended') {
      prescription.suspendedAt = new Date();
      prescription.suspendedBy = userId;
    }

    Object.assign(prescription, updateDto);
    return this.prescriptionsRepository.save(prescription);
  }
}
