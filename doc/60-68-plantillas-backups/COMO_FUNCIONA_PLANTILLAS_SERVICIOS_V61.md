# 📘 CÓMO FUNCIONA: Plantillas CN Asociadas a Servicios

**Versión**: v61.0.0  
**Fecha**: 17 de marzo de 2026  
**Guía para Usuarios**

---

## 🎯 ¿Qué es este Sistema?

Ahora puedes asociar cada plantilla de consentimiento convencional (CN) a servicios específicos. Esto significa que tus clientes recibirán solo los consentimientos de los servicios que contratan.

### Antes vs Ahora

**ANTES** (hasta v60):
```
❌ Una plantilla para todos los servicios
❌ Todos los clientes reciben todas las plantillas
❌ Consentimientos irrelevantes para el cliente
```

**AHORA** (v61):
```
✅ Cada plantilla asociada a servicios específicos
✅ Clientes reciben solo consentimientos relevantes
✅ Experiencia personalizada por servicio
```

---

## 🔍 Ejemplo Práctico

### Tu Negocio: Glamping La Polka

**Servicios que ofreces**:
- 🏕️ Alojamiento
- 💆 Spa
- 🍽️ Restaurante
- 🚴 Tours

**Plantillas que creas**:
1. "Consentimiento de Alojamiento" → Asociada a: [Alojamiento]
2. "Consentimiento de Spa" → Asociada a: [Spa]
3. "Consentimiento de Tours" → Asociada a: [Tours]
4. "Tratamiento de Datos Personales" → Asociada a: [Todos los servicios]

### Caso 1: Cliente que contrata Alojamiento + Spa

**Recibirá**:
- ✅ Consentimiento de Alojamiento
- ✅ Consentimiento de Spa
- ✅ Tratamiento de Datos Personales

**NO recibirá**:
- ❌ Consentimiento de Tours (no contrató ese servicio)

### Caso 2: Cliente que contrata solo Tours

**Recibirá**:
- ✅ Consentimiento de Tours
- ✅ Tratamiento de Datos Personales

**NO recibirá**:
- ❌ Consentimiento de Alojamiento
- ❌ Consentimiento de Spa

---

## 📝 Cómo Crear una Plantilla con Servicios

### Paso 1: Ir a Plantillas de CN
1. Login en https://archivoenlinea.com
2. Menú lateral → "Gestión de Plantillas"
3. Clic en "Plantillas de CN"

### Paso 2: Crear Nueva Plantilla
1. Clic en botón "Nueva Plantilla" (esquina superior derecha)
2. Se abre el modal de creación

### Paso 3: Llenar Información Básica
```
Tipo de Plantilla: [Seleccionar tipo]
Nombre: [Ej: Consentimiento de Spa]
Descripción: [Opcional]
```

### Paso 4: Seleccionar Servicios ⭐ NUEVO
```
Servicios Asociados *
┌─────────────────────────────────────┐
│ ☑ 🏷️ Alojamiento                    │
│ ☑ 🏷️ Spa                            │
│ ☐ 🏷️ Restaurante                    │
│ ☑ 🏷️ Tours                          │
└─────────────────────────────────────┘
3 servicios seleccionados
```

**Importante**:
- ✅ Debes seleccionar AL MENOS 1 servicio
- ✅ Puedes seleccionar múltiples servicios
- ✅ Solo aparecen servicios activos
- ✅ El contador te muestra cuántos seleccionaste

### Paso 5: Escribir Contenido
```
Contenido de la Plantilla *
[Escribe el texto del consentimiento aquí]

Puedes usar variables como:
- {{clientName}} - Nombre del cliente
- {{clientId}} - Identificación
- {{date}} - Fecha actual
```

### Paso 6: Opciones Adicionales
```
☑ Plantilla activa
☐ Marcar como predeterminada
```

### Paso 7: Guardar
1. Clic en "Crear Plantilla"
2. ¡Listo! Tu plantilla está creada y asociada a los servicios seleccionados

---

## ✏️ Cómo Editar Servicios de una Plantilla

### Paso 1: Buscar la Plantilla
1. Ir a "Plantillas de CN"
2. Buscar la plantilla que quieres editar

### Paso 2: Abrir Editor
1. Clic en el botón "Editar" (ícono de lápiz)
2. Se abre el modal de edición

### Paso 3: Modificar Servicios
```
Servicios Asociados *
┌─────────────────────────────────────┐
│ ☑ 🏷️ Alojamiento    ← Ya estaba     │
│ ☑ 🏷️ Spa            ← Ya estaba     │
│ ☑ 🏷️ Restaurante    ← NUEVO         │
│ ☐ 🏷️ Tours          ← Desmarcado    │
└─────────────────────────────────────┘
3 servicios seleccionados
```

**Puedes**:
- ✅ Agregar nuevos servicios (marcar checkbox)
- ✅ Quitar servicios (desmarcar checkbox)
- ✅ Cambiar completamente los servicios

**Recuerda**:
- ⚠️ Debe quedar AL MENOS 1 servicio seleccionado

