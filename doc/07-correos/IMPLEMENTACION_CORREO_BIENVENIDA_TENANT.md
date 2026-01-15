# Implementación de Correo de Bienvenida para Tenants

## Resumen

Se implementó el envío automático de correo de bienvenida al crear un tenant y la funcionalidad para reenviar el correo manualmente.

## Funcionalidades Implementadas

### 1. Envío Automático al Crear Tenant

Cuando se crea un nuevo tenant, el sistema automáticamente:
1. Crea el tenant en la base de datos
2. Crea el usuario administrador del tenant
3. Inicializa la configuración del tenant
4. **Envía correo de bienvenida al administrador** ← NUEVO

### 2. Reenvío Manual de Correo

Se agregó un botón en cada tarjeta de tenant para reenviar el correo de bienvenida manualmente.

## Cambios en el Backend

### 1. Módulo de Tenants

**Archivo:** `backend/src/tenants/tenants.module.ts`

```typescript
imports: [
  TypeOrmModule.forFeature([Tenant, User, Role]),
  forwardRef(() => SettingsModule),
  MailModule,  // ← AGREGADO
],
```

### 2. Servicio de Tenants

**Archivo:** `backend/src/tenants/tenants.service.ts`

#### Import de MailService

```typescript
import { MailService } from '../mail/mail.service';

constructor(
  // ... otros repositorios
  private mailService: MailService,  // ← AGREGADO
) {}
```

#### Envío Automático en create()

```typescript
// ENVIAR EMAIL DE BIENVENIDA AL ADMINISTRADOR
try {
  const userWithRelations = await this.usersRepository.findOne({
    where: { id: savedUser.id },
    relations: ['role', 'tenant'],
  });
  
  if (userWithRelations) {
    await this.mailService.sendWelcomeEmail(userWithRelations, adminUser.password);
    console.log('[TenantsService] Correo de bienvenida enviado a:', userWithRelations.email);
  }
} catch (emailError) {
  // No fallar la creación del tenant si el correo falla
  console.error('[TenantsService] Error al enviar correo de bienvenida:', emailError.message);
}
```

**Características:**
- ✅ Se envía después de crear el tenant exitosamente
- ✅ No falla la creación si el correo falla
- ✅ Incluye la contraseña temporal en el correo
- ✅ Logging detallado

#### Método resendWelcomeEmail()

```typescript
async resendWelcomeEmail(tenantId: string): Promise<{ message: string }> {
  // Buscar el tenant
  const tenant = await this.findOne(tenantId);

  // Buscar el usuario administrador del tenant
  const adminUser = await this.usersRepository.findOne({
    where: {
      tenant: { id: tenantId },
      role: { type: RoleType.ADMIN_GENERAL },
    },
    relations: ['role', 'tenant'],
    order: { createdAt: 'ASC' }, // El primer admin creado
  });

  if (!adminUser) {
    throw new NotFoundException('No se encontró el usuario administrador del tenant');
  }

  try {
    // Generar una nueva contraseña temporal
    const temporaryPassword = this.generateTemporaryPassword();
    
    // Actualizar la contraseña del usuario
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
    adminUser.password = hashedPassword;
    await this.usersRepository.save(adminUser);
    
    // Enviar correo con la nueva contraseña
    await this.mailService.sendWelcomeEmail(adminUser, temporaryPassword);
    
    return {
      message: `Correo de bienvenida enviado exitosamente a ${adminUser.email} con una nueva contraseña temporal`,
    };
  } catch (error) {
    throw new BadRequestException(
      `No se pudo enviar el correo: ${error.message}. ` +
      'Verifica la configuración SMTP en el archivo .env.'
    );
  }
}

private generateTemporaryPassword(): string {
  // Generar contraseña temporal de 12 caracteres
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
```

**Características:**
- ✅ Busca el primer administrador creado del tenant
- ✅ **Genera nueva contraseña temporal de 12 caracteres**
- ✅ **Actualiza la contraseña en la base de datos**
- ✅ Envía correo con la nueva contraseña
- ✅ Manejo de errores descriptivo
- ✅ Retorna mensaje de éxito

**⚠️ IMPORTANTE:** Al reenviar el correo, se genera una nueva contraseña temporal que reemplaza la anterior. El administrador debe usar esta nueva contraseña para iniciar sesión.

### 3. Controlador de Tenants

**Archivo:** `backend/src/tenants/tenants.controller.ts`

