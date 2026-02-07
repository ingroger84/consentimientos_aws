import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalOrder } from './entities/medical-order.entity';
import { MedicalRecord } from './entities/medical-record.entity';
import { CreateMedicalOrderDto, UpdateMedicalOrderDto } from './dto';

@Injectable()
export class MedicalOrdersService {
  constructor(
    @InjectRepository(MedicalOrder)
    private medicalOrdersRepository: Repository<MedicalOrder>,
    @InjectRepository(MedicalRecord)
    private medicalRecordsRepository: Repository<MedicalRecord>,
  ) {}

  async create(
    medicalRecordId: string,
    createDto: CreateMedicalOrderDto,
    userId: string,
    tenantId: string,
  ): Promise<MedicalOrder> {
    // Verificar que la HC existe y está activa
    const medicalRecord = await this.medicalRecordsRepository.findOne({
      where: { id: medicalRecordId, tenantId },
    });

    if (!medicalRecord) {
      throw new NotFoundException('Historia clínica no encontrada');
    }

    if (medicalRecord.status !== 'active') {
      throw new ForbiddenException('No se pueden crear órdenes en una HC cerrada o archivada');
    }

    const order = this.medicalOrdersRepository.create({
      ...createDto,
      orderType: createDto.orderType as 'laboratory' | 'imaging' | 'procedure' | 'other',
      priority: (createDto.priority || 'routine') as 'routine' | 'urgent' | 'stat',
      medicalRecordId,
      tenantId,
      orderedBy: userId,
    });

    return this.medicalOrdersRepository.save(order);
  }

  async findByMedicalRecord(
    medicalRecordId: string,
    tenantId: string,
  ): Promise<MedicalOrder[]> {
    return this.medicalOrdersRepository.find({
      where: { medicalRecordId, tenantId },
      relations: ['orderer', 'completer'],
      order: { orderedAt: 'DESC' },
    });
  }

  async findOne(
    id: string,
    tenantId: string,
  ): Promise<MedicalOrder> {
    const order = await this.medicalOrdersRepository.findOne({
      where: { id, tenantId },
      relations: ['orderer', 'completer', 'medicalRecord'],
    });

    if (!order) {
      throw new NotFoundException('Orden médica no encontrada');
    }

    return order;
  }

  async update(
    id: string,
    updateDto: UpdateMedicalOrderDto,
    userId: string,
    tenantId: string,
  ): Promise<MedicalOrder> {
    const order = await this.findOne(id, tenantId);

    // Si se está completando la orden
    if (updateDto.status === 'completed' && order.status !== 'completed') {
      order.completedAt = new Date();
      order.completedBy = userId;
    }

    Object.assign(order, updateDto);
    return this.medicalOrdersRepository.save(order);
  }

  async delete(
    id: string,
    tenantId: string,
  ): Promise<void> {
    const order = await this.findOne(id, tenantId);
    
    // Solo se pueden eliminar órdenes pendientes
    if (order.status !== 'pending') {
      throw new ForbiddenException('Solo se pueden eliminar órdenes pendientes');
    }

    await this.medicalOrdersRepository.remove(order);
  }
}
