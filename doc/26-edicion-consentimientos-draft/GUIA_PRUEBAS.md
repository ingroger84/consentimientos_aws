# Guía de Pruebas - Edición de Consentimientos DRAFT

**Versión:** 1.1.27  
**Fecha:** 22 de enero de 2026

## Objetivo

Verificar que los operadores pueden editar consentimientos en estado DRAFT para completarlos y enviarlos correctamente.

## Pre-requisitos

- Usuario con perfil OPERADOR o superior
- Permisos: `CREATE_CONSENTS` y `SIGN_CONSENTS`
- Acceso a https://datagree.net

## Escenario 1: Crear Consentimiento en DRAFT

### Pasos

1. Iniciar sesión en https://datagree.net
2. Ir a "Consentimientos" en el menú lateral
3. Hacer clic en "Nuevo Consentimiento"
4. Completar Paso 1 - Datos del Cliente:
   - Seleccionar un servicio
   - Seleccionar una sede
   - Nombre: "Juan Pérez Test"
   - Identificación: "123456789"
   - Email: tu_email@ejemplo.com
   - Teléfono: "+57 300 123 4567"
   - (Opcional) Tomar foto del cliente
5. Hacer clic en "Continuar"
6. Completar Paso 2 - Preguntas:
   - Responder todas las preguntas requeridas
7. Hacer clic en "Continuar"
8. **NO FIRMAR** - Cerrar la ventana o navegar a otra página

### Resultado Esperado

✅ Consentimiento creado en estado DRAFT  
✅ Aparece en la lista de consentimientos con badge gris "DRAFT"  
✅ NO tiene PDF generado  
✅ NO se envió email

## Escenario 2: Editar Consentimiento DRAFT

### Pasos

1. En la lista de consentimientos, localizar el consentimiento en estado DRAFT
2. Verificar que aparece un botón con icono de lápiz (Editar)
3. Hacer clic en el botón "Editar"
4. Verificar que se carga la página de edición con:
   - Título: "Editar Consentimiento"
   - Datos del cliente pre-llenados
   - Servicio y sede seleccionados
   - Foto del cliente (si fue capturada)
5. Modificar algunos datos:
   - Cambiar nombre a "Juan Pérez Editado"
   - Cambiar teléfono
   - Modificar alguna respuesta
6. Hacer clic en "Continuar"
7. Verificar que las respuestas se mantienen
8. Hacer clic en "Continuar" nuevamente
9. **FIRMAR** el consentimiento en el paso 3
10. Esperar a que se procese

### Resultado Esperado

✅ Datos se cargan correctamente en modo edición  
✅ Modificaciones se guardan  
✅ Se puede continuar al paso de firma  
✅ Al firmar, se generan los 3 PDFs  
✅ Se envía email al cliente  
✅ Estado cambia a SENT  
✅ Botón "Editar" desaparece (ya no es DRAFT)

## Escenario 3: Intentar Editar Consentimiento SIGNED

### Pasos

1. En la lista de consentimientos, localizar un consentimiento en estado SIGNED o SENT
2. Verificar que NO aparece el botón "Editar"
3. Solo aparecen botones de:
   - Ver PDF (icono de documento)
   - Reenviar Email (icono de sobre)
   - Eliminar (icono de papelera, si tiene permisos)

### Resultado Esperado

✅ NO hay botón "Editar" para consentimientos firmados  
✅ Solo consentimientos DRAFT pueden ser editados

## Escenario 4: Editar y Cambiar Servicio

### Pasos

1. Crear un consentimiento DRAFT con Servicio A
2. Editar el consentimiento
3. Cambiar a Servicio B (con diferentes preguntas)
4. Hacer clic en "Continuar"
5. Verificar que aparecen las preguntas del Servicio B
6. Responder las nuevas preguntas
7. Continuar y firmar

### Resultado Esperado

✅ Al cambiar servicio, se cargan las preguntas correctas  
✅ Respuestas anteriores se eliminan  
✅ Se guardan las nuevas respuestas  
✅ Consentimiento se completa exitosamente

