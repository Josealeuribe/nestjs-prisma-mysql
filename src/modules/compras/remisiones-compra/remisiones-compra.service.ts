import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRemisionCompraDto } from './dto/create-remision-compra.dto';
import { UpdateRemisionCompraDto } from './dto/update-remision-compra.dto';
import {
  remisionCompraDetailSelect,
  remisionCompraListSelect,
} from './selects/remisiones-compra.select';

type CreateOpts = {
  idUsuario: number;
  idBodegaActiva: number;
  bodegasPermitidas?: number[];
};

type ScopeOpts = {
  bodegasPermitidas?: number[];
};

@Injectable()
export class RemisionesCompraService {
  constructor(private readonly prisma: PrismaService) {}

  private assertBodegaAccess(idBodega: number, bodegasPermitidas?: number[]) {
    if (!idBodega || Number.isNaN(idBodega)) {
      throw new BadRequestException('Bodega activa inválida');
    }

    if (bodegasPermitidas?.length && !bodegasPermitidas.includes(idBodega)) {
      throw new ForbiddenException('No tienes acceso a esta bodega');
    }
  }

  private async nextCodigoRemisionCompra(
    tx: Prisma.TransactionClient,
    prefix = 'RMC',
    pad = 4,
  ) {
    const last = await tx.remision_compra.findFirst({
      orderBy: { id_remision_compra: 'desc' },
      select: { codigo_remision_compra: true },
    });

    const lastCode =
      last?.codigo_remision_compra ?? `${prefix}-${'0'.repeat(pad)}`;
    const match = lastCode.match(/-(\d+)$/);
    const lastNum = match ? Number(match[1]) : 0;
    const nextNum = lastNum + 1;

    return `${prefix}-${String(nextNum).padStart(pad, '0')}`;
  }

  private async validarCompraYAcceso(
    tx: Prisma.TransactionClient,
    idCompra: number,
    idBodegaActiva?: number,
    bodegasPermitidas?: number[],
  ) {
    const compra = await tx.compras.findUnique({
      where: { id_compra: idCompra },
      select: {
        id_compra: true,
        codigo_compra: true,
        id_bodega: true,
        id_proveedor: true,
        id_estado_compra: true,
        detalle_compra: {
          select: {
            id_producto: true,
            cantidad: true,
            precio_unitario: true,
            id_iva: true,
          },
        },
      },
    });

    if (!compra) {
      throw new NotFoundException('Compra no encontrada');
    }

    if (idBodegaActiva) {
      this.assertBodegaAccess(idBodegaActiva, bodegasPermitidas);
      if (compra.id_bodega !== idBodegaActiva) {
        throw new ForbiddenException(
          'La compra no pertenece a la bodega activa',
        );
      }
    } else if (
      bodegasPermitidas?.length &&
      !bodegasPermitidas.includes(compra.id_bodega)
    ) {
      throw new ForbiddenException('No tienes acceso a esta compra');
    }

    return compra;
  }

  private async validarProveedor(
    tx: Prisma.TransactionClient,
    idProveedor: number,
  ) {
    const proveedor = await tx.proveedor.findUnique({
      where: { id_proveedor: idProveedor },
      select: { id_proveedor: true },
    });

    if (!proveedor) {
      throw new BadRequestException(`Proveedor inválido: ${idProveedor}`);
    }
  }

  private async validarEstadoRemision(
    tx: Prisma.TransactionClient,
    idEstado: number,
  ) {
    const estado = await tx.estado_remision_compra.findUnique({
      where: { id_estado_remision_compra: idEstado },
      select: { id_estado_remision_compra: true },
    });

    if (!estado) {
      throw new BadRequestException(`Estado de remisión inválido: ${idEstado}`);
    }
  }

  private async validarProductosEIvas(
    tx: Prisma.TransactionClient,
    detalle: CreateRemisionCompraDto['detalle'],
  ) {
    const productoIds = [...new Set(detalle.map((d) => d.id_producto))];
    const ivaIds = [...new Set(detalle.map((d) => d.id_iva))];

    const [productos, ivas] = await Promise.all([
      tx.producto.findMany({
        where: { id_producto: { in: productoIds } },
        select: { id_producto: true },
      }),
      tx.iva.findMany({
        where: { id_iva: { in: ivaIds } },
        select: { id_iva: true },
      }),
    ]);

    const productosSet = new Set(productos.map((p) => p.id_producto));
    const ivasSet = new Set(ivas.map((i) => i.id_iva));

    const productosInvalidos = productoIds.filter(
      (id) => !productosSet.has(id),
    );
    const ivasInvalidos = ivaIds.filter((id) => !ivasSet.has(id));

    if (productosInvalidos.length) {
      throw new BadRequestException(
        `Producto(s) inválido(s): ${productosInvalidos.join(', ')}`,
      );
    }

    if (ivasInvalidos.length) {
      throw new BadRequestException(
        `IVA(s) inválido(s): ${ivasInvalidos.join(', ')}`,
      );
    }
  }

  private validarDetalleContraCompra(
    compra: Awaited<ReturnType<RemisionesCompraService['validarCompraYAcceso']>>,
    detalle: CreateRemisionCompraDto['detalle'],
  ) {
    const productosCompra = new Map(
      compra.detalle_compra.map((d) => [d.id_producto, d]),
    );

    for (const item of detalle) {
      const detalleCompra = productosCompra.get(item.id_producto);

      if (!detalleCompra) {
        throw new BadRequestException(
          `El producto ${item.id_producto} no pertenece al detalle de la compra`,
        );
      }

      if (item.id_iva !== detalleCompra.id_iva) {
        throw new BadRequestException(
          `El IVA del producto ${item.id_producto} no coincide con la compra`,
        );
      }
    }
  }

