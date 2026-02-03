# Sesión 31 de Enero 2026 - Permisos para Gestión de Estados de HC

**Fecha:** 31 de Enero 2026  
**Versión:** 23.1.0  
**Estado:** ✅ Completado y Desplegado

---

## 📋 RESUMEN

Se implementó el sistema de permisos para la gestión de estados de historias clínicas, permitiendo controlar qué usuarios pueden cerrar, archivar y reabrir historias clínicas según sus roles.

---

## 🎯 OBJETIVO

Agregar permisos específicos para las funciones de gestión de estados de historias clínicas (cerrar, archivar, reabrir) que fueron implementadas previamente, permitiendo que solo usuarios autorizados puedan realizar estas acciones.

---

## 🔧 CAMBIOS IMPLEMENTADOS

### 1. Backend - Nuevos Permisos

**Archivo:** `backend/src/auth/constants/permissions.ts`

#### Permisos Agregados:
```typescript
// Historias Clínicas - Gestión de Estados
CLOSE_MEDICAL_RECORDS: 'close_medical_records',
ARCHIVE_MEDICAL_RECORDS: 'archive_medical_records',
REOPEN_MEDICAL_RECORDS: 'reopen_medical_records',
```

#### Roles con Permisos:
- **SUPER_ADMIN**: Todos los permisos de gestión de estados
- **ADMIN_GENERAL**: Todos los permisos de gestión de estados

#### Descripciones de Permisos:
```typescript
[PERMISSIONS.CLOSE_MEDICAL_RECORDS]: 'Cerrar historias clínicas',
[PERMISSIONS.ARCHIVE_MEDICAL_RECORDS]: 'Archivar historias clínicas',
[PERMISSIONS.REOPEN_MEDICAL_RECORDS]: 'Reabrir historias clínicas',
```

#### Categoría:
Los permisos se agregaron a la categoría `medical_records` junto con los demás permisos de historias clínicas.

---

### 2. Backend - Guards en Endpoints

**Archivo:** `backend/src/medical-records/medical-records.controller.ts`

Se agregaron guards de permisos a los endpoints de gestión de estados:

```typescript
@Post(':id/close')
@UseGuards(PermissionsGuard)
@RequirePermissions(PERMISSIONS.CLOSE_MEDICAL_RECORDS)
async close(@Param('id') id: string, @Request() req: any) {
  // ...
}

@Post(':id/archive')
@UseGuards(PermissionsGuard)
@RequirePermissions(PERMISSIONS.ARCHIVE_MEDICAL_RECORDS)
async archive(@Param('id') id: string, @Request() req: any) {
  // ...
}

@Post(':id/reopen')
@UseGuards(PermissionsGuard)
@RequirePermissions(PERMISSIONS.REOPEN_MEDICAL_RECORDS)
async reopen(@Param('id') id: string, @Request() req: any) {
  // ...
}
```

**Funcionamiento:**
- `@UseGuards(PermissionsGuard)`: Activa la verificación de permisos
- `@RequirePermissions()`: Especifica qué permiso se requiere
- Si el usuario no tiene el permiso, recibe un error 403 Forbidden

---

### 3. Frontend - Vista de Detalles de HC

**Archivo:** `frontend/src/pages/ViewMedicalRecordPage.tsx`

#### Verificación de Permisos:
```typescript
// Permisos
const canDeleteConsents = user?.role?.permissions?.includes('delete_mr_consents') || false;
const canCloseRecords = user?.role?.permissions?.includes('close_medical_records') || false;
const canArchiveRecords = user?.role?.permissions?.includes('archive_medical_records') || false;
const canReopenRecords = user?.role?.permissions?.includes('reopen_medical_records') || false;
```

#### Botones Condicionados:
```typescript
{record.status === 'active' && (
  <>
    {canArchiveRecords && (
      <button onClick={handleArchive}>Archivar</button>
    )}
    {canCloseRecords && (
      <button onClick={handleClose}>Cerrar HC</button>
    )}
  </>
)}
{(record.status === 'closed' || record.status === 'archived') && canReopenRecords && (
  <button onClick={handleReopen}>Reabrir HC</button>
)}
```

**Comportamiento:**
- Los botones solo se muestran si el usuario tiene el permiso correspondiente
- Si no tiene permiso, el botón no aparece en la interfaz

---

### 4. Frontend - Vista Super Admin

**Archivo:** `frontend/src/pages/SuperAdminMedicalRecordsPage.tsx`

En la vista del Super Admin, los botones de gestión de estados están siempre disponibles ya que el Super Admin tiene todos los permisos por defecto.

**Botones Implementados:**
- ✅ **Activa** (CheckCircle verde): Reabrir HC
- 📦 **Archivada** (Archive azul): Archivar HC
- 🔒 **Cerrada** (Lock gris): Cerrar HC

El botón del estado actual se muestra resaltado y deshabilitado.

---

## 📊 MATRIZ DE PERMISOS

