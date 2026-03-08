import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, roles } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { AsignarPermisosRolDto } from './dto/asignar-permisos-rol.dto';

type PrismaKnownError = { code: string; meta?: unknown };

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isPrismaKnownError(e: unknown): e is PrismaKnownError {
  return isObject(e) && typeof e['code'] === 'string';
}

function getMetaTarget(meta: unknown): string[] | string | undefined {
  if (!isObject(meta)) return undefined;

  const target = meta['target'];
  if (typeof target === 'string') return target;

  if (Array.isArray(target) && target.every((x) => typeof x === 'string')) {
    return target;
  }

  return undefined;
}

function isUniqueConstraintError(e: unknown, field?: string): boolean {
  if (!isPrismaKnownError(e)) return false;
  if (e.code !== 'P2002') return false;

  if (!field) return true;

  const target = getMetaTarget(e.meta);
  if (!target) return true;

  return Array.isArray(target)
    ? target.includes(field)
    : target.includes(field);
}

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRolDto): Promise<roles> {
    try {
      return await this.prisma.roles.create({
        data: {
          nombre_rol: dto.nombre_rol.trim(),
          estado: dto.estado ?? true,
        },
      });
    } catch (e: unknown) {
      if (isUniqueConstraintError(e, 'nombre_rol')) {
        throw new BadRequestException('Ya existe un rol con ese nombre_rol');
      }
      throw e;
    }
  }

  async findAll(params?: { incluirInactivos?: boolean }) {
    const incluirInactivos = params?.incluirInactivos ?? false;

    return this.prisma.roles.findMany({
      where: incluirInactivos ? {} : { estado: true },
      orderBy: { id_rol: 'asc' },
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
          orderBy: {
            id_permiso: 'asc',
          },
        },
      },
    });
  }

  async findOne(id_rol: number) {
    const rol = await this.prisma.roles.findUnique({
      where: { id_rol },
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
          orderBy: {
            id_permiso: 'asc',
          },
        },
      },
    });

    if (!rol) throw new NotFoundException('Rol no encontrado');
    return rol;
  }

  async update(id_rol: number, dto: UpdateRolDto): Promise<roles> {
    await this.ensureExists(id_rol);

    const data: Prisma.rolesUpdateInput = {};
    if (dto.nombre_rol !== undefined) data.nombre_rol = dto.nombre_rol.trim();
    if (dto.estado !== undefined) data.estado = dto.estado;

    try {
      return await this.prisma.roles.update({
        where: { id_rol },
        data,
      });
    } catch (e: unknown) {
      if (isUniqueConstraintError(e, 'nombre_rol')) {
        throw new BadRequestException('Ya existe un rol con ese nombre_rol');
      }
      throw e;
    }
  }

  async asignarPermisos(id_rol: number, dto: AsignarPermisosRolDto) {
    await this.ensureExists(id_rol);

    const permisosExistentes = await this.prisma.permisos.findMany({
      where: {
        id_permiso: {
          in: dto.permisosIds,
        },
      },
      select: {
        id_permiso: true,
      },
    });

    if (permisosExistentes.length !== dto.permisosIds.length) {
      throw new BadRequestException('Uno o más permisos no existen');
    }

    await this.prisma.$transaction([
      this.prisma.roles_permisos.deleteMany({
        where: { id_rol },
      }),
      this.prisma.roles_permisos.createMany({
        data: dto.permisosIds.map((id_permiso) => ({
          id_rol,
          id_permiso,
        })),
        skipDuplicates: true,
      }),
    ]);

    return this.findOne(id_rol);
  }

  /**
   * Soft delete: desactiva el rol
   */
  async remove(id_rol: number): Promise<roles> {
    await this.ensureExists(id_rol);

    return this.prisma.roles.update({
      where: { id_rol },
      data: { estado: false },
    });
  }

  private async ensureExists(id_rol: number): Promise<roles> {
    const rol = await this.prisma.roles.findUnique({ where: { id_rol } });
    if (!rol) throw new NotFoundException('Rol no encontrado');
    return rol;
  }
}
