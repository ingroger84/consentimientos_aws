# Módulo de Citas Médicas - Propuesta General

## Contexto Legal en Colombia

### Normativa Aplicable

1. **Resolución 1995 de 1999** - Historia Clínica
   - Toda atención debe quedar registrada en la historia clínica
   - Debe incluir fecha, hora, motivo de consulta, diagnóstico y tratamiento

2. **Ley 1438 de 2011** - Reforma al Sistema de Salud
   - Derecho a la asignación de citas
   - Oportunidad en la atención

3. **Resolución 3374 de 2000** - Datos básicos
   - Información mínima que debe contener una cita

4. **Ley 1581 de 2012** - Protección de Datos Personales
   - Consentimiento informado para tratamiento de datos

## Visión General del Módulo

### Objetivo

Crear un sistema integral de gestión de citas médicas que:
- Cumpla con la normativa colombiana
- Se integre con historias clínicas existentes
- Permita gestión de consentimientos
- Facilite el flujo de atención médica
- Genere trazabilidad completa

### Integración con Módulos Existentes

```
┌─────────────────────────────────────────────────────────────┐
│                    MÓDULO DE CITAS                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
│  │   CLIENTES   │◄───┤    CITAS     │───►│   HISTORIAS  │ │
│  │  (Pacientes) │    │              │    │   CLÍNICAS   │ │
│  └──────────────┘    └──────┬───────┘    └──────────────┘ │
│                             │                              │
│                             ▼                              │
│                    ┌──────────────┐                        │
│                    │CONSENTIMIENTOS│                       │
│                    └──────────────┘                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Estados del Ciclo de Vida de una Cita

### 1. AGENDADA (scheduled)
**Descripción:** Cita creada y confirmada en el sistema

**Acciones Permitidas:**
- Confirmar cita (por paciente o administrativo)
- Reagendar
- Cancelar
- Enviar recordatorios

**Datos Requeridos:**
- Cliente/Paciente
- Profesional de salud
- Fecha y hora
- Tipo de cita
- Motivo de consulta (opcional en este punto)
- Sede/Consultorio

### 2. CONFIRMADA (confirmed)
**Descripción:** Paciente confirmó su asistencia

**Acciones Permitidas:**
- Reagendar (con penalización según políticas)
- Cancelar (con penalización según políticas)
- Marcar como "En sala de espera"

**Notificaciones:**
- Recordatorio 24 horas antes
- Recordatorio 2 horas antes
- Instrucciones pre-consulta

### 3. EN SALA DE ESPERA (waiting)
**Descripción:** Paciente llegó y está esperando atención

**Acciones Permitidas:**
- Llamar a consulta
- Cancelar (no show después de tiempo límite)

**Datos Adicionales:**
- Hora de llegada
- Signos vitales básicos (opcional)
- Documentos pendientes

### 4. EN ATENCIÓN (in_progress)
**Descripción:** Paciente está siendo atendido por el profesional

**Acciones Permitidas:**
- Crear/Actualizar historia clínica
- Generar consentimientos
- Solicitar exámenes
- Prescribir medicamentos
- Finalizar consulta

**Datos Generados:**
- Motivo de consulta detallado
- Anamnesis
- Examen físico
- Diagnóstico
- Plan de tratamiento
- Consentimientos firmados

### 5. COMPLETADA (completed)
**Descripción:** Consulta finalizada exitosamente

**Acciones Permitidas:**
- Ver resumen de consulta
- Generar certificados
- Agendar seguimiento
- Enviar resumen al paciente

**Datos Finales:**
- Historia clínica actualizada
- Consentimientos archivados
- Tiempo total de atención
- Próxima cita (si aplica)

### 6. CANCELADA (cancelled)
**Descripción:** Cita cancelada por paciente o institución

**Datos Requeridos:**
- Motivo de cancelación
- Quién canceló
- Fecha/hora de cancelación
- Penalización aplicada (si aplica)

### 7. NO ASISTIÓ (no_show)
**Descripción:** Paciente no asistió sin cancelar

**Acciones:**
- Registrar inasistencia
- Aplicar políticas de penalización
- Enviar notificación al paciente
- Liberar cupo

## Flujo Completo de una Cita

```
┌─────────────┐
│  AGENDADA   │
└──────┬──────┘
       │
       ├─► Paciente confirma ──► CONFIRMADA
       │
       ├─► Paciente cancela ───► CANCELADA
       │
       └─► Reagendar ──────────► Nueva AGENDADA
              │
              ▼
       ┌─────────────┐
       │ CONFIRMADA  │
       └──────┬──────┘
              │
              ├─► Paciente llega ──► EN SALA DE ESPERA
              │
              ├─► Paciente cancela ► CANCELADA
              │
              └─► No llega ────────► NO ASISTIÓ
                     │
                     ▼
              ┌──────────────────┐
              │ EN SALA DE ESPERA│
              └────────┬─────────┘
                       │
                       ├─► Llamar a consulta ──► EN ATENCIÓN
                       │
                       └─► Tiempo límite ──────► NO ASISTIÓ
                              │
                              ▼
                       ┌─────────────┐
                       │ EN ATENCIÓN │
                       └──────┬──────┘
                              │
                              ├─► Finalizar consulta ──► COMPLETADA
                              │
                              └─► Emergencia/Interrupción ► REAGENDAR
