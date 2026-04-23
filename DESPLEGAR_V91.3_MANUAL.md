# Despliegue Manual v91.3 - Paso a Paso

## Estado Actual

✅ Backend compilado
✅ Tarball creado y subido: `backend-v91.3-dist.tar.gz`
✅ Script de índices subido: `add-performance-indexes.sql`

## Próximos Pasos

### 1. Conectar al Servidor

```powershell
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
```

### 2. Aplicar Índices en Base de Datos

La base de datos está en Supabase, así que necesitamos aplicar los índices de forma diferente.

**Opción A: Desde el servidor (si tiene acceso a Supabase)**

```bash
# Verificar si psql puede conectar a Supabase
psql "postgresql://postgres:%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD@db.witvuzaarlqxkiqfiljq.supabase.co:5432/postgres?sslmode=require" -f /home/ubuntu/add-performance-indexes.sql
```

**Opción B: Desde Supabase Dashboard (RECOMENDADO)**

1. Ir a: https://supabase.com/dashboard/project/witvuzaarlqxkiqfiljq/sql
2. Copiar el contenido de `backend/migrations/add-performance-indexes.sql`
3. Pegar en el SQL Editor
4. Ejecutar

**Opción C: Desde tu máquina local**

```powershell
# Desde el directorio backend
$env:PGPASSWORD="%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD"
psql -h db.witvuzaarlqxkiqfiljq.supabase.co -p 5432 -U postgres -d postgres -f migrations/add-performance-indexes.sql
```

### 3. Desplegar Código en el Servidor

```bash
# Ya conectado al servidor
cd /home/ubuntu/consentimientos_aws/backend

# Crear backup
BACKUP_DIR="dist_backup_v91.3_$(date +%Y%m%d_%H%M%S)"
echo "Creando backup: $BACKUP_DIR"
cp -r dist $BACKUP_DIR

# Extraer nuevo código
echo "Extrayendo nuevo código..."
tar -xzf /home/ubuntu/backend-v91.3-dist.tar.gz

# Verificar que se extrajo correctamente
ls -la dist/

# Reiniciar servicio
echo "Reiniciando servicio PM2..."
pm2 restart datagree

# Esperar a que inicie
sleep 3

# Verificar estado
pm2 status datagree
pm2 logs datagree --lines 30
```

### 4. Verificar Funcionamiento

#### A. Ver Logs en Tiempo Real

```bash
pm2 logs datagree
```

Buscar mensajes:
- ✅ "Application is running on: http://localhost:3000"
- ✅ "Calculating fresh stats..."
- ✅ "Stats calculated in XXXms"

#### B. Probar Dashboard

1. Abrir: https://consentimientos.datagree.co
2. Login como Super Admin
3. Ir al Dashboard
4. Observar tiempo de carga

#### C. Ejecutar Script de Verificación

```bash
cd /home/ubuntu/consentimientos_aws/backend

# Verificación básica
node verify-optimization.js
```

### 5. Verificar Índices Creados

**Desde Supabase Dashboard:**

```sql
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
```

Deberías ver aproximadamente 24 índices.

## Comandos Útiles

### Ver Estado del Servicio

```bash
pm2 status datagree
pm2 info datagree
```

### Ver Logs

```bash
# Logs en tiempo real
pm2 logs datagree

# Últimas 100 líneas
pm2 logs datagree --lines 100

# Solo errores
pm2 logs datagree --err

# Buscar mensajes de stats
pm2 logs datagree | grep -i "stats"
```

### Reiniciar Servicio

```bash
pm2 restart datagree
pm2 reload datagree  # Sin downtime
```

### Ver Uso de Recursos

```bash
pm2 monit
htop
free -h
df -h
```

## Troubleshooting

### Problema: Servicio no inicia

```bash
# Ver logs de error
pm2 logs datagree --err --lines 50

# Intentar iniciar manualmente
cd /home/ubuntu/consentimientos_aws/backend
node dist/main.js
```

### Problema: No se pueden aplicar índices

Si no puedes aplicar los índices desde el servidor, usa Supabase Dashboard:

1. Ir a: https://supabase.com/dashboard/project/witvuzaarlqxkiqfiljq/sql
2. Copiar contenido de `backend/migrations/add-performance-indexes.sql`
3. Ejecutar en SQL Editor

### Problema: Sigue lento

```bash
# Verificar que los índices estén creados
node verify-optimization.js

# Ver logs para identificar el problema
pm2 logs datagree | grep -i "error\|stats"
```

## Rollback (Si es Necesario)

```bash
cd /home/ubuntu/consentimientos_aws/backend

# Listar backups
ls -la | grep dist_backup

# Restaurar desde backup
rm -rf dist
cp -r dist_backup_v91.3_YYYYMMDD_HHMMSS dist

# Reiniciar
pm2 restart datagree
```

## Información de Conexión

**Servidor:** 100.28.198.249
**Usuario:** ubuntu
**Llave:** AWS-ISSABEL.pem
**Path Backend:** /home/ubuntu/consentimientos_aws/backend
**Proceso PM2:** datagree

**Base de Datos (Supabase):**
- Host: db.witvuzaarlqxkiqfiljq.supabase.co
- Port: 5432
- Database: postgres
- User: postgres
- Password: %6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD

**Supabase Dashboard:**
https://supabase.com/dashboard/project/witvuzaarlqxkiqfiljq

## Checklist

- [ ] Conectar al servidor
- [ ] Aplicar índices en Supabase
- [ ] Verificar índices creados (24 esperados)
- [ ] Crear backup del código actual
- [ ] Extraer nuevo código
- [ ] Reiniciar servicio PM2
- [ ] Verificar que el servicio esté online
- [ ] Ver logs (buscar "Calculating fresh stats")
- [ ] Probar dashboard de Super Admin
- [ ] Verificar tiempo de carga (< 2 segundos)
- [ ] Ejecutar script de verificación
- [ ] Monitorear por 30 minutos

## Resultados Esperados

- ⏱️ Primera carga del dashboard: 500ms - 2 segundos
- ⏱️ Cargas subsecuentes: < 10ms (desde caché)
- 📊 24 índices creados en base de datos
- ✅ Servicio PM2 online y estable
- 📝 Logs mostrando "Stats calculated in XXXms"

---

**Siguiente paso:** Conectar al servidor y seguir los pasos arriba.
