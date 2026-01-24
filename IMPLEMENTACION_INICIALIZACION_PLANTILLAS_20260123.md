# Implementación de Inicialización de Plantillas Predeterminadas
**Fecha:** 23 de enero de 2026  
**Versión:** 11.1.2

## Resumen
Se implementó la funcionalidad para inicializar plantillas de consentimiento predeterminadas desde el módulo de plantillas, permitiendo a los usuarios crear las 3 plantillas estándar con contenido legal colombiano con un solo clic. Se aplicaron las mejores prácticas del sistema usando toast notifications y confirm dialogs.

## Problema Identificado
Los usuarios no veían plantillas en el módulo porque no se creaban automáticamente al crear un tenant. No había forma de inicializar las plantillas predeterminadas desde la interfaz.

## Solución Implementada

### 1. Backend - Servicio
**Archivo:** `backend/src/consent-templates/consent-templates.service.ts`

Se agregó el método `initializeDefaults()` que:
- Verifica que no existan plantillas previas para el tenant
- Crea 3 plantillas predeterminadas con contenido legal estándar:
  - **Consentimiento de Procedimiento**: Para procedimientos médicos y servicios
  - **Tratamiento de Datos Personales**: Según Ley 1581 de 2012
  - **Autorización de Derechos de Imagen**: Para uso de imagen y datos personales
- Marca cada plantilla como `isDefault: true` y `isActive: true`
- Retorna mensaje de éxito con el conteo de plantillas creadas

### 2. Backend - Controlador
**Archivo:** `backend/src/consent-templates/consent-templates.controller.ts`

Se agregó el endpoint:
```typescript
@Post('initialize-defaults')
@UseGuards(PermissionsGuard)
@RequirePermissions(PERMISSIONS.CREATE_TEMPLATES)
initializeDefaults(@TenantSlug() tenantId: string)
```

### 3. Frontend - Servicio
**Archivo:** `frontend/src/services/template.service.ts`

Se agregó el método:
```typescript
async initializeDefaults(): Promise<{ message: string; count: number }>
```

### 4. Frontend - Página (Mejoras de UX)
**Archivo:** `frontend/src/pages/ConsentTemplatesPage.tsx`

Se implementó siguiendo las mejores prácticas:

#### Sistema de Notificaciones (Toast)
- ✅ Reemplazado `alert()` por `toast.success()` y `toast.error()`
- ✅ Mensajes con título y descripción clara
- ✅ Duración personalizada para mensajes importantes (5000ms)
- ✅ Tipos de toast apropiados: success, error, warning, info

#### Sistema de Confirmación (Confirm Dialog)
- ✅ Reemplazado `confirm()` nativo por `useConfirm()` hook
- ✅ Diálogos modales con título y mensaje descriptivo
- ✅ Tipos de diálogo apropiados: danger, warning, info
- ✅ Textos de botones personalizables

#### Mejoras Implementadas:
```typescript
// Toast de éxito con duración extendida
toast.success(
  '¡Plantillas creadas!', 
  `Se crearon ${result.count} plantillas predeterminadas exitosamente. Ahora puedes editarlas según tus necesidades.`,
  5000
);

// Confirm dialog con tipo info
const confirmed = await confirm({
  title: '¿Crear plantillas predeterminadas?',
  message: 'Se crearán 3 plantillas con contenido legal estándar colombiano que podrás editar según tus necesidades.',
  type: 'info'
});

// Toast de error con mensaje detallado
toast.error(
  'Error al crear plantillas', 
  error.response?.data?.message || 'No se pudieron crear las plantillas predeterminadas'
);
```

### 5. UI Mejorada
- Estado `initializing` para controlar el proceso
- Método `handleInitializeDefaults()` con manejo de errores robusto
- UI cuando no hay plantillas:
  - Mensaje explicativo claro
  - Botón verde "Crear Plantillas Predeterminadas" con ícono de refresh
  - Botón azul "Nueva Plantilla Personalizada"
  - Confirmación antes de crear con diálogo modal
  - Toast de éxito después de crear con información detallada
  - Manejo de errores con toast descriptivo

## Contenido de las Plantillas

### 1. Consentimiento de Procedimiento
- Declaración de consentimiento informado
- Información sobre el procedimiento/servicio
- Variables dinámicas: serviceName, branchName, signDate, clientName, clientId
- Espacio para firma del paciente

### 2. Tratamiento de Datos Personales
- Cumplimiento con Ley 1581 de 2012
- Finalidad del tratamiento
- Derechos del titular (ARCO)
- Información de contacto para ejercer derechos
- Variables dinámicas: branchName, branchEmail, branchAddress, branchPhone, clientName, clientId, clientEmail, clientPhone, currentDate

### 3. Autorización de Derechos de Imagen
- Autorización de uso de imagen y voz
- Alcance de la autorización
- Protección de la privacidad
- Derecho de revocación
- Variables dinámicas: branchName, clientName, clientId, serviceName, currentDate

## Flujo de Usuario

