import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Epicrisis } from './entities/epicrisis.entity';
import { MedicalRecord } from './entities/medical-record.entity';
import { CreateEpicrisisDto, UpdateEpicrisisDto } from './dto';

@Injectable()
export class EpicrisisService {
  constructor(
    @InjectRepository(Epicrisis)
    private epicrisisRepository: Repository<Epicrisis>,
    @InjectRepository(MedicalRecord)
    private medicalRecordsRepository: Repository<MedicalRecord>,
  ) {}

  async create(
    medicalRecordId: string,
    createDto: CreateEpicrisisDto,
    userId: string,
    tenantId: string,
  ): Promise<Epicrisis> {
    const medicalRecord = await this.medicalRecordsRepository.findOne({
      where: { id: medicalRecordId, tenantId },
    });

    if (!medicalRecord) {
      throw new NotFoundException('Historia clínica no encontrada');
    }

    // Verificar que no exista ya una epicrisis
    const existing = await this.epicrisisRepository.findOne({
      where: { medicalRecordId, tenantId },
    });

    if (existing) {
      throw new BadRequestException('Ya existe una epicrisis para esta HC');
    }

    const epicrisis = this.epicrisisRepository.create({
      ...createDto,
      medicalRecordId,
      tenantId,
      createdBy: userId,
    });

    return this.epicrisisRepository.save(epicrisis);
  }

  async findByMedicalRecord(
    medicalRecordId: string,
    tenantId: string,
  ): Promise<Epicrisis | null> {
    return this.epicrisisRepository.findOne({
      where: { medicalRecordId, tenantId },
      relations: ['creator'],
    });
  }

  async update(
    id: string,
    updateDto: UpdateEpicrisisDto,
    userId: string,
    tenantId: string,
  ): Promise<Epicrisis> {
    const epicrisis = await this.epicrisisRepository.findOne({
      where: { id, tenantId },
    });

    if (!epicrisis) {
      throw new NotFoundException('Epicrisis no encontrada');
    }

    Object.assign(epicrisis, updateDto);
    return this.epicrisisRepository.save(epicrisis);
  }
}
