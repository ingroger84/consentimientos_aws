# Configuración Bold Producción - v84.0.0

## 📅 Fecha: 2026-03-31

## 🎯 Objetivo

Migrar de credenciales de prueba (sandbox) a credenciales de producción de Bold para procesar pagos reales.

---

## 📋 Tareas Completadas

### 1. Limpieza de Datos de Prueba ✅

**Datos eliminados:**
- ✅ Tabla `payment_attempts`: 0 registros de prueba
- ✅ Campos Bold en facturas limpiados:
  - `bold_payment_link_id` → NULL
  - `bold_payment_link_url` → NULL
  - `bold_payment_link_status` → NULL
  - `bold_payment_link_created_at` → NULL

**Script utilizado:**
```sql
-- backend/clean-bold-test-data-simple.sql
DELETE FROM payment_attempts;

UPDATE invoices 
SET 
  bold_payment_link_id = NULL,
  bold_payment_link_url = NULL,
  bold_payment_link_status = NULL,
  bold_payment_link_created_at = NULL
WHERE bold_payment_link_id IS NOT NULL;
```

**Resultado:**
```
✅ 0 registros eliminados de payment_attempts
✅ Campos Bold limpiados en facturas
✅ Base de datos lista para producción
```

---

### 2. Actualización de Credenciales ✅

**Credenciales de Producción:**
```env
# Bold Payment Gateway - PRODUCCIÓN
BOLD_API_KEY=HMcUmgDurr8eFqn4598h_hdm0X3fQ8MsNudZclU80e0
BOLD_SECRET_KEY=H8UagQREW9C0OtiQ-ZoVtQ
BOLD_MERCHANT_ID=2M0MTRAD37
BOLD_API_URL=https://integrations.api.bold.co
```

**Archivo actualizado:**
- `backend/.env` (en servidor de producción)

**Ubicación:**
- Servidor: `100.28.198.249`
- Ruta: `/home/ubuntu/consentimientos_aws/backend/.env`

---

### 3. Prueba de Conexión ✅

**Script creado:**
- `backend/test-bold-production.js`

**Funcionalidad:**
1. Carga credenciales desde `.env`
2. Verifica autenticación con Bold API
3. Lista métodos de pago disponibles
4. Crea un link de pago de prueba

**Ejecución:**
```bash
cd /home/ubuntu/consentimientos_aws/backend
node test-bold-production.js
```

**Resultado:**
```
🔐 Probando conexión con Bold (PRODUCCIÓN)...

📋 Credenciales configuradas:
   API Key: HMcUmgDurr8eFqn4598h...
   Secret Key: H8UagQREW9C0OtiQ-ZoV...
   API URL: https://integrations.api.bold.co

1️⃣  Probando autenticación con x-api-key...
   ✅ Autenticación exitosa!

2️⃣  Métodos de pago disponibles:
   Métodos: {
     "CREDIT_CARD": { "max": 10000000, "min": 1000 },
     "PSE": { "max": 10000000, "min": 1000 },
     "BOTON_BANCOLOMBIA": { "max": 10000000, "min": 1000 },
     "NEQUI": { "max": 10000000, "min": 1000 }
   }

3️⃣  Creando link de pago de prueba...
   ✅ Link de pago creado exitosamente!
   URL: https://checkout.bold.co/payment/LNK_UJBN92D8Y0
   Payment Link ID: LNK_UJBN92D8Y0

🎉 Todas las pruebas pasaron exitosamente!
✅ Bold está configurado correctamente en PRODUCCIÓN
📝 Puedes comenzar a crear links de pago reales
```

---

### 4. Reinicio del Backend ✅

**Comando ejecutado:**
```bash
pm2 restart datagree --update-env
```

**Resultado:**
```
✅ Backend reiniciado correctamente
✅ Versión: v83.3.0
✅ Estado: online
✅ Credenciales de producción cargadas
```

---

## 🔍 Métodos de Pago Disponibles

Bold Colombia soporta los siguientes métodos de pago en producción:

