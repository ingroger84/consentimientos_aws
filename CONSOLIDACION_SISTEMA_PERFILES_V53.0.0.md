# 🔄 Consolidación del Sistema de Perfiles - v53.0.0

**Fecha:** 2026-03-02  
**Estado:** 🔄 EN PROGRESO  
**Objetivo:** Eliminar duplicación y consolidar en sistema de Perfiles

---

## 📋 Resumen

Este documento registra el proceso de consolidación del sistema de permisos, migrando del sistema legacy de Roles al nuevo sistema de Perfiles con permisos granulares.

---

## ✅ Tareas Completadas

### 1. Script de Migración de Usuarios

**Archivo:** `backend/migrate-users-to-profiles.js`

**Funcionalidades:**
- ✅ Mapeo automático de roles a perfiles
- ✅ Migración de usuarios sin perfil asignado
- ✅ Validación de integridad de datos
- ✅ Estadísticas antes y después
- ✅ Detección de usuarios sin perfil
- ✅ Recomendaciones post-migración

**Uso:**
```bash
cd backend
node migrate-users-to-profiles.js
```

**Salida esperada:**
```
🚀 Iniciando migración de usuarios a perfiles...
✅ Conectado a la base de datos

📋 Paso 1: Obteniendo mapeo de roles a perfiles...
📊 Mapeo de Roles a Perfiles:
┌─────────┬──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│ (index) │   role_id    │  role_name   │  role_code   │  profile_id  │profile_name  │
├─────────┼──────────────┼──────────────┼──────────────┼──────────────┼──────────────┤
│    0    │ 'uuid-1'     │ 'Super...'   │ 'super_admin'│ 'uuid-a'     │ 'Super...'   │
│    1    │ 'uuid-2'     │ 'Admin...'   │ 'admin_gen...'│ 'uuid-b'    │ 'Admin...'   │
└─────────┴──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘

✅ Todos los roles tienen perfil correspondiente

📊 Paso 2: Estadísticas ANTES de la migración...
📈 Usuarios por Rol (ANTES):
┌─────────┬──────────────┬──────────────┬────────────┬──────────────────┬────────────────────────┐
│ (index) │  role_name   │  role_code   │ user_count │users_with_profile│users_without_profile   │
├─────────┼──────────────┼──────────────┼────────────┼──────────────────┼────────────────────────┤
│    0    │ 'Super...'   │ 'super_admin'│     5      │        3         │           2            │
│    1    │ 'Admin...'   │ 'admin_gen...'│    20     │       15         │           5            │
└─────────┴──────────────┴──────────────┴────────────┴──────────────────┴────────────────────────┘

📊 Resumen ANTES:
   Total de usuarios: 25
   Con perfil asignado: 18 (72.0%)
   Sin perfil asignado: 7 (28.0%)

🔄 Paso 3: Migrando usuarios sin perfil...
   Procesando rol: Super Administrador (super_admin)...
   ✅ Asignado perfil "Super Administrador" a 2 usuarios
   Procesando rol: Administrador General (admin_general)...
   ✅ Asignado perfil "Administrador General" a 5 usuarios

✅ Migración completada: 7 usuarios actualizados

🔍 Paso 4: Verificando usuarios sin perfil...
✅ Todos los usuarios tienen perfil asignado

📊 Paso 5: Estadísticas DESPUÉS de la migración...
📈 Usuarios por Perfil (DESPUÉS):
┌─────────┬──────────────┬──────────────┬───────────┬────────────┐
│ (index) │profile_name  │ profile_code │ is_system │ user_count │
├─────────┼──────────────┼──────────────┼───────────┼────────────┤
│    0    │ 'Super...'   │ 'super_admin'│   true    │     5      │
│    1    │ 'Admin...'   │ 'admin_gen...'│  true    │    20      │
└─────────┴──────────────┴──────────────┴───────────┴────────────┘

📊 Total de usuarios con perfil: 25

============================================================
📋 RESUMEN DE LA MIGRACIÓN
============================================================
✅ Usuarios migrados: 7
✅ Total de usuarios con perfil: 25
✅ Usuarios sin perfil: 0
============================================================

✅ Migración completada exitosamente
```

### 2. Actualización de PaymentsController

**Archivo:** `backend/src/payments/payments.controller.ts`

**Cambios realizados:**

