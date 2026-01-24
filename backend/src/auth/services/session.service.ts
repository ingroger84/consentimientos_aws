import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { UserSession } from '../entities/user-session.entity';
import * as crypto from 'crypto';

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(
    @InjectRepository(UserSession)
    private sessionRepository: Repository<UserSession>,
  ) {}

  /**
   * Crea una nueva sesión y cierra todas las sesiones anteriores del usuario
   */
  async createSession(
    userId: string,
    jwtToken: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<UserSession> {
    // Generar hash del token JWT para almacenar
    const sessionToken = this.hashToken(jwtToken);

    // Cerrar todas las sesiones activas anteriores del usuario
    await this.closeAllUserSessions(userId);

    // Calcular fecha de expiración (mismo tiempo que el JWT - 24 horas por defecto)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Crear nueva sesión
    const session = this.sessionRepository.create({
      userId,
      sessionToken,
      userAgent: userAgent?.substring(0, 255), // Limitar longitud
      ipAddress,
      isActive: true,
      lastActivityAt: new Date(),
      expiresAt,
    });

    const savedSession = await this.sessionRepository.save(session);
    
    this.logger.log(`Nueva sesión creada para usuario ${userId}. Sesiones anteriores cerradas.`);
    
    return savedSession;
  }

  /**
   * Valida que una sesión esté activa
   */
  async validateSession(jwtToken: string): Promise<boolean> {
    const sessionToken = this.hashToken(jwtToken);

    const session = await this.sessionRepository.findOne({
      where: {
        sessionToken,
        isActive: true,
      },
    });

    if (!session) {
      this.logger.warn(`Sesión no encontrada o inactiva para token`);
      return false;
    }

    // Verificar si la sesión ha expirado
    if (session.expiresAt < new Date()) {
      this.logger.warn(`Sesión expirada para usuario ${session.userId}`);
      await this.closeSession(sessionToken);
      return false;
    }

    // Actualizar última actividad
    await this.updateLastActivity(sessionToken);

    return true;
  }

  /**
   * Cierra una sesión específica
   */
  async closeSession(sessionToken: string): Promise<void> {
    await this.sessionRepository.update(
      { sessionToken },
      { isActive: false },
    );
    
    this.logger.log(`Sesión cerrada: ${sessionToken.substring(0, 10)}...`);
  }

  /**
   * Cierra todas las sesiones activas de un usuario
   */
  async closeAllUserSessions(userId: string): Promise<number> {
    const result = await this.sessionRepository.update(
      { userId, isActive: true },
      { isActive: false },
    );

    const count = result.affected || 0;
    
    if (count > 0) {
      this.logger.log(`${count} sesión(es) cerrada(s) para usuario ${userId}`);
    }

    return count;
  }

  /**
   * Cierra una sesión por JWT token
   */
  async closeSessionByJwt(jwtToken: string): Promise<void> {
    const sessionToken = this.hashToken(jwtToken);
    await this.closeSession(sessionToken);
  }

  /**
   * Actualiza la última actividad de una sesión
   */
  private async updateLastActivity(sessionToken: string): Promise<void> {
    await this.sessionRepository.update(
      { sessionToken },
      { lastActivityAt: new Date() },
    );
  }

  /**
   * Limpia sesiones expiradas (ejecutar periódicamente)
   */
  async cleanExpiredSessions(): Promise<number> {
    const result = await this.sessionRepository.delete({
      expiresAt: LessThan(new Date()),
    });

    const count = result.affected || 0;
    
    if (count > 0) {
      this.logger.log(`${count} sesión(es) expirada(s) eliminada(s)`);
    }

    return count;
  }

  /**
   * Obtiene todas las sesiones activas de un usuario
   */
  async getUserActiveSessions(userId: string): Promise<UserSession[]> {
    return this.sessionRepository.find({
      where: {
        userId,
        isActive: true,
      },
      order: {
        lastActivityAt: 'DESC',
      },
    });
  }

  /**
   * Genera hash del token JWT para almacenar
   */
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Verifica si un usuario tiene sesiones activas
   */
  async hasActiveSessions(userId: string): Promise<boolean> {
    const count = await this.sessionRepository.count({
      where: {
        userId,
        isActive: true,
      },
    });

    return count > 0;
  }
}
