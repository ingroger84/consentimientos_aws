# Análisis Error 400 - Integración DynamiaERP

**Fecha**: 20 de Abril de 2026  
**Hora**: 5:45 PM (Hora Colombia)  
**Estado**: ⚠️ Requiere soporte de DynamiaERP

---

## 📊 Resumen Ejecutivo

Después de múltiples pruebas exhaustivas, hemos identificado que el endpoint `/api/ventas/facturaElectronica` de DynamiaERP está rechazando todas las peticiones con error 400 Bad Request, independientemente de:

- ✅ Token de autenticación (probados 3 tokens diferentes)
- ✅ Estructura del body (probadas 5 variantes diferentes)
- ✅ Headers HTTP (probados múltiples formatos)
- ✅ Formato de datos (strings vs números)
- ✅ Cantidad de campos (desde mínimo hasta completo)

---

## 🔍 Hallazgos Técnicos

### 1. Endpoint Confirmado

```
URL: http://api.pos.dynamiaerp.co/api/ventas/facturaElectronica
Método: POST
Content-Type: application/json
Authorization: Bearer {token}
```

El endpoint existe y está documentado en el Swagger.

### 2. Error Consistente

```json
{
  "origin": "dispatcherServlet",
  "message": "Bad Request",
  "url": "http://api.pos.dynamiaerp.co/api/ventas/facturaElectronica",
  "status": "400"
}
```

El error viene del `dispatcherServlet` de Spring Framework, lo que indica que la petición es rechazada ANTES de llegar al controlador de la API.

### 3. Problema en el Swagger

El Swagger documenta un parámetro requerido problemático:

```json
{
  "name": "headers",
  "in": "header",
  "required": true,
  "schema": {
    "$ref": "#/components/schemas/HttpHeaders"
  }
}
```

**Problema**: `HttpHeaders` es una clase interna de Spring Framework que NO se puede serializar como parámetro HTTP. Esto es claramente un error en la documentación del Swagger.

### 4. Tokens Probados

```

Token 1: 6ea101a465fc7e8de857c79ac0b3ba0d

```

Todos devuelven el mismo error 400.

---

## 🧪 Pruebas Realizadas

### Prueba 1: Estructura Completa del Swagger
**Archivo**: `test-dynamiaerp-swagger-exact.js`  
**Resultado**: Error 400  
**Detalles**: Incluye todos los campos documentados en el Swagger (50+ campos)

### Prueba 2: Estructura Mínima
**Archivo**: `test-dynamiaerp-ultra-minimal.js`  
**Resultado**: Error 400  
**Detalles**: Solo campos esenciales (llaveTecnica, sucursal, numero, fecha, cliente, detalles, totales)

### Prueba 3: Variantes de Autenticación
**Archivo**: `test-dynamiaerp-auth-variants.js`  
**Resultado**: Error 400  
**Detalles**: Probado con Bearer, sin Bearer, sin Authorization

### Prueba 4: Valores Numéricos
**Archivo**: `test-dynamiaerp-numeric-fix.js`  
**Resultado**: Error 400  
**Detalles**: Asegurando que todos los valores numéricos sean números (no strings)

### Prueba 5: Diferentes Tokens
**Resultado**: Error 400 con todos los tokens

---

## 🎯 Posibles Causas

### 1. Configuración de Cuenta Pendiente
- El endpoint puede requerir configuración previa en la cuenta de DynamiaERP
- Puede necesitar activación de facturación electrónica
- Puede requerir configuración de resolución DIAN

### 2. Ambiente Incorrecto
- Puede ser un endpoint de producción que requiere datos reales
- Puede haber un ambiente de pruebas diferente

### 3. Parámetros Adicionales No Documentados
- Puede requerir headers adicionales no documentados
- Puede requerir parámetros de query no documentados

### 4. Problema en el Servidor
- El endpoint puede estar temporalmente inactivo
- Puede haber un problema de configuración en el servidor

---

## 📞 Información para Soporte DynamiaERP

### Configuración Actual

```
Base URL: api.pos.dynamiaerp.co
Protocolo: HTTP puerto 80
Endpoint: POST /api/ventas/facturaElectronica
Token Activo: 6ea101a465fc7e8de857c79ac0b3ba0d
Llave Técnica: b4118824f61b55466c29a0d87f4067299bd77aa7681891fae449aae32657edca
Sucursal: PRINCIPAL
```

### Headers Enviados

```
Content-Type: application/json
Authorization: Bearer 6ea101a465fc7e8de857c79ac0b3ba0d
Accept: application/json
Content-Length: {size}
```

### Estructura del Body (Mínima)