```

## Integración con Historia Clínica

### Momento de Creación de Historia Clínica

**Opción 1: Al Agendar (Recomendado para Primera Vez)**
- Si es primera cita del paciente
- Se crea historia clínica en estado "draft"
- Se solicitan datos básicos

**Opción 2: Al Iniciar Atención (Recomendado para Seguimiento)**
- Si ya existe historia clínica
- Se crea nueva entrada de evolución
- Se vincula automáticamente a la cita

### Datos que Fluyen de Cita → Historia Clínica

```typescript
{
  appointmentId: string,
  date: Date,
  professional: {
    id: string,
    name: string,
    specialty: string,
    license: string
  },
  reasonForVisit: string,
  vitalSigns: {
    bloodPressure: string,
    heartRate: number,
    temperature: number,
    weight: number,
    height: number
  },
  duration: number, // minutos
  branch: {
    id: string,
    name: string,
    address: string
  }
}
```

## Integración con Consentimientos

### Flujo de Consentimientos en Cita

```
┌──────────────────────────────────────────────────────────┐
│              DURANTE LA ATENCIÓN                         │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  1. Profesional identifica necesidad de consentimiento  │
│     ↓                                                    │
│  2. Selecciona tipo de consentimiento desde la cita     │
│     ↓                                                    │
│  3. Sistema genera consentimiento pre-llenado           │
│     - Datos del paciente (desde cliente)                │
│     - Datos de la cita                                  │
│     - Procedimiento/tratamiento                         │
│     ↓                                                    │
│  4. Paciente firma consentimiento                       │
│     - Firma digital o manuscrita                        │
│     - Testigos (si aplica)                              │
│     ↓                                                    │
│  5. Consentimiento se adjunta a:                        │
│     - Historia clínica                                  │
│     - Registro de la cita                               │
│     - Expediente del paciente                           │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Tipos de Consentimientos Comunes en Citas

1. **Consentimiento Informado General**
   - Se genera al inicio de la atención
   - Autoriza examen físico y procedimientos básicos

2. **Consentimiento para Procedimientos Específicos**
   - Cirugías menores
   - Biopsias
   - Infiltraciones
   - Etc.

3. **Consentimiento para Tratamiento de Datos**
   - Uso de información clínica
   - Fotografías médicas
   - Compartir información con otros profesionales

4. **Consentimiento para Menores de Edad**
   - Firmado por representante legal
   - Incluye datos del menor y del representante

## Modelo de Datos Propuesto

### Tabla: appointments

