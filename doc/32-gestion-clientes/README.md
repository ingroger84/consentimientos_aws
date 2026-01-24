# Módulo de Gestión de Clientes

## Descripción

Sistema completo de gestión de clientes (pacientes) para el sistema de consentimientos digitales. Permite crear, buscar, editar y visualizar información detallada de clientes, con integración automática al flujo de creación de consentimientos.

## Características Principales

### 1. Base de Datos de Clientes
- **Información Básica**: Nombre completo, tipo y número de documento
- **Información de Contacto**: Email, teléfono, dirección, ciudad
- **Información Personal**: Fecha de nacimiento, género, tipo de sangre
- **Contacto de Emergencia**: Nombre y teléfono
- **Notas**: Campo de texto libre para información adicional
- **Estadísticas**: Contador de consentimientos y fecha del último consentimiento

### 2. Búsqueda Eficiente
- Búsqueda general por nombre, documento, email o teléfono
- Búsqueda específica por cada campo
- Índices optimizados en base de datos para consultas rápidas
- Debounce en búsqueda para mejor performance

### 3. Gestión Completa
- Crear nuevos clientes con validación de datos
- Editar información de clientes existentes
- Ver detalles completos del cliente
- Eliminar clientes (solo si no tienen consentimientos)
- Historial de consentimientos por cliente

### 4. Multi-Tenant
- Clientes aislados por tenant
- Acceso desde cualquier sede del tenant
- Índice único por tenant + tipo documento + número documento

## Arquitectura

### Backend

#### Entidad: `Client`
```typescript
- id: UUID
- fullName: string
- documentType: enum (CC, TI, CE, PA, RC, NIT)
- documentNumber: string
- email?: string
- phone?: string
- address?: string
- city?: string
- birthDate?: Date
- gender?: string
- bloodType?: string
- emergencyContactName?: string
- emergencyContactPhone?: string
- notes?: string
- consentsCount: number
- lastConsentAt?: Date
- tenantId: UUID
- createdAt: Date
- updatedAt: Date
```

#### Índices de Base de Datos
```sql
-- Índice único para evitar duplicados
IDX_clients_tenant_document (tenant_id, document_type, document_number) UNIQUE

-- Índices para búsquedas eficientes
IDX_clients_tenant_email (tenant_id, email)
IDX_clients_tenant_phone (tenant_id, phone)
IDX_clients_tenant_fullname (tenant_id, full_name)
```

#### Endpoints API

**GET /clients**
- Obtener todos los clientes del tenant
- Ordenados por último consentimiento y nombre

**GET /clients/search?search=xxx**
- Búsqueda general o específica
- Parámetros: search, documentNumber, documentType, email, phone, fullName
- Límite: 50 resultados

**GET /clients/:id**
- Obtener un cliente específico
- Incluye relaciones con consentimientos

**POST /clients**
- Crear nuevo cliente
- Validación de documento único por tenant

**PATCH /clients/:id**
- Actualizar cliente
- No permite cambiar tipo y número de documento

**DELETE /clients/:id**
- Eliminar cliente
- Solo si no tiene consentimientos asociados

**GET /clients/stats**
- Estadísticas de clientes del tenant

#### Servicios

**ClientsService**
- `create()`: Crear cliente con validación de duplicados
- `search()`: Búsqueda optimizada con múltiples criterios
- `findByDocument()`: Buscar por documento exacto
- `findAll()`: Listar todos los clientes
- `findOne()`: Obtener cliente con relaciones
- `update()`: Actualizar información
- `remove()`: Eliminar con validación
- `incrementConsentsCount()`: Actualizar estadísticas
- `getStats()`: Obtener métricas

### Frontend

#### Páginas

**ClientsPage** (`/clients`)
- Lista de clientes con búsqueda
- Tabla con información resumida
- Acciones: Ver detalles, Editar, Eliminar
- Botón para crear nuevo cliente

#### Componentes

**CreateClientModal**
- Formulario completo para nuevo cliente
- Validación de campos requeridos
- Secciones: Información básica, Contacto, Emergencia, Notas

**EditClientModal**
- Formulario de edición
- No permite cambiar documento
- Mismos campos que creación

**ClientDetailsModal**
- Vista completa del cliente
- Estadísticas de consentimientos
- Información organizada por secciones
- Historial de consentimientos

#### Servicios

**clientService**
- Métodos para todas las operaciones CRUD
- Integración con API del backend
- Manejo de errores

## Integración con Consentimientos

### Relación en Base de Datos
```sql
ALTER TABLE consents ADD COLUMN client_id UUID NULL;
ALTER TABLE consents ADD FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;
```

### Flujo de Creación de Consentimiento

1. **Paso 1: Datos del Cliente**
   - Buscar cliente existente por documento
   - Si existe: Autocompletar datos
   - Si no existe: Permitir crear nuevo cliente
   - Continuar con foto y firma

