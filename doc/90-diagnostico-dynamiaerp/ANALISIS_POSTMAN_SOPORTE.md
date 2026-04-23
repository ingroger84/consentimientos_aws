# Análisis del Ejemplo de Postman - Soporte DynamiaERP

**Fecha**: 20 de Abril de 2026  
**Hora**: 10:00 PM (Hora Colombia)

---

## 📸 Análisis del Ejemplo de Postman

### Request Exitoso del Soporte

**URL**: `POST http://api.pos.dynamiaerp.co/api/ventas/facturaElectronica`

**Headers**:
```
Updated-Token: bebc7acbeede150ed0cc1b6a02506e55
Accept: application/json
Content-Type: application/json
```

**Body**:
```json
{
  "fecha": "2026-03-12 17:56:09",
  "fechaEnvio": "2026-03-12 17:56:09",
  "fechaVencimiento": "2026-03-12 17:56:09",
  "numero": "001-0001",
  "tipo": "REMISION",
  "pdf": "none",
  "procesarPago": false,
  "sucursal": "001",
  "observaciones": "",
  "cliente": {
    "apellido1": "FINAL",
    "apellido2": ".",
    "celular": "",
    "ciudad": "MEDELLIN",
    "departamento": "ANTIOQUIA",
    "codigoDepartamento": "13",
    "pais": "Colombia",
    "codigoPais": "CO",
    "direccion": ".",
    "email": "info@innovasystems.com.co",
    "identificacion": "222222222222",
    "nombre1": "CONSUMIDOR",
    "nombre2": "",
    "razonSocial": null,
    "telefono": "0000000000",
    "tipoId": "CC",
    "barrio": "MEDELLIN"
  },
  "detalles": [{
    "cantidad": "4",
    "codigo": "1416233",
    "nombre": "SERVICIO PRESTADO",
    "descripcion": "",
    "impuesto": "IVA",
    "numero": "1",
    "porcentajeDescuento": 0,
    "porcentajeImpuesto": 19,
    "subtotal": 100,
    "total": 100,
    "valorImpuesto": 0,
    "valorUnitario": 100,
    "baseImpuesto": 126005,
    "excluido": true,
    "impuestoIncluido": true,
    "afectaInventario": false
  }],
  "totales": {
    "subtotal": 100,
    "total": 100,
    "totalImpuestos": 0,
    "totalBaseGravable": 0
  },
  "formasPagos": [{
    "codigo": "EF",
    "valor": 100
  }]
}
```

**Response Exitoso**:
```json
{
  "numero": "ISS456",
  "id": 16866516,
  "uuid": "d57a0c4b-8231-4986-8af6-6c5810081215",
  "cufe": "f6d09b32b4671c25e5d6432a03dbb759c4abc1099bd794ed50c197ce2ddb536cc2b9fdf007d464cad6059b5b8c463edc",
  "estado": "NUEVA",
  "qr": "https://catalogo-vpfe.dian.gov.co/document/searchqr?documentkey=...",
  "dto": {
    "tipoVenta": "FACTURA ELECTRONICA",
    "tipoVentaId": 520,
    ...
  },
  "enviada": true,
  "mensaje": "Factura Electronica No. ISS456 creada a partir de documento 001-0001 y enviada correctamente",
  "valido": true
}
```

---

## 🔍 Diferencias Clave Identificadas

### 1. Formato del Número de Factura

❌ **Nuestro formato anterior**: `INV-202604-3740`  
✅ **Formato correcto**: `001-0001` (prefijo-consecutivo)

**Estructura requerida**:
- Prefijo: `001` (código de sucursal)
- Guion: `-`
- Consecutivo: `0001`, `0002`, `0003`, etc. (incrementa automáticamente)

### 2. Nombre del Producto/Servicio

❌ **Anterior**: "Plan Empresarial - Mensual"  
✅ **Correcto**: "LINK DE PAGO" (como solicitaste)

### 3. Observaciones

❌ **Anterior**: "Factura generada automáticamente para el período..."  
✅ **Correcto**: "LINK DE PAGO" (como solicitaste)

### 4. Tipo de Documento

✅ **Opciones válidas**:
- `"REMISION"` (usado en el ejemplo)
- `"FACTURA ELECTRONICA"` (con espacio)

### 5. Header del Token

✅ **Correcto**: `Updated-Token: bebc7acbeede150ed0cc1b6a02506e55`

---

## ❌ Problema Actual

### Error Persistente

```json
{
  "enviada": false,
  "errores": ["No se recibio token de tipo de venta"],
  "mensaje": "Error de validacion",
  "valido": false
}
```

### Causa Probable

El token `bebc7acbeede150ed0cc1b6a02506e55` que aparece en el ejemplo de Postman:

1. **Puede ser de una cuenta de prueba diferente** (no la cuenta de Aquiub)
2. **Puede estar asociado a otra empresa** en DynamiaERP
3. **Puede no estar activo** para la cuenta de Aquiub

### Evidencia

- ✅ El endpoint funciona (Status 200)
- ✅ La estructura del JSON es correcta
- ✅ Los headers son correctos
- ❌ El token no es reconocido como válido

---

## 🎯 Solución

### Necesitas Obtener el Token Correcto

**Preguntar a soporte de DynamiaERP**:

