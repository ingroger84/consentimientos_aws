# Análisis: Integración DynamiaERP - Facturación Electrónica

**Fecha:** 27 de marzo de 2026  
**Objetivo:** Generar facturas electrónicas en DynamiaERP cuando se crea una factura para un tenant

---

## 📋 RESUMEN DE LA API DYNAMIAERP

### Endpoint Principal
```
POST /api/ventas/facturaElectronica
```

### Autenticación
```
POST /api/seguridad/gettoken
Body: {
  "username": "string",
  "password": "string",
  "domain": "string"  // Subdominio de la cuenta
}

Response: {
  "token": "string",
  "accountId": number,
  "accountName": "string",
  "accountSubdomain": "string"
}
```

El token se usa en el header: `Authorization: Bearer {token}`

---

## 📊 ESTRUCTURA DE FACTURA ELECTRÓNICA

### DocumentoElectronico (Request Body)

```typescript
{
  // Identificación del documento
  "tipo": "FACTURA",  // Tipo de documento
  "tipoDoc": "FACTURA",  // Enum: FACTURA, NOTA_CREDITO, NOTA_DEBITO
  "numero": "INV-202603-1234",  // Número de factura
  "consecutivo": "1234",  // Consecutivo
  "prefijo": "INV",  // Prefijo
  "fecha": "2026-03-27T00:00:00Z",  // Fecha de emisión
  "fechaVencimiento": "2026-04-27T00:00:00Z",  // Fecha de vencimiento
  
  // Cliente (REQUERIDO)
  "cliente": {
    "identificacion": "900123456",  // NIT o documento
    "tipoId": "31",  // Código tipo documento (31=NIT, 13=CC, etc)
    "razonSocial": "Demo Médico SAS",  // Razón social o nombre completo
    "email": "proyectos@innovasystems.com.co",
    "telefono": "3001234567",
    "direccion": "Calle 123 #45-67",
    "ciudad": "Bogotá",
    "codigoCiudad": "11001",  // Código DANE
    "departamento": "Cundinamarca",
    "codigoDepartamento": "11",
    "pais": "Colombia",
    "codigoPais": "CO",
    "responsabilidades": ["O-13"],  // Responsabilidades fiscales
    "esquemaImpuesto": "IVA"  // IVA, INC, IVA_INC, NO_APLICA
  },
  
  // Detalles de la factura (items)
  "detalles": [
    {
      "codigo": "PLAN-BASIC",
      "nombre": "Plan Basic - Mensual",
      "descripcion": "Suscripción mensual al plan Basic",
      "cantidad": 1,
      "valorUnitario": 50000,
      "subtotal": 50000,
      "valorImpuesto": 9500,  // IVA 19%
      "porcentajeImpuesto": 19,
      "baseImpuesto": 50000,
      "valorDescuento": 0,
      "porcentajeDescuento": 0,
      "total": 59500,
      "impuesto": "IVA",
      "impuestoIncluido": false
    }
  ],
  
  // Totales (REQUERIDO)
  "totales": {
    "subtotal": 50000,
    "totalImpuestos": 9500,
    "totalDescuentos": 0,
    "total": 59500,
    "totalPagable": 59500,
    "totalIVA": 9500,
    "totalBaseGravable": 50000
  },
  
  // Opcional
  "observaciones": "Factura generada automáticamente por el sistema",
  "emailsAdicionales": []  // Emails adicionales para envío
}
```

### Respuesta de la API

```typescript
{
  "numero": "INV-202603-1234",
  "id": 12345,
  "uuid": "abc-123-def",
  "cufe": "abc123def456...",  // Código único de factura electrónica
  "estado": "ENVIADA",
  "qr": "data:image/png;base64,...",  // Código QR
  "mensaje": "Factura enviada exitosamente",
  "valido": true,
  "enviada": true,
  "errores": []
}
```

---

## 🔄 FLUJO DE INTEGRACIÓN PROPUESTO

### 1. Cuando se genera una factura en tu sistema

```
InvoicesService.create() o InvoicesService.generateMonthlyInvoice()
  ↓
Crear factura en BD local
  ↓
Llamar a DynamiaERPService.createElectronicInvoice()
  ↓
Guardar CUFE y datos de respuesta en la factura
```

### 2. Mapeo de datos

**Tu sistema → DynamiaERP:**

| Campo Tuyo | Campo DynamiaERP | Notas |
|------------|------------------|-------|
| `invoice.invoiceNumber` | `numero` | INV-202603-1234 |
| `invoice.createdAt` | `fecha` | Fecha de emisión |
| `invoice.dueDate` | `fechaVencimiento` | Fecha de vencimiento |
| `tenant.documentNumber` | `cliente.identificacion` | NIT/CC del tenant |
| `tenant.documentType.code` | `cliente.tipoId` | Código tipo documento |
| `tenant.name` | `cliente.razonSocial` | Nombre del tenant |
| `tenant.contactEmail` | `cliente.email` | Email del tenant |
| `tenant.contactPhone` | `cliente.telefono` | Teléfono |
| `invoice.items[]` | `detalles[]` | Items de la factura |
| `invoice.amount` | `totales.subtotal` | Subtotal sin IVA |
| `invoice.tax` | `totales.totalIVA` | IVA calculado |
| `invoice.total` | `totales.totalPagable` | Total a pagar |

---

## ⚠️ DATOS FALTANTES EN TU SISTEMA

Para generar facturas electrónicas válidas en Colombia, necesitas agregar estos campos a la tabla `tenants`:

### Campos Obligatorios Faltantes:

1. **Dirección completa:**
   - `address` (dirección)
   - `city` (ciudad)
   - `cityCode` (código DANE de ciudad)
   - `department` (departamento)
   - `departmentCode` (código DANE de departamento)
   - `country` (país, default: "Colombia")
   - `countryCode` (código país, default: "CO")

