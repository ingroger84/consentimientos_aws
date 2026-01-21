# Checklist de Pruebas - Facturación Manual

## Pre-requisitos
- [ ] Backend corriendo en puerto 3000
- [ ] Frontend corriendo en puerto 5173
- [ ] Base de datos PostgreSQL activa
- [ ] Usuario Super Admin creado
- [ ] Al menos 2 tenants activos en el sistema
- [ ] Al menos 1 configuración de impuesto activa

---

## 1. Navegación y Acceso

### 1.1 Acceso al Dashboard de Facturación
- [ ] Iniciar sesión como Super Admin
- [ ] Navegar a `/billing`
- [ ] Verificar que se muestra el Dashboard de Facturación
- [ ] Verificar que aparece el botón verde "Crear Factura Manual"

### 1.2 Acceso a Crear Factura Manual
- [ ] Hacer clic en "Crear Factura Manual"
- [ ] Verificar navegación a `/billing/create-invoice`
- [ ] Verificar que se muestra la página de selección de tenant
- [ ] Verificar que aparece el botón "Atrás" (flecha)

### 1.3 Navegación de Regreso
- [ ] Hacer clic en el botón "Atrás"
- [ ] Verificar que regresa a `/billing`

---

## 2. Selección de Tenant

### 2.1 Lista de Tenants
- [ ] Verificar que se muestran todos los tenants activos
- [ ] Verificar que cada tarjeta muestra:
  - [ ] Nombre del tenant
  - [ ] Slug
  - [ ] Plan
- [ ] Verificar que las tarjetas son clickeables
- [ ] Verificar efecto hover en las tarjetas

### 2.2 Búsqueda de Tenants
- [ ] Escribir en el campo de búsqueda
- [ ] Verificar que filtra por nombre
- [ ] Verificar que filtra por slug
- [ ] Verificar que la búsqueda es case-insensitive
- [ ] Borrar búsqueda y verificar que muestra todos nuevamente

### 2.3 Sin Resultados
- [ ] Buscar un tenant que no existe
- [ ] Verificar mensaje "No se encontraron tenants activos"

---

## 3. Modal de Creación de Factura

### 3.1 Apertura del Modal
- [ ] Seleccionar un tenant
- [ ] Verificar que se abre el modal
- [ ] Verificar que muestra el nombre del tenant en el header
- [ ] Verificar que el modal tiene scroll si es necesario

### 3.2 Cerrar Modal
- [ ] Hacer clic en el botón X
- [ ] Verificar que el modal se cierra
- [ ] Hacer clic fuera del modal
- [ ] Verificar que el modal NO se cierra (comportamiento esperado)

---

## 4. Configuración de Impuestos

### 4.1 Estado Inicial
- [ ] Verificar que "Factura Exenta" está desmarcado por defecto
- [ ] Verificar que el dropdown de impuestos está visible
- [ ] Verificar que el impuesto por defecto está preseleccionado
- [ ] Verificar que el campo "Razón de Exención" NO está visible

### 4.2 Marcar como Exenta
- [ ] Marcar checkbox "Factura Exenta de Impuestos"
- [ ] Verificar que aparece el campo "Razón de Exención"
- [ ] Verificar que el dropdown de impuestos desaparece
- [ ] Verificar que el campo tiene placeholder apropiado
- [ ] Verificar que el campo está marcado como obligatorio (*)

### 4.3 Desmarcar Exenta
- [ ] Desmarcar checkbox "Factura Exenta de Impuestos"
- [ ] Verificar que desaparece el campo "Razón de Exención"
- [ ] Verificar que reaparece el dropdown de impuestos
- [ ] Verificar que se preselecciona el impuesto por defecto

### 4.4 Selección de Impuesto
- [ ] Verificar que el dropdown muestra todos los impuestos activos
- [ ] Verificar formato: "Nombre - X% (Tipo)"
- [ ] Verificar que muestra "(Por defecto)" en el impuesto por defecto
- [ ] Seleccionar diferentes impuestos
- [ ] Verificar que el cálculo se actualiza en tiempo real

