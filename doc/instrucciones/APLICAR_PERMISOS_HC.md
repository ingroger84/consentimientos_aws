# 🚀 APLICAR PERMISOS DE HC - INSTRUCCIONES SIMPLES

## ✅ DESPLIEGUE COMPLETADO

- ✅ Backend desplegado (v32.0.1)
- ✅ Frontend desplegado (v32.0.1)
- ✅ PM2 reiniciado
- ✅ Nginx recargado

## ⚠️ FALTA: Aplicar Permisos en Base de Datos

Los permisos se deben aplicar manualmente en la base de datos. Aquí tienes 2 opciones:

---

## OPCIÓN 1: Desde pgAdmin o Cliente PostgreSQL (MÁS FÁCIL)

1. **Conectar a la base de datos:**
   - Host: (tu DB_HOST del .env)
   - Usuario: (tu DB_USER del .env)
   - Base de datos: (tu DB_NAME del .env)
   - Contraseña: (tu DB_PASSWORD del .env)

2. **Ejecutar este SQL:**

```sql
-- 1. Crear permisos
INSERT INTO permissions (name, description, category, created_at, updated_at)
SELECT 'preview_medical_records', 'Vista previa de historias clínicas', 'medical_records', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'preview_medical_records');

INSERT INTO permissions (name, description, category, created_at, updated_at)
SELECT 'send_email_medical_records', 'Enviar historias clínicas por email', 'medical_records', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'send_email_medical_records');

-- 2. Asignar a Super Admin
DO $$
DECLARE
    preview_id UUID;
    email_id UUID;
    super_admin_id UUID;
BEGIN
    SELECT id INTO preview_id FROM permissions WHERE name = 'preview_medical_records';
    SELECT id INTO email_id FROM permissions WHERE name = 'send_email_medical_records';
    SELECT id INTO super_admin_id FROM roles WHERE type = 'super_admin' LIMIT 1;
    
    IF preview_id IS NOT NULL AND super_admin_id IS NOT NULL THEN
        INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
        SELECT super_admin_id, preview_id, NOW(), NOW()
        WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_id = super_admin_id AND permission_id = preview_id);
    END IF;
    
    IF email_id IS NOT NULL AND super_admin_id IS NOT NULL THEN
        INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
        SELECT super_admin_id, email_id, NOW(), NOW()
        WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_id = super_admin_id AND permission_id = email_id);
    END IF;
END $$;

-- 3. Asignar a Admin General
DO $$
DECLARE
    preview_id UUID;
    email_id UUID;
    admin_id UUID;
BEGIN
    SELECT id INTO preview_id FROM permissions WHERE name = 'preview_medical_records';
    SELECT id INTO email_id FROM permissions WHERE name = 'send_email_medical_records';
    SELECT id INTO admin_id FROM roles WHERE type = 'admin_general' LIMIT 1;
    
    IF preview_id IS NOT NULL AND admin_id IS NOT NULL THEN
        INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
        SELECT admin_id, preview_id, NOW(), NOW()
        WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_id = admin_id AND permission_id = preview_id);
    END IF;
    
    IF email_id IS NOT NULL AND admin_id IS NOT NULL THEN
        INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
        SELECT admin_id, email_id, NOW(), NOW()
        WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_id = admin_id AND permission_id = email_id);
    END IF;
END $$;

-- 4. Asignar a Operador
DO $$
DECLARE
    preview_id UUID;
    email_id UUID;
    operador_id UUID;
BEGIN
    SELECT id INTO preview_id FROM permissions WHERE name = 'preview_medical_records';
    SELECT id INTO email_id FROM permissions WHERE name = 'send_email_medical_records';
    SELECT id INTO operador_id FROM roles WHERE type = 'operador' LIMIT 1;
    
    IF preview_id IS NOT NULL AND operador_id IS NOT NULL THEN
        INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
        SELECT operador_id, preview_id, NOW(), NOW()
        WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_id = operador_id AND permission_id = preview_id);
    END IF;
    
    IF email_id IS NOT NULL AND operador_id IS NOT NULL THEN
        INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
        SELECT operador_id, email_id, NOW(), NOW()
        WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_id = operador_id AND permission_id = email_id);
    END IF;
END $$;

-- 5. Verificar
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

## OPCIÓN 2: Desde el Servidor (SSH)

```bash
# Conectar al servidor
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249

# Ir al directorio del backend
cd /home/ubuntu/consentimientos_aws/backend

# Obtener credenciales del .env
DB_HOST=$(grep "^DB_HOST=" .env | cut -d"=" -f2)
DB_USER=$(grep "^DB_USER=" .env | cut -d"=" -f2)
DB_NAME=$(grep "^DB_NAME=" .env | cut -d"=" -f2)
DB_PASSWORD=$(grep "^DB_PASSWORD=" .env | cut -d"=" -f2)

# Ejecutar SQL (copia el SQL de la OPCIÓN 1 en un archivo temp.sql)
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f temp.sql
```

---

## ✅ VERIFICACIÓN

Después de aplicar los permisos:

1. **Limpiar caché del navegador:**
   ```
   Ctrl + Shift + R
   ```

2. **Ir a Roles y Permisos:**
   ```
   https://admin.archivoenlinea.com/roles
   ```

3. **Editar rol Admin General:**
   - Buscar sección "Historias Clínicas"
   - Verificar que aparecen:
     - ✅ Vista previa de historias clínicas
     - ✅ Enviar historias clínicas por email

4. **Probar en Historias Clínicas:**
   - Iniciar sesión como Admin General
   - Ir a Historias Clínicas
   - Verificar que aparecen los botones:
     - 📄 Vista Previa (verde)
     - ✉️ Enviar Email (morado)

---

## 📝 NOTAS

- Los permisos se crean una sola vez
- Es seguro ejecutar el SQL múltiples veces (tiene verificación de existencia)
- Super Admin siempre tiene todos los permisos
- Los botones solo aparecen si el usuario tiene los permisos activos

---

**Estado Actual:**
- ✅ Código desplegado
- ⏳ Permisos pendientes de aplicar en BD
- ⏳ Verificación pendiente

**Próximo Paso:**
Ejecutar el SQL de la OPCIÓN 1 en tu cliente PostgreSQL favorito.
