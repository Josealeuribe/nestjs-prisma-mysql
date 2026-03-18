import { Type } from 'class-transformer';
import { IsInt, IsNumber, Min } from 'class-validator';

export class DetalleItemDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_producto: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  cantidad: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  precio_unitario: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_iva: number;
}
