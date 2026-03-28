# Despliegue Backend v59 Final - Corrección Plantillas

## Fecha
16 de marzo de 2026 - 20:32 (hora servidor)

## Problema Identificado

El primer despliegue de v59 NO se aplicó correctamente porque:
1. El comando `npm run build` NO recompiló los archivos modificados
2. Los archivos en `dist/` eran del 16 de marzo a las 20:20 (ANTES de los cambios)
3. El zip desplegado contenía código viejo

## Solución Aplicada

### 1. Limpieza y Recompilación
```bash
# Eliminar carpeta dist
Remove-Item -Recurse -Force dist

# Recompilar desde cero
npm run build
```

### 2. Verificación de Cambios
Confirmado que el código compilado incluye:
- ✅ Filtro `tenantId: Not(IsNull())` para excluir plantillas sin tenant
- ✅ Campo `content` en el array de templates
- ✅ Campo `description` en el array de templates
- ✅ Campo `updatedAt` en el array de templates

### 3. Despliegue Correcto
```bash
# Comprimir
Compress-Archive -Path "dist\*" -DestinationPath "..\backend-dist-v59-final.zip" -Force

# Subir
scp -i AWS-ISSABEL.pem backend-dist-v59-final.zip ubuntu@100.28.198.249:/home/ubuntu/

# Desplegar
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249
cd /home/ubuntu/consentimientos_aws/backend
rm -rf dist
mkdir dist
unzip -q /home/ubuntu/backend-dist-v59-final.zip -d dist/
pm2 restart datagree
```

## Verificación en Base de Datos

Ejecutado script `verify-grouped-data.js` que confirmó:

### Plantillas CN
- ✅ 3 grupos de tenants (hotelglampinglapolka, Demo Estetica, Clínica Demo)
- ✅ TODAS tienen tenant asignado
- ✅ TODAS tienen content (longitud: 261-341 caracteres)
- ✅ TODAS tienen description (longitud: 56-76 caracteres)

### Plantillas HC
- ✅ 4 grupos de tenants (Clínica Demo, Demo Medico, Test, Demo Estetica)
- ✅ TODAS tienen tenant asignado
- ✅ TODAS tienen content (longitud: 837-1076 caracteres)
- ✅ TODAS tienen description (longitud: 53-88 caracteres)

## Estado del Servidor

### PM2 Status
```
┌────┬─────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id │ name        │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │
├────┼─────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤
│ 0  │ datagree    │ default     │ 41.1.5  │ fork    │ 1026966  │ 2s     │ 2    │ online    │ 0%       │ 132.0mb  │ ubuntu   │ disabled │
└────┴─────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘
```

### Archivos Desplegados
- Fecha de compilación: 16 de marzo 2026, 20:32
- Tamaño del archivo service: 17,354 bytes
- Ubicación: `/home/ubuntu/consentimientos_aws/backend/dist/`

## Cambios Implementados

### Backend - Servicio CN
**Archivo**: `backend/src/consent-templates/consent-templates.service.ts`

1. **Import agregado:**
```typescript
import { Repository, Not, IsNull } from 'typeorm';
```

2. **Método `getAllGroupedByTenant()` actualizado:**
```typescript
async getAllGroupedByTenant() {
  const allTemplates = await this.templatesRepository.find({
    relations: ['tenant'],
    where: {
      tenantId: Not(IsNull()), // ✅ Solo plantillas con tenant
    },
    order: { createdAt: 'DESC' },
  });

  // ... código de agrupación ...

  group.templates.push({
    id: template.id,
    name: template.name,
    type: template.type,
    content: template.content,        // ✅ AGREGADO
    description: template.description, // ✅ AGREGADO
    isActive: template.isActive,
    isDefault: template.isDefault,
    createdAt: template.createdAt,
    updatedAt: template.updatedAt,    // ✅ AGREGADO
    tenantName,
    tenantSlug,
  });
}
```

### Backend - Servicio HC
**Archivo**: `backend/src/medical-record-consent-templates/mr-consent-templates.service.ts`

1. **Import agregado:**
```typescript
import { Repository, IsNull, Not } from 'typeorm';
```

