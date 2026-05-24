# 🧪 Guía de Pruebas - Vista Previa v92.1.0

## ✅ Checklist de Pruebas

### Consentimientos Normales (CN)

#### Prueba 1: Flujo Completo Básico
- [ ] Ir a "Consentimientos" → "Nuevo Consentimiento"
- [ ] Completar Paso 1: Datos del Cliente
- [ ] Completar Paso 2: Responder preguntas
- [ ] **Verificar Paso 3: Vista Previa aparece**
- [ ] Verificar que muestra toda la información correcta
- [ ] Marcar checkbox "He revisado toda la información"
- [ ] Click en "Continuar a Firma"
- [ ] Completar Paso 4: Firmar
- [ ] Verificar que PDF se genera correctamente

**Resultado Esperado:** ✅ Flujo completo funciona, vista previa muestra datos correctos

---

#### Prueba 2: Botón "Volver a Editar"
- [ ] Llegar hasta la vista previa (Paso 3)
- [ ] Click en "Volver a Editar"
- [ ] **Verificar que regresa al Paso 2**
- [ ] Verificar que las respuestas se mantienen
- [ ] Modificar una respuesta
- [ ] Continuar a vista previa
- [ ] Verificar que muestra el cambio

**Resultado Esperado:** ✅ Puede volver atrás sin perder datos, cambios se reflejan

---

#### Prueba 3: Checkbox Obligatorio
- [ ] Llegar hasta la vista previa (Paso 3)
- [ ] **Verificar que botón "Continuar" está deshabilitado**
- [ ] Intentar hacer click (no debe funcionar)
- [ ] Marcar checkbox
- [ ] **Verificar que botón "Continuar" se habilita**
- [ ] Click en "Continuar a Firma"

**Resultado Esperado:** ✅ Botón deshabilitado hasta marcar checkbox

---

#### Prueba 4: Preguntas Críticas
- [ ] Crear consentimiento con servicio que tenga preguntas críticas
- [ ] Responder "Sí" a una pregunta crítica
- [ ] Llegar a vista previa
- [ ] **Verificar que pregunta crítica está resaltada en rojo**
- [ ] **Verificar que aparece alerta de advertencia**
- [ ] Verificar que puede continuar de todas formas

**Resultado Esperado:** ✅ Preguntas críticas resaltadas, alerta visible

---

#### Prueba 5: Servicio Sin Preguntas
- [ ] Crear consentimiento con servicio sin preguntas
- [ ] Completar Paso 1
- [ ] En Paso 2, click en "Continuar sin preguntas"
- [ ] **Verificar que vista previa muestra "No hay preguntas"**
- [ ] Continuar a firma

**Resultado Esperado:** ✅ Funciona sin preguntas, vista previa se adapta

---

#### Prueba 6: Con Foto del Cliente
- [ ] Crear consentimiento
- [ ] Tomar foto del cliente en Paso 1
- [ ] Completar hasta vista previa
- [ ] **Verificar que vista previa NO muestra la foto** (solo se incluye en PDF)
- [ ] Continuar y firmar
- [ ] Verificar que PDF incluye la foto

**Resultado Esperado:** ✅ Foto se mantiene en el flujo, aparece en PDF final

---

### Consentimientos de Historia Clínica (HC)

#### Prueba 7: Flujo Completo HC
- [ ] Ir a una Historia Clínica
- [ ] Click en "Generar Consentimiento"
- [ ] Seleccionar 2-3 plantillas
- [ ] Completar información
- [ ] Click en "Ver Vista Previa"
- [ ] **Verificar que muestra vista previa**
- [ ] Verificar que lista todas las plantillas seleccionadas
- [ ] Marcar checkbox
- [ ] Click en "Continuar a Firma"
- [ ] Firmar
- [ ] Verificar que PDF se genera con todas las plantillas

**Resultado Esperado:** ✅ Vista previa muestra plantillas, PDF se genera correctamente

---

#### Prueba 8: Volver a Editar en HC
- [ ] Llegar hasta vista previa
- [ ] Click en "Volver a Editar"
- [ ] **Verificar que regresa al formulario**
- [ ] Verificar que plantillas seleccionadas se mantienen
- [ ] Agregar otra plantilla
- [ ] Ver vista previa nuevamente
- [ ] Verificar que muestra la plantilla adicional

**Resultado Esperado:** ✅ Puede volver atrás, cambios se reflejan

---

#### Prueba 9: Tipo de Consentimiento
- [ ] Crear consentimiento HC tipo "Procedimiento"
- [ ] Completar nombre del procedimiento
- [ ] Ver vista previa
- [ ] **Verificar que muestra tipo y procedimiento**
- [ ] Volver y cambiar a tipo "General"
- [ ] Ver vista previa
- [ ] Verificar que muestra el cambio

**Resultado Esperado:** ✅ Vista previa refleja el tipo seleccionado

---

#### Prueba 10: Notas Adicionales
- [ ] Crear consentimiento HC
- [ ] Agregar notas adicionales largas (3-4 líneas)
- [ ] Ver vista previa
- [ ] **Verificar que muestra las notas completas**
- [ ] Verificar formato (saltos de línea)

