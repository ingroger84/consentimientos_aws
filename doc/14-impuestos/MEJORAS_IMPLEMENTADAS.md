# Mejoras al Módulo de Impuestos

## Fecha: 2026-01-20
## Versión: 1.1.1

---

## 📋 Resumen de Mejoras

Se implementaron mejoras significativas al módulo de configuración de impuestos y se agregó soporte completo para facturas exentas de impuestos.

---

## 🎯 Funcionalidades Implementadas

### 1. Facturas Exentas de Impuestos

#### Backend
- **Nuevos campos en Invoice Entity**:
  - `taxExempt`: boolean (indica si la factura está exenta)
  - `taxExemptReason`: string (razón de la exención)

- **Validaciones**:
  - Si `taxExempt = true`, se requiere `taxExemptReason`
  - Si es exenta, no se calcula ni aplica impuesto
  - Si es exenta, no se asocia ningún `taxConfigId`

- **Lógica de Cálculo**:
  ```typescript
  if (taxExempt) {
    tax = 0
    total = amount
    taxConfigId = undefined
  } else {
    // Calcular impuesto según configuración
  }
  ```

#### Frontend
- **Interfaces actualizadas** en `invoices.service.ts`:
  - `Invoice` incluye `taxExempt`, `taxExemptReason`, `taxConfig`
  - `CreateInvoiceDto` incluye campos de exención

- **Visualización**:
  - Muestra "EXENTA" en lugar del monto de impuesto
  - Muestra la razón de exención en un badge verde
  - Muestra el nombre del impuesto aplicado (si no es exenta)

### 2. Mejoras en la UI de Configuración de Impuestos

#### Tipo de Aplicación
- **Antes**: Select dropdown simple
- **Ahora**: Radio buttons con descripciones y ejemplos visuales
  - Adicional al precio: "$100.000 + 19% = $119.000"
  - Incluido en el precio: "$119.000 incluye 19% ($19.000)"

#### Campo de Tasa
- **Mejoras**:
  - Símbolo "%" visible en el campo
  - Texto de ayuda con ejemplo
  - Validación de rango (0-100)

#### Validaciones
- Nombre requerido
- Tasa entre 0 y 100
- Mensajes de error claros

### 3. Migración de Base de Datos

#### Archivo SQL: `add-tax-exempt-columns.sql`
```sql
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS "taxExempt" boolean NOT NULL DEFAULT false;

ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS "taxExemptReason" text;
```

#### Migración TypeORM: `AddTaxExemptToInvoices1737417600000`
- Agrega columnas de forma segura
- Incluye método `down()` para rollback

---

## 📁 Archivos Modificados

### Backend
1. `backend/src/invoices/invoices.service.ts`
   - Lógica de facturas exentas
   - Validación de razón de exención
   - Cálculo condicional de impuestos

2. `backend/src/invoices/dto/create-invoice.dto.ts`
   - Campos `taxExempt` y `taxExemptReason`

3. `backend/src/invoices/entities/invoice.entity.ts`
   - Columnas `taxExempt` y `taxExemptReason`

### Frontend
1. `frontend/src/services/invoices.service.ts`
   - Interfaces actualizadas

2. `frontend/src/pages/TaxConfigPage.tsx`
   - UI mejorada con radio buttons
   - Validaciones adicionales
   - Mejor UX

3. `frontend/src/pages/InvoicesPage.tsx`
   - Visualización de facturas exentas
   - Muestra razón de exención

4. `frontend/src/pages/TenantInvoicesPage.tsx`
   - Visualización de facturas exentas
   - Interfaces actualizadas

### Migraciones
1. `backend/add-tax-exempt-columns.sql`
2. `backend/src/migrations/1737417600000-AddTaxExemptToInvoices.ts`

---

## 🚀 Cómo Usar

### Crear Factura Exenta de Impuestos

```typescript
const invoice = await invoicesService.create({
  tenantId: 'tenant-id',
  taxExempt: true,
  taxExemptReason: 'Organización sin fines de lucro',
  amount: 100000,
  total: 100000, // Sin impuesto
  // ... otros campos
});
```

