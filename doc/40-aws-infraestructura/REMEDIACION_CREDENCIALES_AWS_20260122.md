# 🚨 Remediación de Credenciales AWS Expuestas

**Fecha:** 2026-01-22  
**Severidad:** CRÍTICA  
**Estado:** 🔴 EN PROCESO

---

## ⚠️ PROBLEMA IDENTIFICADO

AWS ha detectado que las credenciales IAM del usuario `datagree-s3-user` están expuestas públicamente en GitHub:

**Credenciales Comprometidas:**
- **Access Key ID:** `AKIA************6KHY` (parcialmente oculta)
- **Secret Access Key:** `****************` (oculta por seguridad)
- **Usuario IAM:** datagree-s3-user

**Archivos donde están expuestas:**
1. `VERIFICACION_CONEXIONES_20260121.md`
2. `doc/19-aws-s3-storage/README.md`
3. `doc/19-aws-s3-storage/INDEX.md`
4. `doc/19-aws-s3-storage/VERIFICACION_COMPLETA.md`
5. `doc/23-despliegue-aws/CERTIFICADO_WILDCARD_CONFIGURADO.md` (otra clave)

---

## 🎯 PLAN DE ACCIÓN INMEDIATO

### Paso 1: Rotar Credenciales en AWS (URGENTE)

**⏰ HACER ESTO PRIMERO - ANTES DE CUALQUIER OTRA COSA:**

1. **Ir a AWS Console:**
   - https://console.aws.amazon.com/iam/

2. **Navegar a:**
   - IAM → Users → datagree-s3-user → Security credentials

3. **Crear nueva Access Key:**
   - Click en "Create access key"
   - Seleccionar "Application running outside AWS"
   - Guardar las nuevas credenciales en un lugar seguro (NO en GitHub)

4. **Desactivar la clave comprometida:**
   - Buscar la clave `AKIA42IJAAWUEQGB6KHY`
   - Click en "Actions" → "Deactivate"
   - Después de verificar que todo funciona con la nueva clave, eliminarla

---

### Paso 2: Actualizar Credenciales en el Servidor

**Conectar al servidor y actualizar el archivo .env:**

```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249

# Editar el archivo .env del backend
cd /home/ubuntu/consentimientos_aws/backend
nano .env

# Actualizar estas líneas con las NUEVAS credenciales:
AWS_ACCESS_KEY_ID=NUEVA_ACCESS_KEY_AQUI
AWS_SECRET_ACCESS_KEY=NUEVA_SECRET_KEY_AQUI

# Guardar (Ctrl+O, Enter, Ctrl+X)

# Reiniciar el backend
pm2 restart datagree-backend

# Verificar que funciona
pm2 logs datagree-backend --lines 20
```

---

### Paso 3: Limpiar Credenciales del Repositorio

**Archivos a modificar (eliminar credenciales reales):**

#### 1. VERIFICACION_CONEXIONES_20260121.md
```markdown
# ANTES (líneas 12-14):
**Access Key ID:** AKIA42IJAAWUEQGB6KHY  
**Secret Access Key:** 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  
**Estado:** ✅ Activas y sin cuarentena

# DESPUÉS:
**Access Key ID:** AKIA************6KHY (oculta por seguridad)
**Secret Access Key:** **************** (oculta por seguridad)
**Estado:** ✅ Activas y sin cuarentena
```

#### 2. doc/19-aws-s3-storage/README.md
```markdown
# ANTES (líneas 84-85):
AWS_ACCESS_KEY_ID=AKIA42IJAAWUEQGB6KHY
AWS_SECRET_ACCESS_KEY=hIXAyJ6SLzy52iMF201C+be4ubqtm2Dzy/wxfptM

# DESPUÉS:
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_HERE
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_KEY_HERE
```

#### 3. doc/19-aws-s3-storage/INDEX.md
```markdown
# ANTES (líneas 160-161):
AWS_ACCESS_KEY_ID=AKIA42IJAAWUEQGB6KHY
AWS_SECRET_ACCESS_KEY=hIXAyJ6SLzy52iMF201C+be4ubqtm2Dzy/wxfptM

# DESPUÉS:
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_HERE
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_KEY_HERE
```

#### 4. doc/19-aws-s3-storage/VERIFICACION_COMPLETA.md
```markdown
# ANTES (líneas 39-40):
AWS_ACCESS_KEY_ID=AKIA42IJAAWUEQGB6KHY
AWS_SECRET_ACCESS_KEY=hIXAyJ6SLzy52iMF201C+be4ubqtm2Dzy/wxfptM

# DESPUÉS:
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_HERE
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_KEY_HERE
```

#### 5. doc/23-despliegue-aws/CERTIFICADO_WILDCARD_CONFIGURADO.md
```markdown
# ANTES (líneas 56-57):
aws_access_key_id = AKIA************PJKP (otra credencial comprometida)
aws_secret_access_key = **************** (oculta por seguridad)

# DESPUÉS:
aws_access_key_id = YOUR_AWS_ACCESS_KEY_HERE
aws_secret_access_key = YOUR_AWS_SECRET_KEY_HERE
```

---

### Paso 4: Limpiar el Historial de Git (Opcional pero Recomendado)

**⚠️ ADVERTENCIA:** Esto reescribe el historial de Git. Solo hazlo si es absolutamente necesario.

```bash
# Instalar BFG Repo-Cleaner (más rápido que git filter-branch)
# Descargar de: https://rtyley.github.io/bfg-repo-cleaner/

# O usar git filter-branch (más lento pero incluido en Git)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch VERIFICACION_CONEXIONES_20260121.md" \
  --prune-empty --tag-name-filter cat -- --all

# Forzar push (CUIDADO: esto reescribe el historial)
git push origin --force --all
```

