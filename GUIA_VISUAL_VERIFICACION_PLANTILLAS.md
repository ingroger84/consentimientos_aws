# Guía Visual: Verificación de Plantillas por Servicio

**Versión:** V62  
**Fecha:** 2026-03-20

---

## 🎯 Objetivo

Verificar que cuando asocias una plantilla a un servicio mediante el checkbox, el PDF generado USE el contenido de esa plantilla.

---

## 📋 Pasos Simples de Verificación

### PASO 1: Editar Plantilla y Asociar Servicio

```
1. Ir a: Plantillas CN
2. Seleccionar una plantilla (o crear nueva)
3. Clic en "Editar"
4. Activar checkbox de uno o más servicios
5. Guardar
```

**Ejemplo:**
```
Plantilla: "Consentimiento Masajes Especiales"
Contenido: "Este es mi texto personalizado para masajes..."
Servicios asociados: ☑ Masaje Sueco
                     ☑ Masaje Relajante
```

---

### PASO 2: Crear Consentimiento con ese Servicio

```
1. Ir a: Consentimientos
2. Clic en "Nuevo Consentimiento"
3. Seleccionar el servicio que asociaste (ej: "Masaje Sueco")
4. Llenar datos del cliente
5. Firmar
6. Generar PDF
```

---

### PASO 3: Abrir el PDF y Verificar

**¿Qué debes ver en el PDF?**

✅ **CORRECTO:** El PDF debe contener el texto de tu plantilla personalizada

```
DECLARACIÓN DE CONSENTIMIENTO

Este es mi texto personalizado para masajes...
[Tu contenido aquí]
```

❌ **INCORRECTO:** El PDF contiene texto antiguo que no es de tu plantilla

```
DECLARACIÓN DE CONSENTIMIENTO

Declaro que he sido informado(a) sobre el procedimiento...
[Texto antiguo predeterminado]
```

---

## 🔍 Ejemplo Completo

### Escenario de Prueba

**1. Crear Plantilla Personalizada**

```
Nombre: Masajes La Polka
Tipo: Consentimiento de Procedimiento
Contenido:
  "CONSENTIMIENTO PARA SERVICIOS DE MASAJES
  
  Yo, {{clientName}}, identificado con C.C. {{clientId}}, 
  autorizo expresamente la realización del servicio de {{serviceName}}
  en las instalaciones de {{branchName}}.
  
  He sido informado sobre los beneficios y contraindicaciones
  del servicio contratado.
  
  Fecha: {{signDate}}"

Servicios asociados: ☑ Masaje Sueco
                     ☑ Masaje Relajante
```

**2. Generar Consentimiento**

```
Cliente: Juan Pérez
C.C.: 123456789
Servicio: Masaje Sueco
Sede: Glamping La Polka
```

**3. Verificar PDF Generado**

El PDF debe mostrar:

```
DECLARACIÓN DE CONSENTIMIENTO

CONSENTIMIENTO PARA SERVICIOS DE MASAJES

Yo, Juan Pérez, identificado con C.C. 123456789,
autorizo expresamente la realización del servicio de Masaje Sueco
en las instalaciones de Glamping La Polka.

He sido informado sobre los beneficios y contraindicaciones
del servicio contratado.

Fecha: 20 de marzo de 2026
```

**Nota:** Las variables `{{clientName}}`, `{{serviceName}}`, etc. deben estar reemplazadas con los valores reales.

---

## ⚠️ Problemas Comunes

### Problema 1: El PDF sigue mostrando texto antiguo

**Posibles causas:**
1. La plantilla NO está asociada al servicio
2. La plantilla está inactiva
3. El backend no se reinició

**Solución:**
1. Verificar que el checkbox del servicio esté activado
2. Verificar que la plantilla esté activa (toggle verde)
3. Esperar unos segundos y volver a intentar

---

### Problema 2: Las variables no se reemplazan

**Ejemplo incorrecto:**
```
Yo, {{clientName}}, identificado con C.C. {{clientId}}...
```

**Causa:** Las variables deben usar doble llave `{{variable}}`

**Variables disponibles:**
- `{{clientName}}` - Nombre del cliente
- `{{clientId}}` - Cédula del cliente
- `{{clientEmail}}` - Email del cliente
- `{{serviceName}}` - Nombre del servicio
- `{{branchName}}` - Nombre de la sede
- `{{signDate}}` - Fecha de firma
- `{{currentDate}}` - Fecha actual

---

## 📊 Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────┐
│ 1. CREAR/EDITAR PLANTILLA                                   │
│    - Escribir contenido personalizado                       │
│    - Activar checkbox de servicios                          │
│    - Guardar                                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. CREAR CONSENTIMIENTO                                     │
│    - Seleccionar el servicio asociado                       │
│    - Llenar datos del cliente                               │
│    - Firmar                                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. GENERAR PDF                                              │
│    Backend busca:                                            │
│    ¿Hay plantilla asociada al servicio?                     │
│      ✅ SÍ → Usa esa plantilla                              │
│      ❌ NO → Usa primera plantilla activa (fallback)        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. VERIFICAR PDF                                            │
│    ✅ Contiene tu texto personalizado                       │
│    ✅ Variables reemplazadas correctamente                  │
│    ❌ NO contiene texto antiguo/predeterminado              │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Checklist Rápido

Marca cada paso a medida que lo completes:

- [ ] He editado una plantilla
- [ ] He activado el checkbox de al menos un servicio
- [ ] He guardado la plantilla
- [ ] He creado un consentimiento con ese servicio
- [ ] He generado el PDF
- [ ] He abierto el PDF
- [ ] El PDF contiene mi texto personalizado ✅
- [ ] Las variables están reemplazadas ✅
- [ ] NO veo texto antiguo ✅

---

## 🎯 Resultado Esperado

**ANTES (Problema):**
- Asociabas plantilla a servicio
- PDF generado usaba texto antiguo/predeterminado ❌

**DESPUÉS (Solución):**
- Asocias plantilla a servicio
- PDF generado usa tu texto personalizado ✅

---

## 📞 ¿Necesitas Ayuda?

Si después de seguir estos pasos el PDF sigue mostrando contenido antiguo:

1. Toma captura de pantalla de:
   - La plantilla editada (mostrando servicios asociados)
   - El PDF generado (mostrando el contenido incorrecto)

2. Reporta el problema indicando:
   - Nombre de la plantilla
   - Nombre del servicio
   - Qué texto esperabas ver
   - Qué texto ves en el PDF

---

**Estado:** ⚠️ PENDIENTE VERIFICACIÓN

**Acción:** Por favor, sigue los pasos de esta guía y reporta si el PDF ahora usa el contenido correcto de tu plantilla.

