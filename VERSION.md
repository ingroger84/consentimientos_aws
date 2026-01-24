# Versión del Sistema

## Versión Actual: 15.0.0
**Fecha:** 2026-01-24
**Tipo de Cambio:** MAJOR

---

## Formato de Versión

`MAJOR.MINOR.PATCH`

- **MAJOR**: Cambios incompatibles con versiones anteriores (breaking changes)
- **MINOR**: Nueva funcionalidad compatible con versiones anteriores
- **PATCH**: Correcciones de errores y mejoras compatibles

---

## Historial de Versiones

### 15.0.0 - 2026-01-24 [MAJOR]
- Backend: 2 archivo(s) modificado(s)
- Frontend: 2 archivo(s) modificado(s)
- Documentación: 2 archivo(s) modificado(s)

### 14.1.0 - 2026-01-24 [MINOR]
- Mejoras y correcciones generales

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
