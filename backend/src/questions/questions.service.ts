import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './entities/question.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { ResourceLimitsHelper } from '../common/helpers/resource-limits.helper';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private questionsRepository: Repository<Question>,
    @InjectRepository(Tenant)
    private tenantsRepository: Repository<Tenant>,
  ) {}

  async create(createQuestionDto: CreateQuestionDto, tenantId?: string): Promise<Question> {
    // VALIDAR LÍMITE DE PREGUNTAS ANTES DE CREAR
    if (tenantId) {
      await this.checkQuestionLimit(tenantId);
    }

    const questionData: any = {
      ...createQuestionDto,
      service: { id: createQuestionDto.serviceId } as any,
    };
    
    if (tenantId) {
      questionData.tenant = { id: tenantId } as any;
    }
    
    const question = this.questionsRepository.create(questionData);
    const saved = await this.questionsRepository.save(question);
    return Array.isArray(saved) ? saved[0] : saved;
  }

  async findAll(tenantId?: string): Promise<Question[]> {
    const query = this.questionsRepository
      .createQueryBuilder('question')
      .leftJoinAndSelect('question.service', 'service')
      .leftJoinAndSelect('service.tenant', 'tenant')
      .orderBy('question.order', 'ASC');

    // MULTI-TENANT: Filtrar por tenant
    // Si tenantId es undefined (Super Admin), devolver TODAS las preguntas
    if (tenantId) {
      query.andWhere('question.tenantId = :tenantId', { tenantId });
    }
    // Si no hay tenantId (Super Admin), no aplicar filtro - devolver todas

    return query.getMany();
  }

  async findByService(serviceId: string, tenantId?: string): Promise<Question[]> {
    const query = this.questionsRepository
      .createQueryBuilder('question')
      .leftJoinAndSelect('question.service', 'service')
      .leftJoinAndSelect('service.tenant', 'tenant')
      .where('question.serviceId = :serviceId', { serviceId })
      .orderBy('question.order', 'ASC');

    // MULTI-TENANT: Filtrar por tenant
    // Si tenantId es undefined (Super Admin), devolver todas las preguntas del servicio
    if (tenantId) {
      query.andWhere('question.tenantId = :tenantId', { tenantId });
    }

    return query.getMany();
  }

  async findOne(id: string, tenantId?: string): Promise<Question> {
    const query = this.questionsRepository
      .createQueryBuilder('question')
      .leftJoinAndSelect('question.service', 'service')
      .leftJoinAndSelect('service.tenant', 'tenant')
      .where('question.id = :id', { id });

    // MULTI-TENANT: Filtrar por tenant
    // Si tenantId es undefined (Super Admin), puede ver cualquier pregunta
    if (tenantId) {
      query.andWhere('question.tenantId = :tenantId', { tenantId });
    }
    // Si no hay tenantId (Super Admin), no aplicar filtro - puede ver todas

    const question = await query.getOne();

    if (!question) {
      throw new NotFoundException('Pregunta no encontrada');
    }

    return question;
  }

  async update(
    id: string,
    updateQuestionDto: UpdateQuestionDto,
    tenantId?: string,
  ): Promise<Question> {
    const question = await this.findOne(id, tenantId);

    Object.assign(question, updateQuestionDto);

    if (updateQuestionDto.serviceId) {
      question.service = { id: updateQuestionDto.serviceId } as any;
    }

    return this.questionsRepository.save(question);
  }

  async remove(id: string, tenantId?: string): Promise<void> {
    await this.findOne(id, tenantId);
    await this.questionsRepository.softDelete(id);
  }

  /**
   * Verificar límite de preguntas del tenant antes de crear
   */
  private async checkQuestionLimit(tenantId: string): Promise<void> {
    const tenant = await this.tenantsRepository.findOne({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant no encontrado');
    }

    // Contar preguntas del tenant
    const currentCount = await this.questionsRepository.count({
      where: { tenant: { id: tenantId } },
    });
    
    // Usar el helper para validar el límite
    ResourceLimitsHelper.validateQuestionLimit(tenant, currentCount);
  }
}
