# Configuración de Bold en Localhost con ngrok

**Fecha**: 20 de Enero de 2026

---

## Problema: Webhooks en Localhost

Bold necesita enviar webhooks a tu servidor, pero tu servidor está en `localhost:3000`, que no es accesible desde internet.

**Solución**: Usar **ngrok** para crear un túnel público que apunte a tu localhost.

---

## Paso 1: Instalar ngrok

### Opción A: Descargar desde el sitio web

1. Ve a [https://ngrok.com/download](https://ngrok.com/download)
2. Descarga la versión para Windows
3. Descomprime el archivo `ngrok.exe` en una carpeta (ej: `C:\ngrok`)
4. Agrega la carpeta al PATH de Windows (opcional)

### Opción B: Instalar con Chocolatey

```powershell
choco install ngrok
```

### Opción C: Instalar con Scoop

```powershell
scoop install ngrok
```

---

## Paso 2: Crear Cuenta en ngrok (Gratis)

1. Ve a [https://dashboard.ngrok.com/signup](https://dashboard.ngrok.com/signup)
2. Crea una cuenta gratuita
3. Ve a [https://dashboard.ngrok.com/get-started/your-authtoken](https://dashboard.ngrok.com/get-started/your-authtoken)
4. Copia tu authtoken

---

## Paso 3: Configurar ngrok

Abre PowerShell y ejecuta:

```powershell
ngrok config add-authtoken TU_AUTHTOKEN_AQUI
```

---

## Paso 4: Iniciar el Túnel

### Opción A: Túnel Simple (se cierra al cerrar la terminal)

```powershell
ngrok http 3000
```

### Opción B: Túnel con Subdominio Personalizado (Plan Paid)

```powershell
ngrok http 3000 --subdomain=tuempresa
```

Verás algo como esto:

```
ngrok

Session Status                online
Account                       tu-email@example.com
Version                       3.x.x
Region                        United States (us)
Latency                       45ms
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:3000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**¡IMPORTANTE!** Copia la URL de `Forwarding`, por ejemplo: `https://abc123.ngrok-free.app`

---

## Paso 5: Configurar Variables de Entorno

Edita `backend/.env` y agrega las credenciales de Bold (ambiente de pruebas):

```env
# Bold Payment Gateway - SANDBOX/PRUEBAS
BOLD_API_KEY=bold_test_tu_api_key_aqui
BOLD_SECRET_KEY=sk_test_tu_secret_key_aqui
BOLD_MERCHANT_ID=tu_merchant_id_aqui
BOLD_API_URL=https://sandbox-api.bold.co/v1
BOLD_WEBHOOK_SECRET=tu_webhook_secret_aqui

# URLs para Bold - Usar URL de ngrok
BOLD_SUCCESS_URL=http://localhost:5173/payment/success
BOLD_FAILURE_URL=http://localhost:5173/payment/failure
BOLD_WEBHOOK_URL=https://abc123.ngrok-free.app/api/webhooks/bold
```

**⚠️ IMPORTANTE**: Reemplaza `https://abc123.ngrok-free.app` con tu URL de ngrok.

---

## Paso 6: Configurar Webhook en Bold

1. Inicia sesión en el panel de Bold (ambiente de pruebas)
2. Ve a **Configuración** > **Webhooks** > **Crear Webhook**
3. Configura el webhook:

```
URL del Webhook: https://abc123.ngrok-free.app/api/webhooks/bold

Eventos a escuchar:
  ✓ payment.succeeded
  ✓ payment.failed
  ✓ payment.pending

Método: POST
```

4. Guarda el **Webhook Secret** que Bold te proporciona
5. Actualiza `BOLD_WEBHOOK_SECRET` en tu `.env`

---

## Paso 7: Aplicar Migración de Base de Datos

```powershell
cd backend
.\apply-bold-migration.ps1
```

---

## Paso 8: Reiniciar el Backend

```powershell
npm run start:dev
```

---

## Paso 9: Verificar que Funciona

### 1. Verificar que ngrok está funcionando

Abre en tu navegador: `http://127.0.0.1:4040`

Verás el dashboard de ngrok donde puedes ver todas las peticiones HTTP que llegan.

### 2. Probar el endpoint de webhook

Desde otra terminal, ejecuta:

```powershell
curl -X POST https://abc123.ngrok-free.app/api/webhooks/bold `
  -H "Content-Type: application/json" `
  -H "x-bold-signature: test" `
  -d '{\"event\":\"test\"}'
```

Deberías ver la petición en el dashboard de ngrok y en los logs del backend.

---

## Flujo Completo de Desarrollo

```
┌─────────────────┐
│   Bold API      │
│  (Sandbox)      │
└────────┬────────┘
         │
         │ HTTPS Webhook
         ▼
┌─────────────────┐
│     ngrok       │
│  (Túnel)        │
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

## Consejos Importantes

### 1. ngrok Gratuito vs Paid

**Plan Gratuito**:
- ✅ Túneles ilimitados
- ✅ HTTPS automático
- ❌ URL cambia cada vez que reinicias ngrok
- ❌ Límite de 40 conexiones/minuto

**Plan Paid ($8/mes)**:
- ✅ Subdominio personalizado fijo
- ✅ Sin límite de conexiones
- ✅ Múltiples túneles simultáneos

### 2. URL de ngrok Cambia

Si usas el plan gratuito, cada vez que reinicias ngrok obtienes una URL diferente.

**Solución**:
1. Mantén ngrok corriendo mientras desarrollas
2. O actualiza la URL en Bold cada vez que cambies

### 3. Mantener ngrok Corriendo

Para mantener ngrok corriendo en segundo plano:

```powershell
# Opción 1: Usar Start-Process
Start-Process ngrok -ArgumentList "http 3000" -WindowStyle Minimized

# Opción 2: Crear un script
# Guarda esto en start-ngrok.ps1
ngrok http 3000
```

### 4. Ver Logs de Webhooks

El dashboard de ngrok (`http://127.0.0.1:4040`) te muestra:
- Todas las peticiones HTTP
- Headers completos
- Body de las peticiones
- Respuestas del servidor

Esto es muy útil para debugging.

---

## Alternativas a ngrok

### 1. localtunnel

```powershell
npm install -g localtunnel
lt --port 3000
```

### 2. serveo

```bash
ssh -R 80:localhost:3000 serveo.net
```

### 3. Cloudflare Tunnel (Gratis y Permanente)

```powershell
# Instalar
winget install --id Cloudflare.cloudflared

# Crear túnel
cloudflared tunnel --url http://localhost:3000
```

---

## Troubleshooting

### Error: "ngrok not found"

**Solución**: Asegúrate de que ngrok.exe está en el PATH o usa la ruta completa:

```powershell
C:\ngrok\ngrok.exe http 3000
```

### Error: "Invalid authtoken"

**Solución**: Verifica que copiaste correctamente el authtoken:

```powershell
ngrok config add-authtoken TU_AUTHTOKEN_AQUI
```

### Webhook no llega al backend

**Checklist**:
1. ✓ ngrok está corriendo
2. ✓ Backend está corriendo en puerto 3000
3. ✓ URL de webhook en Bold es correcta
4. ✓ URL incluye `/api/webhooks/bold`
5. ✓ Verifica en dashboard de ngrok si llega la petición

### Error 401 en webhook

**Causa**: Firma de webhook inválida

**Solución**: Verifica que `BOLD_WEBHOOK_SECRET` en `.env` coincide con el secret de Bold.

---

## Pasar a Producción

Cuando estés listo para producción:

1. **Desplegar backend a un servidor con dominio público**
   - Heroku, AWS, DigitalOcean, etc.
   - Ejemplo: `https://api.tuempresa.com`

2. **Actualizar variables de entorno**
   ```env
   BOLD_API_KEY=bold_live_...
   BOLD_SECRET_KEY=sk_live_...
   BOLD_API_URL=https://api.bold.co/v1
   BOLD_WEBHOOK_URL=https://api.tuempresa.com/api/webhooks/bold
   ```

3. **Actualizar webhook en Bold**
   - Cambiar de sandbox a producción
   - Actualizar URL del webhook

4. **Ya no necesitas ngrok** 🎉

---

## Script de Inicio Rápido

Crea un archivo `start-dev-with-ngrok.ps1`:

```powershell
# Iniciar ngrok en segundo plano
Write-Host "Iniciando ngrok..." -ForegroundColor Cyan
Start-Process ngrok -ArgumentList "http 3000" -WindowStyle Minimized

# Esperar 3 segundos para que ngrok inicie
Start-Sleep -Seconds 3

# Obtener URL de ngrok
$ngrokUrl = (Invoke-WebRequest -Uri "http://localhost:4040/api/tunnels" | ConvertFrom-Json).tunnels[0].public_url

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ngrok URL: $ngrokUrl" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Configura este URL en Bold:" -ForegroundColor Cyan
Write-Host "  $ngrokUrl/api/webhooks/bold" -ForegroundColor White
Write-Host ""

# Iniciar backend
Write-Host "Iniciando backend..." -ForegroundColor Cyan
cd backend
npm run start:dev
```

Luego solo ejecuta:

```powershell
.\start-dev-with-ngrok.ps1
```

---

## Resumen

1. ✅ Instala ngrok
2. ✅ Crea cuenta y obtén authtoken
3. ✅ Ejecuta `ngrok http 3000`
4. ✅ Copia la URL de ngrok
5. ✅ Configura webhook en Bold con esa URL
6. ✅ Actualiza `BOLD_WEBHOOK_URL` en `.env`
7. ✅ Aplica migración de BD
8. ✅ Reinicia backend
9. ✅ ¡Listo para probar!

---

**¿Necesitas ayuda?** Avísame cuando tengas ngrok corriendo y te ayudo con el resto.
