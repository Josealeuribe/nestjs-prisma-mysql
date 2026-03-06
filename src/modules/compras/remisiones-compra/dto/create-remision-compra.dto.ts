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
import { DetalleRemisionItemDto } from './detalle-remision-item.dto';

export class CreateRemisionCompraDto {
  @IsInt()
  @Min(1)
  id_compra: number;

  /**
   * Lo permito para reforzar consistencia con la compra.
   * El service valida que coincida con compras.id_proveedor
   */
  @IsInt()
  @Min(1)
  id_proveedor: number;

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
  @Type(() => DetalleRemisionItemDto)
  detalle: DetalleRemisionItemDto[];
}
