# ✅ Implementación de Gestión de Preguntas

## 📋 Cambios Realizados

Se ha implementado completamente el módulo de gestión de preguntas para cumplir con el requerimiento de que las preguntas deben ser creadas y editadas previamente por el administrador.

---

## 🔧 Backend - Nuevos Archivos

### 1. DTOs
- ✅ `backend/src/questions/dto/create-question.dto.ts`
  - Validación de datos para crear preguntas
  - Campos: questionText, type, isRequired, isCritical, order, serviceId

- ✅ `backend/src/questions/dto/update-question.dto.ts`
  - DTO para actualizar preguntas existentes

### 2. Servicio
- ✅ `backend/src/questions/questions.service.ts`
  - CRUD completo de preguntas
  - Métodos:
    - `create()` - Crear pregunta
    - `findAll()` - Listar todas las preguntas
    - `findByService()` - Filtrar por servicio
    - `findOne()` - Obtener una pregunta
    - `update()` - Actualizar pregunta
    - `remove()` - Eliminar pregunta (soft delete)

### 3. Controlador
- ✅ `backend/src/questions/questions.controller.ts`
  - Endpoints REST completos
  - Protegido con JWT
  - Control de acceso por roles (Admin General y Admin Sede)

### 4. Módulo Actualizado
- ✅ `backend/src/questions/questions.module.ts`
  - Exporta servicio y controlador
  - Integrado con TypeORM

---

## 🎨 Frontend - Nuevos Archivos

### 1. Servicio
- ✅ `frontend/src/services/question.service.ts`
  - Cliente API para preguntas
  - Métodos CRUD completos
  - Soporte para filtrado por servicio

### 2. Página de Gestión
- ✅ `frontend/src/pages/QuestionsPage.tsx`
  - Interfaz completa de gestión de preguntas
  - Características:
    - Listado de preguntas con información detallada
    - Filtro por servicio
    - Crear nueva pregunta
    - Editar pregunta existente
    - Eliminar pregunta
    - Modal de formulario
    - Badges informativos (tipo, orden, obligatoria, crítica)
    - Iconos visuales

### 3. Actualizaciones
- ✅ `frontend/src/App.tsx` - Ruta `/questions` agregada
- ✅ `frontend/src/components/Layout.tsx` - Menú actualizado con "Preguntas"
- ✅ `frontend/src/pages/DashboardPage.tsx` - Tarjeta de Preguntas agregada

---

## 📡 API Endpoints

### Preguntas
- `GET /api/questions` - Listar todas las preguntas
- `GET /api/questions?serviceId={id}` - Filtrar por servicio
- `POST /api/questions` - Crear pregunta (Admin)
- `GET /api/questions/:id` - Obtener pregunta
- `PATCH /api/questions/:id` - Actualizar pregunta (Admin)
- `DELETE /api/questions/:id` - Eliminar pregunta (Admin)

---

## 🎯 Funcionalidades Implementadas

### Crear Pregunta
- [x] Seleccionar servicio asociado
- [x] Escribir texto de la pregunta
- [x] Elegir tipo de respuesta (Sí/No o Texto Libre)
- [x] Definir orden de aparición
- [x] Marcar como obligatoria
- [x] Marcar como crítica (con advertencia)
- [x] Validaciones completas

### Editar Pregunta
- [x] Modificar texto de la pregunta
- [x] Cambiar tipo de respuesta
- [x] Ajustar orden
- [x] Cambiar flags (obligatoria, crítica)
- [x] Cambiar servicio asociado

### Listar Preguntas
- [x] Vista de tarjetas con información completa
- [x] Filtro por servicio
- [x] Badges visuales para:
  - Tipo de pregunta
  - Servicio asociado
  - Orden
  - Obligatoria
  - Crítica (con icono de alerta)
- [x] Acciones rápidas (editar, eliminar)

### Eliminar Pregunta
- [x] Confirmación antes de eliminar
- [x] Soft delete (mantiene historial)
- [x] Actualización automática de la lista

