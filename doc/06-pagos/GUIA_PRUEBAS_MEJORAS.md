# Guía de Pruebas - Mejoras en Gestión de Facturas

## 🎯 Objetivo
Verificar que las nuevas funcionalidades de gestión de facturas funcionan correctamente.

---

## 📋 Pre-requisitos

1. Backend corriendo en `http://localhost:3000`
2. Frontend corriendo en `http://localhost:5173`
3. Base de datos con al menos:
   - 1 tenant activo con facturas
   - 1 factura pendiente
   - 1 factura pagada

---

## 🧪 Casos de Prueba

### Prueba 1: Notificaciones Toast

#### Objetivo
Verificar que las notificaciones visuales funcionan correctamente.

#### Pasos
1. Acceder a `http://tenant1.localhost:5173/invoices`
2. Hacer clic en "Reenviar Email" en cualquier factura
3. **Resultado Esperado**: 
   - Aparece notificación verde en esquina superior derecha
   - Mensaje: "✅ Email enviado exitosamente"
   - Desaparece automáticamente después de 5 segundos
   - Animación suave de entrada

#### Verificación
- [ ] Notificación aparece correctamente
- [ ] Color verde para éxito
- [ ] Icono de check visible
- [ ] Animación fluida
- [ ] Auto-cierre funciona

---

### Prueba 2: Vista Previa de PDF

#### Objetivo
Verificar que la vista previa integrada funciona sin abrir nuevas pestañas.

#### Pasos
1. Acceder a `http://tenant1.localhost:5173/invoices`
2. Hacer clic en "Vista Previa" (botón morado) en cualquier factura
3. **Resultado Esperado**:
   - Se abre un modal de pantalla completa
   - El PDF se muestra en un iframe
   - Botón X visible en esquina superior derecha
   - No se abre nueva pestaña del navegador

4. Hacer clic en el botón X
5. **Resultado Esperado**:
   - Modal se cierra
   - Vuelve a la lista de facturas

#### Verificación
- [ ] Modal se abre correctamente
- [ ] PDF visible en iframe
- [ ] No se abren popups
- [ ] Botón X funciona
- [ ] Modal se cierra correctamente
- [ ] No hay fugas de memoria (verificar en DevTools)

---

### Prueba 3: Descarga de PDF

#### Objetivo
Verificar que la descarga de PDF funciona correctamente.

#### Pasos
1. Acceder a `http://tenant1.localhost:5173/invoices`
2. Hacer clic en "Descargar PDF" (botón verde)
3. **Resultado Esperado**:
   - Se descarga un archivo PDF
   - Nombre: `factura-{invoiceNumber}.pdf`
   - Archivo se abre correctamente

#### Verificación
- [ ] Descarga inicia automáticamente
- [ ] Nombre de archivo correcto
- [ ] PDF se abre sin errores
- [ ] Contenido completo y legible

---

### Prueba 4: Reenvío de Email con Notificación

#### Objetivo
Verificar el flujo completo de reenvío de email.

#### Pasos
1. Acceder a `http://tenant1.localhost:5173/invoices`
2. Hacer clic en "Reenviar Email" (botón azul)
3. **Resultado Esperado**:
   - Notificación: "✅ Email enviado exitosamente"
   - Email llega al correo del tenant

4. Verificar bandeja de entrada del tenant
5. **Resultado Esperado**:
   - Email recibido con factura adjunta
   - Formato correcto
   - Sin caracteres mal codificados

#### Verificación
- [ ] Notificación de éxito aparece
- [ ] Email llega correctamente
- [ ] Factura adjunta en PDF
- [ ] Formato HTML correcto
- [ ] Caracteres UTF-8 correctos

---

### Prueba 5: Registro de Pago Manual

#### Objetivo
Verificar que se pueden registrar pagos offline correctamente.

#### Pasos
1. Acceder a `http://tenant1.localhost:5173/invoices`
2. Buscar una factura con estado "Pendiente"
3. Hacer clic en "Pago Manual" (botón naranja)
4. **Resultado Esperado**:
   - Se abre modal de registro de pago
   - Monto prellenado con total de factura
   - Campos: método, referencia, notas

5. Completar formulario:
   - Monto: (prellenado)
   - Método: Transferencia Bancaria
   - Referencia: "TEST-123456"
   - Notas: "Pago de prueba"

6. Hacer clic en "Registrar Pago"
7. **Resultado Esperado**:
   - Notificación: "✅ Pago registrado exitosamente"
   - Modal se cierra
   - Factura cambia a estado "Pagada"
   - Aparece en color verde

#### Verificación
- [ ] Modal se abre correctamente
- [ ] Monto prellenado correcto
- [ ] Todos los campos funcionan
- [ ] Validación de campos
- [ ] Notificación de éxito
- [ ] Estado de factura actualizado
- [ ] Color cambia a verde
- [ ] Botón "Pago Manual" desaparece

---

### Prueba 6: Botón Pago Manual Solo en Pendientes

#### Objetivo
Verificar que el botón de pago manual solo aparece en facturas pendientes.

#### Pasos
1. Acceder a `http://tenant1.localhost:5173/invoices`
2. Buscar una factura "Pendiente"
3. **Resultado Esperado**: Botón "Pago Manual" visible

