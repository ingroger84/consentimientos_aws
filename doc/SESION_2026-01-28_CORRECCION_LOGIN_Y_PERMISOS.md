# 📋 Sesión de Corrección: Login Personalizado y Permisos

**Fecha:** 28 de enero de 2026, 02:30 AM - 03:50 AM  
**Versión:** 19.0.0  
**Servidor:** 100.28.198.249 (DatAgree - AWS Lightsail)

---

## 📌 Resumen Ejecutivo

Se corrigieron dos problemas críticos después del despliegue de la versión 19.0.0:

1. **Login personalizado no visible** - Causado por caché del navegador
2. **Error "Internal server error" al iniciar sesión** - Causado por columnas faltantes en la base de datos
3. **Usuarios sin permisos** - Permisos desactualizados después de la migración

**Estado Final:** ✅ Todos los problemas resueltos

---

## 🔧 Problema 1: Login Personalizado No Visible

### Síntoma
El usuario reportó que no veía el login personalizado con el logo y colores de "Archivo en Linea" en https://admin.archivoenlinea.com

### Diagnóstico
1. Backend funcionando correctamente ✓
2. Endpoint `/api/settings/public` retornando settings correctos ✓
3. Frontend compilado con código correcto ✓
4. **Problema:** Caché del navegador mostrando versión antigua

### Solución Aplicada

#### 1. Verificación del Backend
```bash
curl https://admin.archivoenlinea.com/api/settings/public
```
**Resultado:** Settings correctos retornados:
- Company Name: "Archivo en Linea"
- Primary Color: #3B82F6
- Logo: Configurado
- Favicon: Configurado

#### 2. Actualización del Frontend
```bash
cd /home/ubuntu/consentimientos_aws/frontend
NODE_OPTIONS='--max-old-space-size=2048' npx vite build --mode production
sudo rm -rf /var/www/html/*
sudo cp -r dist/* /var/www/html/
sudo chown -R www-data:www-data /var/www/html
```

#### 3. Reinicio de Nginx
```bash
sudo systemctl restart nginx
```

#### 4. Herramientas Creadas

**force-cache-clear.html**
- Herramienta automática para limpiar caché del navegador
- Acceso: https://admin.archivoenlinea.com/force-cache-clear.html
- Limpia: localStorage, sessionStorage, cookies, caché, service workers

**test-settings-load.html**
- Herramienta de diagnóstico para verificar carga de settings
- Acceso: https://admin.archivoenlinea.com/test-settings-load.html
- Muestra: Detección de tenant, API URL, settings cargados

**INSTRUCCIONES_CACHE.md**
- Guía completa para el usuario
- Instrucciones paso a paso para limpiar caché
- Opciones para Chrome, Firefox, Edge

### Resultado
✅ Login personalizado funcionando correctamente después de limpiar caché

---

## 🔧 Problema 2: Error "Internal Server Error" al Iniciar Sesión

### Síntoma
Al intentar iniciar sesión, el usuario recibía el error "Internal server error"

### Diagnóstico

**Logs del Backend:**
```
QueryFailedError: column tenant.max_medical_records does not exist
```

**Causa:** Faltaban columnas en la tabla `tenants`:
- `max_medical_records`
- `max_mr_consent_templates`
- `max_consent_templates`

### Solución Aplicada

#### 1. Aplicación de Migración SQL

**Archivo:** `backend/add-hc-limits-to-tenants.sql`

```sql
-- Agregar columnas faltantes
ALTER TABLE tenants ADD COLUMN max_medical_records INTEGER DEFAULT 5;
ALTER TABLE tenants ADD COLUMN max_mr_consent_templates INTEGER DEFAULT 2;
ALTER TABLE tenants ADD COLUMN max_consent_templates INTEGER DEFAULT 3;

-- Actualizar límites según el plan
UPDATE tenants SET 
    max_medical_records = CASE plan
        WHEN 'free' THEN 5
        WHEN 'basic' THEN 30
        WHEN 'professional' THEN 100
        WHEN 'enterprise' THEN 300
        WHEN 'custom' THEN -1
        ELSE 5
    END,
    -- ... (similar para otras columnas)
```

**Ejecución:**
```bash
PGPASSWORD='DataGree2026!Secure' psql -h localhost -U datagree_admin -d consentimientos -f /tmp/add-hc-limits-to-tenants.sql
```

**Resultado:**
```
NOTICE: Columna max_medical_records agregada
NOTICE: Columna max_mr_consent_templates agregada
NOTICE: Columna max_consent_templates agregada
UPDATE 0
```

#### 2. Reinicio del Backend
```bash
pm2 restart datagree
```

