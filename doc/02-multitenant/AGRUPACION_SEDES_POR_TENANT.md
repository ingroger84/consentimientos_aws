# Agrupación de Sedes por Tenant - Super Admin

## Fecha: 2026-01-07

## Resumen
Se implementó la agrupación de sedes por tenant para el Super Admin, siguiendo el mismo patrón utilizado en la página de usuarios.

---

## Funcionalidades Implementadas

### 1. Vista Agrupada por Tenant ✅

#### Características:
- **Secciones colapsables** por tenant
- **Contador de sedes** por tenant
- **Información del tenant**: nombre, slug, estado
- **Enlace directo** al tenant
- **Indicador visual** del estado del tenant

#### Secciones:
1. **Sedes del Sistema** (Super Admin)
   - Icono morado
   - Badge "Sistema"
   - Sedes sin tenant asignado

2. **Sedes por Tenant**
   - Icono azul
   - Badge de estado (Activo/Prueba/Suspendido)
   - Enlace para acceder al tenant
   - Contador de sedes

### 2. Botón de Alternancia de Vista ✅

#### Funcionalidad:
- **Vista Agrupada**: Organiza sedes por tenant (por defecto)
- **Vista Lista**: Muestra todas las sedes en grid tradicional
- **Solo visible para Super Admin**

#### Iconos:
- Vista Agrupada: Icono de Building2
- Vista Lista: Icono de List

### 3. Expansión/Colapso de Secciones ✅

#### Comportamiento:
- **Por defecto**: Sección "Sistema" expandida
- **Clic en header**: Expande/colapsa la sección
- **Indicador visual**: Chevron Down/Right
- **Estado persistente**: Se mantiene durante la sesión

---

## Implementación Técnica

### Hook useMemo para Agrupación
```typescript
const groupedBranches = useMemo(() => {
  if (!branches) return { superAdmin: [], tenants: {} };

  const superAdmin: any[] = [];
  const tenants: Record<string, { tenant: any; branches: any[] }> = {};

  branches.forEach((branch: any) => {
    if (!branch.tenant) {
      superAdmin.push(branch);
    } else {
      const tenantKey = branch.tenant.id;
      if (!tenants[tenantKey]) {
        tenants[tenantKey] = {
          tenant: branch.tenant,
          branches: []
        };
      }
      tenants[tenantKey].branches.push(branch);
    }
  });

  return { superAdmin, tenants };
}, [branches]);
```

### Estado de Expansión
```typescript
const [expandedTenants, setExpandedTenants] = useState<Set<string>>(
  new Set(['super-admin'])
);

const toggleTenant = (tenantId: string) => {
  setExpandedTenants(prev => {
    const newSet = new Set(prev);
    if (newSet.has(tenantId)) {
      newSet.delete(tenantId);
    } else {
      newSet.add(tenantId);
    }
    return newSet;
  });
};
```

### Renderizado Condicional
```typescript
{isSuperAdmin && groupByTenant ? (
  // Vista agrupada por tenant
  <div className="space-y-4">
    {/* Secciones colapsables */}
  </div>
) : (
  // Vista de grid tradicional
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {/* Tarjetas de sedes */}
  </div>
)}
```

---

## Estructura Visual

### Header de Sección
```
┌─────────────────────────────────────────────────────────┐
│ ▼  [Icono]  Nombre del Tenant                  [Badge] │
│             X sede(s) • /slug        [Acceder →]       │
└─────────────────────────────────────────────────────────┘
```

### Sección Expandida
```
┌─────────────────────────────────────────────────────────┐
│ ▼  [Icono]  Nombre del Tenant                  [Badge] │
│             X sede(s) • /slug        [Acceder →]       │
├─────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  Sede 1  │  │  Sede 2  │  │  Sede 3  │             │
│  │          │  │          │  │          │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
```

---

## Mejoras de UX

### 1. Indicadores Visuales
- **Iconos diferenciados**: Morado (Sistema), Azul (Tenants)
- **Badges de estado**: Verde (Activo), Azul (Prueba), Rojo (Suspendido)
- **Chevron animado**: Indica estado expandido/colapsado
- **Hover effects**: Feedback visual en headers clickeables

