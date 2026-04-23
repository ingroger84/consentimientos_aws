# Integración DynamiaERP - Facturación Electrónica

## 📋 Resumen

Integración automática entre Archivo en Línea y DynamiaERP para generar facturas electrónicas cuando un tenant realiza un pago.

**Fecha**: 18 de abril de 2026  
**Versión**: v87.0.0  
**Estado**: ✅ Implementado - Pendiente de despliegue

---

## 🎯 Objetivo

Cuando una factura de Archivo en Línea sea pagada, el sistema debe:
1. Detectar automáticamente el pago
2. Enviar los datos de la factura a DynamiaERP
3. Generar una factura electrónica válida ante la DIAN
4. Almacenar el CUFE y datos de la factura electrónica
5. Registrar el evento en el historial de facturación

---

## 🔧 Componentes Implementados

### 1. Servicio DynamiaERP (`backend/src/dynamiaerp/dynamiaerp.service.ts`)

Servicio que maneja toda la comunicación con la API de DynamiaERP.

**Características**:
- Conexión HTTPS segura con DynamiaERP
- Autenticación mediante Bearer Token
- Creación de facturas electrónicas
- Verificación de estado del emisor
- Manejo de errores y reintentos

**Configuración** (`.env`):
```env
DYNAMIAERP_BASE_URL=innovasystems.dynamiaerp.app
DYNAMIAERP_TOKEN=tk60188bfb066427ba846544a563212d9f70e1acb8a4d52fa22b3cacf2018f90e6
DYNAMIAERP_LLAVE_TECNICA=b4118824f61b55466c29a0d87f4067299bd77aa7681891fae449aae32657edca
DYNAMIAERP_SUCURSAL=PRINCIPAL
```

### 2. Módulo DynamiaERP (`backend/src/dynamiaerp/dynamiaerp.module.ts`)

Módulo NestJS que exporta el servicio para uso en otros módulos.

### 3. Actualización de Entidad Invoice

**Nuevos campos agregados**:
- `dynamiaerpCufe`: Código Único de Factura Electrónica
- `dynamiaerpInvoiceId`: ID de la factura en DynamiaERP
- `dynamiaerpInvoiceNumber`: Número de factura electrónica
- `dynamiaerpStatus`: Estado de la factura electrónica
- `dynamiaerpSentToDian`: Si fue enviada a la DIAN
- `dynamiaerpSentAt`: Fecha de envío a DynamiaERP
- `dynamiaerpError`: Mensaje de error (si falló)
- `dynamiaerpResponse`: Respuesta completa de DynamiaERP (JSON)

### 4. Migración SQL (`backend/add-dynamiaerp-columns.sql`)

Script SQL que agrega las columnas necesarias a la tabla `invoices`.

**Incluye**:
- Creación de columnas
- Índices para búsquedas eficientes
- Comentarios de documentación

### 5. Actualización de InvoicesService

**Método nuevo**: `sendToDynamiaErp(invoiceId: string)`

Este método:
1. Verifica que la factura esté pagada
2. Verifica que no haya sido enviada previamente
3. Obtiene datos completos del tenant
4. Mapea datos de Archivo en Línea a formato DynamiaERP
5. Envía la factura a DynamiaERP
6. Almacena la respuesta (CUFE, estado, etc.)
7. Registra el evento en el historial

**Integración automática**:
- Se ejecuta automáticamente en `markAsPaid()`
- Se ejecuta automáticamente en `markAsPaidWithPayment()`
- No interrumpe el flujo de pago si falla (error se registra)

---

## 📊 Flujo de Integración

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO DE FACTURACIÓN                         │
└─────────────────────────────────────────────────────────────────┘

1. Usuario realiza pago en Bold
   │
   ├─> Webhook de Bold notifica a Archivo en Línea
   │
2. Sistema marca factura como PAID
   │
   ├─> invoicesService.markAsPaid() o markAsPaidWithPayment()
   │
