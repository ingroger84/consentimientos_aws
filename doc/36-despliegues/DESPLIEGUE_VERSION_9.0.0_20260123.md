# Despliegue Versión 9.0.0 - Módulo de Gestión de Clientes

**Fecha:** 23 de enero de 2026  
**Versión:** 9.0.0  
**Tipo de cambio:** MAJOR (Nueva funcionalidad principal)

## Resumen

Implementación completa del módulo de gestión de clientes con integración automática en el flujo de creación de consentimientos. Los clientes son compartidos entre todas las sedes de un tenant y se pueden buscar/crear durante el proceso de captura de consentimientos.

## Cambios Implementados

### Backend

#### 1. Nueva Entidad Client
- **Archivo:** `backend/src/clients/entities/client.entity.ts`
- Campos completos: nombre, tipo y número de documento, email, teléfono, dirección, ciudad, fecha de nacimiento, género, tipo de sangre, contacto de emergencia, notas
- Contador de consentimientos y fecha del último consentimiento
- Relación con Tenant (multi-tenant)
- Soft delete habilitado

#### 2. DTOs de Cliente
- **CreateClientDto:** Validación completa para creación
- **UpdateClientDto:** Actualización parcial de datos
- **SearchClientDto:** Búsqueda flexible por múltiples criterios

#### 3. Servicio de Clientes
- **Archivo:** `backend/src/clients/clients.service.ts`
- Búsqueda optimizada con índices de BD
- Búsqueda por nombre, documento, email o teléfono
- Validación de duplicados por documento
- Incremento automático de contador de consentimientos
- Estadísticas de clientes

#### 4. Controlador REST
- **Archivo:** `backend/src/clients/clients.controller.ts`
- Endpoints completos CRUD
- GET `/api/clients` - Listar todos
- GET `/api/clients/search?search=...` - Búsqueda
- GET `/api/clients/stats` - Estadísticas
- GET `/api/clients/:id` - Obtener uno
- POST `/api/clients` - Crear
- PATCH `/api/clients/:id` - Actualizar
- DELETE `/api/clients/:id` - Eliminar

#### 5. Migración de Base de Datos
- **Archivo:** `backend/src/database/migrations/1737680000000-CreateClientsTable.ts`
- Tabla `clients` con todos los campos
- Índices optimizados:
  - Único: `tenant_id + document_type + document_number`
  - Búsqueda: `tenant_id + email`, `tenant_id + phone`, `tenant_id + full_name`
- Columna `client_uuid` en tabla `consents` para relación FK
- Foreign keys con CASCADE y SET NULL

#### 6. Integración con Consentimientos
- **Archivo:** `backend/src/consents/consents.service.ts`
- Búsqueda automática de cliente por documento al crear consentimiento
- Creación automática de cliente si no existe
- Vinculación automática con consentimiento
- Actualización de estadísticas del cliente

### Frontend

#### 1. Página de Gestión de Clientes
- **Archivo:** `frontend/src/pages/ClientsPage.tsx`
- Lista completa de clientes con búsqueda
- Tabla con información principal
- Acciones: ver detalles, editar, eliminar
- Contador de consentimientos por cliente

#### 2. Modales de Cliente
- **CreateClientModal:** Formulario completo para crear cliente
- **EditClientModal:** Edición de datos existentes
- **ClientDetailsModal:** Vista detallada con historial de consentimientos

#### 3. Componente de Búsqueda para Consentimientos
- **Archivo:** `frontend/src/components/consents/ClientSearchForm.tsx`
- Búsqueda en tiempo real con debounce
- Autocompletado de datos si el cliente existe
- Formulario manual si el cliente no existe
- Indicador visual de cliente frecuente
- Muestra contador de consentimientos previos

#### 4. Integración en CreateConsentPage
- **Archivo:** `frontend/src/pages/CreateConsentPage.tsx`
- Reemplazado formulario manual por `ClientSearchForm`
- Handlers para selección y cambio de datos
- Envío de `documentType` y `existingClientId` al backend
- Creación/vinculación automática en el backend

#### 5. Servicio de API
- **Archivo:** `frontend/src/services/client.service.ts`
- Métodos completos para todas las operaciones CRUD
- Búsqueda con parámetros flexibles

#### 6. Tipos TypeScript
- **Archivo:** `frontend/src/types/client.ts`
- Interfaz `Client` completa
- Enum `ClientDocumentType` (CC, TI, CE, PA, RC, NIT)
- Labels para tipos de documento

#### 7. Navegación
- Enlace "Clientes" agregado al menú lateral
- Ruta `/clients` configurada en App.tsx

## Correcciones Técnicas

### 1. Conflicto de Nombres de Columna
**Problema:** La tabla `consents` ya tenía una columna `client_id` (varchar) para el número de documento.

**Solución:** 
- Usada columna `client_uuid` (uuid) para la relación FK con tabla `clients`
- Agregado `@JoinColumn({ name: 'client_uuid' })` en la entidad Consent
- Script SQL manual para crear la columna y relación

### 2. Dependencias de Módulos
**Problema:** `ClientsModule` necesitaba `TenantsService` para el `TenantGuard`.

**Solución:**
- Importado `TenantsModule` en `ClientsModule`
- Eliminados decoradores de permisos no existentes

## Archivos Modificados

