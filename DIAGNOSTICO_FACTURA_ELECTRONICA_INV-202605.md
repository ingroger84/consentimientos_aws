# Diagnóstico: Factura Electrónica INV-202605

**Fecha**: 11 de mayo de 2026  
**Factura**: INV-202605  
**Tenant**: Termales Espiritu Santo  
**Monto**: $119,900 COP

---

## 🔍 Verificación Inicial

### Estado de la Factura
- ✅ Factura pagada: 12 de mayo de 2026, 00:07:45
- ❌ CUFE: No generado
- ❌ Invoice ID DynamiaERP: No generado
- ❌ Número FE: No generado
- ❌ Estado: No enviado
- ❌ Enviado DIAN: No

### Causa Raíz
**El pago se procesó manualmente** (no pasó por el flujo automático de `markAsPaidWithPayment()`), por lo que la integración con DynamiaERP no se ejecutó automáticamente.

---

## 🔧 Intento de Envío Manual

### Datos Enviados
- **Tenant**: Termales Espiritu Santo
- **Documento**: CC 1234567890
- **Método de pago**: PSE (detectado del payment)
- **Monto**: $119,900 COP

### Respuesta de DynamiaERP
```json
{
  "origin": "dispatcherServlet",
  "message": "Bad Request",
  "url": "http://api.pos.dynamiaerp.co/api/ventas/facturaElectronica",
  "status": "400"
}
```

**Error**: 400 Bad Request

---

## 🚨 Problema Identificado

DynamiaERP está rechazando la factura con un error 400, lo que indica que hay un problema con los datos enviados. Las posibles causas son:

### 1. Problema con el Documento del Cliente
- **Documento actual**: CC 1234567890
- **Problema**: Este parece ser un documento de prueba/placeholder
- **Solución**: Verificar si el tenant tiene un documento real configurado

### 2. Problema con la Estructura de Datos
- La respuesta de DynamiaERP no proporciona detalles específicos del error
- Puede ser un problema con:
  - Formato de fechas
  - Campos requeridos faltantes
  - Validaciones de negocio de DynamiaERP

### 3. Problema con el Tipo de Documento
- Tipo enviado: REMISION
- Puede que DynamiaERP requiera un tipo diferente para facturas de servicios

---

## 📋 Datos del Tenant

```sql
SELECT 
  id,
  name,
  document_type_id,
  document_number,
  contactEmail,
  contactPhone,
  plan
FROM tenants
WHERE id = '2d08f226-320d-4541-b632-933878ad69b8';
```

**Resultado**:
- ID: 2d08f226-320d-4541-b632-933878ad69b8
- Nombre: Termales Espiritu Santo
- Documento: CC 1234567890 ⚠️ (parece ser de prueba)
- Email: contactEmail (del tenant)
- Plan: (verificar)

---

## 🔍 Verificaciones Necesarias

### 1. Verificar Documento Real del Tenant
```sql
SELECT 
  name,
  document_type_id,
  document_number,
  contactEmail,
  contactPhone
FROM tenants
WHERE id = '2d08f226-320d-4541-b632-933878ad69b8';
```

### 2. Verificar si Hay Otras Facturas Exitosas en DynamiaERP
```sql
SELECT 
  "invoiceNumber",
  "dynamiaerpCufe",
  "dynamiaerpStatus",
  "dynamiaerpSentAt"
FROM invoices
WHERE "dynamiaerpCufe" IS NOT NULL
ORDER BY "dynamiaerpSentAt" DESC
LIMIT 5;
```

### 3. Comparar con Factura Exitosa
Si hay facturas exitosas, comparar los datos enviados para identificar diferencias.

---

## 🎯 Próximos Pasos

### Opción 1: Actualizar Documento del Tenant
Si el documento es de prueba, actualizar con el documento real:
```sql
UPDATE tenants
SET document_number = '[DOCUMENTO_REAL]'
WHERE id = '2d08f226-320d-4541-b632-933878ad69b8';
```

### Opción 2: Revisar Logs de DynamiaERP
Contactar a soporte de DynamiaERP para obtener logs detallados del error 400.

### Opción 3: Probar con Datos Mínimos
Crear un script de prueba con datos mínimos para identificar qué campo está causando el error.

### Opción 4: Verificar Configuración de DynamiaERP
- Verificar que el token sea válido
- Verificar que la llave técnica sea correcta
- Verificar que la sucursal '001' exista

---

## 📝 Notas Importantes

1. **Flujo Automático**: Para futuras facturas, asegurarse de que el pago pase por el flujo automático (`markAsPaidWithPayment()`) para que la integración con DynamiaERP se ejecute correctamente.

2. **Validación de Documentos**: Implementar validación de documentos reales antes de enviar a DynamiaERP.

3. **Logs Detallados**: DynamiaERP no proporciona detalles específicos en el error 400, lo que dificulta el diagnóstico.

4. **Documentación**: Revisar la documentación de DynamiaERP para verificar:
   - Campos requeridos
   - Formato de datos
   - Validaciones de negocio

---

## 🔗 Referencias

- **Documentación DynamiaERP**: `doc/87-integracion-dynamiaerp/INTEGRACION_DYNAMIAERP_FACTURACION.md`
- **Servicio DynamiaERP**: `backend/src/dynamiaerp/dynamiaerp.service.ts`
- **Servicio de Facturas**: `backend/src/invoices/invoices.service.ts`
- **Script de verificación**: `backend/check-dynamiaerp-invoice-INV-202605.js`
- **Script de envío manual**: `backend/send-invoice-to-dynamiaerp-INV-202605.js`

---

## ✅ Estado Actual

- ❌ Factura electrónica NO generada
- ❌ Error 400 de DynamiaERP
- ⏳ Pendiente: Verificar documento real del tenant
- ⏳ Pendiente: Contactar soporte DynamiaERP para logs detallados
- ⏳ Pendiente: Comparar con facturas exitosas (si existen)

---

**Conclusión**: La factura NO se generó automáticamente porque el pago se procesó manualmente. El intento de envío manual falló con error 400, posiblemente debido a que el documento del tenant (CC 1234567890) parece ser de prueba. Se requiere verificar el documento real del tenant y/o contactar a soporte de DynamiaERP para obtener detalles del error.
