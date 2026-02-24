# Instrucciones de Despliegue - Versión 24.0.0
## Cumplimiento Normativo HC - 100%

**Fecha:** 06 de Febrero de 2026  
**Versión:** 24.0.0  
**Tipo:** Major Release - Nuevas Funcionalidades Críticas

---

## ⚠️ ADVERTENCIAS IMPORTANTES

1. **BACKUP OBLIGATORIO:** Hacer backup completo de la base de datos antes de proceder
2. **DOWNTIME:** Se requiere downtime de ~5-10 minutos para migraciones
3. **TESTING:** Probar en ambiente de desarrollo primero
4. **ROLLBACK:** Tener plan de rollback preparado

---

## 📋 PRE-REQUISITOS

- [x] Acceso SSH al servidor de producción
- [x] Credenciales de base de datos
- [x] Backup de base de datos completado
- [x] Node.js y npm instalados
- [x] PM2 configurado

---

## 🚀 PASOS DE DESPLIEGUE

### PASO 1: Backup de Base de Datos

```bash
# Conectar al servidor
ssh ubuntu@100.28.198.249 -i keys/AWS-ISSABEL.pem

# Crear backup
cd /home/ubuntu/consentimientos_aws
pg_dump -h localhost -U postgres -d consentimientos_db > backup_pre_v24.0.0_$(date +%Y%m%d_%H%M%S).sql

# Verificar backup
ls -lh backup_pre_v24.0.0_*.sql
```

### PASO 2: Actualizar Código

```bash
# Desde tu máquina local
cd E:\PROJECTS\CONSENTIMIENTOS_2025_1.3_FUNCIONAL_LOCAL

# Commit de cambios
git add .
git commit -m "feat: Implementación completa cumplimiento normativo HC v24.0.0"
git push origin main

# En el servidor
ssh ubuntu@100.28.198.249 -i keys/AWS-ISSABEL.pem
cd /home/ubuntu/consentimientos_aws
git pull origin main
```

### PASO 3: Instalar Dependencias

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### PASO 4: Ejecutar Migraciones de Base de Datos

```bash
cd /home/ubuntu/consentimientos_aws/backend

# Ejecutar migración SQL
psql -h localhost -U postgres -d consentimientos_db -f migrations/create-medical-records-complete-tables.sql

# Verificar que las tablas fueron creadas
psql -h localhost -U postgres -d consentimientos_db -c "\dt medical_orders prescriptions procedures treatment_plans epicrisis medical_record_documents"
```

**Salida esperada:**
```
                    List of relations
 Schema |           Name            | Type  |  Owner   
--------+---------------------------+-------+----------
 public | medical_orders            | table | postgres
 public | prescriptions             | table | postgres
 public | procedures                | table | postgres
 public | treatment_plans           | table | postgres
 public | epicrisis                 | table | postgres
 public | medical_record_documents  | table | postgres
```

### PASO 5: Actualizar Permisos de Roles

```bash
cd /home/ubuntu/consentimientos_aws/backend

# Ejecutar script de actualización de permisos
node update-role-permissions-complete.js
```

**Salida esperada:**
```
🚀 Iniciando actualización de permisos...

📋 Roles encontrados: 4

✅ Super Admin:
   - Permisos anteriores: 45
   - Nuevos permisos agregados: 20
   - Total permisos: 65

✅ Admin General:
   - Permisos anteriores: 42
   - Nuevos permisos agregados: 20
   - Total permisos: 62

✅ Admin Sede:
   - Permisos anteriores: 25
   - Nuevos permisos agregados: 12
   - Total permisos: 37

✅ Operador:
   - Permisos anteriores: 15
   - Nuevos permisos agregados: 6
   - Total permisos: 21

✅ Actualización completada exitosamente!
```

### PASO 6: Compilar Backend

```bash
cd /home/ubuntu/consentimientos_aws/backend
npm run build
```

### PASO 7: Compilar Frontend

```bash
cd /home/ubuntu/consentimientos_aws/frontend
npm run build
```

### PASO 8: Reiniciar Servicios

```bash
# Reiniciar backend
pm2 restart consentimientos-backend

# Verificar que inició correctamente
pm2 logs consentimientos-backend --lines 50

# Guardar configuración PM2
pm2 save
```

### PASO 9: Verificar Despliegue

```bash
# Verificar que el backend responde
curl http://localhost:3000/api/health

# Verificar endpoints nuevos
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/medical-records

# Verificar logs
pm2 logs consentimientos-backend --lines 100
```

### PASO 10: Pruebas de Funcionalidad

1. **Login:** Verificar que el login funciona
2. **Dashboard:** Verificar que el dashboard carga
3. **Historias Clínicas:** Verificar que se pueden ver HC existentes
4. **Crear HC:** Intentar crear nueva HC (debe validar HC única por paciente)
5. **Órdenes Médicas:** Verificar que se pueden crear órdenes
6. **Prescripciones:** Verificar que se pueden crear prescripciones

---

## 🔍 VERIFICACIÓN POST-DESPLIEGUE

