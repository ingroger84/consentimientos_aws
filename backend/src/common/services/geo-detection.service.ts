/**
 * Servicio de Detección Geográfica
 * 
 * Detecta el país del usuario basado en múltiples fuentes:
 * 1. Header X-Country (si viene del frontend)
 * 2. IP del usuario (usando servicio de geolocalización)
 * 3. Accept-Language header
 * 4. Default (Internacional)
 * 
 * @author Sistema Multi-Mercado
 * @date 2026-02-07
 */

import { Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class GeoDetectionService {
  private readonly logger = new Logger(GeoDetectionService.name);

  /**
   * Detecta el país del usuario
   * @param req Request de Express
   * @returns Código de país (CO, US, DEFAULT)
   */
  async detectCountry(req: Request): Promise<string> {
    try {
      // 1. Verificar header explícito (prioridad máxima)
      const countryHeader = req.headers['x-country'] as string;
      if (countryHeader && this.isValidCountryCode(countryHeader)) {
        this.logger.log(`País detectado por header: ${countryHeader}`);
        return countryHeader.toUpperCase();
      }

      // 2. Detectar por IP
      const ip = this.getClientIp(req);
      if (ip && ip !== '127.0.0.1' && ip !== '::1') {
        const country = await this.getCountryFromIp(ip);
        if (country && this.isValidCountryCode(country)) {
          this.logger.log(`País detectado por IP (${ip}): ${country}`);
          return country;
        }
      }

      // 3. Fallback a Accept-Language
      const language = req.headers['accept-language'] as string;
      if (language) {
        const country = this.getCountryFromLanguage(language);
        if (country) {
          this.logger.log(`País detectado por idioma: ${country}`);
          return country;
        }
      }

      // 4. Default
      this.logger.log('País no detectado, usando DEFAULT');
      return 'DEFAULT';
    } catch (error) {
      this.logger.error('Error detectando país:', error);
      return 'DEFAULT';
    }
  }

  /**
   * Obtiene la IP del cliente
   */
  private getClientIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'] as string;
    const realIp = req.headers['x-real-ip'] as string;
    const remoteAddress = req.connection?.remoteAddress || req.socket?.remoteAddress;

    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }

    if (realIp) {
      return realIp.trim();
    }

    return remoteAddress || '';
  }

  /**
   * Obtiene el país desde la IP usando servicio de geolocalización
   */
  private async getCountryFromIp(ip: string): Promise<string | null> {
    try {
      // Opción 1: Usar servicio gratuito ipapi.co
      const response = await fetch(`https://ipapi.co/${ip}/country/`, {
        headers: {
          'User-Agent': 'Archivo-en-Linea/1.0'
        },
        signal: AbortSignal.timeout(3000) // Timeout de 3 segundos
      });

      if (!response.ok) {
        this.logger.warn(`Error en ipapi.co: ${response.status}`);
        return null;
      }

      const country = await response.text();
      return country.trim().toUpperCase();
    } catch (error) {
      this.logger.warn('Error obteniendo país desde IP:', error.message);
      return null;
    }
  }

  /**
   * Obtiene el país desde el header Accept-Language
   */
  private getCountryFromLanguage(language: string): string | null {
    // Buscar patrones como es-CO, en-US, etc.
    const match = language.match(/[a-z]{2}-([A-Z]{2})/);
    if (match && match[1]) {
      return match[1].toUpperCase();
    }

    // Fallback a idioma principal
    if (language.includes('es-CO') || language.includes('es_CO')) {
      return 'CO';
    }
    if (language.includes('en-US') || language.includes('en_US')) {
      return 'US';
    }

    return null;
  }

  /**
   * Valida si un código de país es válido
   */
  private isValidCountryCode(code: string): boolean {
    const validCodes = ['CO', 'US', 'DEFAULT'];
    return validCodes.includes(code.toUpperCase());
  }

  /**
   * Obtiene información completa de geolocalización
   */
  async getGeoInfo(req: Request): Promise<{
    country: string;
    ip: string;
    method: string;
  }> {
    const ip = this.getClientIp(req);
    const country = await this.detectCountry(req);
    
    let method = 'default';
    if (req.headers['x-country']) {
      method = 'header';
    } else if (ip && ip !== '127.0.0.1') {
      method = 'ip';
    } else if (req.headers['accept-language']) {
      method = 'language';
    }

    return { country, ip, method };
  }
}
