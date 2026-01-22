# Sistema Inteligente de Versionamiento Automático

## 🎯 Descripción

Sistema avanzado de versionamiento que detecta automáticamente el tipo de cambio y actualiza la versión apropiadamente siguiendo Semantic Versioning y mejores prácticas de SaaS.

## ✨ Características

### 1. Detección Automática Inteligente

El sistema analiza:
- **Archivos modificados**: Detecta cambios en archivos críticos
- **Mensajes de commit**: Interpreta convenciones de commit
- **Tipo de cambios**: Diferencia entre features, fixes y breaking changes

### 2. Tipos de Versión

#### MAJOR (X.0.0) - Breaking Changes
Se incrementa automáticamente cuando:
- ✓ Cambios en migraciones de base de datos
- ✓ Modificaciones en sistema de autenticación
- ✓ Cambios en estructura de datos crítica
- ✓ Mensaje contiene: `BREAKING CHANGE`, `[MAJOR]`, `incompatible`

**Ejemplo:**
```bash
git commit -m "feat: nueva autenticación [MAJOR]"
# Versión: 1.5.3 → 2.0.0
```

#### MINOR (0.X.0) - Nuevas Funcionalidades
Se incrementa automáticamente cuando:
- ✓ Nuevas features agregadas
- ✓ Múltiples archivos nuevos (>3)
- ✓ Mensaje contiene: `feat:`, `feature:`, `[MINOR]`, `nueva funcionalidad`

**Ejemplo:**
```bash
git commit -m "feat: sistema de notificaciones push"
# Versión: 1.5.3 → 1.6.0
```

#### PATCH (0.0.X) - Correcciones y Mejoras
Se incrementa automáticamente cuando:
- ✓ Correcciones de bugs
- ✓ Optimizaciones
- ✓ Mejoras menores
- ✓ Mensaje contiene: `fix:`, `bugfix:`, `hotfix:`, `corrección`
- ✓ Por defecto si no se detecta otro tipo

**Ejemplo:**
```bash
git commit -m "fix: error en cálculo de impuestos"
# Versión: 1.5.3 → 1.5.4
```

## 🚀 Uso

### Automático (Recomendado)

El sistema se ejecuta automáticamente en cada commit:

```bash
git add .
git commit -m "feat: nueva funcionalidad de reportes"
# ✓ Versión actualizada automáticamente a 1.6.0
```

### Manual

#### Ver versión actual
```powershell
# PowerShell
.\scripts\utils\version.ps1 show

# Node.js
node scripts/utils/show-version.js
```

#### Incrementar versión manualmente
```powershell
# PowerShell
.\scripts\utils\version.ps1 patch   # 1.5.3 → 1.5.4
.\scripts\utils\version.ps1 minor   # 1.5.3 → 1.6.0
.\scripts\utils\version.ps1 major   # 1.5.3 → 2.0.0

# Node.js
node scripts/utils/bump-version.js patch
node scripts/utils/bump-version.js minor
node scripts/utils/bump-version.js major
```

## 📁 Archivos Sincronizados

El sistema actualiza automáticamente:

```
✓ frontend/src/config/version.ts
✓ backend/src/config/version.ts
✓ frontend/package.json
✓ backend/package.json
✓ VERSION.md
```

## 🎨 Convenciones de Commit

Para aprovechar la detección automática, usa estas convenciones:

### Breaking Changes (MAJOR)
```bash
git commit -m "feat: nueva API incompatible [MAJOR]"
git commit -m "BREAKING CHANGE: cambio en estructura de datos"
git commit -m "refactor: migración de base de datos incompatible"
```

### Features (MINOR)
```bash
git commit -m "feat: sistema de notificaciones"
git commit -m "feature: exportación de reportes PDF"
git commit -m "add: nueva funcionalidad de búsqueda"
```

### Fixes (PATCH)
```bash
git commit -m "fix: error en cálculo de totales"
git commit -m "bugfix: corrección en validación de formularios"
git commit -m "hotfix: problema crítico en producción"
git commit -m "optimización: mejora de rendimiento en queries"
```

### Otros
```bash
git commit -m "docs: actualización de documentación"
git commit -m "chore: actualización de dependencias"
git commit -m "style: formato de código"
git commit -m "test: agregar pruebas unitarias"
```

## 📊 Ejemplo de Flujo

```bash
# 1. Ver versión actual
.\scripts\utils\version.ps1 show
# Versión: 1.5.3

# 2. Hacer cambios
# ... editar archivos ...

# 3. Commit con convención
git add .
git commit -m "feat: sistema de reportes avanzados"

# 4. Sistema detecta automáticamente
# 📦 Versión actual:  1.5.3
# 📦 Nueva versión:   1.6.0
# 🏷️  Tipo de cambio: MINOR
# ✓ Versión actualizada

# 5. Push a GitHub
git push origin main
```

## 🔧 Configuración

### Personalizar Detección

Edita `scripts/utils/smart-version.js`:

```javascript
const CHANGE_PATTERNS = {
  MAJOR: [
    /breaking\s+change/i,
    /incompatible/i,
    // Agregar más patrones...
  ],
  MINOR: [
    /feat:/i,
    /feature:/i,
    // Agregar más patrones...
  ],
  PATCH: [
    /fix:/i,
    /bugfix:/i,
    // Agregar más patrones...
  ],
};
```

### Archivos Críticos

Define qué archivos indican cambios MAJOR:

```javascript
const CRITICAL_FILES = [
  'backend/src/database/migrations/',
  'backend/src/auth/',
  'frontend/src/store/',
  // Agregar más rutas...
];
```

## 📝 Historial de Versiones

El sistema mantiene un historial detallado en `VERSION.md`:

```markdown
### 1.6.0 - 2026-01-22 [MINOR]
- Sistema de reportes avanzados
- Exportación a PDF y Excel
- Filtros personalizables
- Frontend: 5 archivo(s) modificado(s)
- Backend: 3 archivo(s) modificado(s)
```

## 🎯 Ventajas

1. **Automático**: No necesitas recordar actualizar versiones
2. **Inteligente**: Detecta el tipo de cambio apropiado
3. **Consistente**: Todas las versiones sincronizadas
4. **Trazable**: Historial detallado de cambios
5. **Estándar**: Sigue Semantic Versioning
6. **Visible**: Versión mostrada en UI automáticamente

## 🐛 Solución de Problemas

### La versión no se actualiza

```powershell
# Verificar que el hook está instalado
cat .husky/pre-commit

# Reinstalar hooks
npm install
```

### Versión incorrecta detectada

```powershell
# Actualizar manualmente
.\scripts\utils\version.ps1 minor

# O especificar en el commit
git commit -m "feat: nueva feature [MINOR]"
```

### Conflictos en VERSION.md

```powershell
# Resolver conflicto y regenerar
node scripts/utils/bump-version.js patch
```

## 📚 Referencias

- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Hooks](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks)

## 🔄 Migración desde Sistema Anterior

Si vienes del sistema anterior (`update-version-auto.js`):

1. ✓ El nuevo sistema es compatible
2. ✓ Mantiene el historial existente
3. ✓ Usa los mismos archivos
4. ✓ Agrega detección inteligente

No se requiere migración manual.

## 📞 Soporte

Para problemas o sugerencias:
1. Revisar logs del hook: `.husky/pre-commit`
2. Ejecutar manualmente: `node scripts/utils/smart-version.js`
3. Verificar archivos de versión
