import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';
import { ModulesController } from './modules.controller';
import { Profile } from './entities/profile.entity';
import { SystemModule } from './entities/system-module.entity';
import { ModuleAction } from './entities/module-action.entity';
import { PermissionAudit } from './entities/permission-audit.entity';
import { User } from '../users/entities/user.entity';
import { PermissionsGuard } from './guards/permissions.guard';
import { PermissionsCacheService } from './services/permissions-cache.service';

/**
 * Módulo de Perfiles y Permisos
 * 
 * Gestiona perfiles de usuario, módulos del sistema y permisos
 * Usa PermissionsCacheService para caché en memoria de permisos
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Profile,
      SystemModule,
      ModuleAction,
      PermissionAudit,
      User,
    ]),
  ],
  controllers: [ProfilesController, ModulesController],
  providers: [ProfilesService, PermissionsGuard, PermissionsCacheService],
  exports: [ProfilesService, PermissionsGuard, PermissionsCacheService],
})
export class ProfilesModule {}
