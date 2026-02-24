# 📜 Scripts del Proyecto

Este directorio contiene todos los scripts organizados por categoría para gestionar el proyecto DatAgree.

## 📁 Estructura de Carpetas

```
scripts/
├── deployment/     # Scripts de despliegue a producción
├── setup/          # Scripts de configuración inicial
├── maintenance/    # Scripts de mantenimiento y correcciones
└── utils/          # Utilidades y herramientas auxiliares
```

---

## 🚀 Deployment (Despliegue)

Scripts para desplegar la aplicación en producción.

### Scripts Principales

**`deploy-master.ps1`** - Script maestro de despliegue
```powershell
.\scripts\deployment\deploy-master.ps1 -All
```

**`deploy-production-complete.ps1`** - Despliegue completo
```powershell
.\scripts\deployment\deploy-production-complete.ps1
```

**`simple-deploy.ps1`** - Despliegue simple y rápido
```powershell
.\scripts\deployment\simple-deploy.ps1
```

### Scripts Específicos

- `deploy-aws-auto.ps1` - Despliegue automático a AWS
- `deploy-direct.ps1` - Despliegue directo sin intermediarios
- `deploy-backend-*.ps1` - Despliegue solo backend
- `deploy-frontend-*.ps1` - Despliegue solo frontend
- `deploy-landing-*.ps1` - Despliegue de landing page
- `deploy-multi-region.*` - Despliegue multi-región
- `deploy-with-cache-busting.ps1` - Despliegue con limpieza de caché
- `upload-and-deploy.ps1` - Subir y desplegar
- `verify-deployment.sh` - Verificar despliegue exitoso

### Scripts de Versiones Específicas

- `deploy-v31.1.1-complete.ps1`
- `deploy-admissions-v39.ps1`
- `deploy-planes-precios-fix.ps1`
- `deploy-wildcard-ssl.ps1`

---

## ⚙️ Setup (Configuración)

Scripts para configuración inicial del servidor y proyecto.

**`setup-production-server.ps1`** - Configurar servidor desde cero
```powershell
.\scripts\setup\setup-production-server.ps1 -InstanceName "servidor" -Domain "dominio.com"
```

**`configure-nginx-ssl.sh`** - Configurar Nginx con SSL
```bash
sudo bash configure-nginx-ssl.sh
```

**`setup-auto-version.ps1`** - Configurar versionamiento automático
```powershell
.\scripts\setup\setup-auto-version.ps1
```

### Otros Scripts de Setup

- `setup-wildcard-ssl.ps1` - Configurar SSL wildcard
- `setup-wildcard-simple.ps1` - Configurar SSL wildcard simplificado
- `create-settings-page.ps1` - Crear página de configuración

---

## 🔧 Maintenance (Mantenimiento)

Scripts para mantenimiento, correcciones y optimizaciones.

### Limpieza de Caché

- `fix-frontend-cache.ps1` - Corregir caché del frontend
- `fix-nginx-cache.ps1` - Corregir caché de Nginx
- `force-cache-bust.ps1` - Forzar limpieza de caché
- `force-cache-clear.ps1` - Limpiar caché completamente
- `force-clean-deploy.ps1` - Despliegue con limpieza total

### Correcciones

- `fix-nginx-root.ps1` - Corregir configuración root de Nginx
- `fix-production-version.ps1` - Corregir versión en producción

### Optimizaciones

- `apply-optimizations.ps1` - Aplicar optimizaciones
- `implement-optimizations.sh` - Implementar optimizaciones

### Verificación y Mantenimiento

- `check-backend.ps1` - Verificar estado del backend
- `pre-deployment-check.ps1` - Verificación pre-despliegue
- `update-versions-production.sh` - Actualizar versiones en producción
- `clean-aws-credentials.ps1` - Limpiar credenciales AWS

### Reinicio de Servicios

- `REINICIAR_TODO.ps1` - Reiniciar todos los servicios
- `REINICIAR_FRONTEND_LIMPIO.ps1` - Reiniciar frontend limpio
- `restart-frontend-clean.ps1` - Reiniciar frontend
- `verificar-sistema.ps1` - Verificar estado del sistema
- `MIGRACION_COMPLETA_NOTIFICACIONES.ps1` - Migración de notificaciones

---

## 🛠️ Utils (Utilidades)

