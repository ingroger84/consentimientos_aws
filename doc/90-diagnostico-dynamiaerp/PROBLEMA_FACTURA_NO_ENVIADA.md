# Diagnóstico: Factura No Enviada a DynamiaERP

**Fecha**: 20 de Abril de 2026  
**Factura**: INV-202604-3740  
**Tenant**: Aquiub Casa de Pestañas

---

## 🔍 Problema Identificado

Un cliente (Aquiub) realizó un pago exitoso de su factura, pero la factura electrónica NO se generó en DynamiaERP.

### Detalles del Pago:
- **Factura**: INV-202604-3740
- **Monto**: $203,000 COP
- **Estado**: PAGADA
- **Fecha de pago**: 20/04/2026 11:13:30 AM
- **Bold Transaction ID**: INV-INV-202604-3740-1776700975704-A1

### Estado en DynamiaERP:
- **CUFE**: ❌ No generado
- **Estado**: ⚠️ NO ENVIADA
- **Error**: Ninguno registrado inicialmente

---

## 🔎 Causa Raíz

Al revisar el código, encontramos que:

1. **El flujo de integración existe**: En `invoices.service.ts`, línea 347, se llama a `sendToDynamiaErp()` después de marcar la factura como pagada.

2. **Hay un try-catch silencioso**: El error se captura pero no se propaga:
   ```typescript
   try {
     await this.sendToDynamiaErp(invoice.id);
   } catch (error) {
     this.logger.error(`❌ Error al enviar factura a DynamiaERP: ${error.message}`);
     // No lanzar error para no interrumpir el flujo de pago
   }
   ```

3. **El error no se guardó en la BD**: La factura quedó sin `dynamiaerpError` ni `dynamiaerpResponse`.

---

## 🧪 Intento de Reenvío Manual

Ejecutamos el script `resend-invoice-to-dynamiaerp.js` para reenviar la factura:

### Datos Enviados:
```json
{
  "tipo": "FACTURA",
  "tipoDoc": "FACTURA",
  "numero": "INV-202604-3740",
  "consecutivo": "2026043740",
  "prefijo": "INV",
  "fecha": "2026-04-20T16:13:30.609Z",
  "fechaVencimiento": "2026-04-21T05:00:00.000Z",
  "llaveTecnica": "b4118824f61b55466c29a0d87f4067299bd77aa7681891fae449aae32657edca",
  "sucursal": "PRINCIPAL",
  "cliente": {
    "identificacion": "901595157-9",
    "tipoId": "31",
    "razonSocial": "Aquiub Casa de Pestañas",
    "email": "aquiubadmon@gmail.com",
    "telefono": "3176365209",
    "direccion": "Dirección no especificada",
    "ciudad": "Bogotá",
    "codigoCiudad": "11001",
    "departamento": "Cundinamarca",
    "codigoDepartamento": "11",
    "pais": "Colombia",
    "codigoPais": "CO",
    "responsabilidades": ["O-13"],
    "esquemaImpuesto": "IVA"
  },
  "detalles": [...],
  "totales": {
    "subtotal": "203000.00",
    "totalImpuestos": "0.00",
    "total": "203000.00"
  }
}
```

### Respuesta de DynamiaERP:
- **Status**: 400 Bad Request
- **Respuesta**: HTML en lugar de JSON (página de error de Cloudflare)
- **Error**: "Bad Request"

---

## 🚨 Problemas Encontrados

### 1. Error 400 de DynamiaERP
La API de DynamiaERP está devolviendo un error 400, lo que indica:
- Problema con los datos enviados
- Problema con la autenticación
- Problema con la URL del endpoint

### 2. Respuesta HTML en lugar de JSON
DynamiaERP está devolviendo una página HTML de error en lugar de una respuesta JSON, lo que sugiere:
- El endpoint puede estar protegido por Cloudflare
- La URL puede ser incorrecta
- El token de autenticación puede ser inválido

