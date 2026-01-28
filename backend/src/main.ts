import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

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
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const port = configService.get('PORT', 3000);
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api`);
}

bootstrap();
