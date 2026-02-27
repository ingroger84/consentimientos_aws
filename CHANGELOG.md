# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [46.1.0] - 2026-02-27

### Fixed
- Corregido error 403 al cerrar admisiones para rol Operador
- Agregado permiso `close_medical_records` al rol Operador en base de datos
- Corregido Super Admin no podía ver historias clínicas (filtro de tenantId)
- Corregido Super Admin no podía eliminar historias clínicas (foreign key constraints)
- Corregidos tipos de admisión - ahora soporta todos los 10 tipos definidos
- Sincronizado enum de tipos de admisión entre frontend y backend

### Changed
- Actualizado `AdmissionTypeModal.tsx` para incluir todos los tipos de admisión
- Actualizado `CreateMedicalRecordDto` para validar todos los tipos de admisión
- Mejorado método `delete` en `medical-records.service.ts` con transacciones
- Mejorado método `findAll` para detectar Super Admin automáticamente

### Added
- Script `add-close-admission-permission.js` para gestión de permisos
- Documentación de correcciones en archivos MD

## [46.0.0] - 2026-02-26

### Changed
- Actualizado sistema de versionamiento automático
- Mejorado sistema de caché del frontend

### Fixed
- Corregidos problemas de caché en navegadores
- Forzada actualización de versión en clientes

## [45.0.0] - 2026-02-25

### Added
- Sistema de admisiones múltiples para historias clínicas
- Soporte para diferentes tipos de admisión

## [44.0.1] - 2026-02-24

### Fixed
- Corregidos precios a valores originales según documentación

## [43.3.0] - 2026-02-23

### Removed
- Eliminados precios de México (MXN) - Solo CO y US según plan original

## [43.1.0] - 2026-02-22

### Added
- Población completa de base de datos Supabase
- Scripts de migración de datos

### Changed
- Migración completa a Supabase como base de datos principal

## [43.0.0] - 2026-02-21

### Added
- Migración a Supabase completada exitosamente
- Soporte para IPv6 en conexiones a Supabase

### Changed
- Base de datos migrada de AWS RDS a Supabase

---

## Tipos de cambios

- `Added` para funcionalidades nuevas
- `Changed` para cambios en funcionalidades existentes
- `Deprecated` para funcionalidades que serán eliminadas
- `Removed` para funcionalidades eliminadas
- `Fixed` para corrección de bugs
- `Security` para vulnerabilidades de seguridad
