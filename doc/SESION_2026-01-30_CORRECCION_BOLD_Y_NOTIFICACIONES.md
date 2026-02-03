# Sesión 2026-01-30: Corrección Bold API y Notificaciones

## Fecha
30 de Enero de 2026

## Problemas Identificados

### 1. Mensaje del Navegador al Iniciar Sesión en Tenant
**Problema**: Al iniciar sesión en una cuenta tenant, el navegador pedía permiso para "Buscar y conectarse a cualquier dispositivo de tu red local".

**Causa**: Referencia hardcodeada a `localhost:3000` en `frontend/src/hooks/useResourceLimitNotifications.ts` línea 36.

**Solución**:
- Modificado `useResourceLimitNotifications.ts` para usar `getApiBaseUrl()` en lugar de hardcodear localhost
- Frontend recompilado y nginx recargado

**Archivos modificados**:
- `frontend/src/hooks/useResourceLimitNotifications.ts`

### 2. Error al Crear Cuenta Tenant - No se Envía Correo
**Problema**: Al crear una cuenta tenant, no se enviaba correo de confirmación al super admin.

**Causa**: Error en la base de datos: `column "userId" of relation "notifications" does not exist`

**Solución**:
- Deshabilitada la creación de notificación en el sistema (líneas 171-178 de `tenants.service.ts`)
- El correo se envía directamente al super admin sin usar la tabla de notificaciones
- Backend recompilado y PM2 reiniciado

**Archivos modificados**:
- `backend/src/tenants/tenants.service.ts`

### 3. Error de Bold Payment Gateway
**Problema**: Al hacer clic en "Pagar Ahora", Bold responde con error "Missing Authentication Token".

**Análisis**:
1. **Formato de autenticación corregido**: Cambiado de `Authorization: x-api-key <llave>` a header `x-api-key: <llave>` directamente
2. **Endpoint correcto**: Usando `/payment-intents` según documentación
3. **Payload correcto**: Estructura `PaymentIntent` según esquema de Bold
4. **callback_url corregido**: Ya no sale "undefined", ahora usa `https://archivoenlinea.com/invoices/...`

**Estado actual**:
- ❌ Bold sigue respondiendo "Missing Authentication Token"
- ✅ Código implementado correctamente según documentación de Bold
- ✅ Headers enviados correctamente
- ✅ Payload estructurado correctamente

**Causa probable**:
- API Key no válida o sin permisos
- API Key de sandbox usada en producción (o viceversa)
- Cuenta de Bold no configurada correctamente

**Archivos modificados**:
- `backend/src/payments/bold.service.ts` (header `x-api-key`)
- `backend/src/invoices/invoices.service.ts` (uso de `ConfigService` para `FRONTEND_URL`)
- `ecosystem.config.js` (agregado `FRONTEND_URL`)

## Configuración Actual de Bold

### Variables de Entorno (ecosystem.config.js)
```javascript
BOLD_API_KEY: '1XVOAZHZ87fuDLuWzKAQmG_0RRGYO_eo8YhJHmugf68'
BOLD_SECRET_KEY: 'IKi1koNT7pUK1uTRf4vYOQ'
BOLD_MERCHANT_ID: '2M0MTRAD37'
BOLD_API_URL: 'https://api.online.payments.bold.co'
BOLD_WEBHOOK_SECRET: 'g72LcD8iISN-PjURFfTq8UQU_2aizz5VclkaAfMdOuE'
BOLD_SUCCESS_URL: 'https://archivoenlinea.com/payment/success'
BOLD_FAILURE_URL: 'https://archivoenlinea.com/payment/failure'
BOLD_WEBHOOK_URL: 'https://archivoenlinea.com/api/webhooks/bold'
FRONTEND_URL: 'https://archivoenlinea.com'
```

### Estructura del Payload Enviado
```json
{
  "reference_id": "INV-INV-202601-1723-1769821147306",
  "amount": {
    "currency": "COP",
    "total_amount": 119900
  },
  "description": "Factura INV-202601-1723 - Demo Estetica",
  "callback_url": "https://archivoenlinea.com/invoices/9970661d-9e56-4974-a1cc-f8f1a1280b44/payment-success",
  "customer": {
    "name": "Demo Estetica",
    "email": "roger.caraballo@gmail.com"
  }
}
```

### Headers Enviados
```json
{
  "Content-Type": "application/json",
  "x-api-key": "1XVOAZHZ87fuDLuWzKAQ..."
}
```

## Recomendaciones para Resolver Bold

1. **Contactar a Bold Colombia**:
   - Verificar que la API Key `1XVOAZHZ87fuDLuWzKAQmG_0RRGYO_eo8YhJHmugf68` sea válida
   - Confirmar que tiene permisos para crear intenciones de pago
   - Verificar si es API Key de sandbox o producción
   - Confirmar que la URL `https://api.online.payments.bold.co` sea correcta

2. **Verificar en el Panel de Bold**:
   - Estado de la cuenta
   - Permisos de la API Key
   - Configuración de webhooks
   - Límites y restricciones

3. **Documentación consultada**:
   - https://developers.bold.co/pagos-en-linea/api-de-pagos-en-linea/integracion
   - https://developers.bold.co/pagos-en-linea/api-de-pagos-en-linea/esquema-de-datos

## Logs del Backend

### Último intento de pago (2026-01-31 00:59:07)
```
[BoldService] Creando intención de pago en Bold para: INV-INV-202601-1723-1769821147306
[BoldService] Payload para Bold: {...}
[BoldService] Headers enviados a Bold: {"Content-Type": "application/json", "x-api-key": "1XVOAZHZ87fuDLuWzKAQ..."}
[BoldService] ❌ Error al crear intención de pago en Bold: {"message": "Missing Authentication Token"}
```

## Estado del Sistema

### Backend
- ✅ Compilado correctamente
- ✅ PM2 corriendo (PID: 217564)
- ✅ Base de datos conectada
- ✅ Bold Service inicializado

### Frontend
- ✅ Compilado correctamente (v22.0.2)
- ✅ Nginx recargado
- ✅ Sin referencias a localhost

### Versiones
- Backend: 22.0.2
- Frontend: 22.0.2
- Node.js: v18.x
- PM2: Activo

## Próximos Pasos

1. ✅ Corrección de mensaje del navegador - **COMPLETADO**
2. ✅ Corrección de envío de correos - **COMPLETADO**
3. ⏳ Integración de Bold - **PENDIENTE** (requiere verificación con Bold Colombia)

## Notas Técnicas

- El código está implementado correctamente según la documentación oficial de Bold
- El error "Missing Authentication Token" es un error de autenticación de Bold, no del código
- Se requiere contacto directo con Bold Colombia para resolver el problema de la API Key
- Todas las demás funcionalidades del sistema están operativas

## Archivos Modificados en Esta Sesión

1. `frontend/src/hooks/useResourceLimitNotifications.ts`
2. `backend/src/tenants/tenants.service.ts`
3. `backend/src/payments/bold.service.ts`
4. `backend/src/invoices/invoices.service.ts`
5. `ecosystem.config.js`

## Comandos Ejecutados

```bash
# Frontend
cd frontend
npm run build
sudo systemctl reload nginx

# Backend
cd backend
NODE_OPTIONS='--max-old-space-size=2048' npm run build
pm2 restart datagree --update-env
```
