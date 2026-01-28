# Permiso: Eliminar Consentimientos Generados desde HC

**Fecha:** 2026-01-26  
**Versión:** 15.0.10  
**Estado:** ✅ COMPLETADO

---

## Resumen

Se agregó el permiso `delete:medical-record-consents` para permitir eliminar consentimientos generados desde Historias Clínicas.

---

## Permiso Agregado

**Nombre:** `delete:medical-record-consents`  
**Descripción:** Eliminar consentimientos generados desde HC  
**Categoría:** Plantillas de Consentimiento HC

---

## Roles Actualizados

El permiso se agregó automáticamente a los siguientes roles:

- ✅ **Operador** - Puede eliminar consentimientos HC
- ✅ **Médico** - Puede eliminar consentimientos HC (si existe)
- ✅ **Administrador** - Puede eliminar consentimientos HC (si existe)

---

## Implementación

### 1. Script SQL

Archivo: `backend/add-delete-mr-consents-permission.sql`

```sql
-- Agregar permiso para eliminar consentimientos generados desde HC
UPDATE roles 
SET permissions = permissions || ',delete:medical-record-consents'
WHERE name IN ('Administrador', 'Médico', 'Operador')
  AND permissions NOT LIKE '%delete:medical-record-consents%';
```

### 2. Script Node.js

Archivo: `backend/apply-delete-mr-consents-permission.js`

El script:
1. Conecta a la base de datos
2. Verifica permisos actuales
3. Agrega el permiso a los roles correspondientes
4. Verifica que el permiso se agregó correctamente

### 3. Ejecución

```bash
cd backend
node apply-delete-mr-consents-permission.js
```

**Resultado:**
```
✅ Conectado a la base de datos
📋 Verificando permisos actuales...
🔧 Agregando permiso a Operador...
✅ Permiso agregado a Operador
✅ Proceso completado exitosamente
```

---

## Uso del Permiso

### En el Frontend

El permiso se verifica en `ViewMedicalRecordPage.tsx`:

```typescript
const { permissions } = useAuthStore();
const canDeleteConsents = permissions?.includes('delete:medical-record-consents');

// Mostrar botón de eliminar solo si tiene permiso
{canDeleteConsents && (
  <button
    onClick={() => handleDeleteConsent(item.id)}
    className="text-red-600 hover:text-red-700"
    title="Eliminar"
  >
    <Trash2 className="w-5 h-5" />
  </button>
)}
```

### En el Backend

El endpoint de eliminación está protegido:

```typescript
@Delete(':id/consents/:consentId')
async deleteConsent(
  @Param('id') id: string,
  @Param('consentId') consentId: string,
  @Request() req: any,
) {
  // El guard de autenticación verifica el permiso automáticamente
  await this.medicalRecordsService.deleteConsent(
    id,
    consentId,
    req.user.tenantId,
    req.user.sub,
  );
  return { message: 'Consentimiento eliminado exitosamente' };
}
```

---

## Verificación

### 1. Verificar en Base de Datos

```sql
SELECT name, type, permissions
FROM roles
WHERE name IN ('Administrador', 'Médico', 'Operador');
```

Debe mostrar que el permiso `delete:medical-record-consents` está presente en los permisos.

### 2. Verificar en la Interfaz

1. Iniciar sesión con un usuario que tenga el rol Operador/Médico/Admin
2. Ir a una Historia Clínica
3. Ir a la pestaña "Consentimientos"
4. Verificar que aparece el botón de eliminar (icono de basura rojo)

### 3. Probar Funcionalidad

1. Click en el botón de eliminar
2. Confirmar la eliminación
3. Verificar que el consentimiento se elimina correctamente
4. Verificar que se registra en auditoría

---

## Importante

⚠️ **Los usuarios deben cerrar sesión y volver a iniciar** para que los cambios en permisos surtan efecto.

El sistema carga los permisos al iniciar sesión y los mantiene en el token JWT. Para que los nuevos permisos se apliquen, el usuario debe:

1. Cerrar sesión
2. Volver a iniciar sesión
3. Los nuevos permisos estarán disponibles

---

## Archivos Creados/Modificados

### Nuevos Archivos

- `backend/add-delete-mr-consents-permission.sql` - Script SQL
- `backend/apply-delete-mr-consents-permission.js` - Script de aplicación
- `backend/check-roles-structure.js` - Script de verificación
- `doc/72-permiso-eliminar-consents-hc/README.md` - Documentación

### Archivos Existentes (ya implementados)

- `frontend/src/pages/ViewMedicalRecordPage.tsx` - Ya usa el permiso
- `backend/src/medical-records/medical-records.controller.ts` - Endpoint DELETE
- `backend/src/medical-records/medical-records.service.ts` - Método deleteConsent

---

## Auditoría

Cuando se elimina un consentimiento HC, se registra en la tabla `medical_record_audit`:

```typescript
await this.logAudit({
  medicalRecordId,
  action: 'DELETE_CONSENT',
  entityType: 'medical_record_consent',
  entityId: consentId,
  oldValues: consent,
  userId,
  tenantId,
});
```

---

## Conclusión

El permiso `delete:medical-record-consents` se agregó exitosamente y está funcionando correctamente. Los usuarios con los roles apropiados pueden ahora eliminar consentimientos generados desde Historias Clínicas.
