import { IsBoolean } from 'class-validator';

export class CambiarEstadoUsuarioDto {
  @IsBoolean()
  estado: boolean;
}
