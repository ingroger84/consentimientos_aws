# 🧪 Instrucciones de Prueba - Corrección Sobreposición PDF HC

## 📋 Estado Actual

✅ **Código implementado y compilado sin errores**
- Backend corriendo en puerto 3000
- Frontend corriendo en puerto 5174
- Cambios aplicados en `medical-records-pdf.service.ts`

## 🎯 Objetivo de la Prueba

Verificar que el texto del contenido (Historia Clínica, Fecha de admisión) **NO se sobrepone** con el título "FIRMA Y CONSENTIMIENTO" en el PDF generado.

---

## 📝 Pasos para Probar

### 1. Acceder al Sistema

1. Abre el navegador en: `http://demo-medico.localhost:5174`
2. Inicia sesión con:
   - **Email:** `admin@clinicademo.com`
   - **Password:** `Demo123!`

### 2. Ir a Historias Clínicas

1. En el menú lateral, haz clic en **"Historias Clínicas"**
2. Busca una HC con estado **"Activa"** (badge verde)
3. Haz clic en el número de HC para abrirla

### 3. Generar Nuevo Consentimiento

1. Dentro de la HC, haz clic en el botón verde **"Generar Consentimiento"**
2. En el modal que se abre:
   - Selecciona **al menos una plantilla** de consentimiento HC
   - Completa los campos opcionales si deseas:
     - Nombre del procedimiento
     - Código de diagnóstico
     - Descripción del diagnóstico
     - Notas
   - **IMPORTANTE:** Captura la firma en el canvas
   - **IMPORTANTE:** Toma una foto del paciente con la cámara
3. Haz clic en **"Generar Consentimiento"**
4. Espera el mensaje de éxito

### 4. Ver el PDF Generado

1. Ve a la pestaña **"Consentimientos"** dentro de la HC
2. Busca el consentimiento recién generado (el más reciente)
3. Haz clic en el ícono de **"Ver PDF"** (ícono de documento)
4. Se abrirá un modal con el PDF

### 5. Verificar el Espaciado

En el PDF, verifica lo siguiente:

#### ✅ Checklist Visual

- [ ] **El contenido termina claramente**
  - La última línea de texto (ej: "Fecha de admisión: 26/1/2026") está completa
  - No hay texto cortado o incompleto

- [ ] **Hay espacio visible entre contenido y firma**
  - Después del último texto del contenido hay un espacio en blanco
  - El espacio es suficiente para distinguir claramente las secciones

- [ ] **El título "FIRMA Y CONSENTIMIENTO" está bien separado**
  - El título NO está encima del contenido
  - El título NO está pegado al contenido
  - Hay espacio blanco visible antes del título

- [ ] **La firma y foto están bien posicionadas**
  - Las cajas de firma y foto están debajo del título
  - Las cajas NO se sobreponen con el título
  - Las cajas NO se sobreponen con el footer

- [ ] **El footer está bien separado**
  - El texto del footer (ej: "Clinica Demo - Documento generado electrónicamente") está en la parte inferior
  - El footer NO está encima de la firma/foto
  - Hay espacio visible entre firma/foto y footer

- [ ] **NO hay sobreposición de textos**
  - Ningún texto está encima de otro
  - Todo el texto es legible
  - No hay textos cortados o parcialmente ocultos

---

## 🔍 Casos de Prueba Adicionales

### Caso 1: Contenido Corto (1 plantilla)

1. Genera un consentimiento con **solo 1 plantilla**
2. Verifica que:
   - La firma no quede demasiado arriba
   - El espaciado se vea natural
   - El footer esté en la parte inferior

### Caso 2: Contenido Largo (Múltiples plantillas)

1. Genera un consentimiento con **3 o más plantillas**
2. Verifica que:
   - No haya sobreposición en ninguna página
   - La firma solo aparezca en la última página
   - El espaciado sea consistente

### Caso 3: Con y Sin Firma/Foto

1. Genera un consentimiento **con firma y foto**
2. Genera otro consentimiento **solo con firma** (sin foto)
3. Verifica que el espaciado funcione en ambos casos

---

## 📊 Comparación Visual Esperada

