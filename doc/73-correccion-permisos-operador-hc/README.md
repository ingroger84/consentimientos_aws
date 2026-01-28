# 🔧 Corrección de Permisos - Rol Operador (Plantillas HC)

## 📋 Problema Detectado

El rol **Operador** tenía activo el permiso `delete_mr_consent_templates` (Eliminar plantillas de consentimiento HC) cuando NO debería tenerlo según la especificación.

### Permisos Incorrectos
- ❌ `delete_mr_consent_templates` - Eliminar plantillas de consentimiento HC

### Permisos Correctos
El rol Operador solo debe tener estos permisos relacionados con Plantillas HC:
- ✅ `view_mr_consent_templates` - Ver plantillas de consentimiento HC
- ✅ `create_mr_consent_templates` - Crear plantillas de consentimiento HC
- ✅ `edit_mr_consent_templates` - Editar plantillas de consentimiento HC
- ✅ `generate_mr_consents` - Generar consentimientos desde HC
- ✅ `view_mr_consents` - Ver consentimientos generados desde HC
- ✅ `delete:medical-record-consents` - Eliminar consentimientos generados (no plantillas)

---

## 🔧 Solución Implementada

### Script Creado
`backend/fix-operador-permissions.js`

Este script:
1. Conecta a la base de datos
2. Busca el rol Operador
3. Actualiza los permisos con la lista correcta
4. Verifica que los permisos estén correctos

### Ejecución
```bash
cd backend
node fix-operador-permissions.js
```

### Resultado
```
✅ Conectado a la base de datos

📋 Rol: Operador (OPERADOR)
   ID: d763718a-693e-4152-8d8e-536b9c0684e5

🔧 Actualizando permisos del rol Operador...
✅ Permisos actualizados exitosamente

🔍 Verificación de Permisos de Plantillas HC:
   ✅ view_mr_consent_templates: SÍ (correcto)
   ✅ create_mr_consent_templates: SÍ (correcto)
   ✅ edit_mr_consent_templates: SÍ (correcto)
   ✅ delete_mr_consent_templates: NO (correcto)
   ✅ generate_mr_consents: SÍ (correcto)
   ✅ view_mr_consents: SÍ (correcto)
   ✅ delete:medical-record-consents: SÍ (correcto)

✅ Todos los permisos están correctos
```

---

## 📝 Permisos Completos del Rol Operador

### Permisos Generales (19)
1. `view_dashboard` - Ver dashboard
2. `view_consents` - Ver consentimientos
3. `create_consents` - Crear consentimientos
4. `edit_consents` - Editar consentimientos
5. `sign_consents` - Firmar consentimientos
6. `resend_consent_email` - Reenviar email de consentimientos
7. `view_branches` - Ver sedes
8. `view_services` - Ver servicios
9. `view_questions` - Ver preguntas
10. `view_clients` - Ver clientes
11. `create_clients` - Crear clientes
12. `edit_clients` - Editar clientes
13. `view_templates` - Ver plantillas
14. `view_medical_records` - Ver historias clínicas
15. `create_medical_records` - Crear historias clínicas
16. `close_medical_records` - Cerrar historias clínicas
17. `sign_medical_records` - Firmar historias clínicas
18. `export_medical_records` - Exportar historias clínicas
19. `view_invoices` - Ver facturas

### Permisos de Plantillas HC (6)
20. `view_mr_consent_templates` - Ver plantillas de consentimiento HC
21. `create_mr_consent_templates` - Crear plantillas de consentimiento HC
22. `edit_mr_consent_templates` - Editar plantillas de consentimiento HC
23. `generate_mr_consents` - Generar consentimientos desde HC
24. `view_mr_consents` - Ver consentimientos generados desde HC
25. `delete:medical-record-consents` - Eliminar consentimientos generados

**Total: 25 permisos**

---

## 🧪 Instrucciones de Prueba

### 1. Cerrar Sesión y Volver a Iniciar

**IMPORTANTE:** Los usuarios con rol Operador deben cerrar sesión y volver a iniciar para que los cambios surtan efecto.

```
1. Cerrar sesión en el frontend
2. Iniciar sesión con un usuario Operador
3. Navegar a "Roles y Permisos"
```

### 2. Verificar Permisos en la UI

```
1. Ir a "Roles y Permisos"
2. Expandir "Plantillas de Consentimiento HC"
3. Verificar que el rol Operador tiene:
   ✅ Ver plantillas de consentimiento HC
   ✅ Crear plantillas de consentimiento HC
   ✅ Editar plantillas de consentimiento HC
   ❌ Eliminar plantillas de consentimiento HC (NO debe estar activo)
   ✅ Generar consentimientos desde HC
   ✅ Ver consentimientos generados desde HC
```

### 3. Verificar Funcionalidad

```
1. Iniciar sesión como Operador
2. Ir a "Plantillas HC"
3. Verificar que:
   ✅ Puede ver las plantillas
   ✅ Puede crear nuevas plantillas
   ✅ Puede editar plantillas existentes
   ❌ NO puede eliminar plantillas (botón no visible)
4. Ir a "Historias Clínicas"
5. Abrir una HC con consentimientos
6. Verificar que:
   ✅ Puede generar consentimientos
   ✅ Puede ver consentimientos generados
   ✅ Puede eliminar consentimientos generados (no plantillas)
```

---

## 🔍 Diferencia entre Permisos

### `delete_mr_consent_templates` (Plantillas)
- **Qué hace:** Permite eliminar PLANTILLAS de consentimiento HC
- **Ubicación:** Página "Plantillas HC"
- **Quién debe tener:** Solo Administradores
- **Operador:** ❌ NO debe tener

### `delete:medical-record-consents` (Consentimientos Generados)
- **Qué hace:** Permite eliminar CONSENTIMIENTOS generados desde una HC
- **Ubicación:** Pestaña "Consentimientos" dentro de una HC
- **Quién debe tener:** Operadores y Administradores
- **Operador:** ✅ SÍ debe tener

---

## 📦 Archivos Creados

- `backend/fix-operador-permissions.js` - Script de corrección
- `backend/check-operador-mr-permissions.js` - Script de verificación
- `doc/73-correccion-permisos-operador-hc/README.md` - Documentación

---

## ✅ Checklist de Verificación

- [x] Script de corrección creado
- [x] Script ejecutado exitosamente
- [x] Permisos actualizados en base de datos
- [x] Verificación de permisos correcta
- [x] Documentación creada
- [ ] Usuario Operador cierra sesión y vuelve a iniciar
- [ ] Verificación en UI de permisos
- [ ] Prueba funcional de plantillas HC

---

## 📌 Notas Importantes

1. **Los usuarios deben cerrar sesión** para que los cambios de permisos surtan efecto
2. El permiso `delete_mr_consent_templates` solo debe estar en roles de Administrador
3. El permiso `delete:medical-record-consents` es diferente y permite eliminar consentimientos generados (no plantillas)
4. Los permisos se almacenan como texto separado por comas en la base de datos
5. El script limpia cualquier formato incorrecto de permisos

---

**Fecha:** 2026-01-26
**Versión:** 15.0.10
**Estado:** ✅ COMPLETADO
