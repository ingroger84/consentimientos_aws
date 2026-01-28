# Versionamiento Sincronizado

**Fecha:** 2026-01-27  
**Versión Actual:** 15.1.2  
**Estado:** ✅ SINCRONIZADO

---

## ✅ Verificación Completada

Todos los archivos de versión están sincronizados correctamente en **15.1.2**

---

## 📦 Archivos Verificados

```
✓ frontend/package.json                    15.1.2
✓ backend/package.json                     15.1.2
✓ frontend/src/config/version.ts           15.1.2
✓ backend/src/config/version.ts            15.1.2
✓ VERSION.md                               15.1.2
✓ README.md                                15.1.2
```

---

## 📝 Historial de Versiones Recientes

### 15.1.2 - 2026-01-27 (PATCH)
**Validaciones de Límites de Recursos Verificadas**
- ✅ Validación de HC en `medical-records.service.ts`
- ✅ Validación de Plantillas CN en `consent-templates.service.ts`
- ✅ Validación de Plantillas HC en `mr-consent-templates.service.ts`
- ✅ Mensajes de error claros
- ✅ Soporte para recursos ilimitados (-1)
- 📝 Documentación en `doc/92-validaciones-limites-recursos/`

### 15.1.1 - 2026-01-27 (PATCH)
**Actualización Página "Mi Plan" con Nuevos Recursos**
- ✅ Backend: Método `getUsage()` actualizado
- ✅ Backend: Método `generateUsageAlerts()` actualizado
- ✅ Frontend: Página "Mi Plan" con HC, Plantillas CN y HC
- ✅ Tarjetas visuales con barras de progreso
- ✅ Alertas automáticas al 80% y 100%
- 📝 Documentación en `doc/91-actualizacion-mi-plan/`

### 15.1.0 - 2026-01-27 (MINOR)
**Nueva Funcionalidad: Planes Mejorados con Límites de HC**
- ✅ Límites diferenciados para HC y CN
- ✅ Validaciones automáticas en backend
- ✅ Planes actualizados con nuevos límites
- ✅ Frontend mejorado en PricingSection
- 📝 Documentación en `doc/88-integracion-hc-planes/`

---

## 🔄 Sistema de Versionamiento

### Formato Semántico

```
MAJOR.MINOR.PATCH

15  .  1  .  2
│     │     │
│     │     └─ PATCH: Correcciones y mejoras
│     └─────── MINOR: Nueva funcionalidad compatible
└───────────── MAJOR: Cambios incompatibles
```

### Detección Automática

El sistema detecta automáticamente el tipo de versión:

**MAJOR (X.0.0):**
- Cambios en migraciones de base de datos
- Modificaciones en autenticación
- Cambios incompatibles en APIs
- Mensaje de commit con "BREAKING CHANGE"

**MINOR (0.X.0):**
- Nuevas funcionalidades (feat:, feature:)
- Adición de múltiples archivos nuevos
- Mensaje de commit con "feat:" o "[MINOR]"

**PATCH (0.0.X):**
- Correcciones de bugs (fix:, bugfix:)
- Optimizaciones
- Mejoras menores
- Por defecto si no se detecta otro tipo

---

## 🛠️ Scripts de Versionamiento

### Verificar Sincronización

```bash
node scripts/utils/verify-version-sync.js
```

**Salida:**
```
✓ Todas las versiones están sincronizadas: 15.1.2
```

### Incrementar Versión

```bash
# PATCH (15.1.2 → 15.1.3)
node scripts/utils/bump-version.js patch

# MINOR (15.1.2 → 15.2.0)
node scripts/utils/bump-version.js minor

# MAJOR (15.1.2 → 16.0.0)
node scripts/utils/bump-version.js major
```

### Versionamiento Inteligente

```bash
node scripts/utils/smart-version.js
```

Detecta automáticamente el tipo de cambio basándose en:
- Archivos modificados
- Mensajes de commit
- Tipo de cambios realizados

---

## 📋 Archivos Sincronizados

### Frontend

**package.json:**
```json
{
  "name": "consentimientos-frontend",
  "version": "15.1.2"
}
```

**src/config/version.ts:**
```typescript
export const APP_VERSION = {
  version: '15.1.2',
  date: '2026-01-27',
  fullVersion: '15.1.2 - 2026-01-27',
  buildDate: new Date('2026-01-27').toISOString(),
} as const;
```

### Backend

**package.json:**
```json
{
  "name": "consentimientos-backend",
  "version": "15.1.2"
}
```

