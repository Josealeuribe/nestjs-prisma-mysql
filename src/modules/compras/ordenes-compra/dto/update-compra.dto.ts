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

import { CreateCompraDto } from './create-compra.dto';
import { DetalleItemDto } from './detalle-item.dto';

export class UpdateCompraDto extends PartialType(CreateCompraDto) {
  /**
   * Permitir cambiar el estado (FK a estado_compra).
   * Recomendación: si vas a manejar reglas de transición, mejor crear un endpoint aparte:
   * PATCH /compras/:id/estado
   */
  @IsOptional()
  @IsInt()
  @Min(1)
  id_estado_compra?: number;

  @IsOptional()
  @IsInt()
  id_proveedor?: number;

  @IsOptional()
  @IsInt()
  id_termino_pago?: number;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsDateString()
  fecha_entrega?: string;

  /**
   * Si envías "detalle", se asume que vas a reemplazar todo el detalle de la compra.
   * Si NO quieres permitir editar detalle desde este PATCH, elimina este bloque.
   */
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => DetalleItemDto)
  detalle?: DetalleItemDto[];
}
