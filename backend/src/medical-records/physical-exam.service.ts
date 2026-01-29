import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PhysicalExam } from './entities/physical-exam.entity';
import { MedicalRecordAudit } from './entities/medical-record-audit.entity';
import { CreatePhysicalExamDto, UpdatePhysicalExamDto } from './dto';

@Injectable()
export class PhysicalExamService {
  constructor(
    @InjectRepository(PhysicalExam)
    private physicalExamRepository: Repository<PhysicalExam>,
    @InjectRepository(MedicalRecordAudit)
    private auditRepository: Repository<MedicalRecordAudit>,
  ) {}

  async create(
    medicalRecordId: string,
    createDto: CreatePhysicalExamDto,
    userId: string,
    tenantId: string,
  ): Promise<PhysicalExam> {
    const physicalExam = this.physicalExamRepository.create({
      ...createDto,
      medicalRecordId,
      tenantId,
    });

    const saved = await this.physicalExamRepository.save(physicalExam);

    await this.logAudit({
      action: 'create',
      entityType: 'physical_exam',
      entityId: saved.id,
      medicalRecordId,
      performedBy: userId,
      tenantId,
      newValues: saved,
    });

    return saved;
  }

  async findByMedicalRecord(medicalRecordId: string, tenantId: string): Promise<PhysicalExam[]> {
    return this.physicalExamRepository.find({
      where: { medicalRecordId, tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: string,
    updateDto: UpdatePhysicalExamDto,
    userId: string,
    tenantId: string,
  ): Promise<PhysicalExam> {
    const physicalExam = await this.physicalExamRepository.findOne({
      where: { id, tenantId },
    });

    if (!physicalExam) {
      throw new NotFoundException('Examen físico no encontrado');
    }

    const oldValues = { ...physicalExam };
    Object.assign(physicalExam, updateDto);
    const updated = await this.physicalExamRepository.save(physicalExam);

    await this.logAudit({
      action: 'update',
      entityType: 'physical_exam',
      entityId: id,
      medicalRecordId: physicalExam.medicalRecordId,
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
