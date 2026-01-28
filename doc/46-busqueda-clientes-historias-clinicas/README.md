# Búsqueda y Creación de Clientes en Historias Clínicas

**Fecha:** 24 de enero de 2026  
**Versión:** 15.0.4  
**Tipo:** Feature - Mejora de UX

## 📋 Objetivo

Implementar en la página de "Nueva Historia Clínica" la misma funcionalidad que existe en "Nuevo Consentimiento" para buscar o crear clientes, permitiendo una experiencia de usuario consistente y eficiente.

## 🎯 Problema Resuelto

**Antes:**
- En "Nueva Historia Clínica" solo se podía seleccionar de una lista desplegable de clientes existentes
- No había forma de crear un cliente nuevo desde la misma página
- No había búsqueda inteligente de clientes
- Experiencia inconsistente con "Nuevo Consentimiento"

**Después:**
- Búsqueda inteligente de clientes existentes (por nombre, documento, email, teléfono)
- Creación de clientes nuevos sin salir de la página
- Reutilización del componente `ClientSearchForm` para consistencia
- Los clientes creados se comparten entre consentimientos e historias clínicas

## ✅ Funcionalidades Implementadas

### 1. Búsqueda de Clientes Existentes
- Búsqueda en tiempo real con debounce (500ms)
- Búsqueda por múltiples criterios:
  - Nombre completo
  - Número de documento
  - Email
  - Teléfono
- Resultados limitados a 50 para performance
- Muestra contador de consentimientos previos

### 2. Creación de Clientes Nuevos
- Formulario inline para crear cliente
- Campos requeridos:
  - Nombre completo
  - Tipo de documento
  - Número de documento
  - Email
- Campos opcionales:
  - Teléfono
- Validación de duplicados por documento
- Cliente se crea automáticamente al guardar la historia clínica

### 3. Integración Backend
- El endpoint de crear historia clínica ahora acepta:
  - `clientId`: ID de cliente existente
  - `clientData`: Datos para crear nuevo cliente
- Si se envía `clientData`, el backend:
  1. Busca si ya existe un cliente con ese documento
  2. Si existe, usa ese cliente
  3. Si no existe, crea el cliente automáticamente
- Validación de que se proporcione clientId o clientData

## 📁 Archivos Modificados

### Frontend

#### 1. `frontend/src/pages/CreateMedicalRecordPage.tsx`
**Cambios:**
- Importado `ClientSearchForm` component
- Importado tipos de `Client` y `ClientDocumentType`
- Agregado estado para `selectedClient` y `clientData`
- Agregados handlers `handleClientSelected` y `handleClientDataChange`
- Reemplazado select de clientes por `ClientSearchForm`
- Actualizada lógica de `onSubmit` para enviar clientId o clientData

**Antes:**
```typescript
// Select simple de clientes
<select {...register('clientId')}>
  {clients.map(client => (
    <option value={client.id}>{client.name}</option>
  ))}
</select>
```

**Después:**
```typescript
// Componente de búsqueda/creación
<ClientSearchForm
  onClientSelected={handleClientSelected}
  onClientDataChange={handleClientDataChange}
/>
```

### Backend

#### 2. `backend/src/medical-records/dto/create-medical-record.dto.ts`
**Cambios:**
- Agregada clase `CreateClientDataDto` con validaciones
- Modificado `CreateMedicalRecordDto`:
  - `clientId` ahora es opcional
  - Agregado campo `clientData` opcional
  - Validación con `ValidateNested` y `Type`

**Nuevo DTO:**
```typescript
export class CreateClientDataDto {
  @IsString()
  fullName: string;

  @IsEnum(['CC', 'TI', 'CE', 'PA', 'RC', 'NIT'])
  documentType: string;

  @IsString()
  documentNumber: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;
}
```

#### 3. `backend/src/medical-records/medical-records.service.ts`
**Cambios:**
- Importado `ClientsService`
- Inyectado `ClientsService` en constructor
- Actualizado método `create`:
  - Verifica si se proporciona `clientData`
  - Busca cliente existente por documento
  - Si existe, usa ese cliente
  - Si no existe, crea nuevo cliente
  - Valida que se proporcione clientId o clientData

**Lógica de creación:**
```typescript
if (!clientId && createDto.clientData) {
  const existingClient = await this.clientsService.findByDocument(
    documentType,
    documentNumber,
    tenantId,
  );

  if (existingClient) {
    clientId = existingClient.id;
  } else {
    const newClient = await this.clientsService.create(
      clientData,
      tenantId,
    );
    clientId = newClient.id;
  }
}
```

#### 4. `backend/src/medical-records/medical-records.module.ts`
**Cambios:**
- Importado `ClientsModule`
- Agregado `ClientsModule` a imports

#### 5. `backend/src/medical-records/dto/update-medical-record.dto.ts`
**Nuevo archivo:**
- Creado para separar DTOs
- Extiende `CreateMedicalRecordDto` con `PartialType`
- Agregados campos específicos de actualización

#### 6. `backend/src/medical-records/dto/index.ts`
**Cambios:**
- Eliminada definición duplicada de DTOs
- Agregadas exportaciones desde archivos separados
- Mejor organización del código

## 🔄 Flujo de Datos

### Escenario 1: Cliente Existente

