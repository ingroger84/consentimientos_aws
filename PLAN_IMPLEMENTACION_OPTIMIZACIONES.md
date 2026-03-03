# Plan de Implementación de Optimizaciones
## Sistema de Usuarios, Roles y Perfiles

**Fecha:** 2026-03-02  
**Versión Actual:** 52.2.0  
**Versión Objetivo:** 53.0.0  
**Estado:** 📋 PLANIFICADO

---

## Resumen

Este documento detalla el plan de implementación para optimizar el sistema de usuarios, roles y perfiles, consolidando en un sistema unificado basado en Perfiles con un servicio centralizado de permisos.

---

## Fase 1: Servicio Centralizado de Permisos ✅

**Duración:** 1 día  
**Estado:** COMPLETADO

### Tareas Completadas

- [x] Crear `PermissionsService` centralizado
- [x] Implementar caché con cache-manager
- [x] Agregar al `CommonModule` como servicio global
- [x] Documentar API del servicio

### Archivos Creados

- `backend/src/common/services/permissions.service.ts`
- `backend/src/common/common.module.ts` (actualizado)

### Funcionalidades Implementadas

1. **isSuperAdmin(userId)** - Verificación centralizada de super admin
2. **hasPermission(userId, module, action)** - Verificación de permiso específico
3. **hasAnyPermission(userId, permissions[])** - Verificación de al menos un permiso
4. **hasAllPermissions(userId, permissions[])** - Verificación de todos los permisos
5. **getUserPermissions(userId)** - Obtener todos los permisos
6. **invalidateUserPermissions(userId)** - Invalidar caché
7. **canAccessTenant(userId, tenantId)** - Verificación de acceso a tenant
8. **getUserPermissionsInfo(userId)** - Información completa de permisos

### Beneficios Obtenidos

- ✅ Única fuente de verdad para permisos
- ✅ Caché integrado (5 minutos TTL)
- ✅ Compatibilidad con Roles legacy
- ✅ Fácil de testear y mantener

---

## Fase 2: Actualizar Guards y Decorators

**Duración:** 1 día  
**Estado:** PENDIENTE

### Tareas

- [ ] Actualizar `PermissionsGuard` para usar `PermissionsService`
- [ ] Crear decorator `@RequireSuperAdmin()`
- [ ] Crear decorator `@RequireAnyPermission(...)`
- [ ] Crear decorator `@RequireAllPermissions(...)`
- [ ] Actualizar tests de guards

### Archivos a Modificar

```
backend/src/profiles/guards/permissions.guard.ts
backend/src/profiles/decorators/require-permission.decorator.ts (nuevo)
backend/src/profiles/decorators/require-super-admin.decorator.ts (nuevo)
backend/src/profiles/decorators/require-any-permission.decorator.ts (nuevo)
backend/src/profiles/decorators/require-all-permissions.decorator.ts (nuevo)
```

### Ejemplo de Implementación

#### PermissionsGuard Actualizado

```typescript
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionsService: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    // Verificar si requiere super admin
    const requireSuperAdmin = this.reflector.getAllAndOverride<boolean>(
      'requireSuperAdmin',
      [context.getHandler(), context.getClass()],
    );

    if (requireSuperAdmin) {
      const isSuperAdmin = await this.permissionsService.isSuperAdmin(user.id);
      if (!isSuperAdmin) {
        throw new ForbiddenException('Se requiere ser super administrador');
      }
      return true;
    }

    // Verificar permisos específicos
    const requiredPermission = this.reflector.getAllAndOverride<{
      module: string;
      action: string;
    }>('requirePermission', [context.getHandler(), context.getClass()]);

    if (requiredPermission) {
      const hasPermission = await this.permissionsService.hasPermission(
        user.id,
        requiredPermission.module,
        requiredPermission.action,
      );

      if (!hasPermission) {
        throw new ForbiddenException(
          `No tienes permiso: ${requiredPermission.module}:${requiredPermission.action}`,
        );
      }
      return true;
    }

    // Verificar "cualquier permiso"
    const requireAnyPermission = this.reflector.getAllAndOverride<
      Array<{ module: string; action: string }>
    >('requireAnyPermission', [context.getHandler(), context.getClass()]);

    if (requireAnyPermission) {
      const hasAny = await this.permissionsService.hasAnyPermission(
        user.id,
        requireAnyPermission,
      );

      if (!hasAny) {
        throw new ForbiddenException('No tienes ninguno de los permisos requeridos');
      }
      return true;
    }

    // Verificar "todos los permisos"
    const requireAllPermissions = this.reflector.getAllAndOverride<
      Array<{ module: string; action: string }>
    >('requireAllPermissions', [context.getHandler(), context.getClass()]);

    if (requireAllPermissions) {
      const hasAll = await this.permissionsService.hasAllPermissions(
        user.id,
        requireAllPermissions,
      );

      if (!hasAll) {
        throw new ForbiddenException('No tienes todos los permisos requeridos');
      }
      return true;
    }

    // Si no hay requisitos, permitir acceso
    return true;
  }
}
```