### Crear Factura con Impuesto Específico

```typescript
const invoice = await invoicesService.create({
  tenantId: 'tenant-id',
  taxConfigId: 'tax-config-id', // Impuesto específico
  taxExempt: false,
  amount: 100000,
  // tax y total se calculan automáticamente
  // ... otros campos
});
```

### Crear Factura con Impuesto por Defecto

```typescript
const invoice = await invoicesService.create({
  tenantId: 'tenant-id',
  // No se especifica taxConfigId, usa el default
  taxExempt: false,
  amount: 100000,
  // tax y total se calculan automáticamente
  // ... otros campos
});
```

---

## 🔧 Instalación de Migración

### Opción 1: SQL Directo
```bash
cd backend
psql -U postgres -d nombre_base_datos -f add-tax-exempt-columns.sql
```

### Opción 2: TypeORM Migration
```bash
cd backend
npm run migration:run
```

---

## ✅ Validaciones Implementadas

1. **Factura Exenta**:
   - Si `taxExempt = true`, `taxExemptReason` es obligatorio
   - No se puede especificar `taxConfigId` si es exenta

2. **Configuración de Impuesto**:
   - Nombre no puede estar vacío
   - Tasa debe estar entre 0 y 100
   - Solo puede haber un impuesto por defecto

3. **Cálculo de Impuestos**:
   - Si no hay configuración activa, usa fallback (19%)
   - Respeta el tipo de aplicación (incluido/adicional)

---

## 📊 Ejemplos de Visualización

### Factura Normal
```
Subtotal:     $100.000
IVA (19%):    $ 19.000
─────────────────────
Total:        $119.000
```

### Factura Exenta
```
Subtotal:     $100.000
Impuesto:     EXENTA
─────────────────────
Total:        $100.000

[Badge Verde]
Factura Exenta de Impuestos
Razón: Organización sin fines de lucro
```

---

## 🎨 Mejores Prácticas Aplicadas

1. **Separación de Responsabilidades**:
   - Lógica de negocio en el servicio
   - Validaciones en DTOs
   - Cálculos centralizados

2. **Validación en Múltiples Capas**:
   - DTOs (class-validator)
   - Servicios (lógica de negocio)
   - Frontend (UX)

3. **Mensajes Claros**:
   - Errores descriptivos
   - Ayudas contextuales
   - Ejemplos visuales

4. **Flexibilidad**:
   - Soporte para múltiples impuestos
   - Facturas exentas
   - Impuesto por defecto

5. **Migración Segura**:
   - `IF NOT EXISTS` en SQL
   - Valores por defecto
   - Método de rollback

---

## 🔄 Próximas Mejoras Sugeridas

1. **Formulario de Creación de Facturas**:
   - Agregar checkbox "Factura Exenta"
   - Campo de razón de exención
   - Selector de impuesto

2. **Reportes**:
   - Facturas exentas vs. gravadas
   - Total de impuestos recaudados
   - Análisis por tipo de impuesto

3. **Auditoría**:
   - Log de cambios en configuración de impuestos
   - Historial de facturas exentas

4. **Validaciones Adicionales**:
   - Límite de facturas exentas por tenant
   - Aprobación de facturas exentas

---

## 📝 Notas Importantes

- Las facturas existentes no se ven afectadas (default: `taxExempt = false`)
- El sistema mantiene compatibilidad con facturas antiguas
- Los cálculos de impuestos son retrocompatibles
- La migración es segura y reversible

---

## 🐛 Solución de Problemas

### Error: "Debe proporcionar una razón para la exención"
**Solución**: Asegúrate de incluir `taxExemptReason` cuando `taxExempt = true`

### Error: "No se puede eliminar el impuesto por defecto"
**Solución**: Establece otro impuesto como predeterminado antes de eliminar

### Las columnas ya existen
**Solución**: El script SQL usa `IF NOT EXISTS`, es seguro ejecutarlo múltiples veces

---

## 📞 Soporte

Para preguntas o problemas, consulta la documentación completa en:
- `doc/14-impuestos/README.md`
- `doc/14-impuestos/EJEMPLOS.md`
