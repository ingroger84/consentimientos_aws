# Problema con API de Bold Colombia - 21 Enero 2026

## 🚨 PROBLEMA IDENTIFICADO

Bold Colombia **NO tiene una API REST pública** para crear payment intents programáticamente.

### Evidencia

1. **Endpoint probado:** `POST https://api.online.payments.bold.co/payment-intent`
2. **Respuesta:** `{"message":"Missing Authentication Token"}`
3. **Headers enviados:** `x-api-key: g72LcD8iISN-PjURFfTq8UQU_2aizz5VclkaAfMdOuE`
4. **Resultado:** El endpoint no reconoce el header de autenticación

### Prueba con curl

```bash
curl -X POST https://api.online.payments.bold.co/payment-intent \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: g72LcD8iISN-PjURFfTq8UQU_2aizz5VclkaAfMdOuE' \
  -d '{
    "reference_id": "TEST-123",
    "amount": {
      "currency": "COP",
      "total_amount": 10000
    }
  }'

# Respuesta:
# {"message":"Missing Authentication Token"}
```

## 🔍 ANÁLISIS

### Lo que Bold Colombia ofrece:

1. **Botón de Pagos:** Widget HTML/JavaScript que se integra en el sitio web
2. **Link de Pago:** Links de pago creados manualmente desde el panel
3. **Datafonos:** Terminales físicas para pagos presenciales

### Lo que Bold Colombia NO ofrece:

- ❌ API REST para crear payment intents
- ❌ API para generar links de pago programáticamente
- ❌ Webhooks para notificaciones de pago
- ❌ Documentación técnica pública de API

## 💡 SOLUCIONES ALTERNATIVAS

### Opción 1: Usar Wompi (Recomendado)

Bold Colombia parece estar relacionado con Wompi, que SÍ tiene una API completa.

**Ventajas:**
- ✅ API REST completa y documentada
- ✅ Crear payment links programáticamente
- ✅ Webhooks para notificaciones
- ✅ Sandbox para pruebas
- ✅ Documentación en inglés y español

**Documentación:** https://docs.wompi.co/en/docs/colombia/links-de-pago

**Pasos:**
1. Crear cuenta en Wompi: https://comercios.wompi.co/
2. Obtener API keys (public y private)
3. Integrar API de Wompi en lugar de Bold

### Opción 2: Links de Pago Manuales

Crear links de pago manualmente desde el panel de Bold y enviarlos por correo.

**Ventajas:**
- ✅ No requiere integración técnica
- ✅ Funciona inmediatamente

**Desventajas:**
- ❌ Proceso manual
- ❌ No escalable
- ❌ No automatizable

### Opción 3: Botón de Pagos (Widget)

Integrar el widget de Bold en el frontend.

**Ventajas:**
- ✅ Integración oficial de Bold
- ✅ Experiencia de pago en el sitio

**Desventajas:**
- ❌ Requiere modificar el frontend
- ❌ No genera links compartibles
- ❌ Usuario debe estar en el sitio web

### Opción 4: Usar otro Gateway de Pagos

Considerar otros gateways de pago en Colombia con API completa:

1. **Wompi** (Recomendado)
   - API completa
   - Documentación excelente
   - Sandbox para pruebas

2. **PayU Colombia**
   - API REST completa
   - Webhooks
   - Documentación técnica

3. **Mercado Pago**
   - API completa
   - Payment links
   - Webhooks

4. **ePayco**
   - API REST
   - Links de pago
   - Webhooks

## 📋 RECOMENDACIÓN

**Migrar a Wompi** es la mejor opción porque:

1. Tiene API completa y documentada
2. Permite crear payment links programáticamente
3. Tiene webhooks para notificaciones automáticas
4. Tiene sandbox para pruebas
5. Es ampliamente usado en Colombia
6. La integración es similar a lo que ya tenemos

## 🔄 PRÓXIMOS PASOS

### Si decides usar Wompi:

1. Crear cuenta en https://comercios.wompi.co/
2. Obtener credenciales de prueba (sandbox)
3. Modificar `bold.service.ts` para usar API de Wompi
4. Probar con tarjetas de prueba de Wompi
5. Configurar webhook para notificaciones
6. Migrar a producción

### Si decides quedarte con Bold:

1. Contactar soporte de Bold: soporte@bold.co
2. Preguntar si tienen API para crear payment links
3. Solicitar documentación técnica
4. Mientras tanto, usar links manuales desde el panel

## 📞 CONTACTO BOLD COLOMBIA

- **Email:** soporte@bold.co
- **Panel:** https://panel.bold.co
- **Sitio web:** https://bold.co

---

**Fecha:** 21 de Enero de 2026  
**Estado:** API no disponible  
**Acción requerida:** Decidir entre Wompi u otro gateway
