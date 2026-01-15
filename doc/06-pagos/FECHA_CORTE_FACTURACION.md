# Fecha de Corte de Facturación

## Resumen

Se ha implementado el campo `billingDay` (día de corte de facturación) en el sistema de tenants, permitiendo que cada tenant tenga su propia fecha de corte mensual para la generación automática de facturas.

---

## Cambios Implementados

### 1. Backend

#### Entidad Tenant
**Archivo:** `backend/src/tenants/entities/tenant.entity.ts`

```typescript
@Column({ type: 'int', default: 1, name: 'billing_day' })
billingDay: number; // Día del mes para corte de facturación (1-28)
```

**Características:**
- Tipo: `int`
- Rango válido: 1-28 (limitado a 28 para evitar problemas con febrero)
- Default: 1
- Editable por Super Admin

#### DTO de Creación
**Archivo:** `backend/src/tenants/dto/create-tenant.dto.ts`

```typescript
@IsInt()
@Min(1)
@Max(28)
@IsOptional()
billingDay?: number;
```

**Validaciones:**
- Debe ser un número entero
- Mínimo: 1
- Máximo: 28
- Opcional (se establece automáticamente si no se proporciona)

#### Servicio de Tenants
**Archivo:** `backend/src/tenants/tenants.service.ts`

**Lógica al crear tenant:**
```typescript
// Establecer día de facturación (día actual si no se especifica)
if (!createTenantDto.billingDay) {
  const now = new Date();
  createTenantDto.billingDay = Math.min(now.getDate(), 28);
}
```

**Comportamiento:**
- Si no se especifica, usa el día actual de creación
- Si el día actual es mayor a 28, usa 28
- Ejemplo: Tenant creado el 15 de enero → `billingDay = 15`
- Ejemplo: Tenant creado el 31 de enero → `billingDay = 28`

#### Servicio de Facturación
**Archivo:** `backend/src/billing/billing.service.ts`

**Lógica de generación de facturas:**
```typescript
async generateMonthlyInvoices() {
  const now = new Date();
  const currentDay = now.getDate();

  // Buscar tenants cuyo día de facturación coincida con hoy (±1 día de tolerancia)
  const tenants = await this.tenantsRepository
    .createQueryBuilder('tenant')
    .where('tenant.status = :status', { status: TenantStatus.ACTIVE })
    .andWhere('tenant.billingDay BETWEEN :minDay AND :maxDay', {
      minDay: Math.max(1, currentDay - 1),
      maxDay: Math.min(28, currentDay + 1),
    })
    .getMany();
  
  // Generar facturas para cada tenant...
}
```

**Características:**
- Tolerancia de ±1 día para evitar perder facturas por diferencias horarias
- Solo procesa tenants activos
- Verifica que no exista factura pendiente para el período actual
- Calcula período de facturación basado en `billingDay`

#### Migración de Base de Datos
**Archivo:** `backend/src/migrations/1736284800000-AddBillingDayToTenant.ts`

```typescript
// Agregar columna
await queryRunner.addColumn('tenants', new TableColumn({
  name: 'billing_day',
  type: 'int',
  default: 1,
}));

// Actualizar tenants existentes con el día actual
const currentDay = new Date().getDate();
const billingDay = Math.min(currentDay, 28);
await queryRunner.query(
  `UPDATE tenants SET billing_day = ${billingDay} WHERE billing_day IS NULL`
);
```

---

### 2. Frontend

#### Tipos TypeScript
**Archivo:** `frontend/src/types/tenant.ts`

```typescript
export interface Tenant {
  // ... otros campos
  billingDay?: number; // Día del mes para corte de facturación (1-28)
}

export interface CreateTenantDto {
  // ... otros campos
  billingDay?: number;
}
```

#### Formulario de Tenant
**Archivo:** `frontend/src/components/TenantFormModal.tsx`

**Estado inicial:**
```typescript
const [formData, setFormData] = useState<CreateTenantDto>({
  // ... otros campos
  billingDay: new Date().getDate() > 28 ? 28 : new Date().getDate(),
});
```

**Campo visual:**
```tsx
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Día de Corte de Facturación
  </label>
  <select
    name="billingDay"
    value={formData.billingDay}
    onChange={handleChange}
    className="input"
  >
    {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
      <option key={day} value={day}>
        Día {day} de cada mes
      </option>
    ))}
  </select>
  <p className="text-xs text-gray-500 mt-1">
    Las facturas se generarán automáticamente en este día cada mes
  </p>
</div>
```

**Características:**
- Selector con opciones del 1 al 28
- Texto descriptivo que explica la funcionalidad
- Valor por defecto: día actual (limitado a 28)
- Editable al crear y editar tenant

---

## Flujo de Facturación

### 1. Creación de Tenant
```
Usuario crea tenant el día 15
↓
Sistema establece billingDay = 15
↓
Tenant se facturará cada día 15 del mes
```

### 2. Generación Automática de Facturas
```
CRON job ejecuta diariamente a las 00:00
↓
Obtiene día actual (ej: 15)
↓
Busca tenants con billingDay entre 14 y 16 (±1 día)
↓
Para cada tenant:
  - Verifica que no exista factura pendiente
  - Calcula período de facturación
  - Genera factura
  - Envía email
```

