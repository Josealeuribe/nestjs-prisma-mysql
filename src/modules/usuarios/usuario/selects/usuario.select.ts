export const usuarioSelect = {
  id_usuario: true,
  nombre: true,
  apellido: true,
  id_tipo_doc: true,
  num_documento: true,
  email: true,
  id_rol: true,
  estado: true,
  telefono: true,
  fecha_nacimiento: true,
  img_url: true,
  id_genero: true,

  roles: {
    select: {
      id_rol: true,
      nombre_rol: true,
    },
  },

  tipo_documento: {
    select: {
      id_tipo_doc: true,
      nombre_doc: true,
    },
  },

  genero: {
    select: {
      id_genero: true,
      nombre_genero: true,
    },
  },

  bodegas_por_usuario: {
    select: {
      id_bodega: true,
      bodega: {
        select: {
          id_bodega: true,
          nombre_bodega: true,
        },
      },
    },
  },
} as const;
