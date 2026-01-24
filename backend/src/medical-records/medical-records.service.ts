import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalRecord } from './entities/medical-record.entity';
import { MedicalRecordAudit } from './entities/medical-record-audit.entity';
import { CreateMedicalRecordDto, UpdateMedicalRecordDto } from './dto';

@Injectable()
export class MedicalRecordsService {
  constructor(
    @InjectRepository(MedicalRecord)
    private medicalRecordsRepository: Repository<MedicalRecord>,
    @InjectRepository(MedicalRecordAudit)
    private auditRepository: Repository<MedicalRecordAudit>,
  ) {}

  async create(
    createDto: CreateMedicalRecordDto,
    userId: string,
    tenantId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<MedicalRecord> {
    // Generar número único de HC
    const recordNumber = await this.generateRecordNumber(tenantId);

    const medicalRecord = this.medicalRecordsRepository.create({
      ...createDto,
      recordNumber,
      tenantId,
      createdBy: userId,
    });

    const saved = await this.medicalRecordsRepository.save(medicalRecord);

    // Auditoría
    await this.logAudit({
      action: 'create',
      entityType: 'medical_record',
      entityId: saved.id,
      medicalRecordId: saved.id,
      userId,
      tenantId,
      newValues: saved,
      ipAddress,
      userAgent,
    });

    return this.findOne(saved.id, tenantId, userId);
  }

  async findAll(
    tenantId: string,
    filters?: any,
  ): Promise<MedicalRecord[]> {
    const query = this.medicalRecordsRepository
      .createQueryBuilder('mr')
      .leftJoinAndSelect('mr.client', 'client')
      .leftJoinAndSelect('mr.branch', 'branch')
      .leftJoinAndSelect('mr.creator', 'creator')
      .where('mr.tenantId = :tenantId', { tenantId });

    if (filters?.clientId) {
      query.andWhere('mr.clientId = :clientId', { clientId: filters.clientId });
    }

    if (filters?.status) {
      query.andWhere('mr.status = :status', { status: filters.status });
    }

    if (filters?.dateFrom) {
      query.andWhere('mr.admissionDate >= :dateFrom', { dateFrom: filters.dateFrom });
    }

    if (filters?.dateTo) {
      query.andWhere('mr.admissionDate <= :dateTo', { dateTo: filters.dateTo });
    }

    if (filters?.branchId) {
      query.andWhere('mr.branchId = :branchId', { branchId: filters.branchId });
    }

    return query
      .orderBy('mr.admissionDate', 'DESC')
      .take(filters?.limit || 50)
      .skip(filters?.offset || 0)
      .getMany();
  }

  async findOne(
    id: string,
    tenantId: string,
    userId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<MedicalRecord> {
    const medicalRecord = await this.medicalRecordsRepository.findOne({
      where: { id, tenantId },
      relations: [
        'client',
        'branch',
        'creator',
        'anamnesis',
        'anamnesis.creator',
        'physicalExams',
        'physicalExams.creator',
        'diagnoses',
        'diagnoses.creator',
        'evolutions',
        'evolutions.creator',
        'evolutions.signer',
      ],
    });

    if (!medicalRecord) {
      throw new NotFoundException('Historia clínica no encontrada');
    }

    // Auditar acceso
    await this.logAudit({
      action: 'view',
      entityType: 'medical_record',
      entityId: id,
      medicalRecordId: id,
      userId,
      tenantId,
      ipAddress,
      userAgent,
    });

    return medicalRecord;
  }

  async update(
    id: string,
    updateDto: UpdateMedicalRecordDto,
    userId: string,
    tenantId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<MedicalRecord> {
    const medicalRecord = await this.medicalRecordsRepository.findOne({
      where: { id, tenantId },
    });

    if (!medicalRecord) {
      throw new NotFoundException('Historia clínica no encontrada');
    }

    if (medicalRecord.isLocked) {
      throw new ForbiddenException('Historia clínica bloqueada');
    }

    if (medicalRecord.status === 'closed') {
      throw new ForbiddenException('No se puede modificar una historia clínica cerrada');
    }

    const oldValues = { ...medicalRecord };

    Object.assign(medicalRecord, updateDto);
    const updated = await this.medicalRecordsRepository.save(medicalRecord);

    // Auditoría
    await this.logAudit({
      action: 'update',
      entityType: 'medical_record',
      entityId: id,
      medicalRecordId: id,
      userId,
      tenantId,
      oldValues,
      newValues: updated,
      ipAddress,
      userAgent,
    });

    return this.findOne(id, tenantId, userId);
  }

  async close(
    id: string,
    userId: string,
    tenantId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<MedicalRecord> {
    const medicalRecord = await this.medicalRecordsRepository.findOne({
      where: { id, tenantId },
    });

    if (!medicalRecord) {
      throw new NotFoundException('Historia clínica no encontrada');
    }

    medicalRecord.status = 'closed';
    medicalRecord.closedAt = new Date();
    medicalRecord.closedBy = userId;
    medicalRecord.isLocked = true;

    const updated = await this.medicalRecordsRepository.save(medicalRecord);

    // Auditoría
    await this.logAudit({
      action: 'close',
      entityType: 'medical_record',
      entityId: id,
      medicalRecordId: id,
      userId,
      tenantId,
      newValues: { status: 'closed', closedAt: updated.closedAt },
      ipAddress,
      userAgent,
    });

    return this.findOne(id, tenantId, userId);
  }

  private async generateRecordNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.medicalRecordsRepository.count({
      where: { tenantId },
    });

    return `HC-${year}-${(count + 1).toString().padStart(6, '0')}`;
  }

  private async logAudit(data: {
    action: string;
    entityType: string;
    entityId?: string;
    medicalRecordId?: string;
    userId: string;
    tenantId: string;
    oldValues?: any;
    newValues?: any;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    const audit = this.auditRepository.create(data);
    await this.auditRepository.save(audit);
  }
}
