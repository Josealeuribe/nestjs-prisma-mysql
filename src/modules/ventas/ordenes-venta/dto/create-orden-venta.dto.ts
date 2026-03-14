import {
    ArrayMinSize,
    IsArray,
    IsDateString,
    IsInt,
    IsOptional,
    IsString,
    Min,
    ValidateNested,
  } from 'class-validator';
  import { Type } from 'class-transformer';
  import { DetalleOrdenVentaItemDto } from './detalle-orden-venta-item.dto';
  
  export class CreateOrdenVentaDto {
    @IsDateString()
    fecha_creacion: string;
  
    @IsOptional()
    @IsDateString()
    fecha_vencimiento?: string;
  
    @IsOptional()
    @IsString()
    descripcion?: string;
  
    @IsInt()
    @Min(1)
    id_cliente: number;
  
    @IsInt()
    @Min(1)
    id_bodega: number;
  
    @IsInt()
    @Min(1)
    id_estado_orden_venta: number;
  
    @IsInt()
    @Min(1)
    id_termino_pago: number;
  
    @IsInt()
    @Min(1)
    id_usuario: number;
  
    @IsOptional()
    @IsInt()
    @Min(1)
    id_cotizacion?: number;
  
    @IsOptional()
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => DetalleOrdenVentaItemDto)
    detalle?: DetalleOrdenVentaItemDto[];
  }