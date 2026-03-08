import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { permisos } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePermisoDto } from './dto/create-permiso.dto';
import { UpdatePermisoDto } from './dto/update-permiso.dto';

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
export class PermisosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePermisoDto): Promise<permisos> {
    try {
      return await this.prisma.permisos.create({
        data: {
          nombre_permiso: dto.nombre_permiso.trim(),
        },
      });
    } catch (e: unknown) {
      if (isUniqueConstraintError(e, 'nombre_permiso')) {
        throw new BadRequestException(
          'Ya existe un permiso con ese nombre_permiso',
        );
      }
      throw e;
    }
  }

  async findAll(): Promise<permisos[]> {
    return this.prisma.permisos.findMany({
      orderBy: { id_permiso: 'asc' },
    });
  }

  async findOne(id_permiso: number): Promise<permisos> {
    const permiso = await this.prisma.permisos.findUnique({
      where: { id_permiso },
    });

    if (!permiso) {
      throw new NotFoundException('Permiso no encontrado');
    }

    return permiso;
  }

  async update(id_permiso: number, dto: UpdatePermisoDto): Promise<permisos> {
    await this.findOne(id_permiso);

    try {
      return await this.prisma.permisos.update({
        where: { id_permiso },
        data: {
          ...(dto.nombre_permiso !== undefined && {
            nombre_permiso: dto.nombre_permiso.trim(),
          }),
        },
      });
    } catch (e: unknown) {
      if (isUniqueConstraintError(e, 'nombre_permiso')) {
        throw new BadRequestException(
          'Ya existe un permiso con ese nombre_permiso',
        );
      }
      throw e;
    }
  }

  async remove(id_permiso: number): Promise<permisos> {
    await this.findOne(id_permiso);

    return this.prisma.permisos.delete({
      where: { id_permiso },
    });
  }
}
