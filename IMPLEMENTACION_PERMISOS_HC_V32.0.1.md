# Implementación de Permisos para Botones HC
## Versión 32.0.1 - Vista Previa y Enviar Email

---

## 🎯 OBJETIVO

Implementar permisos para los botones de **Vista Previa** y **Enviar Email** en Historias Clínicas, permitiendo que los administradores controlen qué usuarios pueden ver y usar estas funcionalidades desde la gestión de Roles y Permisos.

---

## 📋 CAMBIOS IMPLEMENTADOS

### 1. Nuevos Permisos Creados

#### `preview_medical_records`
- **Nombre:** Vista previa de historias clínicas
- **Descripción:** Permite ver la vista previa del PDF de consentimientos de historias clínicas
- **Categoría:** medical_records
- **Icono en UI:** 📄 (verde)

#### `send_email_medical_records`
- **Nombre:** Enviar historias clínicas por email
- **Descripción:** Permite enviar consentimientos de historias clínicas por correo electrónico
- **Categoría:** medical_records
- **Icono en UI:** ✉️ (morado)

---

### 2. Archivos Modificados

#### Backend (4 archivos)
```
✓ backend/src/auth/constants/permissions.ts
  - Agregados permisos PREVIEW_MEDICAL_RECORDS y SEND_EMAIL_MEDICAL_RECORDS
  - Agregadas descripciones de permisos
  - Agregados a grupos de permisos por categoría
  - Agregados a roles por defecto (Super Admin, Admin General, Operador)

✓ backend/add-preview-email-permissions.sql
  - Script SQL para crear permisos en base de datos
  - Asignación automática a roles existentes
  - Verificación de permisos creados

✓ backend/apply-preview-email-permissions.js
  - Script Node.js para aplicar permisos
  - Conexión a base de datos
  - Creación y asignación automática
  - Verificación final

✓ backend/src/config/version.ts
  - Actualizado a 32.0.1
```

#### Frontend (2 archivos)
```
✓ frontend/src/pages/MedicalRecordsPage.tsx
  - Agregada verificación de permisos con hasPermission()
  - Botones condicionalmente visibles según permisos
  - Aplicado en vista de tabla y vista de tarjetas

✓ frontend/src/pages/SuperAdminMedicalRecordsPage.tsx
  - Comentarios actualizados (Super Admin siempre tiene acceso)
  - Consistencia con implementación de permisos

✓ frontend/src/config/version.ts
  - Actualizado a 32.0.1
```

---

## 🚀 INSTRUCCIONES DE DESPLIEGUE

### Paso 1: Aplicar Permisos en Base de Datos

#### Opción A: Usando Script Node.js (Recomendado)

```bash
# En el servidor de producción
cd /home/ubuntu/consentimientos_aws/backend
node apply-preview-email-permissions.js
```

**Salida esperada:**
```
✓ Conectado a la base de datos

1. Creando permisos...
  ✓ Permiso "preview_medical_records" creado
  ✓ Permiso "send_email_medical_records" creado

2. Asignando permisos a Super Admin...
  ✓ Permisos asignados a Super Admin

3. Asignando permisos a Admin General...
  ✓ Permisos asignados a Admin General: Admin General

4. Asignando permisos a Operador...
  ✓ Permisos asignados a Operador: Operador

5. Verificación final...
  Permisos asignados:
    - super_admin (Super Admin): preview_medical_records
    - super_admin (Super Admin): send_email_medical_records
    - admin_general (Admin General): preview_medical_records
    - admin_general (Admin General): send_email_medical_records
    - operador (Operador): preview_medical_records
    - operador (Operador): send_email_medical_records

✅ Permisos aplicados exitosamente

Resumen:
  - Permisos creados: 2
  - Roles actualizados: 3
  - Total asignaciones: 6
```

#### Opción B: Usando Script SQL

```bash
# Conectar a PostgreSQL
psql -h localhost -U datagree_admin -d datagree_db

# Ejecutar script
\i /home/ubuntu/consentimientos_aws/backend/add-preview-email-permissions.sql
```

---

### Paso 2: Desplegar Backend y Frontend

