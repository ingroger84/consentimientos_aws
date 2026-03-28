# 🚀 Despliegue v73.5 - Bold API Link de Pagos

**Fecha**: 25 de Marzo 2026  
**Estado**: ✅ IMPLEMENTADO - LISTO PARA DESPLEGAR

---

## 📋 Resumen de Cambios

### Problema Resuelto:
- v73.3 y v73.4 usaban endpoints incorrectos y servicios diferentes (Wompi)
- La integración NO funcionaba correctamente

### Solución Implementada:
- Integración correcta con Bold API Link de Pagos (documentación oficial)
- Endpoint correcto: `POST /online/link/v1`
- URL base correcta: `https://integrations.api.bold.co`
- NO requiere datáfono físico

---

## ✅ Cambios Realizados

### 1. Archivo `.env`
```bash
# ❌ ANTES
BOLD_API_URL=https://api.online.payments.bold.co

# ✅ AHORA
BOLD_API_URL=https://integrations.api.bold.co
```

### 2. Archivo `backend/src/payments/bold.service.ts`
- ✅ Reescrito método `createPaymentLink` completo
- ✅ Actualizado método `getPaymentStatus`
- ✅ Actualizado método `testConnection`
- ✅ Actualizado método `cancelPaymentLink` (no soportado por API)
- ✅ Eliminado código de Wompi
- ✅ Implementado según documentación oficial

### 3. Versiones Actualizadas
- ✅ `backend/package.json`: 73.5.0
- ✅ `backend/src/config/version.ts`: 73.5.0
- ✅ `frontend/package.json`: 73.5.0
- ✅ `frontend/src/config/version.ts`: 73.5.0

### 4. Backend Compilado
- ✅ `npm run build` ejecutado exitosamente
- ✅ Archivos en `backend/dist/` listos para desplegar

---

## 🧪 Pruebas Locales

### Ejecutar Script de Prueba:
```bash
cd backend
node test-bold-api-link-pagos.js
```

### Resultado Esperado:
```
✅ Métodos de pago disponibles:
   CREDIT_CARD: Min: $1,000 COP, Max: $5,000,000 COP
   PSE: Min: $1,000 COP, Max: $5,000,000 COP
   BOTON_BANCOLOMBIA: Min: $1,000 COP, Max: $10,000,000 COP
   NEQUI: Min: $1,000 COP, Max: $10,000,000 COP

✅ Link de pago creado exitosamente
   Payment Link ID: LNK_xxx
   URL: https://checkout.bold.co/LNK_xxx
```

---

## 📦 Despliegue a Servidor

### Paso 1: Actualizar `.env` en Servidor
```bash
ssh ubuntu@100.28.198.249

# Editar .env
nano /home/ubuntu/consentimientos_aws/backend/.env

# Cambiar esta línea:
# BOLD_API_URL=https://api.online.payments.bold.co
# Por:
BOLD_API_URL=https://integrations.api.bold.co

# Guardar: Ctrl+O, Enter, Ctrl+X
```

### Paso 2: Copiar Backend Compilado
```powershell
# Desde tu máquina local
cd E:\PROJECTS\CONSENTIMIENTOS_2025_1.3_FUNCIONAL_LOCAL

# Crear archivo comprimido
Compress-Archive -Path backend\dist\* -DestinationPath backend-dist-v73.5-bold-api-link-pagos.zip -Force

# Copiar a servidor
scp backend-dist-v73.5-bold-api-link-pagos.zip ubuntu@100.28.198.249:/home/ubuntu/

# Conectar al servidor
ssh ubuntu@100.28.198.249
```

### Paso 3: Desplegar en Servidor
```bash
# En el servidor
cd /home/ubuntu

# Hacer backup del dist actual
mv consentimientos_aws/backend/dist consentimientos_aws/backend/dist.v73.4.backup

# Crear nuevo directorio dist
mkdir -p consentimientos_aws/backend/dist

# Descomprimir nueva versión
unzip -o backend-dist-v73.5-bold-api-link-pagos.zip -d consentimientos_aws/backend/dist/

# Verificar archivos
ls -la consentimientos_aws/backend/dist/

# Reiniciar PM2 con variables de entorno actualizadas
pm2 restart datagree --update-env

# Verificar logs
pm2 logs datagree --lines 50
```

### Paso 4: Verificar Despliegue
```bash
# Verificar que el servicio esté corriendo
pm2 status

# Verificar logs en tiempo real
pm2 logs datagree

# Buscar mensaje de inicio
# Debe aparecer: "✅ Bold Service inicializado"
# Debe aparecer: "API URL: https://integrations.api.bold.co"
```

---

## 🧪 Pruebas en Producción

