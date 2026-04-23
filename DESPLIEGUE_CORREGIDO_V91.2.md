# Despliegue Corregido v91.2 - Problema de Ruta Resuelto

**Fecha:** 2026-04-20  
**Versión:** v91.2.0  
**Estado:** ✅ COMPLETADO Y CORREGIDO

## Problema Identificado

El frontend fue desplegado inicialmente en la ruta **INCORRECTA**:
- ❌ Desplegado en: `/var/www/html`
- ✅ Ruta correcta: `/home/ubuntu/consentimientos_aws/frontend/dist`

**Nginx estaba configurado para servir desde:**
```nginx
root /home/ubuntu/consentimientos_aws/frontend/dist;
```

Por eso los usuarios seguían viendo la versión 85.1.1 (que estaba en esa ruta) en lugar de la 91.2.0.

## Solución Aplicada

### 1. Verificación de Configuración de Nginx
```bash
sudo nginx -T | grep 'root'
# Resultado: root /home/ubuntu/consentimientos_aws/frontend/dist;
```

### 2. Verificación de Versión en Ruta Correcta
```bash
cat /home/ubuntu/consentimientos_aws/frontend/dist/version.json
# Resultado: version 85.1.1 (versión antigua)
```

### 3. Despliegue en Ruta Correcta
```bash
cd /home/ubuntu/consentimientos_aws/frontend
cp -r dist dist.backup.v91.2_20260420_215500
rm -rf dist/*
cd dist
tar -xzf ~/frontend-v91.2-dist.tar.gz
```

### 4. Verificación Post-Despliegue
```bash
cat /home/ubuntu/consentimientos_aws/frontend/dist/version.json
# Resultado: version 91.2.0 ✅
```

### 5. Recarga de Nginx
```bash
sudo systemctl reload nginx
```

## Estado Actual

### Frontend
- **Ruta correcta:** `/home/ubuntu/consentimientos_aws/frontend/dist`
- **Versión desplegada:** 91.2.0
- **Build Hash:** mo804czn
- **Build Timestamp:** 1776738319043
- **Estado:** ✅ Funcionando

### Backend
- **Ruta:** `/home/ubuntu/consentimientos_aws/backend/dist`
- **Versión:** 91.2
- **Proceso PM2:** datagree (PID: 1570185)
- **Estado:** ✅ Funcionando

## Verificación

### 1. Verificar version.json
```bash
curl https://archivoenlinea.com/version.json
```
**Resultado esperado:**
```json
{
  "version": "91.2.0",
  "buildDate": "2026-04-21",
  "buildHash": "mo804czn",
  "buildTimestamp": "1776738319043"
}
```

### 2. Verificar index.html
```bash
curl https://archivoenlinea.com/ | grep "app-version"
```
**Resultado esperado:**
```html
<meta name="app-version" content="91.2.0" />
```

### 3. Verificar en Navegador
- Abrir https://archivoenlinea.com/login
- Verificar en la parte inferior: "Versión 91.2.0 - 2026-04-20"
- Si aún aparece versión antigua, hacer `Ctrl + Shift + R`

## Lección Aprendida

**IMPORTANTE:** Siempre verificar la configuración de Nginx antes de desplegar:

```bash
# Verificar dónde está configurado el root
sudo nginx -T | grep 'root'

# O revisar el archivo de configuración
cat /etc/nginx/sites-available/default | grep 'root'
```

**Rutas del proyecto:**
- Frontend: `/home/ubuntu/consentimientos_aws/frontend/dist`
- Backend: `/home/ubuntu/consentimientos_aws/backend/dist`

## Backups Creados

1. **Frontend anterior:** `dist.backup.v91.2_20260420_215500`
2. **Backend anterior:** `dist_backup_v91.2_20260420_212200`

## Cambios Implementados en v91.2

### Backend
- Lógica condicional para datos de cliente en DynamiaERP
- NIT (tipoId = '31'): Envía `razonSocial` + `nombre1`/`apellido1`
- Cédula (tipoId = '13'): Solo `nombre1`/`apellido1`, `razonSocial` vacío

### Frontend
- Actualización de versión a 91.2.0
- Fecha actualizada a 2026-04-20
- Sistema de limpieza automática de caché

## Comandos de Verificación Rápida

```bash
# Conectar al servidor
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249

# Verificar versión del frontend
cat /home/ubuntu/consentimientos_aws/frontend/dist/version.json

# Verificar proceso backend
pm2 status

# Ver logs del backend
pm2 logs datagree --lines 50

# Verificar Nginx
sudo systemctl status nginx
```

## Conclusión

✅ **Problema resuelto:** Frontend desplegado en la ruta correcta  
✅ **Versión actual:** 91.2.0 funcionando correctamente  
✅ **Backend:** Funcionando con lógica condicional DynamiaERP  
✅ **Sistema:** Completamente operacional

Los usuarios ahora deberían ver la versión 91.2.0 correctamente. Si algún usuario aún ve la versión antigua, solo necesita hacer una recarga forzada (`Ctrl + Shift + R`).

---

**Despliegue completado exitosamente en la ruta correcta** ✅