2. **Responsabilidades fiscales:**
   - `taxResponsibilities` (array de códigos, ej: ["O-13", "R-99-PN"])
   - Códigos comunes:
     - `O-13`: Gran contribuyente
     - `O-15`: Autorretenedor
     - `O-23`: Agente de retención IVA
     - `O-47`: Régimen simple de tributación
     - `R-99-PN`: No responsable de IVA

3. **Esquema de impuestos:**
   - `taxScheme` (enum: "IVA", "INC", "IVA_INC", "NO_APLICA")

---

## 🔧 IMPLEMENTACIÓN NECESARIA

### 1. Crear servicio de integración

```typescript
// backend/src/dynamiaerp/dynamiaerp.service.ts
@Injectable()
export class DynamiaErpService {
  private apiUrl: string;
  private token: string;
  
  constructor(private httpService: HttpService) {
    this.apiUrl = process.env.DYNAMIAERP_API_URL;
  }
  
  async authenticate(): Promise<string> {
    // Autenticar y obtener token
  }
  
  async createElectronicInvoice(invoice: Invoice, tenant: Tenant): Promise<any> {
    // Crear factura electrónica
  }
  
  async getInvoiceStatus(cufe: string): Promise<any> {
    // Consultar estado de factura
  }
  
  async sendInvoiceEmail(cufe: string, emails: string[]): Promise<any> {
    // Enviar factura por email
  }
}
```

### 2. Modificar entidad Invoice

```typescript
// Agregar campos para DynamiaERP
@Column({ nullable: true })
dynamiaerpCufe: string;  // Código único de factura electrónica

@Column({ nullable: true })
dynamiaerpId: number;  // ID en DynamiaERP

@Column({ nullable: true })
dynamiaerpStatus: string;  // Estado en DynamiaERP

@Column({ type: 'text', nullable: true })
dynamiaerpQr: string;  // Código QR de la factura

@Column({ type: 'timestamp', nullable: true })
dynamiaerpSentAt: Date;  // Fecha de envío a DIAN
```

### 3. Modificar entidad Tenant

```typescript
// Agregar campos para facturación electrónica
@Column({ nullable: true })
address: string;

@Column({ nullable: true })
city: string;

@Column({ nullable: true })
cityCode: string;  // Código DANE

@Column({ nullable: true })
department: string;

@Column({ nullable: true })
departmentCode: string;  // Código DANE

@Column({ default: 'Colombia' })
country: string;

@Column({ default: 'CO' })
countryCode: string;

@Column({ type: 'jsonb', nullable: true })
taxResponsibilities: string[];  // ["O-13", "R-99-PN"]

@Column({ default: 'IVA' })
taxScheme: string;  // IVA, INC, IVA_INC, NO_APLICA
```

### 4. Integrar en el flujo de creación de facturas

```typescript
// En InvoicesService.create() o generateMonthlyInvoice()
async create(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
  // ... código existente para crear factura local ...
  
  // Enviar a DynamiaERP
  try {
    const dynamiaerpResponse = await this.dynamiaerpService.createElectronicInvoice(
      invoice,
      tenant
    );
    
    // Actualizar factura con datos de DynamiaERP
    invoice.dynamiaerpCufe = dynamiaerpResponse.cufe;
    invoice.dynamiaerpId = dynamiaerpResponse.id;
    invoice.dynamiaerpStatus = dynamiaerpResponse.estado;
    invoice.dynamiaerpQr = dynamiaerpResponse.qr;
    invoice.dynamiaerpSentAt = new Date();
    
    await this.invoicesRepository.save(invoice);
  } catch (error) {
    // Log error pero no fallar la creación de factura local
    console.error('Error al enviar factura a DynamiaERP:', error);
  }
  
  return invoice;
}
```

---

## 🔐 CONFIGURACIÓN REQUERIDA

### Variables de entorno (.env)

```bash
# DynamiaERP API Configuration
DYNAMIAERP_API_URL=https://api.dynamiaerp.co
DYNAMIAERP_USERNAME=tu_usuario
DYNAMIAERP_PASSWORD=tu_password
DYNAMIAERP_DOMAIN=tu_subdominio
```

---

## ✅ CONFIRMACIÓN DE DATOS NECESARIOS

Para proceder con la implementación, necesito que me proporciones:

1. **URL de la cuenta DynamiaERP:** (ej: https://tuempresa.dynamiaerp.co)
2. **Usuario de API:** Usuario con permisos para crear facturas
3. **Contraseña de API:** Contraseña del usuario
4. **Subdominio/Domain:** El subdominio de tu cuenta (ej: "tuempresa")

---

## 📝 NOTAS IMPORTANTES

1. **Validación de datos:** Antes de enviar a DynamiaERP, validar que el tenant tenga todos los datos requeridos
2. **Manejo de errores:** Si falla el envío a DynamiaERP, la factura local se crea igual pero se marca como "pendiente de envío"
3. **Reintentos:** Implementar un sistema de reintentos para facturas que fallaron al enviarse
4. **Logs:** Registrar todas las interacciones con la API de DynamiaERP para auditoría
5. **Testing:** Usar el servidor de pruebas primero: `http://api.localhost.com:8282`

---

## 🚀 PRÓXIMOS PASOS

1. Confirmar credenciales de DynamiaERP
2. Crear migración para agregar campos faltantes a `tenants` e `invoices`
3. Implementar `DynamiaErpService`
4. Crear módulo `DynamiaErpModule`
5. Integrar en el flujo de creación de facturas
6. Probar en ambiente de desarrollo
7. Desplegar a producción

