# 📖 Instrucciones para el Usuario - Módulo de Historias Clínicas

**Versión**: 14.0.0  
**Fecha**: 2026-01-24  
**Estado**: ✅ Listo para usar

---

## 🎉 ¡Felicitaciones!

El módulo de historias clínicas ha sido implementado exitosamente y está funcionando en tu sistema. Esta guía te ayudará a comenzar a usarlo.

---

## 🚀 Acceso Rápido

### URLs Importantes
- **Aplicación**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Documentación API**: http://localhost:3000/api

### Servidores Activos
- ✅ Backend corriendo en puerto 3000
- ✅ Frontend corriendo en puerto 5173

---

## 📋 Cómo Usar el Módulo

### 1. Acceder al Módulo

1. Abre tu navegador en http://localhost:5173
2. Inicia sesión con tu usuario
3. En el menú lateral, busca **"Historias Clínicas"**
4. Click en "Historias Clínicas" para ver el listado

### 2. Crear una Historia Clínica

#### Paso a Paso:

1. **Click en "Nueva Historia Clínica"**
   - Botón azul en la parte superior derecha

2. **Seleccionar Cliente**
   - Busca el cliente por nombre o documento
   - Si no existe, créalo primero en el módulo de Clientes

3. **Completar Datos Básicos**
   - Tipo de admisión (Consulta, Urgencia, Hospitalización)
   - Fecha de admisión
   - Sede (opcional)

4. **Guardar**
   - Click en "Crear Historia Clínica"
   - Se generará automáticamente un número de historia

### 3. Ver y Editar Historia Clínica

#### Ver Listado:
- El listado muestra todas las historias clínicas
- Puedes buscar por nombre del paciente
- Filtrar por estado (Activa, Cerrada)
- Ordenar por fecha

#### Ver Detalle:
1. Click en cualquier tarjeta de historia clínica
2. Se abrirá la vista detallada con tabs:
   - **Información**: Datos básicos de la HC
   - **Anamnesis**: Motivo de consulta y antecedentes
   - **Exámenes**: Exámenes físicos y signos vitales
   - **Diagnósticos**: Diagnósticos médicos
   - **Evoluciones**: Notas de evolución
   - **Auditoría**: Historial de cambios

### 4. Agregar Anamnesis

1. Abre una historia clínica
2. Ve al tab "Anamnesis"
3. Click en "Agregar Anamnesis"
4. Completa los campos:
   - **Motivo de consulta**: ¿Por qué viene el paciente?
   - **Enfermedad actual**: Descripción detallada
   - **Antecedentes personales**: Enfermedades previas
   - **Antecedentes familiares**: Enfermedades en la familia
   - **Hábitos**: Tabaco, alcohol, ejercicio, etc.
   - **Revisión por sistemas**: Síntomas por sistema
5. Guardar

### 5. Cerrar Historia Clínica

⚠️ **Importante**: Una vez cerrada, la HC no se puede editar

1. Abre una historia clínica
2. Click en "Cerrar Historia Clínica"
3. Confirma la acción
4. La HC queda bloqueada para edición

---

## 🔐 Permisos por Rol

### Super Administrador
- ✅ Ver todas las historias clínicas
- ✅ Crear historias clínicas
- ✅ Editar historias clínicas
- ✅ Eliminar historias clínicas
- ✅ Cerrar historias clínicas
- ✅ Firmar historias clínicas
- ✅ Exportar historias clínicas

### Administrador General
- ✅ Ver todas las historias clínicas
- ✅ Crear historias clínicas
- ✅ Editar historias clínicas
- ❌ Eliminar historias clínicas
- ✅ Cerrar historias clínicas
- ✅ Firmar historias clínicas
- ✅ Exportar historias clínicas

### Administrador de Sede
- ✅ Ver historias clínicas de su sede
- ✅ Crear historias clínicas
- ✅ Editar historias clínicas
- ❌ Eliminar historias clínicas
- ✅ Cerrar historias clínicas
- ✅ Firmar historias clínicas
- ❌ Exportar historias clínicas

### Operador
- ✅ Ver historias clínicas de su sede
- ✅ Crear historias clínicas
- ❌ Editar historias clínicas
- ❌ Eliminar historias clínicas
- ❌ Cerrar historias clínicas
- ❌ Firmar historias clínicas
- ❌ Exportar historias clínicas

---

## 💡 Consejos y Mejores Prácticas

### Al Crear Historias Clínicas

1. **Verifica los datos del cliente**
   - Asegúrate de que el cliente tenga todos sus datos actualizados
   - Verifica tipo de sangre, EPS, contacto de emergencia

2. **Selecciona el tipo de admisión correcto**
   - Consulta: Atención ambulatoria
   - Urgencia: Atención de emergencia
   - Hospitalización: Paciente internado

3. **Asigna la sede correcta**
   - Importante para reportes y estadísticas

### Al Completar Anamnesis

1. **Sé detallado en el motivo de consulta**
   - Describe claramente por qué viene el paciente

2. **Registra todos los antecedentes**
   - Personales: Enfermedades previas, cirugías, alergias
   - Familiares: Enfermedades hereditarias
   - Hábitos: Tabaco, alcohol, drogas, ejercicio

3. **Revisa todos los sistemas**
   - Cardiovascular, respiratorio, digestivo, etc.
   - Anota síntomas relevantes

