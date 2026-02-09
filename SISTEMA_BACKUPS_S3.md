# 💾 Sistema de Backups Automatizados a S3

## 🎯 Arquitectura de Backups

```
┌─────────────────────────────────────────────────────────────┐
│                    SISTEMA DE BACKUPS                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  PostgreSQL  ──►  pg_dump  ──►  gzip  ──►  AWS S3          │
│                                                              │
│  Frecuencia: Diaria (3:00 AM)                              │
│  Retención: 30 días                                         │
│  Bucket: datagree-backups                                   │
│  Storage Class: STANDARD_IA (bajo costo)                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 PASO 1: Crear Bucket S3 para Backups

### Opción A: Desde AWS Console

1. Ir a S3 Console: https://s3.console.aws.amazon.com/
2. Click "Create bucket"
3. Configuración:
   ```
   Bucket name: datagree-backups
   Region: us-east-1 (mismo que datagree-uploads)
   Block all public access: ✅ ENABLED
   Bucket Versioning: ✅ ENABLED (recomendado)
   Default encryption: ✅ SSE-S3
   ```
4. Click "Create bucket"

### Opción B: Desde AWS CLI

```bash
# Crear bucket
aws s3 mb s3://datagree-backups --region us-east-1

# Habilitar versionamiento
aws s3api put-bucket-versioning \
  --bucket datagree-backups \
  --versioning-configuration Status=Enabled

# Habilitar encriptación
aws s3api put-bucket-encryption \
  --bucket datagree-backups \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'

# Bloquear acceso público
aws s3api put-public-access-block \
  --bucket datagree-backups \
  --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

---

## 📦 PASO 2: Configurar Lifecycle Policy (Ahorro de Costos)

```bash
# Crear archivo de política
cat > lifecycle-policy.json << 'EOF'
{
  "Rules": [
    {
      "Id": "TransitionToIA",
      "Status": "Enabled",
      "Transitions": [
        {
          "Days": 7,
          "StorageClass": "STANDARD_IA"
        },
        {
          "Days": 30,
          "StorageClass": "GLACIER"
        }
      ],
      "Expiration": {
        "Days": 90
      }
    }
  ]
}
EOF

# Aplicar política
aws s3api put-bucket-lifecycle-configuration \
  --bucket datagree-backups \
  --lifecycle-configuration file://lifecycle-policy.json
```

**Ahorro estimado:**
- STANDARD: $0.023/GB/mes
- STANDARD_IA: $0.0125/GB/mes (45% más barato)
- GLACIER: $0.004/GB/mes (83% más barato)


---

## 📦 PASO 3: Configurar Permisos IAM

### Crear política IAM para backups:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "BackupToS3",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:ListBucket",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::datagree-backups",
        "arn:aws:s3:::datagree-backups/*"
      ]
    }
  ]
}
```

**Nota:** Las credenciales AWS actuales ya tienen permisos S3 completos.

---

## 📦 PASO 4: Instalar Scripts de Backup en el Servidor

```bash
# Conectar al servidor
ssh -i "AWS-ISSABEL.pem" ubuntu@100.28.198.249

# Crear directorio para scripts
sudo mkdir -p /opt/datagree/scripts
cd /opt/datagree/scripts

# Los scripts ya están creados localmente, subirlos:
```

Desde tu máquina local:

```powershell
# Subir scripts
scp -i "AWS-ISSABEL.pem" backend/scripts/backup-to-s3.sh ubuntu@100.28.198.249:/tmp/
scp -i "AWS-ISSABEL.pem" backend/scripts/restore-from-s3.sh ubuntu@100.28.198.249:/tmp/

