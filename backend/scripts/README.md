# 🛠️ Scripts de Utilidad

Scripts organizados por categoría para mantenimiento y administración del sistema.

## 📁 Estructura

### `/maintenance` - Mantenimiento y Limpieza
Scripts para limpieza de datos, corrección de problemas y mantenimiento general.

**Limpieza:**
- `cleanup-deleted-tenants.ts` - Eliminar tenants marcados como eliminados
- `cleanup-duplicates.ts` - Limpiar registros duplicados
- `cleanup-orphan-users.ts` - Eliminar usuarios huérfanos
- `delete-old-data.ts` - Eliminar datos antiguos
- `delete-old.ts` - Limpieza general de datos viejos

**Correcciones:**
- `fix-duplicates.sql` - SQL para corregir duplicados
- `fix-emoji.js` - Corregir problemas con emojis
- `fix-encoding.js` - Corregir encoding de caracteres
- `fix-encoding.py` - Corrección de encoding (Python)
- `fix-failed-consents.ts` - Corregir consentimientos fallidos
- `fix-invoice-email.js` - Corregir emails de facturas
- `fix-questions-tenant.ts` - Corregir preguntas por tenant
- `fix-tenant-plans.ts` - Corregir planes de tenants
- `fix-tenant-settings.ts` - Corregir configuración de tenants
- `run-fix.ts` - Ejecutar correcciones generales

### `/testing` - Pruebas y Verificación
Scripts para verificar el estado del sistema y probar funcionalidades.

**Verificación:**
- `check-consents.ts` - Verificar consentimientos
- `check-data.ts` - Verificar integridad de datos
- `check-failed-consent.ts` - Verificar consentimientos fallidos
- `check-invoice-items.ts` - Verificar items de facturas
- `check-settings-db.js` - Verificar configuración en DB
- `check-super-admin-settings.ts` - Verificar config de Super Admin
- `check-superadmin.ts` - Verificar Super Admin
- `check-tenant-demo.ts` - Verificar tenant demo
- `check-tenant-plan.ts` - Verificar planes de tenant
- `check-tenant-settings.ts` - Verificar configuración de tenant
- `check-tenant-user.ts` - Verificar usuarios de tenant
- `check-tenants.ts` - Verificar todos los tenants

**Pruebas:**
- `test-billing-system.ts` - Probar sistema de facturación
- `test-email-config.ts` - Probar configuración de email
- `test-plan-sync.ts` - Probar sincronización de planes
- `test-public-settings.ts` - Probar configuración pública
- `test-resource-limits.ts` - Probar límites de recursos
- `test-settings-isolation.ts` - Probar aislamiento de configuración
- `test-workspace-email.ts` - Probar email de workspace

**Auditoría:**
- `audit-custom-features.ts` - Auditar características personalizadas
- `audit-custom-limits.ts` - Auditar límites personalizados

### `/admin` - Administración
Scripts para tareas administrativas y configuración del sistema.

**Gestión de Usuarios:**
- `add-password-reset-fields.ts` - Agregar campos de reset de contraseña
- `reset-superadmin-password.ts` - Resetear contraseña de Super Admin
- `list-tenants.ts` - Listar todos los tenants

**Configuración:**
- `reset-super-admin-settings.ts` - Resetear configuración de Super Admin
- `reset-to-factory.ts` - Resetear sistema a estado de fábrica

**Actualizaciones:**
- `update-invoice-status.ts` - Actualizar estado de facturas
- `update-operador-permissions.ts` - Actualizar permisos de operadores

**Migraciones:**
- `mark-migrations.ts` - Marcar migraciones
- `migrate-to-tenant.ts` - Migrar datos a tenant

## 🚀 Uso

### Ejecutar un Script

```bash
cd backend
npx ts-node scripts/[categoria]/[nombre-script].ts
```

### Ejemplos

```bash
# Verificar estado de tenants
npx ts-node scripts/testing/check-tenants.ts

# Limpiar usuarios huérfanos
npx ts-node scripts/maintenance/cleanup-orphan-users.ts

# Resetear contraseña de Super Admin
npx ts-node scripts/admin/reset-superadmin-password.ts

# Probar sistema de facturación
npx ts-node scripts/testing/test-billing-system.ts
```

## ⚠️ Precauciones

- **Backup:** Siempre hacer backup de la base de datos antes de ejecutar scripts de mantenimiento
- **Producción:** Probar scripts en desarrollo antes de ejecutar en producción
- **Permisos:** Algunos scripts requieren permisos de Super Admin
- **Logs:** Revisar logs después de ejecutar scripts críticos

## 📝 Crear Nuevos Scripts

Al crear nuevos scripts, colócalos en la carpeta apropiada:

- **Mantenimiento:** Limpieza, correcciones, optimizaciones
- **Testing:** Verificaciones, pruebas, auditorías
- **Admin:** Configuración, gestión de usuarios, migraciones

## 🔗 Referencias

- [Documentación Principal](../../doc/README.md)
- [Guía de Inicio](../../doc/01-inicio/README.md)
- [Scripts de Ejecución](../../doc/10-scripts/SCRIPTS_EJECUCION.md)
