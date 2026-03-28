# Sistema de Backups Automáticos a S3

**Fecha de Implementación:** 2026-03-17  
**Versión:** 1.0  
**Estado:** ✅ LISTO PARA DESPLIEGUE

---

## 📋 Descripción General

Sistema completo de backups automáticos que:
- ✅ Crea backups completos del proyecto 2 veces al día
- ✅ Sube los backups a AWS S3 (bucket: `datagree-uploads`)
- ✅ Envía notificaciones por email después de cada backup
- ✅ Mantiene un consecutivo de backups
- ✅ Permite restauración fácil desde S3

---

## ⏰ Horarios de Backup

Los backups se ejecutan automáticamente:
- 🕛 **12:00 PM** (mediodía) - Todos los días
- 🕖 **7:00 PM** (noche) - Todos los días

---

## 📦 Contenido de los Backups

Cada backup incluye:
- ✅ Código fuente completo (backend y frontend)
- ✅ Archivos de configuración
- ✅ Scripts y documentación
- ✅ Archivos `.env` (credenciales)
- ✅ Archivos de migración y SQL

**Excluidos del backup:**
- ❌ `node_modules/` (se reinstalan en restauración)
- ❌ `.git/` (historial de git)
- ❌ `*.log` (archivos de logs)
- ❌ `dist/` y `build/` (se recompilan)
- ❌ Archivos temporales

---

## 🗂️ Ubicación de los Backups

### En S3
- **Bucket:** `datagree-uploads`
- **Carpeta:** `Back_Up_ArchivoEnLinea/`
- **Ruta completa:** `s3://datagree-uploads/Back_Up_ArchivoEnLinea/`

### Formato de nombres
```
backup_archivoenlinea_YYYYMMDD_HHMMSS.tar.gz
```

Ejemplo:
```
backup_archivoenlinea_20260317_120000.tar.gz
backup_archivoenlinea_20260317_190000.tar.gz
```

---

## 📧 Notificaciones por Email

Después de cada backup, se envía un email a:
- **Destinatario:** rcaraballo@innovasystems.com.co
- **Remitente:** info@innovasystems.com.co

### Contenido del Email