```
Usuario busca "Juan Pérez"
    ↓
ClientSearchForm busca en backend
    ↓
Muestra resultados
    ↓
Usuario selecciona cliente
    ↓
Se guarda selectedClient
    ↓
Al crear HC, se envía clientId
    ↓
Backend usa cliente existente
```

### Escenario 2: Cliente Nuevo

```
Usuario hace clic en "Crear Nuevo Cliente"
    ↓
ClientSearchForm muestra formulario
    ↓
Usuario llena datos
    ↓
Se guarda clientData
    ↓
Al crear HC, se envía clientData
    ↓
Backend busca por documento
    ↓
Si no existe, crea cliente
    ↓
Usa nuevo cliente para HC
```

### Escenario 3: Cliente Duplicado

```
Usuario intenta crear cliente
    ↓
Llena documento existente
    ↓
Al crear HC, se envía clientData
    ↓
Backend busca por documento
    ↓
Encuentra cliente existente
    ↓
Usa cliente existente (no crea duplicado)
```

## 🎨 Componente Reutilizado

### `ClientSearchForm`

**Props:**
- `onClientSelected`: Callback cuando se selecciona un cliente
- `onClientDataChange`: Callback cuando cambian los datos del formulario
- `initialData`: Datos iniciales (opcional)

**Estados:**
- `search`: Modo búsqueda
- `create`: Modo creación

**Características:**
- Búsqueda con debounce
- Validación de campos
- Indicador de clientes frecuentes
- Contador de consentimientos previos
- Botón para cambiar entre modos

## 🧪 Casos de Prueba

### 1. Buscar Cliente Existente
1. Ir a "Nueva Historia Clínica"
2. Escribir nombre de cliente existente
3. Verificar que aparezcan resultados
4. Seleccionar cliente
5. Completar formulario
6. Crear historia clínica
7. Verificar que se asoció al cliente correcto

### 2. Crear Cliente Nuevo
1. Ir a "Nueva Historia Clínica"
2. Hacer clic en "Crear Nuevo Cliente"
3. Llenar formulario de cliente
4. Completar formulario de HC
5. Crear historia clínica
6. Verificar que se creó el cliente
7. Verificar que se creó la HC asociada

### 3. Cliente Duplicado
1. Ir a "Nueva Historia Clínica"
2. Hacer clic en "Crear Nuevo Cliente"
3. Usar documento de cliente existente
4. Completar formulario
5. Crear historia clínica
6. Verificar que NO se creó duplicado
7. Verificar que se usó cliente existente

### 4. Cliente Compartido
1. Crear cliente desde "Nuevo Consentimiento"
2. Ir a "Nueva Historia Clínica"
3. Buscar el cliente recién creado
4. Verificar que aparece en resultados
5. Seleccionar y crear HC
6. Verificar que el cliente tiene consentimiento e HC

## 📊 Beneficios

### 1. Experiencia de Usuario
- ✅ Consistencia entre módulos
- ✅ Menos clics para crear HC
- ✅ Búsqueda más rápida y eficiente
- ✅ No necesita salir de la página

### 2. Eficiencia Operativa
- ✅ Reduce tiempo de creación de HC
- ✅ Evita duplicados automáticamente
- ✅ Reutiliza clientes existentes
- ✅ Menos errores de captura

### 3. Integridad de Datos
- ✅ Validación de duplicados
- ✅ Datos consistentes entre módulos
- ✅ Auditoría completa
- ✅ Relaciones correctas

### 4. Mantenibilidad
- ✅ Componente reutilizable
- ✅ Código DRY (Don't Repeat Yourself)
- ✅ Fácil de actualizar
- ✅ Pruebas centralizadas

## 🔒 Seguridad

### Validaciones Backend
- ✅ Validación de tipos con class-validator
- ✅ Validación de tenant
- ✅ Validación de permisos
- ✅ Sanitización de datos

### Validaciones Frontend
- ✅ Validación de campos requeridos
- ✅ Validación de formato de email
- ✅ Validación de documento
- ✅ Feedback visual de errores

## 📝 Notas Técnicas

### Debounce
- Tiempo: 500ms
- Evita búsquedas excesivas
- Mejora performance del servidor

### Límite de Resultados
- Máximo: 50 clientes
- Ordenados por último consentimiento
- Luego por nombre alfabético

### Validación de Duplicados
- Se valida por: documentType + documentNumber + tenantId
- Garantiza unicidad por tenant
- Previene errores de usuario

### Transacciones
- La creación de cliente y HC no es transaccional
- Si falla la HC, el cliente queda creado
- Esto es intencional para evitar pérdida de datos

## 🚀 Próximos Pasos

### Mejoras Futuras
1. Agregar foto del cliente en búsqueda
2. Mostrar historial de HC en resultados
3. Filtros avanzados de búsqueda
4. Exportar lista de clientes
5. Importar clientes desde Excel

### Optimizaciones
1. Cache de búsquedas frecuentes
2. Índices adicionales en BD
3. Paginación de resultados
4. Búsqueda por similitud (fuzzy search)

## 📞 Soporte

Si encuentras problemas:
1. Verifica que el backend esté corriendo
2. Revisa la consola del navegador (F12)
3. Verifica los logs del backend
4. Contacta al equipo de desarrollo

---

**Estado:** ✅ Completado y Verificado  
**Versión:** 15.0.4  
**Fecha:** 24 de enero de 2026
