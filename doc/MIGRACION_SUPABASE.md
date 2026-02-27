# 🚀 Guía de Migración a Supabase

**Fecha:** 2026-02-26  
**Versión:** 42.1.2  
**Estado:** ⏳ PENDIENTE - Esperando credenciales

---

## 📋 Objetivo

Migrar la base de datos de AWS RDS PostgreSQL a Supabase para:
- ✅ Separar la base de datos de la máquina AWS
- ✅ Mejor rendimiento y gestión
- ✅ Backups automáticos
- ✅ Interfaz web para administración
- ✅ Escalabilidad mejorada

---

## 🎯 Paso 1: Crear Proyecto en Supabase

### 1.1 Registro y Creación

1. Ve a https://supabase.com
2. Crea una cuenta o inicia sesión
3. Click en "New Project"
4. Completa la información:

```
Organization: [Tu organización]
Project Name: consentimientos-prod
Database Password: [Genera una contraseña segura]
Region: South America (São Paulo) - sa-east-1
Pricing Plan: Pro ($25/mes) - Recomendado para producción
```

### 1.2 ¿Por qué São Paulo?

- ✅ Menor latencia desde Colombia
- ✅ Cumplimiento de regulaciones de datos en Latinoamérica
- ✅ Mejor rendimiento para usuarios colombianos

### 1.3 Planes Disponibles

| Plan | Precio | Base de Datos | Backups | Soporte |
|------|--------|---------------|---------|---------|
| Free | $0/mes | 500 MB | No | Comunidad |
| Pro | $25/mes | 8 GB | Diarios | Email |
| Team | $599/mes | 100 GB | Point-in-time | Prioritario |

**Recomendación:** Plan Pro para producción

---

## 🔑 Paso 2: Obtener Credenciales de Conexión

### 2.1 Acceder a la Configuración

1. En tu proyecto de Supabase, ve a **Settings** (⚙️)
2. Click en **Database**
3. Busca la sección **Connection Info**

### 2.2 Información de Conexión

Encontrarás dos tipos de conexión:

#### A) Conexión Directa (Puerto 5432)
```
Host: db.[project-ref].supabase.co
Port: 5432
Database: postgres
User: postgres
Password: [tu-password]
```

**Uso:** Desarrollo local, migraciones, scripts

#### B) Connection Pooling (Puerto 6543) - RECOMENDADO
```
Host: db.[project-ref].supabase.co
Port: 6543
Database: postgres
User: postgres
Password: [tu-password]
```

**Uso:** Producción, aplicaciones con múltiples conexiones

### 2.3 Connection String

Supabase también proporciona una connection string completa:

```
postgresql://postgres:[password]@db.[project-ref].supabase.co:6543/postgres
```

---

## 📝 Paso 3: Actualizar Configuración del Backend

### 3.1 Actualizar `.env` Local

```env
# Database - Supabase
DB_HOST=db.[project-ref].supabase.co
DB_PORT=6543
DB_USERNAME=postgres
DB_PASSWORD=[tu-password-de-supabase]
DB_DATABASE=postgres
DB_SSL=true
```

### 3.2 Actualizar `.env` en Servidor AWS

```bash
# Conectar al servidor
ssh -i credentials/AWS-ISSABEL.pem ubuntu@100.28.198.249

# Editar .env del backend
cd /home/ubuntu/consentimientos_aws/backend
nano .env
```

Actualizar las variables:
```env
DB_HOST=db.[project-ref].supabase.co
DB_PORT=6543
DB_USERNAME=postgres
DB_PASSWORD=[tu-password-de-supabase]
DB_DATABASE=postgres
DB_SSL=true
```

### 3.3 Verificar Configuración SSL

El archivo `backend/src/config/database.config.ts` ya está configurado para SSL:

```typescript
ssl: dbSsl ? { rejectUnauthorized: false } : false,
```

Esto es correcto para Supabase.

---

## 🗄️ Paso 4: Migrar Datos (Opcional)

### Opción A: Empezar con Base de Datos Limpia

Si quieres empezar desde cero:

1. Las migraciones de TypeORM crearán todas las tablas automáticamente
2. Tendrás que crear el usuario super admin nuevamente
3. Los tenants y datos se crearán desde cero

**Ventajas:**
- ✅ Base de datos limpia
- ✅ Sin datos de prueba
- ✅ Más rápido

