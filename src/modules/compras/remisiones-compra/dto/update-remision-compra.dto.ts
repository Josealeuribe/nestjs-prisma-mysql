import { PartialType } from '@nestjs/mapped-types';
import { IsInt, IsOptional, Min } from 'class-validator';
import { CreateRemisionCompraDto } from './create-remision-compra.dto';

export class UpdateRemisionCompraDto extends PartialType(
  CreateRemisionCompraDto,
) {
  @IsOptional()
  @IsInt()
  @Min(1)
  id_estado_remision_compra?: number;
}