#### Antes (Legacy):
```typescript
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleType } from '../roles/entities/role.entity';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @Roles(RoleType.SUPER_ADMIN)
  async create(@Body() createPaymentDto: CreatePaymentDto) {
    return await this.paymentsService.create(createPaymentDto);
  }

  @Get()
  async findAll(@Request() req, ...) {
    const isSuperAdmin = req.user.role?.type === RoleType.SUPER_ADMIN;
    // ...
  }
}
```

#### Después (Nuevo):
```typescript
import { PermissionsGuard } from '../profiles/guards/permissions.guard';
import { RequirePermission } from '../profiles/decorators/require-permission.decorator';
import { RequireSuperAdmin } from '../profiles/decorators/require-super-admin.decorator';
import { ProfilesService } from '../profiles/profiles.service';

@Controller('payments')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly profilesService: ProfilesService,
  ) {}

  @Post()
  @RequireSuperAdmin()
  async create(@Body() createPaymentDto: CreatePaymentDto) {
    return await this.paymentsService.create(createPaymentDto);
  }

  @Get()
  @RequirePermission('payments', 'view')
  async findAll(@Request() req, ...) {
    const user = await this.profilesService['userRepository'].findOne({
      where: { id: req.user.id },
      relations: ['profile', 'role', 'tenant'],
    });
    const isSuperAdmin = this.profilesService['isSuperAdmin'](user);
    // ...
  }
}
```

**Beneficios:**
- ✅ Uso de decorators modernos
- ✅ Verificación centralizada de super admin
- ✅ Permisos granulares por acción
- ✅ Código más limpio y mantenible

### 3. Actualización de PaymentsModule

**Archivo:** `backend/src/payments/payments.module.ts`

**Cambios:**
```typescript
import { ProfilesModule } from '../profiles/profiles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Invoice, Tenant, BillingHistory]),
    MailModule,
    ProfilesModule, // ✅ NUEVO
  ],
  // ...
})
export class PaymentsModule {}
```

---

## 🔄 Tareas en Progreso

### 1. Actualizar Controllers Restantes

**Controllers pendientes:**

#### Prioridad Alta:
- [ ] InvoicesController
- [ ] PlansController
- [ ] MedicalRecordsController
- [ ] ConsentsController

#### Prioridad Media:
- [ ] ClientsController
- [ ] UsersController
- [ ] BranchesController
- [ ] TemplatesController
- [ ] ServicesController

#### Prioridad Baja:
- [ ] QuestionsController
- [ ] ReportsController
- [ ] SettingsController

### 2. Patrón de Actualización

Para cada controller, seguir estos pasos:

**Paso 1: Actualizar imports**
```typescript
// Eliminar
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleType } from '../roles/entities/role.entity';

// Agregar
import { PermissionsGuard } from '../profiles/guards/permissions.guard';
import { RequirePermission } from '../profiles/decorators/require-permission.decorator';
import { RequireSuperAdmin } from '../profiles/decorators/require-super-admin.decorator';
import { ProfilesService } from '../profiles/profiles.service';
```

**Paso 2: Actualizar decorators de clase**
```typescript
// Antes
@UseGuards(JwtAuthGuard, RolesGuard)

// Después
@UseGuards(JwtAuthGuard, PermissionsGuard)
```

**Paso 3: Inyectar ProfilesService**
```typescript
constructor(
  private readonly service: Service,
  private readonly profilesService: ProfilesService, // ✅ NUEVO
) {}
```

**Paso 4: Reemplazar decorators de métodos**
```typescript
// Antes
@Roles(RoleType.SUPER_ADMIN)

// Después
@RequireSuperAdmin()

// O para permisos específicos
@RequirePermission('module', 'action')
```

**Paso 5: Actualizar verificaciones de super admin**
```typescript
// Antes
const isSuperAdmin = req.user.role?.type === RoleType.SUPER_ADMIN;

// Después
const user = await this.profilesService['userRepository'].findOne({
  where: { id: req.user.id },
  relations: ['profile', 'role', 'tenant'],
});
const isSuperAdmin = this.profilesService['isSuperAdmin'](user);
```

**Paso 6: Actualizar módulo**
```typescript
import { ProfilesModule } from '../profiles/profiles.module';

@Module({
  imports: [
    // ... otros imports
    ProfilesModule, // ✅ NUEVO
  ],
  // ...
})
```

---

## 📊 Progreso General

### Controllers Actualizados: 1/12 (8%)

