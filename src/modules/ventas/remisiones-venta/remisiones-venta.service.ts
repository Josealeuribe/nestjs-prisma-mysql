

import {
    BadRequestException,
    Injectable,
    NotFoundException,
  } from '@nestjs/common';
  import { PrismaService } from '../../../prisma/prisma.service';
  import { CreateRemisionVentaDto } from './dto/create-remision-venta.dto';
  import { UpdateEstadoRemisionVentaDto } from './dto/update-estado-remision-venta.dto';
  
  @Injectable()
  export class RemisionesVentaService {
    constructor(private readonly prisma: PrismaService) {}
  
    async create(dto: CreateRemisionVentaDto) {
      return this.prisma.$transaction(async (tx) => {
        const orden = await tx.orden_venta.findUnique({
          where: { id_orden_venta: dto.id_orden_venta },
          include: {
            detalle_orden_venta: true,
          },
        });
  
        if (!orden) {
          throw new NotFoundException('Orden de venta no existe');
        }
  
        const estado = await tx.estado_remision_venta.findUnique({
          where: {
            id_estado_remision_venta: dto.id_estado_remision_venta,
          },
        });
  
        if (!estado) {
          throw new NotFoundException('Estado de remisión de venta no existe');
        }
  
        const usuario = await tx.usuario.findUnique({
          where: { id_usuario: dto.id_usuario_creador },
        });
  
        if (!usuario) {
          throw new NotFoundException('Usuario no existe');
        }
  
        const remision = await tx.remision_venta.create({
          data: {
            fecha_creacion: new Date(dto.fecha_creacion),
            fecha_vencimiento: dto.fecha_vencimiento
              ? new Date(dto.fecha_vencimiento)
              : null,
            observaciones: dto.observaciones ?? null,
            id_orden_venta: dto.id_orden_venta,
            id_cliente: orden.id_cliente,
            id_estado_remision_venta: dto.id_estado_remision_venta,
            id_usuario_creador: dto.id_usuario_creador,
            id_factura: null,
          },
        });
  
        for (const item of dto.detalle) {
          const detalleOrden = orden.detalle_orden_venta.find(
            (d) => d.id_producto === item.id_producto,
          );
  
          if (!detalleOrden) {
            throw new BadRequestException(
              `El producto ${item.id_producto} no pertenece a la orden de venta`,
            );
          }
  
          const cantidadSolicitadaProducto = item.lotes.reduce(
            (acc, lote) => acc + Number(lote.cantidad),
            0,
          );
  
          const yaRemitido = await tx.detalle_remision_venta.aggregate({
            _sum: {
              cantidad: true,
            },
            where: {
              remision_venta: {
                id_orden_venta: dto.id_orden_venta,
              },
              existencias: {
                id_producto: item.id_producto,
              },
            },
          });
  
          const cantidadOrden = Number(detalleOrden.cantidad);
          const cantidadYaRemitida = Number(yaRemitido._sum.cantidad ?? 0);
          const nuevaCantidadTotal =
            cantidadYaRemitida + cantidadSolicitadaProducto;
  
          if (nuevaCantidadTotal > cantidadOrden) {
            throw new BadRequestException(
              `La cantidad remitida del producto ${item.id_producto} supera la cantidad de la orden`,
            );
          }
  
          for (const lote of item.lotes) {
            const existencia = await tx.existencias.findUnique({
              where: { id_existencia: lote.id_existencia },
              include: {
                producto: {
                  include: {
                    iva: true,
                  },
                },
                bodega: true,
              },
            });
  
            if (!existencia) {
              throw new NotFoundException(
                `Existencia ${lote.id_existencia} no existe`,
              );
            }
  
            if (existencia.id_producto !== item.id_producto) {
              throw new BadRequestException(
                `La existencia ${lote.id_existencia} no corresponde al producto ${item.id_producto}`,
              );
            }
  
            if (existencia.id_bodega !== orden.id_bodega) {
              throw new BadRequestException(
                `La existencia ${lote.id_existencia} no pertenece a la bodega de la orden`,
              );
            }
  
            const cantidadDisponible = Number(existencia.cantidad);
            const cantidadSolicitada = Number(lote.cantidad);
  
            if (cantidadDisponible < cantidadSolicitada) {
              throw new BadRequestException(
                `La existencia ${lote.id_existencia} no tiene cantidad suficiente`,
              );
            }
  
            await tx.detalle_remision_venta.create({
              data: {
                id_remision_venta: remision.id_remision_venta,
                id_existencia: lote.id_existencia,
                cantidad: cantidadSolicitada,
                precio_unitario: detalleOrden.precio_unitario,
                iva: Number(existencia.producto.iva.porcentaje),
              },
            });
  
            await tx.existencias.update({
              where: { id_existencia: lote.id_existencia },
              data: {
                cantidad: cantidadDisponible - cantidadSolicitada,
              },
            });
          }
        }
  
        return tx.remision_venta.update({
          where: { id_remision_venta: remision.id_remision_venta },
          data: {
            codigo_remision_venta: `RMV-${String(remision.id_remision_venta).padStart(4, '0')}`,
          },
          include: {
            orden_venta: true,
            cliente: true,
            estado_remision_venta: true,
            usuario: true,
            factura: true,
            detalle_remision_venta: {
              include: {
                existencias: {
                  include: {
                    producto: true,
                    bodega: true,
                  },
                },
              },
            },
          },
        });
      });
    }
  
    async findAll() {
      return this.prisma.remision_venta.findMany({
        include: {
          orden_venta: true,
          cliente: true,
          estado_remision_venta: true,
          usuario: true,
          factura: true,
          detalle_remision_venta: {
            include: {
              existencias: {
                include: {
                  producto: true,
                  bodega: true,
                },
              },
            },
          },
        },
        orderBy: {
          id_remision_venta: 'desc',
        },
      });
    }
  
    async findOne(id: number) {
      const remision = await this.prisma.remision_venta.findUnique({
        where: { id_remision_venta: id },
        include: {
          orden_venta: true,
          cliente: true,
          estado_remision_venta: true,
          usuario: true,
          factura: true,
          detalle_remision_venta: {
            include: {
              existencias: {
                include: {
                  producto: true,
                  bodega: true,
                },
              },
            },
          },
        },
      });
  
      if (!remision) {
        throw new NotFoundException('Remisión de venta no existe');
      }
  
      return remision;
    }
  
    async updateEstado(id: number, dto: UpdateEstadoRemisionVentaDto) {
      const remision = await this.prisma.remision_venta.findUnique({
        where: { id_remision_venta: id },
      });
  
      if (!remision) {
        throw new NotFoundException('Remisión de venta no existe');
      }
  
      const estado = await this.prisma.estado_remision_venta.findUnique({
        where: {
          id_estado_remision_venta: dto.id_estado_remision_venta,
        },
      });
  
      if (!estado) {
        throw new NotFoundException('Estado de remisión de venta no existe');
      }
  
      return this.prisma.remision_venta.update({
        where: { id_remision_venta: id },
        data: {
          id_estado_remision_venta: dto.id_estado_remision_venta,
        },
        include: {
          orden_venta: true,
          cliente: true,
          estado_remision_venta: true,
          usuario: true,
          factura: true,
          detalle_remision_venta: {
            include: {
              existencias: {
                include: {
                  producto: true,
                  bodega: true,
                },
              },
            },
          },
        },
      });
    }
  }