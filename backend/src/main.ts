import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { APP_VERSION } from './config/version';
import * as crypto from 'crypto';

// Fix para el error "crypto is not defined" en @nestjs/schedule
if (typeof global.crypto === 'undefined') {
  (global as any).crypto = crypto;
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  // Security - Configurar helmet para permitir imágenes
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false,
    }),
  );
  app.use(compression());

  // Servir archivos estáticos desde la carpeta uploads
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // CORS - Configuración para soportar subdominios
  const corsOrigin = configService.get('CORS_ORIGIN');
  const baseDomain = configService.get('BASE_DOMAIN', 'tudominio.com');
  const nodeEnv = configService.get('NODE_ENV', 'development');
  
  app.enableCors({
    origin: (origin, callback) => {
      // Permitir requests sin origin (ej: Postman, curl)
      if (!origin) {
        return callback(null, true);
      }

      // En desarrollo, permitir localhost
      if (nodeEnv === 'development' && origin.includes('localhost')) {
        return callback(null, true);
      }

      // Permitir el origin configurado (desarrollo)
      if (origin === corsOrigin) {
        return callback(null, true);
      }

      // Permitir subdominios del dominio base
      const domainRegex = new RegExp(`^https?://([a-z0-9-]+\\.)?${baseDomain.replace('.', '\\.')}(:\\d+)?$`, 'i');
      if (domainRegex.test(origin)) {
        return callback(null, true);
      }

      // Rechazar otros origins
      console.warn(`CORS: Origin rechazado: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Tenant-Slug'],
  });

  // Global prefix
  app.setGlobalPrefix(configService.get('API_PREFIX', 'api'));

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false, // Cambiado temporalmente para permitir campos extra
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Sistema de Consentimientos y Historias Clínicas')
    .setDescription(
      'API REST para gestión de consentimientos digitales, historias clínicas electrónicas, ' +
      'gestión de clientes, planes y precios multi-región, y administración de tenants.\n\n' +
      '## Características principales:\n' +
      '- Autenticación JWT con refresh tokens\n' +
      '- Multi-tenancy con subdominios\n' +
      '- Gestión completa de historias clínicas (HC)\n' +
      '- Consentimientos informados digitales\n' +
      '- Sistema de permisos granular basado en roles\n' +
      '- Integración con Bold para pagos\n' +
      '- Almacenamiento en AWS S3\n' +
      '- Envío de emails con plantillas personalizadas\n' +
      '- Auditoría completa de acciones\n\n' +
      '## Autenticación:\n' +
      'La mayoría de los endpoints requieren autenticación JWT. ' +
      'Incluye el token en el header: `Authorization: Bearer {token}`\n\n' +
      '## Multi-tenancy:\n' +
      'Algunos endpoints requieren el header `X-Tenant-Slug` para identificar el tenant.'
    )
    .setVersion(APP_VERSION.version)
    .setContact(
      'Soporte Técnico',
      'https://archivoenlinea.com',
      'soporte@archivoenlinea.com'
    )
    .setLicense('Propietario', 'https://archivoenlinea.com/license')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingresa tu token JWT',
        in: 'header',
      },
      'JWT-auth',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-Tenant-Slug',
        in: 'header',
        description: 'Slug del tenant (subdominio)',
      },
      'tenant-slug',
    )
    .addTag('auth', 'Autenticación y gestión de sesiones')
    .addTag('users', 'Gestión de usuarios')
    .addTag('clients', 'Gestión de clientes/pacientes')
    .addTag('consents', 'Consentimientos informados')
    .addTag('medical-records', 'Historias clínicas electrónicas')
    .addTag('tenants', 'Gestión de tenants (multi-tenancy)')
    .addTag('plans', 'Planes y precios')
    .addTag('payments', 'Pagos y facturación')
    .addTag('templates', 'Plantillas de consentimientos')
    .addTag('branches', 'Sucursales')
    .addTag('roles', 'Roles y permisos')
    .addTag('health', 'Estado del sistema')
    .addTag('settings', 'Configuración del sistema')
    .addServer('http://localhost:3000', 'Desarrollo Local')
    .addServer('https://api.archivoenlinea.com', 'Producción')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'API Docs - Sistema de Consentimientos',
    customfavIcon: 'https://archivoenlinea.com/favicon.ico',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
      syntaxHighlight: {
        activate: true,
        theme: 'monokai',
      },
    },
  });

  const port = configService.get('PORT', 3000);
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  console.log(`📦 Version: ${APP_VERSION.version} (${APP_VERSION.date})`);
}

bootstrap();
