import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalRecordDocument } from './entities/medical-record-document.entity';
import { MedicalRecord } from './entities/medical-record.entity';
import { StorageService } from '../common/services/storage.service';
import { UploadDocumentDto } from './dto';

@Injectable()
export class MedicalRecordDocumentsService {
  constructor(
    @InjectRepository(MedicalRecordDocument)
    private documentsRepository: Repository<MedicalRecordDocument>,
    @InjectRepository(MedicalRecord)
    private medicalRecordsRepository: Repository<MedicalRecord>,
    private storageService: StorageService,
  ) {}

  async upload(
    medicalRecordId: string,
    file: Express.Multer.File,
    uploadDto: UploadDocumentDto,
    userId: string,
    tenantId: string,
  ): Promise<MedicalRecordDocument> {
    const medicalRecord = await this.medicalRecordsRepository.findOne({
      where: { id: medicalRecordId, tenantId },
    });

    if (!medicalRecord) {
      throw new NotFoundException('Historia clínica no encontrada');
    }

    // Subir archivo a S3
    const folder = `medical-records/${medicalRecordId}/documents`;
    const fileUrl = await this.storageService.uploadBuffer(
      file.buffer,
      folder,
      file.originalname,
      file.mimetype,
    );

    const document = this.documentsRepository.create({
      ...uploadDto,
      medicalRecordId,
      tenantId,
      fileName: file.originalname,
      fileUrl,
      fileSize: file.size,
      mimeType: file.mimetype,
      uploadedBy: userId,
    });

    return this.documentsRepository.save(document);
  }

  async findByMedicalRecord(
    medicalRecordId: string,
    tenantId: string,
  ): Promise<MedicalRecordDocument[]> {
    return this.documentsRepository.find({
      where: { medicalRecordId, tenantId },
      relations: ['uploader'],
      order: { uploadedAt: 'DESC' },
    });
  }

  async findOne(
    id: string,
    tenantId: string,
  ): Promise<MedicalRecordDocument> {
    const document = await this.documentsRepository.findOne({
      where: { id, tenantId },
    });

    if (!document) {
      throw new NotFoundException('Documento no encontrado');
    }

    return document;
  }

  async delete(
    id: string,
    tenantId: string,
  ): Promise<void> {
    const document = await this.findOne(id, tenantId);
    
    // Verificar que la HC esté activa
    const medicalRecord = await this.medicalRecordsRepository.findOne({
      where: { id: document.medicalRecordId, tenantId },
    });

    if (medicalRecord && medicalRecord.status !== 'active') {
      throw new ForbiddenException('No se pueden eliminar documentos de una HC cerrada');
    }

    await this.documentsRepository.remove(document);
  }

  async downloadFile(fileUrl: string): Promise<Buffer> {
    return this.storageService.downloadFile(fileUrl);
  }
}
