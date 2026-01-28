# 🧪 Guía de Pruebas - Búsqueda y Creación de Clientes en Historias Clínicas

**Versión:** 15.0.4  
**Fecha:** 24 de enero de 2026

## 📋 Checklist de Pruebas

### ✅ Pruebas Funcionales

- [ ] **P1:** Buscar cliente existente
- [ ] **P2:** Crear cliente nuevo
- [ ] **P3:** Evitar duplicados
- [ ] **P4:** Cliente compartido entre módulos
- [ ] **P5:** Validaciones de formulario
- [ ] **P6:** Búsqueda con debounce
- [ ] **P7:** Cambiar entre modos
- [ ] **P8:** Limpiar selección

### ✅ Pruebas de Integración

- [ ] **I1:** Backend crea cliente automáticamente
- [ ] **I2:** Backend usa cliente existente
- [ ] **I3:** Historia clínica se asocia correctamente
- [ ] **I4:** Auditoría se registra
- [ ] **I5:** Permisos se validan

### ✅ Pruebas de UI/UX

- [ ] **U1:** Componente se renderiza correctamente
- [ ] **U2:** Estados visuales son claros
- [ ] **U3:** Mensajes de error son útiles
- [ ] **U4:** Loading states funcionan
- [ ] **U5:** Responsive design

---

## 🧪 Casos de Prueba Detallados

### P1: Buscar Cliente Existente

**Objetivo:** Verificar que la búsqueda de clientes funciona correctamente

**Precondiciones:**
- Usuario autenticado
- Al menos 3 clientes existentes en el sistema

**Pasos:**
1. Navegar a "Historias Clínicas"
2. Hacer clic en "Nueva Historia Clínica"
3. En el campo de búsqueda, escribir el nombre de un cliente existente
4. Esperar a que aparezcan los resultados (500ms)
5. Verificar que los resultados muestran:
   - Nombre completo
   - Tipo y número de documento
   - Email (si existe)
   - Contador de consentimientos
6. Hacer clic en un resultado
7. Verificar que se muestra el resumen del cliente seleccionado

**Resultado Esperado:**
- ✅ Búsqueda muestra resultados relevantes
- ✅ Resultados están ordenados correctamente
- ✅ Cliente seleccionado muestra toda la información
- ✅ Badge "Cliente Frecuente" aparece si tiene consentimientos

**Criterios de Aceptación:**
- Búsqueda responde en menos de 1 segundo
- Máximo 50 resultados
- Información completa y correcta

---

### P2: Crear Cliente Nuevo

**Objetivo:** Verificar que se puede crear un cliente nuevo desde la página de HC

**Precondiciones:**
- Usuario autenticado con permiso `create_clients`

**Pasos:**
1. Navegar a "Nueva Historia Clínica"
2. Hacer clic en "Crear Nuevo Cliente"
3. Llenar el formulario:
   - Nombre: "Paciente Prueba"
   - Tipo Doc: "CC"
   - Documento: "1234567890"
   - Email: "prueba@test.com"
   - Teléfono: "+57 300 123 4567"
4. Completar formulario de HC:
   - Sede: Seleccionar una
   - Fecha: Hoy
   - Tipo: "Consulta"
5. Hacer clic en "Crear Historia Clínica"
6. Esperar confirmación
7. Verificar que se creó la HC
8. Ir a "Clientes"
9. Buscar "Paciente Prueba"
10. Verificar que el cliente existe

**Resultado Esperado:**
- ✅ Cliente se crea automáticamente
- ✅ HC se asocia al nuevo cliente
- ✅ Cliente aparece en listado de clientes
- ✅ Mensaje de éxito se muestra

**Criterios de Aceptación:**
- Cliente se crea con todos los datos
- HC tiene relación correcta con cliente
- No hay errores en consola

---

### P3: Evitar Duplicados

**Objetivo:** Verificar que el sistema evita crear clientes duplicados

**Precondiciones:**
- Cliente existente: CC 123456789

