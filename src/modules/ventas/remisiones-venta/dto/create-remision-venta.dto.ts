import {
    ArrayMinSize,
    IsArray,
    IsDateString,
    IsInt,
    IsOptional,
    IsString,
    MaxLength,
    Min,
    ValidateNested,
  } from 'class-validator';
  import { Type } from 'class-transformer';
  import { DetalleRemisionVentaItemDto } from './detalle-remision-venta-item.dto';
  
  export class CreateRemisionVentaDto {
    @IsDateString()
    fecha_creacion: string;
  
    @IsOptional()
    @IsDateString()
    fecha_vencimiento?: string;
  
    @IsOptional()
    @IsString()
    @MaxLength(255)
    observaciones?: string;
  
    @IsInt()
    @Min(1)
    id_orden_venta: number;
  
    @IsInt()
    @Min(1)
    id_estado_remision_venta: number;
  
    @IsInt()
    @Min(1)
    id_usuario_creador: number;
  
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => DetalleRemisionVentaItemDto)
    detalle: DetalleRemisionVentaItemDto[];
  }