| Método | Monto Mínimo | Monto Máximo |
|--------|--------------|--------------|
| **Tarjeta de Crédito** | $1,000 COP | $10,000,000 COP |
| **PSE** | $1,000 COP | $10,000,000 COP |
| **Botón Bancolombia** | $1,000 COP | $10,000,000 COP |
| **Nequi** | $1,000 COP | $10,000,000 COP |

---

## 🔄 Diferencias: Sandbox vs Producción

### Credenciales Sandbox (Antiguas):
```env
BOLD_API_KEY=g72LcD8iISN-PjURFfTq8UQU_2aizz5VclkaAfMdOuE
BOLD_SECRET_KEY=IKi1koNT7pUK1uTRf4vYOQ
BOLD_MERCHANT_ID=2M0MTRAD37
```

### Credenciales Producción (Nuevas):
```env
BOLD_API_KEY=HMcUmgDurr8eFqn4598h_hdm0X3fQ8MsNudZclU80e0
BOLD_SECRET_KEY=H8UagQREW9C0OtiQ-ZoVtQ
BOLD_MERCHANT_ID=2M0MTRAD37
```

### Comportamiento:

| Aspecto | Sandbox | Producción |
|---------|---------|------------|
| **Pagos** | Simulados | Reales |
| **Tarjetas** | Tarjetas de prueba | Tarjetas reales |
| **Dinero** | No se cobra | Se cobra realmente |
| **Webhooks** | Simulados | Reales |
| **Links** | Expiran igual | Expiran igual |

---

## ✅ Verificación Post-Configuración

### 1. Verificar Credenciales en Servidor
```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
cd /home/ubuntu/consentimientos_aws/backend
grep -E 'BOLD_' .env
```

**Resultado esperado:**
```
BOLD_API_KEY=HMcUmgDurr8eFqn4598h_hdm0X3fQ8MsNudZclU80e0
BOLD_SECRET_KEY=H8UagQREW9C0OtiQ-ZoVtQ
BOLD_MERCHANT_ID=2M0MTRAD37
BOLD_API_URL=https://integrations.api.bold.co
```

### 2. Verificar Backend Funcionando
```bash
pm2 status
```

**Resultado esperado:**
```
┌────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┐
│ id │ name        │ version │ mode    │ pid      │ uptime │ ↺    │ status    │
├────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┤
│ 0  │ datagree    │ 83.3.0  │ fork    │ 1250753  │ 5m     │ 494  │ online    │
└────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┘
```

### 3. Probar Creación de Link de Pago
```bash
# Desde el dashboard de Super Admin
1. Crear una factura manual
2. Click en "Pagar Ahora"
3. Verificar que se abra Bold checkout
4. Verificar que la URL sea: https://checkout.bold.co/payment/LNK_...
```

---

## 🚨 Importante: Pagos Reales

### ⚠️ ADVERTENCIA

A partir de ahora, todos los pagos procesados serán **REALES**:

1. ✅ Las tarjetas de crédito serán cobradas realmente
2. ✅ Los pagos PSE transferirán dinero real
3. ✅ Los webhooks notificarán pagos reales
4. ✅ El dinero llegará a la cuenta de Bold configurada

### 🔒 Seguridad

- ✅ Credenciales almacenadas en `.env` (no en código)
- ✅ `.env` en `.gitignore` (no se sube a Git)
- ✅ Acceso SSH con clave privada
- ✅ Servidor protegido con firewall

---

## 📊 Flujo de Pago en Producción

### 1. Usuario Crea Factura
```
Super Admin → Crear Factura Manual
           → Monto: $50,000 COP
           → Cliente: Hotel Glamping La Polka
```

### 2. Sistema Genera Link de Pago
```
Backend → Bold API (Producción)
       → POST /online/link/v1
       → Credenciales: PRODUCCIÓN
       → Response: https://checkout.bold.co/payment/LNK_...
```

