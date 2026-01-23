# 🚨 Pasos Siguientes - Remediación AWS

**Fecha:** 2026-01-22  
**Estado:** ✅ Credenciales eliminadas de GitHub  
**Próximo paso:** 🔴 ROTAR CREDENCIALES EN AWS

---

## ✅ LO QUE YA SE HIZO

1. ✅ **Credenciales eliminadas de GitHub**
   - 5 archivos de documentación limpiados
   - Commit pusheado exitosamente
   - GitHub ya no muestra las credenciales

2. ✅ **Script de limpieza creado**
   - `scripts/clean-aws-credentials.ps1`
   - Puede usarse en el futuro si es necesario

3. ✅ **Documentación creada**
   - `REMEDIACION_CREDENCIALES_AWS_20260122.md`
   - Guía completa de remediación

---

## 🔴 LO QUE DEBES HACER AHORA (URGENTE)

### 1. Rotar Credenciales en AWS Console

**⏰ HACER ESTO INMEDIATAMENTE:**

```
1. Ir a: https://console.aws.amazon.com/iam/
2. Navegar a: IAM → Users → datagree-s3-user → Security credentials
3. Click en "Create access key"
4. Seleccionar "Application running outside AWS"
5. GUARDAR las nuevas credenciales en un lugar seguro (NO en GitHub)
6. Copiar:
   - Access Key ID: AKIA...
   - Secret Access Key: ...
```

### 2. Actualizar Credenciales en el Servidor

```bash
# Conectar al servidor
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249

# Editar .env del backend
cd /home/ubuntu/consentimientos_aws/backend
nano .env

# Actualizar estas líneas con las NUEVAS credenciales:
AWS_ACCESS_KEY_ID=NUEVA_ACCESS_KEY_AQUI
AWS_SECRET_ACCESS_KEY=NUEVA_SECRET_KEY_AQUI

# Guardar: Ctrl+O, Enter, Ctrl+X

# Reiniciar backend
pm2 restart datagree-backend

# Verificar logs
pm2 logs datagree-backend --lines 20
```

### 3. Verificar que S3 Funciona

```bash
# Desde el servidor, probar conexión S3
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
  if (err) console.error('❌ Error:', err.message);
  else console.log('✅ Buckets:', data.Buckets.map(b => b.Name).join(', '));
});
"
```

**Resultado esperado:**
```
✅ Buckets: datagree-uploads, clientes-wordpress-backup
```

### 4. Desactivar/Eliminar Credenciales Antiguas

```
1. Volver a AWS Console
2. IAM → Users → datagree-s3-user → Security credentials
3. Buscar la clave antigua: AKIA42IJAAWUEQGB6KHY
4. Click en "Actions" → "Deactivate"
5. Esperar 24 horas para confirmar que todo funciona
6. Luego: "Actions" → "Delete"
```

---

## 📋 CHECKLIST DE VERIFICACIÓN

### Inmediato (HOY):
- [ ] ✅ Crear nuevas credenciales AWS
- [ ] ✅ Actualizar .env en servidor
- [ ] ✅ Reiniciar backend
- [ ] ✅ Verificar que S3 funciona
- [ ] ✅ Desactivar credenciales antiguas

### Corto Plazo (Esta Semana):
- [ ] Habilitar MFA en usuario IAM
- [ ] Revisar logs de CloudTrail por actividad sospechosa
- [ ] Configurar alertas de seguridad
- [ ] Documentar proceso de rotación

### Mediano Plazo (Este Mes):
- [ ] Considerar migrar a IAM Roles
- [ ] Implementar AWS Secrets Manager
- [ ] Auditoría de seguridad completa
- [ ] Capacitación del equipo

---

## 🔍 VERIFICAR ACTIVIDAD SOSPECHOSA

### En AWS CloudTrail:

1. Ir a: https://console.aws.amazon.com/cloudtrail/
2. Event history
3. Filtrar por:
   - User name: datagree-s3-user
   - Time range: Últimos 7 días
4. Buscar actividad inusual:
   - IPs desconocidas
   - Acciones no autorizadas
   - Horarios extraños

### Señales de Alerta:

- ❌ Acceso desde IPs desconocidas
- ❌ Creación de recursos no autorizados
- ❌ Modificación de políticas IAM
- ❌ Acceso a buckets S3 no relacionados
- ❌ Intentos de escalación de privilegios

---

## 📞 CONTACTOS DE EMERGENCIA

**Si detectas actividad sospechosa:**

1. **AWS Support:**
   - https://console.aws.amazon.com/support/

2. **Reportar Incidente:**
   - https://aws.amazon.com/security/vulnerability-reporting/

3. **Desactivar usuario IAM inmediatamente:**
   ```
   IAM → Users → datagree-s3-user → Permissions → Remove all policies
   ```

---

## 🎯 MEJORAS DE SEGURIDAD RECOMENDADAS

### 1. Habilitar MFA (Multi-Factor Authentication)

```
IAM → Users → datagree-s3-user → Security credentials
→ Assigned MFA device → Manage
→ Seguir instrucciones para configurar
```

### 2. Usar IAM Roles en lugar de Credenciales

**Ventajas:**
- No necesitas guardar credenciales
- Rotación automática
- Más seguro

**Cómo:**
```
1. Crear rol IAM con políticas necesarias
2. Asignar rol a instancia EC2
3. Eliminar AWS_ACCESS_KEY_ID y AWS_SECRET_ACCESS_KEY del .env
4. AWS SDK usará automáticamente el rol
```

### 3. Implementar AWS Secrets Manager

```bash
# Guardar credenciales en Secrets Manager
aws secretsmanager create-secret \
  --name archivoenlinea/s3-credentials \
  --secret-string '{"accessKeyId":"...","secretAccessKey":"..."}'

# Recuperar en la aplicación
const secret = await secretsManager.getSecretValue({
  SecretId: 'archivoenlinea/s3-credentials'
}).promise();
```

### 4. Configurar Alertas de Seguridad

```
CloudWatch → Alarms → Create alarm
→ Configurar alertas para:
  - Uso inusual de credenciales
  - Acceso desde IPs desconocidas
  - Cambios en políticas IAM
```

---

## 📚 RECURSOS ÚTILES

- [AWS Security Best Practices](https://aws.amazon.com/security/best-practices/)
- [IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [Rotating Access Keys](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html#Using_RotateAccessKey)
- [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/)

---

## ✅ RESUMEN

**Lo que se hizo:**
- ✅ Credenciales eliminadas de 5 archivos de documentación
- ✅ Cambios pusheados a GitHub exitosamente
- ✅ Script de limpieza creado para futuro uso
- ✅ Documentación completa de remediación

**Lo que DEBES hacer:**
- 🔴 Rotar credenciales en AWS Console (URGENTE)
- 🔴 Actualizar .env en servidor de producción
- 🔴 Verificar que S3 funciona
- 🔴 Desactivar credenciales antiguas
- 🟡 Revisar logs de CloudTrail
- 🟡 Habilitar MFA

**Tiempo estimado:** 15-20 minutos

---

**Creado por:** Kiro AI  
**Fecha:** 2026-01-22  
**Prioridad:** 🚨 CRÍTICA  
**Estado:** ⏳ Pendiente de acción del usuario
