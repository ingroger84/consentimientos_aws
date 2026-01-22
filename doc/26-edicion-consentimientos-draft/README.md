# Edición de Consentimientos en Estado DRAFT

**Versión:** 1.1.27  
**Fecha:** 22 de enero de 2026

## Descripción

Implementación de funcionalidad para permitir a los operadores editar consentimientos que quedaron en estado DRAFT, completarlos y enviarlos correctamente.

## Problema Resuelto

Anteriormente, si un consentimiento quedaba en estado DRAFT (sin firmar), no había forma de editarlo para completarlo. Los operadores tenían que crear un nuevo consentimiento desde cero, perdiendo la información ya capturada.

## Solución Implementada

### Backend

#### 1. Endpoint PATCH /consents/:id

**Archivo:** `backend/src/consents/consents.controller.ts`

```typescript
@Patch(':id')
@UseGuards(PermissionsGuard)
@RequirePermissions(PERMISSIONS.CREATE_CONSENTS)
update(@Param('id') id: string, @Body() updateConsentDto: CreateConsentDto) {
  return this.consentsService.update(id, updateConsentDto);
}
```

#### 2. Método update() en ConsentsService

**Archivo:** `backend/src/consents/consents.service.ts`

Características:
- Busca el consentimiento existente con todas sus relaciones
- Valida que el consentimiento exista
- **Solo permite editar consentimientos en estado DRAFT**
- Actualiza datos del cliente (nombre, ID, email, teléfono, foto)
- Actualiza servicio y sede
- Elimina respuestas anteriores
- Guarda nuevas respuestas
- Retorna el consentimiento actualizado

```typescript
async update(id: string, updateConsentDto: CreateConsentDto): Promise<Consent> {
  const consent = await this.consentsRepository.findOne({
    where: { id },
    relations: ['service', 'branch', 'tenant', 'answers'],
  });

  if (!consent) {
    throw new NotFoundException('Consentimiento no encontrado');
  }

  if (consent.status !== ConsentStatus.DRAFT) {
    throw new BadRequestException('Solo se pueden editar consentimientos en estado DRAFT');
  }

  // Actualizar datos...
  // Eliminar respuestas anteriores...
  // Guardar nuevas respuestas...
  
  return this.findOne(consent.id);
}
```

### Frontend

#### 1. Botón "Editar" en ConsentsPage

**Archivo:** `frontend/src/pages/ConsentsPage.tsx`

- Botón visible solo para consentimientos en estado DRAFT
- Icono de lápiz (Edit) para identificación visual
- Navega a `/consents/edit/:id`

```typescript
{consent.status === 'DRAFT' && (
  <Link
    to={`/consents/edit/${consent.id}`}
    className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
    title="Editar Consentimiento"
  >
    <Edit className="w-5 h-5" />
  </Link>
)}
```

#### 2. Modo Edición en CreateConsentPage

**Archivo:** `frontend/src/pages/CreateConsentPage.tsx`

Características:
- Detecta modo edición mediante parámetro `id` en URL
- Carga consentimiento existente usando `consentService.getById()`
- Pre-llena formulario con datos existentes
- Carga foto del cliente si existe
- Título cambia a "Editar Consentimiento"
- Al enviar, usa PATCH en lugar de POST

```typescript
const { id: consentIdParam } = useParams<{ id: string }>();
const isEditMode = !!consentIdParam;

// Cargar consentimiento existente
const { data: existingConsent, isLoading: loadingConsent } = useQuery({
  queryKey: ['consent', consentIdParam],
  queryFn: () => consentService.getById(consentIdParam!),
  enabled: isEditMode,
});

// Mutation que detecta modo edición
const createMutation = useMutation({
  mutationFn: (data: any) => {
    if (isEditMode && consentId) {
      return api.patch(`/consents/${consentId}`, data).then(res => res.data);
    } else {
      return consentService.create(data);
    }
  },
  // ...
});
```

#### 3. Ruta de Edición

**Archivo:** `frontend/src/App.tsx`

```typescript
<Route path="/consents/edit/:id" element={<CreateConsentPage />} />
```

