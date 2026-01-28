# Changelog: Integración HC-Consentimientos

Registro de cambios de la implementación de integración entre Historias Clínicas y Consentimientos Informados.

---

## [1.0.0] - 2026-01-25

### ✅ Agregado

#### Base de Datos
- **Tabla `medical_record_consents`**
  - Relación N:N entre historias clínicas y consentimientos
  - Campos de contexto clínico (procedimiento, diagnóstico)
  - Auditoría completa (created_by, created_at)
  - Índices optimizados para consultas
  - Constraints de integridad referencial

- **Migración SQL**
  - Archivo: `backend/src/migrations/add-medical-record-consents.sql`
  - Script Node.js: `backend/run-consent-integration-migration.js`
  - Script PowerShell: `backend/run-consent-integration-migration.ps1`

#### Backend (NestJS)

- **Entidad `MedicalRecordConsent`**
  - Archivo: `backend/src/medical-records/entities/medical-record-consent.entity.ts`
  - Relaciones TypeORM con MedicalRecord, Consent, Evolution, User
  - Configuración CASCADE para eliminación

- **DTO `CreateConsentFromMedicalRecordDto`**
  - Archivo: `backend/src/medical-records/dto/create-consent-from-medical-record.dto.ts`
  - Validaciones con class-validator
  - Enum para tipos de consentimiento
  - Objeto anidado para información adicional

- **Métodos en `MedicalRecordsService`**
  - `createConsentFromMedicalRecord()`: Crea vinculación HC-Consentimiento
  - `getConsents()`: Obtiene consentimientos vinculados a una HC
  - Validaciones de estado de HC
  - Registro en auditoría

- **Endpoints en `MedicalRecordsController`**
  - `POST /api/medical-records/:id/consents`: Crear consentimiento
  - `GET /api/medical-records/:id/consents`: Listar consentimientos
  - Autenticación JWT requerida
  - Registro de IP y User-Agent

- **Actualización de `MedicalRecordsModule`**
  - Importación de `ConsentsModule`
  - Registro de entidad `MedicalRecordConsent`
  - Inyección de repositorio

#### Frontend (React + TypeScript)

- **Componente `GenerateConsentModal`**
  - Archivo: `frontend/src/components/medical-records/GenerateConsentModal.tsx`
  - Modal responsive con formulario
  - Validación con react-hook-form
  - Campos condicionales según tipo de consentimiento
  - Manejo de estados de carga
  - Integración con toast notifications

- **Actualización de `ViewMedicalRecordPage`**
  - Archivo: `frontend/src/pages/ViewMedicalRecordPage.tsx`
  - Botón "Generar Consentimiento" en header (solo HC activas)
  - Nuevo tab "Consentimientos"
  - Lista de consentimientos vinculados
  - Estado vacío con mensaje y acción
  - Integración con modal de generación

- **Métodos en `medicalRecordsService`**
  - Archivo: `frontend/src/services/medical-records.service.ts`
  - `createConsent()`: Llama a endpoint POST
  - `getConsents()`: Llama a endpoint GET

- **Tipos TypeScript**
  - Archivo: `frontend/src/types/medical-record.ts`
  - Interface `MedicalRecordConsent`
  - Actualización de interface `MedicalRecord` con propiedad `consents`

#### Documentación

- **Flujo Completo de HC**
  - Archivo: `doc/53-flujo-historias-clinicas/00_FLUJO_COMPLETO_HC.md`
  - Descripción del proceso completo
  - Normativa colombiana aplicable

- **Integración con Consentimientos**
  - Archivo: `doc/53-flujo-historias-clinicas/01_INTEGRACION_CONSENTIMIENTOS.md`
  - Diseño de la integración
  - Casos de uso
  - Arquitectura

- **Implementación Completada**
  - Archivo: `doc/53-flujo-historias-clinicas/02_IMPLEMENTACION_COMPLETADA.md`
  - Documentación técnica completa
  - Código implementado
  - Próximos pasos

- **Instrucciones de Prueba**
  - Archivo: `doc/53-flujo-historias-clinicas/03_INSTRUCCIONES_PRUEBA.md`
  - Casos de prueba detallados
  - Verificación en base de datos
  - Problemas comunes

