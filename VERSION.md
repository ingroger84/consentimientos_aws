# Versión del Sistema

## Versión Actual: 33.0.1
**Fecha:** 2026-02-09
**Tipo de Cambio:** PATCH

---

## Formato de Versión

`MAJOR.MINOR.PATCH`

- **MAJOR**: Cambios incompatibles con versiones anteriores (breaking changes)
- **MINOR**: Nueva funcionalidad compatible con versiones anteriores
- **PATCH**: Correcciones de errores y mejoras compatibles

---

## Historial de Versiones

### 33.0.1 - 2026-02-09 [PATCH]
- Backend: 3 archivo(s) modificado(s)
- Frontend: 2 archivo(s) modificado(s)
- Documentación: 3 archivo(s) modificado(s)

### 33.0.0 - 2026-02-09 [MAJOR]
**Implementación Botones Vista Previa y Email en HC**
- Backend: 3 archivos modificados (service, controller, mail)
- Frontend: 2 archivos modificados (service, page)
- Documentación: 3 archivos creados
- Funcionalidad: Botones muestran/envían HC completa (no consentimientos)
- Permisos: PREVIEW_MEDICAL_RECORDS, SEND_EMAIL_MEDICAL_RECORDS
- Estado: ✅ DESPLEGADO EN PRODUCCIÓN

---

## Sistema de Versionamiento Automático

### Detección Inteligente de Cambios

El sistema detecta automáticamente el tipo de versión basándose en:

1. **MAJOR (X.0.0)**: 
   - Cambios en migraciones de base de datos
   - Modificaciones en autenticación
   - Cambios incompatibles en APIs
   - Mensaje de commit con "BREAKING CHANGE"

2. **MINOR (0.X.0)**:
   - Nuevas funcionalidades (feat:, feature:)
   - Adición de múltiples archivos nuevos
   - Mensaje de commit con "feat:" o "[MINOR]"

3. **PATCH (0.0.X)**:
   - Correcciones de bugs (fix:, bugfix:)
   - Optimizaciones
   - Mejoras menores
   - Por defecto si no se detecta otro tipo

### Uso

**Automático:** Se ejecuta en cada commit mediante Git Hook
**Manual:** `node scripts/utils/smart-version.js`

---

## Sincronización

La versión se sincroniza automáticamente en:
- ✓ frontend/package.json
- ✓ backend/package.json
- ✓ frontend/src/config/version.ts
- ✓ backend/src/config/version.ts
- ✓ VERSION.md (este archivo)
