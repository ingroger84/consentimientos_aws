# 🧪 Guía de Pruebas - Formularios de Historias Clínicas

**Versión**: 15.0.5  
**Fecha**: 2026-01-24

---

## 📋 Preparación

### Requisitos Previos

1. ✅ Backend corriendo en puerto 3000
2. ✅ Frontend corriendo en puerto 5173
3. ✅ Base de datos con historias clínicas creadas
4. ✅ Usuario con permisos para crear/editar historias clínicas

### Datos de Prueba

**Usuario**: operador1@demo-clinica.com  
**Tenant**: demo-medico  
**URL**: http://demo-medico.localhost:5173

---

## 🧪 Casos de Prueba

### 1. Agregar Anamnesis

#### Caso 1.1: Anamnesis Completa
**Objetivo**: Verificar que se puede agregar una anamnesis con todos los campos

**Pasos**:
1. Inicia sesión
2. Ve a "Historias Clínicas"
3. Abre una historia clínica existente
4. Click en tab "Anamnesis"
5. Click en "Agregar Anamnesis"
6. Completa todos los campos:
   ```
   Motivo de consulta: Dolor abdominal intenso
   Enfermedad actual: Paciente refiere dolor en epigastrio de 2 días de evolución
   Antecedentes personales: Gastritis crónica diagnosticada hace 3 años
   Antecedentes familiares: Madre con úlcera gástrica
   Hábitos: No fuma, consume alcohol ocasionalmente
   Revisión por sistemas: Cardiovascular: sin alteraciones. Digestivo: dolor epigástrico
   ```
7. Click en "Guardar Anamnesis"

**Resultado Esperado**:
- ✅ Modal se cierra
- ✅ Mensaje de éxito
- ✅ Anamnesis aparece en el listado
- ✅ Muestra fecha, hora y usuario que la creó

#### Caso 1.2: Anamnesis Solo con Motivo de Consulta
**Objetivo**: Verificar validación de campo requerido

**Pasos**:
1. Click en "Agregar Anamnesis"
2. Deja solo el motivo de consulta: "Cefalea"
3. Click en "Guardar Anamnesis"

**Resultado Esperado**:
- ✅ Se guarda correctamente
- ✅ Solo muestra el motivo de consulta
- ✅ Otros campos quedan vacíos

#### Caso 1.3: Anamnesis Sin Motivo de Consulta
**Objetivo**: Verificar validación de campo requerido

**Pasos**:
1. Click en "Agregar Anamnesis"
2. Deja el motivo de consulta vacío
3. Completa otros campos
4. Click en "Guardar Anamnesis"

**Resultado Esperado**:
- ❌ No se guarda
- ✅ Mensaje de error: "El motivo de consulta es requerido"

---

### 2. Agregar Examen Físico

#### Caso 2.1: Signos Vitales Completos
**Objetivo**: Verificar registro de signos vitales

**Pasos**:
1. Ve al tab "Exámenes"
2. Click en "Agregar Examen"
3. Completa signos vitales:
   ```
   Presión Arterial Sistólica: 120
   Presión Arterial Diastólica: 80
   Frecuencia Cardíaca: 72
   Frecuencia Respiratoria: 16
   Temperatura: 36.5
   Saturación de Oxígeno: 98
   ```
4. Click en "Guardar Examen"

**Resultado Esperado**:
- ✅ Examen guardado
- ✅ Muestra todos los signos vitales
- ✅ Formato correcto (120/80 mmHg, 72 lpm, etc.)

#### Caso 2.2: Medidas Antropométricas
**Objetivo**: Verificar registro de peso y altura

**Pasos**:
1. Click en "Agregar Examen"
2. Completa:
   ```
   Peso: 70.5
   Altura: 170
   ```
3. Click en "Guardar Examen"

**Resultado Esperado**:
- ✅ Examen guardado
- ✅ Muestra peso y altura
- ✅ Formato correcto (70.5 kg, 170 cm)

