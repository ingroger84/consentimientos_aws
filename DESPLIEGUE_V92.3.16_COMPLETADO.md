# Despliegue v92.3.16 - Completado

**Fecha:** 11 de mayo de 2026  
**Versión:** 92.3.16  
**Estado:** ✅ COMPLETADO

## Cambios en esta Versión

### Backend
- Cambio de regla de suspensión: de 3 días a 1 día de gracia
- Cambio de horario de cron job: de 23:00 a 01:00
- Cálculo basado en `createdAt` en lugar de `dueDate`

### Frontend
- Actualización de versión a 92.3.16
- Build hash: `mp1glkh7`
- Build timestamp: `1778519514859`

## Problema Detectado y Solucionado

### Problema
El usuario reportó múltiples veces que seguía viendo la versión **92.3.10** en varios dispositivos (descartando caché del navegador).

### Causa Raíz
**Ruta de despliegue incorrecta**: Los archivos se estaban desplegando a `/var/www/html/` pero Nginx está configurado para servir desde `/home/ubuntu/consentimientos_aws/frontend/dist/`.

### Solución
1. Identificada la ruta correcta en configuración de Nginx:
   ```bash
   root /home/ubuntu/consentimientos_aws/frontend/dist;
   ```

2. Archivos copiados a la ubicación correcta:
   ```bash
   cp -r /var/www/html/* /home/ubuntu/consentimientos_aws/frontend/dist/
   ```

3. Nginx recargado para aplicar cambios

## Verificación Post-Despliegue

### Backend
```bash
✅ Versión: 92.3.16
✅ Proceso PM2: datagree (PID: 1776047)
✅ Ruta: /home/ubuntu/consentimientos_aws/backend/dist/
✅ Regla de suspensión: 1 día de gracia
✅ Cron job: 01:00 diario
```

### Frontend
```bash
✅ Versión: 92.3.16
✅ Build hash: mp1glkh7
✅ Ruta: /home/ubuntu/consentimientos_aws/frontend/dist/
✅ Archivo principal: index-DRLUH3dt.js
✅ Nginx: Recargado correctamente
```

### Verificación en Servidor
```bash
$ curl -s -k https://localhost/version.json
{
  "version": "92.3.16",
  "buildDate": "2026-05-11",
  "buildHash": "mp1glkh7",
  "buildTimestamp": "1778519514859"
}
```

## Ruta Correcta de Despliegue

### ⚠️ IMPORTANTE - RUTA CORRECTA

**Frontend:**
```
/home/ubuntu/consentimientos_aws/frontend/dist/
```

**Backend:**
```
/home/ubuntu/consentimientos_aws/backend/dist/
```

**❌ NO USAR:**
- `/var/www/html/` (ruta antigua, no se usa)
- `/var/www/consentimientos/` (ruta antigua, no se usa)

## Comandos de Despliegue Correctos

### Frontend
```powershell
# 1. Compilar localmente
cd frontend
npm run build

# 2. Subir a servidor
scp -i AWS-ISSABEL.pem -r dist/* ubuntu@100.28.198.249:/home/ubuntu/consentimientos_aws/frontend/dist/

# 3. Recargar Nginx
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "sudo systemctl reload nginx"
```

### Backend
```powershell
# 1. Compilar localmente
cd backend
npm run build

# 2. Subir a servidor
scp -i AWS-ISSABEL.pem -r dist/* ubuntu@100.28.198.249:/home/ubuntu/consentimientos_aws/backend/dist/

# 3. Reiniciar PM2
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "pm2 restart datagree"
```

## Instrucciones para Usuarios

Los usuarios deben limpiar el caché del navegador para ver la nueva versión:

1. **Modo incógnito:** Ctrl + Shift + N
2. **Hard refresh:** Ctrl + F5
3. **Limpiar caché:** Ctrl + Shift + Supr

## Archivos Modificados

### Backend
- `backend/src/billing/billing.service.ts`
- `backend/src/billing/billing-scheduler.service.ts`
- `backend/src/config/version.ts`
- `backend/package.json`

### Frontend
- `frontend/src/config/version.ts`
- `frontend/package.json`

### Documentación
- `VERSION.md`
- `CAMBIO_REGLA_SUSPENSION_V92.3.15.md`

## Git

```bash
✅ Commit: "chore: update version to 92.3.16"
✅ Push: Exitoso a GitHub
✅ Branch: main
```

## Resumen

Versión 92.3.16 desplegada correctamente en producción. El problema de la ruta incorrecta ha sido identificado y corregido. Los usuarios ahora verán la versión correcta después de limpiar el caché del navegador.