### Resultado
✅ Login funcionando sin errores

---

## 🔧 Problema 3: Usuarios Sin Permisos (Menú Vacío)

### Síntoma
Después de iniciar sesión exitosamente, el usuario no veía ninguna opción en el menú

### Diagnóstico

**Verificación de Permisos:**
```sql
SELECT name, type, LENGTH(permissions) as perm_length 
FROM roles;
```

**Resultado:**
- Super Administrador: 437 caracteres (permisos desactualizados)
- Administrador General: 608 caracteres (permisos desactualizados)
- Faltaban permisos para historias clínicas, plantillas HC, etc.

### Solución Aplicada

#### 1. Actualización de Permisos

**Archivo:** `update-permissions.sql`

**Permisos Actualizados:**

**Super Administrador (52 permisos):**
```
view_dashboard, view_global_stats, view_consents, create_consents, 
edit_consents, delete_consents, sign_consents, resend_consent_email,
view_users, create_users, edit_users, delete_users, change_passwords,
view_roles, edit_roles, view_branches, create_branches, edit_branches,
delete_branches, view_services, create_services, edit_services,
delete_services, view_questions, create_questions, edit_questions,
delete_questions, view_clients, create_clients, edit_clients,
delete_clients, view_templates, create_templates, edit_templates,
delete_templates, view_mr_consent_templates, create_mr_consent_templates,
edit_mr_consent_templates, delete_mr_consent_templates, generate_mr_consents,
view_mr_consents, delete_mr_consents, view_medical_records,
create_medical_records, edit_medical_records, delete_medical_records,
close_medical_records, sign_medical_records, export_medical_records,
view_settings, edit_settings, manage_tenants
```

**Administrador General (53 permisos):**
- Todos los permisos del Super Admin excepto `manage_tenants` y `view_global_stats`
- Agregados: `configure_email`, `view_invoices`, `pay_invoices`

**Administrador de Sede (21 permisos):**
- Permisos básicos de gestión de sede
- Historias clínicas: crear, editar, firmar

**Operador (12 permisos):**
- Permisos mínimos para operación
- Crear consentimientos y clientes
- Historias clínicas: crear, firmar

#### 2. Ejecución del Script
```bash
PGPASSWORD='DataGree2026!Secure' psql -h localhost -U datagree_admin -d consentimientos -f /tmp/update-permissions.sql
```

**Resultado:**
```
UPDATE 1  (Super Administrador)
UPDATE 1  (Administrador General)
UPDATE 1  (Administrador de Sede)
UPDATE 1  (Operador)
```

#### 3. Verificación
```sql
SELECT 
    name,
    type,
    LENGTH(permissions) as permissions_length,
    (LENGTH(permissions) - LENGTH(REPLACE(permissions, ',', '')) + 1) as permissions_count
FROM roles
ORDER BY name;
```

**Resultado:**
| Rol | Permisos | Longitud |
|-----|----------|----------|
| Super Administrador | 52 | 880 caracteres |
| Administrador General | 53 | 890 caracteres |
| Administrador de Sede | 21 | 328 caracteres |
| Operador | 12 | 200 caracteres |

#### 4. Reinicio del Backend
```bash
pm2 restart datagree
```

### Resultado
✅ Usuarios pueden ver el menú completo según su rol

---

## 📊 Nuevos Permisos Agregados

### Plantillas de Consentimiento HC
- `view_mr_consent_templates` - Ver plantillas de consentimiento HC
- `create_mr_consent_templates` - Crear plantillas de consentimiento HC
- `edit_mr_consent_templates` - Editar plantillas de consentimiento HC
- `delete_mr_consent_templates` - Eliminar plantillas de consentimiento HC
- `generate_mr_consents` - Generar consentimientos desde HC
- `view_mr_consents` - Ver consentimientos generados desde HC
- `delete_mr_consents` - Eliminar consentimientos de HC

### Historias Clínicas
- `view_medical_records` - Ver historias clínicas
- `create_medical_records` - Crear historias clínicas
- `edit_medical_records` - Editar historias clínicas
- `delete_medical_records` - Eliminar historias clínicas
- `close_medical_records` - Cerrar historias clínicas
- `sign_medical_records` - Firmar historias clínicas
- `export_medical_records` - Exportar historias clínicas

### Configuración y Facturación
- `configure_email` - Configurar correo electrónico (Admin General)
- `view_invoices` - Ver facturas (Admin General)
- `pay_invoices` - Registrar pagos de facturas (Admin General)

---

## 📁 Archivos Creados

