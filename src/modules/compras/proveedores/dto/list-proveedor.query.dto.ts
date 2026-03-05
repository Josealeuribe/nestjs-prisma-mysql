import { Transform } from 'class-transformer';
import {
  IsBooleanString,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class ListProveedorQueryDto {
  @IsOptional()
  @IsString()
  q?: string; // nombre_empresa / num_documento / email / telefono / contacto

  @IsOptional()
  @IsBooleanString()
  estado?: 'true' | 'false';

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  id_tipo_proveedor?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  id_tipo_doc?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  id_municipio?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  // include municipio + tipo_doc + tipo_proveedor
  @IsOptional()
  @IsBooleanString()
  includeRefs?: 'true' | 'false';
}
