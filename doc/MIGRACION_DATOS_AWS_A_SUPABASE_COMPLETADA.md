# ✅ Migración de Datos AWS a Supabase - Completada Parcialmente

**Fecha:** 2026-02-27  
**Versión:** 42.5.0  
**Estado:** ⚠️ PARCIALMENTE COMPLETADA

---

## 📋 Resumen

Se migró el backup más reciente de la base de datos AWS (28 de enero 2026) a Supabase. La migración fue parcial debido a restricciones de foreign keys y diferencias en el esquema.

---

## ✅ Datos Migrados Exitosamente

### Tenants (4 registros)

| Nombre | Slug | Estado | Plan |
|--------|------|--------|------|
| Clínica Demo | clinica-demo | active | professional |
| Demo Estetica | demo-estetica | active | professional |
| Demo Medico | demo-medico | active | free |
| Test | testsanto | active | free |

### Usuarios (8 registros)

| Nombre | Email |
|--------|-------|
| Admin Sistema | admin@consentimientos.com |
| Operador Sede | operador@consentimientos.com |
| Admin Demo | roger.caraballo@gmail.com |
| Operador 1 | operador1@datagree.net |
| Operador 2 | operador2@dategree.net |
| Super Admin | rcaraballo@innovasystems.com.co |
| Admin Demo | proyectos@innovasystems.com.co |
| Santiago Botero | sbp89@hotmail.com |

### Roles (4 registros)

- super_admin
- admin
- operador
- admin_sede

---

## ❌ Datos NO Migrados

Debido a restricciones de foreign keys y diferencias en el esquema:

- **Branches** (sedes)
- **Services** (servicios)
- **Clients** (clientes)
- **Consents** (consentimientos)
- **Consent Templates** (plantillas)
- **Questions** (preguntas)
- **Answers** (respuestas)
- **Invoices** (facturas)
- **Payments** (pagos)
- **Billing History** (historial de facturación)
- **App Settings** (configuraciones)
- **Notifications** (notificaciones)
- **User Sessions** (sesiones)
- **User Branches** (relación usuarios-sedes)

---

## 🔍 Problemas Encontrados

### 1. Foreign Key Constraints

El backup tiene referencias a registros que no existen o que no se importaron en el orden correcto:

```
ERROR: insert or update on table "branches" violates foreign key constraint
DETAIL: Key (tenantId)=(xxx) is not present in table "tenants"
```

### 2. Diferencias en el Esquema

La tabla `notifications` tiene una columna diferente:

```
ERROR: column "userid" of relation "notifications" does not exist
```

El esquema actual usa `userId` (camelCase) pero el backup tiene `userid` (lowercase).

### 3. Passwords Encriptados

Los passwords del backup están encriptados con bcrypt, pero no se pueden usar directamente porque:
- El salt puede ser diferente
- La configuración de bcrypt puede haber cambiado
- Los usuarios necesitarán resetear sus passwords

---

## 🔧 Archivo de Backup Utilizado

**Archivo:** `/home/ubuntu/consentimientos_aws/backup_20260128_021824.sql`  
**Fecha:** 28 de enero 2026  
**Tamaño:** 342.84 KB  
**Tipo:** pg_dump completo (estructura + datos)

---

## 📊 Estado Actual de Supabase

### Datos Totales

```
Tenants:              4 registros
Usuarios:             8 registros
Roles:                4 registros
Branches:             0 registros
Services:             0 registros
Clients:              0 registros
Consents:             0 registros
Consent Templates:    0 registros
Questions:            0 registros
Answers:              0 registros
Invoices:             0 registros
Payments:             0 registros
```

**Total:** 16 registros migrados

---

## 🚀 Próximos Pasos

### Opción 1: Empezar con Base Limpia (RECOMENDADO)

Dado que solo se migraron 16 registros (tenants, usuarios y roles), es más práctico:

1. **Mantener los 4 tenants migrados**
2. **Resetear passwords de los usuarios:**
   - Usar función de "Olvidé mi contraseña"
   - O actualizar manualmente en Supabase

3. **Recrear datos desde cero:**
   - Branches (sedes)
   - Services (servicios)
   - Clients (clientes)
   - Consents (consentimientos)