Herramientas auxiliares y scripts de utilidad.

### Versionamiento

- `bump-version.js` - Incrementar versión
- `smart-version.js` - Versionamiento inteligente
- `update-version-auto.js` - Actualizar versión automáticamente
- `update-version.ps1` - Actualizar versión manual
- `show-version.js` - Mostrar versión actual
- `verify-version-sync.js` - Verificar sincronización de versiones
- `version.ps1` - Gestión de versiones
- `version-help.ps1` - Ayuda de versionamiento
- `patch-schedule.js` - Programar parches

### Permisos y Configuración

- `apply-permissions-aws.ps1` - Aplicar permisos en AWS
- `apply-permissions-direct.ps1` - Aplicar permisos directamente
- `apply-permissions-simple.ps1` - Aplicar permisos simple
- `agregar-admin-localhost.ps1` - Agregar admin local
- `agregar-permiso-correo.ps1` - Agregar permiso de correo
- `add-tenant-ssl.ps1` - Agregar SSL a tenant

### Documentación y Organización

- `organize-docs.ps1` - Organizar documentación
- `rotate-credentials.md` - Guía de rotación de credenciales

### Otros

- `cambio-dominio.ps1` - Cambiar dominio

---

## 🚀 Inicio Rápido

### Primer Despliegue

```powershell
# 1. Verificar requisitos
.\scripts\maintenance\pre-deployment-check.ps1

# 2. Configurar servidor (solo primera vez)
.\scripts\setup\setup-production-server.ps1

# 3. Desplegar aplicación
.\scripts\deployment\deploy-master.ps1 -All
```

### Actualización Rápida

```powershell
# Despliegue simple
.\scripts\deployment\simple-deploy.ps1

# O despliegue completo
.\scripts\deployment\deploy-production-complete.ps1
```

### Mantenimiento

```powershell
# Verificar sistema
.\scripts\maintenance\verificar-sistema.ps1

# Limpiar caché si hay problemas
.\scripts\maintenance\force-cache-clear.ps1

# Reiniciar servicios
.\scripts\maintenance\REINICIAR_TODO.ps1
```

---

## 📋 Flujo de Trabajo Recomendado

### Desarrollo → Producción

1. **Desarrollo Local**
   ```powershell
   # Iniciar proyecto
   .\scripts\deployment\start-project.ps1
   ```

2. **Verificación Pre-Despliegue**
   ```powershell
   .\scripts\maintenance\pre-deployment-check.ps1
   ```

3. **Despliegue**
   ```powershell
   .\scripts\deployment\deploy-production-complete.ps1
   ```

4. **Verificación Post-Despliegue**
   ```powershell
   .\scripts\deployment\verify-deployment.sh
   ```

---

## 🔐 Seguridad

⚠️ **IMPORTANTE:**

- Muchos scripts contienen o generan credenciales sensibles
- Los scripts de despliegue están excluidos de Git por seguridad
- Guarda las credenciales generadas de forma segura
- Usa `rotate-credentials.md` para rotación periódica

### Scripts Sensibles (No en Git)

- Scripts con credenciales AWS
- Scripts con credenciales de base de datos
- Archivos de configuración con secretos

---

## 📚 Documentación Adicional

- **Guía completa de despliegue:** `/doc/despliegues/`
- **Versionamiento:** `/doc/versiones/SISTEMA_VERSIONAMIENTO_AUTOMATICO.md`
- **Troubleshooting:** `/doc/correcciones/`
- **Configuración:** `/config/README.md`

---

## 🔍 Troubleshooting

### Error: Script no encontrado
```powershell
# Verificar que estás en la raíz del proyecto
Get-Location
```

### Error: Permisos denegados
```powershell
# Ejecutar PowerShell como administrador
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Error: AWS CLI no encontrado
```powershell
winget install Amazon.AWSCLI
```

### Error: Conexión SSH fallida
```bash
# Verificar permisos de clave
chmod 400 credentials/AWS-ISSABEL.pem
```

---

## 📞 Soporte

Si encuentras problemas:

1. Revisa los logs: `pm2 logs` (en servidor)
2. Consulta `/doc/correcciones/`
3. Verifica `/doc/despliegues/`
4. Contacta al equipo de desarrollo

---

**Última actualización:** 2026-02-24  
**Versión del proyecto:** 42.0.0
