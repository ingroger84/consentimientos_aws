# Sistema de Reintentos de Pago Bold - v80.0.0

## 🚀 Guía Rápida de Despliegue

### Prerequisitos:
- ✅ Acceso SSH al servidor (100.28.198.249)
- ✅ Clave SSH (AWS-ISSABEL.pem)
- ✅ PowerShell en Windows
- ✅ Git configurado

### Despliegue Automático (Recomendado):

```powershell
# Desde la raíz del proyecto
.\scripts\deploy-v80-payment-retries.ps1
```

Este script ejecuta automáticamente:
1. Backup de base de datos
2. Pull de cambios desde GitHub
3. Instalación de dependencias
4. Aplicación de migración SQL
5. Compilación de backend
6. Reinicio de PM2
7. Compilación de frontend
8. Verificación de logs

**Tiempo estimado:** 5-7 minutos

---

## 📋 Despliegue Manual (Paso a Paso)

### 1. Backup de Base de Datos:
```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
cd /home/ubuntu/consentimientos_aws
node backend/backup-database.js
```

### 2. Actualizar Código:
```bash
git pull origin main
```

### 3. Instalar Dependencias Backend:
```bash
cd backend
npm install
```

### 4. Aplicar Migración:
```bash
cd /home/ubuntu/consentimientos_aws
node backend/apply-payment-attempts-migration.js
```

**Salida esperada:**
```
✅ Migración aplicada exitosamente
✅ Columnas agregadas a invoices
✅ Tabla payment_attempts creada
✅ Índices creados
```

### 5. Compilar Backend:
```bash
cd backend
npm run build
```

### 6. Reiniciar PM2:
```bash
cd /home/ubuntu/consentimientos_aws
pm2 restart datagree
pm2 status
```

### 7. Compilar Frontend:
```bash
cd frontend
npm install
npm run build
```

### 8. Verificar Logs:
```bash
pm2 logs datagree --lines 50
```

---

## ✅ Verificación Post-Despliegue

### 1. Ejecutar Tests:
```bash
cd /home/ubuntu/consentimientos_aws
node backend/test-payment-retries-system.js
```

**Salida esperada:**
```
✅ TODOS LOS TESTS PASARON
🎉 Sistema de reintentos de pago verificado exitosamente
```

### 2. Verificar Backend:
```bash
curl https://api.archivoenlinea.com/api/health
```

### 3. Verificar Frontend:
```bash
curl https://admin.archivoenlinea.com
```

### 4. Verificar Base de Datos:
```sql
-- Conectar a Supabase y ejecutar:
SELECT COUNT(*) FROM payment_attempts;
SELECT COUNT(*) FROM invoices WHERE bold_payment_link_status IS NOT NULL;
```

---

## 🧪 Testing Manual

### Caso 1: Pago Rechazado

1. Crear una factura de prueba
2. Generar link de pago
3. Simular rechazo (webhook de Bold)
4. Verificar:
   - [ ] Email enviado
   - [ ] Link marcado como 'failed'
   - [ ] Intento registrado en payment_attempts
   - [ ] Contador muestra "1 de 6"

### Caso 2: Reintentar Pago

1. Ir a página de cuenta suspendida
2. Click en "Reintentar Pago"
3. Verificar:
   - [ ] Nuevo link generado
   - [ ] Redirección a Bold funciona
   - [ ] Contador actualizado

### Caso 3: Límite de Intentos

1. Simular 6 intentos fallidos
2. Intentar el 7mo
3. Verificar:
   - [ ] Error mostrado
   - [ ] Botón deshabilitado
   - [ ] Mensaje de contactar soporte

---

## 📊 Monitoreo

### Queries Útiles:

#### Facturas con Intentos Fallidos:
```sql
SELECT 
  i.invoice_number,
  i.payment_attempts_count,
  i.bold_payment_link_status,
  t.name as tenant_name
FROM invoices i
JOIN tenants t ON i.tenant_id = t.id
WHERE i.payment_attempts_count > 0
  AND i.status IN ('pending', 'overdue')
ORDER BY i.payment_attempts_count DESC;
```

#### Intentos de las Últimas 24 Horas:
```sql
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
  COUNT(CASE WHEN status = 'succeeded' THEN 1 END) as succeeded
FROM payment_attempts
WHERE attempted_at > NOW() - INTERVAL '24 hours';
```

