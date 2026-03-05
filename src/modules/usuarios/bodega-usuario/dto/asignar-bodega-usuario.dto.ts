import { IsInt, Min } from 'class-validator';

export class AsignarBodegaUsuarioDto {
  @IsInt()
  @Min(1)
  id_usuario: number;

  @IsInt()
  @Min(1)
  id_bodega: number;
}
