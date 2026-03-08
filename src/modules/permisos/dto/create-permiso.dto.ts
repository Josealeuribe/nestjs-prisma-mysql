import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreatePermisoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre_permiso: string;
}