2. **Método `getAllGroupedByTenant()` actualizado:**
```typescript
async getAllGroupedByTenant() {
  const allTemplates = await this.templatesRepository.find({
    relations: ['tenant'],
    where: {
      tenantId: Not(IsNull()),  // ✅ Solo plantillas con tenant
      deletedAt: IsNull(),      // ✅ Excluir soft deleted
    },
    order: { createdAt: 'DESC' },
  });

  // ... código de agrupación ...

  group.templates.push({
    id: template.id,
    name: template.name,
    category: template.category,
    content: template.content,                    // ✅ AGREGADO
    description: template.description,            // ✅ AGREGADO
    isActive: template.isActive,
    isDefault: template.isDefault,
    requiresSignature: template.requiresSignature, // ✅ AGREGADO
    createdAt: template.createdAt,
    updatedAt: template.updatedAt,                // ✅ AGREGADO
    tenantName,
    tenantSlug,
  });
}
```

## Resultado Esperado

### Para el Usuario (Super Admin)

1. **NO verá grupos "Sin Cuenta"**
   - El filtro `Not(IsNull())` excluye plantillas sin tenant
   - Solo se muestran plantillas con tenant asignado

2. **Verá el contenido completo de las plantillas**
   - El campo `content` ahora se incluye en la respuesta
   - El modal "Ver" mostrará el contenido completo

3. **Verá información adicional**
   - Descripción de la plantilla
   - Fecha de última actualización
   - Categoría (HC) o tipo (CN)

## Instrucciones para el Usuario

### 1. Limpiar Caché del Navegador
Aunque el problema era del backend, es recomendable limpiar el caché:

**Chrome/Edge:**
1. Presiona `Ctrl + Shift + Delete`
2. Selecciona "Imágenes y archivos en caché"
3. Haz clic en "Borrar datos"

**Firefox:**
1. Presiona `Ctrl + Shift + Delete`
2. Selecciona "Caché"
3. Haz clic en "Limpiar ahora"

### 2. Hacer Hard Refresh
- Chrome/Edge: `Ctrl + Shift + R`
- Firefox: `Ctrl + F5`

### 3. Verificar Funcionamiento
1. Ir a "Plantillas CN" o "Plantillas HC"
2. Verificar que NO aparecen grupos "Sin Cuenta"
3. Hacer clic en el botón "Ver" (ojo) de cualquier plantilla
4. Verificar que se muestra el contenido completo

## Archivos Creados/Modificados

### Backend
- ✅ `backend/src/consent-templates/consent-templates.service.ts` (modificado)
- ✅ `backend/src/medical-record-consent-templates/mr-consent-templates.service.ts` (modificado)

### Scripts de Diagnóstico
- ✅ `backend/cleanup-templates-no-tenant.js` (creado)
- ✅ `backend/check-tables-names.js` (creado)
- ✅ `backend/verify-grouped-data.js` (creado)
- ✅ `backend/test-grouped-endpoint.js` (creado)

### Documentación
- ✅ `LIMPIEZA_PLANTILLAS_Y_CONTENIDO_V59_COMPLETADA.md` (creado)
- ✅ `DESPLIEGUE_BACKEND_V59_FINAL_COMPLETADO.md` (este archivo)

## Notas Técnicas

### Por qué falló el primer despliegue
1. NestJS a veces no detecta cambios en archivos TypeScript
2. El comando `npm run build` puede usar caché de compilación
3. Solución: Eliminar carpeta `dist/` antes de compilar

### Verificación de Despliegue
Siempre verificar la fecha de los archivos desplegados:
```bash
ls -la /home/ubuntu/consentimientos_aws/backend/dist/consent-templates/consent-templates.service.js
```

### Reinicio de PM2
Después de desplegar, siempre reiniciar PM2:
```bash
pm2 restart datagree
pm2 status  # Verificar que esté online
```

## Estado Final

✅ Backend v59 desplegado correctamente
✅ Código compilado con cambios aplicados
✅ PM2 reiniciado y online
✅ Plantillas sin tenant excluidas de la respuesta
✅ Campo `content` incluido en la respuesta
✅ Base de datos verificada (todas las plantillas tienen tenant y content)

## Próximos Pasos

1. Usuario debe limpiar caché del navegador
2. Usuario debe hacer Hard Refresh
3. Usuario debe verificar que:
   - NO aparecen grupos "Sin Cuenta"
   - Se ve el contenido de las plantillas al hacer clic en "Ver"
4. Si todo funciona correctamente, el problema está resuelto
