# Configuración de Bold - Guía Completa

**Fecha**: 20 de Enero de 2026

---

## ¿Qué necesitas de Bold?

Para completar la integración, necesitas obtener las siguientes credenciales de Bold:

### 1. API Key (Llave de API)
- **Descripción**: Llave pública para autenticar las peticiones a la API de Bold
- **Dónde obtenerla**: Panel de Bold > Configuración > API > Generar API Key
- **Formato**: `bold_live_xxxxxxxxxxxxxxxx` o `bold_test_xxxxxxxxxxxxxxxx`

### 2. Secret Key (Llave Secreta)
- **Descripción**: Llave privada para firmar peticiones sensibles
- **Dónde obtenerla**: Panel de Bold > Configuración > API > Secret Key
- **Formato**: `sk_live_xxxxxxxxxxxxxxxx` o `sk_test_xxxxxxxxxxxxxxxx`
- **⚠️ IMPORTANTE**: Nunca compartas esta llave ni la expongas en el frontend

### 3. Merchant ID (ID de Comercio)
- **Descripción**: Identificador único de tu cuenta de comercio en Bold
- **Dónde obtenerlo**: Panel de Bold > Configuración > Información del Comercio
- **Formato**: Número o string único

### 4. Webhook Secret (Secreto de Webhooks)
- **Descripción**: Llave para validar que los webhooks vienen de Bold
- **Dónde obtenerlo**: Panel de Bold > Configuración > Webhooks > Crear Webhook
- **Formato**: String aleatorio generado por Bold

---

## Pasos para Configurar Bold

### Paso 1: Crear Cuenta en Bold

