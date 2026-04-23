# Campos Enviados a DynamiaERP desde Archivo en Línea

**Fecha:** 2026-04-20  
**Versión:** v91.2  
**Flujo:** Cuando se genera un link de pago y el cliente paga

## Momento del Envío

La factura se envía a DynamiaERP **DESPUÉS** de que el cliente realiza el pago a través de Bold. El flujo es:

1. Cliente hace clic en "Pagar Ahora"
2. Se genera link de pago de Bold
3. Cliente paga a través de Bold
4. Bold envía webhook confirmando el pago
5. **Archivo en Línea marca la factura como PAID**
6. **Se ejecuta automáticamente `sendToDynamiaErp()`**
7. Se envían los datos a DynamiaERP

## Estructura Completa de Datos Enviados

### 1. Datos Principales de la Factura

```typescript
{
  tipo: 'REMISION',
  tipoDoc: 'REMISION',
  numero: '001-202604-3740',           // Formato: 001-YYYYMM-NNNN
  consecutivo: '3740',                  // Número consecutivo extraído
  prefijo: '001',                       // Prefijo fijo
  llaveTecnica: 'b4118824f61b55466c29a0d87f4067299bd77aa7681891fae449aae32657edca',
  fecha: '2026-04-20 21:30:45',        // Fecha de pago (paidAt)
  fechaEnvio: '2026-04-20 21:30:45',   // Misma que fecha
  fechaVencimiento: '2026-04-23 23:59:59', // Fecha de vencimiento
  pdf: 'none',
  procesarPago: false,
  sucursal: '001',                      // Hardcodeado
  observaciones: 'LINK DE PAGO',
  
  // ... continúa con cliente, detalles, totales, formasPagos
}
```

### 2. Datos del Cliente (Tenant)

**Lógica Condicional según Tipo de Documento:**

#### Si es NIT (tipoId = '31'):
```typescript
cliente: {
  identificacion: '901234567-8',        // tenant.documentNumber
  tipoId: '31',                         // NIT
  nombre1: 'AQUIUB',                    // Primer palabra de tenant.name
  nombre2: '',                          // Vacío
  apellido1: 'CASA',                    // Segunda palabra de tenant.name
  apellido2: '',                        // Vacío
  razonSocial: 'AQUIUB CASA PESTAÑAS',  // ✅ tenant.name completo (SOLO para NIT)
  email: 'contacto@aquiub.com',         // tenant.contactEmail
  telefono: '3001234567',               // tenant.contactPhone o '3000000000'
  celular: '3001234567',                // tenant.contactPhone o ''
  direccion: 'Dirección no especificada',
  ciudad: 'BARRANQUILLA',
  codigoCiudad: '08001',
  departamento: 'ATLANTICO',
  codigoDepartamento: '08',
  pais: 'Colombia',
  codigoPais: 'CO',
  barrio: 'BARRANQUILLA',
  responsabilidades: ['O-13'],
  esquemaImpuesto: 'IVA'
}
```

#### Si es Cédula (tipoId = '13'):
```typescript
cliente: {
  identificacion: '1234567890',         // tenant.documentNumber
  tipoId: '13',                         // Cédula de Ciudadanía
  nombre1: 'JUAN',                      // Primer palabra de tenant.name
  nombre2: '',                          // Vacío
  apellido1: 'PEREZ',                   // Segunda palabra de tenant.name
  apellido2: '',                        // Vacío
  razonSocial: '',                      // ✅ VACÍO (SOLO para Cédula)
  email: 'juan@email.com',              // tenant.contactEmail
  telefono: '3001234567',               // tenant.contactPhone o '3000000000'
  celular: '3001234567',                // tenant.contactPhone o ''
  direccion: 'Dirección no especificada',
  ciudad: 'BARRANQUILLA',
  codigoCiudad: '08001',
  departamento: 'ATLANTICO',
  codigoDepartamento: '08',
  pais: 'Colombia',
  codigoPais: 'CO',
  barrio: 'BARRANQUILLA',
  responsabilidades: ['O-13'],
  esquemaImpuesto: 'IVA'
}
```

