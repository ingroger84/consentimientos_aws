# Guía: Cómo Obtener las Credenciales Correctas de Bold/Wompi - 21 Enero 2026

## Problema Actual

Las credenciales que tienes configuradas **NO son válidas**:
```
BOLD_API_KEY=1XVQAZsH297hGUuW4KAqmC
BOLD_SECRET_KEY=KWpgscWMWny3apOYs0Wvg  ❌ Token inválido
BOLD_MERCHANT_ID=0fhPQYC
```

**Error recibido**: `INVALID_ACCESS_TOKEN - La llave proporcionada no es válida`

## Solución: Obtener Credenciales Correctas

### Paso 1: Acceder al Panel de Bold

1. Ve a: **https://panel.bold.co**
2. Inicia sesión con tu cuenta de Bold Colombia
3. Asegúrate de tener permisos de administrador

### Paso 2: Navegar a Integraciones

1. En el menú lateral, busca **"Integraciones"**
2. Si no ves el menú, haz clic en el ícono de hamburguesa (☰)

### Paso 3: Activar Llaves (Si es Primera Vez)

1. Si es la primera vez, verás un botón **"Activar llaves"**
2. Haz clic en el botón
3. Espera unos segundos mientras se generan las llaves

### Paso 4: Seleccionar el Tipo Correcto de Integración

**MUY IMPORTANTE**: Bold tiene DOS tipos de integraciones diferentes:

#### Opción A: Botón de Pagos (Para Pagos Online) ✅ USAR ESTA

**Características**:
- Para pagos online sin datáfono
- Usa Wompi como procesador
- Permite crear payment links
- **Esta es la que necesitas**

**Llaves que verás**:
- **Public Key** (Llave Pública): Empieza con `pub_test_` o `pub_prod_`
- **Private Key** (Llave Privada): Empieza con `prv_test_` o `prv_prod_`

**Ejemplo de llaves válidas**:
```
Public Key (Test): pub_test_1XVQAZsH297hGUuW4KAqmC
Private Key (Test): prv_test_KWpgscWMWny3apOYs0Wvg
```

#### Opción B: API Integrations (Para Datáfonos) ❌ NO USAR

**Características**:
- Para conectar con datáfonos físicos
- Requiere comprar datáfonos Bold
- No sirve para pagos online
- **NO es lo que necesitas**

**Llave que verás**:
- **API Key**: Formato largo sin prefijo, ejemplo: `DZSkDqh2iWmpYQg204C2fLigQerhPGXAcm5WyujxwYH`

### Paso 5: Copiar las Llaves Correctas

1. Selecciona la pestaña **"Botón de Pagos"** o **"Payment Button"**
2. Verás dos ambientes:
   - **Pruebas (Sandbox)**: Para desarrollo y testing
   - **Producción**: Para transacciones reales

3. **Para empezar, usa el ambiente de PRUEBAS**:
   - Copia la **Public Key** (empieza con `pub_test_`)
   - Copia la **Private Key** (empieza con `prv_test_`)

### Paso 6: Actualizar las Variables de Entorno

#### En el Servidor (Producción)

```bash
# Conectarse al servidor
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249

# Editar el archivo .env
nano /home/ubuntu/consentimientos_aws/backend/.env

# Actualizar estas líneas:
BOLD_API_KEY=pub_test_TU_PUBLIC_KEY_AQUI
BOLD_SECRET_KEY=prv_test_TU_PRIVATE_KEY_AQUI
BOLD_API_URL=https://sandbox.wompi.co/v1

# Guardar: Ctrl+O, Enter, Ctrl+X
```

#### En ecosystem.config.js

```bash
# Editar ecosystem.config.js
nano /home/ubuntu/consentimientos_aws/ecosystem.config.js

# Buscar y actualizar:
BOLD_API_KEY: 'pub_test_TU_PUBLIC_KEY_AQUI',
BOLD_SECRET_KEY: 'prv_test_TU_PRIVATE_KEY_AQUI',
BOLD_API_URL: 'https://sandbox.wompi.co/v1',

# Guardar: Ctrl+O, Enter, Ctrl+X
```

#### En tu Proyecto Local

