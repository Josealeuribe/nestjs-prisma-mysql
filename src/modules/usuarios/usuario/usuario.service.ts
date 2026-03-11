import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
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

    if (query.estado !== undefined) {
      where.estado = query.estado === 'true';
    }

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

    return {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      data,
    };
  }

  async findOne(id: number): Promise<UsuarioPayload> {
    const user = await this.prisma.usuario.findUnique({
      where: { id_usuario: id },
      select: usuarioSelect,
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  async create(dto: CrearUsuarioDto): Promise<UsuarioPayload> {
    try {
      const systemGeneratedSecret = randomBytes(32).toString('hex');
      const passwordHash = await bcrypt.hash(systemGeneratedSecret, 10);

      const fechaNacimiento = dto.fecha_nacimiento
        ? new Date(dto.fecha_nacimiento)
        : null;

      return await this.prisma.usuario.create({
        data: {
          nombre: dto.nombre.trim(),
          apellido: dto.apellido.trim(),
          id_tipo_doc: dto.id_tipo_doc,
          num_documento: dto.num_documento.trim(),
          email: dto.email.trim().toLowerCase(),
          contrasena: passwordHash,
          id_rol: dto.id_rol,
          estado: dto.estado ?? true,
          telefono: dto.telefono?.trim() || null,
          fecha_nacimiento: fechaNacimiento,
          img_url: dto.img_url?.trim() || null,
          id_genero: dto.id_genero ?? null,
        },
        select: usuarioSelect,
      });
    } catch (error: any) {
      this.handlePrismaError(error);
    }
  }

  async update(id: number, dto: ActualizarUsuarioDto): Promise<UsuarioPayload> {
    const exists = await this.prisma.usuario.findUnique({
      where: { id_usuario: id },
      select: { id_usuario: true },
    });

    if (!exists) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // IMPORTANTE:
    // usamos UncheckedUpdateInput para poder actualizar FK directas
    // como id_tipo_doc, id_rol e id_genero.
    const data: Prisma.usuarioUncheckedUpdateInput = {};

    if (dto.nombre !== undefined) {
      data.nombre = dto.nombre.trim();
    }

    if (dto.apellido !== undefined) {
      data.apellido = dto.apellido.trim();
    }

    if (dto.id_tipo_doc !== undefined) {
      data.id_tipo_doc = dto.id_tipo_doc;
    }

    if (dto.num_documento !== undefined) {
      data.num_documento = dto.num_documento.trim();
    }

    if (dto.email !== undefined) {
      data.email = dto.email.trim().toLowerCase();
    }

    if (dto.id_rol !== undefined) {
      data.id_rol = dto.id_rol;
    }

    if (dto.estado !== undefined) {
      data.estado = dto.estado;
    }

    if (dto.telefono !== undefined) {
      data.telefono = dto.telefono?.trim() || null;
    }

    if (dto.fecha_nacimiento !== undefined) {
      data.fecha_nacimiento = dto.fecha_nacimiento
        ? new Date(dto.fecha_nacimiento)
        : null;
    }

    if (dto.img_url !== undefined) {
      data.img_url = dto.img_url?.trim() || null;
    }

    if (dto.id_genero !== undefined) {
      data.id_genero = dto.id_genero ?? null;
    }

    try {
      return await this.prisma.usuario.update({
        where: { id_usuario: id },
        data,
        select: usuarioSelect,
      });
    } catch (error: any) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: number): Promise<UsuarioPayload> {
    const exists = await this.prisma.usuario.findUnique({
      where: { id_usuario: id },
      select: { id_usuario: true },
    });

    if (!exists) {
      throw new NotFoundException('Usuario no encontrado');
    }

    try {
      return await this.prisma.usuario.delete({
        where: { id_usuario: id },
        select: usuarioSelect,
      });
    } catch (error: any) {
      this.handlePrismaError(error);
    }
  }

  private handlePrismaError(error: any): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      const target = Array.isArray(error.meta?.target)
        ? error.meta.target.join(', ')
        : String(error.meta?.target ?? '');

      if (target.includes('email')) {
        throw new BadRequestException('El correo ya está registrado');
      }

      if (target.includes('num_documento')) {
        throw new BadRequestException(
          'El número de documento ya está registrado',
        );
      }

      throw new BadRequestException(
        'Ya existe un registro con datos únicos duplicados',
      );
    }

    throw error;
  }
}