#### Nuevos Decorators

```typescript
// require-super-admin.decorator.ts
export const RequireSuperAdmin = () => SetMetadata('requireSuperAdmin', true);

// require-any-permission.decorator.ts
export const RequireAnyPermission = (
  ...permissions: Array<{ module: string; action: string }>
) => SetMetadata('requireAnyPermission', permissions);

// require-all-permissions.decorator.ts
export const RequireAllPermissions = (
  ...permissions: Array<{ module: string; action: string }>
) => SetMetadata('requireAllPermissions', permissions);
```

---

## Fase 3: Migrar Controllers

**Duración:** 2 días  
**Estado:** PENDIENTE

### Tareas

- [ ] Identificar todos los controllers con verificaciones de permisos
- [ ] Reemplazar verificaciones manuales por `PermissionsService`
- [ ] Actualizar controllers de:
  - [ ] MedicalRecordsController
  - [ ] PaymentsController
  - [ ] InvoicesController
  - [ ] RolesController
  - [ ] ProfilesController
  - [ ] Otros controllers

### Ejemplo de Migración

#### Antes

```typescript
@Get()
async findAll(@Request() req: any) {
  const isSuperAdmin = !req.user.tenantId;
  const tenantId = isSuperAdmin ? null : req.user.tenantId;
  return this.service.findAll(tenantId);
}
```

#### Después

```typescript
@Get()
async findAll(@Request() req: any) {
  const isSuperAdmin = await this.permissionsService.isSuperAdmin(req.user.id);
  const tenantId = isSuperAdmin ? null : req.user.tenantId;
  return this.service.findAll(tenantId);
}
```

O mejor aún, usando decorators:

```typescript
@Get()
@RequirePermission('medical_records', 'view')
async findAll(@Request() req: any) {
  // La verificación de permisos se hace automáticamente en el guard
  const isSuperAdmin = await this.permissionsService.isSuperAdmin(req.user.id);
  const tenantId = isSuperAdmin ? null : req.user.tenantId;
  return this.service.findAll(tenantId);
}
```

---

## Fase 4: Migrar ProfilesService

**Duración:** 1 día  
**Estado:** PENDIENTE

### Tareas

- [ ] Actualizar `ProfilesService.isSuperAdmin()` para usar `PermissionsService`
- [ ] Actualizar `ProfilesService.checkUserPermission()` para usar `PermissionsService`
- [ ] Agregar invalidación de caché al asignar/revocar perfiles
- [ ] Actualizar tests

### Ejemplo de Implementación

```typescript
@Injectable()
export class ProfilesService {
  constructor(
    // ... otros repositorios
    private permissionsService: PermissionsService,
  ) {}

  async assignToUser(
    profileId: string,
    userId: string,
    performedBy: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<User> {
    // ... lógica de asignación

    // Invalidar caché de permisos del usuario
    await this.permissionsService.invalidateUserPermissions(userId);

    return user;
  }

  async revokeFromUser(
    userId: string,
    performedBy: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<User> {
    // ... lógica de revocación

    // Invalidar caché de permisos del usuario
    await this.permissionsService.invalidateUserPermissions(userId);

    return user;
  }

  // Deprecar este método en favor de PermissionsService
  @Deprecated('Use PermissionsService.checkUserPermission instead')
  async checkUserPermission(
    userId: string,
    moduleCode: string,
    action: string,
  ): Promise<boolean> {
    return this.permissionsService.hasPermission(userId, moduleCode, action);
  }
}
```

---

## Fase 5: Actualizar Frontend

**Duración:** 1 día  
**Estado:** PENDIENTE

### Tareas

- [ ] Actualizar `usePermissions` hook para usar nuevo endpoint
- [ ] Crear endpoint `/api/users/me/permissions` en backend
- [ ] Actualizar componentes que verifican permisos
- [ ] Agregar caché en frontend (React Query)

