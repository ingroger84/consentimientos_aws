# Sistema de Versionamiento

## 🎯 Descripción General

Sistema inteligente de versionamiento automático que detecta el tipo de cambio y actualiza la versión apropiadamente siguiendo Semantic Versioning y mejores prácticas de SaaS.

## 📚 Documentación

- **[Sistema Inteligente](SISTEMA_INTELIGENTE.md)** - Documentación completa del nuevo sistema
- **[Ejemplos de Uso](EJEMPLOS.md)** - Casos de uso y ejemplos prácticos
- **[Auto-Versionamiento](AUTO_VERSIONAMIENTO.md)** - Configuración de Git Hooks

## ✨ Características Principales

### 1. Detección Automática Inteligente
- Analiza archivos modificados
- Interpreta mensajes de commit
- Detecta tipo de cambio (MAJOR/MINOR/PATCH)

### 2. Sincronización Total
- Frontend y Backend sincronizados
- package.json actualizados
- VERSION.md con historial detallado
- README.md con badge actualizado

### 3. Historial Detallado
- Registro de todos los cambios
- Descripción automática de modificaciones
- Fecha y tipo de cambio

## 🚀 Inicio Rápido

### Ver Versión Actual
```powershell
.\scripts\utils\version.ps1 show
```

### Incrementar Versión
```powershell
# Automático (detecta tipo de cambio)
git commit -m "feat: nueva funcionalidad"

# Manual
.\scripts\utils\version.ps1 patch   # 1.2.0 → 1.2.1
.\scripts\utils\version.ps1 minor   # 1.2.0 → 1.3.0
.\scripts\utils\version.ps1 major   # 1.2.0 → 2.0.0
```

### Verificar Sincronización
```powershell
node scripts/utils/verify-version-sync.js
```

### Ver Ayuda
```powershell
.\scripts\utils\version-help.ps1
```

## Formato de Versión

```
MAJOR.MINOR.PATCH - YYYYMMDD
```

### Componentes

- **MAJOR**: Cambios incompatibles con versiones anteriores (breaking changes)
- **MINOR**: Nueva funcionalidad compatible con versiones anteriores
- **PATCH**: Correcciones de errores compatibles con versiones anteriores
- **YYYYMMDD**: Fecha de la actualización (Año-Mes-Día)

### Ejemplos

- `1.0.0 - 20260115`: Versión inicial
- `1.1.0 - 20260120`: Nueva funcionalidad agregada
- `1.1.1 - 20260121`: Corrección de errores
- `2.0.0 - 20260201`: Cambio mayor incompatible

## Ubicaciones de la Versión

### Frontend

#### 1. Página de Login
La versión se muestra en la parte inferior del formulario de login:

```typescript
// frontend/src/pages/LoginPage.tsx
<p className="text-xs text-gray-500">
  Versión {getAppVersion()}
</p>
```

#### 2. Sidebar (Layout)
La versión se muestra debajo de la información del usuario logueado:

```typescript
// frontend/src/components/Layout.tsx
<p className="text-xs text-gray-400 text-center">
  v{getAppVersion()}
</p>
```

### Backend

#### Endpoint de Versión
```
GET /api/auth/version
```

**Respuesta:**
```json
{
  "version": "1.1.1",
  "date": "20260120",
  "fullVersion": "1.1.1 - 20260120"
}
```

**Características:**
- Endpoint público (no requiere autenticación)
- Permite a cualquier tenant consultar la versión
- Útil para verificación de versión desde el frontend

## Archivos de Configuración

### Frontend

#### version.ts
```typescript
// frontend/src/config/version.ts
export const APP_VERSION = {
  version: '1.1.1',
  date: '20260120',
  fullVersion: '1.1.1 - 20260120',
} as const;

export const getAppVersion = () => APP_VERSION.fullVersion;
```

#### package.json
```json
{
  "version": "1.1.1"
}
```

### Backend

#### version.ts
```typescript
// backend/src/config/version.ts
export const APP_VERSION = {
  version: '1.1.1',
  date: '20260120',
  fullVersion: '1.1.1 - 20260120',
} as const;

export const getAppVersion = () => APP_VERSION.fullVersion;
```

