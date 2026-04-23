# 🚀 DESPLEGAR v91.3 - Optimización Dashboard

## ✅ Estado: LISTO PARA DESPLEGAR

Todos los archivos están compilados y listos para producción.

## 📦 Archivos Preparados

- ✅ `backend-v91.3-dist.tar.gz` (4.65 MB) - Código compilado
- ✅ `backend/migrations/add-performance-indexes.sql` - Script de índices
- ✅ `scripts/deploy-v91.3-optimization.ps1` - Script de despliegue
- ✅ `backend/verify-optimization.js` - Script de verificación

## 🎯 Opción 1: Despliegue Automatizado (RECOMENDADO)

```powershell
.\scripts\deploy-v91.3-optimization.ps1
```

Este script hace TODO automáticamente:
1. ✅ Compila el backend
2. ✅ Crea tarball
3. ✅ Sube archivos al servidor
4. ✅ Aplica índices en base de datos
5. ✅ Despliega código
6. ✅ Reinicia servicio PM2
7. ✅ Verifica estado

**Tiempo estimado: 3-5 minutos**

## 🔧 Opción 2: Despliegue Manual

### Paso 1: Subir Archivos

```powershell
# Subir tarball
scp -i AWS-ISSABEL.pem backend-v91.3-dist.tar.gz ubuntu@100.28.198.249:/home/ubuntu/

# Subir script de índices
scp -i AWS-ISSABEL.pem backend/migrations/add-performance-indexes.sql ubuntu@100.28.198.249:/home/ubuntu/
```

### Paso 2: Conectar al Servidor

```powershell
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
```

### Paso 3: Aplicar Índices (IMPORTANTE)

```bash
# Aplicar índices de performance
sudo -u postgres psql -d consentimientos_db -f /home/ubuntu/add-performance-indexes.sql

# Verificar que se aplicaron
sudo -u postgres psql -d consentimientos_db -c "SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE 'idx_%';"
```

Deberías ver aproximadamente 24 índices.

### Paso 4: Desplegar Código

```bash
cd /home/ubuntu/consentimientos_aws/backend

# Crear backup
BACKUP_DIR="dist_backup_v91.3_$(date +%Y%m%d_%H%M%S)"
echo "Creando backup: $BACKUP_DIR"
cp -r dist $BACKUP_DIR

# Extraer nuevo código
tar -xzf /home/ubuntu/backend-v91.3-dist.tar.gz

# Reiniciar servicio
pm2 restart datagree

# Verificar estado
pm2 status datagree
pm2 logs datagree --lines 30
```

## ✅ Verificación Post-Despliegue

### 1. Verificar Servicio

```bash
pm2 status datagree
```

Debería mostrar:
- Status: `online`
- Uptime: Recién reiniciado
- CPU/Memory: Normal

### 2. Ver Logs

```bash
pm2 logs datagree --lines 50
```

Buscar mensajes:
- ✅ "Application is running on: http://localhost:3000"
- ✅ "Calculating fresh stats..."
- ✅ "Stats calculated in XXXms"

### 3. Probar Dashboard

1. Abrir: https://consentimientos.datagree.co
2. Login como Super Admin
3. Ir al Dashboard
4. **Primera carga**: Debería cargar en < 2 segundos
5. **Recargar página**: Debería ser instantáneo (caché)

### 4. Script de Verificación Completo

```bash
cd /home/ubuntu/consentimientos_aws/backend

# Verificación básica (sin token)
node verify-optimization.js

# Verificación completa (con token de Super Admin)
SUPER_ADMIN_TOKEN=tu_token_aqui node verify-optimization.js
```

El script verifica:
- ✅ Índices creados (24 esperados)
- ✅ Endpoint funciona
- ✅ Tiempo de respuesta < 2s
- ✅ Caché funciona correctamente
- ✅ Estadísticas de base de datos

## 📊 Resultados Esperados

### Antes de v91.3:
- ⏱️ Tiempo de carga: 5-15 segundos
- 🔍 Consultas: 30-50 queries
- 💾 Memoria: Alta
- 😞 Experiencia: Frustrante

### Después de v91.3:
- ⏱️ Primera carga: 500ms - 2 segundos ⚡
- ⏱️ Cargas subsecuentes: < 10ms (caché) 🚀
- 🔍 Consultas: 8 queries paralelas
- 💾 Memoria: Baja
- 😊 Experiencia: Excelente

**Mejora: 10-30x más rápido** 🎉

## 🔍 Monitoreo Continuo

### Ver Logs en Tiempo Real