3. 🔥 INTEGRACIÓN AUTOMÁTICA
   │
   ├─> invoicesService.sendToDynamiaErp()
   │   │
   │   ├─> Verifica que factura esté pagada
   │   ├─> Verifica que no haya sido enviada antes
   │   ├─> Obtiene datos del tenant
   │   ├─> Mapea datos a formato DynamiaERP
   │   ├─> Envía a DynamiaERP API
   │   │
   │   └─> DynamiaERP procesa y responde
   │       │
   │       ├─> ✅ ÉXITO: Retorna CUFE y datos
   │       │   │
   │       │   ├─> Guarda CUFE en invoice.dynamiaerpCufe
   │       │   ├─> Guarda estado en invoice.dynamiaerpStatus
   │       │   ├─> Guarda respuesta completa
   │       │   └─> Registra en historial de facturación
   │       │
   │       └─> ❌ ERROR: Retorna mensaje de error
   │           │
   │           ├─> Guarda error en invoice.dynamiaerpError
   │           ├─> Guarda respuesta completa
   │           └─> Registra error en historial
   │
4. Sistema continúa flujo normal
   │
   ├─> Activa tenant si estaba suspendido
   ├─> Envía email de confirmación de pago
   └─> Actualiza estado de link de pago Bold
```

---

## 🗺️ Mapeo de Datos

### Tenant → Cliente DynamiaERP

| Campo Archivo en Línea | Campo DynamiaERP | Notas |
|------------------------|------------------|-------|
| `tenant.documentNumber` | `cliente.identificacion` | Número de documento |
| `tenant.documentType.code` | `cliente.tipoId` | Mapeado a códigos DIAN |
| `tenant.name` | `cliente.razonSocial` | Nombre del tenant |
| `tenant.contactEmail` | `cliente.email` | Email de contacto |
| `tenant.contactPhone` | `cliente.telefono` | Teléfono (default: 3000000000) |
| `tenant.address` | `cliente.direccion` | Dirección (default si no existe) |
| `tenant.city` | `cliente.ciudad` | Ciudad (default: Bogotá) |
| `tenant.state` | `cliente.departamento` | Departamento (default: Cundinamarca) |

### Mapeo de Tipos de Documento

| Código Archivo en Línea | Código DIAN | Descripción |
|-------------------------|-------------|-------------|
| CC | 13 | Cédula de Ciudadanía |
| CE | 22 | Cédula de Extranjería |
| NIT | 31 | NIT |
| TI | 12 | Tarjeta de Identidad |
| PP | 41 | Pasaporte |
| RC | 11 | Registro Civil |

### Invoice → Factura Electrónica

| Campo Archivo en Línea | Campo DynamiaERP | Notas |
|------------------------|------------------|-------|
| `invoice.invoiceNumber` | `numero` | Número de factura |
| `invoice.paidAt` | `fecha` | Fecha de emisión |
| `invoice.dueDate` | `fechaVencimiento` | Fecha de vencimiento |
| `invoice.amount` | `totales.subtotal` | Subtotal sin IVA |
| `invoice.tax` | `totales.totalIVA` | IVA 19% |
| `invoice.total` | `totales.total` | Total con IVA |
| `invoice.items[]` | `detalles[]` | Items de la factura |

---

## 🔐 Seguridad

### Autenticación
- Bearer Token almacenado en variables de entorno
- Token NO se expone en logs ni respuestas
- Conexión HTTPS obligatoria

### Validaciones
- Verificar que factura esté pagada antes de enviar
- Verificar que no haya sido enviada previamente (evitar duplicados)
- Validar datos del tenant antes de enviar
- Manejo de errores sin interrumpir flujo de pago

### Datos Sensibles
- CUFE se almacena de forma segura en la base de datos
- Respuesta completa de DynamiaERP se guarda para auditoría
- Errores se registran sin exponer información sensible

---

## 📝 Registro de Eventos

Todos los eventos se registran en la tabla `billing_history`:

### Evento: Factura Electrónica Creada
```json
{
  "action": "PAYMENT_RECEIVED",
  "description": "Factura electrónica generada en DynamiaERP - CUFE: [cufe]",
  "metadata": {
    "invoiceId": "uuid",
    "invoiceNumber": "INV-202604-1234",
    "cufe": "abc123...",
    "dynamiaerpInvoiceId": "xyz789",
    "dynamiaerpStatus": "VALIDA"
  }
}
```

### Evento: Error al Crear Factura Electrónica
```json
{
  "action": "PAYMENT_RECEIVED",
  "description": "Error al generar factura electrónica en DynamiaERP: [mensaje]",
  "metadata": {
    "invoiceId": "uuid",
    "invoiceNumber": "INV-202604-1234",
    "error": "Error de validación",
    "errores": ["Campo X es requerido", "Campo Y es inválido"]
  }
}
```

---

## 🧪 Testing

### Script de Prueba de Conexión
```bash
node backend/test-dynamiaerp-connection.js
```

**Verifica**:
- Conexión con DynamiaERP
- Estado del emisor de facturas electrónicas
- Tipos de ventas disponibles
- Clientes registrados
- Webhooks configurados

### Script de Prueba de Creación de Factura
```bash
node backend/test-dynamiaerp-create-invoice.js
```

**Crea una factura de prueba** con datos simulados.

⚠️ **ADVERTENCIA**: Este script crea una factura REAL en DynamiaERP.

### Script de Prueba de Integración
```bash
# Buscar automáticamente una factura pagada
node backend/test-dynamiaerp-integration.js

