import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaClient } from '@prisma/client/extension';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCompraDto } from './dto/create-compra.dto';
import { UpdateCompraDto } from './dto/update-compra.dto';
import { compraDetailSelect, compraListSelect } from './selects/compras.select';

type CreateOpts = {
  idUsuario: number;
  idBodegaActiva: number;
  bodegasPermitidas?: number[];
};

type ScopeOpts = {
  bodegasPermitidas?: number[];
};

@Injectable()
export class ComprasService {
  constructor(private readonly prisma: PrismaService) {}

  // -------------------------
  // Helpers de seguridad
  // -------------------------
  private assertBodegaAccess(idBodega: number, bodegasPermitidas?: number[]) {
    if (!idBodega || Number.isNaN(idBodega)) {
      throw new BadRequestException('Bodega activa inválida');
    }
    if (bodegasPermitidas?.length && !bodegasPermitidas.includes(idBodega)) {
      throw new ForbiddenException('No tienes acceso a esta bodega');
    }
  }

  private compraWhereScope(opts?: ScopeOpts): Prisma.comprasWhereInput {
    if (opts?.bodegasPermitidas?.length) {
      return { id_bodega: { in: opts.bodegasPermitidas } };
    }
    return {};
  }

  // -------------------------
  // Código CMP-0001 (backend)
  // -------------------------
  private async nextCodigoCompra(tx: PrismaClient, prefix = 'CMP', pad = 4) {
    const last = await tx.compras.findFirst({
      orderBy: { id_compra: 'desc' },
      select: { codigo_compra: true },
    });

    const lastCode = last?.codigo_compra ?? `${prefix}-${'0'.repeat(pad)}`;
    const match = lastCode.match(/-(\d+)$/);
    const lastNum = match ? Number(match[1]) : 0;
    const nextNum = lastNum + 1;

    const nextCode = `${prefix}-${String(nextNum).padStart(pad, '0')}`;
    return nextCode;
  }

  // -------------------------
  // Cálculo de totales
  // -------------------------
  private async calcularTotales(
    tx: PrismaClient,
    detalle: CreateCompraDto['detalle'],
  ) {
    // Traemos porcentajes de IVA en 1 consulta (evita N+1)
    const ivaIds = [...new Set(detalle.map((d) => d.id_iva))];

    const ivas = await tx.iva.findMany({
      where: { id_iva: { in: ivaIds } },
      select: { id_iva: true, porcentaje: true },
    });

    const ivaMap = new Map<number, Prisma.Decimal>();
    for (const i of ivas) ivaMap.set(i.id_iva, i.porcentaje);

    // valida que existan todos los IVA
    for (const item of detalle) {
      if (!ivaMap.has(item.id_iva)) {
        throw new BadRequestException(`IVA inválido: ${item.id_iva}`);
      }
    }

    let subtotal = new Prisma.Decimal(0);
    let totalIva = new Prisma.Decimal(0);

    for (const item of detalle) {
      const qty = new Prisma.Decimal(item.cantidad);
      const price = new Prisma.Decimal(item.precio_unitario);
      const lineSub = qty.mul(price);

      const pct = ivaMap.get(item.id_iva)!; // decimal (ej 19.00)
      const lineIva = lineSub.mul(pct).div(100);

      subtotal = subtotal.add(lineSub);
      totalIva = totalIva.add(lineIva);
    }

    const total = subtotal.add(totalIva);

    // Redondeo a 2 decimales (si deseas)
    const r2 = (d: Prisma.Decimal) => new Prisma.Decimal(d.toFixed(2));

    return {
      subtotal: r2(subtotal),
      total_iva: r2(totalIva),
      total: r2(total),
    };
  }

  // -------------------------
  // CRUD
  // -------------------------

