export const bodegasPorUsuarioSelect = {
  id_usuario: true,
  id_bodega: true,
  usuario: {
    select: {
      id_usuario: true,
      nombre: true,
      apellido: true,
      email: true,
    },
  },
  bodega: {
    select: {
      id_bodega: true,
      nombre_bodega: true,
    },
  },
} as const;
