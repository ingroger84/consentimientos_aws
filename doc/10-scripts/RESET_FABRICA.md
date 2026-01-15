# 🏭 Resetear Base de Datos a Estado de Fábrica

## ✅ Completado

La base de datos ha sido reseteada exitosamente a estado de fábrica.

## 📊 Estado Actual

### Datos Eliminados
- ✅ Todos los consentimientos (21)
- ✅ Todas las respuestas
- ✅ Todas las preguntas (5)
- ✅ Todos los servicios (4)
- ✅ Todas las sedes (5)
- ✅ Todos los tenants (1)
- ✅ Todos los usuarios excepto Super Admin (4)
- ✅ Todas las relaciones usuarios-sedes

### Datos Conservados
- ✅ **1 Usuario**: Super Admin
- ✅ **4 Roles**: Super Administrador, Administrador General, Administrador de Sede, Operador
- ✅ **Estructura de tablas**: Todas las tablas y relaciones intactas

## 🔐 Credenciales de Acceso

### Super Admin (Único usuario en el sistema)
```
URL: http://localhost:5173/login

📧 Email:    superadmin@sistema.com
🔑 Password: superadmin123

✨ Permisos:
   - Acceso completo al sistema
   - Gestión de tenants
   - Ver estadísticas globales
   - Crear y administrar todo
```

## 🚀 Próximos Pasos

### 1. Crear tu Primer Tenant

1. **Inicia sesión** como Super Admin
2. **Ve a la sección "Tenants"** en el menú lateral
3. **Click en "+ Nuevo Tenant"**
4. **Completa el formulario**:
   ```
   Nombre: Mi Clínica
   Slug: mi-clinica
   Estado: Activo
   Plan: Professional (recomendado)
   
   Contacto:
   - Nombre: Tu nombre
   - Email: admin@miclinica.com
   - Teléfono: +57 300 123 4567
   
   Límites:
   - Usuarios: 50
   - Sedes: 20
   - Consentimientos: 5000
   ```
5. **Click en "Crear"**

### 2. Crear Usuarios del Tenant

1. **Ve a "Usuarios"**
2. **Click en "+ Nuevo Usuario"**
3. **Completa el formulario**:
   ```
   Nombre: Admin de Mi Clínica
   Email: admin@miclinica.com
   Password: (tu contraseña segura)
   Rol: Administrador General
   Tenant: Mi Clínica
   ```

### 3. Crear Sedes

1. **Ve a "Sedes"**
2. **Click en "+ Nueva Sede"**
3. **Completa el formulario**:
   ```
   Nombre: Sede Principal
   Dirección: Calle 123 #45-67
   Teléfono: +57 1 234 5678
   Email: principal@miclinica.com
   ```

### 4. Crear Servicios

1. **Ve a "Servicios"**
2. **Click en "+ Nuevo Servicio"**
3. **Completa el formulario**:
   ```
   Nombre: Procedimiento Estético
   Descripción: Consentimiento para procedimientos estéticos
   ```

### 5. Crear Preguntas

1. **Ve a "Preguntas"**
2. **Click en "+ Nueva Pregunta"**
3. **Completa el formulario**:
   ```
   Servicio: Procedimiento Estético
   Pregunta: ¿Tiene alergias a medicamentos?
   Tipo: Sí/No
   Requerida: Sí
   Crítica: Sí
   ```

## 🔄 Cómo Resetear Nuevamente

Si necesitas resetear la base de datos nuevamente en el futuro:

### Opción 1: Usando npm script (Recomendado)
```bash
cd backend
npm run reset:factory
```

### Opción 2: Usando ts-node directamente
```bash
cd backend
npx ts-node reset-to-factory.ts
```

## ⚠️ Advertencias Importantes

### ❌ NO se eliminan automáticamente:
- **Archivos subidos** en `backend/uploads/`
- **Configuración** del sistema
- **Estructura de la base de datos**

### Para limpiar archivos subidos manualmente:
```bash
# Windows
cd backend
rmdir /s /q uploads
mkdir uploads

# Linux/Mac
cd backend
rm -rf uploads
mkdir uploads
```

## 📋 Checklist Post-Reset

Después de resetear, verifica:

- [ ] Puedes iniciar sesión con superadmin@sistema.com
- [ ] Ves la opción "Tenants" en el menú
- [ ] Puedes crear un nuevo tenant
- [ ] Puedes crear usuarios para el tenant
- [ ] Puedes crear sedes
- [ ] Puedes crear servicios
- [ ] Puedes crear preguntas
- [ ] Puedes crear consentimientos

## 🎯 Casos de Uso

### Cuándo usar Reset a Fábrica:

1. **Desarrollo**: Limpiar datos de prueba
2. **Testing**: Empezar con datos limpios
3. **Demo**: Preparar el sistema para una demostración
4. **Producción Nueva**: Inicializar un sistema nuevo
5. **Migración**: Antes de importar datos reales

### Cuándo NO usar Reset a Fábrica:

1. **Producción con datos reales**: Perderás todos los datos
2. **Sistema en uso**: Los usuarios perderán acceso
3. **Sin backup**: Siempre haz backup antes de resetear

## 💾 Backup Antes de Resetear

Siempre haz un backup antes de resetear:

```bash
# Backup de PostgreSQL
pg_dump -U admin -d consentimientos > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar desde backup
psql -U admin -d consentimientos < backup_20250105_120000.sql
```

## 📊 Estadísticas del Reset

```
Antes del Reset:
- Tenants: 1
- Usuarios: 5
- Roles: 4
- Sedes: 5
- Servicios: 4
- Preguntas: 5
- Consentimientos: 21

Después del Reset:
- Tenants: 0
- Usuarios: 1 (Super Admin)
- Roles: 4
- Sedes: 0
- Servicios: 0
- Preguntas: 0
- Consentimientos: 0
```

## 🔧 Troubleshooting

### Error: "No se encontró el rol super_admin"
**Solución**: El script creará automáticamente el rol si no existe.

### Error: "Cannot connect to database"
**Solución**: Verifica que PostgreSQL esté corriendo y las credenciales sean correctas.

### Error: "Foreign key constraint"
**Solución**: El script maneja automáticamente el orden de eliminación para evitar este error.

### Los archivos en /uploads siguen ahí
**Solución**: Esto es normal. Elimínalos manualmente si lo deseas.

## 📞 Soporte

Si tienes problemas con el reset:

1. Verifica que el backend esté detenido
2. Verifica las credenciales de la base de datos
3. Revisa los logs del script
4. Contacta al equipo de desarrollo

## 🎉 ¡Listo!

Tu sistema está ahora en estado de fábrica, listo para configurar desde cero con tus propios datos.

**Siguiente paso**: Inicia sesión como Super Admin y crea tu primer tenant.
