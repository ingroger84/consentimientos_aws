import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../tenants/entities/tenant.entity';
import { getVersion } from '../config/version';
import * as os from 'os';

@Injectable()
export class HealthService {
  private startTime: Date;

  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
  ) {
    this.startTime = new Date();
  }

  async getHealthStatus() {
    const dbStatus = await this.checkDatabase();
    
    return {
      status: dbStatus ? 'operational' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: this.getUptime(),
      services: {
        api: 'operational',
        database: dbStatus ? 'operational' : 'degraded',
        storage: 'operational',
      }
    };
  }

  async getDetailedHealthStatus() {
    const [dbStatus, dbResponseTime] = await this.checkDatabaseWithTiming();
    const memoryUsage = process.memoryUsage();
    const cpuUsage = os.loadavg();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    
    return {
      status: dbStatus ? 'operational' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: this.getUptime(),
      uptimeSeconds: Math.floor((Date.now() - this.startTime.getTime()) / 1000),
      services: {
        api: {
          status: 'operational',
          responseTime: '<50ms',
        },
        database: {
          status: dbStatus ? 'operational' : 'degraded',
          responseTime: `${dbResponseTime}ms`,
        },
        storage: {
          status: 'operational',
          provider: 'AWS S3',
        },
      },
      system: {
        platform: os.platform(),
        nodeVersion: process.version,
        memory: {
          // Memoria de la aplicación Node.js (heap)
          app: {
            used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
            total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
            unit: 'MB',
          },
          // Memoria RAM del servidor
          server: {
            used: Math.round(usedMemory / 1024 / 1024 / 1024 * 10) / 10,
            total: Math.round(totalMemory / 1024 / 1024 / 1024 * 10) / 10,
            free: Math.round(freeMemory / 1024 / 1024 / 1024 * 10) / 10,
            unit: 'GB',
            percentage: Math.round((usedMemory / totalMemory) * 100),
          },
        },
        cpu: {
          cores: os.cpus().length,
          model: os.cpus()[0]?.model || 'Unknown',
          load: cpuUsage.map(load => load.toFixed(2)),
        },
      },
      version: getVersion(),
    };
  }

  private async checkDatabase(): Promise<boolean> {
    try {
      await this.tenantRepository.query('SELECT 1');
      return true;
    } catch (error) {
      return false;
    }
  }

  private async checkDatabaseWithTiming(): Promise<[boolean, number]> {
    const start = Date.now();
    try {
      await this.tenantRepository.query('SELECT 1');
      const responseTime = Date.now() - start;
      return [true, responseTime];
    } catch (error) {
      return [false, 0];
    }
  }

  private getUptime(): string {
    const uptimeSeconds = Math.floor((Date.now() - this.startTime.getTime()) / 1000);
    const days = Math.floor(uptimeSeconds / 86400);
    const hours = Math.floor((uptimeSeconds % 86400) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }
}
