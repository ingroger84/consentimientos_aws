# Versión del Sistema

## Versión Actual: 25.0.0
**Fecha:** 2026-02-06
**Tipo de Cambio:** MAJOR

---

## Formato de Versión

`MAJOR.MINOR.PATCH`

- **MAJOR**: Cambios incompatibles con versiones anteriores (breaking changes)
- **MINOR**: Nueva funcionalidad compatible con versiones anteriores
- **PATCH**: Correcciones de errores y mejoras compatibles

---

## Historial de Versiones

### 25.0.0 - 2026-02-06 [MAJOR]
- Backend: 26 archivo(s) modificado(s)
- Documentación: 6 archivo(s) modificado(s)

### v25.0.0 (2026-02-06) - CUMPLIMIENTO NORMATIVO HC 100%

**Tipo:** MAJOR Release

**Resumen:** Implementación completa de todas las funcionalidades necesarias para cumplir 100% con la normativa colombiana de historias clínicas.

**Nuevas Funcionalidades:**
- ✅ Órdenes médicas (laboratorio, imágenes, procedimientos)
- ✅ Prescripciones/Fórmulas médicas estructuradas
- ✅ Procedimientos programados y realizados
- ✅ Planes de tratamiento estructurados
- ✅ Epicrisis (resumen al egreso)
- ✅ Gestión documental completa con S3
- ✅ Foto de paciente para validación de identidad
- ✅ Tipo de admisión "telemedicina"

**Correcciones Críticas:**
- ✅ Validación de HC única por paciente (normativa colombiana)

**Base de Datos:**
- 6 nuevas tablas
- 24 nuevos índices
- 2 campos nuevos en tabla clients

**API:**
- 61 nuevos endpoints

**Permisos:**
- 20 nuevos permisos

**Cumplimiento Normativo:** 77% → 100% ✅

**Documentación:**
- `doc/ANALISIS_FLUJO_HC_VS_NORMATIVA_COLOMBIANA.md`
- `IMPLEMENTACION_CUMPLIMIENTO_NORMATIVO_COMPLETADA.md`
- `DESPLIEGUE_VERSION_24.0.0_INSTRUCCIONES.md`

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
