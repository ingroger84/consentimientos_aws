# 📁 Diagnóstico: Problema Creación Plantillas - Aquiub

**Fecha:** 22 de Mayo 2026  
**Estado:** ✅ Diagnóstico completado

---

## 📋 ÍNDICE DE DOCUMENTOS

### 1. **RESUMEN_DIAGNOSTICO_AQUIUB_22_MAYO_2026.md** ⭐ LEER PRIMERO
   - Resumen ejecutivo del diagnóstico
   - Causa probable identificada
   - Conclusiones y próximos pasos
   - **Tiempo de lectura:** 3 minutos

### 2. **PLAN_ACCION_AQUIUB_PLANTILLAS.md** ⭐ PLAN DE EJECUCIÓN
   - Plan de acción paso a paso
   - Fases de validación y solución
   - Tiempo estimado por fase
   - Criterios de éxito
   - **Tiempo de lectura:** 5 minutos

### 3. **INSTRUCCIONES_USUARIO_AQUIUB_PLANTILLAS.md** 👤 PARA EL USUARIO
   - Instrucciones simples para el usuario final
   - Cómo verificar el error en DevTools
   - Soluciones rápidas
   - Checklist de verificación
   - **Tiempo de lectura:** 5 minutos

### 4. **DIAGNOSTICO_AQUIUB_PLANTILLAS_22_MAYO_2026.md** 🔍 TÉCNICO
   - Diagnóstico técnico completo
   - Estado del tenant
   - Análisis de posibles causas
   - Pasos de diagnóstico detallados
   - **Tiempo de lectura:** 10 minutos

### 5. **SOLUCION_AQUIUB_PLANTILLAS_22_MAYO_2026.md** 🔧 SOLUCIONES
   - Análisis del código fuente
   - Causa raíz identificada
   - Soluciones según el tipo de error
   - Scripts de verificación
   - **Tiempo de lectura:** 8 minutos

---

## 🎯 PROBLEMA

**Síntoma:** El botón de crear plantilla se queda azul "creando" y no crea la plantilla

**Cuenta:** Aquiub Casa de Pestañas  
**Tenant ID:** `2852b690-9401-4ad0-bc70-899977696e8d`

---

## ✅ DIAGNÓSTICO

### Causa Más Probable (85% de confianza)

**Las plantillas CN requieren OBLIGATORIAMENTE al menos un servicio asociado.**

El usuario está intentando crear una plantilla sin seleccionar ningún servicio, lo que causa un error 400 en el backend:

```
BadRequestException: "Debe asociar al menos un servicio a la plantilla"
```

### Estado del Tenant

- ✅ Tenant activo (no suspendido)
- ✅ Plan: Custom
- ✅ Límite de plantillas: 1000
- ✅ Plantillas actuales: 7 (0.7% usado)
- ✅ NO hay problema de límites

---

## 🚀 SOLUCIÓN RÁPIDA

### Para el Usuario:

1. **Verificar que tienes servicios creados** en tu cuenta
2. Al crear una plantilla, **seleccionar al menos un servicio**
3. Completar todos los campos requeridos
4. Guardar la plantilla

**Documento:** Ver `INSTRUCCIONES_USUARIO_AQUIUB_PLANTILLAS.md`

---

## 🔍 VERIFICACIÓN DEL ERROR

### Opción 1: DevTools (Recomendado)

1. Presionar **F12** en el navegador
2. Ir a la pestaña **"Network"**
3. Intentar crear una plantilla
4. Buscar la petición `consent-templates` (aparecerá en rojo)
5. Ver el mensaje de error en la respuesta

### Opción 2: Logs del Servidor

```bash
# Conectar al servidor
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249

# Ver logs en tiempo real
pm2 logs datagree --lines 100

# Intentar crear plantilla mientras se ven los logs
```

---

## 📊 SCRIPTS DISPONIBLES