### Paso 4: Guardar Cambios
1. Clic en "Guardar Cambios"
2. Los servicios se actualizan inmediatamente

---

## 👀 Cómo Ver los Servicios Asociados

### En el Listado de Plantillas

Cada plantilla muestra sus servicios asociados con badges azules:

```
┌─────────────────────────────────────────────────────────┐
│ 📄 Consentimiento de Spa                                │
│    ⭐ Predeterminada  ✅ Activa                         │
│                                                         │
│    Plantilla para tratamientos de spa y masajes       │
│                                                         │
│    Servicios: [Spa] [Masajes] [Sauna]                 │
│                                                         │
│    Tipo: Consentimiento de Procedimiento               │
│    Actualizada: 17/03/2026                             │
│                                                         │
│    [👁️ Ver] [⭐ Default] [✏️ Editar] [🗑️ Eliminar]    │
└─────────────────────────────────────────────────────────┘
```

**Los badges azules** te muestran a qué servicios está asociada cada plantilla.

---

## 🔄 ¿Qué Pasó con mis Plantillas Existentes?

### Migración Automática

Todas tus plantillas existentes fueron asociadas automáticamente a TODOS tus servicios activos.

**Ejemplo**:
```
Antes de V61:
- Plantilla: "Consentimiento General"
- Servicios: (ninguno)

Después de V61:
- Plantilla: "Consentimiento General"
- Servicios: [Alojamiento] [Spa] [Restaurante] [Tours]
```

**Esto significa**:
- ✅ Tus plantillas siguen funcionando igual que antes
- ✅ No perdiste ninguna funcionalidad
- ✅ Puedes editarlas para asociarlas solo a servicios específicos

### Cómo Ajustar Plantillas Existentes

Si quieres que una plantilla existente aplique solo a servicios específicos:

1. Ir a "Plantillas de CN"
2. Buscar la plantilla
3. Clic en "Editar"
4. Desmarcar los servicios que NO quieres
5. Dejar marcados solo los servicios relevantes
6. Guardar cambios

---

## ⚠️ Validaciones y Restricciones

### Al Crear/Editar Plantillas

**Validación 1: Al menos 1 servicio**
```
❌ Error: "Debe seleccionar al menos un servicio"
✅ Solución: Marca al menos 1 checkbox de servicio
```

**Validación 2: Servicios disponibles**
```
⚠️ Advertencia: "No hay servicios disponibles"
✅ Solución: Crea servicios primero en "Gestión de Servicios"
```

**Validación 3: Servicios activos**
```
ℹ️ Info: Solo aparecen servicios activos
✅ Si no ves un servicio, verifica que esté activo
```

---

## 🎨 Interfaz Visual

### Modal de Crear Plantilla

```
┌─────────────────────────────────────────────────────────┐
│ Nueva Plantilla                                    [✕]  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Tipo de Plantilla *                                    │
│ [Consentimiento de Procedimiento ▼]                    │
│                                                         │
│ Nombre de la Plantilla *                               │
│ [Consentimiento de Spa                        ]        │
│                                                         │
│ Descripción                                            │
│ [Para tratamientos de spa y masajes          ]        │
│                                                         │
│ Servicios Asociados * ⭐ NUEVO                         │
│ ┌─────────────────────────────────────────────┐       │
│ │ ☑ 🏷️ Alojamiento                            │       │
│ │ ☑ 🏷️ Spa                                    │       │
│ │ ☐ 🏷️ Restaurante                            │       │
│ │ ☑ 🏷️ Tours                                  │       │
│ └─────────────────────────────────────────────┘       │
│ 3 servicios seleccionados                             │
│                                                         │
│ ℹ️ Los clientes recibirán esta plantilla solo cuando  │
│    contraten estos servicios                           │
│                                                         │
│ Contenido de la Plantilla *                            │
│ ┌─────────────────────────────────────────────┐       │
│ │ Yo, {{clientName}}, identificado con        │       │
│ │ {{clientId}}, autorizo...                   │       │
│ │                                              │       │
│ └─────────────────────────────────────────────┘       │
│                                                         │
│ ☑ Plantilla activa                                     │
│ ☐ Marcar como predeterminada                           │
│                                                         │
│              [Cancelar]  [Crear Plantilla]             │
└─────────────────────────────────────────────────────────┘
```

### Listado con Badges de Servicios

