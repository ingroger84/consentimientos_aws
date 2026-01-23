# Visualización de Sede para Usuarios Operadores

## Descripción

Implementación de la visualización de la sede asignada a usuarios con perfil operador en la barra lateral del sistema.

## Ubicación

La sede se muestra en la parte inferior izquierda de la barra lateral, debajo del nombre del usuario y su rol.

## Funcionalidad

### Para Usuarios con 1 Sede
- Muestra el nombre de la sede asignada
- Icono de edificio (Building2) junto al nombre

### Para Usuarios con Múltiples Sedes
- Muestra "X sedes" (donde X es el número de sedes)
- Icono de edificio (Building2) junto al texto

### Para Usuarios sin Sedes
- No muestra ninguna información adicional
- Aplica para Super Admin y usuarios sin sedes asignadas

## Implementación Técnica

### Frontend

#### Componente Modificado
- **Archivo**: `frontend/src/components/Layout.tsx`
- **Cambio**: Agregado bloque condicional para mostrar sedes

```tsx
{user?.branches && user.branches.length > 0 && (
  <div className="mt-1 flex items-center gap-1">
    <Building2 className="w-3 h-3 text-gray-400 flex-shrink-0" />
    <p className="text-xs text-gray-600 truncate">
      {user.branches.length === 1 
        ? user.branches[0].name 
        : `${user.branches.length} sedes`}
    </p>
  </div>
)}
```

#### Tipos
- **Archivo**: `frontend/src/types/index.ts`
- **Estado**: Ya existía el campo `branches: Branch[]` en la interfaz `User`

### Backend

#### Servicio de Autenticación
- **Archivo**: `backend/src/auth/auth.service.ts`
- **Estado**: Ya devuelve `branches` en el login (línea 60)

```typescript
user: {
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  branches: user.branches, // ✅ Ya implementado
  tenant: user.tenant ? {
    id: user.tenant.id,
    name: user.tenant.name,
    slug: user.tenant.slug,
  } : null,
}
```

#### Entidad User
- **Archivo**: `backend/src/users/entities/user.entity.ts`
- **Estado**: Ya tiene la relación ManyToMany con Branch

```typescript
@ManyToMany(() => Branch, (branch) => branch.users)
@JoinTable({
  name: 'user_branches',
  joinColumn: { name: 'user_id', referencedColumnName: 'id' },
  inverseJoinColumn: { name: 'branch_id', referencedColumnName: 'id' },
})
branches: Branch[];
```

## Diseño Visual

### Estructura en la Barra Lateral

```
┌─────────────────────────────┐
│                             │
│  [Navegación]               │
│                             │
├─────────────────────────────┤
│  👤 Juan Pérez              │
│  📋 Operador                │
│  🏢 Sede Centro        ← NUEVO
├─────────────────────────────┤
│  v7.0.4 - 2026-01-23        │
└─────────────────────────────┘
```

### Estilos Aplicados
- **Icono**: 12px (w-3 h-3), color gris claro
- **Texto**: 12px (text-xs), color gris oscuro
- **Espaciado**: 4px entre icono y texto
- **Truncado**: Texto se corta con "..." si es muy largo

## Casos de Uso

### Caso 1: Usuario Operador con 1 Sede
```
Usuario: María González
Rol: Operador
Sede: Sede Norte
```

**Visualización:**
```
María González
Operador
🏢 Sede Norte
```

### Caso 2: Usuario con Múltiples Sedes
```
Usuario: Carlos Ramírez
Rol: Admin Sede
Sedes: Sede Centro, Sede Norte, Sede Sur
```

**Visualización:**
```
Carlos Ramírez
Admin Sede
🏢 3 sedes
```

### Caso 3: Super Admin (sin sedes)
```
Usuario: Admin Sistema
Rol: Super Admin
Sedes: []
```

**Visualización:**
```
Admin Sistema
Super Admin
(no muestra sedes)
```

## Pruebas

### Prueba 1: Usuario con 1 Sede
1. Crear usuario con rol "Operador"
2. Asignar 1 sede al usuario
3. Iniciar sesión
4. Verificar que se muestra el nombre de la sede

### Prueba 2: Usuario con Múltiples Sedes
1. Crear usuario con rol "Admin Sede"
2. Asignar 3 sedes al usuario
3. Iniciar sesión
4. Verificar que se muestra "3 sedes"

### Prueba 3: Usuario sin Sedes
1. Crear usuario con rol "Admin General"
2. No asignar sedes
3. Iniciar sesión
4. Verificar que NO se muestra información de sedes

### Prueba 4: Super Admin
1. Iniciar sesión como Super Admin
2. Verificar que NO se muestra información de sedes

## Responsive

### Desktop (≥1024px)
- Barra lateral fija a la izquierda
- Información de sede visible siempre

### Mobile (<1024px)
- Barra lateral en menú hamburguesa
- Información de sede visible al abrir el menú
- Se oculta al cerrar el menú

## Archivos Modificados

```
frontend/src/components/Layout.tsx
doc/31-visualizacion-sede-operador/README.md
```

## Archivos Verificados (sin cambios necesarios)

```
frontend/src/types/index.ts (ya tenía branches)
backend/src/auth/auth.service.ts (ya devolvía branches)
backend/src/users/entities/user.entity.ts (ya tenía relación)
```

## Versión

- **Implementado en**: v7.0.4
- **Fecha**: 23 de Enero 2026
- **Tipo de cambio**: MINOR (nueva funcionalidad)

## Notas Técnicas

1. **Relación ManyToMany**: Un usuario puede tener múltiples sedes y una sede puede tener múltiples usuarios
2. **Tabla intermedia**: `user_branches` gestiona la relación
3. **Carga eager**: Las sedes se cargan automáticamente en el login
4. **Performance**: No impacta el rendimiento ya que las sedes se cargan una sola vez en el login

## Mejoras Futuras

1. **Tooltip**: Mostrar lista completa de sedes al hacer hover sobre "X sedes"
2. **Modal**: Permitir ver detalles de todas las sedes asignadas
3. **Filtro**: Permitir filtrar consentimientos por sede del usuario
4. **Selector**: Permitir cambiar de sede activa si el usuario tiene múltiples sedes

## Referencias

- [Documentación de TypeORM - Many-to-Many Relations](https://typeorm.io/many-to-many-relations)
- [Lucide Icons - Building2](https://lucide.dev/icons/building-2)
