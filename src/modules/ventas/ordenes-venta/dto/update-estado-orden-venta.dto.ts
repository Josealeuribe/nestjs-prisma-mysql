import { IsInt, Min } from 'class-validator';

export class UpdateEstadoOrdenVentaDto {
  @IsInt()
  @Min(1)
  id_estado_orden_venta: number;
}