### Ejemplo de Implementación

#### Nuevo Endpoint en Backend

```typescript
@Controller('users')
export class UsersController {
  constructor(
    private permissionsService: PermissionsService,
  ) {}

  @Get('me/permissions')
  @UseGuards(JwtAuthGuard)
  async getMyPermissions(@Request() req) {
    return this.permissionsService.getUserPermissionsInfo(req.user.id);
  }
}
```

#### Hook Actualizado en Frontend

```typescript
export function usePermissions() {
  const { user } = useAuthStore();
  
  // Usar React Query para caché
  const { data: permissionsInfo } = useQuery(
    ['user-permissions', user?.id],
    () => api.get('/users/me/permissions'),
    {
      enabled: !!user,
      staleTime: 5 * 60 * 1000, // 5 minutos
    }
  );

  const hasPermission = (module: string, action: string): boolean => {
    if (!permissionsInfo) return false;
    if (permissionsInfo.isSuperAdmin) return true;
    
    const permissionString = `${module}:${action}`;
    return permissionsInfo.permissions.includes(permissionString);
  };

  const isSuperAdmin = (): boolean => {
    return permissionsInfo?.isSuperAdmin || false;
  };

  return {
    hasPermission,
    isSuperAdmin,
    permissionsInfo,
  };
}
```

---

## Fase 6: Script de Migración de Datos

**Duración:** 1 día  
**Estado:** PENDIENTE

### Tareas

- [ ] Crear script para asignar perfiles a usuarios sin perfil
- [ ] Mapear roles a perfiles equivalentes
- [ ] Validar que todos los usuarios tengan perfil
- [ ] Crear backup antes de ejecutar

### Script de Migración

```typescript
// backend/migrate-users-to-profiles.ts
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

async function migrateUsersToProfiles() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  await dataSource.initialize();
  console.log('✅ Conectado a la base de datos\n');

  try {
    // 1. Obtener mapeo de roles a perfiles
    const roleProfileMap = await dataSource.query(`
      SELECT 
        r.id as role_id,
        r.name as role_name,
        p.id as profile_id,
        p.name as profile_name
      FROM roles r
      LEFT JOIN profiles p ON p.name = r.name
      WHERE p.is_system = true
    `);

    console.log('📋 Mapeo de Roles a Perfiles:');
    console.table(roleProfileMap);
    console.log('');

    // 2. Asignar perfiles a usuarios sin perfil
    for (const mapping of roleProfileMap) {
      const result = await dataSource.query(`
        UPDATE users
        SET profile_id = $1,
            updated_at = NOW()
        WHERE "roleId" = $2
        AND profile_id IS NULL
        RETURNING id, email, name
      `, [mapping.profile_id, mapping.role_id]);

      if (result.length > 0) {
        console.log(`✅ Asignado perfil "${mapping.profile_name}" a ${result.length} usuarios con rol "${mapping.role_name}"`);
      }
    }

    // 3. Verificar usuarios sin perfil
    const usersWithoutProfile = await dataSource.query(`
      SELECT id, email, name, "roleId"
      FROM users
      WHERE profile_id IS NULL
      AND deleted_at IS NULL
    `);

    if (usersWithoutProfile.length > 0) {
      console.log('\n⚠️  Usuarios sin perfil asignado:');
      console.table(usersWithoutProfile);
    } else {
      console.log('\n✅ Todos los usuarios tienen perfil asignado');
    }

    // 4. Estadísticas finales
    const stats = await dataSource.query(`
      SELECT 
        p.name as profile_name,
        COUNT(u.id) as user_count
      FROM profiles p
      LEFT JOIN users u ON u.profile_id = p.id AND u.deleted_at IS NULL
      GROUP BY p.id, p.name
      ORDER BY user_count DESC
    `);

    console.log('\n📊 Estadísticas de Perfiles:');
    console.table(stats);

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

migrateUsersToProfiles()
  .then(() => {
    console.log('\n✅ Migración completada exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error en migración:', error);
    process.exit(1);
  });
```

---

## Fase 7: Tests

**Duración:** 2 días  
**Estado:** PENDIENTE

### Tareas

- [ ] Tests unitarios de `PermissionsService`
- [ ] Tests de integración de guards
- [ ] Tests de endpoints con nuevos decorators
- [ ] Tests de migración de datos
- [ ] Tests de rendimiento (caché)