El email incluye:
- ✅ Consecutivo del backup (#1, #2, #3, etc.)
- ✅ Fecha y hora del backup
- ✅ Nombre del archivo
- ✅ Tamaño del archivo
- ✅ Ubicación en S3
- ✅ Total de backups disponibles
- ✅ Información de restauración

---

## 🚀 Instalación y Configuración

### Paso 1: Desplegar el Sistema

Desde tu máquina local (Windows), ejecuta:

```powershell
./scripts/deploy-backup-system.ps1
```

Este script:
1. Sube todos los scripts necesarios al servidor
2. Configura permisos de ejecución
3. Instala AWS CLI (si no está instalado)
4. Configura credenciales de AWS
5. Instala dependencias de Node.js (nodemailer)
6. Configura cron jobs para backups automáticos
7. Verifica la instalación

### Paso 2: Ejecutar Backup de Prueba

Conéctate al servidor y ejecuta:

```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
cd /home/ubuntu/consentimientos_aws
./scripts/backup-to-s3.sh
```

Verifica que:
- ✅ El backup se crea correctamente
- ✅ Se sube a S3
- ✅ Recibes el email de notificación

---

## 🔧 Uso del Sistema

### Backup Manual

Para ejecutar un backup manualmente:

```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
/home/ubuntu/consentimientos_aws/scripts/backup-to-s3.sh
```

### Listar Backups Disponibles

```bash
# Desde el servidor
aws s3 ls s3://datagree-uploads/Back_Up_ArchivoEnLinea/

# Desde tu máquina local (si tienes AWS CLI)
aws s3 ls s3://datagree-uploads/Back_Up_ArchivoEnLinea/ --profile datagree
```

### Ver Logs de Backups

```bash
# Ver log del último backup
tail -f /home/ubuntu/backup_logs/cron_backup.log

# Ver todos los logs
ls -lh /home/ubuntu/backup_logs/
```

### Verificar Cron Jobs

```bash
# Ver cron jobs configurados
crontab -l

# Editar cron jobs (si es necesario)
crontab -e
```

---

## 🔄 Restauración de Backups

### Opción 1: Menú Interactivo

```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
/home/ubuntu/consentimientos_aws/scripts/restore-from-s3.sh
```

El menú te permite:
1. Listar todos los backups disponibles
2. Restaurar el último backup
3. Restaurar backup por consecutivo
4. Restaurar backup por nombre de archivo

### Opción 2: Línea de Comandos

```bash
# Restaurar el último backup
./scripts/restore-from-s3.sh --latest

# Restaurar por consecutivo
./scripts/restore-from-s3.sh --number 5

# Restaurar por nombre de archivo
./scripts/restore-from-s3.sh --file backup_archivoenlinea_20260317_120000.tar.gz

# Listar backups
./scripts/restore-from-s3.sh --list
```

### Proceso de Restauración

El script de restauración:
1. ✅ Crea un backup del estado actual (por seguridad)
2. ✅ Descarga el backup desde S3
3. ✅ Detiene los servicios (PM2)
4. ✅ Extrae el backup
5. ✅ Restaura los archivos
6. ✅ Reinstala dependencias (npm install)
7. ✅ Recompila el frontend
8. ✅ Reinicia los servicios

---

## 📁 Estructura de Archivos

```
consentimientos_aws/
├── scripts/
│   ├── backup-to-s3.sh              # Script principal de backup
│   ├── restore-from-s3.sh           # Script de restauración
│   ├── send-backup-email.js         # Script para enviar emails
│   ├── setup-automated-backups.sh   # Script de configuración inicial
│   └── deploy-backup-system.ps1     # Script de despliegue (Windows)
│
/home/ubuntu/
├── backup_logs/                      # Logs de backups
│   ├── backup_YYYYMMDD_HHMMSS.log   # Log de cada backup
│   ├── backup_counter.txt           # Contador de backups
│   └── cron_backup.log              # Log de cron jobs
│
└── backup_before_restore_*/         # Backups de seguridad antes de restaurar
```

---

## 🔐 Seguridad

### Credenciales de AWS

Las credenciales se obtienen automáticamente del archivo `.env`:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`

### Credenciales SMTP

Para envío de emails:
- `SMTP_HOST`: smtp.gmail.com
- `SMTP_PORT`: 587
- `SMTP_USER`: info@innovasystems.com.co
- `SMTP_PASSWORD`: (contraseña de aplicación)

### Permisos de S3

El usuario IAM tiene permisos para:
- ✅ Listar objetos en el bucket
- ✅ Subir objetos al bucket
- ✅ Descargar objetos del bucket
- ✅ Eliminar objetos del bucket (si es necesario)

---

## 📊 Monitoreo

### Verificar que los Backups se Ejecutan

```bash
# Ver últimos backups en S3
aws s3 ls s3://datagree-uploads/Back_Up_ArchivoEnLinea/ --recursive | tail -10

# Ver logs de cron
tail -20 /home/ubuntu/backup_logs/cron_backup.log

# Ver contador de backups
cat /home/ubuntu/backup_logs/backup_counter.txt
```

### Verificar Espacio en Disco

```bash
# Espacio disponible en el servidor
df -h

# Tamaño de los backups en S3
aws s3 ls s3://datagree-uploads/Back_Up_ArchivoEnLinea/ --recursive --human-readable --summarize
```

---

## 🛠️ Mantenimiento

### Limpiar Backups Antiguos

Para evitar costos excesivos en S3, se recomienda limpiar backups antiguos:

```bash
# Listar backups ordenados por fecha
aws s3 ls s3://datagree-uploads/Back_Up_ArchivoEnLinea/ | sort

# Eliminar un backup específico
aws s3 rm s3://datagree-uploads/Back_Up_ArchivoEnLinea/backup_archivoenlinea_20260101_120000.tar.gz

# Eliminar backups más antiguos de 30 días (ejemplo)
# PRECAUCIÓN: Verifica antes de ejecutar
aws s3 ls s3://datagree-uploads/Back_Up_ArchivoEnLinea/ | \
  awk '{print $4}' | \
  while read file; do
    # Lógica para eliminar backups antiguos
    echo "Verificar: $file"
  done
```

### Política de Retención Recomendada

- **Últimos 7 días:** Mantener todos los backups (14 backups)
- **Últimos 30 días:** Mantener 1 backup por día (30 backups)
- **Más de 30 días:** Mantener 1 backup por semana (12 backups por trimestre)

---

## ❓ Solución de Problemas

### Problema: El backup no se ejecuta automáticamente

**Solución:**
```bash
# Verificar cron jobs
crontab -l

# Ver logs de cron
tail -f /var/log/syslog | grep CRON

# Verificar permisos del script
ls -l /home/ubuntu/consentimientos_aws/scripts/backup-to-s3.sh
```

### Problema: No se recibe el email

**Solución:**
```bash
# Verificar que nodemailer está instalado
cd /home/ubuntu/consentimientos_aws
npm list nodemailer

# Probar envío de email manualmente
node scripts/send-backup-email.js "Test" "success" '{"counter":999,"file":"test.tar.gz","size":"1MB","s3url":"s3://test","totalBackups":1,"date":"2026-03-17"}'

# Verificar credenciales SMTP en .env
grep SMTP backend/.env
```

### Problema: Error al subir a S3

**Solución:**
```bash
# Verificar credenciales de AWS
aws s3 ls s3://datagree-uploads/

# Verificar configuración de AWS CLI
cat ~/.aws/credentials
cat ~/.aws/config

# Reconfigurar credenciales
aws configure
```

### Problema: Espacio insuficiente en disco

**Solución:**
```bash
# Verificar espacio
df -h

# Limpiar archivos temporales
rm -rf /tmp/backups/*
rm -rf /tmp/restore/*

# Limpiar logs antiguos
find /home/ubuntu/backup_logs/ -name "*.log" -mtime +30 -delete
```

---

## 📞 Soporte

Para problemas o consultas:
- **Email:** rcaraballo@innovasystems.com.co
- **Servidor:** AWS Lightsail (100.28.198.249)
- **Logs:** `/home/ubuntu/backup_logs/`

---

## 📝 Changelog

### Versión 1.0 (2026-03-17)
- ✅ Implementación inicial del sistema
- ✅ Backups automáticos 2 veces al día
- ✅ Notificaciones por email
- ✅ Sistema de restauración
- ✅ Documentación completa

---

## 🎯 Próximas Mejoras

- [ ] Implementar política de retención automática
- [ ] Agregar encriptación de backups
- [ ] Implementar backups incrementales
- [ ] Dashboard web para gestión de backups
- [ ] Notificaciones por Slack/Telegram
- [ ] Backups de base de datos por separado

---

**Estado:** ✅ SISTEMA LISTO PARA PRODUCCIÓN
