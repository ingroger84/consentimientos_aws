# Diagnóstico de Credenciales Bold/Wompi - 21 Enero 2026

## 🔍 Análisis de las Credenciales Actuales

### Credenciales en `.env`:
```env
BOLD_API_KEY=g7zLcQ8RisN-5hJRFfGdUQU-2aJz5VsJkeAJN4dQUE
BOLD_SECRET_KEY=IKi1koNT7pUK1uTRf4vYOQ
BOLD_MERCHANT_ID=2M0MTRAD37
BOLD_API_URL=https://api.online.peyments.bold.co
```

### ❌ Problemas Identificados

#### 1. Formato de Credenciales Incorrecto
Las credenciales NO tienen el formato esperado de Wompi:

**Formato Actual**:
```
BOLD_API_KEY=g7zLcQ8RisN-5hJRFfGdUQU-2aJz5VsJkeAJN4dQUE
BOLD_SECRET_KEY=IKi1koNT7pUK1uTRf4vYOQ
```

**Formato Esperado para Wompi**:
```
BOLD_API_KEY=pub_test_XXXXXXXXXXXXXXXX  (para pruebas)
BOLD_SECRET_KEY=prv_test_XXXXXXXXXXXXXXXX  (para pruebas)

O

BOLD_API_KEY=pub_prod_XXXXXXXXXXXXXXXX  (para producción)
BOLD_SECRET_KEY=prv_prod_XXXXXXXXXXXXXXXX  (para producción)
```

#### 2. URL de API Incorrecta
```env
BOLD_API_URL=https://api.online.peyments.bold.co  ❌ Typo: "peyments"
```

**Debería ser**:
```env
BOLD_API_URL=https://sandbox.wompi.co/v1  (para pruebas)
```

#### 3. Error de Ambiente
Al probar la conexión con Wompi Sandbox, recibimos:
```
ERROR: "La llave proporcionada no corresponde a este ambiente"
```

Esto significa que:
- La llave `IKi1koNT7pUK1uTRf4vYOQ` NO es del ambiente de pruebas
- Posiblemente es una llave de producción
- O es una llave de Bold API Integrations (no Wompi)



## 🎯 Solución: Qué Hacer Ahora

### Opción 1: Obtener Credenciales de Pruebas (RECOMENDADO)

Para hacer pruebas con tarjetas de prueba, necesitas las credenciales del **ambiente de PRUEBAS**:

1. Ve a: **https://panel.bold.co**
2. Navega a: **Integraciones** → **Botón de Pagos**
3. Selecciona la pestaña: **"Pruebas"** o **"Test"** o **"Sandbox"**
4. Copia las llaves que deben tener este formato:
   ```
   Public Key:  pub_test_XXXXXXXXXXXXXXXX
   Private Key: prv_test_XXXXXXXXXXXXXXXX
   ```

### Opción 2: Usar Credenciales de Producción (NO RECOMENDADO para pruebas)

Si las credenciales que tienes son de producción:

1. **NO las uses para pruebas** (cobrarías dinero real)
2. Cambia la URL a producción:
   ```env
   BOLD_API_URL=https://production.wompi.co/v1
   ```
3. Pero **NO podrás usar tarjetas de prueba**
4. Solo funcionarán tarjetas reales

### Opción 3: Verificar el Tipo de Credenciales

Las credenciales que tienes podrían ser de:

**A) Bold API Integrations** (para datáfonos):
- No sirven para pagos online
- No funcionan con Wompi API
- Necesitas obtener las del "Botón de Pagos"

**B) Wompi Producción**:
- Funcionan pero cobran dinero real
- No puedes usar tarjetas de prueba
- Necesitas las de ambiente de pruebas



## 📋 Checklist de Verificación

Cuando obtengas las nuevas credenciales, verifica que:

- [ ] La **Public Key** empiece con `pub_test_` (para pruebas)
- [ ] La **Private Key** empiece con `prv_test_` (para pruebas)
- [ ] Estén en la sección **"Botón de Pagos"** (NO "API Integrations")
- [ ] Estén en el ambiente **"Pruebas"** (NO "Producción")
- [ ] La URL sea `https://sandbox.wompi.co/v1`

## 🧪 Prueba Rápida

Una vez que actualices las credenciales, prueba con este comando:

```powershell
$headers = @{
    "Authorization" = "Bearer prv_test_TU_LLAVE_PRIVADA_AQUI"
    "Content-Type" = "application/json"
}

$body = @{
    name = "Test de Integracion"
    description = "Prueba"
    single_use = $true
    currency = "COP"
    amount_in_cents = 10000
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://sandbox.wompi.co/v1/payment_links" -Method Post -Headers $headers -Body $body
```

**Respuesta Esperada** (si las credenciales son correctas):
```json
{
  "data": {
    "id": "abc123",
    "name": "Test de Integracion",
    "url": "https://checkout.wompi.co/l/abc123",
    ...
  }
}
```

**Error Esperado** (si las credenciales son incorrectas):
```json
{
  "error": {
    "type": "INVALID_ACCESS_TOKEN",
    "reason": "La llave proporcionada no corresponde a este ambiente"
  }
}
```



## 🔧 Configuración Correcta Final

Una vez que tengas las credenciales correctas, tu archivo `.env` debe verse así:

```env
# Bold Payment Gateway - SANDBOX/PRUEBAS
BOLD_API_KEY=pub_test_XXXXXXXXXXXXXXXX
BOLD_SECRET_KEY=prv_test_XXXXXXXXXXXXXXXX
BOLD_MERCHANT_ID=2M0MTRAD37  # Este puede quedarse igual
BOLD_API_URL=https://sandbox.wompi.co/v1
BOLD_WEBHOOK_SECRET=g72LcD8iISN-PjURFfTq8UQU_2aizz5VclkaAfMdOuE

# URLs para Bold
BOLD_SUCCESS_URL=http://localhost:5173/payment/success
BOLD_FAILURE_URL=http://localhost:5173/payment/failure
BOLD_WEBHOOK_URL=https://datagree.net/api/webhooks/bold
```

## 📞 Contacto de Soporte

Si después de verificar en el panel de Bold aún no encuentras las credenciales correctas:

**Soporte Bold Colombia**:
- 📧 Email: soporte@bold.co
- 🌐 Panel: https://panel.bold.co

**Mensaje sugerido**:
```
Asunto: Necesito credenciales del Botón de Pagos para ambiente de pruebas

Hola,

Necesito obtener las credenciales (Public Key y Private Key) del 
Botón de Pagos para el ambiente de PRUEBAS (sandbox).

Las credenciales deben tener el formato:
- Public Key: pub_test_XXXXXXXX
- Private Key: prv_test_XXXXXXXX

Actualmente tengo credenciales pero no tienen este formato y al 
intentar usarlas con la API de Wompi recibo el error:
"La llave proporcionada no corresponde a este ambiente"

¿Pueden ayudarme a obtener las credenciales correctas del ambiente 
de pruebas del Botón de Pagos?

Gracias.
```

---

**Fecha**: 21 de Enero de 2026  
**Estado**: Credenciales incorrectas - No corresponden al ambiente de pruebas  
**Próximo paso**: Obtener credenciales correctas del ambiente de pruebas desde panel.bold.co
