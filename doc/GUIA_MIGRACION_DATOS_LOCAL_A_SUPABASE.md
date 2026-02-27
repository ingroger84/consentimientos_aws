# 📦 Guía de Migración de Datos Local a Supabase

**Fecha:** 2026-02-27  
**Versión:** 42.4.1  

---

## 🎯 Objetivo

Migrar todos los datos de tu base de datos PostgreSQL local a Supabase.

---

## 📋 Opciones de Migración

### Opción 1: Script Interactivo Node.js (RECOMENDADO)

**Ventajas:**
- ✅ Fácil de usar
- ✅ Interactivo (te pide las credenciales)
- ✅ Muestra progreso en tiempo real
- ✅ Migra tabla por tabla
- ✅ Maneja errores gracefully

**Pasos:**

1. Abre una terminal en la carpeta del proyecto

2. Navega a la carpeta backend:
   ```bash
   cd backend
   ```

3. Ejecuta el script:
   ```bash
   node migrate-interactive.js
   ```

4. Proporciona las credenciales cuando te las pida:
   ```
   Host: localhost (o la IP de tu PostgreSQL)
   Port: 5432 (puerto por defecto)
   User: postgres (o tu usuario)
   Password: [tu contraseña]
   Database: [nombre de tu base de datos local]
   ```

5. El script:
   - Conectará a ambas bases de datos
   - Mostrará cuántos registros hay en cada tabla
   - Te pedirá confirmación
   - Migrará todos los datos

**Ejemplo de salida:**
```
╔════════════════════════════════════════════╗
║  MIGRACIÓN DE DATOS LOCAL A SUPABASE      ║
╚════════════════════════════════════════════╝

=== CONFIGURACIÓN DE BASE DE DATOS LOCAL ===

Host (default: localhost): localhost
Port (default: 5432): 5432
User (default: postgres): postgres
Password: ****
Database name: archivoenlinea

=== Probando conexiones ===

✅ Conexión exitosa a Base de datos local
✅ Conexión exitosa a Supabase

=== Conectando a ambas bases de datos ===

✅ Conectado a base de datos local
✅ Conectado a Supabase

Encontradas 36 tablas

users                               5 registros
tenants                             2 registros
roles                               4 registros
clients                             10 registros
consents                            25 registros
medical_records                     15 registros
...

==================================================
Total: 15 tablas, 150 registros

¿Deseas continuar con la migración? (s/n): s

=== Iniciando migración ===

Migrando users (5 registros)...
  ✅ 5 registros migrados
Migrando tenants (2 registros)...
  ✅ 2 registros migrados
...

==================================================
✅ Migración completada
   Tablas migradas: 15/15
   Registros migrados: 150/150
```

---

### Opción 2: Script con pg_dump (Para migraciones grandes)

**Ventajas:**
- ✅ Más rápido para grandes volúmenes
- ✅ Usa herramientas nativas de PostgreSQL
- ✅ Crea backup antes de migrar
- ✅ Más robusto

**Requisitos:**
- PostgreSQL instalado en tu máquina
- Comandos `pg_dump` y `psql` disponibles

**Pasos:**

1. Abre PowerShell en la carpeta del proyecto

2. Navega a la carpeta backend:
   ```powershell
   cd backend
   ```

3. Ejecuta el script:
   ```powershell
   .\migrate-with-pgdump.ps1
   ```

4. Proporciona las credenciales cuando te las pida

5. El script:
   - Exportará todos los datos con `pg_dump`
   - Creará un archivo backup
   - Te pedirá confirmación
   - Importará a Supabase con `psql`

---

### Opción 3: Manual con pg_dump y psql

Si prefieres hacerlo manualmente:

#### 1. Exportar datos de local

```bash
# Windows PowerShell
$env:PGPASSWORD="tu_password"
pg_dump -h localhost -p 5432 -U postgres -d tu_database `
  --data-only `
  --no-owner `
  --no-privileges `
  --disable-triggers `
  -f backup_local.sql
```

```bash
# Linux/Mac
PGPASSWORD="tu_password" pg_dump \
  -h localhost \
  -p 5432 \
  -U postgres \
  -d tu_database \
  --data-only \
  --no-owner \
  --no-privileges \
  --disable-triggers \
  -f backup_local.sql
```

#### 2. Importar a Supabase

```bash
# Windows PowerShell
$env:PGPASSWORD="%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD"
psql -h db.witvuzaarlqxkiqfiljq.supabase.co `
  -p 5432 `
  -U postgres `
  -d postgres `
  -f backup_local.sql
```

```bash
# Linux/Mac
PGPASSWORD="%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD" psql \
  -h db.witvuzaarlqxkiqfiljq.supabase.co \
  -p 5432 \
  -U postgres \
  -d postgres \
  -f backup_local.sql
