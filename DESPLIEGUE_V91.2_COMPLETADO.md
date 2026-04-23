# Despliegue v91.2 - Lógica Condicional Datos Cliente DynamiaERP

**Fecha:** 2026-04-20  
**Versión:** v91.2  
**Estado:** ✅ COMPLETADO

## Cambios Implementados

### Lógica Condicional según Tipo de Documento

Se implementó lógica condicional para enviar datos del cliente a DynamiaERP según el tipo de documento:

#### Para NIT (tipoId = '31')
- Se envía `razonSocial` con el nombre completo del tenant
- También se envía `nombre1` y `apellido1` dividiendo el nombre

```typescript
razonSocial: isNIT ? tenant.name : '', // "AQUIUB CASA PESTAÑAS"
nombre1: tenant.name.split(' ')[0],    // "AQUIUB"
apellido1: tenant.name.split(' ')[1],  // "CASA"
```

#### Para Cédula (tipoId = '13')
- `razonSocial` se envía vacío (`''`)
- Solo se envía `nombre1` y `apellido1`

```typescript
razonSocial: isNIT ? tenant.name : '', // "" (vacío)
nombre1: tenant.name.split(' ')[0],    // Primer nombre
apellido1: tenant.name.split(' ')[1],  // Primer apellido
```

### Archivos Modificados

1. **backend/src/invoices/invoices.service.ts** (líneas 830-858)
   - Agregada variable `isNIT` para determinar tipo de documento
   - Modificado campo `razonSocial` con lógica condicional

2. **backend/resend-aquiub-invoice.js** (líneas 195-220)
   - Agregada misma lógica condicional para script de prueba
   - Mantiene consistencia con el servicio principal

## Proceso de Despliegue

### 1. Compilación
```bash
cd backend
npm run build
```
✅ Compilación exitosa sin errores

### 2. Creación de Tarball
```bash
tar -czf backend-v91.2-dist.tar.gz -C backend/dist .
```
✅ Tarball creado: `backend-v91.2-dist.tar.gz` (4.7 MB)

### 3. Subida a Servidor
```bash
scp -i AWS-ISSABEL.pem backend-v91.2-dist.tar.gz ubuntu@100.28.198.249:/home/ubuntu/
```
✅ Archivo subido exitosamente

### 4. Despliegue en Producción
```bash
ssh ubuntu@100.28.198.249
cd /home/ubuntu/consentimientos_aws/backend
cp -r dist dist_backup_v91.2_20260420_212200
rm -rf dist && mkdir dist
cd dist && tar -xzf ~/backend-v91.2-dist.tar.gz
pm2 restart datagree
```
✅ Servicio reiniciado correctamente (PID: 1570185)

### 5. Verificación
```bash
grep -A 2 'apellido2:' dist/invoices/invoices.service.js
```
✅ Código verificado:
```javascript
apellido2: '',
razonSocial: isNIT ? tenant.name : '',
email: tenant.contactEmail,
```

## Estado del Sistema

- **Servidor:** AWS 100.28.198.249
- **Proceso PM2:** datagree (ID: 0)
- **PID:** 1570185
- **Estado:** Online ✅
- **Uptime:** Recién reiniciado
- **Memoria:** 40.5 MB
- **CPU:** 0%
- **Reintentos:** 512

## Logs del Sistema

Sistema funcionando correctamente:
- Middleware de tenant detectando correctamente: `aquiub`, `demo-estetica`
- PaymentMonitorService ejecutándose cada minuto
- No hay errores críticos en logs

## Backup Creado

- **Ubicación:** `/home/ubuntu/consentimientos_aws/backend/dist_backup_v91.2_20260420_212200`
- **Contenido:** Versión anterior (v91.1) del código compilado

## Próximos Pasos

1. **Probar con tenant NIT (Aquiub)**
   - Verificar que `razonSocial` se envíe con el nombre completo
   - Confirmar que `nombre1` y `apellido1` también se envíen

2. **Probar con tenant Cédula**
   - Verificar que `razonSocial` se envíe vacío
   - Confirmar que solo `nombre1` y `apellido1` se envíen

3. **Monitorear logs de DynamiaERP**
   - Verificar respuestas exitosas
   - Confirmar que no hay errores de validación

## Notas Técnicas

- La lógica usa el campo `tenant.name` del modelo Tenant
- El tipo de documento se obtiene de `tenant.documentType.code` y se mapea a códigos DIAN
- El formato de número de factura sigue siendo `001-YYYYMM-NNNN`
- Todos los demás campos permanecen sin cambios

---

**Despliegue completado exitosamente** ✅