### 3. Configuración Actual:
```
DYNAMIAERP_BASE_URL=innovasystems.dynamiaerp.app
DYNAMIAERP_TOKEN=tk60188bfb066427ba846544a563212d9f70e1acb8a4d52fa22b3cacf2018f90e6
DYNAMIAERP_LLAVE_TECNICA=b4118824f61b55466c29a0d87f4067299bd77aa7681891fae449aae32657edca
DYNAMIAERP_SUCURSAL=PRINCIPAL
```

---

## ✅ Soluciones Propuestas

### Solución Inmediata:

1. **Verificar Credenciales de DynamiaERP**:
   - Confirmar que el token es válido
   - Verificar que la llave técnica es correcta
   - Confirmar que la URL base es correcta

2. **Probar Conexión con DynamiaERP**:
   ```bash
   node backend/test-dynamiaerp-connection.js
   ```

3. **Revisar Logs del Servidor**:
   - Verificar si hay errores en los logs de PM2
   - Buscar el error original cuando se intentó enviar la factura

### Solución a Mediano Plazo:

1. **Mejorar el Manejo de Errores**:
   - Guardar el error en `dynamiaerpError` incluso si falla
   - Registrar el error en `billing_history`
   - Enviar notificación al administrador

2. **Crear Endpoint de Reenvío**:
   - Agregar endpoint `POST /api/invoices/:id/resend-to-dynamiaerp`
   - Permitir reenvío manual desde el dashboard

3. **Implementar Cola de Reintentos**:
   - Si falla el envío, agregar a una cola
   - Reintentar automáticamente después de X minutos
   - Máximo 3 reintentos

### Solución a Largo Plazo:

1. **Monitoreo Proactivo**:
   - Dashboard que muestre facturas pagadas sin CUFE
   - Alertas automáticas cuando una factura no se envía
   - Reporte diario de facturas pendientes de envío

2. **Validación Previa**:
   - Validar datos antes de enviar a DynamiaERP
   - Verificar que todos los campos requeridos estén presentes
   - Probar conexión antes de intentar envío

---

## 📋 Checklist de Verificación

- [ ] Verificar credenciales de DynamiaERP
- [ ] Probar conexión con `test-dynamiaerp-connection.js`
- [ ] Revisar logs del servidor para el error original
- [ ] Contactar a soporte de DynamiaERP si es necesario
- [ ] Reenviar factura una vez resuelto el problema
- [ ] Implementar mejoras en el manejo de errores
- [ ] Crear endpoint de reenvío manual
- [ ] Implementar monitoreo proactivo

---

## 🔧 Scripts Creados

### 1. `diagnose-dynamiaerp-invoice.js`
Diagnostica facturas pagadas y su estado en DynamiaERP.

**Uso**:
```bash
node backend/diagnose-dynamiaerp-invoice.js
```

**Salida**:
- Lista de facturas pagadas en las últimas 24 horas
- Estado de cada factura en DynamiaERP (CUFE, error, no enviada)
- Lista de pagos recientes
- Resumen con estadísticas

### 2. `resend-invoice-to-dynamiaerp.js`
Reenvía una factura específica a DynamiaERP.

**Uso**:
```bash
node backend/resend-invoice-to-dynamiaerp.js INV-202604-3740
```

**Funcionalidad**:
- Busca la factura en la BD
- Verifica que esté pagada
- Prepara los datos para DynamiaERP
- Envía la factura
- Actualiza la BD con el resultado

---

## 📞 Próximos Pasos

1. **Inmediato** (Hoy):
   - Verificar credenciales de DynamiaERP
   - Probar conexión
   - Intentar reenviar la factura

2. **Corto Plazo** (Esta Semana):
   - Implementar mejoras en manejo de errores
   - Crear endpoint de reenvío manual
   - Documentar proceso de troubleshooting

3. **Mediano Plazo** (Este Mes):
   - Implementar cola de reintentos
   - Crear dashboard de monitoreo
   - Implementar alertas automáticas

---

## 📝 Notas Adicionales

- Este problema puede afectar a otros clientes si no se resuelve
- Es crítico implementar monitoreo proactivo
- Se recomienda contactar a soporte de DynamiaERP para verificar la configuración

---

**Documentado por**: Kiro AI  
**Fecha**: 20 de Abril de 2026  
**Versión**: 1.0