### 3. Mapeo de Tipos de Documento

```typescript
const tipoDocumentoMap = {
  'CC': '13',   // Cédula de Ciudadanía
  'CE': '22',   // Cédula de Extranjería
  'NIT': '31',  // NIT
  'TI': '12',   // Tarjeta de Identidad
  'PP': '41',   // Pasaporte
  'RC': '11'    // Registro Civil
};
```

**Default:** Si no se encuentra el tipo, se usa '31' (NIT)

### 4. Detalles de la Factura (Items)

```typescript
detalles: [
  {
    codigo: 'PLAN-PROFESSIONAL',        // PLAN-{tenant.plan en mayúsculas}
    nombre: 'LINK DE PAGO',
    descripcion: 'Plan Professional - Mensual', // item.description
    cantidad: 1,                        // item.quantity
    valorUnitario: 119900,              // item.unitPrice
    subtotal: 119900,                   // item.total
    valorImpuesto: 0,                   // Sin impuestos
    porcentajeImpuesto: 0,
    baseImpuesto: 119900,               // item.total
    valorDescuento: 0,
    porcentajeDescuento: 0,
    total: 119900,                      // item.total
    impuesto: 'IVA',
    numero: '1',                        // Índice + 1
    excluido: true,                     // Excluido de IVA
    impuestoIncluido: true,
    afectaInventario: false
  }
  // ... más items si existen
]
```

### 5. Totales

```typescript
totales: {
  subtotal: 119900,                     // invoice.amount
  totalImpuestos: 0,                    // Sin impuestos
  totalDescuentos: 0,                   // Sin descuentos
  total: 119900,                        // invoice.total
  totalPagable: 119900,                 // invoice.total
  totalIVA: 0,                          // Sin IVA
  totalBaseGravable: 0                  // Sin base gravable
}
```

### 6. Formas de Pago

```typescript
formasPagos: [
  {
    codigo: 'EF',                       // Efectivo (código genérico)
    valor: 119900                       // invoice.total
  }
]
```

**Nota:** Actualmente se envía siempre 'EF' (Efectivo) independientemente del método de pago real usado en Bold.

## Origen de los Datos

### Datos del Tenant (Cliente)
- `tenant.name` → Nombre de contacto (se divide en nombre1 y apellido1)
- `tenant.documentNumber` → Número de documento
- `tenant.documentType.code` → Tipo de documento (CC, NIT, etc.)
- `tenant.contactEmail` → Email
- `tenant.contactPhone` → Teléfono
- `tenant.plan` → Plan contratado (basic, professional, enterprise)

### Datos de la Factura
- `invoice.invoiceNumber` → Número de factura (INV-202604-3740)
- `invoice.paidAt` → Fecha de pago
- `invoice.dueDate` → Fecha de vencimiento
- `invoice.amount` → Monto sin impuestos
- `invoice.total` → Total a pagar
- `invoice.items[]` → Líneas de la factura

## Campos Fijos (Hardcoded)

Estos campos siempre se envían con los mismos valores:

```typescript
{
  tipo: 'REMISION',
  tipoDoc: 'REMISION',
  prefijo: '001',
  sucursal: '001',
  pdf: 'none',
  procesarPago: false,
  observaciones: 'LINK DE PAGO',
  
  // Cliente
  nombre2: '',
  apellido2: '',
  direccion: 'Dirección no especificada',
  ciudad: 'BARRANQUILLA',
  codigoCiudad: '08001',
  departamento: 'ATLANTICO',
  codigoDepartamento: '08',
  pais: 'Colombia',
  codigoPais: 'CO',
  barrio: 'BARRANQUILLA',
  responsabilidades: ['O-13'],
  esquemaImpuesto: 'IVA',
  
  // Detalles
  nombre: 'LINK DE PAGO',
  valorImpuesto: 0,
  porcentajeImpuesto: 0,
  valorDescuento: 0,
  porcentajeDescuento: 0,
  impuesto: 'IVA',
  excluido: true,
  impuestoIncluido: true,
  afectaInventario: false,
  
  // Totales
  totalImpuestos: 0,
  totalDescuentos: 0,
  totalIVA: 0,
  totalBaseGravable: 0,
  
  // Formas de pago
  formasPagos: [{ codigo: 'EF', valor: total }]
}
```

