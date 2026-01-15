# Guía Rápida: Configurar Gmail para Envío de Correos

## 📧 Pasos Rápidos

### 1. Habilitar Verificación en 2 Pasos

1. Ve a: https://myaccount.google.com/security
2. Busca "Verificación en 2 pasos"
3. Haz clic en "Comenzar"
4. Sigue los pasos para configurarla

### 2. Generar Contraseña de Aplicación

1. Ve a: https://myaccount.google.com/apppasswords
2. En "Seleccionar app": elige **Correo**
3. En "Seleccionar dispositivo": elige **Otro (nombre personalizado)**
4. Escribe: **Sistema de Consentimientos**
5. Haz clic en **Generar**
6. **Copia la contraseña de 16 caracteres** (aparece como: xxxx xxxx xxxx xxxx)

### 3. Configurar el Sistema

Edita el archivo `backend/.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=info@innovasystems.com.co
SMTP_PASSWORD=tifk jmqh nvbn zaqa
SMTP_FROM=info@innovasystems.com.co
SMTP_FROM_NAME=Innova Systems - Sistema de Consentimientos
```

**Reemplaza:**
- `tu-email@gmail.com` → Tu correo de Gmail
- `xxxx xxxx xxxx xxxx` → La contraseña de aplicación que copiaste

### 4. Reiniciar el Backend

```bash
cd backend
npm run start:dev
```

### 5. Probar

**Correo de Bienvenida:**
1. Ve a Usuarios
2. Crea un nuevo usuario
3. Revisa el correo del nuevo usuario

**Correo de Consentimientos:**
1. Crea un consentimiento
2. Fírmalo
3. Haz clic en "Enviar por Email"
4. Revisa el correo del cliente

## ⚠️ Importante

- **NO uses tu contraseña normal de Gmail**, usa la contraseña de aplicación
- La contraseña de aplicación solo se muestra una vez, guárdala
- Si la pierdes, genera una nueva
- Puedes tener múltiples contraseñas de aplicación

## 🔍 Verificar Configuración

Si los correos no llegan:

1. **Revisa la carpeta de spam**
2. **Verifica los logs del backend:**
   ```
   Mail service initialized with host: smtp.gmail.com:587
   Welcome email sent to usuario@ejemplo.com
   ```
3. **Verifica que la contraseña sea correcta** (sin espacios)
4. **Verifica que el email destino sea válido**

## 📊 Límites de Gmail

- **500 correos por día** para cuentas gratuitas
- **2000 correos por día** para Google Workspace

## ✅ Listo!

Una vez configurado, el sistema enviará automáticamente:
- ✉️ Correo de bienvenida al crear usuarios
- ✉️ Correo con consentimientos firmados
- ✉️ Templates profesionales con branding de Innova Systems
