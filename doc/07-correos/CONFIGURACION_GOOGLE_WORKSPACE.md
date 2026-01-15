# Configuración de Google Workspace para SMTP

## Problema Actual

Error 535: "Username and Password not accepted" con cuenta de Google Workspace.

## Causas Posibles

### 1. Acceso SMTP No Habilitado en Workspace

Google Workspace requiere que el administrador habilite el acceso SMTP.

### 2. Contraseña de Aplicación Incorrecta

La contraseña puede estar mal copiada o no ser válida.

### 3. Verificación en 2 Pasos No Habilitada

Las contraseñas de aplicación requieren verificación en 2 pasos.

### 4. Políticas de Seguridad de Workspace

El administrador puede haber bloqueado las contraseñas de aplicación.

## Solución Paso a Paso

### Paso 1: Verificar Acceso SMTP en Consola de Admin

**Solo el administrador de Workspace puede hacer esto:**

1. Ve a: https://admin.google.com
2. Navega a: **Apps** → **Google Workspace** → **Gmail**
3. Haz clic en **Configuración de usuario**
4. Busca la sección **Acceso POP e IMAP**
5. Verifica que esté habilitado:
   - ✅ **Habilitar IMAP para todos los usuarios**
   - ✅ **Habilitar POP para todos los usuarios**

6. También verifica en **Seguridad** → **Autenticación**:
   - ✅ **Permitir contraseñas de aplicación**

### Paso 2: Verificar Verificación en 2 Pasos

1. Ve a: https://myaccount.google.com/security
2. Busca **Verificación en 2 pasos**
3. Debe estar **Activada**
4. Si no está activada:
   - Haz clic en **Comenzar**
   - Sigue los pasos para configurarla

### Paso 3: Generar Nueva Contraseña de Aplicación

**IMPORTANTE: Genera una NUEVA contraseña, no uses la anterior**

1. Ve a: https://myaccount.google.com/apppasswords
2. Si no ves esta opción, verifica:
   - Que la verificación en 2 pasos esté habilitada
   - Que tu administrador permita contraseñas de aplicación

3. Selecciona:
   - **App:** Correo
   - **Dispositivo:** Otro (nombre personalizado)
   - **Nombre:** Sistema de Consentimientos

4. Haz clic en **Generar**

5. **COPIA LA CONTRASEÑA EXACTAMENTE COMO APARECE**
   - Ejemplo: `abcd efgh ijkl mnop`
   - Puedes copiarla con o sin espacios

### Paso 4: Actualizar .env

Abre `backend/.env` y actualiza:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=info@innovasystems.com.co
SMTP_PASSWORD=tifk jmqh nvbn zaqa
SMTP_FROM=info@innovasystems.com.co
SMTP_FROM_NAME=Innova Systems - Sistema de Consentimientos
```

**Importante:**
- Reemplaza `abcd efgh ijkl mnop` con tu contraseña real
- Puedes dejar los espacios o quitarlos, ambos funcionan
- NO uses tu contraseña normal, usa la contraseña de aplicación

### Paso 5: Probar Configuración

```bash
cd backend
npx ts-node test-workspace-email.ts
```

Si funciona, verás:
```
✅ Conexión exitosa!
✅ Correo enviado exitosamente!
🎉 ¡ÉXITO! Esta configuración funciona.
```

### Paso 6: Reiniciar Backend

```bash
cd backend
npm run start:dev
```

## Alternativa: Usar OAuth2 (Más Seguro)

Si las contraseñas de aplicación no funcionan, puedes usar OAuth2:

### Configuración OAuth2

1. **Crear Proyecto en Google Cloud Console:**
   - Ve a: https://console.cloud.google.com
   - Crea un nuevo proyecto

2. **Habilitar Gmail API:**
   - APIs & Services → Library
   - Busca "Gmail API"
   - Haz clic en "Enable"

3. **Crear Credenciales OAuth2:**
   - APIs & Services → Credentials
   - Create Credentials → OAuth client ID
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/auth/google/callback`

4. **Obtener Tokens:**
   - Necesitarás implementar el flujo OAuth2
   - Esto es más complejo pero más seguro

## Alternativa: Usar Relay SMTP de Workspace

Google Workspace ofrece un relay SMTP que no requiere contraseñas de aplicación:

### Configuración Relay SMTP

1. **En la Consola de Admin:**
   - Ve a: https://admin.google.com
   - Apps → Google Workspace → Gmail → Routing
   - Configura el relay SMTP

2. **Configuración en .env:**
```env
SMTP_HOST=smtp-relay.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=info@innovasystems.com.co
SMTP_FROM_NAME=Innova Systems - Sistema de Consentimientos
```

**Nota:** El relay SMTP solo funciona desde IPs autorizadas.

## Solución Temporal: Usar SendGrid

Mientras resuelves el problema de Workspace, puedes usar SendGrid:

### Configuración SendGrid

1. **Crear cuenta:** https://sendgrid.com (Gratis hasta 100 correos/día)

2. **Verificar dominio:**
   - Settings → Sender Authentication
   - Authenticate Your Domain
   - Sigue los pasos para agregar registros DNS

3. **Crear API Key:**
   - Settings → API Keys
   - Create API Key
   - Copia la API Key

4. **Configurar .env:**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=tu-api-key-de-sendgrid
SMTP_FROM=info@innovasystems.com.co
SMTP_FROM_NAME=Innova Systems - Sistema de Consentimientos
```

5. **Probar:**
```bash
npx ts-node test-email-config.ts
```

## Checklist de Verificación

### En Google Workspace Admin Console

- [ ] SMTP habilitado para usuarios
- [ ] Contraseñas de aplicación permitidas
- [ ] No hay políticas que bloqueen el acceso

### En Tu Cuenta

- [ ] Verificación en 2 pasos habilitada
- [ ] Contraseña de aplicación generada
- [ ] Contraseña copiada correctamente (16 caracteres)

### En el Código

- [ ] SMTP_USER es correcto (info@innovasystems.com.co)
- [ ] SMTP_PASSWORD es la contraseña de aplicación (no la normal)
- [ ] SMTP_HOST es smtp.gmail.com
- [ ] SMTP_PORT es 587
- [ ] Backend reiniciado después de cambios

## Contactar al Administrador de Workspace

Si no eres el administrador, pide que verifique:

1. **Acceso SMTP habilitado:**
   - Admin Console → Gmail → Configuración de usuario
   - Habilitar IMAP/POP

2. **Contraseñas de aplicación permitidas:**
   - Admin Console → Seguridad → Autenticación
   - Permitir contraseñas de aplicación

3. **Sin políticas restrictivas:**
   - Verificar que no haya políticas que bloqueen SMTP

## Recursos

- Google Workspace Admin: https://admin.google.com
- Contraseñas de aplicación: https://myaccount.google.com/apppasswords
- Soporte Workspace: https://support.google.com/a/
- SendGrid: https://sendgrid.com
- Documentación SMTP Gmail: https://support.google.com/mail/answer/7126229

## Resultado Esperado

Después de la configuración correcta:

```
✅ Conexión exitosa con el servidor SMTP
✅ Correo enviado exitosamente!
🎉 La configuración está funcionando correctamente!
```

Recibirás un correo de prueba en `info@innovasystems.com.co`.
