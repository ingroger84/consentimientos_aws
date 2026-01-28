# Corrección de Permisos para Logos HC

**Fecha:** 2026-01-26  
**Versión:** 15.0.11  
**Estado:** ✅ COMPLETADO

## Problema

El usuario Administrador General no podía acceder a la sección "Configuración → Logos HC" debido a falta de permisos. Al intentar acceder, recibía el mensaje:

```
No tienes permisos para realizar esta acción. Se requiere: uno de: edit_settings
```

## Causa Raíz

El rol `ADMIN_GENERAL` no tenía el permiso `edit_settings` asignado en la base de datos.

## Solución Implementada

### 1. Script de Corrección

Se creó y ejecutó el script `backend/fix-admin-settings-permission.js` que:

- Busca el rol `ADMIN_GENERAL` en la base de datos
- Verifica si tiene el permiso `edit_settings`
- Agrega el permiso si no existe
- Muestra el estado final de los permisos

### 2. Correcciones Realizadas

**Problema inicial:** El script intentaba buscar roles por `tenantId`, pero la tabla `roles` NO tiene esa columna (los roles son globales).

**Solución:** Se corrigió la query SQL para buscar roles sin filtrar por tenant:

```javascript
// ❌ INCORRECTO (roles no tienen tenantId)
WHERE "tenantId" = $1 AND type = 'ADMIN_GENERAL'

// ✅ CORRECTO (roles son globales)
WHERE type = 'ADMIN_GENERAL'
```

### 3. Resultado

```
✓ Permiso agregado exitosamente

=== PERMISOS FINALES ===
Total de permisos: 1
Tiene edit_settings: ✓
```

## Instrucciones para el Usuario

1. **Cerrar sesión** en el navegador
2. **Volver a iniciar sesión** como Administrador General
3. Ir a **Configuración → Logos HC**
4. Ahora podrás subir y configurar los logos

## Archivos Modificados

- `backend/fix-admin-settings-permission.js` - Script de corrección creado y ejecutado

## Notas Importantes

### Sobre los Logos en PDF

Los logos YA están configurados en la base de datos:
- ✅ `hcLogoUrl` - Logo principal (header)
- ✅ `hcWatermarkLogoUrl` - Marca de agua
- ✗ `hcFooterLogoUrl` - No configurado

### PDFs Antiguos vs Nuevos

⚠️ **IMPORTANTE:** Los PDFs ya generados NO se actualizan automáticamente.

Para ver los logos en un PDF:
1. Genera un **NUEVO** consentimiento de HC
2. Los logos configurados aparecerán en el nuevo PDF
3. Los PDFs antiguos permanecen sin cambios

## Verificación

Para verificar que los logos están configurados:

```bash
cd backend
node check-hc-logos-config.js
```

## Contexto Adicional

Este problema surgió después de implementar la funcionalidad de logos separados para Consentimientos Normales (CN) y Historias Clínicas (HC) en la versión 15.0.9.

## Referencias

- Documentación de Logos Separados: `doc/66-logos-separados-cn-hc/`
- Script de verificación: `backend/check-hc-logos-config.js`
- Servicio de PDF: `backend/src/medical-records/medical-records-pdf.service.ts`