  async create(dto: CreateCompraDto, opts: CreateOpts) {
    this.assertBodegaAccess(opts.idBodegaActiva, opts.bodegasPermitidas);

    // estado inicial (ajusta al id real que uses en estado_compra)
    const ESTADO_INICIAL = 1;

    return this.prisma.$transaction(async (tx) => {
      const codigo_compra = await this.nextCodigoCompra(tx, 'CMP', 4);
      const totales = await this.calcularTotales(tx, dto.detalle);

      const compra = await tx.compras.create({
        data: {
          codigo_compra,
          fecha_solicitud: new Date(), // hoy
          id_proveedor: dto.id_proveedor,
          id_termino_pago: dto.id_termino_pago,
          descripcion: dto.descripcion ?? null,

          subtotal: totales.subtotal,
          total_iva: totales.total_iva,
          total: totales.total,

          id_estado_compra: ESTADO_INICIAL,
          id_usuario_creador: opts.idUsuario,
          id_bodega: opts.idBodegaActiva,
          fecha_entrega: dto.fecha_entrega ? new Date(dto.fecha_entrega) : null,

          detalle_compra: {
            create: dto.detalle.map((d) => ({
              id_producto: d.id_producto,
              cantidad: new Prisma.Decimal(d.cantidad),
              precio_unitario: new Prisma.Decimal(d.precio_unitario),
              id_iva: d.id_iva,
            })),
          },
        },
        select: compraDetailSelect,
      });

      return compra;
    });
  }

  async findAll(args: { idBodegaScope: number; bodegasPermitidas?: number[] }) {
    this.assertBodegaAccess(args.idBodegaScope, args.bodegasPermitidas);

    return this.prisma.compras.findMany({
      where: {
        ...this.compraWhereScope({ bodegasPermitidas: args.bodegasPermitidas }),
        id_bodega: args.idBodegaScope,
      },
      orderBy: { id_compra: 'desc' },
      select: compraListSelect,
    });
  }

  async findOne(id: number, opts?: ScopeOpts) {
    const compra = await this.prisma.compras.findUnique({
      where: { id_compra: id },
      select: compraDetailSelect,
    });

    if (!compra) throw new NotFoundException('Compra no encontrada');

    // scope bodega
    if (opts?.bodegasPermitidas?.length && !opts.bodegasPermitidas.includes(compra.id_bodega)) {
      throw new ForbiddenException('No tienes acceso a esta compra');
    }

    return compra;
  }

  async update(id: number, dto: UpdateCompraDto, opts: { idUsuario: number; bodegasPermitidas?: number[] }) {
    const actual = await this.findOne(id, { bodegasPermitidas: opts.bodegasPermitidas });

    // regla opcional: solo creador puede editar (si quieres)
    // if (actual.id_usuario_creador !== opts.idUsuario) {
    //   throw new ForbiddenException('Solo el creador puede editar la compra');
    // }

    // si mandan detalle, recalculamos y reemplazamos detalle completo
    return this.prisma.$transaction(async (tx) => {
      let totales: { subtotal: Prisma.Decimal; total_iva: Prisma.Decimal; total: Prisma.Decimal } | null = null;

      if (dto.detalle?.length) {
        totales = await this.calcularTotales(tx, dto.detalle);

        // borrar detalle actual (por PK compuesta id_compra + id_producto)
        await tx.detalle_compra.deleteMany({ where: { id_compra: id } });

        // crear nuevo detalle
        await tx.detalle_compra.createMany({
          data: dto.detalle.map((d) => ({
            id_compra: id,
            id_producto: d.id_producto,
            cantidad: new Prisma.Decimal(d.cantidad),
            precio_unitario: new Prisma.Decimal(d.precio_unitario),
            id_iva: d.id_iva,
          })),
        });
      }

      const updated = await tx.compras.update({
        where: { id_compra: id },
        data: {
          id_proveedor: dto.id_proveedor ?? undefined,
          id_termino_pago: dto.id_termino_pago ?? undefined,
          descripcion: dto.descripcion ?? undefined,
          fecha_entrega: dto.fecha_entrega ? new Date(dto.fecha_entrega) : undefined,
          id_estado_compra: dto.id_estado_compra ?? undefined,

          ...(totales
            ? { subtotal: totales.subtotal, total_iva: totales.total_iva, total: totales.total }
            : {}),
        },
        select: compraDetailSelect,
      });

      return updated;
    });
  }
}
