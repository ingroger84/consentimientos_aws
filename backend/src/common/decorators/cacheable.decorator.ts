import { SetMetadata } from '@nestjs/common';

export const CACHE_KEY = 'cache';
export const CACHE_TTL_KEY = 'cache_ttl';

/**
 * Decorador para marcar endpoints como cacheables
 * @param ttl Tiempo de vida del cache en segundos (default: 60)
 */
export const Cacheable = (ttl: number = 60) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata(CACHE_KEY, true)(target, propertyKey, descriptor);
    SetMetadata(CACHE_TTL_KEY, ttl)(target, propertyKey, descriptor);
    return descriptor;
  };
};

/**
 * Ejemplos de uso:
 * 
 * @Get('plans')
 * @Cacheable(300) // Cache por 5 minutos
 * async getPlans() {
 *   return this.plansService.findAll();
 * }
 * 
 * @Get('settings/public')
 * @Cacheable(60) // Cache por 1 minuto
 * async getPublicSettings() {
 *   return this.settingsService.getPublicSettings();
 * }
 */
