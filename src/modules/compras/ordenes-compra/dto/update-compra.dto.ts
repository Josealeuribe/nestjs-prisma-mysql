import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';
import { CreateCompraDto } from './create-compra.dto';

export class UpdateCompraDto extends PartialType(CreateCompraDto) {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_estado_compra?: number;
}
