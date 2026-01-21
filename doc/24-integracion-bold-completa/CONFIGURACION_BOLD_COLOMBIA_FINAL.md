# Configuración Bold Colombia - Actualización Final

## ✅ Credenciales Correctas Obtenidas

### Llaves de Pruebas (Botón de Pagos)

```env
# Llave de identidad
BOLD_API_KEY=g72LcD8iISN-PjURFfTq8UQU_2aizz5VclkaAfMdOuE

# Llave secreta
BOLD_SECRET_KEY=IKi1koNT7pUK1uTRf4vYOQ

# Merchant ID
BOLD_MERCHANT_ID=2M0MTRAD37

# URL Base (según documentación de Bold)
BOLD_API_URL=https://api.online.payments.bold.co

# Webhook Secret
BOLD_WEBHOOK_SECRET=g72LcD8iISN-PjURFfTq8UQU_2aizz5VclkaAfMdOuE
```

## 📝 Configuración Actualizada

### Archivo `.env` actualizado:
✅ Credenciales correctas del Botón de Pagos
✅ URL corregida (payments, no peyments)
✅ Llaves del ambiente de pruebas

### Servicio `bold.service.ts` actualizado:
✅ Usa `x-api-key` para autenticación
✅ URL base correcta
✅ Estructura de payload adaptada

## ⚠️ Pendiente

Necesitamos confirmar de la documentación de Bold:

1. **Endpoint correcto** para crear intención de pago
   - ¿Es `/payment-intent`?
   - ¿Es `/v1/payment-intent`?
   - ¿Otro endpoint?

2. **Estructura del payload**
   - ¿Qué campos son requeridos?
   - ¿Qué formato espera Bold?

3. **Header de autenticación**
   - ¿Es `x-api-key`?
   - ¿Es `Authorization`?
   - ¿Otro header?

## 📚 Próximos Pasos

1. Revisar la documentación de Bold para el endpoint exacto
2. Probar la creación de intención de pago
3. Verificar la respuesta de Bold
4. Actualizar el código según la respuesta

---

**Fecha**: 21 de Enero de 2026  
**Estado**: Credenciales correctas obtenidas, pendiente confirmar endpoint