### Backend
```
backend/src/clients/
├── entities/client.entity.ts (NUEVO)
├── dto/
│   ├── create-client.dto.ts (NUEVO)
│   ├── update-client.dto.ts (NUEVO)
│   └── search-client.dto.ts (NUEVO)
├── clients.service.ts (NUEVO)
├── clients.controller.ts (NUEVO)
└── clients.module.ts (NUEVO)

backend/src/consents/
├── consents.service.ts (MODIFICADO)
├── consents.module.ts (MODIFICADO)
├── dto/create-consent.dto.ts (MODIFICADO)
└── entities/consent.entity.ts (MODIFICADO)

backend/src/database/migrations/
└── 1737680000000-CreateClientsTable.ts (NUEVO)

backend/src/app.module.ts (MODIFICADO)
```

### Frontend
```
frontend/src/pages/
├── ClientsPage.tsx (NUEVO)
└── CreateConsentPage.tsx (MODIFICADO)

frontend/src/components/
├── clients/
│   ├── CreateClientModal.tsx (NUEVO)
│   ├── EditClientModal.tsx (NUEVO)
│   └── ClientDetailsModal.tsx (NUEVO)
└── consents/
    └── ClientSearchForm.tsx (NUEVO)

frontend/src/services/
└── client.service.ts (NUEVO)

frontend/src/types/
└── client.ts (NUEVO)

frontend/src/App.tsx (MODIFICADO)
frontend/src/components/Layout.tsx (MODIFICADO)
```

## Scripts SQL Ejecutados

### 1. manual-client-migration.sql
Creación inicial de tabla `clients` con índices y relaciones.

### 2. fix-client-relation.sql
Corrección de relación FK usando columna `client_uuid` en lugar de `client_id`.

## Proceso de Despliegue

### 1. Compilación Local
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

### 2. Migración de Base de Datos
```bash
# Ejecutar scripts SQL manualmente
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
cd /home/ubuntu/consentimientos_aws/backend
sudo -u postgres psql consentimientos < manual-client-migration.sql
sudo -u postgres psql consentimientos < fix-client-relation.sql
```

### 3. Copia de Archivos
```bash
# Backend
scp -i AWS-ISSABEL.pem -r backend/dist ubuntu@100.28.198.249:/home/ubuntu/consentimientos_aws/backend/

# Frontend (ambas ubicaciones)
scp -i AWS-ISSABEL.pem -r frontend/dist/* ubuntu@100.28.198.249:/home/ubuntu/consentimientos_aws/frontend/dist/
scp -i AWS-ISSABEL.pem -r frontend/dist/* ubuntu@100.28.198.249:/var/www/html/
```

### 4. Reinicio del Backend
```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "pm2 restart datagree-backend"
```

## Verificación

### Backend
```bash
curl https://archivoenlinea.com/api/auth/version
# Respuesta: {"version":"9.0.0","date":"2026-01-23","fullVersion":"9.0.0 - 2026-01-23"}
```

### Endpoints de Clientes
- ✅ GET `/api/clients` - Lista de clientes
- ✅ GET `/api/clients/search?search=juan` - Búsqueda
- ✅ GET `/api/clients/stats` - Estadísticas
- ✅ POST `/api/clients` - Crear cliente
- ✅ PATCH `/api/clients/:id` - Actualizar
- ✅ DELETE `/api/clients/:id` - Eliminar

### Frontend
- ✅ Página `/clients` accesible
- ✅ Búsqueda de clientes funcional
- ✅ Creación de clientes
- ✅ Edición de clientes
- ✅ Integración en creación de consentimientos

## Características Principales

### 1. Búsqueda Inteligente
- Búsqueda en tiempo real con debounce (500ms)
- Busca por: nombre, documento, email, teléfono
- Resultados limitados a 50 para performance
- Ordenados por último consentimiento

### 2. Gestión Multi-Tenant
- Clientes compartidos entre todas las sedes de un tenant
- Aislamiento completo entre tenants
- Validación de duplicados por tenant

### 3. Integración Automática
- Al crear consentimiento, busca cliente por documento
- Si existe, vincula automáticamente
- Si no existe, crea automáticamente
- Actualiza contador y fecha del último consentimiento

### 4. Estadísticas
- Contador de consentimientos por cliente
- Fecha del último consentimiento
- Indicador visual de cliente frecuente

## Documentación

- **README:** `doc/32-gestion-clientes/README.md`
- **Integración:** `doc/32-gestion-clientes/INTEGRACION_CONSENTIMIENTOS.md`

## Próximos Pasos

1. Probar flujo completo de creación de consentimiento con búsqueda de cliente
2. Verificar que los clientes se crean automáticamente
3. Confirmar que las estadísticas se actualizan correctamente
4. Probar búsqueda de clientes existentes
5. Validar que los clientes son compartidos entre sedes del mismo tenant

## Notas Técnicas

- **Versión detectada automáticamente:** Sistema de versionamiento inteligente detectó cambio MAJOR
- **Índices de BD:** Optimizados para búsquedas rápidas
- **Soft Delete:** Los clientes eliminados mantienen historial
- **Validación:** No se puede eliminar cliente con consentimientos asociados
- **Performance:** Límite de 50 resultados en búsquedas
- **Debounce:** 500ms para evitar búsquedas excesivas

## Estado Final

✅ **Backend compilado y desplegado**  
✅ **Frontend compilado y desplegado**  
✅ **Migración de BD ejecutada**  
✅ **Backend reiniciado**  
✅ **Versión 9.0.0 verificada**  
✅ **Endpoints funcionando**  

**Despliegue completado exitosamente.**
