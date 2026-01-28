# ✅ Despliegue a Producción - TODO LISTO

## Resumen Ejecutivo

**Estado:** ✅ LISTO PARA DESPLEGAR  
**Fecha:** 2026-01-27  
**Versión:** 15.1.3

Todo está preparado para desplegar la aplicación DatAgree en producción de forma completamente automatizada.

---

## 🎯 Lo Que Se Ha Preparado

### 1. Scripts de Despliegue Automatizado ✅
- `deploy-master.ps1` - Script maestro que ejecuta todo
- `setup-production-server.ps1` - Configura servidor desde cero
- `deploy-production-complete.ps1` - Despliega/actualiza aplicación
- `configure-nginx-ssl.sh` - Configura Nginx con SSL
- `pre-deployment-check.ps1` - Verifica que todo esté listo

### 2. Credenciales AWS Configuradas ✅
- **Lightsail:** Ver CREDENCIALES.md (configurado en scripts)
- **S3:** Ver CREDENCIALES.md (configurado en .env)
- **Región:** us-east-1

### 3. Configuración de Servicios ✅
- **Base de datos:** PostgreSQL (se crea automáticamente)
- **Email:** Gmail SMTP (configurado)
- **Storage:** AWS S3 (configurado)
- **Pagos:** Bold Colombia (configurado en sandbox)

### 4. Documentación Completa ✅
- `doc/DESPLIEGUE_AUTOMATIZADO.md` - Guía de despliegue automatizado
- `scripts/README.md` - Documentación de scripts
- `DEPLOYMENT.md` - Guía completa de despliegue
- `doc/VERIFICACION_INTEGRACION_BOLD.md` - Integración de pagos

---

## 🚀 Cómo Desplegar (3 Pasos)

### PASO 1: Verificar Pre-requisitos
```powershell
.\scripts\pre-deployment-check.ps1
```

### PASO 2: Ejecutar Despliegue
```powershell
.\scripts\deploy-master.ps1 -All
```

### PASO 3: Verificar
```powershell
curl https://archivoenlinea.com/api/health
```

**¡Eso es todo!** El script hace el resto automáticamente.

---

## 📦 Lo Que el Script Hace Automáticamente

### Configuración del Servidor
- ✅ Crea/verifica instancia de Lightsail
- ✅ Instala Node.js 18.x
- ✅ Instala PostgreSQL 14
- ✅ Instala Nginx
- ✅ Instala PM2
- ✅ Configura firewall

### Base de Datos
- ✅ Crea usuario `admin`
- ✅ Crea base de datos `consentimientos`
- ✅ Genera contraseña segura
- ✅ Configura permisos

### Aplicación
- ✅ Clona repositorio
- ✅ Instala dependencias
- ✅ Compila backend y frontend
- ✅ Ejecuta migraciones
- ✅ Configura PM2
- ✅ Inicia aplicación

