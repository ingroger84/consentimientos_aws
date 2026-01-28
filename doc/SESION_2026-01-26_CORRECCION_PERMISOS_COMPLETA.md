# Sesión 2026-01-26: Corrección Completa de Permisos del Administrador General

## Resumen Ejecutivo

**Problema:** El Administrador General no podía eliminar consentimientos HC a pesar de tener los permisos "seleccionados" en la configuración.

**Causa Raíz:** 
1. Los permisos NO estaban guardados en la base de datos (rol tenía 0 permisos)
2. El frontend verificaba un nombre de permiso incorrecto

**Solución:** 
1. Agregados 60 permisos completos al rol `ADMIN_GENERAL` en BD
2. Corregido nombre de permiso en el frontend

**Estado:** ✅ COMPLETADO

---

## Problema Reportado

El usuario reportó:

> "Tengo seleccionado todos los permisos para plantillas consentimientos HC en el administrador general, pero cuando entro a eliminar un consentimiento HC no me sale la opción"

---

## Diagnóstico

### 1. Verificación de Permisos en Base de Datos

Se ejecutó `backend/check-admin-general-permissions.js`:

```
=== ROL ADMINISTRADOR GENERAL ===
Rol: Administrador General (ADMIN_GENERAL)
ID: 54abeb48-e8bf-4a94-8228-cd6c94ccf5ad

⚠️  Error parseando permisos
Total de permisos: 0

=== PERMISOS DE PLANTILLAS HC ===
  ✗ view_mr_consent_templates
  ✗ create_mr_consent_templates
  ✗ edit_mr_consent_templates
  ✗ delete_mr_consent_templates

=== PERMISOS DE CONSENTIMIENTOS HC ===
  ✗ view_mr_consents
  ✗ generate_mr_consents
  ✗ delete_mr_consents
```

**Conclusión:** El rol tenía **0 permisos** en la base de datos, aunque el frontend mostraba permisos seleccionados.

### 2. Verificación del Código Frontend

En `frontend/src/pages/ViewMedicalRecordPage.tsx`, línea 23:

```typescript
// ❌ INCORRECTO
const canDeleteConsents = user?.role?.permissions?.includes('delete:medical-record-consents') || false;
```

**Problema:** El permiso correcto es `delete_mr_consents` (con guión bajo), no `delete:medical-record-consents` (con dos puntos).

---

## Solución Implementada

### 1. Script para Agregar Todos los Permisos

Se creó y ejecutó `backend/add-all-permissions-admin-general.js`:

```javascript
const allPermissions = [
  // Dashboard
  'view_dashboard',
  
  // Consentimientos normales (6 permisos)
  'view_consents', 'create_consents', 'edit_consents', 
  'delete_consents', 'sign_consents', 'resend_consent_email',
  
  // Plantillas CN (4 permisos)
  'view_templates', 'create_templates', 'edit_templates', 'delete_templates',
  
  // Historias Clínicas (7 permisos)
  'view_medical_records', 'create_medical_records', 'edit_medical_records',
  'close_medical_records', 'delete_medical_records', 
  'sign_medical_records', 'export_medical_records',
  
  // Plantillas HC (4 permisos)
  'view_mr_consent_templates', 'create_mr_consent_templates',
  'edit_mr_consent_templates', 'delete_mr_consent_templates',
  
  // Consentimientos HC (3 permisos)
  'view_mr_consents', 'generate_mr_consents', 'delete_mr_consents',
  
  // Clientes, Usuarios, Roles, Sedes, Servicios, Preguntas (24 permisos)
  // Facturas, Configuración, Planes, Notificaciones (12 permisos)
  // ... (60 permisos en total)
];
```

**Resultado:**

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

### 2. Corrección del Frontend

Se corrigió el nombre del permiso en `ViewMedicalRecordPage.tsx`:

```typescript
// Antes (línea 23)
const canDeleteConsents = user?.role?.permissions?.includes('delete:medical-record-consents') || false;

// Después
const canDeleteConsents = user?.role?.permissions?.includes('delete_mr_consents') || false;
```

