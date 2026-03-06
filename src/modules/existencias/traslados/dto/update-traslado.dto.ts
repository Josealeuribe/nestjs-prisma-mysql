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
import { CreateTrasladoDto } from './create-traslado.dto';
import { DetalleTrasladoItemDto } from './detalle-traslado-item.dto';

export class UpdateTrasladoDto extends PartialType(CreateTrasladoDto) {
  @IsOptional()
  @IsInt()
  @Min(1)
  id_estado_traslado?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  nota?: string;

  @IsOptional()
  @IsDateString()
  fecha_traslado?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => DetalleTrasladoItemDto)
  detalle?: DetalleTrasladoItemDto[];
}
