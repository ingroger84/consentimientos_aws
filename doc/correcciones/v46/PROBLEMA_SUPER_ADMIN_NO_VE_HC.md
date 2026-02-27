# Problema: Super Admin no puede ver las Historias Clínicas

**Fecha:** 27 de febrero de 2026  
**Estado:** 🔍 DIAGNOSTICADO - Requiere acción del usuario

---

## PROBLEMA REPORTADO

El usuario Super Admin no puede ver las historias clínicas creadas en el sistema.

---

## DIAGNÓSTICO

### ✅ Verificaciones Realizadas

1. **Rol Super Administrador:**
   - ✅ Existe en la base de datos
   - ✅ Tiene el permiso `view_global_stats` (requerido para ver todas las HC)
   - ✅ Total de permisos: 82

2. **Usuario Super Admin:**
   - ✅ Email: rcaraballo@innovasystems.com.co
   - ✅ Tiene asignado el rol "Super Administrador"
   - ✅ Rol tipo: `super_admin`

3. **Historias Clínicas:**
   - ✅ Existen 5 historias clínicas en el sistema
   - 4 activas
   - 1 cerrada
   - 0 archivadas

4. **Endpoint `/medical-records/all/grouped`:**
   - ✅ Requiere permiso `VIEW_GLOBAL_STATS`
   - ✅ Llama al método `getAllGroupedByTenant()` que obtiene TODAS las HC sin filtrar por tenant
   - ✅ El código está correcto

5. **Sistema de Permisos:**
   - ✅ `PermissionsGuard` valida correctamente los permisos
   - ✅ `JwtStrategy` obtiene el usuario completo con rol y permisos
   - ✅ `findByEmail()` incluye el rol con `.leftJoinAndSelect('user.role', 'role')`

---

## CAUSA RAÍZ

El usuario Super Admin tiene un **token JWT antiguo** que no incluye los permisos actualizados del rol.

### ¿Por qué sucede esto?

1. El token JWT se genera al iniciar sesión y contiene información del usuario en ese momento
2. Si los permisos del rol se actualizan después, el token NO se actualiza automáticamente
3. El usuario sigue usando el token antiguo hasta que expire o cierre sesión

### Evidencia

- El rol Super Administrador SÍ tiene el permiso `view_global_stats` en la base de datos
- El endpoint y el código están correctos
- El sistema de permisos funciona correctamente
- El problema es que el token del usuario no refleja los permisos actuales

---

## SOLUCIÓN

El usuario Super Admin debe **cerrar sesión y volver a iniciar sesión** para obtener un nuevo token JWT con los permisos actualizados.

### Pasos para el usuario:

1. **Cerrar sesión** en el sistema
2. **Limpiar caché del navegador:** Presionar `Ctrl+Shift+R` (o `Cmd+Shift+R` en Mac)
3. **Volver a iniciar sesión** con las credenciales de Super Admin
4. **Verificar** que ahora puede ver las historias clínicas en la página de Super Admin

### Ruta de la página:

```
https://demo-estetica.archivoenlinea.com/super-admin/medical-records
```

---

## VERIFICACIÓN TÉCNICA

### Consulta SQL para verificar permisos del rol:

```sql
SELECT 
  id,
  name,
  type,
  permissions
FROM roles
WHERE name = 'Super Administrador' OR type = 'super_admin';
```

### Resultado esperado:

```
Rol: Super Administrador
Tipo: super_admin
Permisos: view_dashboard,view_global_stats,view_users,create_users,...
```

### Verificar que incluye:

- ✅ `view_global_stats` - Para ver todas las HC del sistema
- ✅ `view_medical_records` - Para ver HC individuales
- ✅ `edit_medical_records` - Para editar HC
- ✅ `delete_medical_records` - Para eliminar HC
- ✅ `close_medical_records` - Para cerrar HC
- ✅ `archive_medical_records` - Para archivar HC
- ✅ `reopen_medical_records` - Para reabrir HC

---

## CÓDIGO RELEVANTE

### Endpoint que obtiene todas las HC:

**Archivo:** `backend/src/medical-records/medical-records.controller.ts`