**Pasos:**
1. Navegar a "Nueva Historia Clínica"
2. Hacer clic en "Crear Nuevo Cliente"
3. Llenar formulario con documento existente:
   - Nombre: "Otro Nombre"
   - Tipo Doc: "CC"
   - Documento: "123456789" (existente)
   - Email: "otro@test.com"
4. Completar formulario de HC
5. Hacer clic en "Crear Historia Clínica"
6. Verificar que NO se crea duplicado
7. Verificar que se usa el cliente existente
8. Ir a "Clientes"
9. Buscar por documento "123456789"
10. Verificar que solo hay UN cliente

**Resultado Esperado:**
- ✅ Sistema detecta documento duplicado
- ✅ Usa cliente existente
- ✅ HC se asocia al cliente existente
- ✅ No se crea duplicado

**Criterios de Aceptación:**
- Solo un cliente con ese documento
- HC asociada correctamente
- Datos del cliente original se mantienen

---

### P4: Cliente Compartido entre Módulos

**Objetivo:** Verificar que los clientes se comparten entre consentimientos e HC

**Precondiciones:**
- Sistema limpio

**Pasos:**
1. Ir a "Nuevo Consentimiento"
2. Crear cliente nuevo:
   - Nombre: "Cliente Compartido"
   - Documento: CC 999888777
   - Email: "compartido@test.com"
3. Completar y crear consentimiento
4. Ir a "Nueva Historia Clínica"
5. Buscar "Cliente Compartido"
6. Verificar que aparece en resultados
7. Verificar que muestra "1 consentimiento"
8. Seleccionar cliente
9. Crear HC
10. Ir a "Clientes"
11. Buscar "Cliente Compartido"
12. Verificar que tiene:
    - 1 consentimiento
    - 1 historia clínica

**Resultado Esperado:**
- ✅ Cliente creado en consentimientos aparece en HC
- ✅ Contador de consentimientos es correcto
- ✅ Cliente tiene ambos registros asociados

**Criterios de Aceptación:**
- Un solo cliente en el sistema
- Relaciones correctas con ambos módulos
- Contadores actualizados

---

### P5: Validaciones de Formulario

**Objetivo:** Verificar que las validaciones funcionan correctamente

**Pasos:**

#### 5.1: Campos Requeridos
1. Ir a "Nueva Historia Clínica"
2. Hacer clic en "Crear Nuevo Cliente"
3. Dejar campos vacíos
4. Intentar crear HC
5. Verificar mensajes de error

**Resultado Esperado:**
- ✅ Muestra error en nombre (requerido)
- ✅ Muestra error en documento (requerido)
- ✅ Muestra error en email (requerido)

#### 5.2: Formato de Email
1. Llenar formulario con email inválido: "test"
2. Intentar crear HC
3. Verificar error de formato

**Resultado Esperado:**
- ✅ Muestra error "Email inválido"

#### 5.3: Tipo de Documento
1. Verificar que dropdown tiene todas las opciones:
   - CC, TI, CE, PA, RC, NIT
2. Seleccionar cada una
3. Verificar que se guarda correctamente

**Resultado Esperado:**
- ✅ Todos los tipos disponibles
- ✅ Se guardan correctamente

---

### P6: Búsqueda con Debounce

**Objetivo:** Verificar que el debounce funciona correctamente

**Pasos:**
1. Abrir DevTools → Network
2. Ir a "Nueva Historia Clínica"
3. Escribir rápidamente: "J-u-a-n" (4 caracteres en 1 segundo)
4. Observar peticiones en Network
5. Verificar que solo se hace UNA petición
6. Verificar que se hace después de 500ms del último carácter

**Resultado Esperado:**
- ✅ Solo una petición al backend
- ✅ Petición se hace después de 500ms
- ✅ No hay peticiones intermedias

**Criterios de Aceptación:**
- Máximo 1 petición por búsqueda
- Delay de 500ms funciona
- Performance óptima

---

### P7: Cambiar entre Modos

**Objetivo:** Verificar que se puede cambiar entre búsqueda y creación

**Pasos:**
1. Ir a "Nueva Historia Clínica"
2. Estado inicial: Búsqueda
3. Hacer clic en "Crear Nuevo Cliente"
4. Verificar que cambia a modo creación
5. Llenar algunos campos
6. Hacer clic en "Volver a búsqueda"
7. Verificar que vuelve a modo búsqueda
8. Verificar que los campos se limpiaron