# En el servidor, mover y dar permisos
ssh -i "AWS-ISSABEL.pem" ubuntu@100.28.198.249
sudo mv /tmp/backup-to-s3.sh /opt/datagree/scripts/
sudo mv /tmp/restore-from-s3.sh /opt/datagree/scripts/
sudo chmod +x /opt/datagree/scripts/*.sh
```

---

## 📦 PASO 5: Configurar Variables de Entorno

```bash
# Editar .bashrc o crear archivo de configuración
sudo nano /opt/datagree/scripts/backup.env
```

Contenido:

```bash
# Configuración de Base de Datos
export DB_DATABASE=consentimientos
export DB_USERNAME=datagree_admin
export DB_PASSWORD=DataGree2026!Secure

# Configuración de S3
export BACKUP_S3_BUCKET=datagree-backups
export AWS_DEFAULT_REGION=us-east-1

# Las credenciales AWS ya están configuradas en el sistema
```

```bash
# Dar permisos seguros
sudo chmod 600 /opt/datagree/scripts/backup.env
```

---

## 📦 PASO 6: Configurar Cron para Backups Automáticos

```bash
# Editar crontab
crontab -e
```

Agregar estas líneas:

```cron
# Backup diario a las 3:00 AM (hora del servidor)
0 3 * * * source /opt/datagree/scripts/backup.env && /opt/datagree/scripts/backup-to-s3.sh >> /var/log/datagree-backup.log 2>&1

# Backup semanal completo los domingos a las 2:00 AM
0 2 * * 0 source /opt/datagree/scripts/backup.env && /opt/datagree/scripts/backup-to-s3.sh >> /var/log/datagree-backup-weekly.log 2>&1
```

**Frecuencias recomendadas:**
- Diario: Datos críticos (base de datos)
- Semanal: Backup completo + archivos
- Mensual: Backup archivado a Glacier


---

## 📦 PASO 7: Probar el Sistema de Backups

### Prueba Manual:

```bash
# Cargar variables de entorno
source /opt/datagree/scripts/backup.env

# Ejecutar backup manual
/opt/datagree/scripts/backup-to-s3.sh
```

**Salida esperada:**
```
🔄 Iniciando backup de base de datos...
📦 Creando dump de PostgreSQL...
✅ Backup creado: /tmp/backups/consentimientos_20260209_150000.sql.gz (15M)
☁️  Subiendo a S3...
✅ Backup subido exitosamente a S3
   📍 s3://datagree-backups/database-backups/consentimientos_20260209_150000.sql.gz
🧹 Archivo local eliminado
🗑️  Limpiando backups antiguos (>30 días)...
✅ Backup completado exitosamente
```

### Verificar en S3:

```bash
# Listar backups
aws s3 ls s3://datagree-backups/database-backups/

# Ver detalles de un backup
aws s3api head-object \
  --bucket datagree-backups \
  --key database-backups/consentimientos_20260209_150000.sql.gz
```

---

## 📦 PASO 8: Probar Restauración

⚠️ **ADVERTENCIA:** Solo probar en ambiente de desarrollo o staging

```bash
# Listar backups disponibles
aws s3 ls s3://datagree-backups/database-backups/

# Restaurar un backup específico
/opt/datagree/scripts/restore-from-s3.sh consentimientos_20260209_150000.sql.gz
```

---

## 📊 MONITOREO Y ALERTAS

### Crear Script de Verificación:

```bash
# /opt/datagree/scripts/check-backups.sh
#!/bin/bash

BUCKET="datagree-backups"
PREFIX="database-backups"
MAX_AGE_HOURS=26 # Alertar si no hay backup en 26 horas

# Obtener último backup
LAST_BACKUP=$(aws s3 ls s3://$BUCKET/$PREFIX/ | sort | tail -1 | awk '{print $4}')

if [ -z "$LAST_BACKUP" ]; then
    echo "❌ ERROR: No se encontraron backups"
    exit 1
fi

# Extraer timestamp del nombre del archivo
BACKUP_DATE=$(echo $LAST_BACKUP | grep -oP '\d{8}_\d{6}')
BACKUP_TIMESTAMP=$(date -d "${BACKUP_DATE:0:8} ${BACKUP_DATE:9:2}:${BACKUP_DATE:11:2}:${BACKUP_DATE:13:2}" +%s)
CURRENT_TIMESTAMP=$(date +%s)
AGE_HOURS=$(( ($CURRENT_TIMESTAMP - $BACKUP_TIMESTAMP) / 3600 ))

if [ $AGE_HOURS -gt $MAX_AGE_HOURS ]; then
    echo "⚠️  ALERTA: Último backup tiene $AGE_HOURS horas"
    echo "   Archivo: $LAST_BACKUP"
    exit 1
else
    echo "✅ Backup reciente encontrado ($AGE_HOURS horas)"
    echo "   Archivo: $LAST_BACKUP"
    exit 0
fi
```

```bash
# Dar permisos
sudo chmod +x /opt/datagree/scripts/check-backups.sh

# Agregar a cron (verificar cada 6 horas)
0 */6 * * * /opt/datagree/scripts/check-backups.sh || echo "ALERTA: Problema con backups" | mail -s "Backup Alert" admin@tudominio.com
```

---

## 💰 ESTIMACIÓN DE COSTOS

### Escenario: Base de datos de 500MB

**Almacenamiento:**
```
Backup diario: 500MB x 30 días = 15GB
Backup semanal: 500MB x 4 = 2GB
Total: ~17GB

