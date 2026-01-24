# Ejemplos de Código

## Backend - Entity Example

### medical-record.entity.ts

```typescript
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';
import { Client } from '../clients/client.entity';
import { Branch } from '../branches/branch.entity';
import { User } from '../users/user.entity';
import { Anamnesis } from './anamnesis.entity';
import { PhysicalExam } from './physical-exam.entity';
import { Diagnosis } from './diagnosis.entity';
import { Evolution } from './evolution.entity';
import { Prescription } from './prescription.entity';
import { MedicalOrder } from './medical-order.entity';
import { MedicalAttachment } from './medical-attachment.entity';
import { Consent } from '../consents/consent.entity';

@Entity('medical_records')
export class MedicalRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Relaciones
  @Column()
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column()
  clientId: string;

  @ManyToOne(() => Client, client => client.medicalRecords)
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @Column({ nullable: true })
  branchId: string;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branchId' })
  branch: Branch;

  // Datos básicos
  @Column({ unique: true })
  recordNumber: string;

  @Column()
  admissionDate: Date;

  @Column()
  admissionType: string; // consulta, urgencia, hospitalización

  // Estado
  @Column({ default: 'active' })
  status: string;

  @Column({ default: false })
  isLocked: boolean;

  // Relaciones con componentes de la HC
  @OneToMany(() => Anamnesis, anamnesis => anamnesis.medicalRecord)
  anamnesis: Anamnesis[];

  @OneToMany(() => PhysicalExam, exam => exam.medicalRecord)
  physicalExams: PhysicalExam[];

  @OneToMany(() => Diagnosis, diagnosis => diagnosis.medicalRecord)
  diagnoses: Diagnosis[];

  @OneToMany(() => Evolution, evolution => evolution.medicalRecord)
  evolutions: Evolution[];

  @OneToMany(() => Prescription, prescription => prescription.medicalRecord)
  prescriptions: Prescription[];

  @OneToMany(() => MedicalOrder, order => order.medicalRecord)
  medicalOrders: MedicalOrder[];

  @OneToMany(() => MedicalAttachment, attachment => attachment.medicalRecord)
  attachments: MedicalAttachment[];

  @OneToMany(() => Consent, consent => consent.medicalRecord)
  consents: Consent[];

  // Auditoría
  @Column()
  createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  closedAt: Date;

  @Column({ nullable: true })
  closedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'closedBy' })
  closer: User;
}
```


## Backend - Service Example

### medical-records.service.ts

```typescript
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalRecord } from './entities/medical-record.entity';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class MedicalRecordsService {
  constructor(
    @InjectRepository(MedicalRecord)
    private medicalRecordsRepository: Repository<MedicalRecord>,
    private auditService: AuditService,
  ) {}

  async create(
    createDto: CreateMedicalRecordDto,
    userId: string,
    tenantId: string,
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
    await this.auditService.log({
      action: 'create',
      entityType: 'medical_record',
      entityId: saved.id,
      userId,
      tenantId,
      newValues: saved,
    });

    return saved;
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

    return query.orderBy('mr.admissionDate', 'DESC').getMany();
  }

  async findOne(
    id: string,
    tenantId: string,
    userId: string,
  ): Promise<MedicalRecord> {
    const medicalRecord = await this.medicalRecordsRepository.findOne({
      where: { id, tenantId },
      relations: [
        'client',
        'branch',
        'creator',
        'anamnesis',
        'physicalExams',
        'diagnoses',
        'evolutions',
        'prescriptions',
        'medicalOrders',
        'attachments',
        'consents',
      ],
    });

    if (!medicalRecord) {
      throw new NotFoundException('Historia clínica no encontrada');
    }

    // Auditar acceso
    await this.auditService.log({
      action: 'view',
      entityType: 'medical_record',
      entityId: id,
      userId,
      tenantId,
    });

    return medicalRecord;
  }

  async update(
    id: string,
    updateDto: UpdateMedicalRecordDto,
    userId: string,
    tenantId: string,
  ): Promise<MedicalRecord> {
    const medicalRecord = await this.findOne(id, tenantId, userId);

    if (medicalRecord.isLocked) {
      throw new ForbiddenException('Historia clínica bloqueada');
    }

    const oldValues = { ...medicalRecord };

    Object.assign(medicalRecord, updateDto);
    const updated = await this.medicalRecordsRepository.save(medicalRecord);

    // Auditoría
    await this.auditService.log({
      action: 'update',
      entityType: 'medical_record',
      entityId: id,
      userId,
      tenantId,
      oldValues,
      newValues: updated,
    });

    return updated;
  }

  private async generateRecordNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.medicalRecordsRepository.count({
      where: { tenantId },
    });
    
    return `HC-${year}-${(count + 1).toString().padStart(6, '0')}`;
  }
}
```


## Frontend - Component Example

### MedicalRecordsPage.tsx

```typescript
import { useState, useEffect } from 'react';
import { Plus, FileText, Search, Filter } from 'lucide-react';
import { medicalRecordsService } from '../services/medical-records.service';
import { MedicalRecord } from '../types/medical-record';
import { usePermissions } from '../hooks/usePermissions';
import { useToast } from '../hooks/useToast';
import MedicalRecordCard from '../components/medical-records/MedicalRecordCard';
import CreateMedicalRecordModal from '../components/medical-records/CreateMedicalRecordModal';
import MedicalRecordFilters from '../components/medical-records/MedicalRecordFilters';

export default function MedicalRecordsPage() {
  const { hasPermission } = usePermissions();
  const toast = useToast();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadRecords();
  }, [filters]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const data = await medicalRecordsService.getAll(filters);
      setRecords(data);
    } catch (error: any) {
      toast.error('Error al cargar historias clínicas', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRecord = () => {
    setShowCreateModal(false);
    loadRecords();
  };

  const filteredRecords = records.filter(record => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      record.recordNumber.toLowerCase().includes(search) ||
      record.client.name.toLowerCase().includes(search) ||
      record.client.documentNumber.includes(search)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Historias Clínicas</h1>
        <p className="text-gray-600 mt-1">
          Gestión de historias clínicas electrónicas
        </p>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-4 items-center">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por número de HC, nombre o documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>

          {/* Filters */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-5 h-5" />
            Filtros
          </button>

          {/* Create */}
          {hasPermission('create_medical_records') && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Nueva Historia Clínica
            </button>
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t">
            <MedicalRecordFilters
              filters={filters}
              onFiltersChange={setFilters}
            />
          </div>
        )}
      </div>

      {/* Records List */}
      {loading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          Cargando historias clínicas...
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No hay historias clínicas
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm
              ? 'No se encontraron resultados para tu búsqueda'
              : 'Crea la primera historia clínica para comenzar'}
          </p>
          {hasPermission('create_medical_records') && !searchTerm && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5 inline mr-2" />
              Nueva Historia Clínica
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecords.map((record) => (
            <MedicalRecordCard
              key={record.id}
              record={record}
              onUpdate={loadRecords}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateMedicalRecordModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateRecord}
        />
      )}
    </div>
  );
}
```
