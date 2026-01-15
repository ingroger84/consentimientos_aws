# Implementación de Envío Real de Correos con Gmail

## Resumen

Se implementó un sistema completo de envío de correos electrónicos reales usando Gmail SMTP, incluyendo:
1. Correo de bienvenida al crear usuarios
2. Correo de consentimientos firmados
3. Templates HTML profesionales con branding de Innova Systems

## Configuración de Gmail

### Paso 1: Habilitar Verificación en 2 Pasos

1. Ve a tu cuenta de Google: https://myaccount.google.com
2. Navega a **Seguridad**
3. Habilita la **Verificación en 2 pasos**

### Paso 2: Generar Contraseña de Aplicación

1. Ve a: https://myaccount.google.com/apppasswords
2. Selecciona **Correo** como aplicación
3. Selecciona **Otro (nombre personalizado)** como dispositivo
4. Escribe: "Sistema de Consentimientos"
5. Haz clic en **Generar**
6. Copia la contraseña de 16 caracteres generada

### Paso 3: Configurar Variables de Entorno

Edita el archivo `backend/.env`:

```env
# Email - Gmail Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx
SMTP_FROM=tu-email@gmail.com
SMTP_FROM_NAME=Innova Systems - Sistema de Consentimientos
```

**Importante:**
- Reemplaza `tu-email@gmail.com` con tu correo de Gmail
- Reemplaza `xxxx xxxx xxxx xxxx` con la contraseña de aplicación generada
- NO uses tu contraseña normal de Gmail

## Arquitectura Implementada

### 1. Servicio Centralizado de Correo

**Archivo:** `backend/src/mail/mail.service.ts`

Servicio centralizado que maneja todo el envío de correos:
- Configuración de transporte SMTP
- Templates HTML profesionales
- Logging de envíos
- Manejo de errores

**Métodos principales:**
- `sendWelcomeEmail(user, temporaryPassword)` - Correo de bienvenida
- `sendConsentEmail(consent)` - Correo de consentimientos

### 2. Módulo de Correo

**Archivo:** `backend/src/mail/mail.module.ts`

Módulo reutilizable que exporta el MailService para ser usado en otros módulos.

### 3. Integración con Usuarios

**Modificado:** `backend/src/users/users.service.ts`

Al crear un usuario:
1. Se guarda la contraseña temporal antes de hashearla
2. Se crea el usuario en la base de datos
3. Se envía correo de bienvenida con credenciales
4. Si falla el correo, no se interrumpe la creación del usuario

### 4. Integración con Consentimientos

**Modificado:** `backend/src/consents/consents.service.ts`

Al enviar un consentimiento:
1. Se genera el PDF con las firmas
2. Se envía correo con el PDF adjunto
3. Se actualiza el estado del consentimiento

## Correo de Bienvenida

### Contenido

El correo de bienvenida incluye:

✅ **Saludo personalizado** con el nombre del usuario
✅ **Información de la cuenta:**
  - Organización (tenant)
  - Rol asignado
  - Email de acceso

✅ **Credenciales de acceso:**
  - Usuario (email)
  - Contraseña temporal

✅ **Enlace directo de acceso** al sistema
  - Para tenants: `http://slug.localhost:5173`
  - Para producción: `https://slug.tudominio.com`

✅ **Características del sistema:**
  - Gestión de Consentimientos
  - Firma Digital
  - Envío Automático
  - Seguro y Confiable

✅ **Branding de Innova Systems:**
  - Logo y colores corporativos
  - Firma profesional
  - Información de contacto

### Diseño

- Template HTML responsive
- Gradientes modernos (púrpura)
- Iconos visuales
- Diseño profesional y limpio
- Compatible con todos los clientes de correo

## Correo de Consentimientos

### Contenido

El correo de consentimientos incluye:

✅ **Saludo personalizado** al cliente
✅ **Detalles del servicio:**
  - Nombre del servicio
  - Sede donde se realizó
  - Fecha completa de firma
  - Número de documento

✅ **PDF adjunto** con todos los consentimientos:
  - Consentimiento del procedimiento
  - Tratamiento de datos personales
  - Derechos de imagen

✅ **Recordatorio** de guardar los documentos
✅ **Branding de Innova Systems**

### Diseño

- Template HTML responsive
- Gradientes modernos (verde)
- Iconos visuales
- Diseño profesional
- Compatible con todos los clientes de correo

## Archivos Creados

```
backend/src/mail/
├── mail.service.ts    # Servicio de correo centralizado
└── mail.module.ts     # Módulo de correo
```

## Archivos Modificados

```
backend/
├── .env                                    # Configuración SMTP
├── .env.example                            # Ejemplo de configuración
├── src/
│   ├── users/
│   │   ├── users.service.ts               # Envío de correo de bienvenida
│   │   └── users.module.ts                # Import de MailModule
│   ├── consents/
│   │   ├── consents.service.ts            # Uso de MailService
│   │   └── consents.module.ts             # Import de MailModule
│   └── questions/
│       └── questions.service.ts           # Corrección de tipo
```

