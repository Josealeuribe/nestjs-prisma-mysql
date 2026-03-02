export class UsuarioResponseDto {
  id_usuario: number;
  nombre: string;
  apellido: string;
  id_tipo_doc: number;
  num_documento: string;
  email: string;
  id_rol: number;
  estado: boolean;
  telefono?: string | null;
  fecha_nacimiento?: Date | null;
  img_url?: string | null;
  id_genero?: number | null;
}
