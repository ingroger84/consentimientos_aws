# Sistema de Auto-Versionamiento

## 📅 Fecha: 2026-01-20
## 🔖 Versión: 1.1.1

---

## 🎯 Objetivo

Implementar un sistema automático que incremente la versión del sistema cada vez que se realiza un commit a GitHub.

---

## 🚀 Funcionamiento

### Flujo Automático

```
1. Desarrollador hace cambios
   ↓
2. git add .
   ↓
3. git commit -m "mensaje"
   ↓
4. Hook pre-commit se ejecuta
   ↓
5. Script update-version-auto.js se ejecuta
   ↓
6. Versión se incrementa automáticamente
   ↓
7. Archivos de versión se agregan al commit
   ↓
8. Commit se completa con nueva versión
   ↓
9. git push origin main
```

### Incremento de Versión

- **PATCH** se incrementa automáticamente (+1)
- **Fecha** se actualiza al día actual
- **Ejemplo:** `1.1.1` → `1.1.2`

---

## 📦 Componentes del Sistema

### 1. Script de Auto-Actualización

**Archivo:** `update-version-auto.js`

**Funciones:**
- Lee la versión actual
- Incrementa el número PATCH
- Obtiene la fecha actual
- Actualiza todos los archivos de versión
- Genera reporte de cambios

**Archivos que actualiza:**
- `frontend/src/config/version.ts`
- `backend/src/config/version.ts`
- `frontend/package.json`
- `backend/package.json`
- `VERSION.md`

### 2. Git Hook Pre-Commit

**Archivo:** `.husky/pre-commit`

**Acciones:**
- Se ejecuta automáticamente antes de cada commit
- Llama al script `update-version-auto.js`
- Agrega archivos de versión al commit
- Muestra mensaje de confirmación

### 3. Script de Configuración

**Archivo:** `setup-auto-version.ps1`

**Funciones:**
- Instala Husky (gestor de Git Hooks)
- Inicializa Husky en el proyecto
- Configura el hook pre-commit
- Verifica la instalación

---

## 🛠️ Instalación

### Paso 1: Ejecutar Script de Configuración

```powershell
.\setup-auto-version.ps1
```

Este script:
- ✅ Verifica Node.js
- ✅ Instala Husky
- ✅ Inicializa Husky
- ✅ Configura hook pre-commit
- ✅ Verifica archivos

### Paso 2: Verificar Instalación

```powershell
# Verificar que Husky está instalado
npm list husky

# Verificar que el hook existe
Test-Path .husky/pre-commit
```

---

## 📝 Uso

### Uso Automático (Recomendado)

Simplemente haz commits normalmente:

```bash
# 1. Hacer cambios en el código
# 2. Agregar archivos
git add .

# 3. Hacer commit (la versión se actualiza automáticamente)
git commit -m "Implementar nueva funcionalidad"

# 4. Subir a GitHub
git push origin main
```

**Resultado:**
```
Actualizando versión del sistema...
========================================
AUTO-ACTUALIZACIÓN DE VERSIÓN
========================================

Versión actual: 1.1.1
Nueva versión:  1.1.2
Fecha:          20260120

Actualizando archivos...
✓ frontend/src/config/version.ts
✓ backend/src/config/version.ts
✓ frontend/package.json
✓ backend/package.json
✓ VERSION.md

========================================
✓ VERSIÓN ACTUALIZADA EXITOSAMENTE
========================================

✓ Versión actualizada automáticamente
[main abc1234] Implementar nueva funcionalidad
 5 files changed, 10 insertions(+), 5 deletions(-)
```

### Uso Manual (Opcional)

Si necesitas actualizar la versión sin hacer commit:

```powershell
# Incrementar PATCH automáticamente
node update-version-auto.js

# O usar el script PowerShell con versión específica
.\update-version.ps1 -Version "2.0.0"
```

---

## 🎨 Formato de Versión

### Estructura

```
MAJOR.MINOR.PATCH - YYYYMMDD
```

### Ejemplos

- `1.1.1 - 20260120` → Primera versión con auto-versionamiento
- `1.1.2 - 20260120` → Corrección de bug
- `1.2.0 - 20260121` → Nueva funcionalidad (cambio manual)
- `2.0.0 - 20260201` → Cambio mayor (cambio manual)

### Cuándo Cambiar Manualmente

**MAJOR (1.x.x → 2.x.x):**
- Cambios incompatibles con versiones anteriores
- Rediseño completo
- Cambios en la arquitectura

**MINOR (x.1.x → x.2.x):**
- Nueva funcionalidad importante
- Nuevos módulos
- Mejoras significativas

**PATCH (x.x.1 → x.x.2):**
- Correcciones de bugs
- Mejoras menores
- Actualizaciones de documentación
- **Se incrementa automáticamente con cada commit**

---

## 📍 Ubicaciones de la Versión

### Frontend

