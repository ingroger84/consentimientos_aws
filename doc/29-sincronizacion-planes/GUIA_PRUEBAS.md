# Guía de Pruebas - Sincronización de Planes

## Versión: 1.1.36
**Fecha:** 2026-01-21

---

## Objetivo

Verificar que los cambios realizados en los planes desde el Super Admin se reflejan automáticamente en la landing page sin necesidad de reiniciar el backend.

---

## Pre-requisitos

1. Acceso al panel de Super Admin
2. Navegador con modo incógnito disponible
3. Acceso SSH al servidor (opcional, para verificación avanzada)

---

## Prueba Completa Paso a Paso

### Paso 1: Estado Inicial

1. Abrir navegador en modo incógnito
2. Ir a: `https://datagree.net`
3. Desplazarse a la sección "Planes"
4. **Anotar** los valores actuales del plan "Básico":
   - Precio mensual: _______
   - Precio anual: _______
   - Límite de usuarios: _______
   - Descripción: _______

### Paso 2: Modificar Plan desde Super Admin

1. En otra pestaña, ir a: `https://admin.datagree.net`
2. Iniciar sesión como Super Admin:
   - Email: `rcaraballo@innovasystems.com.co`
   - Contraseña: (proporcionada por el administrador)

3. Ir a "Gestión de Planes" (o la sección correspondiente)

4. Seleccionar el plan "Básico"

5. Modificar los siguientes campos:
   - **Precio mensual**: Cambiar a `95000` (o cualquier valor diferente)
   - **Límite de usuarios**: Cambiar a `2` (si estaba en 1)
   - **Descripción**: Agregar " - ACTUALIZADO" al final

6. Hacer clic en "Guardar"

7. **Verificar** que aparece un mensaje de éxito

### Paso 3: Verificar Sincronización Inmediata

1. Volver a la pestaña con la landing page (modo incógnito)

2. **Refrescar la página** (F5 o Ctrl+R)

3. Desplazarse nuevamente a la sección "Planes"

4. **Verificar** que el plan "Básico" muestra:
   - ✅ Precio mensual actualizado: `$95,000`
   - ✅ Límite de usuarios actualizado: `2 usuarios`
   - ✅ Descripción actualizada con " - ACTUALIZADO"

5. **Resultado Esperado**: Los cambios se reflejan inmediatamente

### Paso 4: Verificar Persistencia

1. Cerrar todas las pestañas del navegador

2. Abrir nuevamente el navegador en modo incógnito

3. Ir a: `https://datagree.net`

4. Desplazarse a la sección "Planes"

5. **Verificar** que los cambios siguen presentes

6. **Resultado Esperado**: Los cambios persisten después de cerrar el navegador

---

## Pruebas Adicionales

### Prueba A: Modificar Múltiples Campos

1. Modificar varios campos del plan "Emprendedor":
   - Precio mensual
   - Precio anual
   - Límite de sedes
   - Tiempo de respuesta de soporte

2. Guardar cambios

3. Verificar en landing page que todos los campos se actualizaron

### Prueba B: Modificar Plan Popular

1. Cambiar el plan marcado como "popular" (actualmente "Básico")

2. Marcar otro plan como popular (ej: "Emprendedor")

3. Verificar que la etiqueta "Más Popular" se mueve al nuevo plan

### Prueba C: Modificar Características (Features)

1. Modificar las características de un plan:
   - Activar/desactivar "Personalización"
   - Cambiar tipo de backup
   - Modificar tiempo de respuesta de soporte

2. Verificar que las características se actualizan en la landing page

---

## Verificación Técnica (Opcional)

### Verificar Archivo JSON en el Servidor

```bash
# Conectarse al servidor
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249

# Ver contenido del archivo JSON
cat /home/ubuntu/consentimientos_aws/backend/dist/tenants/plans.json

# Buscar el plan modificado
cat /home/ubuntu/consentimientos_aws/backend/dist/tenants/plans.json | grep -A 20 '"basic"'
```

**Resultado Esperado**: El archivo JSON contiene los valores actualizados

