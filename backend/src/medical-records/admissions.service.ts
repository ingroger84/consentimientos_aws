import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admission, AdmissionStatus } from './entities/admission.entity';
import { MedicalRecord } from './entities/medical-record.entity';
import { CreateAdmissionDto, UpdateAdmissionDto, CloseAdmissionDto } from './dto/admission.dto';

@Injectable()
export class AdmissionsService {
  constructor(
    @InjectRepository(Admission)
    private admissionsRepository: Repository<Admission>,
    @InjectRepository(MedicalRecord)
    private medicalRecordsRepository: Repository<MedicalRecord>,
  ) {}

  /**
   * Crear una nueva admisión para una HC existente
   */
  async create(
    createDto: CreateAdmissionDto,
    userId: string,
    tenantId: string,
  ): Promise<Admission> {
    // Verificar que la HC existe y pertenece al tenant
    const medicalRecord = await this.medicalRecordsRepository.findOne({
      where: { id: createDto.medicalRecordId, tenantId },
    });

    if (!medicalRecord) {
      throw new NotFoundException('Historia clínica no encontrada');
    }

    // Verificar que la HC no esté cerrada
    if (medicalRecord.status === 'closed') {
      throw new ForbiddenException(
        'No se pueden crear admisiones en una HC cerrada',
      );
    }

    // Generar número de admisión
    const admissionNumber = await this.generateAdmissionNumber(
      createDto.medicalRecordId,
    );

    // Crear la admisión
    const admission = this.admissionsRepository.create({
      medicalRecordId: createDto.medicalRecordId,
      tenantId,
      admissionNumber,
      admissionDate: createDto.admissionDate
        ? new Date(createDto.admissionDate)
        : new Date(),
      admissionType: createDto.admissionType,
      reason: createDto.reason,
      status: AdmissionStatus.ACTIVE,
      createdBy: userId,
    });

    return this.admissionsRepository.save(admission);
  }

  /**
   * Obtener todas las admisiones de una HC
   */
  async findByMedicalRecord(
    medicalRecordId: string,
    tenantId: string,
  ): Promise<Admission[]> {
    return this.admissionsRepository.find({
      where: { medicalRecordId, tenantId },
      relations: [
        'creator',
        'closer',
        'anamnesis',
        'physicalExams',
        'diagnoses',
        'evolutions',
        'consents',
      ],
      order: { admissionDate: 'DESC' },
    });
  }

  /**
   * Obtener una admisión específica
   */
  async findOne(
    id: string,
    tenantId: string,
  ): Promise<Admission> {
    const admission = await this.admissionsRepository.findOne({
      where: { id, tenantId },
      relations: [
        'medicalRecord',
        'medicalRecord.client',
        'creator',
        'closer',
        'anamnesis',
        'physicalExams',
        'diagnoses',
        'evolutions',
        'evolutions.creator',
        'consents',
        'consents.creator',
      ],
    });

    if (!admission) {
      throw new NotFoundException('Admisión no encontrada');
    }

    return admission;
  }

  /**
   * Actualizar una admisión
   */
  async update(
    id: string,
    updateDto: UpdateAdmissionDto,
    tenantId: string,
  ): Promise<Admission> {
    const admission = await this.admissionsRepository.findOne({
      where: { id, tenantId },
    });

    if (!admission) {
      throw new NotFoundException('Admisión no encontrada');
    }

    if (admission.isLocked) {
      throw new ForbiddenException('Admisión bloqueada');
    }

    if (admission.status === AdmissionStatus.CLOSED) {
      throw new ForbiddenException('No se puede modificar una admisión cerrada');
    }

    Object.assign(admission, updateDto);
    return this.admissionsRepository.save(admission);
  }

  /**
   * Cerrar una admisión
   */
  async close(
    id: string,
    closeDto: CloseAdmissionDto,
    userId: string,
    tenantId: string,
  ): Promise<Admission> {
    const admission = await this.admissionsRepository.findOne({
      where: { id, tenantId },
    });

    if (!admission) {
      throw new NotFoundException('Admisión no encontrada');
    }

    if (admission.status === AdmissionStatus.CLOSED) {
      throw new BadRequestException('La admisión ya está cerrada');
    }

    admission.status = AdmissionStatus.CLOSED;
    admission.closedAt = new Date();
    admission.closedBy = userId;
    admission.closureNotes = closeDto.closureNotes;
    admission.isLocked = true;

    return this.admissionsRepository.save(admission);
  }

  /**
   * Reabrir una admisión
   */
  async reopen(
    id: string,
    tenantId: string,
  ): Promise<Admission> {
    const admission = await this.admissionsRepository.findOne({
      where: { id, tenantId },
    });

    if (!admission) {
      throw new NotFoundException('Admisión no encontrada');
    }

    if (admission.status === AdmissionStatus.ACTIVE) {
      throw new BadRequestException('La admisión ya está activa');
    }

    admission.status = AdmissionStatus.ACTIVE;
    admission.isLocked = false;
    admission.closedAt = null;
    admission.closedBy = null;
    admission.closureNotes = null;

    return this.admissionsRepository.save(admission);
  }

  /**
   * Cancelar una admisión
   */
  async cancel(
    id: string,
    reason: string,
    tenantId: string,
  ): Promise<Admission> {
    const admission = await this.admissionsRepository.findOne({
      where: { id, tenantId },
    });

    if (!admission) {
      throw new NotFoundException('Admisión no encontrada');
    }

    if (admission.status === AdmissionStatus.CANCELLED) {
      throw new BadRequestException('La admisión ya está cancelada');
    }

    admission.status = AdmissionStatus.CANCELLED;
    admission.closureNotes = reason;
    admission.isLocked = true;

    return this.admissionsRepository.save(admission);
  }

  /**
   * Generar número único de admisión
   */
  private async generateAdmissionNumber(
    medicalRecordId: string,
  ): Promise<string> {
    const medicalRecord = await this.medicalRecordsRepository.findOne({
      where: { id: medicalRecordId },
    });

    const count = await this.admissionsRepository.count({
      where: { medicalRecordId },
    });

    return `${medicalRecord.recordNumber}-ADM-${(count + 1).toString().padStart(3, '0')}`;
  }

  /**
   * Verificar si una HC tiene admisiones activas
   */
  async hasActiveAdmissions(medicalRecordId: string): Promise<boolean> {
    const count = await this.admissionsRepository.count({
      where: {
        medicalRecordId,
        status: AdmissionStatus.ACTIVE,
      },
    });

    return count > 0;
  }

  /**
   * Obtener la admisión activa de una HC (si existe)
   */
  async getActiveAdmission(
    medicalRecordId: string,
    tenantId: string,
  ): Promise<Admission | null> {
    return this.admissionsRepository.findOne({
      where: {
        medicalRecordId,
        tenantId,
        status: AdmissionStatus.ACTIVE,
      },
      order: { admissionDate: 'DESC' },
    });
  }
}
