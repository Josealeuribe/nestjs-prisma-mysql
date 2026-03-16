import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { ActualizarMiPerfilDto } from '../dto/actualizar-mi-perfil.dto';

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
    tipo_documento: true,
    genero: true,
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

  async actualizarMiPerfil(idUsuario: number, dto: ActualizarMiPerfilDto) {
    const user = await this.prisma.usuario.findUnique({
      where: { id_usuario: idUsuario },
      select: { id_usuario: true, estado: true },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    if (!user.estado) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    if (dto.id_genero !== undefined) {
      const genero = await this.prisma.genero.findUnique({
        where: { id_genero: dto.id_genero },
        select: { id_genero: true },
      });

      if (!genero) {
        throw new BadRequestException('Género inválido');
      }
    }

    const data: Prisma.usuarioUncheckedUpdateInput = {};

    if (dto.nombre !== undefined) {
      data.nombre = dto.nombre.trim();
    }

    if (dto.apellido !== undefined) {
      data.apellido = dto.apellido.trim();
    }

    if (dto.telefono !== undefined) {
      data.telefono = dto.telefono.trim() || null;
    }

    if (dto.fecha_nacimiento !== undefined) {
      data.fecha_nacimiento = dto.fecha_nacimiento
        ? new Date(dto.fecha_nacimiento)
        : null;
    }

    if (dto.id_genero !== undefined) {
      data.id_genero = dto.id_genero;
    }

    await this.prisma.usuario.update({
      where: { id_usuario: idUsuario },
      data,
    });

    return this.getMe(idUsuario);
  }

  async actualizarFotoPerfil(idUsuario: number, imageUrl: string) {
    const user = await this.prisma.usuario.findUnique({
      where: { id_usuario: idUsuario },
      select: { id_usuario: true, estado: true },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    if (!user.estado) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    await this.prisma.usuario.update({
      where: { id_usuario: idUsuario },
      data: {
        img_url: imageUrl,
      },
    });

    return this.getMe(idUsuario);
  }
}