# Sesión 30 de Enero 2026 - Vista de Consentimientos para Super Admin

**Fecha:** 30 de Enero 2026  
**Hora:** 23:00 - 23:30 UTC  
**Versión:** 23.1.0  
**Estado:** ✅ Completado

---

## 📋 PROBLEMA IDENTIFICADO

El usuario reportó que el Super Admin no podía ver los consentimientos generados por los tenants. Al investigar, se encontró que:

1. **Backend:** El servicio `ConsentsService.findAll()` filtraba los consentimientos:
   - Para usuarios de tenant: mostraba solo sus consentimientos
   - Para Super Admin: mostraba solo consentimientos sin tenant (`tenantId IS NULL`)
   
2. **Frontend:** No existía una página para que el Super Admin viera todos los consentimientos del sistema

3. **Navegación:** No había enlace en el menú del Super Admin para acceder a consentimientos

---

## 🔧 SOLUCIÓN IMPLEMENTADA

### 1. Backend - Nuevo Endpoint para Super Admin

#### Archivo: `backend/src/consents/consents.controller.ts`

**Cambio:** Agregado nuevo endpoint `/consents/all/grouped`

```typescript
@Get('all/grouped')
@UseGuards(PermissionsGuard)
@RequirePermissions(PERMISSIONS.VIEW_DASHBOARD)
getAllGrouped(@CurrentUser() user?: User) {
  return this.consentsService.getAllGroupedByTenant(user);
}
```

**Nota:** El endpoint debe estar ANTES del `@Get()` genérico para evitar conflictos de rutas.

#### Archivo: `backend/src/consents/consents.service.ts`

**Cambios:**

1. **Modificado `findAll()`** - Super Admin ahora ve TODOS los consentimientos:
```typescript
// ANTES:
if (user?.tenant) {
  queryBuilder.andWhere('consent.tenantId = :tenantId', { tenantId: user.tenant.id });
} else if (user && !user.tenant) {
  // Super Admin: ver solo consentimientos sin tenant
  queryBuilder.andWhere('consent.tenantId IS NULL');
}

// DESPUÉS:
if (user?.tenant) {
  queryBuilder.andWhere('consent.tenantId = :tenantId', { tenantId: user.tenant.id });
}
// Super Admin: ver TODOS los consentimientos (sin filtro de tenant)
```

2. **Agregado `getAllGroupedByTenant()`** - Nuevo método para agrupar consentimientos:
```typescript
async getAllGroupedByTenant(user?: User) {
  // Solo Super Admin puede ver consentimientos agrupados
  if (user?.tenant) {
    throw new ForbiddenException('No tienes permisos para ver esta información');
  }

  // Obtener todos los consentimientos con sus relaciones
  const consents = await this.consentsRepository
    .createQueryBuilder('consent')
    .leftJoinAndSelect('consent.service', 'service')
    .leftJoinAndSelect('consent.branch', 'branch')
    .leftJoinAndSelect('consent.tenant', 'tenant')
    .orderBy('consent.createdAt', 'DESC')
    .getMany();

  // Agrupar por tenant
  const grouped = consents.reduce((acc, consent) => {
    const tenantId = consent.tenant?.id || 'no-tenant';
    const tenantName = consent.tenant?.name || 'Sin Cuenta';
    const tenantSlug = consent.tenant?.slug || 'sin-cuenta';

    if (!acc[tenantId]) {
      acc[tenantId] = {
        tenantId: tenantId === 'no-tenant' ? null : tenantId,
        tenantName,
        tenantSlug,
        totalConsents: 0,
        draftConsents: 0,
        signedConsents: 0,
        sentConsents: 0,
        failedConsents: 0,
        consents: [],
      };
    }

    acc[tenantId].totalConsents++;
    
    // Contar por estado
    switch (consent.status) {
      case ConsentStatus.DRAFT:
        acc[tenantId].draftConsents++;
        break;
      case ConsentStatus.SIGNED:
        acc[tenantId].signedConsents++;
        break;
      case ConsentStatus.SENT:
        acc[tenantId].sentConsents++;
        break;
      case ConsentStatus.FAILED:
        acc[tenantId].failedConsents++;
        break;
    }

    acc[tenantId].consents.push({
      id: consent.id,
      clientName: consent.clientName,
      clientId: consent.clientId,
      clientEmail: consent.clientEmail,
      clientPhone: consent.clientPhone,
      serviceName: consent.service?.name || 'Sin servicio',
      branchName: consent.branch?.name || 'Sin sede',
      status: consent.status,
      signedAt: consent.signedAt,
      emailSentAt: consent.emailSentAt,
      createdAt: consent.createdAt,
      tenantName,
      tenantSlug,
    });

    return acc;
  }, {});

  // Convertir a array y ordenar por total de consentimientos
  return Object.values(grouped).sort((a: any, b: any) => b.totalConsents - a.totalConsents);
}
```

