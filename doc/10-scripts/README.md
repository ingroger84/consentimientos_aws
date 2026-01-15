# 🛠️ Scripts y Utilidades

Scripts de utilidad y mantenimiento del sistema.

## Archivos Principales

### Scripts de Ejecución
- `SCRIPTS_EJECUCION.md` - Documentación de scripts disponibles
- `docker-compose.yml` - Configuración de Docker Compose

### Mantenimiento
- `RESET_FABRICA.md` - Reset del sistema a estado de fábrica
- `USO_TERMINALES_KIRO.md` - Uso de terminales en Kiro

## Scripts Disponibles en la Raíz

### Inicio y Detención
- `start.ps1` - Mostrar instrucciones de inicio
- `stop.ps1` - Detener todos los procesos
- `start-project.ps1` - Iniciar proyecto completo
- `stop-project.ps1` - Detener proyecto completo

### Frontend
- `restart-frontend-clean.ps1` - Reiniciar frontend limpiando caché
- `start-frontend-production.ps1` - Iniciar frontend en modo producción

### Verificación
- `verificar-sistema.ps1` - Verificar estado del sistema

## Scripts de Backend

Ubicados en `backend/`:

### Verificación
- `check-consents.ts` - Verificar consentimientos
- `check-data.ts` - Verificar datos
- `check-settings-db.js` - Verificar settings en DB
- `check-super-admin-settings.ts` - Verificar settings de Super Admin
- `check-superadmin.ts` - Verificar Super Admin
- `check-tenant-demo.ts` - Verificar tenant demo
- `check-tenant-settings.ts` - Verificar settings de tenant
- `check-tenant-user.ts` - Verificar usuario de tenant
- `check-tenants.ts` - Verificar tenants

### Limpieza
- `cleanup-deleted-tenants.ts` - Limpiar tenants eliminados
- `cleanup-duplicates.ts` - Limpiar duplicados
- `cleanup-orphan-users.ts` - Limpiar usuarios huérfanos
- `delete-old-data.ts` - Eliminar datos antiguos
- `delete-old.ts` - Eliminar registros antiguos

### Correcciones
- `fix-duplicates.sql` - Fix de duplicados (SQL)
- `fix-failed-consents.ts` - Fix de consentimientos fallidos
- `fix-questions-tenant.ts` - Fix de preguntas por tenant
- `fix-tenant-settings.ts` - Fix de settings de tenant
- `run-fix.ts` - Ejecutar correcciones

### Migraciones
- `mark-migrations.ts` - Marcar migraciones
- `migrate-to-tenant.ts` - Migrar a tenant

### Reset y Configuración
- `reset-super-admin-settings.ts` - Reset settings de Super Admin
- `reset-superadmin-password.ts` - Reset password de Super Admin
- `reset-to-factory.ts` - Reset completo a fábrica

### Testing
- `test-email-config.ts` - Test de configuración de email
- `test-public-settings.ts` - Test de settings públicos
- `test-resource-limits.ts` - Test de límites de recursos
- `test-settings-isolation.ts` - Test de aislamiento de settings
- `test-workspace-email.ts` - Test de email de workspace

### Permisos
- `update-operador-permissions.ts` - Actualizar permisos de operador
- `add-password-reset-fields.ts` - Agregar campos de reset de password

### Listado
- `list-tenants.ts` - Listar todos los tenants

## Uso

### Ejecutar Scripts de PowerShell
```powershell
.\nombre-script.ps1
```

### Ejecutar Scripts de TypeScript
```powershell
cd backend
npx ts-node nombre-script.ts
```

### Ejecutar Scripts SQL
```powershell
psql -U admin -d consentimientos -f nombre-script.sql
```
