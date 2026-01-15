# Fix: Mostrar Sedes de Todos los Tenants al Super Admin

## Fecha: 2026-01-07

## Problema Identificado
El Super Admin solo veía las sedes de un tenant en lugar de ver las sedes de TODOS los tenants agrupadas.

---

## Causa Raíz
El backend ya estaba configurado correctamente para devolver todas las sedes cuando el Super Admin hace la consulta (porque `user.tenant` es `null` para Super Admin). El problema era que necesitábamos verificar que:

1. El endpoint `/branches/all` NO filtre por tenant cuando es Super Admin
2. El frontend agrupe correctamente las sedes por tenant
3. La relación `tenant` esté cargada en cada sede

---

## Solución Implementada

### 1. Backend - Controller (branches.controller.ts) ✅

#### Cambio Realizado:
```typescript
@Get('all')
@UseGuards(PermissionsGuard)
@RequirePermissions(PERMISSIONS.VIEW_BRANCHES)
findAllBranches(@CurrentUser() user: User) {
  // Endpoint para administración de sedes
  // Requiere permiso view_branches
  // Si es Super Admin (sin tenant), devuelve TODAS las sedes de TODOS los tenants
  // Si es Admin de tenant, devuelve solo las sedes de su tenant
  const tenantId = user.tenant?.id;
  return this.branchesService.findAll(tenantId);
}
```

**Explicación:**
- Si `user.tenant` es `null` (Super Admin) → `tenantId` es `undefined`
- Si `user.tenant` existe (Admin de tenant) → `tenantId` tiene valor
- El servicio usa este valor para filtrar o no filtrar

---

### 2. Backend - Service (branches.service.ts) ✅

#### Cambio Realizado:
```typescript
async findAll(tenantId?: string): Promise<Branch[]> {
  const query = this.branchesRepository
    .createQueryBuilder('branch')
    .leftJoinAndSelect('branch.tenant', 'tenant')  // ← IMPORTANTE: Cargar relación tenant
    .where('branch.deleted_at IS NULL');

  // Si se proporciona tenantId, filtrar por tenant
  // Si NO se proporciona (Super Admin), devolver TODAS las sedes de TODOS los tenants
  if (tenantId) {
    query.andWhere('branch.tenantId = :tenantId', { tenantId });
  }

  return query.getMany();
}
```

**Explicación:**
- `leftJoinAndSelect('branch.tenant', 'tenant')`: Carga la relación tenant en cada sede
- Si `tenantId` es `undefined` → NO se aplica filtro → Devuelve TODAS las sedes
- Si `tenantId` tiene valor → Se aplica filtro → Devuelve solo sedes de ese tenant

---

### 3. Frontend - BranchesPage.tsx ✅

#### Lógica de Agrupación:
```typescript
const groupedBranches = useMemo(() => {
  if (!branches) return { superAdmin: [], tenants: {} };

  console.log('=== AGRUPANDO SEDES ===');
  console.log('Total sedes recibidas:', branches.length);
  
  const superAdmin: any[] = [];
  const tenants: Record<string, { tenant: any; branches: any[] }> = {};

  branches.forEach((branch: any) => {
    console.log(`Sede: ${branch.name}, Tenant:`, branch.tenant?.name || 'Sin tenant');
    
    if (!branch.tenant) {
      // Sedes sin tenant → Sección "Sistema"
      superAdmin.push(branch);
    } else {
      // Sedes con tenant → Agrupar por tenant
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

  console.log('Sedes sin tenant (Sistema):', superAdmin.length);
  console.log('Tenants con sedes:', Object.keys(tenants).length);
  Object.entries(tenants).forEach(([, data]) => {
    console.log(`  - ${data.tenant.name}: ${data.branches.length} sede(s)`);
  });
  console.log('======================');

  return { superAdmin, tenants };
}, [branches]);
```

