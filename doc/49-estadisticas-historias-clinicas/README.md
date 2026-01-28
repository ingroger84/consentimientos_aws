# 📊 Estadísticas de Historias Clínicas - Dashboard Super Admin

**Versión**: 15.0.8  
**Fecha**: 2026-01-25  
**Tipo**: MINOR (Nueva funcionalidad)

---

## 🎯 Objetivo

Implementar estadísticas de historias clínicas en el dashboard del Super Admin, agrupadas por cuenta (tenant) y por sede, para proporcionar una vista completa del uso del módulo de historias clínicas en todo el sistema.

---

## ✨ Funcionalidades Implementadas

### 1. Tarjeta de Resumen
- **Total de Historias Clínicas**: Muestra el número total de historias clínicas registradas en todo el sistema
- **Ubicación**: En las tarjetas de resumen del dashboard (5ta tarjeta)
- **Color**: Índigo (bg-indigo-500)
- **Icono**: Activity

### 2. Top 5 Cuentas por Historias Clínicas
- **Ranking**: Muestra las 5 cuentas con más historias clínicas
- **Información mostrada**:
  - Posición en el ranking (con medallas para top 3)
  - Nombre de la cuenta
  - Slug de la cuenta
  - Número total de historias clínicas
  - Número de sedes

### 3. Vista Detallada por Cuenta
- **Agrupación por Tenant**: Cada cuenta muestra:
  - Nombre y slug de la cuenta
  - Total de historias clínicas
  - Historias activas (con icono verde)
  - Historias cerradas (con icono gris)
  
### 4. Desglose por Sede
- **Agrupación por Branch**: Dentro de cada cuenta se muestra:
  - Nombre de cada sede
  - Número de historias clínicas por sede
  - Grid responsive (1 columna en móvil, 2 en tablet, 3 en desktop)

---

## 🔧 Cambios Técnicos

### Backend

#### 1. Actualización del Servicio de Tenants (`backend/src/tenants/tenants.service.ts`)

**Método modificado**: `getGlobalStats()`

**Nuevas consultas**:
```typescript
// Obtener todas las historias clínicas con sus relaciones
const medicalRecordsRepository = this.tenantsRepository.manager.getRepository('MedicalRecord');
const allMedicalRecords = await medicalRecordsRepository.find({
  relations: ['tenant', 'branch'],
});
```

**Nuevos cálculos**:
```typescript
// Estadísticas de historias clínicas por tenant
const medicalRecordsByTenant = tenants.map(tenant => {
  const tenantRecords = allMedicalRecords.filter(mr => mr.tenantId === tenant.id);
  
  // Agrupar por sede
  const recordsByBranch = tenant.branches
    ?.filter(b => !b.deletedAt)
    .map(branch => ({
      branchId: branch.id,
      branchName: branch.name,
      recordCount: tenantRecords.filter(mr => mr.branchId === branch.id).length,
    }))
    .filter(item => item.recordCount > 0) || [];

  return {
    tenantId: tenant.id,
    tenantName: tenant.name,
    tenantSlug: tenant.slug,
    totalRecords: tenantRecords.length,
    activeRecords: tenantRecords.filter(mr => mr.status === 'active').length,
    closedRecords: tenantRecords.filter(mr => mr.status === 'closed').length,
    recordsByBranch,
  };
}).filter(item => item.totalRecords > 0);

// Top tenants por historias clínicas
const topTenantsByMedicalRecords = tenants
  .map(tenant => {
    const recordsCount = allMedicalRecords.filter(mr => mr.tenantId === tenant.id).length;
    return {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      medicalRecordsCount: recordsCount,
      branchesCount: tenant.branches?.filter(b => !b.deletedAt).length || 0,
    };
  })
  .filter(item => item.medicalRecordsCount > 0)
  .sort((a, b) => b.medicalRecordsCount - a.medicalRecordsCount)
  .slice(0, 10);
```

**Nuevos campos en el retorno**:
- `totalMedicalRecords`: Total de historias clínicas en el sistema
- `medicalRecordsByTenant`: Array con estadísticas por tenant
- `topTenantsByMedicalRecords`: Top 10 tenants por historias clínicas

### Frontend

#### 1. Actualización del Tipo GlobalStats (`frontend/src/types/tenant.ts`)

**Nuevos campos**:
```typescript
export interface GlobalStats {
  // ... campos existentes
  totalMedicalRecords: number;
  medicalRecordsByTenant: Array<{
    tenantId: string;
    tenantName: string;
    tenantSlug: string;
    totalRecords: number;
    activeRecords: number;
    closedRecords: number;
    recordsByBranch: Array<{
      branchId: string;
      branchName: string;
      recordCount: number;
    }>;
  }>;
  topTenantsByMedicalRecords: Array<{
    id: string;
    name: string;
    slug: string;
    medicalRecordsCount: number;
    branchesCount: number;
  }>;
}
```