# Probar con una factura específica
node backend/test-dynamiaerp-integration.js [invoiceId]
```

**Simula el flujo completo** sin enviar datos reales.

---

## 🚀 Despliegue

### Paso 1: Aplicar Migración SQL

```bash
# Conectar a la base de datos
psql -h db.witvuzaarlqxkiqfiljq.supabase.co -U postgres -d postgres

# Ejecutar migración
\i backend/add-dynamiaerp-columns.sql
```

O usando el script:
```bash
PGPASSWORD='%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD' psql \
  -h db.witvuzaarlqxkiqfiljq.supabase.co \
  -U postgres \
  -d postgres \
  -f backend/add-dynamiaerp-columns.sql
```

### Paso 2: Agregar Variables de Entorno

Editar `backend/.env` en el servidor:
```env
# DynamiaERP Configuration
DYNAMIAERP_BASE_URL=innovasystems.dynamiaerp.app
DYNAMIAERP_TOKEN=tk60188bfb066427ba846544a563212d9f70e1acb8a4d52fa22b3cacf2018f90e6
DYNAMIAERP_LLAVE_TECNICA=b4118824f61b55466c29a0d87f4067299bd77aa7681891fae449aae32657edca
DYNAMIAERP_SUCURSAL=PRINCIPAL
```

### Paso 3: Compilar Backend (Local)

```powershell
# En tu máquina local (Windows)
cd backend
npm run build
```

### Paso 4: Subir Backend al Servidor

```powershell
# Comprimir backend compilado
Compress-Archive -Path backend/dist -DestinationPath backend-dist.zip

# Subir al servidor
scp -i AWS-ISSABEL.pem backend-dist.zip ubuntu@100.28.198.249:/home/ubuntu/

# Conectar al servidor
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249

# Descomprimir y reemplazar
cd /home/ubuntu/consentimientos_aws/backend
rm -rf dist
unzip ~/backend-dist.zip
```

### Paso 5: Reiniciar PM2

```bash
pm2 restart datagree
pm2 logs datagree --lines 100
```

### Paso 6: Verificar Integración

```bash
# Verificar que el servicio esté corriendo
pm2 status

# Ver logs en tiempo real
pm2 logs datagree

# Buscar logs de DynamiaERP
pm2 logs datagree | grep -i dynamiaerp
```

---

## 🔍 Monitoreo

### Verificar Facturas Enviadas a DynamiaERP

```sql
-- Facturas con CUFE (enviadas exitosamente)
SELECT 
  "invoiceNumber",
  "dynamiaerpCufe",
  "dynamiaerpStatus",
  "dynamiaerpSentToDian",
  "dynamiaerpSentAt"
FROM invoices
WHERE "dynamiaerpCufe" IS NOT NULL
ORDER BY "dynamiaerpSentAt" DESC;
```

### Verificar Facturas con Errores

```sql
-- Facturas con errores de DynamiaERP
SELECT 
  "invoiceNumber",
  "dynamiaerpError",
  "dynamiaerpSentAt",
  "dynamiaerpResponse"
FROM invoices
WHERE "dynamiaerpError" IS NOT NULL
ORDER BY "dynamiaerpSentAt" DESC;
```

### Verificar Facturas Pendientes de Envío

```sql
-- Facturas pagadas pero no enviadas a DynamiaERP
SELECT 
  "invoiceNumber",
  status,
  "paidAt",
  total
FROM invoices
WHERE status = 'paid'
  AND "dynamiaerpCufe" IS NULL
