# Análisis Completo: Bold Colombia - 21 Enero 2026

## Productos de Bold Colombia

Bold Colombia ofrece **dos productos diferentes** para procesar pagos:

### 1. API Integrations (Datáfonos Físicos)

**Documentación**: https://developers.bold.co/api-integrations/integration

**Propósito**: Conectar aplicaciones web/móviles con datáfonos físicos Bold

**Características**:
- Requiere datáfonos físicos Bold
- Permite iniciar pagos desde una app hacia el datáfono
- El cliente paga con tarjeta física en el datáfono
- URL Base: `https://integrations.api.bold.co`
- Autenticación: `x-api-key` en header

**Flujo**:
1. Tu app envía una solicitud POST a `/payments/app-checkout`
2. El datáfono Bold recibe la notificación
3. El cliente pasa su tarjeta en el datáfono
4. Bold envía webhook con el resultado

**NO es adecuado para**: Pagos online sin datáfono físico

### 2. Botón de Pagos / Links de Pago (Pagos Online)

**Propósito**: Cobros virtuales sin datáfono

**Características**:
- Se crean manualmente desde el dashboard de Bold (panel.bold.co)
- **NO tiene API pública** para crear links programáticamente
- Usa Wompi como procesador de pagos subyacente
- Los links se comparten por email, WhatsApp, redes sociales, etc.

**Limitaciones**:
- No se pueden crear links de pago mediante API
- Solo se pueden crear manualmente desde el panel web
- Cada link es único y se vence en 24 horas

## Solución para Tu Caso de Uso

### Tu Necesidad
Crear links de pago programáticamente para que los clientes paguen facturas online.

### Opciones Disponibles

#### Opción 1: Usar Wompi Directamente (RECOMENDADO)

Bold Colombia usa Wompi como su procesador de pagos. Wompi **SÍ tiene API pública** para crear payment links.

**Ventajas**:
- API completa y documentada
- Puedes crear links programáticamente
- Sandbox disponible para pruebas
- Webhooks para notificaciones
- Mismo procesador que usa Bold

**Implementación**:
```typescript
// URL Base
const WOMPI_API_URL = 'https://sandbox.wompi.co/v1'; // Sandbox
// const WOMPI_API_URL = 'https://production.wompi.co/v1'; // Producción

// Headers
Authorization: Bearer {PRIVATE_KEY}

// Crear Payment Link
POST /v1/payment_links
{
  "name": "Factura INV-202601-1723",
  "description": "Pago de factura mensual",
  "single_use": true,
  "currency": "COP",
  "amount_in_cents": 11990000,
  "redirect_url": "https://datagree.net/payment/success"
}

// Response
{
  "data": {
    "id": "3Z0Cfi",
    "url": "https://checkout.wompi.co/l/3Z0Cfi"
  }
}
```

**Credenciales**:
- Public Key (para frontend): `pub_test_...` o `pub_prod_...`
- Private Key (para backend): `prv_test_...` o `prv_prod_...`

**Documentación**: https://docs.wompi.co/en/docs/colombia/links-de-pago/

#### Opción 2: Usar Bold API Integrations (NO RECOMENDADO)

Requiere:
- Comprar datáfonos físicos Bold
- Habilitar los datáfonos para API
- El cliente debe estar físicamente presente
- No funciona para pagos online

**NO es adecuado para tu caso de uso**.

#### Opción 3: Crear Links Manualmente en Bold (NO ESCALABLE)

- Entrar a panel.bold.co
- Crear cada link manualmente
- Copiar y enviar el link al cliente

**NO es práctico para automatización**.

## Análisis de Tus Credenciales

Las credenciales que tienes:
```
BOLD_API_KEY=1XVQAZsH297hGUuW4KAqmC
BOLD_SECRET_KEY=KWpgscWMWny3apOYs0Wvg
BOLD_MERCHANT_ID=0fhPQYC
```

**Estas credenciales son de Wompi**, no de Bold API Integrations.

### Cómo Identificar:

**Credenciales de Wompi**:
- Public Key: `pub_test_...` o `pub_prod_...`
- Private Key: `prv_test_...` o `prv_prod_...`
- Formato corto sin prefijo (como las tuyas)

**Credenciales de Bold API Integrations**:
- API Key: Formato largo, ejemplo: `DZSkDqh2iWmpYQg204C2fLigQerhPGXAcm5WyujxwYH`
- Se obtienen desde panel.bold.co > Integraciones > API

## Recomendación Final

### Para Pagos Online (Tu Caso)

**Usar Wompi API directamente**:

1. **Verificar credenciales**: Las que tienes parecen ser de Wompi
2. **Obtener credenciales correctas** desde panel.bold.co:
   - Ir a Integraciones
   - Seleccionar "Botón de Pagos" (no "API")
   - Copiar Public Key y Private Key

3. **Implementar con Wompi API**:
   - URL: `https://sandbox.wompi.co/v1`
   - Endpoint: `POST /payment_links`
   - Auth: `Bearer {PRIVATE_KEY}`

4. **Configurar Webhooks**:
   - URL: `https://datagree.net/api/webhooks/bold`
   - Eventos: `transaction.updated`

### Para Datáfonos Físicos (Si lo necesitas en el futuro)

**Usar Bold API Integrations**:
1. Comprar datáfonos Bold
2. Habilitar en app móvil Bold
3. Obtener API Key desde panel.bold.co > Integraciones > API
4. Implementar según documentación oficial

## Próximos Pasos

1. **Verificar credenciales actuales**:
   ```bash
   # Probar con Wompi API
   curl -X POST https://sandbox.wompi.co/v1/payment_links \
     -H "Authorization: Bearer KWpgscWMWny3apOYs0Wvg" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test",
       "description": "Prueba",
       "single_use": true,
       "currency": "COP",
       "amount_in_cents": 10000
     }'
   ```

2. **Si funciona**: Continuar con implementación de Wompi
3. **Si no funciona**: Obtener credenciales correctas desde panel.bold.co

## Referencias

- [Bold API Integrations](https://developers.bold.co/api-integrations/integration)
- [Wompi Payment Links](https://docs.wompi.co/en/docs/colombia/links-de-pago/)
- [Wompi Test Data](https://docs.wompi.co/en/docs/colombia/datos-de-prueba-en-sandbox/)
- [Bold Panel](https://panel.bold.co)

---

**Fecha:** 21 de Enero de 2026
**Conclusión:** Usar Wompi API para pagos online
**Estado:** Análisis completado, pendiente verificación de credenciales
