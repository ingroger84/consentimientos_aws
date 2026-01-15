# Guía de Pruebas - Restablecimiento de Contraseña

**Fecha:** 7 de enero de 2026

---

## ✅ Correcciones Aplicadas

Se corrigieron los siguientes errores:

1. **Import incorrecto en ForgotPasswordPage.tsx**
   - ❌ `import { authService } from '../services/auth'`
   - ✅ `import { authService } from '@/services/auth.service'`

2. **Import incorrecto en ResetPasswordPage.tsx**
   - ❌ `import { authService } from '../services/auth'`
   - ✅ `import { authService } from '@/services/auth.service'`

3. **Variables no usadas eliminadas**
   - Removido `navigate` no usado en ForgotPasswordPage
   - Removido `response` no usado en ForgotPasswordPage

---

## 🧪 Pruebas a Realizar

### Prueba 1: Solicitar Restablecimiento de Contraseña

**Pasos:**
1. Abrir el navegador en tu subdominio (ej: `http://demo.localhost:5173`)
2. Ir a la página de login
3. Hacer clic en "¿Olvidaste tu contraseña?"
4. Ingresar el email de un usuario existente (ej: `admin@demo.com`)
5. Hacer clic en "Enviar Enlace de Restablecimiento"

**Resultado Esperado:**
- ✅ Mensaje: "¡Correo Enviado!"
- ✅ Texto: "Si el correo existe en nuestro sistema, recibirás un enlace..."
- ✅ Botón para volver al login

**Verificar en Backend:**
```bash
# Ver logs del backend
# Debe mostrar:
# [AuthService] Password reset requested for email: admin@demo.com, tenant: demo
# [MailService] Password reset email sent to admin@demo.com
```

**Verificar en Base de Datos:**
```sql
SELECT email, reset_password_token, reset_password_expires 
FROM users 
WHERE email = 'admin@demo.com';
```
- ✅ `reset_password_token` debe tener un valor (hasheado)
- ✅ `reset_password_expires` debe ser ~1 hora en el futuro

---

### Prueba 2: Recibir y Abrir Correo

**Pasos:**
1. Abrir el cliente de correo del usuario
2. Buscar correo con asunto: "Restablecimiento de Contraseña - Sistema de Consentimientos"
3. Verificar contenido del correo

**Resultado Esperado:**
- ✅ Diseño profesional con gradiente naranja
- ✅ Icono de candado 🔒
- ✅ Nombre del usuario
- ✅ Nombre de la organización
- ✅ Botón "Restablecer Contraseña"
- ✅ Advertencia: "Este enlace expirará en 1 hora"
- ✅ Mensaje: "¿No solicitaste este cambio?"
- ✅ Enlace de texto alternativo
- ✅ Footer con branding de Innova Systems

**Verificar URL del Enlace:**
```
http://demo.localhost:5173/reset-password?token=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```
- ✅ Subdominio correcto (demo)
- ✅ Ruta `/reset-password`
- ✅ Parámetro `token` con 64 caracteres hexadecimales

---

### Prueba 3: Restablecer Contraseña

**Pasos:**
1. Hacer clic en el botón "Restablecer Contraseña" del correo
2. Verificar que se abra la página de reset
3. Ingresar nueva contraseña (ej: `nuevapass123`)
4. Confirmar contraseña (ej: `nuevapass123`)
5. Observar indicador de fortaleza
6. Hacer clic en "Restablecer Contraseña"

**Resultado Esperado:**
- ✅ Página se carga correctamente
- ✅ Logo del tenant visible
- ✅ Campos de contraseña con botón mostrar/ocultar
- ✅ Indicador de fortaleza cambia según la contraseña
- ✅ Mensaje: "¡Contraseña Restablecida!"
- ✅ Texto: "Tu contraseña ha sido actualizada exitosamente"
- ✅ Redirección automática al login en 3 segundos

**Verificar en Backend:**
```bash
# Ver logs del backend
# Debe mostrar:
# [AuthService] Password reset attempt with token
# [AuthService] Password successfully reset for user: admin@demo.com
```

**Verificar en Base de Datos:**
```sql
SELECT email, reset_password_token, reset_password_expires 
FROM users 
WHERE email = 'admin@demo.com';
```
- ✅ `reset_password_token` debe ser NULL
- ✅ `reset_password_expires` debe ser NULL

---

### Prueba 4: Iniciar Sesión con Nueva Contraseña

**Pasos:**
1. Esperar redirección automática o ir manualmente a `/login`
2. Ingresar email: `admin@demo.com`
3. Ingresar nueva contraseña: `nuevapass123`
4. Hacer clic en "Ingresar"

**Resultado Esperado:**
- ✅ Login exitoso
- ✅ Redirección al dashboard
- ✅ Usuario autenticado correctamente

---

### Prueba 5: Intentar Reutilizar Token

