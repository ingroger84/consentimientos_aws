# 🔐 Guía de Rotación de Credenciales

## ⚠️ IMPORTANTE
Este documento contiene los pasos para rotar las credenciales expuestas en el repositorio.
**NO incluir credenciales reales en este archivo.**

---

## 📋 CHECKLIST DE ROTACIÓN

### 1. AWS Credentials (PRIORIDAD: CRÍTICA)

#### Paso 1: Desactivar Keys Comprometidas
```bash
# Conectar a AWS Console
# https://console.aws.amazon.com/iam/home#/security_credentials

# O usar AWS CLI
aws iam list-access-keys --user-name datagree-user
aws iam delete-access-key --access-key-id AKIA42IJAAWUHIHRZM4L --user-name datagree-user
```

#### Paso 2: Crear Nuevas Keys
```bash
# En AWS Console: IAM > Users > Security Credentials > Create Access Key
# O usar AWS CLI
aws iam create-access-key --user-name datagree-user
```

#### Paso 3: Actualizar en Servidor
```bash
# SSH al servidor
ssh -i "keys/AWS-ISSABEL.pem" ubuntu@100.28.198.249

# Editar ecosystem.config.js
cd /home/ubuntu/consentimientos_aws
nano ecosystem.config.js

# Actualizar:
# AWS_ACCESS_KEY_ID: 'NUEVA_KEY_AQUI'
# AWS_SECRET_ACCESS_KEY: 'NUEVO_SECRET_AQUI'

# Reiniciar PM2
pm2 restart datagree --update-env

# Verificar
pm2 logs datagree --lines 50
```

#### Paso 4: Verificar Funcionamiento
```bash
# Probar upload de archivo en la aplicación
# Verificar logs de S3 en AWS Console
```

---

### 2. Bold API Keys (PRIORIDAD: CRÍTICA)

#### Paso 1: Contactar Bold Support
```
Email: soporte@bold.co
Asunto: Solicitud Urgente - Rotación de API Keys por Exposición

Mensaje:
Estimado equipo de Bold,

Necesitamos rotar urgentemente nuestras API Keys debido a una exposición accidental.

Merchant ID: 2M0MTRAD37
API Key comprometida: 1XVOAZHZ87fuDLuWzKAQmG_0RRGYO_eo8YhJHmugf68
Secret Key comprometida: KVwpsp4WlWny3apOYoGWvg

Por favor, desactiven estas credenciales y proporcionen nuevas lo antes posible.

Gracias,
[Tu nombre]
```

#### Paso 2: Actualizar en Servidor
```bash
# Una vez recibidas las nuevas credenciales de Bold
ssh -i "keys/AWS-ISSABEL.pem" ubuntu@100.28.198.249
cd /home/ubuntu/consentimientos_aws
nano ecosystem.config.js

# Actualizar:
# BOLD_API_KEY: 'NUEVA_KEY_DE_BOLD'
# BOLD_SECRET_KEY: 'NUEVO_SECRET_DE_BOLD'

pm2 restart datagree --update-env
```

#### Paso 3: Verificar Funcionamiento
```bash
# Probar proceso de pago en la aplicación
# Verificar logs de Bold en su dashboard
```

---

### 3. JWT Secret (PRIORIDAD: ALTA)

#### Paso 1: Generar Nuevo Secret
```bash
# En tu máquina local o servidor
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### Paso 2: Actualizar en Servidor
```bash
ssh -i "keys/AWS-ISSABEL.pem" ubuntu@100.28.198.249
cd /home/ubuntu/consentimientos_aws
nano ecosystem.config.js

# Actualizar:
# JWT_SECRET: 'NUEVO_SECRET_GENERADO_AQUI'

pm2 restart datagree --update-env
```

#### Paso 3: Notificar a Usuarios
⚠️ **NOTA**: Todos los usuarios deberán volver a iniciar sesión

```bash
# Opcional: Limpiar sesiones activas en la base de datos
ssh -i "keys/AWS-ISSABEL.pem" ubuntu@100.28.198.249
cd /home/ubuntu/consentimientos_aws/backend
node clear-all-sessions.js
```

---

### 4. SMTP Password (PRIORIDAD: MEDIA)

#### Paso 1: Revocar App Password Actual
```
1. Ir a: https://myaccount.google.com/apppasswords
2. Iniciar sesión con: info@innovasystems.com.co
3. Encontrar y revocar el App Password actual
```

#### Paso 2: Generar Nuevo App Password
```
1. En la misma página, crear nuevo App Password
2. Nombre: "DatAgree Production Server"
3. Copiar el password generado (formato: xxxx xxxx xxxx xxxx)
```

#### Paso 3: Actualizar en Servidor
```bash
ssh -i "keys/AWS-ISSABEL.pem" ubuntu@100.28.198.249
cd /home/ubuntu/consentimientos_aws
nano ecosystem.config.js

# Actualizar:
# SMTP_PASSWORD: 'xxxx xxxx xxxx xxxx'

