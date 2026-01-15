# Alertas Detalladas en Dashboard Super Admin

## Descripción

Sistema mejorado de alertas y notificaciones en el dashboard del Super Admin que muestra información detallada de los tenants con límites de recursos alcanzados o cercanos al límite.

---

## Problema Identificado

### Antes de la Mejora

El dashboard del Super Admin mostraba:
- ✅ Tarjetas con contadores de tenants con problemas
- ❌ No mostraba CUÁLES tenants tenían problemas
- ❌ No mostraba QUÉ recursos específicos estaban en límite
- ❌ No había forma rápida de identificar y actuar sobre tenants específicos

**Feedback del usuario**: "No veo las notificaciones o alertas de los tenant con límite de recursos"

---

## Solución Implementada

### Características Nuevas

#### 1. Botón "Ver detalles"
- Permite expandir/colapsar la vista detallada de alertas
- Ubicado en la esquina superior derecha de la sección de alertas

#### 2. Vista Detallada de Alertas
Cuando se expande, muestra:
- **Lista completa** de todos los tenants con problemas
- **Información del tenant**: Nombre, slug, plan
- **Alertas específicas** por recurso (usuarios, sedes, consentimientos)
- **Tipo de alerta**: Crítica (100%+) o Advertencia (80-99%)
- **Datos exactos**: Uso actual, límite máximo, porcentaje
- **Barra de progreso visual** para cada recurso
- **Botón "Ver Tenant"** para navegar directamente al tenant en la tabla

#### 3. Ordenamiento Inteligente
Los tenants se ordenan por severidad:
- Primero: Tenants con alertas críticas (100%+)
- Segundo: Tenants con advertencias (80-99%)

#### 4. Código de Colores
- 🚨 **Rojo**: Alertas críticas (límite alcanzado)
- ⚠️ **Naranja**: Advertencias (cerca del límite)
- ⏸️ **Gris**: Tenants suspendidos

---

## Interfaz Visual

### Tarjetas de Resumen (Mejoradas)

```
┌─────────────────────────────────────────┐
│ 🚨 Límite Alcanzado                     │
│ 2                                       │
│ Tenants bloqueados - Acción inmediata  │
│ Clic para ver →                         │
└─────────────────────────────────────────┘
```

### Vista Detallada (Nueva)

```
┌─────────────────────────────────────────────────────────┐
│ Detalle de Alertas por Tenant                           │
├─────────────────────────────────────────────────────────┤
│ Demo Consultorio Médico          [BASIC]  [Ver Tenant] │
│ demo-medico                                             │
│                                                         │
│ 👥 Usuarios: Límite alcanzado          4/5 (100%)      │
│ ████████████████████████████████████████████████        │
│                                                         │
│ 🏢 Sedes: Límite alcanzado             3/1 (300%)      │
│ ████████████████████████████████████████████████        │
└─────────────────────────────────────────────────────────┘
```

---

## Funcionalidades

### 1. Carga Dinámica de Datos
```typescript
const loadTenantsWithAlerts = async () => {
  const allTenants = await tenantsService.getAll();
  
  // Analizar cada tenant
  allTenants.forEach(tenant => {
    // Calcular porcentajes de uso
    const userPercentage = (userCount / tenant.maxUsers) * 100;
    const branchPercentage = (branchCount / tenant.maxBranches) * 100;
    const consentPercentage = (consentCount / tenant.maxConsents) * 100;
    
    // Generar alertas si >= 80%
    if (userPercentage >= 80) {
      alerts.push({
        type: userPercentage >= 100 ? 'critical' : 'warning',
        resource: 'users',
        message: '...',
        current: userCount,
        max: tenant.maxUsers,
        percentage: Math.round(userPercentage),
      });
    }
  });
};
```

### 2. Navegación Directa
```typescript
const scrollToTenant = (tenantId: string) => {
  const tableSection = document.getElementById('tenants-table');
  if (tableSection) {
    tableSection.scrollIntoView({ behavior: 'smooth' });
    // Filtrar por tenant específico
    window.dispatchEvent(new CustomEvent('filterTenants', { 
      detail: { type: 'tenant-id', value: tenantId }
    }));
  }
};
```