1. **Login Page** (abajo)
   - Archivo: `frontend/src/pages/LoginPage.tsx`
   - Muestra: `v1.1.2 - 20260120`

2. **Sidebar** (debajo del usuario)
   - Archivo: `frontend/src/components/Layout.tsx`
   - Muestra: `v1.1.2 - 20260120`

3. **Configuración**
   - Archivo: `frontend/src/config/version.ts`
   - Exporta: `APP_VERSION`

### Backend

1. **Endpoint API**
   - Ruta: `GET /api/auth/version`
   - Respuesta: `{ version: "1.1.2", date: "20260120", fullVersion: "1.1.2 - 20260120" }`

2. **Configuración**
   - Archivo: `backend/src/config/version.ts`
   - Exporta: `APP_VERSION`

### Archivos de Configuración

1. **package.json** (Frontend y Backend)
   - Campo: `"version": "1.1.2"`

2. **VERSION.md** (Raíz del proyecto)
   - Historial completo de versiones

---

## 🔧 Configuración Avanzada

### Personalizar Incremento

Si quieres cambiar qué número se incrementa, edita `update-version-auto.js`:

```javascript
// Incrementar MINOR en lugar de PATCH
function incrementVersion(version) {
  const parts = version.split('.');
  const major = parseInt(parts[0]);
  const minor = parseInt(parts[1]) + 1; // Cambiar aquí
  const patch = 0; // Resetear PATCH
  return `${major}.${minor}.${patch}`;
}
```

### Deshabilitar Auto-Versionamiento

Si necesitas hacer commits sin incrementar la versión:

```bash
# Opción 1: Usar --no-verify
git commit -m "mensaje" --no-verify

# Opción 2: Deshabilitar temporalmente
mv .husky/pre-commit .husky/pre-commit.disabled
git commit -m "mensaje"
mv .husky/pre-commit.disabled .husky/pre-commit
```

### Cambiar Versión Manualmente

```powershell
# Cambiar a versión específica
.\update-version.ps1 -Version "2.0.0"

# Luego hacer commit
git add .
git commit -m "Actualizar a versión 2.0.0" --no-verify
```

---

## 🐛 Solución de Problemas

### Problema: Hook no se ejecuta

**Solución:**
```powershell
# Reinstalar Husky
npm install --save-dev husky
npx husky install

# Verificar permisos (Linux/Mac)
chmod +x .husky/pre-commit
```

### Problema: Error "node: command not found"

**Solución:**
```powershell
# Verificar Node.js
node --version

# Si no está instalado, instalar Node.js
# https://nodejs.org/
```

### Problema: Versión no se actualiza

**Solución:**
```powershell
# Ejecutar manualmente para ver errores
node update-version-auto.js

# Verificar que el hook existe
Test-Path .husky/pre-commit
```

### Problema: Conflictos en VERSION.md

**Solución:**
```bash
# Resolver conflictos manualmente
git add VERSION.md
git commit -m "Resolver conflictos de versión"
```

---

## 📊 Ejemplo Completo

### Escenario: Implementar nueva funcionalidad

```powershell
# 1. Crear rama
git checkout -b feature/nueva-funcionalidad

# 2. Hacer cambios en el código
# ... editar archivos ...

# 3. Agregar cambios
git add .

# 4. Hacer commit (versión se actualiza automáticamente)
git commit -m "Implementar nueva funcionalidad de reportes"

# Salida:
# Actualizando versión del sistema...
# Versión actual: 1.1.1
# Nueva versión:  1.1.2
# ✓ Versión actualizada automáticamente

# 5. Subir cambios
git push origin feature/nueva-funcionalidad

# 6. Crear Pull Request en GitHub

# 7. Merge a main
git checkout main
git merge feature/nueva-funcionalidad

# 8. Subir a main
git push origin main
```

**Resultado:**
- Versión incrementada: `1.1.1` → `1.1.2`
- Fecha actualizada: `20260120`
- Todos los archivos de versión actualizados
- Cambios visibles en login y sidebar

---

## 📚 Referencias

- **Husky:** https://typicode.github.io/husky/
- **Git Hooks:** https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks
- **Semantic Versioning:** https://semver.org/

---

## ✅ Checklist de Verificación

- [ ] Husky instalado
- [ ] Hook pre-commit configurado
- [ ] Script update-version-auto.js funciona
- [ ] Versión se muestra en login
- [ ] Versión se muestra en sidebar
- [ ] Endpoint /api/auth/version funciona
- [ ] package.json se actualiza
- [ ] VERSION.md se actualiza

---

## 🎉 Beneficios

1. **Automatización:** No necesitas recordar actualizar la versión
2. **Consistencia:** Todas las versiones siguen el mismo formato
3. **Trazabilidad:** Cada commit tiene su versión única
4. **Historial:** VERSION.md mantiene registro de cambios
5. **Sincronización:** Frontend y backend siempre tienen la misma versión

---

**Última actualización:** 2026-01-20  
**Versión del documento:** 1.0.0
