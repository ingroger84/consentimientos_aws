# Despliegue V75.4.0 - Eliminación de Banners de Límites de Recursos

**Fecha:** 27 de marzo de 2026  
**Versión:** 75.4.0  
**Tipo:** Corrección UI - Eliminación de componentes no deseados

---

## 📋 RESUMEN

Se eliminaron los banners de notificación de límites de recursos (usuarios, sucursales, servicios, consentimientos) que aparecían en todas las páginas del sistema. Solo se mantiene el banner de recordatorio de pagos.

---

## 🎯 CAMBIOS REALIZADOS

### Frontend

1. **Layout.tsx**
   - ❌ Eliminado componente `ResourceLimitNotifications`
   - ❌ Eliminado import de `ResourceLimitNotifications`
   - ✅ Mantenido componente `PaymentReminderBanner` (recordatorios de facturas)

2. **Versión actualizada**
   - De: `75.0.0` → A: `75.4.0`
   - Fecha: 2026-03-27

### Backend

3. **Variables de entorno (.env)**
   - ✅ Agregada variable `BILLING_REMINDER_DAYS=7,5,3,1`
   - Permite configurar los días de anticipación para recordatorios de pago

---

## 📦 ARCHIVOS MODIFICADOS

```
frontend/src/components/Layout.tsx
frontend/src/config/version.ts
backend/.env
backend/.env.example
```

---

## 🚀 PROCESO DE DESPLIEGUE

### 1. Compilación Local
```bash
cd frontend
npm run build
```

### 2. Empaquetado
```bash
Compress-Archive -Path frontend/dist/* -DestinationPath frontend-dist-v75.4-remove-resource-banners.zip
```

### 3. Transferencia al Servidor
```bash
scp -i AWS-ISSABEL.pem frontend-dist-v75.4-remove-resource-banners.zip ubuntu@100.28.198.249:/home/ubuntu/
```

### 4. Despliegue en Servidor
- ✅ Backup creado: `/var/www/html.backup.v75.3.YYYYMMDD_HHMMSS`
- ✅ Archivos desplegados en `/var/www/html/`
- ✅ Permisos configurados: `www-data:www-data` (755)
- ✅ Nginx recargado

---

## ✅ VERIFICACIÓN

### Antes del Despliegue
- ❌ Banner rojo "Límite alcanzado - usuarios" visible
- ❌ Banner rojo "Límite alcanzado - sedes" visible
- ✅ Banner amarillo/rojo de facturas pendientes visible

### Después del Despliegue
- ✅ Banner de límites de recursos ELIMINADO
- ✅ Banner de recordatorio de pagos MANTENIDO
- ✅ Interfaz más limpia y menos intrusiva

---

## 🔧 CONFIGURACIÓN DE RECORDATORIOS DE PAGO

### Backend (.env)
```env
# Días de anticipación para enviar recordatorios de pago (separados por coma)
BILLING_REMINDER_DAYS=7,5,3,1
```

### Funcionamiento
- **Emails automáticos:** Se envían 7, 5, 3 y 1 días antes del vencimiento
- **Banner in-app:** Se muestra cuando faltan 5 días o menos
- **Cron job:** Ejecuta diariamente a las 09:00 AM

---

## 📊 SISTEMA DE NOTIFICACIONES ACTUAL

### Notificaciones Activas
1. ✅ **Recordatorio de Pagos (Banner Amarillo)**
   - Aparece cuando faltan ≤ 5 días para vencimiento
   - Muestra días restantes y monto
   - Botón "Pagar Ahora" con link directo a Bold

2. ✅ **Factura Vencida (Banner Rojo)**
   - Aparece cuando hay facturas vencidas
   - Muestra días de mora
   - Advertencia de suspensión de cuenta
   - Botón "Pagar Ahora" con link directo a Bold

### Notificaciones Eliminadas
1. ❌ **Límite de Usuarios**
2. ❌ **Límite de Sucursales**
3. ❌ **Límite de Servicios**
4. ❌ **Límite de Consentimientos**

---

## 🔄 ROLLBACK (Si es necesario)

En caso de necesitar revertir los cambios:

```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
cd /var/www
sudo rm -rf html
sudo cp -r html.backup.v75.3.YYYYMMDD_HHMMSS html
sudo systemctl reload nginx
```

---

## 📝 NOTAS IMPORTANTES

1. **Cache del navegador:** Los usuarios pueden necesitar hacer Ctrl+Shift+R para ver los cambios
2. **Validación de límites:** Los límites de recursos siguen validándose en el backend al crear nuevos elementos
3. **Modales de advertencia:** Los modales de advertencia al crear usuarios/servicios se mantienen activos
4. **Emails de recordatorio:** El sistema de emails automáticos sigue funcionando normalmente

---

## 🎉 RESULTADO

El sistema ahora tiene una interfaz más limpia, mostrando solo las notificaciones críticas relacionadas con pagos y facturación, mientras mantiene todas las validaciones de límites en el backend.

**Estado:** ✅ DESPLIEGUE EXITOSO  
**Servidor:** 100.28.198.249  
**Dominios afectados:** 
- admin.archivoenlinea.com
- *.archivoenlinea.com (todos los tenants)