### ANTES (Incorrecto) ❌
```
Historia Clínica: HC-2026-000001
Fecha de admisión: 26/1/2026
FIRMA Y CONSENTIMIENTO        ← Encima del texto
┌────────┐  ┌────────┐
│ Firma  │  │  Foto  │
└────────┘  └────────┘
```

### DESPUÉS (Correcto) ✅
```
Historia Clínica: HC-2026-000001
Fecha de admisión: 26/1/2026
                              ← Espacio visible (40 puntos)
                              ← Espacio visible (50 puntos)
FIRMA Y CONSENTIMIENTO        ← Bien separado
┌────────┐  ┌────────┐
│ Firma  │  │  Foto  │
└────────┘  └────────┘
                              ← Espacio visible (80 puntos)
Clinica Demo - Documento...   ← Footer bien separado
```

---

## ⚠️ Problemas Comunes y Soluciones

### Problema 1: Todavía veo sobreposición

**Causa:** Estás viendo un PDF generado antes de los cambios

**Solución:**
1. Asegúrate de generar un **NUEVO** consentimiento
2. Los PDFs ya generados NO se modifican automáticamente
3. Verifica la fecha/hora de generación del consentimiento

### Problema 2: El backend no está corriendo

**Solución:**
```powershell
cd backend
npm run start:dev
```

### Problema 3: El frontend no está corriendo

**Solución:**
```powershell
cd frontend
npm run dev
```

### Problema 4: No puedo capturar firma o foto

**Solución:**
1. Verifica que el navegador tenga permisos de cámara
2. Usa Chrome o Edge (mejor compatibilidad)
3. Si es necesario, permite el acceso a la cámara cuando el navegador lo solicite

---

## 📸 Capturas de Pantalla Recomendadas

Para documentar la prueba, toma capturas de:

1. **Modal de generación de consentimiento**
   - Con plantillas seleccionadas
   - Con firma capturada
   - Con foto tomada

2. **PDF generado - Vista completa**
   - Mostrando toda la página

3. **PDF generado - Zoom en sección de firma**
   - Mostrando claramente el espacio entre contenido y firma
   - Mostrando el título "FIRMA Y CONSENTIMIENTO"
   - Mostrando las cajas de firma y foto
   - Mostrando el footer

4. **Lista de consentimientos**
   - Mostrando el consentimiento recién generado

---

## ✅ Criterios de Aceptación

La prueba es **EXITOSA** si:

1. ✅ El PDF se genera sin errores
2. ✅ El contenido termina claramente sin texto cortado
3. ✅ Hay **espacio visible** entre el contenido y el título "FIRMA Y CONSENTIMIENTO"
4. ✅ El título está **bien separado** del contenido (no encima)
5. ✅ La firma y foto están **bien posicionadas** debajo del título
6. ✅ El footer está **bien separado** en la parte inferior
7. ✅ **NO hay sobreposición** de ningún texto
8. ✅ Todo el texto es **legible y claro**

---

## 📝 Reporte de Resultados

Después de probar, completa lo siguiente:

### Resultado de la Prueba

- [ ] ✅ EXITOSA - Todo funciona correctamente
- [ ] ⚠️ PARCIAL - Funciona pero hay detalles menores
- [ ] ❌ FALLIDA - Hay problemas que requieren corrección

### Observaciones

```
[Escribe aquí tus observaciones sobre el espaciado, legibilidad, etc.]
```

### Capturas de Pantalla

```
[Adjunta o describe las capturas tomadas]
```

### Problemas Encontrados

```
[Si encontraste algún problema, descríbelo aquí]
```

---

**Fecha de Prueba:** _____________
**Probado por:** _____________
**Navegador:** _____________
**Resultado:** _____________

---

## 🔄 Próximos Pasos

Si la prueba es exitosa:
1. ✅ Marcar la tarea como completada
2. ✅ Actualizar el checklist en README.md
3. ✅ Cerrar el issue/ticket relacionado

Si la prueba falla:
1. ❌ Documentar el problema específico
2. ❌ Tomar capturas de pantalla del error
3. ❌ Reportar para ajustes adicionales

---

**Versión:** 15.0.10
**Fecha:** 2026-01-26
**Estado:** ⏳ PENDIENTE DE PRUEBA