### 2. Información Contextual
- **Contador de sedes**: Visible en cada sección
- **Slug del tenant**: Ayuda a identificar el tenant
- **Enlace directo**: Acceso rápido al tenant
- **Estado del tenant**: Información de un vistazo

### 3. Navegación Eficiente
- **Secciones colapsables**: Reduce scroll innecesario
- **Vista alternativa**: Flexibilidad según preferencia
- **Grid responsive**: 1/2/3 columnas según tamaño de pantalla

---

## Comparación con Vista de Usuarios

### Similitudes:
✅ Mismo patrón de agrupación
✅ Secciones colapsables
✅ Botón de alternancia de vista
✅ Indicadores visuales consistentes
✅ Información del tenant en header

### Diferencias:
- **Usuarios**: Vista de tabla dentro de secciones
- **Sedes**: Vista de grid de tarjetas dentro de secciones
- **Usuarios**: Más acciones (editar, eliminar, cambiar contraseña, impersonar)
- **Sedes**: Acciones más simples (editar, eliminar)

---

## Casos de Uso

### Escenario 1: Super Admin revisa sedes por tenant
1. ✅ Accede a página de Sedes
2. ✅ Ve vista agrupada por defecto
3. ✅ Expande/colapsa secciones según necesidad
4. ✅ Identifica rápidamente qué tenant tiene qué sedes

### Escenario 2: Super Admin busca sede específica
1. ✅ Cambia a vista de lista
2. ✅ Ve todas las sedes en grid
3. ✅ Busca visualmente la sede
4. ✅ Realiza acción necesaria

### Escenario 3: Super Admin accede a tenant desde sedes
1. ✅ Ve sección del tenant
2. ✅ Hace clic en "Acceder →"
3. ✅ Se abre tenant en nueva pestaña
4. ✅ Puede verificar sedes en contexto del tenant

---

## Beneficios

### Para el Super Admin:
1. **Organización clara**: Sedes agrupadas por tenant
2. **Navegación eficiente**: Menos scroll, más contexto
3. **Información contextual**: Estado y datos del tenant visibles
4. **Flexibilidad**: Dos vistas según necesidad
5. **Acceso rápido**: Enlaces directos a tenants

### Para el Sistema:
1. **Consistencia**: Mismo patrón que usuarios
2. **Escalabilidad**: Funciona con muchos tenants
3. **Performance**: useMemo optimiza re-renders
4. **Mantenibilidad**: Código reutilizable y claro

---

## Archivos Modificados

```
frontend/src/pages/BranchesPage.tsx
├── Imports actualizados (Building2, ChevronDown, ChevronRight, List)
├── Estados agregados (expandedTenants, groupByTenant)
├── Hook useMemo para agrupación
├── Función toggleTenant
├── Función renderBranchCard
├── Renderizado condicional (agrupado vs lista)
└── Botón de alternancia de vista
```

---

## Testing Recomendado

### Casos de Prueba:
1. ✅ Vista agrupada muestra secciones correctamente
2. ✅ Expandir/colapsar secciones funciona
3. ✅ Botón de alternancia cambia entre vistas
4. ✅ Contador de sedes es correcto
5. ✅ Enlaces a tenants funcionan
6. ✅ Badges de estado son correctos
7. ✅ Vista de lista muestra todas las sedes
8. ✅ Crear/editar/eliminar sedes funciona en ambas vistas
9. ✅ Modal de límite alcanzado funciona
10. ✅ Solo Super Admin ve botón de alternancia

---

## Próximos Pasos (Opcionales)

### Mejoras Futuras:
1. **Búsqueda**: Filtro de búsqueda por nombre de sede
2. **Filtros**: Por estado (activa/inactiva), por tenant
3. **Ordenamiento**: Por nombre, fecha de creación, etc.
4. **Exportar**: Exportar lista de sedes a CSV/Excel
5. **Estadísticas**: Mostrar métricas por tenant (sedes activas/inactivas)

---

## Conclusión

✅ **Implementación completada exitosamente**

La página de Sedes ahora tiene:
- Agrupación por tenant para Super Admin
- Vista alternativa de lista
- Secciones colapsables
- Información contextual del tenant
- Navegación eficiente
- Consistencia con página de Usuarios

**Estado**: ✅ COMPLETADO
**Sin errores de diagnóstico**
**Listo para usar**
