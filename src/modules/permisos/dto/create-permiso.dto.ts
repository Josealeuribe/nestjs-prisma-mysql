import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreatePermisoDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 120)
  nombre_permiso: string;
}