---

## 5. Configuración de Fechas

### 5.1 Valores por Defecto
- [ ] Verificar que "Fecha de Vencimiento" tiene valor por defecto (+30 días)
- [ ] Verificar que "Período Inicio" tiene valor por defecto (hoy)
- [ ] Verificar que "Período Fin" tiene valor por defecto (+1 mes)

### 5.2 Edición de Fechas
- [ ] Cambiar "Fecha de Vencimiento"
- [ ] Cambiar "Período Inicio"
- [ ] Cambiar "Período Fin"
- [ ] Verificar que los cambios se guardan

---

## 6. Items de Factura

### 6.1 Item Inicial
- [ ] Verificar que hay 1 item por defecto
- [ ] Verificar campos:
  - [ ] Descripción (vacío)
  - [ ] Cantidad (1)
  - [ ] Precio (0)
  - [ ] Total ($0)
- [ ] Verificar que el botón de eliminar NO está visible (mínimo 1 item)

### 6.2 Agregar Items
- [ ] Hacer clic en "Agregar Item"
- [ ] Verificar que se agrega un nuevo item
- [ ] Verificar que ahora aparecen botones de eliminar
- [ ] Agregar varios items más
- [ ] Verificar que todos se muestran correctamente

### 6.3 Eliminar Items
- [ ] Hacer clic en el icono de basura de un item
- [ ] Verificar que el item se elimina
- [ ] Eliminar items hasta dejar solo 1
- [ ] Verificar que el botón de eliminar desaparece

### 6.4 Edición de Items
- [ ] Ingresar descripción
- [ ] Cambiar cantidad
- [ ] Verificar que el total del item se actualiza
- [ ] Cambiar precio unitario
- [ ] Verificar que el total del item se actualiza
- [ ] Verificar que el subtotal general se actualiza

---

## 7. Cálculos Automáticos

### 7.1 Cálculo de Subtotal
- [ ] Agregar varios items con diferentes valores
- [ ] Verificar que el subtotal es la suma correcta
- [ ] Cambiar valores de items
- [ ] Verificar que el subtotal se actualiza en tiempo real

### 7.2 Cálculo de Impuesto (No Exenta)
- [ ] Configurar factura NO exenta
- [ ] Seleccionar impuesto "IVA 19% (Adicional)"
- [ ] Agregar item de $100,000
- [ ] Verificar que el impuesto es $19,000
- [ ] Verificar que el total es $119,000

### 7.3 Cálculo de Impuesto Incluido
- [ ] Seleccionar impuesto "IVA 19% (Incluido)"
- [ ] Agregar item de $119,000
- [ ] Verificar que el impuesto calculado es correcto
- [ ] Verificar que el total es $119,000

### 7.4 Factura Exenta
- [ ] Marcar como exenta
- [ ] Agregar item de $100,000
- [ ] Verificar que el impuesto muestra "EXENTA"
- [ ] Verificar que el total es $100,000 (sin impuesto)

---

## 8. Campo de Notas

### 8.1 Funcionalidad Básica
- [ ] Verificar que el campo está visible
- [ ] Verificar que es opcional
- [ ] Ingresar texto en el campo
- [ ] Verificar que acepta múltiples líneas
- [ ] Verificar que el texto se guarda

---

## 9. Resumen de Totales

### 9.1 Visualización
- [ ] Verificar que se muestra el resumen en un recuadro gris
- [ ] Verificar que muestra:
  - [ ] Subtotal con formato de moneda
  - [ ] Impuesto (nombre y valor) o "EXENTA"
  - [ ] Total en azul y negrita

