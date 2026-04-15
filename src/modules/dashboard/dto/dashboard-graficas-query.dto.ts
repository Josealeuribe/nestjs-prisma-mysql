import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsOptional, Min } from 'class-validator';

export class DashboardGraficasQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  id_bodega?: number;

  @IsOptional()
  @IsDateString()
  fecha_inicio?: string;

  @IsOptional()
  @IsDateString()
  fecha_fin?: string;

  @IsOptional()
  @IsIn(['dia', 'mes'])
  agrupacion?: 'dia' | 'mes';
}