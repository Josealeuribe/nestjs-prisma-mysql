import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateBodegaDto } from './dto/create-bodega.dto';
import { UpdateBodegaDto } from './dto/update-bodega.dto';
import { ListBodegaQueryDto } from './dto/list-bodega.query.dto';
import { bodegaSelect } from './selects/bodega.select';
import { PrismaService } from 'src/prisma/prisma.service';

export type BodegaPayload = Prisma.bodegaGetPayload<{
  select: typeof bodegaSelect;
}>;

// Cuando incluyes municipio, Prisma devuelve MÁS campos (no solo select).
// Para no pelear con tipos, lo dejamos como unknown en municipios y el resto flexible.
export type BodegaWithMunicipio = Prisma.bodegaGetPayload<{
  include: { municipios: true };
}>;

export type BodegasFindAllResponse =
  | BodegaPayload[]
  | {
      page: number;
      limit: number;
      total: number;
      pages: number;
      data: (BodegaPayload | BodegaWithMunicipio)[];
    };

@Injectable()
export class BodegaService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertMunicipioExists(id_municipio: number) {
    const exists = await this.prisma.municipios.findUnique({
      where: { id_municipio },
      select: { id_municipio: true },
    });
    if (!exists) throw new BadRequestException('id_municipio no existe');
  }

  async create(dto: CreateBodegaDto): Promise<BodegaPayload> {
    await this.assertMunicipioExists(dto.id_municipio);

    return this.prisma.bodega.create({
      data: {
        nombre_bodega: dto.nombre_bodega.trim(),
        direccion: dto.direccion.trim(),
        id_municipio: dto.id_municipio,
        estado: dto.estado ?? true,
      },
      select: bodegaSelect,
    });
  }

  async findAll(
    query: ListBodegaQueryDto = {},
  ): Promise<BodegasFindAllResponse> {
    const where: Prisma.bodegaWhereInput = {};

    if (query.estado !== undefined) where.estado = query.estado === 'true';
    if (query.id_municipio !== undefined)
      where.id_municipio = query.id_municipio;

    if (query.q && query.q.trim()) {
      const q = query.q.trim();
      where.OR = [
        { nombre_bodega: { contains: q } },
        { direccion: { contains: q } },
      ];
    }

    const includeMunicipio = query.includeMunicipio === 'true';
    const hasPagination = query.page !== undefined || query.limit !== undefined;

    // =========================
    // ✅ MODO LEGACY (sin paginado)
    // =========================
    if (!hasPagination) {
      if (includeMunicipio) {
        // ✅ include SIN select
        return this.prisma.bodega.findMany({
          where,
          orderBy: { id_bodega: 'desc' },
          include: { municipios: true },
        });
      }

      // ✅ select SIN include
      return this.prisma.bodega.findMany({
        where,
        orderBy: { id_bodega: 'desc' },
        select: bodegaSelect,
      });
    }

    // =========================
    // ✅ MODO PAGINADO
    // =========================
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    if (includeMunicipio) {
      // ✅ include SIN select
      const [total, data] = await this.prisma.$transaction([
        this.prisma.bodega.count({ where }),
        this.prisma.bodega.findMany({
          where,
          skip,
          take: limit,
          orderBy: { id_bodega: 'desc' },
          include: { municipios: true },
        }),
      ]);

      return { page, limit, total, pages: Math.ceil(total / limit), data };
    }

    // ✅ select SIN include
    const [total, data] = await this.prisma.$transaction([
      this.prisma.bodega.count({ where }),
      this.prisma.bodega.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id_bodega: 'desc' },
        select: bodegaSelect,
      }),
    ]);

    return { page, limit, total, pages: Math.ceil(total / limit), data };
  }

  async findOne(id: number, includeMunicipio = true) {
    if (includeMunicipio) {
      // ✅ include SIN select
      const bodega = await this.prisma.bodega.findUnique({
        where: { id_bodega: id },
        include: { municipios: true },
      });

      if (!bodega) throw new NotFoundException('Bodega no encontrada');
      return bodega;
    }

    // ✅ select SIN include
    const bodega = await this.prisma.bodega.findUnique({
      where: { id_bodega: id },
      select: bodegaSelect,
    });

    if (!bodega) throw new NotFoundException('Bodega no encontrada');
    return bodega;
  }

  async update(id: number, dto: UpdateBodegaDto): Promise<BodegaPayload> {
    const exists = await this.prisma.bodega.findUnique({
      where: { id_bodega: id },
      select: { id_bodega: true },
    });
    if (!exists) throw new NotFoundException('Bodega no encontrada');

    if (dto.id_municipio !== undefined) {
      await this.assertMunicipioExists(dto.id_municipio);
    }

    return this.prisma.bodega.update({
      where: { id_bodega: id },
      data: {
        nombre_bodega: dto.nombre_bodega?.trim(),
        direccion: dto.direccion?.trim(),
        id_municipio: dto.id_municipio,
        estado: dto.estado,
      },
      select: bodegaSelect,
    });
  }

  async disable(id: number): Promise<BodegaPayload> {
    return this.prisma.bodega.update({
      where: { id_bodega: id },
      data: { estado: false },
      select: bodegaSelect,
    });
  }

  async enable(id: number): Promise<BodegaPayload> {
    return this.prisma.bodega.update({
      where: { id_bodega: id },
      data: { estado: true },
      select: bodegaSelect,
    });
  }
}
