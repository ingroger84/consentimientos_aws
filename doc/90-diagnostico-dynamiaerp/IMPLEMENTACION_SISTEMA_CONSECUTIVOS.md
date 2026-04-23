# Implementación Sistema de Consecutivos DynamiaERP

**Fecha**: 20 de Abril de 2026  
**Hora**: 10:30 PM (Hora Colombia)  
**Estado**: ✅ Implementado - Pendiente token válido

---

## 🎯 Objetivo

Implementar un sistema de consecutivos de facturas para DynamiaERP donde cada tenant tiene su propio código de sucursal y consecutivo independiente.

**Formato**: `00X-000X`
- `00X`: Código de sucursal del tenant (001, 002, 003, etc.)
- `000X`: Consecutivo de documento que incrementa por tenant

---

## 📋 Cambios Realizados

### 1. Migración de Base de Datos

**Archivo**: `backend/migrations/add-dynamiaerp-branch-code.sql`

**Cambios**:
- Agregada columna `dynamiaerp_branch_code` (VARCHAR(3)) para código de sucursal
- Agregada columna `dynamiaerp_last_invoice_number` (INTEGER) para último consecutivo usado
- Creada función `assign_dynamiaerp_branch_code()` para asignar códigos automáticamente
- Creado trigger para asignar código a nuevos tenants

**Códigos asignados**:
- `001`: Aquiub Casa de Pestañas
- `002`: Demo Estetica
- `003`: Demo Medico
- `004`: hotelglampinglapolka
- `005`: Termales Espiritu Santo

### 2. Entidad de Tenant

**Archivo**: `backend/src/tenants/entities/tenant.entity.ts`

**Campos agregados**:
```typescript
@Column({ name: 'dynamiaerp_branch_code', length: 3, nullable: true })
dynamiaerpBranchCode: string;

@Column({ name: 'dynamiaerp_last_invoice_number', type: 'int', default: 0 })
dynamiaerpLastInvoiceNumber: number;
```

### 3. Servicio de Invoices

**Archivo**: `backend/src/invoices/invoices.service.ts`

**Cambios en `sendToDynamiaErp()`**:

1. **Verificación de código de sucursal**:
   ```typescript
   if (!tenant.dynamiaerpBranchCode) {
     throw new BadRequestException(`El tenant ${tenant.name} no tiene código de sucursal DynamiaERP asignado`);
   }
   ```

2. **Generación de número de factura**:
   ```typescript
   const nextInvoiceNumber = tenant.dynamiaerpLastInvoiceNumber + 1;
   const formattedInvoiceNumber = `${tenant.dynamiaerpBranchCode}-${String(nextInvoiceNumber).padStart(4, '0')}`;
   // Ejemplo: 001-0001, 001-0002, 002-0001, etc.
   ```

3. **Formato de fechas**:
   ```typescript
   const formatDate = (date: Date) => {
     // Formato: "YYYY-MM-DD HH:mm:ss"
     return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
   };
   ```

4. **Estructura de factura actualizada**:
   - `tipo`: "FACTURA ELECTRONICA" (con espacio)
   - `numero`: Formato `00X-000X`
   - `sucursal`: Código de sucursal del tenant
   - `prefijo`: Código de sucursal del tenant
   - `consecutivo`: Número consecutivo
   - `observaciones`: "LINK DE PAGO"
   - `detalles[].nombre`: "LINK DE PAGO"
   - `pdf`: "none"
   - `procesarPago`: false
   - `formasPagos`: [{ codigo: "EF", valor: total }]
   - `cliente.excluido`: true
   - `cliente.impuestoIncluido`: true
   - `totales.totalBaseGravable`: 0

5. **Actualización de consecutivo**:
   ```typescript
   if (response.success) {
     tenant.dynamiaerpLastInvoiceNumber = nextInvoiceNumber;
     await this.tenantsRepository.save(tenant);
   }
   ```

### 4. Servicio de DynamiaERP

**Archivo**: `backend/src/dynamiaerp/dynamiaerp.service.ts`

**Cambio en headers**:
```typescript
headers: {
  'Content-Type': 'application/json',
  'Updated-Token': this.token, // Antes era Authorization: Bearer
  'Accept': 'application/json',
}
```

---

## 📊 Ejemplos de Números de Factura

