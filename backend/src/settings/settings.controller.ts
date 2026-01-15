import {
  Controller,
  Get,
  Patch,
  Body,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Optional,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { SettingsService } from './settings.service';
import { TenantsService } from '../tenants/tenants.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { PERMISSIONS } from '../auth/constants/permissions';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('settings')
export class SettingsController {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly tenantsService: TenantsService,
  ) {}

  @Get('public')
  async getPublicSettings(@Req() req: Request) {
    // Endpoint público para la página de login
    // Detecta el subdominio y retorna settings del tenant correspondiente
    const tenantSlug = req['tenantSlug']; // Extraído por TenantMiddleware
    
    console.log('[SettingsController] ========== GET /settings/public ==========');
    console.log('[SettingsController] Host:', req.get('host'));
    console.log('[SettingsController] Hostname:', req.hostname);
    console.log('[SettingsController] Tenant Slug:', tenantSlug);
    console.log('[SettingsController] Tenant Slug tipo:', typeof tenantSlug);
    console.log('[SettingsController] Tenant Slug === null?', tenantSlug === null);
    console.log('[SettingsController] Tenant Slug === undefined?', tenantSlug === undefined);
    
    let tenantId: string | undefined = undefined;
    
    if (tenantSlug) {
      try {
        const tenant = await this.tenantsService.findBySlug(tenantSlug);
        tenantId = tenant.id;
        console.log('[SettingsController] Tenant encontrado:', tenant.name, '(', tenant.id, ')');
      } catch (error) {
        console.log('[SettingsController] Tenant no encontrado para slug:', tenantSlug);
        console.log('[SettingsController] Error:', error.message);
      }
    } else {
      console.log('[SettingsController] Sin tenant slug - Usando settings del Super Admin');
    }
    
    console.log('[SettingsController] TenantId final:', tenantId);
    console.log('[SettingsController] ==========================================');
    
    return this.settingsService.getSettings(tenantId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  getSettings(@CurrentUser() user: User) {
    // MULTI-TENANT: Obtener settings del tenant del usuario autenticado
    
    console.log('[SettingsController] ========== GET /api/settings ==========');
    console.log('[SettingsController] Usuario autenticado:', !!user);
    
    if (user) {
      console.log('[SettingsController] Usuario:', {
        id: user.id,
        email: user.email,
        name: user.name,
      });
      console.log('[SettingsController] Tenant del usuario:', user.tenant ? {
        id: user.tenant.id,
        name: user.tenant.name,
        slug: user.tenant.slug,
      } : 'NULL (Super Admin)');
    }
    
    const tenantId = user?.tenant?.id;
    console.log('[SettingsController] TenantId a usar:', tenantId || 'undefined (Super Admin)');
    console.log('[SettingsController] ==========================================');
    
    return this.settingsService.getSettings(tenantId);
  }

  @Patch()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(PERMISSIONS.EDIT_SETTINGS)
  updateSettings(@Body() updateSettingsDto: UpdateSettingsDto, @CurrentUser() user: User) {
    // MULTI-TENANT: Actualizar settings del tenant del usuario
    const tenantId = user.tenant?.id;
    return this.settingsService.updateSettings(updateSettingsDto, tenantId);
  }

  @Post('logo')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(PERMISSIONS.EDIT_SETTINGS)
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: diskStorage({
        destination: './uploads/logo',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `logo-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
          return cb(new Error('Solo se permiten imágenes'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  uploadLogo(@UploadedFile() file: Express.Multer.File, @CurrentUser() user: User) {
    const tenantId = user.tenant?.id;
    return this.settingsService.uploadLogo(file, tenantId);
  }

  @Post('footer-logo')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(PERMISSIONS.EDIT_SETTINGS)
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: diskStorage({
        destination: './uploads/logo',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `footer-logo-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
          return cb(new Error('Solo se permiten imágenes'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  uploadFooterLogo(@UploadedFile() file: Express.Multer.File, @CurrentUser() user: User) {
    const tenantId = user.tenant?.id;
    return this.settingsService.uploadFooterLogo(file, tenantId);
  }

  @Post('watermark-logo')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(PERMISSIONS.EDIT_SETTINGS)
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: diskStorage({
        destination: './uploads/logo',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `watermark-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
          return cb(new Error('Solo se permiten imágenes'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  uploadWatermarkLogo(@UploadedFile() file: Express.Multer.File, @CurrentUser() user: User) {
    const tenantId = user.tenant?.id;
    return this.settingsService.uploadWatermarkLogo(file, tenantId);
  }

  @Get('email-config')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(PERMISSIONS.CONFIGURE_EMAIL)
  getEmailConfig(@CurrentUser() user: User) {
    // Solo para usuarios de tenant
    if (!user.tenant) {
      throw new BadRequestException('Esta funcionalidad solo está disponible para usuarios de tenant');
    }
    const tenantId = user.tenant.id;
    return this.settingsService.getEmailConfig(tenantId);
  }

  @Post('email-config')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(PERMISSIONS.CONFIGURE_EMAIL)
  updateEmailConfig(@Body() emailConfig: any, @CurrentUser() user: User) {
    // Solo para usuarios de tenant
    if (!user.tenant) {
      throw new BadRequestException('Esta funcionalidad solo está disponible para usuarios de tenant');
    }
    const tenantId = user.tenant.id;
    return this.settingsService.updateEmailConfig(emailConfig, tenantId);
  }

  @Post('test-email')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(PERMISSIONS.CONFIGURE_EMAIL)
  testEmail(@Body() body: { email: string }, @CurrentUser() user: User) {
    // Solo para usuarios de tenant
    if (!user.tenant) {
      throw new BadRequestException('Esta funcionalidad solo está disponible para usuarios de tenant');
    }
    const tenantId = user.tenant.id;
    return this.settingsService.testEmail(body.email, tenantId);
  }
}
