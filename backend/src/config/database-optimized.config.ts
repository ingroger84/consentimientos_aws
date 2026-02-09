import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

/**
 * Configuración optimizada de TypeORM para producción
 * Incluye pool de conexiones, caché y logging optimizado
 */
export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const isProduction = configService.get('NODE_ENV') === 'production';

  return {
    type: 'postgres',
    host: configService.get('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_DATABASE'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: false, // NUNCA true en producción
    logging: !isProduction, // Solo en desarrollo
    logger: 'advanced-console',

    // OPTIMIZACIÓN: Pool de conexiones
    extra: {
      // Máximo de conexiones en el pool
      max: isProduction ? 20 : 10,
      
      // Mínimo de conexiones mantenidas
      min: isProduction ? 5 : 2,
      
      // Tiempo antes de cerrar conexiones inactivas (30 segundos)
      idleTimeoutMillis: 30000,
      
      // Timeout para establecer conexión (5 segundos)
      connectionTimeoutMillis: 5000,
      
      // Timeout para queries (10 segundos)
      statement_timeout: 10000,
      
      // Configuración adicional de PostgreSQL
      application_name: 'datagree_backend',
    },

    // OPTIMIZACIÓN: Caché de queries
    cache: isProduction ? {
      type: 'database',
      tableName: 'query_result_cache',
      duration: 60000, // 1 minuto
      ignoreErrors: true, // No fallar si el caché falla
    } : false,

    // OPTIMIZACIÓN: Configuración de migraciones
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
    migrationsRun: false, // Ejecutar manualmente
    migrationsTableName: 'migrations',

    // OPTIMIZACIÓN: Configuración de entidades
    autoLoadEntities: true,
    keepConnectionAlive: true,

    // SEGURIDAD: Configuración SSL para producción
    ssl: isProduction ? {
      rejectUnauthorized: false, // Cambiar a true con certificados válidos
    } : false,
  };
};
