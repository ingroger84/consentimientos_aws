# Resumen Visual: Historias Clínicas y Consentimientos

## 🎯 Respuesta a tu Pregunta

### ¿Cómo se implementó el módulo de historias clínicas?

Basado en:
- ✅ **Normativa Colombiana** (Resolución 1995/1999, Ley 1438/2011)
- ✅ **Mejores Prácticas** (Arquitectura multi-tenant, seguridad, auditoría)
- ✅ **Experiencia del Proyecto** (Integración con módulos existentes)

---

## 📋 Flujo Completo: Apertura → Cierre

```
┌─────────────────────────────────────────────────────────────┐
│                    FASE 1: APERTURA                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Profesional crea nueva HC                               │
│  2. Selecciona cliente/paciente                             │
│  3. Define tipo de admisión                                 │
│  4. Sistema genera número único                             │
│  5. Estado: ACTIVA                                          │
│  6. Auditoría: CREATE                                       │
│                                                             │
│  ✅ HC lista para recibir información clínica               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│              FASE 2: REGISTRO CLÍNICO                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📝 ANAMNESIS                                               │
│  ├── Motivo de consulta                                     │
│  ├── Enfermedad actual                                      │
│  ├── Antecedentes personales (JSONB)                        │
│  ├── Antecedentes familiares (JSONB)                        │
│  ├── Hábitos (JSONB)                                        │
│  └── Revisión por sistemas (JSONB)                          │
│                                                             │
│  🩺 EXAMEN FÍSICO                                           │
│  ├── Signos vitales (PA, FC, T°, etc.)                      │
│  ├── Peso, talla, IMC (auto-calculado)                      │
│  └── Examen por sistemas (JSONB)                            │
│                                                             │
│  🏥 DIAGNÓSTICOS                                            │
│  ├── Código CIE-10                                          │
│  ├── Descripción                                            │
│  ├── Tipo (principal, relacionado)                          │
│  └── Estado (confirmado, presuntivo)                        │
│                                                             │
│  📄 EVOLUCIONES (SOAP)                                      │
│  ├── S - Subjetivo (lo que refiere el paciente)            │
│  ├── O - Objetivo (hallazgos del examen)                    │
│  ├── A - Assessment (análisis y diagnóstico)                │
│  ├── P - Plan (tratamiento y seguimiento)                   │
│  └── Firma digital (opcional)                               │
│                                                             │
│  🔍 AUDITORÍA                                               │
│  └── Registro de TODAS las acciones                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                   FASE 3: CIERRE                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Verificar completitud de datos                          │
│  2. Click en "Cerrar Historia Clínica"                      │
│  3. Sistema cambia estado a: CERRADA                        │
│  4. Bloquea ediciones futuras                               │
│  5. Registra fecha y usuario que cierra                     │
│  6. Auditoría: CLOSE                                        │
│                                                             │
│  ⚠️  HC cerrada NO se puede editar                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔗 Integración con Consentimientos (Propuesta)

### Flujo Visual

```
┌─────────────────────────────────────────────────────────────┐
│         DURANTE LA ATENCIÓN (HC Abierta)                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Profesional identifica necesidad de consentimiento         │
│                    ↓                                        │
│  Click en "Generar Consentimiento" desde HC                 │
│                    ↓                                        │
│  ┌─────────────────────────────────────────────┐           │
│  │  Selecciona Tipo:                           │           │
│  │  ○ Consentimiento General                   │           │
│  │  ○ Procedimiento Específico                 │           │
│  │  ○ Tratamiento de Datos                     │           │
│  │  ○ Uso de Imágenes                          │           │
│  └─────────────────────────────────────────────┘           │
│                    ↓                                        │
│  Sistema PRE-LLENA automáticamente:                         │
│  ✓ Datos del paciente (nombre, documento)                  │
│  ✓ Número de HC                                            │
│  ✓ Fecha actual                                            │
│  ✓ Profesional que atiende                                 │
│  ✓ Diagnóstico actual (si existe)                          │
│                    ↓                                        │
│  Profesional completa información específica:               │
│  - Nombre del procedimiento                                 │
│  - Riesgos y beneficios                                     │
│  - Alternativas                                             │
│                    ↓                                        │
│  Paciente FIRMA el consentimiento                           │
│  (Firma digital o manuscrita)                               │
│                    ↓                                        │
│  Sistema VINCULA automáticamente:                           │
│  ✓ A la historia clínica                                   │
│  ✓ Al cliente                                              │
│  ✓ A la evolución actual (opcional)                        │
│                    ↓                                        │
│  Genera PDF y almacena en S3                                │
│                    ↓                                        │
│  Aparece en tab "Consentimientos" de la HC                  │
│                    ↓                                        │
│  Registra en AUDITORÍA                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Tabla de Relación

```
medical_records (HC)
       │
       │ 1:N
       ↓
medical_record_consents (Vínculo)
       │
       │ N:1
       ↓
consents (Consentimiento)
```

---

## 🎨 Vista de Usuario

### Pantalla: Ver Historia Clínica