```typescript
@Post(':id/resend-welcome-email')
@RequirePermissions(PERMISSIONS.MANAGE_TENANTS)
resendWelcomeEmail(@Param('id') id: string) {
  return this.tenantsService.resendWelcomeEmail(id);
}
```

**Endpoint:** `POST /api/tenants/:id/resend-welcome-email`

**Permiso requerido:** `manage_tenants` (Solo Super Admin)

## Cambios en el Frontend

### 1. Componente TenantCard

**Archivo:** `frontend/src/components/TenantCard.tsx`

#### Nueva Prop

```typescript
interface TenantCardProps {
  // ... otras props
  onResendWelcomeEmail: (id: string) => void;  // ← AGREGADO
}
```

#### Nuevo Botón en el Menú

```typescript
<button
  onClick={() => {
    onResendWelcomeEmail(tenant.id);
    setShowMenu(false);
  }}
  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center text-blue-600"
>
  <Mail className="w-4 h-4 mr-2" />
  Reenviar Email Bienvenida
</button>
```

### 2. Página de Tenants

**Archivo:** `frontend/src/pages/TenantsPage.tsx`

#### Handler para Reenviar Correo

```typescript
const handleResendWelcomeEmail = async (id: string) => {
  if (!confirm('¿Deseas reenviar el correo de bienvenida al administrador de este tenant?')) return;
  
  try {
    await tenantsService.resendWelcomeEmail(id);
    alert('Correo de bienvenida enviado exitosamente');
  } catch (error: any) {
    console.error('Error resending welcome email:', error);
    alert(error.response?.data?.message || 'Error al enviar el correo de bienvenida');
  }
};
```

#### Pasar Prop a TenantCard

```typescript
<TenantCard
  // ... otras props
  onResendWelcomeEmail={handleResendWelcomeEmail}
/>
```

### 3. Servicio de Tenants

**Archivo:** `frontend/src/services/tenants.ts`

```typescript
// Reenviar correo de bienvenida
resendWelcomeEmail: async (id: string): Promise<{ message: string }> => {
  const response = await api.post(`/tenants/${id}/resend-welcome-email`);
  return response.data;
},
```

## Flujo Completo

### Crear Nuevo Tenant

```
1. Super Admin crea tenant desde la UI
   ↓
2. Backend crea tenant en BD
   ↓
3. Backend crea usuario administrador
   ↓
4. Backend inicializa configuración
   ↓
5. Backend envía correo de bienvenida
   ↓
6. Administrador recibe correo con:
   - Credenciales de acceso
   - URL del tenant
   - Información del sistema
```

### Reenviar Correo de Bienvenida

```
1. Super Admin hace clic en menú del tenant
   ↓
2. Selecciona "Reenviar Email Bienvenida"
   ↓
3. Confirma la acción
   ↓
4. Backend busca el administrador del tenant
   ↓
5. Backend envía correo de bienvenida
   ↓
6. Administrador recibe correo nuevamente
```

## Contenido del Correo de Bienvenida

El correo incluye:

### Información de la Cuenta
- ✉️ Nombre del usuario
- 🏢 Nombre de la organización (tenant)
- 👤 Rol asignado (Administrador General)
- 📧 Email de acceso

### Credenciales
- 🔐 Usuario (email)
- 🔑 Contraseña:
  - **En creación**: La contraseña ingresada en el formulario
  - **En reenvío**: Nueva contraseña temporal generada automáticamente (12 caracteres)

### Acceso al Sistema
- 🔗 URL directa al tenant
  - Desarrollo: `http://slug.localhost:5173`
  - Producción: `https://slug.tudominio.com`

### Características del Sistema
- 📝 Gestión de Consentimientos
- ✍️ Firma Digital
- 📧 Envío Automático
- 🔒 Seguro y Confiable

### Branding
- 🎨 Logo y colores de Innova Systems
- 📞 Información de contacto
- ✨ Diseño profesional y responsive

## Manejo de Errores

### Si el Correo Falla al Crear Tenant

```typescript
try {
  await this.mailService.sendWelcomeEmail(userWithRelations, adminUser.password);
} catch (emailError) {
  // No fallar la creación del tenant
  console.error('[TenantsService] Error al enviar correo de bienvenida:', emailError.message);
}
```

**Comportamiento:**
- ✅ El tenant se crea exitosamente
- ✅ El usuario administrador se crea
- ⚠️ El correo no se envía
- 📝 Se registra el error en los logs
- 🔄 Se puede reenviar manualmente después

