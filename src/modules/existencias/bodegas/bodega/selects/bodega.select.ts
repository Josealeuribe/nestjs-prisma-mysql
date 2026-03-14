import { Prisma } from '@prisma/client';

export const bodegaSelect = {
  id_bodega: true,
  nombre_bodega: true,
  direccion: true,
  id_municipio: true,
  estado: true,
  _count: {
    select: {
      bodegas_por_usuario: true,
    },
  },
} as const;
