import { Prisma } from '@prisma/client';

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
} satisfies Prisma.usuarioSelect; // si falla, usa Prisma.UsuarioSelect
