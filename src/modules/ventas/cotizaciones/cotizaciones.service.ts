import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateCotizacionDto } from './dto/create-cotizacion.dto';
import { UpdateEstadoCotizacionDto } from './dto/update-estado-cotizacion.dto';

@Injectable()
export class CotizacionesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCotizacionDto) {
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

      const usuario = await tx.usuario.findUnique({
        where: { id_usuario: dto.id_usuario_creador },
      });

      if (!usuario) {
        throw new NotFoundException('Usuario no existe');
      }

      const estado = await tx.estado_cotizacion.findUnique({
        where: { id_estado_cotizacion: dto.id_estado_cotizacion },
      });

      if (!estado) {
        throw new NotFoundException('Estado de cotización no existe');
      }

      const cotizacion = await tx.cotizacion.create({
        data: {
          fecha: new Date(dto.fecha),
          fecha_vencimiento: new Date(dto.fecha_vencimiento),
          id_cliente: dto.id_cliente,
          id_bodega: dto.id_bodega,
          id_usuario_creador: dto.id_usuario_creador,
          id_estado_cotizacion: dto.id_estado_cotizacion,
          observaciones: dto.observaciones ?? null,
        },
      });

      for (const item of dto.detalle) {
        const producto = await tx.producto.findUnique({
          where: { id_producto: item.id_producto },
        });

        if (!producto) {
          throw new NotFoundException(`Producto ${item.id_producto} no existe`);
        }

        let idIvaFinal = producto.id_iva;

        if (item.id_iva !== undefined) {
          const iva = await tx.iva.findUnique({
            where: { id_iva: item.id_iva },
          });

          if (!iva) {
            throw new NotFoundException(`IVA ${item.id_iva} no existe`);
          }

          idIvaFinal = item.id_iva;
        }

        await tx.detalle_cotizacion.create({
          data: {
            id_cotizacion: cotizacion.id_cotizacion,
            id_producto: item.id_producto,
            cantidad: item.cantidad,
            precio_unitario: item.precio_unitario,
            id_iva: idIvaFinal,
          },
        });
      }

      return tx.cotizacion.update({
        where: { id_cotizacion: cotizacion.id_cotizacion },
        data: {
          codigo_cotizacion: `COT-${String(cotizacion.id_cotizacion).padStart(4, '0')}`,
        },
        include: {
          cliente: true,
          bodega: true,
          usuario: true,
          estado_cotizacion: true,
          detalle_cotizacion: {
            include: {
              producto: true,
              iva: true,
            },
          },
        },
      });
    });
  }

  async findAll() {
    return this.prisma.cotizacion.findMany({
      include: {
        cliente: true,
        bodega: true,
        usuario: true,
        estado_cotizacion: true,
        detalle_cotizacion: {
          include: {
            producto: true,
            iva: true,
          },
        },
      },
      orderBy: { id_cotizacion: 'desc' },
    });
  }

  async findOne(id: number) {
    const cotizacion = await this.prisma.cotizacion.findUnique({
      where: { id_cotizacion: id },
      include: {
        cliente: true,
        bodega: true,
        usuario: true,
        estado_cotizacion: true,
        detalle_cotizacion: {
          include: {
            producto: true,
            iva: true,
          },
        },
      },
    });

    if (!cotizacion) {
      throw new NotFoundException('Cotización no existe');
    }

    return cotizacion;
  }

  async updateEstado(id: number, dto: UpdateEstadoCotizacionDto) {
    const cotizacion = await this.prisma.cotizacion.findUnique({
      where: { id_cotizacion: id },
    });

    if (!cotizacion) {
      throw new NotFoundException('Cotización no existe');
    }

    const estado = await this.prisma.estado_cotizacion.findUnique({
      where: { id_estado_cotizacion: dto.id_estado_cotizacion },
    });

    if (!estado) {
      throw new NotFoundException('Estado de cotización no existe');
    }

    return this.prisma.cotizacion.update({
      where: { id_cotizacion: id },
      data: {
        id_estado_cotizacion: dto.id_estado_cotizacion,
      },
      include: {
        cliente: true,
        bodega: true,
        usuario: true,
        estado_cotizacion: true,
        detalle_cotizacion: {
          include: {
            producto: true,
            iva: true,
          },
        },
      },
    });
  }
}