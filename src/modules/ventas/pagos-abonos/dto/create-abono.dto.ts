import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsNumber, Min } from 'class-validator';

export class CreateAbonoDto {
  @IsDateString()
  fecha_pago: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  valor: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_metodo: number;
}