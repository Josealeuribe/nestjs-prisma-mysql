import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

type JwtPayload = {
  sub: number;
  email: string;
  id_rol: number;
  id_bodega_activa: number | null;
};

const usuarioLoginArgs = Prisma.validator<Prisma.usuarioDefaultArgs>()({
  include: {
    roles: {
      select: {
        id_rol: true,
        nombre_rol: true,
        estado: true,
        id_bodega_default: true,
      },
    },
    bodegas_por_usuario: {
      include: { bodega: true },
    },
  },
});

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(email: string, plainPassword: string) {
    const user = await this.prisma.usuario.findUnique({
      where: { email },
      ...usuarioLoginArgs,
    });

    if (!user) throw new UnauthorizedException('Credenciales inválidas');
    if (!user.estado) throw new UnauthorizedException('Usuario inactivo');

    const ok = await bcrypt.compare(plainPassword, user.contrasena);
    if (!ok) throw new UnauthorizedException('Credenciales inválidas');

    const bodegas = user.bodegas_por_usuario.map((x) => x.bodega);
    if (bodegas.length === 0) {
      throw new UnauthorizedException('Usuario sin bodegas asignadas');
    }

    let id_bodega_activa: number | null = null;

    if (bodegas.length === 1) {
      id_bodega_activa = bodegas[0].id_bodega;
    } else {
      const idDefault = user.roles?.id_bodega_default ?? null;
      if (idDefault && bodegas.some((b) => b.id_bodega === idDefault)) {
        id_bodega_activa = idDefault;
      }
    }

    const requiereSeleccion = id_bodega_activa === null;

    const payload: JwtPayload = {
      sub: user.id_usuario,
      email: user.email,
      id_rol: user.id_rol,
      id_bodega_activa,
    };

    const access_token = await this.jwt.signAsync(payload);

    const { contrasena, ...safeUser } = user;

    return {
      access_token,
      user: {
        ...safeUser,
        id_bodega_activa,
        requiereSeleccion,
        bodegas, // devuelve bodegas completas (sin adivinar nombre)
      },
    };
  }
}
