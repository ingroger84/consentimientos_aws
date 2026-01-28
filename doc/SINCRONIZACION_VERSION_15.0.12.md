# Sincronización de Versión 15.0.12

**Fecha:** 2026-01-26  
**Estado:** ✅ COMPLETADO

## Problema

El usuario reportó que estaba viendo la versión **15.0.10** en el frontend, pero la documentación indicaba que se había actualizado a la versión **15.0.12**.

## Causa

Los archivos de versión no estaban sincronizados:
- ✅ `VERSION.md` - Actualizado a 15.0.12
- ❌ `frontend/package.json` - Estaba en 15.0.10
- ❌ `backend/package.json` - Estaba en 15.0.10
- ❌ `frontend/src/config/version.ts` - Estaba en 15.0.10
- ❌ `backend/src/config/version.ts` - Estaba en 15.0.10

## Solución

Se actualizaron todos los archivos de versión a **15.0.12**:

### 1. Frontend Package.json
```json
{
  "name": "consentimientos-frontend",
  "version": "15.0.12",
  ...
}
```

### 2. Backend Package.json
```json
{
  "name": "consentimientos-backend",
  "version": "15.0.12",
  ...
}
```

### 3. Frontend Version Config
```typescript
export const APP_VERSION = {
  version: '15.0.12',
  date: '2026-01-26',
  fullVersion: '15.0.12 - 2026-01-26',
  buildDate: new Date('2026-01-26').toISOString(),
} as const;
```

### 4. Backend Version Config
```typescript
export const APP_VERSION = {
  version: '15.0.12',
  date: '2026-01-26',
  fullVersion: '15.0.12 - 2026-01-26',
  buildDate: new Date('2026-01-26').toISOString(),
} as const;
```

### 5. Reinicio del Frontend

Se reinició el proceso del frontend para cargar la nueva versión:

```bash
# Detener proceso anterior
Process 3 stopped

# Iniciar nuevo proceso
Process 4 started
Frontend running on: http://localhost:5173/
Version: 15.0.12
```

## Verificación

### Script de Verificación

```bash
node scripts/utils/verify-version-sync.js
```

**Resultado:**

```
📦 Versiones encontradas:

   ✓ frontend/package.json                    15.0.12
   ✓ backend/package.json                     15.0.12
   ✓ frontend/src/config/version.ts           15.0.12
   ✓ backend/src/config/version.ts            15.0.12
   ✓ VERSION.md                               15.0.12
```

### Verificación en el Frontend

1. Abre el navegador en `http://demo-medico.localhost:5174`
2. Abre las DevTools (F12)
3. Ve a la consola
4. Escribe: `localStorage.getItem('app-version')`
5. Deberías ver: `"15.0.12 - 2026-01-26"`

O simplemente mira el footer de la aplicación donde se muestra la versión.

## Archivos Modificados

- ✅ `frontend/package.json` - Versión actualizada a 15.0.12
- ✅ `backend/package.json` - Versión actualizada a 15.0.12
- ✅ `frontend/src/config/version.ts` - Versión y fecha actualizadas
- ✅ `backend/src/config/version.ts` - Versión y fecha actualizadas
- ✅ Frontend reiniciado (proceso 4)

## Cambios en la Versión 15.0.12

Esta versión incluye:

1. **Corrección de Permisos del Administrador General** (doc/83-correccion-permisos-admin-general/)
   - Agregados 60 permisos completos al rol `ADMIN_GENERAL`
   - Corregido nombre de permiso en frontend: `delete_mr_consents`
   - Botón de eliminar consentimientos HC ahora visible

2. **Corrección de Permisos para Logos HC** (doc/82-correccion-permisos-logos-hc/)
   - Agregado permiso `edit_settings` al rol Administrador General
   - Acceso a Configuración → Logos HC habilitado

3. **Ajuste de Espacio entre Firma/Foto y Footer en PDF HC** (doc/81-ajuste-espacio-firma-footer/)
   - Aumentado espacio mínimo de 180 a 250 puntos
   - Mejor legibilidad del footer en PDFs

## Notas

- El README.md mantiene su versión 2.0.0 (versión del proyecto general, no de la aplicación)
- Los cambios de versión requieren reiniciar el frontend para que se reflejen
- El backend no requiere reinicio ya que la versión se lee en tiempo de ejecución

## Referencias

- Sistema de Versionamiento: `doc/15-versionamiento/`
- Script de Verificación: `scripts/utils/verify-version-sync.js`
- Script de Bump: `scripts/utils/smart-version.js`