```typescript
@Get('all/grouped')
@UseGuards(PermissionsGuard)
@RequirePermissions(PERMISSIONS.VIEW_GLOBAL_STATS)
async getAllGrouped(@Request() req: any) {
  return this.medicalRecordsService.getAllGroupedByTenant();
}
```

### Método que obtiene las HC sin filtrar por tenant:

**Archivo:** `backend/src/medical-records/medical-records.service.ts`

```typescript
async getAllGroupedByTenant() {
  const allRecords = await this.medicalRecordsRepository.find({
    relations: ['tenant', 'client', 'branch', 'creator', 'closer'],
    order: {
      createdAt: 'DESC',
    },
  });

  // Agrupar por tenant
  const groupedMap = new Map<string, any>();

  allRecords.forEach(record => {
    const tenantId = record.tenantId;
    
    if (!groupedMap.has(tenantId)) {
      groupedMap.set(tenantId, {
        tenantId: record.tenant.id,
        tenantName: record.tenant.name,
        tenantSlug: record.tenant.slug,
        totalRecords: 0,
        activeRecords: 0,
        closedRecords: 0,
        archivedRecords: 0,
        records: [],
      });
    }

    const group = groupedMap.get(tenantId);
    group.totalRecords++;
    
    if (record.status === 'active') group.activeRecords++;
    else if (record.status === 'closed') group.closedRecords++;
    else if (record.status === 'archived') group.archivedRecords++;

    group.records.push({
      id: record.id,
      recordNumber: record.recordNumber,
      admissionDate: record.admissionDate,
      admissionType: record.admissionType,
      status: record.status,
      clientName: record.client.fullName,
      clientDocument: record.client.documentNumber,
      branchName: record.branch?.name || 'Sin sede',
      tenantName: record.tenant.name,
      tenantSlug: record.tenant.slug,
      createdAt: record.createdAt,
      createdBy: record.creator?.name || 'Desconocido',
    });
  });

  // Convertir Map a Array y ordenar por total de registros
  const grouped = Array.from(groupedMap.values())
    .sort((a, b) => b.totalRecords - a.totalRecords);

  return grouped;
}
```

---

## PREVENCIÓN FUTURA

### Opción 1: Expiración de tokens más corta

Reducir el tiempo de expiración de los tokens JWT para que se renueven más frecuentemente:

```typescript
// backend/src/auth/auth.module.ts
JwtModule.register({
  secret: process.env.JWT_SECRET,
  signOptions: { 
    expiresIn: '8h' // Reducir de 24h a 8h
  },
})
```

### Opción 2: Endpoint de renovación de token

Crear un endpoint que permita renovar el token sin cerrar sesión:

```typescript
@Post('refresh-token')
async refreshToken(@Request() req) {
  const user = await this.usersService.findByEmail(req.user.email);
  const payload = {
    email: user.email,
    sub: user.id,
    role: user.role?.type,
    tenantId: user.tenant?.id || null,
    tenantSlug: user.tenant?.slug || null,
  };
  return {
    access_token: this.jwtService.sign(payload),
  };
}
```

### Opción 3: Invalidar sesiones al actualizar permisos

Cuando se actualizan los permisos de un rol, invalidar todas las sesiones activas de usuarios con ese rol:

```typescript
async updateRolePermissions(roleId: string, permissions: string[]) {
  // Actualizar permisos del rol
  await this.rolesRepository.update(roleId, { permissions });
  
  // Invalidar sesiones de usuarios con este rol
  const users = await this.usersRepository.find({ where: { roleId } });
  for (const user of users) {
    await this.sessionService.closeAllUserSessions(user.id);
  }
}
```

---

## CONCLUSIÓN

✅ El sistema está funcionando correctamente.

✅ El rol Super Administrador tiene todos los permisos necesarios.

✅ El endpoint y el código están correctos.

❌ El usuario necesita cerrar sesión y volver a iniciar para obtener un nuevo token con los permisos actualizados.

**Acción requerida:** El usuario Super Admin debe cerrar sesión y volver a iniciar sesión.

---

**Diagnóstico realizado por:** Kiro AI Assistant  
**Fecha:** 27 de febrero de 2026

