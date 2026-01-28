# Instrucciones de Prueba - Firma Digital y Personalización HC

## Objetivo

Verificar que el sistema de generación de consentimientos desde historias clínicas funciona correctamente con:
- Logos personalizados HC (con fallback a CN)
- Datos del cliente automáticos
- Firma digital obligatoria
- Foto del cliente opcional
- Selección múltiple de plantillas
- PDF compuesto profesional

## Pre-requisitos

1. **Backend corriendo** en puerto 3000
2. **Frontend corriendo** en puerto 5173
3. **Tenant**: `demo-medico`
4. **Usuario**: `admin@clinicademo.com` / `Demo123!`
5. **URL**: `http://demo-medico.localhost:5173`

## Configuración Previa

### 1. Configurar Logos HC (Opcional)

Si quieres probar con logos específicos para HC:

1. Ir a **Configuración** → Pestaña **Logos HC**
2. Subir:
   - Logo principal HC
   - Logo footer HC
   - Marca de agua HC

Si no subes logos HC, el sistema usará automáticamente los logos CN como fallback.

### 2. Crear Plantillas HC

1. Ir a **Plantillas HC** (menú lateral)
2. Crear al menos 2 plantillas de prueba:

**Plantilla 1: Consentimiento General**
```
Nombre: Consentimiento Informado General
Categoría: General
Contenido:
Yo, {{clientName}}, identificado con {{clientId}}, autorizo al personal médico de {{companyName}} para realizar los procedimientos necesarios durante mi atención en la sede {{branchName}}.

Fecha de admisión: {{admissionDate}}
Historia Clínica: {{recordNumber}}

He sido informado de los riesgos y beneficios del tratamiento.
```

**Plantilla 2: Tratamiento de Datos**
```
Nombre: Autorización Tratamiento de Datos
Categoría: Tratamiento de Datos
Contenido:
Autorizo a {{companyName}} para el tratamiento de mis datos personales conforme a la Ley 1581 de 2012.

Datos del titular:
- Nombre: {{clientName}}
- Documento: {{clientId}}
- Email: {{clientEmail}}
- Teléfono: {{clientPhone}}

Fecha: {{currentDate}}
```

## Pasos de Prueba

### Prueba 1: Consentimiento General Simple

1. **Ir a Historias Clínicas**
   - Seleccionar una HC existente o crear una nueva

2. **Abrir el modal "Generar Consentimiento"**
   - Click en el botón "Generar Consentimiento"

3. **Configurar el consentimiento**
   - Tipo: **General**
   - Seleccionar: **Consentimiento Informado General**

4. **Capturar firma**
   - Click en "Capturar Firma del Paciente"
   - Dibujar firma en el pad
   - Click en "Guardar Firma"
   - Verificar que aparece ✓ "Firma capturada correctamente"

5. **Generar PDF**
   - Click en "Generar Consentimiento"
   - Esperar mensaje de éxito
   - El PDF debe abrirse automáticamente en nueva pestaña

6. **Verificar el PDF**
   - ✅ Header con color primario
   - ✅ Logo principal (HC o CN)
   - ✅ Información del paciente completa
   - ✅ Contenido de la plantilla con variables reemplazadas
   - ✅ Firma digital del paciente
   - ✅ Footer con logo y texto
   - ✅ Marca de agua (si está configurada)

### Prueba 2: Consentimiento de Procedimiento

1. **Abrir modal "Generar Consentimiento"**

2. **Configurar**
   - Tipo: **Procedimiento**
   - Seleccionar plantilla
   - Nombre del Procedimiento: `Infiltración articular`
   - Código CIE-10: `M25.5`
   - Descripción: `Dolor articular crónico en rodilla derecha`
   - ✅ Marcar "Requerido para el procedimiento"

3. **Capturar firma y foto**
   - Capturar firma (obligatorio)
   - Capturar foto del paciente (opcional)
   - Verificar que ambas aparecen con ✓

4. **Generar y verificar PDF**
   - El PDF debe incluir la firma Y la foto del paciente
   - Ambas deben aparecer en cajas lado a lado

### Prueba 3: PDF Compuesto (Múltiples Plantillas)

1. **Abrir modal "Generar Consentimiento"**

2. **Seleccionar MÚLTIPLES plantillas**
   - ✅ Consentimiento Informado General
   - ✅ Autorización Tratamiento de Datos
   - ✅ (Cualquier otra plantilla disponible)

3. **Capturar firma**

4. **Generar PDF**

