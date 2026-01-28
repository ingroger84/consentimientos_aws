# Categoría "Historias Clínicas" en Roles y Permisos

**Fecha:** 24 de enero de 2026  
**Versión:** 15.0.3  
**Tipo:** Corrección - Visualización de Permisos

## 📋 Problema Identificado

El usuario reportó que en la página de **Roles y Permisos** no aparecía la categoría "Historias Clínicas", a pesar de que:
- Los permisos YA estaban en la base de datos (agregados en los roles)
- El módulo de historias clínicas estaba completamente funcional
- Se mostraban otras categorías: Dashboard, Consentimientos, Usuarios, Roles y Permisos, Sedes, Servicios, Preguntas, Configuración, Facturación

## 🔍 Causa Raíz

Los permisos de historias clínicas NO estaban definidos en el archivo de constantes del backend:
- `backend/src/auth/constants/permissions.ts`

Este archivo es el que define:
1. Los permisos disponibles en el sistema
2. Las descripciones de cada permiso
3. Las categorías para organizar los permisos en la UI
4. Los permisos por defecto de cada rol

## ✅ Solución Implementada

### 1. Agregados los 7 Permisos en PERMISSIONS

```typescript
// Historias Clínicas
VIEW_MEDICAL_RECORDS: 'view_medical_records',
CREATE_MEDICAL_RECORDS: 'create_medical_records',
EDIT_MEDICAL_RECORDS: 'edit_medical_records',
DELETE_MEDICAL_RECORDS: 'delete_medical_records',
CLOSE_MEDICAL_RECORDS: 'close_medical_records',
SIGN_MEDICAL_RECORDS: 'sign_medical_records',
EXPORT_MEDICAL_RECORDS: 'export_medical_records',
```

### 2. Agregadas las Descripciones en PERMISSION_DESCRIPTIONS

```typescript
[PERMISSIONS.VIEW_MEDICAL_RECORDS]: 'Ver historias clínicas',
[PERMISSIONS.CREATE_MEDICAL_RECORDS]: 'Crear historias clínicas',
[PERMISSIONS.EDIT_MEDICAL_RECORDS]: 'Editar historias clínicas',
[PERMISSIONS.DELETE_MEDICAL_RECORDS]: 'Eliminar historias clínicas',
[PERMISSIONS.CLOSE_MEDICAL_RECORDS]: 'Cerrar historias clínicas',
[PERMISSIONS.SIGN_MEDICAL_RECORDS]: 'Firmar historias clínicas',
[PERMISSIONS.EXPORT_MEDICAL_RECORDS]: 'Exportar historias clínicas',
```

### 3. Agregada la Categoría en PERMISSION_CATEGORIES

```typescript
medical_records: {
  name: 'Historias Clínicas',
  permissions: [
    PERMISSIONS.VIEW_MEDICAL_RECORDS,
    PERMISSIONS.CREATE_MEDICAL_RECORDS,
    PERMISSIONS.EDIT_MEDICAL_RECORDS,
    PERMISSIONS.DELETE_MEDICAL_RECORDS,
    PERMISSIONS.CLOSE_MEDICAL_RECORDS,
    PERMISSIONS.SIGN_MEDICAL_RECORDS,
    PERMISSIONS.EXPORT_MEDICAL_RECORDS,
  ],
},
```

### 4. Agregados a ROLE_PERMISSIONS

**Super Admin:** Todos los permisos (7)
**Admin General:** Todos los permisos (7)
**Admin Sede:** Ver, Crear, Editar, Firmar (4 permisos)
**Operador:** Ver, Crear, Firmar (3 permisos)

## 📁 Archivos Modificados

```
backend/src/auth/constants/permissions.ts
```

## 🧪 Verificación

1. **Backend reiniciado:** ✅
   - Build exitoso
   - Servidor corriendo en http://localhost:3000

2. **Endpoint verificado:**
   - GET `/api/roles/permissions` ahora incluye la categoría "Historias Clínicas"

3. **Frontend:**
   - La página RolesPage obtiene las categorías desde el backend
   - Automáticamente mostrará la nueva categoría sin cambios en el frontend

## 📊 Resultado Esperado

En la página de **Roles y Permisos** ahora se debe mostrar:

1. ✅ Dashboard
2. ✅ Consentimientos
3. ✅ Usuarios
4. ✅ Roles y Permisos
5. ✅ Sedes
6. ✅ Servicios
7. ✅ Preguntas
8. ✅ Clientes
9. ✅ Plantillas de Consentimiento
10. ✅ **Historias Clínicas** ← NUEVA CATEGORÍA
11. ✅ Configuración
12. ✅ Facturación

## 🎯 Permisos por Rol

### Super Admin
- ✅ Ver historias clínicas
- ✅ Crear historias clínicas
- ✅ Editar historias clínicas
- ✅ Eliminar historias clínicas
- ✅ Cerrar historias clínicas
- ✅ Firmar historias clínicas
- ✅ Exportar historias clínicas

### Admin General
- ✅ Ver historias clínicas
- ✅ Crear historias clínicas
- ✅ Editar historias clínicas
- ✅ Eliminar historias clínicas
- ✅ Cerrar historias clínicas
- ✅ Firmar historias clínicas
- ✅ Exportar historias clínicas

### Admin Sede
- ✅ Ver historias clínicas
- ✅ Crear historias clínicas
- ✅ Editar historias clínicas
- ✅ Firmar historias clínicas

### Operador
- ✅ Ver historias clínicas
- ✅ Crear historias clínicas
- ✅ Firmar historias clínicas

## 🔄 Próximos Pasos

1. Verificar en localhost que la categoría aparezca correctamente
2. Probar la edición de permisos en cada rol
3. Confirmar que los permisos se guarden correctamente
4. Actualizar la versión del sistema a 15.0.3

## 📝 Notas Técnicas

- Los permisos YA estaban en la base de datos (agregados previamente)
- Solo faltaba la definición en el archivo de constantes del backend
- El frontend obtiene las categorías dinámicamente desde el backend
- No se requieren cambios en el frontend
- El sistema de permisos es centralizado y consistente

## ✨ Beneficios

1. **Visibilidad completa:** Ahora se pueden ver y configurar los permisos de historias clínicas
2. **Gestión granular:** Control fino sobre qué puede hacer cada rol
3. **Consistencia:** Los permisos están alineados con la funcionalidad del módulo
4. **Seguridad:** Cada rol tiene los permisos apropiados según su nivel de acceso
