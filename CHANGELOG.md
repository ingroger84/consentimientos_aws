# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Versionamiento Semántico](https://semver.org/lang/es/).

## [49.0.0] - 2026-02-27

### Optimizado
- **[ALTO]** Estructura completa del proyecto reorganizada
- **[ALTO]** Scripts de backend organizados en carpetas por propósito (migrations, utils, permissions)
- **[ALTO]** Documentación organizada por versiones en `doc/correcciones/`
- **[MEDIO]** .gitignore mejorado para excluir archivos temporales y de análisis
- **[MEDIO]** Sistema de versionamiento automático sincronizado

### Agregado
- **[MEDIO]** CHANGELOG.md con historial completo de cambios
- **[MEDIO]** ESTADO_PROYECTO_V49.md con análisis completo del estado actual
- **[MEDIO]** ANALISIS_PROYECTO_V46.md con análisis detallado
- **[MEDIO]** RESUMEN_OPTIMIZACION_V48.md con resumen de optimizaciones

### Eliminado
- **[BAJO]** Archivos backup de código fuente (.backup)
- **[BAJO]** Scripts temporales de la raíz del proyecto
- **[BAJO]** Archivos de documentación temporal de la raíz

### Cambiado
- **[MEDIO]** Estructura de carpetas más escalable y mantenible
- **[MEDIO]** Organización de documentación por versiones
- **[BAJO]** Commits siguiendo convenciones (feat, fix, chore, docs)

## [48.0.0] - 2026-02-27

### Optimizado
- **[ALTO]** Organización completa de estructura del proyecto
- **[ALTO]** 135 archivos modificados/movidos para mejor organización
- **[MEDIO]** 119 scripts de backend organizados

### Agregado
- **[MEDIO]** Tag v48.0.0 en GitHub
- **[MEDIO]** Documentación de optimización

## [46.1.0] - 2026-02-27

### Agregado
- Sistema de 10 tipos de admisión completo (primera_vez, control, urgencia, hospitalización, cirugía, procedimiento, telemedicina, domiciliaria, interconsulta, otro)
- Permiso `close_medical_records` para roles Operador, Admin Sede y Admin General
- Soporte para Super Admin para ver y eliminar historias clínicas sin filtro de tenant
- Documentación organizada por versiones en `doc/correcciones/`
- Scripts organizados en `backend/scripts/` (migrations, utils, permissions)

### Corregido
- **[CRÍTICO]** Error 403 al cerrar admisiones para rol Operador
- **[CRÍTICO]** Super Admin no podía ver historias clínicas (filtro de tenantId incorrecto)
- **[CRÍTICO]** Super Admin no podía eliminar historias clínicas (errores de foreign key constraint)
- Tipos de admisión: solo 5 de 10 tipos funcionaban correctamente
- Permiso de reabrir admisiones no estaba correctamente asignado al rol Operador
- Eliminación en cascada de registros relacionados al eliminar HC (consentimientos, anamnesis, exámenes físicos, diagnósticos, evoluciones, órdenes médicas, prescripciones, procedimientos, planes de tratamiento, epicrisis, documentos, admisiones, auditoría)

### Cambiado
- Endpoint `PATCH /admissions/:id/close` ahora usa `PERMISSIONS.CLOSE_MEDICAL_RECORDS`
- Endpoint `DELETE /medical-records/:id` ahora detecta Super Admin y permite eliminación sin filtro de tenant
- Método `findAll` en medical-records.service.ts ahora maneja correctamente usuarios sin tenantId (Super Admin)
- Método `getAllGroupedByTenant` ahora valida que tenant no sea null antes de acceder a propiedades
- DTO `CreateMedicalRecordDto` ahora acepta todos los 10 tipos de admisión
- Componente `AdmissionTypeModal.tsx` ahora muestra los 10 tipos de admisión

### Optimizado
- Estructura de carpetas del proyecto
- Organización de scripts de backend
- .gitignore mejorado para excluir archivos temporales
- Documentación de correcciones organizada por versión

### Eliminado
- Archivos backup de código fuente
- Scripts temporales de la raíz del proyecto
- Archivos de documentación temporal de la raíz

## [46.0.0] - 2026-02-26

### Agregado
- Migración completa a Supabase
- Sistema de historias clínicas con admisiones múltiples
- Integración con Bold Payment Gateway
- Sistema de plantillas de consentimiento para HC
- Gestión de precios por región (Colombia, México, USA)
- Sistema de notificaciones
- Auditoría de historias clínicas

### Corregido
- Problemas de caché en frontend
- Autenticación con Bold Payment Gateway
- Sincronización de versiones entre frontend y backend

## [45.0.0] - 2026-02-24

### Agregado
- Sistema multi-tenant completo
- Gestión de roles y permisos
- Sistema de facturación
- Integración con AWS S3
- Sistema de correo electrónico

---

## Tipos de Cambios

- **Agregado** para funcionalidades nuevas
- **Cambiado** para cambios en funcionalidades existentes
- **Obsoleto** para funcionalidades que serán eliminadas
- **Eliminado** para funcionalidades eliminadas
- **Corregido** para corrección de errores
- **Seguridad** para vulnerabilidades corregidas
- **Optimizado** para mejoras de rendimiento o código

## Niveles de Prioridad

- **[CRÍTICO]** - Afecta funcionalidad principal o seguridad
- **[ALTO]** - Afecta experiencia de usuario significativamente
- **[MEDIO]** - Mejora funcionalidad existente
- **[BAJO]** - Cambios menores o cosméticos
