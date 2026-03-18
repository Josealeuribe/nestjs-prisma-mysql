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
  bodegasPermitidas?: number[];
};

type ScopeOpts = {
  bodegasPermitidas?: number[];
};

@Injectable()
export class TrasladosService {
  constructor(private readonly prisma: PrismaService) { }

  private readonly ESTADO_BORRADOR = 1;
  private readonly ESTADO_EN_TRANSITO = 2;
  private readonly ESTADO_RECIBIDO = 3;
  private readonly ESTADO_ANULADO = 4;

  private assertBodegaAccess(idBodega: number, bodegasPermitidas?: number[]) {
    if (!idBodega || Number.isNaN(idBodega)) {
      throw new BadRequestException('Bodega inválida');
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
    opts?: { bodegasPermitidas?: number[] },
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

  private validarDetalleSinDuplicados(
    detalle: { id_existencia: number; cantidad: number }[],
  ) {
    const agrupado = new Map<number, number>();

    for (const item of detalle) {
      const actual = agrupado.get(item.id_existencia) ?? 0;
      agrupado.set(item.id_existencia, actual + Number(item.cantidad));
    }

    return agrupado;
  }

  private detallePlano(
    detalle: { id_existencia: number; cantidad: number | string }[],
  ) {
    return detalle.map((item) => ({
      id_existencia: item.id_existencia,
      cantidad: Number(item.cantidad),
    }));
  }

  private async reservarExistencias(
    tx: Prisma.TransactionClient,
    detalle: { id_existencia: number; cantidad: number | string }[],
  ) {
    const detalleAgrupado = this.validarDetalleSinDuplicados(
      this.detallePlano(detalle),
    );

    const existenciaIds = [...detalleAgrupado.keys()];

    const existencias = await tx.existencias.findMany({
      where: {
        id_existencia: { in: existenciaIds },
      },
      select: {
        id_existencia: true,
        cantidad_reservada: true,
      },
    });

    const existenciasMap = new Map(
      existencias.map((e) => [e.id_existencia, e]),
    );

    for (const [idExistencia, cantidadReservar] of detalleAgrupado.entries()) {
      const existencia = existenciasMap.get(idExistencia);

      if (!existencia) {
        throw new BadRequestException(`Existencia inválida: ${idExistencia}`);
      }

      const nuevaCantidadReservada = new Prisma.Decimal(
        existencia.cantidad_reservada ?? 0,
      ).add(new Prisma.Decimal(cantidadReservar));

      await tx.existencias.update({
        where: { id_existencia: idExistencia },
        data: {
          cantidad_reservada: nuevaCantidadReservada,
        },
      });
    }
  }

  private async liberarReservasExistencias(
    tx: Prisma.TransactionClient,
    detalle: { id_existencia: number; cantidad: number | string }[],
  ) {
    const detalleAgrupado = this.validarDetalleSinDuplicados(
      this.detallePlano(detalle),
    );

    const existenciaIds = [...detalleAgrupado.keys()];

    const existencias = await tx.existencias.findMany({
      where: {
        id_existencia: { in: existenciaIds },
      },
      select: {
        id_existencia: true,
        cantidad_reservada: true,
      },
    });

    const existenciasMap = new Map(
      existencias.map((e) => [e.id_existencia, e]),
    );

    for (const [idExistencia, cantidadLiberar] of detalleAgrupado.entries()) {
      const existencia = existenciasMap.get(idExistencia);

      if (!existencia) {
        throw new BadRequestException(`Existencia inválida: ${idExistencia}`);
      }

      const reservaActual = new Prisma.Decimal(existencia.cantidad_reservada ?? 0);
      const cantidadALiberar = new Prisma.Decimal(cantidadLiberar);

      if (reservaActual.lt(cantidadALiberar)) {
        throw new BadRequestException(
          `La reserva de la existencia ${idExistencia} es menor a la cantidad a liberar`,
        );
      }

      await tx.existencias.update({
        where: { id_existencia: idExistencia },
        data: {
          cantidad_reservada: reservaActual.sub(cantidadALiberar),
        },
      });
    }
  }

  private validarTransicionEstado(
    estadoActual: number,
    nuevoEstado: number,
  ) {
    if (estadoActual === nuevoEstado) return;

    const transicionesValidas: Record<number, number[]> = {
      [this.ESTADO_BORRADOR]: [
        this.ESTADO_EN_TRANSITO,
        this.ESTADO_ANULADO,
      ],
      [this.ESTADO_EN_TRANSITO]: [this.ESTADO_RECIBIDO],
      [this.ESTADO_RECIBIDO]: [],
      [this.ESTADO_ANULADO]: [],
    };

    const permitidos = transicionesValidas[estadoActual] ?? [];

    if (!permitidos.includes(nuevoEstado)) {
      throw new BadRequestException(
        `No se permite cambiar el estado ${estadoActual} a ${nuevoEstado}`,
      );
    }
  }

  private async validarExistencias(
    tx: Prisma.TransactionClient,
    idBodegaOrigen: number,
    detalle: CreateTrasladoDto['detalle'],
  ) {
    const detalleAgrupado = this.validarDetalleSinDuplicados(detalle);
    const existenciaIds = [...detalleAgrupado.keys()];

    const existencias = await tx.existencias.findMany({
      where: {
        id_existencia: { in: existenciaIds },
      },
      select: {
        id_existencia: true,
        id_bodega: true,
        id_producto: true,
        cantidad: true,
        cantidad_reservada: true,
        lote: true,
        fecha_vencimiento: true,
        nota: true,
        codigo_barras: true,
      },
    });

    const existenciasMap = new Map(
      existencias.map((e) => [e.id_existencia, e]),
    );

    for (const [idExistencia, cantidadSolicitada] of detalleAgrupado.entries()) {
      const existencia = existenciasMap.get(idExistencia);

      if (!existencia) {
        throw new BadRequestException(`Existencia inválida: ${idExistencia}`);
      }

      if (existencia.id_bodega !== idBodegaOrigen) {
        throw new BadRequestException(
          `La existencia ${idExistencia} no pertenece a la bodega origen`,
        );
      }

      const cantidadTotal = new Prisma.Decimal(existencia.cantidad);
      const cantidadReservada = new Prisma.Decimal(
        existencia.cantidad_reservada ?? 0,
      );
      const cantidadDisponible = cantidadTotal.sub(cantidadReservada);

      if (cantidadDisponible.lt(new Prisma.Decimal(cantidadSolicitada))) {
        throw new BadRequestException(
          `La cantidad disponible para la existencia ${idExistencia} no es suficiente`,
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
                cantidad_reservada: true,
                lote: true,
                fecha_vencimiento: true,
                nota: true,
                codigo_barras: true,
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

      const cantidadReservadaActual = new Prisma.Decimal(
        origen.cantidad_reservada ?? 0,
      );

      if (cantidadReservadaActual.lt(cantidadMover)) {
        throw new BadRequestException(
          `La existencia ${origen.id_existencia} no tiene reserva suficiente para procesar el traslado`,
        );
      }

      const nuevaCantidadOrigen = cantidadOrigenActual.sub(cantidadMover);
      const nuevaCantidadReservada = cantidadReservadaActual.sub(cantidadMover);

      await tx.existencias.update({
        where: { id_existencia: origen.id_existencia },
        data: {
          cantidad: nuevaCantidadOrigen,
          cantidad_reservada: nuevaCantidadReservada,
        },
      });

      const destinoExistencia = await tx.existencias.findFirst({
        where: {
          id_producto: origen.id_producto,
          id_bodega: traslado.id_bodega_destino,
          lote: origen.lote,
          fecha_vencimiento: origen.fecha_vencimiento,
          codigo_barras: origen.codigo_barras,
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
            codigo_barras: origen.codigo_barras ?? null,
          },
        });
      }
    }
  }

  async create(dto: CreateTrasladoDto, opts: CreateOpts) {
    return this.prisma.$transaction(async (tx) => {
      await this.validarBodegas(
        tx,
        dto.id_bodega_origen,
        dto.id_bodega_destino,
        {
          bodegasPermitidas: opts.bodegasPermitidas,
        },
      );

      await this.validarEstadoTraslado(tx, this.ESTADO_BORRADOR);
      await this.validarResponsable(tx, opts.idUsuario);
      await this.validarExistencias(tx, dto.id_bodega_origen, dto.detalle);
      await this.reservarExistencias(tx, dto.detalle);

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
    idBodega?: number;
    bodegasPermitidas?: number[];
  }) {
    const where: Prisma.trasladoWhereInput = {};

    if (args.idBodega !== undefined) {
      this.assertBodegaAccess(args.idBodega, args.bodegasPermitidas);

      where.OR = [
        { id_bodega_origen: args.idBodega },
        { id_bodega_destino: args.idBodega },
      ];
    } else if (args.bodegasPermitidas?.length) {
      where.OR = [
        { id_bodega_origen: { in: args.bodegasPermitidas } },
        { id_bodega_destino: { in: args.bodegasPermitidas } },
      ];
    }

    return this.prisma.traslado.findMany({
      where,
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

      const detalleActualPlano = actual.detalle_traslado.map((d) => ({
        id_existencia: d.id_existencia,
        cantidad: Number(d.cantidad),
      }));

      const detalleObjetivo =
        dto.detalle ??
        actual.detalle_traslado.map((d) => ({
          id_existencia: d.id_existencia,
          cantidad: Number(d.cantidad),
        }));

      const debeRecalcularReservas =
        actual.id_estado_traslado === this.ESTADO_BORRADOR &&
        (dto.id_bodega_origen !== undefined || dto.detalle !== undefined);

      const debeLiberarPorAnulacion =
        actual.id_estado_traslado !== this.ESTADO_ANULADO &&
        nuevoEstado === this.ESTADO_ANULADO;

      const estaEditandoCabeceraODetalle =
        dto.id_bodega_origen !== undefined ||
        dto.id_bodega_destino !== undefined ||
        dto.fecha_traslado !== undefined ||
        dto.nota !== undefined ||
        dto.detalle !== undefined;

      if (
        estaEditandoCabeceraODetalle &&
        actual.id_estado_traslado !== this.ESTADO_BORRADOR
      ) {
        throw new BadRequestException(
          'Solo puedes editar la información o el detalle de un traslado en borrador',
        );
      }

      if (dto.id_bodega_origen !== undefined || dto.id_bodega_destino !== undefined) {
        await this.validarBodegas(tx, nuevoOrigen, nuevoDestino, {
          bodegasPermitidas: opts.bodegasPermitidas,
        });
      }

      if (dto.id_estado_traslado !== undefined) {
        await this.validarEstadoTraslado(tx, dto.id_estado_traslado);
        this.validarTransicionEstado(
          actual.id_estado_traslado,
          dto.id_estado_traslado,
        );
      }

      if (dto.detalle !== undefined) {
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

      if (debeRecalcularReservas) {
        await this.liberarReservasExistencias(tx, detalleActualPlano);

        if (!debeLiberarPorAnulacion) {
          await this.validarExistencias(tx, nuevoOrigen, detalleObjetivo);
          await this.reservarExistencias(tx, detalleObjetivo);
        }
      } else if (debeLiberarPorAnulacion) {
        await this.liberarReservasExistencias(tx, detalleActualPlano);
      }

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
