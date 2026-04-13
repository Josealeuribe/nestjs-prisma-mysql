import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';

export class DashboardGraficasQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  id_bodega?: number;

  @IsOptional()
  @IsIn(['30d', '3m', '6m', '12m'])
  periodo?: '30d' | '3m' | '6m' | '12m' = '6m';

  @IsOptional()
  @IsIn(['dia', 'mes'])
  agrupacion?: 'dia' | 'mes' = 'mes';
}