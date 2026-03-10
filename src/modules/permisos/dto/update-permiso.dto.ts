import { IsOptional, IsString, Length } from 'class-validator';

export class UpdatePermisoDto {
  @IsOptional()
  @IsString()
  @Length(3, 120)
  nombre_permiso?: string;
}
