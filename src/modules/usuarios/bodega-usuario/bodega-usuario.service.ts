import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

import { bodegasPorUsuarioSelect } from './selects/bodegas-por-usuario.select';
import { Prisma } from '@prisma/client';
import { AsignarBodegaUsuarioDto } from './dto/asignar-bodega-usuario.dto';

export type BodegaPorUsuarioPayload = Prisma.bodegas_por_usuarioGetPayload<{
  select: typeof bodegasPorUsuarioSelect;
}>;

@Injectable()
export class BodegasPorUsuarioService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<BodegaPorUsuarioPayload[]> {
    return this.prisma.bodegas_por_usuario.findMany({
      orderBy: [{ id_usuario: 'asc' }, { id_bodega: 'asc' }],
      select: bodegasPorUsuarioSelect,
    });
  }

  async findByUsuario(idUsuario: number): Promise<BodegaPorUsuarioPayload[]> {
    return this.prisma.bodegas_por_usuario.findMany({
      where: { id_usuario: idUsuario },
      orderBy: { id_bodega: 'asc' },
      select: bodegasPorUsuarioSelect,
    });
  }

  async create(dto: AsignarBodegaUsuarioDto): Promise<BodegaPorUsuarioPayload> {
    const [usuario, bodega] = await Promise.all([
      this.prisma.usuario.findUnique({
        where: { id_usuario: dto.id_usuario },
        select: { id_usuario: true },
      }),
      this.prisma.bodega.findUnique({
        where: { id_bodega: dto.id_bodega },
        select: { id_bodega: true },
      }),
    ]);

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (!bodega) {
      throw new NotFoundException('Bodega no encontrada');
    }

    try {
      return await this.prisma.bodegas_por_usuario.create({
        data: {
          id_usuario: dto.id_usuario,
          id_bodega: dto.id_bodega,
        },
        select: bodegasPorUsuarioSelect,
      });
    } catch (error: any) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException('La bodega ya está asignada al usuario');
      }

      throw error;
    }
  }

  async remove(
    idUsuario: number,
    idBodega: number,
  ): Promise<BodegaPorUsuarioPayload> {
    const exists = await this.prisma.bodegas_por_usuario.findUnique({
      where: {
        id_usuario_id_bodega: {
          id_usuario: idUsuario,
          id_bodega: idBodega,
        },
      },
      select: {
        id_usuario: true,
        id_bodega: true,
      },
    });

    if (!exists) {
      throw new NotFoundException('La asignación usuario-bodega no existe');
    }

    return this.prisma.bodegas_por_usuario.delete({
      where: {
        id_usuario_id_bodega: {
          id_usuario: idUsuario,
          id_bodega: idBodega,
        },
      },
      select: bodegasPorUsuarioSelect,
    });
  }
}