#### 2. Nuevo Componente (`frontend/src/components/dashboard/MedicalRecordsStatsSection.tsx`)

**Características**:
- Muestra mensaje cuando no hay historias clínicas
- Top 5 cuentas con ranking visual (medallas para top 3)
- Vista detallada por cuenta con estadísticas activas/cerradas
- Desglose por sede con grid responsive
- Diseño consistente con el resto del dashboard

**Props**:
```typescript
interface MedicalRecordsStatsSectionProps {
  stats: GlobalStats;
}
```

#### 3. Actualización del Dashboard (`frontend/src/pages/SuperAdminDashboard.tsx`)

**Cambios**:
- Agregada 5ta tarjeta de resumen para historias clínicas
- Grid de tarjetas cambiado de 4 a 5 columnas (`lg:grid-cols-5`)
- Importado y agregado `MedicalRecordsStatsSection` en la vista "overview"
- Actualizado estado inicial de stats con nuevos campos

---

## 📊 Visualización

### Tarjeta de Resumen
```
┌─────────────────────────────┐
│ Historias Clínicas          │
│                              │
│        42                    │
│                              │
│ Registradas                  │
│ Nuevo                        │
└─────────────────────────────┘
```

### Top 5 Cuentas
```
┌──────────────────────────────────────────────┐
│ Top Cuentas por Historias Clínicas          │
├──────────────────────────────────────────────┤
│ 🥇 Clinica Demo                              │
│    demo-medico                        25 │ 3 sedes │
├──────────────────────────────────────────────┤
│ 🥈 Demo Santi                                │
│    demosanti                          15 │ 2 sedes │
├──────────────────────────────────────────────┤
│ 🥉 Clínica Demo                              │
│    clinica-demo                        2 │ 1 sede  │
└──────────────────────────────────────────────┘
```

### Vista Detallada por Cuenta
```
┌──────────────────────────────────────────────┐
│ Historias Clínicas por Cuenta y Sede        │
├──────────────────────────────────────────────┤
│ │ Clinica Demo                         25   │
│ │ demo-medico                                │
│ │                                            │
│ │ ✓ Activas: 20    ✗ Cerradas: 5           │
│ │                                            │
│ │ Por Sede:                                  │
│ │ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│ │ │ Sede 1   │ │ Sede 2   │ │ Sede 3   │  │
│ │ │   15     │ │    8     │ │    2     │  │
│ │ └──────────┘ └──────────┘ └──────────┘  │
└──────────────────────────────────────────────┘
```

---

## 🧪 Pruebas

### Escenarios de Prueba

#### 1. Sin Historias Clínicas
- **Acción**: Acceder al dashboard sin historias clínicas en el sistema
- **Resultado esperado**: 
  - Tarjeta muestra "0"
  - Sección muestra mensaje "No hay historias clínicas registradas aún"

#### 2. Con Historias Clínicas
- **Acción**: Crear historias clínicas en diferentes tenants y sedes
- **Resultado esperado**:
  - Tarjeta muestra el total correcto
  - Top 5 muestra las cuentas ordenadas por cantidad
  - Vista detallada muestra todas las cuentas con historias
  - Desglose por sede muestra correctamente

#### 3. Historias Activas vs Cerradas
- **Acción**: Crear historias activas y cerrar algunas
- **Resultado esperado**:
  - Contador de activas muestra el número correcto (verde)
  - Contador de cerradas muestra el número correcto (gris)

#### 4. Múltiples Sedes
- **Acción**: Crear historias en diferentes sedes del mismo tenant
- **Resultado esperado**:
  - Cada sede muestra su contador individual
  - La suma de sedes coincide con el total del tenant

---

## 📁 Archivos Modificados

### Backend
- ✅ `backend/src/tenants/tenants.service.ts` - Agregadas estadísticas de historias clínicas

### Frontend
- ✅ `frontend/src/types/tenant.ts` - Actualizado tipo GlobalStats
- ✅ `frontend/src/components/dashboard/MedicalRecordsStatsSection.tsx` - Nuevo componente
- ✅ `frontend/src/pages/SuperAdminDashboard.tsx` - Integración del nuevo componente

### Versión
- ✅ `VERSION.md` → 15.0.8
- ✅ `frontend/package.json` → 15.0.8
- ✅ `backend/package.json` → 15.0.8
- ✅ `frontend/src/config/version.ts` → 15.0.8
- ✅ `backend/src/config/version.ts` → 15.0.8

---

## 🚀 Despliegue

### Pasos

1. **Backend**:
   ```bash
   cd backend
   npm run build
   pm2 restart backend
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm run build
   # Copiar dist/ al servidor
   ```

3. **Verificación**:
   - Acceder a `admin.localhost:5173`
   - Iniciar sesión como Super Admin
   - Verificar que aparece la 5ta tarjeta
   - Scroll down para ver las nuevas secciones

