# Pasos para Configurar Bold en Localhost

**Fecha**: 20 de Enero de 2026  
**Tiempo estimado**: 15 minutos

---

## 📋 Checklist Rápido

- [ ] Instalar ngrok
- [ ] Configurar authtoken de ngrok
- [ ] Iniciar ngrok
- [ ] Obtener credenciales de Bold (sandbox)
- [ ] Configurar variables de entorno
- [ ] Configurar webhook en Bold
- [ ] Aplicar migración de BD
- [ ] Reiniciar backend
- [ ] Probar

---

## Paso 1: Instalar ngrok (5 minutos)

### Opción A: Descargar Manualmente

1. Ve a [https://ngrok.com/download](https://ngrok.com/download)
2. Descarga la versión para Windows
3. Descomprime `ngrok.exe` en `C:\ngrok`

### Opción B: Con Chocolatey (Recomendado)

```powershell
choco install ngrok
```

### Opción C: Con Scoop

```powershell
scoop install ngrok
```

---

## Paso 2: Configurar ngrok (2 minutos)

1. Crea cuenta gratuita en [https://dashboard.ngrok.com/signup](https://dashboard.ngrok.com/signup)
2. Ve a [https://dashboard.ngrok.com/get-started/your-authtoken](https://dashboard.ngrok.com/get-started/your-authtoken)
3. Copia tu authtoken
4. Ejecuta en PowerShell:

```powershell
ngrok config add-authtoken TU_AUTHTOKEN_AQUI
```

---

## Paso 3: Iniciar ngrok (1 minuto)

### Opción A: Usar el Script Automático (Recomendado)

```powershell
.\start-dev-with-ngrok.ps1
```

Este script:
- ✅ Inicia ngrok automáticamente
- ✅ Muestra la URL pública
- ✅ Copia la URL del webhook al portapapeles
- ✅ Inicia el backend

### Opción B: Manual

```powershell
# Terminal 1: Iniciar ngrok
ngrok http 3000

# Copia la URL que aparece (ej: https://abc123.ngrok-free.app)

# Terminal 2: Iniciar backend
cd backend
npm run start:dev
```

---

## Paso 4: Obtener Credenciales de Bold (5 minutos)

Pásame las siguientes credenciales del ambiente de **PRUEBAS/SANDBOX**:

```
BOLD_API_KEY=bold_test_...
BOLD_SECRET_KEY=sk_test_...
BOLD_MERCHANT_ID=...
BOLD_WEBHOOK_SECRET=... (lo obtienes al crear el webhook)
```

---

## Paso 5: Configurar Variables de Entorno (2 minutos)

Edita `backend/.env` y agrega:

```env
# Bold Payment Gateway - SANDBOX/PRUEBAS
BOLD_API_KEY=bold_test_tu_api_key_aqui
BOLD_SECRET_KEY=sk_test_tu_secret_key_aqui
BOLD_MERCHANT_ID=tu_merchant_id_aqui
BOLD_API_URL=https://sandbox-api.bold.co/v1
BOLD_WEBHOOK_SECRET=pendiente_hasta_crear_webhook

# URLs para Bold
BOLD_SUCCESS_URL=http://localhost:5173/payment/success
BOLD_FAILURE_URL=http://localhost:5173/payment/failure
BOLD_WEBHOOK_URL=https://TU_URL_DE_NGROK.ngrok-free.app/api/webhooks/bold
```

**⚠️ IMPORTANTE**: Reemplaza `TU_URL_DE_NGROK` con la URL que te dio ngrok.

---

## Paso 6: Configurar Webhook en Bold (3 minutos)

1. Inicia sesión en el panel de Bold (ambiente de **PRUEBAS**)
2. Ve a **Configuración** > **Webhooks**
3. Haz clic en **"Crear Webhook"**
4. Configura:

```
Nombre: Webhook Desarrollo Local
URL: https://TU_URL_DE_NGROK.ngrok-free.app/api/webhooks/bold
Método: POST

Eventos:
  ✓ payment.succeeded
  ✓ payment.failed
  ✓ payment.pending
```

5. Guarda y copia el **Webhook Secret**
6. Actualiza `BOLD_WEBHOOK_SECRET` en `backend/.env`

---

## Paso 7: Aplicar Migración de BD (1 minuto)

```powershell
cd backend
.\apply-bold-migration.ps1
```

Deberías ver:

```
✓ Migración aplicada exitosamente

Columnas agregadas:
  • invoices.bold_payment_link
  • invoices.bold_transaction_id
  • invoices.bold_payment_reference
  • payments.bold_transaction_id
  • payments.bold_payment_method
  • payments.bold_payment_data
```

---

## Paso 8: Reiniciar Backend (1 minuto)

Si usaste el script automático, el backend ya está corriendo.

Si no, ejecuta:

```powershell
cd backend
npm run start:dev
```

---

## Paso 9: Verificar que Funciona (2 minutos)

### 1. Verificar ngrok

Abre en tu navegador: [http://localhost:4040](http://localhost:4040)

Deberías ver el dashboard de ngrok.

### 2. Verificar backend

Abre en tu navegador: [http://localhost:3000/api](http://localhost:3000/api)

Deberías ver la documentación de la API.

### 3. Probar webhook (Opcional)

Desde PowerShell:

```powershell
$ngrokUrl = "https://TU_URL_DE_NGROK.ngrok-free.app"

curl -X POST "$ngrokUrl/api/webhooks/bold" `
  -H "Content-Type: application/json" `
  -H "x-bold-signature: test" `
  -d '{\"event\":\"test\"}'
```

Deberías ver la petición en:
- Dashboard de ngrok (http://localhost:4040)
- Logs del backend

---

## 🎉 ¡Listo!

Ahora tu entorno está configurado para recibir webhooks de Bold en localhost.

---

## Próximos Pasos

Una vez configurado, necesito completar:

1. **Métodos faltantes en InvoicesService**:
   - `findByReference()` - Buscar factura por referencia
   - `createPaymentLink()` - Crear link de pago en Bold
   - `activateTenantAfterPayment()` - Activar tenant
   - `sendPaymentConfirmation()` - Enviar email de confirmación

2. **Cron Job** para suspensión automática

3. **Frontend** para mostrar links de pago

---

## Notas Importantes

### URL de ngrok Cambia

Si reinicias ngrok, la URL cambia. Debes:
1. Actualizar `BOLD_WEBHOOK_URL` en `.env`
2. Actualizar la URL del webhook en Bold
3. Reiniciar el backend

**Solución**: Mantén ngrok corriendo mientras desarrollas.

### Plan Gratuito de ngrok

- ✅ Túneles ilimitados
- ✅ HTTPS automático
- ❌ URL cambia cada vez
- ❌ Límite de 40 conexiones/minuto

Para desarrollo está perfecto. En producción no necesitarás ngrok.

---

## Troubleshooting

### ngrok no inicia

**Error**: `ngrok: command not found`

**Solución**: Usa la ruta completa:
```powershell
C:\ngrok\ngrok.exe http 3000
```

### Backend no recibe webhooks

**Checklist**:
1. ✓ ngrok está corriendo
2. ✓ Backend está corriendo
3. ✓ URL en Bold es correcta
4. ✓ URL incluye `/api/webhooks/bold`
5. ✓ Verifica en dashboard de ngrok

### Error 401 en webhook

**Causa**: Firma inválida

**Solución**: Verifica que `BOLD_WEBHOOK_SECRET` coincide con Bold.

---

## ¿Necesitas Ayuda?

1. **Documentación completa**: `doc/22-integracion-bold/CONFIGURACION_LOCALHOST.md`
2. **Configuración de Bold**: `doc/22-integracion-bold/CONFIGURACION_BOLD.md`
3. **Resumen de integración**: `INTEGRACION_BOLD_20260120.md`

---

## Resumen Visual

```
┌─────────────────┐
│   Bold API      │
│  (Sandbox)      │
└────────┬────────┘
         │
         │ Webhook HTTPS
         ▼
┌─────────────────┐
│     ngrok       │
│ abc123.ngrok... │
└────────┬────────┘
         │
         │ HTTP
         ▼
┌─────────────────┐
│   localhost     │
│   :3000         │
│  (Backend)      │
└─────────────────┘
```

---

**¿Listo para empezar?** Pásame las credenciales de Bold y continuamos.