**Resultado Esperado:** ✅ Notas se muestran correctamente formateadas

---

### Pruebas de Regresión

#### Prueba 11: Consentimientos Existentes
- [ ] Abrir un consentimiento ya firmado (creado antes de v92.1)
- [ ] **Verificar que se visualiza correctamente**
- [ ] Verificar que PDF se descarga correctamente

**Resultado Esperado:** ✅ Consentimientos antiguos no se afectan

---

#### Prueba 12: Edición de Consentimientos
- [ ] Editar un consentimiento en borrador
- [ ] **Verificar que flujo de edición funciona**
- [ ] Verificar que vista previa aparece
- [ ] Completar edición

**Resultado Esperado:** ✅ Edición funciona con vista previa

---

### Pruebas de UI/UX

#### Prueba 13: Responsive - Mobile
- [ ] Abrir en dispositivo móvil o DevTools (375px)
- [ ] Crear consentimiento hasta vista previa
- [ ] **Verificar que diseño se adapta**
- [ ] Verificar que checkbox es fácil de marcar
- [ ] Verificar que botones son accesibles

**Resultado Esperado:** ✅ Diseño responsive funciona correctamente

---

#### Prueba 14: Responsive - Tablet
- [ ] Abrir en tablet o DevTools (768px)
- [ ] Crear consentimiento hasta vista previa
- [ ] **Verificar que diseño se adapta**
- [ ] Verificar legibilidad

**Resultado Esperado:** ✅ Diseño tablet funciona correctamente

---

#### Prueba 15: Scroll Largo
- [ ] Crear consentimiento con 10+ preguntas
- [ ] Ver vista previa
- [ ] **Verificar que scroll funciona**
- [ ] Verificar botón "Ver todas las preguntas"
- [ ] Expandir todas las preguntas
- [ ] Verificar que se pueden ver todas

**Resultado Esperado:** ✅ Scroll y expansión funcionan correctamente

---

### Pruebas de Performance

#### Prueba 16: Tiempo de Carga
- [ ] Crear consentimiento con muchas preguntas
- [ ] Medir tiempo de transición a vista previa
- [ ] **Verificar que es < 500ms**

**Resultado Esperado:** ✅ Vista previa carga instantáneamente

---

#### Prueba 17: Múltiples Plantillas HC
- [ ] Seleccionar 5+ plantillas HC
- [ ] Ver vista previa
- [ ] **Verificar que lista todas sin lag**
- [ ] Verificar que scroll es fluido

**Resultado Esperado:** ✅ Maneja múltiples plantillas sin problemas

---

## 🐛 Casos de Error a Probar

### Error 1: Sin Plantillas Seleccionadas (HC)
- [ ] Intentar ver vista previa sin seleccionar plantillas
- [ ] **Verificar que muestra error**
- [ ] Verificar que no avanza

**Resultado Esperado:** ✅ Error claro, no permite continuar

---

### Error 2: Campos Vacíos
- [ ] Dejar campos obligatorios vacíos
- [ ] Intentar avanzar
- [ ] **Verificar validación**

**Resultado Esperado:** ✅ Validación funciona antes de vista previa

---

## 📊 Reporte de Pruebas

### Formato de Reporte

```
Prueba #: [Número]
Nombre: [Nombre de la prueba]
Fecha: [Fecha]
Probado por: [Nombre]
Resultado: ✅ PASS / ❌ FAIL
Notas: [Observaciones]
```

### Ejemplo

```
Prueba #1: Flujo Completo Básico CN
Fecha: 2026-05-01
Probado por: Juan Pérez
Resultado: ✅ PASS
Notas: Todo funciona correctamente. Vista previa muestra datos correctos.
```

---

## 🎯 Criterios de Aceptación

Para considerar la implementación exitosa, TODAS estas condiciones deben cumplirse:

- ✅ Vista previa aparece en ambos flujos (CN y HC)
- ✅ Checkbox obligatorio funciona correctamente
- ✅ Botón "Volver a Editar" funciona sin perder datos
- ✅ Preguntas críticas se resaltan correctamente
- ✅ Plantillas HC se listan correctamente
- ✅ Diseño responsive funciona en mobile/tablet
- ✅ No hay errores en consola del navegador
- ✅ Consentimientos antiguos no se afectan
- ✅ PDF final se genera correctamente
- ✅ Performance es aceptable (< 500ms)

---

## 📝 Notas para el Tester

1. **Limpiar caché:** Hacer Ctrl+Shift+R antes de empezar
2. **Verificar versión:** Debe mostrar v92.1.0 en el menú
3. **Consola:** Mantener DevTools abierto para ver errores
4. **Screenshots:** Tomar capturas de cualquier error
5. **Navegadores:** Probar en Chrome, Firefox, Safari

---

**Versión:** 92.1.0  
**Fecha:** 2026-05-01  
**Tiempo estimado de pruebas:** 2-3 horas
