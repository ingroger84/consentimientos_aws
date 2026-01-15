import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as path from 'path';
import { Consent } from './entities/consent.entity';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: false,
      auth: this.configService.get('SMTP_USER')
        ? {
            user: this.configService.get('SMTP_USER'),
            pass: this.configService.get('SMTP_PASSWORD'),
          }
        : undefined,
    });
  }

  async sendConsentEmail(consent: Consent): Promise<void> {
    const attachments = [];

    // Single unified PDF
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
      html: this.getEmailTemplate(consent),
      attachments,
    };

    await this.transporter.sendMail(mailOptions);
  }

  private getEmailTemplate(consent: Consent): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #4CAF50;
            color: white;
            padding: 20px;
            text-align: center;
          }
          .content {
            padding: 20px;
            background-color: #f9f9f9;
          }
          .footer {
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: #666;
          }
          .document-list {
            background-color: white;
            padding: 15px;
            margin: 15px 0;
            border-left: 4px solid #4CAF50;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Consentimientos Informados</h1>
          </div>
          <div class="content">
            <p>Estimado/a <strong>${consent.clientName}</strong>,</p>
            
            <p>Adjunto encontrará sus consentimientos informados firmados para el servicio:</p>
            
            <p><strong>${consent.service.name}</strong></p>
            
            <div class="document-list">
              <h3>Documento adjunto:</h3>
              <p>📄 Consentimientos Informados Completos (incluye procedimiento, datos personales e imágenes)</p>
            </div>
            
            <p>Detalles:</p>
            <ul>
              <li>Sede: ${consent.branch.name}</li>
              <li>Fecha: ${consent.signedAt?.toLocaleDateString('es-ES')}</li>
            </ul>
            
            <p>Guarde estos documentos para sus registros.</p>
            
            <p>Si tiene alguna pregunta, no dude en contactarnos.</p>
            
            <p>Saludos cordiales,<br>
            ${consent.branch.name}</p>
          </div>
          <div class="footer">
            <p>Este es un correo automático, por favor no responda a este mensaje.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
