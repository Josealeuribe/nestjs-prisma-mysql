import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  IsNumberString,
} from 'class-validator';

export class CreateDetalleRemisionCompraDto {
  @IsInt()
  @Min(1)
  id_producto: number;

  @IsNumberString()
  cantidad: string;

  @IsNumberString()
  precio_unitario: string;

  @IsInt()
  @Min(1)
  id_iva: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  lote?: string;

  @IsOptional()
  @IsDateString()
  fecha_vencimiento?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  cod_barras?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  nota?: string;
}
