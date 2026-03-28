#!/usr/bin/env node

/**
 * Script para enviar emails de notificación de backups
 * Usa las credenciales SMTP del archivo .env
 */

const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Leer argumentos
const args = process.argv.slice(2);
if (args.length < 3) {
  console.error('Uso: node send-backup-email.js <subject> <status> <backupInfo>');
  console.error('Ejemplo: node send-backup-email.js "Backup Completado" "success" "{\\"counter\\":1,\\"file\\":\\"backup.tar.gz\\"}"');
  process.exit(1);
}

const subject = args[0];
const status = args[1];
const backupInfo = JSON.parse(args[2]);

// Leer configuración SMTP desde .env
const envPath = path.join(__dirname, '../backend/.env');
const envContent = fs.readFileSync(envPath, 'utf8');

const getEnvValue = (key) => {
  const match = envContent.match(new RegExp(`^${key}=(.*)$`, 'm'));
  return match ? match[1].trim() : '';
};

const SMTP_HOST = getEnvValue('SMTP_HOST');
const SMTP_PORT = parseInt(getEnvValue('SMTP_PORT'));
const SMTP_SECURE = getEnvValue('SMTP_SECURE') === 'true';
const SMTP_USER = getEnvValue('SMTP_USER');
const SMTP_PASSWORD = getEnvValue('SMTP_PASSWORD');
const SMTP_FROM = getEnvValue('SMTP_FROM');
const SMTP_FROM_NAME = getEnvValue('SMTP_FROM_NAME');
const EMAIL_TO = 'rcaraballo@innovasystems.com.co';

// Crear transporter
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  },
});

// Generar HTML del email
const generateEmailHTML = () => {
  const statusClass = status === 'success' ? 'success' : 'error';
  const statusIcon = status === 'success' ? '✅' : '❌';
  const statusText = status === 'success' ? 'Completado Exitosamente' : 'Error';
  
  let bodyContent = '';
  
  if (status === 'success') {
    bodyContent = `
      <h3 class="${statusClass}">${statusIcon} Backup ${statusText}</h3>
      
      <div class="info-box">
        <h4>📊 Información del Backup</h4>
        <table>
          <tr>
            <td>Consecutivo:</td>
            <td><strong>#${backupInfo.counter}</strong></td>
          </tr>
          <tr>
            <td>Fecha y Hora:</td>
            <td>${backupInfo.date}</td>
          </tr>
          <tr>
            <td>Nombre del Archivo:</td>
            <td>${backupInfo.file}</td>
          </tr>
          <tr>
            <td>Tamaño:</td>
            <td>${backupInfo.size}</td>
          </tr>
          <tr>
            <td>Ubicación S3:</td>
            <td style="word-break: break-all; font-size: 11px;">${backupInfo.s3url}</td>
          </tr>
          <tr>
            <td>Total Backups en S3:</td>
            <td>${backupInfo.totalBackups} archivos</td>
          </tr>
        </table>
      </div>
      
      <div class="info-box">
        <h4>📦 Contenido del Backup</h4>
        <ul>
          <li>✅ Código fuente completo (backend y frontend)</li>
          <li>✅ Archivos de configuración</li>
          <li>✅ Scripts y documentación</li>
          <li>✅ Archivos .env (credenciales)</li>
          <li>⚠️ Excluidos: node_modules, .git, logs, dist, build</li>
        </ul>
      </div>
      
      <div class="info-box">
        <h4>🔄 Restauración</h4>
        <p>Para restaurar este backup, contacta al equipo de desarrollo con el consecutivo <strong>#${backupInfo.counter}</strong></p>
        <p>El backup estará disponible en S3 para restauración inmediata.</p>
      </div>
      
      <div class="info-box">
        <h4>⏰ Próximo Backup Programado</h4>
        <p>El sistema realizará el siguiente backup automáticamente según el horario configurado:</p>
        <ul>
          <li>🕛 12:00 PM (mediodía)</li>
          <li>🕖 7:00 PM (noche)</li>
        </ul>
      </div>
    `;
  } else {
    bodyContent = `
      <h3 class="${statusClass}">${statusIcon} Error en Backup</h3>
      
      <div class="info-box">
        <h4>❌ Detalles del Error</h4>
        <p>${backupInfo.error || 'Error desconocido durante el proceso de backup'}</p>
        <p><strong>Consecutivo:</strong> #${backupInfo.counter}</p>
        <p><strong>Fecha:</strong> ${backupInfo.date}</p>
      </div>
      
      <div class="info-box">
        <h4>🔧 Acciones Recomendadas</h4>
        <ul>
          <li>Verificar logs del servidor en /home/ubuntu/backup_logs/</li>
          <li>Verificar espacio en disco disponible</li>
          <li>Verificar conectividad con AWS S3</li>
          <li>Verificar credenciales de AWS</li>
        </ul>
      </div>
    `;
  }
  
  return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 5px 5px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
        .success { color: #10B981; font-weight: bold; }
        .error { color: #EF4444; font-weight: bold; }
        .info-box { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #667eea; }
        .footer { background: #333; color: white; padding: 15px; text-align: center; border-radius: 0 0 5px 5px; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        td { padding: 8px; border-bottom: 1px solid #ddd; }
        td:first-child { font-weight: bold; width: 40%; }
        ul { margin: 10px 0; padding-left: 20px; }
        li { margin: 5px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>🔒 Sistema de Backups Automáticos</h2>
            <p>Archivo en Línea - archivoenlinea.com</p>
        </div>
        <div class="content">
            ${bodyContent}
        </div>
        <div class="footer">
            <p>Este es un mensaje automático del sistema de backups</p>
            <p>Servidor: AWS Lightsail (100.28.198.249)</p>
            <p>© 2026 Archivo en Línea - Todos los derechos reservados</p>
        </div>
    </div>
</body>
</html>
  `;
};

// Enviar email
async function sendEmail() {
  try {
    const html = generateEmailHTML();
    
    const mailOptions = {
      from: `"${SMTP_FROM_NAME}" <${SMTP_FROM}>`,
      to: EMAIL_TO,
      subject: subject,
      html: html,
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email enviado exitosamente:', info.messageId);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al enviar email:', error.message);
    process.exit(1);
  }
}

sendEmail();