4. Buscar una factura "Pagada"
5. **Resultado Esperado**: Botón "Pago Manual" NO visible

#### Verificación
- [ ] Botón visible en facturas pendientes
- [ ] Botón NO visible en facturas pagadas
- [ ] Botón NO visible en facturas canceladas
- [ ] Botón NO visible en facturas vencidas pagadas

---

### Prueba 7: Manejo de Errores

#### Objetivo
Verificar que los errores se manejan correctamente.

#### Pasos
1. Detener el backend
2. Acceder a `http://tenant1.localhost:5173/invoices`
3. Intentar reenviar email
4. **Resultado Esperado**:
   - Notificación roja: "❌ Error al enviar el email"
   - Icono de X visible

5. Intentar vista previa
6. **Resultado Esperado**:
   - Notificación roja: "❌ Error al cargar la vista previa"

7. Reiniciar backend y repetir
8. **Resultado Esperado**:
   - Todo funciona correctamente

#### Verificación
- [ ] Errores se muestran en notificaciones rojas
- [ ] Mensajes de error claros
- [ ] No se rompe la aplicación
- [ ] Recuperación automática al reiniciar backend

---

### Prueba 8: Responsive Design

#### Objetivo
Verificar que todo funciona en diferentes tamaños de pantalla.

#### Pasos
1. Abrir DevTools (F12)
2. Activar modo responsive
3. Probar en:
   - Móvil (375px)
   - Tablet (768px)
   - Desktop (1920px)

4. Verificar:
   - Modal de vista previa
   - Modal de pago manual
   - Notificaciones toast
   - Botones de acción

#### Verificación
- [ ] Modal responsive en móvil
- [ ] Botones accesibles en móvil
- [ ] Toast visible en todas las pantallas
- [ ] Formularios usables en móvil
- [ ] PDF visible en iframe móvil

---

### Prueba 9: Múltiples Acciones Simultáneas

#### Objetivo
Verificar que se pueden realizar múltiples acciones sin conflictos.

#### Pasos
1. Abrir vista previa de una factura
2. Sin cerrar, hacer clic en otra factura
3. **Resultado Esperado**: Modal se actualiza con nueva factura

4. Cerrar modal
5. Reenviar email de una factura
6. Inmediatamente abrir pago manual de otra
7. **Resultado Esperado**: Ambas acciones funcionan correctamente

#### Verificación
- [ ] No hay conflictos entre modales
- [ ] Notificaciones se apilan correctamente
- [ ] Estados se manejan independientemente
- [ ] No hay errores en consola

---

### Prueba 10: Integración Completa

#### Objetivo
Verificar el flujo completo de gestión de factura.

#### Pasos
1. Crear una factura pendiente (como Super Admin)
2. Como tenant, ver la factura en `/invoices`
3. Abrir vista previa
4. Descargar PDF
5. Reenviar email
6. Registrar pago manual
7. Verificar que la factura está pagada
8. Verificar que el pago aparece en `/payments`

#### Verificación
- [ ] Factura creada correctamente
- [ ] Vista previa funciona
- [ ] Descarga funciona
- [ ] Email enviado
- [ ] Pago registrado
- [ ] Estado actualizado
- [ ] Pago visible en historial

---

## 📊 Resumen de Verificación

### Funcionalidades Principales
- [ ] Notificaciones toast (éxito y error)
- [ ] Vista previa de PDF integrada
- [ ] Descarga de PDF
- [ ] Reenvío de email con confirmación
- [ ] Registro de pago manual
- [ ] Actualización de estados

### Aspectos Técnicos
- [ ] Sin errores en consola
- [ ] Sin fugas de memoria
- [ ] Responsive design
- [ ] Manejo de errores
- [ ] Performance aceptable

### Experiencia de Usuario
- [ ] Interfaz intuitiva
- [ ] Feedback visual claro
- [ ] Animaciones suaves
- [ ] Mensajes comprensibles
- [ ] Flujo lógico

---

## 🐛 Reporte de Problemas

Si encuentras algún problema, documenta:

1. **Descripción**: ¿Qué pasó?
2. **Pasos para reproducir**: ¿Cómo llegaste ahí?
3. **Resultado esperado**: ¿Qué debería pasar?
4. **Resultado actual**: ¿Qué pasó realmente?
5. **Navegador**: Chrome, Firefox, etc.
6. **Consola**: Errores en DevTools
7. **Screenshots**: Si es posible

---

## ✅ Criterios de Aceptación

Para considerar las mejoras como exitosas:

1. ✅ Todas las notificaciones funcionan
2. ✅ Vista previa se abre sin popups
3. ✅ Descarga funciona correctamente
4. ✅ Emails se envían y llegan
5. ✅ Pagos manuales se registran
6. ✅ Estados se actualizan correctamente
7. ✅ Sin errores en consola
8. ✅ Responsive en todos los dispositivos
9. ✅ Manejo de errores robusto
10. ✅ Experiencia de usuario fluida

---

## 📞 Soporte

Si necesitas ayuda:
- Revisar `doc/06-pagos/MEJORAS_GESTION_FACTURAS.md`
- Verificar logs del backend
- Consultar consola del navegador
- Revisar variables de entorno

---

**Fecha**: 2025-01-07  
**Versión**: 1.2.0  
**Estado**: Listo para pruebas