#### package.json
```json
{
  "version": "1.1.1"
}
```

## Cómo Actualizar la Versión

### Método 1: Script Automatizado (Recomendado)

Usar el script PowerShell `update-version.ps1`:

```powershell
# Actualizar a versión 1.2.0 con fecha actual
.\update-version.ps1 -Version "1.2.0"

# Actualizar a versión 1.2.0 con fecha específica
.\update-version.ps1 -Version "1.2.0" -Date "20260125"
```

El script actualiza automáticamente:
- `frontend/src/config/version.ts`
- `frontend/package.json`
- `backend/src/config/version.ts`
- `backend/package.json`
- `VERSION.md`

### Método 2: Manual

1. **Actualizar archivos de configuración:**
   - `frontend/src/config/version.ts`
   - `backend/src/config/version.ts`
   - `frontend/package.json`
   - `backend/package.json`

2. **Actualizar VERSION.md** con la nueva versión y descripción de cambios

3. **Reiniciar el proyecto** si está corriendo

## Mejores Prácticas

### Cuándo Incrementar Cada Componente

#### MAJOR (X.0.0)
- Cambios en la API que rompen compatibilidad
- Cambios en la estructura de la base de datos que requieren migración
- Cambios en la arquitectura del sistema
- Eliminación de funcionalidades

**Ejemplo:** Cambio de sistema de autenticación, nueva estructura de base de datos

#### MINOR (0.X.0)
- Nueva funcionalidad agregada
- Mejoras significativas en funcionalidades existentes
- Nuevos módulos o secciones
- Nuevas integraciones

**Ejemplo:** Nuevo módulo de reportes, integración con servicio de pago

#### PATCH (0.0.X)
- Corrección de errores
- Mejoras de rendimiento
- Actualizaciones de seguridad menores
- Ajustes de UI/UX
- Correcciones de texto

**Ejemplo:** Corrección de bug en formulario, mejora de validación

### Flujo de Trabajo Recomendado

1. **Planificar el cambio:**
   - Determinar el tipo de cambio (MAJOR, MINOR, PATCH)
   - Definir la nueva versión

2. **Realizar los cambios:**
   - Implementar las funcionalidades o correcciones
   - Probar exhaustivamente

3. **Actualizar la versión:**
   ```powershell
   .\update-version.ps1 -Version "1.2.0"
   ```

4. **Documentar los cambios:**
   - Actualizar VERSION.md con descripción de cambios
   - Crear changelog si es necesario

5. **Commit y deploy:**
   ```bash
   git add .
   git commit -m "chore: bump version to 1.2.0"
   git tag v1.2.0
   git push origin main --tags
   ```

## Verificación

### Frontend
1. Abrir la página de login
2. Verificar que la versión se muestre en la parte inferior
3. Iniciar sesión
4. Verificar que la versión se muestre en el sidebar

### Backend
```powershell
# Probar el endpoint de versión
Invoke-WebRequest -Uri "http://localhost:3000/api/auth/version" -Method GET
```

**Respuesta esperada:**
```json
{
  "version": "1.1.1",
  "date": "20260120",
  "fullVersion": "1.1.1 - 20260120"
}
```

## Troubleshooting

### La versión no se actualiza en el frontend
1. Limpiar caché del navegador (Ctrl + Shift + R)
2. Verificar que el archivo `version.ts` se haya actualizado
3. Reiniciar el servidor de desarrollo

### El endpoint de versión no responde
1. Verificar que el backend esté corriendo
2. Verificar que el archivo `backend/src/config/version.ts` exista
3. Verificar que el controlador de auth importe correctamente el archivo

### Error de compilación en TypeScript
1. Verificar que la sintaxis en `version.ts` sea correcta
2. Verificar que el export sea `as const`
3. Ejecutar `npm run build` para ver errores detallados

## Historial de Versiones

### 1.1.1 - 20260120
- ✨ Implementación inicial del sistema de versionamiento
- ✨ Versión visible en login y sidebar
- ✨ Endpoint de versión en el backend
- 📝 Documentación completa del sistema
- 🔧 Script automatizado para actualización de versiones

