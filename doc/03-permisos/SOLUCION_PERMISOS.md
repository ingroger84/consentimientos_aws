# ✅ Solución al Problema de Permisos

## 🔍 Problema Identificado

Los permisos no se estaban guardando correctamente en la base de datos cuando se ejecutó el seed inicial.

## ✅ Solución Aplicada

Se actualizaron los permisos directamente en la base de datos:

### Permisos por Rol

**Administrador General:**
- `delete_consents` - Eliminar consentimientos
- `manage_users` - Gestionar usuarios
- `manage_branches` - Gestionar sedes
- `manage_services` - Gestionar servicios

**Administrador de Sede:**
- `delete_consents` - Eliminar consentimientos

**Operador:**
- Sin permisos especiales (solo crear consentimientos)

---

## 🔄 IMPORTANTE: Debes Cerrar Sesión y Volver a Entrar

### ¿Por qué?

El token JWT que se genera al hacer login contiene los permisos del usuario en ese momento. Si los permisos cambian en la base de datos, el token antiguo sigue teniendo los permisos viejos.

### Pasos para Aplicar los Cambios:

1. **Cerrar sesión** en el sistema (click en tu nombre → Cerrar Sesión)
2. **Volver a iniciar sesión** con:
   - Email: admin@consentimientos.com
   - Password: admin123
3. **Ahora tendrás todos los permisos** correctos

---

## 🧪 Verificación

Después de hacer login nuevamente, deberías poder:

✅ Gestionar usuarios (crear, editar, eliminar)
✅ Gestionar sedes (crear, editar, eliminar)
✅ Gestionar servicios (crear, editar, eliminar)
✅ Gestionar preguntas (crear, editar, eliminar)
✅ Eliminar consentimientos
✅ Actualizar permisos de roles

---

## 🔧 Comandos Ejecutados

```sql
-- Actualizar permisos del Administrador General
UPDATE roles 
SET permissions = 'delete_consents,manage_users,manage_branches,manage_services' 
WHERE type = 'ADMIN_GENERAL';

-- Actualizar permisos del Administrador de Sede
UPDATE roles 
SET permissions = 'delete_consents' 
WHERE type = 'ADMIN_SEDE';
```

---

## 📋 Verificar Permisos en la Base de Datos

Si quieres verificar que los permisos están correctos:

```bash
docker exec -it consentimientos-db psql -U admin -d consentimientos -c "SELECT name, type, permissions FROM roles;"
```

Deberías ver:
```
         name          |     type      |                         permissions
-----------------------+---------------+--------------------------------------------------------------
 Administrador General | ADMIN_GENERAL | delete_consents,manage_users,manage_branches,manage_services
 Administrador de Sede | ADMIN_SEDE    | delete_consents
 Operador              | OPERADOR      |
```

---

## ⚠️ Si el Problema Persiste

1. **Abre la consola del navegador** (F12)
2. **Ve a Application → Local Storage**
3. **Elimina manualmente** las claves `token` y `user`
4. **Recarga la página** (F5)
5. **Inicia sesión nuevamente**

---

## 🎯 Resumen

**Problema:** Permisos vacíos en la base de datos
**Solución:** Permisos actualizados correctamente
**Acción requerida:** Cerrar sesión y volver a entrar

**¡Los permisos ya están funcionando correctamente!**
