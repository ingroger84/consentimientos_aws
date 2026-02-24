# 🗄️ Base de Datos

Esta carpeta contiene todos los scripts y archivos relacionados con la base de datos.

## 📂 Estructura

### `/scripts`
Scripts de utilidad y mantenimiento:
- `check-*.sql` - Scripts de verificación
- `check-*.js` - Scripts de verificación en JavaScript
- `update-*.js` - Scripts de actualización
- `create-medical-records-clean.sql` - Creación de tablas de HC

### `/seeds`
Datos iniciales y de prueba:
- `seed-production-data.sql` - Datos de producción
- `seed-simple.sql` - Datos simples
- `load-consent-templates.sql` - Plantillas de consentimiento

### `/migrations`
Migraciones de base de datos (ver también `backend/migrations/`):
- Archivos de migración específicos del proyecto raíz

## 📝 Uso

### Ejecutar Scripts
```bash
# Conectar a la base de datos
psql -h HOST -U USER -d DATABASE -f database/scripts/script.sql

# O usando Node.js
node database/scripts/script.js
```

### Cargar Seeds
```bash
# Cargar datos de producción
psql -h HOST -U USER -d DATABASE -f database/seeds/seed-production-data.sql

# Cargar plantillas
psql -h HOST -U USER -d DATABASE -f database/seeds/load-consent-templates.sql
```

### Verificaciones
```bash
# Verificar permisos
psql -h HOST -U USER -d DATABASE -f database/scripts/check-permissions.sql

# Verificar datos de tenant
node database/scripts/check-tenant-columns.js
```

## ⚠️ Importante

- Hacer backup antes de ejecutar scripts de actualización
- Probar en desarrollo antes de producción
- Verificar credenciales antes de ejecutar
- NO commitear datos sensibles