### 3. Iconos por Recurso
```typescript
const getResourceIcon = (resource: string) => {
  switch (resource) {
    case 'users': return <Users className="w-4 h-4" />;
    case 'branches': return <Building2 className="w-4 h-4" />;
    case 'consents': return <FileText className="w-4 h-4" />;
  }
};
```

---

## Flujo de Uso

### Para el Super Admin

1. **Ver Resumen**:
   - Al entrar al dashboard, ve las tarjetas con contadores
   - Identifica rápidamente cuántos tenants tienen problemas

2. **Ver Detalles**:
   - Clic en "Ver detalles" para expandir
   - Ve la lista completa de tenants con problemas
   - Identifica qué recursos específicos están en límite

3. **Actuar**:
   - Clic en "Ver Tenant" para ir directamente al tenant
   - La tabla se filtra automáticamente para mostrar solo ese tenant
   - Puede editar límites o características desde ahí

4. **Filtrar por Tipo**:
   - Clic en tarjeta "Límite Alcanzado" → Filtra solo críticos
   - Clic en tarjeta "Cerca del Límite" → Filtra solo advertencias
   - Clic en tarjeta "Suspendidos" → Filtra solo suspendidos

---

## Ejemplos de Alertas

### Alerta Crítica (100%+)

```
┌─────────────────────────────────────────────────────────┐
│ Clínica Dental ABC              [PROFESSIONAL]  [Ver]  │
│ clinica-abc                                             │
│                                                         │
│ 🚨 👥 Usuarios: Límite alcanzado       15/15 (100%)    │
│ ████████████████████████████████████████████████        │
└─────────────────────────────────────────────────────────┘
```

### Alerta de Advertencia (80-99%)

```
┌─────────────────────────────────────────────────────────┐
│ Hospital Central                [ENTERPRISE]    [Ver]  │
│ hospital-central                                        │
│                                                         │
│ ⚠️ 🏢 Sedes: Cerca del límite          16/20 (80%)     │
│ ████████████████████████████████░░░░░░░░                │
└─────────────────────────────────────────────────────────┘
```

### Múltiples Alertas

```
┌─────────────────────────────────────────────────────────┐
│ Demo Consultorio                [BASIC]         [Ver]  │
│ demo-consultorio                                        │
│                                                         │
│ 🚨 👥 Usuarios: Límite alcanzado       5/5 (100%)      │
│ ████████████████████████████████████████████████        │
│                                                         │
│ ⚠️ 📄 Consents: Cerca del límite       170/200 (85%)   │
│ ██████████████████████████████████░░░░░░                │
└─────────────────────────────────────────────────────────┘
```

---

## Beneficios

### Para el Super Admin

1. **Visibilidad Completa**:
   - Ve exactamente qué tenants tienen problemas
   - Identifica qué recursos específicos están en límite
   - No necesita revisar tenant por tenant

2. **Acción Rápida**:
   - Navegación directa al tenant con un clic
   - Filtrado automático en la tabla
   - Puede resolver problemas inmediatamente

3. **Priorización**:
   - Alertas críticas se muestran primero
   - Código de colores facilita identificación
   - Puede atender primero los casos más urgentes

4. **Información Detallada**:
   - Números exactos (4/5, 170/200)
   - Porcentajes precisos (100%, 85%)
   - Barras de progreso visuales

### Para el Sistema

1. **Proactividad**:
   - Detecta problemas antes de que afecten al usuario
   - Permite planificar upgrades de plan
   - Reduce tickets de soporte

2. **Eficiencia**:
   - Reduce tiempo de diagnóstico
   - Facilita gestión de recursos
   - Mejora experiencia del cliente

---

