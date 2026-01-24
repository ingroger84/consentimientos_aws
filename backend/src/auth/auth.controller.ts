import { Controller, Post, Body, UseGuards, Request, Param, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { TenantSlug } from '../common/decorators/tenant-slug.decorator';
import { AllowAnyTenant } from '../common/decorators/allow-any-tenant.decorator';
import { getAppVersion, APP_VERSION } from '../config/version';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  @AllowAnyTenant()
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

  @Post('forgot-password')
  @AllowAnyTenant()
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
    @TenantSlug() tenantSlug: string | null,
  ) {
    return this.authService.forgotPassword(forgotPasswordDto.email, tenantSlug);
  }

  @Post('reset-password')
  @AllowAnyTenant()
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('impersonate/:userId')
  async impersonate(
    @Param('userId') userId: string,
    @Request() req: any,
  ) {
    return this.authService.impersonate(userId, req.user);
  }

  @Get('magic-login/:token')
  @AllowAnyTenant()
  async magicLogin(
    @Param('token') token: string,
    @TenantSlug() tenantSlug: string | null,
  ) {
    return this.authService.magicLogin(token, tenantSlug);
  }

  @Get('version')
  @AllowAnyTenant()
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
  async logout(@Request() req: any) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    return this.authService.logout(token);
  }

  @Post('logout-all')
  @UseGuards(AuthGuard('jwt'))
  @AllowAnyTenant()
  async logoutAll(@Request() req: any) {
    return this.authService.logoutAll(req.user.sub);
  }
}
