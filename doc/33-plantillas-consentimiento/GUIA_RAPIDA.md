# Guía Rápida - Plantillas de Consentimiento

## ¿Qué es?

Sistema que permite a los usuarios editar el contenido de los textos legales de los consentimientos sin modificar código.

## Tipos de Plantillas

1. **Consentimiento de Procedimiento**: Autorización para procedimientos/servicios
2. **Tratamiento de Datos Personales**: Según Ley 1581 de 2012
3. **Derechos de Imagen**: Autorización de uso de imagen

## Variables Disponibles

Usa estas variables en tus plantillas (se reemplazan automáticamente):

- `{{clientName}}` - Nombre del cliente
- `{{clientId}}` - Identificación
- `{{clientEmail}}` - Email
- `{{clientPhone}}` - Teléfono
- `{{serviceName}}` - Nombre del servicio
- `{{branchName}}` - Nombre de la sede
- `{{branchAddress}}` - Dirección de la sede
- `{{signDate}}` - Fecha de firma
- `{{signTime}}` - Hora de firma
- `{{currentDate}}` - Fecha actual

## Cómo Usar

### Crear Plantilla

1. Ir a "Plantillas" en el menú
2. Clic en "Nueva Plantilla"
3. Seleccionar tipo
4. Escribir nombre y contenido
5. Usar el botón "Ver Variables" para insertar variables
6. Marcar como "Activa" y/o "Predeterminada"
7. Guardar

### Editar Plantilla

1. Clic en el ícono de lápiz
2. Modificar contenido
3. Guardar cambios

### Marcar como Predeterminada

1. Clic en el ícono de estrella
2. Confirmar
3. Esta plantilla se usará por defecto

## Ejemplo de Plantilla

```
DECLARACIÓN DE CONSENTIMIENTO

Yo, {{clientName}}, identificado(a) con {{clientId}}, declaro que he sido informado(a) sobre el procedimiento/servicio {{serviceName}}.

Autorizo voluntariamente la realización del procedimiento.

Fecha: {{signDate}}
Sede: {{branchName}}
Dirección: {{branchAddress}}

Firma: _______________________
```

## Permisos Necesarios

- **Ver plantillas**: `view_templates`
- **Crear plantillas**: `create_templates`
- **Editar plantillas**: `edit_templates`
- **Eliminar plantillas**: `delete_templates`

## Reglas Importantes

- Solo puede haber una plantilla predeterminada por tipo
- No se puede eliminar la plantilla predeterminada
- Las variables deben usar el formato `{{nombreVariable}}`
- Cada tenant tiene sus propias plantillas

## Acceso

**Menú**: Plantillas  
**Ruta**: `/consent-templates`  
**Roles con acceso**: SUPER_ADMIN, ADMIN_GENERAL, ADMIN_SEDE