#### Caso 2.3: Examen con Hallazgos
**Objetivo**: Verificar registro de hallazgos adicionales

**Pasos**:
1. Click en "Agregar Examen"
2. Completa:
   ```
   Apariencia General: Paciente consciente, orientado, hidratado
   Otros Hallazgos: Abdomen blando, depresible, doloroso a la palpación en epigastrio
   ```
3. Click en "Guardar Examen"

**Resultado Esperado**:
- ✅ Examen guardado
- ✅ Muestra los hallazgos completos

---

### 3. Agregar Diagnóstico

#### Caso 3.1: Diagnóstico Principal Confirmado
**Objetivo**: Verificar registro de diagnóstico confirmado

**Pasos**:
1. Ve al tab "Diagnósticos"
2. Click en "Agregar Diagnóstico"
3. Completa:
   ```
   Código CIE-10: K29.7
   Descripción: Gastritis no especificada
   Tipo: Principal
   Confirmado: ✓
   ```
4. Click en "Guardar Diagnóstico"

**Resultado Esperado**:
- ✅ Diagnóstico guardado
- ✅ Muestra código y descripción
- ✅ Indica "Principal | Confirmado"

#### Caso 3.2: Diagnóstico Presuntivo
**Objetivo**: Verificar registro de diagnóstico presuntivo

**Pasos**:
1. Click en "Agregar Diagnóstico"
2. Completa:
   ```
   Código CIE-10: K25
   Descripción: Úlcera gástrica
   Tipo: Relacionado
   Confirmado: ☐
   ```
3. Click en "Guardar Diagnóstico"

**Resultado Esperado**:
- ✅ Diagnóstico guardado
- ✅ Indica "Relacionado | Presuntivo"

#### Caso 3.3: Validación de Campos Requeridos
**Objetivo**: Verificar validación

**Pasos**:
1. Click en "Agregar Diagnóstico"
2. Deja código o descripción vacíos
3. Click en "Guardar Diagnóstico"

**Resultado Esperado**:
- ❌ No se guarda
- ✅ Mensaje de error

---

### 4. Agregar Evolución

#### Caso 4.1: Evolución Formato SOAP Completo
**Objetivo**: Verificar registro de evolución completa

**Pasos**:
1. Ve al tab "Evoluciones"
2. Click en "Agregar Evolución"
3. Completa:
   ```
   Fecha y Hora: (actual)
   Tipo: Evolución
   
   S - Subjetivo:
   Paciente refiere mejoría del dolor abdominal. Tolera vía oral.
   
   O - Objetivo:
   PA: 120/80, FC: 70, T: 36.5°C
   Abdomen blando, no doloroso
   
   A - Análisis:
   Evolución favorable de gastritis aguda
   
   P - Plan:
   - Continuar omeprazol 20mg c/12h
   - Dieta blanda
   - Control en 3 días
   ```
4. Click en "Guardar Evolución"

**Resultado Esperado**:
- ✅ Evolución guardada
- ✅ Muestra fecha, hora y usuario
- ✅ Muestra las 4 secciones SOAP
- ✅ Formato claro y legible

#### Caso 4.2: Evolución Parcial
**Objetivo**: Verificar que no todos los campos son obligatorios

**Pasos**:
1. Click en "Agregar Evolución"
2. Completa solo:
   ```
   S - Subjetivo: Paciente sin cambios
   P - Plan: Continuar tratamiento
   ```
3. Click en "Guardar Evolución"

**Resultado Esperado**:
- ✅ Evolución guardada
- ✅ Solo muestra las secciones completadas

#### Caso 4.3: Interconsulta
**Objetivo**: Verificar tipo de nota diferente

**Pasos**:
1. Click en "Agregar Evolución"
2. Selecciona "Tipo: Interconsulta"
3. Completa campos
4. Click en "Guardar Evolución"

**Resultado Esperado**:
- ✅ Evolución guardada como interconsulta

---

## 🔍 Verificaciones Adicionales

