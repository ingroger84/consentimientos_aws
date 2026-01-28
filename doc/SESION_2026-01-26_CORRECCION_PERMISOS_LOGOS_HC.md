# Sesión 2026-01-26: Corrección de Permisos para Logos HC

## Resumen Ejecutivo

**Problema:** El Administrador General no podía acceder a "Configuración → Logos HC" por falta de permisos.

**Solución:** Se agregó el permiso `edit_settings` al rol `ADMIN_GENERAL` mediante script de corrección.

**Estado:** ✅ COMPLETADO

---

## Problema Reportado

El usuario (logueado como Administrador General) recibía este mensaje al intentar acceder a Configuración → Logos HC:

```
No tienes permisos para realizar esta acción. Se requiere: uno de: edit_settings
```

---

## Diagnóstico

### 1. Verificación de Logos Configurados

Se ejecutó `backend/check-hc-logos-config.js` que confirmó:

✅ **Logos SÍ están configurados en BD:**
- `hcLogoUrl`: ✓ Configurado (S3)
- `hcWatermarkLogoUrl`: ✓ Configurado (S3)
- `hcFooterLogoUrl`: ✗ No configurado

### 2. Causa del Problema

El rol `ADMIN_GENERAL` no tenía el permiso `edit_settings` asignado en la base de datos.

---

## Solución Implementada

### Script de Corrección

Se creó `backend/fix-admin-settings-permission.js` que:

1. Busca el rol `ADMIN_GENERAL` en la base de datos
2. Verifica si tiene el permiso `edit_settings`
3. Agrega el permiso si no existe
4. Muestra el estado final

### Correcciones Realizadas

**Problema inicial:** El script intentaba buscar roles por `tenantId`, pero la tabla `roles` NO tiene esa columna.

**Descubrimiento:** Los roles son **globales** (no están asociados a tenants específicos).

**Solución:**

```javascript
// ❌ INCORRECTO
WHERE "tenantId" = $1 AND type = 'ADMIN_GENERAL'

// ✅ CORRECTO
WHERE type = 'ADMIN_GENERAL'
```

### Resultado de la Ejecución

```
✓ Conectado a la base de datos
Tenant: Clinica Demo (demo-medico)

=== VERIFICANDO ROL ADMINISTRADOR GENERAL ===
Rol: Administrador General (ADMIN_GENERAL)
ID: 54abeb48-e8bf-4a94-8228-cd6c94ccf5ad

Permisos actuales: 0
Tiene edit_settings: ✗

Agregando permiso edit_settings...
✓ Permiso agregado exitosamente

=== PERMISOS FINALES ===
Total de permisos: 1
Tiene edit_settings: ✓
```

---

## Instrucciones para el Usuario

### Pasos para Aplicar la Corrección

1. **Cerrar sesión** en el navegador
2. **Volver a iniciar sesión** como Administrador General  
   - Email: `admin@clinicademo.com`
   - Password: `Demo123!`
3. Ir a **Configuración → Logos HC**
4. Ahora podrás subir y configurar los logos

### Sobre los PDFs Generados

⚠️ **IMPORTANTE:** Los PDFs ya generados NO se actualizan automáticamente.

**Para ver los logos en un PDF:**
1. Genera un **NUEVO** consentimiento de HC
2. Los logos configurados aparecerán en el nuevo PDF
3. Los PDFs antiguos permanecen sin cambios

---

## Archivos Creados/Modificados

### Scripts
- ✅ `backend/fix-admin-settings-permission.js` - Script de corrección (creado y ejecutado)

### Documentación
- ✅ `doc/82-correccion-permisos-logos-hc/README.md` - Documentación completa
- ✅ `doc/SESION_2026-01-26_CORRECCION_PERMISOS_LOGOS_HC.md` - Este archivo
- ✅ `VERSION.md` - Actualizado a 15.0.11

---

## Contexto Técnico

### Estructura de la Tabla `roles`

```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  deleted_at TIMESTAMP,
  name VARCHAR NOT NULL,
  type USER-DEFINED NOT NULL,  -- ADMIN_GENERAL, OPERADOR, etc.
  description VARCHAR,
  permissions TEXT NOT NULL     -- JSON array de permisos
);
```

**Nota:** Los roles NO tienen columna `tenantId` - son globales para todo el sistema.

### Permisos del Sistema

El permiso `edit_settings` permite:
- Acceder a la sección de Configuración
- Subir y modificar logos (CN y HC)
- Configurar colores y personalización
- Modificar configuración general del tenant

---

## Verificación

### Verificar Logos Configurados

```bash
cd backend
node check-hc-logos-config.js
```

### Verificar Permisos del Rol

```bash
cd backend
node check-user-permissions.js
```

---

## Referencias

- **Logos Separados CN/HC:** `doc/66-logos-separados-cn-hc/`
- **Servicio de PDF HC:** `backend/src/medical-records/medical-records-pdf.service.ts`
- **Script de verificación:** `backend/check-hc-logos-config.js`
- **Ajuste de espaciado firma/footer:** `doc/81-ajuste-espacio-firma-footer/`

---

## Versión

**15.0.11** - Corrección de Permisos para Logos HC  
**Fecha:** 2026-01-26  
**Tipo:** PATCH