```bash
pm2 logs datagree
```

### Buscar Mensajes de Stats

```bash
pm2 logs datagree | grep -i "stats"
```

Deberías ver:
```
Calculating fresh stats...
Stats calculated in 850ms
Returning cached stats (age: 45s)
Returning cached stats (age: 120s)
Calculating fresh stats...  # Después de 5 minutos
Stats calculated in 920ms
```

### Verificar Uso de Índices

```bash
sudo -u postgres psql -d consentimientos_db
```

```sql
-- Ver índices más utilizados
SELECT 
  indexname,
  idx_scan as scans,
  idx_tup_read as tuples_read
FROM pg_stat_user_indexes
WHERE indexname LIKE 'idx_%'
ORDER BY idx_scan DESC
LIMIT 10;
```

## 🆘 Troubleshooting

### Problema: "Servicio no inicia"

```bash
# Ver logs de error
pm2 logs datagree --err

# Verificar sintaxis
cd /home/ubuntu/consentimientos_aws/backend
node dist/main.js
```

### Problema: "Sigue lento"

```bash
# Verificar que los índices estén creados
node verify-optimization.js

# Ver queries lentas
sudo -u postgres psql -d consentimientos_db -c "SELECT query, mean_exec_time FROM pg_stat_statements WHERE query LIKE '%tenants%' ORDER BY mean_exec_time DESC LIMIT 5;"
```

### Problema: "Caché no funciona"

```bash
# Verificar logs
pm2 logs datagree | grep -i "cache\|stats"

# El caché se pierde al reiniciar (esto es normal)
# Debería aparecer "Returning cached stats" después de la primera carga
```

## 🔄 Rollback (Si es Necesario)

### Revertir Código

```bash
cd /home/ubuntu/consentimientos_aws/backend

# Listar backups disponibles
ls -la | grep dist_backup

# Restaurar desde backup
cp -r dist_backup_v91.3_YYYYMMDD_HHMMSS/* dist/

# Reiniciar
pm2 restart datagree
```

### Eliminar Índices

```bash
sudo -u postgres psql -d consentimientos_db
```

```sql
-- Eliminar todos los índices de optimización
DROP INDEX IF EXISTS idx_tenants_status;
DROP INDEX IF EXISTS idx_tenants_plan;
DROP INDEX IF EXISTS idx_tenants_created_at;
-- ... (ver lista completa en add-performance-indexes.sql)
```

## 📚 Documentación Adicional

- `OPTIMIZACION_DASHBOARD_V91.3.md` - Documentación técnica completa
- `RESUMEN_OPTIMIZACION_V91.3.md` - Resumen ejecutivo
- `backend/migrations/add-performance-indexes.sql` - Script de índices
- `backend/verify-optimization.js` - Script de verificación

## ✨ Características Implementadas

### 1. Índices de Base de Datos (24 total)
- Tenants: status, plan, created_at, compuestos
- Medical Records: status, tenant_id, created_at, compuestos
- Clients: tenant_id, created_at, compuestos
- Consents: tenant_id, created_at, compuestos
- Users, Branches, Services, Templates, Invoices

### 2. Consultas Optimizadas
- Agregaciones con GROUP BY
- CASE WHEN para múltiples conteos
- Joins optimizados
- Filtros en SQL (no en JavaScript)

### 3. Ejecución Paralela
- Promise.all() para consultas simultáneas
- 8 consultas en paralelo
- Tiempo = consulta más lenta (no suma)

### 4. Sistema de Caché
- TTL de 5 minutos
- Caché en memoria
- Invalidación automática
- Logs de uso de caché

### 5. Código Modularizado
- 9 métodos privados
- Fácil de mantener
- Fácil de testear
- Mejor manejo de errores

## 🎯 Próximos Pasos

1. ✅ Desplegar en producción
2. ✅ Verificar funcionamiento
3. ✅ Monitorear logs
4. ✅ Confirmar mejora de performance
5. ✅ Documentar resultados reales

## 📞 Soporte

Si encuentras algún problema:

1. Revisa los logs: `pm2 logs datagree`
2. Ejecuta verificación: `node verify-optimization.js`
3. Revisa documentación técnica: `OPTIMIZACION_DASHBOARD_V91.3.md`
4. Considera rollback si es crítico

---

**¿Listo para desplegar?** 🚀

Ejecuta:
```powershell
.\scripts\deploy-v91.3-optimization.ps1
```

O sigue los pasos manuales arriba.

**Tiempo estimado total: 5-10 minutos**
