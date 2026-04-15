import { ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { DashboardResumenQueryDto } from './dto/dashboard-resumen-query.dto';
import { DashboardResumenResponseDto } from './dto/dashboard-resumen-response.dto';
import { DashboardGraficasQueryDto } from './dto/dashboard-graficas-query.dto';
import { DashboardSeriesResponseDto } from './dto/dashboard-series-response.dto';
import { DashboardRankingResponseDto } from './dto/dashboard-ranking-response.dto';

interface DashboardAuthUser {
  id_usuario: number;
  email: string;
  id_rol: number;
  id_bodega_activa?: number | null;
  rol: string;
  permisos: string[];
}

const ESTADOS = {
  COMPRA: {
    PENDIENTE: 1,
    APROBADA: 2,
    ANULADA: 3,
  },
  COTIZACION: {
    PENDIENTE: 1,
    APROBADA: 2,
    RECHAZADA: 3,
    VENCIDA: 4,
    ANULADA: 5,
  },
  FACTURA: {
    PENDIENTE: 1,
    ABONADA: 2,
    PAGADA: 3,
    ANULADA: 4,
  },
  ORDEN_VENTA: {
    PENDIENTE: 1,
    APROBADA: 2,
    ANULADA: 3,
  },
  REMISION_COMPRA: {
    PENDIENTE: 1,
    APROBADA: 2,
    ANULADA: 3,
  },
  REMISION_VENTA: {
    PENDIENTE: 5,
    DESPACHADO: 6,
    ENTREGADO: 7,
    FACTURADA: 8,
    ANULADA: 9,
  },
  TRASLADO: {
    PENDIENTE: 1,
    ENVIADO: 2,
    RECIBIDO: 3,
    ANULADO: 4,
  },
} as const;

const UMBRAL_STOCK_BAJO = 10;

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) { }

  async getResumen(
    query: DashboardResumenQueryDto,
    user: DashboardAuthUser,
  ): Promise<DashboardResumenResponseDto> {
    const scope = await this.resolveBodegaScope(user, query.id_bodega);
    const rango = this.resolveCustomDateRange(
      query.fecha_inicio,
      query.fecha_fin,
    );
    const fechas = this.getOperationalDates();

    const [
      bodegasConsultadas,
      ventasPeriodoAgg,
      cotizacionesPendientes,
      ordenesVentaPendientes,
      remisionesVentaPendientesFacturar,
      facturasPendientes,
      comprasPeriodoAgg,
      ordenesCompraPendientes,
      remisionesCompraPendientes,
      lotesPorVencerRows,
      clientesDesdeCotizaciones,
      clientesDesdeOrdenes,
      clientesDesdeRemisiones,
      proveedoresDesdeCompras,
      trasladosPendientes,
      productosActivosRows,
    ] = await Promise.all([
      this.prisma.bodega.findMany({
        where: {
          id_bodega: {
            in: scope.ids_bodegas,
          },
        },
        select: {
          id_bodega: true,
          nombre_bodega: true,
        },
        orderBy: {
          nombre_bodega: 'asc',
        },
      }),

      this.prisma.factura.aggregate({
        where: {
          id_estado_factura: {
            not: ESTADOS.FACTURA.ANULADA,
          },
          fecha_factura: {
            gte: rango.from,
            lt: rango.toExclusive,
          },
          remision_venta: {
            some: {
              orden_venta: {
                is: {
                  id_bodega: {
                    in: scope.ids_bodegas,
                  },
                },
              },
            },
          },
        },
        _sum: {
          total: true,
        },
      }),

      this.prisma.cotizacion.count({
        where: {
          id_bodega: {
            in: scope.ids_bodegas,
          },
          id_estado_cotizacion: ESTADOS.COTIZACION.PENDIENTE,
        },
      }),

      this.prisma.orden_venta.count({
        where: {
          id_bodega: {
            in: scope.ids_bodegas,
          },
          id_estado_orden_venta: ESTADOS.ORDEN_VENTA.PENDIENTE,
        },
      }),

      this.prisma.remision_venta.count({
        where: {
          id_factura: null,
          id_estado_remision_venta: {
            in: [
              ESTADOS.REMISION_VENTA.PENDIENTE,
              ESTADOS.REMISION_VENTA.DESPACHADO,
              ESTADOS.REMISION_VENTA.ENTREGADO,
            ],
          },
          orden_venta: {
            is: {
              id_bodega: {
                in: scope.ids_bodegas,
              },
            },
          },
        },
      }),

      this.prisma.factura.findMany({
        where: {
          id_estado_factura: {
            in: [ESTADOS.FACTURA.PENDIENTE, ESTADOS.FACTURA.ABONADA],
          },
          remision_venta: {
            some: {
              orden_venta: {
                is: {
                  id_bodega: {
                    in: scope.ids_bodegas,
                  },
                },
              },
            },
          },
        },
        select: {
          id_factura: true,
          total: true,
          pagos_abonos: {
            where: {
              estado: true,
            },
            select: {
              valor: true,
            },
          },
        },
      }),

      this.prisma.compras.aggregate({
        where: {
          id_bodega: {
            in: scope.ids_bodegas,
          },
          id_estado_compra: {
            not: ESTADOS.COMPRA.ANULADA,
          },
          fecha_solicitud: {
            gte: rango.from,
            lt: rango.toExclusive,
          },
        },
        _sum: {
          total: true,
        },
      }),

      this.prisma.compras.count({
        where: {
          id_bodega: {
            in: scope.ids_bodegas,
          },
          id_estado_compra: ESTADOS.COMPRA.PENDIENTE,
        },
      }),

      this.prisma.remision_compra.count({
        where: {
          id_estado_remision_compra: ESTADOS.REMISION_COMPRA.PENDIENTE,
          OR: [
            {
              id_bodega: {
                in: scope.ids_bodegas,
              },
            },
            {
              compras: {
                is: {
                  id_bodega: {
                    in: scope.ids_bodegas,
                  },
                },
              },
            },
          ],
        },
      }),

      this.prisma.existencias.findMany({
        where: {
          id_bodega: {
            in: scope.ids_bodegas,
          },
          fecha_vencimiento: {
            gte: fechas.hoy,
            lte: fechas.proximos30Dias,
          },
        },
        select: {
          id_existencia: true,
          cantidad: true,
          cantidad_reservada: true,
        },
      }),

      this.prisma.cotizacion.findMany({
        where: {
          id_bodega: {
            in: scope.ids_bodegas,
          },
          cliente: {
            is: {
              estado: true,
            },
          },
        },
        distinct: ['id_cliente'],
        select: {
          id_cliente: true,
        },
      }),

      this.prisma.orden_venta.findMany({
        where: {
          id_bodega: {
            in: scope.ids_bodegas,
          },
          cliente: {
            is: {
              estado: true,
            },
          },
        },
        distinct: ['id_cliente'],
        select: {
          id_cliente: true,
        },
      }),

      this.prisma.remision_venta.findMany({
        where: {
          orden_venta: {
            is: {
              id_bodega: {
                in: scope.ids_bodegas,
              },
            },
          },
          cliente: {
            is: {
              estado: true,
            },
          },
        },
        distinct: ['id_cliente'],
        select: {
          id_cliente: true,
        },
      }),

      this.prisma.compras.findMany({
        where: {
          id_bodega: {
            in: scope.ids_bodegas,
          },
          proveedor: {
            is: {
              estado: true,
            },
          },
        },
        distinct: ['id_proveedor'],
        select: {
          id_proveedor: true,
        },
      }),

      this.prisma.traslado.count({
        where: {
          id_estado_traslado: {
            in: [ESTADOS.TRASLADO.PENDIENTE, ESTADOS.TRASLADO.ENVIADO],
          },
          OR: [
            {
              id_bodega_origen: {
                in: scope.ids_bodegas,
              },
            },
            {
              id_bodega_destino: {
                in: scope.ids_bodegas,
              },
            },
          ],
        },
      }),

      this.prisma.producto.findMany({
        where: {
          estado: true,
        },
        select: {
          id_producto: true,
          existencias: {
            where: {
              id_bodega: {
                in: scope.ids_bodegas,
              },
            },
            select: {
              cantidad: true,
              cantidad_reservada: true,
            },
          },
        },
      }),
    ]);

    const saldoPendienteCobro = facturasPendientes.reduce((acc, factura) => {
      const totalFactura = this.toNumber(factura.total);
      const totalAbonado = factura.pagos_abonos.reduce(
        (sum, pago) => sum + this.toNumber(pago.valor),
        0,
      );

      const saldo = Math.max(totalFactura - totalAbonado, 0);
      return acc + saldo;
    }, 0);

    const facturasPendientesCobro = facturasPendientes.filter((factura) => {
      const totalFactura = this.toNumber(factura.total);
      const totalAbonado = factura.pagos_abonos.reduce(
        (sum, pago) => sum + this.toNumber(pago.valor),
        0,
      );

      return totalFactura - totalAbonado > 0;
    }).length;

    let productosConStock = 0;
    let productosStockBajo = 0;

    for (const producto of productosActivosRows) {
      const stockDisponible = producto.existencias.reduce((acc, row) => {
        const disponible = Math.max(
          this.toNumber(row.cantidad) - this.toNumber(row.cantidad_reservada),
          0,
        );

        return acc + disponible;
      }, 0);

      if (stockDisponible > 0) {
        productosConStock += 1;
      }

      if (stockDisponible < UMBRAL_STOCK_BAJO) {
        productosStockBajo += 1;
      }
    }

    const lotesPorVencer = lotesPorVencerRows.filter((row) => {
      const disponible = Math.max(
        this.toNumber(row.cantidad) - this.toNumber(row.cantidad_reservada),
        0,
      );

      return disponible > 0;
    }).length;

    const clientesActivosSet = new Set<number>([
      ...clientesDesdeCotizaciones.map((x) => x.id_cliente),
      ...clientesDesdeOrdenes.map((x) => x.id_cliente),
      ...clientesDesdeRemisiones.map((x) => x.id_cliente),
    ]);

    const proveedoresActivosSet = new Set<number>(
      proveedoresDesdeCompras.map((x) => x.id_proveedor),
    );

    const nombreBodega =
      scope.ids_bodegas.length === 1
        ? bodegasConsultadas[0]?.nombre_bodega ?? 'Bodega no encontrada'
        : 'Todas las bodegas permitidas';

    return {
      bodega: {
        id_bodega: scope.ids_bodegas.length === 1 ? scope.ids_bodegas[0] : null,
        nombre_bodega: nombreBodega,
        ids_bodegas: scope.ids_bodegas,
        total_bodegas: scope.ids_bodegas.length,
      },
      periodo: {
        etiqueta: `${this.formatDateOnly(rango.from)} al ${this.formatDateOnly(
          rango.endDate,
        )}`,
        fecha_inicio: this.formatDateOnly(rango.from),
        fecha_fin: this.formatDateOnly(rango.endDate),
      },
      ventas: {
        total_mes_actual: this.toNumber(ventasPeriodoAgg._sum.total),
        cotizaciones_pendientes: cotizacionesPendientes,
        ordenes_pendientes: ordenesVentaPendientes,
        remisiones_pendientes_facturar: remisionesVentaPendientesFacturar,
        facturas_pendientes_cobro: facturasPendientesCobro,
        saldo_pendiente_cobro: saldoPendienteCobro,
      },
      compras: {
        total_mes_actual: this.toNumber(comprasPeriodoAgg._sum.total),
        ordenes_pendientes: ordenesCompraPendientes,
        remisiones_pendientes: remisionesCompraPendientes,
      },
      inventario: {
        productos_con_stock: productosConStock,
        productos_stock_bajo: productosStockBajo,
        lotes_por_vencer: lotesPorVencer,
        umbral_stock_bajo: UMBRAL_STOCK_BAJO,
      },
      terceros: {
        clientes_activos: clientesActivosSet.size,
        proveedores_activos: proveedoresActivosSet.size,
      },
      logistica: {
        traslados_pendientes: trasladosPendientes,
      },
    };
  }

  async getSeries(
    query: DashboardGraficasQueryDto,
    user: DashboardAuthUser,
  ): Promise<DashboardSeriesResponseDto> {
    const scope = await this.resolveBodegaScope(user, query.id_bodega);
    const range = this.resolveCustomDateRange(
      query.fecha_inicio,
      query.fecha_fin,
      query.agrupacion,
    );

    const axis = this.buildTimeAxis(
      range.from,
      range.toExclusive,
      range.agrupacion,
    );

    const bucketExprVentas =
      range.agrupacion === 'dia'
        ? Prisma.sql`DATE_FORMAT(f.fecha_factura, '%Y-%m-%d')`
        : Prisma.sql`DATE_FORMAT(f.fecha_factura, '%Y-%m')`;

    const bucketExprCompras =
      range.agrupacion === 'dia'
        ? Prisma.sql`DATE_FORMAT(c.fecha_solicitud, '%Y-%m-%d')`
        : Prisma.sql`DATE_FORMAT(c.fecha_solicitud, '%Y-%m')`;

    const ventasRows = await this.prisma.$queryRaw<
      Array<{ bucket: string; total: Prisma.Decimal | number | string | null }>
    >(Prisma.sql`
      SELECT
        ${bucketExprVentas} AS bucket,
        SUM(f.total) AS total
      FROM factura f
      WHERE f.id_estado_factura <> ${ESTADOS.FACTURA.ANULADA}
        AND f.fecha_factura >= ${range.from}
        AND f.fecha_factura < ${range.toExclusive}
        AND EXISTS (
          SELECT 1
          FROM remision_venta rv
          INNER JOIN orden_venta ov
            ON ov.id_orden_venta = rv.id_orden_venta
          WHERE rv.id_factura = f.id_factura
            AND ov.id_bodega IN (${Prisma.join(scope.ids_bodegas)})
        )
      GROUP BY bucket
      ORDER BY bucket ASC
    `);

    const comprasRows = await this.prisma.$queryRaw<
      Array<{ bucket: string; total: Prisma.Decimal | number | string | null }>
    >(Prisma.sql`
      SELECT
        ${bucketExprCompras} AS bucket,
        SUM(c.total) AS total
      FROM compras c
      WHERE c.id_estado_compra <> ${ESTADOS.COMPRA.ANULADA}
        AND c.id_bodega IN (${Prisma.join(scope.ids_bodegas)})
        AND c.fecha_solicitud >= ${range.from}
        AND c.fecha_solicitud < ${range.toExclusive}
      GROUP BY bucket
      ORDER BY bucket ASC
    `);

    const ventasMap = new Map(
      ventasRows.map((row) => [row.bucket, this.toNumber(row.total)]),
    );
    const comprasMap = new Map(
      comprasRows.map((row) => [row.bucket, this.toNumber(row.total)]),
    );

    return {
      periodo: `${this.formatDateOnly(range.from)} al ${this.formatDateOnly(
        range.endDate,
      )}`,
      agrupacion: range.agrupacion,
      labels: axis.map((item) => item.label),
      ventas: axis.map((item) => ventasMap.get(item.key) ?? 0),
      compras: axis.map((item) => comprasMap.get(item.key) ?? 0),
    };
  }

  async getVentasPorCategoria(
    query: DashboardGraficasQueryDto,
    user: DashboardAuthUser,
  ): Promise<DashboardRankingResponseDto> {
    const scope = await this.resolveBodegaScope(user, query.id_bodega);
    const range = this.resolveCustomDateRange(
      query.fecha_inicio,
      query.fecha_fin,
    );

    const rows = await this.prisma.$queryRaw<
      Array<{ label: string | null; total: Prisma.Decimal | number | string | null }>
    >(Prisma.sql`
      SELECT
        COALESCE(
          cp.nombre_categoria,
          CONCAT('ID ', p.id_categoria_producto)
        ) AS label,
        SUM(drv.cantidad * drv.precio_unitario) AS total
      FROM detalle_remision_venta drv
      INNER JOIN remision_venta rv
        ON rv.id_remision_venta = drv.id_remision_venta
      INNER JOIN factura f
        ON f.id_factura = rv.id_factura
      INNER JOIN orden_venta ov
        ON ov.id_orden_venta = rv.id_orden_venta
      INNER JOIN existencias e
        ON e.id_existencia = drv.id_existencia
      INNER JOIN producto p
        ON p.id_producto = e.id_producto
      LEFT JOIN categoria_producto cp
        ON cp.id_categoria_producto = p.id_categoria_producto
      WHERE rv.id_factura IS NOT NULL
        AND f.id_estado_factura <> ${ESTADOS.FACTURA.ANULADA}
        AND f.fecha_factura >= ${range.from}
        AND f.fecha_factura < ${range.toExclusive}
        AND ov.id_bodega IN (${Prisma.join(scope.ids_bodegas)})
      GROUP BY
        COALESCE(
          cp.nombre_categoria,
          CONCAT('ID ', p.id_categoria_producto)
        )
      ORDER BY total DESC
      LIMIT 10
    `);

    return {
      periodo: `${this.formatDateOnly(range.from)} al ${this.formatDateOnly(
        range.endDate,
      )}`,
      items: rows.map((row) => ({
        label: String(row.label ?? 'Sin categoría'),
        total: this.toNumber(row.total),
      })),
    };
  }

  async getComprasPorProveedor(
    query: DashboardGraficasQueryDto,
    user: DashboardAuthUser,
  ): Promise<DashboardRankingResponseDto> {
    const scope = await this.resolveBodegaScope(user, query.id_bodega);
    const range = this.resolveCustomDateRange(
      query.fecha_inicio,
      query.fecha_fin,
    );

    const rows = await this.prisma.$queryRaw<
      Array<{ label: string | null; total: Prisma.Decimal | number | string | null }>
    >(Prisma.sql`
      SELECT
        COALESCE(p.nombre_empresa, 'Sin proveedor') AS label,
        SUM(c.total) AS total
      FROM compras c
      INNER JOIN proveedor p
        ON p.id_proveedor = c.id_proveedor
      WHERE c.id_estado_compra <> ${ESTADOS.COMPRA.ANULADA}
        AND c.id_bodega IN (${Prisma.join(scope.ids_bodegas)})
        AND c.fecha_solicitud >= ${range.from}
        AND c.fecha_solicitud < ${range.toExclusive}
      GROUP BY COALESCE(p.nombre_empresa, 'Sin proveedor')
      ORDER BY total DESC
      LIMIT 10
    `);

    return {
      periodo: `${this.formatDateOnly(range.from)} al ${this.formatDateOnly(
        range.endDate,
      )}`,
      items: rows.map((row) => ({
        label: String(row.label ?? 'Sin proveedor'),
        total: this.toNumber(row.total),
      })),
    };
  }

  private async resolveBodegaScope(
    user: DashboardAuthUser,
    requestedBodegaId?: number,
  ): Promise<{ ids_bodegas: number[] }> {
    const rows = await this.prisma.bodegas_por_usuario.findMany({
      where: {
        id_usuario: user.id_usuario,
        estado: true,
      },
      select: {
        id_bodega: true,
      },
    });

    let idsPermitidas = Array.from(
      new Set(
        rows
          .map((row) => Number(row.id_bodega))
          .filter((id) => Number.isFinite(id) && id > 0),
      ),
    );

    if (idsPermitidas.length === 0 && user.id_bodega_activa) {
      idsPermitidas = [Number(user.id_bodega_activa)];
    }

    if (idsPermitidas.length === 0) {
      throw new ForbiddenException(
        'El usuario no tiene bodegas permitidas para consultar el dashboard',
      );
    }

    if (requestedBodegaId !== undefined && requestedBodegaId > 0) {
      if (!idsPermitidas.includes(requestedBodegaId)) {
        throw new ForbiddenException(
          'No tienes acceso a la bodega seleccionada',
        );
      }

      return {
        ids_bodegas: [requestedBodegaId],
      };
    }

    if (requestedBodegaId === 0) {
      return {
        ids_bodegas: idsPermitidas,
      };
    }

    if (
      user.id_bodega_activa &&
      idsPermitidas.includes(Number(user.id_bodega_activa))
    ) {
      return {
        ids_bodegas: [Number(user.id_bodega_activa)],
      };
    }

    return {
      ids_bodegas: idsPermitidas,
    };
  }

  private getOperationalDates() {
    const hoy = new Date();
    const hoySinHora = new Date(
      hoy.getFullYear(),
      hoy.getMonth(),
      hoy.getDate(),
    );

    const proximos30Dias = new Date(
      hoySinHora.getFullYear(),
      hoySinHora.getMonth(),
      hoySinHora.getDate() + 30,
    );

    return {
      hoy: hoySinHora,
      proximos30Dias,
    };
  }

  private resolveCustomDateRange(
    fechaInicio?: string,
    fechaFin?: string,
    agrupacion?: 'dia' | 'mes',
  ) {
    const hoy = new Date();
    const hoySinHora = new Date(
      hoy.getFullYear(),
      hoy.getMonth(),
      hoy.getDate(),
    );

    const inicioDefault = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const finDefault = hoySinHora;

    const from = fechaInicio
      ? new Date(`${fechaInicio}T00:00:00`)
      : inicioDefault;

    const endDate = fechaFin
      ? new Date(`${fechaFin}T00:00:00`)
      : finDefault;

    if (
      Number.isNaN(from.getTime()) ||
      Number.isNaN(endDate.getTime())
    ) {
      throw new ForbiddenException('Las fechas enviadas no son válidas');
    }

    if (from > endDate) {
      throw new ForbiddenException(
        'La fecha inicial no puede ser mayor que la fecha final',
      );
    }

    const toExclusive = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate() + 1,
    );

    const diffMs = endDate.getTime() - from.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;

    const agrupacionFinal =
      agrupacion ?? (diffDays <= 45 ? 'dia' : 'mes');

    return {
      from,
      endDate,
      toExclusive,
      diffDays,
      agrupacion: agrupacionFinal,
    };
  }

  private buildTimeAxis(
    from: Date,
    toExclusive: Date,
    agrupacion: 'dia' | 'mes',
  ): Array<{ key: string; label: string }> {
    const axis: Array<{ key: string; label: string }> = [];

    if (agrupacion === 'dia') {
      let cursor = new Date(from);

      while (cursor < toExclusive) {
        const key = this.formatDateOnly(cursor);
        const label = cursor.toLocaleDateString('es-CO', {
          day: '2-digit',
          month: '2-digit',
        });

        axis.push({ key, label });

        cursor = new Date(
          cursor.getFullYear(),
          cursor.getMonth(),
          cursor.getDate() + 1,
        );
      }

      return axis;
    }

    let cursor = new Date(from.getFullYear(), from.getMonth(), 1);

    while (cursor < toExclusive) {
      const key = `${cursor.getFullYear()}-${String(
        cursor.getMonth() + 1,
      ).padStart(2, '0')}`;

      const label = this.getShortPeriodoLabel(cursor);

      axis.push({ key, label });

      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    }

    return axis;
  }

  private getShortPeriodoLabel(date: Date): string {
    const meses = [
      'ene',
      'feb',
      'mar',
      'abr',
      'may',
      'jun',
      'jul',
      'ago',
      'sep',
      'oct',
      'nov',
      'dic',
    ];

    return `${meses[date.getMonth()]} ${date.getFullYear()}`;
  }

  private toNumber(value: unknown): number {
    const parsed = Number(value ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private formatDateOnly(value: Date): string {
    return value.toISOString().slice(0, 10);
  }
}