**src/config/version.ts:**
```typescript
export const APP_VERSION = {
  version: '15.1.2',
  date: '2026-01-27',
  fullVersion: '15.1.2 - 2026-01-27',
  buildDate: new Date('2026-01-27').toISOString(),
} as const;
```

### Raíz del Proyecto

**VERSION.md:**
```markdown
## Versión Actual: 15.1.2
**Fecha:** 2026-01-27
**Tipo de Cambio:** PATCH
```

**README.md:**
```markdown
[![Version](https://img.shields.io/badge/version-15.1.2-blue.svg)](VERSION.md)

**Versión Actual:** 15.1.2 - 2026-01-27
```

---

## ✅ Checklist de Sincronización

Antes de cada commit o release, verificar:

- [ ] `frontend/package.json` tiene la versión correcta
- [ ] `backend/package.json` tiene la versión correcta
- [ ] `frontend/src/config/version.ts` tiene la versión correcta
- [ ] `backend/src/config/version.ts` tiene la versión correcta
- [ ] `VERSION.md` tiene la versión correcta y changelog actualizado
- [ ] `README.md` tiene la versión correcta en badge y texto
- [ ] Ejecutar `node scripts/utils/verify-version-sync.js` → ✓ Sincronizado

---

## 🔄 Flujo de Actualización de Versión

```
1. Realizar cambios en el código
         ↓
2. Determinar tipo de cambio (MAJOR/MINOR/PATCH)
         ↓
3. Ejecutar script de bump:
   node scripts/utils/bump-version.js [tipo]
         ↓
4. Script actualiza automáticamente:
   - frontend/package.json
   - backend/package.json
   - frontend/src/config/version.ts
   - backend/src/config/version.ts
   - VERSION.md
   - README.md
         ↓
5. Verificar sincronización:
   node scripts/utils/verify-version-sync.js
         ↓
6. Commit con mensaje descriptivo
         ↓
7. Git Hook ejecuta versionamiento automático (si está configurado)
```

---

## 📊 Estadísticas de Versiones

### Versiones Recientes

| Versión | Fecha | Tipo | Descripción |
|---------|-------|------|-------------|
| 15.1.2 | 2026-01-27 | PATCH | Validaciones de límites verificadas |
| 15.1.1 | 2026-01-27 | PATCH | Página "Mi Plan" actualizada |
| 15.1.0 | 2026-01-27 | MINOR | Planes mejorados con límites HC |
| 15.0.14 | 2026-01-27 | PATCH | Logos HC en PDFs corregidos |
| 15.0.13 | 2026-01-27 | PATCH | StorageService para logos |

### Distribución de Cambios

```
MAJOR:  1 cambio  (6.7%)
MINOR:  3 cambios (20.0%)
PATCH: 11 cambios (73.3%)
```

---

## 🎯 Buenas Prácticas

### 1. Siempre Verificar Antes de Commit

```bash
node scripts/utils/verify-version-sync.js
```

### 2. Usar Mensajes de Commit Descriptivos

```bash
# PATCH
git commit -m "fix: corregir validación de límites"

# MINOR
git commit -m "feat: agregar página Mi Plan"

# MAJOR
git commit -m "BREAKING CHANGE: cambiar estructura de API"
```

### 3. Actualizar VERSION.md con Detalles

Cada cambio de versión debe incluir:
- Tipo de cambio (MAJOR/MINOR/PATCH)
- Descripción clara de los cambios
- Archivos modificados
- Documentación relacionada
- Notas de migración (si aplica)

### 4. Mantener Changelog Actualizado

VERSION.md debe tener:
- Fecha del cambio
- Lista de cambios con checkmarks (✅)
- Referencias a documentación
- Advertencias importantes (⚠️)

---

## 🚀 Próximos Pasos

### Para Desarrollo
1. Continuar usando versionamiento semántico
2. Mantener sincronización en cada cambio
3. Documentar cambios en VERSION.md

### Para Producción
1. Verificar sincronización antes de deploy
2. Crear tags de Git para cada versión
3. Mantener changelog público actualizado

---

## 📞 Soporte

Si encuentras problemas con el versionamiento:

1. Ejecutar verificación: `node scripts/utils/verify-version-sync.js`
2. Si hay desincronización, ejecutar: `node scripts/utils/bump-version.js patch`
3. Verificar nuevamente
4. Si persiste el problema, revisar manualmente cada archivo

---

**Estado Final:** ✅ Todas las versiones sincronizadas en 15.1.2
