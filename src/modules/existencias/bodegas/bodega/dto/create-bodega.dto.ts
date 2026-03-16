import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateBodegaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre_bodega: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  direccion: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_municipio?: number;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  municipio?: string;

  @IsOptional()
  @IsBoolean()
  estado?: boolean;
}