```bash
# Editar backend/.env
BOLD_API_KEY=pub_test_TU_PUBLIC_KEY_AQUI
BOLD_SECRET_KEY=prv_test_TU_PRIVATE_KEY_AQUI
BOLD_API_URL=https://sandbox.wompi.co/v1
```

### Paso 7: Reiniciar el Backend

```bash
# En el servidor
cd /home/ubuntu/consentimientos_aws
pm2 restart datagree-backend
```

### Paso 8: Probar la Integración

#### Prueba Manual con cURL

```bash
curl -X POST https://sandbox.wompi.co/v1/payment_links \
  -H "Authorization: Bearer prv_test_TU_PRIVATE_KEY_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Prueba de Integración",
    "description": "Test de payment link",
    "single_use": true,
    "currency": "COP",
    "amount_in_cents": 10000
  }'
```

**Respuesta esperada** (si las credenciales son correctas):
```json
{
  "data": {
    "id": "abc123",
    "name": "Prueba de Integración",
    "url": "https://checkout.wompi.co/l/abc123",
    ...
  }
}
```

#### Prueba desde la Interfaz

1. Inicia sesión en tu aplicación
2. Ve a "Mis Facturas"
3. Haz clic en "Pagar Ahora" en una factura
4. Deberías ver un link de pago de Wompi

## Tarjetas de Prueba (Sandbox)

Una vez que tengas las credenciales correctas, puedes probar con estas tarjetas:

### Transacción Aprobada ✅
```
Número: 4242 4242 4242 4242
Fecha: Cualquier fecha futura
CVV: Cualquier 3 dígitos
```

### Transacción Declinada ❌
```
Número: 4111 1111 1111 1111
Fecha: Cualquier fecha futura
CVV: Cualquier 3 dígitos
```

## Migración a Producción

Cuando estés listo para producción:

1. En panel.bold.co, cambia al ambiente de **Producción**
2. Copia las llaves de producción (empiezan con `pub_prod_` y `prv_prod_`)
3. Actualiza las variables de entorno:
   ```
   BOLD_API_KEY=pub_prod_TU_PUBLIC_KEY_AQUI
   BOLD_SECRET_KEY=prv_prod_TU_PRIVATE_KEY_AQUI
   BOLD_API_URL=https://production.wompi.co/v1
   ```
4. Reinicia el backend

## Troubleshooting

### Error: "INVALID_ACCESS_TOKEN"
- ✅ Verifica que copiaste la **Private Key** completa
- ✅ Asegúrate de que empiece con `prv_test_` o `prv_prod_`
- ✅ No uses la Public Key en el backend

### Error: "UNAUTHORIZED"
- ✅ Verifica que las llaves sean del ambiente correcto (test/prod)
- ✅ Asegúrate de que la URL coincida con el ambiente

### Error: "MERCHANT_NOT_FOUND"
- ✅ Las llaves son de otro comercio
- ✅ Verifica que iniciaste sesión con la cuenta correcta en panel.bold.co

## Resumen de Configuración Final

```env
# Sandbox (Pruebas)
BOLD_API_KEY=pub_test_XXXXXXXXXXXXXXXX
BOLD_SECRET_KEY=prv_test_XXXXXXXXXXXXXXXX
BOLD_API_URL=https://sandbox.wompi.co/v1
BOLD_WEBHOOK_SECRET=KWpgscWMWny3apOYs0Wvg
BOLD_SUCCESS_URL=https://datagree.net/payment/success
BOLD_FAILURE_URL=https://datagree.net/payment/failure
BOLD_WEBHOOK_URL=https://datagree.net/api/webhooks/bold

# Producción (cuando estés listo)
# BOLD_API_KEY=pub_prod_XXXXXXXXXXXXXXXX
# BOLD_SECRET_KEY=prv_prod_XXXXXXXXXXXXXXXX
# BOLD_API_URL=https://production.wompi.co/v1
```

## Contacto de Soporte

Si tienes problemas para obtener las credenciales:
- **Email**: soporte@bold.co
- **Panel**: https://panel.bold.co
- **Documentación**: https://developers.bold.co

---

**Fecha:** 21 de Enero de 2026
**Estado:** Guía completa para obtener credenciales
**Próximo paso:** Obtener credenciales correctas desde panel.bold.co