```bash
# Desde tu máquina local

# 1. Crear archivos comprimidos
tar -czf backend-dist-v32.0.1.tar.gz -C backend dist
tar -czf frontend-dist-v32.0.1.tar.gz -C frontend dist

# 2. Subir al servidor
scp -i AWS-ISSABEL.pem backend-dist-v32.0.1.tar.gz ubuntu@100.28.198.249:~/
scp -i AWS-ISSABEL.pem frontend-dist-v32.0.1.tar.gz ubuntu@100.28.198.249:~/

# 3. Desplegar en servidor
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 << 'EOF'
  # Backend
  cd /home/ubuntu/consentimientos_aws/backend
  rm -rf dist
  tar -xzf ~/backend-dist-v32.0.1.tar.gz
  sudo chown -R ubuntu:ubuntu dist
  sudo chmod -R 755 dist
  
  # Frontend
  cd /home/ubuntu/consentimientos_aws/frontend
  rm -rf dist
  tar -xzf ~/frontend-dist-v32.0.1.tar.gz
  sudo chown -R ubuntu:ubuntu dist
  sudo chmod -R 755 dist
  
  # Reiniciar servicios
  pm2 restart datagree
  sudo systemctl reload nginx
  
  # Limpiar
  rm ~/backend-dist-v32.0.1.tar.gz
  rm ~/frontend-dist-v32.0.1.tar.gz
  
  echo "✅ Despliegue completado"
EOF
```

---

## 🔍 VERIFICACIÓN

### 1. Verificar Permisos en Base de Datos

```sql
-- Verificar que los permisos existen
SELECT id, name, description, category 
FROM permissions 
WHERE name IN ('preview_medical_records', 'send_email_medical_records');

-- Verificar asignación a roles
SELECT 
    r.type as role_type,
    r.name as role_name,
    p.name as permission_name,
    p.description
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE p.name IN ('preview_medical_records', 'send_email_medical_records')
ORDER BY r.type, p.name;
```

**Resultado esperado:**
```
role_type     | role_name      | permission_name              | description
--------------+----------------+------------------------------+----------------------------------
super_admin   | Super Admin    | preview_medical_records      | Vista previa de historias clínicas
super_admin   | Super Admin    | send_email_medical_records   | Enviar historias clínicas por email
admin_general | Admin General  | preview_medical_records      | Vista previa de historias clínicas
admin_general | Admin General  | send_email_medical_records   | Enviar historias clínicas por email
operador      | Operador       | preview_medical_records      | Vista previa de historias clínicas
operador      | Operador       | send_email_medical_records   | Enviar historias clínicas por email
```

---

### 2. Verificar en la Interfaz

#### Como Admin General o Operador:

1. **Limpiar caché del navegador:**
   ```
   Ctrl + Shift + R (Windows/Linux)
   Cmd + Shift + R (Mac)
   ```

2. **Iniciar sesión:**
   ```
   URL: https://[tenant].archivoenlinea.com
   Usuario: Admin General o Operador
   ```

3. **Ir a Historias Clínicas:**
   ```
   Menú lateral → Historias Clínicas
   ```

4. **Verificar botones visibles:**
   - ✅ Botón 📄 Vista Previa (verde) - visible
   - ✅ Botón ✉️ Enviar Email (morado) - visible

5. **Probar funcionalidad:**
   - Hacer clic en Vista Previa → debe abrir modal con PDF
   - Hacer clic en Enviar Email → debe enviar correo

---

### 3. Verificar Gestión de Permisos

#### Como Super Admin:

1. **Ir a Roles y Permisos:**
   ```
   URL: https://admin.archivoenlinea.com/roles
   ```

2. **Editar un rol (ej: Operador):**
   - Buscar sección "Historias Clínicas"
   - Verificar que aparecen los nuevos permisos:
     - ✅ Vista previa de historias clínicas
     - ✅ Enviar historias clínicas por email

3. **Probar desactivar permisos:**
   - Desmarcar "Vista previa de historias clínicas"
   - Guardar cambios
   - Iniciar sesión como Operador
   - Verificar que el botón 📄 ya NO aparece

4. **Probar reactivar permisos:**
   - Marcar nuevamente el permiso
   - Guardar cambios
   - Recargar página como Operador
   - Verificar que el botón 📄 vuelve a aparecer

---

## 📊 COMPORTAMIENTO POR ROL

### Super Admin
- ✅ Siempre tiene acceso a todos los botones
- ✅ No se puede desactivar (tiene todos los permisos)
- ✅ Puede gestionar permisos de otros roles