- **Resumen Visual**
  - Archivo: `doc/53-flujo-historias-clinicas/04_RESUMEN_VISUAL_IMPLEMENTACION.md`
  - Diagramas de arquitectura
  - Flujos de datos
  - Modelo relacional

- **README Actualizado**
  - Archivo: `doc/53-flujo-historias-clinicas/README.md`
  - Índice de documentos
  - Estado actual
  - Enlaces relacionados

### 🔧 Modificado

#### Backend
- **`MedicalRecord` Entity**
  - Agregada relación `consents: MedicalRecordConsent[]`
  - Configuración CASCADE para eliminación

- **`MedicalRecordsService`**
  - Inyección de `MedicalRecordConsentsRepository`
  - Métodos de auditoría actualizados

#### Frontend
- **`ViewMedicalRecordPage`**
  - Agregado estado para modal de consentimientos
  - Agregado tab de consentimientos
  - Agregado botón de generación

- **`MedicalRecord` Type**
  - Agregada propiedad `consents?: MedicalRecordConsent[]`

### 📊 Estadísticas

- **Archivos creados:** 10
- **Archivos modificados:** 7
- **Líneas de código agregadas:** ~1,500
- **Líneas de documentación:** ~2,000
- **Endpoints nuevos:** 2
- **Componentes nuevos:** 1
- **Tablas nuevas:** 1

### 🧪 Pruebas

- [x] Migración ejecutada exitosamente
- [x] Backend compila sin errores
- [x] Frontend compila sin errores
- [x] No hay errores de TypeScript
- [x] Endpoints responden correctamente
- [x] Validaciones funcionan
- [x] Auditoría registra correctamente

### 📝 Notas

- La implementación actual usa placeholders para consentimientos
- Se requiere integración completa con `ConsentsService` para crear consentimientos reales
- La funcionalidad básica está completa y lista para pruebas de usuario

---

## [Pendiente] - Próximas Versiones

### 🔄 Por Implementar

#### v1.1.0 - Integración Completa con ConsentsService
- [ ] Inyectar `ConsentsService` en `MedicalRecordsService`
- [ ] Crear consentimientos reales con plantillas
- [ ] Vincular preguntas y respuestas
- [ ] Generar PDF automáticamente
- [ ] Actualizar `consentId` con ID real

#### v1.2.0 - Selector de Plantillas
- [ ] Endpoint para obtener plantillas por tipo
- [ ] Selector de plantilla en modal
- [ ] Filtrado de plantillas
- [ ] Preview de plantilla seleccionada

#### v1.3.0 - Firma Digital desde HC
- [ ] Botón "Firmar" en lista de consentimientos
- [ ] Modal de firma integrado
- [ ] Actualización de estado
- [ ] Generación de PDF firmado

#### v1.4.0 - Notificaciones
- [ ] Email al crear consentimiento
- [ ] Enlace para firmar
- [ ] Recordatorios automáticos
- [ ] Notificación al médico cuando se firma

#### v1.5.0 - Reportes y Estadísticas
- [ ] Sección de estadísticas en dashboard
- [ ] Consentimientos pendientes por HC
- [ ] Gráficos por tipo
- [ ] Exportación de reportes

---

## Formato de Versiones

Este proyecto sigue [Semantic Versioning](https://semver.org/):
- **MAJOR**: Cambios incompatibles en la API
- **MINOR**: Nueva funcionalidad compatible con versiones anteriores
- **PATCH**: Correcciones de bugs compatibles

---

## Tipos de Cambios

- **✅ Agregado**: Nueva funcionalidad
- **🔧 Modificado**: Cambios en funcionalidad existente
- **🗑️ Eliminado**: Funcionalidad removida
- **🐛 Corregido**: Corrección de bugs
- **🔒 Seguridad**: Correcciones de seguridad
- **📝 Documentación**: Cambios en documentación
- **⚡ Rendimiento**: Mejoras de rendimiento

---

**Última actualización:** 2026-01-25  
**Versión actual:** 1.0.0  
**Estado:** ✅ ESTABLE
