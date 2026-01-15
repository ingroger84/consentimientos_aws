# Acción Inmediata: Solucionar Envío de Correos

## 🚨 Problema Actual

Error 535: "Username and Password not accepted" con Google Workspace.

## ✅ Solución Más Rápida (5 minutos)

### Opción A: Generar Nueva Contraseña de Aplicación

**Pasos:**

1. **Ir a:** https://myaccount.google.com/apppasswords

2. **Si no ves la opción:**
   - Ve a: https://myaccount.google.com/security
   - Habilita "Verificación en 2 pasos"
   - Vuelve a: https://myaccount.google.com/apppasswords

3. **Generar contraseña:**
   - App: **Correo**
   - Dispositivo: **Otro** → "Sistema Consentimientos"
   - Clic en **Generar**

4. **Copiar contraseña:**
   - Ejemplo: `abcd efgh ijkl mnop`
   - Copiar EXACTAMENTE como aparece

5. **Actualizar `.env`:**
   ```env
   SMTP_PASSWORD=abcdefghijklmnop
   ```
   (Sin espacios o con espacios, ambos funcionan)

6. **Probar:**
   ```bash
   cd backend
   npx ts-node test-workspace-email.ts
   ```

7. **Reiniciar backend**

### Opción B: Usar SendGrid (Recomendado si A no funciona)

**Pasos:**

1. **Crear cuenta:** https://sendgrid.com (Gratis)

2. **Crear API Key:**
   - Settings → API Keys → Create API Key
   - Copiar la API Key

3. **Actualizar `.env`:**
   ```env
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=apikey
   SMTP_PASSWORD=tu-api-key-aqui
   SMTP_FROM=info@innovasystems.com.co
   ```

4. **Probar:**
   ```bash
   cd backend
   npx ts-node test-email-config.ts
   ```

5. **Reiniciar backend**

## 🔍 Si Opción A No Funciona

### Verificar con Administrador de Workspace

Pide al administrador que verifique en https://admin.google.com:

1. **Apps → Gmail → Configuración de usuario:**
   - ✅ Habilitar IMAP
   - ✅ Habilitar POP

2. **Seguridad → Autenticación:**
   - ✅ Permitir contraseñas de aplicación

## 📊 Estado Actual

```
❌ Correo: info@innovasystems.com.co
❌ Contraseña: oheg bocp fnyc ovld (16 caracteres)
❌ Error: 535 - Credenciales no aceptadas
```

## 🎯 Objetivo

```
✅ Correo: info@innovasystems.com.co
✅ Contraseña: Nueva contraseña de aplicación
✅ Estado: Correos enviándose correctamente
```

## 📝 Checklist Rápido

- [ ] Verificación en 2 pasos habilitada
- [ ] Nueva contraseña de aplicación generada
- [ ] Contraseña actualizada en `.env`
- [ ] Backend reiniciado
- [ ] Script de prueba ejecutado
- [ ] Correo de prueba recibido

## 🆘 Si Nada Funciona

Usa SendGrid temporalmente mientras resuelves el problema de Workspace:

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=tu-sendgrid-api-key
```

## 📞 Soporte

- Workspace: https://support.google.com/a/
- SendGrid: https://support.sendgrid.com/
- Documentación completa: `doc/CONFIGURACION_GOOGLE_WORKSPACE.md`
