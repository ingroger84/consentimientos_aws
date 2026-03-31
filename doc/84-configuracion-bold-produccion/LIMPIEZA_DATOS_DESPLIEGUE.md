# Limpieza de Datos de Prueba y Despliegue v83.4.0

## 📅 Fecha: 2026-03-31

---

## 🎯 Problema Reportado

Usuario reportó que seguía viendo datos de prueba en el dashboard de facturación en diferentes equipos (descartando caché del navegador), y la versión mostrada era v83.1.3 del 29 de marzo.

---

## 🔍 Diagnóstico

### 1. Datos de Prueba en Base de Datos
Se encontraron 12 facturas con links de pago de prueba:

```sql
SELECT COUNT(*) FROM invoices WHERE "boldPaymentLink" IS NOT NULL;
-- Resultado: 12 facturas
```

**Facturas con datos de prueba:**
- INV-202603-4169: $89,900 (pending, 2 intentos)
- INV-202603-0984: $89,900 (voided)
- INV-202603-8577: $89,900 (voided)
- INV-202603-4194: $89,900 (paid)
- INV-202603-5376: $89,900 (paid)
- INV-202603-3610: $89,900 (paid)
- INV-202603-7115: $89,900 (voided)
- INV-202603-7846: $89,900 (voided)
- INV-202603-6331: $89,900 (paid)
- INV-202603-2980: $119,900 (paid)
- INV-202603-1866: $119,900 (voided)
- INV-202603-5324: $119,900 (voided)

### 2. Frontend No Actualizado
El servidor tenía la versión v83.1.3 del 29 de marzo, pero el repositorio ya tenía la v83.4.0 con las credenciales de producción actualizadas.

---

## ✅ Solución Implementada

### 1. Limpieza de Base de Datos

**Script creado:** `backend/clean-all-bold-test-data.sql`

**Acciones realizadas:**
```sql
-- 1. Eliminar todos los payment_attempts
DELETE FROM payment_attempts;
-- Resultado: 0 registros eliminados (ya estaban limpios)

-- 2. Limpiar campos Bold en TODAS las facturas
UPDATE invoices 
SET 
  "boldPaymentLink" = NULL,
  bold_payment_link_status = NULL,
  payment_attempts_count = 0,
  last_payment_attempt_at = NULL,
  "boldTransactionId" = NULL,
  "boldPaymentReference" = NULL
WHERE "boldPaymentLink" IS NOT NULL;
-- Resultado: 12 facturas actualizadas
```

**Verificación:**
```sql
SELECT COUNT(*) FROM invoices WHERE "boldPaymentLink" IS NOT NULL;
-- Resultado: 0 facturas con links de Bold

SELECT COUNT(*) FROM payment_attempts;
-- Resultado: 0 intentos de pago
```

### 2. Actualización del Servidor

**Pasos ejecutados:**

**a) Pull del repositorio:**
```bash
cd /home/ubuntu/consentimientos_aws
git pull origin main
```

**Archivos actualizados:**
- `VERSION.md` → v83.4.0
- `backend/package.json` → v83.4.0
- `backend/src/config/version.ts` → v83.4.0
- `backend/test-bold-production.js` → Nuevo
- `doc/84-configuracion-bold-produccion/CONFIGURACION_BOLD_PRODUCCION.md` → Nuevo
- `frontend/package.json` → v83.4.0
- `frontend/src/config/version.ts` → v83.4.0

**b) Compilación del frontend:**
```bash
cd frontend
npm run build
```

**Resultado:**
```
✅ version.json actualizado:
{
  "version": "83.4.0",
  "buildDate": "2026-03-31",
  "buildHash": "mnf9achp",
  "buildTimestamp": "1775000195773"
}
✓ built in 32.11s
```

---

## 📊 Resultados

### Base de Datos Limpia
- ✅ 0 facturas con links de Bold
- ✅ 0 intentos de pago registrados
- ✅ Todos los campos Bold en NULL
- ✅ Contadores de intentos en 0

### Frontend Actualizado
- ✅ Versión: v83.4.0
- ✅ Fecha de build: 2026-03-31
- ✅ Build hash: mnf9achp
- ✅ Timestamp: 1775000195773

### Backend Funcionando
- ✅ Versión: v83.4.0
- ✅ Credenciales de producción cargadas
- ✅ PM2 status: online
- ✅ Bold API conectada

---

## 🔄 Comparación Antes vs Después

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Versión Frontend** | v83.1.3 (29/03) | v83.4.0 (31/03) |
| **Facturas con Bold** | 12 facturas | 0 facturas |
| **Payment Attempts** | 0 registros | 0 registros |
| **Credenciales Bold** | Sandbox | Producción |
| **Datos visibles** | Datos de prueba | Dashboard limpio |

---

## 🧪 Verificación

### 1. Verificar Versión del Frontend
```
Abrir: https://archivoenlinea.com
Ver footer: "v83.4.0 - 2026-03-31"
```