```

---

## 🔍 Verificar Migración

Después de migrar, verifica que los datos estén en Supabase:

### Opción 1: Script de verificación

```bash
cd backend
node check-supabase-data.js
```

### Opción 2: Supabase Dashboard

1. Ir a: https://supabase.com/dashboard
2. Seleccionar proyecto: witvuzaarlqxkiqfiljq
3. Ir a "Table Editor"
4. Verificar que las tablas tengan datos

### Opción 3: SQL Editor en Supabase

```sql
-- Ver todas las tablas con datos
SELECT 
    schemaname,
    tablename,
    (SELECT COUNT(*) FROM pg_catalog.pg_class c WHERE c.relname = tablename) as count
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Contar registros en tablas específicas
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM tenants;
SELECT COUNT(*) FROM clients;
SELECT COUNT(*) FROM consents;
SELECT COUNT(*) FROM medical_records;
```

---

## ⚠️ Consideraciones Importantes

### Antes de Migrar

1. **Backup de Supabase:**
   - Supabase tiene backups automáticos
   - Pero es buena idea hacer uno manual antes

2. **Verificar esquema:**
   - Asegúrate de que el esquema en Supabase sea igual al local
   - Las tablas deben existir en Supabase

3. **Datos existentes:**
   - Los scripts limpian las tablas antes de insertar
   - Si hay datos en Supabase, se perderán

### Durante la Migración

1. **No interrumpir:**
   - Deja que el proceso termine
   - Puede tomar varios minutos dependiendo del volumen

2. **Conexión estable:**
   - Asegúrate de tener buena conexión a internet
   - La migración se hace por internet a Supabase

3. **Errores:**
   - Si hay errores, el script los mostrará
   - Generalmente son por restricciones de foreign keys

### Después de Migrar

1. **Verificar datos:**
   - Cuenta los registros en ambas bases
   - Verifica que coincidan

2. **Probar aplicación:**
   - Inicia sesión
   - Verifica que todo funcione

3. **Actualizar servidor:**
   - Si todo está bien, el servidor ya está usando Supabase
   - No necesitas hacer nada más

---

## 🛠️ Solución de Problemas

### Error: "Cannot find module 'pg'"

```bash
cd backend
npm install
```

### Error: "Connection refused"

- Verifica que PostgreSQL esté corriendo
- Verifica el puerto (5432 por defecto)
- Verifica el host (localhost)

### Error: "Password authentication failed"

- Verifica el usuario y contraseña
- Verifica que el usuario tenga permisos

### Error: "Database does not exist"

- Verifica el nombre de la base de datos
- Lista las bases de datos disponibles:
  ```bash
  psql -U postgres -l
  ```

### Error: "Foreign key constraint"

- Los scripts intentan deshabilitar triggers
- Si persiste, migra las tablas en orden:
  1. Tablas sin foreign keys primero
  2. Tablas con foreign keys después

### Error: "Too many connections"

- Supabase tiene límite de conexiones
- Espera unos minutos y reintenta
- O usa el script que migra en lotes

---

## 📊 Tablas del Sistema

El sistema tiene estas tablas principales:

### Autenticación y Usuarios
- users
- roles
- permissions
- user_sessions
- user_branches

### Multi-tenant
- tenants
- branches

### Clientes
- clients

### Consentimientos
- consents
- consent_templates
- medical_record_consents
- medical_record_consent_templates

### Historias Clínicas
- medical_records
- anamnesis
- physical_exams
- diagnoses
- prescriptions
- medical_orders
- procedures
- treatment_plans
- evolutions
- epicrisis
- medical_record_documents
- admissions
- medical_record_audit

### Configuración
- services
- questions
- answers
- plan_pricing
- tax_configs
- app_settings

### Facturación
- payments
- invoices
- billing_history
- payment_reminders

### Notificaciones
- notifications

---

## 📝 Archivos Creados

```
backend/migrate-interactive.js          - Script interactivo Node.js
backend/migrate-local-to-supabase.js    - Script automático Node.js
backend/migrate-with-pgdump.ps1         - Script PowerShell con pg_dump
backend/check-local-data.js             - Verificar datos locales
backend/check-supabase-data.js          - Verificar datos en Supabase
```

---

## 🔗 Credenciales

### Base de Datos Local

- Host: localhost (o tu configuración)
- Port: 5432 (por defecto)
- User: postgres (o tu usuario)
- Password: [tu contraseña]
- Database: [nombre de tu base de datos]

### Supabase (Destino)

- Host: db.witvuzaarlqxkiqfiljq.supabase.co
- Port: 5432
- User: postgres
- Password: %6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD
- Database: postgres

---

## ✅ Checklist de Migración

- [ ] PostgreSQL local corriendo
- [ ] Credenciales de local verificadas
- [ ] Conexión a Supabase verificada
- [ ] Backup de Supabase creado (opcional)
- [ ] Script de migración ejecutado
- [ ] Datos verificados en Supabase
- [ ] Aplicación probada
- [ ] Servidor actualizado (ya está)

---

## 🎯 Próximos Pasos

Después de migrar los datos:

1. **Verificar aplicación:**
   - https://demo-estetica.archivoenlinea.com
   - Iniciar sesión con tus usuarios migrados
   - Verificar que todo funcione

2. **Cambiar passwords:**
   - Los passwords se migran encriptados
   - Deberían funcionar igual

3. **Verificar archivos:**
   - Los archivos en S3 no se migran
   - Solo los registros en la base de datos
   - Los archivos siguen en el mismo S3

4. **Monitorear:**
   - Revisar logs del backend
   - Verificar que no haya errores
   - Monitorear uso de Supabase

---

## 📞 Soporte

Si tienes problemas con la migración:

1. Revisa los logs del script
2. Verifica las credenciales
3. Verifica que PostgreSQL esté corriendo
4. Verifica la conexión a internet
5. Contacta al equipo de desarrollo

---

**¡Buena suerte con la migración!** 🚀

