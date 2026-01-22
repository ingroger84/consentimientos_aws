# Versión del Sistema

## Versión Actual: 1.1.37
**Fecha:** 2026-01-21

---

## Formato de Versión

`MAJOR.MINOR.PATCH - YYYYMMDD`

- **MAJOR**: Cambios incompatibles con versiones anteriores
- **MINOR**: Nueva funcionalidad compatible con versiones anteriores
- **PATCH**: Correcciones de errores compatibles con versiones anteriores
- **YYYYMMDD**: Fecha de la actualización

---

## Historial de Versiones

### 1.1.37 - 2026-01-21
- Actualización automática del sistema
- Mejoras y correcciones

### 1.1.1 - 2026-01-20
- Sistema de impuestos mejorado
- Facturas exentas de impuestos
- Selección flexible de impuestos
- UI mejorada en configuración de impuestos
- Migración de base de datos completada

### 1.1.0 - 2026-01-20
- Implementación de versionamiento
- Versión visible en login y sidebar
- Corrección de nombres de planes
- Dashboard con estadísticas reales

---

## Actualización Automática

La versión se actualiza automáticamente con cada commit a GitHub mediante Git Hooks.

**Script:** `update-version-auto.js`
**Hook:** `.husky/pre-commit`

---

## Actualización Manual

Si necesitas actualizar la versión manualmente:

```powershell
.\update-version.ps1
```

O especificando la versión:

```powershell
.\update-version.ps1 -Version "2.0.0"
```