**Resultado Esperado:**
- ✅ Cambia entre modos correctamente
- ✅ Campos se limpian al cambiar
- ✅ No hay errores de estado

**Criterios de Aceptación:**
- Transiciones suaves
- Estado se resetea correctamente
- UI es clara

---

### P8: Limpiar Selección

**Objetivo:** Verificar que se puede cambiar de cliente seleccionado

**Pasos:**
1. Ir a "Nueva Historia Clínica"
2. Buscar y seleccionar un cliente
3. Verificar que muestra resumen
4. Hacer clic en el botón "X" (limpiar)
5. Verificar que vuelve a búsqueda
6. Buscar y seleccionar otro cliente
7. Verificar que se actualiza correctamente

**Resultado Esperado:**
- ✅ Botón X limpia selección
- ✅ Vuelve a estado de búsqueda
- ✅ Puede seleccionar otro cliente

**Criterios de Aceptación:**
- Limpieza completa de estado
- Sin errores en consola
- UX intuitiva

---

### I1: Backend Crea Cliente Automáticamente

**Objetivo:** Verificar que el backend crea clientes correctamente

**Pasos:**
1. Abrir DevTools → Network
2. Ir a "Nueva Historia Clínica"
3. Crear nuevo cliente con datos únicos
4. Crear HC
5. Observar petición POST a `/api/medical-records`
6. Verificar payload:
   ```json
   {
     "clientData": {
       "fullName": "...",
       "documentType": "CC",
       "documentNumber": "...",
       "email": "...",
       "phone": "..."
     },
     "branchId": "...",
     "admissionDate": "...",
     "admissionType": "..."
   }
   ```
7. Verificar respuesta exitosa
8. Verificar en base de datos que se creó el cliente

**Resultado Esperado:**
- ✅ Petición incluye clientData
- ✅ Backend crea cliente
- ✅ Backend crea HC
- ✅ Relación correcta

**Criterios de Aceptación:**
- Cliente en tabla `clients`
- HC en tabla `medical_records`
- `clientId` correcto en HC

---

### I2: Backend Usa Cliente Existente

**Objetivo:** Verificar que el backend detecta y usa clientes existentes

**Pasos:**
1. Crear cliente: CC 111222333
2. Intentar crear HC con clientData del mismo documento
3. Observar logs del backend
4. Verificar que NO se crea duplicado
5. Verificar que HC usa cliente existente

**Resultado Esperado:**
- ✅ Backend busca por documento
- ✅ Encuentra cliente existente
- ✅ Usa ese cliente
- ✅ No crea duplicado

**Criterios de Aceptación:**
- Solo un cliente en BD
- HC asociada correctamente
- Logs muestran "Cliente existente encontrado"

---

### I3: Historia Clínica se Asocia Correctamente

**Objetivo:** Verificar relaciones en base de datos

**Pasos:**
1. Crear HC con cliente nuevo
2. Consultar base de datos:
   ```sql
   SELECT * FROM medical_records WHERE id = 'xxx';
   SELECT * FROM clients WHERE id = 'yyy';
   ```
3. Verificar que `medical_records.clientId` = `clients.id`
4. Verificar que `medical_records.tenantId` = `clients.tenantId`

**Resultado Esperado:**
- ✅ Relación correcta
- ✅ Mismo tenant
- ✅ Foreign key válida

---

### I4: Auditoría se Registra

**Objetivo:** Verificar que se registra auditoría

**Pasos:**
1. Crear HC con cliente nuevo
2. Consultar tabla de auditoría:
   ```sql
   SELECT * FROM medical_record_audit 
   WHERE action = 'create' 
   ORDER BY createdAt DESC 
   LIMIT 1;
   ```
3. Verificar campos:
   - action = 'create'
   - entityType = 'medical_record'
   - userId correcto
   - tenantId correcto
   - newValues contiene datos

**Resultado Esperado:**
- ✅ Registro de auditoría existe
- ✅ Datos completos
- ✅ Timestamp correcto