**Desventajas:**
- ❌ Pierdes datos existentes
- ❌ Hay que reconfigurar todo

### Opción B: Migrar Datos Existentes

Si quieres mantener los datos actuales:

#### 4.1 Exportar desde AWS RDS

```bash
# En tu máquina local
pg_dump -h ls-453b766db06e3f7769f28bbba2b592645e6b80c7.cs1dsnlrlh7h.us-east-1.rds.amazonaws.com \
  -U archivoenlinea \
  -d archivoenlinea \
  -F c \
  -f backup_aws_rds.dump

# O en formato SQL
pg_dump -h ls-453b766db06e3f7769f28bbba2b592645e6b80c7.cs1dsnlrlh7h.us-east-1.rds.amazonaws.com \
  -U archivoenlinea \
  -d archivoenlinea \
  -f backup_aws_rds.sql
```

#### 4.2 Importar a Supabase

```bash
# Formato custom
pg_restore -h db.[project-ref].supabase.co \
  -U postgres \
  -d postgres \
  -p 5432 \
  backup_aws_rds.dump

# Formato SQL
psql -h db.[project-ref].supabase.co \
  -U postgres \
  -d postgres \
  -p 5432 \
  -f backup_aws_rds.sql
```

#### 4.3 Script de Migración Automatizado

Crear archivo `scripts/migration/migrate-to-supabase.sh`:

```bash
#!/bin/bash

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "🚀 Iniciando migración a Supabase..."

# Variables
AWS_HOST="ls-453b766db06e3f7769f28bbba2b592645e6b80c7.cs1dsnlrlh7h.us-east-1.rds.amazonaws.com"
AWS_USER="archivoenlinea"
AWS_DB="archivoenlinea"

SUPABASE_HOST="db.[project-ref].supabase.co"
SUPABASE_USER="postgres"
SUPABASE_DB="postgres"

BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"

# 1. Exportar desde AWS RDS
echo "📦 Exportando datos desde AWS RDS..."
PGPASSWORD="8K\`=Yt|Qm2HHilf^}{(r=6I_\$auA.k2g" pg_dump \
  -h $AWS_HOST \
  -U $AWS_USER \
  -d $AWS_DB \
  -f $BACKUP_FILE

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Exportación exitosa${NC}"
else
  echo -e "${RED}❌ Error en exportación${NC}"
  exit 1
fi

# 2. Importar a Supabase
echo "📥 Importando datos a Supabase..."
PGPASSWORD="[tu-password-supabase]" psql \
  -h $SUPABASE_HOST \
  -U $SUPABASE_USER \
  -d $SUPABASE_DB \
  -p 5432 \
  -f $BACKUP_FILE

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Importación exitosa${NC}"
else
  echo -e "${RED}❌ Error en importación${NC}"
  exit 1
fi

echo "🎉 Migración completada"
```

---

## 🧪 Paso 5: Probar Conexión

### 5.1 Desde Local

```bash
cd backend
npm run start:dev
```

Verifica en los logs:
```
✅ Database connected successfully
```

### 5.2 Probar Endpoints

```bash
# Health check
curl http://localhost:3000/api/health/detailed

# Debería mostrar:
# "database": { "status": "operational" }
```

### 5.3 Desde Servidor AWS

```bash
# Conectar al servidor
ssh -i credentials/AWS-ISSABEL.pem ubuntu@100.28.198.249

# Reiniciar backend
cd /home/ubuntu/consentimientos_aws/backend
pm2 restart datagree

# Ver logs
pm2 logs datagree --lines 50
```

Buscar en los logs:
```
✅ Database connected successfully
```

---

## 🔧 Paso 6: Ejecutar Migraciones

Si empiezas con base de datos limpia:

### 6.1 Desde Local

```bash
cd backend

# Ejecutar migraciones
npm run migration:run

# Verificar que se crearon las tablas
npm run migration:show
```

### 6.2 Crear Super Admin

```bash
# Ejecutar script de seed
node backend/database/scripts/seed-simple.sql
```

O crear manualmente desde Supabase:

1. Ve a **Table Editor** en Supabase
2. Abre la tabla `users`
3. Click en **Insert row**
4. Completa los datos del super admin

---

## 📊 Paso 7: Verificar en Supabase

### 7.1 Table Editor

