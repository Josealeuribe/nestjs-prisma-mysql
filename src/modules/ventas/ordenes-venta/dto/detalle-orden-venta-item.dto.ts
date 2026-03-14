import { IsInt, IsNumber, Min } from 'class-validator';

export class DetalleOrdenVentaItemDto {
  @IsInt()
  @Min(1)
  id_producto: number;

  @IsNumber()
  @Min(0.01)
  cantidad: number;

  @IsNumber()
  @Min(0)
  precio_unitario: number;
}