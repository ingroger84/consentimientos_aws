# Sesión 2026-01-27: Ampliación de Recursos Monitoreables en Tenants

## Objetivo

Ampliar la visualización de recursos en las tablas de tenants para mostrar todos los recursos disponibles y monitoreables, incluyendo:
- Usuarios
- Sedes
- Servicios
- Consentimientos CN
- Historias Clínicas (próximamente)
- Clientes (próximamente)
- Plantillas CN (próximamente)
- Plantillas HC (próximamente)

## Cambios Implementados

### 1. Backend - Entidad Tenant

**Archivo**: `backend/src/tenants/entities/tenant.entity.ts`

**Mejoras**:
- ✅ Agregadas relaciones con `MedicalRecord` y `MedicalRecordConsent`
- ✅ Imports de las nuevas entidades

**Código**:
```typescript
import { MedicalRecord } from '../../medical-records/entities/medical-record.entity';
import { MedicalRecordConsent } from '../../medical-records/entities/medical-record-consent.entity';

// ...

@OneToMany(() => MedicalRecord, (medicalRecord) => medicalRecord.tenant)
medicalRecords: MedicalRecord[];

@OneToMany(() => MedicalRecordConsent, (mrConsent) => mrConsent.medicalRecord)
medicalRecordConsents: MedicalRecordConsent[];
```

### 2. Backend - Servicio de Tenants

**Archivo**: `backend/src/tenants/tenants.service.ts`

**Mejoras**:
- ✅ Método `findAll()` actualizado para cargar `medicalRecords` y `clients`
- ✅ Conteo de consentimientos HC mediante query builder
- ✅ Manejo de errores con try-catch

**Código**:
```typescript
async findAll(): Promise<Tenant[]> {
  const tenants = await this.tenantsRepository.find({
    relations: ['users', 'branches', 'services', 'consents', 'clients', 'medicalRecords'],
    order: { createdAt: 'DESC' },
  });

  // Para cada tenant, contar los consentimientos HC
  for (const tenant of tenants) {
    try {
      const mrConsentsRepo = this.dataSource.getRepository('MedicalRecordConsent');
      const mrConsentsCount = await mrConsentsRepo
        .createQueryBuilder('consent')
        .innerJoin('consent.medicalRecord', 'mr')
        .where('mr.tenantId = :tenantId', { tenantId: tenant.id })
        .getCount();
      
      (tenant as any).medicalRecordConsentsCount = mrConsentsCount;
    } catch (error) {
      console.error(`Error counting MR consents for tenant ${tenant.id}:`, error);
      (tenant as any).medicalRecordConsentsCount = 0;
    }
  }

  return tenants;
}
```

### 3. Frontend - Interface Tenant

**Archivo**: `frontend/src/types/tenant.ts`

**Mejoras**:
- ✅ Agregadas propiedades `clients`, `medicalRecords`, `medicalRecordConsentsCount`

**Código**:
```typescript
export interface Tenant {
  // ... campos existentes
  clients?: any[];
  medicalRecords?: any[];
  medicalRecordConsentsCount?: number; // Conteo de consentimientos HC
}
```

### 4. Tabla "Todos los Tenants" en Dashboard Super Admin

**Archivo**: `frontend/src/components/dashboard/TenantTableSection.tsx`

**Mejoras**:
- ✅ Agregado recurso "Servicios" con barra de progreso
- ✅ Formato más compacto para mostrar más recursos
- ✅ Reducido espaciado entre recursos (de 2 a 1.5)
- ✅ Reducido tamaño de barras de progreso (de h-2.5 a h-2)
- ✅ Reducido ancho de etiquetas (de w-24 a w-20)
- ✅ Ajustado ancho de contadores (de w-16 a w-14, de w-12 a w-10)
- ✅ Filtrado de recursos eliminados (soft delete)

**Recursos Mostrados**:
1. **👥 Users**: Usuarios activos / Máximo (con barra de progreso)
2. **🏢 Sedes**: Sedes activas / Máximo (con barra de progreso)
3. **⚕️ Servs**: Servicios activos / Máximo (con barra de progreso)
4. **📄 CN**: Consentimientos activos / Máximo (con barra de progreso)
5. **🏥 HC**: Historias Clínicas / Máximo (con barra de progreso)
6. **📋 CN-HC**: Consentimientos HC (solo conteo, sin límite)

