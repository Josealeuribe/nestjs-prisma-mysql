import { PartialType } from '@nestjs/mapped-types';
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
import { CreateRemisionCompraDto } from './create-remision-compra.dto';
import { DetalleRemisionItemDto } from './detalle-remision-item.dto';

export class UpdateRemisionCompraDto extends PartialType(
  CreateRemisionCompraDto,
) {
  @IsOptional()
  @IsInt()
  @Min(1)
  id_estado_remision_compra?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  observaciones?: string;

  @IsOptional()
  @IsDateString()
  fecha_vencimiento?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => DetalleRemisionItemDto)
  detalle?: DetalleRemisionItemDto[];
}