### 9.2 Actualización en Tiempo Real
- [ ] Cambiar valores de items
- [ ] Verificar que el resumen se actualiza inmediatamente
- [ ] Cambiar impuesto seleccionado
- [ ] Verificar que el resumen se actualiza
- [ ] Marcar/desmarcar exenta
- [ ] Verificar que el resumen se actualiza

---

## 10. Validaciones

### 10.1 Validación de Exención
- [ ] Marcar como exenta
- [ ] Dejar campo "Razón de Exención" vacío
- [ ] Intentar crear factura
- [ ] Verificar mensaje de error: "Debe proporcionar una razón para la exención de impuestos"
- [ ] Verificar que el modal NO se cierra

### 10.2 Validación de Impuesto
- [ ] Desmarcar exenta
- [ ] Seleccionar "Seleccione un impuesto" (opción vacía)
- [ ] Intentar crear factura
- [ ] Verificar mensaje de error: "Debe seleccionar un impuesto"
- [ ] Verificar que el modal NO se cierra

### 10.3 Validación de Items
- [ ] Dejar descripción de un item vacía
- [ ] Intentar crear factura
- [ ] Verificar mensaje de error: "Todos los items deben tener descripción"
- [ ] Verificar que el modal NO se cierra

### 10.4 Validación de Fechas
- [ ] Borrar una fecha
- [ ] Intentar crear factura
- [ ] Verificar que el navegador muestra validación HTML5
- [ ] Verificar que no se puede enviar sin fechas

---

## 11. Creación Exitosa

### 11.1 Factura con Impuestos
- [ ] Llenar todos los campos correctamente
- [ ] Configurar como NO exenta
- [ ] Seleccionar un impuesto
- [ ] Agregar al menos 1 item con descripción
- [ ] Hacer clic en "Crear Factura"
- [ ] Verificar mensaje de éxito
- [ ] Verificar que el modal se cierra después de 1 segundo
- [ ] Verificar que regresa a `/billing`
- [ ] Verificar que la factura aparece en la lista

### 11.2 Factura Exenta
- [ ] Llenar todos los campos correctamente
- [ ] Marcar como exenta
- [ ] Ingresar razón de exención
- [ ] Agregar al menos 1 item con descripción
- [ ] Hacer clic en "Crear Factura"
- [ ] Verificar mensaje de éxito
- [ ] Verificar que el modal se cierra
- [ ] Verificar que regresa a `/billing`
- [ ] Verificar que la factura aparece en la lista con badge "EXENTA"

---

## 12. Verificación en Base de Datos

### 12.1 Factura con Impuestos
- [ ] Abrir herramienta de base de datos
- [ ] Buscar la factura creada en tabla `invoices`
- [ ] Verificar campos:
  - [ ] `taxExempt = false`
  - [ ] `taxExemptReason = null`
  - [ ] `taxConfigId` tiene valor
  - [ ] `tax` tiene valor correcto
  - [ ] `total` es correcto
  - [ ] `items` es un JSON array válido

### 12.2 Factura Exenta
- [ ] Buscar la factura exenta en tabla `invoices`
- [ ] Verificar campos:
  - [ ] `taxExempt = true`
  - [ ] `taxExemptReason` tiene texto
  - [ ] `taxConfigId = null`
  - [ ] `tax = 0`
  - [ ] `total` = `amount`

---

## 13. Historial de Facturación

### 13.1 Registro de Actividad
- [ ] Ir a `/billing`
- [ ] Verificar sección "Historial de Actividad"
- [ ] Verificar que aparece entrada "Factura XXX creada"
- [ ] Verificar que muestra el monto correcto
- [ ] Verificar que muestra el tenant correcto

---

## 14. Email de Factura

### 14.1 Envío Automático
- [ ] Verificar logs del backend
- [ ] Buscar mensaje "Sending invoice email"
- [ ] Verificar que no hay errores de envío
- [ ] Revisar bandeja de entrada del tenant
- [ ] Verificar que llegó el email
- [ ] Verificar contenido del email

---

## 15. Visualización de Factura