  async create(dto: CreateRemisionCompraDto, opts: CreateOpts) {
    this.assertBodegaAccess(opts.idBodegaActiva, opts.bodegasPermitidas);

    const ESTADO_INICIAL = 1;

    return this.prisma.$transaction(async (tx) => {
      const compra = await this.validarCompraYAcceso(
        tx,
        dto.id_compra,
        opts.idBodegaActiva,
        opts.bodegasPermitidas,
      );

      await this.validarProveedor(tx, dto.id_proveedor);
      await this.validarEstadoRemision(tx, ESTADO_INICIAL);
      await this.validarProductosEIvas(tx, dto.detalle);

      if (compra.id_proveedor !== dto.id_proveedor) {
        throw new BadRequestException(
          'El proveedor de la remisión no coincide con el proveedor de la compra',
        );
      }

      this.validarDetalleContraCompra(compra, dto.detalle);

      const codigo_remision_compra = await this.nextCodigoRemisionCompra(
        tx,
        'RMC',
        4,
      );

      const created = await tx.remision_compra.create({
        data: {
          codigo_remision_compra,
          fecha_creacion: new Date(),
          fecha_vencimiento: dto.fecha_vencimiento
            ? new Date(dto.fecha_vencimiento)
            : null,
          observaciones: dto.observaciones ?? null,
          id_compra: dto.id_compra,
          id_proveedor: dto.id_proveedor,
          id_estado_remision_compra: ESTADO_INICIAL,
          id_usuario_creador: opts.idUsuario,

          detalle_remision_compra: {
            create: dto.detalle.map((d) => ({
              id_producto: d.id_producto,
              cantidad: new Prisma.Decimal(d.cantidad),
              precio_unitario: new Prisma.Decimal(d.precio_unitario),
              id_iva: d.id_iva,
              lote: d.lote ?? '',
              fecha_vencimiento: d.fecha_vencimiento
                ? new Date(d.fecha_vencimiento)
                : null,
              cod_barras: d.cod_barras ?? null,
              nota: d.nota ?? null,
            })),
          },
        },
        select: remisionCompraDetailSelect,
      });

      return created;
    });
  }

  async findAll(args: {
    idBodegaActiva: number;
    bodegasPermitidas?: number[];
    idCompra?: number;
  }) {
    this.assertBodegaAccess(args.idBodegaActiva, args.bodegasPermitidas);

    return this.prisma.remision_compra.findMany({
      where: {
        ...(args.idCompra ? { id_compra: args.idCompra } : {}),
        compras: {
          id_bodega: args.idBodegaActiva,
        },
      },
      orderBy: { id_remision_compra: 'desc' },
      select: remisionCompraListSelect,
    });
  }

  async findOne(id: number, opts?: ScopeOpts) {
    const remision = await this.prisma.remision_compra.findUnique({
      where: { id_remision_compra: id },
      select: remisionCompraDetailSelect,
    });

    if (!remision) {
      throw new NotFoundException('Remisión de compra no encontrada');
    }

    const idBodega = remision.compras.id_bodega;

    if (opts?.bodegasPermitidas?.length && !opts.bodegasPermitidas.includes(idBodega)) {
      throw new ForbiddenException('No tienes acceso a esta remisión');
    }

    return remision;
  }

  async update(
    id: number,
    dto: UpdateRemisionCompraDto,
    opts: { idUsuario: number; bodegasPermitidas?: number[] },
  ) {
    const actual = await this.findOne(id, {
      bodegasPermitidas: opts.bodegasPermitidas,
    });

    return this.prisma.$transaction(async (tx) => {
      if (dto.id_estado_remision_compra) {
        await this.validarEstadoRemision(tx, dto.id_estado_remision_compra);
      }

      if (dto.id_proveedor) {
        await this.validarProveedor(tx, dto.id_proveedor);

        if (dto.id_proveedor !== actual.id_proveedor) {
          throw new BadRequestException(
            'No puedes cambiar el proveedor de una remisión a uno distinto de la compra',
          );
        }
      }

      if (dto.detalle?.length) {
        const compra = await this.validarCompraYAcceso(
          tx,
          actual.id_compra,
          undefined,
          opts.bodegasPermitidas,
        );

        await this.validarProductosEIvas(tx, dto.detalle);
        this.validarDetalleContraCompra(compra, dto.detalle);

        await tx.detalle_remision_compra.deleteMany({
          where: { id_remision_compra: id },
        });

        await tx.detalle_remision_compra.createMany({
          data: dto.detalle.map((d) => ({
            id_remision_compra: id,
            id_producto: d.id_producto,
            cantidad: new Prisma.Decimal(d.cantidad),
            precio_unitario: new Prisma.Decimal(d.precio_unitario),
            id_iva: d.id_iva,
            lote: d.lote ?? '',
            fecha_vencimiento: d.fecha_vencimiento
              ? new Date(d.fecha_vencimiento)
              : null,
            cod_barras: d.cod_barras ?? null,
            nota: d.nota ?? null,
          })),
        });
      }

      const updated = await tx.remision_compra.update({
        where: { id_remision_compra: id },
        data: {
          observaciones: dto.observaciones ?? undefined,
          fecha_vencimiento: dto.fecha_vencimiento
            ? new Date(dto.fecha_vencimiento)
            : undefined,
          id_estado_remision_compra:
            dto.id_estado_remision_compra ?? undefined,
        },
        select: remisionCompraDetailSelect,
      });

      return updated;
    });
  }
}
