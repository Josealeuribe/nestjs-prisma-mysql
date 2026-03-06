import { IsInt, IsNumber, Min } from 'class-validator';

export class DetalleItemDto {
  @IsInt()
  @Min(1)
  id_producto: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  cantidad: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  precio_unitario: number;

  @IsInt()
  @Min(1)
  id_iva: number;
}
