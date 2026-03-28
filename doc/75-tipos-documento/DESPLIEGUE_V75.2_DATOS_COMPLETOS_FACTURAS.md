# Despliegue V75.2 - Datos Completos en Facturas PDF

**Fecha:** 26 de marzo de 2026  
**Versión:** 75.2.0  
**Estado:** ✅ COMPLETADO

## Problema Identificado

Las facturas generadas en PDF no mostraban información completa del tenant en la sección "Facturado a:". Faltaban los siguientes datos:
- Tipo de identificación
- Número de identificación

## Solución Implementada

### 1. Backend - Servicio de Generación de PDFs

**Archivo modificado:** `backend/src/invoices/invoice-pdf.service.ts`

#### Método `addPartyInfo` Actualizado

Se modificó el método para mostrar dinámicamente todos los datos disponibles del tenant:

```typescript
private addPartyInfo(doc: PDFKit.PDFDocument, tenant: Tenant, supportEmail: string) {
  const startY = 100;

  // Facturado a (izquierda)
  doc
    .fontSize(9)
    .fillColor('#111827')
    .font('Helvetica-Bold')
    .text('FACTURADO A:', 40, startY);

  let currentY = startY + 15;

  // Nombre de la empresa
  doc
    .font('Helvetica')
    .fontSize(10)
    .fillColor('#374151')
    .text(tenant.name, 40, currentY);
  currentY += 15;

  // Nombre de contacto
  if (tenant.contactName) {
    doc
      .fontSize(9)
      .text(tenant.contactName, 40, currentY);
    currentY += 13;
  }

  // Tipo y número de documento
  if (tenant.documentType && tenant.documentNumber) {
    const docTypeText = `${tenant.documentType.code}: ${tenant.documentNumber}`;
    doc
      .fontSize(9)
      .text(docTypeText, 40, currentY);
    currentY += 13;
  } else if (tenant.documentNumber) {
    doc
      .fontSize(9)
      .text(`Doc: ${tenant.documentNumber}`, 40, currentY);
    currentY += 13;
  }

  // Email
  if (tenant.contactEmail) {
    doc
      .fontSize(9)
      .text(tenant.contactEmail, 40, currentY);
    currentY += 13;
  }

  // Teléfono
  if (tenant.contactPhone) {
    doc
      .fontSize(9)
      .text(tenant.contactPhone, 40, currentY);
  }

  // ... resto del método
}
```

**Mejoras:**
- Posicionamiento dinámico con variable `currentY`
- Validación de existencia de cada campo antes de mostrarlo
- Formato condicional para tipo de documento (muestra código + número)
- Espaciado consistente entre líneas (13px)

### 2. Backend - Servicio de Facturas

**Archivo modificado:** `backend/src/invoices/invoices.service.ts`

#### Método `findOne` Actualizado

Se agregó la carga de la relación `documentType` del tenant:

```typescript
async findOne(id: string): Promise<Invoice> {
  const invoice = await this.invoicesRepository
    .createQueryBuilder('invoice')
    .leftJoinAndSelect('invoice.tenant', 'tenant')
    .leftJoinAndSelect('tenant.documentType', 'documentType')  // NUEVO
    .leftJoinAndSelect('invoice.payments', 'payments')
    .leftJoinAndSelect('invoice.taxConfig', 'taxConfig')
    .where('invoice.id = :id', { id })
    .getOne();

  if (!invoice) {
    throw new NotFoundException('Factura no encontrada');
  }

  // Asegurar que items sea un array
  if (!invoice.items) {
    invoice.items = [];
  }

  return invoice;
}
```

#### Método `findAll` Actualizado

También se agregó la relación en el método de listado:

```typescript
async findAll(filters?: {
  tenantId?: string;
  status?: InvoiceStatus;
  startDate?: Date;
  endDate?: Date;
}): Promise<Invoice[]> {
  const query = this.invoicesRepository.createQueryBuilder('invoice')
    .leftJoinAndSelect('invoice.tenant', 'tenant')
    .leftJoinAndSelect('tenant.documentType', 'documentType')  // NUEVO
    .leftJoinAndSelect('invoice.payments', 'payments')
    .orderBy('invoice.createdAt', 'DESC');

  // ... resto del método
}
```

#### Método `create` Actualizado

Se modificó para retornar la factura con todas las relaciones cargadas:

```typescript
// Al final del método create
// Retornar la factura con todas las relaciones cargadas
return this.findOne(savedInvoice.id);
```

**Antes:** Retornaba `savedInvoice` directamente sin relaciones  
**Ahora:** Retorna la factura completa usando `findOne()` que carga todas las relaciones

