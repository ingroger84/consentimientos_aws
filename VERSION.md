# Versión del Sistema

## Versión Actual: 11.1.2
**Fecha:** 2026-01-23
**Tipo de Cambio:** PATCH

---

## Formato de Versión

`MAJOR.MINOR.PATCH`

- **MAJOR**: Cambios incompatibles con versiones anteriores (breaking changes)
- **MINOR**: Nueva funcionalidad compatible con versiones anteriores
- **PATCH**: Correcciones de errores y mejoras compatibles

---

## Historial de Versiones

### 11.1.2 - 2026-01-23 [PATCH]
- Documentación: 1 archivo(s) modificado(s)

### 11.1.1 - 2026-01-23 [PATCH]
- Documentación: 1 archivo(s) modificado(s)

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