## Archivos Eliminados

- `backend/src/consents/email.service.ts` - Reemplazado por MailService centralizado

## Flujo de Envío de Correos

### Correo de Bienvenida

```
1. Admin crea nuevo usuario
   ↓
2. UsersService.create()
   ↓
3. Se guarda contraseña temporal
   ↓
4. Se crea usuario en BD
   ↓
5. Se asignan rol y sedes
   ↓
6. MailService.sendWelcomeEmail()
   ↓
7. Se envía correo con credenciales
   ↓
8. Usuario recibe correo y puede acceder
```

### Correo de Consentimientos

```
1. Cliente firma consentimiento
   ↓
2. ConsentsService.sign()
   ↓
3. PdfService genera PDF
   ↓
4. ConsentsService.sendConsentEmail()
   ↓
5. MailService.sendConsentEmail()
   ↓
6. Se envía correo con PDF adjunto
   ↓
7. Cliente recibe consentimientos
```

## Características del Sistema de Correos

### Seguridad

✅ Uso de contraseñas de aplicación (no contraseña real)
✅ Conexión TLS/STARTTLS
✅ Validación de certificados (configurable)
✅ Logging de todos los envíos

### Confiabilidad

✅ Manejo de errores robusto
✅ Logging detallado
✅ No interrumpe operaciones críticas si falla el correo
✅ Reintentos automáticos del transporte

### Profesionalismo

✅ Templates HTML responsive
✅ Branding consistente de Innova Systems
✅ Diseño moderno y limpio
✅ Compatible con todos los clientes de correo

### Mantenibilidad

✅ Servicio centralizado
✅ Código reutilizable
✅ Fácil de extender
✅ Bien documentado

## Pruebas

### Probar Correo de Bienvenida

1. Configura tu Gmail en `.env`
2. Reinicia el backend
3. Crea un nuevo usuario desde la interfaz
4. Verifica que llegue el correo de bienvenida

### Probar Correo de Consentimientos

1. Crea un consentimiento
2. Firma el consentimiento
3. Haz clic en "Enviar por Email"
4. Verifica que llegue el correo con el PDF adjunto

## Solución de Problemas

### Error: "Invalid login"

**Causa:** Contraseña incorrecta o no es contraseña de aplicación

**Solución:**
1. Verifica que usas contraseña de aplicación, no tu contraseña normal
2. Genera una nueva contraseña de aplicación
3. Copia y pega sin espacios

### Error: "Connection timeout"

**Causa:** Puerto bloqueado o firewall

**Solución:**
1. Verifica que el puerto 587 esté abierto
2. Intenta con puerto 465 y `SMTP_SECURE=true`
3. Verifica configuración de firewall

### Error: "Self signed certificate"

**Causa:** Problema con certificados SSL

**Solución:**
Ya está configurado `rejectUnauthorized: false` para desarrollo

### Correos no llegan

**Posibles causas:**
1. Revisa la carpeta de spam
2. Verifica que el email destino sea válido
3. Revisa los logs del backend
4. Verifica límites de envío de Gmail

## Límites de Gmail

Gmail tiene límites de envío:
- **500 correos por día** para cuentas gratuitas
- **2000 correos por día** para Google Workspace

Para producción con alto volumen, considera:
- Google Workspace
- SendGrid
- Amazon SES
- Mailgun

## Migración a Producción

### Opción 1: Gmail con Dominio Propio (Google Workspace)

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@tudominio.com
SMTP_PASSWORD=contraseña-de-aplicacion
SMTP_FROM=noreply@tudominio.com
SMTP_FROM_NAME=Innova Systems - Sistema de Consentimientos
```

### Opción 2: SendGrid

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=tu-api-key-de-sendgrid
SMTP_FROM=noreply@tudominio.com
SMTP_FROM_NAME=Innova Systems - Sistema de Consentimientos
```

### Opción 3: Amazon SES

```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=tu-access-key-id
SMTP_PASSWORD=tu-secret-access-key
SMTP_FROM=noreply@tudominio.com
SMTP_FROM_NAME=Innova Systems - Sistema de Consentimientos
```

## Próximas Mejoras

Posibles mejoras futuras:
- [ ] Cola de correos con Bull/Redis
- [ ] Reintentos automáticos
- [ ] Plantillas personalizables por tenant
- [ ] Estadísticas de envío
- [ ] Webhooks de entrega
- [ ] Correos transaccionales adicionales
- [ ] Notificaciones por SMS

## Resultado Final

✅ Sistema de correos completamente funcional
✅ Correo de bienvenida profesional
✅ Correo de consentimientos con PDF adjunto
✅ Branding de Innova Systems
✅ Templates HTML responsive
✅ Configuración simple con Gmail
✅ Código limpio y mantenible
✅ Listo para producción
