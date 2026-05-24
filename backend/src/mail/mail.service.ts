import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as path from 'path';
import { Consent } from '../consents/entities/consent.entity';
import { User } from '../users/entities/user.entity';
import { StorageService } from '../common/services/storage.service';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  // Branding footer para todos los correos
  private readonly BRANDING_FOOTER = `
    <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 2px solid #667eea; margin-top: 20px;">
      <div style="font-size: 16px; font-weight: 600; color: #667eea; margin-bottom: 8px;">
        Archivo en Línea
      </div>
      <div style="font-size: 14px; color: #6c757d; margin-bottom: 5px;">
        Sistema de Consentimientos Digitales
      </div>
      <div style="font-size: 13px; color: #6c757d;">
        Powered by <strong style="color: #667eea;">Innova Systems</strong> Soluciones Informáticas
      </div>
      <div style="font-size: 11px; margin-top: 15px; color: #adb5bd;">
        Este es un correo automático, por favor no responder a este mensaje.
      </div>
    </div>
  `;

  constructor(
    private configService: ConfigService,
    private storageService: StorageService,
  ) {
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
        subject: 'Bienvenido al Sistema de Consentimientos',
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
   * Enviar correo de restablecimiento de contrasena
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
        subject: 'Restablecimiento de Contrasena - Sistema de Consentimientos',
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
        // Si la URL es de S3 (empieza con http), descargar el archivo
        if (consent.pdfUrl.startsWith('http')) {
          this.logger.log(`Descargando PDF desde S3: ${consent.pdfUrl}`);
          const pdfBuffer = await this.storageService.downloadFile(consent.pdfUrl);
          attachments.push({
            filename: `consentimientos-${consent.clientId}.pdf`,
            content: pdfBuffer,
          });
        } else {
          // Si es una ruta local, usar el path
          const pdfPath = path.join(process.cwd(), consent.pdfUrl);
          attachments.push({
            filename: `consentimientos-${consent.clientId}.pdf`,
            path: pdfPath,
          });
        }
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
   * Enviar correo con consentimiento de Historia Clínica
   */
  async sendMedicalRecordConsentEmail(data: {
    to: string;
    clientName: string;
    consentNumber: string;
    pdfUrl: string;
    companyName: string;
  }): Promise<void> {
    try {
      const attachments = [];

      // Descargar PDF desde S3
      if (data.pdfUrl && data.pdfUrl.startsWith('http')) {
        this.logger.log(`Descargando PDF desde S3: ${data.pdfUrl}`);
        const pdfBuffer = await this.storageService.downloadFile(data.pdfUrl);
        attachments.push({
          filename: `${data.consentNumber}.pdf`,
          content: pdfBuffer,
        });
      }

      const mailOptions = {
        from: `${this.configService.get('SMTP_FROM_NAME')} <${this.configService.get('SMTP_FROM')}>`,
        to: data.to,
        subject: `Consentimiento Informado - ${data.companyName}`,
        html: this.getMedicalRecordConsentEmailTemplate(data),
        attachments,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Medical record consent email sent to ${data.to}`);
    } catch (error) {
      this.logger.error(`Error sending medical record consent email to ${data.to}:`, error);
      throw error;
    }
  }

  /**
   * Enviar correo con Historia Clínica completa
   */
  async sendMedicalRecordEmail(data: {
    to: string;
    clientName: string;
    recordNumber: string;
    pdfUrl: string;
    companyName: string;
  }): Promise<void> {
    try {
      const attachments = [];

      // Descargar PDF desde S3
      if (data.pdfUrl && data.pdfUrl.startsWith('http')) {
        this.logger.log(`Descargando PDF de HC desde S3: ${data.pdfUrl}`);
        const pdfBuffer = await this.storageService.downloadFile(data.pdfUrl);
        attachments.push({
          filename: `historia-clinica-${data.recordNumber}.pdf`,
          content: pdfBuffer,
        });
      }

      const mailOptions = {
        from: `${this.configService.get('SMTP_FROM_NAME')} <${this.configService.get('SMTP_FROM')}>`,
        to: data.to,
        subject: `Historia Clínica ${data.recordNumber} - ${data.companyName}`,
        html: this.getMedicalRecordEmailTemplate(data),
        attachments,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Medical record email sent to ${data.to}`);
    } catch (error) {
      this.logger.error(`Error sending medical record email to ${data.to}:`, error);
      throw error;
    }
  }

  private getMedicalRecordEmailTemplate(data: {
    clientName: string;
    recordNumber: string;
    companyName: string;
  }): string {
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
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .content {
            padding: 30px;
          }
          .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #6c757d;
          }
          .info-box {
            background-color: #f0fdf4;
            border-left: 4px solid #10b981;
            padding: 15px;
            margin: 20px 0;
          }
          h1 {
            margin: 0;
            font-size: 24px;
          }
          h2 {
            color: #10b981;
            font-size: 18px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Historia Clínica</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">${data.companyName}</p>
          </div>
          <div class="content">
            <h2>Estimado/a ${data.clientName},</h2>
            <p>Adjunto encontrará su Historia Clínica completa con toda la información recopilada durante su atención médica.</p>
            
            <div class="info-box">
              <strong>Número de Historia Clínica:</strong> ${data.recordNumber}<br>
              <strong>Fecha de envío:</strong> ${new Date().toLocaleDateString('es-CO', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>

            <p><strong>Contenido del documento:</strong></p>
            <ul>
              <li>Información general del paciente</li>
              <li>Anamnesis (motivo de consulta, antecedentes)</li>
              <li>Examen físico y signos vitales</li>
              <li>Diagnósticos</li>
              <li>Evoluciones y notas médicas</li>
            </ul>

            <p><strong>Importante:</strong></p>
            <ul>
              <li>Este documento es confidencial y de uso exclusivo del paciente</li>
              <li>Conserve este documento para futuras consultas médicas</li>
              <li>Si tiene alguna pregunta, no dude en contactarnos</li>
            </ul>

            <p>Gracias por confiar en nosotros para su atención médica.</p>
          </div>
          <div class="footer">
            <p><strong>${data.companyName}</strong></p>
            <p>Este es un correo automático, por favor no responder.</p>
            <p style="margin-top: 10px; font-size: 11px;">
              © ${new Date().getFullYear()} ${data.companyName}. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getMedicalRecordConsentEmailTemplate(data: {
    clientName: string;
    consentNumber: string;
    companyName: string;
  }): string {
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
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .content {
            padding: 30px;
          }
          .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #6c757d;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #3B82F6;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Consentimiento Informado</h1>
          </div>
          <div class="content">
            <p>Estimado/a <strong>${data.clientName}</strong>,</p>
            
            <p>Adjunto encontrará su consentimiento informado generado en nuestra institución.</p>
            
            <p><strong>Número de Consentimiento:</strong> ${data.consentNumber}</p>
            
            <p>Este documento ha sido generado electrónicamente y contiene su firma digital.</p>
            
            <p>Por favor, conserve este documento para sus registros.</p>
            
            <p>Si tiene alguna pregunta o necesita asistencia, no dude en contactarnos.</p>
            
            <p>Atentamente,<br><strong>${data.companyName}</strong></p>
          </div>
          <div class="footer">
            <p>Este es un correo automático, por favor no responda a este mensaje.</p>
            <p>&copy; ${new Date().getFullYear()} ${data.companyName}. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;
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
            <h1>Bienvenido!</h1>
            <p>Tu cuenta ha sido creada exitosamente</p>
          </div>
          
          <div class="content">
            <p class="welcome-message">Hola ${user.name},</p>
            
            <p>Es un placer darte la bienvenida al <strong>Sistema de Consentimientos Digitales</strong>, una solucion moderna y eficiente para la gestion de consentimientos informados.</p>
            
            <div class="info-box">
              <h3>Informacion de tu Cuenta</h3>
              <div class="info-item">
                <strong>Organizacion:</strong> ${tenantName}
              </div>
              <div class="info-item">
                <strong>Rol asignado:</strong> ${roleName}
              </div>
              <div class="info-item">
                <strong>Email:</strong> ${user.email}
              </div>
            </div>

            <div class="credentials-box">
              <h3>Credenciales de Acceso</h3>
              <div class="credential-item">
                <strong>USUARIO</strong>
                <div class="credential-value">${user.email}</div>
              </div>
              <div class="credential-item">
                <strong>CONTRASENA TEMPORAL</strong>
                <div class="credential-value">${temporaryPassword}</div>
              </div>
            </div>

            <div class="warning">
              <strong>Importante:</strong> Por seguridad, te recomendamos cambiar tu contrasena despues del primer inicio de sesion.
            </div>

            <div style="text-align: center;">
              <a href="${loginUrl}" class="button">Iniciar Sesion Ahora</a>
            </div>

            <div class="info-box">
              <h3>Enlace de Acceso</h3>
              <div class="info-item">
                <a href="${loginUrl}" style="color: #667eea; word-break: break-all;">${loginUrl}</a>
              </div>
            </div>

            <div class="features">
              <div class="feature">
                <div class="feature-icon">📝</div>
                <div class="feature-text">Gestion de Consentimientos</div>
              </div>
              <div class="feature">
                <div class="feature-icon">✍️</div>
                <div class="feature-text">Firma Digital</div>
              </div>
              <div class="feature">
                <div class="feature-icon">📧</div>
                <div class="feature-text">Envio Automatico</div>
              </div>
              <div class="feature">
                <div class="feature-icon">🔒</div>
                <div class="feature-text">Seguro y Confiable</div>
              </div>
            </div>

            <p style="margin-top: 30px;">Si tienes alguna pregunta o necesitas ayuda, no dudes en contactar con tu administrador.</p>
            
            <p>¡Bienvenido a bordo!</p>
          </div>
          
          ${this.BRANDING_FOOTER}
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
              <h3>Detalles del Servicio</h3>
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
              <div class="document-icon">📄</div>
              <h3>Documento Adjunto</h3>
              <p style="margin: 0; opacity: 0.9;">Consentimientos Informados Completos</p>
              <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.8;">
                Incluye: Procedimiento, Tratamiento de Datos e Imágenes
              </p>
            </div>

            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <strong style="color: #92400e;">Importante:</strong>
              <p style="margin: 10px 0 0 0; color: #92400e;">
                Guarde estos documentos para sus registros. Son documentos legales que certifican su consentimiento informado.
              </p>
            </div>

            <p>Si tiene alguna pregunta o necesita informacion adicional, no dude en contactarnos.</p>
            
            <p style="margin-top: 30px;">Saludos cordiales,</p>
            <p style="font-weight: 600; color: #10b981;">${consent.branch.name}</p>
          </div>
          
          ${this.BRANDING_FOOTER}
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Template de correo de restablecimiento de contrasena
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
            <h1>Restablecimiento de Contrasena</h1>
            <p>Solicitud de cambio de contrasena</p>
          </div>
          
          <div class="content">
            <p class="greeting">Hola ${user.name},</p>
            
            <p>Hemos recibido una solicitud para restablecer la contrasena de tu cuenta en <strong>${tenantName}</strong>.</p>

            <div class="security-icon">🔒</div>

            <p>Si solicitaste este cambio, haz clic en el boton de abajo para crear una nueva contrasena:</p>

            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Restablecer Contrasena</a>
            </div>

            <div class="info-box">
              <p style="margin: 0;"><strong>Este enlace expirara en 1 hora</strong></p>
              <p style="margin: 10px 0 0 0; font-size: 14px;">Por seguridad, el enlace solo puede usarse una vez.</p>
            </div>

            <div class="warning">
              <strong>No solicitaste este cambio?</strong>
              <p style="margin: 10px 0 0 0;">
                Si no solicitaste restablecer tu contrasena, puedes ignorar este correo de forma segura. 
                Tu contrasena actual permanecera sin cambios.
              </p>
            </div>

            <p style="margin-top: 30px; font-size: 14px; color: #6c757d;">
              Si el boton no funciona, copia y pega este enlace en tu navegador:
            </p>
            <p style="word-break: break-all; font-size: 12px; color: #6c757d;">
              ${resetUrl}
            </p>

            <p style="margin-top: 30px;">Si tienes alguna pregunta o necesitas ayuda, no dudes en contactar con tu administrador.</p>
          </div>
          
          ${this.BRANDING_FOOTER}
        </div>
      </body>
      </html>
    `;
  }
  /**
   * Enviar email de recordatorio de pago
   */
  async sendPaymentReminderEmail(tenant: any, invoice: any, daysBeforeDue: number): Promise<void> {
    try {
      const mailOptions = {
        from: `${this.configService.get('SMTP_FROM_NAME')} <${this.configService.get('SMTP_FROM')}>`,
        to: tenant.contactEmail,
        subject: `Recordatorio: Pago pendiente - ${daysBeforeDue} días para el vencimiento`,
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
   * Enviar email de confirmación de pago
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
   * Enviar email de suspensión de tenant
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
   * Enviar email de activación de tenant
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
            <h1>⏰ Recordatorio de Pago</h1>
            <p>Faltan ${daysBeforeDue} días para el vencimiento</p>
          </div>
          <div class="content">
            <p>Estimado/a ${tenant.contactName},</p>
            <p>Le recordamos que tiene un pago pendiente para mantener activo su servicio de <strong>${tenant.name}</strong>.</p>
            
            <div class="alert-box">
              <h3 style="margin-top: 0;">📋 Detalles de la Factura</h3>
              <p><strong>Número de Factura:</strong> ${invoice.invoiceNumber}</p>
              <p><strong>Monto Total:</strong> ${amount}</p>
              <p><strong>Fecha de Vencimiento:</strong> ${dueDate}</p>
              <p><strong>Días Restantes:</strong> ${daysBeforeDue} días</p>
            </div>

            <p>Para evitar la suspensión de su servicio, por favor realice el pago antes de la fecha de vencimiento.</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="#" class="button">Ver Factura</a>
            </div>

            <p><strong>Métodos de Pago:</strong></p>
            <ul>
              <li>Transferencia bancaria</li>
              <li>PSE</li>
              <li>Tarjeta de crédito/débito</li>
            </ul>

            <p>Si ya realizó el pago, por favor ignore este mensaje.</p>
          </div>
          ${this.BRANDING_FOOTER}
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
    // Generar token para acceso público al PDF
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
              <p><strong>Número:</strong> ${invoice.invoiceNumber}</p>
              <p><strong>Monto:</strong> ${amount}</p>
              <p><strong>Fecha de Vencimiento:</strong> ${dueDate}</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${pdfUrl}" class="button">Descargar Factura PDF</a>
            </div>

            <p>Por favor realice el pago antes de la fecha de vencimiento para evitar interrupciones en el servicio.</p>
          </div>
          ${this.BRANDING_FOOTER}
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Template de confirmacion de pago
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
            <h1>✅ Pago Recibido</h1>
            <p>Confirmación de Pago</p>
          </div>
          <div class="content">
            <p>Estimado/a ${tenant.contactName},</p>
            <p>Hemos recibido su pago exitosamente. ¡Gracias por su confianza!</p>
            
            <div class="success-box">
              <h3 style="margin-top: 0;">💰 Detalles del Pago</h3>
              <p><strong>Monto Pagado:</strong> ${amount}</p>
              <p><strong>Fecha de Pago:</strong> ${paymentDate}</p>
              ${invoice ? `<p><strong>Factura:</strong> ${invoice.invoiceNumber}</p>` : ''}
              <p><strong>Método de Pago:</strong> ${this.getPaymentMethodLabel(payment.paymentMethod)}</p>
            </div>

            <p>Su servicio continuará activo sin interrupciones.</p>
            <p>Puede descargar su recibo de pago desde el panel de administración.</p>
          </div>
          ${this.BRANDING_FOOTER}
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
            <h1>🚫 Cuenta Suspendida</h1>
            <p>Acción Requerida</p>
          </div>
          <div class="content">
            <p>Estimado/a ${tenant.contactName},</p>
            <p>Lamentamos informarle que su cuenta de <strong>${tenant.name}</strong> ha sido suspendida por falta de pago.</p>
            
            <div class="alert-box">
              <h3 style="margin-top: 0;">⚠️ Factura Vencida</h3>
              <p><strong>Número de Factura:</strong> ${invoice.invoiceNumber}</p>
              <p><strong>Monto Adeudado:</strong> ${amount}</p>
              <p><strong>Estado:</strong> Vencida</p>
            </div>

            <p><strong>¿Qué significa esto?</strong></p>
            <ul>
              <li>No podrá acceder al sistema</li>
              <li>No podrá crear nuevos consentimientos</li>
              <li>Sus datos están seguros y no se perderán</li>
            </ul>

            <p><strong>¿Cómo reactivar su cuenta?</strong></p>
            <p>Realice el pago de la factura pendiente y su cuenta será reactivada automáticamente.</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="#" class="button">Realizar Pago Ahora</a>
            </div>

            <p>Si tiene alguna pregunta, por favor contáctenos.</p>
          </div>
          ${this.BRANDING_FOOTER}
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
            <h1>✅ Cuenta Reactivada</h1>
            <p>¡Bienvenido de nuevo!</p>
          </div>
          <div class="content">
            <p>Estimado/a ${tenant.contactName},</p>
            <p>¡Excelentes noticias! Su cuenta de <strong>${tenant.name}</strong> ha sido reactivada exitosamente.</p>
            
            <div class="success-box">
              <h3 style="margin-top: 0;">✅ Detalles de Reactivación</h3>
              <p><strong>Pago Recibido:</strong> ${amount}</p>
              <p><strong>Estado:</strong> Activo</p>
              <p><strong>Próxima Renovación:</strong> ${newExpiresAt}</p>
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

            <p>Gracias por su confianza. Estamos aquí para ayudarle.</p>
          </div>
          ${this.BRANDING_FOOTER}
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
      card: 'Tarjeta de Crédito/Débito',
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
              <p>Un cliente ha solicitado cambiar su plan de suscripción</p>
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
                <div class="info-row"><span class="label">Ciclo de Facturación:</span><span class="value">${data.billingCycle}</span></div>
                <div class="info-row"><span class="label">Precio:</span><span class="price">${this.formatCurrency(data.price)}</span></div>
              </div>
              <h3>Próximos Pasos</h3>
              <ol>
                <li>Revisar la solicitud del cliente</li>
                <li>Verificar la informacion del tenant</li>
                <li>Actualizar el plan desde el panel de administracion</li>
                <li>Confirmar el cambio con el cliente</li>
              </ol>
            </div>
            ${this.BRANDING_FOOTER}
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

  /**
   * Enviar notificación al Super Admin sobre nueva cuenta creada
   */
  async sendNewAccountNotification(tenant: any, adminUser: any): Promise<void> {
    try {
      // Obtener email del Super Admin desde settings o usar uno por defecto
      const superAdminEmail = this.configService.get('SUPER_ADMIN_EMAIL') || 'admin@archivoenlinea.com';
      
      const baseDomain = this.configService.get('BASE_DOMAIN');
      const tenantUrl = baseDomain === 'localhost' 
        ? `http://${tenant.slug}.localhost:5173`
        : `https://${tenant.slug}.${baseDomain}`;

      const mailOptions = {
        from: `${this.configService.get('SMTP_FROM_NAME')} <${this.configService.get('SMTP_FROM')}>`,
        to: superAdminEmail,
        subject: 'Nueva Cuenta Creada - Archivo en Linea',
        html: this.getNewAccountNotificationTemplate(tenant, adminUser, tenantUrl),
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`New account notification sent to Super Admin: ${superAdminEmail}`);
    } catch (error) {
      this.logger.error(`Error sending new account notification:`, error);
      // No lanzar error para no bloquear la creación de la cuenta
    }
  }

  /**
   * Enviar email de trial expirado al tenant
   */
  async sendTrialExpiredEmail(tenant: any): Promise<void> {
    try {
      const baseDomain = this.configService.get('BASE_DOMAIN');
      const tenantUrl = baseDomain === 'localhost' 
        ? `http://${tenant.slug}.localhost:5173`
        : `https://${tenant.slug}.${baseDomain}`;

      const mailOptions = {
        from: `${this.configService.get('SMTP_FROM_NAME')} <${this.configService.get('SMTP_FROM')}>`,
        to: tenant.contactEmail,
        subject: 'Periodo de Prueba Expirado - Archivo en Linea',
        html: this.getTrialExpiredTemplate(tenant, tenantUrl),
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Trial expired email sent to ${tenant.contactEmail}`);
    } catch (error) {
      this.logger.error(`Error sending trial expired email to ${tenant.contactEmail}:`, error);
      throw error;
    }
  }

  /**
   * Enviar notificación al Super Admin sobre trial expirado
   */
  async sendTrialExpiredNotificationToAdmin(tenant: any): Promise<void> {
    try {
      const superAdminEmail = this.configService.get('SUPER_ADMIN_EMAIL') || 'admin@archivoenlinea.com';
      
      const daysExpired = tenant.trialEndsAt 
        ? Math.floor((new Date().getTime() - new Date(tenant.trialEndsAt).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      const mailOptions = {
        from: `${this.configService.get('SMTP_FROM_NAME')} <${this.configService.get('SMTP_FROM')}>`,
        to: superAdminEmail,
        subject: `Trial Expirado - ${tenant.name} Suspendido`,
        html: this.getTrialExpiredAdminNotificationTemplate(tenant, daysExpired),
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Trial expired notification sent to Super Admin: ${superAdminEmail}`);
    } catch (error) {
      this.logger.error(`Error sending trial expired notification to admin:`, error);
      // No lanzar error para no bloquear la suspensión
    }
  }

  /**
   * Template de notificación de nueva cuenta para Super Admin
   */
  private getNewAccountNotificationTemplate(tenant: any, adminUser: any, tenantUrl: string): string {
    const planNames = {
      free: 'Gratuito (7 dias)',
      basic: 'Basico',
      professional: 'Emprendedor',
      enterprise: 'Plus',
      custom: 'Empresarial',
    };

    const planName = planNames[tenant.plan] || tenant.plan;
    const trialEndsAt = tenant.trialEndsAt ? new Date(tenant.trialEndsAt).toLocaleDateString('es-ES') : 'N/A';

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
          .header .emoji {
            font-size: 48px;
            margin-bottom: 10px;
          }
          .content {
            padding: 40px 30px;
          }
          .info-box {
            background-color: #f8f9fa;
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
            min-width: 150px;
          }
          .plan-badge {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 14px;
            margin: 10px 0;
          }
          .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="emoji">🎉</div>
            <h1>Nueva Cuenta Creada</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">
              Un nuevo cliente se ha registrado en Archivo en Linea
            </p>
          </div>

          <div class="content">
            <p style="font-size: 16px; color: #374151;">
              Hola Super Admin!
            </p>
            <p style="font-size: 16px; color: #374151;">
              Te informamos que se ha creado una nueva cuenta en la plataforma desde la landing page.
            </p>

            <div class="info-box">
              <h3>Informacion de la Empresa</h3>
              <div class="info-item">
                <strong>Nombre:</strong> ${tenant.name}
              </div>
              <div class="info-item">
                <strong>Subdominio:</strong> ${tenant.slug}.archivoenlinea.com
              </div>
              <div class="info-item">
                <strong>Contacto:</strong> ${tenant.contactName || 'N/A'}
              </div>
              <div class="info-item">
                <strong>Email:</strong> ${tenant.contactEmail || 'N/A'}
              </div>
              <div class="info-item">
                <strong>Telefono:</strong> ${tenant.contactPhone || 'N/A'}
              </div>
            </div>

            <div class="info-box">
              <h3>Administrador de la Cuenta</h3>
              <div class="info-item">
                <strong>Nombre:</strong> ${adminUser.name}
              </div>
              <div class="info-item">
                <strong>Email:</strong> ${adminUser.email}
              </div>
            </div>

            <div class="info-box">
              <h3>Plan Seleccionado</h3>
              <div class="plan-badge">${planName}</div>
              <div class="info-item">
                <strong>Estado:</strong> ${tenant.status === 'trial' ? 'Periodo de Prueba' : 'Activo'}
              </div>
              ${tenant.trialEndsAt ? `
              <div class="info-item">
                <strong>Trial expira:</strong> ${trialEndsAt}
              </div>
              ` : ''}
            </div>

            <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 0; color: #1e40af; font-size: 14px;">
                <strong>Accion recomendada:</strong> Puedes revisar la cuenta desde el panel de administracion y contactar al cliente si es necesario.
              </p>
            </div>
          </div>

          <div class="footer">
            <p style="margin: 0 0 10px 0;">
              <strong>Archivo en Linea</strong> - Sistema de Gestion de Consentimientos
            </p>
            <p style="margin: 0; font-size: 12px;">
              Este es un correo automatico. No responder a este mensaje.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Template de trial expirado para el tenant
   */
  private getTrialExpiredTemplate(tenant: any, tenantUrl: string): string {
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
          .content {
            padding: 40px 30px;
          }
          .alert-box {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
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
          }
          .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #6b7280;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Periodo de Prueba Expirado</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">
              Tu cuenta ha sido suspendida
            </p>
          </div>

          <div class="content">
            <p>Hola ${tenant.contactName || 'Estimado cliente'},</p>
            
            <p>Te informamos que el periodo de prueba de 7 dias de tu cuenta <strong>${tenant.name}</strong> ha expirado.</p>

            <div class="alert-box">
              <h3 style="margin-top: 0; color: #92400e;">Que significa esto?</h3>
              <ul style="margin: 10px 0; color: #92400e;">
                <li>Tu cuenta ha sido suspendida temporalmente</li>
                <li>No podras acceder al sistema</li>
                <li>Tus datos estan seguros y no se perderan</li>
              </ul>
            </div>

            <h3>Como reactivar tu cuenta?</h3>
            <p>Para continuar usando Archivo en Linea, necesitas seleccionar un plan de pago:</p>
            
            <ul>
              <li><strong>Plan Basico:</strong> Ideal para empezar</li>
              <li><strong>Plan Emprendedor:</strong> Para negocios en crecimiento</li>
              <li><strong>Plan Plus:</strong> Funcionalidades avanzadas</li>
              <li><strong>Plan Empresarial:</strong> Solucion completa</li>
            </ul>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${tenantUrl}/pricing" class="button">Ver Planes y Precios</a>
            </div>

            <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.</p>
            
            <p>Saludos cordiales,<br><strong>Equipo de Archivo en Linea</strong></p>
          </div>

          ${this.BRANDING_FOOTER}
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Template de notificación de trial expirado para Super Admin
   */
  private getTrialExpiredAdminNotificationTemplate(tenant: any, daysExpired: number): string {
    const trialEndsAt = tenant.trialEndsAt ? new Date(tenant.trialEndsAt).toLocaleDateString('es-ES') : 'N/A';

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
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .content {
            padding: 40px 30px;
          }
          .info-box {
            background-color: #fee2e2;
            border-left: 4px solid #ef4444;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .info-item {
            margin: 10px 0;
            padding: 10px;
            background-color: white;
            border-radius: 4px;
          }
          .info-item strong {
            color: #ef4444;
            display: inline-block;
            min-width: 150px;
          }
          .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #6b7280;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Trial Expirado - Cuenta Suspendida</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">
              Notificacion automatica del sistema
            </p>
          </div>

          <div class="content">
            <p>Hola Super Admin,</p>
            
            <p>Te informamos que una cuenta con periodo de prueba ha expirado y ha sido suspendida automaticamente.</p>

            <div class="info-box">
              <h3 style="margin-top: 0; color: #dc2626;">Detalles de la Cuenta</h3>
              <div class="info-item">
                <strong>Nombre:</strong> ${tenant.name}
              </div>
              <div class="info-item">
                <strong>Subdominio:</strong> ${tenant.slug}.archivoenlinea.com
              </div>
              <div class="info-item">
                <strong>Email:</strong> ${tenant.contactEmail || 'N/A'}
              </div>
              <div class="info-item">
                <strong>Telefono:</strong> ${tenant.contactPhone || 'N/A'}
              </div>
              <div class="info-item">
                <strong>Trial expiro:</strong> ${trialEndsAt}
              </div>
              <div class="info-item">
                <strong>Dias vencido:</strong> ${daysExpired} dia(s)
              </div>
              <div class="info-item">
                <strong>Estado actual:</strong> Suspendido
              </div>
            </div>

            <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 0; color: #1e40af; font-size: 14px;">
                <strong>Accion realizada:</strong> Se ha enviado un correo al cliente informandole sobre la suspension y los pasos para reactivar su cuenta.
              </p>
            </div>

            <p>Puedes contactar al cliente si consideras necesario hacer seguimiento comercial.</p>
          </div>

          <div class="footer">
            <p style="margin: 0 0 10px 0;">
              <strong>Archivo en Linea</strong> - Sistema de Gestion de Consentimientos
            </p>
            <p style="margin: 0; font-size: 12px;">
              Este es un correo automatico. No responder a este mensaje.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Enviar alerta cuando el sistema de monitoreo detecta un pago
   */
  async sendPaymentMonitoringAlert(data: {
    invoiceNumber: string;
    tenantName: string;
    amount: number;
    paymentLinkId: string;
    message: string;
  }): Promise<void> {
    try {
      const superAdminEmail = this.configService.get('SUPER_ADMIN_EMAIL') || this.configService.get('SMTP_FROM');

      const mailOptions = {
        from: `${this.configService.get('SMTP_FROM_NAME')} <${this.configService.get('SMTP_FROM')}>`,
        to: superAdminEmail,
        subject: `⚠️ Pago Detectado por Monitoreo - ${data.invoiceNumber}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .container {
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 2 4px rgba(0,0,0,0.1);
                overflow: hidden;
              }
              .header {
                background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                color: white;
                padding: 30px 20px;
                text-align: center;
              }
              .content {
                padding: 30px;
              }
              .alert-box {
                background-color: #fef3c7;
                border-left: 4px solid #f59e0b;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
              }
              .info-item {
                margin: 10px 0;
                padding: 10px;
                background-color: #f9fafb;
                border-radius: 4px;
              }
              .info-item strong {
                color: #d97706;
                display: inline-block;
                min-width: 150px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>⚠️ Pago Detectado por Monitoreo</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Sistema de Respaldo Activado</p>
              </div>

              <div class="content">
                <p>Hola Super Admin,</p>

                <div class="alert-box">
                  <strong>⚠️ IMPORTANTE:</strong> ${data.message}
                </div>

                <p>El sistema de monitoreo automático detectó y procesó un pago que no fue recibido vía webhook de Bold.</p>

                <h3>Detalles del Pago:</h3>
                <div class="info-item">
                  <strong>Factura:</strong> ${data.invoiceNumber}
                </div>
                <div class="info-item">
                  <strong>Tenant:</strong> ${data.tenantName}
                </div>
                <div class="info-item">
                  <strong>Monto:</strong> ${this.formatCurrency(data.amount)}
                </div>
                <div class="info-item">
                  <strong>Bold Payment Link:</strong> ${data.paymentLinkId}
                </div>

                <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 4px; margin: 20px 0;">
                  <p style="margin: 0; color: #1e40af; font-size: 14px;">
                    <strong>Acción Requerida:</strong> Verifica la configuración de webhooks en Bold para evitar que esto vuelva a suceder.
                  </p>
                </div>

                <h3>Próximos Pasos:</h3>
                <ol>
                  <li>Verificar que el webhook esté configurado en Bold Dashboard</li>
                  <li>Confirmar que la URL del webhook sea correcta</li>
                  <li>Revisar logs del servidor para ver si hay intentos de webhook bloqueados</li>
                  <li>Contactar a Bold si el problema persiste</li>
                </ol>
              </div>

              ${this.BRANDING_FOOTER}
            </div>
          </body>
          </html>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Payment monitoring alert sent to ${superAdminEmail}`);
    } catch (error) {
      this.logger.error('Error sending payment monitoring alert:', error);
      throw error;
    }
  }

  /**
   * Enviar alerta de pagos atascados (Reporte Diario Consolidado)
   */
  async sendStuckPaymentsAlert(pendingLinks: Array<{
    invoiceNumber: string;
    tenantName: string;
    amount: number;
    minutesSinceCreation: number;
    boldPaymentLink: string;
  }>): Promise<void> {
    try {
      const superAdminEmail = this.configService.get('SUPER_ADMIN_EMAIL') || this.configService.get('SMTP_FROM');

      // Agrupar por tenant
      const byTenant = new Map<string, typeof pendingLinks>();
      for (const link of pendingLinks) {
        if (!byTenant.has(link.tenantName)) {
          byTenant.set(link.tenantName, []);
        }
        byTenant.get(link.tenantName).push(link);
      }

      // Generar HTML agrupado por tenant
      let tenantsHtml = '';
      for (const [tenantName, links] of byTenant.entries()) {
        const totalAmount = links.reduce((sum, link) => sum + link.amount, 0);
        
        const linksHtml = links.map(link => {
          const hours = Math.floor(link.minutesSinceCreation / 60);
          const minutes = link.minutesSinceCreation % 60;
          const timeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
          
          return `
            <div style="margin: 10px 0; padding: 10px; background-color: #fef2f2; border-radius: 4px;">
              <strong>📄 ${link.invoiceNumber}</strong> - ${this.formatCurrency(link.amount)}<br>
              <span style="color: #666; font-size: 13px;">⏱️ Tiempo: ${timeStr}</span><br>
              <a href="${link.boldPaymentLink}" style="color: #3b82f6; font-size: 13px;">Ver link de pago →</a>
            </div>
          `;
        }).join('');

        tenantsHtml += `
          <div style="margin: 20px 0; padding: 15px; background-color: #f9fafb; border-radius: 6px; border-left: 4px solid #ef4444;">
            <h3 style="margin: 0 0 10px 0; color: #1f2937;">
              🏢 ${tenantName}
              <span style="font-size: 14px; color: #6b7280; font-weight: normal;">
                (${links.length} factura${links.length > 1 ? 's' : ''} - Total: ${this.formatCurrency(totalAmount)})
              </span>
            </h3>
            ${linksHtml}
          </div>
        `;
      }

      const totalAmount = pendingLinks.reduce((sum, link) => sum + link.amount, 0);

      const mailOptions = {
        from: `${this.configService.get('SMTP_FROM_NAME')} <${this.configService.get('SMTP_FROM')}>`,
        to: superAdminEmail,
        subject: `📊 Reporte Diario: ${pendingLinks.length} Pago(s) Pendiente(s) - ${byTenant.size} Tenant(s)`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 700px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f3f4f6;
              }
              .container {
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                overflow: hidden;
              }
              .header {
                background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                color: white;
                padding: 30px 20px;
                text-align: center;
              }
              .content {
                padding: 30px;
              }
              .summary-box {
                background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                border-left: 4px solid #f59e0b;
                padding: 20px;
                margin: 20px 0;
                border-radius: 6px;
              }
              .summary-stats {
                display: flex;
                justify-content: space-around;
                margin-top: 15px;
              }
              .stat {
                text-align: center;
              }
              .stat-value {
                font-size: 24px;
                font-weight: bold;
                color: #d97706;
              }
              .stat-label {
                font-size: 12px;
                color: #78716c;
                text-transform: uppercase;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📊 Reporte Diario de Pagos</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Pagos Pendientes con Link de Bold</p>
                <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.8;">
                  ${new Date().toLocaleDateString('es-CO', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    timeZone: 'America/Bogota'
                  })} - 9:00 AM
                </p>
              </div>

              <div class="content">
                <p>Hola Super Admin,</p>

                <div class="summary-box">
                  <p style="margin: 0 0 10px 0; font-size: 16px;">
                    <strong>📋 Resumen del Día:</strong>
                  </p>
                  <div class="summary-stats">
                    <div class="stat">
                      <div class="stat-value">${pendingLinks.length}</div>
                      <div class="stat-label">Facturas</div>
                    </div>
                    <div class="stat">
                      <div class="stat-value">${byTenant.size}</div>
                      <div class="stat-label">Tenants</div>
                    </div>
                    <div class="stat">
                      <div class="stat-value">${this.formatCurrency(totalAmount)}</div>
                      <div class="stat-label">Total</div>
                    </div>
                  </div>
                </div>

                <p>Se detectaron <strong>${pendingLinks.length} factura(s)</strong> con links de pago de Bold creados hace más de 1 hora pero aún sin procesar.</p>

                <p style="color: #6b7280; font-size: 14px;">
                  <strong>Posibles causas:</strong>
                </p>
                <ul style="color: #6b7280; font-size: 14px;">
                  <li>Los webhooks de Bold no están llegando correctamente</li>
                  <li>Los clientes aún no han completado el pago</li>
                  <li>Problemas técnicos con la pasarela de pago</li>
                </ul>

                <h3 style="color: #1f2937; margin-top: 30px;">📦 Detalle por Tenant:</h3>
                ${tenantsHtml}

                <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 6px; margin: 30px 0;">
                  <p style="margin: 0; color: #1e40af; font-size: 14px;">
                    <strong>💡 Acción Recomendada:</strong> Verifica manualmente el estado de estos pagos en el dashboard de Bold. Si algún pago está completado, el sistema lo procesará automáticamente en la próxima verificación (cada 2 minutos).
                  </p>
                </div>

                <p style="color: #9ca3af; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                  <strong>Nota:</strong> Este es un reporte automático que se envía 1 vez al día a las 9:00 AM (hora Colombia). Solo recibirás este correo si hay pagos pendientes.
                </p>
              </div>

              ${this.BRANDING_FOOTER}
            </div>
          </body>
          </html>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Daily stuck payments report sent to ${superAdminEmail} (${pendingLinks.length} invoices, ${byTenant.size} tenants)`);
    } catch (error) {
      this.logger.error('Error sending stuck payments alert:', error);
      throw error;
    }
  }

  /**
   * Enviar email cuando un pago falla
   */
  async sendPaymentFailedEmail(tenant: any, invoice: any): Promise<void> {
    try {
      const mailOptions = {
        from: `${this.configService.get('SMTP_FROM_NAME')} <${this.configService.get('SMTP_FROM')}>`,
        to: tenant.contactEmail,
        subject: `Pago Rechazado - Factura ${invoice?.invoiceNumber || 'N/A'}`,
        html: this.getPaymentFailedTemplate(tenant, invoice),
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Payment failed email sent to ${tenant.contactEmail}`);
    } catch (error) {
      this.logger.error(`Error sending payment failed email to ${tenant.contactEmail}:`, error);
      throw error;
    }
  }

  /**
   * Template para email de pago fallido
   */
  private getPaymentFailedTemplate(tenant: any, invoice: any): string {
    const tenantSlug = tenant.slug;
    const retryPaymentUrl = `https://${tenantSlug}.archivoenlinea.com/suspended`;
    const invoiceAmount = this.formatCurrency(invoice.total);
    const dueDate = new Date(invoice.dueDate).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pago Rechazado</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                      ⚠️ Pago Rechazado
                    </h1>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                      Hola <strong>${tenant.name}</strong>,
                    </p>
                    
                    <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                      Lamentamos informarte que el pago de tu factura <strong>${invoice.invoiceNumber}</strong> no pudo ser procesado.
                    </p>

                    <!-- Invoice Details -->
                    <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0; background-color: #fef2f2; border: 2px solid #fecaca; border-radius: 8px;">
                      <tr>
                        <td style="padding: 20px;">
                          <table role="presentation" style="width: 100%; border-collapse: collapse;">
                            <tr>
                              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Número de Factura:</td>
                              <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${invoice.invoiceNumber}</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Monto Total:</td>
                              <td style="padding: 8px 0; color: #dc2626; font-size: 18px; font-weight: 700; text-align: right;">${invoiceAmount}</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Fecha de Vencimiento:</td>
                              <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${dueDate}</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Intentos Realizados:</td>
                              <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${invoice.paymentAttemptsCount || 1} de 6</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                      <strong>¿Qué puedes hacer?</strong>
                    </p>

                    <ul style="margin: 0 0 30px 0; padding-left: 20px; color: #374151; font-size: 15px; line-height: 1.8;">
                      <li>Verifica que tu método de pago tenga fondos suficientes</li>
                      <li>Asegúrate de que los datos de tu tarjeta sean correctos</li>
                      <li>Intenta con otro método de pago (PSE, tarjeta de crédito/débito)</li>
                      <li>Contacta a tu banco si el problema persiste</li>
                    </ul>

                    <!-- CTA Button -->
                    <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                      <tr>
                        <td align="center">
                          <a href="${retryPaymentUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(220, 38, 38, 0.3);">
                            🔄 Reintentar Pago Ahora
                          </a>
                        </td>
                      </tr>
                    </table>

                    <div style="margin: 30px 0; padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                      <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                        <strong>⚠️ Importante:</strong> Tienes hasta <strong>6 intentos</strong> para completar el pago. 
                        Si no se recibe el pago antes de la fecha de vencimiento, tu cuenta podría ser suspendida temporalmente.
                      </p>
                    </div>

                    <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                      Si necesitas ayuda o tienes preguntas, no dudes en contactarnos.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                    <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                      Este es un correo automático, por favor no respondas a este mensaje.
                    </p>
                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                      © ${new Date().getFullYear()} ${this.configService.get('SMTP_FROM_NAME')}. Todos los derechos reservados.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  /**
   * ========================================================================
   * NOTIFICACIONES AL SUPER ADMIN
   * ========================================================================
   */

  /**
   * Enviar resumen diario de facturación al super admin
   */
  async sendDailySummaryToAdmin(summary: {
    date: Date;
    invoicesGenerated: number;
    paymentsReceived: number;
    tenantsSuspended: number;
    overdueInvoices: number;
    totalRevenue: number;
    invoicesList: any[];
    paymentsList: any[];
    suspendedList: any[];
  }): Promise<void> {
    const adminEmail = this.configService.get('SUPER_ADMIN_EMAIL');
    if (!adminEmail) {
      this.logger.warn('SUPER_ADMIN_EMAIL no configurado - omitiendo envío de resumen diario');
      return;
    }

    try {
      const mailOptions = {
        from: `${this.configService.get('SMTP_FROM_NAME')} <${this.configService.get('SMTP_FROM')}>`,
        to: adminEmail,
        subject: `📊 Resumen Diario de Facturación - ${summary.date.toLocaleDateString('es-CO')}`,
        html: this.getDailySummaryTemplate(summary),
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Daily summary email sent to admin: ${adminEmail}`);
    } catch (error) {
      this.logger.error(`Error sending daily summary email to admin:`, error);
      throw error;
    }
  }

  /**
   * Enviar alerta de tenant suspendido al super admin
   */
  async sendTenantSuspendedAlertToAdmin(tenant: any, invoice: any): Promise<void> {
    const adminEmail = this.configService.get('SUPER_ADMIN_EMAIL');
    if (!adminEmail) {
      this.logger.warn('SUPER_ADMIN_EMAIL no configurado - omitiendo alerta de suspensión');
      return;
    }

    try {
      const mailOptions = {
        from: `${this.configService.get('SMTP_FROM_NAME')} <${this.configService.get('SMTP_FROM')}>`,
        to: adminEmail,
        subject: `🔴 ALERTA: Tenant Suspendido - ${tenant.name}`,
        html: this.getTenantSuspendedAlertTemplate(tenant, invoice),
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Tenant suspended alert sent to admin: ${adminEmail}`);
    } catch (error) {
      this.logger.error(`Error sending tenant suspended alert to admin:`, error);
      throw error;
    }
  }

  /**
   * Enviar notificación de pago recibido al super admin
   */
  async sendPaymentReceivedAlertToAdmin(tenant: any, payment: any, invoice: any): Promise<void> {
    const adminEmail = this.configService.get('SUPER_ADMIN_EMAIL');
    if (!adminEmail) {
      this.logger.warn('SUPER_ADMIN_EMAIL no configurado - omitiendo notificación de pago');
      return;
    }

    try {
      const mailOptions = {
        from: `${this.configService.get('SMTP_FROM_NAME')} <${this.configService.get('SMTP_FROM')}>`,
        to: adminEmail,
        subject: `💰 Pago Recibido - ${tenant.name} - ${this.formatCurrency(payment?.amount || invoice.total)}`,
        html: this.getPaymentReceivedAlertTemplate(tenant, payment, invoice),
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Payment received alert sent to admin: ${adminEmail}`);
    } catch (error) {
      this.logger.error(`Error sending payment received alert to admin:`, error);
      throw error;
    }
  }

  /**
   * Enviar alerta de error en facturación al super admin
   */
  async sendBillingErrorAlertToAdmin(error: {
    type: string;
    message: string;
    tenantName?: string;
    invoiceNumber?: string;
    details?: any;
  }): Promise<void> {
    const adminEmail = this.configService.get('SUPER_ADMIN_EMAIL');
    if (!adminEmail) {
      this.logger.warn('SUPER_ADMIN_EMAIL no configurado - omitiendo alerta de error');
      return;
    }

    try {
      const mailOptions = {
        from: `${this.configService.get('SMTP_FROM_NAME')} <${this.configService.get('SMTP_FROM')}>`,
        to: adminEmail,
        subject: `⚠️ ERROR en Sistema de Facturación - ${error.type}`,
        html: this.getBillingErrorAlertTemplate(error),
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Billing error alert sent to admin: ${adminEmail}`);
    } catch (error) {
      this.logger.error(`Error sending billing error alert to admin:`, error);
      throw error;
    }
  }

  /**
   * Template de resumen diario para super admin
   */
  private getDailySummaryTemplate(summary: any): string {
    const date = summary.date.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 700px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; }
          .header p { margin: 10px 0 0 0; opacity: 0.9; }
          .content { padding: 30px; }
          .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
          .stat-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #667eea; }
          .stat-value { font-size: 32px; font-weight: bold; color: #667eea; margin: 10px 0; }
          .stat-label { font-size: 14px; color: #6c757d; text-transform: uppercase; }
          .section { margin: 30px 0; }
          .section-title { font-size: 18px; font-weight: 600; color: #667eea; margin-bottom: 15px; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
          .list-item { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 3px solid #667eea; }
          .list-item strong { color: #667eea; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d; }
          .alert { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .success { background: #d1f2eb; border-left: 4px solid #10b981; }
          .danger { background: #f8d7da; border-left: 4px solid #dc3545; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Resumen Diario de Facturación</h1>
            <p>${date}</p>
          </div>
          
          <div class="content">
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-label">Facturas Generadas</div>
                <div class="stat-value">${summary.invoicesGenerated}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Pagos Recibidos</div>
                <div class="stat-value">${summary.paymentsReceived}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Tenants Suspendidos</div>
                <div class="stat-value" style="color: ${summary.tenantsSuspended > 0 ? '#dc3545' : '#10b981'};">${summary.tenantsSuspended}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Facturas Vencidas</div>
                <div class="stat-value" style="color: ${summary.overdueInvoices > 0 ? '#ffc107' : '#10b981'};">${summary.overdueInvoices}</div>
              </div>
            </div>

            <div class="stat-card" style="grid-column: span 2; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none;">
              <div class="stat-label" style="color: white; opacity: 0.9;">Ingresos del Día</div>
              <div class="stat-value" style="color: white; font-size: 36px;">${this.formatCurrency(summary.totalRevenue)}</div>
            </div>

            ${summary.invoicesGenerated > 0 ? `
              <div class="section">
                <div class="section-title">📄 Facturas Generadas Hoy</div>
                ${summary.invoicesList.map(inv => `
                  <div class="list-item">
                    <strong>${inv.tenantName}</strong><br>
                    Factura: ${inv.invoiceNumber} | Monto: ${this.formatCurrency(inv.amount)} | Vence: ${new Date(inv.dueDate).toLocaleDateString('es-CO')}
                  </div>
                `).join('')}
              </div>
            ` : ''}

            ${summary.paymentsReceived > 0 ? `
              <div class="section">
                <div class="section-title success">💰 Pagos Recibidos Hoy</div>
                ${summary.paymentsList.map(pay => `
                  <div class="list-item success">
                    <strong>${pay.tenantName}</strong><br>
                    Factura: ${pay.invoiceNumber} | Monto: ${this.formatCurrency(pay.amount)} | Método: ${pay.method || 'N/A'}
                  </div>
                `).join('')}
              </div>
            ` : ''}

            ${summary.tenantsSuspended > 0 ? `
              <div class="section">
                <div class="section-title danger">🔴 Tenants Suspendidos Hoy</div>
                ${summary.suspendedList.map(sus => `
                  <div class="list-item danger">
                    <strong>${sus.tenantName}</strong><br>
                    Factura Vencida: ${sus.invoiceNumber} | Monto: ${this.formatCurrency(sus.amount)} | Días de Mora: ${sus.daysOverdue}
                  </div>
                `).join('')}
              </div>
            ` : ''}

            ${summary.overdueInvoices > 0 ? `
              <div class="alert">
                <strong>⚠️ Atención:</strong> Hay ${summary.overdueInvoices} factura(s) vencida(s) que requieren seguimiento.
              </div>
            ` : ''}
          </div>
          
          <div class="footer">
            <p>Este es un resumen automático del sistema de facturación.</p>
            <p>© ${new Date().getFullYear()} ${this.configService.get('SMTP_FROM_NAME')}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Template de alerta de tenant suspendido para super admin
   */
  private getTenantSuspendedAlertTemplate(tenant: any, invoice: any): string {
    const daysOverdue = Math.floor((new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24));

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .alert-box { background: #f8d7da; border-left: 4px solid #dc3545; padding: 20px; margin: 20px 0; border-radius: 4px; }
          .info-grid { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #dee2e6; }
          .info-row:last-child { border-bottom: none; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔴 Tenant Suspendido</h1>
            <p>Alerta de Suspensión por Falta de Pago</p>
          </div>
          
          <div class="content">
            <div class="alert-box">
              <strong>⚠️ ACCIÓN REQUERIDA</strong><br>
              El tenant <strong>${tenant.name}</strong> ha sido suspendido automáticamente por falta de pago.
            </div>

            <div class="info-grid">
              <div class="info-row">
                <span><strong>Tenant:</strong></span>
                <span>${tenant.name}</span>
              </div>
              <div class="info-row">
                <span><strong>Slug:</strong></span>
                <span>${tenant.slug}</span>
              </div>
              <div class="info-row">
                <span><strong>Plan:</strong></span>
                <span>${tenant.plan}</span>
              </div>
              <div class="info-row">
                <span><strong>Email de Contacto:</strong></span>
                <span>${tenant.contactEmail}</span>
              </div>
              <div class="info-row">
                <span><strong>Factura Vencida:</strong></span>
                <span>${invoice.invoiceNumber}</span>
              </div>
              <div class="info-row">
                <span><strong>Monto Adeudado:</strong></span>
                <span style="color: #dc3545; font-weight: bold;">${this.formatCurrency(invoice.total)}</span>
              </div>
              <div class="info-row">
                <span><strong>Fecha de Vencimiento:</strong></span>
                <span>${new Date(invoice.dueDate).toLocaleDateString('es-CO')}</span>
              </div>
              <div class="info-row">
                <span><strong>Días de Mora:</strong></span>
                <span style="color: #dc3545; font-weight: bold;">${daysOverdue} días</span>
              </div>
              <div class="info-row">
                <span><strong>Fecha de Suspensión:</strong></span>
                <span>${new Date().toLocaleDateString('es-CO')} ${new Date().toLocaleTimeString('es-CO')}</span>
              </div>
            </div>

            <p><strong>Acciones Tomadas:</strong></p>
            <ul>
              <li>✅ Tenant suspendido automáticamente</li>
              <li>✅ Email de notificación enviado al tenant</li>
              <li>✅ Acceso al sistema bloqueado</li>
            </ul>

            <p><strong>Próximos Pasos:</strong></p>
            <ul>
              <li>El tenant debe realizar el pago de la factura vencida</li>
              <li>El sistema reactivará la cuenta automáticamente al recibir el pago</li>
              <li>Puedes hacer seguimiento desde el dashboard de super admin</li>
            </ul>
          </div>
          
          <div class="footer">
            <p>Este es un correo automático del sistema de facturación.</p>
            <p>© ${new Date().getFullYear()} ${this.configService.get('SMTP_FROM_NAME')}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Template de notificación de pago recibido para super admin
   */
  private getPaymentReceivedAlertTemplate(tenant: any, payment: any, invoice: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .success-box { background: #d1f2eb; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 4px; }
          .info-grid { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #dee2e6; }
          .info-row:last-child { border-bottom: none; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💰 Pago Recibido</h1>
            <p>Notificación de Pago Exitoso</p>
          </div>
          
          <div class="content">
            <div class="success-box">
              <strong>✅ PAGO CONFIRMADO</strong><br>
              Se ha recibido un pago de <strong>${tenant.name}</strong>.
            </div>

            <div class="info-grid">
              <div class="info-row">
                <span><strong>Tenant:</strong></span>
                <span>${tenant.name}</span>
              </div>
              <div class="info-row">
                <span><strong>Slug:</strong></span>
                <span>${tenant.slug}</span>
              </div>
              <div class="info-row">
                <span><strong>Plan:</strong></span>
                <span>${tenant.plan}</span>
              </div>
              <div class="info-row">
                <span><strong>Factura Pagada:</strong></span>
                <span>${invoice.invoiceNumber}</span>
              </div>
              <div class="info-row">
                <span><strong>Monto Pagado:</strong></span>
                <span style="color: #10b981; font-weight: bold; font-size: 18px;">${this.formatCurrency(payment?.amount || invoice.total)}</span>
              </div>
              <div class="info-row">
                <span><strong>Método de Pago:</strong></span>
                <span>${payment?.method || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span><strong>Fecha de Pago:</strong></span>
                <span>${new Date().toLocaleDateString('es-CO')} ${new Date().toLocaleTimeString('es-CO')}</span>
              </div>
              ${payment?.transactionId ? `
                <div class="info-row">
                  <span><strong>ID de Transacción:</strong></span>
                  <span>${payment.transactionId}</span>
                </div>
              ` : ''}
            </div>

            <p><strong>Acciones Realizadas:</strong></p>
            <ul>
              <li>✅ Factura marcada como pagada</li>
              <li>✅ Email de confirmación enviado al tenant</li>
              ${tenant.status === 'suspended' ? '<li>✅ Cuenta reactivada automáticamente</li>' : '<li>✅ Cuenta mantiene estado activo</li>'}
            </ul>
          </div>
          
          <div class="footer">
            <p>Este es un correo automático del sistema de facturación.</p>
            <p>© ${new Date().getFullYear()} ${this.configService.get('SMTP_FROM_NAME')}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Template de alerta de error en facturación para super admin
   */
  private getBillingErrorAlertTemplate(error: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .error-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 4px; }
          .code-block { background: #f8f9fa; padding: 15px; border-radius: 4px; font-family: monospace; font-size: 13px; overflow-x: auto; margin: 15px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Error en Sistema de Facturación</h1>
            <p>Alerta de Error Detectado</p>
          </div>
          
          <div class="content">
            <div class="error-box">
              <strong>⚠️ ERROR DETECTADO</strong><br>
              Se ha detectado un error en el sistema de facturación que requiere atención.
            </div>

            <p><strong>Tipo de Error:</strong> ${error.type}</p>
            ${error.tenantName ? `<p><strong>Tenant Afectado:</strong> ${error.tenantName}</p>` : ''}
            ${error.invoiceNumber ? `<p><strong>Factura:</strong> ${error.invoiceNumber}</p>` : ''}
            
            <p><strong>Mensaje de Error:</strong></p>
            <div class="code-block">${error.message}</div>

            ${error.details ? `
              <p><strong>Detalles Adicionales:</strong></p>
              <div class="code-block">${JSON.stringify(error.details, null, 2)}</div>
            ` : ''}

            <p><strong>Fecha y Hora:</strong> ${new Date().toLocaleString('es-CO')}</p>

            <p><strong>Acciones Recomendadas:</strong></p>
            <ul>
              <li>Revisar los logs del servidor para más detalles</li>
              <li>Verificar el estado del tenant afectado</li>
              <li>Contactar al equipo de desarrollo si el error persiste</li>
            </ul>
          </div>
          
          <div class="footer">
            <p>Este es un correo automático del sistema de monitoreo.</p>
            <p>© ${new Date().getFullYear()} ${this.configService.get('SMTP_FROM_NAME')}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
