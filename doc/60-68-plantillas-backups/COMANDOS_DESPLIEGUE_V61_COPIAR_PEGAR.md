# 📋 Comandos para Despliegue V61 - Copiar y Pegar

**IMPORTANTE**: Copia y pega estos comandos UNO POR UNO en tu terminal PowerShell

---

## 🚀 PASO 1: Subir Migración SQL

```powershell
scp backend/migrations/add-consent-template-services-relation.sql ubuntu@archivoenlinea.com:/home/ubuntu/archivoenlinea/backend/migrations/
```

**Espera**: Confirmación de archivo subido

---

## 🗄️ PASO 2: Ejecutar Migración de Base de Datos

```powershell
ssh ubuntu@archivoenlinea.com "cd /home/ubuntu/archivoenlinea/backend && psql `$DATABASE_URL -f migrations/add-consent-template-services-relation.sql"
```

**Espera**: Mensaje "CREATE TABLE" y "CREATE INDEX"

---

## 📦 PASO 3: Subir Script de Migración de Datos

```powershell
scp backend/migrate-existing-templates-to-services.js ubuntu@archivoenlinea.com:/home/ubuntu/archivoenlinea/backend/
```

**Espera**: Confirmación de archivo subido

---

## 🔄 PASO 4: Ejecutar Migración de Datos

```powershell
ssh ubuntu@archivoenlinea.com "cd /home/ubuntu/archivoenlinea/backend && node migrate-existing-templates-to-services.js"
```

**Espera**: Reporte de asociaciones creadas

---

## 💾 PASO 5: Crear Backups

```powershell
ssh ubuntu@archivoenlinea.com "cd /home/ubuntu/archivoenlinea && cp -r backend/dist backend/dist.backup.v60 && cp -r frontend/dist frontend/dist.backup.v60"
```

**Espera**: Comando completado sin errores

---

## 📤 PASO 6: Subir Backend Compilado

```powershell
scp -r backend/dist/* ubuntu@archivoenlinea.com:/home/ubuntu/archivoenlinea/backend/dist/
```

**Espera**: Múltiples archivos subidos (puede tomar 1-2 minutos)

---

## 📤 PASO 7: Subir Entidades Actualizadas

```powershell
scp -r backend/src/consent-templates/entities/* ubuntu@archivoenlinea.com:/home/ubuntu/archivoenlinea/backend/src/consent-templates/entities/
```

**Espera**: Archivos subidos

---

## 📤 PASO 8: Subir Frontend Compilado

```powershell
scp -r frontend/dist/* ubuntu@archivoenlinea.com:/home/ubuntu/archivoenlinea/frontend/dist/
```

**Espera**: Múltiples archivos subidos (puede tomar 1-2 minutos)

---

## 🔄 PASO 9: Reiniciar Backend

```powershell
ssh ubuntu@archivoenlinea.com "cd /home/ubuntu/archivoenlinea && pm2 restart archivoenlinea-backend"
```

**Espera**: Mensaje "restart" con status "online"

---

## 🌐 PASO 10: Recargar Nginx

```powershell
ssh ubuntu@archivoenlinea.com "sudo systemctl reload nginx"
```

**Espera**: Comando completado sin errores

---

## ✅ PASO 11: Verificar Estado

```powershell
ssh ubuntu@archivoenlinea.com "pm2 status && pm2 logs archivoenlinea-backend --lines 20"
```

**Busca**: 
- Status: "online"
- Sin errores en logs

---

## 🔍 PASO 12: Verificar Base de Datos

```powershell
ssh ubuntu@archivoenlinea.com "psql `$DATABASE_URL -c 'SELECT COUNT(*) FROM consent_template_services;'"
```

**Espera**: Número mayor a 0 (asociaciones creadas)

---

## 🌐 PASO 13: Verificar API

```powershell
curl https://archivoenlinea.com/api/consent-templates
```

**Busca**: JSON con plantillas que incluyen campo "services"

---

## ✅ VERIFICACIÓN FINAL

Abre en tu navegador:
1. https://archivoenlinea.com
2. Login
3. Ir a "Gestión de Plantillas" → "Plantillas de CN"
4. Verificar que plantillas muestran servicios
5. Clic en "Nueva Plantilla"
6. Verificar selector de servicios

---

## 🆘 SI ALGO SALE MAL - ROLLBACK

```powershell
ssh ubuntu@archivoenlinea.com "cd /home/ubuntu/archivoenlinea && rm -rf backend/dist && mv backend/dist.backup.v60 backend/dist && rm -rf frontend/dist && mv frontend/dist.backup.v60 frontend/dist && pm2 restart archivoenlinea-backend"
```

---

## 📊 RESUMEN

Total de comandos: 13
Tiempo estimado: 5-10 minutos
Archivos a subir: ~1.5 MB

---

**¡Copia y pega cada comando en tu terminal PowerShell!**
