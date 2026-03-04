import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProductoDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  codigo_producto?: string;

  @IsString()
  @IsNotEmpty()
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
  @Min(1)
  id_iva: number;

  @IsOptional()
  @IsBoolean()
  estado?: boolean;
}
