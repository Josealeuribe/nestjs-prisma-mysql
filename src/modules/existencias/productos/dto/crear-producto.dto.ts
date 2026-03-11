import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateProductoDto {
  @IsString()
  @MinLength(3)
  @MaxLength(150)
  nombre_producto: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  descripcion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  codigo_barras?: string;

  @IsInt()
  id_categoria_producto: number;

  @IsInt()
  id_iva: number;

  @IsOptional()
  @IsBoolean()
  estado?: boolean;
}
