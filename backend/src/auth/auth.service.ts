import { Injectable, UnauthorizedException, ForbiddenException, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { TenantsService } from '../tenants/tenants.service';
import { MailService } from '../mail/mail.service';
import { User } from '../users/entities/user.entity';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private tenantsService: TenantsService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await user.validatePassword(password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  /**
   * Login con validación de tenant por subdominio
   * @param user - Usuario autenticado
   * @param tenantSlug - Slug del tenant extraído del subdominio (null para Super Admin)
   */
  async login(user: User, tenantSlug?: string | null) {
    this.logger.log(`Login attempt - User: ${user.email}, Tenant Slug: ${tenantSlug || 'null'}`);

    // Validar que el usuario pertenece al tenant del subdominio
    await this.validateTenantAccess(user, tenantSlug ?? null);

    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role?.type,
      tenantId: user.tenant?.id || null,
      tenantSlug: user.tenant?.slug || null,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
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
      },
    };
  }

  /**
   * Valida que el usuario tenga acceso al tenant del subdominio
   */
  private async validateTenantAccess(user: User, tenantSlug: string | null): Promise<void> {
    const baseDomain = process.env.BASE_DOMAIN || 'tudominio.com';
    
    // Caso 1: Sin subdominio (dominio base o 'admin') - Solo Super Admin
    if (!tenantSlug) {
      if (user.tenant) {
        this.logger.warn(
          `Tenant user ${user.email} attempted to login from admin/base domain. Tenant: ${user.tenant.slug}`,
        );
        throw new ForbiddenException(
          `Debes acceder desde tu subdominio: ${user.tenant.slug}.${baseDomain}`,
        );
      }
      // Super Admin puede acceder al dominio base o admin.tudominio.com
      this.logger.log(`Super Admin ${user.email} logged in from admin/base domain`);
      return;
    }

    // Caso 2: Subdominio específico
    if (tenantSlug) {
      // Super Admin NO puede acceder a subdominios de tenants
      if (!user.tenant) {
        this.logger.warn(
          `Super Admin ${user.email} attempted to login from tenant subdomain: ${tenantSlug}`,
        );
        throw new ForbiddenException(
          `El Super Admin debe acceder desde: admin.${baseDomain}`,
        );
      }

      // Validar que el tenant existe y está activo
      const tenant = await this.tenantsService.findBySlug(tenantSlug);
      
      if (tenant.status === 'suspended') {
        throw new ForbiddenException('Esta cuenta está suspendida. Contacta al administrador.');
      }

      if (tenant.status === 'expired') {
        throw new ForbiddenException('Esta cuenta ha expirado. Contacta al administrador.');
      }

      // Validar que el usuario pertenece al tenant del subdominio
      if (user.tenant.slug !== tenantSlug) {
        this.logger.warn(
          `User ${user.email} (tenant: ${user.tenant.slug}) attempted to login from wrong subdomain: ${tenantSlug}`,
        );
        throw new ForbiddenException(
          `No tienes acceso a este tenant. Tu subdominio es: ${user.tenant.slug}.${baseDomain}`,
        );
      }

      this.logger.log(`User ${user.email} logged in to tenant: ${tenantSlug}`);
    }
  }

  async validateToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }

  /**
   * Obtener usuario por ID (para validación de token)
   */
  async getUserById(userId: string): Promise<User> {
    return this.usersService.findOne(userId);
  }

  /**
   * Solicitar reset de contraseña
   * Genera un token único y envía correo con enlace
   */
  async forgotPassword(email: string, tenantSlug: string | null): Promise<{ message: string }> {
    this.logger.log(`Password reset requested for email: ${email}, tenant: ${tenantSlug || 'admin'}`);

    // Buscar usuario por email
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      // Por seguridad, no revelar si el email existe o no
      this.logger.warn(`Password reset requested for non-existent email: ${email}`);
      return {
        message: 'Si el correo existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.',
      };
    }

    // Validar que el usuario pertenece al tenant del subdominio
    const userTenantSlug = user.tenant?.slug || null;
    if (userTenantSlug !== tenantSlug) {
      this.logger.warn(
        `Password reset requested from wrong subdomain. User tenant: ${userTenantSlug}, Request tenant: ${tenantSlug}`,
      );
      return {
        message: 'Si el correo existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.',
      };
    }

    // Generar token único y seguro
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Establecer expiración (1 hora)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Guardar token hasheado en BD
    await this.usersService.updateResetToken(user.id, hashedToken, expiresAt);

    // Enviar correo con enlace de reset
    try {
      await this.mailService.sendPasswordResetEmail(user, resetToken, tenantSlug);
      this.logger.log(`Password reset email sent to: ${email}`);
    } catch (error) {
      this.logger.error(`Error sending password reset email to ${email}:`, error);
      throw new BadRequestException(
        'No se pudo enviar el correo de restablecimiento. Verifica la configuración SMTP.',
      );
    }

    return {
      message: 'Si el correo existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.',
    };
  }

  /**
   * Restablecer contraseña con token
   */
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    this.logger.log('Password reset attempt with token');

    // Hashear el token recibido para comparar con BD
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Buscar usuario por token y verificar que no haya expirado
    const user = await this.usersService.findByResetToken(hashedToken);

    if (!user) {
      this.logger.warn('Invalid or expired reset token');
      throw new BadRequestException('El enlace de restablecimiento es inválido o ha expirado.');
    }

    // Verificar que el token no haya expirado
    if (user.resetPasswordExpires < new Date()) {
      this.logger.warn(`Expired reset token for user: ${user.email}`);
      throw new BadRequestException('El enlace de restablecimiento ha expirado. Solicita uno nuevo.');
    }

    // Actualizar contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.updatePassword(user.id, hashedPassword);

    // Limpiar token de reset
    await this.usersService.clearResetToken(user.id);

    this.logger.log(`Password successfully reset for user: ${user.email}`);

    return {
      message: 'Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.',
    };
  }

  /**
   * Impersonar usuario - Permite al Super Admin acceder como cualquier usuario
   * SIN modificar su contraseña
   * Genera un token temporal de un solo uso
   */
  async impersonate(userId: string, currentUser: any) {
    this.logger.log(`[Impersonation] Attempt by ${currentUser.email} for user ${userId}`);

    // Solo Super Admin puede impersonar (usuarios sin tenant)
    if (currentUser.tenantId) {
      this.logger.warn(`[Impersonation] Denied: ${currentUser.email} is not Super Admin`);
      throw new ForbiddenException('Solo el Super Admin puede usar esta funcionalidad');
    }

    // Buscar usuario a impersonar
    const targetUser = await this.usersService.findOne(userId);

    if (!targetUser) {
      this.logger.warn(`[Impersonation] User not found: ${userId}`);
      throw new NotFoundException('Usuario no encontrado');
    }

    // No permitir impersonar a otro Super Admin
    if (!targetUser.tenant) {
      this.logger.warn(`[Impersonation] Denied: Cannot impersonate Super Admin`);
      throw new ForbiddenException('No se puede impersonar a otro Super Admin');
    }

    this.logger.log(`[Impersonation] Success: ${currentUser.email} → ${targetUser.email} (Tenant: ${targetUser.tenant.slug})`);

    // Generar token temporal de un solo uso (válido por 5 minutos)
    const magicToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(magicToken).digest('hex');
    
    // Guardar token temporal en el usuario (reutilizamos los campos de reset password)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5); // 5 minutos
    
    await this.usersService.updateResetToken(targetUser.id, hashedToken, expiresAt);

    return {
      magicToken,
      tenantSlug: targetUser.tenant.slug,
      user: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
      },
      message: `Token de acceso generado. Válido por 5 minutos.`,
    };
  }

  /**
   * Magic Login - Permite iniciar sesión con un token temporal de un solo uso
   */
  async magicLogin(token: string, tenantSlug: string | null) {
    this.logger.log(`[MagicLogin] Attempt with token from tenant: ${tenantSlug || 'null'}`);

    // Hashear el token recibido
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Buscar usuario por token
    const user = await this.usersService.findByResetToken(hashedToken);

    if (!user) {
      this.logger.warn('[MagicLogin] Invalid or expired token');
      throw new UnauthorizedException('Token inválido o expirado');
    }

    // Verificar que el token no haya expirado
    if (user.resetPasswordExpires < new Date()) {
      this.logger.warn(`[MagicLogin] Expired token for user: ${user.email}`);
      throw new UnauthorizedException('El token ha expirado');
    }

    // Verificar que el usuario pertenece al tenant del subdominio
    const userTenantSlug = user.tenant?.slug || null;
    if (userTenantSlug !== tenantSlug) {
      this.logger.warn(
        `[MagicLogin] Tenant mismatch. User tenant: ${userTenantSlug}, Request tenant: ${tenantSlug}`,
      );
      throw new ForbiddenException('Token no válido para este tenant');
    }

    // Limpiar el token (un solo uso)
    await this.usersService.clearResetToken(user.id);

    this.logger.log(`[MagicLogin] Success for user: ${user.email}`);

    // Generar JWT normal
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role?.type,
      tenantId: user.tenant?.id || null,
      tenantSlug: user.tenant?.slug || null,
      impersonated: true, // Marcar que fue acceso por impersonation
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
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
      },
    };
  }
}