```json
{
  "llaveTecnica": "b4118824f61b55466c29a0d87f4067299bd77aa7681891fae449aae32657edca",
  "sucursal": "PRINCIPAL",
  "numero": "TEST-001",
  "fecha": "2026-04-20",
  "cliente": {
    "identificacion": "901595157",
    "tipoId": "31",
    "razonSocial": "Aquiub Casa de Pestañas",
    "email": "aquiubadmon@gmail.com",
    "telefono": "3176365209",
    "direccion": "Calle 1",
    "ciudad": "Bogotá",
    "codigoCiudad": "11001",
    "departamento": "Cundinamarca",
    "codigoDepartamento": "11",
    "pais": "Colombia",
    "codigoPais": "CO",
    "esquemaImpuesto": "IVA"
  },
  "detalles": [{
    "codigo": "ITEM-1",
    "nombre": "Producto Test",
    "descripcion": "Producto Test",
    "cantidad": 1,
    "valorUnitario": 100000,
    "subtotal": 100000,
    "total": 100000,
    "impuesto": "NO_APLICA",
    "impuestoIncluido": false
  }],
  "totales": {
    "subtotal": 100000,
    "total": 100000,
    "totalPagable": 100000
  }
}
```

### Error Recibido

```json
{
  "origin": "dispatcherServlet",
  "message": "Bad Request",
  "url": "http://api.pos.dynamiaerp.co/api/ventas/facturaElectronica",
  "status": "400"
}
```

---

## ❓ Preguntas para Soporte

1. **¿El endpoint está activo y configurado correctamente?**
   - ¿Requiere configuración previa en la cuenta?
   - ¿Hay algún paso de activación pendiente?

2. **¿El token tiene los permisos necesarios?**
   - ¿Qué permisos específicos se requieren?
   - ¿Cómo verificar los permisos del token?

3. **¿Pueden proporcionar un ejemplo de curl funcionando?**
   - Con datos reales que funcionen
   - Con todos los headers necesarios

4. **¿Hay logs del lado de DynamiaERP?**
   - ¿Qué muestra el log del servidor sobre estas peticiones?
   - ¿Hay algún error específico más detallado?

5. **¿El parámetro "headers" del Swagger es correcto?**
   - ¿Cómo se debe enviar ese parámetro?
   - ¿Es un error en la documentación?

6. **¿Hay diferencia entre ambiente de pruebas y producción?**
   - ¿Estamos usando el ambiente correcto?
   - ¿Hay una URL diferente para pruebas?

7. **¿Se requiere configuración de resolución DIAN?**
   - ¿Debe estar configurada antes de enviar facturas?
   - ¿Cómo se configura?

---

## 📁 Archivos de Prueba Disponibles

Todos los scripts están en el servidor en:
```
/home/ubuntu/consentimientos_aws/backend/
```

Scripts de prueba:
- `test-dynamiaerp-swagger-exact.js` - Estructura completa del Swagger
- `test-dynamiaerp-ultra-minimal.js` - Estructura mínima
- `test-dynamiaerp-auth-variants.js` - Variantes de autenticación
- `test-dynamiaerp-numeric-fix.js` - Con valores numéricos correctos
- `test-dynamiaerp-minimal.js` - Prueba básica
- `test-dynamiaerp-correct-endpoint.js` - Prueba con endpoint correcto

Scripts de análisis:
- `fetch-swagger-docs.js` - Descarga documentación del Swagger
- `get-all-schemas.js` - Obtiene todos los schemas
- `list-all-endpoints.js` - Lista todos los endpoints
- `get-factura-endpoint-details.js` - Detalles del endpoint

Archivos generados:
- `swagger-factura-spec.json` - Especificación del endpoint
- `swagger-factura-schema.json` - Schema del DocumentoElectronico
- `swagger-all-schemas.json` - Todos los schemas (321KB)
- `factura-endpoint-full.json` - Detalles completos del endpoint

---

## 🔧 Comandos para Reproducir

### Conectar al Servidor
```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
cd /home/ubuntu/consentimientos_aws/backend
```

### Ejecutar Prueba
```bash
node test-dynamiaerp-ultra-minimal.js
```

### Ver Logs del Backend
```bash
pm2 logs datagree --lines 50
```

---

## 📊 Factura Pendiente

```
Número: INV-202604-3740
Tenant: Aquiub Casa de Pestañas
NIT: 901595157-9
Monto: $203,000 COP
Estado: PAGADA
Fecha de pago: 20/04/2026 11:13:30 AM
CUFE: ❌ Pendiente de generar
```

Una vez resuelto el problema con DynamiaERP, ejecutar:
```bash
node resend-invoice-to-dynamiaerp.js INV-202604-3740
```

---

## 🎯 Próximos Pasos

1. **Contactar Soporte de DynamiaERP**
   - Enviar este documento
   - Solicitar ejemplo de curl funcionando
   - Preguntar por configuración pendiente

2. **Verificar Configuración de Cuenta**
   - Revisar si hay pasos de activación pendientes
   - Verificar permisos del token
   - Confirmar configuración de resolución DIAN

3. **Probar con Ejemplo Real**
   - Una vez que soporte proporcione un ejemplo funcionando
   - Adaptar nuestro código según el ejemplo
   - Reenviar factura de Aquiub

---

## ✅ Sistema Operativo

Mientras se resuelve la integración con DynamiaERP:

- ✅ **Facturación interna**: Funcionando
- ✅ **Pagos con Bold**: Funcionando
- ✅ **Generación de facturas**: Funcionando
- ✅ **Notificaciones**: Funcionando
- ⚠️ **Facturación electrónica DIAN**: Pendiente de integración

**El sistema está completamente operativo y generando ingresos.**



