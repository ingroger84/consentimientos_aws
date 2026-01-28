# Instrucciones de Prueba: Plantillas HC Separadas

## 🎯 Objetivo

Verificar que el sistema de plantillas de consentimiento para Historias Clínicas funciona correctamente y está completamente separado de las plantillas tradicionales.

## 📋 Pre-requisitos

- Backend corriendo en `http://localhost:3000`
- Frontend corriendo en `http://demo-medico.localhost:5173`
- Usuario con permisos de Admin o Super Admin
- Base de datos con migración aplicada

## 🧪 Casos de Prueba

### Caso 1: Verificar Plantillas por Defecto

**Objetivo**: Confirmar que las 3 plantillas HC por defecto fueron creadas

**Pasos**:
1. Iniciar sesión como Admin (`admin@clinicademo.com` / `Demo123!`)
2. Click en "Plantillas HC" en el menú lateral
3. Verificar que se muestran 3 plantillas:
   - Consentimiento Informado General HC (Categoría: general)
   - Consentimiento para Procedimiento Médico (Categoría: procedure)
   - Consentimiento para Tratamiento (Categoría: treatment)
4. Verificar que todas tienen estrella amarilla (predeterminadas)
5. Verificar que todas están activas

**Resultado Esperado**:
- ✅ Se muestran 3 plantillas
- ✅ Todas tienen badge de categoría
- ✅ Todas tienen estrella amarilla
- ✅ Estadísticas muestran: Total: 3, Activas: 3, Predeterminadas: 3, Categorías: 3

---

### Caso 2: Crear Nueva Plantilla HC

**Objetivo**: Verificar que se puede crear una nueva plantilla HC

**Pasos**:
1. En la página "Plantillas HC", click en "Nueva Plantilla HC"
2. Llenar el formulario:
   ```
   Nombre: Consentimiento para Anestesia General
   Descripción: Consentimiento informado para procedimientos con anestesia general
   Categoría: procedure
   ```
3. Click en "Ver Variables"
4. Buscar "patient" en el buscador de variables
5. Click en `{{patientName}}` para copiar
6. En el contenido, escribir:
   ```
   CONSENTIMIENTO PARA ANESTESIA GENERAL

   Yo, {{patientName}}, identificado(a) con {{patientId}}, 
   autorizo la administración de anestesia general para el 
   procedimiento: {{procedureName}}.

   Diagnóstico: {{diagnosisDescription}} ({{diagnosisCode}})

   He sido informado sobre los riesgos y beneficios.

   Fecha: {{consentDate}}
   Sede: {{branchName}}
   Médico: {{doctorName}}
   ```
7. Marcar "Plantilla activa"
8. Click en "Crear Plantilla HC"

**Resultado Esperado**:
- ✅ Modal se cierra
- ✅ Mensaje de éxito: "Plantilla HC creada exitosamente"
- ✅ Nueva plantilla aparece en la lista
- ✅ Estadísticas actualizadas: Total: 4

---

### Caso 3: Filtrar Plantillas

**Objetivo**: Verificar que los filtros funcionan correctamente

**Pasos**:
1. En el buscador, escribir "anestesia"
2. Verificar que solo se muestra la plantilla de anestesia
3. Limpiar buscador
4. En filtro de categoría, seleccionar "Procedimiento"
5. Verificar que se muestran 2 plantillas (Procedimiento Médico y Anestesia)
6. Seleccionar categoría "General"
7. Verificar que solo se muestra 1 plantilla (General HC)
8. Seleccionar "Todas las categorías"
9. En filtro de estado, seleccionar "Activas"
10. Verificar que se muestran todas las plantillas

**Resultado Esperado**:
- ✅ Filtros funcionan correctamente
- ✅ Resultados se actualizan en tiempo real
- ✅ Contador de resultados es correcto

---

### Caso 4: Editar Plantilla

**Objetivo**: Verificar que se puede editar una plantilla existente