1. Ve a **Table Editor** en Supabase
2. Verifica que existan todas las tablas:
   - users
   - tenants
   - roles
   - permissions
   - consents
   - medical_records
   - etc.

### 7.2 SQL Editor

Ejecuta queries de verificación:

```sql
-- Contar usuarios
SELECT COUNT(*) FROM users;

-- Contar tenants
SELECT COUNT(*) FROM tenants;

-- Ver super admin
SELECT * FROM users WHERE email = 'rcaraballo@innovasystems.com.co';
```

### 7.3 Database Health

1. Ve a **Database** → **Health**
2. Verifica:
   - ✅ CPU usage
   - ✅ Memory usage
   - ✅ Disk usage
   - ✅ Connection count

---

## 🔒 Paso 8: Seguridad

### 8.1 Configurar IP Whitelist (Opcional)

Si quieres restringir acceso solo desde tu servidor AWS:

1. Ve a **Settings** → **Database**
2. Busca **Network Restrictions**
3. Agrega la IP de tu servidor AWS: `100.28.198.249`

### 8.2 Rotar Contraseña

Si necesitas cambiar la contraseña:

1. Ve a **Settings** → **Database**
2. Click en **Reset database password**
3. Actualiza el `.env` con la nueva contraseña

### 8.3 Habilitar Row Level Security (RLS)

Supabase recomienda habilitar RLS para mayor seguridad:

```sql
-- Habilitar RLS en tablas sensibles
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
```

**Nota:** Esto puede requerir configuración adicional de políticas.

---

## 📈 Paso 9: Monitoreo

### 9.1 Dashboard de Supabase

Monitorea en tiempo real:
- Conexiones activas
- Queries por segundo
- Uso de CPU/RAM
- Tamaño de base de datos

### 9.2 Alertas

Configura alertas para:
- Uso de disco > 80%
- Conexiones > 90% del límite
- Queries lentas > 5 segundos

---

## 🔄 Paso 10: Rollback (Si algo sale mal)

Si necesitas volver a AWS RDS:

```bash
# 1. Editar .env
DB_HOST=ls-453b766db06e3f7769f28bbba2b592645e6b80c7.cs1dsnlrlh7h.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_USERNAME=archivoenlinea
DB_PASSWORD=8K`=Yt|Qm2HHilf^}{(r=6I_$auA.k2g
DB_DATABASE=archivoenlinea
DB_SSL=true

# 2. Reiniciar backend
pm2 restart datagree
```

---

## ✅ Checklist de Migración

- [ ] Crear proyecto en Supabase
- [ ] Obtener credenciales de conexión
- [ ] Actualizar `.env` local
- [ ] Probar conexión desde local
- [ ] Decidir: ¿Migrar datos o empezar limpio?
- [ ] Si migrar: Exportar desde AWS RDS
- [ ] Si migrar: Importar a Supabase
- [ ] Ejecutar migraciones (si base limpia)
- [ ] Crear super admin (si base limpia)
- [ ] Verificar tablas en Supabase
- [ ] Actualizar `.env` en servidor AWS
- [ ] Reiniciar backend en servidor
- [ ] Probar aplicación completa
- [ ] Verificar logs
- [ ] Configurar monitoreo
- [ ] Configurar backups
- [ ] Documentar credenciales

---

## 📞 Información Necesaria del Usuario

Para continuar con la migración, necesito:

1. **Credenciales de Supabase:**
   ```
   Host: db.[project-ref].supabase.co
   Port: 6543 (connection pooling)
   Database: postgres
   User: postgres
   Password: [tu-password]
   ```

2. **Decisión sobre datos:**
   - ¿Quieres migrar los datos existentes?
   - ¿O prefieres empezar con base de datos limpia?

3. **Plan de Supabase:**
   - ¿Free ($0) o Pro ($25/mes)?
   - Recomiendo Pro para producción

---

## 🔗 Referencias

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Database](https://supabase.com/docs/guides/database)
- [Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Migrating to Supabase](https://supabase.com/docs/guides/migrations)

---

## 📝 Próximos Pasos

1. **Usuario:** Crear proyecto en Supabase y proporcionar credenciales
2. **Desarrollador:** Actualizar configuración y probar conexión
3. **Usuario:** Decidir sobre migración de datos
4. **Desarrollador:** Ejecutar migración o setup inicial
5. **Ambos:** Verificar y probar aplicación completa