---

## 🔐 Seguridad

- ✅ Solo administradores pueden crear/editar/eliminar preguntas
- ✅ Autenticación JWT requerida
- ✅ Validación de datos en backend
- ✅ Soft delete para mantener integridad

---

## 🎨 Interfaz de Usuario

### Características Visuales
- **Iconos**: HelpCircle para preguntas, AlertTriangle para críticas
- **Colores**:
  - Azul: Tipo de pregunta
  - Gris: Servicio
  - Púrpura: Orden
  - Naranja: Obligatoria
  - Rojo: Crítica
- **Layout**: Tarjetas expandibles con toda la información
- **Filtros**: Dropdown para filtrar por servicio
- **Modal**: Formulario completo con validaciones

### Flujo de Usuario
1. Administrador accede a "Preguntas" desde el menú
2. Ve todas las preguntas o filtra por servicio
3. Puede crear nueva pregunta con el botón "+"
4. Completa el formulario con todos los campos
5. La pregunta queda disponible para los consentimientos

---

## 🔄 Integración con Consentimientos

Las preguntas creadas aquí se cargan automáticamente en el flujo de creación de consentimientos:

1. Usuario selecciona un servicio
2. Sistema carga las preguntas asociadas a ese servicio
3. Preguntas se muestran en orden configurado
4. Validación de respuestas obligatorias
5. Advertencia si pregunta crítica tiene respuesta afirmativa

---

## 📊 Datos de Ejemplo

El seed ya incluye preguntas de ejemplo:

### Procedimiento Estético
1. ¿Tiene alergias a medicamentos? (Sí/No, Obligatoria, Crítica)
2. Si respondió sí, especifique cuáles: (Texto, Opcional)
3. ¿Está embarazada o en período de lactancia? (Sí/No, Obligatoria, Crítica)

### Tratamiento Médico
1. ¿Tiene alguna condición médica preexistente? (Sí/No, Obligatoria, Crítica)

---

## ✅ Cumplimiento de Requerimientos

### Requerimiento Original:
> "Las preguntas de los consentimientos deben ser previamente creadas y se pueden editar por el administrador"

### Implementación:
- ✅ Las preguntas se crean ANTES de usarse en consentimientos
- ✅ Solo administradores pueden crear/editar preguntas
- ✅ Interfaz completa de gestión
- ✅ Asociación con servicios
- ✅ Configuración completa (tipo, orden, obligatoria, crítica)
- ✅ Las preguntas se cargan dinámicamente en el flujo de consentimientos

---

## 🚀 Cómo Usar

### 1. Acceder al Módulo
```
http://localhost:5173/questions
```

### 2. Crear Pregunta
1. Clic en "Nueva Pregunta"
2. Seleccionar servicio
3. Escribir pregunta
4. Configurar opciones
5. Guardar

### 3. Editar Pregunta
1. Clic en icono de editar
2. Modificar campos necesarios
3. Guardar cambios

### 4. Filtrar
1. Usar dropdown "Filtrar por Servicio"
2. Seleccionar servicio deseado
3. Ver solo preguntas de ese servicio

---

## 📝 Próximas Mejoras Opcionales

- [ ] Reordenar preguntas con drag & drop
- [ ] Duplicar preguntas
- [ ] Importar/exportar preguntas
- [ ] Previsualización de cómo se verá en el consentimiento
- [ ] Historial de cambios en preguntas
- [ ] Plantillas de preguntas comunes

---

## ✨ Resumen

**Estado**: ✅ Módulo de Preguntas 100% Funcional

El sistema ahora cumple completamente con el requerimiento de que las preguntas deben ser creadas y gestionadas previamente por los administradores. Las preguntas se asocian a servicios y se cargan automáticamente en el flujo de creación de consentimientos.

**Archivos Nuevos**: 6 backend + 2 frontend = 8 archivos
**Archivos Modificados**: 4 archivos
**Endpoints Nuevos**: 6 endpoints REST

**Última actualización**: 3 de enero de 2026