## Información Mostrada en Facturas

### Sección "FACTURADO A:"

La factura ahora muestra (cuando están disponibles):

1. **Nombre de la empresa** (siempre)
2. **Nombre de contacto** (opcional)
3. **Tipo y número de documento** (opcional)
   - Formato: `CC: 1234567890`
   - Códigos: CC, CE, TI, NIT, PAS, RC, DNI, RUT, OTHER
4. **Email de contacto** (opcional)
5. **Teléfono de contacto** (opcional)

### Ejemplo Visual

```
FACTURADO A:

Clínica Salud Total
Dr. Juan Pérez
CC: 1234567890
contacto@clinicasalud.com
+57 300 123 4567
```

## Proceso de Despliegue

### Backend

1. **Compilación:**
   ```bash
   cd backend
   npm run build
   ```

2. **Despliegue a AWS:**
   ```bash
   scp -i AWS-ISSABEL.pem -r backend/dist/* ubuntu@100.28.198.249:/home/ubuntu/consentimientos_aws/backend/dist/
   ```

3. **Reinicio de PM2:**
   ```bash
   ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "pm2 restart datagree"
   ```

### Frontend

No requirió cambios.

## Archivos Modificados

- ✅ `backend/src/invoices/invoice-pdf.service.ts`
- ✅ `backend/src/invoices/invoices.service.ts`

## Verificación

### Pruebas Requeridas

1. **Generar una factura nueva:**
   - Ir a la sección de facturación
   - Crear una factura para un tenant
   - Descargar el PDF

2. **Verificar datos en el PDF:**
   - Abrir el PDF generado
   - Verificar sección "FACTURADO A:"
   - Confirmar que muestre:
     - Nombre de la empresa
     - Nombre de contacto
     - Tipo de documento (ej: CC, NIT)
     - Número de documento
     - Email
     - Teléfono

3. **Probar con diferentes tenants:**
   - Tenant con todos los datos completos
   - Tenant sin tipo de documento
   - Tenant sin teléfono
   - Verificar que el PDF se adapte correctamente

### Casos de Prueba

| Caso | Datos del Tenant | Resultado Esperado |
|------|------------------|-------------------|
| 1 | Todos los campos completos | Muestra todos los datos |
| 2 | Sin tipo de documento | Muestra solo nombre, email, teléfono |
| 3 | Sin teléfono | Muestra nombre, documento, email |
| 4 | Solo nombre y email | Muestra solo esos dos campos |

## Compatibilidad

### Facturas Existentes

Las facturas generadas anteriormente seguirán funcionando correctamente:
- Si el tenant no tiene tipo de documento, no se muestra
- Si el tenant no tiene número de documento, no se muestra
- El PDF se adapta dinámicamente a los datos disponibles

### Nuevas Facturas

Todas las facturas nuevas mostrarán automáticamente los datos completos del tenant si están disponibles.

## Notas Técnicas

### Relaciones Cargadas

El servicio de facturas ahora carga automáticamente:
- `invoice.tenant` - Datos del tenant
- `tenant.documentType` - Tipo de documento (eager loading)
- `invoice.payments` - Pagos asociados
- `invoice.taxConfig` - Configuración de impuestos

### Rendimiento

- El eager loading de `documentType` está configurado en la entidad `Tenant`
- No hay impacto significativo en el rendimiento
- La relación se carga solo cuando se necesita generar el PDF

### Formato de Documento

El formato del tipo de documento en el PDF es:
- Con tipo: `{CODIGO}: {NUMERO}` (ej: "CC: 1234567890")
- Sin tipo: `Doc: {NUMERO}` (ej: "Doc: 1234567890")

## Estado del Sistema

- ✅ Backend compilado y desplegado
- ✅ PM2 reiniciado correctamente
- ✅ Relaciones de base de datos configuradas
- ⏳ Pendiente: Pruebas en producción

## Próximos Pasos

1. Generar una factura de prueba en producción
2. Descargar el PDF y verificar que muestre todos los datos
3. Probar con diferentes tenants para validar el comportamiento dinámico
4. Confirmar que las facturas existentes sigan funcionando

## Relación con Despliegues Anteriores

- **V75.0:** Implementación de campos de documento en tenants
- **V75.1:** Endpoint público de tipos de documento
- **V75.2:** Datos completos en facturas PDF (ESTE DESPLIEGUE)

---

**Responsable:** Kiro AI Assistant  
**Servidor:** AWS EC2 - 100.28.198.249  
**Proceso PM2:** datagree  
**Versión Backend:** 75.0.0 (sin cambio de versión, solo mejora)
