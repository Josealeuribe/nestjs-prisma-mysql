import { Type } from 'class-transformer';
import { IsInt, IsNumber, Min } from 'class-validator';

export class DetalleTrasladoItemDto {
  @IsInt()
  @Min(1)
  id_existencia: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  cantidad: number;
}
