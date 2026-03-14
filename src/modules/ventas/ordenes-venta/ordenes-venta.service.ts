import {
    BadRequestException,
    Injectable,
    NotFoundException,
  } from '@nestjs/common';
  import { PrismaService } from '../../../prisma/prisma.service';
  import { CreateOrdenVentaDto } from './dto/create-orden-venta.dto';
  import { UpdateEstadoOrdenVentaDto } from './dto/update-estado-orden-venta.dto';
  
  @Injectable()
  export class OrdenesVentaService {
    constructor(private readonly prisma: PrismaService) {}
  
    async create(dto: CreateOrdenVentaDto) {
      return this.prisma.$transaction(async (tx) => {
        const cliente = await tx.cliente.findUnique({
          where: { id_cliente: dto.id_cliente },
        });
  
        if (!cliente) {
          throw new NotFoundException('Cliente no existe');
        }
  
        const bodega = await tx.bodega.findUnique({
          where: { id_bodega: dto.id_bodega },
        });
  
        if (!bodega) {
          throw new NotFoundException('Bodega no existe');
        }
  
        const estado = await tx.estado_orden_venta.findUnique({
          where: { id_estado_orden_venta: dto.id_estado_orden_venta },
        });
  
        if (!estado) {
          throw new NotFoundException('Estado de orden de venta no existe');
        }
  
        const terminoPago = await tx.termino_pago.findUnique({
          where: { id_termino_pago: dto.id_termino_pago },
        });
  
        if (!terminoPago) {
          throw new NotFoundException('Término de pago no existe');
        }
  
        const usuario = await tx.usuario.findUnique({
          where: { id_usuario: dto.id_usuario },
        });
  
        if (!usuario) {
          throw new NotFoundException('Usuario no existe');
        }
  
        let detalleFinal:
          | Array<{
              id_producto: number;
              cantidad: any;
              precio_unitario: any;
            }>
          | undefined = undefined;
  
        if (dto.id_cotizacion) {
          const cotizacion = await tx.cotizacion.findUnique({
            where: { id_cotizacion: dto.id_cotizacion },
            include: {
              detalle_cotizacion: true,
            },
          });
  
          if (!cotizacion) {
            throw new NotFoundException('Cotización no existe');
          }
  
          if (cotizacion.id_cliente !== dto.id_cliente) {
            throw new BadRequestException(
              'La cotización no pertenece al cliente enviado',
            );
          }
  
          if (cotizacion.id_bodega !== dto.id_bodega) {
            throw new BadRequestException(
              'La cotización no pertenece a la bodega enviada',
            );
          }
  
          const ordenExistente = await tx.orden_venta.findFirst({
            where: { id_cotizacion: dto.id_cotizacion },
          });
  
          if (ordenExistente) {
            throw new BadRequestException(
              'Esa cotización ya está asociada a una orden de venta',
            );
          }
  
          if (!cotizacion.detalle_cotizacion.length) {
            throw new BadRequestException(
              'La cotización no tiene detalle para generar la orden',
            );
          }
  
          detalleFinal = cotizacion.detalle_cotizacion.map((item) => ({
            id_producto: item.id_producto,
            cantidad: item.cantidad,
            precio_unitario: item.precio_unitario,
          }));
        } else {
          if (!dto.detalle || !dto.detalle.length) {
            throw new BadRequestException(
              'Debes enviar detalle si la orden no viene desde una cotización',
            );
          }
  
          detalleFinal = dto.detalle;
        }
  
        const orden = await tx.orden_venta.create({
          data: {
            fecha_creacion: new Date(dto.fecha_creacion),
            fecha_vencimiento: dto.fecha_vencimiento
              ? new Date(dto.fecha_vencimiento)
              : null,
            descripcion: dto.descripcion ?? null,
            id_cliente: dto.id_cliente,
            id_bodega: dto.id_bodega,
            id_estado_orden_venta: dto.id_estado_orden_venta,
            id_termino_pago: dto.id_termino_pago,
            id_usuario: dto.id_usuario,
            id_cotizacion: dto.id_cotizacion ?? null,
          },
        });
  
        for (const item of detalleFinal) {
          const producto = await tx.producto.findUnique({
            where: { id_producto: item.id_producto },
          });
  
          if (!producto) {
            throw new NotFoundException(
              `Producto ${item.id_producto} no existe`,
            );
          }
  
          await tx.detalle_orden_venta.create({
            data: {
              id_orden_venta: orden.id_orden_venta,
              id_producto: item.id_producto,
              cantidad: item.cantidad,
              precio_unitario: item.precio_unitario,
            },
          });
        }
  
        return tx.orden_venta.update({
          where: { id_orden_venta: orden.id_orden_venta },
          data: {
            codigo_orden_venta: `OV-${String(orden.id_orden_venta).padStart(4, '0')}`,
          },
          include: {
            cliente: true,
            bodega: true,
            estado_orden_venta: true,
            termino_pago: true,
            usuario: true,
            cotizacion: true,
            detalle_orden_venta: {
              include: {
                producto: true,
              },
            },
          },
        });
      });
    }
  
    async findAll() {
      return this.prisma.orden_venta.findMany({
        include: {
          cliente: true,
          bodega: true,
          estado_orden_venta: true,
          termino_pago: true,
          usuario: true,
          cotizacion: true,
          detalle_orden_venta: {
            include: {
              producto: true,
            },
          },
        },
        orderBy: {
          id_orden_venta: 'desc',
        },
      });
    }
  
    async findOne(id: number) {
      const orden = await this.prisma.orden_venta.findUnique({
        where: { id_orden_venta: id },
        include: {
          cliente: true,
          bodega: true,
          estado_orden_venta: true,
          termino_pago: true,
          usuario: true,
          cotizacion: true,
          detalle_orden_venta: {
            include: {
              producto: true,
            },
          },
        },
      });
  
      if (!orden) {
        throw new NotFoundException('Orden de venta no existe');
      }
  
      return orden;
    }
  
    async updateEstado(id: number, dto: UpdateEstadoOrdenVentaDto) {
      const orden = await this.prisma.orden_venta.findUnique({
        where: { id_orden_venta: id },
      });
  
      if (!orden) {
        throw new NotFoundException('Orden de venta no existe');
      }
  
      const estado = await this.prisma.estado_orden_venta.findUnique({
        where: { id_estado_orden_venta: dto.id_estado_orden_venta },
      });
  
      if (!estado) {
        throw new NotFoundException('Estado de orden de venta no existe');
      }
  
      return this.prisma.orden_venta.update({
        where: { id_orden_venta: id },
        data: {
          id_estado_orden_venta: dto.id_estado_orden_venta,
        },
        include: {
          cliente: true,
          bodega: true,
          estado_orden_venta: true,
          termino_pago: true,
          usuario: true,
          cotizacion: true,
          detalle_orden_venta: {
            include: {
              producto: true,
            },
          },
        },
      });
    }
  }