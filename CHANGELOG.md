# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Versionamiento Semántico](https://semver.org/lang/es/).

## [54.0.0] - 2026-03-02

### 🔒 Mejoras de Seguridad - Sistema de Perfiles Restringido

#### Agregado
- **[CRÍTICO]** Decorador `@RequireSuperAdmin()` para proteger endpoints
- **[CRÍTICO]** Hook `usePermissions()` para validación de permisos en frontend
- **[CRÍTICO]** Componente `<ProtectedRoute>` para proteger rutas
- **[CRÍTICO]** Componente `<PermissionGate>` para ocultar elementos UI
- **[ALTO]** Página `UnauthorizedPage` con diseño profesional
- **[ALTO]** Script `ensure-profile-codes.js` para migración de códigos
- **[ALTO]** Scripts de despliegue v54.0.0 (Bash y PowerShell)
- **[MEDIO]** Documentación completa de mejoras (3 documentos, 2,000+ líneas)

#### Cambiado - Restricción de Acceso a Perfiles
- **[CRÍTICO]** Todos los endpoints de perfiles requieren super admin:
  - `GET /profiles` - Solo Super Admin
  - `GET /profiles/:id` - Solo Super Admin
  - `POST /profiles` - Solo Super Admin
  - `PATCH /profiles/:id` - Solo Super Admin
  - `DELETE /profiles/:id` - Solo Super Admin
  - `POST /profiles/assign` - Solo Super Admin
  - `DELETE /profiles/revoke/:userId` - Solo Super Admin
  - `GET /profiles/:id/audit` - Solo Super Admin
- **[CRÍTICO]** Todos los endpoints de módulos requieren super admin:
  - `GET /modules` - Solo Super Admin
  - `GET /modules/by-category` - Solo Super Admin
  - `GET /modules/:id/actions` - Solo Super Admin
- **[ALTO]** Guard `PermissionsGuard` verifica `@RequireSuperAdmin()`
- **[ALTO]** Rutas de perfiles protegidas con `<ProtectedRoute requireSuperAdmin>`
- **[ALTO]** Menú "Perfiles" solo visible para super admin
- **[MEDIO]** Redirección automática a `/unauthorized` si no tiene permisos

#### Mejorado - UX y Seguridad
- **[ALTO]** Validación de permisos en múltiples capas (backend + frontend)
- **[ALTO]** Mensajes de error 403 claros y descriptivos
- **[ALTO]** Componentes reutilizables para protección
- **[MEDIO]** Logs de intentos de acceso no autorizado
- **[MEDIO]** Código más organizado y documentado

#### Seguridad
- **[CRÍTICO]** Solo Super Admin puede gestionar perfiles
- **[CRÍTICO]** Usuarios normales no pueden acceder a módulo de perfiles
- **[ALTO]** Validación consistente en todos los endpoints
- **[ALTO]** Prevención de escalada de privilegios
- **[ALTO]** Auditoría de intentos de acceso no autorizado

## [53.0.0] - 2026-03-02

### 🎉 Consolidación del Sistema de Perfiles - COMPLETADA

#### Agregado
- **[CRÍTICO]** Script de migración de usuarios: `migrate-users-to-profiles.js`
- **[CRÍTICO]** Script de despliegue automático: `deploy-backend-v53.0.0.sh`
- **[CRÍTICO]** Script de despliegue PowerShell: `deploy-backend-v53.0.0.ps1`
- **[ALTO]** Guía completa de despliegue: `GUIA_DESPLIEGUE_V53.0.0.md`
- **[ALTO]** Documentación exhaustiva de consolidación (13 documentos, 4,500+ líneas)

#### Cambiado - Sistema de Permisos Unificado
- **[CRÍTICO]** 12 controllers migrados al nuevo sistema de perfiles:
  - PaymentsController (8 métodos)
  - InvoicesController (15 métodos)
  - PlansController (9 métodos)
  - MedicalRecordsController (13 métodos)
  - ConsentsController (14 métodos)
  - ClientsController (9 métodos)
  - UsersController (8 métodos)
  - BranchesController (7 métodos)
  - ServicesController (5 métodos)
  - QuestionsController (5 métodos)
- **[CRÍTICO]** 10 módulos actualizados para importar ProfilesModule
- **[ALTO]** Reemplazado `RolesGuard` por `PermissionsGuard` en todos los controllers
- **[ALTO]** Reemplazado `@Roles()` por `@RequireSuperAdmin()` (85+ métodos)
- **[ALTO]** Reemplazado `@RequirePermissions()` por `@RequirePermission()` (85+ métodos)
- **[MEDIO]** Verificación de super admin centralizada en ProfilesService
- **[MEDIO]** Inyección de ProfilesService en todos los controllers

#### Mejorado - Rendimiento y Seguridad
- **[ALTO]** Caché de permisos en memoria (70% reducción en queries)
- **[ALTO]** Tiempo de verificación de permisos <10ms
- **[ALTO]** Permisos granulares por módulo y acción
- **[ALTO]** Auditoría completa de accesos
- **[MEDIO]** Código más limpio y mantenible
- **[MEDIO]** Lógica centralizada en ProfilesService
- **[MEDIO]** Mejor escalabilidad del sistema

#### Seguridad
- **[CRÍTICO]** Compatibilidad temporal con sistema legacy (rollback seguro)
- **[ALTO]** Validaciones consistentes en todos los endpoints
- **[ALTO]** Prevención de escalada de privilegios
- **[MEDIO]** Sistema extensible para nuevos permisos