### 15.1 En Lista de Facturas
- [ ] Ir a `/invoices`
- [ ] Buscar la factura creada
- [ ] Verificar que muestra:
  - [ ] Número de factura
  - [ ] Tenant
  - [ ] Estado
  - [ ] Total
  - [ ] Badge "EXENTA" si aplica

### 15.2 PDF de Factura
- [ ] Hacer clic en "Vista Previa"
- [ ] Verificar que se abre el PDF
- [ ] Verificar que muestra todos los items
- [ ] Verificar que muestra el impuesto o "EXENTA"
- [ ] Verificar que los totales son correctos
- [ ] Cerrar vista previa

### 15.3 Descargar PDF
- [ ] Hacer clic en "Descargar"
- [ ] Verificar que se descarga el archivo
- [ ] Abrir el PDF descargado
- [ ] Verificar contenido completo

---

## 16. Casos Edge

### 16.1 Múltiples Items
- [ ] Crear factura con 10+ items
- [ ] Verificar que todos se guardan correctamente
- [ ] Verificar que el PDF muestra todos los items

### 16.2 Valores Grandes
- [ ] Crear factura con valores de millones
- [ ] Verificar que los cálculos son correctos
- [ ] Verificar formato de moneda en el resumen

### 16.3 Valores Decimales
- [ ] Ingresar precio con decimales (ej: 10000.50)
- [ ] Verificar que se acepta
- [ ] Verificar que los cálculos son correctos

### 16.4 Valores Negativos (Descuentos)
- [ ] Agregar item con precio negativo
- [ ] Verificar que se acepta
- [ ] Verificar que el subtotal se reduce
- [ ] Verificar que el total es correcto

---

## 17. Rendimiento

### 17.1 Carga de Tenants
- [ ] Medir tiempo de carga de la página de selección
- [ ] Verificar que carga en menos de 2 segundos

### 17.2 Carga de Impuestos
- [ ] Medir tiempo de apertura del modal
- [ ] Verificar que carga en menos de 1 segundo

### 17.3 Creación de Factura
- [ ] Medir tiempo de creación
- [ ] Verificar que responde en menos de 3 segundos

---

## 18. Responsive Design

### 18.1 Desktop (1920x1080)
- [ ] Verificar que todo se ve correctamente
- [ ] Verificar que el modal no es demasiado ancho

### 18.2 Laptop (1366x768)
- [ ] Verificar que todo se ve correctamente
- [ ] Verificar que el modal tiene scroll si es necesario

### 18.3 Tablet (768x1024)
- [ ] Verificar que las tarjetas de tenants se adaptan
- [ ] Verificar que el modal es usable

---

## 19. Seguridad

### 19.1 Permisos
- [ ] Cerrar sesión
- [ ] Iniciar sesión como Tenant Admin
- [ ] Intentar acceder a `/billing/create-invoice`
- [ ] Verificar que NO tiene acceso
- [ ] Verificar redirección o mensaje de error

### 19.2 Validación Backend
- [ ] Usar Postman o similar
- [ ] Intentar crear factura sin token
- [ ] Verificar error 401
- [ ] Intentar crear factura con token de Tenant Admin
- [ ] Verificar error 403

---

## 20. Limpieza

### 20.1 Después de las Pruebas
- [ ] Eliminar facturas de prueba si es necesario
- [ ] Verificar que no quedaron datos inconsistentes
- [ ] Verificar logs del backend para errores

---

## Resumen de Resultados

### Pruebas Pasadas: _____ / _____
### Pruebas Falladas: _____
### Bugs Encontrados: _____

### Bugs Críticos:
1. 
2. 
3. 

### Bugs Menores:
1. 
2. 
3. 

### Mejoras Sugeridas:
1. 
2. 
3. 

---

## Firma de Aprobación

**Probado por:** _____________________
**Fecha:** _____________________
**Estado:** [ ] Aprobado [ ] Requiere correcciones
