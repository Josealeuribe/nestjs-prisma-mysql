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
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre_producto: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  descripcion?: string;

  @IsInt()
  @Min(1)
  id_categoria_producto: number;

  @IsInt()
  @Min(1)
  id_iva: number;

  @IsOptional()
  @IsBoolean()
  estado?: boolean;
}
