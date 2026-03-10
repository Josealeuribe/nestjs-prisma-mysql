import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class CreateRolDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 50)
  nombre_rol: string;

  @IsString()
  @IsNotEmpty()
  @Length(10, 200)
  descripcion: string;

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
