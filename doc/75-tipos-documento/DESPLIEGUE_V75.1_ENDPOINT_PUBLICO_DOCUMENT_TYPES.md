# Despliegue V75.1 - Endpoint Público de Tipos de Documento

**Fecha:** 26 de marzo de 2026  
**Versión:** 75.1.0  
**Estado:** ✅ COMPLETADO

## Problema Identificado

El formulario de creación de cuenta en la landing page (SignupModal) no cargaba los tipos de documento en el select, mostrándose vacío.

### Causa Raíz
El endpoint `GET /document-types` no tenía el decorador `@Public()`, por lo que requería autenticación. Esto impedía que el formulario público pudiera cargar los tipos de documento disponibles.

## Solución Implementada

### 1. Backend - Hacer Público el Endpoint

**Archivo modificado:** `backend/src/document-types/document-types.controller.ts`

```typescript
@Public()
@Get()
async findAll(
  @Query('country') country?: string,
  @Query('isActive') isActive?: string,
) {
  const filters: any = {};

  if (country) {
    filters.country = country;
  }

  if (isActive !== undefined) {
    filters.isActive = isActive === 'true';
  }

  return await this.documentTypesService.findAll(filters);
}
```

**Cambio:** Se agregó el decorador `@Public()` al método `findAll()` para permitir acceso sin autenticación.

### 2. Frontend - Interceptor Actualizado

El interceptor de Axios ya incluía `/document-types` en la lista de endpoints públicos (modificado en despliegue anterior V75.0):

```typescript
const isPublicEndpoint = originalRequest.url?.includes('/plans/public') || 
                         originalRequest.url?.includes('/tenants/plans') ||
                         originalRequest.url?.includes('/document-types');
```

### 3. Componente SignupModal

El componente ya tenía implementada la carga de tipos de documento:

```typescript
useEffect(() => {
  loadDocumentTypes();
}, []);

const loadDocumentTypes = async () => {
  try {
    const data = await documentTypesService.getAll({ isActive: true });
    setDocumentTypes(data);
  } catch (error) {
    console.error('Error loading document types:', error);
  }
};
```

## Proceso de Despliegue

### Backend

1. **Compilación:**
   ```bash
   cd backend
   npm run build
   ```

2. **Despliegue a AWS:**
   ```bash
   scp -i AWS-ISSABEL.pem -r backend/dist/* ubuntu@100.28.198.249:/home/ubuntu/consentimientos_aws/backend/dist/
   ```

3. **Reinicio de PM2:**
   ```bash
   ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "pm2 restart datagree"
   ```

### Frontend

No requirió cambios. El frontend ya estaba preparado desde el despliegue V75.0.

## Verificación

### Endpoints Públicos Configurados

1. ✅ `GET /plans/public` - Listar planes públicos
2. ✅ `GET /plans/public/:id` - Obtener plan específico
3. ✅ `GET /document-types` - Listar tipos de documento (NUEVO)

### Pruebas Requeridas

1. **Acceder a la landing page:**
   - URL: https://archivoenlinea.com/pricing

2. **Seleccionar un plan:**
   - Hacer clic en "Seleccionar Plan" de cualquier plan

3. **Verificar el formulario:**
   - El modal de registro debe abrirse correctamente
   - El select "Tipo de Documento" debe cargar las opciones
   - Debe mostrar los tipos de documento creados desde el Super Admin

### Respuesta Esperada del Endpoint

```bash
curl https://archivoenlinea.com/api/document-types?isActive=true
```

Debe retornar HTTP 200 con un array de tipos de documento:

```json
[
  {
    "id": "uuid",
    "code": "CC",
    "name": "Cédula de Ciudadanía",
    "country": "CO",
    "isActive": true,
    "createdAt": "2026-03-26T...",
    "updatedAt": "2026-03-26T..."
  },
  ...
]
```

## Archivos Modificados

- ✅ `backend/src/document-types/document-types.controller.ts`

## Archivos de Referencia

- `frontend/src/components/landing/SignupModal.tsx` (sin cambios)
- `frontend/src/services/api.ts` (sin cambios - ya actualizado en V75.0)
- `frontend/src/services/document-types.service.ts` (sin cambios)

## Notas Técnicas

### Seguridad
- El endpoint es público pero solo retorna información básica de tipos de documento
- No expone información sensible de tenants o usuarios
- Soporta filtros por país (`country`) y estado activo (`isActive`)

### Compatibilidad
- Los campos `documentTypeId` y `documentNumber` son opcionales en el formulario
- Se convierten a `null` si están vacíos antes de enviar al backend
- El backend acepta estos campos como nullable

## Estado del Sistema

- ✅ Backend compilado y desplegado
- ✅ PM2 reiniciado correctamente
- ✅ Endpoint público configurado
- ⏳ Pendiente: Pruebas en producción

## Próximos Pasos

1. Probar el formulario en https://archivoenlinea.com/pricing
2. Verificar que el select cargue los tipos de documento
3. Crear una cuenta de prueba para validar el flujo completo
4. Confirmar que los datos se guarden correctamente en la base de datos

## Relación con Despliegues Anteriores

- **V75.0:** Implementación de campos de documento en SignupModal y corrección de redirección al login
- **V75.1:** Hacer público el endpoint de tipos de documento (ESTE DESPLIEGUE)

---

**Responsable:** Kiro AI Assistant  
**Servidor:** AWS EC2 - 100.28.198.249  
**Proceso PM2:** datagree  
**Versión Backend:** 75.0.0 (sin cambio de versión, solo fix)
