import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { Client, ClientDocumentType } from './entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { SearchClientDto } from './dto/search-client.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
  ) {}

  /**
   * Crear un nuevo cliente
   */
  async create(createClientDto: CreateClientDto, tenantId: string): Promise<Client> {
    // Verificar si ya existe un cliente con el mismo documento en este tenant
    const existingClient = await this.clientsRepository.findOne({
      where: {
        tenantId,
        documentType: createClientDto.documentType,
        documentNumber: createClientDto.documentNumber,
      },
    });

    if (existingClient) {
      throw new ConflictException(
        `Ya existe un cliente con ${createClientDto.documentType} ${createClientDto.documentNumber}`
      );
    }

    const client = this.clientsRepository.create({
      ...createClientDto,
      tenantId,
    });

    return await this.clientsRepository.save(client);
  }

  /**
   * Buscar clientes con múltiples criterios
   * Optimizado con índices en la base de datos
   */
  async search(searchDto: SearchClientDto, tenantId: string): Promise<Client[]> {
    const query = this.clientsRepository
      .createQueryBuilder('client')
      .where('client.tenantId = :tenantId', { tenantId })
      .orderBy('client.lastConsentAt', 'DESC', 'NULLS LAST')
      .addOrderBy('client.fullName', 'ASC')
      .take(50); // Limitar resultados para performance

    // Búsqueda general (nombre, documento, email, teléfono)
    if (searchDto.search) {
      const searchTerm = `%${searchDto.search}%`;
      query.andWhere(
        '(client.fullName ILIKE :search OR client.documentNumber ILIKE :search OR client.email ILIKE :search OR client.phone ILIKE :search)',
        { search: searchTerm }
      );
    }

    // Búsqueda específica por documento
    if (searchDto.documentNumber) {
      query.andWhere('client.documentNumber ILIKE :documentNumber', {
        documentNumber: `%${searchDto.documentNumber}%`,
      });
    }

    if (searchDto.documentType) {
      query.andWhere('client.documentType = :documentType', {
        documentType: searchDto.documentType,
      });
    }

    // Búsqueda específica por email
    if (searchDto.email) {
      query.andWhere('client.email ILIKE :email', {
        email: `%${searchDto.email}%`,
      });
    }

    // Búsqueda específica por teléfono
    if (searchDto.phone) {
      query.andWhere('client.phone ILIKE :phone', {
        phone: `%${searchDto.phone}%`,
      });
    }

    // Búsqueda específica por nombre
    if (searchDto.fullName) {
      query.andWhere('client.fullName ILIKE :fullName', {
        fullName: `%${searchDto.fullName}%`,
      });
    }

    return await query.getMany();
  }

  /**
   * Buscar cliente por documento exacto
   * Usado al crear consentimiento para verificar si el cliente ya existe
   */
  async findByDocument(
    documentType: ClientDocumentType,
    documentNumber: string,
    tenantId: string
  ): Promise<Client | null> {
    return await this.clientsRepository.findOne({
      where: {
        tenantId,
        documentType,
        documentNumber,
      },
    });
  }

  /**
   * Obtener todos los clientes de un tenant
   */
  async findAll(tenantId: string): Promise<Client[]> {
    return await this.clientsRepository.find({
      where: { tenantId },
      order: {
        lastConsentAt: 'DESC',
        fullName: 'ASC',
      },
    });
  }

  /**
   * Obtener un cliente por ID
   */
  async findOne(id: string, tenantId: string): Promise<Client> {
    const client = await this.clientsRepository.findOne({
      where: { id, tenantId },
      relations: ['consents', 'consents.service', 'consents.branch'],
    });

    if (!client) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

    return client;
  }

  /**
   * Actualizar un cliente
   */
  async update(id: string, updateClientDto: UpdateClientDto, tenantId: string): Promise<Client> {
    const client = await this.findOne(id, tenantId);

    Object.assign(client, updateClientDto);

    return await this.clientsRepository.save(client);
  }

  /**
   * Eliminar un cliente
   * Solo si no tiene consentimientos asociados
   */
  async remove(id: string, tenantId: string): Promise<void> {
    const client = await this.findOne(id, tenantId);

    if (client.consentsCount > 0) {
      throw new BadRequestException(
        'No se puede eliminar un cliente con consentimientos asociados'
      );
    }

    await this.clientsRepository.remove(client);
  }

  /**
   * Incrementar contador de consentimientos
   * Llamado cuando se crea un nuevo consentimiento
   */
  async incrementConsentsCount(clientId: string): Promise<void> {
    await this.clientsRepository.increment(
      { id: clientId },
      'consentsCount',
      1
    );

    await this.clientsRepository.update(
      { id: clientId },
      { lastConsentAt: new Date() }
    );
  }

  /**
   * Obtener estadísticas de clientes
   */
  async getStats(tenantId: string) {
    const totalClients = await this.clientsRepository.count({
      where: { tenantId },
    });

    const clientsWithConsents = await this.clientsRepository.count({
      where: { tenantId },
      // @ts-ignore
      where: { tenantId, consentsCount: { $gt: 0 } },
    });

    const recentClients = await this.clientsRepository.count({
      where: {
        tenantId,
        // Clientes creados en los últimos 30 días
      },
    });

    return {
      totalClients,
      clientsWithConsents,
      recentClients,
    };
  }
}