1. Ve a [https://bold.co](https://bold.co)
2. Haz clic en "Registrarse" o "Crear cuenta"
3. Completa el formulario con los datos de tu empresa
4. Verifica tu email
5. Completa el proceso de verificación de identidad (KYC)

### Paso 2: Obtener Credenciales de API

1. Inicia sesión en el panel de Bold
2. Ve a **Configuración** > **Desarrolladores** > **API**
3. Haz clic en **"Generar API Key"**
4. Guarda la **API Key** y **Secret Key** en un lugar seguro
5. Copia tu **Merchant ID** desde la sección de información del comercio

### Paso 3: Configurar Webhooks

1. En el panel de Bold, ve a **Configuración** > **Webhooks**
2. Haz clic en **"Crear Webhook"**
3. Configura el webhook con los siguientes datos:

```
URL del Webhook: https://tudominio.com/api/webhooks/bold
Eventos a escuchar:
  ✓ payment.succeeded (Pago exitoso)
  ✓ payment.failed (Pago fallido)
  ✓ payment.pending (Pago pendiente)
```

4. Guarda el **Webhook Secret** que Bold te proporciona

### Paso 4: Configurar Variables de Entorno

1. Abre el archivo `backend/.env`
2. Agrega las siguientes variables con tus credenciales:

```env
# Bold Payment Gateway
BOLD_API_KEY=bold_live_tu_api_key_aqui
BOLD_SECRET_KEY=sk_live_tu_secret_key_aqui
BOLD_MERCHANT_ID=tu_merchant_id_aqui
BOLD_API_URL=https://api.bold.co/v1
BOLD_WEBHOOK_SECRET=tu_webhook_secret_aqui

# URLs para Bold
BOLD_SUCCESS_URL=https://tudominio.com/payment/success
BOLD_FAILURE_URL=https://tudominio.com/payment/failure
BOLD_WEBHOOK_URL=https://tudominio.com/api/webhooks/bold
```

### Paso 5: Aplicar Migración de Base de Datos

1. Abre PowerShell en la carpeta `backend`
2. Ejecuta el script de migración:

```powershell
.\apply-bold-migration.ps1
```

3. Verifica que la migración se aplicó correctamente

### Paso 6: Reiniciar el Backend

```powershell
npm run start:dev
```

---

## Ambiente de Pruebas (Sandbox)

Bold proporciona un ambiente de pruebas para desarrollo:

### Credenciales de Sandbox

```env
BOLD_API_KEY=bold_test_xxxxxxxxxxxxxxxx
BOLD_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxx
BOLD_API_URL=https://sandbox-api.bold.co/v1
```

### Tarjetas de Prueba

Para probar pagos en el ambiente de sandbox, usa estas tarjetas:

#### Pago Aprobado
```
Número: 4242 4242 4242 4242
CVV: 123
Fecha: Cualquier fecha futura
```

#### Pago Rechazado
```
Número: 4000 0000 0000 0002
CVV: 123
Fecha: Cualquier fecha futura
```

#### Fondos Insuficientes
```
Número: 4000 0000 0000 9995
CVV: 123
Fecha: Cualquier fecha futura
```

---

## Verificar Configuración

### 1. Test de Conexión con Bold

Puedes verificar que la configuración es correcta ejecutando:

```bash
curl -X GET http://localhost:3000/api/payments/test-bold-connection
```

Deberías recibir:
```json
{
  "success": true,
  "message": "Conexión exitosa con Bold"
}
```

### 2. Verificar Webhooks

Para verificar que los webhooks están configurados correctamente:

1. Crea una factura de prueba
2. Genera un link de pago
3. Realiza un pago de prueba
4. Verifica que el webhook se recibe en los logs del backend

---

## Información Adicional de Bold

### Métodos de Pago Soportados

Bold soporta los siguientes métodos de pago en Colombia:

- ✅ **Tarjetas de Crédito**: Visa, Mastercard, American Express
- ✅ **Tarjetas de Débito**: Visa Débito, Mastercard Débito
- ✅ **PSE**: Pagos Seguros en Línea (todos los bancos colombianos)
- ✅ **Nequi**: Pagos con Nequi
- ✅ **Bancolombia Transfer Button**: Transferencias desde Bancolombia
- ✅ **Efecty**: Pagos en efectivo en puntos Efecty

### Comisiones de Bold

Bold cobra una comisión por cada transacción exitosa:

- **Tarjetas de crédito**: 2.99% + $900 COP
- **Tarjetas de débito**: 1.99% + $900 COP
- **PSE**: 1.49% + $900 COP
- **Nequi**: 1.49% + $900 COP

*Nota: Las comisiones pueden variar según tu plan con Bold*

### Tiempos de Acreditación

- **Tarjetas**: Inmediato (disponible en tu cuenta Bold)
- **PSE**: 1-2 días hábiles
- **Nequi**: Inmediato

### Límites de Transacción

- **Mínimo**: $1,000 COP
- **Máximo**: $50,000,000 COP por transacción

---

## Soporte de Bold

Si tienes problemas con la configuración o necesitas ayuda:

- **Email**: soporte@bold.co
- **Teléfono**: +57 (1) 234 5678
- **Chat**: Disponible en el panel de Bold
- **Documentación**: https://ayuda.bold.co

---

## Checklist de Configuración

Antes de pasar a producción, verifica que:

- [ ] Tienes las credenciales de producción de Bold
- [ ] Las variables de entorno están configuradas correctamente
- [ ] La migración de base de datos se aplicó exitosamente
- [ ] Los webhooks están configurados en Bold
- [ ] El webhook URL es accesible públicamente (HTTPS)
- [ ] Has probado crear un link de pago
- [ ] Has probado recibir un webhook
- [ ] Has verificado que los pagos se aplican correctamente
- [ ] Has probado la suspensión y activación automática de tenants

---

## Próximos Pasos

Una vez configurado Bold:

1. ✅ Aplicar migración de base de datos
2. ✅ Configurar variables de entorno
3. ✅ Reiniciar backend
4. 🚧 Probar creación de links de pago
5. 🚧 Probar recepción de webhooks
6. 🚧 Implementar interfaz de usuario
7. 🚧 Desplegar a producción

---

**¿Necesitas ayuda?** Contacta al equipo de desarrollo o consulta la documentación de Bold.
