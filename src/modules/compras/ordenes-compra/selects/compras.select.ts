import { Prisma } from '@prisma/client';

export const compraListSelect = Prisma.validator<Prisma.comprasSelect>()({
  id_compra: true,
  codigo_compra: true,
  fecha_solicitud: true,
  fecha_entrega: true,
  descripcion: true,
  subtotal: true,
  total_iva: true,
  total: true,
  id_bodega: true,
  id_estado_compra: true,
  id_proveedor: true,
  id_termino_pago: true,
  id_usuario_creador: true,
  proveedor: { select: { id_proveedor: true, nombre_empresa: true } },
  estado_compra: { select: { id_estado_compra: true, nombre_estado: true } },
  termino_pago: { select: { id_termino_pago: true, nombre_termino: true } },
});

export const compraDetailSelect = Prisma.validator<Prisma.comprasSelect>()({
  ...compraListSelect,
  detalle_compra: {
    select: {
      id_producto: true,
      cantidad: true,
      precio_unitario: true,
      id_iva: true,
      producto: { select: { id_producto: true, nombre_producto: true } },
      iva: { select: { id_iva: true, porcentaje: true } }, // ajusta campos según tu tabla iva
    },
  },
});
