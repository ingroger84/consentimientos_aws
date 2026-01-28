# Comandos Rápidos - DatAgree

## 🚀 Despliegue

### Despliegue Completo (Primera Vez)
```powershell
.\scripts\pre-deployment-check.ps1
.\scripts\deploy-master.ps1 -All
```

### Actualizar Aplicación
```powershell
.\scripts\deploy-production-complete.ps1
```

### Solo Configurar Servidor
```powershell
.\scripts\deploy-master.ps1 -SetupServer
```

---

## 🔍 Verificación

### Health Check
```powershell
curl https://archivoenlinea.com/api/health
```

### Verificar SSL
```powershell
curl -I https://archivoenlinea.com
```

### Ver Estado PM2
```bash
ssh ubuntu@IP_SERVIDOR
pm2 status
```

---

## 📊 Monitoreo

### Ver Logs en Tiempo Real
```bash
pm2 logs
```

### Ver Logs de Nginx
```bash
tail -f /var/log/nginx/consentimientos_access.log
tail -f /var/log/nginx/consentimientos_error.log
```

### Monitoreo Interactivo
```bash
pm2 monit
```

---

## 🔄 Gestión de Aplicación

### Reiniciar Aplicación
```bash
pm2 restart all
```

### Detener Aplicación
```bash
pm2 stop all
```

### Iniciar Aplicación
```bash
pm2 start all
```

### Ver Info Detallada
```bash
pm2 show 0
```

---

## 🗄️ Base de Datos

### Conectar a PostgreSQL
```bash
psql -h localhost -U admin consentimientos
```

### Crear Backup Manual
```bash
pg_dump -h localhost -U admin consentimientos > backup_$(date +%Y%m%d).sql
```

### Restaurar Backup
```bash
psql -h localhost -U admin consentimientos < backup_20260127.sql
```

### Ver Tablas
```sql
\dt
```

---

## 🌐 Nginx

### Verificar Configuración
```bash
sudo nginx -t
```

### Recargar Nginx
```bash
sudo systemctl reload nginx
```

### Reiniciar Nginx
```bash
sudo systemctl restart nginx
```

### Ver Estado
```bash
sudo systemctl status nginx
```

---

## 🔐 SSL/TLS

### Renovar Certificado
```bash
sudo certbot renew
```

### Ver Certificados
```bash
sudo certbot certificates
```

### Test de Renovación
```bash
sudo certbot renew --dry-run
```

---

## 🔧 Troubleshooting

### Ver Logs de Errores
```bash
pm2 logs --err
```

### Limpiar Logs
```bash
pm2 flush
```

### Reiniciar Todo
```bash
pm2 restart all
sudo systemctl reload nginx
```

### Ver Uso de Recursos
```bash
pm2 monit
htop
```

---

## 📦 Git

### Ver Estado
```bash
git status
```

### Actualizar Código
```bash
git pull origin main
```

### Ver Commits Recientes
```bash
git log --oneline -10
```

### Volver a Commit Anterior
```bash
git reset --hard COMMIT_HASH
```

---

## 🔑 Credenciales

### Ver Variables de Entorno
```bash
cat /var/www/consentimientos/backend/.env
```

### Editar Variables
```bash
nano /var/www/consentimientos/backend/.env
```

---

## 🚨 Emergencia

### Rollback Rápido
```bash
cd /var/www/consentimientos
git reset --hard HEAD~1
pm2 restart all
```

### Restaurar Backup Más Reciente
```bash
cd /backups
ls -lt | head -5
psql -h localhost -U admin consentimientos < db_backup_LATEST.sql
```

### Detener Todo
```bash
pm2 stop all
sudo systemctl stop nginx
```

---

## 📞 Información del Sistema

### Ver IP Pública
```bash
curl ifconfig.me
```

### Ver Uso de Disco
```bash
df -h
```

### Ver Uso de Memoria
```bash
free -h
```

### Ver Procesos
```bash
ps aux | grep node
```

---

## 🔗 URLs Importantes

- **Aplicación:** https://archivoenlinea.com
- **API:** https://archivoenlinea.com/api
- **Health:** https://archivoenlinea.com/api/health
- **SSL Test:** https://www.ssllabs.com/ssltest/analyze.html?d=archivoenlinea.com

---

## 📚 Documentación

- **Despliegue:** `doc/DESPLIEGUE_AUTOMATIZADO.md`
- **Scripts:** `scripts/README.md`
- **Deployment:** `DEPLOYMENT.md`
- **Resumen:** `doc/RESUMEN_DESPLIEGUE_LISTO.md`

---

**Última actualización:** 2026-01-27
