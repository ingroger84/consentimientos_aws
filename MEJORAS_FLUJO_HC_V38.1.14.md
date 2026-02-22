# Mejoras al Flujo de Historias Clínicas - V38.1.14

## Fecha: 2026-02-19

## Problema Identificado

El sistema de historias clínicas tenía inconsistencias en el flujo de creación que permitían:
- Crear múltiples historias clínicas para el mismo paciente
- Confusión entre crear nueva HC vs agregar admisión a HC existente
- Falta de validación a nivel de frontend y backend

## Regla de Negocio Clave

**Un paciente/cliente solo puede tener UNA historia clínica ACTIVA**

Según la normativa colombiana, una historia clínica es un documento único por paciente en cada IPS. Se pueden agregar múltiples admisiones y registros a la misma HC, pero no se deben crear múltiples HCs activas para el mismo paciente.

## Cambios Implementados

### 1. Backend - Validación de HC Única

**Archivo**: `backend/src/medical-records/medical-records.service.ts`

- ✅ Ya existía validación en el método `create()` que impide crear HC si el paciente tiene una activa
- ✅ Modificado método `findByClient()` para aceptar filtros opcionales (status)
- ✅ Mensaje de error claro cuando se intenta crear HC duplicada

**Archivo**: `backend/src/medical-records/medical-records.controller.ts`

- ✅ Agregado endpoint `GET /medical-records/client/:clientId/active`
- ✅ Permite verificar si un cliente tiene HC activa antes de intentar crear nueva

### 2. Frontend - Servicio de Historias Clínicas

**Archivo**: `frontend/src/services/medical-records.service.ts`

- ✅ Agregado método `getActiveByClient(clientId)` que consulta el nuevo endpoint
- ✅ Retorna la HC activa o null si no existe

### 3. Frontend - Página de Creación de HC

**Archivo**: `frontend/src/pages/CreateMedicalRecordPage.tsx`

**Mejoras implementadas**:

1. **Verificación Automática al Seleccionar Cliente**:
   - Al seleccionar un cliente, se verifica inmediatamente si tiene HC activa
   - Si tiene HC activa, se muestra modal de admisión automáticamente
   - Se muestra notificación informativa al usuario

2. **Alerta Visual de HC Existente**:
   - Banner azul informativo cuando se detecta HC activa
   - Muestra número de HC existente
   - Botón directo para agregar nueva admisión

3. **Formulario Deshabilitado**:
   - Cuando hay HC activa, el formulario de creación se deshabilita
   - Los campos se muestran en gris con cursor "not-allowed"
   - Botón "Crear Historia Clínica" deshabilitado

4. **Validación en Submit**:
   - Doble validación antes de crear HC
   - Mensaje de error claro si se intenta crear HC cuando ya existe una activa

## Flujo Mejorado

### Escenario 1: Cliente SIN Historia Clínica Activa

1. Usuario selecciona cliente en el formulario
2. Sistema verifica HC activa → No encuentra
3. Usuario completa formulario normalmente
4. Usuario hace clic en "Crear Historia Clínica"
5. Sistema crea nueva HC con primera admisión
6. Usuario es redirigido a la HC creada

### Escenario 2: Cliente CON Historia Clínica Activa

1. Usuario selecciona cliente en el formulario
2. Sistema verifica HC activa → Encuentra HC existente
3. Sistema muestra:
   - ✅ Banner azul informativo con número de HC
   - ✅ Modal de tipo de admisión
   - ✅ Formulario deshabilitado
4. Usuario selecciona tipo de admisión en el modal
5. Sistema crea nueva admisión en la HC existente
6. Usuario es redirigido a la HC con la nueva admisión

## Beneficios

1. **Cumplimiento Normativo**: Garantiza una sola HC activa por paciente
2. **Experiencia de Usuario Mejorada**: Flujo claro y sin confusiones
3. **Prevención de Errores**: Validación en frontend y backend
4. **Feedback Visual**: Alertas y estados claros para el usuario
5. **Integridad de Datos**: Evita duplicación de historias clínicas

## Validaciones Implementadas

### Backend
- ✅ Verificación de HC activa antes de crear nueva
- ✅ Mensaje de error descriptivo con número de HC existente
- ✅ Endpoint específico para consultar HC activa

### Frontend
- ✅ Verificación automática al seleccionar cliente
- ✅ Deshabilitación de formulario cuando hay HC activa
- ✅ Validación en submit antes de enviar al backend
- ✅ Alertas visuales informativas

## Archivos Modificados

```
backend/src/medical-records/medical-records.service.ts
backend/src/medical-records/medical-records.controller.ts
frontend/src/services/medical-records.service.ts
frontend/src/pages/CreateMedicalRecordPage.tsx
```

## Despliegue

- ✅ Backend compilado y desplegado
- ✅ Frontend compilado y desplegado
- ✅ PM2 reiniciado (PID: 433112)
- ✅ Versión: 38.1.14

## Próximos Pasos Recomendados

1. **Documentación de Usuario**: Crear guía visual del flujo para operadores
2. **Capacitación**: Explicar a usuarios el concepto de HC única con múltiples admisiones
3. **Monitoreo**: Verificar que no se intenten crear HCs duplicadas
4. **Mejora Continua**: Recopilar feedback de usuarios sobre el nuevo flujo

## Notas Técnicas

- El endpoint de verificación usa guards de autenticación y permisos
- La validación backend es la última línea de defensa
- El frontend proporciona feedback inmediato para mejor UX
- El modal de admisión se reutiliza para mantener consistencia