### 3. Cliente Paga
```
Cliente → Click "Pagar Ahora"
       → Abre Bold Checkout
       → Selecciona método de pago (PSE, Tarjeta, Nequi, etc.)
       → Completa pago REAL
       → Dinero se transfiere
```

### 4. Bold Notifica Webhook
```
Bold → Webhook a backend
    → POST /api/webhooks/bold
    → Status: APPROVED / REJECTED
    → Backend actualiza factura
```

### 5. Sistema Actualiza Estado
```
Backend → Marca factura como PAID
       → Envía email de confirmación
       → Actualiza estado de cuenta
       → Registra intento de pago
```

---

## 🧪 Testing en Producción

### Prueba 1: Link de Pago Simple
1. Crear factura de $10,000 COP
2. Generar link de pago
3. Verificar que se abra Bold checkout
4. **NO COMPLETAR EL PAGO** (es dinero real)

### Prueba 2: Regeneración de Link
1. Crear factura
2. Generar link
3. Esperar 5 minutos
4. Regenerar link
5. Verificar que se cree un nuevo link

### Prueba 3: Sistema de Reintentos
1. Crear factura
2. Generar link
3. Simular pago rechazado (webhook manual)
4. Verificar email de notificación
5. Verificar contador de intentos
6. Regenerar link automáticamente

---

## 📝 Archivos Modificados

### Backend:
- `backend/.env` - Credenciales actualizadas
- `backend/test-bold-production.js` - Script de prueba creado
- `backend/clean-bold-test-data-simple.sql` - Script de limpieza

### Documentación:
- `doc/84-configuracion-bold-produccion/CONFIGURACION_BOLD_PRODUCCION.md` - Este archivo

---

## 🔧 Troubleshooting

### Problema: Links no se crean

**Solución:**
```bash
# 1. Verificar credenciales
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
cd /home/ubuntu/consentimientos_aws/backend
grep BOLD_ .env

# 2. Probar conexión
node test-bold-production.js

# 3. Reiniciar backend
pm2 restart datagree --update-env

# 4. Ver logs
pm2 logs datagree --lines 50
```

### Problema: Error 403 Forbidden

**Causa:** Credenciales incorrectas o expiradas

**Solución:**
1. Verificar que las credenciales sean de producción
2. Contactar a Bold para verificar estado de la cuenta
3. Verificar que el API Key no haya expirado

### Problema: Error 404 Not Found

**Causa:** Link de pago no existe o expiró

**Solución:**
1. Regenerar link de pago
2. Verificar que el Payment Link ID sea correcto
3. Limpiar links antiguos de prueba

---

## 📞 Información de Contacto

**Bold Colombia:**
- Soporte: https://bold.co/soporte
- Documentación: https://developers.bold.co
- Email: soporte@bold.co

**Credenciales:**
- API Key: `HMcUmgDurr8eFqn4598h_hdm0X3fQ8MsNudZclU80e0`
- Secret Key: `H8UagQREW9C0OtiQ-ZoVtQ`
- Merchant ID: `2M0MTRAD37`

---

## ✅ Checklist Final

- [x] Datos de prueba eliminados
- [x] Credenciales de producción actualizadas
- [x] Script de prueba creado y ejecutado
- [x] Conexión con Bold verificada
- [x] Backend reiniciado con nuevas credenciales
- [x] Métodos de pago verificados
- [x] Documentación creada

---

## 🎉 Conclusión

La configuración de Bold en producción está completa y funcionando correctamente. El sistema ahora puede procesar pagos reales usando los métodos de pago disponibles en Colombia:

- ✅ Tarjetas de Crédito
- ✅ PSE
- ✅ Botón Bancolombia
- ✅ Nequi

Todos los pagos procesados a partir de ahora serán reales y el dinero se transferirá a la cuenta de Bold configurada.

---

**🎊 ¡Configuración de Producción Completada Exitosamente! 🎊**

**Versión Backend:** v83.3.0  
**Fecha:** 2026-03-31  
**Estado:** ✅ PRODUCCIÓN ACTIVA