### Nginx y SSL
- ✅ Configura reverse proxy
- ✅ Obtiene certificado SSL (Let's Encrypt)
- ✅ Configura renovación automática
- ✅ Optimiza configuración
- ✅ Habilita HTTPS

### Seguridad
- ✅ Genera JWT secret
- ✅ Configura headers de seguridad
- ✅ Habilita HTTPS obligatorio
- ✅ Configura firewall

---

## 🔑 Credenciales Generadas Automáticamente

El script genera y guarda:
- Contraseña de base de datos
- JWT Secret
- Archivo .env completo

**Ubicación:** `server_credentials_YYYYMMDD_HHMMSS.txt`

⚠️ **IMPORTANTE:** Guarda este archivo de forma segura.

---

## 🌐 URLs de Producción

Después del despliegue:
- **Aplicación:** https://archivoenlinea.com
- **API:** https://archivoenlinea.com/api
- **Health Check:** https://archivoenlinea.com/api/health
- **Landing Page:** https://archivoenlinea.com (público)
- **Tenants:** https://[tenant].archivoenlinea.com

---

## ✅ Checklist Pre-Despliegue

Antes de ejecutar, verifica:
- [ ] AWS CLI instalado
- [ ] Git instalado
- [ ] DNS configurado (archivoenlinea.com → IP servidor)
- [ ] Wildcard DNS configurado (*.archivoenlinea.com → IP servidor)
- [ ] Repositorio Git accesible
- [ ] Credenciales AWS válidas

---

## 📊 Tiempo Estimado

- **Configuración inicial:** 20-30 minutos
- **Despliegues posteriores:** 5-10 minutos

---

## 🔄 Actualizaciones Futuras

Para actualizar la aplicación:
```powershell
.\scripts\deploy-production-complete.ps1
```

Esto:
1. Crea backup automático
2. Actualiza código
3. Reinstala dependencias
4. Recompila
5. Reinicia aplicación

---

## 🛡️ Backups Automáticos

Los backups se crean automáticamente:
- **Ubicación:** `/backups/`
- **Frecuencia:** Cada despliegue
- **Formato:** `db_backup_YYYYMMDD_HHMMSS.sql`
- **Retención:** Últimos 7 días

---

## 📈 Monitoreo

### Ver Estado
```bash
pm2 status
pm2 monit
```

### Ver Logs
```bash
pm2 logs
tail -f /var/log/nginx/consentimientos_access.log
```

### Health Check
```bash
curl https://archivoenlinea.com/api/health
```

---

## 🚨 Rollback

Si algo sale mal:
```bash
# Conectar al servidor
ssh ubuntu@IP_DEL_SERVIDOR

# Restaurar backup
cd /backups
psql -h localhost -U admin consentimientos < db_backup_YYYYMMDD.sql

# Volver a versión anterior
cd /var/www/consentimientos
git reset --hard COMMIT_ANTERIOR
pm2 restart all
```

---

## 📞 Soporte

### Documentación
- **Despliegue automatizado:** `doc/DESPLIEGUE_AUTOMATIZADO.md`
- **Scripts:** `scripts/README.md`
- **Deployment manual:** `DEPLOYMENT.md`
- **Troubleshooting:** `doc/90-auditoria-produccion/`

### Logs
- **Aplicación:** `pm2 logs`
- **Nginx Access:** `/var/log/nginx/consentimientos_access.log`
- **Nginx Error:** `/var/log/nginx/consentimientos_error.log`
- **PostgreSQL:** `/var/log/postgresql/`

---

## 🎉 Próximos Pasos Después del Despliegue

1. **Crear Super Admin**
   - Acceder a la aplicación
   - Crear primer usuario super admin

2. **Configurar Primer Tenant**
   - Crear tenant de prueba
   - Verificar funcionalidades

3. **Probar Funcionalidades Críticas**
   - Login
   - Crear consentimiento
   - Generar PDF
   - Enviar email
   - Crear historia clínica

4. **Configurar Monitoreo**
   - Configurar alertas
   - Configurar métricas

5. **Configurar Backups Adicionales**
   - Backups a S3
   - Backups offsite

---

## 🔐 Seguridad Post-Despliegue

### Acciones Recomendadas
- [ ] Cambiar contraseñas por defecto
- [ ] Configurar 2FA para super admin
- [ ] Revisar logs de acceso
- [ ] Configurar alertas de seguridad
- [ ] Actualizar credenciales de Bold a producción

---

## 📝 Notas Importantes

### Bold (Pagos)
- Actualmente configurado en **SANDBOX**
- Para producción: Obtener credenciales de producción
- Actualizar `BOLD_WEBHOOK_URL` con URL real

### DNS
- Debe estar configurado ANTES de ejecutar el script
- Wildcard DNS es necesario para multi-tenancy
- Propagación puede tomar hasta 48 horas

### SSL
- Certificado se obtiene automáticamente
- Renovación automática configurada
- Válido por 90 días

---

## ✅ Estado Final

**TODO ESTÁ LISTO PARA DESPLEGAR**

Solo necesitas:
1. Ejecutar `.\scripts\deploy-master.ps1 -All`
2. Seguir las instrucciones en pantalla
3. Verificar que todo funcione

**El script hace TODO el trabajo pesado por ti.**

---

**Preparado por:** Sistema Automatizado  
**Fecha:** 2026-01-27  
**Versión:** 1.0  
**Estado:** ✅ LISTO