| Rol | Cerrar HC | Archivar HC | Reabrir HC |
|-----|-----------|-------------|------------|
| **SUPER_ADMIN** | ✅ | ✅ | ✅ |
| **ADMIN_GENERAL** | ✅ | ✅ | ✅ |
| **ADMIN_SEDE** | ❌ | ❌ | ❌ |
| **OPERADOR** | ❌ | ❌ | ❌ |

---

## 🔐 SEGURIDAD

### Validaciones Backend:
1. **Guard de Autenticación**: Todos los endpoints requieren JWT válido
2. **Guard de Permisos**: Verifica que el usuario tenga el permiso específico
3. **Validación de Estado**: El servicio valida que el cambio de estado sea válido
4. **Auditoría**: Todos los cambios de estado quedan registrados con usuario, IP y timestamp

### Validaciones Frontend:
1. **Verificación de Permisos**: Los botones solo se muestran si hay permiso
2. **Confirmaciones**: Todas las acciones requieren confirmación del usuario
3. **Mensajes Informativos**: Se explica claramente qué hace cada acción

---

## 🚀 DESPLIEGUE

### Compilación:
```bash
# Backend
cd backend
$env:NODE_OPTIONS='--max-old-space-size=2048'
npm run build

# Frontend
cd frontend
npm run build
```

### Transferencia:
```bash
# Backend
scp -i "keys/AWS-ISSABEL.pem" -r backend/dist/* ubuntu@100.28.198.249:/home/ubuntu/consentimientos_aws/backend/dist/

# Frontend
scp -i "keys/AWS-ISSABEL.pem" -r frontend/dist/* ubuntu@100.28.198.249:/home/ubuntu/consentimientos_aws/frontend/dist/
```

### Reinicio de Servicios:
```bash
ssh -i "keys/AWS-ISSABEL.pem" ubuntu@100.28.198.249 "cd /home/ubuntu/consentimientos_aws && pm2 restart datagree --update-env && sudo systemctl reload nginx"
```

### Estado del Servicio:
```
┌────┬──────────┬─────────┬─────────┬────────┬──────┬───────────┐
│ id │ name     │ version │ mode    │ pid    │ ↺    │ status    │
├────┼──────────┼─────────┼─────────┼────────┼──────┼───────────┤
│ 0  │ datagree │ 23.1.0  │ fork    │ 224363 │ 15   │ online    │
└────┴──────────┴─────────┴─────────┴────────┴──────┴───────────┘
```

---

## ✅ VERIFICACIÓN

### Pruebas Realizadas:
1. ✅ Backend compilado sin errores
2. ✅ Frontend compilado sin errores
3. ✅ Archivos desplegados correctamente
4. ✅ Servicio PM2 reiniciado exitosamente
5. ✅ Nginx recargado correctamente

### Funcionalidades Verificadas:
- ✅ Permisos agregados al sistema
- ✅ Guards aplicados en endpoints
- ✅ Botones condicionados a permisos en frontend
- ✅ Super Admin tiene acceso completo
- ✅ Roles sin permiso no ven los botones

---

## 📝 NOTAS TÉCNICAS

### Flujo de Verificación de Permisos:

1. **Frontend:**
   - Usuario hace clic en botón
   - Frontend verifica permiso localmente
   - Si no tiene permiso, botón no se muestra

2. **Backend:**
   - Request llega al endpoint
   - `PermissionsGuard` verifica el permiso
   - Si no tiene permiso, retorna 403 Forbidden
   - Si tiene permiso, ejecuta la acción

### Consistencia:
- Los permisos se verifican tanto en frontend como en backend
- Frontend oculta opciones no permitidas (UX)
- Backend valida permisos (Seguridad)
- Doble capa de protección

---

## 🔄 COMPATIBILIDAD

### Usuarios Existentes:
- Los roles SUPER_ADMIN y ADMIN_GENERAL ya tienen los permisos automáticamente
- Los demás roles NO tienen los permisos por defecto
- Se puede asignar permisos individuales desde la página de Roles

### Migración:
- No se requiere migración de base de datos
- Los permisos se aplican automáticamente según el rol
- Compatible con versiones anteriores

---

## 📚 DOCUMENTACIÓN RELACIONADA

- `doc/SESION_2026-01-30_GESTION_ESTADOS_HC.md` - Implementación inicial de gestión de estados
- `doc/SESION_2026-01-30_BOTONES_ESTADOS_HC_SUPER_ADMIN.md` - Botones en vista Super Admin
- `backend/src/auth/constants/permissions.ts` - Definición de todos los permisos

---

## 🎉 RESULTADO FINAL

Sistema de permisos para gestión de estados de historias clínicas completamente implementado y desplegado. Los usuarios ahora solo pueden cerrar, archivar o reabrir historias clínicas si tienen los permisos correspondientes asignados a su rol.

**Estado:** ✅ **COMPLETADO Y EN PRODUCCIÓN**
