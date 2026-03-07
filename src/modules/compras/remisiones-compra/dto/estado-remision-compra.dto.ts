import { IsInt, Min } from 'class-validator';

export class CambiarEstadoRemisionCompraDto {
  @IsInt()
  @Min(1)
  id_estado_remision_compra: number;
}