2. **Al Crear Consentimiento**
   - Si cliente existe: Vincular consentimiento
   - Si es nuevo: Crear cliente y vincular
   - Incrementar contador de consentimientos
   - Actualizar fecha de último consentimiento

## Validaciones

### Backend
- Nombre completo: 3-100 caracteres
- Número de documento: 5-20 caracteres alfanuméricos
- Email: Formato válido
- Teléfono: Solo números y caracteres permitidos
- Documento único por tenant

### Frontend
- Campos requeridos: Nombre, tipo documento, número documento
- Validación de formato en tiempo real
- Mensajes de error claros
- Confirmación antes de eliminar

## Permisos

Utiliza los permisos existentes de consentimientos:
- `view_consents`: Ver lista de clientes
- `create_consents`: Crear nuevos clientes
- `update_consents`: Editar clientes
- `delete_consents`: Eliminar clientes

## Performance

### Optimizaciones de Base de Datos
1. Índices en campos de búsqueda frecuente
2. Índice único compuesto para evitar duplicados
3. Límite de 50 resultados en búsquedas
4. Consultas con ILIKE para búsqueda case-insensitive

### Optimizaciones de Frontend
1. Debounce en búsqueda (500ms)
2. Lazy loading de la página
3. Carga condicional de modales
4. Actualización optimista de UI

## Tipos de Documento Soportados

- **CC**: Cédula de Ciudadanía
- **TI**: Tarjeta de Identidad
- **CE**: Cédula de Extranjería
- **PA**: Pasaporte
- **RC**: Registro Civil
- **NIT**: NIT (para empresas)

## Casos de Uso

### 1. Cliente Frecuente
1. Operador busca por documento
2. Sistema encuentra cliente existente
3. Datos se autocomplet an
4. Continúa con creación de consentimiento

### 2. Cliente Nuevo
1. Operador busca por documento
2. Sistema no encuentra cliente
3. Operador completa formulario
4. Sistema crea cliente y consentimiento

### 3. Actualizar Información
1. Operador accede a módulo de clientes
2. Busca y selecciona cliente
3. Edita información desactualizada
4. Cambios se reflejan en próximos consentimientos

### 4. Consultar Historial
1. Operador busca cliente
2. Ve detalles completos
3. Revisa lista de consentimientos
4. Accede a consentimientos específicos

## Migración de Datos

### Script de Migración
```sql
-- Crear tabla clients
-- Agregar índices
-- Agregar columna client_id a consents
-- Migrar datos existentes (opcional)
```

### Migración de Datos Existentes (Opcional)
```sql
-- Crear clientes desde consentimientos existentes
INSERT INTO clients (full_name, document_type, document_number, email, phone, tenant_id)
SELECT DISTINCT 
  client_name,
  'CC' as document_type,
  client_id as document_number,
  client_email,
  client_phone,
  tenant_id
FROM consents
WHERE client_id IS NOT NULL;

-- Vincular consentimientos con clientes
UPDATE consents c
SET client_id = (
  SELECT id FROM clients cl
  WHERE cl.document_number = c.client_id
  AND cl.tenant_id = c.tenant_id
  LIMIT 1
);
```

## Archivos Creados

### Backend
```
backend/src/clients/
├── entities/
│   └── client.entity.ts
├── dto/
│   ├── create-client.dto.ts
│   ├── update-client.dto.ts
│   └── search-client.dto.ts
├── clients.controller.ts
├── clients.service.ts
└── clients.module.ts

backend/src/database/migrations/
└── 1737680000000-CreateClientsTable.ts
```

### Frontend
```
frontend/src/pages/
└── ClientsPage.tsx

frontend/src/components/clients/
├── CreateClientModal.tsx
├── EditClientModal.tsx
└── ClientDetailsModal.tsx

frontend/src/services/
└── client.service.ts

frontend/src/types/
└── client.ts
```

### Documentación
```
doc/32-gestion-clientes/
└── README.md
```

## Próximos Pasos

1. ✅ Implementar módulo completo de clientes
2. ⏳ Integrar búsqueda de clientes en CreateConsentPage
3. ⏳ Migrar datos existentes de consentimientos
4. ⏳ Agregar exportación de clientes a Excel/CSV
5. ⏳ Implementar importación masiva de clientes
6. ⏳ Agregar filtros avanzados (rango de fechas, ciudad, etc.)
7. ⏳ Implementar dashboard de clientes con métricas

## Notas Técnicas

- Los clientes son compartidos entre todas las sedes de un tenant
- El documento es único por tenant (no puede haber duplicados)
- Los clientes no se eliminan si tienen consentimientos asociados
- Las estadísticas se actualizan automáticamente al crear consentimientos
- La búsqueda es case-insensitive para mejor UX
- Los índices garantizan consultas rápidas incluso con miles de clientes

---

**Implementado por**: Sistema Automatizado  
**Fecha**: 2026-01-23  
**Versión**: 8.1.1
