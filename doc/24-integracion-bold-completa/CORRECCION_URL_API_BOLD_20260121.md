# 🔧 Corrección: URL de API Bold

**Fecha:** 2026-01-21 06:40 UTC  
**Estado:** ✅ Corregido

---

## 🐛 Problema Detectado

Al intentar crear un link de pago, el sistema mostraba el siguiente error:

```
Error al crear link de pago: getaddrinfo ENOTFOUND sandbox-api.bold.co
```

### Causa del Error

La URL de la API de Bold en el `.env` estaba incorrecta:

```env
# ❌ INCORRECTO
BOLD_API_URL=https://sandbox-api.bold.co/v1
```

El servidor no podía resolver el DNS porque el dominio correcto es `api-sandbox.bold.co`, no `sandbox-api.bold.co`.

---

## ✅ Solución Aplicada

### URL Correcta de Bold Sandbox

```env
# ✅ CORRECTO
BOLD_API_URL=https://api-sandbox.bold.co/v1
```

### Cambios Realizados

1. **Actualizado `.env` en servidor de producción:**
   ```bash
   BOLD_API_URL=https://api-sandbox.bold.co/v1
   ```

2. **Actualizado `.env` local:**
   ```bash
   BOLD_API_URL=https://api-sandbox.bold.co/v1
   ```

3. **Backend reiniciado:**
   ```bash
   pm2 restart datagree-backend --update-env
   ```

---

## 📝 URLs Correctas de Bold

### Sandbox (Pruebas)
```
https://api-sandbox.bold.co/v1
```

### Producción
```
https://api.bold.co/v1
```

---

## 🧪 Verificación

### Probar Nuevamente

1. Ir a **Mis Facturas** en https://demo-estetica.datagree.net
2. Click en **"Pagar Ahora"** en una factura pendiente
3. Debería abrir el link de pago de Bold correctamente

### Ver Logs

```bash
# Conectar al servidor
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249

# Ver logs en tiempo real
pm2 logs datagree-backend

# Buscar mensajes de Bold
pm2 logs datagree-backend | grep "Bold"
```

### Logs Esperados

Después de la corrección, deberías ver:

```
✅ Link de pago creado: https://checkout-sandbox.bold.co/...
```

En lugar de:

```
❌ Error al crear link de pago en Bold: getaddrinfo ENOTFOUND
```

---

## 📊 Configuración Final

### Variables de Entorno Correctas

```env
# Bold Payment Gateway - SANDBOX
BOLD_API_KEY=1XVQAZsH297hGUuW4KAqmC
BOLD_SECRET_KEY=KWpgscWMWny3apOYs0Wvg
BOLD_MERCHANT_ID=0fhPQYC
BOLD_API_URL=https://api-sandbox.bold.co/v1  # ✅ CORREGIDO
BOLD_WEBHOOK_SECRET=KWpgscWMWny3apOYs0Wvg
BOLD_WEBHOOK_URL=https://datagree.net/api/webhooks/bold
BOLD_SUCCESS_URL=https://datagree.net/payment/success
BOLD_FAILURE_URL=https://datagree.net/payment/failure
```

---

## ⚠️ Nota Importante

### Para Migrar a Producción

Cuando estés listo para usar Bold en producción, cambiar:

```env
# Producción
BOLD_API_URL=https://api.bold.co/v1
BOLD_API_KEY=tu_api_key_de_produccion
BOLD_SECRET_KEY=tu_secret_key_de_produccion
BOLD_MERCHANT_ID=tu_merchant_id_de_produccion
```

**No olvidar actualizar también:**
- Webhook URL en el panel de Bold de producción
- Webhook Secret de producción

---

## ✅ Estado Actual

```
✅ URL de API corregida
✅ Backend reiniciado
✅ Sistema listo para crear links de pago
✅ Pruebas pueden continuar
```

---

## 🔗 Referencias

- **Documentación Bold:** https://docs.bold.co
- **API Sandbox:** https://api-sandbox.bold.co/v1
- **API Producción:** https://api.bold.co/v1

---

**Corregido por:** Kiro AI Assistant  
**Fecha:** 2026-01-21 06:40 UTC  
**Servidor:** datagree.net (100.28.198.249)