**Pasos**:
1. Click en el botón de editar (lápiz) en la plantilla de Anestesia
2. Modificar la descripción:
   ```
   Consentimiento informado para procedimientos quirúrgicos con anestesia general
   ```
3. Agregar al final del contenido:
   ```

   _______________________________
   Firma del Paciente
   ```
4. Click en "Guardar Cambios"

**Resultado Esperado**:
- ✅ Modal se cierra
- ✅ Mensaje de éxito: "Plantilla HC actualizada exitosamente"
- ✅ Cambios se reflejan en la lista
- ✅ Fecha de actualización cambia

---

### Caso 5: Marcar como Predeterminada

**Objetivo**: Verificar que se puede cambiar la plantilla predeterminada

**Pasos**:
1. Verificar que "Consentimiento para Procedimiento Médico" tiene estrella amarilla
2. Click en la estrella vacía de "Consentimiento para Anestesia General"
3. Verificar mensaje de éxito
4. Verificar que ahora "Anestesia" tiene estrella amarilla
5. Verificar que "Procedimiento Médico" ya NO tiene estrella amarilla

**Resultado Esperado**:
- ✅ Solo una plantilla de categoría "procedure" tiene estrella
- ✅ Mensaje de éxito: "Plantilla marcada como predeterminada"
- ✅ Estadísticas siguen mostrando 3 predeterminadas (una por categoría)

---

### Caso 6: Generar Consentimiento desde HC

**Objetivo**: Verificar que el modal de generación usa plantillas HC

**Pasos**:
1. Ir a "Historias Clínicas"
2. Abrir una HC existente (o crear una nueva)
3. Click en "Generar Consentimiento"
4. Verificar que el modal dice "Plantillas de Consentimiento HC"
5. Verificar que se muestran las 4 plantillas HC
6. Verificar que cada plantilla tiene su badge de categoría
7. Verificar que el enlace dice "Gestionar plantillas HC"
8. Seleccionar "Consentimiento Informado General HC"
9. Seleccionar "Consentimiento para Anestesia General"
10. Llenar campos adicionales:
    ```
    Nombre del Procedimiento: Cirugía de Apendicitis
    Código CIE-10: K35.8
    Descripción del Diagnóstico: Apendicitis aguda
    ```
11. Click en "Generar Consentimiento"

**Resultado Esperado**:
- ✅ Modal muestra SOLO plantillas HC (no tradicionales)
- ✅ Badges de categoría visibles
- ✅ Mensaje de éxito: "Consentimiento generado exitosamente"
- ✅ PDF se abre en nueva pestaña
- ✅ PDF contiene 2 páginas (una por plantilla)
- ✅ Variables reemplazadas correctamente con datos de la HC

---

### Caso 7: Verificar Separación de Sistemas

**Objetivo**: Confirmar que plantillas HC y tradicionales están separadas

**Pasos**:
1. Ir a "Plantillas" (tradicionales)
2. Verificar que se muestran plantillas tradicionales
3. Crear una nueva plantilla tradicional de prueba
4. Ir a "Plantillas HC"
5. Verificar que NO aparece la plantilla tradicional recién creada
6. Ir a "Consentimientos" (módulo tradicional)
7. Click en "Nuevo Consentimiento"
8. Verificar que se usan plantillas tradicionales
9. Ir a "Historias Clínicas"
10. Generar consentimiento desde HC
11. Verificar que se usan plantillas HC

**Resultado Esperado**:
- ✅ Plantillas tradicionales y HC están completamente separadas
- ✅ Cada módulo usa su propio tipo de plantillas
- ✅ No hay interferencias entre sistemas

---

### Caso 8: Verificar Permisos

**Objetivo**: Confirmar que los permisos funcionan correctamente

