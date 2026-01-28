import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findByEmail(payload.email);
    if (!user || !user.isActive) {
      throw new UnauthorizedException();
    }
    
    // Retornar el usuario completo con el rol cargado (que incluye permissions)
    // NO sobrescribir user.role con payload.role porque perdemos los permisos
    return {
      ...user,
      sub: payload.sub,
      tenantId: payload.tenantId,
      tenantSlug: payload.tenantSlug,
      // role: payload.role, // ❌ NO hacer esto, sobrescribe el objeto role con un string
    };
  }
}