```
┌─────────────────────────────────────────────────────────────┐
│  ← HC-2026-001                    [Generar Consentimiento]  │
│  Historia clínica de Juan Pérez                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📋 Información del Paciente                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Nombre: Juan Pérez                                  │   │
│  │ Documento: CC 1234567890                            │   │
│  │ Fecha Admisión: 25/01/2026                          │   │
│  │ Sede: Sede Principal                                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [Resumen] [Anamnesis] [Exámenes] [Diagnósticos]           │
│  [Evoluciones] [Consentimientos] ← NUEVO TAB                │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Tab: Consentimientos                               │   │
│  │                                                      │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │ CONS-2026-001                    [Firmado]   │   │   │
│  │  │ Apendicectomía                               │   │   │
│  │  │ Creado: 25/01/2026 14:30                     │   │   │
│  │  │ [Ver PDF]                                    │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  │                                                      │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │ CONS-2026-002                [Pendiente]     │   │   │
│  │  │ Tratamiento de Datos                         │   │   │
│  │  │ Creado: 25/01/2026 14:35                     │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  │                                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Arquitectura de Datos

```
┌─────────────────────────────────────────────────────────────┐
│                    BASE DE DATOS                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  clients (Pacientes)                                        │
│  ├── Datos personales                                       │
│  ├── Datos médicos (tipo sangre, EPS)                       │
│  └── Contacto de emergencia                                 │
│                                                             │
│  medical_records (HC Principal)                             │
│  ├── recordNumber (único)                                   │
│  ├── status (active, closed)                                │
│  ├── client_id → clients                                    │
│  └── tenant_id → tenants                                    │
│                                                             │
│  anamnesis                                                  │
│  ├── chiefComplaint                                         │
│  ├── personalHistory (JSONB)                                │
│  └── medical_record_id → medical_records                    │
│                                                             │
│  physical_exams                                             │
│  ├── Signos vitales                                         │
│  ├── physicalExamData (JSONB)                               │
│  └── medical_record_id → medical_records                    │
│                                                             │
│  diagnoses                                                  │
│  ├── cie10Code                                              │
│  ├── cie10Description                                       │
│  └── medical_record_id → medical_records                    │
│                                                             │
│  evolutions                                                 │
│  ├── SOAP (subjective, objective, assessment, plan)         │
│  ├── signedBy, signedAt                                     │
│  └── medical_record_id → medical_records                    │
│                                                             │
│  medical_record_consents (NUEVO - Propuesto)                │
│  ├── medical_record_id → medical_records                    │
│  ├── consent_id → consents                                  │
│  ├── procedureName                                          │
│  └── diagnosisCode                                          │
│                                                             │
│  consents (Consentimientos)                                 │
│  ├── consentNumber                                          │
│  ├── type, status                                           │
│  ├── pdfUrl                                                 │
│  └── client_id → clients                                    │
│                                                             │
│  medical_record_audit (Auditoría)                           │
│  ├── action, entityType                                     │
│  ├── oldValues, newValues (JSONB)                           │
│  └── userId, ipAddress, timestamp                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Checklist de Implementación

### Ya Implementado ✅

- [x] Modelo de datos completo
- [x] Crear HC
- [x] Agregar anamnesis
- [x] Agregar exámenes físicos
- [x] Agregar diagnósticos
- [x] Agregar evoluciones
- [x] Cerrar HC
- [x] Auditoría completa
- [x] Seguridad multi-tenant
- [x] Frontend con tabs
- [x] Búsqueda y filtros

### Por Implementar 🔄

- [ ] Tabla `medical_record_consents`
- [ ] Endpoint `POST /api/medical-records/:id/consents`
- [ ] Endpoint `GET /api/medical-records/:id/consents`
- [ ] Modal `GenerateConsentModal`
- [ ] Tab "Consentimientos" en vista de HC
- [ ] Pre-llenado automático de datos
- [ ] Vinculación automática
- [ ] Pruebas del flujo completo

---

## 🎯 Beneficios de la Integración

### Para el Profesional de Salud

✅ **Flujo Natural**: No sale del contexto de la HC  
✅ **Ahorro de Tiempo**: Datos pre-llenados automáticamente  
✅ **Menos Errores**: Información consistente  
✅ **Todo en un Lugar**: HC y consentimientos juntos  

### Para el Paciente

✅ **Claridad**: Consentimientos vinculados a su atención  
✅ **Trazabilidad**: Sabe qué firmó y cuándo  
✅ **Acceso**: Puede consultar sus consentimientos  

### Para la Institución

✅ **Cumplimiento Legal**: Documentación completa  
✅ **Auditoría**: Registro de todo  
✅ **Organización**: Información estructurada  
✅ **Seguridad**: Multi-tenant, permisos, auditoría  

---

## 📞 Conclusión

El módulo de historias clínicas está **completamente funcional** y cumple con:

✅ Normativa colombiana  
✅ Mejores prácticas de desarrollo  
✅ Seguridad y auditoría  
✅ Arquitectura escalable  

La **integración con consentimientos** es el siguiente paso natural y está **completamente diseñada** y lista para implementar.

**Fecha**: 2026-01-25  
**Versión**: 15.0.9