```
┌─────────────────────────────────────────────────────────┐
│ Plantillas de Consentimiento                           │
│                                          [Nueva Plantilla] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Consentimiento de Procedimiento                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 📄 Consentimiento de Alojamiento                       │
│    ✅ Activa                                            │
│    Para reservas de alojamiento                        │
│    Servicios: [Alojamiento]                            │
│    [👁️ Ver] [✏️ Editar] [🗑️ Eliminar]                 │
│                                                         │
│ 📄 Consentimiento de Spa                               │
│    ⭐ Predeterminada  ✅ Activa                         │
│    Para tratamientos de spa                            │
│    Servicios: [Spa] [Masajes]                          │
│    [👁️ Ver] [⭐ Default] [✏️ Editar] [🗑️ Eliminar]    │
│                                                         │
│ 📄 Tratamiento de Datos                                │
│    ✅ Activa                                            │
│    Autorización de datos personales                    │
│    Servicios: [Alojamiento] [Spa] [Restaurante] [Tours]│
│    [👁️ Ver] [✏️ Editar] [🗑️ Eliminar]                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Casos de Uso Reales

### Caso 1: Hotel con Múltiples Servicios

**Servicios**:
- Alojamiento
- Spa
- Restaurante
- Gimnasio
- Piscina

**Plantillas**:
1. "Consentimiento de Alojamiento" → [Alojamiento]
2. "Consentimiento de Spa" → [Spa]
3. "Consentimiento de Gimnasio" → [Gimnasio]
4. "Uso de Piscina" → [Piscina]
5. "Tratamiento de Datos" → [Todos]

**Resultado**:
- Cliente de solo alojamiento: 2 consentimientos
- Cliente de alojamiento + spa: 3 consentimientos
- Cliente de alojamiento + spa + gimnasio: 4 consentimientos

### Caso 2: Clínica Médica

**Servicios**:
- Consulta General
- Cirugía
- Laboratorio
- Imágenes Diagnósticas

**Plantillas**:
1. "Consentimiento de Consulta" → [Consulta General]
2. "Consentimiento Quirúrgico" → [Cirugía]
3. "Consentimiento de Laboratorio" → [Laboratorio]
4. "Derechos de Imagen" → [Cirugía, Imágenes Diagnósticas]
5. "Tratamiento de Datos" → [Todos]

**Resultado**:
- Paciente de consulta: 2 consentimientos
- Paciente de cirugía: 3 consentimientos (Quirúrgico + Imagen + Datos)
- Paciente de laboratorio: 2 consentimientos

### Caso 3: Centro Deportivo

**Servicios**:
- Gimnasio
- Clases Grupales
- Entrenamiento Personal
- Spa

**Plantillas**:
1. "Consentimiento de Actividad Física" → [Gimnasio, Clases Grupales, Entrenamiento Personal]
2. "Consentimiento de Spa" → [Spa]
3. "Exoneración de Responsabilidad" → [Todos]
4. "Tratamiento de Datos" → [Todos]

**Resultado**:
- Cliente de gimnasio: 3 consentimientos
- Cliente de spa: 3 consentimientos
- Cliente de gimnasio + spa: 4 consentimientos

---

## 🔧 Troubleshooting

### Problema 1: No veo el selector de servicios

**Posibles causas**:
1. No has limpiado el caché del navegador
2. No tienes servicios creados

**Solución**:
1. Presiona `Ctrl + Shift + Delete`
2. Selecciona "Imágenes y archivos en caché"
3. Clic en "Borrar datos"
4. Recarga con `Ctrl + F5`
5. Si aún no aparece, ve a "Gestión de Servicios" y crea al menos 1 servicio

### Problema 2: Error "Debe seleccionar al menos un servicio"

**Causa**: No has marcado ningún checkbox de servicio

**Solución**:
1. Marca al menos 1 checkbox en la sección "Servicios Asociados"
2. Verifica que el contador diga "1 servicio seleccionado" o más
3. Intenta guardar nuevamente

### Problema 3: No veo badges de servicios en plantillas existentes

**Posibles causas**:
1. Caché del navegador
2. Migración no ejecutada

**Solución**:
1. Limpiar caché del navegador (Ctrl + Shift + Delete)
2. Recargar página (Ctrl + F5)
3. Si persiste, contactar soporte técnico

### Problema 4: Mensaje "No hay servicios disponibles"

**Causa**: No tienes servicios creados o todos están inactivos

**Solución**:
1. Ir a "Gestión de Servicios"
2. Crear al menos 1 servicio
3. Asegurarte de que esté marcado como "Activo"
4. Volver a "Plantillas de CN"

---

## 📞 Soporte

Si tienes problemas o preguntas:

1. **Limpiar caché del navegador** (resuelve el 90% de problemas)
2. **Verificar que tienes servicios creados**
3. **Contactar soporte técnico** si persiste el problema

---

## 🎉 Beneficios del Sistema

### Para tu Negocio
- ✅ Consentimientos más relevantes
- ✅ Mejor experiencia del cliente
- ✅ Menos confusión
- ✅ Proceso más profesional

### Para tus Clientes
- ✅ Solo firman lo necesario
- ✅ Consentimientos claros y específicos
- ✅ Proceso más rápido
- ✅ Mejor comprensión de lo que firman

### Para tu Equipo
- ✅ Gestión más organizada
- ✅ Plantillas específicas por servicio
- ✅ Fácil de mantener
- ✅ Escalable a nuevos servicios

---

**¡Disfruta del nuevo sistema de plantillas asociadas a servicios! 🚀**

**Versión**: v61.0.0  
**Fecha**: 17 de marzo de 2026  
**Desarrollado por**: Kiro AI Assistant