1. Usuario accede al módulo de Plantillas
2. Si no hay plantillas, ve mensaje con dos opciones:
   - **Crear Plantillas Predeterminadas**: Crea las 3 plantillas estándar
   - **Nueva Plantilla Personalizada**: Abre modal para crear plantilla desde cero
3. Al hacer clic en "Crear Plantillas Predeterminadas":
   - Se muestra confirmación
   - Se crean las 3 plantillas con contenido legal
   - Se recarga la lista de plantillas
   - Se muestra mensaje de éxito
4. Usuario puede editar las plantillas creadas según sus necesidades

## Validaciones

- Solo usuarios con permiso `CREATE_TEMPLATES` pueden inicializar plantillas
- No se pueden crear plantillas predeterminadas si ya existen plantillas para el tenant
- Confirmación antes de crear para evitar acciones accidentales

## Despliegue

### Backend
```bash
npm run build
scp -i AWS-ISSABEL.pem -r backend/dist ubuntu@100.28.198.249:/home/ubuntu/consentimientos_aws/backend/
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "pm2 restart datagree-backend"
```

### Frontend
```bash
npm run build
# Dominio principal
scp -i AWS-ISSABEL.pem -r frontend/dist/* ubuntu@100.28.198.249:/var/www/html/
# Subdominios
scp -i AWS-ISSABEL.pem -r frontend/dist/* ubuntu@100.28.198.249:/home/ubuntu/consentimientos_aws/frontend/dist/
```

## Archivos Modificados

### Backend
- `backend/src/consent-templates/consent-templates.service.ts`
- `backend/src/consent-templates/consent-templates.controller.ts`

### Frontend
- `frontend/src/services/template.service.ts`
- `frontend/src/pages/ConsentTemplatesPage.tsx`

## Pruebas Recomendadas

1. **Inicialización exitosa:**
   - Acceder al módulo de plantillas sin plantillas previas
   - Hacer clic en "Crear Plantillas Predeterminadas"
   - Verificar que se crean las 3 plantillas
   - Verificar que cada plantilla tiene el contenido correcto

2. **Validación de duplicados:**
   - Intentar inicializar plantillas cuando ya existen
   - Verificar que se muestra error apropiado

3. **Edición de plantillas:**
   - Editar una plantilla predeterminada
   - Verificar que se puede modificar el contenido
   - Verificar que las variables dinámicas funcionan

4. **Permisos:**
   - Intentar inicializar sin permiso `CREATE_TEMPLATES`
   - Verificar que se bloquea la acción

## Beneficios

- ✅ Onboarding más rápido para nuevos tenants
- ✅ Contenido legal estándar colombiano incluido
- ✅ Plantillas editables según necesidades específicas
- ✅ Reduce tiempo de configuración inicial
- ✅ Garantiza cumplimiento legal básico (Ley 1581 de 2012)
- ✅ Variables dinámicas para personalización automática
- ✅ **UX mejorada con toast notifications profesionales**
- ✅ **Confirm dialogs modales en lugar de alerts nativos**
- ✅ **Mensajes descriptivos con título y contenido**
- ✅ **Manejo de errores consistente y claro**

## Mejores Prácticas Aplicadas

### Sistema de Notificaciones
1. **Toast en lugar de alert()**: Notificaciones no intrusivas que no bloquean la UI
2. **Títulos descriptivos**: Cada toast tiene un título claro que resume la acción
3. **Mensajes detallados**: Información adicional en el cuerpo del mensaje
4. **Duración apropiada**: 5000ms para mensajes importantes, default para otros
5. **Tipos semánticos**: success, error, warning, info según el contexto

### Sistema de Confirmación
1. **Confirm dialogs modales**: Reemplazo de confirm() nativo por diálogos personalizados
2. **Tipos visuales**: danger (rojo), warning (amarillo), info (azul)
3. **Mensajes claros**: Título pregunta + mensaje explicativo
4. **Async/await**: Manejo moderno de promesas para confirmaciones

### Manejo de Errores
1. **Try-catch consistente**: Todos los métodos async tienen manejo de errores
2. **Mensajes de error descriptivos**: Se muestra el mensaje del servidor cuando está disponible
3. **Fallback messages**: Mensajes genéricos cuando no hay respuesta del servidor
4. **Console.error**: Logs para debugging sin afectar UX

## Notas Técnicas

- Las plantillas usan variables con formato `{{variableName}}`
- El servicio `replaceVariables()` reemplaza las variables al generar consentimientos
- Las plantillas predeterminadas se marcan con `isDefault: true`
- Solo puede haber una plantilla predeterminada por tipo
- Las plantillas predeterminadas no se pueden eliminar directamente (primero hay que marcar otra como predeterminada)
- **useToast hook**: Sistema de notificaciones basado en Zustand
- **useConfirm hook**: Sistema de confirmación basado en Zustand con promesas

## Estado
✅ **COMPLETADO** - Funcionalidad implementada con mejores prácticas de UX, compilada y desplegada en producción