```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relaciones
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  client_id UUID NOT NULL REFERENCES clients(id),
  professional_id UUID NOT NULL REFERENCES users(id),
  branch_id UUID NOT NULL REFERENCES branches(id),
  medical_record_id UUID REFERENCES medical_records(id),
  
  -- Información de la cita
  appointment_date TIMESTAMP NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  appointment_type VARCHAR(50) NOT NULL, -- 'first_time', 'follow_up', 'control', 'emergency'
  specialty VARCHAR(100),
  
  -- Estado y flujo
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled',
  -- 'scheduled', 'confirmed', 'waiting', 'in_progress', 'completed', 'cancelled', 'no_show'
  
  -- Motivo y notas
  reason_for_visit TEXT,
  notes TEXT,
  internal_notes TEXT, -- Solo visible para staff
  
  -- Confirmación
  confirmed_at TIMESTAMP,
  confirmed_by VARCHAR(20), -- 'patient', 'admin', 'system'
  
  -- Sala de espera
  checked_in_at TIMESTAMP,
  called_at TIMESTAMP,
  
  -- Atención
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  -- Cancelación
  cancelled_at TIMESTAMP,
  cancelled_by UUID REFERENCES users(id),
  cancellation_reason TEXT,
  cancellation_type VARCHAR(20), -- 'patient', 'professional', 'admin', 'system'
  
  -- Recordatorios
  reminder_sent_24h BOOLEAN DEFAULT FALSE,
  reminder_sent_2h BOOLEAN DEFAULT FALSE,
  
  -- Seguimiento
  follow_up_required BOOLEAN DEFAULT FALSE,
  follow_up_date DATE,
  follow_up_notes TEXT,
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  
  -- Índices para búsquedas comunes
  CONSTRAINT valid_status CHECK (status IN (
    'scheduled', 'confirmed', 'waiting', 'in_progress', 
    'completed', 'cancelled', 'no_show'
  ))
);

-- Índices
CREATE INDEX idx_appointments_tenant ON appointments(tenant_id);
CREATE INDEX idx_appointments_client ON appointments(client_id);
CREATE INDEX idx_appointments_professional ON appointments(professional_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_branch ON appointments(branch_id);
```

### Tabla: appointment_consents (Relación Cita-Consentimiento)

```sql
CREATE TABLE appointment_consents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  consent_id UUID NOT NULL REFERENCES consents(id) ON DELETE CASCADE,
  
  -- Contexto
  created_during_appointment BOOLEAN DEFAULT TRUE,
  required_for_procedure BOOLEAN DEFAULT FALSE,
  procedure_name VARCHAR(255),
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  
  UNIQUE(appointment_id, consent_id)
);
```

### Tabla: appointment_history (Trazabilidad)

```sql
CREATE TABLE appointment_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  
  -- Cambio
  previous_status VARCHAR(20),
  new_status VARCHAR(20),
  action VARCHAR(50) NOT NULL, -- 'created', 'confirmed', 'rescheduled', 'cancelled', etc.
  
  -- Detalles
  details JSONB,
  notes TEXT,
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  ip_address VARCHAR(45)
);
```

## Próximos Documentos

1. **01_ARQUITECTURA_TECNICA.md** - Estructura de código, servicios, controladores
2. **02_FLUJOS_DETALLADOS.md** - Diagramas de secuencia para cada acción
3. **03_INTEGRACION_HISTORIA_CLINICA.md** - Cómo vincular citas con historias clínicas
4. **04_INTEGRACION_CONSENTIMIENTOS.md** - Flujo completo de consentimientos en citas
5. **05_PERMISOS_Y_ROLES.md** - Quién puede hacer qué
6. **06_NOTIFICACIONES.md** - Sistema de recordatorios y alertas
7. **07_REPORTES_Y_ESTADISTICAS.md** - Métricas y análisis
8. **08_PLAN_IMPLEMENTACION.md** - Pasos para desarrollar el módulo

## Preguntas para Definir Alcance

Antes de continuar con el diseño detallado, necesito que me confirmes:

1. **¿Qué tipo de especialidades médicas manejarás?**
   - Medicina general
   - Especialidades (¿cuáles?)
   - Odontología
   - Psicología
   - Otros

2. **¿Necesitas gestión de recursos?**
   - Consultorios/salas
   - Equipos médicos
   - Personal de apoyo

3. **¿Qué nivel de automatización quieres?**
   - Recordatorios automáticos
   - Confirmación automática
   - Reagendamiento automático por cancelaciones

4. **¿Necesitas integración con terceros?**
   - Sistemas de mensajería (SMS, WhatsApp)
   - Calendarios externos (Google Calendar, Outlook)
   - Sistemas de pagos (para citas pagas)

5. **¿Políticas de cancelación?**
   - ¿Penalizaciones por cancelación tardía?
   - ¿Límite de cancelaciones por paciente?
   - ¿Tiempo mínimo para cancelar sin penalización?

Responde estas preguntas y procederé a crear el diseño técnico completo del módulo.
