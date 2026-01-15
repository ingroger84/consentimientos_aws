# Sistema de Gestión de Impuestos para Facturación

## Descripción

Se implementó un sistema completo de gestión de impuestos para el módulo de facturación que permite al super admin crear, editar y configurar diferentes tipos de impuestos con dos modalidades de aplicación:

1. **Impuesto Incluido**: El monto ya incluye el impuesto (el sistema calcula cuánto es el impuesto dentro del total)
2. **Impuesto Adicional**: El impuesto se suma al monto base

## Características Implementadas

### Backend

#### 1. Entidad TaxConfig
- **Ubicación**: `backend/src/invoices/entities/tax-config.entity.ts`
- **Campos**:
  - `name`: Nombre del impuesto (ej: "IVA 19%")
  - `rate`: Tasa del impuesto (0-100%)
  - `applicationType`: Tipo de aplicación (included/additional)
  - `isActive`: Si el impuesto está activo
  - `isDefault`: Si es el impuesto por defecto
  - `description`: Descripción opcional

#### 2. Servicio TaxConfigService
- **Ubicación**: `backend/src/invoices/tax-config.service.ts`
- **Métodos principales**:
  - `create()`: Crear nueva configuración de impuesto
  - `findAll()`: Obtener todas las configuraciones
  - `findActive()`: Obtener solo configuraciones activas
  - `findDefault()`: Obtener configuración por defecto
  - `update()`: Actualizar configuración
  - `remove()`: Eliminar configuración
  - `setDefault()`: Establecer como predeterminado
  - `calculateTax()`: Calcular impuesto según tipo de aplicación

#### 3. Endpoints API
- `POST /api/invoices/tax-configs` - Crear impuesto
- `GET /api/invoices/tax-configs` - Listar todos
- `GET /api/invoices/tax-configs/active` - Listar activos
- `GET /api/invoices/tax-configs/default` - Obtener predeterminado
- `GET /api/invoices/tax-configs/:id` - Obtener por ID
- `PATCH /api/invoices/tax-configs/:id` - Actualizar
- `DELETE /api/invoices/tax-configs/:id` - Eliminar
- `PATCH /api/invoices/tax-configs/:id/set-default` - Establecer como predeterminado
- `POST /api/invoices/tax-configs/:id/calculate` - Calcular impuesto

#### 4. Integración con Facturas
- Se agregó campo `taxConfigId` a la entidad Invoice
- El servicio de facturas usa automáticamente el impuesto por defecto si no se especifica uno
- El cálculo de impuestos se realiza según la configuración seleccionada

### Frontend

#### 1. Página de Configuración de Impuestos
- **Ubicación**: `frontend/src/pages/TaxConfigPage.tsx`
- **Características**:
  - Vista de tarjetas con todas las configuraciones
  - Indicador visual del impuesto predeterminado (estrella)
  - Modal para crear/editar configuraciones
  - Botones de acción: Editar, Eliminar, Establecer como predeterminado
  - Validación de formularios
  - Mensajes de éxito/error

#### 2. Servicio Frontend
- **Ubicación**: `frontend/src/services/tax-config.service.ts`
- Métodos para todas las operaciones CRUD
- Método para calcular impuestos
- Helpers para formateo y etiquetas

#### 3. Navegación
- Nuevo enlace "Impuestos" en el menú lateral (solo para super admin)
- Ícono: Percent (%)
- Ruta: `/tax-config`

### Base de Datos

#### Tabla tax_configs
```sql
CREATE TABLE tax_configs (
  id uuid PRIMARY KEY,
  name varchar UNIQUE NOT NULL,
  rate decimal(5,2) NOT NULL,
  applicationType varchar NOT NULL DEFAULT 'additional',
  isActive boolean DEFAULT true,
  isDefault boolean DEFAULT false,
  description text,
  createdAt timestamp DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp DEFAULT CURRENT_TIMESTAMP
);
```

#### Modificación a tabla invoices
```sql
ALTER TABLE invoices ADD COLUMN taxConfigId uuid;
ALTER TABLE invoices ADD CONSTRAINT FK_invoices_taxConfigId
  FOREIGN KEY (taxConfigId) REFERENCES tax_configs(id) ON DELETE SET NULL;
```

## Tipos de Aplicación de Impuestos

### 1. Impuesto Adicional (additional)
El impuesto se suma al monto base:
- **Ejemplo**: Monto base = $100, Impuesto 19%
- **Cálculo**: $100 + ($100 × 0.19) = $119
- **Resultado**: Base: $100, Impuesto: $19, Total: $119

### 2. Impuesto Incluido (included)
El monto ya incluye el impuesto:
- **Ejemplo**: Monto total = $119, Impuesto 19%
- **Cálculo**: Base = $119 / 1.19 = $100, Impuesto = $119 - $100 = $19
- **Resultado**: Base: $100, Impuesto: $19, Total: $119

