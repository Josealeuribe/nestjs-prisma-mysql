import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AsignarBodegaUsuarioDto } from './dto/asignar-bodega-usuario.dto';

type PrismaKnownError = { code: string; meta?: unknown };

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
function isPrismaKnownError(e: unknown): e is PrismaKnownError {
  return isObject(e) && typeof e['code'] === 'string';
}

@Injectable()
export class BodegasPorUsuarioService {
  constructor(private readonly prisma: PrismaService) {}

  async asignar(dto: AsignarBodegaUsuarioDto) {
    // valida que existan
    const [usuario, bodega] = await Promise.all([
      this.prisma.usuario.findUnique({ where: { id_usuario: dto.id_usuario } }),
      this.prisma.bodega.findUnique({ where: { id_bodega: dto.id_bodega } }),
    ]);

    if (!usuario) throw new NotFoundException('Usuario no existe');
    if (!bodega) throw new NotFoundException('Bodega no existe');

    try {
      return await this.prisma.bodegas_por_usuario.create({
        data: {
          id_usuario: dto.id_usuario,
          id_bodega: dto.id_bodega,
        },
      });
    } catch (e: unknown) {
      // P2002: unique constraint (ya existe esa asignación)
      if (isPrismaKnownError(e) && e.code === 'P2002') {
        throw new BadRequestException(
          'El usuario ya tiene asignada esa bodega',
        );
      }
      throw e;
    }
  }

  async quitar(id_usuario: number, id_bodega: number) {
    // si no existe, prisma tira error; mejor validar
    const existe = await this.prisma.bodegas_por_usuario.findUnique({
      where: { id_usuario_id_bodega: { id_usuario, id_bodega } },
    });
    if (!existe) throw new NotFoundException('Asignación no encontrada');

    return this.prisma.bodegas_por_usuario.delete({
      where: { id_usuario_id_bodega: { id_usuario, id_bodega } },
    });
  }

  async bodegasDeUsuario(id_usuario: number) {
    return this.prisma.bodegas_por_usuario.findMany({
      where: { id_usuario },
      include: { bodega: true },
      orderBy: { id_bodega: 'asc' },
    });
  }

  async misBodegas(id_usuario: number) {
    return this.bodegasDeUsuario(id_usuario);
  }
}