### Prueba 1: Crear Factura y Link de Pago
1. Ir a https://demo-estetica.archivoenlinea.com
2. Iniciar sesión como administrador
3. Ir a "Facturación" → "Facturas"
4. Crear una factura de prueba
5. Hacer clic en "Pagar"
6. Verificar que se crea el link de pago
7. Verificar que se redirige a `https://checkout.bold.co/LNK_xxx`

### Prueba 2: Completar Pago
1. En la página de Bold, seleccionar método de pago
2. Usar datos de prueba de Bold:
   - Tarjeta: 4111111111111111
   - CVV: 123
   - Fecha: Cualquier fecha futura
3. Completar el pago
4. Verificar redirección a callback_url

### Prueba 3: Verificar Webhook
1. Verificar que el webhook recibe la notificación
2. Verificar logs del servidor:
   ```bash
   pm2 logs datagree | grep "SALE_APPROVED"
   ```
3. Verificar que la factura se marca como pagada
4. Verificar que el tenant se activa (si estaba suspendido)

---

## 📊 Verificación de Logs

### Logs Esperados en el Servidor:

#### Al Iniciar:
```
✅ Bold Service inicializado
   API URL: https://integrations.api.bold.co
   API Key: 1XVOAZHZ87fuDLuWzK...
   Merchant ID: 2M0MTRAD37
```

#### Al Crear Link de Pago:
```
Creando link de pago Bold para: INV-202603-5324-1234567890
📤 Request a Bold API Link de Pagos:
{
  "amount_type": "CLOSE",
  "amount": {
    "currency": "COP",
    "total_amount": 100000,
    "taxes": [],
    "tip_amount": 0
  },
  "description": "Factura INV-202603-5324",
  "reference": "INV-202603-5324-1234567890",
  "callback_url": "https://demo-estetica.archivoenlinea.com/...",
  "payer_email": "cliente@email.com"
}
✅ Link de pago creado exitosamente
   Payment Link ID: LNK_H7S4xxx
   URL: https://checkout.bold.co/LNK_H7S4xxx
```

#### Al Recibir Webhook:
```
Procesando webhook de Bold: SALE_APPROVED
   Transaction ID: TXNFD76543
   Reference: INV-202603-5324-1234567890
   Status: APPROVED
```

---

## ⚠️ Troubleshooting

### Error: "Error al crear link de pago"
**Causa**: URL base incorrecta o credenciales inválidas

**Solución**:
1. Verificar `.env` en servidor
2. Verificar que `BOLD_API_URL=https://integrations.api.bold.co`
3. Reiniciar PM2: `pm2 restart datagree --update-env`

### Error: "callback_url: invalid or missing URL scheme"
**Causa**: Variable `FRONTEND_URL` no definida

**Solución**:
1. Verificar `.env` en servidor
2. Agregar: `FRONTEND_URL=https://demo-estetica.archivoenlinea.com`
3. Reiniciar PM2: `pm2 restart datagree --update-env`

### Error: "Unauthorized" o 403
**Causa**: API Key incorrecta o formato de autenticación incorrecto

**Solución**:
1. Verificar `BOLD_API_KEY` en `.env`
2. Verificar formato: `Authorization: x-api-key <llave>`
3. Verificar que la llave sea de prueba o producción según ambiente

---

## 📚 Documentación de Referencia

- **Bold API Link de Pagos**: https://developers.bold.co/pagos-en-linea/api-link-de-pagos
- **Esquema de Datos**: https://developers.bold.co/pagos-en-linea/api-de-pagos-en-linea/esquema-de-datos
- **Webhook**: https://developers.bold.co/webhook

---

## ✅ Checklist de Despliegue

- [x] Actualizar `.env` local
- [x] Reescribir `bold.service.ts`
- [x] Actualizar versiones (73.5.0)
- [x] Compilar backend (`npm run build`)
- [x] Crear script de prueba
- [ ] Actualizar `.env` en servidor
- [ ] Copiar backend compilado a servidor
- [ ] Reiniciar PM2
- [ ] Verificar logs
- [ ] Probar crear link de pago
- [ ] Probar completar pago
- [ ] Verificar webhook
- [ ] Verificar factura pagada

---

## 🎯 Resultado Esperado

Después del despliegue:

1. ✅ Los usuarios pueden hacer clic en "Pagar" en una factura
2. ✅ Se crea un link de pago en Bold automáticamente
3. ✅ Se redirige a `https://checkout.bold.co/LNK_xxx`
4. ✅ El usuario ve la página de pago de Bold con múltiples métodos
5. ✅ El usuario completa el pago
6. ✅ Bold envía notificación al webhook
7. ✅ La factura se marca como pagada automáticamente
8. ✅ El tenant se activa si estaba suspendido

---

**Última actualización**: 25 de Marzo 2026  
**Estado**: ✅ LISTO PARA DESPLEGAR