---

### 2. Frontend - Nueva Página para Super Admin

#### Archivo: `frontend/src/pages/SuperAdminConsentsPage.tsx`

**Características:**

1. **Interfaz Similar a Historias Clínicas:**
   - Diseño agrupado por tenant
   - Tarjetas colapsables/expandibles
   - Estadísticas por tenant

2. **Tarjetas de Resumen (4):**
   - Total Consentimientos
   - Enviados (verde)
   - Firmados (morado)
   - Borradores (gris)

3. **Filtros:**
   - Búsqueda por nombre de cuenta
   - Filtro por estado (todos, borradores, firmados, enviados, fallidos)

4. **Vista Agrupada:**
   - Cada tenant muestra:
     - Nombre y slug
     - Total de consentimientos
     - Desglose por estado (enviados, firmados, borradores)
   - Al expandir:
     - Lista de todos los consentimientos del tenant
     - Información detallada: cliente, servicio, sede, fecha
     - Badges de estado con iconos
     - **Botones de acción** (solo para consentimientos firmados):
       - 👁️ Vista Previa - Abre el PDF del consentimiento
       - ✉️ Reenviar Email - Reenvía el email con los PDFs
       - 🗑️ Eliminar - Elimina el consentimiento (con confirmación)

5. **Badges de Estado:**
   - Borrador (gris) - Icono: Clock
   - Firmado (azul) - Icono: CheckCircle
   - Enviado (verde) - Icono: Mail
   - Fallido (rojo) - Icono: XCircle

6. **Funcionalidades:**
   - Vista previa de PDFs en modal
   - Reenvío de emails con confirmación
   - Eliminación con confirmación de seguridad
   - Notificaciones toast para acciones
   - Recarga automática después de acciones

---

### 3. Frontend - Actualización de Rutas y Navegación

#### Archivo: `frontend/src/App.tsx`

**Cambios:**

1. **Import de la nueva página:**
```typescript
const SuperAdminConsentsPage = lazy(() => import('./pages/SuperAdminConsentsPage'));
```

2. **Nueva ruta:**
```typescript
<Route path="/super-admin/consents" element={<SuperAdminConsentsPage />} />
```

#### Archivo: `frontend/src/components/Layout.tsx`

**Cambios:**

Actualizada la sección de "Gestión Clínica" para incluir consentimientos del Super Admin:

```typescript
// ANTES:
if (user?.role.type === 'super_admin') {
  clinicalItems.push({
    name: 'Historias Clínicas',
    href: '/super-admin/medical-records',
    icon: ClipboardList,
    permission: 'view_global_stats'
  });
} else {
  clinicalItems.push({
    name: 'Historias Clínicas',
    href: '/medical-records',
    icon: ClipboardList,
    permission: 'view_medical_records'
  });
}

clinicalItems.push({
  name: 'Consentimientos',
  href: '/consents',
  icon: FileText,
  permission: 'view_consents'
});

// DESPUÉS:
if (user?.role.type === 'super_admin') {
  clinicalItems.push({
    name: 'Historias Clínicas',
    href: '/super-admin/medical-records',
    icon: ClipboardList,
    permission: 'view_global_stats'
  });
  clinicalItems.push({
    name: 'Consentimientos',
    href: '/super-admin/consents',
    icon: FileText,
    permission: 'view_global_stats'
  });
} else {
  clinicalItems.push({
    name: 'Historias Clínicas',
    href: '/medical-records',
    icon: ClipboardList,
    permission: 'view_medical_records'
  });
  clinicalItems.push({
    name: 'Consentimientos',
    href: '/consents',
    icon: FileText,
    permission: 'view_consents'
  });
}
```