5. **Verificar PDF compuesto**
   - ✅ Primera página: Información del paciente + Primera plantilla
   - ✅ Páginas intermedias: Otras plantillas (sin info del paciente)
   - ✅ Última página: Última plantilla + Sección de firma
   - ✅ Todas las páginas tienen header, footer y marca de agua
   - ✅ Todas las variables están reemplazadas correctamente

### Prueba 4: Validaciones

1. **Intentar generar sin plantillas**
   - No seleccionar ninguna plantilla
   - Click en "Generar"
   - ✅ Debe mostrar error: "Selecciona al menos una plantilla"

2. **Intentar generar sin firma**
   - Seleccionar plantilla
   - NO capturar firma
   - Click en "Generar"
   - ✅ Debe mostrar error: "La firma del paciente es obligatoria"

3. **Tipo Procedimiento sin nombre**
   - Tipo: Procedimiento
   - No llenar "Nombre del Procedimiento"
   - ✅ Debe mostrar error de validación

### Prueba 5: Fallback de Logos

1. **Sin logos HC configurados**
   - Ir a Configuración → Logos HC
   - Verificar que NO hay logos HC
   - Generar un consentimiento
   - ✅ El PDF debe usar los logos CN automáticamente

2. **Con logos HC configurados**
   - Subir logos HC
   - Generar un consentimiento
   - ✅ El PDF debe usar los logos HC

## Variables Disponibles

El sistema reemplaza automáticamente estas variables en las plantillas:

### Datos del Cliente
- `{{clientName}}` - Nombre completo
- `{{clientId}}` - Número de documento
- `{{clientEmail}}` - Email
- `{{clientPhone}}` - Teléfono
- `{{clientAddress}}` - Dirección

### Datos de la HC
- `{{recordNumber}}` - Número de HC (ej: HC-2026-000001)
- `{{admissionDate}}` - Fecha de admisión (formato largo)

### Datos de la Sede
- `{{branchName}}` - Nombre de la sede
- `{{branchAddress}}` - Dirección de la sede
- `{{branchPhone}}` - Teléfono de la sede
- `{{branchEmail}}` - Email de la sede

### Datos de la Empresa
- `{{companyName}}` - Nombre del tenant

### Datos del Procedimiento (si aplica)
- `{{procedureName}}` - Nombre del procedimiento
- `{{diagnosisCode}}` - Código CIE-10
- `{{diagnosisDescription}}` - Descripción del diagnóstico

### Fechas y Hora
- `{{signDate}}` - Fecha de firma (formato largo)
- `{{signTime}}` - Hora de firma
- `{{currentDate}}` - Fecha actual (formato largo)
- `{{currentYear}}` - Año actual

## Resultados Esperados

### ✅ Funcionalidad Completa

- [x] Modal se abre correctamente
- [x] Plantillas HC se cargan
- [x] Selección múltiple funciona
- [x] Campo `consentType` está presente
- [x] Campos condicionales aparecen según tipo
- [x] Firma digital es obligatoria
- [x] Foto del cliente es opcional
- [x] PDF se genera correctamente
- [x] PDF incluye logos HC (o CN como fallback)
- [x] PDF incluye datos del cliente
- [x] PDF incluye firma digital
- [x] PDF incluye foto (si se capturó)
- [x] Variables se reemplazan correctamente
- [x] PDF compuesto funciona con múltiples plantillas
- [x] Validaciones funcionan correctamente

### ✅ Calidad del PDF

- [x] Header con color primario
- [x] Logo principal visible y bien posicionado
- [x] Información del paciente clara y completa
- [x] Contenido legible con buen espaciado
- [x] Firma y foto en cajas lado a lado
- [x] Footer con logo y texto
- [x] Marca de agua sutil (10% opacidad)
- [x] Formato profesional

## Problemas Conocidos Resueltos

1. ✅ **Campo `consentType` faltante** - CORREGIDO
2. ✅ **Logos HC no se cargaban** - CORREGIDO (fallback implementado)
3. ✅ **Datos del cliente no aparecían** - CORREGIDO
4. ✅ **Firma no era obligatoria** - CORREGIDO

## Soporte

Si encuentras algún problema:

1. Verificar logs del backend (proceso 22)
2. Verificar consola del navegador (F12)
3. Verificar que el tenant es correcto (`demo-medico`)
4. Verificar que hay plantillas HC creadas
5. Verificar permisos del usuario (debe tener `medical_records:create_consent`)

---

**Última actualización**: 2026-01-26  
**Estado**: ✅ Sistema completamente funcional