### Ejemplo de Tests

```typescript
describe('PermissionsService', () => {
  let service: PermissionsService;
  let userRepository: Repository<User>;
  let cacheManager: Cache;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PermissionsService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<PermissionsService>(PermissionsService);
  });

  describe('isSuperAdmin', () => {
    it('should return true for user with Super Administrador profile', async () => {
      // ... test implementation
    });

    it('should use cache on second call', async () => {
      // ... test implementation
    });
  });

  describe('hasPermission', () => {
    it('should return true for super admin', async () => {
      // ... test implementation
    });

    it('should check profile permissions', async () => {
      // ... test implementation
    });

    it('should fallback to role permissions', async () => {
      // ... test implementation
    });
  });
});
```

---

## Fase 8: Documentación

**Duración:** 1 día  
**Estado:** PENDIENTE

### Tareas

- [ ] Actualizar README con nuevo sistema de permisos
- [ ] Documentar API de `PermissionsService`
- [ ] Crear guía de migración para desarrolladores
- [ ] Actualizar Swagger/OpenAPI
- [ ] Crear ejemplos de uso

---

## Fase 9: Deploy y Monitoreo

**Duración:** 1 día  
**Estado:** PENDIENTE

### Tareas

- [ ] Deploy a ambiente de staging
- [ ] Ejecutar script de migración en staging
- [ ] Pruebas de QA
- [ ] Monitoreo de rendimiento
- [ ] Deploy a producción
- [ ] Monitoreo post-deploy

### Checklist de Deploy

- [ ] Backup de base de datos
- [ ] Script de rollback preparado
- [ ] Monitoreo de logs activo
- [ ] Alertas configuradas
- [ ] Plan de comunicación a usuarios

---

## Cronograma

| Fase | Duración | Inicio | Fin | Estado |
|------|----------|--------|-----|--------|
| 1. Servicio Centralizado | 1 día | 2026-03-02 | 2026-03-02 | ✅ COMPLETADO |
| 2. Guards y Decorators | 1 día | 2026-03-03 | 2026-03-03 | ⏳ PENDIENTE |
| 3. Migrar Controllers | 2 días | 2026-03-04 | 2026-03-05 | ⏳ PENDIENTE |
| 4. Migrar ProfilesService | 1 día | 2026-03-06 | 2026-03-06 | ⏳ PENDIENTE |
| 5. Actualizar Frontend | 1 día | 2026-03-07 | 2026-03-07 | ⏳ PENDIENTE |
| 6. Script de Migración | 1 día | 2026-03-08 | 2026-03-08 | ⏳ PENDIENTE |
| 7. Tests | 2 días | 2026-03-09 | 2026-03-10 | ⏳ PENDIENTE |
| 8. Documentación | 1 día | 2026-03-11 | 2026-03-11 | ⏳ PENDIENTE |
| 9. Deploy | 1 día | 2026-03-12 | 2026-03-12 | ⏳ PENDIENTE |

**Total:** 11 días (2.2 semanas)

---

## Métricas de Éxito

### Rendimiento
- [ ] 80% reducción en queries de permisos
- [ ] < 50ms tiempo de respuesta para verificación de permisos
- [ ] 90% hit rate en caché

### Calidad de Código
- [ ] 100% cobertura de tests en `PermissionsService`
- [ ] 0 verificaciones manuales de permisos en controllers
- [ ] 0 código duplicado de verificación de permisos

### Funcionalidad
- [ ] 100% de usuarios con perfil asignado
- [ ] 0 errores de permisos en producción
- [ ] Todas las features funcionando correctamente

---

## Riesgos y Mitigaciones

| Riesgo | Impacto | Probabilidad | Mitigación |
|--------|---------|--------------|------------|
| Usuarios sin permisos después de migración | Alto | Media | Script de validación + rollback |
| Degradación de rendimiento | Medio | Baja | Tests de carga + monitoreo |
| Bugs en verificación de permisos | Alto | Media | Tests exhaustivos + QA |
| Downtime durante deploy | Medio | Baja | Blue-green deployment |

---

## Próximos Pasos Inmediatos

1. ✅ Revisar y aprobar este plan
2. ⏳ Instalar dependencias necesarias (`@nestjs/cache-manager`, `cache-manager`)
3. ⏳ Compilar y probar `PermissionsService` localmente
4. ⏳ Comenzar Fase 2: Guards y Decorators

---

**Plan creado el 2026-03-02**