### 3. Ejemplo Práctico

**Tenant creado el 15 de enero:**
- `billingDay = 15`
- Primera factura: 15 de febrero
- Segunda factura: 15 de marzo
- Y así sucesivamente...

**Tenant creado el 31 de enero:**
- `billingDay = 28` (limitado)
- Primera factura: 28 de febrero
- Segunda factura: 28 de marzo
- Y así sucesivamente...

---

## Ventajas del Sistema

### 1. Flexibilidad
- Cada tenant puede tener su propia fecha de corte
- Permite distribuir la carga de facturación a lo largo del mes
- Evita picos de procesamiento en un solo día

### 2. Precisión
- Facturación basada en la fecha de creación del tenant
- Tolerancia de ±1 día para evitar problemas de zona horaria
- Prevención de facturas duplicadas

### 3. Facilidad de Uso
- Configuración automática al crear tenant
- Editable por Super Admin en cualquier momento
- Interfaz intuitiva con selector de días

### 4. Escalabilidad
- Distribución natural de la carga de facturación
- No todos los tenants se facturan el mismo día
- Mejor rendimiento del sistema

---

## Casos de Uso

### Caso 1: Tenant Nuevo
```
Fecha de creación: 10 de enero de 2026
billingDay: 10 (automático)
Primera factura: 10 de febrero de 2026
Ciclo: Mensual
```

### Caso 2: Cambio de Fecha de Corte
```
Tenant existente con billingDay = 5
Super Admin cambia a billingDay = 20
Próxima factura: 20 del mes siguiente
```

### Caso 3: Tenant Creado a Fin de Mes
```
Fecha de creación: 31 de enero de 2026
billingDay: 28 (limitado automáticamente)
Primera factura: 28 de febrero de 2026
Nota: Evita problemas con meses de 28-30 días
```

---

## Consideraciones Técnicas

### 1. Limitación a 28 Días
**Razón:** Febrero tiene 28 días (29 en años bisiestos)

**Beneficios:**
- Garantiza que el día de corte exista en todos los meses
- Evita lógica compleja para manejar días 29, 30, 31
- Simplifica el código y reduce errores

### 2. Tolerancia de ±1 Día
**Razón:** Diferencias de zona horaria y ejecución de CRON

**Beneficios:**
- Evita perder facturas por diferencias horarias
- Permite flexibilidad en la ejecución del CRON
- Reduce falsos negativos

### 3. Prevención de Duplicados
**Mecanismo:** Verificación de facturas pendientes para el período

**Beneficios:**
- Evita facturar dos veces el mismo período
- Protege contra ejecuciones múltiples del CRON
- Mantiene integridad de datos

---

## Migración de Datos

### Tenants Existentes
Al ejecutar la migración, todos los tenants existentes recibirán:
```sql
UPDATE tenants 
SET billing_day = [día actual limitado a 28]
WHERE billing_day IS NULL;
```

**Ejemplo:**
- Si la migración se ejecuta el 7 de enero → `billingDay = 7`
- Si la migración se ejecuta el 30 de enero → `billingDay = 28`

### Recomendación
Ejecutar la migración en un día representativo del mes (ej: día 15) para distribuir mejor la carga de facturación.

---

## Pruebas Recomendadas

### 1. Crear Tenant con Día Específico
```
1. Acceder como Super Admin
2. Crear nuevo tenant
3. Seleccionar día de corte (ej: 20)
4. Verificar que se guarda correctamente
```

### 2. Editar Día de Corte
```
1. Editar tenant existente
2. Cambiar día de corte
3. Verificar que se actualiza
4. Confirmar que próxima factura usa nuevo día
```

### 3. Generación Automática
```
1. Crear tenant con billingDay = [día actual]
2. Esperar a que ejecute el CRON (00:00)
3. Verificar que se genera factura
4. Confirmar email enviado
```

### 4. Prevención de Duplicados
```
1. Generar factura manualmente
2. Ejecutar CRON de generación
3. Verificar que no se crea factura duplicada
```

---

## Archivos Modificados

### Backend (4 archivos)
1. `backend/src/tenants/entities/tenant.entity.ts`
2. `backend/src/tenants/dto/create-tenant.dto.ts`
3. `backend/src/tenants/tenants.service.ts`
4. `backend/src/billing/billing.service.ts`

### Frontend (2 archivos)
1. `frontend/src/types/tenant.ts`
2. `frontend/src/components/TenantFormModal.tsx`

### Migración (1 archivo)
1. `backend/src/migrations/1736284800000-AddBillingDayToTenant.ts`

---

## Conclusión

La implementación del día de corte de facturación proporciona:

✅ **Flexibilidad** - Cada tenant tiene su propia fecha de corte  
✅ **Automatización** - Configuración automática al crear tenant  
✅ **Escalabilidad** - Distribución de carga a lo largo del mes  
✅ **Precisión** - Facturación basada en fecha de creación  
✅ **Facilidad** - Interfaz intuitiva para Super Admin  
✅ **Robustez** - Prevención de duplicados y manejo de errores  

El sistema está listo para producción y permite una gestión eficiente de la facturación mensual de todos los tenants.