pm2 restart datagree --update-env
```

#### Paso 4: Verificar Funcionamiento
```bash
# Probar envío de email desde la aplicación
# Verificar logs de email
pm2 logs datagree | grep -i "mail\|smtp"
```

---

### 5. Database Password (PRIORIDAD: ALTA - REQUIERE DOWNTIME)

⚠️ **ADVERTENCIA**: Cambiar la contraseña de la base de datos requiere downtime planificado.

#### Paso 1: Planificar Mantenimiento
```
- Notificar a usuarios con 24-48 horas de anticipación
- Elegir horario de bajo tráfico (ej: 2-4 AM)
- Duración estimada: 15-30 minutos
```

#### Paso 2: Generar Nueva Contraseña
```bash
# Generar contraseña segura
openssl rand -base64 32
```

#### Paso 3: Cambiar Contraseña en PostgreSQL
```bash
ssh -i "keys/AWS-ISSABEL.pem" ubuntu@100.28.198.249

# Detener aplicación
pm2 stop datagree

# Conectar a PostgreSQL
sudo -u postgres psql

# Cambiar contraseña
ALTER USER datagree_admin WITH PASSWORD 'NUEVA_CONTRASEÑA_AQUI';
\q
```

#### Paso 4: Actualizar Configuración
```bash
cd /home/ubuntu/consentimientos_aws
nano ecosystem.config.js

# Actualizar:
# DB_PASSWORD: 'NUEVA_CONTRASEÑA_AQUI'

# Reiniciar aplicación
pm2 restart datagree --update-env
```

#### Paso 5: Verificar Funcionamiento
```bash
# Verificar logs
pm2 logs datagree --lines 100

# Probar login en la aplicación
# Verificar que todas las funcionalidades funcionan
```

---

## 🔍 VERIFICACIÓN POST-ROTACIÓN

### Checklist de Verificación

#### AWS S3
- [ ] Upload de archivos funciona
- [ ] Download de archivos funciona
- [ ] Logs de S3 no muestran errores de autenticación

#### Bold Payments
- [ ] Proceso de pago completo funciona
- [ ] Webhooks se reciben correctamente
- [ ] Dashboard de Bold muestra transacciones

#### JWT
- [ ] Login de usuarios funciona
- [ ] Tokens se generan correctamente
- [ ] Sesiones se mantienen activas

#### SMTP
- [ ] Emails de bienvenida se envían
- [ ] Emails de notificación se envían
- [ ] No hay errores de autenticación SMTP en logs

#### Database
- [ ] Aplicación se conecta correctamente
- [ ] Queries funcionan normalmente
- [ ] No hay errores de autenticación en logs

---

## 📊 REGISTRO DE ROTACIONES

### Template de Registro
```
Fecha: [DD/MM/YYYY]
Credencial: [AWS/Bold/JWT/SMTP/DB]
Rotada por: [Nombre]
Razón: Exposición en repositorio Git
Verificación: [OK/FAIL]
Notas: [Cualquier observación]
```

### Historial
```
01/02/2026 - AWS Keys - [Pendiente]
01/02/2026 - Bold API Keys - [Pendiente]
01/02/2026 - JWT Secret - [Pendiente]
01/02/2026 - SMTP Password - [Pendiente]
[Fecha] - DB Password - [Pendiente]
```

---

## 🚨 EN CASO DE PROBLEMAS

### Si la aplicación no inicia después de rotación:

1. **Verificar logs de PM2**:
   ```bash
   pm2 logs datagree --lines 100
   ```

2. **Verificar variables de entorno**:
   ```bash
   pm2 show datagree
   ```

3. **Revertir cambios temporalmente**:
   ```bash
   # Restaurar backup de ecosystem.config.js
   cp ecosystem.config.js.backup ecosystem.config.js
   pm2 restart datagree --update-env
   ```

4. **Contactar soporte**:
   - AWS: https://console.aws.amazon.com/support
   - Bold: soporte@bold.co
   - PostgreSQL: Revisar logs en `/var/log/postgresql/`

---

## 📝 NOTAS IMPORTANTES

1. **Backups**: Siempre hacer backup de `ecosystem.config.js` antes de modificar
2. **Testing**: Probar cada credencial en ambiente de desarrollo primero si es posible
3. **Documentación**: Actualizar documentación interna (sin incluir credenciales)
4. **Monitoreo**: Vigilar logs durante las primeras 24 horas post-rotación
5. **Comunicación**: Mantener al equipo informado del progreso

---

## ✅ CONFIRMACIÓN FINAL

Una vez completadas todas las rotaciones:

- [ ] Todas las credenciales antiguas han sido desactivadas
- [ ] Todas las credenciales nuevas están funcionando
- [ ] No hay errores en logs de producción
- [ ] Usuarios pueden usar la aplicación normalmente
- [ ] Documentación actualizada
- [ ] Equipo notificado

---

**Documento creado**: 01 de Febrero 2026  
**Última actualización**: 01 de Febrero 2026  
**Responsable**: Equipo de Desarrollo DatAgree