## Ejemplo Completo Real

### Caso: Aquiub (NIT)

```json
{
  "tipo": "REMISION",
  "tipoDoc": "REMISION",
  "numero": "001-202604-3740",
  "consecutivo": "3740",
  "prefijo": "001",
  "llaveTecnica": "b4118824f61b55466c29a0d87f4067299bd77aa7681891fae449aae32657edca",
  "fecha": "2026-04-20 21:30:45",
  "fechaEnvio": "2026-04-20 21:30:45",
  "fechaVencimiento": "2026-04-23 23:59:59",
  "pdf": "none",
  "procesarPago": false,
  "sucursal": "001",
  "observaciones": "LINK DE PAGO",
  "cliente": {
    "identificacion": "901234567-8",
    "tipoId": "31",
    "nombre1": "AQUIUB",
    "nombre2": "",
    "apellido1": "CASA",
    "apellido2": "",
    "razonSocial": "AQUIUB CASA PESTAÑAS",
    "email": "contacto@aquiub.com",
    "telefono": "3001234567",
    "celular": "3001234567",
    "direccion": "Dirección no especificada",
    "ciudad": "BARRANQUILLA",
    "codigoCiudad": "08001",
    "departamento": "ATLANTICO",
    "codigoDepartamento": "08",
    "pais": "Colombia",
    "codigoPais": "CO",
    "barrio": "BARRANQUILLA",
    "responsabilidades": ["O-13"],
    "esquemaImpuesto": "IVA"
  },
  "detalles": [
    {
      "codigo": "PLAN-PROFESSIONAL",
      "nombre": "LINK DE PAGO",
      "descripcion": "Plan Professional - Mensual",
      "cantidad": 1,
      "valorUnitario": 119900,
      "subtotal": 119900,
      "valorImpuesto": 0,
      "porcentajeImpuesto": 0,
      "baseImpuesto": 119900,
      "valorDescuento": 0,
      "porcentajeDescuento": 0,
      "total": 119900,
      "impuesto": "IVA",
      "numero": "1",
      "excluido": true,
      "impuestoIncluido": true,
      "afectaInventario": false
    }
  ],
  "totales": {
    "subtotal": 119900,
    "totalImpuestos": 0,
    "totalDescuentos": 0,
    "total": 119900,
    "totalPagable": 119900,
    "totalIVA": 0,
    "totalBaseGravable": 0
  },
  "formasPagos": [
    {
      "codigo": "EF",
      "valor": 119900
    }
  ]
}
```

## Diferencias Clave según Tipo de Documento

| Campo | NIT (tipoId = '31') | Cédula (tipoId = '13') |
|-------|---------------------|------------------------|
| `tipoId` | '31' | '13' |
| `nombre1` | Primera palabra del nombre | Primera palabra del nombre |
| `apellido1` | Segunda palabra del nombre | Segunda palabra del nombre |
| `razonSocial` | ✅ Nombre completo del tenant | ❌ Cadena vacía '' |

## Notas Importantes

1. **Formato de Número:** Se cambia `INV-` por `001-` en el número de factura
2. **Formato de Fechas:** `YYYY-MM-DD HH:mm:ss`
3. **Sin Impuestos:** Todos los servicios son excluidos de IVA
4. **Forma de Pago:** Siempre se envía 'EF' (Efectivo) aunque el pago sea con tarjeta
5. **Ubicación:** Todos los clientes se registran en BARRANQUILLA por defecto
6. **Responsabilidad Fiscal:** Siempre 'O-13' (Gran contribuyente)

## Mejoras Potenciales

1. **Forma de Pago Real:** Capturar el método de pago real de Bold (tarjeta, PSE, etc.)
2. **Ubicación Real:** Usar la ubicación real del tenant en lugar de BARRANQUILLA
3. **Responsabilidades Fiscales:** Determinar responsabilidades según el tipo de cliente
4. **Dirección Real:** Capturar y usar la dirección real del cliente
