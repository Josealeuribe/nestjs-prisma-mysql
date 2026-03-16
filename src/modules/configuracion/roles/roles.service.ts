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

<<<<<<< HEAD
const rolDetailSelect = Prisma.validator<Prisma.rolesSelect>()({
=======
const rolSelect = {
>>>>>>> 1d97f8d42da8fa688f1e06bedcb6a1393c7aff1a
  id_rol: true,
  nombre_rol: true,
  descripcion: true,
  estado: true,
  _count: {
    select: {
      usuario: true,
    },
  },
  roles_permisos: {
    select: {
<<<<<<< HEAD
      id_permiso: true,
=======
>>>>>>> 1d97f8d42da8fa688f1e06bedcb6a1393c7aff1a
      permisos: {
        select: {
          id_permiso: true,
          nombre_permiso: true,
        },
      },
    },
<<<<<<< HEAD
    orderBy: {
      id_permiso: 'asc',
    },
  },
});

type RolDetail = Prisma.rolesGetPayload<{
  select: typeof rolDetailSelect;
}>;
=======
  },
} satisfies Prisma.rolesSelect;
>>>>>>> 1d97f8d42da8fa688f1e06bedcb6a1393c7aff1a

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) { }

  private async validarPermisos(idsPermisos: number[]) {
    if (!idsPermisos?.length) return;

    const idsUnicos = [...new Set(idsPermisos)];
    const permisos = await this.prisma.permisos.findMany({
      where: { id_permiso: { in: idsUnicos } },
      select: { id_permiso: true },
    });

    const encontrados = new Set(permisos.map((p) => p.id_permiso));
    const faltantes = idsUnicos.filter((id) => !encontrados.has(id));

    if (faltantes.length) {
      throw new BadRequestException(
        `Permiso(s) inválido(s): ${faltantes.join(', ')}`,
      );
    }
  }

  async create(dto: CreateRolDto) {
    const idsPermisos = dto.ids_permisos ? [...new Set(dto.ids_permisos)] : [];

    await this.validarPermisos(idsPermisos);

<<<<<<< HEAD
  async create(dto: CreateRolDto): Promise<RolDetail> {
    const idsPermisos = this.normalizeIds(dto.ids_permisos);

    await this.ensurePermisosExist(idsPermisos);

    try {
      const nuevoRol = await this.prisma.$transaction(async (tx) => {
=======
    try {
      return await this.prisma.$transaction(async (tx) => {
>>>>>>> 1d97f8d42da8fa688f1e06bedcb6a1393c7aff1a
        const rol = await tx.roles.create({
          data: {
            nombre_rol: dto.nombre_rol.trim(),
            descripcion: dto.descripcion.trim(),
            estado: dto.estado ?? true,
<<<<<<< HEAD
          },
        });

        if (idsPermisos.length > 0) {
          await tx.roles_permisos.createMany({
            data: idsPermisos.map((id_permiso) => ({
              id_rol: rol.id_rol,
              id_permiso,
            })),
            skipDuplicates: true,
          });
        }

=======
            ...(idsPermisos.length
              ? {
                roles_permisos: {
                  create: idsPermisos.map((id_permiso) => ({
                    id_permiso,
                  })),
                },
              }
              : {}),
          },
          select: rolSelect,
        });

>>>>>>> 1d97f8d42da8fa688f1e06bedcb6a1393c7aff1a
        return rol;
      });

      return this.findOne(nuevoRol.id_rol);
    } catch (e: unknown) {
      if (isUniqueConstraintError(e, 'nombre_rol')) {
        throw new BadRequestException('Ya existe un rol con ese nombre');
      }
      throw e;
    }
  }

<<<<<<< HEAD
  async findAll(params?: { incluirInactivos?: boolean }): Promise<RolDetail[]> {
=======
  async findAll(params?: { incluirInactivos?: boolean }) {
>>>>>>> 1d97f8d42da8fa688f1e06bedcb6a1393c7aff1a
    const incluirInactivos = params?.incluirInactivos ?? false;

    return this.prisma.roles.findMany({
      where: incluirInactivos ? {} : { estado: true },
      orderBy: { id_rol: 'asc' },
<<<<<<< HEAD
      select: rolDetailSelect,
    });
  }

  async findOne(id_rol: number): Promise<RolDetail> {
    const rol = await this.prisma.roles.findUnique({
      where: { id_rol },
      select: rolDetailSelect,
=======
      select: rolSelect,
    });
  }

  async findOne(id_rol: number) {
    const rol = await this.prisma.roles.findUnique({
      where: { id_rol },
      select: rolSelect,
>>>>>>> 1d97f8d42da8fa688f1e06bedcb6a1393c7aff1a
    });

    if (!rol) {
      throw new NotFoundException('Rol no encontrado');
    }

    return rol;
  }

<<<<<<< HEAD
  async update(id_rol: number, dto: UpdateRolDto): Promise<RolDetail> {
    await this.ensureExists(id_rol);

    if (dto.estado === false) {
      await this.ensureNoUsersAssigned(id_rol);
    }

    const idsPermisos =
      dto.ids_permisos !== undefined
        ? this.normalizeIds(dto.ids_permisos)
        : undefined;

    if (idsPermisos !== undefined) {
      await this.ensurePermisosExist(idsPermisos);
    }
=======
  async asignarPermisos(id_rol: number, idsPermisos: number[]) {
    await this.findOne(id_rol);
>>>>>>> 1d97f8d42da8fa688f1e06bedcb6a1393c7aff1a

    const idsUnicos = [...new Set(idsPermisos)];
    await this.validarPermisos(idsUnicos);

    return this.prisma.$transaction(async (tx) => {
      await tx.roles_permisos.deleteMany({
        where: { id_rol },
      });

      if (idsUnicos.length) {
        await tx.roles_permisos.createMany({
          data: idsUnicos.map((id_permiso) => ({
            id_rol,
            id_permiso,
          })),
          skipDuplicates: true,
        });
      }

      return tx.roles.findUnique({
        where: { id_rol },
        select: rolSelect,
      });
    });
  }

  async update(id_rol: number, dto: UpdateRolDto) {
    await this.findOne(id_rol);

    const idsPermisos = dto.ids_permisos
      ? [...new Set(dto.ids_permisos)]
      : undefined;

    if (idsPermisos) {
      await this.validarPermisos(idsPermisos);
    }

    // No permitir desactivar roles con usuarios asignados
    if (dto.estado === false) {
      const totalUsuarios = await this.prisma.usuario.count({
        where: { id_rol },
      });

      if (totalUsuarios > 0) {
        throw new BadRequestException(
          'No se puede desactivar el rol porque tiene usuarios asignados',
        );
      }
    }

    const data: Prisma.rolesUpdateInput = {};

    if (dto.nombre_rol !== undefined) {
      data.nombre_rol = dto.nombre_rol.trim();
    }

    if (dto.descripcion !== undefined) {
      data.descripcion = dto.descripcion.trim();
    }

    if (dto.estado !== undefined) {
      data.estado = dto.estado;
    }

    try {
<<<<<<< HEAD
      await this.prisma.$transaction(async (tx) => {
        await tx.roles.update({
          where: { id_rol },
          data,
        });

=======
      return await this.prisma.$transaction(async (tx) => {
>>>>>>> 1d97f8d42da8fa688f1e06bedcb6a1393c7aff1a
        if (idsPermisos !== undefined) {
          await tx.roles_permisos.deleteMany({
            where: { id_rol },
          });

<<<<<<< HEAD
          if (idsPermisos.length > 0) {
=======
          if (idsPermisos.length) {
>>>>>>> 1d97f8d42da8fa688f1e06bedcb6a1393c7aff1a
            await tx.roles_permisos.createMany({
              data: idsPermisos.map((id_permiso) => ({
                id_rol,
                id_permiso,
              })),
              skipDuplicates: true,
            });
          }
        }
<<<<<<< HEAD
=======

        return tx.roles.update({
          where: { id_rol },
          data,
          select: rolSelect,
        });
>>>>>>> 1d97f8d42da8fa688f1e06bedcb6a1393c7aff1a
      });

      return this.findOne(id_rol);
    } catch (e: unknown) {
      if (isUniqueConstraintError(e, 'nombre_rol')) {
        throw new BadRequestException('Ya existe un rol con ese nombre');
      }
      throw e;
    }
  }

<<<<<<< HEAD
  async asignarPermisos(
    id_rol: number,
    dto: AsignarPermisosRolDto,
  ): Promise<RolDetail> {
    await this.ensureExists(id_rol);

    const idsPermisos = this.normalizeIds(dto.ids_permisos);

    await this.ensurePermisosExist(idsPermisos);

    await this.prisma.$transaction(async (tx) => {
      await tx.roles_permisos.deleteMany({
        where: { id_rol },
      });

      if (idsPermisos.length > 0) {
        await tx.roles_permisos.createMany({
          data: idsPermisos.map((id_permiso) => ({
            id_rol,
            id_permiso,
          })),
          skipDuplicates: true,
        });
      }
    });

    return this.findOne(id_rol);
  }

  async remove(id_rol: number): Promise<RolDetail> {
    await this.ensureExists(id_rol);
    await this.ensureNoUsersAssigned(id_rol);

    await this.prisma.roles.update({
=======
  async remove(id_rol: number): Promise<roles> {
    await this.findOne(id_rol);

    const totalUsuarios = await this.prisma.usuario.count({
      where: { id_rol },
    });

    if (totalUsuarios > 0) {
      throw new BadRequestException(
        'No se puede eliminar el rol porque tiene usuarios asignados',
      );
    }

    return this.prisma.roles.delete({
>>>>>>> 1d97f8d42da8fa688f1e06bedcb6a1393c7aff1a
      where: { id_rol },
    });

    return this.findOne(id_rol);
  }

  private async ensureExists(id_rol: number): Promise<roles> {
    const rol = await this.prisma.roles.findUnique({
      where: { id_rol },
    });

    if (!rol) {
      throw new NotFoundException('Rol no encontrado');
    }

    return rol;
  }

  private normalizeIds(ids?: number[]): number[] {
    if (!ids?.length) return [];

    return [
      ...new Set(ids.map(Number).filter((n) => Number.isInteger(n) && n > 0)),
    ];
  }

  private async ensurePermisosExist(idsPermisos: number[]): Promise<void> {
    if (idsPermisos.length === 0) return;

    const permisosExistentes = await this.prisma.permisos.findMany({
      where: {
        id_permiso: {
          in: idsPermisos,
        },
      },
      select: {
        id_permiso: true,
      },
    });

    if (permisosExistentes.length !== idsPermisos.length) {
      throw new BadRequestException('Uno o más permisos no existen');
    }
  }

  private async ensureNoUsersAssigned(id_rol: number): Promise<void> {
    const totalUsuarios = await this.prisma.usuario.count({
      where: { id_rol },
    });

    if (totalUsuarios > 0) {
      throw new BadRequestException(
        'No puedes desactivar este rol porque tiene usuarios asignados',
      );
    }
  }
}