ORDER BY "paidAt" DESC;
```

---

## 🐛 Troubleshooting

### Error: "Token inválido o expirado"

**Causa**: El token de DynamiaERP no es válido.

**Solución**:
1. Verificar que el token en `.env` sea correcto
2. Contactar a DynamiaERP para renovar el token
3. Actualizar `DYNAMIAERP_TOKEN` en `.env`
4. Reiniciar PM2

### Error: "Campo X es requerido"

**Causa**: Datos del tenant incompletos.

**Solución**:
1. Verificar que el tenant tenga todos los campos requeridos:
   - `documentNumber`
   - `documentType`
   - `name`
   - `contactEmail`
2. Completar datos faltantes en la base de datos
3. Reintentar envío

### Error: "Factura ya fue enviada"

**Causa**: La factura ya tiene un CUFE asignado.

**Solución**:
- Esto es normal y evita duplicados
- No es necesario hacer nada
- Si necesitas reenviar, eliminar el CUFE manualmente:
  ```sql
  UPDATE invoices 
  SET "dynamiaerpCufe" = NULL,
      "dynamiaerpSentAt" = NULL
  WHERE id = '[invoice-id]';
  ```

### Error: "Conexión rechazada"

**Causa**: No se puede conectar con DynamiaERP.

**Solución**:
1. Verificar conectividad de red
2. Verificar que `DYNAMIAERP_BASE_URL` sea correcto
3. Verificar firewall del servidor
4. Contactar a DynamiaERP para verificar estado del servicio

---

## 📊 Estadísticas

### Consultas Útiles

```sql
-- Total de facturas enviadas a DynamiaERP
SELECT COUNT(*) as total_enviadas
FROM invoices
WHERE "dynamiaerpCufe" IS NOT NULL;

-- Total de facturas con errores
SELECT COUNT(*) as total_errores
FROM invoices
WHERE "dynamiaerpError" IS NOT NULL;

-- Tasa de éxito
SELECT 
  COUNT(CASE WHEN "dynamiaerpCufe" IS NOT NULL THEN 1 END) as exitosas,
  COUNT(CASE WHEN "dynamiaerpError" IS NOT NULL THEN 1 END) as fallidas,
  ROUND(
    COUNT(CASE WHEN "dynamiaerpCufe" IS NOT NULL THEN 1 END)::numeric / 
    NULLIF(COUNT(*), 0) * 100, 
    2
  ) as tasa_exito_porcentaje
FROM invoices
WHERE "dynamiaerpSentAt" IS NOT NULL;

-- Facturas enviadas por mes
SELECT 
  DATE_TRUNC('month', "dynamiaerpSentAt") as mes,
  COUNT(*) as total
FROM invoices
WHERE "dynamiaerpCufe" IS NOT NULL
GROUP BY mes
ORDER BY mes DESC;
```

---

## 🎯 Próximos Pasos

1. ✅ Implementar servicio DynamiaERP
2. ✅ Actualizar entidad Invoice
3. ✅ Crear migración SQL
4. ✅ Integrar en flujo de pago
5. ✅ Crear scripts de prueba
6. ✅ Documentar integración
7. ⏳ Aplicar migración en producción
8. ⏳ Desplegar backend actualizado
9. ⏳ Probar con factura real
10. ⏳ Monitorear logs y errores

---

## 📚 Referencias

- **API DynamiaERP**: https://innovasystems.dynamiaerp.app/api/docs
- **Documentación DIAN**: https://www.dian.gov.co/
- **Scripts de prueba**: `backend/test-dynamiaerp-*.js`
- **Migración SQL**: `backend/add-dynamiaerp-columns.sql`

---

## ✅ Checklist de Implementación

- [x] Crear servicio DynamiaERP
- [x] Crear módulo DynamiaERP
- [x] Actualizar entidad Invoice
- [x] Crear migración SQL
- [x] Actualizar InvoicesModule
- [x] Integrar en markAsPaid()
- [x] Integrar en markAsPaidWithPayment()
- [x] Crear script de prueba de conexión
- [x] Crear script de prueba de creación
- [x] Crear script de prueba de integración
- [x] Documentar integración
- [ ] Aplicar migración en producción
- [ ] Agregar variables de entorno
- [ ] Compilar backend
- [ ] Subir backend al servidor
- [ ] Reiniciar PM2
- [ ] Probar con factura real
- [ ] Monitorear logs
- [ ] Verificar CUFE generado

---

**Fecha de implementación**: 18 de abril de 2026  
**Implementado por**: Kiro AI Assistant  
**Estado**: ✅ Listo para despliegue
