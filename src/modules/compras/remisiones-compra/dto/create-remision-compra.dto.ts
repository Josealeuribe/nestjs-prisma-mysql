import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
  IsDateString,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateDetalleRemisionCompraDto } from './detalle-remision-item.dto';

export class CreateRemisionCompraDto {
  @IsInt()
  @Min(1)
  id_compra: number;

  @IsInt()
  @Min(1)
  id_proveedor: number;

  @IsInt()
  @Min(1)
  id_bodega: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  id_factura?: number;

  @IsOptional()
  @IsDateString()
  fecha_vencimiento?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  observaciones?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateDetalleRemisionCompraDto)
  detalle_remision_compra: CreateDetalleRemisionCompraDto[];
}
