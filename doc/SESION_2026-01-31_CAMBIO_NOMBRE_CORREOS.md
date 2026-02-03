# Sesión 31 de Enero 2026 - Cambio de Nombre en Correos

**Fecha:** 31 de Enero 2026  
**Versión:** 23.1.0  
**Estado:** ✅ Completado

---

## 📋 CAMBIO SOLICITADO

Reemplazar "DatAgree" por "Archivo en Linea" en todos los correos electrónicos enviados por el sistema.

---

## 🔧 CAMBIOS REALIZADOS

### 1. Archivo .env (Local y Servidor)

**Antes:**
```env
SMTP_FROM_NAME=DatAgree
```

**Después:**
```env
SMTP_FROM_NAME=Archivo en Linea
```

**Nota:** Sin tilde en "Linea" para evitar problemas con caracteres especiales en emails.

### 2. Verificación en Código

Se verificó que no hay referencias hardcodeadas a "DatAgree" en el código TypeScript:
- ✅ `backend/src/mail/mail.service.ts` - Usa variable de entorno
- ✅ Todas las plantillas de email - Usan `SMTP_FROM_NAME`

---

## ✅ PRUEBAS REALIZADAS

### Prueba de Envío de Email

**Comando:**
```bash
cd backend
node test-email-notifications.js
```

**Resultado:**
```
=== CONFIGURACION DE EMAIL ===
SMTP From Name: Archivo en Linea

=== EMAIL ENVIADO EXITOSAMENTE ===
Message ID: <10a2b29d-6add-8aa8-f25c-e8dba31f0dd1@innovasystems.com.co>
Destinatario: rcaraballo@innovasystems.com.co
Response: 250 2.0.0 OK
```

✅ Email enviado correctamente con el nuevo nombre

---

## 📧 IMPACTO EN CORREOS

Todos los correos del sistema ahora se enviarán con:

**Remitente:** Archivo en Linea <info@innovasystems.com.co>

### Tipos de Correos Afectados

1. **Bienvenida** - Nuevos usuarios
2. **Restablecimiento de contraseña**
3. **Consentimientos firmados**
4. **Consentimientos de HC**
5. **Facturas generadas**
6. **Recordatorios de pago**
7. **Confirmación de pago**
8. **Suspensión de cuenta**
9. **Reactivación de cuenta**
10. **Trial expirado** (tenant)
11. **Trial expirado** (admin)
12. **Nueva cuenta creada** (admin)
13. **Solicitud de cambio de plan** (admin)

---

## 🚀 DESPLIEGUE

### Local
- ✅ `.env` actualizado
- ✅ Backend compilado
- ✅ Prueba exitosa

### Servidor
- ✅ `.env` actualizado en servidor
- ✅ PM2 reiniciado con `--update-env`
- ✅ Backend online (PID: 221464)

**Comando ejecutado:**
```bash
ssh ubuntu@100.28.198.249 "cd /home/ubuntu/consentimientos_aws/backend && \
  sed -i 's/SMTP_FROM_NAME=.*/SMTP_FROM_NAME=Archivo en Linea/g' .env && \
  cd .. && pm2 restart datagree --update-env"
```

---

## 📊 VERIFICACIÓN

### Estado del Sistema
- ✅ Backend: Online
- ✅ PM2: Running (PID: 221464)
- ✅ Variable de entorno: Actualizada
- ✅ Emails: Enviándose con nuevo nombre

### Próximos Correos
Todos los correos que se envíen a partir de ahora mostrarán:
- **De:** Archivo en Linea
- **Email:** info@innovasystems.com.co

---

## 🎯 RESUMEN

### Cambio Realizado
- "DatAgree" → "Archivo en Linea" en todos los correos

### Archivos Modificados
1. `backend/.env` (local)
2. `/home/ubuntu/consentimientos_aws/backend/.env` (servidor)

### Estado
✅ Cambio aplicado y funcionando en producción

---

**Documentado por:** Kiro AI  
**Fecha:** 31 de Enero 2026  
**Hora:** 03:45 UTC
