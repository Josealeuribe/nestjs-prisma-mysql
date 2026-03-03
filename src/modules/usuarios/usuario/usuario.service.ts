import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';
import * as bcrypt from 'bcrypt';
import { usuarioSelect } from './selects/usuario.select';
import { Prisma } from '@prisma/client';
import { ListUsuarioQueryDto } from './dto/list-usuario.query.dto';

export type UsuarioPayload = Prisma.usuarioGetPayload<{
  select: typeof usuarioSelect;
}>;

export type UsuariosFindAllResponse =
  | UsuarioPayload[]
  | {
      page: number;
      limit: number;
      total: number;
      pages: number;
      data: UsuarioPayload[];
    };

@Injectable()
export class UsuarioService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: ListUsuarioQueryDto = {},
  ): Promise<UsuariosFindAllResponse> {
    const where: Prisma.usuarioWhereInput = {};

    if (query.estado !== undefined) where.estado = query.estado === 'true';

    if (query.q && query.q.trim()) {
      const q = query.q.trim();
      where.OR = [
        { nombre: { contains: q } },
        { apellido: { contains: q } },
        { email: { contains: q } },
        { num_documento: { contains: q } },
      ];
    }

    const hasPagination = query.page !== undefined || query.limit !== undefined;

    if (!hasPagination) {
      return this.prisma.usuario.findMany({
        where,
        orderBy: { id_usuario: 'desc' },
        select: usuarioSelect,
      });
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const [total, data] = await this.prisma.$transaction([
      this.prisma.usuario.count({ where }),
      this.prisma.usuario.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id_usuario: 'desc' },
        select: usuarioSelect,
      }),
    ]);

    return { page, limit, total, pages: Math.ceil(total / limit), data };
  }

  async findOne(id: number): Promise<UsuarioPayload> {
    const user = await this.prisma.usuario.findUnique({
      where: { id_usuario: id },
      select: usuarioSelect,
    });

    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async create(dto: CrearUsuarioDto) {
    // ✅ Hashear contraseña
    const hash = await bcrypt.hash(dto.contrasena, 10);

    // ✅ Convertir fecha (si viene). En Postman envíala "YYYY-MM-DD"
    const fechaNacimiento = dto.fecha_nacimiento
      ? new Date(dto.fecha_nacimiento)
      : null;

    return this.prisma.usuario.create({
      data: {
        nombre: dto.nombre,
        apellido: dto.apellido,
        id_tipo_doc: dto.id_tipo_doc,
        num_documento: dto.num_documento,
        email: dto.email,
        contrasena: hash,
        id_rol: dto.id_rol,
        estado: dto.estado ?? true,

        // ✅ Campos nuevos (opcionales)
        telefono: dto.telefono ?? null,
        fecha_nacimiento: fechaNacimiento,
        img_url: dto.img_url ?? null,
        id_genero: dto.id_genero ?? null,
      },
      select: usuarioSelect,
    });
  }

  async update(id: number, dto: ActualizarUsuarioDto) {
    const exists = await this.prisma.usuario.findUnique({
      where: { id_usuario: id },
      select: { id_usuario: true },
    });

    if (!exists) throw new NotFoundException('Usuario no encontrado');

    // ✅ Tipado fuerte con Prisma
    const data: Prisma.usuarioUpdateInput = { ...dto };

    // ✅ Si actualizan contraseña, hasheamos
    if (dto.contrasena) {
      data.contrasena = await bcrypt.hash(dto.contrasena, 10);
    }

    // ✅ Si actualizan fecha_nacimiento (string), convertir a Date
    if (dto.fecha_nacimiento) {
      data.fecha_nacimiento = new Date(dto.fecha_nacimiento);
    }

    return this.prisma.usuario.update({
      where: { id_usuario: id },
      data,
      select: usuarioSelect,
    });
  }

  async remove(id: number) {
    const exists = await this.prisma.usuario.findUnique({
      where: { id_usuario: id },
      select: { id_usuario: true },
    });

    if (!exists) throw new NotFoundException('Usuario no encontrado');

    return this.prisma.usuario.delete({
      where: { id_usuario: id },
      select: usuarioSelect,
    });
  }
}
