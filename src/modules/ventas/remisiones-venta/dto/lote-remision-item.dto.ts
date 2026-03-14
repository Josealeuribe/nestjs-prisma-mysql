import { IsInt, IsNumber, Min } from 'class-validator';

export class LoteRemisionItemDto {
  @IsInt()
  @Min(1)
  id_existencia: number;

  @IsNumber()
  @Min(0.01)
  cantidad: number;
}