**Alternativa más simple:** Simplemente eliminar las credenciales de los archivos actuales y hacer commit. Las credenciales antiguas quedarán en el historial pero ya estarán desactivadas en AWS.

---

### Paso 5: Agregar .gitignore para Prevenir Futuros Incidentes

Verificar que `.gitignore` incluya:

```gitignore
# Environment variables
.env
.env.local
.env.production
.env.*.local

# AWS credentials
.aws/
aws-credentials.json
credentials.json

# SSH keys
*.pem
*.key
*.ppk

# Secrets
secrets/
*.secret
```

---

## 🔒 MEJORES PRÁCTICAS DE SEGURIDAD

### 1. Usar Variables de Entorno

**✅ CORRECTO:**
```typescript
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});
```

**❌ INCORRECTO:**
```typescript
const s3 = new AWS.S3({
  accessKeyId: 'AKIA42IJAAWUEQGB6KHY', // ¡NUNCA hacer esto!
  secretAccessKey: 'hIXAyJ6SLzy52iMF201C+be4ubqtm2Dzy/wxfptM',
  region: 'us-east-1',
});
```

### 2. Usar AWS Secrets Manager (Recomendado para Producción)

```bash
# Guardar secreto en AWS Secrets Manager
aws secretsmanager create-secret \
  --name archivoenlinea/s3-credentials \
  --secret-string '{"accessKeyId":"NUEVA_KEY","secretAccessKey":"NUEVA_SECRET"}'

# Recuperar en la aplicación
const secret = await secretsManager.getSecretValue({
  SecretId: 'archivoenlinea/s3-credentials'
}).promise();
```

### 3. Usar IAM Roles (Mejor Opción para EC2)

Si tu aplicación corre en EC2, usa IAM Roles en lugar de credenciales:

```bash
# Crear rol IAM para EC2
# Asignar políticas necesarias (S3, SES, etc.)
# Asignar rol a la instancia EC2
# No necesitas AWS_ACCESS_KEY_ID ni AWS_SECRET_ACCESS_KEY
```

### 4. Rotar Credenciales Regularmente

- Rotar credenciales cada 90 días
- Usar múltiples claves (una activa, una de respaldo)
- Monitorear uso de credenciales en CloudTrail

### 5. Habilitar MFA para Usuario IAM

```bash
# En AWS Console:
# IAM → Users → datagree-s3-user → Security credentials
# Assigned MFA device → Manage
```

---

## 📋 CHECKLIST DE REMEDIACIÓN

### Inmediato (Hacer HOY):
- [ ] ✅ Crear nuevas credenciales AWS
- [ ] ✅ Desactivar credenciales comprometidas
- [ ] ✅ Actualizar .env en servidor de producción
- [ ] ✅ Reiniciar backend y verificar funcionamiento
- [ ] ✅ Eliminar credenciales de archivos de documentación
- [ ] ✅ Commit y push de cambios
- [ ] ✅ Verificar que S3 siga funcionando

### Corto Plazo (Esta Semana):
- [ ] Revisar todos los archivos en busca de otras credenciales
- [ ] Actualizar .gitignore
- [ ] Configurar git-secrets o similar
- [ ] Documentar proceso de rotación de credenciales
- [ ] Habilitar MFA en usuario IAM

### Mediano Plazo (Este Mes):
- [ ] Migrar a IAM Roles si es posible
- [ ] Implementar AWS Secrets Manager
- [ ] Configurar alertas de CloudTrail
- [ ] Auditoría de seguridad completa
- [ ] Capacitación del equipo en seguridad

---

## 🔍 VERIFICACIÓN POST-REMEDIACIÓN

### 1. Verificar que S3 funciona:
```bash
# Desde el servidor
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
cd /home/ubuntu/consentimientos_aws/backend
node -e "
const AWS = require('aws-sdk');
require('dotenv').config();
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});
s3.listBuckets((err, data) => {
  if (err) console.error('Error:', err);
  else console.log('Buckets:', data.Buckets.map(b => b.Name));
});
"
```

### 2. Verificar que no hay credenciales en GitHub:
```bash
# Buscar en el repositorio
git grep -i "AKIA42IJAAWUEQGB6KHY"
git grep -i "hIXAyJ6SLzy52iMF201C"

# No debería encontrar nada
```

### 3. Verificar logs de AWS CloudTrail:
- Revisar actividad sospechosa con las credenciales comprometidas
- Verificar que solo tu IP ha usado las credenciales

---

## 📞 CONTACTOS DE EMERGENCIA

**AWS Support:**
- https://console.aws.amazon.com/support/

**Reportar Incidente de Seguridad:**
- https://aws.amazon.com/security/vulnerability-reporting/

---

## 📚 RECURSOS ADICIONALES

- [AWS Security Best Practices](https://aws.amazon.com/security/best-practices/)
- [IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [Git Secrets](https://github.com/awslabs/git-secrets)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)

---

## ✅ ESTADO ACTUAL

- 🔴 **Credenciales comprometidas:** Detectadas
- 🟡 **Nuevas credenciales:** Pendiente de crear
- 🟡 **Servidor actualizado:** Pendiente
- 🟡 **Repositorio limpio:** Pendiente
- 🟡 **Verificación:** Pendiente

---

**Creado por:** Kiro AI  
**Fecha:** 2026-01-22  
**Prioridad:** 🚨 CRÍTICA  
**Estado:** 🔴 REQUIERE ACCIÓN INMEDIATA