**Pasos**:
1. Cerrar sesión
2. Iniciar sesión como Operador (`operador1@demo-clinica.com`)
3. Verificar que "Plantillas HC" aparece en el menú
4. Click en "Plantillas HC"
5. Verificar que se pueden ver las plantillas
6. Verificar que NO aparece botón "Nueva Plantilla HC"
7. Verificar que NO aparecen botones de editar/eliminar
8. Ir a "Historias Clínicas"
9. Abrir una HC
10. Click en "Generar Consentimiento"
11. Verificar que se pueden seleccionar plantillas HC
12. Generar un consentimiento

**Resultado Esperado**:
- ✅ Operador puede ver plantillas HC
- ✅ Operador NO puede crear/editar/eliminar plantillas
- ✅ Operador SÍ puede generar consentimientos desde HC
- ✅ Permisos funcionan correctamente

---

### Caso 9: Eliminar Plantilla

**Objetivo**: Verificar que se puede eliminar una plantilla no predeterminada

**Pasos**:
1. Iniciar sesión como Admin
2. Ir a "Plantillas HC"
3. Intentar eliminar "Consentimiento Informado General HC" (predeterminada)
4. Verificar mensaje de error
5. Marcar otra plantilla como predeterminada en categoría "general"
6. Intentar eliminar "Consentimiento Informado General HC" nuevamente
7. Confirmar eliminación
8. Verificar que desaparece de la lista

**Resultado Esperado**:
- ✅ No se puede eliminar plantilla predeterminada
- ✅ Mensaje de error claro
- ✅ Después de cambiar predeterminada, sí se puede eliminar
- ✅ Estadísticas se actualizan correctamente

---

### Caso 10: Helper de Variables

**Objetivo**: Verificar que el helper de variables funciona correctamente

**Pasos**:
1. Click en "Nueva Plantilla HC"
2. Click en "Ver Variables"
3. Verificar que se muestran 9 categorías de variables
4. En el buscador, escribir "diagnosis"
5. Verificar que solo se muestran variables de diagnóstico
6. Click en `{{diagnosisCode}}`
7. Verificar que se copia al portapapeles
8. Verificar que aparece check verde
9. Limpiar buscador
10. Scroll por todas las categorías
11. Contar variables totales

**Resultado Esperado**:
- ✅ Se muestran 9 categorías
- ✅ Buscador funciona correctamente
- ✅ Copia al portapapeles funciona
- ✅ Feedback visual (check verde) aparece
- ✅ Total de variables: 38

---

## 📊 Checklist de Verificación

### Backend
- [ ] Migración aplicada correctamente
- [ ] 3 plantillas por defecto creadas
- [ ] Endpoints responden correctamente
- [ ] Permisos asignados a roles

### Frontend
- [ ] Página de gestión carga correctamente
- [ ] Filtros funcionan
- [ ] Modales de creación/edición funcionan
- [ ] Helper de variables funciona
- [ ] Estadísticas se actualizan
- [ ] Menú de navegación muestra opción

### Integración
- [ ] Modal de generación usa plantillas HC
- [ ] PDF se genera correctamente
- [ ] Variables se reemplazan correctamente
- [ ] Separación de sistemas funciona

### Permisos
- [ ] Admin puede crear/editar/eliminar
- [ ] Operador solo puede ver y generar
- [ ] Médico solo puede ver y generar
- [ ] Super Admin tiene todos los permisos

### UX
- [ ] Mensajes de éxito/error claros
- [ ] Confirmaciones para acciones destructivas
- [ ] Feedback visual inmediato
- [ ] Responsive en móvil

## 🐛 Problemas Conocidos

Ninguno reportado hasta el momento.

## 📝 Notas

- Las plantillas HC tienen 38 variables vs 14 de plantillas tradicionales
- Solo una plantilla puede ser predeterminada por categoría
- No se pueden eliminar plantillas predeterminadas
- Los cambios en plantillas NO afectan consentimientos ya generados
- El sistema es completamente independiente de plantillas tradicionales

---

**Versión**: 15.0.10
**Fecha**: 2026-01-25
**Estado**: ✅ Listo para Pruebas