---

## 📊 ESTRUCTURA DE DATOS

### Respuesta del Endpoint `/consents/all/grouped`

```typescript
interface GroupedConsents {
  tenantId: string | null;
  tenantName: string;
  tenantSlug: string;
  totalConsents: number;
  draftConsents: number;
  signedConsents: number;
  sentConsents: number;
  failedConsents: number;
  consents: Consent[];
}

interface Consent {
  id: string;
  clientName: string;
  clientId: string;
  clientEmail: string;
  clientPhone: string;
  serviceName: string;
  branchName: string;
  status: 'draft' | 'signed' | 'sent' | 'failed';
  signedAt: string | null;
  emailSentAt: string | null;
  createdAt: string;
  tenantName: string;
  tenantSlug: string;
}
```

---

## 🎨 DISEÑO DE LA INTERFAZ

### Paleta de Colores

- **Total:** Azul (`from-blue-500 to-blue-600`)
- **Enviados:** Verde (`from-green-500 to-green-600`)
- **Firmados:** Morado (`from-purple-500 to-purple-600`)
- **Borradores:** Gris (`from-gray-500 to-gray-600`)

### Badges de Estado

| Estado | Color | Icono | Texto |
|--------|-------|-------|-------|
| draft | Gris | Clock | Borrador |
| signed | Azul | CheckCircle | Firmado |
| sent | Verde | Mail | Enviado |
| failed | Rojo | XCircle | Fallido |

### Iconos Utilizados

- `FileText` - Consentimientos
- `Building2` - Sede
- `User` - Cliente
- `Calendar` - Fecha
- `ChevronRight` - Expandir
- `Search` - Búsqueda
- `Filter` - Filtros
- `Mail` - Enviados / Reenviar
- `CheckCircle` - Firmados
- `Clock` - Borradores
- `XCircle` - Fallidos
- `Eye` - Vista Previa
- `Trash2` - Eliminar
- `Loader2` - Cargando (animación)

---

## 🚀 DESPLIEGUE

### Compilación

```bash
# Frontend
cd frontend
npm run build
# ✅ Compilado exitosamente (SuperAdminConsentsPage-DK9zjir2.js)

# Backend
cd backend
NODE_OPTIONS='--max-old-space-size=2048' npm run build
# ✅ Compilado exitosamente
```

### Despliegue al Servidor

```bash
# Subir archivos
scp -i "keys/AWS-ISSABEL.pem" -r backend/dist/* ubuntu@100.28.198.249:/home/ubuntu/consentimientos_aws/backend/dist/
scp -i "keys/AWS-ISSABEL.pem" -r frontend/dist/* ubuntu@100.28.198.249:/home/ubuntu/consentimientos_aws/frontend/dist/

# Reiniciar servicios
ssh -i "keys/AWS-ISSABEL.pem" ubuntu@100.28.198.249 "cd /home/ubuntu/consentimientos_aws && pm2 restart datagree --update-env && sudo systemctl reload nginx"
```

### Estado del Sistema

```
┌────┬─────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id │ name        │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │
├────┼─────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤
│ 0  │ datagree    │ default     │ 23.1.0  │ fork    │ 223242   │ 0s     │ 13   │ online    │ 0%       │ 18.7mb   │ ubuntu   │ disabled │
└────┴─────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘
```

---

## ✅ VERIFICACIÓN

### Funcionalidades Implementadas

- [x] Endpoint backend `/consents/all/grouped`
- [x] Método `getAllGroupedByTenant()` en servicio
- [x] Página `SuperAdminConsentsPage.tsx`
- [x] Ruta `/super-admin/consents` en App.tsx
- [x] Enlace en navegación del Super Admin
- [x] Interfaz agrupada por tenant
- [x] Tarjetas de resumen con estadísticas
- [x] Filtros de búsqueda y estado
- [x] Badges de estado con iconos
- [x] Vista expandible/colapsable
- [x] **Botón Vista Previa** - Abre PDF en modal
- [x] **Botón Reenviar Email** - Con confirmación
- [x] **Botón Eliminar** - Con confirmación de seguridad
- [x] **Modal PdfViewer** - Para visualizar PDFs
- [x] **Notificaciones Toast** - Para feedback de acciones
- [x] **Confirmaciones** - Para acciones críticas
- [x] Diseño responsive
- [x] Compilación exitosa
- [x] Despliegue en producción

