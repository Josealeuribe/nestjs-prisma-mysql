import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class DetalleRemisionItemDto {
  @IsInt()
  @Min(1)
  id_producto: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  cantidad: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  precio_unitario: number;

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
