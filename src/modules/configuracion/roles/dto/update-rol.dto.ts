import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class UpdateRolDto {
  @IsOptional()
  @IsString()
  @Length(3, 50)
  nombre_rol?: string;

  @IsOptional()
  @IsString()
  @Length(10, 200)
  descripcion?: string;

  @IsOptional()
  @IsBoolean()
  estado?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  ids_permisos?: number[];
}
