import { IsInt, Min } from 'class-validator';

export class UpdateEstadoRemisionVentaDto {
  @IsInt()
  @Min(1)
  id_estado_remision_venta: number;
}