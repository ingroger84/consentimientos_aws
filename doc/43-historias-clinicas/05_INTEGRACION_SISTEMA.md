# Integración con Sistema Existente

## Módulos Existentes a Integrar

### 1. Módulo de Clientes → Pacientes

**Relación**: Los clientes existentes se convierten en pacientes

**Integración**:
```typescript
// backend/src/clients/clients.entity.ts
// Agregar campos médicos opcionales

@Entity('clients')
export class Client {
  // ... campos existentes ...
  
  // Campos médicos adicionales
  @Column({ nullable: true })
  blood_type?: string; // A+, B+, O+, AB+, etc
  
  @Column({ nullable: true })
  eps?: string; // EPS/Aseguradora
  
  @Column({ nullable: true })
  eps_code?: string;
  
  @Column({ nullable: true })
  occupation?: string;
  
  @Column({ nullable: true })
  marital_status?: string;
  
  @Column({ nullable: true })
  emergency_contact_name?: string;
  
  @Column({ nullable: true })
  emergency_contact_phone?: string;
  
  // Relación con historias clínicas
  @OneToMany(() => MedicalRecord, record => record.client)
  medicalRecords: MedicalRecord[];
}
```


### 2. Módulo de Consentimientos

**Relación**: Cada historia clínica puede tener consentimientos asociados

**Integración**:
```typescript
// backend/src/consents/consents.entity.ts
// Agregar relación con historia clínica

@Entity('consents')
export class Consent {
  // ... campos existentes ...
  
  @Column({ nullable: true })
  medical_record_id?: string;
  
  @ManyToOne(() => MedicalRecord, record => record.consents)
  @JoinColumn({ name: 'medical_record_id' })
  medicalRecord?: MedicalRecord;
}
```

**Flujo**:
1. Al crear una historia clínica, se puede generar automáticamente el consentimiento
2. El consentimiento queda vinculado a la HC
3. Se puede acceder a los consentimientos desde la HC

### 3. Módulo de Usuarios → Profesionales de Salud

**Relación**: Los usuarios con rol médico son profesionales de salud

**Integración**:
```typescript
// backend/src/users/users.entity.ts
// Agregar campos profesionales

@Entity('users')
export class User {
  // ... campos existentes ...
  
  // Campos profesionales de salud
  @Column({ nullable: true })
  professional_license?: string; // Tarjeta profesional
  
  @Column({ nullable: true })
  specialty?: string;
  
  @Column({ nullable: true })
  sub_specialty?: string;
  
  @Column({ nullable: true })
  signature_url?: string; // Firma digital en S3
}
```

**Roles nuevos**:
- `medico_general`
- `medico_especialista`
- `enfermera`
- `auxiliar_enfermeria`
- `terapeuta`


### 4. Módulo de Sedes → Consultorios

**Relación**: Las sedes tienen consultorios donde se atienden pacientes

**Integración**:
```typescript
// backend/src/branches/branches.entity.ts
// Las sedes ya existen, solo agregar tipo

@Entity('branches')
export class Branch {
  // ... campos existentes ...
  
  @Column({ nullable: true })
  branch_type?: string; // consultorio, urgencias, hospitalización
  
  @Column({ nullable: true })
  has_medical_services?: boolean;
}
```

### 5. Módulo de Servicios → Procedimientos Médicos

**Relación**: Los servicios pueden ser procedimientos médicos

**Integración**:
```typescript
// backend/src/services/services.entity.ts
// Agregar clasificación médica

@Entity('services')
export class Service {
  // ... campos existentes ...
  
  @Column({ nullable: true })
  is_medical_procedure?: boolean;
  
  @Column({ nullable: true })
  cups_code?: string; // Código CUPS (Colombia)
  
  @Column({ nullable: true })
  requires_consent?: boolean;
  
  @Column({ nullable: true })
  consent_template_id?: string;
}
```

### 6. Sistema de Permisos

**Permisos nuevos a crear**:

```typescript
// Permisos de historias clínicas
const medicalRecordPermissions = [
  'view_medical_records',
  'create_medical_records',
  'edit_medical_records',
  'delete_medical_records',
  'sign_medical_records',
  'view_all_medical_records', // Solo admin
  'export_medical_records',
  
  // Permisos específicos
  'view_anamnesis',
  'edit_anamnesis',
  'view_physical_exam',
  'edit_physical_exam',
  'view_diagnoses',
  'edit_diagnoses',
  'view_evolutions',
  'create_evolutions',
  'view_prescriptions',
  'create_prescriptions',
  'view_medical_orders',
  'create_medical_orders',
];
```
