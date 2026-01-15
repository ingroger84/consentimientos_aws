import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';

dotenv.config();

async function testWorkspaceEmail() {
  console.log('🔍 Probando configuración de Google Workspace...\n');
  
  const config = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
  };
  
  console.log('📋 Configuración:');
  console.log('  Host:', config.host);
  console.log('  Port:', config.port);
  console.log('  Secure:', config.secure);
  console.log('  User:', config.user);
  console.log('  Password length:', config.password?.length || 0, 'caracteres');
  console.log('  Password (últimos 4):', config.password ? '***' + config.password.slice(-4) : 'NO CONFIGURADA');
  console.log('');
  
  // Verificar formato de contraseña
  if (config.password) {
    const hasSpaces = config.password.includes(' ');
    const length = config.password.replace(/\s/g, '').length;
    
    console.log('🔍 Análisis de contraseña:');
    console.log('  Tiene espacios:', hasSpaces ? 'Sí' : 'No');
    console.log('  Longitud sin espacios:', length);
    console.log('  Formato esperado: 16 caracteres (con o sin espacios)');
    console.log('');
    
    if (length !== 16) {
      console.warn('⚠️  ADVERTENCIA: La contraseña de aplicación debe tener 16 caracteres');
      console.warn('   Longitud actual (sin espacios):', length);
      console.warn('');
    }
  }
  
  // Probar diferentes configuraciones
  const configurations = [
    {
      name: 'Configuración 1: Puerto 587, TLS',
      config: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: config.user,
          pass: config.password?.replace(/\s/g, ''), // Sin espacios
        },
        tls: {
          rejectUnauthorized: false,
        },
      },
    },
    {
      name: 'Configuración 2: Puerto 465, SSL',
      config: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: config.user,
          pass: config.password?.replace(/\s/g, ''),
        },
        tls: {
          rejectUnauthorized: false,
        },
      },
    },
    {
      name: 'Configuración 3: Puerto 587, con espacios en password',
      config: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: config.user,
          pass: config.password, // Con espacios
        },
        tls: {
          rejectUnauthorized: false,
        },
      },
    },
  ];
  
  for (const testConfig of configurations) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🧪 Probando: ${testConfig.name}`);
    console.log('='.repeat(60));
    
    try {
      const transporter = nodemailer.createTransport(testConfig.config);
      
      console.log('🔌 Verificando conexión...');
      await transporter.verify();
      console.log('✅ Conexión exitosa!');
      
      console.log('📧 Enviando correo de prueba...');
      const info = await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME}" <${config.user}>`,
        to: config.user,
        subject: 'Prueba Exitosa - Google Workspace',
        html: `
          <h1>✅ Configuración Exitosa</h1>
          <p>La configuración de Google Workspace está funcionando correctamente.</p>
          <p><strong>Configuración usada:</strong></p>
          <ul>
            <li>Puerto: ${testConfig.config.port}</li>
            <li>Secure: ${testConfig.config.secure}</li>
          </ul>
        `,
      });
      
      console.log('✅ Correo enviado exitosamente!');
      console.log('   Message ID:', info.messageId);
      console.log('');
      console.log('🎉 ¡ÉXITO! Esta configuración funciona.');
      console.log('');
      console.log('📝 Actualiza tu .env con:');
      console.log(`   SMTP_PORT=${testConfig.config.port}`);
      console.log(`   SMTP_SECURE=${testConfig.config.secure}`);
      if (testConfig.name.includes('sin espacios')) {
        console.log('   SMTP_PASSWORD=contraseña-sin-espacios');
      }
      
      return; // Salir si encontramos una configuración que funciona
      
    } catch (error: any) {
      console.error('❌ Error:', error.message);
      console.log('   Código:', error.code);
      
      if (error.responseCode === 535) {
        console.log('   → Credenciales incorrectas o configuración de seguridad');
      } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
        console.log('   → Problema de conexión o puerto bloqueado');
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('❌ Ninguna configuración funcionó');
  console.log('='.repeat(60));
  console.log('');
  console.log('🔍 Pasos de diagnóstico:');
  console.log('');
  console.log('1. Verifica que la contraseña de aplicación sea correcta:');
  console.log('   - Ve a: https://myaccount.google.com/apppasswords');
  console.log('   - Genera una NUEVA contraseña de aplicación');
  console.log('   - Copia EXACTAMENTE como aparece (con o sin espacios)');
  console.log('');
  console.log('2. Verifica la configuración de Google Workspace:');
  console.log('   - Acceso SMTP debe estar habilitado en la consola de admin');
  console.log('   - Ve a: https://admin.google.com');
  console.log('   - Apps → Google Workspace → Gmail → Configuración de usuario');
  console.log('   - Verifica que "Permitir acceso SMTP" esté habilitado');
  console.log('');
  console.log('3. Verifica la verificación en 2 pasos:');
  console.log('   - Debe estar habilitada en tu cuenta de Workspace');
  console.log('   - https://myaccount.google.com/security');
  console.log('');
  console.log('4. Verifica que no haya políticas de seguridad:');
  console.log('   - En la consola de admin de Workspace');
  console.log('   - Seguridad → Autenticación → Contraseñas de aplicación');
  console.log('   - Debe estar permitido para tu cuenta');
}

testWorkspaceEmail().catch((error) => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
