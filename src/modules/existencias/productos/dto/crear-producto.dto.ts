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
<<<<<<< HEAD
  @MinLength(3)
=======
  @IsNotEmpty()
>>>>>>> 1d97f8d42da8fa688f1e06bedcb6a1393c7aff1a
  @MaxLength(150)
  nombre_producto: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  descripcion?: string;

  @IsInt()
  id_categoria_producto: number;

  @IsInt()
  id_iva: number;

  @IsOptional()
  @IsBoolean()
  estado?: boolean;
}
