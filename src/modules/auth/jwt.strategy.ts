import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export type JwtPayload = {
  sub: number;
  email: string;
  id_rol: number;
  id_bodega_activa?: number | null;
};

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // ✅ en desarrollo puedes dejar fallback
    return 'dev_secret_change_me';
    // ✅ en producción sería mejor tirar error:
    // throw new Error('JWT_SECRET no está definido en el .env');
  }
  return secret;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getJwtSecret(), // ✅ ahora siempre es string
    });
  }

  validate(payload: JwtPayload) {
    return payload; // queda en req.user
  }
}