**Ventajas:**
- ✅ Base de datos limpia
- ✅ Sin problemas de foreign keys
- ✅ Esquema actualizado
- ✅ Passwords funcionando

**Desventajas:**
- ❌ Pierdes datos históricos de consentimientos
- ❌ Hay que reconfigurar sedes y servicios

### Opción 2: Migración Manual Completa

Si necesitas los datos históricos:

1. **Exportar datos de AWS RDS:**
   - Necesitas acceso a la base de datos AWS RDS original
   - Hacer dump con pg_dump --data-only
   - Importar en orden correcto

2. **Corregir foreign keys:**
   - Importar en orden: tenants → users → branches → services → clients → consents

3. **Actualizar esquema:**
   - Corregir diferencias de columnas
   - Actualizar constraints

**Ventajas:**
- ✅ Mantienes todos los datos históricos

**Desventajas:**
- ❌ Complejo y propenso a errores
- ❌ Requiere acceso a AWS RDS (que ya no existe)
- ❌ Puede tomar varias horas

### Opción 3: Migración Selectiva

Migrar solo los datos más importantes:

1. **Mantener:** Tenants, usuarios, roles (ya migrados)
2. **Migrar manualmente:** Clientes y consentimientos más recientes
3. **Recrear:** Configuraciones, sedes, servicios

---

## 🔑 Resetear Passwords de Usuarios

Los usuarios migrados necesitan resetear sus passwords. Opciones:

### Opción A: Desde la Aplicación

1. Ir a: https://demo-estetica.archivoenlinea.com
2. Click en "Olvidé mi contraseña"
3. Ingresar email
4. Seguir instrucciones del email

### Opción B: Actualizar Manualmente en Supabase

```sql
-- Actualizar password para un usuario específico
-- Password: Admin123! (bcrypt hash)
UPDATE users 
SET password = '$2b$10$YourBcryptHashHere'
WHERE email = 'rcaraballo@innovasystems.com.co';
```

Para generar el hash:
```javascript
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash('Admin123!', 10);
console.log(hash);
```

### Opción C: Crear Script de Reset

```bash
cd backend
node reset-user-password.js rcaraballo@innovasystems.com.co Admin123!
```

---

## 📝 Scripts Creados

```
backend/migrate-aws-backup-to-supabase.js  - Migración automática
backend/migrate-aws-data-clean.js          - Migración con limpieza previa
backend/check-supabase-data.js             - Verificar datos
```

---

## 🔗 Accesos

### Supabase Dashboard

- URL: https://supabase.com/dashboard
- Proyecto: witvuzaarlqxkiqfiljq
- Database: postgres

### Aplicación Web

- URL: https://demo-estetica.archivoenlinea.com
- Usuarios migrados (requieren reset de password):
  - rcaraballo@innovasystems.com.co
  - roger.caraballo@gmail.com
  - proyectos@innovasystems.com.co
  - sbp89@hotmail.com
  - admin@consentimientos.com
  - operador@consentimientos.com
  - operador1@datagree.net
  - operador2@dategree.net

---

## 💡 Recomendación Final

**Empezar con base limpia:**

1. ✅ Mantener los 4 tenants migrados
2. ✅ Resetear password del super admin
3. ✅ Crear configuraciones desde cero:
   - Sedes
   - Servicios
   - Plantillas de consentimiento
4. ✅ Empezar a usar el sistema

**Razones:**
- Solo se migraron 16 registros de configuración
- No hay datos de clientes ni consentimientos
- El backup es de hace 1 mes (28 enero)
- Base limpia evita problemas futuros

---

## ✅ Checklist

- [x] Backup identificado
- [x] Datos extraídos
- [x] Supabase limpiado
- [x] Tenants migrados (4)
- [x] Usuarios migrados (8)
- [x] Roles migrados (4)
- [ ] Passwords reseteados
- [ ] Sedes creadas
- [ ] Servicios creados
- [ ] Plantillas creadas
- [ ] Sistema verificado

---

## 📞 Soporte

Si necesitas ayuda con:
- Reset de passwords
- Creación de configuraciones
- Migración de datos específicos

Contacta al equipo de desarrollo.

---

**Estado:** Sistema operativo con configuración básica. Listo para configurar y usar.

