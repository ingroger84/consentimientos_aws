import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

async function testEmailConfig() {
  console.log('🔍 Probando configuración de correo...\n');
  
  const config = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    from: process.env.SMTP_FROM,
  };
  
  console.log('📋 Configuración actual:');
  console.log('  Host:', config.host);
  console.log('  Port:', config.port);
  console.log('  Secure:', config.secure);
  console.log('  User:', config.user);
  console.log('  Password:', config.password ? '***' + config.password.slice(-4) : 'NO CONFIGURADA');
  console.log('  From:', config.from);
  console.log('');
  
  // Validar configuración
  if (!config.user || !config.password) {
    console.error('❌ Error: SMTP_USER o SMTP_PASSWORD no están configurados');
    return;
  }
  
  // Crear transporter
  console.log('🔧 Creando transporter...');
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.password,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
  
  try {
    // Verificar conexión
    console.log('🔌 Verificando conexión con el servidor SMTP...');
    await transporter.verify();
    console.log('✅ Conexión exitosa con el servidor SMTP\n');
    
    // Enviar correo de prueba
    console.log('📧 Enviando correo de prueba...');
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${config.from}>`,
      to: config.user, // Enviar a ti mismo
      subject: 'Prueba de Configuración - Sistema de Consentimientos',
      html: `
        <h1>✅ Configuración Exitosa</h1>
        <p>Este es un correo de prueba del Sistema de Consentimientos.</p>
        <p>Si recibes este correo, significa que la configuración de Gmail está correcta.</p>
        <hr>
        <p><small>Enviado desde: ${config.host}:${config.port}</small></p>
      `,
    });
    
    console.log('✅ Correo enviado exitosamente!');
    console.log('   Message ID:', info.messageId);
    console.log('   Response:', info.response);
    console.log('\n🎉 La configuración de correo está funcionando correctamente!');
    console.log('   Revisa tu bandeja de entrada en:', config.user);
    
  } catch (error: any) {
    console.error('\n❌ Error al probar la configuración:');
    console.error('   Código:', error.code);
    console.error('   Mensaje:', error.message);
    console.error('');
    
    // Diagnóstico específico
    if (error.code === 'EAUTH' || error.responseCode === 535) {
      console.log('🔍 Diagnóstico:');
      console.log('   Este error indica que las credenciales son incorrectas.');
      console.log('');
      console.log('✅ Soluciones posibles:');
      console.log('   1. Verifica que el email sea correcto');
      console.log('   2. Verifica que la contraseña de aplicación sea correcta');
      console.log('   3. Asegúrate de copiar la contraseña SIN espacios');
      console.log('   4. Genera una nueva contraseña de aplicación en:');
      console.log('      https://myaccount.google.com/apppasswords');
      console.log('   5. Verifica que la verificación en 2 pasos esté habilitada');
      console.log('');
      console.log('📝 Formato correcto en .env:');
      console.log('   SMTP_USER=tu-email@gmail.com');
      console.log('   SMTP_PASSWORD=xxxx xxxx xxxx xxxx  (con o sin espacios)');
      
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      console.log('🔍 Diagnóstico:');
      console.log('   No se puede conectar al servidor SMTP.');
      console.log('');
      console.log('✅ Soluciones posibles:');
      console.log('   1. Verifica tu conexión a internet');
      console.log('   2. Verifica que el puerto 587 no esté bloqueado');
      console.log('   3. Intenta con puerto 465 y SMTP_SECURE=true');
      
    } else {
      console.log('🔍 Error desconocido. Detalles completos:');
      console.log(error);
    }
  }
}

testEmailConfig().catch((error) => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
