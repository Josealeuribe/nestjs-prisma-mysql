import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { DetalleItemDto } from './detalle-item.dto';

export class CreateCompraDto {
  @IsInt()
  @Min(1)
  id_proveedor: number;

  @IsInt()
  @Min(1)
  id_termino_pago: number;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  descripcion?: string;

  // Si quieres fecha de entrega opcional
  @IsOptional()
  @IsDateString()
  fecha_entrega?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => DetalleItemDto)
  detalle: DetalleItemDto[];
}
