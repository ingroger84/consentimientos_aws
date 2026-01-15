# 📋 Agrupación de Preguntas por Tenant

## Resumen

Implementación de la vista de preguntas agrupadas por tenant para el Super Admin, permitiendo ver todas las preguntas de todos los tenants organizadas jerárquicamente.

## Cambios Realizados

### Backend

#### `backend/src/questions/questions.service.ts`

**Método `findAll`**:
- Ya incluye `leftJoinAndSelect('service.tenant', 'tenant')` para cargar la relación tenant del servicio
- Cuando `tenantId` es `undefined` (Super Admin), devuelve TODAS las preguntas de TODOS los tenants
- Cuando `tenantId` tiene valor (usuario de tenant), filtra solo las preguntas de ese tenant

**Método `findByService`**:
- Similar a `findAll`, incluye la relación `service.tenant`
- Filtra por servicio específico
- Respeta el filtro de tenant cuando aplica

**Método `findOne`**:
- Corregido para que Super Admin pueda ver cualquier pregunta
- Removido el filtro `tenantId IS NULL` que impedía ver preguntas de tenants
- Ahora incluye `leftJoinAndSelect('service.tenant', 'tenant')`

### Frontend

#### `frontend/src/types/index.ts`

Agregada la propiedad `tenant` al tipo `Service`:

```typescript
export interface Service {
  id: string;
  name: string;
  description?: string;
  pdfTemplateUrl?: string;
  isActive: boolean;
  questions?: Question[];
  tenant?: {
    id: string;
    name: string;
    slug: string;
    status: string;
  } | null;
}
```

#### `frontend/src/pages/QuestionsPage.tsx`

**Vista por Tenant**:
- Agregado botón de vista "Tenant" en el selector de vistas (solo visible para Super Admin)
- Vista predeterminada para Super Admin es "Tenant"
- Vista predeterminada para usuarios de tenant es "Servicio"

**Agrupación `groupedByTenant`**:
- Optimizado para usar directamente `question.service.tenant` que viene del backend
- Ya no necesita buscar en el array de servicios
- Inicializa todos los tenants (incluso los que no tienen preguntas)
- Agrupa preguntas por tenant → servicio → preguntas
- Ordena preguntas por `order` dentro de cada servicio

**Estructura de la Vista**:
```
Tenant 1
  ├── Servicio A
  │   ├── Pregunta 1
  │   ├── Pregunta 2
  │   └── Pregunta 3
  └── Servicio B
      ├── Pregunta 1
      └── Pregunta 2

Tenant 2
  └── Servicio C
      └── Pregunta 1
```

## Características

### Para Super Admin

1. **Vista por Tenant (predeterminada)**:
   - Muestra todos los tenants con sus preguntas
   - Secciones colapsables por tenant
   - Dentro de cada tenant, preguntas agrupadas por servicio
   - Muestra información del tenant (nombre, slug, estado)
   - Link directo para acceder al tenant
   - Contador de preguntas y servicios por tenant

2. **Vista por Servicio**:
   - Agrupa preguntas por servicio
   - Secciones colapsables por servicio
   - Muestra estadísticas (total, obligatorias, críticas)

3. **Vista de Lista**:
   - Lista plana de todas las preguntas
   - Filtro por servicio
   - Vista tradicional

### Para Usuarios de Tenant

- Solo ven sus propias preguntas
- Vista predeterminada: "Servicio"
- No tienen acceso a la vista "Tenant"

## Acciones Disponibles

En todas las vistas, según permisos:
- ✏️ **Editar**: Modificar pregunta existente
- 🗑️ **Eliminar**: Eliminar pregunta (con confirmación)
- ➕ **Nueva Pregunta**: Crear nueva pregunta

## Flujo de Datos

1. **Frontend** solicita preguntas: `GET /questions`
2. **Backend** detecta si es Super Admin (`tenantId = undefined`)
3. **Backend** devuelve todas las preguntas con relaciones:
   - `question.service` (servicio de la pregunta)
   - `service.tenant` (tenant del servicio)
4. **Frontend** agrupa las preguntas por tenant y servicio
5. **Frontend** muestra la vista jerárquica

## Beneficios

- ✅ Super Admin puede ver todas las preguntas de todos los tenants
- ✅ Organización clara y jerárquica
- ✅ Fácil navegación entre tenants
- ✅ Acceso directo a cada tenant
- ✅ Información contextual (estado, slug, contadores)
- ✅ Todos los tenants visibles (incluso sin preguntas)
- ✅ Rendimiento optimizado (usa datos que ya vienen del backend)

## Pruebas

### Como Super Admin

1. Acceder a `http://admin.localhost:5173`
2. Login: `superadmin@sistema.com` / `superadmin123`
3. Ir a "Preguntas"
4. Verificar que la vista predeterminada es "Tenant"
5. Verificar que se muestran todos los tenants
6. Expandir un tenant para ver sus servicios y preguntas
7. Probar las acciones (editar, eliminar)

### Como Usuario de Tenant

1. Acceder a `http://{slug}.localhost:5173`
2. Login con usuario del tenant
3. Ir a "Preguntas"
4. Verificar que solo se ven las preguntas del tenant
5. Verificar que no aparece el botón "Tenant"

## Archivos Modificados

- `backend/src/questions/questions.service.ts`
- `frontend/src/pages/QuestionsPage.tsx`
- `frontend/src/types/index.ts`

## Fecha de Implementación

Enero 2026