**Pasos:**
1. Copiar la URL del correo anterior
2. Intentar abrirla nuevamente en el navegador

**Resultado Esperado:**
- ❌ Error: "El enlace de restablecimiento es inválido o ha expirado"
- ✅ Mensaje sugiere solicitar uno nuevo

**Verificar en Backend:**
```bash
# Ver logs del backend
# Debe mostrar:
# [AuthService] Invalid or expired reset token
```

---

### Prueba 6: Token Expirado

**Pasos:**
1. Solicitar nuevo reset de contraseña
2. Esperar más de 1 hora
3. Intentar usar el enlace

**Resultado Esperado:**
- ❌ Error: "El enlace de restablecimiento ha expirado. Solicita uno nuevo."

**Nota:** Para probar sin esperar 1 hora, puedes modificar temporalmente el código:
```typescript
// En auth.service.ts, cambiar:
expiresAt.setHours(expiresAt.getHours() + 1);
// Por:
expiresAt.setMinutes(expiresAt.getMinutes() + 1); // 1 minuto
```

---

### Prueba 7: Email que No Existe

**Pasos:**
1. Ir a `/forgot-password`
2. Ingresar email que no existe: `noexiste@demo.com`
3. Hacer clic en "Enviar Enlace"

**Resultado Esperado:**
- ✅ Mismo mensaje de éxito (no revela que no existe)
- ✅ NO se envía correo
- ✅ NO se crea token en BD

**Verificar en Backend:**
```bash
# Ver logs del backend
# Debe mostrar:
# [AuthService] Password reset requested for non-existent email: noexiste@demo.com
```

---

### Prueba 8: Validación de Tenant

**Pasos:**
1. Usuario de `demo.localhost` solicita reset
2. Recibe correo con enlace de `demo.localhost`
3. Intentar abrir el enlace desde `otro.localhost`

**Resultado Esperado:**
- ✅ Enlace funciona solo desde el subdominio correcto
- ❌ Desde otro subdominio, el token no funcionará

---

### Prueba 9: Validación de Contraseña

**Pasos:**
1. Abrir página de reset con token válido
2. Intentar ingresar contraseña de menos de 6 caracteres
3. Intentar ingresar contraseñas que no coinciden

**Resultado Esperado:**
- ❌ Error: "La contraseña debe tener al menos 6 caracteres"
- ❌ Error: "Las contraseñas no coinciden"
- ✅ Botón deshabilitado hasta que sea válido

---

### Prueba 10: Indicador de Fortaleza

**Pasos:**
1. Abrir página de reset
2. Ingresar diferentes contraseñas:
   - `abc` → Muy débil (rojo)
   - `abc123` → Débil (amarillo)
   - `abc12345` → Media (amarillo)
   - `Abc12345` → Buena (verde)
   - `Abc123456789` → Excelente (verde)

**Resultado Esperado:**
- ✅ Barras de progreso cambian de color
- ✅ Texto indica nivel de fortaleza

---

## 🐛 Solución de Problemas

### Error: "No se pudo enviar el correo"

**Causa:** SMTP no configurado correctamente

**Solución:**
1. Verificar `.env`:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=info@innovasystems.com.co
   SMTP_PASSWORD=tu-contraseña-de-aplicacion
   ```
2. Verificar que la contraseña de aplicación sea correcta
3. Ver logs del backend para más detalles

---

### Error: "Token inválido"

**Causa:** Token no existe o ya fue usado

**Solución:**
1. Solicitar nuevo enlace de reset
2. Verificar que el enlace no haya expirado
3. Verificar que no se haya usado antes

---

### Error: Página en blanco

**Causa:** Error de compilación en frontend

**Solución:**
1. Verificar consola del navegador (F12)
2. Verificar que el frontend esté corriendo
3. Verificar que no haya errores de TypeScript

---

### Error: "Cannot read property 'logoUrl'"

**Causa:** Settings no cargados

**Solución:**
1. Verificar que el backend esté corriendo
2. Verificar que el endpoint `/api/settings/public` funcione
3. Verificar que el tenant tenga settings configurados

---

## ✅ Checklist de Pruebas

- [ ] Solicitar reset con email válido
- [ ] Recibir correo con diseño correcto
- [ ] Abrir enlace y ver página de reset
- [ ] Restablecer contraseña exitosamente
- [ ] Iniciar sesión con nueva contraseña
- [ ] Intentar reutilizar token (debe fallar)
- [ ] Solicitar reset con email inexistente
- [ ] Validar fortaleza de contraseña
- [ ] Validar coincidencia de contraseñas
- [ ] Verificar redirección automática

---

## 📝 Notas

- Todos los errores fueron corregidos
- El sistema está listo para pruebas
- Asegúrate de tener SMTP configurado
- Los logs del backend son útiles para debugging

---

**Estado:** ✅ Listo para pruebas  
**Última actualización:** 7 de enero de 2026
