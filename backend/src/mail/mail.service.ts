import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as path from 'path';
import { Consent } from '../consents/entities/consent.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const smtpUser = this.configService.get('SMTP_USER');
    const smtpPassword = this.configService.get('SMTP_PASSWORD');
    const smtpHost = this.configService.get('SMTP_HOST');
    const smtpPort = this.configService.get('SMTP_PORT');

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: false, // true para 465, false para otros puertos
      auth: smtpUser && smtpPassword
        ? {
            user: smtpUser,
            pass: smtpPassword,
          }
        : undefined,
      tls: {
        rejectUnauthorized: false, // Para desarrollo
      },
    });

    this.logger.log(`Mail service initialized with host: ${smtpHost}:${smtpPort}`);
  }

  /**
   * Enviar correo de bienvenida al crear un nuevo usuario
   */
  async sendWelcomeEmail(user: User, temporaryPassword: string): Promise<void> {
    try {
      const baseDomain = this.configService.get('BASE_DOMAIN');
      const tenantSlug = user.tenant?.slug || 'admin';
      const loginUrl = baseDomain === 'localhost' 
        ? `http://${tenantSlug}.localhost:5173`
        : `https://${tenantSlug}.${baseDomain}`;

      const mailOptions = {
        from: `${this.configService.get('SMTP_FROM_NAME')} <${this.configService.get('SMTP_FROM')}>`,
        to: user.email,
        subject: '°Bienvenido al Sistema de Consentimientos!',
        html: this.getWelcomeEmailTemplate(user, temporaryPassword, loginUrl),
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Welcome email sent to ${user.email}`);
    } catch (error) {
      this.logger.error(`Error sending welcome email to ${user.email}:`, error);
      throw error;
    }
  }

  /**
   * Enviar correo de restablecimiento de contraseÒa
   */
  async sendPasswordResetEmail(user: User, resetToken: string, tenantSlug: string | null): Promise<void> {
    try {
      const baseDomain = this.configService.get('BASE_DOMAIN');
      const slug = tenantSlug || 'admin';
      const resetUrl = baseDomain === 'localhost'
        ? `http://${slug}.localhost:5173/reset-password?token=${resetToken}`
        : `https://${slug}.${baseDomain}/reset-password?token=${resetToken}`;

      const mailOptions = {
        from: `${this.configService.get('SMTP_FROM_NAME')} <${this.configService.get('SMTP_FROM')}>`,
        to: user.email,
        subject: 'Restablecimiento de ContraseÒa - Sistema de Consentimientos',
        html: this.getPasswordResetEmailTemplate(user, resetUrl),
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password reset email sent to ${user.email}`);
    } catch (error) {
      this.logger.error(`Error sending password reset email to ${user.email}:`, error);
      throw error;
    }
  }

  /**
   * Enviar correo con los consentimientos firmados
   */
  async sendConsentEmail(consent: Consent): Promise<void> {
    try {
      const attachments = [];

      // Adjuntar PDF unificado
      if (consent.pdfUrl) {
        const pdfPath = path.join(process.cwd(), consent.pdfUrl);
        attachments.push({
          filename: `consentimientos-${consent.clientId}.pdf`,
          path: pdfPath,
        });
      }

      const mailOptions = {
        from: `${this.configService.get('SMTP_FROM_NAME')} <${this.configService.get('SMTP_FROM')}>`,
        to: consent.clientEmail,
        subject: `Consentimientos Informados - ${consent.service.name}`,
        html: this.getConsentEmailTemplate(consent),
        attachments,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Consent email sent to ${consent.clientEmail}`);
    } catch (error) {
      this.logger.error(`Error sending consent email to ${consent.clientEmail}:`, error);
      throw error;
    }
  }

  /**
   * Template de correo de bienvenida
   */
  private getWelcomeEmailTemplate(user: User, temporaryPassword: string, loginUrl: string): string {
    const tenantName = user.tenant?.name || 'Sistema de Consentimientos';
    const roleName = user.role?.name || 'Usuario';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .header p {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
          }
          .content {
            padding: 40px 30px;
          }
          .welcome-message {
            font-size: 18px;
            color: #667eea;
            font-weight: 600;
            margin-bottom: 20px;
          }
          .info-box {
            background-color: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .info-box h3 {
            margin: 0 0 15px 0;
            color: #667eea;
            font-size: 16px;
          }
          .info-item {
            margin: 10px 0;
            padding: 10px;
            background-color: white;
            border-radius: 4px;
          }
          .info-item strong {
            color: #667eea;
            display: inline-block;
            min-width: 120px;
          }
          .credentials-box {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 25px;
            margin: 25px 0;
            border-radius: 8px;
            text-align: center;
          }
          .credentials-box h3 {
            margin: 0 0 20px 0;
            font-size: 18px;
          }
          .credential-item {
            background-color: rgba(255, 255, 255, 0.2);
            padding: 15px;
            margin: 10px 0;
            border-radius: 6px;
            font-size: 16px;
          }
          .credential-item strong {
            display: block;
            font-size: 12px;
            opacity: 0.9;
            margin-bottom: 5px;
          }
          .credential-value {
            font-size: 18px;
            font-weight: 600;
            letter-spacing: 1px;
          }
          .button {
            display: inline-block;
            padding: 15px 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 600;
            margin: 20px 0;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            transition: transform 0.2s;
          }
          .button:hover {
            transform: translateY(-2px);
          }
          .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
            color: #856404;
          }
          .footer {
            background-color: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
          }
          .footer-brand {
            font-size: 18px;
            font-weight: 600;
            color: #667eea;
            margin-bottom: 10px;
          }
          .footer p {
            margin: 5px 0;
            font-size: 13px;
            color: #6c757d;
          }
          .features {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin: 25px 0;
          }
          .feature {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            text-align: center;
          }
          .feature-icon {
            font-size: 24px;
            margin-bottom: 8px;
          }
          .feature-text {
            font-size: 13px;
            color: #6c757d;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>°Bienvenido!</h1>
            <p>Tu cuenta ha sido creada exitosamente</p>
          </div>
          
          <div class="content">
            <p class="welcome-message">Hola ${user.name},</p>
            
            <p>Es un placer darte la bienvenida al <strong>Sistema de Consentimientos Digitales</strong>, una soluciÛn moderna y eficiente para la gestiÛn de consentimientos informados.</p>
            
            <div class="info-box">
              <h3>üìã InformaciÛn de tu Cuenta</h3>
              <div class="info-item">
                <strong>OrganizaciÛn:</strong> ${tenantName}
              </div>
              <div class="info-item">
                <strong>Rol asignado:</strong> ${roleName}
              </div>
              <div class="info-item">
                <strong>Email:</strong> ${user.email}
              </div>
            </div>

            <div class="credentials-box">
              <h3>üîê Credenciales de Acceso</h3>
              <div class="credential-item">
                <strong>USUARIO</strong>
                <div class="credential-value">${user.email}</div>
              </div>
              <div class="credential-item">
                <strong>CONTRASE√ëA TEMPORAL</strong>
                <div class="credential-value">${temporaryPassword}</div>
              </div>
            </div>

            <div class="warning">
              <strong>‚ö†Ô∏è Importante:</strong> Por seguridad, te recomendamos cambiar tu contraseÒa despuÈs del primer inicio de sesiÛn.
            </div>

            <div style="text-align: center;">
              <a href="${loginUrl}" class="button">Iniciar SesiÛn Ahora</a>
            </div>

            <div class="info-box">
              <h3>üîó Enlace de Acceso</h3>
              <div class="info-item">
                <a href="${loginUrl}" style="color: #667eea; word-break: break-all;">${loginUrl}</a>
              </div>
            </div>

            <div class="features">
              <div class="feature">
                <div class="feature-icon">üìù</div>
                <div class="feature-text">GestiÛn de Consentimientos</div>
              </div>
              <div class="feature">
                <div class="feature-icon">‚úçÔ∏è</div>
                <div class="feature-text">Firma Digital</div>
              </div>
              <div class="feature">
                <div class="feature-icon">üìß</div>
                <div class="feature-text">EnvÌo Autom·tico</div>
              </div>
              <div class="feature">
                <div class="feature-icon">üîí</div>
                <div class="feature-text">Seguro y Confiable</div>
              </div>
            </div>

            <p style="margin-top: 30px;">Si tienes alguna pregunta o necesitas ayuda, no dudes en contactar con tu administrador.</p>
            
            <p>°Bienvenido a bordo!</p>
          </div>
          
          <div class="footer">
            <div class="footer-brand">Innova Systems</div>
            <p>Soluciones Inform√°ticas</p>
            <p style="margin-top: 15px;">Sistema de Consentimientos Digitales</p>
            <p style="font-size: 11px; margin-top: 15px; color: #adb5bd;">
              Este es un correo autom·tico, por favor no responder a este mensaje.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Template de correo de consentimientos
   */
  private getConsentEmailTemplate(consent: Consent): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .header p {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
          }
          .content {
            padding: 40px 30px;
          }
          .greeting {
            font-size: 18px;
            color: #10b981;
            font-weight: 600;
            margin-bottom: 20px;
          }
          .info-box {
            background-color: #f0fdf4;
            border-left: 4px solid #10b981;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .info-box h3 {
            margin: 0 0 15px 0;
            color: #10b981;
            font-size: 16px;
          }
          .info-item {
            margin: 10px 0;
            padding: 10px;
            background-color: white;
            border-radius: 4px;
          }
          .info-item strong {
            color: #10b981;
            display: inline-block;
            min-width: 100px;
          }
          .document-box {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 25px;
            margin: 25px 0;
            border-radius: 8px;
            text-align: center;
          }
          .document-box h3 {
            margin: 0 0 15px 0;
            font-size: 18px;
          }
          .document-icon {
            font-size: 48px;
            margin-bottom: 15px;
          }
          .footer {
            background-color: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
          }
          .footer-brand {
            font-size: 18px;
            font-weight: 600;
            color: #10b981;
            margin-bottom: 10px;
          }
          .footer p {
            margin: 5px 0;
            font-size: 13px;
            color: #6c757d;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Consentimientos Informados</h1>
            <p>Documentos firmados y procesados</p>
          </div>
          
          <div class="content">
            <p class="greeting">Estimado/a ${consent.clientName},</p>
            
            <p>Le enviamos sus consentimientos informados firmados correspondientes al servicio solicitado.</p>
            
            <div class="info-box">
              <h3>üìã Detalles del Servicio</h3>
              <div class="info-item">
                <strong>Servicio:</strong> ${consent.service.name}
              </div>
              <div class="info-item">
                <strong>Sede:</strong> ${consent.branch.name}
              </div>
              <div class="info-item">
                <strong>Fecha:</strong> ${consent.signedAt?.toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              <div class="info-item">
                <strong>Documento:</strong> ${consent.clientId}
              </div>
            </div>

            <div class="document-box">
              <div class="document-icon">üìÑ</div>
              <h3>Documento Adjunto</h3>
              <p style="margin: 0; opacity: 0.9;">Consentimientos Informados Completos</p>
              <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.8;">
                Incluye: Procedimiento, Tratamiento de Datos e Im√°genes
              </p>
            </div>

            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <strong style="color: #92400e;">üìå Importante:</strong>
              <p style="margin: 10px 0 0 0; color: #92400e;">
                Guarde estos documentos para sus registros. Son documentos legales que certifican su consentimiento informado.
              </p>
            </div>

            <p>Si tiene alguna pregunta o necesita informaci√≥n adicional, no dude en contactarnos.</p>
            
            <p style="margin-top: 30px;">Saludos cordiales,</p>
            <p style="font-weight: 600; color: #10b981;">${consent.branch.name}</p>
          </div>
          
          <div class="footer">
            <div class="footer-brand">Innova Systems</div>
            <p>Soluciones Inform√°ticas</p>
            <p style="margin-top: 15px;">Sistema de Consentimientos Digitales</p>
            <p style="font-size: 11px; margin-top: 15px; color: #adb5bd;">
              Este es un correo autom·tico, por favor no responder a este mensaje.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Template de correo de restablecimiento de contraseÒa
   */
  private getPasswordResetEmailTemplate(user: User, resetUrl: string): string {
    const tenantName = user.tenant?.name || 'Sistema de Consentimientos';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .header p {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
          }
          .content {
            padding: 40px 30px;
          }
          .greeting {
            font-size: 18px;
            color: #f59e0b;
            font-weight: 600;
            margin-bottom: 20px;
          }
          .info-box {
            background-color: #fffbeb;
            border-left: 4px solid #f59e0b;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .button {
            display: inline-block;
            padding: 15px 40px;
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 600;
            margin: 20px 0;
            box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
            transition: transform 0.2s;
          }
          .button:hover {
            transform: translateY(-2px);
          }
          .warning {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
            color: #92400e;
          }
          .footer {
            background-color: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
          }
          .footer-brand {
            font-size: 18px;
            font-weight: 600;
            color: #f59e0b;
            margin-bottom: 10px;
          }
          .footer p {
            margin: 5px 0;
            font-size: 13px;
            color: #6c757d;
          }
          .security-icon {
            font-size: 48px;
            text-align: center;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>üîê Restablecimiento de ContraseÒa</h1>
            <p>Solicitud de cambio de contraseÒa</p>
          </div>
          
          <div class="content">
            <p class="greeting">Hola ${user.name},</p>
            
            <p>Hemos recibido una solicitud para restablecer la contraseÒa de tu cuenta en <strong>${tenantName}</strong>.</p>

            <div class="security-icon">üîí</div>

            <p>Si solicitaste este cambio, haz clic en el bot√≥n de abajo para crear una nueva contraseÒa:</p>

            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Restablecer ContraseÒa</a>
            </div>

            <div class="info-box">
              <p style="margin: 0;"><strong>‚è∞ Este enlace expirar√° en 1 hora</strong></p>
              <p style="margin: 10px 0 0 0; font-size: 14px;">Por seguridad, el enlace solo puede usarse una vez.</p>
            </div>

            <div class="warning">
              <strong>‚ö†Ô∏è ¬øNo solicitaste este cambio?</strong>
              <p style="margin: 10px 0 0 0;">
                Si no solicitaste restablecer tu contraseÒa, puedes ignorar este correo de forma segura. 
                Tu contraseÒa actual permanecer√° sin cambios.
              </p>
            </div>

            <p style="margin-top: 30px; font-size: 14px; color: #6c757d;">
              Si el bot√≥n no funciona, copia y pega este enlace en tu navegador:
            </p>
            <p style="word-break: break-all; font-size: 12px; color: #6c757d;">
              ${resetUrl}
            </p>

            <p style="margin-top: 30px;">Si tienes alguna pregunta o necesitas ayuda, no dudes en contactar con tu administrador.</p>
          </div>
          
          <div class="footer">
            <div class="footer-brand">Innova Systems</div>
            <p>Soluciones Inform√°ticas</p>
            <p style="margin-top: 15px;">Sistema de Consentimientos Digitales</p>
            <p style="font-size: 11px; margin-top: 15px; color: #adb5bd;">
              Este es un correo autom·tico, por favor no responder a este mensaje.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
  /**`n   * Enviar email de recordatorio de pago
   */
  async sendPaymentReminderEmail(tenant: any, invoice: any, daysBeforeDue: number): Promise<void> {
    try {
      const mailOptions = {
        from: `${this.configService.get('SMTP_FROM_NAME')} <${this.configService.get('SMTP_FROM')}>`,
        to: tenant.contactEmail,
        subject: `Recordatorio: Pago pendiente - ${daysBeforeDue} dÌas para el vencimiento`,
        html: this.getPaymentReminderTemplate(tenant, invoice, daysBeforeDue),
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Payment reminder email sent to ${tenant.contactEmail}`);
    } catch (error) {
      this.logger.error(`Error sending payment reminder email to ${tenant.contactEmail}:`, error);
      throw error;
    }
  }

  /**
   * Enviar email con factura generada
   */
  async sendInvoiceEmail(tenant: any, invoice: any): Promise<void> {
    try {
      const mailOptions = {
        from: `${this.configService.get('SMTP_FROM_NAME')} <${this.configService.get('SMTP_FROM')}>`,
        to: tenant.contactEmail,
        subject: `Nueva Factura ${invoice.invoiceNumber} - ${tenant.name}`,
        html: this.getInvoiceEmailTemplate(tenant, invoice),
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Invoice email sent to ${tenant.contactEmail}`);
    } catch (error) {
      this.logger.error(`Error sending invoice email to ${tenant.contactEmail}:`, error);
      throw error;
    }
  }

  /**
   * Enviar email de confirmaciÛn de pago
   */
  async sendPaymentConfirmationEmail(tenant: any, payment: any, invoice: any): Promise<void> {
    try {
      const mailOptions = {
        from: `${this.configService.get('SMTP_FROM_NAME')} <${this.configService.get('SMTP_FROM')}>`,
        to: tenant.contactEmail,
        subject: `Pago Recibido - Factura ${invoice?.invoiceNumber || 'N/A'}`,
        html: this.getPaymentConfirmationTemplate(tenant, payment, invoice),
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Payment confirmation email sent to ${tenant.contactEmail}`);
    } catch (error) {
      this.logger.error(`Error sending payment confirmation email to ${tenant.contactEmail}:`, error);
      throw error;
    }
  }

  /**
   * Enviar email de suspensiÛn de tenant
   */
  async sendTenantSuspendedEmail(tenant: any, invoice: any): Promise<void> {
    try {
      const mailOptions = {
        from: `${this.configService.get('SMTP_FROM_NAME')} <${this.configService.get('SMTP_FROM')}>`,
        to: tenant.contactEmail,
        subject: `URGENTE: Cuenta Suspendida por Falta de Pago - ${tenant.name}`,
        html: this.getTenantSuspendedTemplate(tenant, invoice),
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Tenant suspended email sent to ${tenant.contactEmail}`);
    } catch (error) {
      this.logger.error(`Error sending tenant suspended email to ${tenant.contactEmail}:`, error);
      throw error;
    }
  }

  /**
   * Enviar email de activaciÛn de tenant
   */
  async sendTenantActivatedEmail(tenant: any, payment: any): Promise<void> {
    try {
      const mailOptions = {
        from: `${this.configService.get('SMTP_FROM_NAME')} <${this.configService.get('SMTP_FROM')}>`,
        to: tenant.contactEmail,
        subject: `Cuenta Reactivada - ${tenant.name}`,
        html: this.getTenantActivatedTemplate(tenant, payment),
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Tenant activated email sent to ${tenant.contactEmail}`);
    } catch (error) {
      this.logger.error(`Error sending tenant activated email to ${tenant.contactEmail}:`, error);
      throw error;
    }
  }

  /**
   * Template de recordatorio de pago
   */
  private getPaymentReminderTemplate(tenant: any, invoice: any, daysBeforeDue: number): string {
    const dueDate = new Date(invoice.dueDate).toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const amount = this.formatCurrency(invoice.total);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .alert-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; }
          .invoice-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #f59e0b; color: white; text-decoration: none; border-radius: 5px; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>‚è∞ Recordatorio de Pago</h1>
            <p>Faltan ${daysBeforeDue} dÌas para el vencimiento</p>
          </div>
          <div class="content">
            <p>Estimado/a ${tenant.contactName},</p>
            <p>Le recordamos que tiene un pago pendiente para mantener activo su servicio de <strong>${tenant.name}</strong>.</p>
            
            <div class="alert-box">
              <h3 style="margin-top: 0;">üìã Detalles de la Factura</h3>
              <p><strong>N˙mero de Factura:</strong> ${invoice.invoiceNumber}</p>
              <p><strong>Monto Total:</strong> ${amount}</p>
              <p><strong>Fecha de Vencimiento:</strong> ${dueDate}</p>
              <p><strong>DÌas Restantes:</strong> ${daysBeforeDue} dÌas</p>
            </div>

            <p>Para evitar la suspensiÛn de su servicio, por favor realice el pago antes de la fecha de vencimiento.</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="#" class="button">Ver Factura</a>
            </div>

            <p><strong>MÈtodos de Pago:</strong></p>
            <ul>
              <li>Transferencia bancaria</li>
              <li>PSE</li>
              <li>Tarjeta de crÈdito/dÈbito</li>
            </ul>

            <p>Si ya realizÛ el pago, por favor ignore este mensaje.</p>
          </div>
          <div class="footer">
            <p>Sistema de Consentimientos Digitales - Innova Systems</p>
            <p>Este es un correo autom·tico, por favor no responder.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Template de factura generada
   */
  private getInvoiceEmailTemplate(tenant: any, invoice: any): string {
    const dueDate = new Date(invoice.dueDate).toLocaleDateString('es-CO');
    const amount = this.formatCurrency(invoice.total);
    const apiUrl = this.configService.get('API_URL') || 'http://localhost:3000';
    // Generar token para acceso p˙blico al PDF
    const token = Buffer.from(`${invoice.id}-${invoice.tenantId}`).toString('base64');
    const pdfUrl = `${apiUrl}/api/invoices/${invoice.id}/pdf/${token}`;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .invoice-box { background: #eff6ff; border: 2px solid #3b82f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>&#128196; Nueva Factura</h1>
            <p>Factura ${invoice.invoiceNumber}</p>
          </div>
          <div class="content">
            <p>Estimado/a ${tenant.contactName},</p>
            <p>Se ha generado una nueva factura para su servicio de <strong>${tenant.name}</strong>.</p>
            
            <div class="invoice-box">
              <h3 style="margin-top: 0; color: #3b82f6;">Resumen de Factura</h3>
              <p><strong>N˙mero:</strong> ${invoice.invoiceNumber}</p>
              <p><strong>Monto:</strong> ${amount}</p>
              <p><strong>Fecha de Vencimiento:</strong> ${dueDate}</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${pdfUrl}" class="button">Descargar Factura PDF</a>
            </div>

            <p>Por favor realice el pago antes de la fecha de vencimiento para evitar interrupciones en el servicio.</p>
          </div>
          <div class="footer">
            <p>Sistema de Consentimientos Digitales - Innova Systems</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Template de confirmaciÛn de pago
   */
  private getPaymentConfirmationTemplate(tenant: any, payment: any, invoice: any): string {
    const amount = this.formatCurrency(payment.amount);
    const paymentDate = new Date(payment.paymentDate).toLocaleDateString('es-CO');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .success-box { background: #d1fae5; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>? Pago Recibido</h1>
            <p>ConfirmaciÛn de Pago</p>
          </div>
          <div class="content">
            <p>Estimado/a ${tenant.contactName},</p>
            <p>Hemos recibido su pago exitosamente. ¬°Gracias por su confianza!</p>
            
            <div class="success-box">
              <h3 style="margin-top: 0;">üí∞ Detalles del Pago</h3>
              <p><strong>Monto Pagado:</strong> ${amount}</p>
              <p><strong>Fecha de Pago:</strong> ${paymentDate}</p>
              ${invoice ? `<p><strong>Factura:</strong> ${invoice.invoiceNumber}</p>` : ''}
              <p><strong>MÈtodo de Pago:</strong> ${this.getPaymentMethodLabel(payment.paymentMethod)}</p>
            </div>

            <p>Su servicio continuar· activo sin interrupciones.</p>
            <p>Puede descargar su recibo de pago desde el panel de administraciÛn.</p>
          </div>
          <div class="footer">
            <p>Sistema de Consentimientos Digitales - Innova Systems</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Template de tenant suspendido
   */
  private getTenantSuspendedTemplate(tenant: any, invoice: any): string {
    const amount = this.formatCurrency(invoice.total);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .alert-box { background: #fee2e2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #ef4444; color: white; text-decoration: none; border-radius: 5px; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>üö´ Cuenta Suspendida</h1>
            <p>Acci√≥n Requerida</p>
          </div>
          <div class="content">
            <p>Estimado/a ${tenant.contactName},</p>
            <p>Lamentamos informarle que su cuenta de <strong>${tenant.name}</strong> ha sido suspendida por falta de pago.</p>
            
            <div class="alert-box">
              <h3 style="margin-top: 0;">‚ö†Ô∏è Factura Vencida</h3>
              <p><strong>N˙mero de Factura:</strong> ${invoice.invoiceNumber}</p>
              <p><strong>Monto Adeudado:</strong> ${amount}</p>
              <p><strong>Estado:</strong> Vencida</p>
            </div>

            <p><strong>¬øQu√© significa esto?</strong></p>
            <ul>
              <li>No podr√° acceder al sistema</li>
              <li>No podr√° crear nuevos consentimientos</li>
              <li>Sus datos est√°n seguros y no se perder√°n</li>
            </ul>

            <p><strong>¬øC√≥mo reactivar su cuenta?</strong></p>
            <p>Realice el pago de la factura pendiente y su cuenta ser√° reactivada autom√°ticamente.</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="#" class="button">Realizar Pago Ahora</a>
            </div>

            <p>Si tiene alguna pregunta, por favor cont√°ctenos.</p>
          </div>
          <div class="footer">
            <p>Sistema de Consentimientos Digitales - Innova Systems</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Template de tenant activado
   */
  private getTenantActivatedTemplate(tenant: any, payment: any): string {
    const amount = this.formatCurrency(payment.amount);
    const newExpiresAt = tenant.planExpiresAt 
      ? new Date(tenant.planExpiresAt).toLocaleDateString('es-CO')
      : 'N/A';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .success-box { background: #d1fae5; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>?? Cuenta Reactivada</h1>
            <p>¬°Bienvenido de nuevo!</p>
          </div>
          <div class="content">
            <p>Estimado/a ${tenant.contactName},</p>
            <p>¬°Excelentes noticias! Su cuenta de <strong>${tenant.name}</strong> ha sido reactivada exitosamente.</p>
            
            <div class="success-box">
              <h3 style="margin-top: 0;">? Detalles de ReactivaciÛn</h3>
              <p><strong>Pago Recibido:</strong> ${amount}</p>
              <p><strong>Estado:</strong> Activo</p>
              <p><strong>Pr√≥xima Renovaci√≥n:</strong> ${newExpiresAt}</p>
            </div>

            <p><strong>Ya puede:</strong></p>
            <ul>
              <li>Acceder al sistema normalmente</li>
              <li>Crear y gestionar consentimientos</li>
              <li>Utilizar todas las funcionalidades de su plan</li>
            </ul>

            <div style="text-align: center; margin: 30px 0;">
              <a href="#" class="button">Acceder al Sistema</a>
            </div>

            <p>Gracias por su confianza. Estamos aqu√≠ para ayudarle.</p>
          </div>
          <div class="footer">
            <p>Sistema de Consentimientos Digitales - Innova Systems</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  }

  private getPaymentMethodLabel(method: string): string {
    const labels: Record<string, string> = {
      transfer: 'Transferencia Bancaria',
      card: 'Tarjeta de Cr√©dito/D√©bito',
      pse: 'PSE',
      cash: 'Efectivo',
      other: 'Otro',
    };
    return labels[method] || method;
  }


  /**
   * Enviar solicitud de cambio de plan al Super Admin
   */
  async sendPlanChangeRequest(data: {
    superAdminEmail: string;
    tenantName: string;
    tenantEmail: string;
    currentPlan: string;
    requestedPlan: string;
    billingCycle: string;
    price: number;
    tenantId: string;
  }): Promise<void> {
    try {
      const fromEmail = this.configService.get('SMTP_FROM') || this.configService.get('SMTP_USER');
      
      const mailOptions = {
        from: fromEmail,
        to: data.superAdminEmail,
        subject: `Solicitud de Cambio de Plan - ${data.tenantName}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none; }
              .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea; border-radius: 5px; }
              .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
              .info-row:last-child { border-bottom: none; }
              .label { font-weight: bold; color: #555; }
              .value { color: #333; }
              .highlight { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107; }
              .price { font-size: 24px; font-weight: bold; color: #667eea; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; background: #f9f9f9; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Solicitud de Cambio de Plan</h1>
              <p>Un cliente ha solicitado cambiar su plan de suscripcion</p>
            </div>
            <div class="content">
              <h2>Informacion del Cliente</h2>
              <div class="info-box">
                <div class="info-row"><span class="label">Nombre del Tenant:</span><span class="value">${data.tenantName}</span></div>
                <div class="info-row"><span class="label">Email de Contacto:</span><span class="value">${data.tenantEmail}</span></div>
                <div class="info-row"><span class="label">ID del Tenant:</span><span class="value">${data.tenantId}</span></div>
                <div class="info-row"><span class="label">Plan Actual:</span><span class="value">${data.currentPlan}</span></div>
              </div>
              <div class="highlight">
                <h3 style="margin-top: 0;">Plan Solicitado</h3>
                <div class="info-row"><span class="label">Nuevo Plan:</span><span class="value"><strong>${data.requestedPlan}</strong></span></div>
                <div class="info-row"><span class="label">Ciclo de Facturacion:</span><span class="value">${data.billingCycle}</span></div>
                <div class="info-row"><span class="label">Precio:</span><span class="price">${this.formatCurrency(data.price)}</span></div>
              </div>
              <h3>Proximos Pasos</h3>
              <ol>
                <li>Revisar la solicitud del cliente</li>
                <li>Verificar la informacion del tenant</li>
                <li>Actualizar el plan desde el panel de administracion</li>
                <li>Confirmar el cambio con el cliente</li>
              </ol>
            </div>
            <div class="footer">
              <p>Este es un correo automatico generado por el sistema de gestion de consentimientos.</p>
              <p>Por favor, no responder a este correo.</p>
            </div>
          </body>
          </html>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Solicitud de cambio de plan enviada a ${data.superAdminEmail} para el tenant ${data.tenantName}`);
    } catch (error) {
      this.logger.error(`Error al enviar solicitud de cambio de plan: ${error.message}`);
      throw error;
    }
  }
}