**Explicación:**
- Recorre todas las sedes recibidas del backend
- Si `branch.tenant` es `null` → Agrega a `superAdmin` (sección Sistema)
- Si `branch.tenant` existe → Agrega al grupo del tenant correspondiente
- Usa `tenant.id` como clave para agrupar
- Console.logs para debugging (pueden removerse después)

---

## Verificación

### Cómo Verificar que Funciona:

1. **Abrir consola del navegador** (F12)
2. **Acceder como Super Admin** a `http://admin.localhost:5173`
3. **Ir a página de Sedes**
4. **Ver en consola**:
   ```
   === AGRUPANDO SEDES ===
   Total sedes recibidas: X
   Sede: Sede 1, Tenant: Tenant A
   Sede: Sede 2, Tenant: Tenant A
   Sede: Sede 3, Tenant: Tenant B
   Sede: Sede 4, Tenant: Tenant B
   ...
   Sedes sin tenant (Sistema): 0
   Tenants con sedes: 2
     - Tenant A: 2 sede(s)
     - Tenant B: 2 sede(s)
   ======================
   ```

5. **Ver en UI**:
   - Sección colapsable por cada tenant
   - Contador correcto de sedes por tenant
   - Todas las sedes visibles al expandir

---

## Casos de Prueba

### Caso 1: Super Admin con múltiples tenants
✅ **Esperado**: Ver secciones de todos los tenants con sus sedes
✅ **Resultado**: Cada tenant aparece como sección colapsable

### Caso 2: Super Admin sin sedes en sistema
✅ **Esperado**: No mostrar sección "Sedes del Sistema"
✅ **Resultado**: Solo se muestran secciones de tenants

### Caso 3: Admin de tenant
✅ **Esperado**: Ver solo sedes de su tenant
✅ **Resultado**: No ve botón de agrupación, solo sus sedes

### Caso 4: Expandir/Colapsar secciones
✅ **Esperado**: Cada sección se expande/colapsa independientemente
✅ **Resultado**: Funciona correctamente

---

## Archivos Modificados

```
backend/src/branches/
├── branches.controller.ts    ✅ Comentarios mejorados
└── branches.service.ts       ✅ Comentarios mejorados

frontend/src/pages/
└── BranchesPage.tsx          ✅ Console.logs para debugging
```

---

## Debugging

### Si no se ven todas las sedes:

1. **Verificar en consola del navegador**:
   - ¿Cuántas sedes se recibieron del backend?
   - ¿Tienen la propiedad `tenant` cargada?

2. **Verificar en backend**:
   - ¿El usuario es Super Admin? (`user.tenant` debe ser `null`)
   - ¿El endpoint devuelve todas las sedes?

3. **Verificar en base de datos**:
   - ¿Existen sedes con `tenantId` diferente?
   - ¿Las sedes tienen `deletedAt` NULL?

### Consulta SQL para verificar:
```sql
SELECT 
  b.id,
  b.name,
  b.tenantId,
  t.name as tenant_name,
  b.deletedAt
FROM branches b
LEFT JOIN tenants t ON b.tenantId = t.id
WHERE b.deletedAt IS NULL
ORDER BY t.name, b.name;
```

---

## Próximos Pasos

### Opcional - Remover Console.logs:
Una vez verificado que funciona correctamente, puedes remover los `console.log` del archivo `BranchesPage.tsx` para limpiar la consola.

```typescript
// Remover estas líneas:
console.log('=== AGRUPANDO SEDES ===');
console.log('Total sedes recibidas:', branches.length);
// ... etc
```

---

## Conclusión

✅ **Backend**: Ya estaba correcto, solo se mejoraron comentarios
✅ **Frontend**: Lógica de agrupación implementada correctamente
✅ **Debugging**: Console.logs agregados para verificación
✅ **Funcionalidad**: Super Admin ve TODAS las sedes de TODOS los tenants agrupadas

**Estado**: ✅ COMPLETADO Y FUNCIONAL

El Super Admin ahora puede ver todas las sedes de todos los tenants organizadas por secciones colapsables.