---

### I5: Permisos se Validan

**Objetivo:** Verificar que los permisos se validan correctamente

**Pasos:**
1. Crear usuario sin permiso `create_medical_records`
2. Intentar crear HC
3. Verificar que se rechaza
4. Agregar permiso
5. Intentar nuevamente
6. Verificar que funciona

**Resultado Esperado:**
- ✅ Sin permiso: Error 403
- ✅ Con permiso: Éxito

---

### U1: Componente se Renderiza Correctamente

**Objetivo:** Verificar renderizado del componente

**Pasos:**
1. Ir a "Nueva Historia Clínica"
2. Verificar que se muestra:
   - Campo de búsqueda
   - Botón "Crear Nuevo Cliente"
   - Placeholder correcto
   - Texto de ayuda
3. Verificar estilos CSS
4. Verificar iconos

**Resultado Esperado:**
- ✅ Todo se renderiza
- ✅ Estilos correctos
- ✅ Iconos visibles

---

### U2: Estados Visuales son Claros

**Objetivo:** Verificar que los estados son claros para el usuario

**Pasos:**
1. Verificar estado inicial (búsqueda)
2. Verificar estado buscando (loading)
3. Verificar estado con resultados
4. Verificar estado sin resultados
5. Verificar estado cliente seleccionado
6. Verificar estado crear nuevo

**Resultado Esperado:**
- ✅ Cada estado es visualmente distinto
- ✅ Usuario sabe qué está pasando
- ✅ Feedback visual claro

---

### U3: Mensajes de Error son Útiles

**Objetivo:** Verificar que los errores son claros

**Pasos:**
1. Provocar diferentes errores:
   - Campo vacío
   - Email inválido
   - Error de red
   - Error del servidor
2. Verificar mensajes

**Resultado Esperado:**
- ✅ Mensajes claros y específicos
- ✅ Indican cómo resolver
- ✅ No son técnicos

---

### U4: Loading States Funcionan

**Objetivo:** Verificar estados de carga

**Pasos:**
1. Simular red lenta (DevTools → Network → Slow 3G)
2. Buscar cliente
3. Verificar spinner/loading
4. Crear HC
5. Verificar botón deshabilitado
6. Verificar texto "Creando..."

**Resultado Esperado:**
- ✅ Loading visible
- ✅ Botones deshabilitados
- ✅ Usuario sabe que está procesando

---

### U5: Responsive Design

**Objetivo:** Verificar que funciona en móvil

**Pasos:**
1. Abrir DevTools → Toggle device toolbar
2. Probar en diferentes tamaños:
   - iPhone SE (375px)
   - iPad (768px)
   - Desktop (1920px)
3. Verificar que todo es usable

**Resultado Esperado:**
- ✅ Funciona en móvil
- ✅ Funciona en tablet
- ✅ Funciona en desktop

---

## 📊 Reporte de Pruebas

### Plantilla de Reporte

```markdown
## Reporte de Pruebas - [Fecha]

**Tester:** [Nombre]  
**Versión:** 15.0.4  
**Ambiente:** [localhost/producción]

### Resumen
- Total de pruebas: 18
- Exitosas: __
- Fallidas: __
- Bloqueadas: __

### Pruebas Fallidas
1. [ID] - [Descripción]
   - Error: [Descripción del error]
   - Pasos para reproducir: [...]
   - Severidad: [Alta/Media/Baja]

### Observaciones
- [Observación 1]
- [Observación 2]

### Recomendaciones
- [Recomendación 1]
- [Recomendación 2]
```

---

## 🐛 Bugs Conocidos

Ninguno reportado hasta el momento.

---

## 📝 Notas para Testers

1. **Limpiar datos entre pruebas:** Usar diferentes documentos para evitar conflictos
2. **Verificar consola:** Siempre revisar consola del navegador
3. **Verificar network:** Observar peticiones HTTP
4. **Verificar base de datos:** Confirmar datos en BD
5. **Documentar todo:** Screenshots de errores

---

**Estado:** ✅ Listo para Pruebas  
**Versión:** 15.0.4  
**Fecha:** 24 de enero de 2026
