import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentType } from './entities/document-type.entity';
import { CreateDocumentTypeDto } from './dto/create-document-type.dto';
import { UpdateDocumentTypeDto } from './dto/update-document-type.dto';

@Injectable()
export class DocumentTypesService {
  constructor(
    @InjectRepository(DocumentType)
    private documentTypesRepository: Repository<DocumentType>,
  ) {}

  async create(createDocumentTypeDto: CreateDocumentTypeDto): Promise<DocumentType> {
    // Verificar que el código no exista
    const existing = await this.documentTypesRepository.findOne({
      where: { code: createDocumentTypeDto.code.toUpperCase() },
    });

    if (existing) {
      throw new ConflictException(`El código ${createDocumentTypeDto.code} ya existe`);
    }

    const documentType = this.documentTypesRepository.create({
      ...createDocumentTypeDto,
      code: createDocumentTypeDto.code.toUpperCase(),
    });

    return await this.documentTypesRepository.save(documentType);
  }

  async findAll(filters?: {
    country?: string;
    isActive?: boolean;
  }): Promise<DocumentType[]> {
    const query = this.documentTypesRepository.createQueryBuilder('dt')
      .orderBy('dt.displayOrder', 'ASC')
      .addOrderBy('dt.name', 'ASC');

    if (filters?.country) {
      query.andWhere('(dt.country = :country OR dt.country = :default)', {
        country: filters.country,
        default: 'DEFAULT',
      });
    }

    if (filters?.isActive !== undefined) {
      query.andWhere('dt.isActive = :isActive', { isActive: filters.isActive });
    }

    return await query.getMany();
  }

  async findOne(id: string): Promise<DocumentType> {
    const documentType = await this.documentTypesRepository.findOne({
      where: { id },
    });

    if (!documentType) {
      throw new NotFoundException(`Tipo de documento con ID ${id} no encontrado`);
    }

    return documentType;
  }

  async findByCode(code: string): Promise<DocumentType> {
    const documentType = await this.documentTypesRepository.findOne({
      where: { code: code.toUpperCase() },
    });

    if (!documentType) {
      throw new NotFoundException(`Tipo de documento con código ${code} no encontrado`);
    }

    return documentType;
  }

  async update(id: string, updateDocumentTypeDto: UpdateDocumentTypeDto): Promise<DocumentType> {
    const documentType = await this.findOne(id);

    // Si se está actualizando el código, verificar que no exista
    if (updateDocumentTypeDto.code && updateDocumentTypeDto.code !== documentType.code) {
      const existing = await this.documentTypesRepository.findOne({
        where: { code: updateDocumentTypeDto.code.toUpperCase() },
      });

      if (existing) {
        throw new ConflictException(`El código ${updateDocumentTypeDto.code} ya existe`);
      }

      updateDocumentTypeDto.code = updateDocumentTypeDto.code.toUpperCase();
    }

    Object.assign(documentType, updateDocumentTypeDto);
    return await this.documentTypesRepository.save(documentType);
  }

  async remove(id: string): Promise<void> {
    const documentType = await this.findOne(id);
    await this.documentTypesRepository.softDelete(id);
  }

  async restore(id: string): Promise<DocumentType> {
    await this.documentTypesRepository.restore(id);
    return await this.findOne(id);
  }
}