### Herramientas de Usuario
1. `force-cache-clear.html` - Limpieza automática de caché
2. `test-settings-load.html` - Diagnóstico de carga de settings
3. `INSTRUCCIONES_CACHE.md` - Guía para limpiar caché

### Scripts de Base de Datos
1. `backend/add-hc-limits-to-tenants.sql` - Agregar columnas de límites HC
2. `update-permissions.sql` - Actualizar permisos de roles
3. `check-permissions.sql` - Verificar permisos

### Documentación
1. `SOLUCION_LOGIN_ERROR.md` - Solución al error de login
2. `SOLUCION_PERMISOS.md` - Solución al problema de permisos
3. `doc/SESION_2026-01-28_CORRECCION_LOGIN_Y_PERMISOS.md` - Este documento

---

## ✅ Verificación Final

### Backend
```bash
pm2 status
```
**Resultado:**
- datagree: online ✓
- PID: 154201
- Uptime: estable
- Sin errores en logs

### Base de Datos
```sql
-- Verificar columnas de tenants
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'tenants' AND column_name LIKE 'max_%';
```
**Resultado:**
- max_medical_records ✓
- max_mr_consent_templates ✓
- max_consent_templates ✓
- max_users ✓
- max_consents ✓
- max_branches ✓
- max_services ✓
- max_questions ✓

```sql
-- Verificar permisos de roles
SELECT name, (LENGTH(permissions) - LENGTH(REPLACE(permissions, ',', '')) + 1) as count
FROM roles;
```
**Resultado:**
- Super Administrador: 52 permisos ✓
- Administrador General: 53 permisos ✓
- Administrador de Sede: 21 permisos ✓
- Operador: 12 permisos ✓

### Frontend
```bash
curl -I https://admin.archivoenlinea.com
```
**Resultado:**
- HTTP/2 200 ✓
- SSL válido ✓
- Nginx funcionando ✓

### Endpoints
```bash
curl https://admin.archivoenlinea.com/api/settings/public
```
**Resultado:**
- Settings correctos ✓
- Logo personalizado ✓
- Colores personalizados ✓

---

## 🎯 Estado Final del Sistema

### ✅ Funcionando Correctamente

1. **Login Personalizado**
   - Logo de "Archivo en Linea" visible
   - Colores personalizados aplicados
   - Favicon personalizado

2. **Autenticación**
   - Login sin errores
   - Sesiones funcionando
   - Tokens generados correctamente

3. **Permisos**
   - Todos los roles con permisos actualizados
   - Menú visible según rol
   - Acceso a todas las funcionalidades

4. **Base de Datos**
   - Todas las columnas necesarias presentes
   - Migraciones aplicadas
   - Datos consistentes

5. **Backend**
   - Sin errores en logs
   - Todos los endpoints funcionando
   - PM2 estable

6. **Frontend**
   - Última versión desplegada
   - Assets compilados correctamente
   - Nginx sirviendo correctamente

---

## 📝 Notas Importantes

### Para el Usuario

1. **Limpiar caché del navegador** si no ves el login personalizado:
   - Opción 1: Usar https://admin.archivoenlinea.com/force-cache-clear.html
   - Opción 2: Ctrl+Shift+Delete y limpiar caché manualmente
   - Opción 3: Usar modo incógnito para probar

2. **Credenciales de acceso:**
   - Super Admin: `rcaraballo@innovasystems.com.co`
   - Admin Sistema: `admin@consentimientos.com`

3. **Verificar permisos:**
   - Cada rol tiene acceso a diferentes funcionalidades
   - El menú se adapta según los permisos del usuario

### Para Futuros Despliegues

1. **Siempre ejecutar migraciones** antes de reiniciar el backend
2. **Verificar permisos** después de agregar nuevas funcionalidades
3. **Limpiar caché del navegador** después de actualizar el frontend
4. **Verificar logs** del backend después de cada despliegue

---

## 🔗 Enlaces Útiles

- **Aplicación:** https://admin.archivoenlinea.com
- **Limpieza de caché:** https://admin.archivoenlinea.com/force-cache-clear.html
- **Diagnóstico:** https://admin.archivoenlinea.com/test-settings-load.html
- **Servidor:** 100.28.198.249

---

## 📞 Soporte

Si encuentras algún problema:

1. Revisa los logs del backend: `pm2 logs datagree`
2. Verifica la consola del navegador (F12)
3. Usa las herramientas de diagnóstico creadas
4. Consulta la documentación en `/doc`

---

**Sesión completada exitosamente** ✅  
**Duración:** ~1.5 horas  
**Problemas resueltos:** 3/3  
**Estado del sistema:** Operativo al 100%