## Escenario 5: Editar Foto del Cliente

### Pasos

1. Crear consentimiento DRAFT con foto del cliente
2. Editar el consentimiento
3. Verificar que la foto se muestra
4. Hacer clic en "Tomar Otra Foto"
5. Capturar nueva foto
6. Continuar y firmar

### Resultado Esperado

✅ Foto original se muestra en modo edición  
✅ Se puede capturar nueva foto  
✅ Nueva foto reemplaza la anterior  
✅ Foto actualizada aparece en el PDF final

## Escenario 6: Validación de Permisos

### Pasos

1. Iniciar sesión con usuario sin permiso `CREATE_CONSENTS`
2. Intentar acceder a `/consents/edit/:id` directamente

### Resultado Esperado

✅ Sistema bloquea el acceso  
✅ Muestra mensaje de permisos insuficientes

## Checklist de Verificación

### Backend
- [ ] Endpoint PATCH /consents/:id responde correctamente
- [ ] Solo permite editar consentimientos en DRAFT
- [ ] Lanza error 404 si consentimiento no existe
- [ ] Lanza error 400 si estado no es DRAFT
- [ ] Actualiza datos del cliente correctamente
- [ ] Actualiza servicio y sede correctamente
- [ ] Elimina respuestas anteriores
- [ ] Guarda nuevas respuestas
- [ ] Respeta permisos de usuario

### Frontend
- [ ] Botón "Editar" visible solo para DRAFT
- [ ] Ruta `/consents/edit/:id` funciona
- [ ] Datos se cargan correctamente
- [ ] Formulario se pre-llena con datos existentes
- [ ] Foto del cliente se muestra si existe
- [ ] Modificaciones se guardan
- [ ] Flujo de firma funciona después de editar
- [ ] PDFs se generan correctamente
- [ ] Email se envía correctamente
- [ ] Estado se actualiza a SENT

## Casos de Error

### Error 1: Consentimiento No Encontrado
**Acción:** Intentar editar consentimiento con ID inexistente  
**Esperado:** Error 404 "Consentimiento no encontrado"

### Error 2: Estado Incorrecto
**Acción:** Intentar editar consentimiento SIGNED mediante API  
**Esperado:** Error 400 "Solo se pueden editar consentimientos en estado DRAFT"

### Error 3: Sin Permisos
**Acción:** Usuario sin `CREATE_CONSENTS` intenta editar  
**Esperado:** Error 403 "Permisos insuficientes"

## Logs a Verificar

### Backend (PM2)
```bash
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "pm2 logs datagree-backend --lines 50"
```

Buscar:
- `PATCH /api/consents/:id` - Petición de actualización
- `Consentimiento actualizado` - Confirmación de actualización
- Errores de validación si aplica

### Frontend (Consola del Navegador)
- Petición PATCH exitosa
- Respuesta con consentimiento actualizado
- Navegación correcta entre pasos

## Métricas de Éxito

✅ **100%** de consentimientos DRAFT pueden ser editados  
✅ **0** errores al guardar modificaciones  
✅ **100%** de consentimientos editados se pueden firmar  
✅ **100%** de PDFs se generan correctamente después de editar  
✅ **100%** de emails se envían correctamente después de editar

## Notas Importantes

1. **Solo DRAFT:** La edición solo funciona para consentimientos en estado DRAFT
2. **Respuestas:** Al cambiar de servicio, las respuestas anteriores se eliminan
3. **Foto:** La foto del cliente se mantiene a menos que se capture una nueva
4. **Permisos:** Se requiere el mismo permiso que para crear (`CREATE_CONSENTS`)
5. **Firma:** Después de editar, el flujo de firma es idéntico a la creación

## Contacto

Si encuentras algún problema durante las pruebas, documenta:
- Pasos para reproducir
- Mensaje de error (si aplica)
- Logs del backend
- Logs del navegador
- Usuario y permisos utilizados
