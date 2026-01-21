# Ejemplos de Actualización de Versión

## Casos de Uso Comunes

### 1. Corrección de Errores (PATCH)

**Escenario:** Se corrigió un bug en el formulario de consentimientos.

```powershell
# Incrementar PATCH: 1.1.1 → 1.1.2
.\update-version.ps1 -Version "1.1.2"
```

**Resultado:**
- Versión: `1.1.2 - 20260120` (fecha actual)

### 2. Nueva Funcionalidad (MINOR)

**Escenario:** Se agregó un nuevo módulo de reportes.

```powershell
# Incrementar MINOR: 1.1.2 → 1.2.0
.\update-version.ps1 -Version "1.2.0"
```

**Resultado:**
- Versión: `1.2.0 - 20260120` (fecha actual)

### 3. Cambio Mayor (MAJOR)

**Escenario:** Se cambió completamente el sistema de autenticación.

```powershell
# Incrementar MAJOR: 1.2.0 → 2.0.0
.\update-version.ps1 -Version "2.0.0"
```

**Resultado:**
- Versión: `2.0.0 - 20260120` (fecha actual)

### 4. Actualización con Fecha Específica

**Escenario:** Se quiere registrar una fecha específica de release.

```powershell
# Versión con fecha específica
.\update-version.ps1 -Version "1.3.0" -Date "20260201"
```

**Resultado:**
- Versión: `1.3.0 - 20260201`

## Flujo de Trabajo Completo

### Ejemplo: Agregar Nueva Funcionalidad

```powershell
# 1. Crear rama de desarrollo
git checkout -b feature/nuevo-modulo-reportes

# 2. Desarrollar la funcionalidad
# ... código ...

# 3. Probar exhaustivamente
# ... pruebas ...

# 4. Actualizar versión
.\update-version.ps1 -Version "1.2.0"

# 5. Revisar cambios
git status
git diff

# 6. Commit
git add .
git commit -m "feat: agregar módulo de reportes

- Nuevo módulo de reportes con gráficos
- Exportación a PDF y Excel
- Filtros avanzados

Version: 1.2.0 - 20260120"

# 7. Merge a main
git checkout main
git merge feature/nuevo-modulo-reportes

# 8. Crear tag
git tag -a v1.2.0 -m "Version 1.2.0 - Módulo de Reportes"

# 9. Push
git push origin main --tags
```

## Escenarios Especiales

### Hotfix en Producción

**Escenario:** Bug crítico en producción que necesita corrección inmediata.

```powershell
# 1. Crear rama de hotfix desde main
git checkout main
git checkout -b hotfix/correccion-critica

# 2. Corregir el bug
# ... código ...

# 3. Actualizar versión (PATCH)
.\update-version.ps1 -Version "1.1.3"

# 4. Commit y merge rápido
git add .
git commit -m "fix: corrección crítica en validación de pagos"
git checkout main
git merge hotfix/correccion-critica
git tag -a v1.1.3 -m "Hotfix: Validación de pagos"
git push origin main --tags

# 5. Merge también a develop si existe
git checkout develop
git merge hotfix/correccion-critica
git push origin develop
```

### Release Candidate

**Escenario:** Preparar una versión para pruebas antes del release final.

```powershell
# Versión RC
.\update-version.ps1 -Version "2.0.0-rc.1"

# Después de pruebas exitosas, versión final
.\update-version.ps1 -Version "2.0.0"
```

### Múltiples Cambios en un Día

**Escenario:** Varios hotfixes en el mismo día.

```powershell
# Primera corrección
.\update-version.ps1 -Version "1.1.3"

# Segunda corrección (mismo día)
.\update-version.ps1 -Version "1.1.4"

# Tercera corrección (mismo día)
.\update-version.ps1 -Version "1.1.5"
```

**Nota:** La fecha será la misma (fecha actual), pero la versión incrementa.

## Verificación Post-Actualización

### Checklist de Verificación

```powershell
# 1. Verificar endpoint del backend
Invoke-WebRequest -Uri "http://localhost:3000/api/auth/version" -Method GET

# 2. Verificar archivos actualizados
git status

# 3. Verificar que no hay errores de compilación
cd backend
npm run build

cd ../frontend
npm run build

# 4. Verificar en el navegador
# - Abrir http://admin.localhost:5173/login
# - Verificar versión en login
# - Iniciar sesión
# - Verificar versión en sidebar
```

## Mensajes de Commit Recomendados

### Para PATCH (Correcciones)
```
fix: descripción breve del bug corregido

Descripción más detallada si es necesario.

Version: 1.1.2 - 20260120
```

### Para MINOR (Nuevas Funcionalidades)
```
feat: descripción breve de la nueva funcionalidad

- Detalle 1
- Detalle 2
- Detalle 3

Version: 1.2.0 - 20260120
```

### Para MAJOR (Cambios Mayores)
```
BREAKING CHANGE: descripción del cambio mayor

Explicación detallada de:
- Qué cambió
- Por qué cambió
- Cómo migrar

Version: 2.0.0 - 20260120
```

## Troubleshooting

### Error: "Formato de versión inválido"

```powershell
# ❌ Incorrecto
.\update-version.ps1 -Version "1.2"
.\update-version.ps1 -Version "v1.2.0"

# ✅ Correcto
.\update-version.ps1 -Version "1.2.0"
```

### Error: "Formato de fecha inválido"

```powershell
# ❌ Incorrecto
.\update-version.ps1 -Version "1.2.0" -Date "2026-01-20"
.\update-version.ps1 -Version "1.2.0" -Date "20/01/2026"

# ✅ Correcto
.\update-version.ps1 -Version "1.2.0" -Date "20260120"
```

### La versión no se actualiza en el frontend

```powershell
# 1. Limpiar caché de Vite
cd frontend
Remove-Item -Recurse -Force .vite
Remove-Item -Recurse -Force node_modules/.vite

# 2. Reiniciar el servidor de desarrollo
# Detener el proceso actual (Ctrl+C)
npm run dev

# 3. Limpiar caché del navegador
# Ctrl + Shift + R en el navegador
```

## Integración con CI/CD

### GitHub Actions Example

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Get version from tag
        id: version
        run: echo "VERSION=${GITHUB_REF#refs/tags/v}" >> $GITHUB_OUTPUT
      
      - name: Verify version
        run: |
          BACKEND_VERSION=$(node -p "require('./backend/package.json').version")
          FRONTEND_VERSION=$(node -p "require('./frontend/package.json').version")
          
          if [ "$BACKEND_VERSION" != "${{ steps.version.outputs.VERSION }}" ]; then
            echo "Backend version mismatch!"
            exit 1
          fi
          
          if [ "$FRONTEND_VERSION" != "${{ steps.version.outputs.VERSION }}" ]; then
            echo "Frontend version mismatch!"
            exit 1
          fi
      
      - name: Create Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ steps.version.outputs.VERSION }}
          draft: false
          prerelease: false
```

