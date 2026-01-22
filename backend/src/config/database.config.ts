import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const isProduction = configService.get('NODE_ENV') === 'production';

  return {
    type: 'postgres',
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_DATABASE'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: false, // NUNCA usar true en produccion
    logging: !isProduction, // Solo logging en desarrollo
    
    // Pool de conexiones optimizado
    extra: {
      // Numero maximo de conexiones en el pool
      max: isProduction ? 20 : 10,
      
      // Numero minimo de conexiones en el pool
      min: isProduction ? 5 : 2,
      
      // Tiempo maximo de espera para obtener una conexion (ms)
      connectionTimeoutMillis: 10000,
      
      // Tiempo maximo de vida de una conexion (ms)
      idleTimeoutMillis: 30000,
      
      // Tiempo maximo que una consulta puede ejecutarse (ms)
      statement_timeout: 30000,
      
      // Habilitar keep-alive para conexiones
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
    },
    
    // Cache de consultas (mejora performance de queries repetitivas)
    cache: isProduction
      ? {
          type: 'database',
          duration: 60000, // 1 minuto
          tableName: 'query_result_cache',
        }
      : false,
    
    // Migraciones
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
    migrationsRun: false, // Ejecutar migraciones manualmente
    migrationsTableName: 'migrations',
  };
};
