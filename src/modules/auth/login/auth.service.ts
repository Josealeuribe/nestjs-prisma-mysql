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
        roles_permisos: {
          select: {
            permisos: {
              select: {
                id_permiso: true,
                nombre_permiso: true,
              },
            },
          },
        },
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
  ) { }

  async login(email: string, plainPassword: string) {
    const user = await this.prisma.usuario.findUnique({
      where: { email },
      ...usuarioLoginArgs,
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.estado) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    const ok = await bcrypt.compare(plainPassword, user.contrasena);
    if (!ok) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const bodegas = user.bodegas_por_usuario.map((x) => x.bodega);

    if (bodegas.length === 0) {
      throw new UnauthorizedException('Usuario sin bodegas asignadas');
    }

    let id_bodega_activa: number | null = null;

    if (bodegas.length === 1) {
      id_bodega_activa = bodegas[0].id_bodega;
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

    const permisos = user.roles.roles_permisos.map((rp) => rp.permisos);

    return {
      access_token,
      user: {
        ...safeUser,
        id_bodega_activa,
        requiereSeleccion,
        bodegas,
        permisos,
      },
    };
  }

  async getMe(idUsuario: number) {
    const user = await this.prisma.usuario.findUnique({
      where: { id_usuario: idUsuario },
      ...usuarioLoginArgs,
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    if (!user.estado) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    const bodegas = user.bodegas_por_usuario.map((x) => x.bodega);

    let id_bodega_activa: number | null = null;

    if (bodegas.length === 1) {
      id_bodega_activa = bodegas[0].id_bodega;
    }

    const requiereSeleccion = id_bodega_activa === null;

    const { contrasena, ...safeUser } = user;

    const permisos = user.roles.roles_permisos.map((rp) => rp.permisos);

    return {
      ...safeUser,
      id_bodega_activa,
      requiereSeleccion,
      bodegas,
      permisos,
    };
  }
}