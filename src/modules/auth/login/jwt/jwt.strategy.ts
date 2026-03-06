import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';

type JwtPayload = {
  sub: number; // id_usuario
  email: string;
  id_rol: number;
  id_bodega_activa: number;
};

type AuthUser = {
  id_usuario: number;
  email: string;
  id_rol: number;
  id_bodega_activa: number;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const secret = config.get<string>('JWT_SECRET');
    if (!secret) throw new Error('JWT_SECRET is missing in .env');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id_usuario: payload.sub },
      select: {
        id_usuario: true,
        email: true,
        id_rol: true,
      },
    });

    if (!usuario) {
      throw new UnauthorizedException('Usuario no válido');
    }

    return {
      ...usuario,
      id_bodega_activa: payload.id_bodega_activa,
    };
  }
}
