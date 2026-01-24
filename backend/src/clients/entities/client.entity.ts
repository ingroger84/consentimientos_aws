import { Entity, Column, ManyToOne, OneToMany, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Consent } from '../../consents/entities/consent.entity';

export enum ClientDocumentType {
  CC = 'CC', // Cédula de Ciudadanía
  TI = 'TI', // Tarjeta de Identidad
  CE = 'CE', // Cédula de Extranjería
  PA = 'PA', // Pasaporte
  RC = 'RC', // Registro Civil
  NIT = 'NIT', // NIT
}

@Entity('clients')
@Index(['tenantId', 'documentType', 'documentNumber'], { unique: true })
@Index(['tenantId', 'email'])
@Index(['tenantId', 'phone'])
@Index(['tenantId', 'fullName'])
export class Client extends BaseEntity {
  // Información básica
  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ name: 'document_type', type: 'enum', enum: ClientDocumentType })
  documentType: ClientDocumentType;

  @Column({ name: 'document_number' })
  documentNumber: string;

  // Información de contacto
  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  // Información adicional
  @Column({ name: 'birth_date', nullable: true })
  birthDate: Date;

  @Column({ nullable: true })
  gender: string;

  @Column({ name: 'blood_type', nullable: true })
  bloodType: string;

  // Información de emergencia
  @Column({ name: 'emergency_contact_name', nullable: true })
  emergencyContactName: string;

  @Column({ name: 'emergency_contact_phone', nullable: true })
  emergencyContactPhone: string;

  // Notas
  @Column({ type: 'text', nullable: true })
  notes: string;

  // Estadísticas
  @Column({ name: 'consents_count', default: 0 })
  consentsCount: number;

  @Column({ name: 'last_consent_at', nullable: true })
  lastConsentAt: Date;

  // Relaciones
  @ManyToOne(() => Tenant, (tenant) => tenant.clients)
  tenant: Tenant;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @OneToMany(() => Consent, (consent) => consent.client)
  consents: Consent[];
}
