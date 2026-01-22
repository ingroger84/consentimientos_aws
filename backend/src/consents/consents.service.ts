import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Consent, ConsentStatus } from './entities/consent.entity';
import { Answer } from '../answers/entities/answer.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { CreateConsentDto } from './dto/create-consent.dto';
import { SignConsentDto } from './dto/sign-consent.dto';
import { PdfService } from './pdf.service';
import { MailService } from '../mail/mail.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ConsentsService {
  constructor(
    @InjectRepository(Consent)
    private consentsRepository: Repository<Consent>,
    @InjectRepository(Answer)
    private answersRepository: Repository<Answer>,
    @InjectRepository(Tenant)
    private tenantsRepository: Repository<Tenant>,
    private pdfService: PdfService,
    private mailService: MailService,
  ) {}

  async create(createConsentDto: CreateConsentDto, user: User): Promise<Consent> {
    console.log('=== CREANDO CONSENTIMIENTO ===');
    console.log('Usuario:', user.email);
    console.log('Tenant del usuario:', user.tenant?.id || 'Super Admin');
    console.log('clientPhoto presente:', !!createConsentDto.clientPhoto);
    if (createConsentDto.clientPhoto) {
      console.log('clientPhoto tamaño:', createConsentDto.clientPhoto.length, 'caracteres');
    }
    
    // MULTI-TENANT: Inyectar tenantId automáticamente desde el usuario
    const tenantId = user.tenant?.id;
    
    // VALIDAR LÍMITE DE CONSENTIMIENTOS ANTES DE CREAR
    if (tenantId) {
      await this.checkConsentLimit(tenantId);
    }
    
    const consent = this.consentsRepository.create({
      clientName: createConsentDto.clientName,
      clientId: createConsentDto.clientId,
      clientEmail: createConsentDto.clientEmail,
      clientPhone: createConsentDto.clientPhone,
      clientPhoto: createConsentDto.clientPhoto,
      service: { id: createConsentDto.serviceId } as any,
      branch: { id: createConsentDto.branchId } as any,
      tenant: tenantId ? { id: tenantId } as any : null,
      status: ConsentStatus.DRAFT,
    });

    const savedConsent = await this.consentsRepository.save(consent);
    console.log('Consentimiento guardado con foto:', !!savedConsent.clientPhoto);
    console.log('Consentimiento guardado con tenantId:', savedConsent.tenant?.id || 'null (Super Admin)');
    console.log('==============================');

    // Save answers
    const answers = createConsentDto.answers.map((answerDto) =>
      this.answersRepository.create({
        value: answerDto.value,
        consent: savedConsent,
        question: { id: answerDto.questionId } as any,
      }),
    );

    await this.answersRepository.save(answers);

    return this.findOne(savedConsent.id);
  }

  async update(id: string, updateConsentDto: CreateConsentDto): Promise<Consent> {
    // Buscar el consentimiento existente
    const consent = await this.consentsRepository.findOne({
      where: { id },
      relations: ['service', 'branch', 'tenant', 'answers'],
    });

    if (!consent) {
      throw new NotFoundException('Consentimiento no encontrado');
    }

    // Solo permitir editar consentimientos en estado DRAFT
    if (consent.status !== ConsentStatus.DRAFT) {
      throw new BadRequestException('Solo se pueden editar consentimientos en estado DRAFT');
    }

    // Actualizar los datos del consentimiento
    consent.clientName = updateConsentDto.clientName;
    consent.clientId = updateConsentDto.clientId;
    consent.clientEmail = updateConsentDto.clientEmail;
    consent.clientPhone = updateConsentDto.clientPhone;
    consent.clientPhoto = updateConsentDto.clientPhoto;
    consent.service = { id: updateConsentDto.serviceId } as any;
    consent.branch = { id: updateConsentDto.branchId } as any;

    await this.consentsRepository.save(consent);

    // Eliminar respuestas anteriores
    if (consent.answers && consent.answers.length > 0) {
      await this.answersRepository.remove(consent.answers);
    }

    // Guardar nuevas respuestas
    const answers = updateConsentDto.answers.map((answerDto) =>
      this.answersRepository.create({
        value: answerDto.value,
        consent: consent,
        question: { id: answerDto.questionId } as any,
      }),
    );

    await this.answersRepository.save(answers);

    return this.findOne(consent.id);
  }

  async findAll(search?: string, user?: User): Promise<Consent[]> {
    const queryBuilder = this.consentsRepository
      .createQueryBuilder('consent')
      .leftJoinAndSelect('consent.service', 'service')
      .leftJoinAndSelect('consent.branch', 'branch')
      .leftJoinAndSelect('consent.tenant', 'tenant')
      .leftJoinAndSelect('consent.answers', 'answers')
      .leftJoinAndSelect('answers.question', 'question')
      .orderBy('consent.createdAt', 'DESC');

    // MULTI-TENANT: Filtrar por tenant del usuario
    if (user?.tenant) {
      queryBuilder.andWhere('consent.tenantId = :tenantId', { tenantId: user.tenant.id });
    } else if (user && !user.tenant) {
      // Super Admin: ver solo consentimientos sin tenant (si los hay)
      queryBuilder.andWhere('consent.tenantId IS NULL');
    }

    if (search) {
      queryBuilder.andWhere(
        '(consent.clientName ILIKE :search OR consent.clientId ILIKE :search OR consent.clientPhone ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Consent> {
    const consent = await this.consentsRepository.findOne({
      where: { id },
      relations: ['service', 'branch', 'tenant', 'answers', 'answers.question'],
    });

    if (!consent) {
      throw new NotFoundException('Consentimiento no encontrado');
    }

    return consent;
  }

  async sign(id: string, signConsentDto: SignConsentDto): Promise<Consent> {
    const consent = await this.findOne(id);

    if (consent.status !== ConsentStatus.DRAFT) {
      throw new BadRequestException('El consentimiento ya fue firmado');
    }

    // Update consent with signature
    consent.signatureData = signConsentDto.signatureData;
    consent.signedAt = new Date();
    consent.status = ConsentStatus.SIGNED;

    // Generate all 3 PDFs
    try {
      console.log('Generando PDFs para consentimiento:', id);
      const pdfUrls = await this.pdfService.generateAllConsentPdfs(consent);
      consent.pdfUrl = pdfUrls.procedurePdfUrl;
      consent.pdfDataTreatmentUrl = pdfUrls.dataTreatmentPdfUrl;
      consent.pdfImageRightsUrl = pdfUrls.imageRightsPdfUrl;
      console.log('PDFs generados exitosamente:', pdfUrls);
    } catch (error) {
      console.error('Error al generar PDFs:', error);
      throw new BadRequestException('Error al generar los PDFs: ' + error.message);
    }

    const savedConsent = await this.consentsRepository.save(consent);

    // Send email asynchronously
    console.log('Iniciando envío de email a:', consent.clientEmail);
    this.sendConsentEmail(savedConsent.id).catch((error) => {
      console.error('Error sending email:', error);
    });

    return savedConsent;
  }

  async sendConsentEmail(id: string): Promise<void> {
    const consent = await this.findOne(id);

    if (!consent.pdfUrl) {
      throw new BadRequestException('El consentimiento no tiene PDF generado');
    }

    try {
      console.log('Enviando email a:', consent.clientEmail);
      await this.mailService.sendConsentEmail(consent);
      consent.status = ConsentStatus.SENT;
      consent.emailSentAt = new Date();
      await this.consentsRepository.save(consent);
      console.log('Email enviado exitosamente');
    } catch (error) {
      console.error('Error al enviar email:', error);
      
      // Solo marcar como FAILED si el consentimiento ya estaba en estado SIGNED
      // Si estaba en DRAFT, mantenerlo en DRAFT
      if (consent.status === ConsentStatus.SIGNED) {
        consent.status = ConsentStatus.FAILED;
        await this.consentsRepository.save(consent);
      }
      
      // Lanzar error con mensaje más descriptivo
      const errorMessage = error.message || 'Error desconocido al enviar el correo';
      throw new BadRequestException(
        `No se pudo enviar el correo: ${errorMessage}. ` +
        'Verifica la configuración SMTP en el archivo .env. ' +
        'Puedes reintentar el envío más tarde desde el botón "Reenviar Email".'
      );
    }
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.consentsRepository.softDelete(id);
  }

  async getStatistics(user?: User) {
    // MULTI-TENANT: Crear query builder base con filtro de tenant
    const baseQuery = this.consentsRepository.createQueryBuilder('consent');
    
    if (user?.tenant) {
      baseQuery.where('consent.tenantId = :tenantId', { tenantId: user.tenant.id });
    } else if (user && !user.tenant) {
      // Super Admin: solo consentimientos sin tenant
      baseQuery.where('consent.tenantId IS NULL');
    }

    // Total de consentimientos
    const total = await baseQuery.getCount();

    // Consentimientos por estado
    const byStatusQuery = this.consentsRepository
      .createQueryBuilder('consent')
      .select('consent.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('consent.status');
    
    if (user?.tenant) {
      byStatusQuery.where('consent.tenantId = :tenantId', { tenantId: user.tenant.id });
    } else if (user && !user.tenant) {
      byStatusQuery.where('consent.tenantId IS NULL');
    }
    
    const byStatus = await byStatusQuery.getRawMany();

    // Consentimientos por servicio (tipo)
    const byServiceQuery = this.consentsRepository
      .createQueryBuilder('consent')
      .leftJoin('consent.service', 'service')
      .select('service.name', 'name')
      .addSelect('COUNT(*)', 'count')
      .groupBy('service.id');
    
    if (user?.tenant) {
      byServiceQuery.where('consent.tenantId = :tenantId', { tenantId: user.tenant.id });
    } else if (user && !user.tenant) {
      byServiceQuery.where('consent.tenantId IS NULL');
    }
    
    const byService = await byServiceQuery.getRawMany();

    // Consentimientos por sede
    const byBranchQuery = this.consentsRepository
      .createQueryBuilder('consent')
      .leftJoin('consent.branch', 'branch')
      .select('branch.name', 'name')
      .addSelect('COUNT(*)', 'count')
      .groupBy('branch.id');
    
    if (user?.tenant) {
      byBranchQuery.where('consent.tenantId = :tenantId', { tenantId: user.tenant.id });
    } else if (user && !user.tenant) {
      byBranchQuery.where('consent.tenantId IS NULL');
    }
    
    const byBranch = await byBranchQuery.getRawMany();

    // Consentimientos por fecha (últimos 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const byDateQuery = this.consentsRepository
      .createQueryBuilder('consent')
      .select('DATE(consent.created_at)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('consent.created_at >= :date', { date: thirtyDaysAgo })
      .groupBy('DATE(consent.created_at)')
      .orderBy('DATE(consent.created_at)', 'ASC');
    
    if (user?.tenant) {
      byDateQuery.andWhere('consent.tenantId = :tenantId', { tenantId: user.tenant.id });
    } else if (user && !user.tenant) {
      byDateQuery.andWhere('consent.tenantId IS NULL');
    }
    
    const byDate = await byDateQuery.getRawMany();

    // Consentimientos recientes
    const recentQuery = this.consentsRepository
      .createQueryBuilder('consent')
      .leftJoinAndSelect('consent.service', 'service')
      .leftJoinAndSelect('consent.branch', 'branch')
      .orderBy('consent.createdAt', 'DESC')
      .take(5);
    
    if (user?.tenant) {
      recentQuery.where('consent.tenantId = :tenantId', { tenantId: user.tenant.id });
    } else if (user && !user.tenant) {
      recentQuery.where('consent.tenantId IS NULL');
    }
    
    const recent = await recentQuery.getMany();

    return {
      total,
      byStatus: byStatus.map(item => ({
        status: item.status,
        count: parseInt(item.count),
      })),
      byService: byService.map(item => ({
        name: item.name || 'Sin servicio',
        count: parseInt(item.count),
      })),
      byBranch: byBranch.map(item => ({
        name: item.name || 'Sin sede',
        count: parseInt(item.count),
      })),
      byDate: byDate.map(item => ({
        date: item.date,
        count: parseInt(item.count),
      })),
      recent: recent.map(consent => ({
        id: consent.id,
        clientName: consent.clientName,
        service: consent.service?.name,
        branch: consent.branch?.name,
        status: consent.status,
        createdAt: consent.createdAt,
      })),
    };
  }

  /**
   * Verificar límite de consentimientos del tenant antes de crear
   */
  private async checkConsentLimit(tenantId: string): Promise<void> {
    const tenant = await this.tenantsRepository.findOne({
      where: { id: tenantId },
      relations: ['consents'],
    });

    if (!tenant) {
      throw new NotFoundException('Tenant no encontrado');
    }

    const currentCount = tenant.consents?.filter(c => !c.deletedAt).length || 0;
    const maxLimit = tenant.maxConsents;

    if (currentCount >= maxLimit) {
      throw new ForbiddenException(
        `Has alcanzado el límite máximo de consentimientos permitidos (${currentCount}/${maxLimit}). ` +
        `Por favor, contacta al administrador para aumentar tu límite o considera actualizar tu plan.`
      );
    }
  }
}
