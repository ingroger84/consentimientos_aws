# 📜 Scripts del Proyecto

Esta carpeta contiene todos los scripts de utilidad, configuración y mantenimiento del proyecto.

## 📁 Estructura

### setup/
Scripts de configuración inicial y setup del proyecto.
- `setup-auto-version.ps1` - Configuración completa de versionamiento automático
- `setup-auto-version-simple.ps1` - Configuración simplificada de versionamiento
- `create-settings-page.ps1` - Crear página de configuración

### deployment/
Scripts para iniciar, detener y desplegar la aplicación.
- `start-project.ps1` - Iniciar proyecto completo
- `start.ps1` - Iniciar servicios
- `stop-project.ps1` - Detener proyecto
- `stop.ps1` - Detener servicios
- `start-frontend-production.ps1` - Iniciar frontend en modo producción
- `start-dev-with-ngrok.ps1` - Iniciar desarrollo con ngrok

### maintenance/
Scripts de mantenimiento y limpieza del sistema.
- `REINICIAR_TODO.ps1` - Reiniciar todo el sistema
- `REINICIAR_FRONTEND_LIMPIO.ps1` - Reiniciar frontend limpio
- `restart-frontend-clean.ps1` - Reiniciar frontend (versión alternativa)
- `verificar-sistema.ps1` - Verificar estado del sistema
- `MIGRACION_COMPLETA_NOTIFICACIONES.ps1` - Migración de notificaciones

### utils/
Scripts de utilidades varias.
- `update-version.ps1` - Actualizar versión manualmente
- `update-version-auto.js` - Actualización automática de versión
- `patch-schedule.js` - Parche para schedule
- `agregar-admin-localhost.ps1` - Agregar admin en localhost
- `agregar-permiso-correo.ps1` - Agregar permisos de correo

## 🚀 Uso Común

### Iniciar el Proyecto
```powershell
.\scripts\deployment\start-project.ps1
```

### Detener el Proyecto
```powershell
.\scripts\deployment\stop-project.ps1
```

### Verificar el Sistema
```powershell
.\scripts\maintenance\verificar-sistema.ps1
```

### Configurar Versionamiento
```powershell
.\scripts\setup\setup-auto-version.ps1
```

## ⚠️ Notas Importantes

- Todos los scripts PowerShell requieren permisos de ejecución
- Algunos scripts pueden requerir privilegios de administrador
- Revisa cada script antes de ejecutarlo para entender su función
- Los scripts de deployment están configurados para el entorno local

## 📝 Convenciones

- Scripts en MAYÚSCULAS: Scripts principales o importantes
- Scripts en minúsculas: Scripts auxiliares o alternativos
- Extensión .ps1: Scripts de PowerShell
- Extensión .js: Scripts de Node.js

---

**Última actualización:** 2026-01-21