### Aquiub (Código: 001)
- Primera factura: `001-0001`
- Segunda factura: `001-0002`
- Tercera factura: `001-0003`
- ...
- Factura 100: `001-0100`

### Termales (Código: 005)
- Primera factura: `005-0001`
- Segunda factura: `005-0002`
- Tercera factura: `005-0003`

---

## 🔧 Scripts Creados

### 1. Ejecutar Migración
```bash
node backend/run-migration-dynamiaerp-branch.js
```

### 2. Asignar Códigos a Tenants
```bash
node backend/assign-branch-codes-to-tenants.js
```

### 3. Probar con Estructura de Postman
```bash
node backend/test-dynamiaerp-postman-example.js
```

---

## ⚠️ Problema Pendiente

### Token de Tipo de Venta No Válido

**Error actual**:
```json
{
  "enviada": false,
  "errores": ["No se recibio token de tipo de venta"],
  "mensaje": "Error de validacion",
  "valido": false
}
```

**Token probado**: `bebc7acbeede150ed0cc1b6a02506e55`

**Causa**: El token del ejemplo de Postman no es válido para la cuenta de Aquiub.

**Solución**: Contactar a soporte de DynamiaERP para obtener el token correcto.

---

## 📞 Información para Soporte DynamiaERP

**Cuenta**: Aquiub Casa de Pestañas  
**NIT**: 901595157-9  
**Llave Técnica**: b4118824f61b55466c29a0d87f4067299bd77aa7681891fae449aae32657edca  
**Código de Sucursal**: 001  
**Problema**: Token de tipo de venta no válido  
**Token probado**: bebc7acbeede150ed0cc1b6a02506e55  
**Error**: "No se recibio token de tipo de venta"

**Preguntas**:
1. ¿Cuál es el token de tipo de venta válido para nuestra cuenta?
2. ¿El token del ejemplo es de una cuenta de prueba diferente?
3. ¿Dónde se encuentra este token en el panel de DynamiaERP?

---

## ✅ Checklist de Implementación

- [x] Migración de base de datos ejecutada
- [x] Códigos de sucursal asignados a todos los tenants
- [x] Entidad de Tenant actualizada
- [x] Servicio de Invoices actualizado
- [x] Servicio de DynamiaERP actualizado
- [x] Formato de número de factura: `00X-000X`
- [x] Sistema de consecutivos por tenant
- [x] Formato de fechas: "YYYY-MM-DD HH:mm:ss"
- [x] Header correcto: `Updated-Token`
- [x] Tipo de documento: "FACTURA ELECTRONICA"
- [x] Observaciones: "LINK DE PAGO"
- [x] Nombre producto: "LINK DE PAGO"
- [x] Campos excluido e impuestoIncluido: true
- [x] totalBaseGravable: 0
- [ ] **Token de tipo de venta válido** ← PENDIENTE

---

## 🚀 Próximos Pasos

### 1. Obtener Token Válido
Contactar a soporte de DynamiaERP con la información proporcionada arriba.

### 2. Actualizar Configuración
Una vez obtenido el token:
```bash
# Actualizar .env
echo "DYNAMIAERP_TOKEN=NUEVO_TOKEN_AQUI" >> backend/.env
```

### 3. Probar con Token Correcto
```bash
# Probar conexión
node backend/test-dynamiaerp-postman-example.js

# Si funciona, reenviar factura de Aquiub
node backend/resend-invoice-to-dynamiaerp.js INV-202604-3740
```

### 4. Verificar CUFE Generado
```bash
node backend/check-aquiub-data.js
```

### 5. Desplegar a Producción
```bash
scripts/deploy-v91-dynamiaerp-consecutivos.ps1
```

---

## 📁 Archivos Modificados

- `backend/migrations/add-dynamiaerp-branch-code.sql` (nuevo)
- `backend/src/tenants/entities/tenant.entity.ts` (modificado)
- `backend/src/invoices/invoices.service.ts` (modificado)
- `backend/src/dynamiaerp/dynamiaerp.service.ts` (modificado)
- `backend/run-migration-dynamiaerp-branch.js` (nuevo)
- `backend/assign-branch-codes-to-tenants.js` (nuevo)
- `backend/test-dynamiaerp-postman-example.js` (nuevo)

---

**Documentado por**: Kiro AI  
**Fecha**: 20 de Abril de 2026  
**Hora**: 10:30 PM (Hora Colombia)  
**Estado**: Implementado - Pendiente token válido
