# Integración de Clientes con Consentimientos

## Estado Actual

✅ **Completado:**
1. Módulo completo de clientes (backend y frontend)
2. Componente `ClientSearchForm` creado
3. Backend actualizado para manejar clientes en consentimientos
4. DTO actualizado con campos de cliente
5. Imports agregados en CreateConsentPage

⏳ **Pendiente:**
1. Reemplazar formulario manual con `ClientSearchForm`
2. Actualizar lógica de envío de datos
3. Probar flujo completo

## Cambios Necesarios en CreateConsentPage.tsx

### 1. Agregar Handlers

Agregar después de la línea donde se define `selectedClient`:

```typescript
// Handlers para ClientSearchForm
const handleClientSelected = (client: Client | null) => {
  setSelectedClient(client);
};

const handleClientDataChange = (data: {
  clientName: string;
  clientId: string;
  clientEmail: string;
  clientPhone: string;
  documentType: ClientDocumentType;
}) => {
  setFormData({
    ...formData,
    clientName: data.clientName,
    clientId: data.clientId,
    clientEmail: data.clientEmail,
    clientPhone: data.clientPhone,
  });
  setClientDocumentType(data.documentType);
};
```

### 2. Reemplazar Formulario de Datos del Cliente

Buscar la sección que comienza con:
```typescript
<div className="grid grid-cols-2 gap-4">
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Nombre Completo *
    </label>
```

Y reemplazar TODO el bloque de inputs (Nombre, Identificación, Email, Teléfono) con:

```typescript
{/* Búsqueda/Creación de Cliente */}
<ClientSearchForm
  onClientSelected={handleClientSelected}
  onClientDataChange={handleClientDataChange}
  initialData={{
    clientName: formData.clientName,
    clientId: formData.clientId,
    clientEmail: formData.clientEmail,
    clientPhone: formData.clientPhone,
  }}
/>
```

### 3. Actualizar Envío de Datos

Buscar donde se construye `completeData` (hay 2 lugares) y agregar los campos de cliente:

```typescript
const completeData = {
  clientName: formData.clientName,
  clientId: formData.clientId,
  clientEmail: formData.clientEmail,
  clientPhone: formData.clientPhone,
  clientPhoto: clientPhoto || undefined,
  serviceId: formData.serviceId,
  branchId: formData.branchId,
  // Nuevos campos para gestión de clientes
  documentType: clientDocumentType,
  existingClientId: selectedClient?.id,
  answers: formData.answers || [],
};
```

## Flujo de Usuario

### Cliente Nuevo
1. Usuario ingresa a crear consentimiento
2. Ve formulario de búsqueda de cliente
3. Busca por documento/nombre/email
4. No encuentra resultados
5. Click en "Crear Nuevo Cliente"
6. Completa formulario con datos del cliente
7. Continúa con foto y firma
8. Al guardar, se crea el cliente automáticamente

### Cliente Existente
1. Usuario ingresa a crear consentimiento
2. Ve formulario de búsqueda de cliente
3. Busca por documento/nombre/email
4. Encuentra cliente en resultados
5. Selecciona cliente
6. Datos se autocompletar
7. Continúa con foto y firma
8. Al guardar, se vincula con cliente existente

## Lógica del Backend

### En `consents.service.ts` método `create()`:

```typescript
// 1. Si viene existingClientId, usar ese cliente
if (createConsentDto.existingClientId) {
  clientId = createConsentDto.existingClientId;
  await this.clientsService.incrementConsentsCount(clientId);
}
// 2. Si no, buscar por documento
else {
  const existingClient = await this.clientsService.findByDocument(
    documentType,
    createConsentDto.clientId,
    tenantId
  );
  
  if (existingClient) {
    // Cliente existe, vincularlo
    clientId = existingClient.id;
  } else {
    // Cliente no existe, crearlo
    const newClient = await this.clientsService.create({...}, tenantId);
    clientId = newClient.id;
  }
  
  await this.clientsService.incrementConsentsCount(clientId);
}

// 3. Crear consentimiento con clientId
const consent = this.consentsRepository.create({
  ...
  client: clientId ? { id: clientId } as any : null,
  ...
});
```

## Beneficios

1. **Evita Duplicados**: Busca antes de crear
2. **Autocompletado**: Datos se llenan automáticamente
3. **Historial**: Vincula consentimientos con clientes
4. **Estadísticas**: Cuenta consentimientos por cliente
5. **Multi-Sede**: Cliente disponible en todas las sedes del tenant

## Validaciones

### Frontend
- Búsqueda mínimo 3 caracteres
- Campos requeridos: Nombre, Documento, Email
- Validación de formato de email
- Debounce en búsqueda (500ms)

### Backend
- Documento único por tenant
- Validación de tipo de documento
- Creación automática si no existe
- Incremento de contador de consentimientos
- Manejo de errores graceful

## Testing

### Casos de Prueba

1. **Crear cliente nuevo desde consentimiento**
   - Buscar documento que no existe
   - Crear nuevo cliente
   - Verificar que se crea en BD
   - Verificar que se vincula con consentimiento

2. **Usar cliente existente**
   - Buscar documento existente
   - Seleccionar cliente
   - Verificar autocompletado
   - Verificar vinculación

3. **Búsqueda por diferentes criterios**
   - Por nombre
   - Por documento
   - Por email
   - Por teléfono

4. **Contador de consentimientos**
   - Crear consentimiento
   - Verificar incremento en cliente
   - Verificar fecha de último consentimiento

## Migración de Datos Existentes (Opcional)

Si hay consentimientos existentes sin vincular a clientes:

```sql
-- 1. Crear clientes desde consentimientos existentes
INSERT INTO clients (
  full_name, 
  document_type, 
  document_number, 
  email, 
  phone, 
  tenant_id,
  created_at,
  updated_at
)
SELECT DISTINCT 
  client_name,
  'CC' as document_type,
  client_id as document_number,
  client_email,
  client_phone,
  tenant_id,
  MIN(created_at) as created_at,
  NOW() as updated_at
FROM consents
WHERE tenant_id IS NOT NULL
  AND client_id IS NOT NULL
GROUP BY client_name, client_id, client_email, client_phone, tenant_id
ON CONFLICT (tenant_id, document_type, document_number) DO NOTHING;

-- 2. Vincular consentimientos con clientes
UPDATE consents c
SET client_id = (
  SELECT cl.id 
  FROM clients cl
  WHERE cl.document_number = c.client_id
    AND cl.tenant_id = c.tenant_id
  LIMIT 1
)
WHERE c.tenant_id IS NOT NULL
  AND c.client_id IS NULL;

-- 3. Actualizar estadísticas de clientes
UPDATE clients cl
SET 
  consents_count = (
    SELECT COUNT(*) 
    FROM consents c 
    WHERE c.client_id = cl.id
  ),
  last_consent_at = (
    SELECT MAX(created_at) 
    FROM consents c 
    WHERE c.client_id = cl.id
  );
```

## Próximos Pasos

1. ✅ Completar integración en CreateConsentPage
2. ⏳ Probar flujo completo
3. ⏳ Migrar datos existentes (opcional)
4. ⏳ Agregar tests
5. ⏳ Documentar para usuarios finales

---

**Nota**: Esta integración es retrocompatible. Si falla la creación del cliente, el consentimiento se crea de todas formas sin vinculación.