### 1. Script de Diagnóstico Completo
```bash
cd backend
node diagnose-aquiub-templates-complete.js
```

**Verifica:**
- Estado del tenant
- Plantillas existentes
- Servicios disponibles
- Permisos de usuarios

### 2. Script de Logs en Tiempo Real
```bash
.\check-aquiub-logs.ps1
```

**Muestra:**
- Logs del servidor en tiempo real
- Errores al intentar crear plantillas

---

## 📞 INFORMACIÓN TÉCNICA

**Servidor:** 100.28.198.249  
**Usuario:** ubuntu  
**Llave SSH:** AWS-ISSABEL.pem  
**Proceso PM2:** datagree  
**Base de Datos:** Supabase (PostgreSQL)

**Endpoint:** POST `/api/consent-templates`  
**Permiso Requerido:** `templates.create`

**Código Fuente:**
- `backend/src/consent-templates/consent-templates.controller.ts`
- `backend/src/consent-templates/consent-templates.service.ts`

---

## 🎯 PRÓXIMOS PASOS

### Paso 1: Validación Rápida (5 min)
1. Enviar `INSTRUCCIONES_USUARIO_AQUIUB_PLANTILLAS.md` al usuario
2. Pedir que intente crear plantilla seleccionando un servicio

### Paso 2: Si persiste el problema (10 min)
1. Pedir al usuario que capture el error en DevTools
2. Revisar logs del servidor
3. Verificar permisos del usuario

### Paso 3: Aplicar solución específica (5-15 min)
Según el error identificado:
- Servicios faltantes → Crear servicios
- Límite alcanzado → Aumentar límite
- Sin permisos → Ajustar permisos
- Error del servidor → Revisar y corregir código

### Paso 4: Verificación (5 min)
1. Usuario crea plantilla exitosamente
2. Verificar en base de datos
3. Confirmar que aparece en la lista

---

## ✅ CRITERIOS DE ÉXITO

- [ ] Usuario puede crear plantillas sin errores
- [ ] Botón no se queda cargando indefinidamente
- [ ] Plantillas se guardan correctamente
- [ ] Plantillas aparecen en la lista
- [ ] No hay errores en logs del servidor

---

## 📚 ARCHIVOS CREADOS

### Documentación
- `README_DIAGNOSTICO_AQUIUB.md` (este archivo)
- `RESUMEN_DIAGNOSTICO_AQUIUB_22_MAYO_2026.md`
- `DIAGNOSTICO_AQUIUB_PLANTILLAS_22_MAYO_2026.md`
- `SOLUCION_AQUIUB_PLANTILLAS_22_MAYO_2026.md`
- `INSTRUCCIONES_USUARIO_AQUIUB_PLANTILLAS.md`
- `PLAN_ACCION_AQUIUB_PLANTILLAS.md`

### Scripts
- `backend/diagnose-aquiub-templates-complete.js`
- `check-aquiub-logs.ps1`

---

## 📈 TIEMPO ESTIMADO

**Diagnóstico:** ✅ Completado (30 minutos)  
**Validación con usuario:** 5-10 minutos  
**Solución (si es necesaria):** 5-15 minutos  
**Verificación:** 5 minutos  

**Total:** 45-60 minutos desde el inicio hasta la resolución completa

---

## 🎓 LECCIONES APRENDIDAS

1. **Validación obligatoria de servicios:** Las plantillas CN requieren al menos un servicio asociado
2. **Mejora de UX:** El frontend debería validar esto antes de enviar al backend
3. **Mensajes de error:** Mejorar los mensajes de error para que sean más claros para el usuario
4. **Documentación:** Importante documentar las validaciones obligatorias

---

**Fecha de Creación:** 22 de Mayo 2026  
**Última Actualización:** 22 de Mayo 2026  
**Estado:** ✅ Diagnóstico completado, pendiente de validación con usuario  
**Confianza:** 85% - Causa probable identificada mediante análisis de código