```
✅ PaymentsController
⏳ InvoicesController
⏳ PlansController
⏳ MedicalRecordsController
⏳ ConsentsController
⏳ ClientsController
⏳ UsersController
⏳ BranchesController
⏳ TemplatesController
⏳ ServicesController
⏳ QuestionsController
⏳ ReportsController
```

### Estimación de Tiempo

- **Controllers restantes:** 11
- **Tiempo por controller:** ~30 minutos
- **Tiempo total estimado:** ~5.5 horas
- **Con testing:** ~8 horas (1 día)

---

## 🎯 Próximos Pasos Inmediatos

### 1. Ejecutar Script de Migración

```bash
cd backend
node migrate-users-to-profiles.js
```

**Verificar:**
- Todos los usuarios tienen perfil asignado
- No hay errores en la migración
- Estadísticas son correctas

### 2. Actualizar InvoicesController

Aplicar el mismo patrón usado en PaymentsController:
- Reemplazar RolesGuard por PermissionsGuard
- Reemplazar @Roles() por @RequireSuperAdmin() o @RequirePermission()
- Inyectar ProfilesService
- Actualizar verificaciones de super admin
- Actualizar módulo

### 3. Actualizar PlansController

Similar a InvoicesController.

### 4. Compilar y Probar

```bash
cd backend
npm run build
```

Verificar que no hay errores de compilación.

### 5. Testing Manual

Probar endpoints actualizados:
```bash
# Crear pago (solo super admin)
curl -X POST http://localhost:3000/api/payments \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"tenantId": "uuid", "amount": 100}'

# Listar pagos (con permisos)
curl http://localhost:3000/api/payments \
  -H "Authorization: Bearer <token>"
```

---

## 🔍 Validaciones Necesarias

### Antes del Despliegue

- [ ] Todos los controllers actualizados
- [ ] Compilación sin errores
- [ ] Tests unitarios pasando
- [ ] Tests de integración pasando
- [ ] Migración de usuarios ejecutada
- [ ] Validación de permisos en producción
- [ ] Documentación actualizada

### Post-Despliegue

- [ ] Monitorear logs de errores
- [ ] Verificar que usuarios pueden acceder
- [ ] Validar permisos funcionan correctamente
- [ ] Revisar métricas de rendimiento
- [ ] Confirmar caché funciona

---

## 📝 Notas Importantes

### Compatibilidad Temporal

Durante la transición, el sistema mantiene compatibilidad con ambos sistemas:
- `User.role` - Sistema legacy (aún presente)
- `User.profile` - Sistema nuevo (preferido)

La verificación de super admin usa AMBOS:
```typescript
private isSuperAdmin(user: User): boolean {
  return (
    user.role?.code === 'super_admin' ||
    user.profile?.code === 'super_admin'
  );
}
```

### Deprecación de Roles

Una vez completada la migración:
1. Marcar `Role.permissions` como deprecated
2. Actualizar documentación
3. Comunicar a equipo
4. Planear eliminación en v54.0.0

### Rollback

Si hay problemas, el rollback es simple:
1. Revertir cambios en controllers
2. Volver a usar RolesGuard
3. Los usuarios mantienen ambos (role y profile)

---

## 🎉 Beneficios Esperados

### Rendimiento
- ✅ 70% reducción en queries (con caché)
- ✅ <10ms verificación de permisos
- ✅ Mejor escalabilidad

### Mantenibilidad
- ✅ Código más limpio
- ✅ Lógica centralizada
- ✅ Fácil de extender

### Seguridad
- ✅ Permisos granulares
- ✅ Auditoría completa
- ✅ Validaciones consistentes

### Flexibilidad
- ✅ Perfiles personalizados
- ✅ Permisos por módulo/acción
- ✅ Multi-tenant mejorado

---

## 📚 Referencias

- [Análisis Completo](./ANALISIS_SISTEMA_PERFILES_ROLES_COMPLETO.md)
- [CRUD Perfiles](./CRUD_PERFILES_COMPLETADO.md)
- [Optimizaciones](./OPTIMIZACIONES_SISTEMA_PERFILES_COMPLETADAS.md)
- [Plan de Implementación](./PLAN_IMPLEMENTACION_OPTIMIZACIONES.md)

---

**Documento creado por:** Kiro AI Assistant  
**Fecha:** 2026-03-02  
**Versión:** 1.0  
**Estado:** 🔄 EN PROGRESO