#### 4. Método getById() en ConsentService

**Archivo:** `frontend/src/services/consent.service.ts`

```typescript
async getById(id: string): Promise<Consent> {
  const { data } = await api.get<Consent>(`/consents/${id}`);
  return data;
}
```

## Flujo de Uso

### 1. Crear Consentimiento Incompleto

1. Usuario crea un nuevo consentimiento
2. Completa datos del cliente y preguntas
3. **NO firma el consentimiento** (cierra o cancela)
4. Consentimiento queda en estado DRAFT

### 2. Editar Consentimiento DRAFT

1. Usuario ve lista de consentimientos
2. Identifica consentimiento en estado DRAFT
3. Hace clic en botón "Editar" (icono de lápiz)
4. Sistema carga página de edición con datos pre-llenados
5. Usuario puede modificar:
   - Datos del cliente
   - Servicio
   - Sede
   - Respuestas a preguntas
   - Foto del cliente
6. Usuario continúa al paso de firma
7. Cliente firma el consentimiento
8. Sistema genera PDFs y envía email
9. Consentimiento cambia a estado SIGNED/SENT

## Validaciones

### Backend

1. **Consentimiento existe:** Lanza `NotFoundException` si no se encuentra
2. **Estado DRAFT:** Lanza `BadRequestException` si el estado no es DRAFT
3. **Permisos:** Requiere permiso `CREATE_CONSENTS`

### Frontend

1. **Botón visible solo para DRAFT:** Condicional en renderizado
2. **Carga de datos:** Muestra loading mientras carga consentimiento
3. **Validación de formulario:** Mismas validaciones que creación

## Permisos Requeridos

- `CREATE_CONSENTS`: Necesario para editar consentimientos
- `SIGN_CONSENTS`: Necesario para firmar después de editar

## Estados de Consentimiento

- **DRAFT:** Puede ser editado ✅
- **SIGNED:** NO puede ser editado ❌
- **SENT:** NO puede ser editado ❌
- **FAILED:** NO puede ser editado ❌

## Archivos Modificados

### Backend
- `backend/src/consents/consents.controller.ts` - Endpoint PATCH agregado
- `backend/src/consents/consents.service.ts` - Método update() agregado

### Frontend
- `frontend/src/pages/ConsentsPage.tsx` - Botón editar agregado
- `frontend/src/pages/CreateConsentPage.tsx` - Modo edición implementado
- `frontend/src/App.tsx` - Ruta de edición agregada
- `frontend/src/services/consent.service.ts` - Método getById() agregado
- `frontend/src/types/index.ts` - Campo clientPhoto agregado al tipo Consent

## Pruebas Realizadas

✅ Compilación exitosa de backend  
✅ Compilación exitosa de frontend  
✅ Despliegue a servidor AWS  
✅ Reinicio de backend con PM2  
✅ Actualización de versión a 1.1.27

## Próximos Pasos para Pruebas

1. Crear un consentimiento sin firmar (que quede en DRAFT)
2. Verificar que aparece botón "Editar" en la lista
3. Hacer clic en "Editar"
4. Verificar que los datos se cargan correctamente
5. Modificar algunos datos
6. Continuar al paso de firma
7. Firmar el consentimiento
8. Verificar que se genera PDF y se envía email
9. Verificar que el estado cambia a SENT

## Notas Técnicas

- La edición reutiliza el mismo componente `CreateConsentPage` en modo edición
- El modo se detecta mediante la presencia del parámetro `id` en la URL
- Los datos se cargan usando React Query para manejo de cache
- La foto del cliente se mantiene si ya fue capturada
- Las respuestas anteriores se eliminan completamente antes de guardar las nuevas
- El endpoint usa el mismo DTO que la creación (`CreateConsentDto`)

## Beneficios

1. **Eficiencia:** No es necesario recrear consentimientos desde cero
2. **Datos preservados:** Se mantiene la información ya capturada
3. **Experiencia de usuario:** Flujo natural de edición
4. **Seguridad:** Solo permite editar consentimientos en DRAFT
5. **Permisos:** Respeta el sistema de permisos existente