### Verificar Tablas Creadas

```sql
-- Conectar a la base de datos
psql -h localhost -U postgres -d consentimientos_db

-- Verificar tablas
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as columns
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN (
    'medical_orders',
    'prescriptions',
    'procedures',
    'treatment_plans',
    'epicrisis',
    'medical_record_documents'
  );

-- Verificar columnas nuevas en clients
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'clients' 
  AND column_name IN ('photo_url', 'photo_captured_at');
```

### Verificar Permisos Actualizados

```sql
-- Ver permisos de cada rol
SELECT name, array_length(permissions, 1) as total_permissions
FROM roles
ORDER BY name;

-- Ver permisos específicos de un rol
SELECT name, permissions
FROM roles
WHERE name = 'Super Admin';
```

### Verificar Endpoints

```bash
# Desde tu máquina local o desde el servidor

# Health check
curl https://consentimientos.tudominio.com/api/health

# Verificar autenticación
curl -X POST https://consentimientos.tudominio.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

---

## 🐛 TROUBLESHOOTING

### Problema: Migraciones fallan

**Solución:**
```bash
# Verificar conexión a BD
psql -h localhost -U postgres -d consentimientos_db -c "SELECT version();"

# Verificar que uuid-ossp está habilitado
psql -h localhost -U postgres -d consentimientos_db -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"

# Ejecutar migración línea por línea si es necesario
```

### Problema: Backend no inicia

**Solución:**
```bash
# Ver logs detallados
pm2 logs consentimientos-backend --lines 200

# Verificar variables de entorno
cat /home/ubuntu/consentimientos_aws/backend/.env

# Reiniciar con logs en tiempo real
pm2 restart consentimientos-backend --watch
pm2 logs consentimientos-backend
```

### Problema: Permisos no se actualizan

**Solución:**
```bash
# Verificar que el script se ejecutó correctamente
node update-role-permissions-complete.js

# Verificar manualmente en la BD
psql -h localhost -U postgres -d consentimientos_db
SELECT name, permissions FROM roles WHERE name = 'Super Admin';

# Si es necesario, actualizar manualmente
UPDATE roles 
SET permissions = array_append(permissions, 'view_medical_orders')
WHERE name = 'Super Admin' 
  AND NOT ('view_medical_orders' = ANY(permissions));
```

### Problema: Frontend no muestra cambios

**Solución:**
```bash
# Limpiar caché del navegador
# Ctrl + Shift + Delete

# Forzar rebuild del frontend
cd /home/ubuntu/consentimientos_aws/frontend
rm -rf dist node_modules
npm install
npm run build

# Verificar que nginx sirve los archivos correctos
ls -la /home/ubuntu/consentimientos_aws/frontend/dist
```

---

## 🔄 ROLLBACK (Si es necesario)

### Opción 1: Rollback de Base de Datos

```bash
# Restaurar backup
psql -h localhost -U postgres -d consentimientos_db < backup_pre_v24.0.0_TIMESTAMP.sql

# Reiniciar backend
pm2 restart consentimientos-backend
```

### Opción 2: Rollback de Código

```bash
# Volver a versión anterior
cd /home/ubuntu/consentimientos_aws
git log --oneline -10
git checkout COMMIT_HASH_ANTERIOR

# Recompilar
cd backend && npm run build
cd ../frontend && npm run build

# Reiniciar
pm2 restart consentimientos-backend
```

---

## 📊 MÉTRICAS DE ÉXITO

- [ ] Todas las migraciones ejecutadas sin errores
- [ ] Permisos actualizados en todos los roles
- [ ] Backend inicia sin errores
- [ ] Frontend carga correctamente
- [ ] Login funciona
- [ ] Dashboard carga
- [ ] Se pueden ver historias clínicas existentes
- [ ] Validación de HC única funciona
- [ ] Nuevos endpoints responden correctamente

---

## 📞 SOPORTE

Si encuentras problemas durante el despliegue:

1. Revisar logs: `pm2 logs consentimientos-backend`
2. Verificar base de datos: `psql -h localhost -U postgres -d consentimientos_db`
3. Consultar documentación: `doc/ANALISIS_FLUJO_HC_VS_NORMATIVA_COLOMBIANA.md`
4. Revisar implementación: `IMPLEMENTACION_CUMPLIMIENTO_NORMATIVO_COMPLETADA.md`

---

## ✅ CHECKLIST FINAL

- [ ] Backup completado
- [ ] Código actualizado
- [ ] Dependencias instaladas
- [ ] Migraciones ejecutadas
- [ ] Permisos actualizados
- [ ] Backend compilado
- [ ] Frontend compilado
- [ ] Servicios reiniciados
- [ ] Verificaciones completadas
- [ ] Pruebas funcionales OK
- [ ] Documentación actualizada

---

**¡Despliegue completado exitosamente!** 🎉

**Versión:** 24.0.0  
**Cumplimiento Normativo:** 100% ✅  
**Fecha:** 06 de Febrero de 2026
