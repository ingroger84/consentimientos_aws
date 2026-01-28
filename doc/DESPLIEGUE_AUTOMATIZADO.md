# Despliegue Automatizado a Producción - DatAgree

## Resumen Ejecutivo

Este documento describe el proceso **completamente automatizado** para desplegar la aplicación DatAgree en producción usando AWS Lightsail.

**Tiempo estimado:** 30-45 minutos  
**Nivel de dificultad:** Bajo (todo automatizado)  
**Requisitos previos:** PowerShell, AWS CLI

---

## Scripts Creados

### 1. `deploy-master.ps1` - Script Maestro
Ejecuta todo el proceso de despliegue de principio a fin.

### 2. `setup-production-server.ps1`
Configura el servidor desde cero (Node.js, PostgreSQL, Nginx, PM2, etc.)

### 3. `deploy-production-complete.ps1`
Despliega la aplicación (git pull, build, restart)

### 4. `configure-nginx-ssl.sh`
Configura Nginx con SSL/TLS usando Let's Encrypt

---

## Opción 1: Despliegue Completo (Recomendado)

### Ejecutar TODO de una vez:

```powershell
.\scripts\deploy-master.ps1 -All -Domain "archivoenlinea.com"
```

Este comando ejecutará:
1. ✅ Configuración del servidor
2. ✅ Instalación de dependencias
3. ✅ Configuración de base de datos
4. ✅ Configuración de Nginx + SSL
5. ✅ Despliegue de la aplicación

---

## Opción 2: Despliegue Por Fases

### Fase 1: Configurar Servidor
```powershell
.\scripts\deploy-master.ps1 -SetupServer -Domain "archivoenlinea.com"
```

### Fase 2: Configurar Nginx y SSL
```powershell
.\scripts\deploy-master.ps1 -ConfigureNginx -Domain "archivoenlinea.com"
```

### Fase 3: Desplegar Aplicación
```powershell
.\scripts\deploy-master.ps1 -Deploy
```

---

## Pre-requisitos

### 1. Instalar AWS CLI
```powershell
# Windows
winget install Amazon.AWSCLI

# Verificar instalación
aws --version
```

### 2. Configurar DNS
Antes de ejecutar, configura tu DNS:
- `archivoenlinea.com` → IP del servidor
- `*.archivoenlinea.com` → IP del servidor (wildcard)

### 3. Repositorio Git
Asegúrate de que el código esté en un repositorio Git accesible.

---

## Ejecución Paso a Paso

### PASO 1: Clonar Repositorio Localmente
```powershell
git clone https://github.com/tu-usuario/consentimientos.git
cd consentimientos
```

### PASO 2: Ejecutar Despliegue Maestro
```powershell
.\scripts\deploy-master.ps1 -All
```

### PASO 3: Seguir Instrucciones en Pantalla
El script te guiará a través de:
- Subir archivo .env al servidor
- Confirmar configuración DNS
- Verificar despliegue

---

## Qué Hace Cada Script

### setup-production-server.ps1
- Crea/verifica instancia de Lightsail
- Instala Node.js 18.x
- Instala PostgreSQL 14
- Instala Nginx
- Instala PM2
- Crea base de datos
- Genera credenciales seguras
- Clona repositorio
- Crea archivo .env

### configure-nginx-ssl.sh
- Configura Nginx como reverse proxy
- Obtiene certificado SSL de Let's Encrypt
- Configura renovación automática
- Optimiza configuración
- Habilita HTTPS

### deploy-production-complete.ps1
- Crea backup de base de datos
- Detiene aplicación
- Actualiza código (git pull)
- Instala dependencias
- Compila backend y frontend
- Ejecuta migraciones
- Reinicia aplicación
- Verifica health check

---

## Credenciales Generadas

El script genera automáticamente:
- ✅ Contraseña de base de datos
- ✅ JWT Secret
- ✅ Archivo .env completo

**Ubicación:** `server_credentials_YYYYMMDD_HHMMSS.txt`

⚠️ **IMPORTANTE:** Guarda este archivo de forma segura y elimínalo después.

---

## Verificación Post-Despliegue

### 1. Health Check
```powershell
curl https://archivoenlinea.com/api/health
```

### 2. Verificar SSL
```powershell
curl -I https://archivoenlinea.com
```

### 3. Verificar Frontend
Abre en navegador: `https://archivoenlinea.com`

### 4. Verificar Logs
```bash
# Conectar al servidor
ssh ubuntu@IP_DEL_SERVIDOR

# Ver logs
pm2 logs
```

---

## Troubleshooting

### Error: "Instancia no encontrada"
**Solución:** Verifica el nombre de la instancia en AWS Lightsail

### Error: "DNS no resuelve"
**Solución:** Espera a que el DNS se propague (puede tomar hasta 48h)

### Error: "Certificado SSL falla"
**Solución:** Verifica que el DNS esté configurado correctamente

### Error: "Aplicación no inicia"
**Solución:** 
```bash
ssh ubuntu@IP_DEL_SERVIDOR
pm2 logs
# Revisar errores en los logs
```

---

## Actualizaciones Futuras

Para actualizar la aplicación después del despliegue inicial:

```powershell
.\scripts\deploy-production-complete.ps1
```

Este comando:
1. Crea backup automático
2. Actualiza código
3. Reinstala dependencias
4. Recompila
5. Reinicia aplicación

---

## Rollback

Si algo sale mal:

```bash
# Conectar al servidor
ssh ubuntu@IP_DEL_SERVIDOR

# Restaurar backup
cd /backups
ls -la  # Ver backups disponibles
psql -h localhost -U admin consentimientos < db_backup_YYYYMMDD.sql

# Volver a versión anterior
cd /var/www/consentimientos
git log  # Ver commits
git reset --hard COMMIT_HASH
pm2 restart all
```

---

## Monitoreo

### Ver Estado de Aplicación
```bash
pm2 status
pm2 monit
```

### Ver Logs en Tiempo Real
```bash
pm2 logs
```

### Ver Logs de Nginx
```bash
tail -f /var/log/nginx/consentimientos_access.log
tail -f /var/log/nginx/consentimientos_error.log
```

---

## Backups Automáticos

Los backups se crean automáticamente:
- **Ubicación:** `/backups/`
- **Frecuencia:** Cada despliegue
- **Retención:** Últimos 7 días

---

## Soporte

**Documentación completa:** `DEPLOYMENT.md`  
**Troubleshooting:** `doc/90-auditoria-produccion/`

---

**Creado:** 2026-01-27  
**Versión:** 1.0
