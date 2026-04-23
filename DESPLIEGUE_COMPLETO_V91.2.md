# Despliegue Completo v91.2 - Backend + Frontend

**Fecha:** 2026-04-20  
**Versión:** v91.2.0  
**Estado:** ✅ COMPLETADO

## Resumen

Despliegue completo de backend y frontend con:
- Lógica condicional para datos de cliente en DynamiaERP según tipo de documento
- Actualización de versión del sistema a 91.2.0

---

## BACKEND v91.2

### Cambios Implementados

**Lógica Condicional según Tipo de Documento:**

#### Para NIT (tipoId = '31')
```typescript
razonSocial: isNIT ? tenant.name : '', // "AQUIUB CASA PESTAÑAS"
nombre1: tenant.name.split(' ')[0],    // "AQUIUB"
apellido1: tenant.name.split(' ')[1],  // "CASA"
```

#### Para Cédula (tipoId = '13')
```typescript
razonSocial: isNIT ? tenant.name : '', // "" (vacío)
nombre1: tenant.name.split(' ')[0],    // Primer nombre
apellido1: tenant.name.split(' ')[1],  // Primer apellido
```

### Archivos Modificados
1. `backend/src/invoices/invoices.service.ts` (líneas 830-858)
2. `backend/resend-aquiub-invoice.js` (líneas 195-220)

### Proceso de Despliegue Backend
```bash
# 1. Compilación
cd backend
npm run build
✅ Compilación exitosa

# 2. Creación de tarball
tar -czf backend-v91.2-dist.tar.gz -C backend/dist .
✅ Tarball: 4.7 MB

# 3. Subida a servidor
scp -i AWS-ISSABEL.pem backend-v91.2-dist.tar.gz ubuntu@100.28.198.249:/home/ubuntu/
✅ Subido exitosamente

# 4. Despliegue
ssh ubuntu@100.28.198.249
cd /home/ubuntu/consentimientos_aws/backend
cp -r dist dist_backup_v91.2_20260420_212200
rm -rf dist && mkdir dist
cd dist && tar -xzf ~/backend-v91.2-dist.tar.gz
pm2 restart datagree
✅ Servicio reiniciado (PID: 1570185)
```

---

## FRONTEND v91.2

### Cambios Implementados

**Actualización de Versión:**
- `frontend/package.json`: 85.1.1 → 91.2.0
- `frontend/src/config/version.ts`: 85.1.1 → 91.2.0
- Fecha actualizada: 2026-04-01 → 2026-04-20

### Archivos Modificados
1. `frontend/package.json` (versión)
2. `frontend/src/config/version.ts` (versión y fecha)

### Proceso de Despliegue Frontend
```bash
# 1. Actualización de versiones
# package.json: "version": "91.2.0"
# version.ts: version: '91.2.0', date: '2026-04-20'

# 2. Compilación
cd frontend
npm run build
✅ Compilación exitosa
✅ version.json generado: 91.2.0
✅ buildHash: mo804czn
✅ buildTimestamp: 1776738319043

# 3. Creación de tarball
tar -czf frontend-v91.2-dist.tar.gz -C frontend/dist .
✅ Tarball: 361 KB

# 4. Subida a servidor
scp -i AWS-ISSABEL.pem frontend-v91.2-dist.tar.gz ubuntu@100.28.198.249:/home/ubuntu/
✅ Subido exitosamente

# 5. Despliegue
ssh ubuntu@100.28.198.249
sudo cp -r /var/www/html /var/www/html_backup_v91.2
sudo rm -rf /var/www/html/*
cd /var/www/html
sudo tar -xzf ~/frontend-v91.2-dist.tar.gz
sudo chown -R www-data:www-data /var/www/html
✅ Frontend desplegado
```

### Verificación Frontend
```bash
# version.json en servidor
cat /var/www/html/version.json
{
  "version": "91.2.0",
  "buildDate": "2026-04-21",
  "buildHash": "mo804czn",
  "buildTimestamp": "1776738319043"
}
✅ Versión correcta

# index.html
<meta name="build-timestamp" content="1776738319043" />
<meta name="app-version" content="91.2.0" />
✅ Metadatos correctos
```

---

## Estado del Sistema

### Backend
- **Servidor:** AWS 100.28.198.249
- **Path:** /home/ubuntu/consentimientos_aws/backend
- **Proceso PM2:** datagree (ID: 0)
- **PID:** 1570185
- **Estado:** Online ✅
- **Memoria:** 40.5 MB
- **CPU:** 0%

### Frontend
- **Servidor:** AWS 100.28.198.249
- **Path:** /var/www/html
- **Versión desplegada:** 91.2.0
- **Build Hash:** mo804czn
- **Build Timestamp:** 1776738319043
- **Estado:** Desplegado ✅

### Backups Creados
1. **Backend:** `/home/ubuntu/consentimientos_aws/backend/dist_backup_v91.2_20260420_212200`
2. **Frontend:** `/var/www/html_backup_v91.2` (con timestamp)

---

## Verificación de Funcionamiento

### 1. Verificar Versión en Navegador
- Abrir cualquier tenant: `https://[tenant].archivoenlinea.com/login`
- Verificar en la parte inferior: "Versión 91.2.0 - 2026-04-20"
- Si aparece versión antigua, limpiar caché del navegador (Ctrl+Shift+R)

### 2. Verificar Backend
```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
pm2 status
pm2 logs datagree --lines 50
```

### 3. Verificar Lógica DynamiaERP
- Crear factura para tenant con NIT → Verificar que `razonSocial` tenga valor
- Crear factura para tenant con Cédula → Verificar que `razonSocial` esté vacío

---

## Limpieza de Caché

El sistema incluye limpieza automática de caché en el frontend:
- Detecta cambio de versión automáticamente
- Limpia localStorage (excepto datos de sesión)
- Limpia sessionStorage
- Desregistra Service Workers
- Limpia Cache API

**Si los usuarios ven versión antigua:**
1. Presionar Ctrl+Shift+R (recarga forzada)
2. O limpiar caché del navegador manualmente
3. El script automático se encargará del resto

---

## Próximos Pasos

1. **Monitorear logs** durante las próximas horas
2. **Probar facturación** con diferentes tipos de documento
3. **Verificar** que usuarios vean la nueva versión
4. **Confirmar** que no hay errores en DynamiaERP

---

## Notas Técnicas

- El formato de número de factura sigue siendo `001-YYYYMM-NNNN`
- La lógica condicional usa `tipoId === '31'` para detectar NIT
- El frontend tiene cache-busting automático con timestamp
- Los backups están disponibles para rollback si es necesario

---

**Despliegue completado exitosamente** ✅

**Versión del sistema:** 91.2.0  
**Fecha de despliegue:** 2026-04-20  
**Hora de despliegue:** 21:25 UTC