### Admin General
- ✅ Tiene permisos por defecto
- ✅ Super Admin puede desactivar permisos
- ✅ Si se desactiva, botones no aparecen

### Operador
- ✅ Tiene permisos por defecto
- ✅ Super Admin puede desactivar permisos
- ✅ Si se desactiva, botones no aparecen

### Roles Personalizados
- ⚠️ NO tienen permisos por defecto
- ✅ Super Admin debe activarlos manualmente
- ✅ Aparecen en la sección "Historias Clínicas"

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### Problema 1: Botones no aparecen después del despliegue

**Causa:** Caché del navegador

**Solución:**
```
1. Presionar Ctrl + Shift + R varias veces
2. Abrir ventana de incógnito
3. Verificar versión en consola: console.log(APP_VERSION)
```

---

### Problema 2: Permisos no aparecen en Roles y Permisos

**Causa:** Script de permisos no ejecutado

**Solución:**
```bash
# Ejecutar script de permisos
cd /home/ubuntu/consentimientos_aws/backend
node apply-preview-email-permissions.js

# Verificar en base de datos
psql -h localhost -U datagree_admin -d datagree_db -c "
SELECT name FROM permissions 
WHERE name IN ('preview_medical_records', 'send_email_medical_records');
"
```

---

### Problema 3: Botones aparecen pero no funcionan

**Causa:** Backend no actualizado

**Solución:**
```bash
# Verificar versión del backend
pm2 logs datagree --lines 20

# Reiniciar PM2
pm2 restart datagree
pm2 save

# Verificar estado
pm2 status
```

---

### Problema 4: Error al aplicar permisos

**Causa:** Conexión a base de datos incorrecta

**Solución:**
```bash
# Verificar variables de entorno
cat /home/ubuntu/consentimientos_aws/backend/.env | grep DB_

# Verificar conexión
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT 1;"

# Ejecutar script con logs
node apply-preview-email-permissions.js 2>&1 | tee permissions-log.txt
```

---

## 📝 NOTAS IMPORTANTES

1. **Permisos por Defecto:**
   - Super Admin, Admin General y Operador tienen los permisos activados por defecto
   - Roles personalizados NO tienen los permisos por defecto

2. **Compatibilidad:**
   - Los cambios son retrocompatibles
   - No afecta funcionalidad existente
   - Solo agrega control de permisos

3. **Super Admin:**
   - Siempre tiene acceso completo
   - No se puede desactivar sus permisos
   - Puede gestionar permisos de otros roles

4. **Caché:**
   - Siempre limpiar caché después del despliegue
   - Usar Ctrl + Shift + R
   - Considerar ventana de incógnito para verificar

5. **Base de Datos:**
   - Los permisos se crean una sola vez
   - El script verifica si ya existen antes de crear
   - Es seguro ejecutar el script múltiples veces

---

## ✅ CHECKLIST DE DESPLIEGUE

- [ ] Backend compilado (`npm run build` en backend/)
- [ ] Frontend compilado (`npm run build` en frontend/)
- [ ] Script de permisos ejecutado en base de datos
- [ ] Backend desplegado en servidor
- [ ] Frontend desplegado en servidor
- [ ] PM2 reiniciado
- [ ] Nginx recargado
- [ ] Permisos verificados en base de datos
- [ ] Botones visibles en interfaz (Admin General)
- [ ] Botones visibles en interfaz (Operador)
- [ ] Permisos aparecen en Roles y Permisos
- [ ] Funcionalidad de Vista Previa probada
- [ ] Funcionalidad de Enviar Email probada
- [ ] Desactivar/activar permisos probado
- [ ] GitHub actualizado

---

## 🎉 RESULTADO FINAL

### Antes
- ❌ Botones siempre visibles para todos los usuarios
- ❌ No se podía controlar acceso desde Roles y Permisos
- ❌ Falta de granularidad en permisos de HC

### Después
- ✅ Botones controlados por permisos
- ✅ Super Admin puede activar/desactivar por rol
- ✅ Granularidad completa en permisos de HC
- ✅ Roles personalizados pueden configurarse
- ✅ Mejor control de acceso y seguridad

---

**Versión:** 32.0.1  
**Fecha:** 2026-02-09  
**Estado:** ✅ LISTO PARA DESPLEGAR  
**Servidor:** archivoenlinea.com (100.28.198.249)