## Comparación Antes/Después

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Visibilidad de tenants** | ❌ Solo contador | ✅ Lista completa con nombres |
| **Recursos específicos** | ❌ No se mostraban | ✅ Detalle por recurso |
| **Datos exactos** | ❌ No disponibles | ✅ Números y porcentajes |
| **Navegación directa** | ❌ Manual | ✅ Un clic al tenant |
| **Priorización** | ❌ No ordenado | ✅ Críticos primero |
| **Barras visuales** | ❌ No | ✅ Sí, por recurso |
| **Emojis descriptivos** | ❌ No | ✅ Sí (🚨, ⚠️, 👥, 🏢, 📄) |

---

## Archivos Modificados

```
frontend/src/
└── components/dashboard/
    └── TenantAlertsSection.tsx (MODIFICADO)
```

### Cambios Principales

1. **Imports Nuevos**:
   - `useState`, `useEffect` de React
   - `ChevronDown`, `ChevronUp`, `Users`, `Building2`, `FileText` de lucide-react
   - `tenantsService` para cargar datos

2. **Estado Nuevo**:
   - `showDetails`: Controla expansión de vista detallada
   - `tenantsWithAlerts`: Lista de tenants con problemas
   - `loading`: Estado de carga

3. **Funciones Nuevas**:
   - `loadTenantsWithAlerts()`: Carga y analiza tenants
   - `getResourceIcon()`: Retorna ícono según recurso
   - `getResourceLabel()`: Retorna etiqueta según recurso
   - `scrollToTenant()`: Navega al tenant específico

4. **UI Nueva**:
   - Botón "Ver detalles / Ocultar detalles"
   - Sección expandible con lista de tenants
   - Tarjetas de tenant con alertas detalladas
   - Barras de progreso por recurso
   - Botón "Ver Tenant" por cada tenant

---

## Testing

### Checklist de Pruebas

- [x] Tarjetas de resumen muestran contadores correctos
- [x] Botón "Ver detalles" expande/colapsa correctamente
- [x] Lista de tenants se carga correctamente
- [x] Alertas se calculan correctamente (80%, 100%)
- [x] Ordenamiento por severidad funciona
- [x] Código de colores es correcto (rojo/naranja)
- [x] Iconos se muestran según el recurso
- [x] Barras de progreso reflejan porcentaje correcto
- [x] Botón "Ver Tenant" navega correctamente
- [x] Filtrado en tabla funciona al hacer clic
- [x] Responsive en móvil funciona bien

### Casos de Prueba

1. **Sin alertas**:
   - Muestra mensaje "Sistema Saludable"
   - No muestra tarjetas de alerta

2. **Con alertas críticas**:
   - Tarjeta roja con contador
   - Tenants con 100%+ se muestran primero
   - Fondo rojo en tarjetas de tenant

3. **Con advertencias**:
   - Tarjeta naranja con contador
   - Tenants con 80-99% se muestran
   - Fondo naranja en tarjetas de tenant

4. **Múltiples alertas por tenant**:
   - Muestra todas las alertas del tenant
   - Cada recurso con su barra de progreso
   - Ordenadas por severidad

---

## Futuras Mejoras

### Corto Plazo
- [ ] Agregar filtro por tipo de alerta (crítica/advertencia)
- [ ] Agregar búsqueda de tenant en vista detallada
- [ ] Exportar lista de alertas a CSV/PDF

### Mediano Plazo
- [ ] Notificaciones push cuando hay nuevas alertas
- [ ] Historial de alertas resueltas
- [ ] Gráfico de tendencia de alertas

### Largo Plazo
- [ ] Alertas automáticas por email
- [ ] Sugerencias de upgrade de plan
- [ ] Predicción de cuándo se alcanzará límite

---

## Conclusión

La mejora en el sistema de alertas del dashboard del Super Admin proporciona:

- ✅ **Visibilidad Total**: Ve todos los tenants con problemas
- ✅ **Información Detallada**: Sabe exactamente qué recursos están en límite
- ✅ **Acción Rápida**: Navega directamente al tenant con un clic
- ✅ **Priorización**: Atiende primero los casos críticos
- ✅ **Mejor UX**: Interfaz clara, intuitiva y visual

**Estado**: ✅ Completamente implementado y funcional

**Fecha**: 7 de enero de 2026
