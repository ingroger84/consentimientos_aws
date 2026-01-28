# 🗂️ Modelo de Datos - Sistema de Consentimientos Avanzado

## 📊 Diagrama de Relaciones

```
consent_templates (Ya existe)
    ↓ (1:N)
consent_config_templates (Nueva - Tabla pivote)
    ↓ (N:1)
consent_configs (Nueva)
    ↓ (1:N)
consent_questions (Nueva)
    ↓ (1:N)
consents (Mejorar existente)
    ↓ (1:N)
consent_responses (Nueva)
consent_signatures (Nueva)
consent_photos (Nueva)
```

## 📋 Tablas Detalladas

### 1. consent_templates (Ya existe - Sin cambios)

```sql
CREATE TABLE consent_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'procedure', 'data_treatment', 'image_rights', 'custom'
  content TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2. consent_configs (Nueva - Configuración de Consentimientos)

```sql
CREATE TABLE consent_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id),
  
  -- Información básica
  name VARCHAR(255) NOT NULL,
  description TEXT,
  code VARCHAR(50) UNIQUE, -- Código único para identificar
  
  -- Configuración de PDF
  pdf_title VARCHAR(255),
  pdf_header TEXT,
  pdf_footer TEXT,
  include_page_numbers BOOLEAN DEFAULT true,
  include_watermark BOOLEAN DEFAULT false,
  watermark_text VARCHAR(100),
  
  -- Configuración de firma
  require_signature BOOLEAN DEFAULT true,
  require_photo BOOLEAN DEFAULT false,
  require_witness BOOLEAN DEFAULT false,
  
  -- Vinculación
  service_ids UUID[], -- Array de IDs de servicios
  can_use_in_medical_records BOOLEAN DEFAULT true,
  
  -- Estado
  is_active BOOLEAN DEFAULT true,
  is_template BOOLEAN DEFAULT false, -- Si es plantilla para duplicar
  
  -- Metadata
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_tenant_code UNIQUE(tenant_id, code)
);

CREATE INDEX idx_consent_configs_tenant ON consent_configs(tenant_id);
CREATE INDEX idx_consent_configs_code ON consent_configs(code);
CREATE INDEX idx_consent_configs_services ON consent_configs USING GIN(service_ids);
```

### 3. consent_config_templates (Nueva - Relación N:N)

```sql
CREATE TABLE consent_config_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consent_config_id UUID REFERENCES consent_configs(id) ON DELETE CASCADE,
  template_id UUID REFERENCES consent_templates(id) ON DELETE CASCADE,
  
  -- Orden y configuración
  order_index INTEGER NOT NULL,
  page_break_before BOOLEAN DEFAULT false,
  page_break_after BOOLEAN DEFAULT true,
  
  -- Variables personalizadas para esta instancia
  custom_variables JSONB, -- {"key": "value"}
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_config_template UNIQUE(consent_config_id, template_id, order_index)
);

CREATE INDEX idx_config_templates_config ON consent_config_templates(consent_config_id);
CREATE INDEX idx_config_templates_order ON consent_config_templates(consent_config_id, order_index);
```

### 4. consent_questions (Nueva - Preguntas Personalizadas)

```sql
CREATE TABLE consent_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consent_config_id UUID REFERENCES consent_configs(id) ON DELETE CASCADE,
  
  -- Información de la pregunta
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL, -- 'yes_no', 'text', 'number', 'date', 'select', 'multiple_select'
  
  -- Opciones (para select/multiple_select)
  options JSONB, -- ["Opción 1", "Opción 2", ...]
  
  -- Validación
  is_required BOOLEAN DEFAULT true,
  validation_rules JSONB, -- {"min": 0, "max": 100, "pattern": "regex"}
  
  -- Orden y visualización
  order_index INTEGER NOT NULL,
  section VARCHAR(100), -- Para agrupar preguntas
  help_text TEXT,
  
  -- Condicional
  depends_on_question_id UUID REFERENCES consent_questions(id),
  show_if_answer JSONB, -- Condición para mostrar
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_questions_config ON consent_questions(consent_config_id);
CREATE INDEX idx_questions_order ON consent_questions(consent_config_id, order_index);
```

### 5. consents (Mejorar existente)

```sql
-- Agregar columnas a la tabla existente
ALTER TABLE consents ADD COLUMN IF NOT EXISTS consent_config_id UUID REFERENCES consent_configs(id);
ALTER TABLE consents ADD COLUMN IF NOT EXISTS pdf_pages INTEGER DEFAULT 1;
ALTER TABLE consents ADD COLUMN IF NOT EXISTS pdf_size_bytes BIGINT;
ALTER TABLE consents ADD COLUMN IF NOT EXISTS pdf_generated_at TIMESTAMP;
ALTER TABLE consents ADD COLUMN IF NOT EXISTS metadata JSONB; -- Información adicional

