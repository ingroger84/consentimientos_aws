# 🔍 Diagnóstico: Problema Creación de Plantillas - Aquiub

**Fecha:** 22 de Mayo 2026  
**Tenant:** Aquiub Casa de Pestañas  
**Problema:** El botón de crear plantilla se queda azul "creando" y no crea la plantilla

---

## ✅ INFORMACIÓN DEL TENANT

```json
{
  "id": "2852b690-9401-4ad0-bc70-899977696e8d",
  "name": "Aquiub Casa de Pestañas",
  "slug": "aquiub",
  "status": "active",
  "plan": "custom",
  "max_consent_templates": 1000
}
```

**Estado:** ✅ ACTIVO  
**Plan:** Custom  
**Límite de plantillas:** 1000

---

## 📊 ESTADO ACTUAL

### Plantillas Existentes
- **Total:** 7 plantillas
- **Activas:** 7
- **Inactivas:** 0
- **Límite:** 1000

✅ **NO hay problema de límites** (7/1000 = 0.7% usado)

### Plantillas Creadas
1. Consentimiento Informado (28 Mar 2026)
2. Consentimiento Informado (27 Mar 2026)
3. Consentimiento Informado (27 Mar 2026)
4. Consentimiento Informado (27 Mar 2026)
5. Autorización de Derechos de Imagen (26 Mar 2026)
6. Tratamiento de Datos Personales (26 Mar 2026)
7. Consentimiento de Procedimiento (26 Mar 2026)

---

## 🔴 PROBLEMA IDENTIFICADO

El tenant tiene capacidad para crear plantillas (7/1000), pero el botón se queda cargando sin crear la plantilla.

### ⚠️ CAUSA MÁS PROBABLE: Falta Seleccionar Servicio

Después de analizar el código del backend (`consent-templates.service.ts`), he identificado que:

**Las plantillas CN requieren OBLIGATORIAMENTE al menos un servicio asociado.**

```typescript
private async validateServices(serviceIds: string[], tenantId: string | null) {
  if (!serviceIds || serviceIds.length === 0) {
    throw new BadRequestException('Debe asociar al menos un servicio a la plantilla');
  }
}
```

**Síntoma:** Si el usuario intenta crear una plantilla sin seleccionar ningún servicio, el backend lanza un error 400.

### Otras Posibles Causas

1. **Error de Validación de Servicios (MÁS PROBABLE)**
   - No se seleccionó ningún servicio en el formulario
   - El servicio seleccionado no existe o no pertenece al tenant

2. **Error de Límite de Plantillas (DESCARTADO)**
   - ✅ Aquiub tiene 7/1000 plantillas (0.7% usado)
   - ✅ NO es problema de límites

3. **Error de Permisos**
   - Usuario sin permiso `templates.create`
   - Perfil mal configurado

---

## 🔍 PASOS PARA DIAGNOSTICAR

### 1. Verificar Logs del Servidor (CRÍTICO)

```bash
# Conectar al servidor
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249

# Ver logs en tiempo real
pm2 logs datagree --lines 100

# O ver logs recientes
pm2 logs datagree --lines 500 | grep -i "template\|error\|aquiub"
```

**Buscar:**
- Errores 400, 500
- Mensajes de validación
- Stack traces
- Errores de base de datos

### 2. Verificar en el Navegador (Usuario)

**Consola del Navegador (F12):**
1. Abrir DevTools (F12)
2. Ir a la pestaña "Console"
3. Intentar crear una plantilla
4. Buscar errores en rojo

**Network Tab:**
1. Abrir DevTools (F12)
2. Ir a la pestaña "Network"
3. Intentar crear una plantilla
4. Buscar la petición POST a `/api/templates`
5. Ver el código de respuesta (200, 400, 500, etc.)
6. Ver el body de la respuesta

### 3. Verificar Permisos del Usuario

```bash
# En el servidor
node backend/check-aquiub-user-permissions.js
```