---

## Instrucciones para el Usuario

### Pasos para Aplicar la Corrección

1. **Cerrar sesión** en el navegador
2. **Limpiar caché del navegador** (Ctrl + Shift + Delete)
3. **Volver a iniciar sesión** como Administrador General
   - Email: `admin@clinicademo.com`
   - Password: `Demo123!`
4. Ir a **Historias Clínicas**
5. Abrir una HC que tenga consentimientos
6. En la pestaña **"Consentimientos"**, ahora verás:
   - 📄 Icono de ver PDF
   - ✉️ Icono de reenviar email
   - 🗑️ **Icono de eliminar** (papelera roja) ← NUEVO

---

## Archivos Creados/Modificados

### Backend - Scripts
- ✅ `backend/add-all-permissions-admin-general.js` - Script para agregar permisos (creado y ejecutado)
- ✅ `backend/check-admin-general-permissions.js` - Script de verificación (creado)

### Frontend
- ✅ `frontend/src/pages/ViewMedicalRecordPage.tsx` - Corregido nombre de permiso (línea 23)

### Documentación
- ✅ `doc/83-correccion-permisos-admin-general/README.md` - Documentación completa
- ✅ `doc/SESION_2026-01-26_CORRECCION_PERMISOS_COMPLETA.md` - Este archivo
- ✅ `VERSION.md` - Actualizado a 15.0.12

---

## Contexto Técnico

### Convención de Nombres de Permisos

El sistema usa **guión bajo** (`_`) para separar palabras:

| ✅ Correcto | ❌ Incorrecto |
|------------|--------------|
| `delete_mr_consents` | `delete:medical-record-consents` |
| `view_medical_records` | `view:medical-records` |
| `edit_settings` | `edit-settings` |

### Estructura de Roles

Los roles en la tabla `roles` son **globales**:

```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  type VARCHAR NOT NULL,  -- ADMIN_GENERAL, OPERADOR, etc.
  permissions TEXT NOT NULL  -- JSON array: ["perm1", "perm2", ...]
);
```

**Nota:** NO tienen columna `tenantId` - son compartidos entre todos los tenants.

### Permisos del Administrador General

El rol `ADMIN_GENERAL` ahora tiene **60 permisos** que cubren:

- ✅ Dashboard y visualización
- ✅ Consentimientos normales (CRUD completo)
- ✅ Plantillas de consentimientos normales (CRUD completo)
- ✅ Historias clínicas (CRUD completo + firmar + exportar)
- ✅ Plantillas de consentimientos HC (CRUD completo)
- ✅ Consentimientos HC (ver + generar + eliminar)
- ✅ Clientes, Usuarios, Roles (CRUD completo)
- ✅ Sedes, Servicios, Preguntas (CRUD completo)
- ✅ Facturas (CRUD completo + pagar)
- ✅ Configuración y personalización
- ✅ Planes y notificaciones

---

## Verificación

### Verificar Permisos en BD

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

### Verificar en el Frontend

1. Inicia sesión como Administrador General
2. Ve a Historias Clínicas
3. Abre una HC con consentimientos
4. En la pestaña "Consentimientos", deberías ver 3 iconos por cada consentimiento:
   - 📄 Ver PDF (azul)
   - ✉️ Reenviar Email (verde)
   - 🗑️ Eliminar (rojo) ← Este es el nuevo

---

## Referencias

- **Permisos de Logos HC:** `doc/82-correccion-permisos-logos-hc/`
- **Plantillas HC Separadas:** `doc/64-plantillas-hc-separadas/`
- **Página de Visualización HC:** `frontend/src/pages/ViewMedicalRecordPage.tsx`
- **Servicio de HC:** `backend/src/medical-records/medical-records.service.ts`

---

## Versión

**15.0.12** - Corrección Completa de Permisos del Administrador General  
**Fecha:** 2026-01-26  
**Tipo:** PATCH