## Configuración Inicial

El sistema viene con una configuración de impuesto por defecto:
- **Nombre**: IVA 19%
- **Tasa**: 19%
- **Tipo**: Adicional
- **Estado**: Activo
- **Predeterminado**: Sí

## Uso

### Para Super Admin

1. **Acceder a Configuración de Impuestos**:
   - Ir al menú lateral → "Impuestos"

2. **Crear Nuevo Impuesto**:
   - Click en "Nuevo Impuesto"
   - Completar formulario:
     - Nombre (ej: "IVA 5%")
     - Tasa (ej: 5.00)
     - Tipo de aplicación
     - Descripción (opcional)
     - Marcar como activo
     - Marcar como predeterminado (opcional)
   - Click en "Crear"

3. **Editar Impuesto**:
   - Click en ícono de editar en la tarjeta del impuesto
   - Modificar campos necesarios
   - Click en "Actualizar"

4. **Establecer como Predeterminado**:
   - Click en "Establecer como predeterminado" en la tarjeta del impuesto
   - Solo puede haber un impuesto predeterminado a la vez

5. **Eliminar Impuesto**:
   - Click en ícono de eliminar
   - Confirmar eliminación
   - **Nota**: No se puede eliminar el impuesto predeterminado

### Para Facturación

Al crear una factura:
- Si no se especifica un impuesto, se usa el predeterminado
- El sistema calcula automáticamente el impuesto según la configuración
- El tipo de aplicación determina cómo se calcula el total

## Archivos Creados/Modificados

### Backend
- ✅ `backend/src/invoices/entities/tax-config.entity.ts` (nuevo)
- ✅ `backend/src/invoices/tax-config.service.ts` (nuevo)
- ✅ `backend/src/invoices/dto/create-tax-config.dto.ts` (nuevo)
- ✅ `backend/src/invoices/dto/update-tax-config.dto.ts` (nuevo)
- ✅ `backend/src/invoices/invoices.module.ts` (modificado)
- ✅ `backend/src/invoices/invoices.controller.ts` (modificado)
- ✅ `backend/src/invoices/invoices.service.ts` (modificado)
- ✅ `backend/src/invoices/entities/invoice.entity.ts` (modificado)
- ✅ `backend/src/invoices/dto/create-invoice.dto.ts` (modificado)
- ✅ `backend/create-tax-config-table.sql` (script SQL)
- ✅ `backend/scripts/create-tax-config.js` (script de migración)

### Frontend
- ✅ `frontend/src/pages/TaxConfigPage.tsx` (nuevo)
- ✅ `frontend/src/services/tax-config.service.ts` (nuevo)
- ✅ `frontend/src/App.tsx` (modificado)
- ✅ `frontend/src/components/Layout.tsx` (modificado)

## Mejores Prácticas Implementadas

1. **Validación de Datos**:
   - DTOs con validadores class-validator
   - Validación de rangos (0-100% para tasas)
   - Validación de unicidad de nombres

2. **Seguridad**:
   - Solo super admin puede gestionar impuestos
   - Guards de autenticación y roles
   - Validación de permisos en endpoints

3. **Usabilidad**:
   - Interfaz intuitiva con tarjetas visuales
   - Indicadores claros del impuesto predeterminado
   - Mensajes de confirmación para acciones destructivas
   - Tooltips y descripciones explicativas

4. **Mantenibilidad**:
   - Código modular y reutilizable
   - Servicios separados por responsabilidad
   - Tipado fuerte con TypeScript
   - Documentación inline

5. **Escalabilidad**:
   - Soporte para múltiples configuraciones de impuestos
   - Fácil agregar nuevos tipos de aplicación
   - Índices en base de datos para búsquedas rápidas

## Próximas Mejoras Sugeridas

1. **Historial de Cambios**: Registrar cambios en configuraciones de impuestos
2. **Impuestos Compuestos**: Soporte para múltiples impuestos en una factura
3. **Impuestos por Región**: Configurar impuestos diferentes según ubicación
4. **Validación de Fechas**: Impuestos válidos en rangos de fechas específicos
5. **Reportes**: Dashboard con estadísticas de impuestos aplicados

## Notas Técnicas

- La tasa de impuesto se almacena como decimal(5,2) permitiendo hasta 999.99%
- El cálculo de impuestos incluidos usa la fórmula: base = total / (1 + rate/100)
- Solo puede haber un impuesto marcado como predeterminado
- Al eliminar un impuesto, las facturas existentes mantienen su referencia (ON DELETE SET NULL)
- Las facturas sin impuesto asignado usan el predeterminado al momento de creación