---

## 💡 Beneficios

### Para el Super Admin
1. **Visibilidad completa**: Ve todas las historias clínicas del sistema
2. **Identificación de uso**: Identifica qué cuentas usan más el módulo
3. **Análisis por sede**: Entiende la distribución por ubicación
4. **Toma de decisiones**: Datos para optimizar recursos y soporte

### Para el Sistema
1. **Métricas centralizadas**: Todas las estadísticas en un solo lugar
2. **Escalabilidad**: Diseño preparado para muchos tenants y sedes
3. **Performance**: Consultas optimizadas con relaciones
4. **Mantenibilidad**: Código reutilizable y bien documentado

---

## 🔮 Mejoras Futuras

### Posibles Extensiones
1. **Filtros por fecha**: Ver historias clínicas por período
2. **Gráficos de tendencia**: Evolución de historias clínicas en el tiempo
3. **Exportación**: Descargar estadísticas en Excel/PDF
4. **Alertas**: Notificar cuando una cuenta supera cierto umbral
5. **Comparativas**: Comparar uso entre diferentes períodos

---

**Desarrollado por**: Kiro AI Assistant  
**Fecha**: 2026-01-25  
**Versión**: 15.0.8  
**Tipo**: MINOR (Nueva funcionalidad)


---

## 📋 Actualización: Página de Historias Clínicas para Super Admin

**Fecha**: 2026-01-25

### Nueva Funcionalidad

Se agregó una página dedicada para que el Super Admin pueda ver todas las historias clínicas del sistema agrupadas por cuenta, similar a como se visualizan las sedes.

### Características

#### 1. Menú Lateral
- La opción "Historias Clínicas" en el menú ahora redirige a diferentes páginas según el tipo de usuario:
  - **Super Admin**: `/super-admin/medical-records` (vista global)
  - **Otros usuarios**: `/medical-records` (vista del tenant)

#### 2. Vista Global (Super Admin)
- **Tarjetas de resumen**:
  - Total de historias clínicas
  - Historias activas
  - Historias cerradas
  
- **Filtros**:
  - Búsqueda por nombre de cuenta
  - Filtro por estado (todas, activas, cerradas, archivadas)

- **Lista agrupada por cuenta**:
  - Cada cuenta muestra:
    - Nombre y slug
    - Total de historias
    - Historias activas
    - Historias cerradas
  - Expandible para ver el detalle de cada historia

#### 3. Detalle de Historias
- Número de historia clínica
- Estado (activa, cerrada, archivada)
- Tipo de admisión (consulta, urgencia, hospitalización)
- Nombre del paciente
- Sede
- Fecha de admisión
- Click para ver detalle completo

### Cambios Técnicos

#### Backend

**Nuevo endpoint**: `GET /api/medical-records/all/grouped`
- **Permiso requerido**: `view_global_stats`
- **Retorna**: Array de historias clínicas agrupadas por tenant

**Método agregado**: `getAllGroupedByTenant()` en `MedicalRecordsService`
- Consulta todas las historias clínicas con sus relaciones
- Agrupa por tenant
- Calcula estadísticas (total, activas, cerradas, archivadas)
- Ordena por total de registros

#### Frontend

**Nuevo componente**: `SuperAdminMedicalRecordsPage.tsx`
- Vista completa con filtros y búsqueda
- Tarjetas de resumen
- Lista expandible por cuenta
- Navegación al detalle de cada historia

**Modificaciones**:
- `Layout.tsx`: Ruta condicional según tipo de usuario
- `App.tsx`: Nueva ruta `/super-admin/medical-records`

### Archivos Modificados

#### Backend
- ✅ `backend/src/medical-records/medical-records.controller.ts` - Nuevo endpoint
- ✅ `backend/src/medical-records/medical-records.service.ts` - Nuevo método

#### Frontend
- ✅ `frontend/src/pages/SuperAdminMedicalRecordsPage.tsx` - Nueva página
- ✅ `frontend/src/components/Layout.tsx` - Ruta condicional
- ✅ `frontend/src/App.tsx` - Nueva ruta

### Pruebas

#### Escenario 1: Super Admin
1. Iniciar sesión como Super Admin
2. Click en "Historias Clínicas" en el menú
3. Verificar que se muestra la vista global
4. Verificar tarjetas de resumen
5. Expandir una cuenta
6. Click en una historia para ver detalle

#### Escenario 2: Usuario de Tenant
1. Iniciar sesión como usuario de tenant
2. Click en "Historias Clínicas" en el menú
3. Verificar que se muestra solo las historias del tenant

#### Escenario 3: Filtros
1. Como Super Admin, buscar por nombre de cuenta
2. Filtrar por estado
3. Verificar que los resultados se actualizan

---

**Desarrollado por**: Kiro AI Assistant  
**Fecha**: 2026-01-25  
**Versión**: 15.0.8