Costos mensuales:
- Primeros 7 días (STANDARD): 3.5GB x $0.023 = $0.08
- Días 8-30 (STANDARD_IA): 13.5GB x $0.0125 = $0.17
- Total: ~$0.25/mes
```

**Transferencia:**
- Upload a S3: GRATIS
- Download (restauración): $0.09/GB (solo cuando se use)

**Total estimado: $0.25 - $0.50/mes** 💰

---

## 🔐 SEGURIDAD Y MEJORES PRÁCTICAS

### 1. Encriptación
✅ Backups encriptados en reposo (SSE-S3)
✅ Transferencia encriptada (HTTPS)

### 2. Control de Acceso
✅ Bucket privado (no acceso público)
✅ IAM policies restrictivas
✅ Versionamiento habilitado

### 3. Retención
✅ 30 días en STANDARD_IA
✅ 90 días en GLACIER
✅ Eliminación automática después de 90 días

### 4. Verificación
✅ Logs de cada backup
✅ Monitoreo automático
✅ Alertas por email

### 5. Disaster Recovery
✅ Backups en región diferente (opcional)
✅ Scripts de restauración probados
✅ Documentación completa

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

- [ ] Crear bucket S3 `datagree-backups`
- [ ] Configurar lifecycle policy
- [ ] Subir scripts al servidor
- [ ] Configurar variables de entorno
- [ ] Configurar cron jobs
- [ ] Probar backup manual
- [ ] Probar restauración (en dev)
- [ ] Configurar monitoreo
- [ ] Documentar procedimientos
- [ ] Entrenar al equipo

---

## 🆘 TROUBLESHOOTING

### Error: "Permission denied"
```bash
# Verificar permisos del script
ls -l /opt/datagree/scripts/backup-to-s3.sh
sudo chmod +x /opt/datagree/scripts/backup-to-s3.sh
```

### Error: "AWS credentials not found"
```bash
# Verificar credenciales
aws sts get-caller-identity

# Si falla, configurar:
aws configure
```

### Error: "pg_dump: command not found"
```bash
# Instalar PostgreSQL client
sudo apt-get install postgresql-client
```

### Backup muy lento
```bash
# Usar compresión paralela
pg_dump ... | pigz > backup.sql.gz
```

---

## 📚 RECURSOS ADICIONALES

- [AWS S3 Pricing](https://aws.amazon.com/s3/pricing/)
- [PostgreSQL Backup Best Practices](https://www.postgresql.org/docs/current/backup.html)
- [AWS CLI S3 Commands](https://docs.aws.amazon.com/cli/latest/reference/s3/)

---

**Implementado por:** Kiro AI  
**Fecha:** 2026-02-09  
**Versión:** 1.0
