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
import { DetalleTrasladoItemDto } from './detalle-traslado-item.dto';

export class CreateTrasladoDto {
  @IsInt()
  @Min(1)
  id_bodega_origen: number;

  @IsInt()
  @Min(1)
  id_bodega_destino: number;

  @IsOptional()
  @IsDateString()
  fecha_traslado?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  nota?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => DetalleTrasladoItemDto)
  detalle: DetalleTrasladoItemDto[];
}