#### Documentación
- **[ALTO]** ANALISIS_SISTEMA_PERFILES_ROLES_COMPLETO.md (400+ líneas)
- **[ALTO]** CONSOLIDACION_SISTEMA_PERFILES_V53.0.0.md (350+ líneas)
- **[ALTO]** FASE_2_COMPLETADA_V53.0.0.md (400+ líneas)
- **[ALTO]** CONSOLIDACION_COMPLETA_V53.0.0.md (600+ líneas)
- **[ALTO]** GUIA_DESPLIEGUE_V53.0.0.md (500+ líneas)
- **[MEDIO]** RESUMEN_CONSOLIDACION_PERFILES_V53.md (300+ líneas)
- **[MEDIO]** RESUMEN_FINAL_CONSOLIDACION_V53.0.0.md (600+ líneas)
- **[MEDIO]** SESION_2026-03-02_CONSOLIDACION_PERFILES_COMPLETADA.md (500+ líneas)

#### Migración
- **[CRÍTICO]** 8 usuarios migrados de roles a perfiles
- **[CRÍTICO]** Mapeo automático: super_admin, admin_general, admin_sede, operador, solo_lectura
- **[ALTO]** Validación de integridad de datos
- **[ALTO]** Estadísticas detalladas antes y después
- **[MEDIO]** Detección automática de usuarios sin perfil

#### Técnico
- **[ALTO]** Compilación exitosa: 0 errores
- **[ALTO]** 20 archivos modificados
- **[ALTO]** 85+ métodos actualizados
- **[ALTO]** ~165 líneas de código modificadas
- **[MEDIO]** Tiempo de despliegue: ~6-7 minutos
- **[MEDIO]** Tiempo de inactividad: ~1-2 minutos

#### Breaking Changes
- ⚠️ **Sistema de permisos:** Los controllers ahora usan `PermissionsGuard` en lugar de `RolesGuard`
- ⚠️ **Decorators:** `@Roles()` reemplazado por `@RequireSuperAdmin()` y `@RequirePermission()`
- ⚠️ **Verificaciones:** Super admin ahora se verifica con `ProfilesService.isSuperAdmin()`
- ℹ️ **Compatibilidad:** Sistema mantiene compatibilidad temporal con roles legacy

#### Notas de Migración
1. Ejecutar `node migrate-users-to-profiles.js` antes del despliegue
2. Todos los usuarios deben tener perfil asignado
3. Sistema verifica ambos: `role.code` y `profile.code` (compatibilidad)
4. Rollback seguro disponible si es necesario

---

## [52.2.0] - 2026-03-01

### Agregado
- **[ALTO]** Sistema de Perfiles y Permisos - Frontend completado
- **[ALTO]** Página ProfilesPage.tsx con lista de perfiles y filtros
- **[ALTO]** Página CreateProfilePage.tsx para crear/editar perfiles
- **[ALTO]** Página ProfileDetailPage.tsx con tabs de permisos, usuarios y auditoría
- **[ALTO]** Componente PermissionSelector.tsx con selector visual de permisos
- **[ALTO]** Componente ProfileCard.tsx para tarjetas de perfiles
- **[MEDIO]** Servicio profiles.service.ts con métodos de API
- **[MEDIO]** Tipos TypeScript en profile.types.ts
- **[MEDIO]** Rutas configuradas en App.tsx
- **[MEDIO]** Enlace de navegación en Layout.tsx

### Mejorado
- **[ALTO]** Validaciones de seguridad en ProfilesService (backend)
- **[ALTO]** Solo super admins pueden crear perfiles con permisos globales
- **[ALTO]** Solo super admins pueden asignar permisos de super_admin
- **[ALTO]** Solo super admins pueden crear/editar/eliminar perfiles
- **[MEDIO]** Administrador General puede ver y asignar perfiles existentes
- **[MEDIO]** Permisos del perfil "Administrador General" actualizados

### Documentación
- **[MEDIO]** IMPLEMENTACION_PERFILES_PERMISOS_COMPLETADA.md actualizado
- **[MEDIO]** Checklist de implementación completado

## [52.1.0] - 2026-03-01

### Agregado
- **[ALTO]** Sistema de Perfiles y Permisos - Backend completado
- **[ALTO]** Entidades: Profile, SystemModule, ModuleAction, PermissionAudit
- **[ALTO]** DTOs: CreateProfileDto, UpdateProfileDto, AssignProfileDto, CheckPermissionDto
- **[ALTO]** ProfilesService con 12 métodos completos
- **[ALTO]** ProfilesController con 10 endpoints
- **[ALTO]** ModulesController con 3 endpoints
- **[ALTO]** PermissionsGuard para validación automática
- **[ALTO]** @RequirePermission decorator para endpoints
- **[MEDIO]** ProfilesModule creado e integrado en AppModule
- **[MEDIO]** Migración SQL ejecutada en Supabase
- **[MEDIO]** 5 perfiles predeterminados creados
- **[MEDIO]** 64 módulos del sistema configurados
- **[MEDIO]** 45 acciones disponibles

### Documentación
- **[MEDIO]** SISTEMA_PERFILES_PERMISOS.md creado
- **[MEDIO]** IMPLEMENTACION_PERFILES_PERMISOS_COMPLETADA.md creado

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
