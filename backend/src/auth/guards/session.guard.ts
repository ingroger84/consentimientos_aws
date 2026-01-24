import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SessionService } from '../services/session.service';

@Injectable()
export class SessionGuard implements CanActivate {
  private readonly logger = new Logger(SessionGuard.name);

  constructor(
    private sessionService: SessionService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Verificar si la ruta tiene el decorador @SkipSessionCheck
    const skipSessionCheck = this.reflector.get<boolean>(
      'skipSessionCheck',
      context.getHandler(),
    );

    if (skipSessionCheck) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return true; // Dejar que el JwtAuthGuard maneje esto
    }

    const token = authHeader.replace('Bearer ', '');

    // Validar que la sesión esté activa
    const isValid = await this.sessionService.validateSession(token);

    if (!isValid) {
      this.logger.warn(
        `Sesión inválida o cerrada. Usuario debe iniciar sesión nuevamente.`,
      );
      throw new UnauthorizedException(
        'Tu sesión ha sido cerrada porque iniciaste sesión en otro dispositivo.',
      );
    }

    return true;
  }
}