---

## 🛠️ SOLUCIONES SEGÚN EL ERROR

### Si es Error 400 (Bad Request)
**Causa:** Datos del formulario inválidos

**Solución:**
- Verificar que todos los campos requeridos estén llenos
- Verificar formato de los datos
- Revisar validaciones en el backend

### Si es Error 403 (Forbidden)
**Causa:** Sin permisos

**Solución:**
```sql
-- Verificar permisos del usuario
SELECT u.email, p.name, p.permissions
FROM users u
JOIN profiles p ON u."profileId" = p.id
WHERE u."tenantId" = '2852b690-9401-4ad0-bc70-899977696e8d';
```

### Si es Error 500 (Internal Server Error)
**Causa:** Error en el servidor

**Solución:**
- Revisar logs del servidor
- Verificar conexión a base de datos
- Verificar que no haya errores de código

### Si es Timeout
**Causa:** La petición tarda demasiado

**Solución:**
- Verificar performance de la base de datos
- Aplicar índices pendientes
- Optimizar query de creación

---

## 📝 SCRIPT DE VERIFICACIÓN DE PERMISOS

He creado un script para verificar los permisos del usuario:

```bash
cd backend
node check-aquiub-user-permissions.js
```

Este script verificará:
- Usuarios del tenant aquiub
- Perfiles asignados
- Permisos de cada perfil
- Específicamente el permiso `templates.create`

---

## 🎯 PRÓXIMOS PASOS INMEDIATOS

### Paso 1: Ver Logs del Servidor
```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
pm2 logs datagree --lines 200 | grep -A 10 -B 10 "template"
```

### Paso 2: Reproducir el Error
1. Pedir al usuario que intente crear una plantilla
2. Mientras tanto, tener los logs abiertos en tiempo real
3. Capturar el error exacto

### Paso 3: Verificar en el Navegador
1. Abrir DevTools (F12)
2. Pestaña Network
3. Intentar crear plantilla
4. Ver la respuesta del servidor

---

## 📊 INFORMACIÓN TÉCNICA

### Endpoint de Creación
```
POST /api/templates
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "name": "Nombre de la plantilla",
  "content": "Contenido...",
  "serviceId": "uuid",
  "isActive": true
}
```

### Validaciones Esperadas
- `name`: requerido, string, max 255 caracteres
- `content`: requerido, string
- `serviceId`: opcional, UUID válido
- `isActive`: opcional, boolean

### Permisos Requeridos
- `templates.create`: true

---

## 🔧 COMANDOS ÚTILES

### Ver Logs en Tiempo Real
```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
pm2 logs datagree --lines 0
# Luego intentar crear la plantilla
```

### Buscar Errores Recientes
```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
pm2 logs datagree --lines 1000 --err
```

### Verificar Estado del Servicio
```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
pm2 status
pm2 describe datagree
```

### Reiniciar Servicio (si es necesario)
```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
pm2 restart datagree
```

---

## 📞 INFORMACIÓN DE CONTACTO

**Servidor:** 100.28.198.249  
**Usuario:** ubuntu  
**Llave:** AWS-ISSABEL.pem  
**Proceso PM2:** datagree  
**Tenant ID:** 2852b690-9401-4ad0-bc70-899977696e8d

---

## ✅ RESUMEN

**Problema:** Botón de crear plantilla se queda cargando  
**Tenant:** Aquiub (activo, plan custom)  
**Límites:** ✅ OK (7/1000 plantillas)  
**Estado:** ✅ Tenant activo  

**Causa Probable:** Error en el backend durante la creación  
**Acción Requerida:** Revisar logs del servidor para identificar el error exacto

**Siguiente Paso:** Ejecutar `pm2 logs datagree` mientras se intenta crear una plantilla

---

**Fecha de Diagnóstico:** 22 de Mayo 2026  
**Script Utilizado:** `diagnose-aquiub-templates.js`
