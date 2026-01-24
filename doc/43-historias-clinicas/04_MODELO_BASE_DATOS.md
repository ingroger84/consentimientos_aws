# Modelo de Base de Datos - Historias Clínicas

## Diagrama ER (Entidad-Relación)

### Tabla Principal: medical_records

```sql
CREATE TABLE medical_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relaciones
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  client_id UUID NOT NULL REFERENCES clients(id),
  branch_id UUID REFERENCES branches(id),
  
  -- Datos básicos
  record_number VARCHAR(50) UNIQUE NOT NULL, -- Número único de HC
  admission_date TIMESTAMP NOT NULL,
  admission_type VARCHAR(50) NOT NULL, -- consulta, urgencia, hospitalización
  
  -- Estado
  status VARCHAR(20) DEFAULT 'active', -- active, closed, archived
  is_locked BOOLEAN DEFAULT false,
  
  -- Auditoría
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  closed_at TIMESTAMP,
  closed_by UUID REFERENCES users(id),
  
  -- Índices
  CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  CONSTRAINT fk_client FOREIGN KEY (client_id) REFERENCES clients(id)
);

CREATE INDEX idx_medical_records_tenant ON medical_records(tenant_id);
CREATE INDEX idx_medical_records_client ON medical_records(client_id);
CREATE INDEX idx_medical_records_number ON medical_records(record_number);
```


### Tabla: anamnesis (Antecedentes)

```sql
CREATE TABLE anamnesis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medical_record_id UUID NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  
  -- Motivo de consulta
  chief_complaint TEXT NOT NULL,
  current_illness TEXT,
  
  -- Antecedentes personales
  personal_history JSONB, -- {pathological, surgical, allergies, medications, etc}
  family_history JSONB,
  
  -- Hábitos
  smoking BOOLEAN,
  alcohol BOOLEAN,
  drugs BOOLEAN,
  exercise BOOLEAN,
  habits_details JSONB,
  
  -- Gineco-obstétricos (si aplica)
  gynecological_history JSONB,
  
  -- Revisión por sistemas
  systems_review JSONB,
  
  -- Auditoría
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabla: physical_exams (Examen Físico)

```sql
CREATE TABLE physical_exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medical_record_id UUID NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  
  -- Signos vitales
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  heart_rate INTEGER,
  respiratory_rate INTEGER,
  temperature DECIMAL(4,1),
  oxygen_saturation INTEGER,
  weight DECIMAL(5,2),
  height DECIMAL(5,2),
  bmi DECIMAL(5,2),
  
  -- Examen físico por sistemas
  general_appearance TEXT,
  head_neck TEXT,
  cardiovascular TEXT,
  respiratory TEXT,
  abdomen TEXT,
  extremities TEXT,
  neurological TEXT,
  skin TEXT,
  
  -- Otros hallazgos
  other_findings TEXT,
  
  -- Auditoría
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```


### Tabla: diagnoses (Diagnósticos)

```sql
CREATE TABLE diagnoses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medical_record_id UUID NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  
  -- Diagnóstico
  cie10_code VARCHAR(10) NOT NULL, -- Código CIE-10
  cie10_description TEXT NOT NULL,
  diagnosis_type VARCHAR(20) NOT NULL, -- principal, relacionado, complicación
  
  -- Clasificación
  is_confirmed BOOLEAN DEFAULT false,
  is_presumptive BOOLEAN DEFAULT true,
  
  -- Auditoría
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_diagnoses_cie10 ON diagnoses(cie10_code);
```

### Tabla: evolutions (Evoluciones)

```sql
CREATE TABLE evolutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medical_record_id UUID NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  
  -- Contenido
  evolution_date TIMESTAMP NOT NULL,
  subjective TEXT, -- SOAP: Subjetivo
  objective TEXT, -- SOAP: Objetivo
  assessment TEXT, -- SOAP: Análisis
  plan TEXT, -- SOAP: Plan
  
  -- Tipo de nota
  note_type VARCHAR(50), -- evolución, interconsulta, epicrisis
  
  -- Firma digital
  signed_by UUID REFERENCES users(id),
  signed_at TIMESTAMP,
  signature_hash TEXT,
  
  -- Auditoría
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```


### Tabla: prescriptions (Prescripciones/Fórmulas)

```sql
CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medical_record_id UUID NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  
  -- Medicamento
  medication_name VARCHAR(255) NOT NULL,
  generic_name VARCHAR(255),
  presentation VARCHAR(100),
  
  -- Dosificación
  dose VARCHAR(100) NOT NULL,
  frequency VARCHAR(100) NOT NULL,
  duration VARCHAR(100) NOT NULL,
  route VARCHAR(50) NOT NULL, -- oral, IV, IM, tópica, etc
  
  -- Instrucciones
  instructions TEXT,
  
  -- Estado
  status VARCHAR(20) DEFAULT 'active', -- active, suspended, completed
  
  -- Auditoría
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabla: medical_orders (Órdenes Médicas)

```sql
CREATE TABLE medical_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medical_record_id UUID NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  
  -- Tipo de orden
  order_type VARCHAR(50) NOT NULL, -- laboratorio, imagen, procedimiento, interconsulta
  order_code VARCHAR(50),
  
  -- Descripción
  description TEXT NOT NULL,
  indications TEXT,
  
  -- Estado
  status VARCHAR(20) DEFAULT 'pending', -- pending, completed, cancelled
  
  -- Resultados
  result_date TIMESTAMP,
  result_summary TEXT,
  result_file_url TEXT,
  
  -- Auditoría
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```


### Tabla: medical_attachments (Archivos Adjuntos)

```sql
CREATE TABLE medical_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medical_record_id UUID NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  
  -- Archivo
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL, -- S3 URL
  file_type VARCHAR(50) NOT NULL, -- image, pdf, dicom, etc
  file_size INTEGER,
  
  -- Clasificación
  category VARCHAR(50), -- laboratorio, imagen, documento, foto
  description TEXT,
  
  -- Auditoría
  uploaded_by UUID NOT NULL REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT NOW()
);
```

### Tabla: medical_record_audit (Auditoría)

```sql
CREATE TABLE medical_record_audit (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medical_record_id UUID NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  
  -- Acción
  action VARCHAR(50) NOT NULL, -- create, update, view, delete, sign
  entity_type VARCHAR(50) NOT NULL, -- medical_record, evolution, prescription, etc
  entity_id UUID,
  
  -- Cambios
  old_values JSONB,
  new_values JSONB,
  
  -- Usuario
  user_id UUID NOT NULL REFERENCES users(id),
  user_name VARCHAR(255),
  user_role VARCHAR(100),
  
  -- Contexto
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  -- Timestamp
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_medical_record ON medical_record_audit(medical_record_id);
CREATE INDEX idx_audit_user ON medical_record_audit(user_id);
CREATE INDEX idx_audit_date ON medical_record_audit(created_at);
```

## Relaciones Clave

1. **medical_records** → **clients** (1:N)
2. **medical_records** → **anamnesis** (1:1)
3. **medical_records** → **physical_exams** (1:N)
4. **medical_records** → **diagnoses** (1:N)
5. **medical_records** → **evolutions** (1:N)
6. **medical_records** → **prescriptions** (1:N)
7. **medical_records** → **medical_orders** (1:N)
8. **medical_records** → **medical_attachments** (1:N)
