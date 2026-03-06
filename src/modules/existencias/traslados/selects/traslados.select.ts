import { Prisma } from '@prisma/client';

export const trasladoListSelect = Prisma.validator<Prisma.trasladoSelect>()({
  id_traslado: true,
  codigo_traslado: true,
  id_bodega_origen: true,
  id_bodega_destino: true,
  fecha_traslado: true,
  nota: true,
  id_estado_traslado: true,
  id_responsable: true,

  estado_traslado: {
    select: {
      id_estado_traslado: true,
      nombre_estado: true,
    },
  },

  bodega_traslado_id_bodega_origenTobodega: {
    select: {
      id_bodega: true,
      nombre_bodega: true,
    },
  },

  bodega_traslado_id_bodega_destinoTobodega: {
    select: {
      id_bodega: true,
      nombre_bodega: true,
    },
  },

  usuario: {
    select: {
      id_usuario: true,
      nombre: true,
      apellido: true,
      email: true,
    },
  },
});

export const trasladoDetailSelect =
  Prisma.validator<Prisma.trasladoSelect>()({
    ...trasladoListSelect,
    detalle_traslado: {
      select: {
        id_detalle: true,
        id_existencia: true,
        cantidad: true,
        existencias: {
          select: {
            id_existencia: true,
            id_producto: true,
            id_bodega: true,
            cantidad: true,
            lote: true,
            producto: {
              select: {
                id_producto: true,
                nombre_producto: true,
              },
            },
            bodega: {
              select: {
                id_bodega: true,
                nombre_bodega: true,
              },
            },
          },
        },
      },
    },
  });
