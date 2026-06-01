# Versión del Sistema

## Versión Actual: 94.0.0
**Fecha:** 2026-06-01
**Tipo de Cambio:** MAJOR

---

## Formato de Versión

`MAJOR.MINOR.PATCH`

- **MAJOR**: Cambios incompatibles con versiones anteriores (breaking changes)
- **MINOR**: Nueva funcionalidad compatible con versiones anteriores
- **PATCH**: Correcciones de errores y mejoras compatibles

---

## Historial de Versiones

### 94.0.0 - 2026-06-01 [MAJOR]
- Backend: 5 archivo(s) modificado(s)
- Frontend: 4 archivo(s) modificado(s)
- Documentación: 5 archivo(s) modificado(s)

### 93.2.4 - 2026-06-01 [PATCH]
- **CRÍTICO:** Corrección completa de fotos de clientes
- Backend: Fotos ahora se guardan para clientes NUEVOS y EXISTENTES
- Frontend: Despliegue completo con versión sincronizada
- Agregados campos photoUrl y photoCapturedAt al DTO de clientes
- Limpieza de caché de Nginx y verificación post-despliegue

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