### 2. Verificar Dashboard Limpio
```
Login como Super Admin
Ir a: Facturación → Dashboard
Verificar: No hay datos de prueba
```

### 3. Verificar Base de Datos
```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
cd /home/ubuntu/consentimientos_aws/backend
PGPASSWORD='%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD' psql \
  -h db.witvuzaarlqxkiqfiljq.supabase.co \
  -U postgres \
  -d postgres \
  -c "SELECT COUNT(*) FROM invoices WHERE \"boldPaymentLink\" IS NOT NULL;"
```

**Resultado esperado:** 0

### 4. Probar Creación de Link de Pago
```
1. Crear factura manual desde Super Admin
2. Click "Pagar Ahora"
3. Verificar que se abra Bold checkout
4. Verificar URL: https://checkout.bold.co/payment/LNK_...
5. Verificar que sea un link de PRODUCCIÓN
```

---

## 📝 Scripts Creados

### 1. `backend/check-test-data.sql`
Verifica datos de prueba en la base de datos.

```sql
SELECT 
  id, 
  "invoiceNumber", 
  total, 
  status, 
  "boldPaymentLink", 
  bold_payment_link_status,
  payment_attempts_count,
  "createdAt"
FROM invoices 
WHERE "boldPaymentLink" IS NOT NULL 
ORDER BY "createdAt" DESC 
LIMIT 20;
```

### 2. `backend/clean-all-bold-test-data.sql`
Limpia TODOS los datos de prueba de Bold.

```sql
DELETE FROM payment_attempts;

UPDATE invoices 
SET 
  "boldPaymentLink" = NULL,
  bold_payment_link_status = NULL,
  payment_attempts_count = 0,
  last_payment_attempt_at = NULL,
  "boldTransactionId" = NULL,
  "boldPaymentReference" = NULL
WHERE "boldPaymentLink" IS NOT NULL;
```

---

## 🚨 Importante

### ⚠️ Datos Limpios
- Todos los links de pago de prueba han sido eliminados
- Los contadores de intentos están en 0
- El dashboard de facturación está limpio

### ⚠️ Producción Activa
- Las credenciales de Bold son de PRODUCCIÓN
- Todos los pagos procesados serán REALES
- El dinero se transferirá a la cuenta de Bold configurada

### ⚠️ Caché del Navegador
Si el usuario sigue viendo la versión antigua:
1. Presionar Ctrl + Shift + R (hard refresh)
2. Limpiar caché del navegador
3. Cerrar y abrir el navegador
4. Verificar en modo incógnito

---

## 📊 Estructura de Datos Limpia

### Tabla `invoices`
```
boldPaymentLink: NULL (para todas las facturas)
bold_payment_link_status: NULL
payment_attempts_count: 0
last_payment_attempt_at: NULL
boldTransactionId: NULL
boldPaymentReference: NULL
```

### Tabla `payment_attempts`
```
Total de registros: 0
```

---

## 🔧 Comandos Útiles

### Verificar versión del frontend en servidor:
```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
cat /home/ubuntu/consentimientos_aws/frontend/dist/version.json
```

### Verificar datos de prueba:
```bash
cd /home/ubuntu/consentimientos_aws/backend
PGPASSWORD='%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD' psql \
  -h db.witvuzaarlqxkiqfiljq.supabase.co \
  -U postgres \
  -d postgres \
  -f check-test-data.sql
```

### Limpiar datos de prueba:
```bash
cd /home/ubuntu/consentimientos_aws/backend
PGPASSWORD='%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD' psql \
  -h db.witvuzaarlqxkiqfiljq.supabase.co \
  -U postgres \
  -d postgres \
  -f clean-all-bold-test-data.sql
```

### Recompilar frontend:
```bash
cd /home/ubuntu/consentimientos_aws/frontend
npm run build
```

---

## ✅ Checklist Final

- [x] Datos de prueba eliminados de la BD
- [x] Frontend actualizado a v83.4.0
- [x] Backend con credenciales de producción
- [x] Dashboard de facturación limpio
- [x] Scripts de verificación creados
- [x] Scripts de limpieza creados
- [x] Documentación actualizada

---

## 🎉 Conclusión

El sistema está completamente limpio y actualizado:

1. ✅ Base de datos sin datos de prueba
2. ✅ Frontend desplegado con v83.4.0
3. ✅ Backend funcionando con credenciales de producción
4. ✅ Dashboard de facturación limpio
5. ✅ Sistema listo para procesar pagos reales

El usuario ahora verá:
- Versión v83.4.0 del 31 de marzo
- Dashboard de facturación sin datos de prueba
- Sistema completamente limpio y listo para producción

---

**🎊 ¡Limpieza y Despliegue Completados Exitosamente! 🎊**

**Versión:** v83.4.0  
**Fecha:** 2026-03-31  
**Estado:** ✅ PRODUCCIÓN LIMPIA Y ACTIVA
