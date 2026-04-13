import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DashboardService } from './dashboard.service';
import { DashboardResumenQueryDto } from './dto/dashboard-resumen-query.dto';
import { DashboardGraficasQueryDto } from './dto/dashboard-graficas-query.dto';

interface DashboardAuthUser {
  id_usuario: number;
  email: string;
  id_rol: number;
  id_bodega_activa?: number | null;
  rol: string;
  permisos: string[];
}

@Controller('dashboard')
@UseGuards(AuthGuard('jwt'))
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('resumen')
  async getResumen(
    @Query() query: DashboardResumenQueryDto,
    @Req() req: { user: DashboardAuthUser },
  ) {
    return this.dashboardService.getResumen(query, req.user);
  }

  @Get('series')
  async getSeries(
    @Query() query: DashboardGraficasQueryDto,
    @Req() req: { user: DashboardAuthUser },
  ) {
    return this.dashboardService.getSeries(query, req.user);
  }

  @Get('ventas-por-categoria')
  async getVentasPorCategoria(
    @Query() query: DashboardGraficasQueryDto,
    @Req() req: { user: DashboardAuthUser },
  ) {
    return this.dashboardService.getVentasPorCategoria(query, req.user);
  }

  @Get('compras-por-proveedor')
  async getComprasPorProveedor(
    @Query() query: DashboardGraficasQueryDto,
    @Req() req: { user: DashboardAuthUser },
  ) {
    return this.dashboardService.getComprasPorProveedor(query, req.user);
  }
}