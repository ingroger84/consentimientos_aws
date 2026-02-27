# ✅ Migración a Supabase Completada

**Fecha:** 2026-02-26  
**Versión:** 42.2.0  
**Estado:** ✅ COMPLETADA

---

## 📋 Resumen

La migración de AWS RDS PostgreSQL a Supabase se completó exitosamente. La base de datos está operativa y el backend se conecta correctamente.

---

## 🎯 Pasos Realizados

### 1. ✅ Conexión a Supabase Establecida

**Credenciales configuradas:**
```env
DB_HOST=db.witvuzaarlqxkiqfiljq.supabase.co
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD
DB_DATABASE=postgres
DB_SSL=true
```

**Prueba de conexión:**
- ✅ Conexión exitosa
- ✅ PostgreSQL 17.6
- ✅ Extensiones verificadas (uuid-ossp, pgcrypto, etc.)

### 2. ✅ Esquema Creado

**Método:** TypeORM con `synchronize: true`

**Tablas creadas (36):**
- admissions
- anamnesis
- answers
- app_settings
- billing_history
- branches
- clients
- consent_templates
- consents
- diagnoses
- epicrisis
- evolutions
- invoices
- medical_orders
- medical_record_audit
- medical_record_consent_templates
- medical_record_consents
- medical_record_documents
- medical_records
- migrations
- notifications
- payment_reminders
- payments
- physical_exams
- plan_pricing
- prescriptions
- procedures
- questions
- roles
- services
- tax_configs
- tenants
- treatment_plans
- user_branches
- user_sessions
- users

### 3. ✅ Datos Iniciales Creados

**Roles creados:**
- super_admin (tipo: super_admin)
- admin (tipo: ADMIN_GENERAL)
- operador (tipo: OPERADOR)
- admin_sede (tipo: ADMIN_SEDE)

**Usuario Super Admin:**
- Email: rcaraballo@innovasystems.com.co
- Password: Admin123!
- ⚠️ **IMPORTANTE:** Cambiar password después del primer login

### 4. ✅ Backend Conectado

**Verificación:**
- ✅ Backend local se conecta a Supabase
- ✅ Todas las entidades cargadas correctamente
- ✅ Enums y relaciones funcionando

---

## 📊 Comparación: AWS RDS vs Supabase

| Aspecto | AWS RDS | Supabase |
|---------|---------|----------|
| **Host** | ls-453b766db06e3f7769f28bbba2b592645e6b80c7.cs1dsnlrlh7h.us-east-1.rds.amazonaws.com | db.witvuzaarlqxkiqfiljq.supabase.co |
| **Puerto** | 5432 | 5432 (directo) / 6543 (pooling) |
| **PostgreSQL** | 15.x | 17.6 |
| **Región** | us-east-1 (Virginia) | sa-east-1 (São Paulo) |
| **Gestión** | Manual | Interfaz web |
| **Backups** | Manual | Automáticos (Plan Pro) |
| **Monitoreo** | CloudWatch | Dashboard integrado |
| **Costo** | Variable | $25/mes (Plan Pro) |

---

## 🔧 Configuración Actualizada

### Backend Local (.env)

```env
# Database - Supabase
DB_HOST=db.witvuzaarlqxkiqfiljq.supabase.co
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD
DB_DATABASE=postgres
DB_SSL=true
```

### Backend Servidor AWS (Pendiente)

**Archivo:** `/home/ubuntu/consentimientos_aws/backend/.env`

Actualizar con las mismas credenciales de Supabase.

---

## 📝 Próximos Pasos

### 1. Actualizar Servidor AWS

```bash
# Conectar al servidor
ssh -i credentials/AWS-ISSABEL.pem ubuntu@100.28.198.249

# Editar .env
cd /home/ubuntu/consentimientos_aws/backend
nano .env

# Actualizar credenciales de base de datos:
DB_HOST=db.witvuzaarlqxkiqfiljq.supabase.co
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD
DB_DATABASE=postgres
DB_SSL=true

# Guardar y salir (Ctrl+X, Y, Enter)

# Reiniciar backend
pm2 restart datagree

# Verificar logs
pm2 logs datagree --lines 50
```

### 2. Verificar Aplicación

1. Acceder a: https://demo-estetica.archivoenlinea.com
2. Iniciar sesión con:
   - Email: rcaraballo@innovasystems.com.co
   - Password: Admin123!
3. Cambiar password inmediatamente
4. Verificar que todo funcione correctamente

### 3. Crear Tenant de Prueba

Una vez verificado el login, crear un tenant de prueba para validar toda la funcionalidad.

### 4. Monitoreo en Supabase

1. Acceder a: https://supabase.com/dashboard
2. Ir a tu proyecto
3. Verificar:
   - Database Health
   - Conexiones activas
   - Uso de recursos

---

## 🛠️ Scripts Creados

### 1. test-supabase-connection.js
Prueba la conexión a Supabase y muestra información de la base de datos.

