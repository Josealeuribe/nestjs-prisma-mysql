import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTrasladoDto } from './dto/create-traslado.dto';
import { UpdateTrasladoDto } from './dto/update-traslado.dto';
import {
  trasladoDetailSelect,
  trasladoListSelect,
} from './selects/traslados.select';

type CreateOpts = {
  idUsuario: number;
  idBodegaActiva: number;
  bodegasPermitidas?: number[];
};

type ScopeOpts = {
  bodegasPermitidas?: number[];
};

@Injectable()
export class TrasladosService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly ESTADO_BORRADOR = 1;
  private readonly ESTADO_EN_TRANSITO = 2;
  private readonly ESTADO_RECIBIDO = 3;
  private readonly ESTADO_ANULADO = 4;

  private assertBodegaAccess(idBodega: number, bodegasPermitidas?: number[]) {
    if (!idBodega || Number.isNaN(idBodega)) {
      throw new BadRequestException('Bodega activa inválida');
    }

    if (bodegasPermitidas?.length && !bodegasPermitidas.includes(idBodega)) {
      throw new ForbiddenException('No tienes acceso a esta bodega');
    }
  }

  private async nextCodigoTraslado(
    tx: Prisma.TransactionClient,
    prefix = 'TRS',
    pad = 4,
  ) {
    const last = await tx.traslado.findFirst({
      orderBy: { id_traslado: 'desc' },
      select: { codigo_traslado: true },
    });

    const lastCode = last?.codigo_traslado ?? `${prefix}-${'0'.repeat(pad)}`;
    const match = lastCode.match(/-(\d+)$/);
    const lastNum = match ? Number(match[1]) : 0;
    const nextNum = lastNum + 1;

    return `${prefix}-${String(nextNum).padStart(pad, '0')}`;
  }

  private async validarEstadoTraslado(
    tx: Prisma.TransactionClient,
    idEstado: number,
  ) {
    const estado = await tx.estado_traslado.findUnique({
      where: { id_estado_traslado: idEstado },
      select: { id_estado_traslado: true },
    });

    if (!estado) {
      throw new BadRequestException(`Estado de traslado inválido: ${idEstado}`);
    }
  }

  private async validarResponsable(
    tx: Prisma.TransactionClient,
    idUsuario: number,
  ) {
    const usuario = await tx.usuario.findUnique({
      where: { id_usuario: idUsuario },
      select: { id_usuario: true },
    });

    if (!usuario) {
      throw new BadRequestException(
        `Usuario responsable inválido: ${idUsuario}`,
      );
    }
  }

  private async validarBodegas(
    tx: Prisma.TransactionClient,
    idBodegaOrigen: number,
    idBodegaDestino: number,
    opts?: { idBodegaActiva?: number; bodegasPermitidas?: number[] },
  ) {
    if (idBodegaOrigen === idBodegaDestino) {
      throw new BadRequestException(
        'La bodega origen y la bodega destino no pueden ser iguales',
      );
    }

    const [origen, destino] = await Promise.all([
      tx.bodega.findUnique({
        where: { id_bodega: idBodegaOrigen },
        select: { id_bodega: true },
      }),
      tx.bodega.findUnique({
        where: { id_bodega: idBodegaDestino },
        select: { id_bodega: true },
      }),
    ]);

    if (!origen) {
      throw new BadRequestException(
        `Bodega origen inválida: ${idBodegaOrigen}`,
      );
    }

    if (!destino) {
      throw new BadRequestException(
        `Bodega destino inválida: ${idBodegaDestino}`,
      );
    }

    if (opts?.idBodegaActiva) {
      this.assertBodegaAccess(opts.idBodegaActiva, opts.bodegasPermitidas);

      if (opts.idBodegaActiva !== idBodegaOrigen) {
        throw new ForbiddenException(
          'La bodega activa debe coincidir con la bodega origen del traslado',
        );
      }
    }

    if (opts?.bodegasPermitidas?.length) {
      if (!opts.bodegasPermitidas.includes(idBodegaOrigen)) {
        throw new ForbiddenException(
          'No tienes acceso a la bodega origen del traslado',
        );
      }

      if (!opts.bodegasPermitidas.includes(idBodegaDestino)) {
        throw new ForbiddenException(
          'No tienes acceso a la bodega destino del traslado',
        );
      }
    }
  }

  private async validarExistencias(
    tx: Prisma.TransactionClient,
    idBodegaOrigen: number,
    detalle: CreateTrasladoDto['detalle'],
  ) {
    const existenciaIds = [...new Set(detalle.map((d) => d.id_existencia))];

    const existencias = await tx.existencias.findMany({
      where: {
        id_existencia: { in: existenciaIds },
      },
      select: {
        id_existencia: true,
        id_bodega: true,
        id_producto: true,
        cantidad: true,
        lote: true,
        fecha_vencimiento: true,
        nota: true,
      },
    });

    const existenciasMap = new Map(
      existencias.map((e) => [e.id_existencia, e]),
    );

    for (const item of detalle) {
      const existencia = existenciasMap.get(item.id_existencia);

      if (!existencia) {
        throw new BadRequestException(
          `Existencia inválida: ${item.id_existencia}`,
        );
      }

      if (existencia.id_bodega !== idBodegaOrigen) {
        throw new BadRequestException(
          `La existencia ${item.id_existencia} no pertenece a la bodega origen`,
        );
      }

      const cantidadDisponible = Number(existencia.cantidad);
      if (item.cantidad > cantidadDisponible) {
        throw new BadRequestException(
          `La cantidad solicitada para la existencia ${item.id_existencia} supera la disponible`,
        );
      }
    }
  }

  private async procesarInventarioTraslado(
    tx: Prisma.TransactionClient,
    idTraslado: number,
  ) {
    const traslado = await tx.traslado.findUnique({
      where: { id_traslado: idTraslado },
      select: {
        id_traslado: true,
        id_bodega_origen: true,
        id_bodega_destino: true,
        id_estado_traslado: true,
        detalle_traslado: {
          select: {
            id_existencia: true,
            cantidad: true,
            existencias: {
              select: {
                id_existencia: true,
                id_producto: true,
                id_bodega: true,
                cantidad: true,
                lote: true,
                fecha_vencimiento: true,
                nota: true,
              },
            },
          },
        },
      },
    });

    if (!traslado) {
      throw new NotFoundException('Traslado no encontrado');
    }

    if (traslado.id_estado_traslado !== this.ESTADO_RECIBIDO) {
      throw new BadRequestException(
        'Solo se puede procesar inventario para traslados en estado Recibido',
      );
    }

    for (const item of traslado.detalle_traslado) {
      const origen = item.existencias;
      const cantidadMover = new Prisma.Decimal(item.cantidad);

      const cantidadOrigenActual = new Prisma.Decimal(origen.cantidad);
      if (cantidadOrigenActual.lt(cantidadMover)) {
        throw new BadRequestException(
          `La existencia ${origen.id_existencia} no tiene cantidad suficiente para procesar el traslado`,
        );
      }

      const nuevaCantidadOrigen = cantidadOrigenActual.sub(cantidadMover);

      await tx.existencias.update({
        where: { id_existencia: origen.id_existencia },
        data: {
          cantidad: nuevaCantidadOrigen,
        },
      });

      const destinoExistencia = await tx.existencias.findFirst({
        where: {
          id_producto: origen.id_producto,
          id_bodega: traslado.id_bodega_destino,
          lote: origen.lote,
          fecha_vencimiento: origen.fecha_vencimiento,
        },
        select: {
          id_existencia: true,
          cantidad: true,
        },
      });

      if (destinoExistencia) {
        await tx.existencias.update({
          where: { id_existencia: destinoExistencia.id_existencia },
          data: {
            cantidad: new Prisma.Decimal(destinoExistencia.cantidad).add(
              cantidadMover,
            ),
          },
        });
      } else {
        await tx.existencias.create({
          data: {
            id_producto: origen.id_producto,
            id_bodega: traslado.id_bodega_destino,
            nota: origen.nota ?? null,
            cantidad: cantidadMover,
            fecha_vencimiento: origen.fecha_vencimiento,
            lote: origen.lote ?? '',
          },
        });
      }
    }
  }

  async create(dto: CreateTrasladoDto, opts: CreateOpts) {
    this.assertBodegaAccess(opts.idBodegaActiva, opts.bodegasPermitidas);

    return this.prisma.$transaction(async (tx) => {
      await this.validarBodegas(
        tx,
        dto.id_bodega_origen,
        dto.id_bodega_destino,
        {
          idBodegaActiva: opts.idBodegaActiva,
          bodegasPermitidas: opts.bodegasPermitidas,
        },
      );

      await this.validarEstadoTraslado(tx, this.ESTADO_BORRADOR);
      await this.validarResponsable(tx, opts.idUsuario);
      await this.validarExistencias(tx, dto.id_bodega_origen, dto.detalle);

      const codigo_traslado = await this.nextCodigoTraslado(tx, 'TRS', 4);

      return tx.traslado.create({
        data: {
          id_bodega_origen: dto.id_bodega_origen,
          id_bodega_destino: dto.id_bodega_destino,
          fecha_traslado: dto.fecha_traslado
            ? new Date(dto.fecha_traslado)
            : new Date(),
          nota: dto.nota ?? null,
          id_estado_traslado: this.ESTADO_BORRADOR,
          id_responsable: opts.idUsuario,
          codigo_traslado,
          detalle_traslado: {
            create: dto.detalle.map((d) => ({
              id_existencia: d.id_existencia,
              cantidad: new Prisma.Decimal(d.cantidad),
            })),
          },
        },
        select: trasladoDetailSelect,
      });
    });
  }

  async findAll(args: {
    idBodegaActiva: number;
    bodegasPermitidas?: number[];
  }) {
    this.assertBodegaAccess(args.idBodegaActiva, args.bodegasPermitidas);

    return this.prisma.traslado.findMany({
      where: {
        OR: [
          { id_bodega_origen: args.idBodegaActiva },
          { id_bodega_destino: args.idBodegaActiva },
        ],
      },
      orderBy: { id_traslado: 'desc' },
      select: trasladoListSelect,
    });
  }

  async findOne(id: number, opts?: ScopeOpts) {
    const traslado = await this.prisma.traslado.findUnique({
      where: { id_traslado: id },
      select: trasladoDetailSelect,
    });

    if (!traslado) {
      throw new NotFoundException('Traslado no encontrado');
    }

    if (opts?.bodegasPermitidas?.length) {
      const puedeVerOrigen = opts.bodegasPermitidas.includes(
        traslado.id_bodega_origen,
      );
      const puedeVerDestino = opts.bodegasPermitidas.includes(
        traslado.id_bodega_destino,
      );

      if (!puedeVerOrigen && !puedeVerDestino) {
        throw new ForbiddenException('No tienes acceso a este traslado');
      }
    }

    return traslado;
  }

  async update(
    id: number,
    dto: UpdateTrasladoDto,
    opts: { idUsuario: number; bodegasPermitidas?: number[] },
  ) {
    const actual = await this.findOne(id, {
      bodegasPermitidas: opts.bodegasPermitidas,
    });

    if (
      actual.id_estado_traslado === this.ESTADO_RECIBIDO ||
      actual.id_estado_traslado === this.ESTADO_ANULADO
    ) {
      throw new BadRequestException(
        'No puedes editar un traslado recibido o anulado',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const nuevoOrigen = dto.id_bodega_origen ?? actual.id_bodega_origen;
      const nuevoDestino = dto.id_bodega_destino ?? actual.id_bodega_destino;
      const nuevoEstado = dto.id_estado_traslado ?? actual.id_estado_traslado;

      if (dto.id_bodega_origen || dto.id_bodega_destino) {
        await this.validarBodegas(tx, nuevoOrigen, nuevoDestino, {
          bodegasPermitidas: opts.bodegasPermitidas,
        });
      }

      if (dto.id_estado_traslado) {
        await this.validarEstadoTraslado(tx, dto.id_estado_traslado);
      }

      if (dto.detalle?.length) {
        if (actual.id_estado_traslado !== this.ESTADO_BORRADOR) {
          throw new BadRequestException(
            'Solo puedes editar el detalle de un traslado en borrador',
          );
        }

        await this.validarExistencias(tx, nuevoOrigen, dto.detalle);

        await tx.detalle_traslado.deleteMany({
          where: { id_traslado: id },
        });

        await tx.detalle_traslado.createMany({
          data: dto.detalle.map((d) => ({
            id_traslado: id,
            id_existencia: d.id_existencia,
            cantidad: new Prisma.Decimal(d.cantidad),
          })),
        });
      }

      // ... dentro de tu service y la transacción (tx)

      // 1. Ejecutamos el update y guardamos el resultado directamente
      const updated = await tx.traslado.update({
        where: { id_traslado: id },
        data: {
          id_bodega_origen: dto.id_bodega_origen ?? undefined,
          id_bodega_destino: dto.id_bodega_destino ?? undefined,
          fecha_traslado: dto.fecha_traslado
            ? new Date(dto.fecha_traslado)
            : undefined,
          nota: dto.nota ?? undefined,
          id_estado_traslado: dto.id_estado_traslado ?? undefined,
        },
        select: trasladoDetailSelect,
      });

      // 2. Lógica de negocio
      const debeProcesarInventario =
        actual.id_estado_traslado !== this.ESTADO_RECIBIDO &&
        nuevoEstado === this.ESTADO_RECIBIDO;

      if (debeProcesarInventario) {
        await this.procesarInventarioTraslado(tx, id);
        return tx.traslado.findUniqueOrThrow({
          where: { id_traslado: id },
          select: trasladoDetailSelect,
        });
      }
      return updated;
    });
  }
}
