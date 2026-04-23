# 🔧 Diagnóstico y Corrección - Backups Automáticos Detenidos

**Fecha**: 18 de abril de 2026  
**Problema**: Backups automáticos detenidos desde el 29 de marzo de 2026  
**Estado**: ✅ Corregido

---

## 📋 Resumen del Problema

Los backups automáticos de Archivo en Línea se detuvieron después del 29 de marzo de 2026 a las 19:00. El sistema estaba configurado para ejecutar backups automáticos 2 veces al día (12:00 PM y 7:00 PM), pero dejaron de funcionar.

### Síntomas
- ✅ Último backup exitoso: 29/03/2026 19:00 (#23)
- ❌ No se crearon backups desde el 30/03/2026
- ❌ Total de backups: 23 (debería haber ~40 backups en 20 días)
- ❌ Logs de cron mostrando "Permission denied"

---

## 🔍 Diagnóstico

### 1. Verificación de Logs

```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
tail -100 /home/ubuntu/backup_logs/cron.log
```

**Resultado**:
```
/bin/sh: 1: /home/ubuntu/consentimientos_aws/scripts/backup-to-s3.sh: Permission denied
/bin/sh: 1: /home/ubuntu/consentimientos_aws/scripts/backup-to-s3.sh: Permission denied
/bin/sh: 1: /home/ubuntu/consentimientos_aws/scripts/backup-to-s3.sh: Permission denied
...
```

### 2. Verificación de Permisos

```bash
ls -la /home/ubuntu/consentimientos_aws/scripts/backup-to-s3.sh
```

**Resultado**:
```
-rw-rw-r-- 1 ubuntu ubuntu 6341 Mar 29 20:34 backup-to-s3.sh
```

**Problema identificado**: El script perdió los permisos de ejecución (`-x`)

### 3. Verificación de Crontab

```bash
crontab -l
```

**Resultado**:
```
00 12 * * * /home/ubuntu/consentimientos_aws/scripts/backup-to-s3.sh >> /home/ubuntu/backup_logs/cron.log 2>&1
00 19 * * * /home/ubuntu/consentimientos_aws/scripts/backup-to-s3.sh >> /home/ubuntu/backup_logs/cron.log 2>&1
```

**Estado**: ✅ Crontab configurado correctamente

---

## 🔧 Causa Raíz

El script `backup-to-s3.sh` perdió los permisos de ejecución el 29 de marzo de 2026 a las 20:34 (después del último backup exitoso a las 19:00).

**Posibles causas**:
1. Despliegue de código que sobrescribió el archivo sin permisos
2. Actualización del repositorio Git que no preservó permisos
3. Operación manual que modificó el archivo

**Evidencia**:
- Último backup exitoso: 29/03/2026 19:00
- Modificación del script: 29/03/2026 20:34
- Primer error: 30/03/2026 12:00 (siguiente ejecución programada)

---

## ✅ Solución Aplicada

### 1. Restaurar Permisos de Ejecución

```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
chmod +x /home/ubuntu/consentimientos_aws/scripts/backup-to-s3.sh
chmod +x /home/ubuntu/consentimientos_aws/scripts/restore-from-s3.sh
```

### 2. Verificar Permisos

```bash
ls -la /home/ubuntu/consentimientos_aws/scripts/*.sh
```

**Resultado**:
```
-rwxrwxr-x 1 ubuntu ubuntu 6341 Mar 29 20:34 backup-to-s3.sh
-rwxrwxr-x 1 ubuntu ubuntu 7596 Mar 29 20:34 restore-from-s3.sh
```

✅ Permisos corregidos

### 3. Prueba Manual

```bash
/home/ubuntu/consentimientos_aws/scripts/backup-to-s3.sh
```

**Resultado**:
```
[2026-04-18 02:48:30] ==========================================
[2026-04-18 02:48:30] INICIANDO PROCESO DE BACKUP
[2026-04-18 02:48:30] ==========================================
[2026-04-18 02:48:30] Consecutivo de backup: #24
[2026-04-18 02:48:30] ✅ Directorio del proyecto verificado
[2026-04-18 02:49:11] ✅ Backup creado exitosamente: backup_archivoenlinea_20260418_024830.tar.gz (108M)
[2026-04-18 02:49:14] ✅ Backup subido exitosamente a S3
[2026-04-18 02:49:16] ✅ Archivo verificado en S3
[2026-04-18 02:49:18] ✅ BACKUP COMPLETADO EXITOSAMENTE
[2026-04-18 02:49:18] Consecutivo: #24
[2026-04-18 02:49:19] ✅ Email de notificación enviado a rcaraballo@innovasystems.com.co
```

✅ Backup manual exitoso

---

## 📊 Estado Actual

### Backups en S3
- Total de backups: 24 (actualizado)
- Último backup: 18/04/2026 02:48 (#24)
- Tamaño promedio: ~100 MB
- Ubicación: `s3://datagree-uploads/Back_Up_ArchivoEnLinea/`

### Configuración de Backups Automáticos
- Horario 1: 12:00 PM (mediodía)
- Horario 2: 7:00 PM (noche)
- Zona horaria: America/Bogota (UTC-5)
- Email notificaciones: rcaraballo@innovasystems.com.co

### Próximas Ejecuciones
- Siguiente backup: 18/04/2026 12:00 PM
- Backup nocturno: 18/04/2026 7:00 PM

---

## 🚀 Verificación Post-Corrección

### 1. Monitorear Próximos Backups

```bash
# Ver logs en tiempo real
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
tail -f /home/ubuntu/backup_logs/cron.log
```

### 2. Verificar Backups en S3

```bash
# Listar backups recientes
aws s3 ls s3://datagree-uploads/Back_Up_ArchivoEnLinea/ --region us-east-1 | tail -10
```

### 3. Verificar Emails

Revisar que lleguen los emails de notificación a `rcaraballo@innovasystems.com.co` después de cada backup.

---

## 🛡️ Prevención Futura

### 1. Agregar Verificación de Permisos al Script de Despliegue

Modificar scripts de despliegue para preservar permisos de ejecución:

```bash
# En scripts de despliegue
chmod +x /home/ubuntu/consentimientos_aws/scripts/*.sh
```

### 2. Monitoreo Automático

Crear alerta si no se reciben backups en 24 horas:

```sql
-- Query para verificar último backup
SELECT 
  MAX("lastModified") as ultimo_backup,
  EXTRACT(EPOCH FROM (NOW() - MAX("lastModified")))/3600 as horas_desde_ultimo
FROM backups;

-- Si horas_desde_ultimo > 24, enviar alerta
```

### 3. Documentar en Proceso de Despliegue

Agregar paso de verificación de permisos en checklist de despliegue:

```markdown
- [ ] Verificar permisos de scripts de backup
- [ ] Ejecutar backup manual de prueba
- [ ] Verificar que crontab esté activo
```

---

## 📝 Lecciones Aprendidas

### Problema
Los permisos de ejecución de scripts críticos pueden perderse durante despliegues o actualizaciones de código.

### Solución
1. Preservar permisos de ejecución en scripts de despliegue
2. Monitorear logs de cron regularmente
3. Configurar alertas para backups faltantes
4. Documentar permisos requeridos en README

### Impacto
- ⚠️  20 días sin backups (30/03 - 18/04)
- ✅ Último backup válido: 29/03/2026 (#23)
- ✅ Sistema restaurado: 18/04/2026 (#24)
- ✅ Sin pérdida de datos (sistema en producción funcionando)

---

## 🔍 Comandos Útiles

### Verificar Estado de Backups

```bash
# Ver últimos backups
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
ls -lh /home/ubuntu/backup_logs/ | tail -20

# Ver logs de cron
tail -100 /home/ubuntu/backup_logs/cron.log

# Verificar crontab
crontab -l

# Verificar permisos de scripts
ls -la /home/ubuntu/consentimientos_aws/scripts/*.sh
```

### Ejecutar Backup Manual

```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
/home/ubuntu/consentimientos_aws/scripts/backup-to-s3.sh
```

### Listar Backups en S3

```bash
aws s3 ls s3://datagree-uploads/Back_Up_ArchivoEnLinea/ --region us-east-1
```

### Verificar Tamaño Total de Backups

```bash
aws s3 ls s3://datagree-uploads/Back_Up_ArchivoEnLinea/ --region us-east-1 --summarize --human-readable --recursive
```

---

## ✅ Conclusión

### Estado Final
- ✅ Problema identificado: Permisos de ejecución perdidos
- ✅ Solución aplicada: Permisos restaurados
- ✅ Backup manual exitoso: #24 (18/04/2026)
- ✅ Sistema de backups automáticos reactivado
- ✅ Próximos backups programados: 12:00 PM y 7:00 PM

### Recomendaciones
1. Monitorear backups durante los próximos 3 días
2. Verificar que lleguen emails de notificación
3. Agregar verificación de permisos a scripts de despliegue
4. Configurar alerta si no hay backups en 24 horas

### Próximos Pasos
- ⏳ Esperar backup automático a las 12:00 PM (18/04/2026)
- ⏳ Verificar email de notificación
- ⏳ Confirmar backup en S3
- ⏳ Monitorear por 3 días

---

**Fecha de corrección**: 18 de abril de 2026  
**Corregido por**: Kiro AI Assistant  
**Estado**: ✅ Sistema de backups restaurado y funcionando
