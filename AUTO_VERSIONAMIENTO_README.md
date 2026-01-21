# 🚀 Sistema de Auto-Versionamiento

## ✅ Estado: CONFIGURADO Y FUNCIONANDO

---

## 📋 Resumen

El sistema incrementa automáticamente la versión cada vez que haces un commit a GitHub.

---

## 🎯 Uso Rápido

```bash
# 1. Hacer cambios en el código
# 2. Agregar archivos
git add .

# 3. Hacer commit (versión se actualiza automáticamente)
git commit -m "Tu mensaje de commit"

# 4. Subir a GitHub
git push origin main
```

**Resultado:** La versión se incrementa de `1.1.1` a `1.1.2` automáticamente.

---

## 📍 Dónde se Muestra la Versión

1. **Login Page** - Abajo de la página
2. **Sidebar** - Debajo del nombre del usuario
3. **API** - `GET /api/auth/version`

---

## 📁 Archivos que se Actualizan Automáticamente

- `frontend/src/config/version.ts`
- `backend/src/config/version.ts`
- `frontend/package.json`
- `backend/package.json`
- `VERSION.md`

---

## 🔧 Componentes Instalados

- ✅ **Husky** - Gestor de Git Hooks
- ✅ **Hook pre-commit** - Se ejecuta antes de cada commit
- ✅ **Script update-version-auto.js** - Incrementa la versión

---

## 📖 Documentación Completa

Ver: `doc/15-versionamiento/AUTO_VERSIONAMIENTO.md`

---

## 🛠️ Reinstalar (si es necesario)

```powershell
.\setup-auto-version-simple.ps1
```

---

## ⚙️ Configuración Manual de Versión

Si necesitas cambiar a una versión específica (ej: 2.0.0):

```powershell
.\update-version.ps1 -Version "2.0.0"
```

---

## 🐛 Solución de Problemas

### Hook no se ejecuta

```powershell
npx husky install
```

### Deshabilitar temporalmente

```bash
git commit -m "mensaje" --no-verify
```

---

## 📊 Formato de Versión

```
MAJOR.MINOR.PATCH - YYYYMMDD
```

- **MAJOR**: Cambios incompatibles (manual)
- **MINOR**: Nueva funcionalidad (manual)
- **PATCH**: Correcciones (automático)
- **YYYYMMDD**: Fecha actual (automático)

---

## ✨ Beneficios

- ✅ No necesitas recordar actualizar la versión
- ✅ Consistencia en todas las versiones
- ✅ Trazabilidad de cambios
- ✅ Frontend y backend siempre sincronizados

---

**Fecha de Implementación:** 2026-01-20  
**Versión Inicial:** 1.1.1
