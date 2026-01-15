# Solución: Error 535 - Invalid Login Gmail

## Error Identificado

```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```

## Causa del Problema

El error 535 de Gmail indica que las credenciales (usuario/contraseña) no son aceptadas. Esto puede ocurrir por varias razones.

## Diagnóstico

### Configuración Actual
```env
SMTP_USER=info@innovasystems.com.co
SMTP_PASSWORD=oheg bocp fnyc ovld
```

### ⚠️ Problema Principal

**El correo `info@innovasystems.com.co` NO es una cuenta de Gmail.**

Las contraseñas de aplicación de Gmail **SOLO funcionan con cuentas @gmail.com**.

## Soluciones

### Opción 1: Usar una Cuenta de Gmail (RECOMENDADO)

#### Paso 1: Crear o Usar Cuenta Gmail

Si no tienes una cuenta Gmail, créala en: https://accounts.google.com/signup

Ejemplo: `innovasystems2025@gmail.com`

#### Paso 2: Habilitar Verificación en 2 Pasos

1. Ve a: https://myaccount.google.com/security
2. Busca "Verificación en 2 pasos"
3. Haz clic en "Comenzar"
4. Sigue los pasos para configurarla

#### Paso 3: Generar Contraseña de Aplicación

1. Ve a: https://myaccount.google.com/apppasswords
2. En "Seleccionar app": elige **Correo**
3. En "Seleccionar dispositivo": elige **Otro (nombre personalizado)**
4. Escribe: **Sistema de Consentimientos**
5. Haz clic en **Generar**
6. **Copia la contraseña de 16 caracteres** (ejemplo: `abcd efgh ijkl mnop`)

#### Paso 4: Actualizar .env

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=innovasystems2025@gmail.com
SMTP_PASSWORD=tifk jmqh nvbn zaqa
SMTP_FROM=innovasystems2025@gmail.com
SMTP_FROM_NAME=Innova Systems - Sistema de Consentimientos
```

**Importante:** Puedes copiar la contraseña con o sin espacios, ambos funcionan.

#### Paso 5: Probar Configuración

```bash
cd backend
npx ts-node test-email-config.ts
```

Si todo está correcto, verás:
```
✅ Conexión exitosa con el servidor SMTP
✅ Correo enviado exitosamente!
```

### Opción 2: Usar Google Workspace (Para Dominio Propio)

Si quieres usar `info@innovasystems.com.co`, necesitas **Google Workspace** (de pago).

#### Requisitos:
- Cuenta de Google Workspace activa
- Dominio verificado en Google Workspace
- Verificación en 2 pasos habilitada

#### Configuración:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=info@innovasystems.com.co
SMTP_PASSWORD=contraseña-de-aplicacion-workspace
SMTP_FROM=info@innovasystems.com.co
SMTP_FROM_NAME=Innova Systems - Sistema de Consentimientos
```

#### Generar Contraseña de Aplicación en Workspace:

1. Ve a: https://myaccount.google.com/apppasswords
2. Inicia sesión con tu cuenta de Workspace
3. Genera la contraseña de aplicación
4. Copia y pega en SMTP_PASSWORD

### Opción 3: Usar Otro Proveedor SMTP

Si no quieres usar Gmail, puedes usar otros proveedores:

#### SendGrid (Recomendado para Producción)

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=tu-api-key-de-sendgrid
SMTP_FROM=info@innovasystems.com.co
SMTP_FROM_NAME=Innova Systems - Sistema de Consentimientos
```

#### Mailgun

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@tu-dominio.mailgun.org
SMTP_PASSWORD=tu-password-de-mailgun
SMTP_FROM=info@innovasystems.com.co
SMTP_FROM_NAME=Innova Systems - Sistema de Consentimientos
```

#### Amazon SES

```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-access-key-id
SMTP_PASSWORD=tu-secret-access-key
SMTP_FROM=info@innovasystems.com.co
SMTP_FROM_NAME=Innova Systems - Sistema de Consentimientos
```

