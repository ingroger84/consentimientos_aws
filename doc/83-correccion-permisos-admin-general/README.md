# Corrección de Permisos del Administrador General

**Fecha:** 2026-01-26  
**Versión:** 15.0.12  
**Estado:** ✅ COMPLETADO

## Problema

El usuario Administrador General tenía todos los permisos seleccionados en la configuración del frontend, pero:

1. **En la base de datos:** El rol `ADMIN_GENERAL` tenía 0 permisos guardados
2. **En el frontend:** El código verificaba un permiso incorrecto para eliminar consentimientos HC

### Síntomas

- No aparecía el botón de eliminar consentimientos HC
- Aunque en la configuración se veían todos los permisos seleccionados, no funcionaban

## Causa Raíz

### Problema 1: Permisos No Guardados en BD

El rol `ADMIN_GENERAL` en la tabla `roles` tenía el campo `permissions` vacío o con valor incorrecto, a pesar de que el frontend mostraba los permisos seleccionados.

### Problema 2: Nombre de Permiso Incorrecto

En `frontend/src/pages/ViewMedicalRecordPage.tsx`, línea 23:

```typescript
// ❌ INCORRECTO
const canDeleteConsents = user?.role?.permissions?.includes('delete:medical-record-consents') || false;

// ✅ CORRECTO
const canDeleteConsents = user?.role?.permissions?.includes('delete_mr_consents') || false;
```

## Solución Implementada

### 1. Script para Agregar Todos los Permisos

Se creó `backend/add-all-permissions-admin-general.js` que:

- Busca el rol `ADMIN_GENERAL` en la base de datos
- Agrega **60 permisos completos** al rol
- Verifica que los permisos se guardaron correctamente

**Permisos agregados:**

#### Dashboard
- `view_dashboard`

#### Consentimientos Normales
- `view_consents`, `create_consents`, `edit_consents`, `delete_consents`
- `sign_consents`, `resend_consent_email`

#### Plantillas de Consentimientos Normales
- `view_templates`, `create_templates`, `edit_templates`, `delete_templates`

#### Historias Clínicas
- `view_medical_records`, `create_medical_records`, `edit_medical_records`
- `close_medical_records`, `delete_medical_records`, `sign_medical_records`, `export_medical_records`

#### Plantillas de Consentimientos HC
- `view_mr_consent_templates`, `create_mr_consent_templates`
- `edit_mr_consent_templates`, `delete_mr_consent_templates`

#### Consentimientos HC
- `view_mr_consents`, `generate_mr_consents`, `delete_mr_consents`

#### Clientes
- `view_clients`, `create_clients`, `edit_clients`, `delete_clients`

#### Usuarios
- `view_users`, `create_users`, `edit_users`, `delete_users`

#### Roles
- `view_roles`, `create_roles`, `edit_roles`, `delete_roles`

#### Sedes
- `view_branches`, `create_branches`, `edit_branches`, `delete_branches`

#### Servicios
- `view_services`, `create_services`, `edit_services`, `delete_services`

#### Preguntas
- `view_questions`, `create_questions`, `edit_questions`, `delete_questions`

#### Facturas
- `view_invoices`, `create_invoices`, `edit_invoices`, `delete_invoices`, `pay_invoices`

#### Configuración
- `edit_settings`, `view_settings`

#### Planes
- `view_plans`, `edit_plans`

#### Notificaciones
- `view_notifications`, `mark_notifications_read`

### 2. Corrección del Frontend

Se corrigió el nombre del permiso en `ViewMedicalRecordPage.tsx`:

```typescript
// Antes
const canDeleteConsents = user?.role?.permissions?.includes('delete:medical-record-consents') || false;

// Después
const canDeleteConsents = user?.role?.permissions?.includes('delete_mr_consents') || false;
```

## Resultado

```
✓ Conectado a la base de datos

=== AGREGANDO PERMISOS AL ADMINISTRADOR GENERAL ===

Rol: Administrador General (ADMIN_GENERAL)
ID: 54abeb48-e8bf-4a94-8228-cd6c94ccf5ad

Agregando 60 permisos...

✓ Permisos actualizados exitosamente

=== PERMISOS FINALES ===

Total de permisos: 60

Permisos de Plantillas HC:
  ✓ view_mr_consent_templates
  ✓ create_mr_consent_templates
  ✓ edit_mr_consent_templates
  ✓ delete_mr_consent_templates

Permisos de Consentimientos HC:
  ✓ view_mr_consents
  ✓ generate_mr_consents
  ✓ delete_mr_consents

Permisos de Historias Clínicas:
  ✓ view_medical_records
  ✓ create_medical_records
  ✓ edit_medical_records
  ✓ close_medical_records
  ✓ delete_medical_records
  ✓ sign_medical_records
  ✓ export_medical_records
```

## Instrucciones para el Usuario

1. **Cerrar sesión** en el navegador
2. **Limpiar caché del navegador** (Ctrl + Shift + Delete)
3. **Volver a iniciar sesión** como Administrador General
   - Email: `admin@clinicademo.com`
   - Password: `Demo123!`
4. Ir a una Historia Clínica con consentimientos
5. En la pestaña "Consentimientos", ahora verás el botón de **eliminar** (icono de papelera)

## Archivos Modificados

### Backend
- ✅ `backend/add-all-permissions-admin-general.js` - Script creado y ejecutado
- ✅ `backend/check-admin-general-permissions.js` - Script de verificación

### Frontend
- ✅ `frontend/src/pages/ViewMedicalRecordPage.tsx` - Corregido nombre de permiso

### Documentación
- ✅ `doc/83-correccion-permisos-admin-general/README.md` - Este archivo

## Verificación

Para verificar que los permisos están correctos:

```bash
cd backend
node check-admin-general-permissions.js
```

Deberías ver:

```
Total de permisos: 60

=== PERMISOS DE PLANTILLAS HC ===
  ✓ view_mr_consent_templates
  ✓ create_mr_consent_templates
  ✓ edit_mr_consent_templates
  ✓ delete_mr_consent_templates

=== PERMISOS DE CONSENTIMIENTOS HC ===
  ✓ view_mr_consents
  ✓ generate_mr_consents
  ✓ delete_mr_consents
```

## Notas Técnicas

### Convención de Nombres de Permisos

El sistema usa **guión bajo** (`_`) para separar palabras en los nombres de permisos:

- ✅ `delete_mr_consents`
- ✅ `view_medical_records`
- ✅ `edit_settings`
- ❌ `delete:medical-record-consents` (incorrecto)
- ❌ `delete-mr-consents` (incorrecto)

### Roles Globales

Los roles en la tabla `roles` son **globales** (no tienen `tenantId`). Esto significa que:

- Un mismo rol se comparte entre todos los tenants
- Los permisos se definen a nivel de rol, no de usuario
- Los usuarios heredan los permisos de su rol asignado

## Referencias

- **Permisos de Logos HC:** `doc/82-correccion-permisos-logos-hc/`
- **Plantillas HC Separadas:** `doc/64-plantillas-hc-separadas/`
- **Página de Visualización HC:** `frontend/src/pages/ViewMedicalRecordPage.tsx`
