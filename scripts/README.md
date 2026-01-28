# Scripts de Despliegue Automatizado

Este directorio contiene todos los scripts necesarios para desplegar la aplicación DatAgree en producción de forma completamente automatizada.

## 🚀 Inicio Rápido

### Opción 1: Despliegue Completo (Recomendado)
```powershell
# 1. Verificar que todo esté listo
.\scripts\pre-deployment-check.ps1

# 2. Desplegar todo
.\scripts\deploy-master.ps1 -All
```

### Opción 2: Solo Actualizar Aplicación
```powershell
.\scripts\deploy-production-complete.ps1
```

## 📁 Scripts Disponibles

### 1. `pre-deployment-check.ps1`
**Propósito:** Verificar que todo esté listo antes de desplegar

**Uso:**
```powershell
.\scripts\pre-deployment-check.ps1
```

**Verifica:**
- AWS CLI instalado
- Credenciales AWS válidas
- Git instalado
- Repositorio Git configurado
- Scripts de despliegue presentes
- Conexión a Lightsail

---

### 2. `deploy-master.ps1`
**Propósito:** Script maestro que ejecuta todo el proceso

**Uso:**
```powershell
# Despliegue completo
.\scripts\deploy-master.ps1 -All

# Solo configurar servidor
.\scripts\deploy-master.ps1 -SetupServer

# Solo configurar Nginx
.\scripts\deploy-master.ps1 -ConfigureNginx

# Solo desplegar aplicación
.\scripts\deploy-master.ps1 -Deploy

# Con dominio personalizado
.\scripts\deploy-master.ps1 -All -Domain "midominio.com"
```

**Parámetros:**
- `-All`: Ejecutar todo el proceso
- `-SetupServer`: Solo configurar servidor
- `-ConfigureNginx`: Solo configurar Nginx y SSL
- `-Deploy`: Solo desplegar aplicación
- `-Domain`: Dominio a usar (default: archivoenlinea.com)
- `-InstanceName`: Nombre de instancia Lightsail (default: datagree-prod)

---

### 3. `setup-production-server.ps1`
**Propósito:** Configurar servidor desde cero

**Uso:**
```powershell
.\scripts\setup-production-server.ps1 -InstanceName "mi-servidor" -Domain "midominio.com"
```

**Qué hace:**
- Crea/verifica instancia de Lightsail
- Instala Node.js, PostgreSQL, Nginx, PM2
- Crea base de datos
- Genera credenciales seguras
- Clona repositorio
- Crea archivo .env

**Salida:**
- `server_credentials_YYYYMMDD_HHMMSS.txt` - Credenciales generadas
- `temp_backend.env` - Archivo .env para el backend

---

### 4. `deploy-production-complete.ps1`
**Propósito:** Desplegar/actualizar la aplicación

**Uso:**
```powershell
# Despliegue normal
.\scripts\deploy-production-complete.ps1

# Sin backup
.\scripts\deploy-production-complete.ps1 -SkipBackup

# Sin tests
.\scripts\deploy-production-complete.ps1 -SkipTests
```

**Qué hace:**
- Crea backup de base de datos
- Detiene aplicación
- Actualiza código (git pull)
- Instala dependencias
- Compila backend y frontend
- Ejecuta migraciones
- Reinicia aplicación
- Verifica health check

**Parámetros:**
- `-SkipBackup`: Omitir backup de base de datos
- `-SkipTests`: Omitir health check

---

### 5. `configure-nginx-ssl.sh`
**Propósito:** Configurar Nginx con SSL/TLS

**Uso:**
```bash
# Ejecutar en el servidor
sudo bash /tmp/configure-nginx-ssl.sh
```

**Qué hace:**
- Configura Nginx como reverse proxy
- Obtiene certificado SSL de Let's Encrypt
- Configura renovación automática
- Optimiza configuración
- Habilita HTTPS

---

## 🔧 Configuración

### Credenciales AWS
Los scripts usan las siguientes credenciales (ya configuradas):

```powershell
$env:AWS_ACCESS_KEY_ID = "TU_AWS_ACCESS_KEY_LIGHTSAIL"
$env:AWS_SECRET_ACCESS_KEY = "TU_AWS_SECRET_KEY_LIGHTSAIL"
$env:AWS_DEFAULT_REGION = "us-east-1"
```

### Configuración por Defecto
- **Dominio:** archivoenlinea.com
- **Instancia:** datagree-prod
- **Región:** us-east-1
- **Directorio:** /var/www/consentimientos

## 📋 Flujo de Trabajo

### Primer Despliegue
```
1. pre-deployment-check.ps1
   ↓
2. deploy-master.ps1 -All
   ↓
3. Verificar aplicación
```

### Actualizaciones
```
1. Hacer cambios en código
   ↓
2. Commit y push a Git
   ↓
3. deploy-production-complete.ps1
   ↓
4. Verificar aplicación
```

## 🔍 Verificación

### Health Check
```powershell
curl https://archivoenlinea.com/api/health
```

### Ver Logs
```bash
# Conectar al servidor
ssh ubuntu@IP_DEL_SERVIDOR

# Ver logs de aplicación
pm2 logs

# Ver logs de Nginx
tail -f /var/log/nginx/consentimientos_access.log
```

### Ver Estado
```bash
pm2 status
pm2 monit
```

## 🚨 Troubleshooting

### Error: "AWS CLI no encontrado"
```powershell
winget install Amazon.AWSCLI
```

### Error: "Credenciales inválidas"
Verifica que las credenciales en el script sean correctas.

### Error: "Instancia no encontrada"
Verifica el nombre de la instancia en AWS Lightsail.

### Error: "DNS no resuelve"
Espera a que el DNS se propague (puede tomar hasta 48h).

## 📚 Documentación

- **Guía completa:** `doc/DESPLIEGUE_AUTOMATIZADO.md`
- **Deployment manual:** `DEPLOYMENT.md`
- **Troubleshooting:** `doc/90-auditoria-produccion/`

## 🔐 Seguridad

⚠️ **IMPORTANTE:**
- Los archivos de credenciales generados contienen información sensible
- Guárdalos de forma segura
- Elimínalos después de usarlos
- No los subas a Git

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs: `pm2 logs`
2. Consulta la documentación
3. Contacta al equipo de desarrollo

---

**Creado:** 2026-01-27  
**Versión:** 1.0
