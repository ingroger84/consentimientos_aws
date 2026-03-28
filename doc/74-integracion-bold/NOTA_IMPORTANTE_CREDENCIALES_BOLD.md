# ⚠️ NOTA IMPORTANTE: Credenciales de Bold

**Fecha**: 25 de Marzo 2026  
**Estado**: ⚠️ REQUIERE VERIFICACIÓN DE CREDENCIALES

---

## 🚨 Problema Detectado

Al probar la integración localmente, recibimos un error 403:

```json
{
  "Message": "User is not authorized to access this resource because no identity-based policy allows the execute-api:Invoke action"
}
```

---

## 🔍 Análisis del Error

### Causa Probable:
Las credenciales de Bold que tienes (`BOLD_API_KEY`) pueden ser:

1. **Llaves de API Integrations** (requiere datáfono)
   - Estas llaves NO funcionan con "API Link de Pagos"
   - Son para el endpoint `/payments/app-checkout`

2. **Llaves sin permisos para API Link de Pagos**
   - La API Link de Pagos puede requerir activación específica
   - Puede requerir llaves diferentes

3. **Llaves de prueba limitadas**
   - Las llaves de sandbox pueden tener acceso limitado

---

## ✅ Solución

### Opción 1: Verificar en Dashboard de Bold (RECOMENDADO)

1. **Entrar al dashboard de Bold Colombia**:
   - URL: https://panel.bold.co (o similar)
   - Iniciar sesión con tus credenciales

2. **Buscar sección de "Integraciones" o "API"**:
   - Verificar si hay llaves específicas para "API Link de Pagos"
   - Verificar si hay llaves específicas para "Pagos en Línea"

3. **Verificar activación de API Link de Pagos**:
   - Puede requerir activación manual
   - Puede requerir solicitud al soporte

4. **Obtener llaves correctas**:
   - Llave de identidad para "API Link de Pagos"
   - Llave secreta para "API Link de Pagos"

### Opción 2: Contactar Soporte de Bold

**Preguntar**:
1. ¿Cómo activo el acceso a "API Link de Pagos"?
2. ¿Las llaves que tengo funcionan con esta API?
3. ¿Necesito llaves diferentes para "API Link de Pagos"?
4. ¿Hay algún proceso de aprobación o activación?

**Información a proporcionar**:
- Merchant ID: `2M0MTRAD37`
- API Key actual: `1XVOAZHZ87fuDLuWzKAQmG_0RRGYO_eo8YhJHmugf68`
- Endpoint que intentas usar: `/online/link/v1/payment_methods`

---

## 📋 Verificación en Dashboard

Cuando entres al dashboard de Bold, busca:

### 1. Sección de Llaves de Integración
- ¿Hay diferentes tipos de llaves?
- ¿Hay llaves específicas para "Link de Pagos"?
- ¿Hay llaves específicas para "Pagos en Línea"?

### 2. Sección de Productos o Servicios
- ¿Está activado "API Link de Pagos"?
- ¿Está activado "Pagos en Línea"?
- ¿Requiere activación manual?

### 3. Sección de Documentación
- ¿Hay guías de integración?
- ¿Hay ejemplos de código?
- ¿Hay información sobre llaves de API?

---

## 🎯 Estado Actual del Código

### ✅ Código Implementado Correctamente
El código en `bold.service.ts` está implementado según la documentación oficial de Bold API Link de Pagos:
- ✅ URL base correcta: `https://integrations.api.bold.co`
- ✅ Endpoint correcto: `POST /online/link/v1`
- ✅ Headers correctos: `Authorization: x-api-key <llave>`
- ✅ Estructura de request correcta

### ⚠️ Problema: Credenciales
El único problema es que las credenciales actuales no tienen acceso a esta API.

---

## 🚀 Próximos Pasos

### Paso 1: Verificar Dashboard (URGENTE)
1. Entrar al dashboard de Bold
2. Buscar sección de "API Link de Pagos" o "Pagos en Línea"
3. Verificar si está activado
4. Obtener llaves correctas

### Paso 2: Actualizar Credenciales
Una vez tengas las llaves correctas:

```bash
# Actualizar .env local
BOLD_API_KEY=<nueva_llave_de_identidad>
BOLD_SECRET_KEY=<nueva_llave_secreta>

# Actualizar .env en servidor
ssh ubuntu@100.28.198.249
nano /home/ubuntu/consentimientos_aws/backend/.env
# Actualizar las llaves
# Guardar y salir

# Reiniciar PM2
pm2 restart datagree --update-env
```

### Paso 3: Probar Nuevamente
```bash
cd backend
node test-bold-simple.js
```

**Resultado esperado**:
```
✅ Métodos de pago disponibles:
   CREDIT_CARD: Min: $1,000 COP, Max: $5,000,000 COP
   PSE: Min: $1,000 COP, Max: $5,000,000 COP
   ...
```

---

## 📊 Comparación de APIs de Bold

| API | Endpoint | Requiere Datáfono | Llaves |
|-----|----------|-------------------|--------|
| **API Integrations** | `/payments/app-checkout` | ✅ SÍ | Llaves de API Integrations |
| **API Link de Pagos** | `/online/link/v1` | ❌ NO | Llaves de API Link de Pagos |
| **API Pagos en Línea** | (En desarrollo) | ❌ NO | Llaves de Pagos en Línea |

**IMPORTANTE**: Cada API puede requerir llaves diferentes.

---

## ✅ Alternativa Temporal

Si no puedes obtener acceso a "API Link de Pagos" inmediatamente, tienes dos opciones:

### Opción A: Usar API Integrations (Requiere Datáfono)
- Obtener un datáfono SmartPro de Bold
- Usar endpoint `/payments/app-checkout` con método `PAY_BY_LINK`
- Requiere que el datáfono esté encendido

### Opción B: Usar Otro Proveedor
- **Wompi**: https://docs.wompi.co (documentación completa)
- **PayU**: https://developers.payulatam.com (documentación completa)
- **Mercado Pago**: https://www.mercadopago.com.co/developers (documentación completa)

---

## 📞 Contacto con Bold

**Opciones de contacto**:
1. Dashboard de Bold → Sección de Soporte
2. Email de soporte (buscar en el dashboard)
3. Teléfono de soporte (buscar en https://bold.co)

**Información a tener lista**:
- Merchant ID: `2M0MTRAD37`
- Tipo de integración: API Link de Pagos
- Problema: Error 403 al intentar acceder a `/online/link/v1/payment_methods`

---

## 🎯 Conclusión

El código está correctamente implementado según la documentación oficial. El único problema es que las credenciales actuales no tienen acceso a la API Link de Pagos.

**Acción requerida**: Verificar en el dashboard de Bold y obtener las llaves correctas para "API Link de Pagos".

---

**Última actualización**: 25 de Marzo 2026  
**Estado**: ⚠️ ESPERANDO VERIFICACIÓN DE CREDENCIALES EN DASHBOARD
