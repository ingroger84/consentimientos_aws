# Tests - Testing y Diagnóstico

Esta carpeta contiene tests, scripts de diagnóstico y herramientas de testing del sistema.

## Estructura

### 🧪 api/
Tests de endpoints de API
- `test-admin-login.json` - Test de login de admin
- `test-login.json` - Test de login general
- `test-user-permissions.json` - Test de permisos de usuario
- `test-login-suspended.sh` - Test de login con cuenta suspendida
- `test-public-endpoint.sh` - Test de endpoints públicos

**Uso:**
```bash
# Test con curl
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d @tests/api/test-login.json

# Test con script
bash tests/api/test-login-suspended.sh
```

### 🔍 diagnostics/
Scripts de diagnóstico del sistema
- `check-tenant-columns.js` - Verificar columnas de tenants
- `test-permissions-transform.js` - Test de transformación de permisos
- `update-permissions.js` - Actualizar permisos

**Uso:**
```bash
cd backend
node ../tests/diagnostics/check-tenant-columns.js
```

### 🌐 integration/
Tests de integración y HTML de prueba
- `SOLUCION_CACHE_LOGIN_SUSPENDED.html` - Test de caché en login
- `SOLUCION_RAPIDA_SUPER_ADMIN.html` - Test de super admin

**Uso:**
Abrir archivos HTML directamente en el navegador para testing manual.

## Tests Automatizados

El proyecto usa Jest para tests unitarios (cuando estén implementados).

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Scripts de Diagnóstico en Backend

Muchos scripts de diagnóstico están en `/backend/`:
- `backend/diagnose-*.js` - Scripts de diagnóstico
- `backend/test-*.js` - Scripts de test
- `backend/check-*.js` - Scripts de verificación

Ver lista completa en `/backend/` con:
```bash
ls backend/*.js | grep -E "(diagnose|test|check)"
```

## Mejores Prácticas

1. Siempre probar en desarrollo antes de producción
2. Usar datos de prueba, nunca datos reales
3. Documentar resultados de tests importantes
4. Mantener scripts de diagnóstico actualizados
5. Eliminar tests obsoletos regularmente

## Tests Recomendados Antes de Deploy

1. Login de usuarios (admin, operador, super admin)
2. Creación de consentimientos
3. Generación de facturas
4. Procesamiento de pagos Bold
5. Generación de PDFs
6. Envío de emails

## Herramientas de Testing

- **Postman/Insomnia:** Para tests de API
- **Jest:** Tests unitarios (backend/frontend)
- **Playwright/Cypress:** Tests E2E (futuro)
- **curl:** Tests rápidos de endpoints

**Última actualización:** 2026-03-28 (v77.1.0)