**Código de Ejemplo**:
```typescript
const userCount = tenant.users?.filter((u: any) => !u.deletedAt).length || 0;
const branchCount = tenant.branches?.filter((b: any) => !b.deletedAt).length || 0;
const serviceCount = tenant.services?.filter((s: any) => !s.deletedAt).length || 0;
const consentCount = tenant.consents?.filter((c: any) => !c.deletedAt).length || 0;

const userPercentage = getResourcePercentage(userCount, tenant.maxUsers);
const branchPercentage = getResourcePercentage(branchCount, tenant.maxBranches);
const servicePercentage = getResourcePercentage(serviceCount, tenant.maxServices || 999999);
const consentPercentage = getResourcePercentage(consentCount, tenant.maxConsents);
```

### 5. Tarjetas de Tenants en Página de Administración

**Archivo**: `frontend/src/components/TenantCard.tsx`

**Mejoras**:
- ✅ Agregada barra de progreso para Servicios (si tiene límite)
- ✅ Mostrar "∞" cuando el recurso es ilimitado
- ✅ Filtrado de recursos eliminados (soft delete)
- ✅ Reducido espaciado entre recursos (de 3 a 2.5)
- ✅ Umbrales de alerta ajustados: 100% = rojo, 80% = amarillo, <80% = verde
- ✅ Agregadas Historias Clínicas (solo conteo)
- ✅ Agregados Consentimientos HC (solo conteo)

**Recursos Mostrados**:
1. **Usuarios**: Con barra de progreso y límite
2. **Sedes**: Con barra de progreso y límite
3. **Servicios**: Con barra de progreso (si tiene límite) o "∞"
4. **Consentimientos**: Con barra de progreso y límite
5. **Historias Clínicas**: Con barra de progreso y límite (o "∞" si ilimitado)
6. **Consentimientos HC**: Solo conteo (sin límite)

## Colores de Alerta

### Sistema de Umbrales
- **🔴 Rojo (Crítico)**: >= 100% del límite
- **🟡 Amarillo (Advertencia)**: >= 80% y < 100% del límite
- **🟢 Verde (Normal)**: < 80% del límite

### Aplicación
```typescript
className={`h-2 rounded-full transition-all ${
  percentage >= 100 ? 'bg-red-500' :
  percentage >= 80 ? 'bg-yellow-500' :
  'bg-green-500'
}`}
```

## Recursos Pendientes de Implementar

### Backend
Para mostrar los recursos adicionales (HC, Clientes, Plantillas), necesitamos:

1. **Agregar relaciones en el endpoint `/tenants`**:
```typescript
// En tenants.service.ts - método findAll()
async findAll(): Promise<Tenant[]> {
  return await this.tenantsRepository.find({
    relations: [
      'users', 
      'branches', 
      'services', 
      'consents',
      // Agregar:
      'medicalRecords',
      'clients',
      'consentTemplates',
      'mrConsentTemplates'
    ],
    order: { createdAt: 'DESC' },
  });
}
```

2. **Agregar contadores en GlobalStats**:
Ya implementado en `getGlobalStats()`:
- ✅ `totalMedicalRecords`
- ✅ `totalClients`
- ✅ `totalConsentTemplates`
- ✅ `totalMRConsentTemplates`

### Frontend

1. **Actualizar interface Tenant**:
```typescript
export interface Tenant {
  // ... campos existentes
  medicalRecords?: any[];
  clients?: any[];
  consentTemplates?: any[];
  mrConsentTemplates?: any[];
}
```

