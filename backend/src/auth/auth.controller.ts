import { Controller, Post, Body, UseGuards, Request, Param, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { TenantSlug } from '../common/decorators/tenant-slug.decorator';
import { AllowAnyTenant } from '../common/decorators/allow-any-tenant.decorator';
import { SkipSessionCheck } from './decorators/skip-session-check.decorator';
import { getAppVersion, APP_VERSION } from '../config/version';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  @AllowAnyTenant()
  @SkipSessionCheck()
  @ApiOperation({ 
    summary: 'Iniciar sesión',
    description: 'Autentica un usuario con email y contraseña, retorna un token JWT'
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Login exitoso',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '123',
          name: 'Usuario Ejemplo',
          email: 'usuario@ejemplo.com',
          role: { id: '1', name: 'Admin' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(
    @Body() loginDto: LoginDto,
    @Request() req: any,
    @TenantSlug() tenantSlug: string | null,
  ) {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.connection.remoteAddress;
    
    return this.authService.login(req.user, tenantSlug, userAgent, ipAddress);
  }

  @Get('validate')
  @UseGuards(AuthGuard('jwt'))
  @AllowAnyTenant()
  @SkipSessionCheck()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Validar token',
    description: 'Valida el token JWT actual y retorna los datos del usuario'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Token válido',
    schema: {
      example: {
        id: '123',
        name: 'Usuario Ejemplo',
        email: 'usuario@ejemplo.com',
        role: { id: '1', name: 'Admin' },
        tenant: { id: '1', name: 'Tenant Ejemplo', slug: 'ejemplo' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Token inválido o expirado' })
  async validate(@Request() req: any) {
    // El token ya fue validado por el guard JWT
    // Retornar los datos del usuario completos
    const user = await this.authService.getUserById(req.user.sub);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      branches: user.branches,
      tenant: user.tenant ? {
        id: user.tenant.id,
        name: user.tenant.name,
        slug: user.tenant.slug,
      } : null,
    };
  }

  @Post('refresh-token')
  @UseGuards(AuthGuard('jwt'))
  @AllowAnyTenant()
  @SkipSessionCheck()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Refrescar token',
    description: 'Genera un nuevo token JWT con los permisos actualizados del usuario'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Token refrescado exitosamente',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: { id: '123', name: 'Usuario Ejemplo' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  async refreshToken(@Request() req: any, @TenantSlug() tenantSlug: string | null) {
    // Obtener el usuario actualizado con sus permisos actuales
    const user = await this.authService.getUserById(req.user.sub);
    
    // Generar un nuevo token con los permisos actualizados
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.connection.remoteAddress;
    
    return this.authService.login(user, tenantSlug, userAgent, ipAddress);
  }

  @Post('forgot-password')
  @AllowAnyTenant()
  @SkipSessionCheck()
  @ApiOperation({ 
    summary: 'Recuperar contraseña',
    description: 'Envía un email con un enlace para restablecer la contraseña'
  })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ status: 200, description: 'Email enviado exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
    @TenantSlug() tenantSlug: string | null,
  ) {
    return this.authService.forgotPassword(forgotPasswordDto.email, tenantSlug);
  }

  @Post('reset-password')
  @AllowAnyTenant()
  @SkipSessionCheck()
  @ApiOperation({ 
    summary: 'Restablecer contraseña',
    description: 'Restablece la contraseña usando el token recibido por email'
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Contraseña restablecida exitosamente' })
  @ApiResponse({ status: 400, description: 'Token inválido o expirado' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('impersonate/:userId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Suplantar usuario',
    description: 'Permite a un Super Admin iniciar sesión como otro usuario (solo para soporte)'
  })
  @ApiResponse({ status: 200, description: 'Suplantación exitosa' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  async impersonate(
    @Param('userId') userId: string,
    @Request() req: any,
  ) {
    return this.authService.impersonate(userId, req.user);
  }

  @Get('magic-login/:token')
  @AllowAnyTenant()
  @SkipSessionCheck()
  @ApiOperation({ 
    summary: 'Login mágico',
    description: 'Inicia sesión usando un token de un solo uso (magic link)'
  })
  @ApiResponse({ status: 200, description: 'Login exitoso' })
  @ApiResponse({ status: 400, description: 'Token inválido o expirado' })
  async magicLogin(
    @Param('token') token: string,
    @TenantSlug() tenantSlug: string | null,
  ) {
    return this.authService.magicLogin(token, tenantSlug);
  }

  @Get('version')
  @AllowAnyTenant()
  @SkipSessionCheck()
  @ApiOperation({ 
    summary: 'Versión de la API',
    description: 'Retorna la versión actual de la API'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Versión obtenida exitosamente',
    schema: {
      example: {
        version: '38.0.0',
        date: '2026-02-13',
        fullVersion: '38.0.0 - 2026-02-13'
      }
    }
  })
  async getVersion() {
    return {
      version: APP_VERSION.version,
      date: APP_VERSION.date,
      fullVersion: getAppVersion(),
    };
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @AllowAnyTenant()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Cerrar sesión',
    description: 'Invalida el token JWT actual'
  })
  @ApiResponse({ status: 200, description: 'Sesión cerrada exitosamente' })
  async logout(@Request() req: any) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    return this.authService.logout(token);
  }

  @Post('logout-all')
  @UseGuards(AuthGuard('jwt'))
  @AllowAnyTenant()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Cerrar todas las sesiones',
    description: 'Invalida todos los tokens JWT del usuario en todos los dispositivos'
  })
  @ApiResponse({ status: 200, description: 'Todas las sesiones cerradas exitosamente' })
  async logoutAll(@Request() req: any) {
    return this.authService.logoutAll(req.user.sub);
  }
}