1. ¿Cuál es el token de tipo de venta para la cuenta de **Aquiub Casa de Pestañas** (NIT: 901595157-9)?
2. El token `bebc7acbeede150ed0cc1b6a02506e55` del ejemplo, ¿es de una cuenta de prueba?
3. ¿Cómo puedo obtener mi propio token de tipo de venta?
4. ¿Dónde se encuentra este token en el panel de DynamiaERP?

### Información para Proporcionar a Soporte

```
Cuenta: Aquiub Casa de Pestañas
NIT: 901595157-9
Llave Técnica: b4118824f61b55466c29a0d87f4067299bd77aa7681891fae449aae32657edca
Sucursal: PRINCIPAL (código: 001)
Problema: Token de tipo de venta no válido
Token probado: bebc7acbeede150ed0cc1b6a02506e55
Error: "No se recibio token de tipo de venta"
```

---

## 📋 Estructura Correcta para Aquiub

Una vez obtenido el token correcto, usar esta estructura:

```javascript
{
  "fecha": "2026-04-20 19:00:00",
  "fechaEnvio": "2026-04-20 19:00:00",
  "fechaVencimiento": "2026-04-21 19:00:00",
  "numero": "001-0001", // ← Formato correcto
  "tipo": "FACTURA ELECTRONICA", // ← Con espacio
  "pdf": "none",
  "procesarPago": false,
  "sucursal": "001", // ← Código de sucursal
  "llaveTecnica": "b4118824f61b55466c29a0d87f4067299bd77aa7681891fae449aae32657edca",
  "observaciones": "LINK DE PAGO", // ← Como solicitaste
  "cliente": {
    "apellido1": "",
    "apellido2": "",
    "celular": "3176365209",
    "ciudad": "BARRANQUILLA",
    "departamento": "ATLANTICO",
    "codigoDepartamento": "08",
    "pais": "Colombia",
    "codigoPais": "CO",
    "direccion": "Dirección no especificada",
    "email": "aquiubadmon@gmail.com",
    "identificacion": "901595157-9",
    "nombre1": "",
    "nombre2": "",
    "razonSocial": "Aquiub Casa de Pestañas",
    "telefono": "3176365209",
    "tipoId": "31", // ← NIT
    "barrio": "BARRANQUILLA"
  },
  "detalles": [{
    "cantidad": 1,
    "codigo": "PLAN-EMPRESARIAL",
    "nombre": "LINK DE PAGO", // ← Como solicitaste
    "descripcion": "Plan Empresarial - Mensual",
    "impuesto": "IVA",
    "numero": "1",
    "porcentajeDescuento": 0,
    "porcentajeImpuesto": 0,
    "subtotal": 203000,
    "total": 203000,
    "valorImpuesto": 0,
    "valorUnitario": 203000,
    "baseImpuesto": 203000,
    "excluido": true,
    "impuestoIncluido": true,
    "afectaInventario": false
  }],
  "totales": {
    "subtotal": 203000,
    "total": 203000,
    "totalImpuestos": 0,
    "totalBaseGravable": 0
  },
  "formasPagos": [{
    "codigo": "EF",
    "valor": 203000
  }]
}
```

**Headers**:
```
Updated-Token: [TOKEN_CORRECTO_AQUI]
Accept: application/json
Content-Type: application/json
```

---

## 🔄 Sistema de Consecutivos

### Formato: `001-XXXX`

- `001`: Prefijo de sucursal (PRINCIPAL)
- `XXXX`: Consecutivo que incrementa automáticamente

**Ejemplos**:
- Primera factura: `001-0001`
- Segunda factura: `001-0002`
- Tercera factura: `001-0003`
- ...
- Factura 100: `001-0100`

### Implementación en el Código

Necesitarás:
1. Guardar el último consecutivo usado en la base de datos
2. Incrementarlo para cada nueva factura
3. Formatear con ceros a la izquierda: `String(consecutivo).padStart(4, '0')`

---

## ✅ Checklist de Correcciones

- [x] URL base correcta: `api.pos.dynamiaerp.co`
- [x] Endpoint correcto: `/api/ventas/facturaElectronica`
- [x] Puerto correcto: 80 (HTTP)
- [x] Header correcto: `Updated-Token`
- [x] Formato de fechas: "YYYY-MM-DD HH:mm:ss"
- [x] Tipo de documento: "FACTURA ELECTRONICA" (con espacio)
- [x] Formato de número: "001-0001" (con guion)
- [x] NIT con dígito: "901595157-9"
- [x] Tipo ID: "31" (NIT)
- [x] Observaciones: "LINK DE PAGO"
- [x] Nombre producto: "LINK DE PAGO"
- [x] Estructura del cliente completa
- [x] Campos excluido e impuestoIncluido: true
- [x] totalBaseGravable: 0
- [ ] **Token de tipo de venta válido** ← PENDIENTE

---

## 📁 Scripts Creados

- `backend/test-dynamiaerp-postman-example.js` - Estructura exacta del Postman
- `backend/test-dynamiaerp-all-headers.js` - Prueba todos los headers posibles

---

**Documentado por**: Kiro AI  
**Fecha**: 20 de Abril de 2026  
**Hora**: 10:00 PM (Hora Colombia)  
**Estado**: Estructura correcta - Falta token válido
