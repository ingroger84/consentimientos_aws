# 🚀 Cómo Usar el Sistema de Versionamiento

## ✅ Estado Actual

**Versión:** 1.2.0  
**Fecha:** 2026-01-22  
**Estado:** ✅ Todas las versiones sincronizadas

---

## 🎯 Uso Diario (Automático)

**No necesitas hacer nada especial.** El sistema funciona automáticamente:

```bash
# 1. Trabaja normalmente
git add .

# 2. Haz commit con estas convenciones:
git commit -m "feat: nueva funcionalidad"      # → Versión MINOR (1.2.0 → 1.3.0)
git commit -m "fix: corrección de bug"         # → Versión PATCH (1.2.0 → 1.2.1)
git commit -m "BREAKING CHANGE: cambio mayor"  # → Versión MAJOR (1.2.0 → 2.0.0)

# 3. El sistema actualiza automáticamente la versión
# 4. Push normalmente
git push origin main
```

---

## 📝 Convenciones de Commit

### Para Features (Nueva Funcionalidad)
```bash
git commit -m "feat: sistema de reportes"
git commit -m "feature: exportación PDF"
# Resultado: 1.2.0 → 1.3.0 (MINOR)
```

### Para Fixes (Correcciones)
```bash
git commit -m "fix: error en cálculo"
git commit -m "bugfix: validación incorrecta"
git commit -m "hotfix: problema crítico"
# Resultado: 1.2.0 → 1.2.1 (PATCH)
```

### Para Breaking Changes (Cambios Incompatibles)
```bash
git commit -m "BREAKING CHANGE: nueva API"
git commit -m "feat: migración de BD [MAJOR]"
# Resultado: 1.2.0 → 2.0.0 (MAJOR)
```

---

## 🔧 Comandos Útiles

### Ver Versión Actual
```bash
node scripts/utils/show-version.js
```

### Incrementar Versión Manualmente
```bash
node scripts/utils/bump-version.js patch   # 1.2.0 → 1.2.1
node scripts/utils/bump-version.js minor   # 1.2.0 → 1.3.0
node scripts/utils/bump-version.js major   # 1.2.0 → 2.0.0
```

### Verificar Sincronización
```bash
node scripts/utils/verify-version-sync.js
```

---

## 📚 Documentación Completa

- **Guía Rápida**: `doc/15-versionamiento/GUIA_RAPIDA.md`
- **Sistema Completo**: `doc/15-versionamiento/SISTEMA_INTELIGENTE.md`
- **Resumen**: `doc/15-versionamiento/RESUMEN_SISTEMA_INTELIGENTE.md`
- **Implementación**: `SISTEMA_VERSIONAMIENTO_INTELIGENTE_20260122.md`

---

## ✨ Características

✅ **Automático**: Se ejecuta en cada commit  
✅ **Inteligente**: Detecta el tipo de cambio  
✅ **Sincronizado**: Actualiza 6 archivos automáticamente  
✅ **Historial**: Mantiene registro detallado  
✅ **Estándar**: Sigue Semantic Versioning  

---

## 🆘 Problemas

### La versión no se actualiza
```bash
npm install  # Reinstalar hooks
node scripts/utils/bump-version.js patch  # Actualizar manualmente
```

### Versiones desincronizadas
```bash
node scripts/utils/verify-version-sync.js  # Ver estado
node scripts/utils/bump-version.js patch   # Sincronizar
```

---

**¡Listo! El sistema funciona automáticamente. Solo haz commits normales con las convenciones y todo se actualiza solo.**