```bash
cd backend
node test-supabase-connection.js
```

### 2. create-supabase-schema.js
Crea el esquema completo usando TypeORM synchronize.

```bash
cd backend
node create-supabase-schema.js
```

### 3. seed-supabase.js
Crea roles y usuario super admin.

```bash
cd backend
node seed-supabase.js
```

### 4. check-schema.js
Verifica la estructura de las tablas.

```bash
cd backend
node check-schema.js
```

---

## ⚠️ Notas Importantes

### Seguridad

1. **Password del Super Admin:**
   - Password temporal: Admin123!
   - DEBE cambiarse después del primer login
   - Usar password fuerte (mínimo 12 caracteres, mayúsculas, minúsculas, números, símbolos)

2. **Credenciales de Supabase:**
   - Guardadas en `backend/.env`
   - NO commitear al repositorio
   - Mantener seguras

3. **Connection Pooling:**
   - Puerto 5432: Conexión directa (desarrollo)
   - Puerto 6543: Connection pooling (producción recomendado)
   - Para producción, cambiar a puerto 6543 en el futuro

### Backups

1. **Supabase (Plan Pro):**
   - Backups automáticos diarios
   - Point-in-time recovery
   - Retención de 7 días

2. **Manual (Recomendado):**
   ```bash
   # Exportar backup
   pg_dump -h db.witvuzaarlqxkiqfiljq.supabase.co \
     -U postgres \
     -d postgres \
     -f backup_$(date +%Y%m%d).sql
   ```

### Monitoreo

1. **Dashboard de Supabase:**
   - CPU usage
   - Memory usage
   - Disk usage
   - Connection count

2. **Alertas recomendadas:**
   - Uso de disco > 80%
   - Conexiones > 90% del límite
   - Queries lentas > 5 segundos

---

## 🔄 Rollback (Si es necesario)

Si algo sale mal, puedes volver a AWS RDS:

```bash
# 1. Editar .env en servidor
ssh -i credentials/AWS-ISSABEL.pem ubuntu@100.28.198.249
cd /home/ubuntu/consentimientos_aws/backend
nano .env

# 2. Restaurar credenciales de AWS RDS
DB_HOST=ls-453b766db06e3f7769f28bbba2b592645e6b80c7.cs1dsnlrlh7h.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_USERNAME=archivoenlinea
DB_PASSWORD=8K`=Yt|Qm2HHilf^}{(r=6I_$auA.k2g
DB_DATABASE=archivoenlinea
DB_SSL=true

# 3. Reiniciar backend
pm2 restart datagree
```

---

## 📊 Ventajas de Supabase

### Gestión Simplificada
- ✅ Interfaz web intuitiva
- ✅ SQL Editor integrado
- ✅ Table Editor visual
- ✅ Logs en tiempo real

### Rendimiento
- ✅ Región más cercana (São Paulo)
- ✅ Connection pooling optimizado
- ✅ PostgreSQL 17.6 (más reciente)

### Seguridad
- ✅ Backups automáticos
- ✅ SSL por defecto
- ✅ Row Level Security disponible

### Escalabilidad
- ✅ Fácil upgrade de plan
- ✅ Recursos ajustables
- ✅ Sin downtime

---

## 📞 Soporte

### Supabase
- Dashboard: https://supabase.com/dashboard
- Docs: https://supabase.com/docs
- Support: https://supabase.com/support

### Credenciales de Acceso

**Supabase Dashboard:**
- URL: https://supabase.com/dashboard
- Proyecto: witvuzaarlqxkiqfiljq

**Base de Datos:**
- Host: db.witvuzaarlqxkiqfiljq.supabase.co
- Port: 5432 (directo) / 6543 (pooling)
- Database: postgres
- User: postgres

**Aplicación:**
- URL: https://demo-estetica.archivoenlinea.com
- Super Admin: rcaraballo@innovasystems.com.co
- Password: Admin123! (cambiar después del primer login)

---

## ✅ Checklist Final

- [x] Conexión a Supabase establecida
- [x] Esquema creado (36 tablas)
- [x] Roles creados (4 roles)
- [x] Super Admin creado
- [x] Backend local conectado y funcionando
- [ ] Backend en servidor AWS actualizado
- [ ] Aplicación verificada en producción
- [ ] Password del super admin cambiado
- [ ] Tenant de prueba creado
- [ ] Monitoreo configurado
- [ ] Backups verificados

---

## 🎉 Conclusión

La migración a Supabase se completó exitosamente. La base de datos está operativa con todas las tablas, roles y el usuario super admin creado. El siguiente paso es actualizar la configuración en el servidor AWS y verificar que la aplicación funcione correctamente en producción.

**Beneficios obtenidos:**
- ✅ Base de datos separada de la máquina AWS
- ✅ Mejor gestión y monitoreo
- ✅ Backups automáticos
- ✅ Región más cercana (mejor latencia)
- ✅ PostgreSQL más reciente (17.6)
- ✅ Interfaz web para administración