### Si el Correo Falla al Reenviar

```typescript
catch (error) {
  throw new BadRequestException(
    `No se pudo enviar el correo: ${error.message}. ` +
    'Verifica la configuración SMTP en el archivo .env.'
  );
}
```

**Comportamiento:**
- ❌ Se muestra error al usuario
- 📝 Se registra el error en los logs
- 💡 Se indica verificar configuración SMTP
- 🔄 Se puede reintentar

## Casos de Uso

### Caso 1: Creación Normal

```
✅ Tenant creado
✅ Usuario administrador creado
✅ Configuración inicializada
✅ Correo enviado exitosamente
```

### Caso 2: Correo No Configurado

```
✅ Tenant creado
✅ Usuario administrador creado
✅ Configuración inicializada
❌ Correo no enviado (SMTP no configurado)
→ Reenviar manualmente después de configurar SMTP
⚠️ Al reenviar, se generará nueva contraseña temporal
```

### Caso 3: Error Temporal de Red

```
✅ Tenant creado
✅ Usuario administrador creado
✅ Configuración inicializada
❌ Correo no enviado (error de red)
→ Reenviar manualmente
⚠️ Al reenviar, se generará nueva contraseña temporal
```

### Caso 4: Reenvío de Correo

```
✅ Tenant ya existe
✅ Usuario administrador ya existe
🔄 Se genera nueva contraseña temporal (12 caracteres)
🔄 Se actualiza contraseña en BD
✅ Correo enviado con nueva contraseña
⚠️ La contraseña anterior queda invalidada
```

## Pruebas

### Probar Creación de Tenant

1. **Configurar SMTP** (ver `doc/GUIA_RAPIDA_GMAIL.md`)
2. **Crear tenant** desde la UI
3. **Verificar logs** del backend:
   ```
   [TenantsService] Tenant creado exitosamente: xxx
   [TenantsService] Configuración del tenant inicializada
   [TenantsService] Correo de bienvenida enviado a: admin@ejemplo.com
   ```
4. **Verificar correo** en la bandeja del administrador

### Probar Reenvío de Correo

1. **Abrir página de Tenants**
2. **Hacer clic** en el menú (⋮) de un tenant
3. **Seleccionar** "Reenviar Email Bienvenida"
4. **Confirmar** la acción
5. **Verificar** mensaje de éxito
6. **Verificar correo** en la bandeja del administrador

## Archivos Modificados

### Backend
- `backend/src/tenants/tenants.module.ts` - Import de MailModule
- `backend/src/tenants/tenants.service.ts` - Envío automático y método de reenvío
- `backend/src/tenants/tenants.controller.ts` - Endpoint de reenvío

### Frontend
- `frontend/src/components/TenantCard.tsx` - Botón de reenvío
- `frontend/src/pages/TenantsPage.tsx` - Handler de reenvío
- `frontend/src/services/tenants.ts` - Método de API

## Configuración Requerida

Para que funcione el envío de correos, debe estar configurado SMTP en `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-contraseña-de-aplicacion
SMTP_FROM=tu-email@gmail.com
SMTP_FROM_NAME=Innova Systems - Sistema de Consentimientos
```

Ver guía completa en: `doc/GUIA_RAPIDA_GMAIL.md`

## Notas Importantes

### Contraseñas

1. **Al crear tenant**: Se envía la contraseña exacta que se ingresó en el formulario de creación
2. **Al reenviar correo**: Se genera automáticamente una nueva contraseña temporal de 12 caracteres que reemplaza la anterior
3. **Seguridad**: Se recomienda que el administrador cambie su contraseña después del primer inicio de sesión

### Comportamiento del Reenvío

- ⚠️ **IMPORTANTE**: Al reenviar el correo de bienvenida, la contraseña anterior del administrador quedará invalidada
- La nueva contraseña temporal se genera con caracteres alfanuméricos (sin caracteres especiales para evitar confusiones)
- El administrador debe usar la nueva contraseña recibida por correo para iniciar sesión

## Resultado Final

✅ Correo de bienvenida se envía automáticamente al crear tenant
✅ Botón para reenviar correo manualmente
✅ Generación automática de contraseña temporal en reenvío
✅ Actualización de contraseña en base de datos
✅ Manejo robusto de errores
✅ No falla la creación si el correo falla
✅ Logging detallado
✅ Mensajes de error descriptivos
✅ Template profesional con branding de Innova Systems
✅ Funcionalidad completa y lista para producción
