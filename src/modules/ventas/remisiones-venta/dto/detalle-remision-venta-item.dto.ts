import {
    ArrayMinSize,
    IsArray,
    IsInt,
    Min,
    ValidateNested,
  } from 'class-validator';
  import { Type } from 'class-transformer';
  import { LoteRemisionItemDto } from './lote-remision-item.dto';
  
  export class DetalleRemisionVentaItemDto {
    @IsInt()
    @Min(1)
    id_producto: number;
  
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => LoteRemisionItemDto)
    lotes: LoteRemisionItemDto[];
  }