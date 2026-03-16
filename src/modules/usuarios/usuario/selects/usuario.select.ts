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

<<<<<<< HEAD
  roles: {
    select: {
      id_rol: true,
      nombre_rol: true,
    },
  },

=======
>>>>>>> 1d97f8d42da8fa688f1e06bedcb6a1393c7aff1a
  tipo_documento: {
    select: {
      id_tipo_doc: true,
      nombre_doc: true,
    },
  },

<<<<<<< HEAD
=======
  roles: {
    select: {
      id_rol: true,
      nombre_rol: true,
    },
  },

>>>>>>> 1d97f8d42da8fa688f1e06bedcb6a1393c7aff1a
  genero: {
    select: {
      id_genero: true,
      nombre_genero: true,
    },
  },

  bodegas_por_usuario: {
<<<<<<< HEAD
    select: {
      id_bodega: true,
=======
    where: {
      estado: true,
    },
    select: {
      id_bodega: true,
      estado: true,
>>>>>>> 1d97f8d42da8fa688f1e06bedcb6a1393c7aff1a
      bodega: {
        select: {
          id_bodega: true,
          nombre_bodega: true,
<<<<<<< HEAD
=======
          direccion: true,
          id_municipio: true,
          estado: true,
>>>>>>> 1d97f8d42da8fa688f1e06bedcb6a1393c7aff1a
        },
      },
    },
  },
<<<<<<< HEAD
} as const;
=======
} satisfies Prisma.usuarioSelect;
>>>>>>> 1d97f8d42da8fa688f1e06bedcb6a1393c7aff1a
