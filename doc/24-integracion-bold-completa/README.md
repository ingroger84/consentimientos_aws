# Integración Bold - Documentación Completa

## Índice de Documentos

1. **CONFIGURACION_WEBHOOK_COMPLETADA_20260121.md** - Configuración del webhook de Bold
2. **CORRECCION_URL_API_BOLD_20260121.md** - Primera corrección de URL (incompleta)
3. **CORRECCION_URL_API_BOLD_FINAL_20260121.md** - Corrección final y definitiva de URL

## Estado Actual

✅ **Integración Completada y Funcional**

### Configuración de Bold

- **Modo:** Sandbox (pruebas)
- **API URL:** `https://api-sandbox.bold.co/v1`
- **Merchant ID:** `0fhPQYC`
- **Webhook URL:** `https://datagree.net/api/webhooks/bold`
- **Webhook Secret:** Configurado correctamente

### URLs de Redirección

- **Success:** `https://datagree.net/payment/success`
- **Failure:** `https://datagree.net/payment/failure`

## Problema Resuelto

El error `getaddrinfo ENOTFOUND sandbox-api.bold.co` fue causado por:

1. URL incorrecta en `ecosystem.config.js`: `https://sandbox-api.bold.co/v1`
2. URL correcta en `.env`: `https://api-sandbox.bold.co/v1`
3. PM2 usaba las variables de `ecosystem.config.js` en lugar del `.env`

**Solución:** Actualizar `ecosystem.config.js` con la URL correcta y reiniciar PM2.

## Próximos Pasos

1. Probar crear un link de pago desde la interfaz
2. Verificar que el link de Bold se abra correctamente
3. Realizar una transacción de prueba en sandbox
4. Verificar que el webhook reciba las notificaciones
5. Cuando esté listo para producción, cambiar a las credenciales de producción

## Archivos Relacionados

### Backend
- `backend/src/payments/bold.service.ts` - Servicio de integración con Bold
- `backend/src/webhooks/webhooks.controller.ts` - Controlador de webhooks
- `backend/src/invoices/invoices.controller.ts` - Endpoint para crear links de pago
- `backend/.env` - Variables de entorno (local)
- `/home/ubuntu/consentimientos_aws/backend/.env` - Variables de entorno (servidor)
- `/home/ubuntu/consentimientos_aws/ecosystem.config.js` - Configuración de PM2

### Frontend
- `frontend/src/components/billing/PaymentReminderBanner.tsx` - Banner de recordatorio de pago
- `frontend/src/components/invoices/PayNowModal.tsx` - Modal para pagar facturas

## Documentación de Bold

- [Documentación oficial de Bold](https://bold.co/docs)
- [API Reference](https://bold.co/docs/api)
- [Webhooks](https://bold.co/docs/webhooks)

---

**Última actualización:** 21 de Enero de 2026
**Estado:** ✅ Funcional en Sandbox