CREATE INDEX idx_consents_config ON consents(consent_config_id);
```

### 6. consent_responses (Nueva - Respuestas del Cliente)

```sql
CREATE TABLE consent_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consent_id UUID REFERENCES consents(id) ON DELETE CASCADE,
  question_id UUID REFERENCES consent_questions(id),
  
  -- Respuesta
  response_text TEXT,
  response_number NUMERIC,
  response_date DATE,
  response_boolean BOOLEAN,
  response_json JSONB, -- Para respuestas complejas
  
  -- Metadata
  answered_at TIMESTAMP DEFAULT NOW(),
  ip_address VARCHAR(45),
  user_agent TEXT
);

CREATE INDEX idx_responses_consent ON consent_responses(consent_id);
CREATE INDEX idx_responses_question ON consent_responses(question_id);
```

### 7. consent_signatures (Nueva - Firmas Digitales)

```sql
CREATE TABLE consent_signatures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consent_id UUID REFERENCES consents(id) ON DELETE CASCADE,
  
  -- Tipo de firma
  signature_type VARCHAR(50) NOT NULL, -- 'client', 'witness', 'professional'
  signer_name VARCHAR(255) NOT NULL,
  signer_id_number VARCHAR(50),
  signer_role VARCHAR(100), -- 'patient', 'legal_representative', 'witness', 'doctor'
  
  -- Firma
  signature_image_url VARCHAR(500), -- URL en S3
  signature_data TEXT, -- Base64 o SVG path
  
  -- Geolocalización
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  location_accuracy DECIMAL(10, 2),
  
  -- Metadata
  ip_address VARCHAR(45),
  user_agent TEXT,
  device_info JSONB,
  signed_at TIMESTAMP DEFAULT NOW(),
  
  -- Verificación
  verification_code VARCHAR(100),
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP
);

CREATE INDEX idx_signatures_consent ON consent_signatures(consent_id);
CREATE INDEX idx_signatures_type ON consent_signatures(signature_type);
```

### 8. consent_photos (Nueva - Fotos del Cliente)

```sql
CREATE TABLE consent_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consent_id UUID REFERENCES consents(id) ON DELETE CASCADE,
  
  -- Foto
  photo_url VARCHAR(500) NOT NULL, -- URL en S3
  photo_type VARCHAR(50) NOT NULL, -- 'selfie', 'id_front', 'id_back', 'procedure_before', 'procedure_after'
  
  -- Metadata
  file_size_bytes BIGINT,
  mime_type VARCHAR(100),
  width INTEGER,
  height INTEGER,
  
  -- Captura
  captured_at TIMESTAMP DEFAULT NOW(),
  device_info JSONB,
  
  -- Verificación facial (opcional)
  face_detected BOOLEAN,
  face_confidence DECIMAL(5, 2),
  liveness_check BOOLEAN
);

CREATE INDEX idx_photos_consent ON consent_photos(consent_id);
CREATE INDEX idx_photos_type ON consent_photos(photo_type);
```

## 🔗 Relaciones con Tablas Existentes

### Vinculación con Servicios

```sql
-- Los service_ids en consent_configs ya vinculan con services
-- Opcionalmente, crear tabla pivote explícita:

CREATE TABLE consent_config_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consent_config_id UUID REFERENCES consent_configs(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  is_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_config_service UNIQUE(consent_config_id, service_id)
);
```

### Vinculación con Historias Clínicas

```sql
-- Ya existe medical_record_consents
-- Agregar columna consent_config_id

ALTER TABLE medical_record_consents 
ADD COLUMN IF NOT EXISTS consent_config_id UUID REFERENCES consent_configs(id);

CREATE INDEX idx_mr_consents_config ON medical_record_consents(consent_config_id);
```

## 📊 Ejemplo de Datos

### Configuración de Consentimiento Compuesto

```json
{
  "consent_config": {
    "name": "Consentimiento Completo Cirugía Estética",
    "code": "CIRUGIA_ESTETICA_FULL",
    "pdf_title": "Consentimiento Informado - Cirugía Estética",
    "require_signature": true,
    "require_photo": true,
    "require_witness": false,
    "templates": [
      {
        "template_id": "uuid-1",
        "order": 1,
        "page_break_after": true
      },
      {
        "template_id": "uuid-2",
        "order": 2,
        "page_break_after": true
      },
      {
        "template_id": "uuid-3",
        "order": 3,
        "page_break_after": false
      }
    ],
    "questions": [
      {
        "question_text": "¿Ha tenido cirugías previas?",
        "question_type": "yes_no",
        "is_required": true,
        "order": 1
      },
      {
        "question_text": "Si respondió sí, especifique cuáles:",
        "question_type": "text",
        "is_required": false,
        "depends_on_question_id": "prev-question-id",
        "show_if_answer": {"value": true},
        "order": 2
      }
    ]
  }
}
```

## 🎯 Ventajas del Modelo

1. **Flexibilidad**: Configuraciones reutilizables
2. **Escalabilidad**: Fácil agregar nuevos tipos
3. **Trazabilidad**: Auditoría completa
4. **Personalización**: Por tenant y por servicio
5. **Cumplimiento**: Datos estructurados para reportes

---

**Siguiente:** [02_ARQUITECTURA_BACKEND.md](./02_ARQUITECTURA_BACKEND.md)