### Verificar Logs del Backend

```bash
# Ver logs recientes
pm2 logs datagree-backend --lines 50

# Buscar mensajes de actualización
pm2 logs datagree-backend --lines 100 | grep "Plan.*actualizado"
```

**Resultado Esperado**: Logs muestran mensajes como:
```
[TenantsService] Plan basic actualizado exitosamente
[PlansConfig] Planes cargados desde plans.json
```

### Verificar Endpoint API Directamente

```bash
# Desde tu máquina local
curl https://api.datagree.net/tenants/plans | jq '.[] | select(.id=="basic")'
```

**Resultado Esperado**: La respuesta JSON contiene los valores actualizados

---

## Casos de Error

### Error 1: Cambios no se reflejan

**Síntomas**: Los cambios se guardan pero no aparecen en la landing page

**Soluciones**:

1. Verificar que el archivo JSON existe:
   ```bash
   ls -la /home/ubuntu/consentimientos_aws/backend/dist/tenants/plans.json
   ```

2. Reiniciar el backend:
   ```bash
   pm2 restart datagree-backend
   ```

3. Limpiar caché del navegador:
   - Ctrl + Shift + Delete
   - Seleccionar "Imágenes y archivos en caché"
   - Hacer clic en "Borrar datos"

### Error 2: Error al guardar cambios

**Síntomas**: Aparece un error al intentar guardar cambios en el plan

**Soluciones**:

1. Verificar permisos del archivo:
   ```bash
   chmod 644 /home/ubuntu/consentimientos_aws/backend/dist/tenants/plans.json
   ```

2. Verificar logs de error:
   ```bash
   pm2 logs datagree-backend --err --lines 50
   ```

3. Verificar que el usuario tiene permisos de Super Admin

### Error 3: Plan no se encuentra

**Síntomas**: Error "Plan no encontrado" al intentar actualizar

**Soluciones**:

1. Verificar que el ID del plan es correcto (free, basic, professional, enterprise, custom)

2. Verificar que el archivo JSON no está corrupto:
   ```bash
   cat /home/ubuntu/consentimientos_aws/backend/dist/tenants/plans.json | jq .
   ```

---

## Checklist de Pruebas

- [ ] Los cambios en precio mensual se reflejan en la landing page
- [ ] Los cambios en precio anual se reflejan en la landing page
- [ ] Los cambios en límites se reflejan en la landing page
- [ ] Los cambios en descripción se reflejan en la landing page
- [ ] Los cambios en características se reflejan en la landing page
- [ ] El plan marcado como "popular" muestra la etiqueta correcta
- [ ] Los cambios persisten después de refrescar la página
- [ ] Los cambios persisten después de cerrar el navegador
- [ ] Los cambios persisten después de reiniciar el backend
- [ ] El archivo JSON se actualiza correctamente
- [ ] Los logs muestran mensajes de actualización exitosa
- [ ] El endpoint API devuelve los valores actualizados

---

## Resultados Esperados

✅ **Todos los cambios realizados desde el Super Admin se reflejan inmediatamente en la landing page**

✅ **No es necesario reiniciar el backend para ver los cambios**

✅ **Los cambios persisten después de reinicios del servidor**

✅ **El sistema funciona de manera transparente para los usuarios**

---

## Notas Importantes

1. **Caché del Navegador**: Los usuarios que ya tienen la página cargada necesitan refrescar (F5) para ver los cambios

2. **Tiempo de Propagación**: Los cambios son inmediatos, pero pueden tardar 1-2 segundos en propagarse debido a la latencia de red

3. **Validación**: El sistema valida que los datos sean correctos antes de guardar

4. **Seguridad**: Solo usuarios con permisos de Super Admin pueden modificar planes

5. **Backup**: Se recomienda hacer backup del archivo `plans.json` antes de realizar cambios importantes

---

## Contacto

Si encuentras algún problema durante las pruebas, contacta al equipo de desarrollo con:

- Descripción del problema
- Pasos para reproducir
- Capturas de pantalla (si aplica)
- Logs del backend (si aplica)