2. **Agregar recursos en TenantTableSection**:
```typescript
// Historias Clínicas
<div className="flex items-center gap-2">
  <span className="text-xs text-gray-600">🏥 HC</span>
  <div className="flex-1 bg-gray-200 rounded-full h-2">
    <div className="h-2 rounded-full bg-green-500" style={{ width: `${hcPercentage}%` }} />
  </div>
  <span className="text-xs font-semibold">{hcCount}/{maxHC}</span>
  <span className="text-xs font-medium">{Math.round(hcPercentage)}%</span>
</div>

// Clientes
<div className="flex items-center gap-2">
  <span className="text-xs text-gray-600">👤 Clientes</span>
  <span className="text-xs font-semibold">{clientsCount}</span>
</div>

// Plantillas CN
<div className="flex items-center gap-2">
  <span className="text-xs text-gray-600">📋 Pl. CN</span>
  <span className="text-xs font-semibold">{cnTemplatesCount}/{maxCNTemplates}</span>
</div>

// Plantillas HC
<div className="flex items-center gap-2">
  <span className="text-xs text-gray-600">📋 Pl. HC</span>
  <span className="text-xs font-semibold">{hcTemplatesCount}/{maxHCTemplates}</span>
</div>
```

3. **Agregar recursos en TenantCard**:
Similar al código anterior, pero en formato de tarjeta.

## Beneficios

### Para Super Admin
- ✅ Vista completa del consumo de recursos por tenant
- ✅ Identificación rápida de tenants cerca del límite
- ✅ Monitoreo de todos los recursos en una sola vista
- ✅ Alertas visuales con código de colores

### Para Gestión de Tenants
- ✅ Información detallada de cada tenant
- ✅ Fácil identificación de recursos ilimitados (∞)
- ✅ Filtrado de recursos eliminados (soft delete)
- ✅ Vista consistente entre dashboard y administración

## Próximos Pasos

1. **Implementar relaciones adicionales en backend**:
   - Agregar `medicalRecords`, `clients`, `consentTemplates`, `mrConsentTemplates` al endpoint `/tenants`
   - Optimizar queries para evitar N+1 problems

2. **Actualizar frontend con recursos adicionales**:
   - Agregar HC, Clientes, Plantillas CN, Plantillas HC a las tablas
   - Mantener formato compacto y legible

3. **Agregar filtros avanzados**:
   - Filtrar por recurso específico cerca del límite
   - Filtrar por tipo de recurso

4. **Optimizar rendimiento**:
   - Implementar paginación en backend
   - Lazy loading de relaciones
   - Cache de estadísticas globales

## Archivos Modificados

1. **Backend**:
   - `backend/src/tenants/entities/tenant.entity.ts`: Agregadas columnas maxMedicalRecords, maxMRConsentTemplates, maxConsentTemplates
   - `backend/src/tenants/tenants.service.ts`: Actualizado método findAll() para cargar HC y contar consentimientos HC
   - `backend/src/tenants/tenants-plan.helper.ts`: Agregados límites de HC al aplicar configuración de planes
   - `backend/src/tenants/dto/create-tenant.dto.ts`: Agregados campos de límites de HC
   - `backend/add-hc-limits-to-tenants.sql`: Script SQL para agregar columnas a tenants existentes
   - `backend/apply-hc-limits-to-tenants.ps1`: Script PowerShell para aplicar migración

2. **Frontend**:
   - `frontend/src/types/tenant.ts`: Agregadas propiedades maxMedicalRecords, maxMRConsentTemplates, maxConsentTemplates
   - `frontend/src/components/dashboard/TenantTableSection.tsx`: Agregada barra de progreso para HC
   - `frontend/src/components/TenantCard.tsx`: Agregada barra de progreso para HC

## Notas Técnicas

### Soft Delete
Todos los contadores filtran recursos eliminados:
```typescript
tenant.users?.filter((u: any) => !u.deletedAt).length || 0
```

### Recursos Ilimitados
Cuando un recurso no tiene límite, se muestra "∞":
```typescript
{tenant.maxServices || '∞'}
```

### Porcentajes
Los porcentajes se calculan con un máximo de 100%:
```typescript
Math.min(percentage, 100)
```

---

**Fecha**: 2026-01-27  
**Versión**: 15.1.3  
**Estado**: ✅ Implementación completa con barras de progreso para HC

## Instrucciones de Migración

Para aplicar los límites de HC a los tenants existentes:

```powershell
cd backend
.\apply-hc-limits-to-tenants.ps1
```

Esto agregará las columnas `max_medical_records`, `max_mr_consent_templates` y `max_consent_templates` a la tabla `tenants` y establecerá los valores según el plan de cada tenant.

Después de aplicar la migración, reinicia el backend para que los cambios surtan efecto.
