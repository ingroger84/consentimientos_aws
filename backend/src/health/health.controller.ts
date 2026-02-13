import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Estado básico del sistema',
    description: 'Retorna el estado general de la aplicación y sus servicios principales'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estado del sistema obtenido exitosamente',
    schema: {
      example: {
        status: 'operational',
        timestamp: '2026-02-13T07:30:00.000Z',
        uptime: '2d 5h 30m',
        services: {
          api: 'operational',
          database: 'operational',
          storage: 'operational'
        }
      }
    }
  })
  async getHealth() {
    return this.healthService.getHealthStatus();
  }

  @Get('detailed')
  @ApiOperation({ 
    summary: 'Estado detallado del sistema',
    description: 'Retorna información detallada sobre el estado del sistema, incluyendo métricas de rendimiento, uso de recursos y versión'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estado detallado obtenido exitosamente',
    schema: {
      example: {
        status: 'operational',
        timestamp: '2026-02-13T07:30:00.000Z',
        uptime: '2d 5h 30m',
        uptimeSeconds: 192600,
        services: {
          api: { status: 'operational', responseTime: '<50ms' },
          database: { status: 'operational', responseTime: '15ms' },
          storage: { status: 'operational', provider: 'AWS S3' }
        },
        system: {
          platform: 'linux',
          nodeVersion: 'v18.17.0',
          memory: {
            app: { used: 150, total: 200, unit: 'MB' },
            server: { used: 2.5, total: 8.0, free: 5.5, unit: 'GB', percentage: 31 }
          },
          cpu: { cores: 4, model: 'Intel Core i7', load: ['0.50', '0.45', '0.40'] }
        },
        version: {
          version: '38.0.0',
          date: '2026-02-13',
          buildDate: '2026-02-13T00:00:00.000Z',
          environment: 'production',
          apiVersion: 'v1',
          fullVersion: '38.0.0 - 2026-02-13'
        }
      }
    }
  })
  async getDetailedHealth() {
    return this.healthService.getDetailedHealthStatus();
  }

  @Get('version')
  @ApiOperation({ 
    summary: 'Información de versión',
    description: 'Retorna información completa sobre la versión actual de la aplicación, incluyendo changelog y notas de lanzamiento'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Información de versión obtenida exitosamente',
    schema: {
      example: {
        current: {
          version: '38.0.0',
          date: '2026-02-13',
          buildDate: '2026-02-13T00:00:00.000Z',
          environment: 'production',
          apiVersion: 'v1',
          fullVersion: '38.0.0 - 2026-02-13'
        },
        changelog: {
          '38.0.0': {
            date: '2026-02-13',
            type: 'major',
            changes: [
              'Implementación completa de Swagger/OpenAPI',
              'Sistema de versionamiento mejorado'
            ]
          }
        },
        availableVersions: ['38.0.0', '37.2.1', '37.1.0'],
        releaseNotes: {
          date: '2026-02-13',
          type: 'major',
          changes: ['Implementación completa de Swagger/OpenAPI']
        }
      }
    }
  })
  getVersion() {
    return this.healthService.getVersionInfo();
  }
}