### Permisos

- **Super Admin:** Puede ver todos los consentimientos agrupados por tenant
- **Usuarios de Tenant:** Solo ven sus propios consentimientos (sin cambios)

---

## 📝 ARCHIVOS MODIFICADOS

### Backend
1. `backend/src/consents/consents.controller.ts`
   - Agregado endpoint `@Get('all/grouped')`

2. `backend/src/consents/consents.service.ts`
   - Modificado `findAll()` - Super Admin ve todos los consentimientos
   - Agregado `getAllGroupedByTenant()` - Agrupa consentimientos por tenant

### Frontend
3. `frontend/src/pages/SuperAdminConsentsPage.tsx`
   - Nueva página completa para Super Admin
   - Agregados botones de acción: Vista Previa, Reenviar, Eliminar
   - Integración con PdfViewer, Toast y Confirm
   - Mutations para delete y resend email
   - Removido link de navegación a tenant

4. `frontend/src/App.tsx`
   - Agregado import de `SuperAdminConsentsPage`
   - Agregada ruta `/super-admin/consents`

5. `frontend/src/components/Layout.tsx`
   - Actualizada navegación para Super Admin
   - Agregado enlace a consentimientos

---

## 🎯 RESULTADO FINAL

### Para el Super Admin

1. **Menú de Navegación:**
   - Gestión Clínica
     - Historias Clínicas → `/super-admin/medical-records`
     - Consentimientos → `/super-admin/consents` ✨ NUEVO

2. **Vista de Consentimientos:**
   - Tarjetas de resumen con totales
   - Lista agrupada por tenant
   - Estadísticas por tenant
   - Filtros de búsqueda
   - Vista detallada expandible
   - **Botones de acción por consentimiento:**
     - 👁️ Vista Previa (abre PDF)
     - ✉️ Reenviar Email (con confirmación)
     - 🗑️ Eliminar (con confirmación)

3. **Información Visible:**
   - Total de consentimientos del sistema
   - Consentimientos por tenant
   - Estados de cada consentimiento
   - Detalles de clientes, servicios y sedes

4. **Acciones Disponibles:**
   - Ver PDFs de consentimientos
   - Reenviar emails a clientes
   - Eliminar consentimientos
   - Todas con confirmación y feedback

### Para Usuarios de Tenant

- Sin cambios
- Siguen viendo solo sus propios consentimientos
- Interfaz original sin modificaciones

---

## 🔍 PRÓXIMOS PASOS SUGERIDOS

1. **Estadísticas Avanzadas:**
   - Gráficos de consentimientos por fecha
   - Tendencias por tenant
   - Comparativas entre tenants

2. **Filtros Adicionales:**
   - Por rango de fechas
   - Por servicio
   - Por sede

3. **Exportación:**
   - Exportar a Excel/CSV
   - Reportes PDF

4. **Acciones Masivas:**
   - Reenviar emails masivamente
   - Eliminar consentimientos en lote

---

## 📚 NOTAS TÉCNICAS

### Orden de Rutas en NestJS

Es importante que el endpoint `/consents/all/grouped` esté ANTES del endpoint genérico `@Get()` en el controlador. Si no, NestJS interpretará "all" como un ID y llamará al método `findOne()`.

```typescript
// ✅ CORRECTO
@Get('all/grouped')
getAllGrouped() { ... }

@Get()
findAll() { ... }

// ❌ INCORRECTO
@Get()
findAll() { ... }

@Get('all/grouped')  // Nunca se ejecutará
getAllGrouped() { ... }
```

### Permisos

El endpoint usa el permiso `VIEW_DASHBOARD` que ya tiene el Super Admin. No fue necesario crear un nuevo permiso.

### Seguridad

El método `getAllGroupedByTenant()` verifica que el usuario sea Super Admin:
```typescript
if (user?.tenant) {
  throw new ForbiddenException('No tienes permisos para ver esta información');
}
```

---

**Documentado por:** Kiro AI  
**Fecha:** 30 de Enero 2026  
**Hora:** 23:30 UTC  
**Estado:** ✅ Implementación Completa