### Seguridad y Privacidad

1. **Cierra sesión al terminar**
   - Especialmente en computadoras compartidas

2. **No compartas credenciales**
   - Cada usuario debe tener su propia cuenta

3. **Cierra las HC cuando estén completas**
   - Evita modificaciones accidentales

4. **Verifica la auditoría**
   - Revisa quién ha accedido a cada HC

---

## 🔍 Búsqueda y Filtros

### Buscar Historias Clínicas

1. **Por nombre del paciente**
   - Escribe en el campo de búsqueda
   - La búsqueda es en tiempo real

2. **Por estado**
   - Activa: HC que se pueden editar
   - Cerrada: HC bloqueadas

3. **Por fecha**
   - Ordena por fecha de admisión
   - Más recientes primero

### Filtros Disponibles

- **Estado**: Activa / Cerrada
- **Fecha**: Rango de fechas
- **Sede**: Filtrar por sede (si aplica)

---

## 📊 Información Mostrada

### En el Listado

Cada tarjeta muestra:
- Nombre del paciente
- Número de historia clínica
- Fecha de admisión
- Tipo de admisión
- Estado (Activa/Cerrada)
- Sede

### En el Detalle

#### Tab Información
- Datos del paciente
- Número de HC
- Fecha de admisión
- Tipo de admisión
- Estado
- Sede
- Creado por
- Fecha de creación

#### Tab Anamnesis
- Motivo de consulta
- Enfermedad actual
- Antecedentes personales
- Antecedentes familiares
- Hábitos
- Antecedentes ginecológicos (si aplica)
- Revisión por sistemas

#### Tab Auditoría
- Todas las acciones realizadas
- Quién las realizó
- Cuándo se realizaron
- Qué cambios se hicieron

---

## ❓ Preguntas Frecuentes

### ¿Puedo editar una HC cerrada?
No, una vez cerrada, la HC queda bloqueada para edición. Solo se puede ver.

### ¿Puedo eliminar una HC?
Solo el Super Administrador puede eliminar historias clínicas.

### ¿Cómo sé quién ha visto una HC?
Ve al tab "Auditoría" para ver todos los accesos y cambios.

### ¿Puedo crear múltiples anamnesis?
Sí, puedes agregar múltiples anamnesis a una misma HC.

### ¿Qué pasa si cierro una HC por error?
Solo un Super Administrador puede reabrir una HC cerrada.

### ¿Puedo exportar una HC a PDF?
Esta funcionalidad estará disponible en la Fase 6.

### ¿Puedo agregar archivos adjuntos?
Esta funcionalidad estará disponible en la Fase 5.

---

## 🆘 Solución de Problemas

### No veo el menú "Historias Clínicas"
- Verifica que tu usuario tenga el permiso `view_medical_records`
- Contacta a tu administrador para que te asigne los permisos

### No puedo crear una HC
- Verifica que tengas el permiso `create_medical_records`
- Asegúrate de que el cliente exista en el sistema

### No puedo editar una HC
- Verifica que la HC no esté cerrada
- Verifica que tengas el permiso `edit_medical_records`

### La búsqueda no funciona
- Refresca la página (F5)
- Verifica tu conexión a internet

### Error al guardar
- Verifica que todos los campos requeridos estén completos
- Revisa que no haya caracteres especiales inválidos

---

## 📞 Soporte

Si tienes problemas o dudas:

1. **Consulta la documentación**
   - `doc/43-historias-clinicas/` tiene toda la información técnica

2. **Revisa los logs**
   - Backend: Consola donde corre `npm run start:dev`
   - Frontend: Consola del navegador (F12)

3. **Contacta al administrador**
   - Proporciona detalles del error
   - Indica qué estabas haciendo cuando ocurrió

---

## 🎯 Próximas Funcionalidades

### Fase 2 (Próximamente)
- Formularios completos de anamnesis
- Examen físico detallado por sistemas
- Calculadora de IMC automática

### Fase 3 (Próximamente)
- Búsqueda de códigos CIE-10
- Diagnósticos múltiples
- Clasificación de diagnósticos

### Fase 4 (Próximamente)
- Prescripción de medicamentos
- Órdenes de laboratorio
- Órdenes de imágenes

### Fase 5 (Próximamente)
- Subir archivos adjuntos
- Galería de imágenes
- Visor de documentos

### Fase 6 (Próximamente)
- Exportar HC a PDF
- Reportes estadísticos
- Firma digital

---

## ✅ Checklist de Inicio

Antes de comenzar a usar el módulo, verifica:

- [ ] Puedes acceder a http://localhost:5173
- [ ] Puedes iniciar sesión
- [ ] Ves el menú "Historias Clínicas"
- [ ] Puedes ver el listado de HC
- [ ] Tienes clientes creados en el sistema
- [ ] Conoces tus permisos
- [ ] Has leído esta guía

---

## 🎉 ¡Listo para Comenzar!

Ya tienes todo lo necesario para comenzar a usar el módulo de historias clínicas. 

**Recuerda**:
- Mantén la información actualizada
- Cierra las HC cuando estén completas
- Revisa la auditoría regularmente
- Respeta la privacidad de los pacientes

¡Disfruta usando el nuevo módulo! 🚀

---

**Desarrollado por**: Kiro AI Assistant  
**Fecha**: 2026-01-24  
**Versión**: 14.0.0