### Auditoría
1. Verifica que cada entrada muestre:
   - ✅ Fecha y hora de creación
   - ✅ Usuario que la creó
   - ✅ Datos completos

### Múltiples Entradas
1. Agrega varias anamnesis
2. Agrega varios exámenes
3. Agrega varios diagnósticos
4. Agrega varias evoluciones

**Resultado Esperado**:
- ✅ Todas aparecen en el listado
- ✅ Ordenadas por fecha (más reciente primero)
- ✅ Sin duplicados

### Recarga de Página
1. Agrega una entrada
2. Recarga la página (F5)
3. Verifica que la entrada sigue ahí

**Resultado Esperado**:
- ✅ Datos persisten después de recargar

### Cierre de Modales
1. Abre un modal
2. Click en X
3. Abre otro modal
4. Click fuera del modal
5. Abre otro modal
6. Presiona ESC

**Resultado Esperado**:
- ✅ Modal se cierra en todos los casos
- ✅ No se guardan datos

---

## 🐛 Casos de Error

### Error 1: Sin Conexión al Backend
**Simular**: Detén el backend

**Resultado Esperado**:
- ✅ Mensaje de error claro
- ✅ No se pierde el formulario
- ✅ Usuario puede reintentar

### Error 2: Token Expirado
**Simular**: Espera a que expire el token

**Resultado Esperado**:
- ✅ Redirección al login
- ✅ Mensaje apropiado

### Error 3: Historia Clínica Cerrada
**Simular**: Intenta agregar a una HC cerrada

**Resultado Esperado**:
- ✅ Botones deshabilitados
- ✅ Mensaje indicando que está cerrada

---

## 📊 Checklist de Pruebas

### Anamnesis
- [ ] Agregar con todos los campos
- [ ] Agregar solo con motivo de consulta
- [ ] Validación de campo requerido
- [ ] Múltiples anamnesis
- [ ] Visualización correcta

### Examen Físico
- [ ] Signos vitales completos
- [ ] Solo medidas antropométricas
- [ ] Solo hallazgos
- [ ] Múltiples exámenes
- [ ] Formato de unidades correcto

### Diagnóstico
- [ ] Diagnóstico confirmado
- [ ] Diagnóstico presuntivo
- [ ] Diferentes tipos
- [ ] Validación de campos
- [ ] Múltiples diagnósticos

### Evolución
- [ ] SOAP completo
- [ ] SOAP parcial
- [ ] Diferentes tipos de nota
- [ ] Múltiples evoluciones
- [ ] Formato de fecha/hora

### General
- [ ] Auditoría funciona
- [ ] Recarga de página
- [ ] Cierre de modales
- [ ] Mensajes de éxito
- [ ] Mensajes de error
- [ ] Responsive en móvil

---

## ✅ Criterios de Aceptación

Para considerar la funcionalidad como exitosa:

1. ✅ Todos los modales abren correctamente
2. ✅ Todos los formularios validan correctamente
3. ✅ Todos los datos se guardan en el backend
4. ✅ Todos los datos se muestran correctamente
5. ✅ La auditoría registra todas las acciones
6. ✅ Los mensajes de éxito/error son claros
7. ✅ La UX es fluida y sin errores
8. ✅ Funciona en diferentes navegadores
9. ✅ Funciona en móvil
10. ✅ No hay errores en consola

---

## 🎯 Resultado Esperado Final

Al completar todas las pruebas:
- ✅ Los usuarios pueden agregar información completa a las historias clínicas
- ✅ Todos los formularios funcionan correctamente
- ✅ La información se guarda y muestra correctamente
- ✅ La experiencia de usuario es profesional y eficiente

---

**Probado por**: _____________  
**Fecha**: _____________  
**Resultado**: ✅ Aprobado / ❌ Rechazado  
**Observaciones**: _____________

---

**Desarrollado por**: Kiro AI Assistant  
**Fecha**: 2026-01-24  
**Versión**: 15.0.5
