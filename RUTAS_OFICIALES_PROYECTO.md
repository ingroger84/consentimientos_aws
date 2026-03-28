# 📁 Rutas Oficiales del Proyecto

**Última actualización**: 25 de Marzo 2026  
**Servidor**: AWS datagree (100.28.198.249)

---

## ⚠️ IMPORTANTE: UNA SOLA RUTA

Este documento define las rutas oficiales del proyecto. **NO usar otras rutas** para evitar confusiones y errores de despliegue.

---

## 🗂️ Rutas en el Servidor

### Backend
```
/home/ubuntu/consentimientos_aws/backend/
├── dist/           ← Código compilado (aquí despliega PM2)
├── src/            ← Código fuente
├── package.json
└── ...
```

**Ruta de despliegue**: `/home/ubuntu/consentimientos_aws/backend/dist/`

### Frontend
```
/home/ubuntu/consentimientos_aws/frontend/
├── dist/           ← Código compilado (aquí apunta nginx)
├── src/            ← Código fuente
├── package.json
└── ...
```

**Ruta de despliegue**: `/home/ubuntu/consentimientos_aws/frontend/dist/`

---

## 🚫 Rutas NO Usadas

### /var/www/html/
Esta ruta **NO está configurada en nginx** y **NO debe usarse**.

**Estado**: Limpiada (vacía)

---

## ⚙️ Configuración de Nginx

### Archivo de configuración
```
/etc/nginx/sites-enabled/archivoenlinea
```

### Root configurado
```nginx
root /home/ubuntu/consentimientos_aws/frontend/dist;
```

### Verificar configuración
```bash
sudo cat /etc/nginx/sites-enabled/archivoenlinea | grep "root "
```

---

## 🚀 Cómo Desplegar

### Opción 1: Script Automatizado (Recomendado)

```powershell
# Desplegar todo (backend + frontend)
.\scripts\deploy-production-v73.ps1

# Solo backend
.\scripts\deploy-production-v73.ps1 -BackendOnly

# Solo frontend
.\scripts\deploy-production-v73.ps1 -FrontendOnly
```

### Opción 2: Manual

#### Backend
```bash
# Local
cd backend
npm run build
tar -czf backend-dist-v73.3.tar.gz -C dist .
scp -i AWS-ISSABEL.pem backend-dist-v73.3.tar.gz ubuntu@100.28.198.249:/home/ubuntu/

# Servidor
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
cd /home/ubuntu/consentimientos_aws/backend
pm2 stop datagree
rm -rf dist
mkdir dist
tar -xzf /home/ubuntu/backend-dist-v73.3.tar.gz -C dist/
pm2 restart datagree --update-env
```

#### Frontend
```bash
# Local
cd frontend
npm run build
tar -czf frontend-dist-v73.3.tar.gz -C dist .
scp -i AWS-ISSABEL.pem frontend-dist-v73.3.tar.gz ubuntu@100.28.198.249:/home/ubuntu/

# Servidor
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
cd /home/ubuntu/consentimientos_aws/frontend
rm -rf dist
mkdir dist
tar -xzf /home/ubuntu/frontend-dist-v73.3.tar.gz -C dist/
sudo systemctl reload nginx
```

---

## ✅ Verificación Post-Despliegue

### 1. Verificar Backend
```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "pm2 list"
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "cat /home/ubuntu/consentimientos_aws/backend/package.json | grep version"
```

### 2. Verificar Frontend
```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "cat /home/ubuntu/consentimientos_aws/frontend/dist/version.json"
```

### 3. Verificar desde Internet
```bash
curl https://demo-estetica.archivoenlinea.com/version.json
```

O abrir en navegador:
```
https://demo-estetica.archivoenlinea.com/version.json
```

---

## 🔍 Diagnóstico de Problemas

### Problema: "Veo una versión antigua"

1. **Verificar qué ruta está sirviendo nginx**:
   ```bash
   ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "sudo cat /etc/nginx/sites-enabled/archivoenlinea | grep 'root '"
   ```

2. **Verificar versión en esa ruta**:
   ```bash
   ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "cat /home/ubuntu/consentimientos_aws/frontend/dist/version.json"
   ```

3. **Si la versión es incorrecta, redesplegar**:
   ```bash
   .\scripts\deploy-production-v73.ps1 -FrontendOnly
   ```

### Problema: "Backend no arranca"

1. **Ver logs de PM2**:
   ```bash
   ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "pm2 logs datagree --lines 50"
   ```

2. **Verificar que dist/ existe**:
   ```bash
   ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "ls -la /home/ubuntu/consentimientos_aws/backend/dist/"
   ```

3. **Reiniciar PM2**:
   ```bash
   ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "pm2 restart datagree --update-env"
   ```

---

## 📋 Checklist de Despliegue

Antes de cada despliegue, verificar:

- [ ] Versión actualizada en `backend/package.json`
- [ ] Versión actualizada en `backend/src/config/version.ts`
- [ ] Versión actualizada en `frontend/package.json`
- [ ] Versión actualizada en `frontend/src/config/version.ts`
- [ ] Código compilado localmente sin errores
- [ ] Backup de la versión anterior (opcional)

Después de cada despliegue, verificar:

- [ ] PM2 muestra la versión correcta
- [ ] version.json en el servidor tiene la versión correcta
- [ ] version.json desde internet tiene la versión correcta
- [ ] Aplicación funciona correctamente

---

## 🛡️ Prevención de Errores

### Regla #1: Una Sola Ruta
**NUNCA** desplegar en rutas diferentes a las documentadas aquí.

### Regla #2: Verificar Nginx
**SIEMPRE** verificar la configuración de nginx antes de desplegar:
```bash
sudo cat /etc/nginx/sites-enabled/archivoenlinea | grep "root "
```

### Regla #3: Usar el Script
**PREFERIR** usar el script automatizado `deploy-production-v73.ps1` en lugar de comandos manuales.

### Regla #4: Verificar Post-Despliegue
**SIEMPRE** verificar que la versión se desplegó correctamente:
```bash
curl https://demo-estetica.archivoenlinea.com/version.json
```

---

## 📞 Contactos

### Servidor
- **IP**: 100.28.198.249
- **Usuario**: ubuntu
- **SSH Key**: AWS-ISSABEL.pem

### Servicios
- **Backend**: PM2 (proceso: datagree)
- **Frontend**: Nginx
- **Puerto Backend**: 3000
- **Puerto Frontend**: 443 (HTTPS)

---

## 📚 Documentación Relacionada

1. **scripts/deploy-production-v73.ps1** - Script de despliegue automatizado
2. **SOLUCION_DEFINITIVA_V73.3_RUTA_CORRECTA.md** - Solución del problema de rutas
3. **DESPLIEGUE_V73.3_COMPLETADO.md** - Despliegue del backend
4. **DESPLIEGUE_FRONTEND_V73.3_COMPLETADO.md** - Despliegue del frontend

---

**Última actualización**: 25 de Marzo 2026, 11:15 AM  
**Versión actual**: 73.3.0  
**Estado**: ✅ Documentado y funcionando
