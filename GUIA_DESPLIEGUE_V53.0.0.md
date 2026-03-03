# 🚀 Guía de Despliegue v53.0.0 - Consolidación del Sistema de Perfiles

**Fecha:** 2026-03-02  
**Versión:** 53.0.0  
**Estado:** ✅ LISTO PARA DESPLIEGUE

---

## 📋 Índice

1. [Pre-requisitos](#pre-requisitos)
2. [Backup de Seguridad](#backup-de-seguridad)
3. [Despliegue Automático](#despliegue-automático)
4. [Despliegue Manual](#despliegue-manual)
5. [Verificación Post-Despliegue](#verificación-post-despliegue)
6. [Rollback](#rollback)
7. [Troubleshooting](#troubleshooting)

---

## 🔧 Pre-requisitos

### En tu Máquina Local

- [x] Node.js v18+ instalado
- [x] npm instalado
- [x] Git Bash o WSL (para Windows)
- [x] Acceso SSH al servidor
- [x] Clave SSH: `credentials/AWS-ISSABEL.pem`

### En el Servidor

- [x] Ubuntu Server
- [x] Node.js v18+ instalado
- [x] PM2 instalado
- [x] PostgreSQL corriendo
- [x] Aplicación actual funcionando

### Verificación de Acceso

```bash
# Probar conexión SSH
ssh -i credentials/AWS-ISSABEL.pem ubuntu@100.28.198.249

# Verificar PM2
pm2 status

# Verificar PostgreSQL
psql -U postgres -d consentimientos -c "SELECT version();"
```

---

## 💾 Backup de Seguridad

### IMPORTANTE: Realizar ANTES del despliegue

#### 1. Backup de Base de Datos

```bash
# Conectar al servidor
ssh -i credentials/AWS-ISSABEL.pem ubuntu@100.28.198.249

# Crear backup
cd /home/ubuntu/backups
pg_dump -h localhost -U postgres -d consentimientos > backup_pre_v53_$(date +%Y%m%d_%H%M%S).sql

# Verificar backup
ls -lh backup_pre_v53_*.sql

# Comprimir backup
gzip backup_pre_v53_*.sql
```

#### 2. Backup de Código Actual

```bash
# En el servidor
cd /home/ubuntu/consentimientos_aws
tar -czf backend_backup_pre_v53_$(date +%Y%m%d_%H%M%S).tar.gz backend/

# Mover a carpeta de backups
mv backend_backup_pre_v53_*.tar.gz /home/ubuntu/backups/
```

#### 3. Verificar Backups

```bash
# Listar backups
ls -lh /home/ubuntu/backups/

# Deberías ver:
# - backup_pre_v53_YYYYMMDD_HHMMSS.sql.gz
# - backend_backup_pre_v53_YYYYMMDD_HHMMSS.tar.gz
```

---

## 🚀 Despliegue Automático

### Opción A: Script de PowerShell (Windows)

```powershell
# Navegar a la carpeta deploy
cd deploy

# Ejecutar script
.\deploy-backend-v53.0.0.ps1
```

### Opción B: Script de Bash (Linux/Mac/Git Bash)

```bash
# Navegar a la carpeta deploy
cd deploy

# Dar permisos de ejecución
chmod +x deploy-backend-v53.0.0.sh

# Ejecutar script
./deploy-backend-v53.0.0.sh
```

### Salida Esperada

```
==========================================
🚀 DESPLIEGUE BACKEND v53.0.0
Consolidación del Sistema de Perfiles
==========================================

📋 Configuración:
   Versión: 53.0.0
   Servidor: ubuntu@100.28.198.249
   Ruta: /home/ubuntu/consentimientos_aws/backend

📦 Paso 1: Compilando backend...
✅ Compilación exitosa

📦 Paso 2: Creando paquete de despliegue...
✅ Paquete creado: backend-dist-v53.0.0.tar.gz

📤 Paso 3: Subiendo paquete al servidor...
✅ Paquete subido exitosamente

🚀 Paso 4: Desplegando en servidor...
✅ Despliegue exitoso

🔄 Paso 5: Ejecutando migración de usuarios...
✅ Migración de usuarios completada

🔄 Paso 6: Reiniciando aplicación...
✅ Aplicación reiniciada exitosamente

📋 Paso 7: Verificando logs...
[Logs de la aplicación]

🗑️  Paso 8: Limpiando archivos temporales...
✅ Archivos temporales eliminados

==========================================
✅ DESPLIEGUE COMPLETADO EXITOSAMENTE
==========================================
```

---

## 🔧 Despliegue Manual

Si prefieres hacer el despliegue paso a paso:

### Paso 1: Compilar Backend

```bash
cd backend
npm run build
```

### Paso 2: Crear Paquete

```bash
tar -czf backend-dist-v53.0.0.tar.gz \
    dist/ \
    node_modules/ \
    package.json \
    ecosystem.config.js \
    polyfill.js \
    .env \
    migrate-users-to-profiles.js
```

### Paso 3: Subir al Servidor

```bash
scp -i ../credentials/AWS-ISSABEL.pem \
    backend-dist-v53.0.0.tar.gz \
    ubuntu@100.28.198.249:/home/ubuntu/
```

### Paso 4: Conectar al Servidor

```bash
ssh -i credentials/AWS-ISSABEL.pem ubuntu@100.28.198.249
```

### Paso 5: Desplegar

```bash
# Navegar al directorio
cd /home/ubuntu/consentimientos_aws/backend

# Detener aplicación
pm2 stop datagree

# Extraer paquete
tar -xzf ~/backend-dist-v53.0.0.tar.gz

# Limpiar paquete temporal
rm ~/backend-dist-v53.0.0.tar.gz
```

### Paso 6: Ejecutar Migración

```bash
# Ejecutar script de migración
node migrate-users-to-profiles.js
```

**Salida esperada:**
```
🚀 Iniciando migración de usuarios a perfiles...
✅ Conectado a la base de datos
✅ Todos los roles tienen perfil correspondiente
✅ Migración completada: X usuarios actualizados
✅ Todos los usuarios tienen perfil asignado
```

### Paso 7: Reiniciar Aplicación

```bash
# Reiniciar PM2
pm2 restart datagree

# Guardar configuración
pm2 save

# Verificar estado
pm2 status
```

### Paso 8: Verificar Logs

```bash
# Ver logs en tiempo real
pm2 logs datagree

# Ver últimas 50 líneas
pm2 logs datagree --lines 50

# Ver solo errores
pm2 logs datagree --err
```

---

## ✅ Verificación Post-Despliegue

### 1. Verificar Estado de la Aplicación

```bash
# En el servidor
pm2 status

# Debería mostrar:
# datagree | online | 0 | ...
```

### 2. Verificar Logs

```bash
pm2 logs datagree --lines 50 --nostream

# Buscar:
# ✅ "Application is running"
# ✅ "Database connected"
# ❌ No debe haber errores
```

### 3. Probar Endpoints

#### Login
```bash
curl -X POST https://api.datagree.co/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@datagree.co",
    "password": "tu_password"
  }'
```

#### Health Check
```bash
curl https://api.datagree.co/api/health
```

### 4. Verificar Permisos

```bash
# Conectar a la base de datos
psql -U postgres -d consentimientos

# Verificar usuarios con perfiles
SELECT 
  u.email,
  u.name,
  p.name as profile_name,
  p.code as profile_code
FROM users u
LEFT JOIN profiles p ON p.id = u.profile_id
WHERE u.deleted_at IS NULL
ORDER BY u.email;

# Todos los usuarios deben tener profile_id
```

### 5. Probar en el Frontend

1. Acceder a https://app.datagree.co
2. Iniciar sesión con diferentes roles:
   - Super Admin
   - Admin General
   - Operador
3. Verificar que los permisos funcionan correctamente
4. Probar crear/editar/eliminar recursos

---

## 🔄 Rollback

Si algo sale mal, puedes hacer rollback:

### Opción 1: Rollback Rápido (Código)

```bash
# En el servidor
cd /home/ubuntu/consentimientos_aws

# Detener aplicación
pm2 stop datagree

# Restaurar backup
tar -xzf /home/ubuntu/backups/backend_backup_pre_v53_*.tar.gz

# Reiniciar
pm2 restart datagree
```

### Opción 2: Rollback Completo (Código + Base de Datos)

```bash
# Restaurar código (ver Opción 1)

# Restaurar base de datos
cd /home/ubuntu/backups
gunzip backup_pre_v53_*.sql.gz

# Conectar a PostgreSQL
psql -U postgres

# Eliminar base de datos actual
DROP DATABASE consentimientos;
CREATE DATABASE consentimientos;

# Restaurar backup
\c consentimientos
\i backup_pre_v53_*.sql

# Salir
\q

# Reiniciar aplicación
pm2 restart datagree
```

---

## 🔍 Troubleshooting

### Problema: Compilación Falla

**Síntoma:**
```
npm run build
Error: ...
```

**Solución:**
```bash
# Limpiar node_modules
rm -rf node_modules package-lock.json

# Reinstalar dependencias
npm install

# Intentar compilar de nuevo
npm run build
```

### Problema: Error al Subir Paquete

**Síntoma:**
```
scp: Permission denied
```

**Solución:**
```bash
# Verificar permisos de la clave
chmod 400 credentials/AWS-ISSABEL.pem

# Verificar conexión
ssh -i credentials/AWS-ISSABEL.pem ubuntu@100.28.198.249
```

### Problema: Migración Falla

**Síntoma:**
```
❌ Error durante la migración
```

**Solución:**
```bash
# Verificar conexión a base de datos
psql -U postgres -d consentimientos -c "SELECT 1;"

# Verificar que existen las tablas
psql -U postgres -d consentimientos -c "\dt"

# Ejecutar migración con más detalle
node migrate-users-to-profiles.js 2>&1 | tee migration.log
```

### Problema: Aplicación No Inicia

**Síntoma:**
```
pm2 status
datagree | errored | 0 | ...
```

**Solución:**
```bash
# Ver logs de error
pm2 logs datagree --err --lines 100

# Verificar variables de entorno
cat .env

# Verificar que PostgreSQL está corriendo
sudo systemctl status postgresql

# Reiniciar aplicación
pm2 restart datagree
```

### Problema: Error 403 en Endpoints

**Síntoma:**
```
{"statusCode":403,"message":"No tienes permisos..."}
```

**Solución:**
```bash
# Verificar que la migración se ejecutó
psql -U postgres -d consentimientos -c "
SELECT COUNT(*) as users_with_profile
FROM users
WHERE profile_id IS NOT NULL
AND deleted_at IS NULL;
"

# Si hay usuarios sin perfil, ejecutar migración de nuevo
node migrate-users-to-profiles.js
```

---

## 📊 Checklist de Despliegue

### Pre-Despliegue
- [ ] Backup de base de datos creado
- [ ] Backup de código creado
- [ ] Backups verificados
- [ ] Equipo notificado
- [ ] Ventana de mantenimiento programada

### Durante el Despliegue
- [ ] Backend compilado exitosamente
- [ ] Paquete creado
- [ ] Paquete subido al servidor
- [ ] Aplicación detenida
- [ ] Código desplegado
- [ ] Migración ejecutada
- [ ] Aplicación reiniciada

### Post-Despliegue
- [ ] PM2 status OK
- [ ] Logs sin errores
- [ ] Endpoints responden
- [ ] Login funciona
- [ ] Permisos funcionan
- [ ] Frontend funciona
- [ ] Usuarios pueden acceder
- [ ] Equipo notificado

---

## 📞 Contacto y Soporte

Si encuentras problemas durante el despliegue:

1. Revisar logs: `pm2 logs datagree`
2. Consultar esta guía de troubleshooting
3. Hacer rollback si es necesario
4. Documentar el problema
5. Contactar al equipo de desarrollo

---

## 📝 Notas Importantes

### Compatibilidad

El sistema mantiene compatibilidad con ambos sistemas (role y profile) durante la transición. Esto significa:

- ✅ Los usuarios existentes seguirán funcionando
- ✅ El sistema verifica ambos: role.code y profile.code
- ✅ No hay pérdida de funcionalidad
- ✅ Rollback es seguro

### Tiempo de Inactividad

El despliegue requiere aproximadamente:

- **Detener aplicación:** 10 segundos
- **Desplegar código:** 30 segundos
- **Ejecutar migración:** 10 segundos
- **Reiniciar aplicación:** 20 segundos
- **Total:** ~1-2 minutos

### Monitoreo Post-Despliegue

Monitorear durante las primeras 24 horas:

- Logs de errores
- Tiempo de respuesta
- Uso de memoria
- Uso de CPU
- Accesos de usuarios
- Errores de permisos

---

**Documento creado por:** Kiro AI Assistant  
**Fecha:** 2026-03-02  
**Versión:** 1.0  
**Estado:** ✅ LISTO PARA DESPLIEGUE