## Errores Comunes

### Error 1: Contraseña con Espacios

❌ **Incorrecto:**
```env
SMTP_PASSWORD=abcd efgh ijkl mnop
```

✅ **Correcto (ambos funcionan):**
```env
SMTP_PASSWORD=abcdefghijklmnop
# O
SMTP_PASSWORD=abcd efgh ijkl mnop
```

### Error 2: Usar Contraseña Normal

❌ **Incorrecto:**
```env
SMTP_PASSWORD=MiContraseñaDeGmail123
```

✅ **Correcto:**
```env
SMTP_PASSWORD=abcd efgh ijkl mnop  # Contraseña de aplicación
```

### Error 3: Verificación en 2 Pasos No Habilitada

Las contraseñas de aplicación **requieren** que la verificación en 2 pasos esté habilitada.

### Error 4: Cuenta No es Gmail

❌ **No funciona:**
```env
SMTP_USER=info@innovasystems.com.co  # No es @gmail.com
```

✅ **Funciona:**
```env
SMTP_USER=innovasystems@gmail.com  # Es @gmail.com
```

## Verificación Paso a Paso

### 1. Verificar Cuenta

```bash
# Debe ser @gmail.com para contraseñas de aplicación
echo $SMTP_USER
```

### 2. Verificar Verificación en 2 Pasos

1. Ve a: https://myaccount.google.com/security
2. Busca "Verificación en 2 pasos"
3. Debe estar **Activada**

### 3. Verificar Contraseña de Aplicación

1. Ve a: https://myaccount.google.com/apppasswords
2. Verifica que existe una contraseña para "Sistema de Consentimientos"
3. Si no existe o no estás seguro, genera una nueva

### 4. Probar Configuración

```bash
cd backend
npx ts-node test-email-config.ts
```

### 5. Reiniciar Backend

```bash
cd backend
npm run start:dev
```

## Solución Rápida (Paso a Paso)

### Para Desarrollo/Pruebas

1. **Crear cuenta Gmail gratuita:**
   - Ve a: https://accounts.google.com/signup
   - Crea: `innovasystems.test@gmail.com`

2. **Habilitar verificación en 2 pasos:**
   - https://myaccount.google.com/security

3. **Generar contraseña de aplicación:**
   - https://myaccount.google.com/apppasswords
   - Copiar: `abcd efgh ijkl mnop`

4. **Actualizar .env:**
   ```env
   SMTP_USER=innovasystems.test@gmail.com
   SMTP_PASSWORD=abcd efgh ijkl mnop
   SMTP_FROM=innovasystems.test@gmail.com
   ```

5. **Probar:**
   ```bash
   npx ts-node test-email-config.ts
   ```

6. **Reiniciar backend**

### Para Producción

1. **Opción A: Google Workspace**
   - Contratar Google Workspace
   - Configurar dominio
   - Usar contraseña de aplicación

2. **Opción B: SendGrid (Recomendado)**
   - Crear cuenta en SendGrid
   - Verificar dominio
   - Obtener API Key
   - Configurar SMTP

## Resultado Esperado

Después de la configuración correcta:

```
✅ Conexión exitosa con el servidor SMTP
✅ Correo enviado exitosamente!
🎉 La configuración de correo está funcionando correctamente!
```

## Soporte Adicional

Si sigues teniendo problemas:

1. **Revisa los logs del backend** para ver el error exacto
2. **Ejecuta el script de prueba** para diagnóstico detallado
3. **Verifica que no haya firewall** bloqueando el puerto 587
4. **Intenta con puerto 465** y `SMTP_SECURE=true`

## Recursos

- Contraseñas de aplicación: https://myaccount.google.com/apppasswords
- Verificación en 2 pasos: https://myaccount.google.com/security
- Soporte Gmail: https://support.google.com/mail/?p=BadCredentials
- SendGrid: https://sendgrid.com
- Mailgun: https://www.mailgun.com
- Amazon SES: https://aws.amazon.com/ses/
