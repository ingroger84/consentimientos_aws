# Guía Rápida - Sistema de Versionamiento

## 🚀 Comandos Esenciales

### Ver Versión Actual
```bash
node scripts/utils/show-version.js
```

### Incrementar Versión
```bash
# PATCH (correcciones): 1.2.0 → 1.2.1
node scripts/utils/bump-version.js patch

# MINOR (features): 1.2.0 → 1.3.0
node scripts/utils/bump-version.js minor

# MAJOR (breaking): 1.2.0 → 2.0.0
node scripts/utils/bump-version.js major
```

### Verificar Sincronización
```bash
node scripts/utils/verify-version-sync.js
```

## 🎯 Uso Automático

El sistema se ejecuta automáticamente en cada commit:

```bash
# 1. Hacer cambios
git add .

# 2. Commit con convención
git commit -m "feat: nueva funcionalidad"
# ✓ Versión actualizada automáticamente

# 3. Push
git push origin main
```

## 📝 Convenciones de Commit

### Features (MINOR)
```bash
git commit -m "feat: sistema de reportes"
git commit -m "feature: exportación PDF"
```

### Fixes (PATCH)
```bash
git commit -m "fix: error en cálculo"
git commit -m "bugfix: validación de formulario"
```

### Breaking Changes (MAJOR)
```bash
git commit -m "BREAKING CHANGE: nueva API"
git commit -m "feat: migración de BD [MAJOR]"
```

## ✅ Verificación Rápida

```bash
# Ver versión
node scripts/utils/show-version.js

# Verificar sincronización
node scripts/utils/verify-version-sync.js

# Resultado esperado:
# ✓ Todas las versiones están sincronizadas: 1.2.0
```

## 📚 Documentación Completa

- [Sistema Inteligente](SISTEMA_INTELIGENTE.md) - Documentación detallada
- [Resumen](RESUMEN_SISTEMA_INTELIGENTE.md) - Resumen ejecutivo
- [README](README.md) - Índice completo

## 🆘 Problemas Comunes

### Versión no se actualiza
```bash
# Reinstalar hooks
npm install

# Actualizar manualmente
node scripts/utils/bump-version.js patch
```

### Versiones desincronizadas
```bash
# Sincronizar
node scripts/utils/bump-version.js patch
```

---

**Versión Actual:** 1.2.0  
**Última Actualización:** 2026-01-22
