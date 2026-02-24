# 🧪 Tests

Esta carpeta contiene archivos de prueba y testing del proyecto.

## 📂 Contenido

### Scripts de Test
- `test-permissions-transform.js` - Test de transformación de permisos
- `test-*.json` - Archivos de datos de prueba
- `test-admin-login.json` - Datos de login de admin
- `test-login.json` - Datos de login general
- `test-user-permissions.json` - Permisos de usuario de prueba

## 📝 Uso

### Ejecutar Tests
```bash
# Test individual
node tests/test-permissions-transform.js

# Con datos de prueba
node tests/test-script.js tests/test-data.json
```

### Datos de Prueba
```javascript
// Cargar datos de prueba
const testData = require('./tests/test-login.json');
```

## 🔍 Tipos de Tests

### Tests Unitarios
- Ver `backend/src/**/*.spec.ts`
- Ver `frontend/src/**/*.test.tsx`

### Tests de Integración
- Scripts en esta carpeta
- Tests de API
- Tests de base de datos

### Tests E2E
- Ver documentación en `/doc/`

## 📊 Cobertura

Para ejecutar tests con cobertura:

```bash
# Backend
cd backend
npm run test:cov

# Frontend
cd frontend
npm run test:coverage
```

## ⚠️ Importante

- NO usar datos de producción en tests
- Usar datos ficticios o anonimizados
- Limpiar datos de prueba después de tests
- Mantener tests actualizados

## 📞 Soporte

Ver documentación completa en `/doc/`