#### Facturas en Límite de Intentos:
```sql
SELECT 
  invoice_number,
  payment_attempts_count,
  tenant_id
FROM invoices
WHERE payment_attempts_count >= 6
  AND status IN ('pending', 'overdue');
```

---

## 🚨 Troubleshooting

### Problema: Migración Falla

**Síntoma:** Error al ejecutar `apply-payment-attempts-migration.js`

**Solución:**
```bash
# Verificar conexión a BD
psql -h db.witvuzaarlqxkiqfiljq.supabase.co -U postgres -d postgres

# Verificar si la migración ya se aplicó
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'invoices' 
AND column_name = 'bold_payment_link_status';

# Si ya existe, la migración ya se aplicó
```

### Problema: Backend No Inicia

**Síntoma:** PM2 muestra estado "errored"

**Solución:**
```bash
# Ver logs detallados
pm2 logs datagree --lines 100

# Verificar compilación
cd backend
npm run build

# Reiniciar
pm2 restart datagree
```

### Problema: Emails No Se Envían

**Síntoma:** No llegan emails de pago fallido

**Solución:**
```bash
# Verificar variables de entorno
cat backend/.env | grep SMTP

# Probar conexión SMTP
node backend/test-smtp-connection.js

# Verificar logs de MailService
pm2 logs datagree | grep "Payment failed email"
```

### Problema: Webhooks No Funcionan

**Síntoma:** Intentos no se registran cuando Bold envía webhook

**Solución:**
```bash
# Verificar logs de webhooks
pm2 logs datagree | grep "webhook"

# Verificar URL de webhook en Bold
# Debe ser: https://api.archivoenlinea.com/api/webhooks/bold

# Verificar firma de webhook
# BOLD_WEBHOOK_SECRET debe estar configurado en .env
```

---

## 📞 Soporte

### Contactos:
- **Email:** rcaraballo@innovasystems.com.co
- **Servidor:** 100.28.198.249
- **Base de Datos:** Supabase (db.witvuzaarlqxkiqfiljq.supabase.co)

### Logs Importantes:
```bash
# Logs de PM2
pm2 logs datagree

# Logs de sistema
tail -f /var/log/syslog

# Logs de Nginx
tail -f /var/log/nginx/error.log
```

---

## 📚 Documentación Adicional

- [Implementación Completa](./IMPLEMENTACION_REINTENTOS_PAGO_BOLD.md)
- [Resumen Ejecutivo](./RESUMEN_EJECUTIVO.md)
- [Script de Despliegue](../../scripts/deploy-v80-payment-retries.ps1)
- [Migración SQL](../../database/migrations/add-payment-attempts-system.sql)

---

## ✅ Checklist de Despliegue

### Pre-Despliegue:
- [ ] Backup de base de datos realizado
- [ ] Código revisado en GitHub
- [ ] Variables de entorno verificadas
- [ ] Credenciales de Bold válidas

### Durante Despliegue:
- [ ] Pull de cambios exitoso
- [ ] Dependencias instaladas
- [ ] Migración aplicada sin errores
- [ ] Backend compilado
- [ ] PM2 reiniciado
- [ ] Frontend compilado

### Post-Despliegue:
- [ ] Tests ejecutados exitosamente
- [ ] Logs sin errores críticos
- [ ] Backend responde en /api/health
- [ ] Frontend carga correctamente
- [ ] Email de prueba enviado
- [ ] Webhook de prueba funciona

---

## 🎊 Estado de Despliegue

**Versión Desplegada:** v82.1.0  
**Fecha de Despliegue:** 2026-03-29  
**Estado:** ✅ DESPLEGADO EN PRODUCCIÓN

### Verificación:
- ✅ Backend compilado y funcionando
- ✅ Frontend compilado y accesible
- ✅ Base de datos migrada
- ✅ PM2 estable (versión 82.1.0)
- ✅ Health checks pasando
- ✅ Sin errores en logs

### Documentación de Despliegue:
Ver [DESPLIEGUE_V82.1.0_COMPLETADO.md](./DESPLIEGUE_V82.1.0_COMPLETADO.md) para detalles completos del proceso de despliegue.

---

**Versión Original:** v80.0.0  
**Versión Desplegada:** v82.1.0  
**Fecha:** 2026-03-29  
**Estado:** ✅ EN PRODUCCIÓN

🎉 **¡Sistema de Reintentos de Pago Bold Desplegado Exitosamente!**
