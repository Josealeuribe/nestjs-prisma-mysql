import { Prisma } from '@prisma/client';

export const productoSelect = {
  id_producto: true,
  codigo_producto: true,
  nombre_producto: true,
  descripcion: true,
  codigo_barras: true,
  id_categoria_producto: true,
  id_iva: true,
  estado: true,
} satisfies Prisma.productoSelect;
