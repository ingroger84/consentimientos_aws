# Despliegue v90 - Corrección DynamiaERP

**Fecha**: 20 de Abril de 2026  
**Hora**: 3:40 PM (Hora Colombia)  
**Estado**: ✅ Despliegue completado - ⚠️ Requiere validación de credenciales

---

## ✅ Trabajo Completado

### 1. Código Actualizado y Desplegado
- ✅ Backend compilado localmente sin errores
- ✅ Archivos `dist/` subidos al servidor
- ✅ Scripts de diagnóstico subidos al servidor
- ✅ Configuración `.env` actualizada
- ✅ Backend reiniciado con PM2

### 2. Cambios Aplicados

#### Configuración (.env):
```bash
# ANTES
DYNAMIAERP_BASE_URL=innovasystems.dynamiaerp.app

# DESPUÉS
DYNAMIAERP_BASE_URL=api.pos.dynamiaerp.co
```

#### Código (dynamiaerp.service.ts):
- ✅ URL base corregida: `api.pos.dynamiaerp.co`
- ✅ Protocolo cambiado: HTTP puerto 80 (no HTTPS)
- ✅ Interfaces completas según Swagger (50+ campos)
- ✅ Campos adicionales: `fechaEnvio`, `periodoFacturacion`, `moneda`
- ✅ Flags: `procesarPago`, `habilitacion`

### 3. Archivos Desplegados

```
✅ /home/ubuntu/consentimientos_aws/backend/dist/ (completo)
✅ /home/ubuntu/consentimientos_aws/backend/.env (actualizado)
✅ /home/ubuntu/consentimientos_aws/backend/resend-invoice-to-dynamiaerp.js
✅ /home/ubuntu/consentimientos_aws/backend/test-dynamiaerp-correct-endpoint.js
✅ /home/ubuntu/consentimientos_aws/backend/diagnose-dynamiaerp-invoice.js
```

### 4. Servidor PM2

```bash
Proceso: datagree
Estado: online
PID: 1564031
Reiniciado: 509 veces
Uptime: Recién reiniciado
```

---

## ⚠️ Problema Identificado

### Error 400 al Enviar Factura

Al intentar reenviar la factura INV-202604-3740, DynamiaERP devuelve:

```
Status: 400 Bad Request
Response: HTML de error (no JSON)
```

### Pruebas Realizadas:

1. ✅ **Token actualizado**: Probado con token de factura electrónica `6ea101a465fc7e8de857c79ac0b3ba0d`
2. ✅ **Diferentes formatos de autenticación**: Bearer, solo token, sin auth - todos dan 400
3. ✅ **Estructura mínima**: Incluso con datos mínimos da 400
4. ✅ **URL correcta**: `http://api.pos.dynamiaerp.co/api/ventas/facturaElectronica`

### Conclusión:

El error 400 con respuesta HTML (no JSON) indica que:

1. **El endpoint puede estar incorrecto o inactivo**
   - Aunque según Swagger es `/api/ventas/facturaElectronica`
   - El servidor devuelve HTML en lugar de JSON

2. **Puede requerir parámetros adicionales en la URL**
   - Query params no documentados
   - Path params específicos

3. **El servicio puede no estar disponible en este ambiente**
   - Puede ser un ambiente de pruebas diferente
   - Puede requerir configuración adicional en DynamiaERP

---

## 🔍 Pruebas Realizadas

### Test 1: Conexión al Servidor
```bash
✅ GET http://api.pos.dynamiaerp.co/
Status: 302 (Redirect a /login)
```

### Test 2: Endpoint API
```bash
❌ GET http://api.pos.dynamiaerp.co/api
Status: 404 (No static resource)
```

### Test 3: Endpoint Facturación
```bash
❌ POST http://api.pos.dynamiaerp.co/api/ventas/facturaElectronica
Status: 400 (Bad Request - HTML)
```

---

## 📋 Próximos Pasos

### 1. Validar Credenciales con DynamiaERP

Contactar al equipo de DynamiaERP para verificar:

- ✅ Token de autenticación válido
- ✅ Llave técnica correcta
- ✅ Permisos de la cuenta
- ✅ Endpoint correcto
- ✅ Headers requeridos

### 2. Revisar Documentación Swagger

Acceder a: `http://api.pos.dynamiaerp.co/swagger-ui/index.html`

Verificar:
- Estructura exacta del body
- Campos obligatorios
- Formato de fechas
- Códigos válidos (tipos de documento, ciudades, etc.)

### 3. Probar con Datos Mínimos

Crear un script de prueba con la estructura mínima requerida:

```javascript
{
  "tipo": "FACTURA",
  "numero": "TEST-001",
  "fecha": "2026-04-20",
  "cliente": { /* datos mínimos */ },
  "detalles": [ /* un item */ ],
  "totales": { /* totales */ }
}
```

### 4. Verificar Logs de DynamiaERP

Si tienen acceso a logs del lado de DynamiaERP, revisar:
- Errores de validación específicos
- Campos faltantes o incorrectos
- Problemas de autenticación

---

## 🛠️ Comandos Útiles

### Conectar al Servidor:
```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
```

### Ver Logs del Backend:
```bash
pm2 logs datagree --lines 100
```

### Reiniciar Backend:
```bash
cd /home/ubuntu/consentimientos_aws
pm2 restart datagree
```

### Probar Conexión:
```bash
cd /home/ubuntu/consentimientos_aws/backend
node test-dynamiaerp-correct-endpoint.js
```

### Reenviar Factura:
```bash
cd /home/ubuntu/consentimientos_aws/backend
node resend-invoice-to-dynamiaerp.js INV-202604-3740
```

### Diagnosticar Facturas:
```bash
cd /home/ubuntu/consentimientos_aws/backend
node diagnose-dynamiaerp-invoice.js
```

---

## 📊 Estado de la Factura Pendiente

```
Número: INV-202604-3740
Tenant: Aquiub Casa de Pestañas
Cliente: 901595157-9 (NIT)
Monto: $203,000 COP
Estado: PAGADA
Fecha de pago: 20/04/2026 11:13:30 AM
CUFE: ❌ Pendiente de generar
Error: 400 Bad Request
```

---

## ✅ Resumen

### Completado:
1. ✅ Código actualizado con URL correcta
2. ✅ Protocolo cambiado a HTTP puerto 80
3. ✅ Interfaces completas según Swagger
4. ✅ Backend desplegado y reiniciado
5. ✅ Configuración .env actualizada
6. ✅ Scripts de diagnóstico disponibles

### Pendiente:
1. ⚠️ Validar credenciales con DynamiaERP
2. ⚠️ Resolver error 400 Bad Request
3. ⚠️ Generar CUFE para factura INV-202604-3740
4. ⚠️ Verificar estructura del body con Swagger

---

## 📞 Contacto

Para resolver el error 400, contactar a:

- **Soporte DynamiaERP**: Verificar token y permisos
- **Documentación**: http://api.pos.dynamiaerp.co/swagger-ui/index.html
- **Logs del servidor**: `pm2 logs datagree`

---

**Documentado por**: Kiro AI  
**Fecha**: 20 de Abril de 2026  
**Hora**: 3:40 PM (Hora Colombia)
